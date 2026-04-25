require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const DeptChecker = (label) => {
    if (label === "pothhole") {
        return process.env.EMAIL_ROAD_DEPT;
    }
    if (label === "waterlogging") {
        return process.env.EMAIL_WATER_DEPT;
    }
    if (label === "garbage") {
        return process.env.EMAIL_CLEAN_DEPT;
    }
    if (label === "streetlight") {
        return process.env.EMAIL_GENERAL_DEPT;
    }
    if (label === "traffic") {
        return process.env.EMAIL_GENERAL_DEPT;
    }
    if (label === "other") {
        return process.env.EMAIL_GENERAL_DEPT;
    }

    return process.env.EMAIL_GENERAL_DEPT
}

const sendEmail = async (reportData, imagePath) => {
    const { label, description, address } = reportData;
    const targetedmail = DeptChecker(label);

    const mailOptions = {
        from: `"CitizEye Reporter" <${process.env.EMAIL_USER}>`,
        to: targetedmail,
        subject: `[CITIZ-EYE] ${label.toUpperCase()} Reported at ${address}`,
        text: `Automated Civic Report:\n\n` +
            `Type: ${label}\n` +
            `Address: ${address}\n` +
            `Description: ${description}\n\n` +
            `Please see the attached evidence for action.`,
        attachments: [{ filename: 'issue-evidence.jpg', path: imagePath }]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", targetedmail);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = { sendEmail };