import { Router, Request, Response } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import User from '../models/User';
import Resume from '../models/Resume';

const router = Router();
router.use(protect, adminOnly);

router.get('/stats', async (_req: Request, res: Response) => {
  const [users, resumes] = await Promise.all([User.countDocuments(), Resume.countDocuments()]);
  res.json({ users, resumes });
});

router.get('/users', async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const users = await User.find().select('-password').sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
  const total = await User.countDocuments();
  res.json({ users, total, page, pages: Math.ceil(total/limit) });
});

export default router;
