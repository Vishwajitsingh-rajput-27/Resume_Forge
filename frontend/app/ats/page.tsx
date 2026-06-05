'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Target, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Zap, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import api from '@/lib/api-client';

interface ATSSection {
  name: string;
  score: number;
  weight: number;
  issues: string[];
  suggestions: string[];
}

interface ATSReport {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  sections: ATSSection[];
  keywords: { found: string[]; missing: string[]; density: number };
  priorityFixes: string[];
  strengths: string[];
  readabilityScore: number;
  formattingScore: number;
}

const gradeColor: Record<string, string> = {
  A: '#10B981', B: '#00C896', C: '#F59E0B', D: '#F97316', F: '#EF4444',
};

function ScoreRing({ score, size = 96, grade }: { score: number; size?: number; grade: string }) {
  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = gradeColor[grade] || '#00C896';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-extrabold text-2xl leading-none">{score}</div>
        <div className="text-xs font-bold mt-0.5" style={{ color }}>{grade}</div>
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: ATSSection }) {
  const [open, setOpen] = useState(false);
  const color = section.score >= 80 ? '#10B981' : section.score >= 55 ? '#F59E0B' : '#EF4444';

  return (
    <div className="border border-[var(--border-default)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-subtle)] transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{section.name}</span>
            <span className="text-xs font-bold ml-4 shrink-0" style={{ color }}>
              {section.score}/100
            </span>
          </div>
          <div className="mt-1.5 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${section.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-[var(--border-default)]">
            <div className="p-4 space-y-3">
              {section.issues.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--error)] mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Issues
                  </p>
                  <ul className="space-y-1">
                    {section.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="text-[var(--error)] shrink-0 mt-0.5">✗</span>{issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {section.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--brand-primary)] mb-1.5 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Suggestions
                  </p>
                  <ul className="space-y-1">
                    {section.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="text-[var(--brand-primary)] shrink-0 mt-0.5">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {section.issues.length === 0 && section.suggestions.length === 0 && (
                <p className="text-xs text-[#10B981] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> This section looks great!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ATSPage() {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [report, setReport] = useState<ATSReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  const analyze = async () => {
    if (!selectedResumeId) { toast.error('Select a resume first'); return; }
    setAnalyzing(true);
    try {
      const { data } = await api.get(`/ats/${selectedResumeId}`);
      setReport(data);
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl">ATS Analyzer</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Score your resume across 7 dimensions. No external API — built-in engine.
        </p>
      </div>

      {/* Resume selector */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6">
        <label className="block text-sm font-medium mb-3">Select a Resume to Analyze</label>
        {resumes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-muted)] mb-3">No resumes yet.</p>
            <Link href="/resume/builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00C896]/15 text-[#00C896] text-sm font-medium hover:bg-[#00C896]/25 transition-colors">
              Build your first resume <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex gap-3">
            <select
              value={selectedResumeId}
              onChange={(e) => { setSelectedResumeId(e.target.value); setReport(null); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]"
            >
              <option value="">Choose resume…</option>
              {resumes.map((r: { _id: string; title: string }) => (
                <option key={r._id} value={r._id}>{r.title}</option>
              ))}
            </select>
            <button
              onClick={analyze}
              disabled={analyzing || !selectedResumeId}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#00C896]/20"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {analyzing ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
        )}
      </div>

      {/* Report */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Score overview */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6">
              <div className="flex items-center gap-8">
                <ScoreRing score={report.totalScore} grade={report.grade} />
                <div className="flex-1">
                  <h2 className="font-display font-bold text-xl mb-1">
                    {report.totalScore >= 80 ? '🎉 ATS-Ready Resume!' :
                     report.totalScore >= 60 ? '👍 Good Foundation' :
                     report.totalScore >= 40 ? '⚠️ Needs Improvement' :
                     '🚨 Critical Issues Found'}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {report.totalScore >= 80
                      ? 'Your resume will pass most ATS filters. Focus on tailoring keywords per job.'
                      : 'Follow the priority fixes below to increase your interview callback rate.'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-center">
                      <div className="font-display font-bold text-lg text-[#10B981]">{report.readabilityScore}%</div>
                      <div className="text-xs text-[var(--text-muted)]">Readability</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-center">
                      <div className="font-display font-bold text-lg text-[#6C63FF]">{report.formattingScore}%</div>
                      <div className="text-xs text-[var(--text-muted)]">Formatting</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority fixes */}
            {report.priorityFixes.length > 0 && (
              <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-2xl p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-[#EF4444] mb-3">
                  <Zap className="w-4 h-4" /> Priority Fixes ({report.priorityFixes.length})
                </h3>
                <ul className="space-y-2">
                  {report.priorityFixes.map((fix, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {report.strengths.length > 0 && (
              <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-[#10B981] mb-3">
                  <CheckCircle className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-1">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-[#10B981]">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Section scores */}
            <div>
              <h3 className="font-display font-bold text-lg mb-3">Section Breakdown</h3>
              <div className="space-y-2">
                {report.sections.map((section) => (
                  <SectionCard key={section.name} section={section} />
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-4">Keyword Analysis
                <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">density: {report.keywords.density}%</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[#10B981] mb-2">✓ Found ({report.keywords.found.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.keywords.found.slice(0, 15).map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#F59E0B] mb-2">⚠ Missing ({report.keywords.missing.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.keywords.missing.slice(0, 10).map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] text-xs">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fix button */}
            <Link href={`/resume/builder/${selectedResumeId}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg">
              Fix Issues in Builder <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
