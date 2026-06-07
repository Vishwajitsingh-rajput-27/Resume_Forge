'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Sparkles, Check, Loader2, Tag,
  Zap, Infinity, FileText, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api-client';

const PRO_FEATURES = [
  { icon: Infinity,  text: 'Unlimited resumes' },
  { icon: Sparkles,  text: 'Unlimited AI generations' },
  { icon: FileText,  text: 'All 5 premium templates' },
  { icon: Star,      text: 'Advanced ATS + keyword analysis' },
  { icon: Zap,       text: 'Unlimited cover letters' },
  { icon: Crown,     text: 'Unlimited portfolio sites' },
  { icon: Check,     text: 'Resume version history' },
  { icon: Check,     text: 'Job match engine' },
  { icon: Check,     text: 'Priority support' },
];

export default function UpgradePage() {
  const { user, updateUser } = useAuthStore();
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) { toast.error('Enter a promo code'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/promo/redeem', { code });
      updateUser({ plan: data.plan });
      setSuccess(true);
      toast.success(data.message);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error || 'Invalid promo code.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Already Pro
  if (user?.plan === 'pro' || user?.plan === 'enterprise' || success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#F7B731] to-[#F97316] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#F7B731]/20">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-3xl mb-3">
            You're on <span className="text-gradient-warm">Pro</span>! 🎉
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            All features are unlocked. Enjoy unlimited resumes, AI generations, and more.
          </p>
          <div className="grid grid-cols-1 gap-2 text-left max-w-xs mx-auto">
            {PRO_FEATURES.slice(0, 5).map((f) => (
              <div key={f.text} className="flex items-center gap-2.5 text-sm">
                <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                {f.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7B731]/15 text-[#F7B731] text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          Upgrade to Pro
        </div>
        <h1 className="font-display font-extrabold text-4xl mb-3">
          Unlock your full potential
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
          Get unlimited access to every feature. Have a promo code? Enter it below for free Pro access.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pro features card */}
        <div className="bg-gradient-to-br from-[#F7B731]/10 to-[#F97316]/10 border border-[#F7B731]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7B731] to-[#F97316] flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Pro Plan</h2>
              <p className="text-xs text-[var(--text-muted)]">Everything in Free, plus:</p>
            </div>
          </div>
          <ul className="space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#10B981]" />
                </div>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Promo code card */}
        <div className="space-y-4">
          {/* Promo code box */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-[#00C896]" />
              <h2 className="font-semibold">Redeem Promo Code</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Have a promo code? Enter it below to instantly upgrade to Pro.
            </p>
            <div className="space-y-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRedeem(); }}
                placeholder="Enter promo code e.g. VISHU27"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm font-mono tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--text-muted)] transition-all"
              />
              <button
                onClick={handleRedeem}
                disabled={loading || !code.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-[#00C896]/20"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                  : <><Sparkles className="w-4 h-4" /> Redeem Code</>
                }
              </button>
            </div>
          </div>

          {/* Free vs Pro comparison */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-3">Free vs Pro</h3>
            <div className="space-y-2">
              {[
                ['Resumes',           '3',         'Unlimited'],
                ['AI Generations',    '20/month',  'Unlimited'],
                ['Cover Letters',     '3',         'Unlimited'],
                ['Templates',         '3',         'All 5'],
                ['Portfolio Sites',   '1',         'Unlimited'],
                ['Version History',   '✗',         '✓'],
                ['Job Match Engine',  '5/month',   'Unlimited'],
              ].map(([feature, free, pro]) => (
                <div key={feature} className="grid grid-cols-3 text-xs py-1.5 border-b border-[var(--border-default)] last:border-0">
                  <span className="text-[var(--text-secondary)]">{feature}</span>
                  <span className="text-center text-[var(--text-muted)]">{free}</span>
                  <span className="text-center text-[#10B981] font-medium">{pro}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 text-[10px] text-[var(--text-muted)] mt-2">
              <span />
              <span className="text-center">Free</span>
              <span className="text-center text-[#10B981]">Pro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
