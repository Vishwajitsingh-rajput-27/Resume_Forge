import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import Resume from '../models/Resume';

const router = Router();

// GET /api/portfolios/:username — public portfolio
router.get('/:username', async (req: Request, res: Response) => {
  const resume = await Resume.findOne({ slug: req.params.username, isPublic: true });
  if (!resume) return res.status(404).json({ error: 'Portfolio not found' });
  res.json(resume);
});

// POST /api/portfolios/generate — protected
router.post('/generate', protect, async (req: Request, res: Response) => {
  const resume = await Resume.findOne({ _id: req.body.resumeId, userId: req.user!._id });
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  const slug = (resume.personalInfo.name || 'user').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
  await Resume.findByIdAndUpdate(resume._id, { isPublic: true, slug });
  res.json({ slug, url: `${process.env.FRONTEND_URL}/portfolio/${slug}` });
});

export default router;
