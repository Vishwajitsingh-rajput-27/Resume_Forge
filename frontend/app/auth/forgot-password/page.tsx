'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, FileText, Loader2, Mail } from 'lucide-react';
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

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSentTo(email);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not send a reset email.'));
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
          {sentTo ? (
            <>
              <CardHeader className="items-center text-center">
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <CardTitle>Check your inbox</CardTitle>
                <CardDescription>
                  If an account exists for <strong>{sentTo}</strong>, a reset link is
                  on its way. It expires in 30 minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Check spam or promotions if the message does not arrive after a few minutes.
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Return to sign in</Link>
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setSentTo('')}>
                  Try another email
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader className="space-y-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <CardTitle className="text-2xl">Reset your password</CardTitle>
                <CardDescription>
                  Enter the email you use for ResumeForge and we will send a secure reset link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
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
                    Send reset link
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="justify-center border-t py-5">
                <Button asChild variant="ghost">
                  <Link href="/auth/login">
                    <ArrowLeft />
                    Back to sign in
                  </Link>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
