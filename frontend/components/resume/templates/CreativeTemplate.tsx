'use client';

import { useResumeStore } from '@/store/resume-store';
import type { ResumeTemplateProps } from './types';

export function CreativeTemplate({ data }: ResumeTemplateProps) {
  const storedResume = useResumeStore((state) => state.resume);
  const resume = data ?? storedResume;
  const {
    personalInfo: personal,
    summary,
    experience,
    education,
    skills,
    projects,
    achievements,
  } = resume;
  const accent = resume.colorTheme || '#E11D48';

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-2 flex items-center gap-2">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <h2 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-900">
        {children}
      </h2>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );

  return (
    <div className="relative min-h-[1056px] overflow-hidden bg-white px-9 py-8 text-gray-900" style={{ fontSize: 11 }}>
      <div className="absolute inset-y-0 left-0 w-2" style={{ backgroundColor: accent }} />

      <header className="relative mb-5 overflow-hidden rounded-2xl px-6 py-5" style={{ backgroundColor: `${accent}12` }}>
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-10" style={{ backgroundColor: accent }} />
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
          Selected work & experience
        </p>
        <h1 className="max-w-[500px] text-[30px] font-black leading-none tracking-[-0.04em]">
          {personal.name || 'Your Name'}
        </h1>
        <p className="mt-1.5 text-sm font-semibold" style={{ color: accent }}>
          {personal.jobTitle || 'Your Professional Title'}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-gray-600">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>{personal.address}</span>}
          {personal.website && <span>{personal.website.replace('https://', '')}</span>}
          {personal.linkedin && <span>{personal.linkedin.replace('https://', '')}</span>}
        </div>
      </header>

      <div className="grid grid-cols-[1fr_178px] gap-6">
        <main className="min-w-0">
          {summary && (
            <section className="mb-5">
              <SectionHeading>Profile</SectionHeading>
              <p className="text-[10.5px] leading-relaxed text-gray-700">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-5">
              <SectionHeading>Experience</SectionHeading>
              {experience.map((item) => (
                <article key={item.id} className="relative mb-4 border-l border-gray-200 pl-4">
                  <span
                    className="absolute -left-[3px] top-1 h-[5px] w-[5px] rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[11px] font-extrabold">{item.role}</h3>
                      <p className="text-[9.5px] font-semibold" style={{ color: accent }}>
                        {item.company}{item.location ? ` · ${item.location}` : ''}
                      </p>
                    </div>
                    <p className="shrink-0 text-[8.5px] font-semibold text-gray-400">
                      {item.startDate}–{item.current ? 'Present' : item.endDate}
                    </p>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {item.responsibilities.filter(Boolean).map((responsibility, index) => (
                      <li key={index} className="flex gap-2 text-[9.5px] leading-snug text-gray-600">
                        <span style={{ color: accent }}>—</span>
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <SectionHeading>Selected Projects</SectionHeading>
              <div className="grid grid-cols-2 gap-2.5">
                {projects.map((project) => (
                  <article key={project.id} className="rounded-xl border border-gray-200 p-3">
                    <h3 className="text-[10.5px] font-extrabold">{project.name}</h3>
                    <p className="mt-1 text-[9px] leading-snug text-gray-600">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
                        {project.technologies.slice(0, 4).join(' · ')}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-5">
          {skills.length > 0 && (
            <section>
              <SectionHeading>Expertise</SectionHeading>
              {skills.map((category) => (
                <div key={category.id} className="mb-3">
                  <p className="mb-1 text-[8px] font-extrabold uppercase tracking-wider text-gray-400">
                    {category.category}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md px-1.5 py-1 text-[8.5px] font-semibold"
                        style={{ backgroundColor: `${accent}12`, color: accent }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionHeading>Education</SectionHeading>
              {education.map((item) => (
                <div key={item.id} className="mb-3">
                  <p className="text-[10px] font-bold">{item.degree}{item.specialization ? `, ${item.specialization}` : ''}</p>
                  <p className="text-[9px] text-gray-600">{item.institution}</p>
                  <p className="text-[8.5px] text-gray-400">{item.startYear}–{item.endYear || 'Present'}</p>
                </div>
              ))}
            </section>
          )}

          {achievements.filter(Boolean).length > 0 && (
            <section>
              <SectionHeading>Highlights</SectionHeading>
              <ul className="space-y-1.5">
                {achievements.filter(Boolean).map((achievement, index) => (
                  <li key={index} className="text-[9px] leading-snug text-gray-600">
                    {achievement}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
