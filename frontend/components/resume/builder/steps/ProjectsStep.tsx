'use client';
import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import { useResumeStore, Project } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';

const empty = (): Project => ({ id: uuid(), name: '', description: '', technologies: [], githubUrl: '', liveUrl: '' });

export function ProjectsStep() {
  const { resume, addProject, updateProject, removeProject } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [techInput, setTechInput] = useState<Record<string, string>>({});

  const improve = async (proj: Project) => {
    if (!proj.description.trim()) { toast.error('Add a description first'); return; }
    setLoading((p) => ({ ...p, [proj.id]: true }));
    try {
      const { data } = await aiApi.improveProject(proj.description, proj.technologies.join(', '));
      updateProject(proj.id, { description: data.improved });
      toast.success('Description improved!');
    } catch { toast.error('AI failed. Try again.'); }
    finally { setLoading((p) => ({ ...p, [proj.id]: false })); }
  };

  const addTech = (projId: string) => {
    const val = techInput[projId]?.trim();
    if (!val) return;
    const proj = resume.projects.find((p) => p.id === projId)!;
    if (!proj.technologies.includes(val)) updateProject(projId, { technologies: [...proj.technologies, val] });
    setTechInput((p) => ({ ...p, [projId]: '' }));
  };

  return (
    <div className="space-y-4">
      {resume.projects.map((proj, i) => (
        <div key={proj.id} className="border border-[var(--border-default)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-subtle)] cursor-pointer" onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{proj.name || `Project ${i + 1}`}</div>
              <div className="text-xs text-[var(--text-muted)] truncate">{proj.technologies.slice(0, 4).join(', ')}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); removeProject(proj.id); }} className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-[var(--text-muted)]"><Trash2 className="w-3.5 h-3.5" /></button>
            {expanded === proj.id ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
          </div>
          {expanded === proj.id && (
            <div className="p-4 space-y-3">
              <div><label className="block text-xs font-medium mb-1">Project Name *</label><input value={proj.name} onChange={(e) => updateProject(proj.id, { name: e.target.value })} placeholder="E-commerce Platform" className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40" /></div>
              <div>
                <div className="flex justify-between mb-1"><label className="text-xs font-medium">Description *</label>
                  <button onClick={() => improve(proj)} disabled={loading[proj.id]} className="flex items-center gap-1 text-xs text-[#6C63FF] hover:underline disabled:opacity-50">
                    {loading[proj.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI improve
                  </button>
                </div>
                <TextareaAutosize value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} minRows={3} placeholder="Describe what it does, your role, and its impact…" className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Technologies</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {proj.technologies.map((t) => <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#00C896]/15 text-[#00C896] text-xs cursor-pointer" onClick={() => updateProject(proj.id, { technologies: proj.technologies.filter((x) => x !== t) })}>{t} ×</span>)}
                </div>
                <div className="flex gap-2"><input value={techInput[proj.id] || ''} onChange={(e) => setTechInput((p) => ({ ...p, [proj.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(proj.id); } }} placeholder="React, Node.js…" className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs focus:outline-none focus:ring-1 focus:ring-[#00C896]/40" /><button onClick={() => addTech(proj.id)} className="px-3 rounded-lg bg-[#00C896]/20 text-[#00C896] text-xs font-medium">Add</button></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1">GitHub URL</label><input value={proj.githubUrl} onChange={(e) => updateProject(proj.id, { githubUrl: e.target.value })} placeholder="github.com/…" className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs focus:outline-none focus:ring-1 focus:ring-[#00C896]/40" /></div>
                <div><label className="block text-xs font-medium mb-1">Live URL</label><input value={proj.liveUrl} onChange={(e) => updateProject(proj.id, { liveUrl: e.target.value })} placeholder="myproject.vercel.app" className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs focus:outline-none focus:ring-1 focus:ring-[#00C896]/40" /></div>
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={() => { const p = empty(); addProject(p); setExpanded(p.id); }} className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border-default)] text-[var(--text-muted)] hover:border-[#00C896]/40 hover:text-[#00C896] text-sm flex items-center justify-center gap-2 transition-all"><Plus className="w-4 h-4" /> Add Project</button>
    </div>
  );
}
