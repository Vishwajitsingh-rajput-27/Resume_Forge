const User       = require("../models/User");
const Resume     = require("../models/Resume");
const bcrypt     = require("bcryptjs");
const cloudinary = require("../utils/cloudinary");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch(e) { res.status(500).json({ error: "Could not fetch profile" }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error:"User not found" });
    if (email && email !== user.email) {
      const taken = await User.findOne({ email:email.toLowerCase(), _id:{ $ne:req.userId } });
      if (taken) return res.status(409).json({ error:"Email already in use" });
      user.email = email.toLowerCase().trim();
    }
    if (name) user.name = name.trim();
    await user.save();
    res.json({ user:{ id:user._id, name:user.name, email:user.email, avatar:user.avatar, plan:user.plan } });
  } catch(e) { res.status(500).json({ error:"Update failed" }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error:"Both passwords required" });
    if (newPassword.length < 6) return res.status(400).json({ error:"New password min 6 chars" });
    const user = await User.findById(req.userId).select("+password");
    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ error:"Current password incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message:"Password changed" });
  } catch(e) { res.status(500).json({ error:"Password change failed" }); }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error:"No image uploaded" });
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder:"resumeforge/avatars", public_id:`user_${req.userId}`, overwrite:true,
          transformation:[{ width:200, height:200, crop:"fill", gravity:"face" }] },
        (e, r) => e ? reject(e) : resolve(r)
      )(req.file.buffer);
    });
    await User.findByIdAndUpdate(req.userId, { avatar:result.secure_url });
    res.json({ avatar:result.secure_url });
  } catch(e) { res.status(500).json({ error:"Avatar upload failed" }); }
};

exports.getStats = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId:req.userId }).select("atsScore template updatedAt meta");
    const total   = resumes.length;
    const avg     = total ? Math.round(resumes.reduce((s,r)=>s+(r.atsScore||0),0)/total) : 0;
    const best    = total ? Math.max(...resumes.map(r=>r.atsScore||0)) : 0;
    const downloads = resumes.reduce((s,r)=>s+(r.meta?.downloads||0),0);
    res.json({ stats:{ total, avg, best, downloads } });
  } catch(e) { res.status(500).json({ error:"Stats fetch failed" }); }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId).select("+password");
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error:"Incorrect password" });
    await Resume.deleteMany({ userId:req.userId });
    try { await cloudinary.uploader.destroy(`resumeforge/avatars/user_${req.userId}`); } catch {}
    await User.findByIdAndDelete(req.userId);
    res.json({ message:"Account deleted" });
  } catch(e) { res.status(500).json({ error:"Delete failed" }); }
};
