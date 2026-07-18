'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Eye, EyeOff, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useGoogleConfiguration } from '@/components/providers/GoogleProvider';
import { getApiErrorMessage } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.').max(128, 'Password is too long.'),
});

type FormData = z.infer<typeof schema>;

const getPostAuthDestination = () => {
  if (typeof window === 'undefined') return '/dashboard';
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//')
    ? next
    : '/dashboard';
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isConfigured: googleConfigured } = useGoogleConfiguration();
  const {
    login,
    loginWithGoogle,
    isAuthenticated,
    isLoading,
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated) router.replace(getPostAuthDestination());
  }, [isAuthenticated, router]);

  const onSubmit = async (data: FormData) => {
    setFormError('');
    try {
      await login(data.email, data.password);
      toast.success('Welcome back.');
      router.push(getPostAuthDestination());
    } catch (error) {
      const message = getApiErrorMessage(error, 'Invalid email or password.');
      setFormError(message);
      toast.error(message);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async ({ access_token: accessToken }) => {
      setGoogleLoading(true);
      setFormError('');
      try {
        await loginWithGoogle(accessToken);
        toast.success('Signed in with Google.');
        router.push(getPostAuthDestination());
      } catch (error) {
        const message = getApiErrorMessage(error, 'Google sign-in failed.');
        setFormError(message);
        toast.error(message);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      const message = 'Google sign-in was cancelled or could not start.';
      setFormError(message);
      setGoogleLoading(false);
      toast.error(message);
    },
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.14),_transparent_38%)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <FileText className="h-4 w-4" />
          </span>
          ResumeForge
        </Link>

        <Card className="border-border/80 shadow-2xl shadow-black/5">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to keep building stronger applications.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!googleConfigured || googleLoading || isLoading}
                onClick={() => handleGoogle()}
              >
                {googleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
                {googleLoading
                  ? 'Connecting to Google…'
                  : googleConfigured
                    ? 'Continue with Google'
                    : 'Google sign-in unavailable'}
              </Button>
              {!googleConfigured && (
                <p className="text-center text-xs text-muted-foreground">
                  Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
                </p>
              )}
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
                or email
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Button asChild variant="link" className="h-auto p-0 text-xs">
                    <Link href="/auth/forgot-password">Forgot password?</Link>
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    maxLength={128}
                    placeholder="Enter your password"
                    className="pr-11"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading || googleLoading}
              >
                {isLoading && <Loader2 className="animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t py-5 text-sm text-muted-foreground">
            New to ResumeForge?
            <Button asChild variant="link" className="px-2">
              <Link href="/auth/signup">Create a free account</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}
