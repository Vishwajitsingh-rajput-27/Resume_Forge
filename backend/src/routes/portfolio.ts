import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import Resume from '../models/Resume';

const router = Router();

const disableCaching = (res: Response) => {
  res.set({
    'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
    Pragma: 'no-cache',
    Expires: '0',
  });
};

const getFrontendOrigin = () => {
  const configured = process.env.FRONTEND_URL?.trim();
  const raw = configured
    || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.username = '';
    url.password = '';
    return url.origin;
  } catch {
    return null;
  }
};

const createSlug = (name?: string) => {
  const base = (name || 'portfolio')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'portfolio';

  return `${base}-${Date.now().toString(36)}`;
};

// Public portfolio responses must always reflect the latest publication state.
router.get('/:username', async (req: Request, res: Response) => {
  disableCaching(res);

  if (!req.params.username || req.params.username.length > 160) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  try {
    const resume = await Resume.findOne({
      slug: req.params.username,
      isPublic: true,
    })
      .select('personalInfo summary skills experience projects education -_id')
      .lean();

    if (!resume) return res.status(404).json({ error: 'Portfolio not found' });
    return res.json(resume);
  } catch {
    return res.status(500).json({ error: 'Could not load portfolio' });
  }
});

router.post('/generate', protect, async (req: Request, res: Response) => {
  try {
    const frontendOrigin = getFrontendOrigin();
    if (!frontendOrigin) {
      return res.status(503).json({
        error: 'Portfolio publishing is not configured for this environment.',
      });
    }

    const resume = await Resume.findOne({
      _id: req.body.resumeId,
      userId: req.user!._id,
    });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const slug = createSlug(resume.personalInfo.name);
    resume.isPublic = true;
    resume.slug = slug;
    await resume.save();

    const portfolioUrl = new URL(
      `/portfolio/${encodeURIComponent(slug)}`,
      frontendOrigin,
    ).toString();
    return res.json({ slug, url: portfolioUrl });
  } catch {
    return res.status(500).json({ error: 'Could not publish portfolio' });
  }
});

export default router;
