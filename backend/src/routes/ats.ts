import { Router, Request, Response } from 'express';
import Resume from '../models/Resume';
import { protect } from '../middleware/auth';
import { analyzeResume } from '../services/ats-engine';

const router = Router();
router.use(protect);

// GET /api/ats/:resumeId — run ATS analysis
router.get('/:resumeId', async (req: Request, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user!._id });
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  const report = analyzeResume(resume);
  // Persist score to resume document
  await Resume.findByIdAndUpdate(resume._id, { atsScore: report.totalScore, lastAtsAnalysis: new Date() });
  res.json(report);
});

export default router;
