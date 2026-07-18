'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Mic,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/resume/builder?new=1', icon: FileText, label: 'Resume builder' },
  { href: '/resume/templates', icon: Sparkles, label: 'Templates' },
  { href: '/ats', icon: Target, label: 'ATS analyzer' },
  { href: '/cover-letter', icon: Mail, label: 'Cover letters' },
  { href: '/interview-prep', icon: Mic, label: 'Interview prep' },
  { href: '/job-match', icon: BarChart3, label: 'Job matcher' },
  { href: '/portfolio', icon: Globe, label: 'Portfolio sites' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <FileText className="h-4 w-4" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        ResumeForge
      </span>
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('You are signed out.');
    router.replace('/');
  };

  const content = (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center justify-between px-4">
        <Brand />
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close navigation"
          >
            <X />
          </Button>
        )}
      </div>

      <Separator />

      <nav aria-label="Workspace navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          const activePath = item.href.split('?')[0];
          const active =
            pathname === activePath || pathname.startsWith(`${activePath}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Everything included</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              Free
            </Badge>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Seven templates, AI tools, ATS checks, and exports.
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-1 p-3">
        <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground">
          <Link href="/settings" onClick={onClose}>
            <Settings />
            Settings
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut />
          Log out
        </Button>

        <div className="mt-2 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
          <Avatar className="h-9 w-9 border">
            {user?.avatar && <AvatarImage src={user.avatar} alt="" />}
            <AvatarFallback>
              {user?.name?.[0]?.toUpperCase() || 'R'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name || 'ResumeForge user'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-card lg:block">
        {content}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-card shadow-2xl lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
