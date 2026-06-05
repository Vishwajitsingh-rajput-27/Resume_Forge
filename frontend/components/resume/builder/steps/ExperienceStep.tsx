'use client';
import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import { useResumeStore, Experience } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';

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
      const { data } = await aiApi.improveBullet(text, exp.role);
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
        <div className="text-center py-10 text-[var(--text-muted)]">
          <p className="text-sm mb-4">No work experience added yet.</p>
          <p className="text-xs">Internships, part-time, freelance — all count!</p>
        </div>
      )}

      {resume.experience.map((exp, i) => (
        <div key={exp.id} className="border border-[var(--border-default)] rounded-xl overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-subtle)] cursor-pointer"
            onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
          >
            <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{exp.role || `Experience ${i + 1}`}</div>
              <div className="text-xs text-[var(--text-muted)] truncate">{exp.company}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
              className="p-1.5 rounded-lg hover:bg-[var(--error)]/15 hover:text-[var(--error)] text-[var(--text-muted)] transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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
                    <label className="block text-xs font-medium mb-1">{f.label}</label>
                    <input
                      value={exp[f.key] as string}
                      onChange={(e) => updateExperience(exp.id, { [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40 focus:border-[#00C896]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1">Start Date</label>
                  <input type="month" value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">End Date</label>
                  <input type="month" value={exp.endDate} disabled={exp.current}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40 disabled:opacity-50" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: '' })}
                  className="accent-[#00C896]" />
                Currently working here
              </label>

              {/* Responsibilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium">Responsibilities & Achievements</label>
                  <span className="text-[10px] text-[var(--text-muted)]">Aim for 3–6 bullets</span>
                </div>
                <div className="space-y-2">
                  {exp.responsibilities.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <TextareaAutosize
                        value={bullet}
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                        minRows={2}
                        placeholder="Developed and deployed REST APIs that reduced response time by 35%…"
                        className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40 focus:border-[#00C896] resize-none"
                      />
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => improveBullet(exp.id, bIdx)}
                          disabled={aiLoading[`${exp.id}-${bIdx}`]}
                          title="Improve with AI"
                          className="p-1.5 rounded-lg bg-[#6C63FF]/15 text-[#6C63FF] hover:bg-[#6C63FF]/25 transition-colors disabled:opacity-50"
                        >
                          {aiLoading[`${exp.id}-${bIdx}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </button>
                        {exp.responsibilities.length > 1 && (
                          <button onClick={() => removeBullet(exp.id, bIdx)}
                            className="p-1.5 rounded-lg hover:bg-[var(--error)]/15 hover:text-[var(--error)] text-[var(--text-muted)] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => addBullet(exp.id)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-[#00C896] hover:underline">
                  <Plus className="w-3.5 h-3.5" /> Add bullet
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => { const e = empty(); addExperience(e); setExpanded(e.id); }}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border-default)] text-[var(--text-muted)] hover:border-[#00C896]/40 hover:text-[#00C896] text-sm font-medium transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Work Experience
      </button>
    </div>
  );
}
