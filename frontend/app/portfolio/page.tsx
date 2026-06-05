'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Plus, ExternalLink, Copy, Loader2, Sparkles,
  Check, Trash2, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import api, { portfolioApi } from '@/lib/api-client';

interface Portfolio {
  _id: string;
  slug: string;
  title: string;
  isPublic: boolean;
  personalInfo: { name: string; jobTitle?: string };
  updatedAt: string;
}

function PortfolioCard({ portfolio, onTogglePublic, onDelete }:
  { portfolio: Portfolio; onTogglePublic: (id: string, pub: boolean) => void; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${portfolio.slug}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5 hover:border-[var(--border-strong)] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00C896]/20 to-[#6C63FF]/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-[#00C896]" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTogglePublic(portfolio._id, !portfolio.isPublic)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              portfolio.isPublic
                ? 'bg-[#10B981]/15 text-[#10B981]'
                : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
            }`}
          >
            {portfolio.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {portfolio.isPublic ? 'Live' : 'Hidden'}
          </button>
          <button onClick={() => onDelete(portfolio._id)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-sm mb-0.5 truncate">{portfolio.personalInfo?.name}</h3>
      <p className="text-xs text-[var(--text-muted)] mb-4 truncate">{portfolio.personalInfo?.jobTitle}</p>

      {/* URL row */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
        <span className="text-xs text-[var(--text-muted)] truncate flex-1 font-mono">
          /portfolio/{portfolio.slug}
        </span>
        <button onClick={copy} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <Link href={`/portfolio/${portfolio.slug}`} target="_blank"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#00C896]/15 text-[#00C896] text-xs font-medium hover:bg-[#00C896]/25 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> View Live
        </Link>
        <Link href={`/resume/builder/${portfolio._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[var(--border-default)] text-xs font-medium hover:border-[var(--border-strong)] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Update
        </Link>
      </div>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  // For demo, portfolios are resumes with isPublic=true
  const portfolios: Portfolio[] = (resumes as Portfolio[]).filter((r) => r.isPublic);

  const generate = async () => {
    if (!selectedResumeId) { toast.error('Select a resume first'); return; }
    setGenerating(true);
    try {
      const { data } = await portfolioApi.generate(selectedResumeId);
      toast.success('Portfolio published! 🎉', {
        description: `Live at: /portfolio/${data.slug}`,
        action: { label: 'View', onClick: () => window.open(`/portfolio/${data.slug}`, '_blank') },
      });
      qc.invalidateQueries({ queryKey: ['resumes'] });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to generate portfolio.');
    } finally {
      setGenerating(false);
    }
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    try {
      await api.put(`/resumes/${id}`, { isPublic });
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success(isPublic ? 'Portfolio is now live!' : 'Portfolio hidden');
    } catch { toast.error('Update failed'); }
  };

  const deletePortfolio = async (id: string) => {
    if (!confirm('Unpublish this portfolio?')) return;
    await togglePublic(id, false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Portfolio Sites</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Convert your resume into a public portfolio website in one click.
          </p>
        </div>
      </div>

      {/* Generate card */}
      <div className="bg-gradient-to-br from-[#00C896]/10 to-[#6C63FF]/10 border border-[#00C896]/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00C896]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Generate New Portfolio</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Creates a public URL like <code className="font-mono text-[#00C896]">resumeai.app/portfolio/your-name</code>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]"
          >
            <option value="">Select a resume to publish…</option>
            {(resumes as { _id: string; title: string }[]).map((r) => (
              <option key={r._id} value={r._id}>{r.title}</option>
            ))}
          </select>

          <button
            onClick={generate}
            disabled={generating || !selectedResumeId}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#00C896]/20 shrink-0"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
              : <><Globe className="w-4 h-4" /> Publish</>
            }
          </button>
        </div>

        <ul className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            '⚡ Instant deployment',
            '📱 Mobile responsive',
            '🌙 Dark mode included',
            '🔍 SEO optimized',
          ].map((f) => (
            <li key={f} className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Portfolio list */}
      {portfolios.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium mb-1">No portfolios published yet</p>
          <p className="text-xs">Select a resume above and click Publish to create your first portfolio.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Portfolios ({portfolios.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {portfolios.map((p) => (
                <PortfolioCard
                  key={p._id}
                  portfolio={p}
                  onTogglePublic={togglePublic}
                  onDelete={deletePortfolio}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
