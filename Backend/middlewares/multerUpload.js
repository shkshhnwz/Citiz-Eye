const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filenames to prevent overlap
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileType = /jpeg|jpg|png/;
    const extname = allowedFileType.test(path.extname(file.originalname).toLowerCase());
    const mimetypeCheck = allowedFileType.test(file.mimetype);
    if (extname && mimetypeCheck) {
        return cb(null, true);
    } else {
        cb(new Error("only jpeg,png,jpg files are allowed to upload"), false);
    }
}

// Create Multer instance
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 10MB physical limit
    fileFilter: fileFilter
});

module.exports = upload;
