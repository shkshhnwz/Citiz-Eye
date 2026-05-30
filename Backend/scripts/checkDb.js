require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('../models/reports');

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_LINK);
    console.log("Connected to MongoDB.");
    const reports = await Report.find().sort({ createdAt: -1 }).limit(10);
    console.log("Latest 10 reports in DB:");
    reports.forEach((r, idx) => {
      console.log(`[${idx}] ID: ${r._id}, status: ${r.status}, label: ${r.aiClassification?.label}, imageUrl: ${r.imageUrl}, image: ${r.image}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDb();
