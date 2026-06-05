'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Sparkles, Loader2, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import Link from 'next/link';
import api, { aiApi } from '@/lib/api-client';

interface MatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordGaps: string[];
  suggestions: string[];
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Low Match';
  return (
    <div className="text-center py-6">
      <div className="relative inline-flex items-center justify-center">
        <svg width={140} height={140} className="-rotate-90">
          <circle cx={70} cy={70} r={58} fill="none" stroke="var(--bg-muted)" strokeWidth={10} />
          <circle cx={70} cy={70} r={58} fill="none" stroke={color} strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={364.4}
            strokeDashoffset={364.4 - (score / 100) * 364.4}
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute text-center">
          <div className="font-display font-extrabold text-4xl">{score}%</div>
          <div className="text-xs font-medium mt-0.5" style={{ color }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function JobMatchPage() {
  const [selectedId, setSelectedId] = useState('');
  const [jd, setJd]               = useState('');
  const [result, setResult]        = useState<MatchResult | null>(null);
  const [loading, setLoading]      = useState(false);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  const analyze = async () => {
    if (!selectedId) { toast.error('Select a resume'); return; }
    if (jd.trim().length < 50) { toast.error('Paste more of the job description'); return; }
    setLoading(true);
    setResult(null);
    try {
      // Build a plain-text resume summary to send to the AI
      const resume = resumes.find((r: { _id: string }) => r._id === selectedId);
      const skills = resume?.skills?.flatMap((c: { skills: string[] }) => c.skills).join(', ') || '';
      const exp = resume?.experience?.map((e: { role: string; company: string }) => `${e.role} at ${e.company}`).join('; ') || '';
      const resumeText = `Name: ${resume?.personalInfo?.name}\nRole: ${resume?.personalInfo?.jobTitle}\nSkills: ${skills}\nExperience: ${exp}\nSummary: ${resume?.summary || ''}`;

      const { data } = await aiApi.jobMatch(resumeText, jd);
      setResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Analysis failed. Check your AI API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-3xl">Job Match Engine</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Paste any job description — AI compares it to your resume and shows your match score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Resume</label>
              <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]">
                <option value="">Select resume…</option>
                {resumes.map((r: { _id: string; title: string }) => <option key={r._id} value={r._id}>{r.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Job Description
                <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">the more you paste, the better</span>
              </label>
              <TextareaAutosize
                value={jd} onChange={(e) => setJd(e.target.value)}
                minRows={10} maxRows={18}
                placeholder="Paste the full job description here…&#10;&#10;We are looking for a Senior React Engineer with 5+ years of experience…"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 resize-none placeholder:text-[var(--text-muted)]"
              />
            </div>
            <button onClick={analyze} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-[#00C896]/20">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><BarChart3 className="w-4 h-4" /> Analyze Match</>}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-8 flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
                <Loader2 className="w-10 h-10 animate-spin text-[#6C63FF] mb-4" />
                <p className="text-sm text-[var(--text-muted)]">AI is comparing your resume…</p>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
                <ScoreGauge score={result.matchScore} />

                <div className="px-5 pb-5 space-y-4">
                  {/* Matched skills */}
                  <div>
                    <p className="text-xs font-semibold text-[#10B981] mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Matched Skills ({result.matchedSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedSkills.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Missing skills */}
                  {result.missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#EF4444] mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing Skills ({result.missingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingSkills.map((s) => (
                          <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] text-xs font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keyword gaps */}
                  {result.keywordGaps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#F59E0B] mb-2">⚠ Keyword Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywordGaps.map((k) => (
                          <span key={k} className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] text-xs">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#6C63FF] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Recommendations
                      </p>
                      <ul className="space-y-1.5">
                        {result.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-[#6C63FF] shrink-0 mt-0.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link href={`/resume/builder/${selectedId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#00C896]/15 text-[#00C896] text-sm font-medium hover:bg-[#00C896]/25 transition-colors">
                    Improve Resume <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-8 flex flex-col items-center justify-center text-[var(--text-muted)]" style={{ minHeight: 400 }}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <p className="text-sm text-center">Select a resume and paste a<br />job description to see your match.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
