import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Resume from '../models/Resume';

const FREE_LIMITS: Record<string, number> = {
  resumes:        3,
  ai_improvement: 50,
  cover_letter:   3,
  interview_prep: 5,
  job_match:      5,
  download:       10,
};

const USAGE_FIELD: Record<string, string> = {
  resumes:        'resumesCreated',
  ai_improvement: 'aiGenerations',
  cover_letter:   'coverLettersCreated',
  interview_prep: 'aiGenerations',
  job_match:      'aiGenerations',
  portfolio:      'portfoliosCreated',
  download:       'downloadsCount',
};

// Plain function — no Mongoose instance methods needed
const isPlanActive = (plan: string, expiresAt?: Date | null): boolean => {
  if (plan === 'free') return false;
  if (!expiresAt) return true;           // no expiry = permanent
  return new Date() < new Date(expiresAt);
};

export const freemiumGuard = (feature: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Always fetch fresh user from DB — catches plan changes without re-login
      const freshUser = await User.findById(req.user._id).lean();
      if (!freshUser || !freshUser.isActive) {
        return res.status(401).json({ error: 'User not found.' });
      }

      // Admin = unlimited everything
      if (freshUser.role === 'admin') return next();

      // Active Pro/Enterprise = unlimited everything
      if (isPlanActive(freshUser.plan, freshUser.planExpiresAt)) {
        return next();
      }

      // ── Free plan — check limits ───────────────────────────────────────────
      const limit = FREE_LIMITS[feature];
      if (limit === undefined) return next(); // No limit defined = allow

      let currentUsage = 0;

      if (feature === 'resumes') {
        // Count real active resumes from DB (handles deletions accurately)
        currentUsage = await Resume.countDocuments({
          userId: freshUser._id,
          status: { $ne: 'archived' },
        });
      } else {
        const usageMap: Record<string, number> = {
          ai_improvement: freshUser.usage?.aiGenerations      ?? 0,
          cover_letter:   freshUser.usage?.coverLettersCreated ?? 0,
          interview_prep: freshUser.usage?.aiGenerations      ?? 0,
          job_match:      freshUser.usage?.aiGenerations      ?? 0,
          download:       freshUser.usage?.downloadsCount     ?? 0,
        };
        currentUsage = usageMap[feature] ?? 0;
      }

      if (currentUsage >= limit) {
        return res.status(403).json({
          error:   'Free plan limit reached',
          feature,
          limit,
          current: currentUsage,
          upgrade: true,
          message: `You've used ${currentUsage}/${limit} free ${feature.replace(/_/g, ' ')} requests. Upgrade to Pro for unlimited access.`,
        });
      }

      // Increment usage after successful response
      const usageField = USAGE_FIELD[feature];
      if (usageField) {
        res.on('finish', async () => {
          if (res.statusCode < 400) {
            await User.findByIdAndUpdate(req.user!._id, {
              $inc: { [`usage.${usageField}`]: 1 },
            });
          }
        });
      }

      next();
    } catch (err) {
      console.error('[freemiumGuard] Error:', err);
      // On unexpected error, allow the request through rather than silently block
      next();
    }
  };
