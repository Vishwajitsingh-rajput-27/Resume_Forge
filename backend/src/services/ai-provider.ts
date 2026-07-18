import axios, { AxiosInstance, AxiosError } from 'axios';
import { aiConfig, RESUME_PROMPTS, AIProvider } from '../config/ai-config';
import { logger } from '../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIResponse {
  text: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
  durationMs: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ─── Groq Client (OpenAI-compatible) ─────────────────────────────────────────

const createGroqClient = (): AxiosInstance =>
  axios.create({
    baseURL: 'https://api.groq.com/openai/v1',
    timeout: 20_000,
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

async function callGroq(messages: ChatMessage[], model?: string): Promise<AIResponse> {
  if (!process.env.GROQ_API_KEY?.trim()) {
    throw new Error('Groq API key is not configured.');
  }
  const client = createGroqClient();
  const resolvedModel = model || process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
  const start = Date.now();

  const { data } = await client.post('/chat/completions', {
    model: resolvedModel,
    messages,
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 1,
    stream: false,
  });

  return {
    text: data.choices[0].message.content.trim(),
    provider: 'GROQ',
    model: resolvedModel,
    tokensUsed: data.usage?.total_tokens,
    durationMs: Date.now() - start,
  };
}

// ─── Gemini Client (Google REST API) ─────────────────────────────────────────

const createGeminiClient = (): AxiosInstance =>
  axios.create({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * Convert OpenAI-style messages to Gemini's "contents" format.
 * Gemini doesn't have a system role — we prepend system content to the first user turn.
 */
function toGeminiContents(messages: ChatMessage[]) {
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const others = messages.filter((m) => m.role !== 'system');

  const contents = others.map((m, i) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [
      {
        text:
          i === 0 && system
            ? `${system}\n\n${m.content}`
            : m.content,
      },
    ],
  }));

  return contents;
}

async function callGemini(messages: ChatMessage[], model?: string): Promise<AIResponse> {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error('Gemini API key is not configured.');
  }
  const client = createGeminiClient();
  const resolvedModel = model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;
  const start = Date.now();

  const { data } = await client.post(
    `/models/${resolvedModel}:generateContent?key=${apiKey}`,
    {
      contents: toGeminiContents(messages),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 1,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }
  );

  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) {
    throw new Error(
      `Gemini returned no text. Finish reason: ${data?.candidates?.[0]?.finishReason}`
    );
  }

  return {
    text: text.trim(),
    provider: 'GEMINI',
    model: resolvedModel,
    tokensUsed: data.usageMetadata?.totalTokenCount,
    durationMs: Date.now() - start,
  };
}

// ─── Unified Dispatcher with Automatic Fallback ───────────────────────────────

async function dispatch(
  messages: ChatMessage[],
  opts?: { preferHighQuality?: boolean }
): Promise<AIResponse> {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'GROQ';

  // Quality hint: use larger model where accuracy > speed
  const groqModel = opts?.preferHighQuality
    ? (process.env.GROQ_QUALITY_MODEL || 'openai/gpt-oss-120b')
    : (process.env.GROQ_MODEL || 'openai/gpt-oss-20b');

  const geminiModel = opts?.preferHighQuality
    ? (process.env.GEMINI_QUALITY_MODEL || 'gemini-2.5-pro')
    : (process.env.GEMINI_MODEL || 'gemini-2.5-flash');

  if (provider === 'GROQ') {
    return callGroq(messages, groqModel);
  }

  if (provider === 'GEMINI') {
    return callGemini(messages, geminiModel);
  }

  // GROQ_FALLBACK — try Groq first, fall back to Gemini
  if (provider === 'GROQ_FALLBACK') {
    try {
      return await callGroq(messages, groqModel);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.message : String(err);
      logger.warn(`Groq failed (${msg}), falling back to Gemini…`);
      return callGemini(messages, geminiModel);
    }
  }

  // Default
  return callGroq(messages, groqModel);
}

// ─── Helper: Safe JSON parse from AI output ───────────────────────────────────

