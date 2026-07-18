'use client';

import { TEMPLATE_FONTS } from '@/lib/resume-templates';
import { useResumeStore } from '@/store/resume-store';
import { getTemplateComponent } from '../templates/registry';

export function LivePreview() {
  const resume = useResumeStore((state) => state.resume);
  const Template = getTemplateComponent(resume.templateId);
  const fontFamily =
    TEMPLATE_FONTS.find((font) => font.value === resume.fontFamily)?.stack ??
    TEMPLATE_FONTS[0].stack;

  return (
    <div
      className="resume-preview w-full"
      style={{ fontFamily }}
    >
      <Template />
    </div>
  );
}
