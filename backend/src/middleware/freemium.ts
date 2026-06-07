import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Resume from '../models/Resume';

const USAGE_FIELD: Record<string, string> = {
  resumes:        'resumesCreated',
  ai_improvement: 'aiGenerations',
  cover_letter:   'coverLettersCreated',
  interview_prep: 'aiGenerations',
  job_match:      'aiGenerations',
  portfolio:      'portfoliosCreated',
  download:       'downloadsCount',
};

const FREE_LIMITS: Record<string, number> = {
  resumes:        3,
  ai_improvement: 50,
  cover_letter:   3,
  interview_prep: 5,
  job_match:      5,
  download:       10,
};

export const freemiumGuard = (feature: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    // Always fetch fresh user from DB so plan changes take effect immediately
    const freshUser = await User.findById(req.user._id);
    if (!freshUser || !freshUser.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }

    // Admin bypass
    if (freshUser.role === 'admin') return next();

    // Pro/enterprise with active plan = unlimited access
    if (freshUser.plan !== 'free' && freshUser.isProActive()) {
      req.user = freshUser;
      return next();
    }

    // ── Free plan limit checks ─────────────────────────────────────────────

    const limit = FREE_LIMITS[feature];
    if (limit === undefined) return next(); // Feature has no limit

    let currentUsage = 0;

    if (feature === 'resumes') {
      // Count actual active resumes from DB (accurate, handles deletions)
      currentUsage = await Resume.countDocuments({
        userId: freshUser._id,
        status: { $ne: 'archived' },
      });
    } else {
      const usageMap: Record<string, number> = {
        ai_improvement: freshUser.usage.aiGenerations,
        cover_letter:   freshUser.usage.coverLettersCreated,
        interview_prep: freshUser.usage.aiGenerations,
        job_match:      freshUser.usage.aiGenerations,
        download:       freshUser.usage.downloadsCount,
      };
      currentUsage = usageMap[feature] ?? 0;
    }

    if (currentUsage >= limit) {
      return res.status(403).json({
        error: `Free plan limit reached`,
        feature,
        limit,
        current: currentUsage,
        upgrade: true,
        message: `You've used ${currentUsage}/${limit} of your free ${feature.replace('_', ' ')} allowance. Upgrade to Pro for unlimited access.`,
      });
    }

    // Increment usage counter after successful response
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

    req.user = freshUser;
    next();
  };
