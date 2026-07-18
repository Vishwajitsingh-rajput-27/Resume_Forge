import Link from 'next/link';
import { Activity, ArrowLeft, CheckCircle2, Database, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

type Health = {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  checks?: {
    database: boolean;
    ai: boolean;
    googleAuth: boolean;
    passwordResetEmail: boolean;
  };
};

async function getHealth(): Promise<Health | null> {
  try {
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL
      ?.replace(/\/api\/?$/, '')
      .replace(/\/$/, '');
    const response = await fetch(
      process.env.BACKEND_HEALTH_URL
        || (apiOrigin ? `${apiOrigin}/health` : 'http://127.0.0.1:5000/health'),
      { cache: 'no-store' },
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function BackendStatusPage() {
  const health = await getHealth();
  const online = health?.status === 'healthy';

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 text-slate-300 hover:bg-white/10 hover:text-white">
          <Link href="/">
            <ArrowLeft />
            Back to frontend
          </Link>
        </Button>

        <div className="mb-8 flex items-start justify-between gap-5">
          <div>
            <Badge className="mb-4 border border-white/10 bg-white/10 text-white hover:bg-white/10">
              Live API preview
            </Badge>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">ResumeForge backend</h1>
            <p className="mt-3 text-slate-400">Express + TypeScript API health and runtime details.</p>
          </div>
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${online ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500/20 text-rose-300'}`}>
            <Server className="h-6 w-6" />
          </div>
        </div>

        <Card className="border-white/10 bg-white/[0.06] text-white">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  API health
                </CardTitle>
                <CardDescription className="mt-2 text-slate-400">
                  Response from <code className="rounded bg-black/30 px-1.5 py-0.5 text-slate-300">GET /health</code>
                </CardDescription>
              </div>
              <Badge className={online ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-400' : 'bg-rose-500 text-white hover:bg-rose-500'}>
                {online ? 'Operational' : 'Offline'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {health ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Status', health.status],
                  ['Version', health.version],
                  ['Environment', health.environment],
                  ['Checked at', new Date(health.timestamp).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="mt-1 font-mono text-sm text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                The API health endpoint is not responding.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold">No paid feature gates</p>
              <p className="text-xs text-slate-500">Usage tracking never locks a product feature.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <Database className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-sm font-semibold">Configuration checks</p>
              <p className="text-xs text-slate-500">Non-sensitive readiness reported by the API.</p>
            </div>
          </div>
        </div>

        {health?.checks && (
          <Card className="mt-5 border-white/10 bg-white/[0.06] text-white">
            <CardHeader>
              <CardTitle className="text-base">Feature readiness</CardTitle>
              <CardDescription className="text-slate-400">
                Configuration is present; individual provider quotas can still affect requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                ['MongoDB persistence', health.checks.database],
                ['AI provider', health.checks.ai],
                ['Google sign-in', health.checks.googleAuth],
                ['Password-reset email', health.checks.passwordResetEmail],
              ].map(([label, ready]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
                  <span className="text-sm text-slate-300">{String(label)}</span>
                  <Badge className={ready ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-400' : 'bg-amber-400/15 text-amber-300 hover:bg-amber-400/15'}>
                    {ready ? 'Ready' : 'Needs config'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
