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

// Provider model IDs change over time. Environment variables always take
// precedence, while these defaults track stable, generally available models.
export const AI_MODELS = {
  GROQ: {
    default: 'openai/gpt-oss-20b',
    quality: 'openai/gpt-oss-120b',
    available: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'qwen/qwen3.6-27b',
    ],
  },
  GEMINI: {
    default: 'gemini-2.5-flash',
    quality: 'gemini-2.5-pro',
    available: [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
    ],
  },
} as const;

const buildGroqConfig = (): AIConfig => ({
  provider: 'GROQ',
  baseUrl: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
  model: process.env.GROQ_MODEL || AI_MODELS.GROQ.default,
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 20_000,
});

const buildGeminiConfig = (): AIConfig => ({
  provider: 'GEMINI',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || AI_MODELS.GEMINI.default,
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 30_000,
});

export const getAIConfig = (): AIConfig => {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'GROQ';
  const map: Record<AIProvider, AIConfig> = {
    GROQ: buildGroqConfig(),
    GEMINI: buildGeminiConfig(),
    GROQ_FALLBACK: buildGroqConfig(),
  };
  return map[provider] ?? buildGroqConfig();
};

export const aiConfig = getAIConfig();

export const RESUME_PROMPTS = {
  IMPROVE_SUMMARY: (summary: string, role: string) =>
    `You are an expert ATS resume writer. Rewrite the professional summary below for a ${role} role.
Rules:
- ATS-friendly (include relevant industry keywords)
- Achievement-oriented, confident tone
- 2-4 sentences, no first-person "I"
- Return only the rewritten summary.

Original: ${summary}`,

  IMPROVE_EXPERIENCE: (responsibility: string, role: string) =>
    `You are a senior resume coach. Transform this responsibility into one strong, ATS-optimized bullet point for a ${role}.
Rules:
- Start with a past-tense action verb
- Add a quantifiable result only where it is plausible
- Use no more than 25 words
- Return only the bullet point, with no quote or hyphen prefix.

Input: ${responsibility}`,

  GENERATE_SKILLS: (domain: string) =>
    `You are a technical recruiter. List the 15 most in-demand current skills for a ${domain} professional.
Return only a valid JSON array of strings, for example: ["React","Node.js","SQL"].
Do not include markdown or explanations.`,

  IMPROVE_PROJECT: (description: string, tech: string) =>
    `Rewrite this project description for a resume. Technologies: ${tech}.
Make it ATS-friendly, show impact, use past tense, and stay within 45 words.
Return only the improved text.

Original: ${description}`,

  GENERATE_COVER_LETTER: (params: {
    name: string;
    role: string;
    company: string;
    skills: string[];
    experienceSummary: string;
    jobDescription: string;
  }) =>
    `Write a professional ATS-optimized cover letter.
Candidate: ${params.name}
Position: ${params.role} at ${params.company}
Key skills: ${params.skills.slice(0, 8).join(', ')}
Background: ${params.experienceSummary}
Job description excerpt: ${params.jobDescription.slice(0, 600)}

Structure: opening hook, two or three specific skill matches, and a closing call to action.
Tone: confident, concise, and human.
Length: 220-280 words.
Return only the letter body; do not add a salutation.`,

  GENERATE_INTERVIEW_QUESTIONS: (role: string, skills: string[], level: string) =>
    `Generate interview questions for a ${level}-level ${role}.
Relevant skills: ${skills.slice(0, 10).join(', ')}

Return a valid JSON array with exactly 13 objects:
- 5 technical
- 3 behavioural, with STAR guidance in sampleAnswer
- 3 situational
- 2 role-specific

Each object must follow this schema:
{"type":"technical|behavioural|situational|role-specific","question":"...","difficulty":"easy|medium|hard","sampleAnswer":"two-sentence guidance"}

Return only valid JSON with no markdown fences.`,

  MATCH_JOB: (resumeText: string, jobDescription: string) =>
    `You are an ATS system. Compare this resume to the job description and return this JSON shape:
{
  "matchScore": <0-100>,
  "matchedSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "keywordGaps": ["keyword"],
  "suggestions": ["actionable tip 1", "actionable tip 2"]
}

Resume:
${resumeText.slice(0, 2000)}

Job description:
${jobDescription.slice(0, 1500)}

Return only valid JSON.`,
};
