import type { ComponentType } from 'react';
import type { ResumeTemplateId } from '@/lib/resume-templates';
import type { ResumeTemplateProps } from './types';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { CorporateTemplate } from './CorporateTemplate';
import { DeveloperTemplate } from './DeveloperTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CompactTemplate } from './CompactTemplate';

export const TEMPLATE_COMPONENTS: Record<ResumeTemplateId, ComponentType<ResumeTemplateProps>> = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  corporate: CorporateTemplate,
  developer: DeveloperTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  compact: CompactTemplate,
};

export function getTemplateComponent(templateId: string): ComponentType<ResumeTemplateProps> {
  return TEMPLATE_COMPONENTS[templateId as ResumeTemplateId] ?? ModernTemplate;
}
