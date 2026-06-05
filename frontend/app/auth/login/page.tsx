'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Loader2, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed. Check your credentials.';
      toast.error(msg);
    }
  };

  const handleGoogle = async () => {
    // In production: use @react-oauth/google's useGoogleLogin hook
    // Here we show a placeholder toast
    toast.info('Google OAuth: integrate @react-oauth/google in production');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00C896]/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 font-display font-bold text-xl mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center shadow-lg shadow-[#00C896]/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-gradient">ResumeAI</span>
        </Link>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-8 shadow-xl">
          <h1 className="font-display font-bold text-2xl mb-1">Welcome back</h1>
          <p className="text-[var(--text-muted)] text-sm mb-8">Sign in to continue building your career</p>

          {/* Google */}
          <button
            onClick={handleGoogle}
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
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm transition-all placeholder:text-[var(--text-muted)]"
              />
              {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-[#00C896] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm transition-all pr-11 placeholder:text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[var(--error)] mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#00C896]/20 mt-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[#00C896] font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
