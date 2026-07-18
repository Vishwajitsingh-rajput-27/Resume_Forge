'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User, Lock, Zap, Shield, Bell, Trash2,
  Loader2, Check, AlertCircle, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import api, { aiApi } from '@/lib/api-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const profileSchema = z.object({
  name:     z.string().min(2),
  phone:    z.string().optional(),
  address:  z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  github:   z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string()
    .min(8, 'Min 8 characters')
    .max(128, 'Max 128 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

type ProfileData  = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

type TabId = 'profile' | 'security' | 'ai' | 'notifications';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'security',      label: 'Security',      icon: Lock },
  { id: 'ai',            label: 'AI Status',     icon: Zap },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const NOTIFICATION_OPTIONS = [
  { id: 'resumeTips', label: 'Resume tips & suggestions', desc: 'Local preference for future resume-tip messages', default: true },
  { id: 'jobMatches', label: 'Job match alerts', desc: 'Local preference for future job-match messages', default: false },
  { id: 'productUpdates', label: 'Product updates', desc: 'Local preference for future product-update messages', default: true },
  { id: 'securityAlerts', label: 'Security alerts', desc: 'Local preference for future security messages', default: true },
] as const;

type NotificationId = (typeof NOTIFICATION_OPTIONS)[number]['id'];
type NotificationPreferences = Record<NotificationId, boolean>;

