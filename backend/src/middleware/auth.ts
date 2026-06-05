import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import User, { IUser } from '../models/User';
import { logger } from '../utils/logger';

// Extend Express Request to carry user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or account disabled.' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('[Auth] Token verification failed', { error: (err as Error).message });
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const restrictTo = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient privileges.' });
    }
    next();
  };

export const adminOnly = restrictTo('admin');
