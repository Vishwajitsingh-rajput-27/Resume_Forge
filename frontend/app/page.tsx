'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, FileText, Target, Mail, Mic, Globe, BarChart3,
  Check, ArrowRight, Star, Zap, Shield, ChevronRight,
} from 'lucide-react';

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: FileText,  title: 'ATS Resume Builder',      desc: 'Multi-step wizard with live preview. Auto-saves every keystroke.', color: '#00C896' },
  { icon: Sparkles,  title: 'AI Content Writer',       desc: 'Groq + Gemini turn weak bullets into quantified achievements.', color: '#6C63FF' },
  { icon: Target,    title: 'ATS Score Engine',        desc: 'Custom ATS analyser scores 7 dimensions — no paid API needed.', color: '#F7B731' },
  { icon: Mail,      title: 'Cover Letter Generator',  desc: 'Job-specific, ATS-friendly cover letters in under 10 seconds.', color: '#EC4899' },
  { icon: Mic,       title: 'Interview Prep',          desc: 'Role-specific question banks with sample STAR answers.', color: '#3B82F6' },
  { icon: Globe,     title: '1-Click Portfolio',       desc: 'Convert your resume into a public portfolio site instantly.', color: '#10B981' },
  { icon: BarChart3, title: 'Job Match Engine',        desc: 'Paste any JD — AI compares it to your resume and shows gaps.', color: '#F97316' },
  { icon: Shield,    title: 'Version History',         desc: 'Every save is versioned. Roll back anytime on Pro.', color: '#8B5CF6' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    highlight: false,
    features: [
      '3 resumes',
      '3 ATS templates',
      'Basic ATS score',
      'AI summary & bullet fixes (20/mo)',
      '3 cover letters',
      '5 interview prep sessions',
      '1 portfolio website',
      'PDF & DOCX export',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Unlimited resumes',
      'All 5 premium templates',
      'Advanced ATS + keyword gap analysis',
      'Unlimited AI generations',
      'Unlimited cover letters',
      'Unlimited interview prep',
      'Unlimited portfolios',
      'Resume version history',
      'Job match engine',
      'Priority support',
    ],
  },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'SWE @ Google', text: 'Got 3× more callbacks after using ResumeAI. The ATS scorer caught gaps I never noticed.', stars: 5 },
  { name: 'Marcus Chen', role: 'Data Scientist', text: 'The AI bullet-point improver is insane. Turned "helped with data" into a proper impact statement.', stars: 5 },
  { name: 'Aisha Okafor', role: 'Product Manager', text: 'Cover letter + job match together saved me hours per application. Highly recommend.', stars: 5 },
];

const stats = [
  { value: '50K+', label: 'Resumes created' },
  { value: '3.2×',  label: 'More interviews' },
  { value: '92%',  label: 'ATS pass rate' },
  { value: '< 10s', label: 'AI generation' },
];

// ─── Components ───────────────────────────────────────────────────────────────
function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b border-white/10">
      <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-gradient">ResumeAI</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
        {['Features', 'Templates', 'Pricing', 'Blog'].map((item) => (
          <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-[var(--text-primary)] transition-colors">
            {item}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden md:block">
          Log in
        </Link>
        <Link
          href="/auth/signup"
          className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          Get started free <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00C896]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#6C63FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#F7B731]/8 rounded-full blur-3xl" />
      </div>
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 text-[#00C896] text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Groq + Gemini · Free forever
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-7xl font-extrabold text-balance mb-6 leading-[1.05]">
          Land your dream job with an{' '}
          <span className="text-gradient">AI-crafted resume</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p variants={fadeUp} className="text-xl md:text-2xl text-[var(--text-secondary)] text-balance max-w-2xl mx-auto mb-10">
          Build ATS-optimized resumes, generate cover letters, prep for interviews, and publish a portfolio site — all in one place, powered by free AI.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#00C896]/20"
          >
            Build my resume free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] font-medium text-lg hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-all"
          >
            See how it works
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p variants={fadeUp} className="mt-8 text-sm text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-[var(--brand-primary)]" />
          No credit card · No watermarks · Unlimited downloads on free
        </motion.p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--border-default)] rounded-2xl overflow-hidden border border-[var(--border-default)] max-w-3xl mx-auto w-full"
      >
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--bg-elevated)] px-6 py-5 text-center">
            <div className="font-display font-extrabold text-3xl text-gradient">{s.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[var(--brand-primary)] font-medium text-sm uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            One platform. Every career tool.
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Built by developers who were tired of paying for 5 different tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}18` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[var(--brand-primary)] font-medium text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4">Simple, honest pricing</h2>
          <p className="text-[var(--text-secondary)] text-lg">Free includes everything you need to get hired.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-[#00C896]/10 to-[#6C63FF]/10 border-[#00C896]/40 shadow-xl shadow-[#00C896]/10'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-default)]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white text-xs font-bold">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-4xl">{plan.price}</span>
                  <span className="text-[var(--text-muted)] text-sm">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white hover:opacity-90 shadow-lg'
                    : 'border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-primary)]'
                }`}
              >
                Get started {plan.price === '$0' ? 'free' : ''}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 px-6 bg-[var(--bg-subtle)]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-extrabold mb-4">Loved by job seekers</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#F7B731] text-[#F7B731]" />
                ))}
              </div>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[var(--border-default)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-gradient">ResumeAI</span>
        </div>
        <p className="text-sm text-[var(--text-muted)]">© 2024 ResumeAI. Built with free AI for everyone.</p>
        <div className="flex gap-6 text-sm text-[var(--text-muted)]">
          {['Privacy', 'Terms', 'Contact'].map((l) => (
            <Link key={l} href="#" className="hover:text-[var(--text-secondary)] transition-colors">{l}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="bg-[var(--bg-base)]">
      <NavBar />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
