import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User, { IUser } from '../models/User';
import Resume from '../models/Resume';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { protect } from '../middleware/auth';
import { logger } from '../utils/logger';
import {
  GoogleIdentity,
  InvalidGoogleCredentialError,
  isGoogleAuthoritativeForEmail,
  verifyGoogleCredential,
} from '../services/google-identity';
import { normalizeAccountEmail } from '../utils/email';

const router = Router();

class GoogleAccountResolutionError extends Error {
  constructor(
    public readonly statusCode: 403 | 409,
    message: string,
  ) {
    super(message);
    this.name = 'GoogleAccountResolutionError';
  }
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && Number((error as { code?: unknown }).code) === 11000;

const sameUser = (left: IUser, right: IUser) =>
  String(left._id) === String(right._id);

const googleAccountConflict = () =>
  new GoogleAccountResolutionError(
    409,
    'This Google account conflicts with an existing account. Sign in with email and password.',
  );

const resolveGoogleUser = async (
  identity: GoogleIdentity,
  canRetry = true,
): Promise<IUser> => {
  // Look up the stable Google subject first and the email separately. Keeping
  // these as distinct queries makes account conflicts explicit and prevents an
  // ambiguous $or result from linking the wrong record.
  const [googleUser, emailUser] = await Promise.all([
    User.findOne({ googleId: identity.sub }).select('+refreshToken'),
    User.findOne({ email: identity.email }).select('+refreshToken'),
  ]);

  if (googleUser && !googleUser.isActive) {
    throw new GoogleAccountResolutionError(403, 'Account has been deactivated.');
  }
  if (!googleUser && emailUser && !emailUser.isActive) {
    throw new GoogleAccountResolutionError(403, 'Account has been deactivated.');
  }
  if (googleUser && emailUser && !sameUser(googleUser, emailUser)) {
    throw googleAccountConflict();
  }

  if (googleUser) {
    if (
      normalizeAccountEmail(googleUser.email) === identity.email
      && !googleUser.isEmailVerified
    ) {
      googleUser.isEmailVerified = true;
    }
    if (!googleUser.avatar && identity.picture) googleUser.avatar = identity.picture;
    googleUser.lastLogin = new Date();
    await googleUser.save({ validateBeforeSave: false });
    return googleUser;
  }

  if (emailUser) {
    if (emailUser.googleId && emailUser.googleId !== identity.sub) {
      throw googleAccountConflict();
    }
    if (!isGoogleAuthoritativeForEmail(identity)) {
      throw new GoogleAccountResolutionError(
        409,
        'An account already exists with this email. Sign in with email and password instead.',
      );
    }

    emailUser.googleId = identity.sub;
    emailUser.isEmailVerified = true;
    if (!emailUser.avatar && identity.picture) emailUser.avatar = identity.picture;
    emailUser.lastLogin = new Date();

    try {
      await emailUser.save({ validateBeforeSave: false });
      return emailUser;
    } catch (error) {
      if (canRetry && isDuplicateKeyError(error)) {
        return resolveGoogleUser(identity, false);
      }
      if (isDuplicateKeyError(error)) throw googleAccountConflict();
      throw error;
    }
  }

  try {
    return await User.create({
      name: identity.name,
      email: identity.email,
      googleId: identity.sub,
      avatar: identity.picture,
      isEmailVerified: true,
      lastLogin: new Date(),
    });
  } catch (error) {
    // A matching signup may win between the lookups and create. Resolve once
    // more so duplicate-key races become a login or a clear conflict, not 500.
    if (canRetry && isDuplicateKeyError(error)) {
      return resolveGoogleUser(identity, false);
    }
    if (isDuplicateKeyError(error)) throw googleAccountConflict();
    throw error;
  }
};

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const publicUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  phone: user.phone,
  address: user.address,
  linkedin: user.linkedin,
  github: user.github,
  portfolioUrl: user.portfolioUrl,
  usage: user.usage,
});

