import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);
router.get('/', (_req: Request, res: Response) => res.json({ matches: [] }));
export default router;
