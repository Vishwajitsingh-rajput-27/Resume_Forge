'use client';
import { useState } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <p className="text-sm leading-relaxed text-muted-foreground">
        Awards, honours, competitions, publications, scholarships — anything that sets you apart.
      </p>

      {items.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No achievements added yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <Badge className="mt-2 h-6 w-6 shrink-0 justify-center rounded-full p-0">
              {i + 1}
            </Badge>
            <Input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder="e.g. Winner of National Hackathon 2024, 1st out of 500 teams"
              className="flex-1"
            />
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                className="mt-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove achievement"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="h-12 w-full border-dashed text-muted-foreground hover:border-primary/40 hover:text-primary"
      >
        <Plus className="w-4 h-4" /> Add Achievement
      </Button>
    </div>
  );
}
