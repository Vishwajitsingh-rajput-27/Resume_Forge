import { IResume } from '../models/Resume';
import { logger } from '../utils/logger';

// ─── HTML Resume Template for PDF export ─────────────────────────────────────
function buildResumeHTML(resume: IResume): string {
  const p = resume.personalInfo;
  const accent = resume.colorTheme || '#00C896';

  const escHTML = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const contactItems = [
    p.email   && `<span>✉ ${escHTML(p.email)}</span>`,
    p.phone   && `<span>📞 ${escHTML(p.phone)}</span>`,
    p.address && `<span>📍 ${escHTML(p.address)}</span>`,
    p.linkedin && `<span>🔗 ${escHTML(p.linkedin)}</span>`,
    p.github  && `<span>⚙ ${escHTML(p.github)}</span>`,
  ].filter(Boolean).join('\n');

  const experienceHTML = resume.experience.map((exp) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <strong>${escHTML(exp.role)}</strong>
          <span class="company" style="color:${accent}">${escHTML(exp.company)}${exp.location ? ` · ${escHTML(exp.location)}` : ''}</span>
        </div>
        <span class="date">${exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : ''} — ${exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : ''}</span>
      </div>
      <ul>${exp.responsibilities.filter(Boolean).map((r) => `<li>${escHTML(r)}</li>`).join('')}</ul>
    </div>
  `).join('');

  const educationHTML = resume.education.map((edu) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <strong>${escHTML(edu.degree)}${edu.specialization ? `, ${escHTML(edu.specialization)}` : ''}</strong>
          <span class="company" style="color:${accent}">${escHTML(edu.institution)}</span>
        </div>
        <span class="date">${edu.startYear} — ${edu.endYear || 'Present'}</span>
      </div>
      ${edu.cgpa ? `<p style="font-size:10px;color:#666">CGPA: ${edu.cgpa}</p>` : ''}
    </div>
  `).join('');

  const skillsHTML = resume.skills.map((cat) => `
    <div class="skill-group">
      <span class="skill-cat">${escHTML(cat.category)}:</span>
      ${cat.skills.map((s) => `<span class="skill-chip" style="background:${accent}18;color:${accent}">${escHTML(s)}</span>`).join('')}
    </div>
  `).join('');

  const projectsHTML = resume.projects.map((proj) => `
    <div class="entry">
      <strong>${escHTML(proj.name)}</strong>
      ${proj.technologies.length ? `<span style="font-size:9px;color:#888;margin-left:8px">${proj.technologies.slice(0,5).map(escHTML).join(' · ')}</span>` : ''}
      <p style="margin:3px 0 0;font-size:10px;color:#555">${escHTML(proj.description)}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1a1a1a; line-height: 1.4; padding: 36px; }
  h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .job-title { font-size: 12px; font-weight: 600; color: ${accent}; margin-top: 2px; }
  .contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; font-size: 9.5px; color: #666; }
  .divider { border: none; border-top: 2px solid ${accent}; margin: 12px 0; }
  .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: ${accent}; border-bottom: 1.5px solid ${accent}; padding-bottom: 2px; margin-bottom: 8px; }
  .entry { margin-bottom: 10px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-header strong { font-size: 11px; display: block; }
  .company { font-size: 10px; font-weight: 600; display: block; }
  .date { font-size: 9px; color: #888; white-space: nowrap; margin-left: 12px; }
  ul { padding-left: 14px; margin-top: 3px; }
  li { margin: 1.5px 0; font-size: 10px; color: #444; }
  .summary { font-size: 10.5px; color: #555; line-height: 1.55; margin-bottom: 12px; }
  .layout { display: flex; gap: 20px; }
  .main { flex: 1; min-width: 0; }
  .sidebar { width: 140px; flex-shrink: 0; }
  .skill-group { margin-bottom: 8px; }
  .skill-cat { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #999; display: block; margin-bottom: 3px; }
  .skill-chip { display: inline-block; padding: 1.5px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; margin: 1.5px 1.5px 1.5px 0; }
  section { margin-bottom: 14px; }
</style>
</head>
<body>
  <h1>${escHTML(p.name)}</h1>
  ${p.jobTitle ? `<div class="job-title">${escHTML(p.jobTitle)}</div>` : ''}
  <div class="contact">${contactItems}</div>
  <hr class="divider">

  ${resume.summary ? `<p class="summary">${escHTML(resume.summary)}</p>` : ''}

  <div class="layout">
    <div class="main">
      ${resume.experience.length ? `<section><div class="section-title">Work Experience</div>${experienceHTML}</section>` : ''}
      ${resume.projects.length ? `<section><div class="section-title">Projects</div>${projectsHTML}</section>` : ''}
      ${resume.education.length ? `<section><div class="section-title">Education</div>${educationHTML}</section>` : ''}
    </div>
    <div class="sidebar">
      ${resume.skills.length ? `<section><div class="section-title">Skills</div>${skillsHTML}</section>` : ''}
      ${resume.certifications.length ? `<section><div class="section-title">Certifications</div>${resume.certifications.map((c) => `<div class="entry"><strong style="font-size:10px">${escHTML(c.name)}</strong><span style="font-size:9px;color:#888;display:block">${escHTML(c.issuer)}</span></div>`).join('')}</section>` : ''}
    </div>
  </div>
</body>
</html>`;
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
export async function exportToPDF(resume: IResume): Promise<Buffer> {
  // Dynamic import of puppeteer to avoid loading it unless needed
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildResumeHTML(resume), { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ─── DOCX Export ──────────────────────────────────────────────────────────────
export async function exportToDOCX(resume: IResume): Promise<Buffer> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  } = await import('docx');

  const p = resume.personalInfo;
  const accent = resume.colorTheme?.replace('#', '') || '00C896';

  const bold = (text: string) => new TextRun({ text, bold: true, size: 22 });
  const normal = (text: string, size = 20) => new TextRun({ text, size });
  const muted = (text: string) => new TextRun({ text, color: '888888', size: 18 });
  const colored = (text: string) => new TextRun({ text, color: accent, bold: true, size: 20 });

  const sectionHeading = (title: string) =>
    new Paragraph({
      text: title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent } },
    });

  const children: InstanceType<typeof Paragraph>[] = [
    // Name
    new Paragraph({ children: [new TextRun({ text: p.name, bold: true, size: 40, color: '1a1a1a' })] }),
    ...(p.jobTitle ? [new Paragraph({ children: [colored(p.jobTitle)] })] : []),
    // Contact
    new Paragraph({
      children: [
        muted([p.email, p.phone, p.address, p.linkedin, p.github].filter(Boolean).join('  |  ')),
      ],
      spacing: { after: 200 },
    }),
  ];

  // Summary
  if (resume.summary) {
    children.push(
      sectionHeading('Professional Summary'),
      new Paragraph({ children: [normal(resume.summary)], spacing: { after: 160 } })
    );
  }

  // Experience
  if (resume.experience.length) {
    children.push(sectionHeading('Work Experience'));
    for (const exp of resume.experience) {
      children.push(
        new Paragraph({ children: [bold(exp.role), muted(`  ·  ${exp.company}${exp.location ? `, ${exp.location}` : ''}`)], spacing: { before: 120 } }),
        new Paragraph({ children: [muted(`${exp.startDate ? new Date(exp.startDate).getFullYear() : ''} – ${exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}`)] }),
        ...exp.responsibilities.filter(Boolean).map((r) =>
          new Paragraph({ children: [normal(`• ${r}`)], indent: { left: 240 } })
        )
      );
    }
  }

  // Education
  if (resume.education.length) {
    children.push(sectionHeading('Education'));
    for (const edu of resume.education) {
      children.push(
        new Paragraph({ children: [bold(`${edu.degree}${edu.specialization ? `, ${edu.specialization}` : ''}`)] }),
        new Paragraph({ children: [colored(edu.institution), muted(`  (${edu.startYear}–${edu.endYear || 'Present'})`)], spacing: { after: 80 } })
      );
    }
  }

  // Skills
  if (resume.skills.length) {
    children.push(sectionHeading('Skills'));
    for (const cat of resume.skills) {
      children.push(new Paragraph({ children: [bold(`${cat.category}: `), normal(cat.skills.join(', '))] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
