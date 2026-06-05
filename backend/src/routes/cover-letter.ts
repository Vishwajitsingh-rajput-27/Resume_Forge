import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);
// Cover letter saving/history — AI generation is handled in /api/ai/cover-letter
router.get('/', (_req: Request, res: Response) => res.json({ coverLetters: [] }));
export default router;
