import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import { freemiumGuard } from '../middleware/freemium';
import AIService from '../services/ai-provider';
import { logger } from '../utils/logger';

const router = Router();

// All AI routes require authentication
router.use(protect);

// ─── Shared error handler ─────────────────────────────────────────────────────
const handleAIError = (err: unknown, res: Response) => {
  const message = err instanceof Error ? err.message : 'AI request failed';
  logger.error('[AI Route]', { error: message });

  if (message.includes('API key') || message.includes('401')) {
    return res.status(503).json({
      error: 'AI provider not configured. Check GROQ_API_KEY or GEMINI_API_KEY in your .env.',
    });
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return res.status(429).json({
      error: 'AI provider rate limit hit. Wait a moment and try again.',
    });
  }
  return res.status(500).json({ error: message });
};

// ─── POST /api/ai/improve-summary ─────────────────────────────────────────────
router.post(
  '/improve-summary',
  freemiumGuard('ai_improvement'),
  [
    body('summary').trim().notEmpty().withMessage('Summary is required').isLength({ max: 1000 }),
    body('role').trim().notEmpty().withMessage('Role is required').isLength({ max: 100 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { summary, role } = req.body;
      const improved = await AIService.improveSummary(summary, role);
      res.json({ improved });
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

// ─── POST /api/ai/improve-bullet ──────────────────────────────────────────────
router.post(
  '/improve-bullet',
  freemiumGuard('ai_improvement'),
  [
    body('responsibility').trim().notEmpty().isLength({ max: 500 }),
    body('role').trim().notEmpty().isLength({ max: 100 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { responsibility, role } = req.body;
      const improved = await AIService.improveExperienceBullet(responsibility, role);
      res.json({ improved });
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

// ─── POST /api/ai/skill-suggestions ───────────────────────────────────────────
router.post(
  '/skill-suggestions',
  [body('domain').trim().notEmpty().isLength({ max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { domain } = req.body;
      const skills = await AIService.generateSkillSuggestions(domain);
      res.json({ skills });
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

// ─── POST /api/ai/improve-project ─────────────────────────────────────────────
router.post(
  '/improve-project',
  freemiumGuard('ai_improvement'),
  [
    body('description').trim().notEmpty().isLength({ max: 1000 }),
    body('tech').trim().notEmpty().isLength({ max: 300 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { description, tech } = req.body;
      const improved = await AIService.improveProjectDescription(description, tech);
      res.json({ improved });
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

// ─── POST /api/ai/cover-letter ────────────────────────────────────────────────
router.post(
  '/cover-letter',
  freemiumGuard('cover_letter'),
  [
    body('name').trim().notEmpty(),
    body('role').trim().notEmpty(),
    body('company').trim().notEmpty(),
    body('skills').isArray(),
    body('experienceSummary').trim().notEmpty().isLength({ max: 500 }),
    body('jobDescription').trim().notEmpty().isLength({ max: 3000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const letter = await AIService.generateCoverLetter(req.body);
      res.json({ letter });
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

// ─── POST /api/ai/interview-questions ─────────────────────────────────────────
router.post(
  '/interview-questions',
  freemiumGuard('interview_prep'),
  [
    body('role').trim().notEmpty(),
    body('skills').isArray({ min: 1 }),
    body('level')
      .trim()
      .notEmpty()
      .isIn(['junior', 'mid', 'senior', 'lead', 'intern'])
      .withMessage('level must be: junior | mid | senior | lead | intern'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { role, skills, level } = req.body;
      const questions = await AIService.generateInterviewQuestions(role, skills, level);
      res.json({ questions });
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

// ─── POST /api/ai/job-match ───────────────────────────────────────────────────
router.post(
  '/job-match',
  freemiumGuard('job_match'),
  [
    body('resumeText').trim().notEmpty().isLength({ min: 100, max: 5000 }),
    body('jobDescription').trim().notEmpty().isLength({ min: 50, max: 5000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { resumeText, jobDescription } = req.body;
      const result = await AIService.matchJobDescription(resumeText, jobDescription);
      res.json(result);
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

// ─── GET /api/ai/ping ─────────────────────────────────────────────────────────
// Health check — useful on the admin panel to confirm the provider is live
router.get('/ping', async (_req: Request, res: Response) => {
  const result = await AIService.ping();
  res.status(result.ok ? 200 : 503).json(result);
});

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// Generic freeform chat for power users / custom prompts
router.post(
  '/chat',
  freemiumGuard('ai_improvement'),
  [
    body('messages')
      .isArray({ min: 1, max: 20 })
      .withMessage('messages must be an array of 1–20 items'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']),
    body('messages.*.content').isString().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await AIService.chat(req.body.messages);
      res.json({ text: result.text, provider: result.provider, model: result.model });
    } catch (err) {
      handleAIError(err, res);
    }
  }
);

export default router;
