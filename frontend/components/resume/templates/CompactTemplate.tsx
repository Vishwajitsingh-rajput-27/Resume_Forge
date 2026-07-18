'use client';

import { useResumeStore } from '@/store/resume-store';
import type { ResumeTemplateProps } from './types';

export function CompactTemplate({ data }: ResumeTemplateProps) {
  const storedResume = useResumeStore((state) => state.resume);
  const resume = data ?? storedResume;
  const {
    personalInfo: personal,
    summary,
    experience,
    education,
    projects,
    skills,
    certifications,
    languages,
  } = resume;
  const accent = resume.colorTheme || '#0F766E';

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h2
      className="mb-1.5 border-b pb-1 text-[8.5px] font-extrabold uppercase tracking-[0.16em]"
      style={{ borderColor: `${accent}70`, color: accent }}
    >
      {children}
    </h2>
  );

  return (
    <div className="min-h-[1056px] bg-white px-8 py-7 text-gray-900" style={{ fontSize: 10 }}>
      <header className="mb-3 border-b-2 pb-3" style={{ borderColor: accent }}>
        <div className="flex items-end justify-between gap-5">
          <div>
            <h1 className="text-[23px] font-black leading-none tracking-tight">{personal.name || 'Your Name'}</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
              {personal.jobTitle || 'Professional Title'}
            </p>
          </div>
          <div className="max-w-[335px] text-right text-[8px] leading-relaxed text-gray-500">
            <p>{[personal.email, personal.phone, personal.address].filter(Boolean).join(' · ')}</p>
            <p>
              {[personal.linkedin, personal.github, personal.website]
                .filter(Boolean)
                .map((value) => value.replace('https://', ''))
                .join(' · ')}
            </p>
          </div>
        </div>
      </header>

      {summary && (
        <section className="mb-3 rounded-md px-3 py-2" style={{ backgroundColor: `${accent}0D` }}>
          <p className="text-[9.5px] leading-snug text-gray-700">{summary}</p>
        </section>
      )}

      <div className="grid grid-cols-[1fr_205px] gap-5">
        <main className="min-w-0">
          {experience.length > 0 && (
            <section className="mb-3">
              <SectionHeading>Experience</SectionHeading>
              {experience.map((item) => (
                <article key={item.id} className="mb-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[10px] font-extrabold">
                      {item.role} <span className="font-semibold" style={{ color: accent }}>· {item.company}</span>
                    </p>
                    <p className="shrink-0 text-[7.8px] font-medium text-gray-400">
                      {item.startDate}–{item.current ? 'Present' : item.endDate}
                    </p>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {item.responsibilities.filter(Boolean).map((responsibility, index) => (
                      <li key={index} className="grid grid-cols-[8px_1fr] text-[8.8px] leading-snug text-gray-600">
                        <span style={{ color: accent }}>•</span>
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-3">
              <SectionHeading>Projects</SectionHeading>
              {projects.map((project) => (
                <article key={project.id} className="mb-2">
                  <p className="text-[9.5px] font-extrabold">
                    {project.name}
                    {project.technologies.length > 0 && (
                      <span className="ml-1.5 text-[7.5px] font-semibold text-gray-400">
                        {project.technologies.slice(0, 4).join(' · ')}
                      </span>
                    )}
                  </p>
                  <p className="text-[8.5px] leading-snug text-gray-600">{project.description}</p>
                </article>
              ))}
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionHeading>Education</SectionHeading>
              {education.map((item) => (
                <div key={item.id} className="mb-1.5 flex justify-between gap-3">
                  <p className="text-[9px]">
                    <span className="font-bold">{item.degree}{item.specialization ? `, ${item.specialization}` : ''}</span>
                    {' · '}{item.institution}
                  </p>
                  <p className="shrink-0 text-[7.8px] text-gray-400">{item.startYear}–{item.endYear || 'Present'}</p>
                </div>
              ))}
            </section>
          )}
        </main>

        <aside className="space-y-3">
          {skills.length > 0 && (
            <section>
              <SectionHeading>Skills</SectionHeading>
              {skills.map((category) => (
                <p key={category.id} className="mb-1.5 text-[8.5px] leading-snug text-gray-600">
                  <span className="font-extrabold text-gray-900">{category.category}:</span>{' '}
                  {category.skills.join(', ')}
                </p>
              ))}
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <SectionHeading>Certifications</SectionHeading>
              {certifications.map((certification) => (
                <div key={certification.id} className="mb-1.5">
                  <p className="text-[8.7px] font-bold leading-tight">{certification.name}</p>
                  <p className="text-[7.8px] text-gray-400">{certification.issuer}</p>
                </div>
              ))}
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <SectionHeading>Languages</SectionHeading>
              {languages.map((language) => (
                <div key={language.id} className="mb-0.5 flex justify-between text-[8.3px]">
                  <span className="font-semibold">{language.language}</span>
                  <span className="capitalize text-gray-400">{language.proficiency}</span>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
