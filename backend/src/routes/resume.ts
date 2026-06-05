import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Resume from '../models/Resume';
import { protect } from '../middleware/auth';
import { freemiumGuard } from '../middleware/freemium';
import { analyzeResume } from '../services/ats-engine';
import { logger } from '../utils/logger';

const router = Router();
router.use(protect);

// GET /api/resumes — list user's resumes
router.get('/', async (req: Request, res: Response) => {
  const resumes = await Resume.find({ userId: req.user!._id, status: { $ne: 'archived' } })
    .sort({ updatedAt: -1 }).select('-customSections');
  res.json(resumes);
});

// POST /api/resumes — create
router.post('/', freemiumGuard('resumes'), [
  body('title').trim().notEmpty().isLength({ max: 150 }),
  body('personalInfo.name').trim().notEmpty(),
  body('personalInfo.email').isEmail(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const resume = await Resume.create({ ...req.body, userId: req.user!._id });
    res.status(201).json(resume);
  } catch (err) { res.status(500).json({ error: 'Failed to create resume' }); }
});

// GET /api/resumes/:id
router.get('/:id', async (req: Request, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  res.json(resume);
});

// PUT /api/resumes/:id — update (auto-save)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { ...req.body, $inc: { version: 1 } },
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) { res.status(500).json({ error: 'Failed to update resume' }); }
});

// DELETE /api/resumes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  await Resume.findOneAndUpdate({ _id: req.params.id, userId: req.user!._id }, { status: 'archived' });
  res.json({ message: 'Resume archived' });
});

export default router;
