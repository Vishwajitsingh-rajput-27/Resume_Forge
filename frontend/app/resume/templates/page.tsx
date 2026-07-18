'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Eye,
  FileCheck2,
  Palette,
  Sparkles,
  Type,
} from 'lucide-react';
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
import { TEMPLATE_COMPONENTS } from '@/components/resume/templates/registry';
import {
  RESUME_TEMPLATES,
  TEMPLATE_COLOR_THEMES,
  TEMPLATE_FONTS,
  TEMPLATE_PREVIEW_RESUME,
  type ResumeTemplateMeta,
} from '@/lib/resume-templates';
import { useResumeStore } from '@/store/resume-store';

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: ResumeTemplateMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  const Preview = TEMPLATE_COMPONENTS[template.id];
  const previewResume = {
    ...TEMPLATE_PREVIEW_RESUME,
    templateId: template.id,
    colorTheme: template.previewAccent,
  };

  return (
    <Card
      className={`group overflow-hidden bg-[var(--bg-elevated)] transition-all duration-300 ${
        selected
          ? 'border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20'
          : 'border-[var(--border-default)] hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Use the ${template.name} resume template`}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        }}
        className="relative block h-[360px] w-full overflow-hidden border-b border-[var(--border-default)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        style={{
          background: `linear-gradient(145deg, ${template.previewAccent}18, transparent 52%), var(--bg-subtle)`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 w-[794px] origin-top -translate-x-1/2 scale-[0.34] overflow-hidden bg-white shadow-2xl"
        >
          <Preview data={previewResume} />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        <Badge className="absolute left-3 top-3 border-white/80 bg-white text-[10px] font-extrabold text-emerald-700 shadow-sm hover:bg-white">
          FREE
        </Badge>
        <Badge
          variant="secondary"
          className="absolute right-3 top-3 border border-white/70 bg-white/90 text-[10px] text-gray-700 shadow-sm backdrop-blur"
        >
          {template.tag}
        </Badge>

        {selected && (
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Check className="h-4 w-4" />
          </span>
        )}
      </div>

      <CardHeader className="space-y-2 p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: template.previewAccent }}>
              {template.bestFor}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 border-primary/25 bg-primary/5 text-[10px] text-primary">
            <FileCheck2 className="mr-1 h-3 w-3" />
            {template.atsNote}
          </Badge>
        </div>
        <CardDescription className="min-h-[40px] text-xs leading-relaxed text-[var(--text-secondary)]">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="p-5 pt-1">
        <Button
          type="button"
          variant={selected ? 'default' : 'outline'}
          className="w-full"
          onClick={onSelect}
        >
          {selected ? (
            <>
              <Check />
              Selected
            </>
          ) : (
            <>
              Use this template
              <ArrowRight />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { resume, setTemplate, setColor, setFont } = useResumeStore();
  const activeTemplate =
    RESUME_TEMPLATES.find((template) => template.id === resume.templateId) ??
    RESUME_TEMPLATES[0];

  const handleSelect = (template: ResumeTemplateMeta) => {
    setTemplate(template.id);
    toast.success(`${template.name} template applied — completely free.`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      <Card className="relative overflow-hidden border-primary/20 bg-[var(--bg-elevated)] shadow-sm">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <CardContent className="relative flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                <Sparkles className="mr-1 h-3 w-3" />
                100% free
              </Badge>
              <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
                7 live templates
              </Badge>
              <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
                ATS-conscious
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Find a resume that feels like you.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
              Preview the real document, apply it instantly, and customize every colour and font.
              Every design is available from the start, with no watermarks or hidden fees.
            </p>
          </div>
          <div className="flex min-w-fit items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Eye className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Active template
              </p>
              <p className="font-display text-base font-bold">{activeTemplate.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="template-gallery-title">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Real document previews</p>
            <h2 id="template-gallery-title" className="mt-1 font-display text-2xl font-bold">
              Choose your starting point
            </h2>
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-[var(--text-muted)] sm:text-right">
            Every card renders the same resume component used in the builder, so what you see is what you export.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {RESUME_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={resume.templateId === template.id}
              onSelect={() => handleSelect(template)}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Card className="border-[var(--border-default)] bg-[var(--bg-elevated)]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Palette className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-base">Accent colour</CardTitle>
                <CardDescription className="text-xs">Applied to headings, dividers and highlights.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {TEMPLATE_COLOR_THEMES.map((colour) => {
                const isActive = resume.colorTheme === colour.value;
                return (
                  <button
                    key={colour.value}
                    type="button"
                    title={colour.label}
                    aria-label={`Use ${colour.label} as the resume accent colour`}
                    aria-pressed={isActive}
                    onClick={() => {
                      setColor(colour.value);
                      toast.success(`${colour.label} accent applied.`);
                    }}
                    className={`relative h-10 w-10 rounded-full border-4 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isActive ? 'scale-110 border-white shadow-lg ring-2 ring-primary/30' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colour.value }}
                  >
                    {isActive && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Current accent:{' '}
              <span className="font-mono font-semibold" style={{ color: resume.colorTheme }}>
                {resume.colorTheme}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-[var(--border-default)] bg-[var(--bg-elevated)]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <Type className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-base">Typography</CardTitle>
                <CardDescription className="text-xs">Choose the voice of your resume.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {TEMPLATE_FONTS.map((font) => {
              const isActive = resume.fontFamily === font.value;
              return (
                <Button
                  key={font.value}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  aria-pressed={isActive}
                  onClick={() => {
                    setFont(font.value);
                    toast.success(`${font.label} font applied.`);
                  }}
                  className="h-auto justify-start px-3 py-2.5"
                  style={{ fontFamily: font.stack }}
                >
                  <span className="text-lg font-bold">{font.sample}</span>
                  <span className="text-xs">{font.label}</span>
                  {isActive && <Check className="ml-auto" />}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-[var(--bg-elevated)] to-violet-500/10">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Ready to make it yours?</p>
            <h2 className="mt-1 font-display text-xl font-bold">
              {activeTemplate.name} is applied to your resume.
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Continue editing your content or run a quick ATS check.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => router.push('/ats')}>
              <FileCheck2 />
              Check ATS score
            </Button>
            <Button type="button" onClick={() => router.push('/resume/builder')}>
              Continue building
              <ArrowRight />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
