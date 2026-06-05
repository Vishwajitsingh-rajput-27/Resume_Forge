// ─── AI Provider Configuration ────────────────────────────────────────────────
// Switch providers by setting AI_PROVIDER in your .env:
//   AI_PROVIDER=GROQ          ← fastest, most generous free tier (recommended)
//   AI_PROVIDER=GEMINI        ← Google Gemini, great quality, free via AI Studio
//   AI_PROVIDER=GROQ_FALLBACK ← tries Groq first, falls back to Gemini on error

export type AIProvider = 'GROQ' | 'GEMINI' | 'GROQ_FALLBACK';

export interface AIConfig {
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

// ─── Free Model Catalogues ────────────────────────────────────────────────────

export const AI_MODELS = {
  GROQ: {
    // All free with generous RPM limits on https://console.groq.com
    default: 'llama-3.1-8b-instant',   // fastest
    quality: 'llama-3.3-70b-versatile', // best quality
    available: [
      'llama-3.1-8b-instant',    // 30K TPM free – great for bullet points / quick tasks
      'llama-3.3-70b-versatile', // 6K TPM free  – best quality for cover letters
      'llama3-8b-8192',          // legacy alias still works
      'llama3-70b-8192',         // legacy alias still works
      'mixtral-8x7b-32768',      // 5K TPM free  – large context window
      'gemma2-9b-it',            // Google Gemma via Groq
      'gemma-7b-it',             // smaller Gemma
    ],
  },
  GEMINI: {
    // Free via https://aistudio.google.com — no credit card required
    default: 'gemini-1.5-flash',       // 15 RPM / 1M TPD free
    quality: 'gemini-1.5-pro',         // 2 RPM / 50 requests/day free
    available: [
      'gemini-1.5-flash',        // best free option: fast + capable
      'gemini-1.5-flash-8b',     // ultra-fast, lighter tasks
      'gemini-1.5-pro',          // most capable (daily limit on free)
      'gemini-2.0-flash',        // newest Flash (check availability)
    ],
  },
};

// ─── Build Config from ENV ────────────────────────────────────────────────────

const buildGroqConfig = (): AIConfig => ({
  provider: 'GROQ',
  baseUrl: 'https://api.groq.com/openai/v1',           // OpenAI-compatible ✓
  apiKey: process.env.GROQ_API_KEY || '',
  model: process.env.GROQ_MODEL || AI_MODELS.GROQ.default,
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 20000,
});

const buildGeminiConfig = (): AIConfig => ({
  provider: 'GEMINI',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || AI_MODELS.GEMINI.default,
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 30000,
});

export const getAIConfig = (): AIConfig => {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'GROQ';

  const map: Record<AIProvider, AIConfig> = {
    GROQ:          buildGroqConfig(),
    GEMINI:        buildGeminiConfig(),
    GROQ_FALLBACK: buildGroqConfig(), // same config; fallback handled in the service layer
  };

  return map[provider] ?? buildGroqConfig();
};

export const aiConfig = getAIConfig();

// ─── Prompt Library ───────────────────────────────────────────────────────────

export const RESUME_PROMPTS = {

  IMPROVE_SUMMARY: (summary: string, role: string) =>
    `You are an expert ATS resume writer. Rewrite the professional summary below for a ${role} role.
Rules:
- ATS-friendly (include industry keywords)
- Achievement-oriented, confident tone
- 2–4 sentences, NO first-person "I"
- Return ONLY the rewritten summary, nothing else.

Original: ${summary}`,

  IMPROVE_EXPERIENCE: (responsibility: string, role: string) =>
    `You are a senior resume coach. Transform this weak responsibility into a single strong, ATS-optimised bullet point for a ${role}.
Rules:
- Start with a past-tense action verb (e.g. Engineered, Reduced, Launched)
- Add a quantifiable result where plausible (%, $, time saved, scale)
- ≤ 25 words
- Return ONLY the bullet point, no quotes, no hyphen prefix.

Input: ${responsibility}`,

  GENERATE_SKILLS: (domain: string) =>
    `You are a technical recruiter. List the 15 most in-demand skills for a ${domain} professional in 2024.
Return ONLY a valid JSON array of strings, e.g.: ["React","Node.js","SQL"]
No markdown, no explanations.`,

  IMPROVE_PROJECT: (description: string, tech: string) =>
    `Rewrite this project description for a resume. Tech used: ${tech}.
Rules: ATS-friendly, show impact, ≤ 45 words, past tense.
Return ONLY the improved text.

Original: ${description}`,

  GENERATE_COVER_LETTER: (p: {
    name: string;
    role: string;
    company: string;
    skills: string[];
    experienceSummary: string;
    jobDescription: string;
  }) =>
    `Write a professional ATS-optimised cover letter.
Candidate: ${p.name}
Position: ${p.role} at ${p.company}
Key skills: ${p.skills.slice(0, 8).join(', ')}
Background: ${p.experienceSummary}
Job description (excerpt): ${p.jobDescription.slice(0, 600)}

Structure: Opening hook → Why I'm a fit (2–3 specific skill matches) → Closing CTA
Tone: Confident, concise, human
Word count: 220–280

Return ONLY the letter body (no "Dear Hiring Manager" salutation needed—caller adds it).`,

  GENERATE_INTERVIEW_QUESTIONS: (role: string, skills: string[], level: string) =>
    `Generate interview questions for a ${level}-level ${role}.
Relevant skills: ${skills.slice(0, 10).join(', ')}

Output a JSON array with exactly 13 objects:
- 5 technical  (difficulty: "easy"|"medium"|"hard")
- 3 behavioural (STAR format hints in sampleAnswer)
- 3 situational
- 2 role-specific

Schema per object:
{"type":"technical|behavioural|situational|role-specific","question":"...","difficulty":"easy|medium|hard","sampleAnswer":"2-sentence guide answer"}

Return ONLY valid JSON, no markdown fences.`,

  MATCH_JOB: (resumeText: string, jobDescription: string) =>
    `You are an ATS system. Compare this resume to the job description and return a JSON object:
{
  "matchScore": <0–100>,
  "matchedSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "keywordGaps": ["keyword"],
  "suggestions": ["actionable tip 1", "actionable tip 2"]
}

Resume:
${resumeText.slice(0, 2000)}

Job Description:
${jobDescription.slice(0, 1500)}

Return ONLY valid JSON.`,
};
