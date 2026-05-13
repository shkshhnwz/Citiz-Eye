const User = require('../models/user');

const LoginUser = async (req,res,next)=>{
 const {firebaseUid,name,email} = req.user;
 try{
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
     
      user = new User({
        firebaseUid: uid,
        email,
        name,
        role: "citizen" 
      });
      await user.save();
    }
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }})
 }catch(err){
res.status(500).json({ message: "Server Error during login" });
 }
}

module.exports = { loginUser };