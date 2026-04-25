const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middlewares/authMiddleware'); // Our Bouncer
const upload = require('../middlewares/multerUpload');

router.post('/', verifyToken, upload.single('image'), reportController.createReport);

router.get('/', reportController.getAllreports);

router.get('/:id', reportController.getReportById);

module.exports = router;