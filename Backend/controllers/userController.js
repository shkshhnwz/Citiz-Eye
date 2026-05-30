const User = require('../models/user');

const loginUser = async (req, res, next) => {
  const { firebaseUid, email } = req.user;
  const name = req.body.name || req.user.name || "User";
  try {
    let user = await User.findOne({ firebaseUid });
    
    const systemAdminEmail = process.env.EMAIL_USER || "shahnawazshaikh67967@gmail.com";
    const adminEmails = [systemAdminEmail.toLowerCase(), "shahnawazsha1kh67967@gmail.com"];
    const isEmailAdmin = (email) => email && adminEmails.includes(email.toLowerCase());
    
    const isSystemAdmin = isEmailAdmin(email);
    const role = isSystemAdmin ? "admin" : "citizen";

    if (!user) {
      user = new User({
        firebaseUid,
        email,
        name,
        role
      });
      await user.save();
    } else if (isSystemAdmin && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    res.status(500).json({ message: "Server Error during login" });
  }
}

const getProfile = async (req, res, next) => {
  try {
    const firebaseUid = req.user.firebaseUid || req.user.uid;
    const email = req.user.email;
    let user = await User.findOne({ firebaseUid });
    
    const systemAdminEmail = process.env.EMAIL_USER || "shahnawazshaikh67967@gmail.com";
    const adminEmails = [systemAdminEmail.toLowerCase(), "shahnawazsha1kh67967@gmail.com"];
    const isEmailAdmin = (email) => email && adminEmails.includes(email.toLowerCase());
    
    const isSystemAdmin = (user && isEmailAdmin(user.email)) || (email && isEmailAdmin(email));

    if (user) {
      if (isSystemAdmin && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
      return res.status(200).json(user);
    }

    if (isSystemAdmin) {
      user = new User({
        firebaseUid,
        email: email || systemAdminEmail,
        name: req.user.name || "Admin",
        role: "admin"
      });
      await user.save();
      return res.status(200).json(user);
    }

    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    res.status(500).json({ message: "Server Error fetching profile" });
  }
}

module.exports = { loginUser, getProfile };