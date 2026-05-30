require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('../models/reports');

const cleanDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_LINK);
    console.log("Connected to MongoDB.");
    const result = await Report.deleteMany({
      $or: [
        { "aiClassification.label": "unclassified" },
        { "aiClassification.label": { $exists: false } }
      ]
    });
    console.log(`Successfully deleted ${result.deletedCount} unclassified reports.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanDb();
