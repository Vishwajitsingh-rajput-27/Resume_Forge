'use client';
import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import { useResumeStore, Experience } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const empty = (): Experience => ({
  id: uuid(), company: '', role: '', location: '',
  startDate: '', endDate: '', current: false, responsibilities: [''], technologies: [],
});

export function ExperienceStep() {
  const { resume, addExperience, updateExperience, removeExperience } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  const improveBullet = async (expId: string, bulletIdx: number) => {
    const exp = resume.experience.find((e) => e.id === expId);
    if (!exp) return;
    const text = exp.responsibilities[bulletIdx];
    if (!text.trim()) { toast.error('Write something first!'); return; }

    const key = `${expId}-${bulletIdx}`;
    setAiLoading((p) => ({ ...p, [key]: true }));
    try {
      const { data } = await aiApi.improveBullet(
        text,
        exp.role || resume.personalInfo.jobTitle || 'Professional',
      );
      const updated = [...exp.responsibilities];
      updated[bulletIdx] = data.improved;
      updateExperience(expId, { responsibilities: updated });
      toast.success('Bullet improved!');
    } catch {
      toast.error('AI failed. Check your API key.');
    } finally {
      setAiLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const addBullet = (expId: string) => {
    const exp = resume.experience.find((e) => e.id === expId)!;
    updateExperience(expId, { responsibilities: [...exp.responsibilities, ''] });
  };

  const removeBullet = (expId: string, idx: number) => {
    const exp = resume.experience.find((e) => e.id === expId)!;
    const updated = exp.responsibilities.filter((_, i) => i !== idx);
    updateExperience(expId, { responsibilities: updated.length ? updated : [''] });
  };

  const updateBullet = (expId: string, idx: number, value: string) => {
    const exp = resume.experience.find((e) => e.id === expId)!;
    const updated = [...exp.responsibilities];
    updated[idx] = value;
    updateExperience(expId, { responsibilities: updated });
  };

  return (
    <div className="space-y-4">
      {resume.experience.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          <p className="text-sm mb-4">No work experience added yet.</p>
          <p className="text-xs">Internships, part-time, freelance — all count!</p>
        </div>
      )}

      {resume.experience.map((exp, i) => (
        <Card key={exp.id} className="overflow-hidden shadow-none">
          {/* Header */}
          <div
            className="flex cursor-pointer items-center gap-3 bg-muted/50 px-4 py-3"
            onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
          >
            <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{exp.role || `Experience ${i + 1}`}</div>
              <div className="truncate text-xs text-muted-foreground">{exp.company}</div>
            </div>
            <Button type="button" variant="ghost" size="icon"
              onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove experience">
              <Trash2 />
            </Button>
            {expanded === exp.id ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
          </div>

          {/* Body */}
          {expanded === exp.id && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'company' as const, label: 'Company *', placeholder: 'Acme Corp' },
                  { key: 'role' as const,    label: 'Job Title *', placeholder: 'Software Engineer' },
                  { key: 'location' as const, label: 'Location', placeholder: 'Remote / NYC' },
                ].map((f) => (
                  <div key={f.key} className={f.key === 'location' ? '' : ''}>
                    <Label htmlFor={`experience-${exp.id}-${f.key}`} className="mb-1 block text-xs">
                      {f.label}
                    </Label>
                    <Input
                      id={`experience-${exp.id}-${f.key}`}
                      value={exp[f.key] as string}
                      onChange={(e) => updateExperience(exp.id, { [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div>
                  <Label htmlFor={`experience-${exp.id}-start`} className="mb-1 block text-xs">Start date</Label>
                  <Input id={`experience-${exp.id}-start`} type="month" value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`experience-${exp.id}-end`} className="mb-1 block text-xs">End date</Label>
                  <Input id={`experience-${exp.id}-end`} type="month" value={exp.endDate} disabled={exp.current}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                  />
                </div>
              </div>

              <Label className="flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: '' })}
                />
                Currently working here
              </Label>

              {/* Responsibilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Responsibilities & achievements</Label>
                  <span className="text-[10px] text-muted-foreground">Aim for 3–6 bullets</span>
                </div>
                <div className="space-y-2">
                  {exp.responsibilities.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <TextareaAutosize
                        value={bullet}
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                        minRows={2}
                        placeholder="Developed and deployed REST APIs that reduced response time by 35%…"
                        className="flex min-h-20 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => improveBullet(exp.id, bIdx)}
                          disabled={aiLoading[`${exp.id}-${bIdx}`]}
                          title="Improve with AI"
                          className="h-8 w-8 bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 hover:text-violet-600"
                        >
                          {aiLoading[`${exp.id}-${bIdx}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </Button>
                        {exp.responsibilities.length > 1 && (
                          <Button type="button" variant="ghost" size="icon"
                            onClick={() => removeBullet(exp.id, bIdx)}
                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Remove responsibility">
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="link" size="sm" onClick={() => addBullet(exp.id)}
                  className="mt-2 h-auto px-0 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add bullet
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => { const e = empty(); addExperience(e); setExpanded(e.id); }}
        className="h-12 w-full border-dashed text-muted-foreground hover:border-primary/40 hover:text-primary"
      >
        <Plus className="w-4 h-4" /> Add Work Experience
      </Button>
    </div>
  );
}
