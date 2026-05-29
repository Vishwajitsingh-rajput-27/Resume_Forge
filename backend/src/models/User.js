const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 80 },
  email:    { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar:   { type: String, default: null },
  plan:     { type: String, enum: ["Free","Pro","Enterprise"], default: "Free" },
  aiUsage:  { type: Number, default: 0 },
  resetPasswordToken:   String,
  resetPasswordExpires: Date,
  lastLogin: Date,
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
