'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Loader2, Check, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number'),
  agree: z.boolean().refine((v) => v, 'You must accept the terms'),
});
type FormData = z.infer<typeof schema>;

const perks = [
  'Free forever — no credit card',
  '3 ATS-optimized resumes',
  'AI bullet & summary writer',
  '1-click portfolio website',
];

export default function SignupPage() {
  const router = useRouter();
  const { register: authRegister, isLoading } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agree: false },
  });

  const pw = watch('password', '');
  const strength = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ].filter(Boolean).length;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981', '#00C896'][strength];

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister(data.name, data.email, data.password);
      toast.success('Account created! Welcome to ResumeAI 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-gradient-to-b from-[#00C896]/10 to-[#6C63FF]/10 border-r border-[var(--border-default)] w-[420px] shrink-0">
        <div className="flex items-center gap-2 font-display font-bold text-xl mb-12">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-gradient">ResumeAI</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl mb-4 leading-tight">
          Your career starts here.
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-10 leading-relaxed">
          Join 50,000+ professionals who use ResumeAI to land interviews faster.
        </p>
        <ul className="space-y-4">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-[#00C896]/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-[#00C896]" />
              </div>
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center justify-center gap-2 font-display font-bold text-xl mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-gradient">ResumeAI</span>
          </Link>

          <h1 className="font-display font-bold text-2xl mb-1">Create your account</h1>
          <p className="text-[var(--text-muted)] text-sm mb-8">Free forever. No credit card required.</p>

          <button
            onClick={() => toast.info('Google OAuth: integrate @react-oauth/google')}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-all text-sm font-medium mb-6"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <span className="text-xs text-[var(--text-muted)]">or email</span>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <input
                {...register('name')}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm transition-all placeholder:text-[var(--text-muted)]"
              />
              {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="jane@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm transition-all placeholder:text-[var(--text-muted)]"
              />
              {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm transition-all pr-11 placeholder:text-[var(--text-muted)]"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {pw && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColor : 'var(--bg-muted)' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <p className="text-xs text-[var(--error)] mt-1">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5">
              <input
                {...register('agree')}
                type="checkbox"
                id="agree"
                className="w-4 h-4 mt-0.5 accent-[#00C896] shrink-0"
              />
              <label htmlFor="agree" className="text-xs text-[var(--text-muted)]">
                I agree to the{' '}
                <Link href="/terms" className="text-[#00C896] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#00C896] hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.agree && <p className="text-xs text-[var(--error)] -mt-2">{errors.agree.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#00C896]/20 mt-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create free account
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#00C896] font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