const createTokenPair = (user: IUser) => {
  const payload = { id: String(user._id), email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const issueTokens = async (res: Response, user: IUser, status = 200) => {
  const { accessToken, refreshToken } = createTokenPair(user);

  // Store only a hash. The raw refresh token is returned once to the client.
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return res.status(status).json({
    accessToken,
    refreshToken,
    user: publicUser(user),
  });
};

const validationError = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;

  const details = errors.array();
  res.status(400).json({
    error: String(details[0]?.msg || 'Please check the submitted fields.'),
    errors: details,
  });
  return true;
};

router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters.'),
    body('email')
      .customSanitizer((value) => normalizeAccountEmail(String(value)))
      .isEmail()
      .withMessage('Enter a valid email address.'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must include an uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must include a number.'),
  ],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;

    try {
      const { name, email, password } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Email already registered.' });

      const user = await User.create({
        name,
        email,
        password,
      });

      // Email verification is not enforced until a delivery workflow is configured.
      logger.info(`New user registered: ${email}`);
      return issueTokens(res, user);
    } catch (err) {
      logger.error('Register error', err);
      return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  },
);

router.post(
  '/login',
  [
    body('email')
      .customSanitizer((value) => normalizeAccountEmail(String(value)))
      .isEmail()
      .withMessage('Enter a valid email address.'),
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required.')
      .isLength({ max: 128 })
      .withMessage('Password is too long.'),
  ],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password +refreshToken');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account has been deactivated.' });
      }

      user.lastLogin = new Date();
      logger.info(`User logged in: ${email}`);
      return issueTokens(res, user);
    } catch (err) {
      logger.error('Login error', err);
      return res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  },
);

router.post(
  '/google',
  [
    body('credential')
      .isString()
      .withMessage('Google credential is required.')
      .trim()
      .notEmpty()
      .withMessage('Google credential is required.')
      .isLength({ max: 10_000 })
      .withMessage('Google credential is invalid.'),
  ],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;

    try {
      const configuredClientId = process.env.GOOGLE_CLIENT_ID?.trim();
      if (!configuredClientId) {
        return res.status(503).json({
          error: 'Google sign-in is not configured on the server.',
        });
      }

      const identity = await verifyGoogleCredential(
        String(req.body.credential),
        configuredClientId,
      );
      const user = await resolveGoogleUser(identity);
      return issueTokens(res, user);
    } catch (err) {
      if (err instanceof InvalidGoogleCredentialError) {
        return res.status(401).json({ error: err.message });
      }
      if (err instanceof GoogleAccountResolutionError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      logger.error('Google auth error', err);
      return res.status(500).json({ error: 'Google authentication failed. Please try again.' });
    }
  },
);

router.post(
  '/refresh',
  [body('refreshToken').isString().notEmpty().withMessage('Refresh token required.')],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;
    const refreshToken = String(req.body.refreshToken);

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const currentHash = hashToken(refreshToken);
      const currentUser = await User.findOne({
        _id: decoded.id,
        isActive: true,
        refreshToken: currentHash,
      });

      if (!currentUser) {
        return res.status(401).json({ error: 'Session is no longer valid. Please sign in again.' });
      }

      const nextTokens = createTokenPair(currentUser);
      const user = await User.findOneAndUpdate(
        {
          _id: currentUser._id,
          isActive: true,
          refreshToken: currentHash,
        },
        { $set: { refreshToken: hashToken(nextTokens.refreshToken) } },
        { new: true },
      );

      // The conditional update makes rotation atomic. If another request used
      // the same refresh token first, this request is rejected.
      if (!user) {
        return res.status(401).json({ error: 'Session was already refreshed. Please try again.' });
      }

      return res.json({
        ...nextTokens,
        user: publicUser(user),
      });
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
  },
);

router.post(
  '/forgot-password',
  [
    body('email')
      .customSanitizer((value) => normalizeAccountEmail(String(value)))
      .isEmail()
      .withMessage('Enter a valid email address.'),
  ],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;

    const emailHost = process.env.EMAIL_HOST?.trim();
    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPass = process.env.EMAIL_PASS;
    const configuredFrontendUrl = process.env.FRONTEND_URL?.trim();
    const isProduction = process.env.NODE_ENV === 'production';
    const emailConfigured = Boolean(emailHost && emailUser && emailPass);

    if (isProduction && (!emailConfigured || !configuredFrontendUrl)) {
      return res.status(503).json({
        error: 'Password reset email is not configured. Please contact support.',
      });
    }

    try {
      const user = await User.findOne({ email: req.body.email })
        .select('+passwordResetToken +passwordResetExpires');
      const genericMessage = 'If that email exists, a reset link was sent.';
      if (!user) return res.json({ message: genericMessage });

      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const frontendUrl = (configuredFrontendUrl || 'http://localhost:3000').replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

      if (!emailConfigured) {
        logger.info(`Development password reset link for ${user.email}: ${resetUrl}`);
        return res.json({
          message: genericMessage,
          ...(process.env.NODE_ENV === 'development' && { resetUrl }),
        });
      }

      const transporter = nodemailer.createTransport({
        host: emailHost!,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: Number(process.env.EMAIL_PORT || 587) === 465,
        auth: { user: emailUser!, pass: emailPass! },
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `ResumeForge <${emailUser}>`,
          to: user.email,
          subject: 'Reset your ResumeForge password',
          text: `Reset your ResumeForge password within 30 minutes: ${resetUrl}`,
          html: [
            '<p>We received a request to reset your ResumeForge password.</p>',
            `<p><a href="${resetUrl}">Reset your password</a></p>`,
            '<p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>',
          ].join(''),
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        logger.error('Password reset email delivery failed', err);
      }

      return res.json({ message: genericMessage });
    } catch (err) {
      logger.error('Forgot password error', err);
      return res.status(500).json({ error: 'Could not send the reset email. Please try again.' });
    }
  },
);

