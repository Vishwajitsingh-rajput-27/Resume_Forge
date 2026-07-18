'use client';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useResumeStore, Education } from '@/store/resume-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <Card key={edu.id} className="overflow-hidden shadow-none">
          <div
            className="flex cursor-pointer items-center gap-3 bg-muted/50 px-4 py-3"
            onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
          >
            <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{edu.degree || `Education ${i + 1}`}</div>
              <div className="truncate text-xs text-muted-foreground">{edu.institution}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }}
              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove education"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
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
                  <Label htmlFor={`education-${edu.id}-${k}`} className="mb-1 block text-xs">{l}</Label>
                  <Input
                    id={`education-${edu.id}-${k}`}
                    value={(edu as unknown as Record<string, string>)[k] ?? ''}
                    onChange={(e) => updateEducation(edu.id, { [k]: e.target.value })}
                    placeholder={p}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => { const e = empty(); addEducation(e); setExpanded(e.id); }}
        className="h-12 w-full border-dashed text-muted-foreground hover:border-primary/40 hover:text-primary"
      >
        <Plus className="w-4 h-4" /> Add Education
      </Button>
    </div>
  );
}
