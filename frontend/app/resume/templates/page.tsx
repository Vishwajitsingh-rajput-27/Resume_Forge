'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Type, Eye } from 'lucide-react';
import { useResumeStore } from '@/store/resume-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Two-column layout, colour accent header. Best for tech & creative roles.',
    preview: 'bg-gradient-to-br from-[#00C896]/20 to-[#6C63FF]/10',
    badge: 'Most Popular',
    badgeColor: '#00C896',
    free: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Clean single-column, black & white. Universally ATS-friendly.',
    preview: 'bg-gradient-to-br from-gray-100/10 to-gray-300/5',
    free: true,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    desc: 'Dark header band, sidebar skills. Finance, consulting, enterprise.',
    preview: 'bg-gradient-to-br from-[#1E3A8A]/20 to-[#3B82F6]/10',
    free: true,
  },
  {
    id: 'developer',
    name: 'Developer',
    desc: 'Terminal / dark theme with monospace font. Stand out in engineering.',
    preview: 'bg-gradient-to-br from-[#0D1117] to-[#1A2332]',
    badge: 'Unique',
    badgeColor: '#F7B731',
    free: true,
  },
  {
    id: 'creative',
    name: 'Creative',
    desc: 'Asymmetric layout, bold typography. Design, marketing, media roles.',
    preview: 'bg-gradient-to-br from-[#EC4899]/20 to-[#F97316]/10',
    badge: 'Pro',
    badgeColor: '#F7B731',
    free: false,
  },
];

const COLOR_THEMES = [
  { label: 'Emerald',  value: '#00C896' },
  { label: 'Violet',   value: '#6C63FF' },
  { label: 'Amber',    value: '#F7B731' },
  { label: 'Rose',     value: '#EC4899' },
  { label: 'Blue',     value: '#3B82F6' },
  { label: 'Orange',   value: '#F97316' },
  { label: 'Navy',     value: '#1E3A8A' },
  { label: 'Slate',    value: '#475569' },
];

const FONTS = [
  { label: 'Inter',        value: 'inter',    sample: 'Aa' },
  { label: 'DM Sans',      value: 'dm-sans',  sample: 'Aa' },
  { label: 'Georgia',      value: 'georgia',  sample: 'Aa' },
  { label: 'JetBrains Mono', value: 'mono',   sample: '<>' },
];

// ─── Mini template preview card ───────────────────────────────────────────────
function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: typeof TEMPLATES[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${
        selected
          ? 'border-[#00C896] shadow-xl shadow-[#00C896]/15'
          : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
      } ${!template.free ? 'opacity-70' : ''}`}
    >
      {/* Preview area */}
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

        {/* Selected overlay */}
        {selected && (
          <div className="absolute inset-0 bg-[#00C896]/10 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#00C896] flex items-center justify-center shadow-lg">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Badge */}
        {template.badge && (
          <span
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: template.badgeColor }}
          >
            {template.badge}
          </span>
        )}

        {/* Pro lock */}
        {!template.free && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <span className="text-white text-xs font-semibold bg-[#F7B731] px-3 py-1 rounded-full">Pro Only</span>
            </div>
          </div>
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
  const router = useRouter();

  const handleSelect = (templateId: string, isFree: boolean) => {
    if (!isFree) { toast.info('Upgrade to Pro to unlock this template'); return; }
    setTemplate(templateId);
    toast.success(`${templateId} template applied!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl">Resume Templates</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          All templates are ATS-friendly and auto-apply to your current resume.
        </p>
      </div>

      {/* Template grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="font-semibold text-base">Choose Template</h2>
          <span className="text-xs text-[var(--text-muted)] ml-auto">
            Currently: <span className="text-[#00C896] font-medium capitalize">{resume.templateId}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={resume.templateId === t.id}
              onSelect={() => handleSelect(t.id, t.free)}
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
            Applies to headings, borders, skill chips
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {COLOR_THEMES.map((c) => (
            <button
              key={c.value}
              onClick={() => { setColor(c.value); toast.success(`Colour updated to ${c.label}`); }}
              title={c.label}
              className={`relative w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                resume.colorTheme === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent'
              }`}
              style={{ background: c.value }}
            >
              {resume.colorTheme === c.value && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Current: <span className="font-mono" style={{ color: resume.colorTheme }}>{resume.colorTheme}</span>
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
              onClick={() => { setFont(f.value); toast.success(`Font set to ${f.label}`); }}
              className={`p-4 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                resume.fontFamily === f.value
                  ? 'border-[#00C896] bg-[#00C896]/10'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)]'
              }`}
            >
              <div className="text-2xl font-bold mb-1">{f.sample}</div>
              <div className="text-xs font-medium">{f.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Apply button */}
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
