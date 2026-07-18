'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, FileText, KeyRound, Loader2 } from 'lucide-react';
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
import api, { getApiErrorMessage } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  password: z.string()
    .min(8, 'Use at least 8 characters.')
    .max(128, 'Use no more than 128 characters.')
    .regex(/[A-Z]/, 'Include at least one uppercase letter.')
    .regex(/[0-9]/, 'Include at least one number.'),
  confirmPassword: z.string(),
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { setTokens, refreshUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: FormData) => {
    if (!token) return;
    setSubmitting(true);
    setFormError('');
    try {
      const { data } = await api.post<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/reset-password', { token, password });
      setTokens(data.accessToken, data.refreshToken);
      await refreshUser();
      router.replace('/dashboard');
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Password reset failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.14),_transparent_38%)]" />
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </span>
          ResumeForge
        </Link>

        <Card className="shadow-2xl shadow-black/5">
          <CardHeader className="space-y-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </span>
            <CardTitle className="text-2xl">
              {token ? 'Choose a new password' : 'Reset link is incomplete'}
            </CardTitle>
            <CardDescription>
              {token
                ? 'Use a strong password you have not used for this account before.'
                : 'This URL does not include a reset token. Request a fresh link to continue.'}
            </CardDescription>
          </CardHeader>

          {token ? (
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">New password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  maxLength={128}
                      placeholder="8+ characters, uppercase, and number"
                      className="pr-11"
                      aria-invalid={Boolean(errors.password)}
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
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm new password
                  </label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  maxLength={128}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword.message}
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

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin" />}
                  Save new password
                </Button>
              </form>
            </CardContent>
          ) : (
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Request a new reset link</Link>
              </Button>
            </CardContent>
          )}

          <CardFooter className="justify-center border-t py-5">
            <Button asChild variant="link">
              <Link href="/auth/login">Return to sign in</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
