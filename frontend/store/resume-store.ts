import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PersonalInfo {
  name: string; email: string; phone: string; address: string;
  linkedin: string; github: string; website: string; jobTitle: string;
}
export interface Education {
  id: string; institution: string; degree: string; specialization: string;
  cgpa: string; percentage: string; startYear: string; endYear: string; current: boolean;
}
export interface Experience {
  id: string; company: string; role: string; location: string;
  startDate: string; endDate: string; current: boolean;
  responsibilities: string[]; technologies: string[];
}
export interface Project {
  id: string; name: string; description: string;
  technologies: string[]; githubUrl: string; liveUrl: string;
}
export interface Certification {
  id: string; name: string; issuer: string;
  issueDate: string; expiryDate: string; credentialId: string; url: string;
}
export interface SkillCategory {
  id: string; category: string; skills: string[];
}
export interface ResumeData {
  id?: string;
  title: string;
  templateId: string;
  colorTheme: string;
  fontFamily: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  achievements: string[];
  languages: Array<{ id: string; language: string; proficiency: string }>;
  interests: string[];
}

const emptyResume = (): ResumeData => ({
  title: 'My Resume',
  templateId: 'modern',
  colorTheme: '#00C896',
  fontFamily: 'inter',
  personalInfo: { name: '', email: '', phone: '', address: '', linkedin: '', github: '', website: '', jobTitle: '' },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  languages: [],
  interests: [],
});

interface ResumeStore {
  resume: ResumeData;
  currentStep: number;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  atsScore: number | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  setSummary: (summary: string) => void;
  addEducation: (edu: Education) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addExperience: (exp: Experience) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addSkillCategory: (cat: SkillCategory) => void;
  updateSkillCategory: (id: string, cat: Partial<SkillCategory>) => void;
  removeSkillCategory: (id: string) => void;
  addCertification: (cert: Certification) => void;
  removeCertification: (id: string) => void;
  setAchievements: (items: string[]) => void;
  addLanguage: (lang: { id: string; language: string; proficiency: string }) => void;
  removeLanguage: (id: string) => void;
  setInterests: (items: string[]) => void;
  setTemplate: (id: string) => void;
  setColor: (color: string) => void;
  setFont: (font: string) => void;
  setResumeId: (id: string) => void;
  setAtsScore: (score: number) => void;
  setIsSaving: (v: boolean) => void;
  setLastSaved: (ts: string) => void;
  resetResume: () => void;
  loadResume: (data: ResumeData) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: emptyResume(),
      currentStep: 0,
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      atsScore: null,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 9) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      updatePersonalInfo: (info) =>
        set((s) => ({ resume: { ...s.resume, personalInfo: { ...s.resume.personalInfo, ...info } }, isDirty: true })),

      setSummary: (summary) =>
        set((s) => ({ resume: { ...s.resume, summary }, isDirty: true })),

      addEducation: (edu) =>
        set((s) => ({ resume: { ...s.resume, education: [...s.resume.education, edu] }, isDirty: true })),
      updateEducation: (id, edu) =>
        set((s) => ({ resume: { ...s.resume, education: s.resume.education.map((e) => e.id === id ? { ...e, ...edu } : e) }, isDirty: true })),
      removeEducation: (id) =>
        set((s) => ({ resume: { ...s.resume, education: s.resume.education.filter((e) => e.id !== id) }, isDirty: true })),

      addExperience: (exp) =>
        set((s) => ({ resume: { ...s.resume, experience: [...s.resume.experience, exp] }, isDirty: true })),
      updateExperience: (id, exp) =>
        set((s) => ({ resume: { ...s.resume, experience: s.resume.experience.map((e) => e.id === id ? { ...e, ...exp } : e) }, isDirty: true })),
      removeExperience: (id) =>
        set((s) => ({ resume: { ...s.resume, experience: s.resume.experience.filter((e) => e.id !== id) }, isDirty: true })),

      addProject: (project) =>
        set((s) => ({ resume: { ...s.resume, projects: [...s.resume.projects, project] }, isDirty: true })),
      updateProject: (id, project) =>
        set((s) => ({ resume: { ...s.resume, projects: s.resume.projects.map((p) => p.id === id ? { ...p, ...project } : p) }, isDirty: true })),
      removeProject: (id) =>
        set((s) => ({ resume: { ...s.resume, projects: s.resume.projects.filter((p) => p.id !== id) }, isDirty: true })),

      addSkillCategory: (cat) =>
        set((s) => ({ resume: { ...s.resume, skills: [...s.resume.skills, cat] }, isDirty: true })),
      updateSkillCategory: (id, cat) =>
        set((s) => ({ resume: { ...s.resume, skills: s.resume.skills.map((c) => c.id === id ? { ...c, ...cat } : c) }, isDirty: true })),
      removeSkillCategory: (id) =>
        set((s) => ({ resume: { ...s.resume, skills: s.resume.skills.filter((c) => c.id !== id) }, isDirty: true })),

      addCertification: (cert) =>
        set((s) => ({ resume: { ...s.resume, certifications: [...s.resume.certifications, cert] }, isDirty: true })),
      removeCertification: (id) =>
        set((s) => ({ resume: { ...s.resume, certifications: s.resume.certifications.filter((c) => c.id !== id) }, isDirty: true })),

      setAchievements: (achievements) =>
        set((s) => ({ resume: { ...s.resume, achievements }, isDirty: true })),

      addLanguage: (lang) =>
        set((s) => ({ resume: { ...s.resume, languages: [...s.resume.languages, lang] }, isDirty: true })),
      removeLanguage: (id) =>
        set((s) => ({ resume: { ...s.resume, languages: s.resume.languages.filter((l) => l.id !== id) }, isDirty: true })),

      setInterests: (interests) =>
        set((s) => ({ resume: { ...s.resume, interests }, isDirty: true })),
      setTemplate: (templateId) =>
        set((s) => ({ resume: { ...s.resume, templateId }, isDirty: true })),
      setColor: (colorTheme) =>
        set((s) => ({ resume: { ...s.resume, colorTheme }, isDirty: true })),
      setFont: (fontFamily) =>
        set((s) => ({ resume: { ...s.resume, fontFamily }, isDirty: true })),
      setResumeId: (id) =>
        set((s) => ({ resume: { ...s.resume, id } })),
      setAtsScore: (atsScore) => set({ atsScore }),
      setIsSaving: (isSaving) => set({ isSaving }),
      setLastSaved: (lastSaved) => set({ lastSaved, isDirty: false }),
      resetResume: () => set({ resume: emptyResume(), currentStep: 0, isDirty: false, atsScore: null }),
      loadResume: (data) => set({ resume: data, isDirty: false }),
    }),
    {
      name: 'resumeai-builder',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ resume: s.resume, currentStep: s.currentStep }),
    }
  )
);
