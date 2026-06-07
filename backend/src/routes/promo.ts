import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import User from '../models/User';
import { logger } from '../utils/logger';

const router = Router();
router.use(protect);

// Valid promo codes — add more here anytime
const PROMO_CODES: Record<string, { plan: 'pro' | 'enterprise'; durationDays: number; description: string }> = {
  'VISHU27': {
    plan: 'pro',
    durationDays: 365,          // 1 year Pro
    description: 'Founder promo — 1 year Pro access',
  },
};

// POST /api/promo/redeem
router.post(
  '/redeem',
  [body('code').trim().notEmpty().withMessage('Promo code is required')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const code = (req.body.code as string).toUpperCase().trim();
    const promo = PROMO_CODES[code];

    if (!promo) {
      return res.status(400).json({ error: 'Invalid promo code. Please check and try again.' });
    }

    const user = await User.findById(req.user!._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // If already on same or higher plan
    if (user.plan === 'enterprise') {
      return res.status(400).json({ error: 'You already have an Enterprise plan.' });
    }
    if (user.plan === promo.plan) {
      return res.status(400).json({ error: `You already have a ${promo.plan} plan.` });
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + promo.durationDays);

    // Upgrade user
    user.plan = promo.plan;
    user.planExpiresAt = expiresAt;
    await user.save();

    logger.info(`[Promo] User ${user.email} upgraded to ${promo.plan} via code ${code}`);

    return res.json({
      success: true,
      message: `🎉 You've been upgraded to ${promo.plan.toUpperCase()}!`,
      plan: promo.plan,
      expiresAt,
      description: promo.description,
    });
  }
);

export default router;
