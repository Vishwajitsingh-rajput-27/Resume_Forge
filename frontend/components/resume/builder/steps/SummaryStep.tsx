'use client';
import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Check } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
        role,
        style === 0 ? 'concise' : style === 2 ? 'detailed' : 'standard',
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
      <p className="text-sm leading-relaxed text-muted-foreground">
        A strong professional summary is the first thing recruiters read. Keep it to 2–4 sentences, skip "I", and include your key strength and target role.
      </p>

      {/* Style selector */}
      <div>
        <Label className="mb-2 block">Target length</Label>
        <div className="flex gap-2">
          {WORD_TARGETS.map((t, i) => (
            <Button
              type="button"
              variant="outline"
              key={t.label}
              onClick={() => setStyle(i)}
              className={cn(
                'h-auto flex-1 flex-col gap-0.5 py-2 text-xs',
                style === i && 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15',
              )}
            >
              <div>{t.label}</div>
              <div className="opacity-60 text-[10px]">{t.range}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="resume-summary">Summary</Label>
          <span className={cn('text-xs text-muted-foreground', wordCount > 120 && 'text-destructive')}>
            {wordCount} words
          </span>
        </div>
        <TextareaAutosize
          id="resume-summary"
          value={resume.summary}
          onChange={(e) => setSummary(e.target.value)}
          minRows={5}
          maxRows={10}
          placeholder="Results-driven Software Engineer with 5+ years building scalable web applications. Proven track record of reducing load times by 40% and shipping features used by 100K+ users. Passionate about clean code and developer experience."
          className="flex min-h-32 w-full resize-none rounded-lg border border-input bg-background px-3 py-3 text-sm leading-relaxed shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* AI button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAIGenerate}
        disabled={loading}
        className="h-11 w-full border-violet-500/30 bg-violet-500/10 text-violet-600 hover:bg-violet-500/15 hover:text-violet-700 dark:text-violet-300"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating with Groq / Gemini…</>
        ) : resume.summary ? (
          <><RefreshCw className="w-4 h-4" /> Re-generate with AI</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate with AI (free)</>
        )}
      </Button>

      {/* Tips */}
      <Card className="bg-muted/40 shadow-none">
        <CardContent className="p-4">
        <p className="text-xs font-semibold mb-2 text-[var(--text-secondary)]">✅ ATS Tips</p>
        <ul className="space-y-1.5">
          {[
            'Mirror exact keywords from the job description',
            'No first-person "I" — start with adjective or noun',
            'Include your #1 quantifiable achievement',
            'Mention target job title for semantic matching',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              {tip}
            </li>
          ))}
        </ul>
        </CardContent>
      </Card>
    </div>
  );
}