function parseJSON<T>(raw: string): T {
  // Strip markdown fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

// ─── Public AI Service Methods ────────────────────────────────────────────────

const SYSTEM = 'You are ResumeForge, an expert career coach and ATS specialist.';

export const AIService = {
  // ── Core ──────────────────────────────────────────────────────────────────

  /** Raw prompt – returns plain text */
  async complete(prompt: string, opts?: { preferHighQuality?: boolean }): Promise<AIResponse> {
    return dispatch(
      [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      opts
    );
  },

  /** Multi-turn chat */
  async chat(messages: ChatMessage[], opts?: { preferHighQuality?: boolean }): Promise<AIResponse> {
    const withSystem: ChatMessage[] = messages[0]?.role === 'system'
      ? messages
      : [{ role: 'system', content: SYSTEM }, ...messages];
    return dispatch(withSystem, opts);
  },

  // ── Resume Features ────────────────────────────────────────────────────────

  async improveSummary(
    summary: string,
    role: string,
    style: 'concise' | 'standard' | 'detailed' = 'standard',
  ): Promise<string> {
    const targets = {
      concise: '40–60 words',
      standard: '60–90 words',
      detailed: '90–120 words',
    };
    const res = await AIService.complete(
      `${RESUME_PROMPTS.IMPROVE_SUMMARY(summary, role)}
Target length: ${targets[style]}.`,
      { preferHighQuality: true }
    );
    logger.info(`[AI] improveSummary | ${res.provider} | ${res.durationMs}ms`);
    return res.text;
  },

  async improveExperienceBullet(responsibility: string, role: string): Promise<string> {
    const res = await AIService.complete(
      RESUME_PROMPTS.IMPROVE_EXPERIENCE(responsibility, role)
    );
    logger.info(`[AI] improveExperience | ${res.provider} | ${res.durationMs}ms`);
    return res.text;
  },

  async generateSkillSuggestions(domain: string): Promise<string[]> {
    const res = await AIService.complete(
      RESUME_PROMPTS.GENERATE_SKILLS(domain)
    );
    try {
      return parseJSON<string[]>(res.text);
    } catch {
      // Graceful fallback: split newlines or commas
      return res.text
        .replace(/[\[\]"]/g, '')
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  },

  async improveProjectDescription(description: string, tech: string): Promise<string> {
    const res = await AIService.complete(
      RESUME_PROMPTS.IMPROVE_PROJECT(description, tech)
    );
    return res.text;
  },

  // ── Cover Letter ───────────────────────────────────────────────────────────

  async generateCoverLetter(params: {
    name: string;
    role: string;
    company: string;
    skills: string[];
    experienceSummary: string;
    jobDescription: string;
  }): Promise<string> {
    const res = await AIService.complete(
      RESUME_PROMPTS.GENERATE_COVER_LETTER(params),
      { preferHighQuality: true }
    );
    logger.info(`[AI] coverLetter | ${res.provider} | ${res.durationMs}ms`);
    return res.text;
  },

  // ── Interview Prep ─────────────────────────────────────────────────────────

  async generateInterviewQuestions(
    role: string,
    skills: string[],
    level: string
  ): Promise<Array<{
    type: string;
    question: string;
    difficulty: string;
    sampleAnswer: string;
  }>> {
    const res = await AIService.complete(
      RESUME_PROMPTS.GENERATE_INTERVIEW_QUESTIONS(role, skills, level),
      { preferHighQuality: true }
    );
    try {
      return parseJSON(res.text);
    } catch {
      logger.error('[AI] Failed to parse interview questions JSON', { raw: res.text });
      throw new Error('AI returned malformed interview questions. Please try again.');
    }
  },

  // ── Job Matching ───────────────────────────────────────────────────────────

  async matchJobDescription(resumeText: string, jobDescription: string): Promise<{
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    keywordGaps: string[];
    suggestions: string[];
  }> {
    const res = await AIService.complete(
      RESUME_PROMPTS.MATCH_JOB(resumeText, jobDescription),
      { preferHighQuality: true }
    );
    try {
      return parseJSON(res.text);
    } catch {
      logger.error('[AI] Failed to parse job match JSON', { raw: res.text });
      throw new Error('AI returned malformed job match data. Please try again.');
    }
  },

  // ── Provider Health Check ─────────────────────────────────────────────────

  async ping(): Promise<{ provider: AIProvider; model: string; ok: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await dispatch([
        { role: 'user', content: 'Reply with exactly the word: OK' },
      ]);
      return {
        provider: res.provider,
        model: res.model,
        ok: true,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return {
        provider: aiConfig.provider,
        model: aiConfig.model,
        ok: false,
        latencyMs: Date.now() - start,
      };
    }
  },
};

export default AIService;
