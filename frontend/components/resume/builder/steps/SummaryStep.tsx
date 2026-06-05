'use client';
import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Check } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';

const WORD_TARGETS = [
  { label: 'Concise', range: '40–60 words', prompt: 'concise, impactful' },
  { label: 'Standard', range: '60–90 words', prompt: 'standard professional' },
  { label: 'Detailed', range: '90–120 words', prompt: 'detailed, comprehensive' },
];

export function SummaryStep() {
  const { resume, setSummary } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState(1);

  const wordCount = resume.summary?.split(/\s+/).filter(Boolean).length || 0;

  const handleAIGenerate = async () => {
    const role = resume.personalInfo.jobTitle || 'Professional';
    if (!resume.summary && !role) {
      toast.error('Add a job title first so AI knows what to write');
      return;
    }
    setLoading(true);
    try {
      const { data } = await aiApi.improveSummary(
        resume.summary || `${role} with relevant experience seeking new opportunities.`,
        role
      );
      setSummary(data.improved);
      toast.success('AI summary generated!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'AI generation failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
        A strong professional summary is the first thing recruiters read. Keep it to 2–4 sentences, skip "I", and include your key strength and target role.
      </p>

      {/* Style selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Target length</label>
        <div className="flex gap-2">
          {WORD_TARGETS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setStyle(i)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                style === i
                  ? 'bg-[#00C896]/15 border-[#00C896]/40 text-[#00C896]'
                  : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div>{t.label}</div>
              <div className="opacity-60 text-[10px]">{t.range}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">Summary</label>
          <span className={`text-xs ${wordCount > 120 ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}>
            {wordCount} words
          </span>
        </div>
        <TextareaAutosize
          value={resume.summary}
          onChange={(e) => setSummary(e.target.value)}
          minRows={5}
          maxRows={10}
          placeholder="Results-driven Software Engineer with 5+ years building scalable web applications. Proven track record of reducing load times by 40% and shipping features used by 100K+ users. Passionate about clean code and developer experience."
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm resize-none transition-all placeholder:text-[var(--text-muted)] leading-relaxed"
        />
      </div>

      {/* AI button */}
      <button
        onClick={handleAIGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#6C63FF]/40 bg-[#6C63FF]/10 text-[#6C63FF] font-medium text-sm hover:bg-[#6C63FF]/15 transition-all disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating with Groq / Gemini…</>
        ) : resume.summary ? (
          <><RefreshCw className="w-4 h-4" /> Re-generate with AI</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate with AI (free)</>
        )}
      </button>

      {/* Tips */}
      <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
        <p className="text-xs font-semibold mb-2 text-[var(--text-secondary)]">✅ ATS Tips</p>
        <ul className="space-y-1.5">
          {[
            'Mirror exact keywords from the job description',
            'No first-person "I" — start with adjective or noun',
            'Include your #1 quantifiable achievement',
            'Mention target job title for semantic matching',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
              <Check className="w-3 h-3 text-[#10B981] shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
