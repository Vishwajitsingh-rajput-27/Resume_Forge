import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { trackUsage } from '../middleware/usage';
import Resume from '../models/Resume';
import { exportToPDF, exportToDOCX } from '../services/export-service';
import { logger } from '../utils/logger';

const router = Router();
router.use(protect);

// GET /api/export/:id?format=pdf|docx
router.get('/:id', trackUsage('downloadsCount'), async (req: Request, res: Response) => {
  const format = (req.query.format as string) || 'pdf';
  if (!['pdf', 'docx'].includes(format)) return res.status(400).json({ error: 'format must be pdf or docx' });

  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!resume) return res.status(404).json({ error: 'Resume not found' });

  try {
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    if (format === 'pdf') {
      buffer = await exportToPDF(resume);
      contentType = 'application/pdf';
      ext = 'pdf';
    } else {
      buffer = await exportToDOCX(resume);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      ext = 'docx';
    }

    await Resume.findByIdAndUpdate(resume._id, { $inc: { downloadCount: 1 } });

    const filename = `${resume.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
    logger.info(`[Export] ${format.toUpperCase()} exported for resume ${resume._id}`);
  } catch (err) {
    logger.error('[Export] Failed:', err);
    res.status(500).json({ error: 'Export failed. Please try again.' });
  }
});

export default router;
