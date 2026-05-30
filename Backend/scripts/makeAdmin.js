require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

const makeAdmin = async () => {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error("Please provide a Firebase UID or an email address.");
    console.log("Usage: node scripts/makeAdmin.js <email_or_uid>");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_LINK);
    console.log("Connected to MongoDB Atlas.");

    const query = identifier.includes('@') ? { email: identifier } : { firebaseUid: identifier };
    const user = await User.findOne(query);

    if (!user) {
      console.error(`User not found for identifier: ${identifier}`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`Successfully promoted user "${user.name}" (${user.email}) to "admin".`);
    process.exit(0);
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    process.exit(1);
  }
};

makeAdmin();
