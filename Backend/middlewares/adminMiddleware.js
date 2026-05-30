const User = require('../models/user');

const isAdmin = async (req, res, next) => {
    try {
        const firebaseUid = req.user.firebaseUid || req.user.uid;
        const user = await User.findOne({ firebaseUid });
        
        const systemAdminEmail = process.env.EMAIL_USER || "shahnawazshaikh67967@gmail.com";
        const adminEmails = [systemAdminEmail.toLowerCase(), "shahnawazsha1kh67967@gmail.com"];
        const isEmailAdmin = (email) => email && adminEmails.includes(email.toLowerCase());
        
        const isSystemAdmin = (user && isEmailAdmin(user.email)) || (req.user.email && isEmailAdmin(req.user.email));

        if (isSystemAdmin || (user && user.role === 'admin')) {
            if (user && user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
            }
            next();
        } else {
            res.status(403).json({ message: "Access Denied. Admins only" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = isAdmin;