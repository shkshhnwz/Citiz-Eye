const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/adminMiddleware');
const verifyToken = require('../middlewares/authMiddleware');
const reportController = require('../controllers/reportController');

router.get('/admin/all-complaints', verifyToken, isAdmin, reportController.getAllComplaintsForAdmin);
router.put('/admin/complaints/:id/status', verifyToken, isAdmin, reportController.updateReportStatus);

module.exports = router;