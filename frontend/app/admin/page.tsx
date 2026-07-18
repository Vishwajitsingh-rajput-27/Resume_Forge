'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, FileText, Activity,
  Server, Zap, RefreshCw, Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api, { aiApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStats { users: number; resumes: number }
interface UserRow {
  _id: string; name: string; email: string;
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
    setPingResult(null);
    try {
      const result = await aiApi.ping();
      setPingResult(result.data);
    } catch {
      toast.error('AI provider health check failed.');
    } finally {
      setPinging(false);
    }
  };

  const trackedAiUses = (usersData?.users || []).reduce(
    (total, currentUser) => total + (currentUser.usage?.aiGenerations ?? 0),
    0
  );

  const statCards = [
    { icon: Users,    label: 'Total Users',    value: stats?.users ?? '—',    color: '#00C896' },
    { icon: FileText, label: 'Total Resumes',  value: stats?.resumes ?? '—',  color: '#6C63FF' },
    { icon: Zap,      label: 'Tracked AI Uses', value: usersLoading ? '—' : trackedAiUses, color: '#F7B731' },
    { icon: Activity, label: 'Access Model',    value: 'Free', color: '#EC4899' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Admin Panel</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Platform overview and user management.</p>
        </div>
        <Badge variant="destructive">
          ADMIN
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="h-full">
            <Card className="h-full rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <CardContent className="p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${s.color}18` }}>
                  <s.icon className="h-[18px] w-[18px]" style={{ color: s.color }} />
                </div>
                <div className="font-display text-3xl font-extrabold">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : s.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User table */}
        <Card className="overflow-hidden rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)] lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[var(--border-default)] px-5 py-4">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <CardDescription>{usersData?.total ?? 0} total</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    {['User', 'Role', 'Resumes', 'AI Uses', 'Joined'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[var(--text-muted)] px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(usersData?.users || []).slice(0, 10).map((u) => (
                    <tr key={u._id} className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-[#6C63FF] text-xs font-bold text-white">
                              {u.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs truncate max-w-32">{u.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] truncate max-w-32">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {u.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                        </Badge>
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
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="space-y-4">
          {/* AI Status */}
          <Card className="rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-[#F7B731]" /> AI Provider
              </CardTitle>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={ping} disabled={pinging} aria-label="Refresh AI provider status">
                <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>

            <CardContent className="px-5 pb-5">
            {pingResult ? (
              <Alert variant={pingResult.ok ? 'success' : 'destructive'}>
                <Activity />
                <AlertTitle>{pingResult.ok ? 'Operational' : 'Degraded'}</AlertTitle>
                <AlertDescription>
                  Provider: {pingResult.provider}<br />
                  Latency: {pingResult.latencyMs}ms
                </AlertDescription>
              </Alert>
            ) : (
              <Button type="button" variant="outline" onClick={ping} disabled={pinging} className="w-full border-dashed text-xs text-muted-foreground">
                {pinging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                Run Health Check
              </Button>
            )}
            </CardContent>
          </Card>

          {/* Infrastructure checks */}
          <Card className="rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <CardHeader className="p-5 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="w-4 h-4 text-[#6C63FF]" /> Infrastructure checks
              </CardTitle>
              <CardDescription>
                No live health probes are connected for these services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 px-5 pb-5">
              {['MongoDB Atlas', 'Cloudinary Storage', 'Email Service'].map((service) => (
                <div key={service} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[var(--text-secondary)]">{service}</span>
                  <Badge variant="secondary" className="shrink-0 font-medium">
                    Not monitored
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Infrastructure usage */}
          <Card className="rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <CardHeader className="p-5 pb-4">
              <CardTitle className="text-sm">Infrastructure Usage</CardTitle>
              <CardDescription>
                Provider usage metrics are not connected to ResumeForge.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center">
                <p className="text-sm font-medium">No usage data available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Check MongoDB and Cloudinary directly for current storage and quota usage.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
