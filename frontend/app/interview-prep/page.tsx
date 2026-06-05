'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, Loader2, ChevronDown, ChevronUp, Code, Users, Brain, Star } from 'lucide-react';
import { toast } from 'sonner';
import { aiApi } from '@/lib/api-client';

interface Question {
  type: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleAnswer: string;
}

const LEVELS = ['junior', 'mid', 'senior', 'lead', 'intern'] as const;

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  technical:     { icon: Code,   color: '#6C63FF', label: 'Technical' },
  behavioural:   { icon: Users,  color: '#F7B731', label: 'Behavioural' },
  situational:   { icon: Brain,  color: '#EC4899', label: 'Situational' },
  'role-specific': { icon: Star, color: '#00C896', label: 'Role-Specific' },
};

const difficultyColor = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };

function QuestionCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  const cfg = typeConfig[q.type] || typeConfig.technical;

  return (
    <motion.div layout className="border border-[var(--border-default)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-4 py-4 hover:bg-[var(--bg-subtle)] transition-colors text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${cfg.color}18` }}>
          <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${cfg.color}18`, color: cfg.color }}>{cfg.label}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${difficultyColor[q.difficulty]}18`, color: difficultyColor[q.difficulty] }}>
              {q.difficulty}
            </span>
          </div>
          <p className="text-sm font-medium leading-snug">{q.question}</p>
        </div>
        <div className="shrink-0 mt-1">
          {open ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-[var(--border-default)]">
            <div className="px-4 py-4 bg-[var(--bg-subtle)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">💡 Sample Answer Guide</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{q.sampleAnswer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InterviewPrepPage() {
  const [role, setRole]         = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills]     = useState<string[]>([]);
  const [level, setLevel]       = useState<typeof LEVELS[number]>('mid');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState<string>('all');

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) setSkills([...skills, val]);
    setSkillInput('');
  };

  const generate = async () => {
    if (!role.trim()) { toast.error('Enter a job role first'); return; }
    if (skills.length === 0) { toast.error('Add at least one skill'); return; }
    setLoading(true);
    setQuestions([]);
    try {
      const { data } = await aiApi.interviewQuestions(role, skills, level);
      setQuestions(data.questions);
      toast.success(`${data.questions.length} questions generated!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Generation failed. Check your AI API key.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? questions : questions.filter((q) => q.type === filter);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl">Interview Prep</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">AI-generated questions with sample STAR answers, tailored to your role.</p>
      </div>

      {/* Config card */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Job Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)}
              placeholder="Senior Frontend Engineer"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Experience Level</label>
            <div className="flex gap-1.5 flex-wrap">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`flex-1 py-2 px-2 rounded-xl border text-xs font-medium capitalize transition-all ${
                    level === l ? 'bg-[#00C896]/15 border-[#00C896]/40 text-[#00C896]' : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills input */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Key Skills</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {skills.map((s) => (
              <span key={s} onClick={() => setSkills(skills.filter((x) => x !== s))}
                className="px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] text-xs font-medium cursor-pointer hover:bg-[#EF4444]/15 hover:text-[#EF4444] transition-colors">
                {s} ×
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Type a skill and press Enter (e.g. React, System Design)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 placeholder:text-[var(--text-muted)]" />
            <button onClick={addSkill}
              className="px-4 py-2.5 rounded-xl bg-[#6C63FF]/20 text-[#6C63FF] text-sm font-medium hover:bg-[#6C63FF]/30 transition-colors">
              Add
            </button>
          </div>
        </div>

        <button onClick={generate} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-[#00C896]/20">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating 13 questions…</> : <><Sparkles className="w-4 h-4" /> Generate Interview Questions</>}
        </button>
      </div>

      {/* Questions */}
      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'technical', 'behavioural', 'situational', 'role-specific'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                    filter === f ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30' : 'bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                  }`}>
                  {f === 'all' ? `All (${questions.length})` : f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
              <Mic className="w-3.5 h-3.5" />
              Click any question to reveal the sample answer
            </div>

            <div className="space-y-2">
              {filtered.map((q, i) => <QuestionCard key={i} q={q} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
