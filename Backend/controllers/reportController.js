const Report = require('../models/reports');
const { classifyCivicIssue } = require('../services/redisService');

exports.createReport = async (req, res, next) => {
    try {
        const { location, imageUrl, description } = req.body;
        const userId = req.user.uid;
        const newReport = new Report({
            userId,
            location,
            imageUrl,
            description,
            status: 'pending'
        });

        const savedReport = await newReport.save();
        res.status(201).json({
            success: true,
            message: "Report submitted successfully!",
            data: savedReport
        });
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ message: "Server Error: Could not save report" });
    }
}