'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Sparkles, Target, Mail,
  Mic, Globe, Settings, LogOut, Zap, ChevronRight,
  BarChart3, Crown, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/resume/builder',   icon: FileText,         label: 'Resume Builder' },
  { href: '/resume/templates', icon: Sparkles,         label: 'Templates' },
  { href: '/ats',              icon: Target,           label: 'ATS Analyzer' },
  { href: '/cover-letter',     icon: Mail,             label: 'Cover Letters' },
  { href: '/interview-prep',   icon: Mic,              label: 'Interview Prep' },
  { href: '/job-match',        icon: BarChart3,        label: 'Job Matcher' },
  { href: '/portfolio',        icon: Globe,            label: 'Portfolio Sites' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border-default)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-display font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center shadow-md shadow-[#00C896]/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-gradient">ResumeAI</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                active
                  ? 'bg-[#00C896]/15 text-[#00C896]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-[#00C896]/12 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon className={`w-4 h-4 shrink-0 relative z-10 ${active ? 'text-[#00C896]' : ''}`} />
              <span className="relative z-10 flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 relative z-10 text-[#00C896]" />}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade banner */}
      {user?.plan === 'free' && (
  <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-[#F7B731]/15 to-[#F97316]/10 border border-[#F7B731]/25">
    <div className="flex items-center gap-2 mb-2">
      <Crown className="w-4 h-4 text-[#F7B731]" />
      <span className="text-xs font-bold">Go Pro</span>
    </div>
    <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
      Unlimited resumes, AI generations & all features unlocked.
    </p>
    <Link
      href="/upgrade"
      onClick={onClose}
      className="block text-center py-2 rounded-lg bg-gradient-to-r from-[#F7B731] to-[#F97316] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
    >
      Upgrade with Promo Code
    </Link>
  </div>
)}

      {/* User + settings */}
      <div className="border-t border-[var(--border-default)] p-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
        <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-[var(--bg-subtle)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-[var(--text-muted)] truncate">{user?.email}</div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            user?.plan === 'pro' ? 'bg-[#F7B731]/20 text-[#F7B731]' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
          }`}>
            {user?.plan?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-elevated)] h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[var(--bg-elevated)] border-r border-[var(--border-default)] z-50 flex flex-col lg:hidden overflow-y-auto"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
