'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy, Download, Loader2, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api, { aiApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  resumeId: z.string().min(1, 'Select a resume'),
  role: z.string().min(2, 'Job title is required').max(100, 'Keep the job title under 100 characters'),
  company: z.string().min(1, 'Company name is required').max(100, 'Keep the company name under 100 characters'),
  jobDescription: z.string()
    .min(30, 'Paste at least 30 characters from the job description')
    .max(3000, 'Keep the job description under 3,000 characters'),
});

type FormData = z.infer<typeof schema>;

export default function CoverLetterPage() {
  const { user } = useAuthStore();
  const [letter, setLetter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((response) => response.data),
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { resumeId: '', role: '', company: '', jobDescription: '' },
  });

  const selectedId = watch('resumeId');
  const selectedResume = resumes.find((resume: { _id: string }) => resume._id === selectedId);

  const onSubmit = async (data: FormData) => {
    setGenerating(true);
    try {
      const skills: string[] = selectedResume?.skills
        ?.flatMap((category: { skills: string[] }) => category.skills) || [];
      const experienceSummary: string = selectedResume?.experience
        ?.map((experience: { role: string; company: string }) => `${experience.role} at ${experience.company}`)
        .join(', ') || '';

      const { data: response } = await aiApi.coverLetter({
        name: user?.name || 'Applicant',
        role: data.role,
        company: data.company,
        skills: skills.slice(0, 10),
        experienceSummary,
        jobDescription: data.jobDescription,
      });

      setLetter(response.letter);
      toast.success('Cover letter generated!');
    } catch (error: unknown) {
      const requestError = error as {
        response?: {
          status?: number;
          data?: { error?: string; errors?: { msg: string }[] };
        };
      };
      const status = requestError.response?.status;
      const serverMessage =
        requestError.response?.data?.error ||
        requestError.response?.data?.errors?.[0]?.msg;

      if (!status) {
        toast.error('Cannot reach backend. Check Render dashboard — service may be sleeping. Wait 30s and retry.');
      } else if (status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (status === 400) {
        toast.error(`Missing field: ${serverMessage || 'check form inputs'}`);
      } else if (status === 403) {
        toast.error('Cover-letter generation is unavailable right now. Please try again later.');
      } else if (status === 503) {
        toast.error('AI API key missing. Add GROQ_API_KEY to Render environment variables.');
      } else if (status === 429) {
        toast.error('AI rate limit hit. Wait 1 minute and try again.');
      } else {
        toast.error(serverMessage || `Error ${status}. Check Render logs.`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'cover-letter.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Cover Letter Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-crafted, ATS-optimized cover letters in under 10 seconds.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover-resume">Resume to use</Label>
                <Controller
                  control={control}
                  name="resumeId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="cover-resume" aria-invalid={Boolean(errors.resumeId)}>
                        <SelectValue placeholder="Select resume…" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume: { _id: string; title: string }) => (
                          <SelectItem key={resume._id} value={resume._id}>{resume.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.resumeId && <p className="text-xs text-destructive">{errors.resumeId.message}</p>}
              </div>

              {[
                { name: 'role' as const, label: 'Job title', placeholder: 'Senior Frontend Engineer' },
                { name: 'company' as const, label: 'Company name', placeholder: 'Google' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={`cover-${field.name}`}>{field.label}</Label>
                  <Input
                    id={`cover-${field.name}`}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    maxLength={100}
                    aria-invalid={Boolean(errors[field.name])}
                  />
                  {errors[field.name] && (
                    <p className="text-xs text-destructive">{errors[field.name]?.message}</p>
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <Label htmlFor="cover-job-description">Job description</Label>
                  <span className="text-xs text-muted-foreground">Paste the relevant parts</span>
                </div>
                <Textarea
                  id="cover-job-description"
                  {...register('jobDescription')}
                  rows={8}
                  maxLength={3000}
                  placeholder="Paste the job description here. The AI will extract required skills and tailor the letter accordingly…"
                  aria-invalid={Boolean(errors.jobDescription)}
                />
                {errors.jobDescription && (
                  <p className="text-xs text-destructive">{errors.jobDescription.message}</p>
                )}
              </div>

              <Button type="submit" disabled={generating} className="w-full">
                {generating
                  ? <><Loader2 className="size-4 animate-spin" /> Generating…</>
                  : <><Sparkles className="size-4" /> Generate cover letter</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex min-h-[32rem] flex-col overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="size-4 text-muted-foreground" />
              Generated letter
            </CardTitle>
            {letter && (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={copy} aria-label="Copy cover letter">
                  {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={downloadTxt} aria-label="Download cover letter">
                  <Download className="size-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-1 flex-col p-5">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <Loader2 className="mb-3 size-8 animate-spin text-violet-500" />
                  <p className="text-sm">Writing your cover letter…</p>
                  <p className="mt-1 text-xs opacity-60">Powered by Groq / Gemini</p>
                </motion.div>
              ) : letter ? (
                <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                  <Textarea
                    value={letter}
                    onChange={(event) => setLetter(event.target.value)}
                    rows={18}
                    className="h-full resize-none border-0 px-0 leading-relaxed shadow-none focus-visible:ring-0"
                    aria-label="Generated cover letter"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-1 flex-col items-center justify-center py-16 text-muted-foreground"
                >
                  <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted">
                    <Sparkles className="size-6" />
                  </div>
                  <p className="text-center text-sm">
                    Fill in the form and click<br />
                    <strong>Generate cover letter</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
