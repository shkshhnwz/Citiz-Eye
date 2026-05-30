const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phonenumber: {
        type: Number,
        trim: true,
        match: [/^\+[1-9]\d{6,14}$/, 'Please fill a valid E.164 phone number']
    },
    password: {
        type: String,
        minlength: 8 // Enforce minimum length for security
    },
    role: { 
    type: String, 
    enum: ['citizen', 'admin'], 
    default: 'citizen' 
  }
});

module.exports = mongoose.model('User', userSchema);