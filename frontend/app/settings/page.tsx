'use client';
import { useState } from 'react';
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

const profileSchema = z.object({
  name:     z.string().min(2),
  phone:    z.string().optional(),
  address:  z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  github:   z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword:     z.string().min(8, 'Min 8 characters'),
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

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab]           = useState<TabId>('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw]           = useState(false);
  const [pingResult, setPingResult]       = useState<{ ok: boolean; provider: string; model: string; latencyMs: number } | null>(null);
  const [pinging, setPinging]             = useState(false);

  // ── Profile form ────────────────────────────────────────────────────────────
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: '', address: '', linkedin: '', github: '' },
  });

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
      await api.patch('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
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
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-[#00C896]/15 text-[#00C896]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab panels */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6"
          >
            {/* ── Profile ── */}
            {tab === 'profile' && (
              <div>
                <h2 className="font-semibold text-base mb-5">Personal Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[var(--border-default)]">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      user?.plan === 'pro' ? 'bg-[#F7B731]/20 text-[#F7B731]' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                    }`}>{user?.plan?.toUpperCase()} Plan</span>
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
                      <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                      <input {...profileForm.register(f.name)} placeholder={f.placeholder}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] placeholder:text-[var(--text-muted)]" />
                      {profileForm.formState.errors[f.name] && (
                        <p className="text-xs text-[var(--error)] mt-1">{profileForm.formState.errors[f.name]?.message}</p>
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity">
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
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
                      <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                      <input {...pwForm.register(f.name)} type="password" placeholder={f.placeholder}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] placeholder:text-[var(--text-muted)]" />
                      {pwForm.formState.errors[f.name] && (
                        <p className="text-xs text-[var(--error)] mt-1">{pwForm.formState.errors[f.name]?.message}</p>
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={savingPw}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity">
                    {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Update Password
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
                  <h3 className="font-semibold text-sm text-[var(--error)] mb-3">Danger Zone</h3>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--error)]/30 text-[var(--error)] text-sm font-medium hover:bg-[var(--error)]/10 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
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
                    { name: 'Groq', url: 'https://console.groq.com', models: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'], free: '14,400 req/day', color: '#F97316' },
                    { name: 'Gemini', url: 'https://aistudio.google.com', models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'], free: '1M tokens/day (Flash)', color: '#3B82F6' },
                  ].map((provider) => (
                    <div key={provider.name} className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{provider.name}</span>
                        <a href={provider.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                          Get free key <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-xs text-[#10B981] mb-2">✓ Free: {provider.free}</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[var(--bg-muted)] text-[var(--text-muted)]">{m}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={pingAI} disabled={pinging}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-default)] text-sm font-medium hover:border-[var(--border-strong)] transition-all disabled:opacity-60">
                  {pinging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Test Connection
                </button>

                {pingResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 p-3 rounded-xl border text-sm flex items-center gap-3 ${
                      pingResult.ok ? 'bg-[#10B981]/10 border-[#10B981]/20' : 'bg-[var(--error)]/10 border-[var(--error)]/20'
                    }`}>
                    {pingResult.ok
                      ? <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                      : <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0" />}
                    <span>
                      {pingResult.ok
                        ? `✓ ${pingResult.provider} (${pingResult.model}) — ${pingResult.latencyMs}ms`
                        : 'Connection failed. Check your API key in .env'}
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Notifications ── */}
            {tab === 'notifications' && (
              <div>
                <h2 className="font-semibold text-base mb-5">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Resume tips & suggestions', desc: 'Weekly AI tips to improve your resume', default: true },
                    { label: 'Job match alerts', desc: 'When new jobs match your profile', default: false },
                    { label: 'Product updates', desc: 'New features and improvements', default: true },
                    { label: 'Security alerts', desc: 'Login activity and account changes', default: true },
                  ].map((n) => (
                    <div key={n.label} className="flex items-center justify-between py-3 border-b border-[var(--border-default)] last:border-0">
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-xs text-[var(--text-muted)]">{n.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked={n.default} className="w-4 h-4 accent-[#00C896]" />
                    </div>
                  ))}
                </div>
                <button className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                  <Check className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
