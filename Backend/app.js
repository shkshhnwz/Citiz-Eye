require('dotenv').config();
require('dotenv').config();


//Debug
console.log("--- ENV DEBUG START ---");
console.log("HF_TOKEN length:", process.env.HF_TOKEN ? process.env.HF_TOKEN.length : "NOT FOUND");
console.log("Current Directory:", __dirname);
console.log("--- ENV DEBUG END ---");


//dependencies
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');


const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Error', err));
(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis (WSL)");
    } catch (err) {
        console.error("Redis Connection Failed", err);
    }
})();


//Local routes
const reportRoutes = require('./routes/allRoutes');
app.use('/api/reports', reportRoutes);

//Server Establishment
mongoose.connect(process.env.MONGO_LINK)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log("MongoDB Connection Error:", err));

app.get('/', (req, res) => res.send("CitizEye Backend API is Live"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));