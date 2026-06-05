import { IResume } from '../models/Resume';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ATSSection {
  name: string;
  score: number;       // 0–100
  weight: number;      // relative weight
  issues: string[];
  suggestions: string[];
}

export interface ATSReport {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  sections: ATSSection[];
  keywords: {
    found: string[];
    missing: string[];
    density: number;
  };
  priorityFixes: string[];
  strengths: string[];
  readabilityScore: number;
  formattingScore: number;
}

// ─── ATS Keyword Banks ────────────────────────────────────────────────────────

const POWER_VERBS = [
  'achieved','built','created','designed','developed','directed','established',
  'implemented','improved','increased','launched','led','managed','optimized',
  'reduced','resolved','scaled','shipped','streamlined','transformed','delivered',
  'engineered','architected','deployed','migrated','automated','integrated',
  'collaborated','coordinated','mentored','trained','presented','analyzed',
];

const ATS_KEYWORDS_BY_DOMAIN: Record<string, string[]> = {
  software: ['javascript','typescript','python','react','node','api','database','cloud','agile','scrum','git','ci/cd','rest','graphql','microservices'],
  data: ['python','sql','machine learning','data analysis','pandas','numpy','visualization','tableau','power bi','statistics','etl','big data'],
  design: ['figma','ui/ux','prototyping','wireframes','user research','design system','adobe','sketch','accessibility','responsive'],
  marketing: ['seo','sem','google analytics','conversion','campaign','brand','content','social media','email marketing','crm'],
  management: ['strategy','stakeholder','roadmap','p&l','budget','cross-functional','kpi','okr','leadership','team building'],
};

const COMMON_ATS_KILLERS = [
  'tables','headers/footers','text boxes','graphics','columns','special characters',
  'images in header','non-standard fonts',
];

// ─── Score Helpers ────────────────────────────────────────────────────────────

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function scoreSection(raw: number, weight: number): number {
  return clamp(Math.round(raw)) * (weight / 100);
}

// ─── Section Scorers ──────────────────────────────────────────────────────────

function scorePersonalInfo(resume: IResume): ATSSection {
  const { personalInfo } = resume;
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  if (!personalInfo.name) { issues.push('Missing full name'); score -= 30; }
  if (!personalInfo.email) { issues.push('Missing email address'); score -= 25; }
  if (!personalInfo.phone) { issues.push('Missing phone number'); score -= 15; suggestions.push('Add your phone number for recruiter callbacks'); }
  if (!personalInfo.linkedin) { suggestions.push('Add a LinkedIn URL — 87% of recruiters use LinkedIn'); }
  if (!personalInfo.jobTitle) { issues.push('Missing target job title'); score -= 10; suggestions.push('Add a professional title that mirrors the job you\'re targeting'); }
  if (personalInfo.address && personalInfo.address.length < 5) { issues.push('Address appears incomplete'); score -= 5; }

  return { name: 'Contact Information', score: clamp(score), weight: 10, issues, suggestions };
}

function scoreSummary(resume: IResume): ATSSection {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const summary = resume.summary || '';
  let score = 0;

  if (!summary) {
    issues.push('No professional summary found');
    suggestions.push('Add a 2–4 sentence summary with your key skills and career goal');
    return { name: 'Professional Summary', score: 0, weight: 15, issues, suggestions };
  }

  score = 60; // base score for having a summary
  const words = summary.split(/\s+/).length;

  if (words < 30) { issues.push('Summary is too short (< 30 words)'); score -= 20; }
  if (words > 120) { issues.push('Summary is too long (> 120 words) — ATS may truncate'); score -= 10; }
  if (words >= 40 && words <= 80) { score += 20; }

  // Check for first-person pronouns (ATS-unfriendly)
  if (/\bI\b|\bme\b|\bmy\b/i.test(summary)) {
    issues.push('Avoid first-person pronouns (I/me/my) in summary');
    score -= 15;
  }

  // Power verbs
  const lowerSummary = summary.toLowerCase();
  const foundVerbs = POWER_VERBS.filter((v) => lowerSummary.includes(v));
  if (foundVerbs.length === 0) {
    suggestions.push('Start summary with a strong action word or professional title');
    score -= 10;
  } else { score += 10; }

  return { name: 'Professional Summary', score: clamp(score), weight: 15, issues, suggestions };
}

