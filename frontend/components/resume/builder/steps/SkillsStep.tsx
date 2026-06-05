'use client';
import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { useResumeStore, SkillCategory } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';

const DOMAINS = [
  'Web Development', 'Backend Development', 'Mobile Development', 'Data Science',
  'Machine Learning', 'DevOps / Cloud', 'Cyber Security', 'UI/UX Design',
  'Product Management', 'Digital Marketing', 'Game Development', 'Blockchain',
];

const DEFAULT_CATEGORIES = ['Technical Skills', 'Frameworks', 'Tools', 'Soft Skills', 'Languages'];

export function SkillsStep() {
  const { resume, addSkillCategory, updateSkillCategory, removeSkillCategory } = useResumeStore();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState<Record<string, string>>({});

  const getSuggestions = async () => {
    if (!domain) { toast.error('Select a domain first'); return; }
    setLoading(true);
    try {
      const { data } = await aiApi.skillSuggestions(domain);
      // Merge into existing or create new Technical Skills category
      const techCat = resume.skills.find((c) => c.category === 'Technical Skills');
      if (techCat) {
        const merged = [...new Set([...techCat.skills, ...data.skills])];
        updateSkillCategory(techCat.id, { skills: merged });
      } else {
        addSkillCategory({ id: uuid(), category: 'Technical Skills', skills: data.skills });
      }
      toast.success(`Added ${data.skills.length} skills for ${domain}!`);
    } catch { toast.error('AI suggestion failed. Try again.'); }
    finally { setLoading(false); }
  };

  const addSkill = (catId: string) => {
    const val = newSkill[catId]?.trim();
    if (!val) return;
    const cat = resume.skills.find((c) => c.id === catId)!;
    if (cat.skills.includes(val)) { toast.error('Skill already added'); return; }
    updateSkillCategory(catId, { skills: [...cat.skills, val] });
    setNewSkill((p) => ({ ...p, [catId]: '' }));
  };

  const removeSkill = (catId: string, skill: string) => {
    const cat = resume.skills.find((c) => c.id === catId)!;
    updateSkillCategory(catId, { skills: cat.skills.filter((s) => s !== skill) });
  };

  return (
    <div className="space-y-5">
      {/* AI suggestion panel */}
      <div className="p-4 rounded-xl bg-[#6C63FF]/10 border border-[#6C63FF]/20">
        <p className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#6C63FF]" />
          AI Skill Recommender
        </p>
        <div className="flex gap-2">
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#6C63FF]/40"
          >
            <option value="">Select your domain…</option>
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button
            onClick={getSuggestions}
            disabled={loading || !domain}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C63FF] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Suggest
          </button>
        </div>
      </div>

      {/* Skill categories */}
      {resume.skills.map((cat) => (
        <div key={cat.id} className="border border-[var(--border-default)] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={cat.category}
              onChange={(e) => updateSkillCategory(cat.id, { category: e.target.value })}
              placeholder="Category name"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#00C896]/40"
            />
            <button onClick={() => removeSkillCategory(cat.id)}
              className="p-1.5 rounded-lg hover:bg-[var(--error)]/15 hover:text-[var(--error)] text-[var(--text-muted)] transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Skill chips */}
          <div className="flex flex-wrap gap-1.5">
            {cat.skills.map((skill) => (
              <span key={skill}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C896]/15 text-[#00C896] text-xs font-medium">
                {skill}
                <button onClick={() => removeSkill(cat.id, skill)}
                  className="hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              value={newSkill[cat.id] || ''}
              onChange={(e) => setNewSkill((p) => ({ ...p, [cat.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(cat.id); } }}
              placeholder="Type a skill and press Enter…"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs focus:outline-none focus:ring-1 focus:ring-[#00C896]/40"
            />
            <button onClick={() => addSkill(cat.id)}
              className="px-3 py-1.5 rounded-lg bg-[#00C896]/20 text-[#00C896] text-xs font-medium hover:bg-[#00C896]/30 transition-colors">
              Add
            </button>
          </div>
        </div>
      ))}

      {/* Add category */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DEFAULT_CATEGORIES.filter((c) => !resume.skills.find((s) => s.category === c)).map((cat) => (
          <button key={cat}
            onClick={() => addSkillCategory({ id: uuid(), category: cat, skills: [] })}
            className="py-2 px-3 rounded-xl border border-dashed border-[var(--border-default)] text-xs text-[var(--text-muted)] hover:border-[#00C896]/40 hover:text-[#00C896] transition-all flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> {cat}
          </button>
        ))}
        <button
          onClick={() => addSkillCategory({ id: uuid(), category: 'Custom Category', skills: [] })}
          className="py-2 px-3 rounded-xl border border-dashed border-[var(--border-default)] text-xs text-[var(--text-muted)] hover:border-[#00C896]/40 hover:text-[#00C896] transition-all flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Custom…
        </button>
      </div>
    </div>
  );
}
