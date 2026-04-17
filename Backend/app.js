require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

// Redis Connection Logic
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Error', err));
(async () => { await redisClient.connect(); })();

// MongoDB Connection
mongoose.connect(process.env.MONGO_LINK)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log(err));

// Test Route
app.get('/', (req, res) => res.send("CitizEye Backend API is Live"));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));