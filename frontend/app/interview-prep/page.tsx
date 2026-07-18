'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Code,
  Loader2,
  Mic,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { aiApi } from '@/lib/api-client';

interface Question {
  type: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleAnswer: string;
}

const LEVELS = ['junior', 'mid', 'senior', 'lead', 'intern'] as const;
const FILTERS = ['all', 'technical', 'behavioural', 'situational', 'role-specific'] as const;

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  technical: { icon: Code, color: '#6C63FF', label: 'Technical' },
  behavioural: { icon: Users, color: '#F7B731', label: 'Behavioural' },
  situational: { icon: Brain, color: '#EC4899', label: 'Situational' },
  'role-specific': { icon: Star, color: '#00C896', label: 'Role-Specific' },
};

const difficultyColor = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
};

function QuestionCard({ question }: { question: Question }) {
  const [open, setOpen] = useState(false);
  const config = typeConfig[question.type] || typeConfig.technical;

  return (
    <motion.div layout>
      <Card className="overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen((value) => !value)}
          className="h-auto w-full items-start justify-start rounded-none px-4 py-4 text-left"
        >
          <div
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${config.color}18` }}
          >
            <config.icon className="size-4" style={{ color: config.color }} />
          </div>
          <div className="min-w-0 flex-1 whitespace-normal">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                style={{ background: `${config.color}18`, color: config.color }}
              >
                {config.label}
              </Badge>
              <Badge
                variant="outline"
                className="capitalize"
                style={{
                  borderColor: `${difficultyColor[question.difficulty]}40`,
                  color: difficultyColor[question.difficulty],
                }}
              >
                {question.difficulty}
              </Badge>
            </div>
            <p className="text-sm font-medium leading-snug">{question.question}</p>
          </div>
          {open
            ? <ChevronUp className="mt-1 size-4 shrink-0 text-muted-foreground" />
            : <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground" />}
        </Button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <Separator />
              <CardContent className="bg-muted/50 px-4 py-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Sample answer guide</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{question.sampleAnswer}</p>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function InterviewPrepPage() {
  const [role, setRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('mid');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const addSkill = () => {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSkillInput('');
  };

  const generate = async () => {
    if (!role.trim()) {
      toast.error('Enter a job role first');
      return;
    }
    if (skills.length === 0) {
      toast.error('Add at least one skill');
      return;
    }

    setLoading(true);
    setQuestions([]);
    try {
      const { data } = await aiApi.interviewQuestions(role, skills, level);
      setQuestions(data.questions);
      toast.success(`${data.questions.length} questions generated!`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })
        .response?.data?.error;
      toast.error(message || 'Generation failed. Check your AI API key.');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions =
    filter === 'all' ? questions : questions.filter((question) => question.type === filter);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Interview Prep</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-generated questions with sample STAR answers, tailored to your role.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interview-role">Job role</Label>
              <Input
                id="interview-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Experience level</Label>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={level === option ? 'default' : 'outline'}
                    onClick={() => setLevel(option)}
                    className="flex-1 capitalize"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="interview-skill">Key skills</Label>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSkills(skills.filter((value) => value !== skill))}
                    className="h-7 rounded-full px-3 text-xs"
                    aria-label={`Remove ${skill}`}
                  >
                    {skill} <X className="size-3" />
                  </Button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="interview-skill"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill and press Enter"
              />
              <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
            </div>
          </div>

          <Button type="button" onClick={generate} disabled={loading} className="w-full">
            {loading
              ? <><Loader2 className="size-4 animate-spin" /> Generating 13 questions…</>
              : <><Sparkles className="size-4" /> Generate interview questions</>}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={filter === option ? 'default' : 'outline'}
                  onClick={() => setFilter(option)}
                  className="capitalize"
                >
                  {option === 'all' ? `All (${questions.length})` : option}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mic className="size-3.5" />
              Click any question to reveal the sample answer
            </div>

            <div className="space-y-2">
              {filteredQuestions.map((question, index) => (
                <QuestionCard key={index} question={question} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
