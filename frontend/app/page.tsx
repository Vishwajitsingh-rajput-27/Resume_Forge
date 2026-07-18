import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Gauge,
  Github,
  Globe2,
  Layers3,
  LockKeyholeOpen,
  MousePointer2,
  ScanSearch,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: WandSparkles,
    title: 'Write with useful AI',
    description: 'Turn rough notes into clear, quantified bullets and a focused professional summary.',
    className: 'md:col-span-2',
  },
  {
    icon: ScanSearch,
    title: 'See what ATS sees',
    description: 'Check structure, keywords, impact, readability, and missing essentials before you apply.',
    className: '',
  },
  {
    icon: Layers3,
    title: 'Seven real templates',
    description: 'Switch layouts instantly without re-entering a single detail.',
    className: '',
  },
  {
    icon: FileCheck2,
    title: 'Tailor every application',
    description: 'Compare a job description to your resume and close the most important gaps.',
    className: 'md:col-span-2',
  },
  {
    icon: Download,
    title: 'Export without watermarks',
    description: 'Download PDF and DOCX files whenever you need them. No checkout screen.',
    className: '',
  },
];

const templates = [
  {
    name: 'Modern',
    role: 'Product & tech',
    tone: 'Crisp two-column layout',
    accent: 'bg-emerald-500',
    shell: 'from-emerald-50 to-white',
  },
  {
    name: 'Executive',
    role: 'Leadership',
    tone: 'Confident editorial hierarchy',
    accent: 'bg-amber-500',
    shell: 'from-amber-50 to-white',
  },
  {
    name: 'Compact',
    role: 'Experienced candidates',
    tone: 'Dense, highly scannable',
    accent: 'bg-sky-500',
    shell: 'from-sky-50 to-white',
  },
  {
    name: 'Creative',
    role: 'Design & marketing',
    tone: 'Expressive, still ATS-aware',
    accent: 'bg-fuchsia-500',
    shell: 'from-fuchsia-50 to-white',
  },
];

const steps = [
  {
    number: '01',
    title: 'Add your story',
    description: 'A guided builder keeps every section structured and saves as you type.',
  },
  {
    number: '02',
    title: 'Sharpen the signal',
    description: 'Use AI suggestions and the ATS review only where they make your resume clearer.',
  },
  {
    number: '03',
    title: 'Choose, tailor, export',
    description: 'Try every template, match the role, then download a clean final document.',
  },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-white shadow-sm">
        <FileText className="h-4 w-4" />
        <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
      </div>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">
          ResumeForge
        </span>
      )}
    </div>
  );
}

function ResumeMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[610px]">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-emerald-300/20 blur-3xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.38)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Saved just now
          </div>
          <div className="h-7 w-7 rounded-lg border border-slate-200 bg-white" />
        </div>

        <div className="grid min-h-[430px] grid-cols-[132px_1fr] sm:grid-cols-[168px_1fr]">
          <aside className="border-r border-slate-200 bg-slate-950 p-3 text-white sm:p-4">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              YOUR RESUME
            </div>
            <div className="space-y-1.5">
              {['Personal', 'Summary', 'Experience', 'Projects', 'Skills'].map((item, index) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] sm:text-[11px] ${
                    index === 2 ? 'bg-white/10 text-white' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] ${
                      index < 2
                        ? 'bg-emerald-400 text-slate-950'
                        : index === 2
                          ? 'border border-emerald-400 text-emerald-400'
                          : 'border border-slate-700'
                    }`}
                  >
                    {index < 2 ? <Check className="h-2.5 w-2.5" /> : index + 1}
                  </span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2.5">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold text-emerald-300">
                <Zap className="h-3 w-3" />
                ALL FEATURES FREE
              </div>
              <p className="text-[9px] leading-relaxed text-slate-400">No template locks. No export limits.</p>
            </div>
          </aside>

          <div className="bg-slate-100 p-3 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-900">Live preview</p>
                <p className="text-[9px] text-slate-500">Modern · Emerald</p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-700 hover:bg-emerald-50">
                ATS 92
              </Badge>
            </div>

            <div className="mx-auto min-h-[350px] max-w-[310px] bg-white p-5 text-slate-800 shadow-lg">
              <div className="border-b-2 border-emerald-500 pb-3">
                <div className="h-4 w-32 rounded bg-slate-900" />
                <div className="mt-2 h-2 w-24 rounded bg-emerald-500" />
                <div className="mt-3 flex gap-2">
                  <span className="h-1.5 w-14 rounded bg-slate-200" />
                  <span className="h-1.5 w-12 rounded bg-slate-200" />
                  <span className="h-1.5 w-16 rounded bg-slate-200" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_72px] gap-4">
                <div className="space-y-4">
                  {[0, 1, 2].map((section) => (
                    <div key={section}>
                      <div className="mb-2 h-1.5 w-16 rounded bg-emerald-500" />
                      <div className="space-y-1.5">
                        <div className="h-2 w-4/5 rounded bg-slate-700" />
                        <div className="h-1.5 w-full rounded bg-slate-200" />
                        <div className="h-1.5 w-11/12 rounded bg-slate-200" />
                        <div className="h-1.5 w-3/4 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[0, 1, 2].map((section) => (
                    <div key={section}>
                      <div className="mb-2 h-1.5 w-10 rounded bg-emerald-500" />
                      <div className="flex flex-wrap gap-1">
                        {[0, 1, 2, 3].map((pill) => (
                          <span key={pill} className="h-2.5 w-7 rounded-sm bg-emerald-50" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">Bullet improved</p>
          <p className="text-[10px] text-slate-500">Clearer impact, same meaning</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-[#fbfaf7]/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Main navigation">
          <Link href="/" aria-label="ResumeForge home">
            <BrandMark />
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <Link href="#features" className="transition-colors hover:text-slate-950 dark:hover:text-white">Features</Link>
            <Link href="#templates" className="transition-colors hover:text-slate-950 dark:hover:text-white">Templates</Link>
            <Link href="#how-it-works" className="transition-colors hover:text-slate-950 dark:hover:text-white">How it works</Link>
            <Link href="#free" className="transition-colors hover:text-slate-950 dark:hover:text-white">Why free</Link>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300">
              <Link href="/auth/signup">
                Start building
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative px-5 pb-24 pt-32 sm:pt-40 lg:px-8 lg:pb-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-200/35 blur-[110px]" />
          <div className="absolute right-[-180px] top-44 h-[420px] w-[420px] rounded-full bg-violet-200/25 blur-[110px]" />
          <div className="absolute inset-x-0 top-0 h-[680px] bg-[linear-gradient(to_right,rgba(15,23,42,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.045)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-6 gap-2 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-800">
              <LockKeyholeOpen className="h-3.5 w-3.5" />
              Every feature. Every template. Free.
            </Badge>
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
              Build the resume that gets you{' '}
              <span className="relative whitespace-nowrap text-emerald-700">
                remembered.
                <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-emerald-300/70" />
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              ResumeForge combines a guided builder, practical AI, ATS feedback, and polished templates—without
              premium locks, watermarks, or download limits.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-13 bg-slate-950 px-7 text-white shadow-xl shadow-slate-950/15 hover:bg-slate-800">
                <Link href="/auth/signup">
                  Create my resume
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 border-slate-300 bg-white/70 px-7">
                <Link href="#templates">
                  Browse free templates
                  <MousePointer2 />
                </Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {['No credit card', 'No watermarks', 'Unlimited resumes'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <ResumeMockup />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/70 px-5 py-6 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Built for the whole search</span>
          <span className="flex items-center gap-2"><Gauge className="h-4 w-4 text-emerald-600" /> ATS analysis</span>
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-600" /> AI writing</span>
          <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-sky-600" /> Portfolio publishing</span>
          <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-amber-600" /> PDF & DOCX</span>
        </div>
      </section>

      <section id="features" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-slate-100 text-slate-700">Your complete application toolkit</Badge>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Serious tools, minus the subscription anxiety.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Every screen helps you make a stronger application—not navigate an upsell funnel.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`${feature.className} group overflow-hidden border-slate-200 bg-white/80 shadow-none transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/5`}
              >
                <CardHeader>
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs text-slate-300">0{index + 1}</span>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="max-w-md text-sm leading-6">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="bg-slate-950 px-5 py-24 text-white lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <Badge className="mb-4 border border-white/10 bg-white/10 text-white hover:bg-white/10">Seven templates included</Badge>
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                One story. A layout for every role.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                Every template is fully editable, printable, and available from day one.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/auth/signup">
                Use any template
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template) => (
              <div key={template.name} className="group">
                <div className={`aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br ${template.shell} p-4 transition-transform duration-300 group-hover:-translate-y-1`}>
                  <div className="h-full bg-white p-4 shadow-xl">
                    <div className={`h-1.5 w-12 rounded-full ${template.accent}`} />
                    <div className="mt-3 h-3 w-24 rounded-sm bg-slate-800" />
                    <div className="mt-2 h-1.5 w-16 rounded bg-slate-200" />
                    <div className="mt-5 grid grid-cols-[1fr_38px] gap-3">
                      <div className="space-y-4">
                        {[0, 1, 2, 3].map((row) => (
                          <div key={row}>
                            <div className={`mb-1.5 h-1 w-10 rounded ${template.accent}`} />
                            <div className="space-y-1">
                              <div className="h-1.5 w-full rounded bg-slate-300" />
                              <div className="h-1 w-full rounded bg-slate-100" />
                              <div className="h-1 w-4/5 rounded bg-slate-100" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        {[0, 1, 2].map((row) => (
                          <div key={row} className="space-y-1">
                            <div className={`h-1 w-7 rounded ${template.accent}`} />
                            <div className="h-1 w-full rounded bg-slate-200" />
                            <div className="h-1 w-4/5 rounded bg-slate-100" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold">{template.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">{template.tone}</p>
                  </div>
                  <Badge className="border-white/10 bg-white/10 text-[10px] text-slate-300 hover:bg-white/10">{template.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <Badge variant="secondary" className="mb-4">Three calm steps</Badge>
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                From blank page to ready to send.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                The builder keeps momentum without turning your resume into generic AI copy.
              </p>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {steps.map((step) => (
                <div key={step.number} className="grid gap-4 py-7 sm:grid-cols-[64px_180px_1fr] sm:items-start">
                  <span className="font-mono text-sm font-medium text-emerald-700">{step.number}</span>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="free" className="px-5 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-400 p-7 text-slate-950 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <Badge className="mb-5 bg-slate-950 text-white hover:bg-slate-950">The free promise</Badge>
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Your job search should not have a checkout gate.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-800">
                ResumeForge is built as a free career toolkit. You bring your own free-tier AI key when you want AI
                writing, while the builder, ATS engine, templates, exports, and portfolio tools stay open.
              </p>
              <Button asChild size="lg" className="mt-8 bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/auth/signup">
                  Build without limits
                  <ArrowRight />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                'Unlimited resumes and exports',
                'All seven templates',
                'Full ATS and job-match tools',
                'No payment or promo-code system',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-950/10 bg-white/45 px-4 py-3.5 text-sm font-semibold">
                  <Check className="h-4 w-4" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-10 dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />
          <p className="text-sm text-slate-500">Free career tools, built to help people move forward.</p>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
              <a
                href="https://github.com/Vishwajitsingh-rajput-27/Resume_Forge"
                target="_blank"
                rel="noreferrer"
                aria-label="View the original project on GitHub"
              >
                <Github />
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/auth/login">Log in</Link>
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
}
