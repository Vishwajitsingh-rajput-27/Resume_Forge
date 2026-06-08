'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Type, Eye, Lock, Crown } from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Two-column layout, colour accent header. Best for tech & creative roles.',
    preview: 'bg-gradient-to-br from-[#00C896]/20 to-[#6C63FF]/10',
    badge: 'Most Popular',
    badgeColor: '#00C896',
    proOnly: false,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Clean single-column, black & white. Universally ATS-friendly.',
    preview: 'bg-gradient-to-br from-gray-100/10 to-gray-300/5',
    proOnly: false,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    desc: 'Dark header band, sidebar skills. Finance, consulting, enterprise.',
    preview: 'bg-gradient-to-br from-[#1E3A8A]/20 to-[#3B82F6]/10',
    proOnly: false,
  },
  {
    id: 'developer',
    name: 'Developer',
    desc: 'Terminal / dark theme with monospace font. Stand out in engineering.',
    preview: 'bg-gradient-to-br from-[#0D1117] to-[#1A2332]',
    badge: 'Unique',
    badgeColor: '#F7B731',
    proOnly: false,
  },
  {
    id: 'creative',
    name: 'Creative',
    desc: 'Asymmetric layout, bold typography. Design, marketing, media roles.',
    preview: 'bg-gradient-to-br from-[#EC4899]/20 to-[#F97316]/10',
    badge: 'Pro',
    badgeColor: '#F7B731',
    proOnly: true,
  },
];

const COLOR_THEMES = [
  { label: 'Emerald', value: '#00C896' },
  { label: 'Violet',  value: '#6C63FF' },
  { label: 'Amber',   value: '#F7B731' },
  { label: 'Rose',    value: '#EC4899' },
  { label: 'Blue',    value: '#3B82F6' },
  { label: 'Orange',  value: '#F97316' },
  { label: 'Navy',    value: '#1E3A8A' },
  { label: 'Slate',   value: '#475569' },
  { label: 'Red',     value: '#EF4444' },
  { label: 'Teal',    value: '#14B8A6' },
  { label: 'Purple',  value: '#8B5CF6' },
  { label: 'Pink',    value: '#F472B6' },
];

const FONTS = [
  { label: 'Inter',          value: 'inter',   sample: 'Aa' },
  { label: 'DM Sans',        value: 'dm-sans', sample: 'Aa' },
  { label: 'Georgia',        value: 'georgia', sample: 'Aa' },
  { label: 'JetBrains Mono', value: 'mono',    sample: '<>' },
];

function TemplateCard({
  template,
  selected,
  isLocked,
  onSelect,
}: {
  template: typeof TEMPLATES[number];
  selected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: isLocked ? 0 : -4 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      onClick={onSelect}
      className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${
        selected
          ? 'border-[#00C896] shadow-xl shadow-[#00C896]/15'
          : isLocked
          ? 'border-[var(--border-default)] cursor-not-allowed opacity-75'
          : 'border-[var(--border-default)] hover:border-[var(--border-strong)] cursor-pointer'
      }`}
    >
      {/* Preview */}
      <div className={`${template.preview} h-44 relative flex items-center justify-center`}>
        {/* Simulated resume lines */}
        <div className="w-3/4 space-y-1.5 opacity-60">
          <div className="h-2.5 bg-white/60 rounded w-1/2 mx-auto" />
          <div className="h-1.5 bg-white/40 rounded w-2/3 mx-auto" />
          <div className="mt-3 h-px bg-white/30 w-full" />
          <div className="mt-2 space-y-1">
            {[0.8, 1, 0.7, 0.9, 0.6].map((w, i) => (
              <div key={i} className="h-1 bg-white/30 rounded" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
        </div>

        {/* Selected checkmark */}
        {selected && (
          <div className="absolute inset-0 bg-[#00C896]/10 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#00C896] flex items-center justify-center shadow-lg">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Lock overlay for pro-only when user is free */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#F7B731]/20 border border-[#F7B731]/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#F7B731]" />
            </div>
            <span className="text-white text-xs font-bold bg-[#F7B731] px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" /> Pro Only
            </span>
          </div>
        )}

        {/* Badge */}
        {template.badge && !isLocked && (
          <span
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: template.badgeColor }}
          >
            {template.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-[var(--bg-elevated)]">
        <div className="font-semibold text-sm mb-1">{template.name}</div>
        <p className="text-[11px] text-[var(--text-muted)] leading-snug">{template.desc}</p>
      </div>
    </motion.button>
  );
}

export default function TemplatesPage() {
  const { resume, setTemplate, setColor, setFont } = useResumeStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const isPro = user?.plan === 'pro' || user?.plan === 'enterprise';

  const handleSelect = (template: typeof TEMPLATES[number]) => {
    if (template.proOnly && !isPro) {
      toast.error('Creative template is Pro only. Upgrade to unlock all templates!', {
        action: {
          label: 'Upgrade',
          onClick: () => router.push('/upgrade'),
        },
        duration: 4000,
      });
      return;
    }
    setTemplate(template.id);
    toast.success(`${template.name} template applied!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Resume Templates</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            All templates are ATS-friendly and apply instantly to your resume.
          </p>
        </div>
        {isPro ? (
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7B731]/15 text-[#F7B731] text-sm font-bold border border-[#F7B731]/30">
            <Crown className="w-4 h-4" /> Pro — All templates unlocked
          </span>
        ) : (
          <Link href="/upgrade"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7B731]/10 text-[#F7B731] text-sm font-medium border border-[#F7B731]/20 hover:bg-[#F7B731]/20 transition-colors">
            <Crown className="w-4 h-4" /> Upgrade to unlock Creative
          </Link>
        )}
      </div>

      {/* Template grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="font-semibold text-base">Choose Template</h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Active: <span className="text-[#00C896] font-medium capitalize">{resume.templateId}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={resume.templateId === t.id}
              isLocked={t.proOnly && !isPro}
              onSelect={() => handleSelect(t)}
            />
          ))}
        </div>
      </section>

      {/* Color themes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="font-semibold text-base">Accent Colour</h2>
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            Applied to headings, borders, skill chips
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {COLOR_THEMES.map((c) => (
            <button
              key={c.value}
              onClick={() => { setColor(c.value); toast.success(`Colour: ${c.label}`); }}
              title={c.label}
              className={`relative w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                resume.colorTheme === c.value
                  ? 'border-white scale-110 shadow-lg shadow-black/30'
                  : 'border-transparent'
              }`}
              style={{ background: c.value }}
            >
              {resume.colorTheme === c.value && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Current: <span className="font-mono font-medium" style={{ color: resume.colorTheme }}>
            {resume.colorTheme}
          </span>
        </p>
      </section>

      {/* Font family */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="font-semibold text-base">Font Family</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FONTS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFont(f.value); toast.success(`Font: ${f.label}`); }}
              className={`p-4 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                resume.fontFamily === f.value
                  ? 'border-[#00C896] bg-[#00C896]/10'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)]'
              }`}
            >
              <div className="text-2xl font-bold mb-1">{f.sample}</div>
              <div className="text-xs font-medium">{f.label}</div>
              {resume.fontFamily === f.value && (
                <div className="text-[10px] text-[#00C896] mt-1">Active</div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <button
          onClick={() => router.push('/resume/builder')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#00C896]/20"
        >
          Apply & Continue Building →
        </button>
        <button
          onClick={() => router.push('/ats')}
          className="px-6 py-3 rounded-xl border border-[var(--border-default)] text-sm font-medium hover:border-[var(--border-strong)] transition-all"
        >
          Check ATS Score
        </button>
      </div>
    </div>
  );
}
