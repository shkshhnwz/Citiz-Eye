const Report = require('../models/reports');
const { classifyCivicIssue } = require('../services/redisService');

exports.createReport = async (req, res, next) => {
    try {
        let parsedLocation = req.body.location;
        if (typeof parsedLocation === 'string') {
            try { parsedLocation = JSON.parse(parsedLocation); } catch (e) {}
        }
        
        const description = req.body.description;
        const imageUrl = req.body.imageUrl;
        const userId = req.user.uid;

        // Give priority to physical file upload if it exists
        const targetImage = req.file ? req.file : imageUrl;
        const savedImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl;

        const aiService = await classifyCivicIssue(targetImage);
        const newReport = new Report({
            userId,
            location: parsedLocation,
            imageUrl: savedImageUrl,
            description,
            aiClassification:{
                label: aiService.label || "unclassified",
                confidence: aiService.score||0
            }
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