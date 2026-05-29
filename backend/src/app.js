const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes   = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const aiRoutes     = require("./routes/ai");
const userRoutes   = require("./routes/user");

const app = express();

app.use(cors({
  origin: "*",
  credentials: false,
  methods: ["GET","POST","PUT","DELETE","OPTIONS","PATCH"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
}));
app.options("*", cors());

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

app.use(rateLimit({ windowMs: 15*60*1000, max: 300,
  message: { error: "Too many requests." } }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB:", err.message));

app.use("/api/auth",   authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai",     aiRoutes);
app.use("/api/user",   userRoutes);
app.get("/api/health", (_, res) => res.json({ status: "ok", ts: new Date().toISOString() }));
app.get("/",           (_, res) => res.json({ message: "ResumeForge API is running" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
