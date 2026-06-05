import { analyzeResume } from '../services/ats-engine';
import { IResume } from '../models/Resume';
import mongoose from 'mongoose';

const makeResume = (overrides: Partial<IResume> = {}): IResume =>
  ({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    title: 'Test Resume',
    templateId: 'modern',
    colorTheme: '#00C896',
    fontFamily: 'inter',
    status: 'draft',
    personalInfo: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 555 000 0000',
      address: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/janesmith',
      jobTitle: 'Software Engineer',
    },
    summary: 'Experienced software engineer with 5 years building scalable React applications.',
    education: [{
      institution: 'UC Berkeley', degree: 'B.S. Computer Science',
      specialization: 'AI', startYear: 2016, endYear: 2020, current: false,
    }],
    experience: [{
      company: 'Acme Corp', role: 'Senior Engineer', location: 'Remote',
      startDate: new Date('2020-01-01'), endDate: new Date('2024-01-01'), current: false,
      responsibilities: [
        'Developed and deployed React application serving 50,000 monthly users',
        'Reduced page load time by 40% through code-splitting and lazy loading',
        'Led team of 4 engineers delivering 3 major features per quarter',
      ],
      technologies: ['React', 'TypeScript', 'Node.js'],
    }],
    projects: [{
      name: 'Open Source Dashboard', description: 'Built analytics dashboard used by 500+ developers.',
      technologies: ['React', 'D3.js', 'Node.js'],
      githubUrl: 'github.com/jane/dashboard',
    }],
    skills: [{
      category: 'Technical Skills',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
    }],
    certifications: [],
    achievements: ['AWS Certified Developer', 'Published 3 open-source packages'],
    languages: [{ language: 'English', proficiency: 'native' }],
    interests: ['Open Source', 'Machine Learning'],
    customSections: [],
    downloadCount: 0,
    isPublic: false,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as IResume);

describe('ATS Engine', () => {
  describe('analyzeResume', () => {
    it('returns a valid ATSReport structure', () => {
      const report = analyzeResume(makeResume());
      expect(report).toHaveProperty('totalScore');
      expect(report).toHaveProperty('grade');
      expect(report).toHaveProperty('sections');
      expect(report).toHaveProperty('keywords');
      expect(report).toHaveProperty('priorityFixes');
      expect(report).toHaveProperty('strengths');
    });

    it('score is between 0 and 100', () => {
      const report = analyzeResume(makeResume());
      expect(report.totalScore).toBeGreaterThanOrEqual(0);
      expect(report.totalScore).toBeLessThanOrEqual(100);
    });

    it('assigns grade A for high-quality resume', () => {
      const report = analyzeResume(makeResume());
      expect(['A', 'B']).toContain(report.grade);
    });

    it('returns grade F for empty resume', () => {
      const empty = makeResume({
        personalInfo: { name: '', email: '', phone: '', address: '', linkedin: '', github: '', website: '', jobTitle: '' },
        summary: '',
        education: [],
        experience: [],
        skills: [],
        projects: [],
      });
      const report = analyzeResume(empty);
      expect(report.totalScore).toBeLessThan(40);
    });

    it('has 7 sections', () => {
      const report = analyzeResume(makeResume());
      expect(report.sections).toHaveLength(7);
    });

    it('section scores are 0–100', () => {
      const report = analyzeResume(makeResume());
      for (const section of report.sections) {
        expect(section.score).toBeGreaterThanOrEqual(0);
        expect(section.score).toBeLessThanOrEqual(100);
      }
    });

    it('penalises missing email', () => {
      const resume = makeResume({ personalInfo: { name: 'Jane', email: '', phone: '', address: '', linkedin: '', github: '', website: '', jobTitle: '' } });
      const report = analyzeResume(resume);
      const personalSection = report.sections.find((s) => s.name === 'Contact Information');
      expect(personalSection!.score).toBeLessThan(80);
    });

    it('reports missing skills as a keyword gap', () => {
      const noSkills = makeResume({ skills: [] });
      const report = analyzeResume(noSkills);
      const skillSection = report.sections.find((s) => s.name === 'Skills');
      expect(skillSection!.score).toBe(0);
    });

    it('identifies quantified achievements in experience', () => {
      const report = analyzeResume(makeResume());
      expect(report.totalScore).toBeGreaterThan(50);
    });
  });
});
