'use client';

import { useResumeStore } from '@/store/resume-store';
import type { ResumeTemplateProps } from './types';

export function ExecutiveTemplate({ data }: ResumeTemplateProps) {
  const storedResume = useResumeStore((state) => state.resume);
  const resume = data ?? storedResume;
  const {
    personalInfo: personal,
    summary,
    experience,
    education,
    skills,
    certifications,
    achievements,
  } = resume;
  const accent = resume.colorTheme || '#9A6B2F';

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-2.5 flex items-center gap-3">
      <span className="h-px w-8" style={{ backgroundColor: accent }} />
      <h2 className="text-[9px] font-bold uppercase tracking-[0.24em] text-gray-700">{children}</h2>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );

  return (
    <div className="min-h-[1056px] bg-[#FFFEFC] px-12 py-10 text-[#262523]" style={{ fontSize: 11 }}>
      <header className="mb-6 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: accent }}>
          Leadership profile
        </p>
        <h1
          className="mt-2 text-[29px] font-normal leading-none tracking-[-0.025em]"
          style={{ fontFamily: 'Georgia, Cambria, serif' }}
        >
          {personal.name || 'Your Name'}
        </h1>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
          {personal.jobTitle || 'Executive Leader'}
        </p>
        <div className="mx-auto mt-4 h-[2px] w-16" style={{ backgroundColor: accent }} />
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] text-gray-500">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>{personal.address}</span>}
          {personal.linkedin && <span>{personal.linkedin.replace('https://', '')}</span>}
          {personal.website && <span>{personal.website.replace('https://', '')}</span>}
        </div>
      </header>

      {summary && (
        <section className="mb-5">
          <SectionHeading>Executive Summary</SectionHeading>
          <p
            className="px-5 text-center text-[11px] leading-[1.65] text-gray-700"
            style={{ fontFamily: 'Georgia, Cambria, serif' }}
          >
            {summary}
          </p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-5">
          <SectionHeading>Leadership Experience</SectionHeading>
          {experience.map((item) => (
            <article key={item.id} className="mb-4">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[11.5px] font-bold">{item.role}</h3>
                  <span className="text-[9.5px] text-gray-500">— {item.company}</span>
                </div>
                <p className="shrink-0 text-[8.5px] font-semibold uppercase tracking-wide text-gray-400">
                  {item.startDate}–{item.current ? 'Present' : item.endDate}
                </p>
              </div>
              {item.location && <p className="mt-0.5 text-[8.5px] text-gray-400">{item.location}</p>}
              <ul className="mt-1.5 space-y-1">
                {item.responsibilities.filter(Boolean).map((responsibility, index) => (
                  <li key={index} className="grid grid-cols-[9px_1fr] text-[9.7px] leading-snug text-gray-600">
                    <span style={{ color: accent }}>◆</span>
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-5">
          <SectionHeading>Core Competencies</SectionHeading>
          <div className="space-y-1">
            {skills.map((category) => (
              <p key={category.id} className="text-[9.5px] text-gray-600">
                <span className="font-bold">{category.category}:</span>{' '}
                {category.skills.join(' · ')}
              </p>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-8">
        {education.length > 0 && (
          <section>
            <SectionHeading>Education</SectionHeading>
            {education.map((item) => (
              <div key={item.id} className="mb-2">
                <p className="text-[10px] font-bold">
                  {item.degree}{item.specialization ? `, ${item.specialization}` : ''}
                </p>
                <p className="text-[9px] text-gray-500">{item.institution} · {item.endYear || 'Present'}</p>
              </div>
            ))}
          </section>
        )}

        {(certifications.length > 0 || achievements.filter(Boolean).length > 0) && (
          <section>
            <SectionHeading>Recognition</SectionHeading>
            {certifications.map((certification) => (
              <p key={certification.id} className="mb-1.5 text-[9px] text-gray-600">
                <span className="font-bold text-gray-800">{certification.name}</span> · {certification.issuer}
              </p>
            ))}
            {achievements.filter(Boolean).map((achievement, index) => (
              <p key={index} className="mb-1.5 text-[9px] text-gray-600">{achievement}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
