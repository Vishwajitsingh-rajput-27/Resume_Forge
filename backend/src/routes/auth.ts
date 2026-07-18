import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { protect } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

const sendTokens = (res: Response, user: InstanceType<typeof User>) => {
  const payload = { id: String(user._id), email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;

      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Email already registered.' });

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const user = await User.create({
        name,
        email,
        password,
        emailVerificationToken: crypto
          .createHash('sha256')
          .update(verificationToken)
          .digest('hex'),
      });

      // TODO: Send verification email via nodemailer
      logger.info(`New user registered: ${email}`);

      return sendTokens(res, user);
    } catch (err) {
      logger.error('Register error', err);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }
);

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account has been deactivated.' });
      }

      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      logger.info(`User logged in: ${email}`);

      return sendTokens(res, user);
    } catch (err) {
      logger.error('Login error', err);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  }
);

// ─── POST /api/auth/google ────────────────────────────────────────────────────
// Accepts a Google ID token from the frontend (e.g. @react-oauth/google)
router.post('/google', async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Google access token required.' });

  try {
    // Verify by fetching user info from Google
    const googleRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google token.' });

    const { sub: googleId, email, name, picture } = (await googleRes.json()) as {
      sub: string; email: string; name: string; picture: string;
    };

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name, email, googleId, avatar: picture, isEmailVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    return sendTokens(res, user);
  } catch (err) {
    logger.error('Google auth error', err);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
});

// ─── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required.' });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found.' });

    const accessToken = signAccessToken({ id: String(user._id), email: user.email, role: user.role });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      // Always return 200 to prevent email enumeration
      if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      logger.info(`Password reset link for ${user.email}: ${resetUrl}`);
      // TODO: send email with nodemailer

      res.json({ message: 'If that email exists, a reset link was sent.' });
    } catch (err) {
      logger.error('Forgot password error', err);
      res.status(500).json({ error: 'Could not process request.' });
    }
  }
);

// ─── POST /api/auth/reset-password ────────────────────────────────────────────
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) return res.status(400).json({ error: 'Token invalid or expired.' });

      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return sendTokens(res, user);
    } catch (err) {
      logger.error('Reset password error', err);
      res.status(500).json({ error: 'Password reset failed.' });
    }
  }
);

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// ─── PATCH /api/auth/profile ───────────────────────────────────────────────────
router.patch(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().trim().isLength({ max: 20 }),
    body('address').optional().trim().isLength({ max: 200 }),
    body('linkedin').optional().trim().isURL(),
    body('github').optional().trim().isURL(),
  ],
  async (req: Request, res: Response) => {
    try {
      const allowed = ['name', 'phone', 'address', 'linkedin', 'github', 'portfolioUrl', 'avatar'];
      const updates: Record<string, unknown> = {};
      allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

      const user = await User.findByIdAndUpdate(req.user!._id, updates, { new: true });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Profile update failed.' });
    }
  }
);

// ─── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', protect, async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user!._id, { $unset: { refreshToken: 1 } });
  res.json({ message: 'Logged out successfully.' });
});

export default router;
