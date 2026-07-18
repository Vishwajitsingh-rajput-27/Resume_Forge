'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Check, Eye, EyeOff, FileText, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string()
    .min(8, 'Use at least 8 characters.')
    .max(128, 'Use no more than 128 characters.')
    .regex(/[A-Z]/, 'Include at least one uppercase letter.')
    .regex(/[0-9]/, 'Include at least one number.'),
  agree: z.boolean().refine(Boolean, 'Accept the Terms and Privacy Policy to continue.'),
});

type FormData = z.infer<typeof schema>;

const getPostAuthDestination = () => {
  if (typeof window === 'undefined') return '/dashboard';
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//')
    ? next
    : '/dashboard';
};

const perks = [
  'All seven resume templates',
  'Unlimited PDF and DOCX exports',
  'ATS, AI writing, and job matching',
  'No premium tier or credit card',
];

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

export default function SignupPage() {
  const router = useRouter();
  const { isConfigured: googleConfigured } = useGoogleConfiguration();
  const {
    register: createAccount,
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
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agree: false },
  });

  useEffect(() => {
    if (isAuthenticated) router.replace(getPostAuthDestination());
  }, [isAuthenticated, router]);

  const password = watch('password', '');
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  const onSubmit = async (data: FormData) => {
    setFormError('');
    try {
      await createAccount(data.name, data.email, data.password);
      toast.success('Your free account is ready.');
      router.push(getPostAuthDestination());
    } catch (error) {
      const message = getApiErrorMessage(error, 'Account creation failed.');
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
        toast.success('Your Google account is connected.');
        router.push(getPostAuthDestination());
      } catch (error) {
        const message = getApiErrorMessage(error, 'Google sign-up failed.');
        setFormError(message);
        toast.error(message);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      const message = 'Google sign-up was cancelled or could not start.';
      setFormError(message);
      setGoogleLoading(false);
      toast.error(message);
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden border-r bg-muted/30 p-12 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </span>
            ResumeForge
          </Link>

          <div className="max-w-md">
            <Badge variant="secondary" className="mb-5 gap-1.5">
              <Sparkles className="h-3 w-3" />
              Free from first draft to final export
            </Badge>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              Build the application your experience deserves.
            </h1>
            <p className="mt-4 text-muted-foreground">
              Every template and career tool is included. Your account simply keeps
              your work synced and secure.
            </p>
            <div className="mt-8 grid gap-3">
              {perks.map((perk) => (
                <Card key={perk} className="bg-background/70 shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{perk}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            You own your resume content. Export it whenever you want.
          </p>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.12),_transparent_36%)]" />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md"
          >
            <Link
              href="/"
              className="mb-7 flex items-center justify-center gap-2 font-display text-xl font-bold lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </span>
              ResumeForge
            </Link>

            <Card className="shadow-2xl shadow-black/5">
              <CardHeader>
                <CardTitle className="text-2xl">Create your free account</CardTitle>
                <CardDescription>
                  No card, trial, template locks, or watermarks.
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
                        : 'Google sign-up unavailable'}
                  </Button>
                  {!googleConfigured && (
                    <p className="text-center text-xs text-muted-foreground">
                      Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google sign-up.
                    </p>
                  )}
                  {googleConfigured && (
                    <p className="text-center text-xs text-muted-foreground">
                      By continuing with Google, you agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      .
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
                    <label htmlFor="name" className="text-sm font-medium">Full name</label>
                    <Input
                      id="name"
                      autoComplete="name"
                      placeholder="Jane Smith"
                      aria-invalid={Boolean(errors.name)}
                      {...register('name')}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@example.com"
                      aria-invalid={Boolean(errors.email)}
                      {...register('email')}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
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
                    {password && (
                      <div className="flex items-center gap-2" aria-label={`Password strength: ${strengthLabel}`}>
                        <div className="grid flex-1 grid-cols-4 gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <span
                              key={level}
                              className={`h-1 rounded-full ${
                                level <= strength ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                      <input
                        id="agree"
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                        {...register('agree')}
                      />
                      <label htmlFor="agree" className="text-xs leading-relaxed text-muted-foreground">
                        I agree to the{' '}
                        <Link href="/terms" className="font-medium text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="font-medium text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </label>
                    </div>
                    {errors.agree && <p className="text-xs text-destructive">{errors.agree.message}</p>}
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
                    Create free account
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="justify-center border-t py-5 text-sm text-muted-foreground">
                Already have an account?
                <Button asChild variant="link" className="px-2">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
