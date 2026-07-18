import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { logger } from '../utils/logger';

type UsageField = keyof IUser['usage'];

/**
 * Records successful feature usage for product analytics.
 *
 * This middleware never limits access. Tracking runs after the response so a
 * database write cannot delay or block the user's request.
 */
export const trackUsage = (field: UsageField) =>
  (req: Request, res: Response, next: NextFunction) => {
    res.once('finish', () => {
      if (res.statusCode >= 400 || !req.user) return;

      void User.findByIdAndUpdate(req.user._id, {
        $inc: { [`usage.${field}`]: 1 },
      }).catch((error: unknown) => {
        logger.warn('[Usage] Failed to record feature usage', {
          field,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    });

    next();
  };
