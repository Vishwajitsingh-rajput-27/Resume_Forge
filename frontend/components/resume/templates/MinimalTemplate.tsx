'use client';
import { useResumeStore } from '@/store/resume-store';
import type { ResumeTemplateProps } from './types';

// ─── Minimal Template ─────────────────────────────────────────────────────────
export function MinimalTemplate({ data }: ResumeTemplateProps) {
  const storedResume = useResumeStore((state) => state.resume);
  const resume = data ?? storedResume;
  const { personalInfo: p, summary, education, experience, skills, projects } = resume;

  return (
    <div className="bg-white text-gray-900 px-10 py-8 min-h-[1056px]" style={{ fontSize: 11 }}>
      {/* Header — centered, no color */}
      <div className="text-center mb-6 pb-5 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-tight">{p.name || 'Your Name'}</h1>
        {p.jobTitle && <p className="text-xs text-gray-500 mt-0.5">{p.jobTitle}</p>}
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[9.5px] text-gray-400">
          {p.email   && <span>{p.email}</span>}
          {p.phone   && <span>·  {p.phone}</span>}
          {p.address && <span>·  {p.address}</span>}
          {p.linkedin && <span>·  {p.linkedin.replace('https://','')}</span>}
          {p.github   && <span>·  {p.github.replace('https://','')}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-4">
          <p className="text-[10.5px] text-gray-600 text-center italic leading-relaxed">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <span className="font-bold text-[11px]">{exp.role} — <span className="font-normal">{exp.company}</span></span>
                <span className="text-[9px] text-gray-400">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {exp.responsibilities.filter(Boolean).map((r, i) => (
                  <li key={i} className="text-[10px] text-gray-600 pl-3 before:content-['–'] before:mr-1.5 before:text-gray-300">{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between mb-1">
              <span className="text-[11px]"><span className="font-bold">{edu.degree}</span> · {edu.institution}</span>
              <span className="text-[9px] text-gray-400">{edu.startYear}–{edu.endYear || 'Present'}</span>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Skills</h2>
          {skills.map((cat) => (
            <p key={cat.id} className="text-[10.5px] text-gray-700 mb-0.5">
              <span className="font-semibold">{cat.category}:</span> {cat.skills.join(', ')}
            </p>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <span className="font-bold text-[11px]">{proj.name}</span>
              {proj.technologies.length > 0 && <span className="text-[9px] text-gray-400 ml-2">{proj.technologies.slice(0,5).join(' · ')}</span>}
              <p className="text-[10px] text-gray-600 mt-0.5">{proj.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Corporate Template ────────────────────────────────────────────────────────
export function CorporateTemplate({ data }: ResumeTemplateProps) {
  const storedResume = useResumeStore((state) => state.resume);
  const resume = data ?? storedResume;
  const { personalInfo: p, summary, education, experience, skills } = resume;
  const accent = resume.colorTheme || '#1E3A8A'; // navy default

  return (
    <div className="bg-white text-gray-900 min-h-[1056px]" style={{ fontSize: 11 }}>
      {/* Dark header bar */}
      <div className="px-8 py-6" style={{ background: accent }}>
        <h1 className="text-2xl font-bold text-white">{p.name || 'Your Name'}</h1>
        {p.jobTitle && <p className="text-sm text-white/80 mt-0.5">{p.jobTitle}</p>}
        <div className="flex flex-wrap gap-x-4 mt-2 text-[9.5px] text-white/70">
          {p.email   && <span>✉ {p.email}</span>}
          {p.phone   && <span>📞 {p.phone}</span>}
          {p.address && <span>📍 {p.address}</span>}
          {p.linkedin && <span>in {p.linkedin.replace('https://','')}</span>}
        </div>
      </div>

      <div className="px-8 py-5">
        {summary && (
          <div className="mb-4 p-3 rounded" style={{ background: `${accent}0D` }}>
            <p className="text-[10.5px] text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {experience.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1 border-b" style={{ color: accent, borderColor: accent }}>Experience</h2>
                {experience.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-[11px]">{exp.role}</span>
                      <span className="text-[9px] text-gray-400">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-[10px] font-semibold" style={{ color: accent }}>{exp.company}</p>
                    <ul className="mt-1 space-y-0.5 list-disc list-outside pl-3.5">
                      {exp.responsibilities.filter(Boolean).map((r, i) => (
                        <li key={i} className="text-[10px] text-gray-700">{r}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {education.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1 border-b" style={{ color: accent, borderColor: accent }}>Education</h2>
                {education.map((edu) => (
                  <div key={edu.id} className="mb-1.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-[11px]">{edu.degree}{edu.specialization ? `, ${edu.specialization}` : ''}</span>
                      <span className="text-[9px] text-gray-400">{edu.startYear}–{edu.endYear || 'Present'}</span>
                    </div>
                    <p className="text-[10px]" style={{ color: accent }}>{edu.institution}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {skills.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1 border-b" style={{ color: accent, borderColor: accent }}>Skills</h2>
                {skills.map((cat) => (
                  <div key={cat.id} className="mb-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{cat.category}</p>
                    {cat.skills.map((s) => (
                      <div key={s} className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-1 h-1 rounded-full" style={{ background: accent }} />
                        <span className="text-[10px]">{s}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Developer Template ───────────────────────────────────────────────────────
export function DeveloperTemplate({ data }: ResumeTemplateProps) {
  const storedResume = useResumeStore((state) => state.resume);
  const resume = data ?? storedResume;
  const { personalInfo: p, summary, education, experience, skills, projects } = resume;
  const accent = resume.colorTheme || '#00C896';

  return (
    <div className="bg-[#0D1117] text-gray-200 min-h-[1056px] p-8" style={{ fontSize: 11, fontFamily: 'inherit' }}>
      {/* Terminal-style header */}
      <div className="mb-5">
        <p className="text-[9px] text-gray-500 mb-1">{`// resume.json`}</p>
        <p className="text-[9px]" style={{ color: accent }}>{`const candidate = {`}</p>
        <p className="pl-4 text-[11px] font-bold text-white">{p.name || 'Your Name'}</p>
        {p.jobTitle && <p className="pl-4 text-[10px]" style={{ color: accent }}>{p.jobTitle}</p>}
        <div className="pl-4 mt-1 space-y-0.5 text-[9px] text-gray-400">
          {p.email   && <p><span className="text-blue-400">email:</span> {p.email}</p>}
          {p.phone   && <p><span className="text-blue-400">phone:</span> {p.phone}</p>}
          {p.github  && <p><span className="text-blue-400">github:</span> {p.github}</p>}
          {p.linkedin && <p><span className="text-blue-400">linkedin:</span> {p.linkedin}</p>}
        </div>
        <p className="text-[9px]" style={{ color: accent }}>{`}`}</p>
      </div>

      {summary && (
        <div className="mb-4 border-l-2 pl-3" style={{ borderColor: accent }}>
          <p className="text-[9px] text-gray-500 mb-1">{`/* summary */`}</p>
          <p className="text-[10px] text-gray-300 leading-relaxed">{summary}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-bold" style={{ color: accent }}>{'// skills'}</p>
          {skills.map((cat) => (
            <p key={cat.id} className="text-[10px] text-gray-400 mt-0.5">
              <span className="text-blue-400">{cat.category.toLowerCase().replace(/ /g,'_')}:</span>{' '}
              [{cat.skills.map((s) => `"${s}"`).join(', ')}]
            </p>
          ))}
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-bold mb-2" style={{ color: accent }}>{'// experience'}</p>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3 border border-gray-700 rounded p-3">
              <div className="flex justify-between">
                <span className="font-bold text-white text-[11px]">{exp.role} @ {exp.company}</span>
                <span className="text-[9px] text-gray-500">{exp.startDate} → {exp.current ? 'now' : exp.endDate}</span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {exp.responsibilities.filter(Boolean).map((r, i) => (
                  <li key={i} className="text-[10px] text-gray-400 pl-3 before:content-['>_'] before:mr-1" style={{ color: '#9CA3AF' }}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-bold mb-2" style={{ color: accent }}>{'// projects'}</p>
          {projects.map((proj) => (
            <div key={proj.id} className="mb-2 border border-gray-700 rounded p-2.5">
              <p className="font-bold text-[11px] text-white">{proj.name}
                {proj.technologies.length > 0 && <span className="text-gray-500 font-normal text-[9px] ml-2">[{proj.technologies.slice(0,5).join(', ')}]</span>}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div>
          <p className="text-[9px] font-bold mb-1" style={{ color: accent }}>{'// education'}</p>
          {education.map((edu) => (
            <p key={edu.id} className="text-[10px] text-gray-400">
              <span className="text-white">{edu.degree}</span> · {edu.institution} · {edu.startYear}–{edu.endYear || 'present'}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
