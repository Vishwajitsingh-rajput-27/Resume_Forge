import type { ResumeData } from '@/store/resume-store';

export const RESUME_TEMPLATE_IDS = [
  'modern',
  'minimal',
  'corporate',
  'developer',
  'creative',
  'executive',
  'compact',
] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATE_IDS)[number];

export interface ResumeTemplateMeta {
  id: ResumeTemplateId;
  name: string;
  description: string;
  bestFor: string;
  atsNote: string;
  tag: string;
  previewAccent: string;
}

export const RESUME_TEMPLATES: readonly ResumeTemplateMeta[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'A balanced two-column resume with a crisp accent and generous breathing room.',
    bestFor: 'Product, tech & operations',
    atsNote: 'Clear section labels',
    tag: 'Most popular',
    previewAccent: '#00C896',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A distraction-free single-column layout built around readable typography.',
    bestFor: 'Any industry',
    atsNote: 'Single-column',
    tag: 'ATS favourite',
    previewAccent: '#64748B',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'A confident navy-led layout with structured experience and skills.',
    bestFor: 'Finance, consulting & enterprise',
    atsNote: 'Standard headings',
    tag: 'Professional',
    previewAccent: '#1E3A8A',
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'A code-inspired dark layout that keeps projects, tools and impact easy to scan.',
    bestFor: 'Engineering & data',
    atsNote: 'Text-first content',
    tag: 'Technical',
    previewAccent: '#22C55E',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Expressive typography and a bold accent rail without sacrificing content hierarchy.',
    bestFor: 'Design, media & marketing',
    atsNote: 'Readable text hierarchy',
    tag: 'New',
    previewAccent: '#E11D48',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'A refined, editorial resume that puts leadership scope and outcomes first.',
    bestFor: 'Leadership & strategy',
    atsNote: 'Conventional structure',
    tag: 'Leadership',
    previewAccent: '#9A6B2F',
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'A dense one-page format that fits more evidence while staying highly skimmable.',
    bestFor: 'Experienced candidates',
    atsNote: 'One-page focused',
    tag: 'Space saver',
    previewAccent: '#0F766E',
  },
] as const;

export const TEMPLATE_COLOR_THEMES = [
  { label: 'Emerald', value: '#00C896' },
  { label: 'Violet', value: '#6C63FF' },
  { label: 'Amber', value: '#F7B731' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Navy', value: '#1E3A8A' },
  { label: 'Slate', value: '#475569' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Teal', value: '#0F766E' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Pink', value: '#EC4899' },
] as const;

export const TEMPLATE_FONTS = [
  { label: 'Inter', value: 'inter', sample: 'Aa', stack: 'Inter, sans-serif' },
  { label: 'DM Sans', value: 'dm-sans', sample: 'Aa', stack: '"DM Sans", sans-serif' },
  { label: 'Georgia', value: 'georgia', sample: 'Aa', stack: 'Georgia, serif' },
  { label: 'JetBrains Mono', value: 'mono', sample: '<>', stack: '"JetBrains Mono", monospace' },
] as const;

export function isResumeTemplateId(value: string): value is ResumeTemplateId {
  return RESUME_TEMPLATE_IDS.includes(value as ResumeTemplateId);
}

export const TEMPLATE_PREVIEW_RESUME: ResumeData = {
  title: 'Product Designer Resume',
  templateId: 'modern',
  colorTheme: '#00C896',
  fontFamily: 'inter',
  personalInfo: {
    name: 'Maya Chen',
    jobTitle: 'Senior Product Designer',
    email: 'maya.chen@email.com',
    phone: '+1 415 555 0142',
    address: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/mayachen',
    github: 'github.com/mayachen',
    website: 'mayachen.design',
  },
  summary:
    'Product designer with 8 years of experience turning complex workflows into clear, inclusive products. Led cross-functional teams from research through launch for B2B platforms used by 2M+ people.',
  experience: [
    {
      id: 'preview-exp-1',
      company: 'Northstar Labs',
      role: 'Senior Product Designer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: '',
      current: true,
      responsibilities: [
        'Led the redesign of a core analytics workflow, increasing task completion by 31%.',
        'Built a shared design system that cut feature delivery time by 24%.',
        'Mentored four designers and partnered with product and engineering leadership.',
      ],
      technologies: ['Figma', 'Maze', 'Amplitude'],
    },
    {
      id: 'preview-exp-2',
      company: 'Arc Studio',
      role: 'Product Designer',
      location: 'Oakland, CA',
      startDate: '2018',
      endDate: '2022',
      current: false,
      responsibilities: [
        'Shipped onboarding improvements that raised activation from 62% to 78%.',
        'Ran 40+ customer interviews across healthcare and fintech teams.',
      ],
      technologies: ['Figma', 'Miro', 'Webflow'],
    },
  ],
  education: [
    {
      id: 'preview-edu-1',
      institution: 'California College of the Arts',
      degree: 'BFA',
      specialization: 'Interaction Design',
      cgpa: '',
      percentage: '',
      startYear: '2014',
      endYear: '2018',
      current: false,
    },
  ],
  projects: [
    {
      id: 'preview-project-1',
      name: 'Signal Design System',
      description: 'A multi-brand component library adopted by six product squads.',
      technologies: ['Figma', 'Storybook', 'React'],
      githubUrl: '',
      liveUrl: 'signal.design',
    },
    {
      id: 'preview-project-2',
      name: 'Access Audit',
      description: 'An accessibility review toolkit and training series for product teams.',
      technologies: ['WCAG', 'Research'],
      githubUrl: '',
      liveUrl: '',
    },
  ],
  skills: [
    {
      id: 'preview-skill-1',
      category: 'Design',
      skills: ['Product strategy', 'Interaction design', 'Prototyping', 'Design systems'],
    },
    {
      id: 'preview-skill-2',
      category: 'Research',
      skills: ['User interviews', 'Usability testing', 'Journey mapping'],
    },
    {
      id: 'preview-skill-3',
      category: 'Tools',
      skills: ['Figma', 'Maze', 'Amplitude', 'Storybook'],
    },
  ],
  certifications: [
    {
      id: 'preview-cert-1',
      name: 'IAAP Accessibility Core Competencies',
      issuer: 'IAAP',
      issueDate: '2023',
      expiryDate: '',
      credentialId: '',
      url: '',
    },
  ],
  achievements: ['Speaker, Design Systems Week 2024', 'Northstar Craft Award, 2023'],
  languages: [
    { id: 'preview-lang-1', language: 'English', proficiency: 'native' },
    { id: 'preview-lang-2', language: 'Mandarin', proficiency: 'professional' },
  ],
  interests: ['Editorial design', 'Urban sketching', 'Cycling'],
};
