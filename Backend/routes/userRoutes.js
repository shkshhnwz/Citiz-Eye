const express = require('express');
const router = express.Router();
const { loginUser, getProfile } = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/login', verifyToken, loginUser);
router.get('/profile', verifyToken, getProfile);

module.exports = router;