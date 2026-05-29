const jwt    = require("jsonwebtoken");
const crypto = require("crypto");

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const resetTokenPair = () => {
  const raw    = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  const expires= new Date(Date.now() + 30 * 60 * 1000);
  return { raw, hashed, expires };
};

module.exports = { signToken, resetTokenPair };
