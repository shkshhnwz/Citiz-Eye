const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerUpload');
router.post('/', verifyToken, upload.single('image'), reportController.createReport);

router.get('/', reportController.getAllreports);

router.get('/my-reports', verifyToken, reportController.getMyReports);

router.get('/:id', reportController.getReportById);

module.exports = router;
