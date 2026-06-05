'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, FileText, Crown, Activity, AlertTriangle,
  TrendingUp, Server, Zap, RefreshCw, Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api, { aiApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AdminStats { users: number; resumes: number; proUsers: number }
interface UserRow {
  _id: string; name: string; email: string; plan: string;
  role: string; createdAt: string; usage: { resumesCreated: number; aiGenerations: number };
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const [pingResult, setPingResult] = useState<{ ok: boolean; provider: string; latencyMs: number } | null>(null);
  const [pinging, setPinging]       = useState(false);

  // Guard: admin only
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
      toast.error('Admin access required');
    }
  }, [user, router]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
    enabled: user?.role === 'admin',
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: UserRow[]; total: number }>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
    enabled: user?.role === 'admin',
  });

  const ping = async () => {
    setPinging(true);
    const result = await aiApi.ping();
    setPingResult(result.data);
    setPinging(false);
  };

  const statCards = [
    { icon: Users,    label: 'Total Users',    value: stats?.users ?? '—',    color: '#00C896' },
    { icon: FileText, label: 'Total Resumes',  value: stats?.resumes ?? '—',  color: '#6C63FF' },
    { icon: Crown,    label: 'Pro Users',      value: stats?.proUsers ?? '—', color: '#F7B731' },
    { icon: TrendingUp, label: 'Conversion',   value: stats && stats.users > 0 ? `${Math.round((stats.proUsers / stats.users) * 100)}%` : '—', color: '#EC4899' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Admin Panel</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Platform overview and user management.</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-[var(--error)]/15 text-[var(--error)] text-xs font-bold border border-[var(--error)]/20">
          ADMIN
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon className="w-4.5 h-4.5" style={{ color: s.color }} />
            </div>
            <div className="font-display font-extrabold text-3xl">
              {statsLoading ? <div className="shimmer h-8 w-16 rounded" /> : s.value}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User table */}
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
            <h2 className="font-semibold">Recent Users</h2>
            <span className="text-xs text-[var(--text-muted)]">{usersData?.total ?? 0} total</span>
          </div>
          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    {['User', 'Plan', 'Resumes', 'AI Uses', 'Joined'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[var(--text-muted)] px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(usersData?.users || []).slice(0, 10).map((u) => (
                    <tr key={u._id} className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-xs truncate max-w-32">{u.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] truncate max-w-32">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.plan === 'pro' ? 'bg-[#F7B731]/20 text-[#F7B731]' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                        }`}>{u.plan.toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{u.usage?.resumesCreated ?? 0}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{u.usage?.aiGenerations ?? 0}</td>
                      <td className="px-5 py-3 text-xs text-[var(--text-muted)]">
                        {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-4">
          {/* AI Status */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F7B731]" /> AI Provider
              </h2>
              <button onClick={ping} disabled={pinging}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {pingResult ? (
              <div className={`p-3 rounded-xl border text-xs ${
                pingResult.ok ? 'bg-[#10B981]/10 border-[#10B981]/20' : 'bg-[var(--error)]/10 border-[var(--error)]/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className={`w-3.5 h-3.5 ${pingResult.ok ? 'text-[#10B981]' : 'text-[var(--error)]'}`} />
                  <span className="font-medium">{pingResult.ok ? 'Operational' : 'Degraded'}</span>
                </div>
                <p className="text-[var(--text-muted)]">Provider: {pingResult.provider}</p>
                <p className="text-[var(--text-muted)]">Latency: {pingResult.latencyMs}ms</p>
              </div>
            ) : (
              <button onClick={ping} disabled={pinging}
                className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border-default)] text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-center gap-2">
                {pinging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                Run Health Check
              </button>
            )}
          </div>

          {/* System checklist */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-[#6C63FF]" /> System Status
            </h2>
            <div className="space-y-2.5">
              {[
                { label: 'MongoDB Atlas',      ok: true },
                { label: 'Groq API',           ok: true },
                { label: 'Gemini API',         ok: true },
                { label: 'Cloudinary Storage', ok: true },
                { label: 'Email Service',      ok: false, warn: 'Configure SMTP' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                  {item.ok ? (
                    <span className="text-[#10B981] font-medium">● Operational</span>
                  ) : (
                    <span className="text-[#F59E0B] font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {item.warn}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Free tier usage */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4">Free Tier Usage</h2>
            {[
              { label: 'MongoDB (M0)', used: 48, total: 512, unit: 'MB' },
              { label: 'Cloudinary',   used: 0.8, total: 25, unit: 'GB' },
            ].map((item) => (
              <div key={item.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                  <span className="text-[var(--text-muted)]">{item.used}/{item.total} {item.unit}</span>
                </div>
                <div className="h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00C896] rounded-full" style={{ width: `${(item.used / item.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
