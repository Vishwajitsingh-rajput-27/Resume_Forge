'use client';
import { useState } from 'react';
import { Plus, Trash2, Sparkles, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { useResumeStore } from '@/store/resume-store';
import { aiApi } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
      <Card className="border-violet-500/20 bg-violet-500/5 shadow-none">
        <CardContent className="p-4">
        <p className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          AI Skill Recommender
        </p>
        <div className="flex gap-2">
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select your domain" />
            </SelectTrigger>
            <SelectContent>
              {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={getSuggestions}
            disabled={loading || !domain}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Suggest
          </Button>
        </div>
        </CardContent>
      </Card>

      {/* Skill categories */}
      {resume.skills.map((cat) => (
        <Card key={cat.id} className="shadow-none">
          <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Label htmlFor={`skill-category-${cat.id}`} className="sr-only">
              Category name
            </Label>
            <Input
              id={`skill-category-${cat.id}`}
              value={cat.category}
              onChange={(e) => updateSkillCategory(cat.id, { category: e.target.value })}
              placeholder="Category name"
              className="flex-1 font-medium"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSkillCategory(cat.id)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${cat.category}`}
            >
              <Trash2 />
            </Button>
          </div>

          {/* Skill chips */}
          <div className="flex flex-wrap gap-1.5">
            {cat.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1.5">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(cat.id, skill)}
                  className="rounded-full hover:text-destructive"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <Input
              value={newSkill[cat.id] || ''}
              onChange={(e) => setNewSkill((p) => ({ ...p, [cat.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(cat.id); } }}
              placeholder="Type a skill and press Enter…"
              className="h-9 flex-1 text-xs"
            />
            <Button type="button" size="sm" variant="secondary" onClick={() => addSkill(cat.id)}>
              Add
            </Button>
          </div>
          </CardContent>
        </Card>
      ))}

      {/* Add category */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DEFAULT_CATEGORIES.filter((c) => !resume.skills.find((s) => s.category === c)).map((cat) => (
          <Button type="button" variant="outline" key={cat}
            onClick={() => addSkillCategory({ id: uuid(), category: cat, skills: [] })}
            className="h-auto justify-start border-dashed py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
            <Plus className="w-3.5 h-3.5" /> {cat}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => addSkillCategory({ id: uuid(), category: 'Custom Category', skills: [] })}
          className="h-auto justify-start border-dashed py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">
          <Plus className="w-3.5 h-3.5" /> Custom…
        </Button>
      </div>
    </div>
  );
}
