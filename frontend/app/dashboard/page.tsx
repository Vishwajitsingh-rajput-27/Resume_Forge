'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FileText, Target, Download, Globe, Mail,
  Plus, ArrowRight, Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api-client';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DashboardResume {
  _id: string;
  title: string;
  templateId: string;
  atsScore?: number;
  updatedAt: string;
  status: string;
}

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
      className="h-full"
    >
      <Card className="h-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)] transition-colors hover:border-[var(--border-strong)]">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              Live
            </Badge>
          </div>
          <div className="font-display text-3xl font-extrabold">{value}</div>
          <div className="text-sm font-medium">{label}</div>
          <div className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickAction({ href, icon: Icon, label, desc, color }: {
  href: string; icon: React.ElementType; label: string; desc: string; color: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto justify-start rounded-xl border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 text-left hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
    >
      <Link href={href} className="group">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="block truncate text-xs font-normal text-[var(--text-muted)]">{desc}</span>
        </span>
        <ArrowRight className="h-4 w-4 text-[var(--text-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]" />
      </Link>
    </Button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: resumes = [] } = useQuery<DashboardResume[]>({
    queryKey: ['resumes'],
    queryFn: () => api.get<DashboardResume[]>('/resumes').then((r) => r.data),
  });

  const stats = [
    { icon: FileText, label: 'Resumes', value: resumes.length, sub: 'Create as many as you need', color: '#00C896' },
    { icon: Target,   label: 'Best ATS Score', value: resumes.length ? `${Math.max(...resumes.map((r) => r.atsScore || 0))}%` : '—', sub: 'Run ATS analyzer', color: '#6C63FF' },
    { icon: Download, label: 'Downloads', value: user?.usage?.downloadsCount || 0, sub: 'Total exports', color: '#F7B731' },
    { icon: Globe,    label: 'Portfolio Sites', value: user?.usage?.portfoliosCreated || 0, sub: 'Unlimited publishing', color: '#EC4899' },
  ];

  const atsChartData = resumes
    .filter((resume) => typeof resume.atsScore === 'number')
    .sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    )
    .slice(-6)
    .map((resume) => ({
      date: format(new Date(resume.updatedAt), 'MMM d'),
      score: resume.atsScore!,
    }));

  const recentActivity = resumes
    .slice(0, 4)
    .map((resume) => ({
      text: `${resume.title} updated`,
      time: new Date(resume.updatedAt),
    }));

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
          className="lg:col-span-2"
        >
          <Card className="h-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">ATS Score Trend</CardTitle>
                <CardDescription>Your resume quality over time</CardDescription>
              </div>
              <Badge variant="outline">{atsChartData.length} scored</Badge>
            </CardHeader>
            <CardContent>
              {atsChartData.length ? (
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
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 text-center">
                  <Target className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm font-medium">No ATS scores yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Analyze a saved resume to start a real trend.</p>
                  <Button asChild variant="link" size="sm">
                    <Link href="/ats">Open ATS analyzer</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-tight">{item.text}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(item.time, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {!recentActivity.length && (
                  <div className="rounded-xl border border-dashed bg-muted/30 p-5 text-center">
                    <FileText className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm font-medium">Your activity will appear here</p>
                    <p className="mt-1 text-xs text-muted-foreground">Create or edit a resume to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/resume/builder?new=1" icon={Plus}     label="New Resume"      desc="Start from scratch or template" color="#00C896" />
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
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/resume/builder?new=1">
                New <Plus className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.slice(0, 3).map((resume) => (
              <Link
                key={resume._id}
                href={`/resume/builder/${resume._id}`}
                className="group"
              >
                <Card className="h-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)] transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00C896]/15 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00C896]" />
                  </div>
                  {resume.atsScore !== undefined && (
                    <Badge
                      variant="outline"
                      className={
                        resume.atsScore >= 70
                          ? 'border-emerald-500/20 bg-emerald-500/15 text-emerald-500'
                          : resume.atsScore >= 50
                            ? 'border-amber-500/20 bg-amber-500/15 text-amber-500'
                            : 'border-red-500/20 bg-red-500/15 text-red-500'
                      }
                    >
                      ATS {resume.atsScore}%
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1 truncate">{resume.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {resume.templateId} template · updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={resume.status === 'complete' ? 'bg-emerald-500/15 text-emerald-500' : ''}
                  >
                    {resume.status}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)] ml-auto group-hover:text-[#00C896] transition-colors flex items-center gap-1">
                    Edit <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
