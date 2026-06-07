import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import User from '../models/User';
import { logger } from '../utils/logger';

const router = Router();
router.use(protect);

const PROMO_CODES: Record<string, {
  plan: 'pro' | 'enterprise';
  durationDays: number;
  description: string;
}> = {
  'VISHU27': {
    plan: 'pro',
    durationDays: 365,
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

    // Always fetch fresh user
    const user = await User.findById(req.user!._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // ── Block reuse ────────────────────────────────────────────────────────
    if (user.redeemedCodes.includes(code)) {
      return res.status(400).json({
        error: 'You have already redeemed this promo code.',
      });
    }

    // Already on same or higher plan and it's still active
    if (user.plan === 'enterprise') {
      return res.status(400).json({ error: 'You already have the highest plan.' });
    }

    if (user.plan === promo.plan && user.isProActive()) {
      // Extend existing plan instead of blocking
      const currentExpiry = user.planExpiresAt && user.planExpiresAt > new Date()
        ? user.planExpiresAt
        : new Date();
      currentExpiry.setDate(currentExpiry.getDate() + promo.durationDays);
      user.planExpiresAt = currentExpiry;
    } else {
      // Upgrade plan
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + promo.durationDays);
      user.plan = promo.plan;
      user.planExpiresAt = expiresAt;
    }

    // ── Save redeemed code — prevents reuse ───────────────────────────────
    user.redeemedCodes.push(code);
    await user.save();

    logger.info(`[Promo] ${user.email} redeemed code ${code} → ${promo.plan} until ${user.planExpiresAt}`);

    return res.json({
      success:     true,
      message:     `🎉 You've been upgraded to ${promo.plan.toUpperCase()}!`,
      plan:        user.plan,
      expiresAt:   user.planExpiresAt,
      description: promo.description,
    });
  }
);

export default router;
