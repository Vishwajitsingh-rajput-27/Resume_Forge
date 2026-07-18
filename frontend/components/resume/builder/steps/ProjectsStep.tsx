'use client';
import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import { useResumeStore, Project } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      const { data } = await aiApi.improveProject(
        proj.description,
        proj.technologies.join(', ') || 'Not specified',
      );
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
        <Card key={proj.id} className="overflow-hidden shadow-none">
          <div className="flex cursor-pointer items-center gap-3 bg-muted/50 px-4 py-3" onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{proj.name || `Project ${i + 1}`}</div>
              <div className="truncate text-xs text-muted-foreground">{proj.technologies.slice(0, 4).join(', ')}</div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeProject(proj.id); }} className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Remove project"><Trash2 /></Button>
            {expanded === proj.id ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
          </div>
          {expanded === proj.id && (
            <div className="p-4 space-y-3">
              <div><Label htmlFor={`project-${proj.id}-name`} className="mb-1 block text-xs">Project name *</Label><Input id={`project-${proj.id}-name`} value={proj.name} onChange={(e) => updateProject(proj.id, { name: e.target.value })} placeholder="E-commerce Platform" /></div>
              <div>
                <div className="flex justify-between mb-1"><label className="text-xs font-medium">Description *</label>
                  <Button type="button" variant="link" size="sm" onClick={() => improve(proj)} disabled={loading[proj.id]} className="h-auto px-0 text-xs text-violet-500">
                    {loading[proj.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI improve
                  </Button>
                </div>
                <TextareaAutosize value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} minRows={3} placeholder="Describe what it does, your role, and its impact…" className="flex min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Technologies</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {proj.technologies.map((t) => <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => updateProject(proj.id, { technologies: proj.technologies.filter((x) => x !== t) })}>{t} ×</Badge>)}
                </div>
                <div className="flex gap-2"><Input value={techInput[proj.id] || ''} onChange={(e) => setTechInput((p) => ({ ...p, [proj.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(proj.id); } }} placeholder="React, Node.js…" className="h-9 flex-1 text-xs" /><Button type="button" size="sm" variant="secondary" onClick={() => addTech(proj.id)}>Add</Button></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor={`project-${proj.id}-github`} className="mb-1 block text-xs">GitHub URL</Label><Input id={`project-${proj.id}-github`} value={proj.githubUrl} onChange={(e) => updateProject(proj.id, { githubUrl: e.target.value })} placeholder="github.com/…" className="text-xs" /></div>
                <div><Label htmlFor={`project-${proj.id}-live`} className="mb-1 block text-xs">Live URL</Label><Input id={`project-${proj.id}-live`} value={proj.liveUrl} onChange={(e) => updateProject(proj.id, { liveUrl: e.target.value })} placeholder="myproject.vercel.app" className="text-xs" /></div>
              </div>
            </div>
          )}
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => { const p = empty(); addProject(p); setExpanded(p.id); }} className="h-12 w-full border-dashed text-muted-foreground hover:border-primary/40 hover:text-primary"><Plus className="w-4 h-4" /> Add Project</Button>
    </div>
  );
}
