require('dotenv').config(); // Essential to read your HF_TOKEN
const { createClient } = require('redis');
const axios = require('axios');

const { HfInference } = require('@huggingface/inference');
// Initialize the client with your token safely
const hfToken = process.env.HF_TOKEN ? process.env.HF_TOKEN.trim() : '';
const hf = new HfInference(hfToken);

let redisClient;
if (process.env.REDIS_URL) {
    redisClient = createClient({
        url: process.env.REDIS_URL
    });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    // Connect to Redis immediately
    (async () => {
        try {
            await redisClient.connect();
            console.log("Connected to Redis in service");
        } catch (err) {
            console.error("Redis Connection Failed in service", err);
        }
    })();
} else {
    console.warn("REDIS_URL not configured. Redis rate-limiting is disabled.");
}



async function checkRateLimit(userId) {
    if (!redisClient || !redisClient.isOpen) {
        console.warn("Redis is not connected. Rate limiting cannot be verified. Allowing request (failing open).");
        return true; // Fail open: allow request if rate limiting is not operational
    }
    try {
        const key = `limit:${userId}`;
        const count = await redisClient.incr(key);

        if (count === 1) {
            await redisClient.expire(key, 3600);
        }

        return count <= 5;
    } catch (err) {
        console.error("Error checking rate limit in Redis (failing open):", err);
        return true; // Fail open on error
    }
}

const classifyCivicIssue = async (imageInput, description = "") => {
    try {
        let blobData;
        if (imageInput && imageInput.path) {
            // Read local file uploaded via multer
            const fs = require('fs');
            const buffer = fs.readFileSync(imageInput.path);
            blobData = new Blob([buffer],{
                type: imageInput.mimetype
            });
        } else if (typeof imageInput === 'string' && imageInput.trim() !== '') {
            // Fetch from URL
            const url = imageInput.trim();
            const imageResponse = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image data: ${imageResponse.statusText}`);
            }
            blobData = await imageResponse.blob();
        } else {
            throw new Error("No image data provided for AI classification.");
        }

        // 2. Use the official library method with a timeout
        const classificationPromise = hf.imageClassification({
            data: blobData,
            model: "apple/mobilevit-xx-small",
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Hugging Face API request timed out")), 20000)
        );

        const result = await Promise.race([classificationPromise, timeoutPromise]);

        console.log("AI Result:", result[0]);

        return {
            label:mapLabelToCivicIssue(result[0].label, description),
            score: result[0].score
        };

    } catch (error) {
        console.error("HF Library Error Details:", error);
        return { label: "unclassified", score: 0 };
    }
};
const mapLabelToCivicIssue = (rawLabel, description = "") => {
    // 1. Check description text keywords first
    if (description) {
        const desc = description.toLowerCase();
        if (desc.includes("garbage") || desc.includes("trash") || desc.includes("waste") || desc.includes("rubbish") || desc.includes("dump") || desc.includes("litter")) {
            return "garbage";
        }
        if (desc.includes("water log") || desc.includes("waterlog") || desc.includes("flood") || desc.includes("puddle") || desc.includes("rain")) {
            return "waterlogging";
        }
        if (desc.includes("pothole") || desc.includes("road damage") || desc.includes("bad road") || desc.includes("crack")) {
            return "pothhole";
        }
        if (desc.includes("streetlight") || desc.includes("street light") || desc.includes("lamp") || desc.includes("no light")) {
            return "streetlight";
        }
        if (desc.includes("traffic") || desc.includes("jam") || desc.includes("roadblock") || desc.includes("congestion")) {
            return "traffic";
        }
    }

    // 2. Fall back to image classification labels if description didn't match
    if (!rawLabel) return "other";
    
    const label = rawLabel.toLowerCase();
    
    // Keywords for waterlogging
    const waterKeywords = [
        "water", "puddle", "lake", "pond", "river", "sea", "ocean", 
        "dock", "seashore", "lakeside", "lakeshore", "flood", "rain", 
        "canal", "channel", "swimming pool", "dam", "dike", "dyke", 
        "sewer", "amphibian", "amphibious"
    ];
    
    // Keywords for garbage
    const garbageKeywords = [
        "garbage", "trash", "waste", "rubbish", "ashcan", "dustbin", 
        "landfill", "pile", "scrap", "crate", "carton", "junk", 
        "plastic bag", "street cleaner", "bucket", "can", "tin", "packet", "bag"
    ];
    
    // Keywords for pothhole
    const roadKeywords = [
        "pothole", "crack", "hole", "asphalt", "pavement", "dirt road", 
        "unpaved", "gravel", "mud", "soil", "earth", "stone", "rock", 
        "cliff", "sand"
    ];
    
    // Keywords for streetlight
    const lightKeywords = [
        "streetlight", "street lamp", "lantern", "light", "lamp", "torch", "pole"
    ];
    
    // Keywords for traffic
    const trafficKeywords = [
        "traffic", "car", "truck", "bus", "vehicle", "motorcycle", "bike", 
        "cab", "limo", "highway", "intersection", "congestion", "roadblock", 
        "barrier"
    ];

    if (waterKeywords.some(keyword => label.includes(keyword))) {
        return "waterlogging";
    }
    if (garbageKeywords.some(keyword => label.includes(keyword))) {
        return "garbage";
    }
    if (roadKeywords.some(keyword => label.includes(keyword))) {
        return "pothhole";
    }
    if (lightKeywords.some(keyword => label.includes(keyword))) {
        return "streetlight";
    }
    if (trafficKeywords.some(keyword => label.includes(keyword))) {
        return "traffic";
    }
    
    return "other";
};


module.exports = { checkRateLimit, classifyCivicIssue };