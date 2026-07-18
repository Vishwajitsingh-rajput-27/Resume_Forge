'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User, GraduationCap, Briefcase, FolderKanban, Wrench,
  Award, Trophy, Languages, Heart, Eye, Save, ChevronLeft, ChevronRight,
  Loader2, Sparkles, FileDown,
} from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';
import { resumeApi } from '@/lib/api-client';
import { exportToPDF, exportToDOCX } from '@/lib/frontend-export';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  const {
    currentStep,
    setStep,
    nextStep,
    prevStep,
    resume,
    isDirty,
    setIsSaving,
    setLastSaved,
    setResumeId,
    setStatus,
    isSaving,
  } = useResumeStore();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawRouteId = params?.id;
  const routeId = Array.isArray(rawRouteId) ? rawRouteId[0] : rawRouteId;
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const routeInitializedRef = useRef(false);
  const sessionResumeIdRef = useRef<string | null>(null);
  const saveInFlightRef = useRef(false);

  const StepComponent = STEP_COMPONENTS[currentStep];

  useEffect(() => {
    if (routeId) {
      routeInitializedRef.current = true;
      setRouteReady(true);
      return;
    }

    if (routeInitializedRef.current) return;

    const initializeBaseRoute = () => {
      if (routeInitializedRef.current) return;
      routeInitializedRef.current = true;

      const requestedNew =
        new URLSearchParams(window.location.search).get('new') === '1';
      const store = useResumeStore.getState();

      if (requestedNew) {
        store.resetResume();
        router.replace('/resume/builder', { scroll: false });
      } else if (store.resume.id) {
        // A server resume can only be edited from its ID-based URL.
        store.detachResume();
      }

      setRouteReady(true);
    };

    if (useResumeStore.persist.hasHydrated()) {
      initializeBaseRoute();
      return;
    }

    return useResumeStore.persist.onFinishHydration(initializeBaseRoute);
  }, [routeId, router]);

  // Auto-save
  const saveResume = useCallback(async (
    statusOverride?: 'draft' | 'complete',
  ): Promise<boolean> => {
    if (!routeReady || saveInFlightRef.current) return false;
    if (!isDirty && !statusOverride) return true;

    const hasMinimumProfile =
      resume.personalInfo.name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.personalInfo.email);

    // The local builder is always persisted by Zustand. Wait to create the
    // server-side draft until it has the two fields required to identify it.
    if (!hasMinimumProfile) {
      if (statusOverride === 'complete') {
        toast.error('Add your name and a valid email before finishing.');
        setStep(0);
        return false;
      }
      setLastSaved(new Date().toISOString());
      return true;
    }

    saveInFlightRef.current = true;
    setIsSaving(true);
    try {
      const status = statusOverride ?? resume.status ?? 'draft';
      const payload = { ...resume, id: undefined, status };
      const editableResumeId = routeId ?? sessionResumeIdRef.current;
      let res;
      if (editableResumeId) {
        res = await resumeApi.update(editableResumeId, payload);
      } else {
        res = await resumeApi.create(payload);
        const createdId = res.data._id as string;
        sessionResumeIdRef.current = createdId;
        setResumeId(createdId);

        // Once a new draft exists on the server, its URL becomes the source
        // of truth for all subsequent updates.
        if (statusOverride !== 'complete') {
          router.replace(`/resume/builder/${createdId}`);
        }
      }
      setStatus(status);
      setLastSaved(new Date().toISOString());
      return true;
    } catch {
      toast.error(
        statusOverride === 'complete'
          ? 'Could not finish your resume. Please try again.'
          : 'Auto-save failed. Your progress is still in local storage.',
      );
      return false;
    } finally {
      saveInFlightRef.current = false;
      setIsSaving(false);
    }
  }, [
    isDirty,
    resume,
    routeId,
    routeReady,
    router,
    setIsSaving,
    setLastSaved,
    setResumeId,
    setStatus,
    setStep,
  ]);

  useEffect(() => {
    if (!routeReady || !isDirty) return;
    const timer = setTimeout(() => { saveResume(); }, 2500);
    return () => clearTimeout(timer);
  }, [isDirty, routeReady, saveResume]);

  const finishResume = async () => {
    const finished = await saveResume('complete');
    if (!finished) return;

    await queryClient.invalidateQueries({ queryKey: ['resumes'] });
    toast.success('Resume finished and saved.');
    router.push('/dashboard');
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
  setIsExporting(true);
  try {
    if (format === 'pdf') {
      // Make sure preview is visible to capture it
      setShowPreview(true);
      await new Promise((r) => setTimeout(r, 300)); // wait for render
      await exportToPDF('resume-preview-content', resume.title || 'resume');
    } else {
      await exportToDOCX(resume as unknown as Record<string, unknown>, resume.title || 'resume');
    }
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  } catch {
    toast.error('Export failed. Please try again.');
  } finally {
    setIsExporting(false);
  }
};

  return (
    <div className="app-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">{resume.title || 'Resume Builder'}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
            ) : (
              <><Save className="h-3 w-3 text-primary" /> Auto-saved</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={showPreview ? 'secondary' : 'outline'}
            onClick={() => setShowPreview(!showPreview)}
            className={cn(showPreview && 'bg-primary/10 text-primary hover:bg-primary/15')}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
          </Button>
          <div className="flex gap-1">
            {(['pdf', 'docx'] as const).map((fmt) => (
              <Button
                type="button"
                variant="outline"
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={isExporting}
                className="px-3"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                {fmt.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Step indicator — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1.5 shadow-sm scrollbar-hide">
        {STEPS.map((step, i) => {
          const active = i === currentStep;
          const done = i < currentStep;
          return (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              key={step.label}
              onClick={() => setStep(i)}
              className={cn(
                'shrink-0 whitespace-nowrap text-xs',
                active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
                done && !active && 'text-primary',
                !done && !active && 'text-muted-foreground',
              )}
            >
              <step.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.short}</span>
            </Button>
          );
        })}
      </div>

      {/* Main content */}
      <div className={cn('grid gap-6', showPreview ? 'lg:grid-cols-2' : 'max-w-3xl lg:grid-cols-1')}>
        {/* Form panel */}
        <Card>
          <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 flex items-center gap-3 border-b pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="h-5 w-5" />; })()}
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">{STEPS[currentStep].label}</h2>
                  <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
                </div>
              </div>
              <StepComponent />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <button type="button" key={i} onClick={() => setStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full bg-border transition-all',
                    i === currentStep && 'w-6 bg-primary',
                    i < currentStep && 'bg-primary/60',
                  )}
                />
              ))}
            </div>
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={finishResume}
                disabled={isSaving || !routeReady}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Finish
              </Button>
            )}
          </div>
          </CardContent>
        </Card>

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
            <div id="resume-preview-content" className="overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
             <LivePreview />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
