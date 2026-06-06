'use client';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useResumeStore, Education } from '@/store/resume-store';

const empty = (): Education => ({
  id: uuid(), institution: '', degree: '', specialization: '',
  cgpa: '', percentage: '', startYear: '', endYear: '', current: false,
});

export function EducationStep() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {resume.education.map((edu, i) => (
        <div key={edu.id} className="border border-[var(--border-default)] rounded-xl overflow-hidden">
          <div
            className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-subtle)] cursor-pointer"
            onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
          >
            <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{edu.degree || `Education ${i + 1}`}</div>
              <div className="text-xs text-[var(--text-muted)] truncate">{edu.institution}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }}
              className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-[var(--text-muted)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {expanded === edu.id
              ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
              : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            }
          </div>

          {expanded === edu.id && (
            <div className="p-4 grid grid-cols-2 gap-3">
              {([ 
                ['institution', 'Institution *',   'MIT'],
                ['degree',      'Degree *',        'B.S. Computer Science'],
                ['specialization', 'Specialization', 'Artificial Intelligence'],
                ['cgpa',        'CGPA',            '3.8'],
                ['percentage',  'Percentage',      '92'],
                ['startYear',   'Start Year',      '2019'],
                ['endYear',     'End Year',        '2023'],
              ] as [string, string, string][]).map(([k, l, p]) => (
                <div key={k} className={k === 'institution' || k === 'degree' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium mb-1">{l}</label>
                  <input
                    value={(edu as unknown as Record<string, string>)[k] ?? ''}
                    onChange={(e) => updateEducation(edu.id, { [k]: e.target.value })}
                    placeholder={p}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => { const e = empty(); addEducation(e); setExpanded(e.id); }}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border-default)] text-[var(--text-muted)] hover:border-[#00C896]/40 hover:text-[#00C896] text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4" /> Add Education
      </button>
    </div>
  );
}
