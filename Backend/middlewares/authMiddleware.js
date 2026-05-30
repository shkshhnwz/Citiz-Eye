const admin = require('../config/firebase');
const verifyToken = async (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];
    console.log("Header Received:", token);
    if(!token){
        return res.status(401).json({message: "No token, authorization is denied"});
    }
    try {
        const decodeToken = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: decodeToken.uid,
            firebaseUid : decodeToken.uid,
            email : decodeToken.email,
            name : decodeToken.name,
        }
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: "Invalid ID" });
    }
}

module.exports = verifyToken;