function scoreExperience(resume: IResume): ATSSection {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const exp = resume.experience || [];
  let score = 0;

  if (exp.length === 0) {
    issues.push('No work experience entries found');
    suggestions.push('Add at least one work experience (internships count!)');
    return { name: 'Work Experience', score: 0, weight: 30, issues, suggestions };
  }

  score = 50;
  let totalBullets = 0;
  let quantifiedBullets = 0;
  let powerVerbBullets = 0;

  for (const job of exp) {
    if (!job.company || !job.role) { issues.push(`Incomplete entry: missing company or role`); score -= 5; }
    if (!job.startDate) { issues.push(`Missing start date for ${job.role}`); score -= 5; }

    const bullets = job.responsibilities || [];
    totalBullets += bullets.length;

    if (bullets.length === 0) {
      issues.push(`No responsibilities listed for ${job.role} at ${job.company}`);
      score -= 10;
    } else if (bullets.length < 3) {
      suggestions.push(`Add 3–6 bullet points for ${job.role} to improve completeness`);
      score -= 5;
    }

    for (const bullet of bullets) {
      const lower = bullet.toLowerCase();
      if (/\d+[%$k+x]|\d+ (percent|users|customers|clients|hours|days|minutes)/i.test(bullet)) {
        quantifiedBullets++;
      }
      if (POWER_VERBS.some((v) => lower.startsWith(v))) {
        powerVerbBullets++;
      }
    }
  }

  if (totalBullets > 0) {
    const quantRatio = quantifiedBullets / totalBullets;
    const verbRatio = powerVerbBullets / totalBullets;

    if (quantRatio < 0.2) {
      suggestions.push('Add numbers/metrics to at least 30% of bullets (e.g., "reduced load time by 40%")');
    } else { score += 15; }

    if (verbRatio < 0.5) {
      suggestions.push('Start more bullets with strong past-tense action verbs (Built, Launched, Reduced…)');
    } else { score += 15; }
  }

  if (exp.length >= 2) score += 10;
  if (exp.length >= 3) score += 10;

  return { name: 'Work Experience', score: clamp(score), weight: 30, issues, suggestions };
}

function scoreEducation(resume: IResume): ATSSection {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const edu = resume.education || [];
  let score = 0;

  if (edu.length === 0) {
    issues.push('No education entries found');
    return { name: 'Education', score: 0, weight: 10, issues, suggestions };
  }

  score = 70;
  for (const e of edu) {
    if (!e.institution) { issues.push('Missing institution name'); score -= 15; }
    if (!e.degree) { issues.push('Missing degree name'); score -= 15; }
    if (!e.startYear) { issues.push('Missing graduation year'); score -= 10; }
    if (!e.specialization) { suggestions.push('Add your major/specialization for better keyword matching'); }
  }

  return { name: 'Education', score: clamp(score), weight: 10, issues, suggestions };
}

function scoreSkills(resume: IResume): ATSSection {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const skillCategories = resume.skills || [];
  const allSkills = skillCategories.flatMap((c) => c.skills);
  let score = 0;

  if (allSkills.length === 0) {
    issues.push('No skills section found — ATS cannot rank your profile');
    suggestions.push('Add a dedicated Skills section with 10–20 relevant skills');
    return { name: 'Skills', score: 0, weight: 20, issues, suggestions };
  }

  score = 50;
  if (allSkills.length >= 8) score += 20;
  if (allSkills.length >= 15) score += 10;
  if (allSkills.length > 30) { suggestions.push('Consider trimming skills to the most relevant 20–25'); score -= 5; }

  if (skillCategories.length >= 2) score += 10; // categorised = more ATS-friendly
  if (skillCategories.length >= 3) score += 10;

  // Check for common tech keywords
  const allLower = allSkills.map((s) => s.toLowerCase());
  const foundTech = Object.values(ATS_KEYWORDS_BY_DOMAIN).flat().filter((kw) =>
    allLower.some((s) => s.includes(kw))
  );
  if (foundTech.length >= 5) score += 10;

  return { name: 'Skills', score: clamp(score), weight: 20, issues, suggestions };
}

