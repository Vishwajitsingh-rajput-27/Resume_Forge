'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useResumeStore } from '@/store/resume-store';

const PROFICIENCY = ['basic', 'conversational', 'professional', 'native'] as const;

export function LanguagesStep() {
  const { resume, addLanguage, removeLanguage } = useResumeStore();
  const [langInput, setLangInput] = useState('');
  const [proficiency, setProficiency] = useState<typeof PROFICIENCY[number]>('professional');

  const add = () => {
    const val = langInput.trim();
    if (!val) return;
    addLanguage({ id: uuid(), language: val, proficiency });
    setLangInput('');
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--text-muted)]">
        Add languages you speak. Multilingual candidates are highly valued.
      </p>

      {/* Add form */}
      <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Language</label>
            <input
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
              placeholder="e.g. Hindi, Spanish, Mandarin"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40 placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2">Proficiency Level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROFICIENCY.map((level) => (
              <button
                key={level}
                onClick={() => setProficiency(level)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                  proficiency === level
                    ? 'bg-[#00C896]/15 border-[#00C896]/40 text-[#00C896]'
                    : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={add}
          disabled={!langInput.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add Language
        </button>
      </div>

      {/* Language list */}
      {resume.languages.length > 0 && (
        <div className="space-y-2">
          {resume.languages.map((lang) => (
            <div
              key={lang.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{lang.language}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  lang.proficiency === 'native'       ? 'bg-[#00C896]/15 text-[#00C896]' :
                  lang.proficiency === 'professional' ? 'bg-[#6C63FF]/15 text-[#6C63FF]' :
                  lang.proficiency === 'conversational'? 'bg-[#F7B731]/15 text-[#F7B731]' :
                  'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                }`}>
                  {lang.proficiency}
                </span>
              </div>
              <button
                onClick={() => removeLanguage(lang.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-[var(--text-muted)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
