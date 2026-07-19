'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Check, Eye, EyeOff, FileText, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
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

export default function SignupPage() {
  const router = useRouter();
  const {
    register: createAccount,
    loginWithGoogle,
    isAuthenticated,
    isLoading,
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
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
                  <GoogleAuthButton
                    action="sign-up"
                    disabled={isLoading}
                    onAttempt={() => setFormError('')}
                    onCredential={loginWithGoogle}
                    onAuthenticated={() => {
                      toast.success('Your Google account is connected.');
                      router.push(getPostAuthDestination());
                    }}
                    onError={(message) => toast.error(message)}
                  />
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
                    disabled={isLoading}
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
