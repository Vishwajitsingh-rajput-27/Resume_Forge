const User       = require("../models/User");
const bcrypt     = require("bcryptjs");
const crypto     = require("crypto");
const { signToken, resetTokenPair } = require("../utils/generateToken");
const sendEmail  = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error:"All fields required" });
    if (password.length < 6)          return res.status(400).json({ error:"Password min 6 characters" });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ error:"Email already registered" });

    const user  = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = signToken(user._id);
    res.status(201).json({ token, user:{ id:user._id, name:user.name, email:user.email, plan:user.plan } });
  } catch(e) { res.status(500).json({ error:"Registration failed", details:e.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error:"Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error:"Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();
    const token = signToken(user._id);
    res.json({ token, user:{ id:user._id, name:user.name, email:user.email, plan:user.plan, avatar:user.avatar } });
  } catch(e) { res.status(500).json({ error:"Login failed" }); }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error:"User not found" });
    res.json({ user });
  } catch(e) { res.status(500).json({ error:"Could not fetch user" }); }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Always 200 to prevent enumeration
    if (!user) return res.json({ message:"If this email exists, a reset link was sent." });

    const { raw, hashed, expires } = resetTokenPair();
    user.resetPasswordToken   = hashed;
    user.resetPasswordExpires = expires;
    await user.save();

    const url = `${process.env.CLIENT_URL}/reset-password/${raw}`;
    await sendEmail({
      to: user.email,
      subject: "ResumeForge — Reset Your Password",
      html: `<div style="font-family:Arial;max-width:480px;padding:28px;background:#070b18;color:#eef2ff;border-radius:14px;">
        <h2 style="color:#c9a84c;margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#94a3c8;margin-bottom:22px;">Click below to reset your password. Link expires in 30 minutes.</p>
        <a href="${url}" style="display:inline-block;padding:11px 26px;background:linear-gradient(135deg,#c9a84c,#f0d080);color:#070b18;font-weight:700;border-radius:10px;text-decoration:none;">Reset Password</a>
        <p style="color:#4a5578;font-size:.78rem;margin-top:20px;">If you didn't request this, ignore this email.</p>
      </div>`,
    });
    res.json({ message:"If this email exists, a reset link was sent." });
  } catch(e) { res.status(500).json({ error:"Email could not be sent" }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user   = await User.findOne({
      resetPasswordToken:   hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error:"Token is invalid or has expired" });
    user.password             = req.body.password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message:"Password reset successfully" });
  } catch(e) { res.status(500).json({ error:"Password reset failed" }); }
};
