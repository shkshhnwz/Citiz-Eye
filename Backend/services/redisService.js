require('dotenv').config(); // Essential to read your HF_TOKEN
const { createClient } = require('redis');
const axios = require('axios');

// Initialize Redis Client ONCE (Outside the function)
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis immediately
(async () => {
    await redisClient.connect();
    console.log("Connected to Redis in WSL");
})();

const HF_MODEL_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224";

/**
 * Optimized Rate Limiter
 */
async function checkRateLimit(userId) {
    const key = `limit:${userId}`;
    const count = await redisClient.incr(key);
    
    if (count === 1) {
        await redisClient.expire(key, 3600); 
    }
    
    return count <= 5; 
}

const classifyCivicIssue = async (imageBuffer) => {
    try {
        const response = await axios.post(HF_MODEL_URL, imageBuffer, {
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/octet-stream",
            },
        });

        return response.data;
    } catch (error) {
        if (error.response?.status === 503) {
            return { error: "AI Model is loading, please try again." };
        }
        throw new Error("AI Processing Failed");
    }
};

module.exports = { checkRateLimit, classifyCivicIssue };