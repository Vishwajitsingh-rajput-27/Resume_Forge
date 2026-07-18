'use client';
import { useState } from 'react';
import { Plus, X, Heart } from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <p className="text-sm text-muted-foreground">
        Interests show personality and help break the ice in interviews. Keep it genuine.
      </p>

      {/* Current interests */}
      {resume.interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {resume.interests.map((interest) => (
            <Badge
              key={interest}
              variant="secondary"
              className="gap-1.5 py-1.5"
            >
              {interest}
              <button type="button" onClick={() => remove(interest)} className="hover:text-destructive" aria-label={`Remove ${interest}`}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {resume.interests.length === 0 && (
        <div className="py-6 text-center text-muted-foreground">
          <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No interests added yet. Pick from suggestions below or type your own.</p>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
          placeholder="Type an interest and press Enter…"
          className="h-11 flex-1"
        />
        <Button
          type="button"
          onClick={() => add(input)}
          disabled={!input.trim()}
          className="h-11"
        >
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Suggestions */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Quick suggestions — click to add:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !resume.interests.includes(s)).map((s) => (
            <Button
              type="button"
              variant="outline"
              size="sm"
              key={s}
              onClick={() => add(s)}
              className="h-8 rounded-full text-xs"
            >
              + {s}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
