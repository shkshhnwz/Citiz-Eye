require('dotenv').config();

//dependencies
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//redis rate limiting
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
const userRoutes = require('./routes/userRoutes');   // Add this for login/profiles
const adminRoutes = require('./routes/adminRoutes'); // Add admin routes
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api', adminRoutes);

//Server Establishment
mongoose.connect(process.env.MONGO_LINK)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log("MongoDB Connection Error:", err));

app.get('/', (req, res) => res.send("CitizEye Backend API is Live"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));