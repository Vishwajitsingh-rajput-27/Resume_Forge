const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chat = async (prompt, maxTokens = 600) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text() || "";
};

exports.summary = async (req, res) => {
  try {
    const { name, role, skills, experience } = req.body;
    const text = await chat(
      `Write a 3-sentence professional resume summary for ${name || "a candidate"}, \
who is a ${role || "professional"}. Skills: ${skills?.join(", ") || "various"}. \
Experience level: ${experience || "mid-level"}. \
ATS-optimized, first-person, results-driven. Return only the summary text, no labels.`
    );
    res.json({ summary: text });
  } catch (e) {
    console.error("AI summary error:", e.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};

exports.skills = async (req, res) => {
  try {
    const { role, currentSkills } = req.body;
    const text = await chat(
      `List 10 top 2025 in-demand skills for a ${role || "Software Engineer"}. \
Exclude: ${currentSkills?.join(", ") || "none"}. \
Return ONLY a JSON array of strings like: ["React","Python","AWS"]. No explanation.`,
      300
    );
    let skills = [];
    try {
      const m = text.trim().match(/\[.*\]/s);
      skills = JSON.parse(m ? m[0] : text);
    } catch {
      skills = text.split(",").map((s) => s.replace(/['"\[\]\s]/g, "")).filter(Boolean);
    }
    res.json({ skills: skills.slice(0, 10) });
  } catch (e) {
    console.error("AI skills error:", e.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};

exports.improve = async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });
    const improved = await chat(
      `Improve this resume bullet point for maximum ATS impact, quantifiable results, and action verbs.\
Context: ${context || "work experience"}\
Original: "${text}"\
Return ONLY the improved text, no explanation or quotes.`
    );
    res.json({ improved: improved.trim() });
  } catch (e) {
    console.error("AI improve error:", e.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};

exports.atsTips = async (req, res) => {
  try {
    const { role, skills, score } = req.body;
    const text = await chat(
      `Give 5 specific ATS resume improvement tips for a ${role || "job seeker"}. \
Skills: ${skills?.join(", ") || "general"}. Current score: ${score || "unknown"}%. \
Return ONLY a JSON array: [{"tip":"…","priority":"high|medium|low","section":"…"}]`
    );
    let tips = [];
    try {
      const m = text.trim().match(/\[.*\]/s);
      tips = JSON.parse(m ? m[0] : text);
    } catch {
      tips = [{ tip: text, priority: "high", section: "General" }];
    }
    res.json({ tips });
  } catch (e) {
    console.error("AI ats-tips error:", e.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};

exports.projectDesc = async (req, res) => {
  try {
    const { name, tech, type } = req.body;
    const text = await chat(
      `Write a 2-3 sentence professional resume project description. \
Project: ${name}. Tech: ${tech || "various"}. Type: ${type || "web app"}. \
Focus on scale, impact, and technical achievement. No bullet points.`
    );
    res.json({ description: text.trim() });
  } catch (e) {
    console.error("AI project-desc error:", e.message);
    res.status(500).json({ error: "AI unavailable" });
  }
};
