import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// Feature → usage field mapping
const USAGE_FIELD: Record<string, keyof { resumesCreated: number; aiGenerations: number; coverLettersCreated: number; portfoliosCreated: number; downloadsCount: number }> = {
  resumes: 'resumesCreated',
  ai_improvement: 'aiGenerations',
  cover_letter: 'coverLettersCreated',
  interview_prep: 'aiGenerations',
  job_match: 'aiGenerations',
  portfolio: 'portfoliosCreated',
  download: 'downloadsCount',
};

export const freemiumGuard = (feature: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const canUse = req.user.canUseFeature(feature);

    if (!canUse) {
      return res.status(403).json({
        error: 'Free plan limit reached',
        feature,
        upgrade: true,
        message: `You've reached the free plan limit for this feature. Upgrade to Pro for unlimited access.`,
      });
    }

    // Increment usage after the route succeeds (via res.on finish)
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
  };
