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
        console.error("Redis is not connected. Rate limiting cannot be verified. Blocking request for safety.");
        return false; // Fail closed: block request if rate limiting is not operational
    }
    try {
        const key = `limit:${userId}`;
        const count = await redisClient.incr(key);

        if (count === 1) {
            await redisClient.expire(key, 3600);
        }

        return count <= 5;
    } catch (err) {
        console.error("Error checking rate limit in Redis:", err);
        return false; // Fail closed on error
    }
}

const classifyCivicIssue = async (imageInput) => {
    try {
        let blobData;
        if (imageInput && imageInput.path) {
            // Read local file uploaded via multer
            const fs = require('fs');
            const buffer = fs.readFileSync(imageInput.path);
            blobData = new Blob([buffer]);
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

        // 2. Use the official library method
        const result = await hf.imageClassification({
            data: blobData,
            model: "apple/mobilevit-xx-small",
        });

        console.log("AI Result:", result[0]);

        return {
            label: result[0].label,
            score: result[0].score
        };

    } catch (error) {
        console.error("HF Library Error Details:", error);
        return { label: "unclassified", score: 0 };
    }
};
module.exports = { checkRateLimit, classifyCivicIssue };