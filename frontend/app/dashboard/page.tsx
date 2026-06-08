'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FileText, Target, Download, Globe, Mail, TrendingUp,
  Plus, ArrowRight, Sparkles, Clock, CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';

// ─── Mock chart data (replace with real API data) ─────────────────────────────
const atsChartData = [
  { date: 'Jan', score: 52 }, { date: 'Feb', score: 60 }, { date: 'Mar', score: 58 },
  { date: 'Apr', score: 68 }, { date: 'May', score: 74 }, { date: 'Jun', score: 81 },
];

// ─── Components ───────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5 hover:border-[var(--border-strong)] transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[#10B981]" /> +12%
        </span>
      </div>
      <div className="font-display font-extrabold text-3xl mb-0.5">{value}</div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>
    </motion.div>
  );
}

function QuickAction({ href, icon: Icon, label, desc, color }: {
  href: string; icon: React.ElementType; label: string; desc: string; color: string;
}) {
  return (
    <Link href={href}
      className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-[var(--text-muted)] truncate">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro' || user?.plan === 'enterprise';

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data),
  });

  const stats = [
    { icon: FileText, label: 'Resumes', value: resumes.length, sub: isPro ? 'Unlimited on Pro' : `${Math.max(0, 3 - resumes.length)} remaining on free`, color: '#00C896' },
    { icon: Target,   label: 'Best ATS Score', value: resumes.length ? `${Math.max(...resumes.map((r: { atsScore?: number }) => r.atsScore || 0))}%` : '—', sub: 'Run ATS analyzer', color: '#6C63FF' },
    { icon: Download, label: 'Downloads', value: user?.usage?.downloadsCount || 0, sub: 'Total exports', color: '#F7B731' },
    { icon: Globe,    label: 'Portfolio Sites', value: user?.usage?.portfoliosCreated || 0, sub: '1 free included', color: '#EC4899' },
  ];

  const recentActivity = [
    { icon: CheckCircle, text: 'Resume "Senior Dev" updated', time: new Date(Date.now() - 1000 * 60 * 30), color: '#00C896' },
    { icon: Sparkles,    text: 'AI improved 3 bullet points', time: new Date(Date.now() - 1000 * 60 * 90), color: '#6C63FF' },
    { icon: Mail,        text: 'Cover letter generated', time: new Date(Date.now() - 1000 * 60 * 180), color: '#EC4899' },
    { icon: Globe,       text: 'Portfolio published', time: new Date(Date.now() - 1000 * 60 * 60 * 5), color: '#F7B731' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-3xl">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Here's what's happening with your career profile.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.06} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-lg">ATS Score Trend</h2>
              <p className="text-sm text-[var(--text-muted)]">Your resume quality over time</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] font-medium">
              +29 pts this year
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={atsChartData}>
              <defs>
                <linearGradient id="atsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C896" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Area type="monotone" dataKey="score" stroke="#00C896" strokeWidth={2.5} fill="url(#atsGrad)" dot={{ fill: '#00C896', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6"
        >
          <h2 className="font-display font-bold text-lg mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}18` }}>
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight">{item.text}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(item.time, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/resume/builder" icon={Plus}     label="New Resume"      desc="Start from scratch or template" color="#00C896" />
          <QuickAction href="/ats"            icon={Target}   label="Analyze ATS"     desc="Score your latest resume" color="#6C63FF" />
          <QuickAction href="/cover-letter"   icon={Mail}     label="Cover Letter"    desc="AI-generated in 10 seconds" color="#EC4899" />
          <QuickAction href="/portfolio"      icon={Globe}    label="Portfolio Site"  desc="Publish from your resume" color="#F7B731" />
        </div>
      </motion.div>

      {/* Resumes list */}
      {resumes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Your Resumes</h2>
            <Link href="/resume/builder" className="text-sm text-[#00C896] hover:underline flex items-center gap-1">
              New <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.slice(0, 3).map((resume: { _id: string; title: string; templateId: string; atsScore?: number; updatedAt: string; status: string }) => (
              <Link
                key={resume._id}
                href={`/resume/builder/${resume._id}`}
                className="group p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#00C896]/50 hover:shadow-lg hover:shadow-[#00C896]/5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00C896]/15 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00C896]" />
                  </div>
                  {resume.atsScore !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      resume.atsScore >= 70 ? 'bg-[#10B981]/15 text-[#10B981]' :
                      resume.atsScore >= 50 ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                      'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}>
                      ATS {resume.atsScore}%
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1 truncate">{resume.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {resume.templateId} template · updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    resume.status === 'complete' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                  }`}>
                    {resume.status}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-auto group-hover:text-[#00C896] transition-colors flex items-center gap-1">
                    Edit <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