function scoreProjects(resume: IResume): ATSSection {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const projects = resume.projects || [];
  let score = projects.length > 0 ? 60 : 0;

  if (projects.length === 0) {
    suggestions.push('Add 2–3 projects to demonstrate hands-on experience');
    return { name: 'Projects', score: 0, weight: 10, issues, suggestions };
  }

  for (const p of projects) {
    if (!p.description || p.description.length < 30) {
      issues.push(`Project "${p.name}" needs a more detailed description`);
      score -= 10;
    }
    if (!p.technologies || p.technologies.length === 0) {
      suggestions.push(`Add technologies used in "${p.name}" for keyword matching`);
      score -= 5;
    }
    if (!p.githubUrl && !p.liveUrl) {
      suggestions.push(`Add GitHub/live URL for "${p.name}" to show verifiable work`);
    }
  }

  if (projects.length >= 2) score += 20;
  if (projects.length >= 3) score += 10;

  return { name: 'Projects', score: clamp(score), weight: 10, issues, suggestions };
}

function scoreFormatting(resume: IResume): ATSSection {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 80; // start high — we can't fully inspect raw format without PDF

  // Heuristics from data
  const allText = [
    resume.summary || '',
    ...( resume.experience || []).flatMap((e) => e.responsibilities),
    ...( resume.projects || []).map((p) => p.description),
  ].join(' ');

  const wordCount = allText.split(/\s+/).length;
  if (wordCount < 200) { issues.push('Resume content is very sparse (< 200 words)'); score -= 20; }
  if (wordCount > 1000) { issues.push('Resume may be too long (> 1000 words) — aim for 1 page for < 5 years experience'); score -= 10; }

  const hasCertifications = (resume.certifications || []).length > 0;
  if (!hasCertifications) {
    suggestions.push('Add certifications to boost credibility (even free ones like Google/AWS)');
  }

  return { name: 'Formatting & Length', score: clamp(score), weight: 5, issues, suggestions };
}

// ─── Keyword Density Analysis ─────────────────────────────────────────────────

function analyzeKeywords(resume: IResume) {
  const text = [
    resume.summary || '',
    ...(resume.experience || []).flatMap((e) => e.responsibilities),
    ...(resume.skills || []).flatMap((c) => c.skills),
    ...(resume.projects || []).map((p) => p.description),
  ].join(' ').toLowerCase();

  const words = text.split(/\W+/).filter((w) => w.length > 3);
  const total = words.length;
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  const allDomainKws = Object.values(ATS_KEYWORDS_BY_DOMAIN).flat();
  const found = allDomainKws.filter((kw) => text.includes(kw));
  const missing = allDomainKws.filter((kw) => !text.includes(kw)).slice(0, 10);
  const density = total > 0 ? Math.round((found.length / total) * 100 * 10) / 10 : 0;

  return { found, missing, density };
}

// ─── Grade Calculator ─────────────────────────────────────────────────────────

function toGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function analyzeResume(resume: IResume): ATSReport {
  const sections: ATSSection[] = [
    scorePersonalInfo(resume),
    scoreSummary(resume),
    scoreExperience(resume),
    scoreEducation(resume),
    scoreSkills(resume),
    scoreProjects(resume),
    scoreFormatting(resume),
  ];

  // Weighted total
  const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
  const rawScore = sections.reduce((sum, s) => sum + (s.score * s.weight) / 100, 0);
  const totalScore = clamp(Math.round((rawScore / totalWeight) * 100));

  const keywords = analyzeKeywords(resume);

  // Priority fixes: sections with score < 50, sorted by weight desc
  const priorityFixes = sections
    .filter((s) => s.score < 50 && s.issues.length > 0)
    .sort((a, b) => b.weight - a.weight)
    .flatMap((s) => s.issues)
    .slice(0, 5);

  const strengths = sections
    .filter((s) => s.score >= 80)
    .map((s) => `Strong ${s.name} section (${s.score}/100)`);

  const readabilityScore = clamp(
    sections.find((s) => s.name === 'Work Experience')?.score ?? 50
  );
  const formattingScore = clamp(
    sections.find((s) => s.name === 'Formatting & Length')?.score ?? 70
  );

  return {
    totalScore,
    grade: toGrade(totalScore),
    sections,
    keywords,
    priorityFixes,
    strengths,
    readabilityScore,
    formattingScore,
  };
}
