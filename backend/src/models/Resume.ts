import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Sub-document interfaces ───────────────────────────────────────────────────
interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  jobTitle?: string;
}

interface Education {
  institution: string;
  degree: string;
  specialization?: string;
  cgpa?: number;
  percentage?: number;
  startYear: number;
  endYear?: number;
  current: boolean;
}

interface Experience {
  company: string;
  role: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  responsibilities: string[];
  technologies?: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  highlights?: string[];
}

interface Certification {
  name: string;
  issuer: string;
  issueDate?: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
}

interface SkillCategory {
  category: string;
  skills: string[];
}

export interface IResume extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  templateId: string;
  colorTheme: string;
  fontFamily: string;
  status: 'draft' | 'complete' | 'archived';
  personalInfo: PersonalInfo;
  summary?: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  achievements: string[];
  languages: Array<{ language: string; proficiency: string }>;
  interests: string[];
  customSections: Array<{ title: string; content: string }>;
  atsScore?: number;
  lastAtsAnalysis?: Date;
  downloadCount: number;
  isPublic: boolean;
  slug?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150, default: 'My Resume' },
    templateId: { type: String, default: 'modern' },
    colorTheme: { type: String, default: '#0ea5e9' },
    fontFamily: { type: String, default: 'inter' },
    status: { type: String, enum: ['draft', 'complete', 'archived'], default: 'draft' },

    personalInfo: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true },
      phone: String,
      address: String,
      linkedin: String,
      github: String,
      website: String,
      jobTitle: String,
    },

    summary: { type: String, maxlength: 1000 },

    education: [
      {
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        specialization: String,
        cgpa: { type: Number, min: 0, max: 10 },
        percentage: { type: Number, min: 0, max: 100 },
        startYear: Number,
        endYear: Number,
        current: { type: Boolean, default: false },
      },
    ],

    experience: [
      {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        responsibilities: [String],
        technologies: [String],
      },
    ],

    projects: [
      {
        name: { type: String, default: '' },
        description: { type: String, default: '' },
        technologies: [String],
        githubUrl: String,
        liveUrl: String,
        highlights: [String],
      },
    ],

    skills: [
      {
        category: { type: String, default: '' },
        skills: [String],
      },
    ],

    certifications: [
      {
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        url: String,
      },
    ],

    achievements: [String],
    languages: [
      {
        language: { type: String, default: '' },
        proficiency: {
          type: String,
          enum: ['basic', 'conversational', 'professional', 'native'],
          default: 'professional',
        },
      },
    ],
    interests: [String],
    customSections: [{ title: String, content: String }],

    atsScore: { type: Number, min: 0, max: 100 },
    lastAtsAnalysis: Date,
    downloadCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
resumeSchema.index({ userId: 1, status: 1 });
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ isPublic: 1 });

const Resume: Model<IResume> = mongoose.model<IResume>('Resume', resumeSchema);
export default Resume;
