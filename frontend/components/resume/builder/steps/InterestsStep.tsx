'use client';
import { useState } from 'react';
import { Plus, X, Heart } from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';

const SUGGESTIONS = [
  'Open Source', 'Machine Learning', 'Hiking', 'Photography', 'Chess',
  'Reading', 'Gaming', 'Travel', 'Music', 'Blogging', 'Cooking',
  'Fitness', 'Volunteering', 'Podcasting', 'Drawing', 'Cycling',
];

export function InterestsStep() {
  const { resume, setInterests } = useResumeStore();
  const [input, setInput] = useState('');

  const add = (value: string) => {
    const val = value.trim();
    if (!val || resume.interests.includes(val)) return;
    setInterests([...resume.interests, val]);
    setInput('');
  };

  const remove = (interest: string) => {
    setInterests(resume.interests.filter((i) => i !== interest));
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--text-muted)]">
        Interests show personality and help break the ice in interviews. Keep it genuine.
      </p>

      {/* Current interests */}
      {resume.interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {resume.interests.map((interest) => (
            <span
              key={interest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00C896]/15 text-[#00C896] text-sm font-medium"
            >
              {interest}
              <button onClick={() => remove(interest)} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {resume.interests.length === 0 && (
        <div className="text-center py-6 text-[var(--text-muted)]">
          <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No interests added yet. Pick from suggestions below or type your own.</p>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
          placeholder="Type an interest and press Enter…"
          className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 placeholder:text-[var(--text-muted)]"
        />
        <button
          onClick={() => add(input)}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00C896]/20 text-[#00C896] text-sm font-medium hover:bg-[#00C896]/30 transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Quick suggestions — click to add:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !resume.interests.includes(s)).map((s) => (
            <button
              key={s}
              onClick={() => add(s)}
              className="px-3 py-1.5 rounded-full border border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:border-[#00C896]/40 hover:text-[#00C896] hover:bg-[#00C896]/10 transition-all"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
