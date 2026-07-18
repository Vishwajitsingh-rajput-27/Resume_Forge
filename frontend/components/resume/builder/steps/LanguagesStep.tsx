'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useResumeStore } from '@/store/resume-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
      <p className="text-sm text-muted-foreground">
        Add languages you speak. Multilingual candidates are highly valued.
      </p>

      {/* Add form */}
      <Card className="bg-muted/30 shadow-none">
        <CardContent className="space-y-3 p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="language-name" className="mb-1 block text-xs">Language</Label>
            <Input
              id="language-name"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
              placeholder="e.g. Hindi, Spanish, Mandarin"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-xs">Proficiency level</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROFICIENCY.map((level) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                key={level}
                onClick={() => setProficiency(level)}
                className={cn(
                  'capitalize',
                  proficiency === level && 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15',
                )}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={add}
          disabled={!langInput.trim()}
          className="w-full"
        >
          <Plus className="w-4 h-4" /> Add Language
        </Button>
        </CardContent>
      </Card>

      {/* Language list */}
      {resume.languages.length > 0 && (
        <div className="space-y-2">
          {resume.languages.map((lang) => (
            <Card
              key={lang.id}
              className="flex items-center justify-between px-4 py-3 shadow-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{lang.language}</span>
                <Badge variant="secondary" className="capitalize">
                  {lang.proficiency}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLanguage(lang.id)}
                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${lang.language}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