router.post(
  '/reset-password',
  [
    body('token').isString().notEmpty().withMessage('Reset token is required.'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must include an uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must include a number.'),
  ],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;

    try {
      const user = await User.findOne({
        passwordResetToken: hashToken(String(req.body.token)),
        passwordResetExpires: { $gt: Date.now() },
      }).select('+passwordResetToken +passwordResetExpires +refreshToken');

      if (!user) return res.status(400).json({ error: 'Reset link is invalid or expired.' });
      if (!user.isActive) return res.status(403).json({ error: 'Account has been deactivated.' });

      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // issueTokens replaces the prior session's refresh-token hash.
      return issueTokens(res, user);
    } catch (err) {
      logger.error('Reset password error', err);
      return res.status(500).json({ error: 'Password reset failed.' });
    }
  },
);

router.get('/me', protect, (req: Request, res: Response) => {
  res.json({ user: publicUser(req.user!) });
});

router.patch(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().trim().isLength({ max: 20 }),
    body('address').optional().trim().isLength({ max: 200 }),
    body('linkedin').optional({ values: 'falsy' }).trim().isURL(),
    body('github').optional({ values: 'falsy' }).trim().isURL(),
    body('portfolioUrl').optional({ values: 'falsy' }).trim().isURL(),
    body('avatar').optional({ values: 'falsy' }).trim().isURL(),
  ],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;

    try {
      const allowed = ['name', 'phone', 'address', 'linkedin', 'github', 'portfolioUrl', 'avatar'];
      const updates: Record<string, unknown> = {};
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const user = await User.findByIdAndUpdate(req.user!._id, updates, {
        new: true,
        runValidators: true,
      });
      if (!user) return res.status(404).json({ error: 'Account not found.' });
      return res.json({ user: publicUser(user) });
    } catch {
      return res.status(500).json({ error: 'Profile update failed.' });
    }
  },
);

router.patch(
  '/change-password',
  protect,
  [
    body('currentPassword')
      .isString()
      .notEmpty()
      .withMessage('Current password is required.')
      .isLength({ max: 128 })
      .withMessage('Current password is too long.'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters.')
      .matches(/[A-Z]/)
      .withMessage('New password must include an uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('New password must include a number.'),
  ],
  async (req: Request, res: Response) => {
    if (validationError(req, res)) return;

    try {
      const user = await User.findById(req.user!._id).select('+password +refreshToken');
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Account is no longer available.' });
      }
      if (!user.password) {
        return res.status(400).json({
          error: 'This account uses Google sign-in and does not have a password yet.',
        });
      }
      if (!(await user.comparePassword(req.body.currentPassword))) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
      if (await user.comparePassword(req.body.newPassword)) {
        return res.status(400).json({ error: 'New password must be different.' });
      }

      user.password = req.body.newPassword;
      await user.save();
      // Rotate the session so a copied refresh token cannot survive a
      // password change.
      return issueTokens(res, user);
    } catch (err) {
      logger.error('Change password error', err);
      return res.status(500).json({ error: 'Password change failed.' });
    }
  },
);

router.post('/logout', protect, async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user!._id, { $unset: { refreshToken: 1 } });
  return res.json({ message: 'Logged out successfully.' });
});

router.delete('/account', protect, async (req: Request, res: Response) => {
  try {
    await Resume.deleteMany({ userId: req.user!._id });
    await User.findByIdAndDelete(req.user!._id);
    return res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    logger.error('Delete account error', err);
    return res.status(500).json({ error: 'Account deletion failed.' });
  }
});

export default router;
