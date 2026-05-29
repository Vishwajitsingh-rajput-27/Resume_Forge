const Resume = require("../models/Resume");

exports.getAll = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId:req.userId }).sort({ updatedAt:-1 }).select("-__v");
    res.json({ resumes });
  } catch(e) { res.status(500).json({ error:"Failed to fetch resumes" }); }
};

exports.getOne = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id:req.params.id, userId:req.userId });
    if (!resume) return res.status(404).json({ error:"Resume not found" });
    res.json({ resume });
  } catch(e) { res.status(500).json({ error:"Failed to fetch resume" }); }
};

exports.create = async (req, res) => {
  try {
    const { title, template, data } = req.body;
    const resume = await Resume.create({ userId:req.userId, title:title||"Untitled Resume", template:template||"minimal", data:data||{} });
    res.status(201).json({ message:"Resume created", resume });
  } catch(e) { res.status(500).json({ error: e.message || "Failed to create resume" }); }
};

exports.update = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id:req.params.id, userId:req.userId },
      { ...req.body, updatedAt:new Date() },
      { new:true, runValidators:true }
    );
    if (!resume) return res.status(404).json({ error:"Resume not found" });
    res.json({ message:"Resume updated", resume });
  } catch(e) { res.status(500).json({ error:"Failed to update resume" }); }
};

exports.remove = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id:req.params.id, userId:req.userId });
    if (!resume) return res.status(404).json({ error:"Resume not found" });
    res.json({ message:"Resume deleted" });
  } catch(e) { res.status(500).json({ error:"Failed to delete resume" }); }
};

exports.duplicate = async (req, res) => {
  try {
    const orig = await Resume.findOne({ _id:req.params.id, userId:req.userId });
    if (!orig) return res.status(404).json({ error:"Resume not found" });
    const copy = await Resume.create({
      userId:orig.userId, title:`${orig.title} (Copy)`,
      template:orig.template, data:orig.data,
    });
    res.status(201).json({ message:"Duplicated", resume:copy });
  } catch(e) { res.status(500).json({ error:"Duplicate failed" }); }
};

exports.saveATS = async (req, res) => {
  try {
    const { score } = req.body;
    const resume = await Resume.findOneAndUpdate(
      { _id:req.params.id, userId:req.userId },
      { atsScore:score, $push:{ atsScoreHistory:{ score, date:new Date() } } },
      { new:true }
    );
    res.json({ atsScore: resume?.atsScore });
  } catch(e) { res.status(500).json({ error:"ATS save failed" }); }
};
