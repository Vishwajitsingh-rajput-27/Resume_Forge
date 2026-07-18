'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken, refreshUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistence = useAuthStore.persist;
    if (!persistence) {
      setHydrated(true);
      return;
    }
    const unsubscribe = persistence.onFinishHydration(() => setHydrated(true));
    setHydrated(persistence.hasHydrated());
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !accessToken) {
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/auth/login?next=${next}`);
      return;
    }
    void refreshUser();
  }, [accessToken, hydrated, isAuthenticated, pathname, refreshUser, router]);

  if (!hydrated || !isAuthenticated || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {!hydrated ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-display font-semibold">
              {!hydrated ? 'Opening your workspace' : 'Taking you to sign in'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ResumeForge keeps your work private to your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
