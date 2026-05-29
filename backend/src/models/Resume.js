const mongoose = require("mongoose");

const personalSchema = new mongoose.Schema({
  name:     { type: String, default: "" },
  title:    { type: String, default: "" },
  email:    { type: String, default: "" },
  phone:    { type: String, default: "" },
  location: { type: String, default: "" },
  website:  { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github:   { type: String, default: "" },
  summary:  { type: String, default: "" },
  avatar:   { type: String, default: null },
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  role:      { type: String, default: "" },
  company:   { type: String, default: "" },
  duration:  { type: String, default: "" },
  location:  { type: String, default: "" },
  desc:      { type: String, default: "" },
  isCurrent: { type: Boolean, default: false },
});

const educationSchema = new mongoose.Schema({
  degree:      { type: String, default: "" },
  institution: { type: String, default: "" },
  year:        { type: String, default: "" },
  gpa:         { type: String, default: "" },
  desc:        { type: String, default: "" },
});

const projectSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  tech: { type: String, default: "" },
  url:  { type: String, default: "" },
  desc: { type: String, default: "" },
});

const certSchema = new mongoose.Schema({
  name:   { type: String, default: "" },
  issuer: { type: String, default: "" },
  year:   { type: String, default: "" },
});

const achSchema = new mongoose.Schema({
  text: { type: String, default: "" },
});

const langSchema = new mongoose.Schema({
  lang:  { type: String, default: "" },
  level: { type: String, enum: ["Native","Fluent","Advanced","Intermediate","Basic"], default: "Intermediate" },
});

const atsHistSchema = new mongoose.Schema({
  score: { type: Number },
  date:  { type: Date, default: Date.now },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title:    { type: String, default: "Untitled Resume", maxlength: 100 },
  template: { type: String, enum: ["minimal","dark","creative","cyber"], default: "minimal" },
  isPublic: { type: Boolean, default: false },
  atsScore: { type: Number, default: 0, min: 0, max: 100 },
  atsScoreHistory: [atsHistSchema],
  data: {
    personal:       { type: personalSchema,     default: () => ({}) },
    experience:     { type: [experienceSchema],  default: [] },
    education:      { type: [educationSchema],   default: [] },
    skills:         { type: [String],            default: [] },
    projects:       { type: [projectSchema],     default: [] },
    certifications: { type: [certSchema],        default: [] },
    achievements:   { type: [achSchema],         default: [] },
    languages:      { type: [langSchema],        default: [] },
  },
  meta: {
    views:     { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
}, { timestamps: true });

resumeSchema.index({ userId: 1, updatedAt: -1 });

resumeSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  const User = mongoose.model("User");
  const user = await User.findById(this.userId);
  if (user?.plan === "Free") {
    const count = await mongoose.model("Resume").countDocuments({ userId: this.userId });
    if (count >= 3) return next(new Error("Free plan is limited to 3 resumes. Upgrade to Pro for unlimited."));
  }
  next();
});

module.exports = mongoose.model("Resume", resumeSchema);
