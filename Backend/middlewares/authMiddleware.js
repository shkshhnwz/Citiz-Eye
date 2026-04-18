const admin = require('../config/firebase');
const verifyToken = async(req,res,next) =>{
    const token = req.headers.authorization?.split('')[1];
    try{
        const decodeToken = await admin.auth().verifyIdToken(token);
        req.user = decodeToken;
        next();

    }catch(error){
        res.status(401).json({ message: "Invalid ID" });
    }
}