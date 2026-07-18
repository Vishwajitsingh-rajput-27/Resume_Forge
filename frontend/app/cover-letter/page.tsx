'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Mail, Sparkles, Loader2, Copy, Download, RefreshCw, Check } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import api, { aiApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  resumeId:       z.string().min(1, 'Select a resume'),
  role:           z.string().min(2, 'Job title is required'),
  company:        z.string().min(1, 'Company name is required'),
  jobDescription: z.string().min(30, 'Paste at least 30 characters from the job description'),
});
type FormData = z.infer<typeof schema>;

export default function CoverLetterPage() {
  const { user } = useAuthStore();
  const [letter, setLetter]     = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied]     = useState(false);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedId     = watch('resumeId');
  const selectedResume = resumes.find((r: { _id: string }) => r._id === selectedId);

  const onSubmit = async (data: FormData) => {
    setGenerating(true);
    try {
      // Safely extract skills — empty array is fine now
      const skills: string[] = selectedResume?.skills
        ?.flatMap((c: { skills: string[] }) => c.skills) || [];

      // Safely extract experience summary — empty string is fine now
      const experienceSummary: string = selectedResume?.experience
        ?.map((e: { role: string; company: string }) => `${e.role} at ${e.company}`)
        .join(', ') || '';

      const { data: res } = await aiApi.coverLetter({
        name:             user?.name || 'Applicant',
        role:             data.role,
        company:          data.company,
        skills:           skills.slice(0, 10),
        experienceSummary,
        jobDescription:   data.jobDescription,
      });

      setLetter(res.letter);
      toast.success('Cover letter generated!');
    } catch (err: unknown) {
      const e = err as {
        response?: {
          status?: number;
          data?: { error?: string; errors?: { msg: string }[] };
        };
        message?: string;
      };

      const status = e?.response?.status;
      const serverMsg =
        e?.response?.data?.error ||
        e?.response?.data?.errors?.[0]?.msg;

      if (!status) {
        // No response at all = network error or backend down
        toast.error('Cannot reach backend. Check Render dashboard — service may be sleeping. Wait 30s and retry.');
      } else if (status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (status === 400) {
        toast.error(`Missing field: ${serverMsg || 'check form inputs'}`);
      } else if (status === 403) {
        toast.error('Cover-letter generation is unavailable right now. Please try again later.');
      } else if (status === 503) {
        toast.error('AI API key missing. Add GROQ_API_KEY to Render environment variables.');
      } else if (status === 429) {
        toast.error('AI rate limit hit. Wait 1 minute and try again.');
      } else {
        toast.error(serverMsg || `Error ${status}. Check Render logs.`);
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
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cover-letter.txt';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl">Cover Letter Generator</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          AI-crafted, ATS-optimized cover letters in under 10 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Resume to use</label>
              <select
                {...register('resumeId')}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]"
              >
                <option value="">Select resume…</option>
                {resumes.map((r: { _id: string; title: string }) => (
                  <option key={r._id} value={r._id}>{r.title}</option>
                ))}
              </select>
              {errors.resumeId && <p className="text-xs text-[var(--error)] mt-1">{errors.resumeId.message}</p>}
            </div>

            {[
              { name: 'role'    as const, label: 'Job Title',    placeholder: 'Senior Frontend Engineer' },
              { name: 'company' as const, label: 'Company Name', placeholder: 'Google' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                <input
                  {...register(f.name)}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] placeholder:text-[var(--text-muted)]"
                />
                {errors[f.name] && <p className="text-xs text-[var(--error)] mt-1">{errors[f.name]?.message}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Job Description
                <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">paste the relevant parts</span>
              </label>
              <TextareaAutosize
                {...register('jobDescription')}
                minRows={6}
                maxRows={12}
                placeholder="Paste the job description here. The AI will extract required skills and tailor the letter accordingly…"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] resize-none placeholder:text-[var(--text-muted)]"
              />
              {errors.jobDescription && <p className="text-xs text-[var(--error)] mt-1">{errors.jobDescription.message}</p>}
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-[#00C896]/20"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>
              }
            </button>
          </form>
        </div>

        {/* Output */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-sm font-medium">Generated Letter</span>
            </div>
            {letter && (
              <div className="flex gap-2">
                <button onClick={copy} title="Copy"
                  className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={downloadTxt} title="Download"
                  className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto min-h-96">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full py-16 text-[var(--text-muted)]">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#6C63FF]" />
                  <p className="text-sm">Writing your cover letter…</p>
                  <p className="text-xs mt-1 opacity-60">Powered by Groq / Gemini</p>
                </motion.div>
              ) : letter ? (
                <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <TextareaAutosize
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    minRows={14}
                    className="w-full text-sm leading-relaxed bg-transparent focus:outline-none resize-none text-[var(--text-primary)]"
                  />
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full py-16 text-[var(--text-muted)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-center">
                    Fill in the form and click<br />
                    <strong>Generate Cover Letter</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
