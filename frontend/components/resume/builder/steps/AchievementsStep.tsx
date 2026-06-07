'use client';
import { useState } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';

export function AchievementsStep() {
  const { resume, setAchievements } = useResumeStore();
  const [items, setItems] = useState<string[]>(
    resume.achievements.length ? resume.achievements : ['']
  );

  const update = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
    setAchievements(updated.filter(Boolean));
  };

  const add = () => setItems((prev) => [...prev, '']);

  const remove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    const final = updated.length ? updated : [''];
    setItems(final);
    setAchievements(final.filter(Boolean));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
        Awards, honours, competitions, publications, scholarships — anything that sets you apart.
      </p>

      {items.length === 0 && (
        <div className="text-center py-8 text-[var(--text-muted)]">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No achievements added yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00C896]/15 text-[#00C896] text-xs font-bold shrink-0 mt-2">
              {i + 1}
            </div>
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder="e.g. Winner of National Hackathon 2024, 1st out of 500 teams"
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40 placeholder:text-[var(--text-muted)]"
            />
            {items.length > 1 && (
              <button
                onClick={() => remove(i)}
                className="p-2 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-[var(--text-muted)] transition-colors mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border-default)] text-[var(--text-muted)] hover:border-[#00C896]/40 hover:text-[#00C896] text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4" /> Add Achievement
      </button>
    </div>
  );
}
