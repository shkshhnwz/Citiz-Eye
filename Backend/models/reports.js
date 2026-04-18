const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
        index: true
    },
    location:{
        latitude: {type: Number, required: true},
        longitude:{type: Number, required: true},
        address: {type: String}
    },
    imageUrl:{
        type: String,
        required: true
    },
    description:{
        type:String,
        required: true
    },
    aiClassification:{
        label:{
            type: String,
            default: "unclassified",
        },
        confidence:{type:Number,default:0}
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'resolved', 'rejected'],
        default: 'pending'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);