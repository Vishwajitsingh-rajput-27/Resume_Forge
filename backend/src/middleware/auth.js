const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });
  try {
    const { userId } = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.userId = userId;
    next();
  } catch (e) {
    const msg = e.name === "TokenExpiredError" ? "Session expired. Please log in again." : "Invalid token";
    res.status(401).json({ error: msg });
  }
};
