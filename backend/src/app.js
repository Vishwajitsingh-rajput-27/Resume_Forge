const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");

const authRoutes   = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const aiRoutes     = require("./routes/ai");
const userRoutes   = require("./routes/user");

const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));

// ── Rate Limiting ─────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300,
  message: { error: "Too many requests. Try again in 15 minutes." } }));

// ── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── MongoDB ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB:", err.message));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",   authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai",     aiRoutes);
app.use("/api/user",   userRoutes);
app.get("/api/health", (_, res) => res.json({ status:"ok", ts: new Date().toISOString() }));

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
