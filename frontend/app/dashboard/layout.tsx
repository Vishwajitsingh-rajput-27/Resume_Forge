'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';

const routeLabels: Array<[string, string]> = [
  ['/resume/templates', 'Templates'],
  ['/resume/builder', 'Resume builder'],
  ['/interview-prep', 'Interview prep'],
  ['/cover-letter', 'Cover letters'],
  ['/job-match', 'Job matcher'],
  ['/portfolio', 'Portfolio sites'],
  ['/settings', 'Settings'],
  ['/admin', 'Admin'],
  ['/ats', 'ATS analyzer'],
  ['/dashboard', 'Dashboard'],
];

function currentLabel(pathname: string) {
  return (
    routeLabels.find(([route]) => pathname.startsWith(route))?.[1] ||
    'Workspace'
  );
}

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              aria-label="Open navigation"
            >
              <Menu />
            </Button>
            <Separator orientation="vertical" className="h-6 lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {currentLabel(pathname)}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Build, tailor, and export without limits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden border-primary/25 bg-primary/5 text-primary sm:inline-flex">
              Free workspace
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle colour theme"
            >
              {mounted && theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            <Avatar className="h-9 w-9 border">
              {user?.avatar && <AvatarImage src={user.avatar} alt="" />}
              <AvatarFallback>
                {user?.name?.[0]?.toUpperCase() || 'R'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <WorkspaceShell>{children}</WorkspaceShell>
    </AuthGuard>
  );
}
