const Report = require('../models/reports');
const path = require('path');
const { classifyCivicIssue } = require('../services/redisService');
const { sendEmail } = require('../services/emailService');

exports.createReport = async (req, res, next) => {

    try {
        let parsedLocation = req.body.location;
        if (typeof parsedLocation === 'string') {
            try { parsedLocation = JSON.parse(parsedLocation); } catch (e) { }
        }

        const description = req.body.description;
        const imageUrl = req.body.imageUrl;
        const userId = req.user.uid;

        if (!req.file && !imageUrl) {
            return res.status(400).json({
                success: false,
                message: "You must provide either an image file or an image URL!"
            });
        }


        const targetImage = req.file ? req.file : imageUrl;
        const savedImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl;

        const aiService = await classifyCivicIssue(targetImage);
        const newReport = new Report({
            userId,
            location: parsedLocation,
            imageUrl: savedImageUrl,
            description,
            aiClassification: {
                label: aiService.label || "unclassified",
                confidence: aiService.score || 0
            }
        });

        const savedReport = await newReport.save();
        const reportData = {
            label: aiService.label || "unclassified",
            description: description,
            address: parsedLocation.address,
            imagePath: savedImageUrl
        }
        const localFilePath = req.file ? path.join(__dirname, '..', 'uploads', req.file.filename) : imageUrl;
        await sendEmail(reportData, localFilePath);
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

exports.getAllreports = async (req, res, next) => {
    try {
        const reports = await Report.find({
            "aiClassification.label": { $exists: true, $ne: "unclassified" }
        }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Server Error: Could not fetch reports" });
    }
}

exports.getReportById = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ message: "Server Error: Could not fetch report" });
    }
}

exports.getMyReports = async (req, res, next) => {
    try {
        const userId = req.user.firebaseUid || req.user.uid;
        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching my reports:", error);
        res.status(500).json({ message: "Server Error: Could not fetch your reports" });
    }
}

exports.getAllComplaintsForAdmin = async (req, res, next) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        res.status(500).json({ message: "Server Error: Could not fetch reports" });
    }
}

exports.updateReportStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'verified', 'ongoing', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        res.status(200).json({
            success: true,
            message: "Report status updated successfully",
            data: report
        });
    } catch (error) {
        console.error("Error updating report status:", error);
        res.status(500).json({ message: "Server Error: Could not update report status" });
    }
}