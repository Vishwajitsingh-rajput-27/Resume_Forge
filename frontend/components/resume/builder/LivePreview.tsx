'use client';
import { useResumeStore } from '@/store/resume-store';
import { ModernTemplate } from '../templates/ModernTemplate';
import { MinimalTemplate } from '../templates/MinimalTemplate';
import { CorporateTemplate } from '../templates/CorporateTemplate';
import { DeveloperTemplate } from '../templates/DeveloperTemplate';

export function LivePreview() {
  const { resume } = useResumeStore();

  const templates: Record<string, React.ComponentType> = {
    modern:    ModernTemplate,
    minimal:   MinimalTemplate,
    corporate: CorporateTemplate,
    developer: DeveloperTemplate,
  };

  const Template = templates[resume.templateId] || ModernTemplate;

  return (
    <div
      className="resume-preview w-full"
      style={{
        fontFamily: resume.fontFamily === 'inter' ? 'Inter, sans-serif' :
                    resume.fontFamily === 'georgia' ? 'Georgia, serif' :
                    resume.fontFamily === 'mono' ? 'JetBrains Mono, monospace' :
                    'Inter, sans-serif',
      }}
    >
      <Template />
    </div>
  );
}
