'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Eye, EyeOff, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
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

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    loginWithGoogle,
    isAuthenticated,
    isLoading,
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
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
            <GoogleAuthButton
              action="sign-in"
              disabled={isLoading}
              onAttempt={() => setFormError('')}
              onCredential={loginWithGoogle}
              onAuthenticated={() => {
                toast.success('Signed in with Google.');
                router.push(getPostAuthDestination());
              }}
              onError={(message) => toast.error(message)}
            />

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
                disabled={isLoading}
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
