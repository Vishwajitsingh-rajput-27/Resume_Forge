'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  User, GraduationCap, Briefcase, FolderKanban, Wrench,
  Award, Trophy, Languages, Heart, Eye, Save, ChevronLeft, ChevronRight,
  Loader2, Sparkles, FileDown,
} from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';
import { resumeApi } from '@/lib/api-client';

// Steps
import { PersonalInfoStep } from '@/components/resume/builder/steps/PersonalInfoStep';
import { SummaryStep } from '@/components/resume/builder/steps/SummaryStep';
import { EducationStep } from '@/components/resume/builder/steps/EducationStep';
import { SkillsStep } from '@/components/resume/builder/steps/SkillsStep';
import { ExperienceStep } from '@/components/resume/builder/steps/ExperienceStep';
import { ProjectsStep } from '@/components/resume/builder/steps/ProjectsStep';
import { CertificationsStep } from '@/components/resume/builder/steps/CertificationsStep';
import { AchievementsStep } from '@/components/resume/builder/steps/AchievementsStep';
import { LanguagesStep } from '@/components/resume/builder/steps/LanguagesStep';
import { InterestsStep } from '@/components/resume/builder/steps/InterestsStep';
import { LivePreview } from '@/components/resume/builder/LivePreview';

const STEPS = [
  { icon: User,          label: 'Personal',       short: 'Info' },
  { icon: Sparkles,      label: 'Summary',        short: 'Summary' },
  { icon: GraduationCap, label: 'Education',      short: 'Edu' },
  { icon: Wrench,        label: 'Skills',         short: 'Skills' },
  { icon: Briefcase,     label: 'Experience',     short: 'Work' },
  { icon: FolderKanban,  label: 'Projects',       short: 'Projects' },
  { icon: Award,         label: 'Certifications', short: 'Certs' },
  { icon: Trophy,        label: 'Achievements',   short: 'Awards' },
  { icon: Languages,     label: 'Languages',      short: 'Lang' },
  { icon: Heart,         label: 'Interests',      short: 'Interests' },
];

const STEP_COMPONENTS = [
  PersonalInfoStep, SummaryStep, EducationStep, SkillsStep, ExperienceStep,
  ProjectsStep, CertificationsStep, AchievementsStep, LanguagesStep, InterestsStep,
];

export default function ResumeBuilderPage() {
  const { currentStep, setStep, nextStep, prevStep, resume, isDirty, setIsSaving, setLastSaved, setResumeId, isSaving } = useResumeStore();
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const StepComponent = STEP_COMPONENTS[currentStep];

  // Auto-save
  const saveResume = useCallback(async () => {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      let res;
      if (resume.id) {
        res = await resumeApi.update(resume.id, resume);
      } else {
        res = await resumeApi.create(resume);
        setResumeId(res.data._id);
      }
      setLastSaved(new Date().toISOString());
    } catch {
      toast.error('Auto-save failed. Your progress is still in local storage.');
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, resume, setIsSaving, setLastSaved, setResumeId]);

  useEffect(() => {
    const timer = setTimeout(() => { if (isDirty) saveResume(); }, 2500);
    return () => clearTimeout(timer);
  }, [isDirty, saveResume]);

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!resume.id) { toast.error('Save your resume first'); return; }
    setIsExporting(true);
    try {
      const res = await resumeApi.export(resume.id, format);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed. Try again.'); }
    finally { setIsExporting(false); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">{resume.title || 'Resume Builder'}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
            {isSaving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-3 h-3 text-[#10B981]" /> Auto-saved</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              showPreview ? 'bg-[#00C896]/15 border-[#00C896]/40 text-[#00C896]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
          </button>
          <div className="flex gap-1">
            {(['pdf', 'docx'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm font-medium hover:border-[var(--border-strong)] transition-all disabled:opacity-60"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step indicator — scrollable on mobile */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {STEPS.map((step, i) => {
          const active = i === currentStep;
          const done = i < currentStep;
          return (
            <button
              key={step.label}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                active
                  ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30'
                  : done
                  ? 'text-[#10B981] bg-[#10B981]/10 border border-transparent'
                  : 'text-[var(--text-muted)] border border-transparent hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <step.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.short}</span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-2xl'}`}>
        {/* Form panel */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--border-default)]">
                <div className="w-9 h-9 rounded-xl bg-[#00C896]/15 flex items-center justify-center">
                  {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="w-5 h-5 text-[#00C896]" />; })()}
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">{STEPS[currentStep].label}</h2>
                  <p className="text-xs text-[var(--text-muted)]">Step {currentStep + 1} of {STEPS.length}</p>
                </div>
              </div>
              <StepComponent />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-[var(--border-default)]">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-sm font-medium disabled:opacity-40 hover:border-[var(--border-strong)] transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setStep(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentStep ? 'w-6 bg-[#00C896]' : i < currentStep ? 'bg-[#10B981]' : 'bg-[var(--border-strong)]'
                  }`}
                />
              ))}
            </div>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-[#00C896]/20"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={saveResume}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" /> Finish
              </button>
            )}
          </div>
        </div>

        {/* Live preview panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-[var(--border-default)] rounded-2xl overflow-hidden bg-white shadow-xl sticky top-6"
          >
            <div className="px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex items-center gap-2">
              <div className="flex gap-1.5">
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs text-[var(--text-muted)] ml-2">Live Preview</span>
            </div>
            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
              <LivePreview />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
