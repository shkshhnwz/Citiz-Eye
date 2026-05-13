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
        required: true,
        unique: true,
        trim: true,
        match: [/^\+[1-9]\d{6,14}$/, 'Please fill a valid E.164 phone number']
    },
    password: {
        type: String,
        required: true,
        minlength: 8 // Enforce minimum length for security
    }
});

module.exports = mongoose.model('User', userSchema);