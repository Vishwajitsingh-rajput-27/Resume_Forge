import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import { trackUsage } from '../middleware/usage';
import AIService from '../services/ai-provider';
import { logger } from '../utils/logger';

const router = Router();
router.use(protect);

const handleAIError = (err: unknown, res: Response) => {
  const message = err instanceof Error ? err.message : 'AI request failed';
  logger.error('[AI Route]', { error: message });

  if (message.includes('API key') || message.includes('401')) {
    return res.status(503).json({
      error: 'AI provider not configured. Check GROQ_API_KEY or GEMINI_API_KEY in Render environment variables.',
    });
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return res.status(429).json({ error: 'AI rate limit hit. Wait a moment and try again.' });
  }
  if (message.includes('fetch') || message.includes('ECONNREFUSED') || message.includes('network')) {
    return res.status(503).json({ error: 'Cannot reach AI provider. Check GROQ_API_KEY in Render.' });
  }
  return res.status(500).json({ error: message });
};

// POST /api/ai/improve-summary
router.post(
  '/improve-summary',
  trackUsage('aiGenerations'),
  [
    body('summary').trim().notEmpty().withMessage('Summary is required').isLength({ max: 1000 }),
    body('role').trim().notEmpty().withMessage('Role is required').isLength({ max: 100 }),
    body('style').optional().isIn(['concise', 'standard', 'detailed']),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const improved = await AIService.improveSummary(
        req.body.summary,
        req.body.role,
        req.body.style || 'standard',
      );
      res.json({ improved });
    } catch (err) { handleAIError(err, res); }
  }
);

// POST /api/ai/improve-bullet
router.post(
  '/improve-bullet',
  trackUsage('aiGenerations'),
  [
    body('responsibility').trim().notEmpty().isLength({ max: 500 }),
    body('role').trim().notEmpty().isLength({ max: 100 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const improved = await AIService.improveExperienceBullet(req.body.responsibility, req.body.role);
      res.json({ improved });
    } catch (err) { handleAIError(err, res); }
  }
);

// POST /api/ai/skill-suggestions
router.post(
  '/skill-suggestions',
  [body('domain').trim().notEmpty().isLength({ max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const skills = await AIService.generateSkillSuggestions(req.body.domain);
      res.json({ skills });
    } catch (err) { handleAIError(err, res); }
  }
);

// POST /api/ai/improve-project
router.post(
  '/improve-project',
  trackUsage('aiGenerations'),
  [
    body('description').trim().notEmpty().isLength({ max: 1000 }),
    body('tech').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const improved = await AIService.improveProjectDescription(
        req.body.description,
        req.body.tech || 'Not specified',
      );
      res.json({ improved });
    } catch (err) { handleAIError(err, res); }
  }
);

// POST /api/ai/cover-letter
// ─── FIXED: skills and experienceSummary are now optional ────────────────────
router.post(
  '/cover-letter',
  trackUsage('coverLettersCreated'),
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('role').trim().notEmpty().withMessage('Job role is required').isLength({ max: 100 }),
    body('company').trim().notEmpty().withMessage('Company name is required').isLength({ max: 100 }),
    body('jobDescription').trim().notEmpty().withMessage('Job description is required').isLength({ max: 3000 }),
    // skills and experienceSummary are OPTIONAL — user may not have filled them in yet
    body('skills').optional().isArray(),
    body('experienceSummary').optional().trim().isLength({ max: 500 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      // Provide safe defaults if missing
      const params = {
        name: req.body.name,
        role: req.body.role,
        company: req.body.company,
        skills: req.body.skills || [],
        experienceSummary: req.body.experienceSummary || `Applying for ${req.body.role} position`,
        jobDescription: req.body.jobDescription,
      };
      const letter = await AIService.generateCoverLetter(params);
      res.json({ letter });
    } catch (err) { handleAIError(err, res); }
  }
);

// POST /api/ai/interview-questions
router.post(
  '/interview-questions',
  trackUsage('aiGenerations'),
  [
    body('role').trim().notEmpty().isLength({ max: 100 }),
    body('skills').optional().isArray({ max: 50 }),
    body('skills.*').optional().isString().trim().isLength({ max: 100 }),
    body('level').trim().notEmpty()
      .isIn(['junior', 'mid', 'senior', 'lead', 'intern'])
      .withMessage('level must be: junior | mid | senior | lead | intern'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { role, skills = [], level } = req.body;
      const questions = await AIService.generateInterviewQuestions(role, skills, level);
      res.json({ questions });
    } catch (err) { handleAIError(err, res); }
  }
);

// POST /api/ai/job-match
router.post(
  '/job-match',
  trackUsage('aiGenerations'),
  [
    body('resumeText').trim().notEmpty().isLength({ min: 10, max: 5000 }),
    body('jobDescription').trim().notEmpty().isLength({ min: 10, max: 5000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const result = await AIService.matchJobDescription(req.body.resumeText, req.body.jobDescription);
      res.json(result);
    } catch (err) { handleAIError(err, res); }
  }
);

// GET /api/ai/ping
router.get('/ping', async (_req: Request, res: Response) => {
  const result = await AIService.ping();
  res.status(result.ok ? 200 : 503).json(result);
});

// POST /api/ai/chat
router.post(
  '/chat',
  trackUsage('aiGenerations'),
  [
    body('messages').isArray({ min: 1, max: 20 }),
    body('messages.*.role').isIn(['user', 'assistant', 'system']),
    body('messages.*.content').isString().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const result = await AIService.chat(req.body.messages);
      res.json({ text: result.text, provider: result.provider, model: result.model });
    } catch (err) { handleAIError(err, res); }
  }
);

export default router;