const DEFAULT_NOTIFICATIONS = Object.fromEntries(
  NOTIFICATION_OPTIONS.map((option) => [option.id, option.default]),
) as NotificationPreferences;

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, setTokens, clearSession } = useAuthStore();
  const [tab, setTab]           = useState<TabId>('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw]           = useState(false);
  const [pingResult, setPingResult]       = useState<{ ok: boolean; provider: string; model: string; latencyMs: number } | null>(null);
  const [pinging, setPinging]             = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const notificationStorageKey = `resumeforge-notifications:${user?.id || 'current'}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(notificationStorageKey);
      if (stored) {
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...JSON.parse(stored) });
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } catch {
      // Keep safe defaults when browser storage is unavailable or malformed.
    }
  }, [notificationStorageKey]);

  // ── Profile form ────────────────────────────────────────────────────────────
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      linkedin: user?.linkedin || '',
      github: user?.github || '',
    },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
    });
  }, [profileForm, user]);

  const saveProfile = async (data: ProfileData) => {
    setSavingProfile(true);
    try {
      const { data: res } = await api.patch('/auth/profile', data);
      updateUser(res.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSavingProfile(false); }
  };

  // ── Password form ────────────────────────────────────────────────────────────
  const pwForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const savePassword = async (data: PasswordData) => {
    setSavingPw(true);
    try {
      const { data: session } = await api.patch('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (session.accessToken && session.refreshToken) {
        setTokens(session.accessToken, session.refreshToken);
      }
      toast.success('Password changed!');
      pwForm.reset();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Password change failed');
    } finally { setSavingPw(false); }
  };

  // ── AI ping ─────────────────────────────────────────────────────────────────
  const pingAI = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const { data } = await aiApi.ping();
      setPingResult(data);
    } catch { toast.error('AI provider unreachable'); }
    finally { setPinging(false); }
  };

  const saveNotifications = () => {
    try {
      localStorage.setItem(notificationStorageKey, JSON.stringify(notifications));
      toast.success('Preferences saved on this device.');
    } catch {
      toast.error('This browser could not save your preferences.');
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      clearSession();
      toast.success('Your account and saved data were deleted.');
      router.replace('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(message || 'Could not delete the account.');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">Manage your account and preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <nav className="w-44 shrink-0 space-y-0.5">
          {TABS.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant={tab === t.id ? 'secondary' : 'ghost'}
              onClick={() => setTab(t.id)}
              className={`w-full justify-start gap-3 rounded-xl ${
                tab === t.id ? 'bg-primary/15 text-primary hover:bg-primary/20' : 'text-[var(--text-secondary)]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </Button>
          ))}
        </nav>

        {/* Tab panels */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="rounded-2xl border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <CardContent className="p-6">
            {/* ── Profile ── */}
            {tab === 'profile' && (
              <div>
                <h2 className="font-semibold text-base mb-5">Personal Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[var(--border-default)]">
                  <Avatar className="h-16 w-16 rounded-2xl shadow-lg">
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-[#6C63FF] text-2xl font-bold text-white">
                      {user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
                    <Badge className="mt-1 bg-primary/15 text-primary hover:bg-primary/15">
                      Free &amp; open
                    </Badge>
                  </div>
                </div>

                <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
                  {[
                    { name: 'name' as const,     label: 'Full Name',    placeholder: 'Jane Smith' },
                    { name: 'phone' as const,    label: 'Phone',        placeholder: '+1 555 000 0000' },
                    { name: 'address' as const,  label: 'Location',     placeholder: 'San Francisco, CA' },
                    { name: 'linkedin' as const, label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                    { name: 'github' as const,   label: 'GitHub URL',   placeholder: 'https://github.com/...' },
                  ].map((f) => (
                    <div key={f.name}>
                      <Label htmlFor={`profile-${f.name}`} className="mb-1.5 block">{f.label}</Label>
                      <Input
                        id={`profile-${f.name}`}
                        {...profileForm.register(f.name)}
                        placeholder={f.placeholder}
                        aria-invalid={Boolean(profileForm.formState.errors[f.name])}
                      />
                      {profileForm.formState.errors[f.name] && (
                        <p className="text-xs text-[var(--error)] mt-1">{profileForm.formState.errors[f.name]?.message}</p>
                      )}
                    </div>
                  ))}
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </form>
              </div>
            )}

            {/* ── Security ── */}
            {tab === 'security' && (
              <div>
                <h2 className="font-semibold text-base mb-5">Change Password</h2>
                <form onSubmit={pwForm.handleSubmit(savePassword)} className="space-y-4">
                  {[
                    { name: 'currentPassword' as const, label: 'Current Password', placeholder: '••••••••' },
                    { name: 'newPassword' as const,     label: 'New Password',     placeholder: 'Min 8 characters' },
                    { name: 'confirmPassword' as const, label: 'Confirm Password', placeholder: 'Repeat new password' },
                  ].map((f) => (
                    <div key={f.name}>
                      <Label htmlFor={`password-${f.name}`} className="mb-1.5 block">{f.label}</Label>
                      <Input
                        id={`password-${f.name}`}
                        {...pwForm.register(f.name)}
                        type="password"
                        maxLength={128}
                        placeholder={f.placeholder}
                        aria-invalid={Boolean(pwForm.formState.errors[f.name])}
                      />
                      {pwForm.formState.errors[f.name] && (
                        <p className="text-xs text-[var(--error)] mt-1">{pwForm.formState.errors[f.name]?.message}</p>
                      )}
                    </div>
                  ))}
                  <Button type="submit" disabled={savingPw}>
                    {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Update Password
                  </Button>
                </form>

                <Separator className="mb-6 mt-8" />
                <div>
                  <h3 className="font-semibold text-sm text-[var(--error)] mb-3">Danger Zone</h3>
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" /> Delete account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete your ResumeForge account?</DialogTitle>
                        <DialogDescription>
                          This permanently deletes your account and every saved resume. Export anything you need first.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                          Keep account
                        </Button>
                        <Button type="button" variant="destructive" onClick={deleteAccount} disabled={deleting}>
                          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                          Delete permanently
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {/* ── AI Status ── */}
            {tab === 'ai' && (
              <div>
                <h2 className="font-semibold text-base mb-2">AI Provider Status</h2>
                <p className="text-sm text-[var(--text-muted)] mb-5">
                  Current provider: <code className="font-mono text-[#00C896]">
                    {process.env.NEXT_PUBLIC_AI_PROVIDER || 'GROQ_FALLBACK'}
                  </code>
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { name: 'Groq', url: 'https://console.groq.com', models: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b'], free: 'Free-tier quotas vary', color: '#F97316' },
                    { name: 'Gemini', url: 'https://aistudio.google.com', models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'], free: 'Free-tier quotas vary', color: '#3B82F6' },
                  ].map((provider) => (
                    <Card key={provider.name} className="rounded-xl border-[var(--border-default)] bg-[var(--bg-subtle)] shadow-none">
                      <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-2">
                        <CardTitle className="text-sm">{provider.name}</CardTitle>
                        <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                          <a href={provider.url} target="_blank" rel="noopener noreferrer">
                            Get free key <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                      <p className="text-xs text-[#10B981] mb-2">✓ Free: {provider.free}</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map((m) => (
                          <Badge key={m} variant="secondary" className="font-mono text-[9px] font-normal">{m}</Badge>
                        ))}
                      </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button type="button" variant="outline" onClick={pingAI} disabled={pinging}>
                  {pinging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Test Connection
                </Button>

                {pingResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3">
                    <Alert variant={pingResult.ok ? 'success' : 'destructive'}>
                    {pingResult.ok
                      ? <Check />
                      : <AlertCircle />}
                    <AlertDescription>
                      {pingResult.ok
                        ? `✓ ${pingResult.provider} (${pingResult.model}) — ${pingResult.latencyMs}ms`
                        : 'Connection failed. Check your API key in .env'}
                    </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Notifications ── */}
            {tab === 'notifications' && (
              <div>
                <h2 className="mb-3 text-base font-semibold">On-device preferences</h2>
                <Alert className="mb-5">
                  <Bell />
                  <AlertDescription>
                    These switches are stored only in this browser. They do not subscribe you to email,
                    push, or in-app notifications yet.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  {NOTIFICATION_OPTIONS.map((n) => (
                    <div key={n.label} className="flex items-center justify-between py-3 border-b border-[var(--border-default)] last:border-0">
                      <div>
                        <Label htmlFor={`notification-${n.id}`}>{n.label}</Label>
                        <p className="text-xs text-[var(--text-muted)]">{n.desc}</p>
                      </div>
                      <Checkbox
                        id={`notification-${n.id}`}
                        checked={notifications[n.id]}
                        onChange={(event) =>
                          setNotifications((current) => ({
                            ...current,
                            [n.id]: event.target.checked,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button type="button" className="mt-5" onClick={saveNotifications}>
                  <Check className="w-4 h-4" /> Save on this device
                </Button>
              </div>
            )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
