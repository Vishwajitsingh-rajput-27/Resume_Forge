'use client';
import { useResumeStore } from '@/store/resume-store';

export function ModernTemplate() {
  const { resume } = useResumeStore();
  const { personalInfo: p, summary, education, experience, skills, projects, certifications, achievements, languages } = resume;
  const accent = resume.colorTheme || '#00C896';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <h2 style={{ borderBottomColor: accent }} className="text-[11px] font-bold uppercase tracking-widest border-b-2 pb-1 mb-2" >
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div className="bg-white text-gray-900 p-8 min-h-[1056px]" style={{ fontFamily: 'inherit', fontSize: 11 }}>
      {/* Header */}
      <div className="mb-5 pb-4 border-b-2" style={{ borderColor: accent }}>
        <h1 className="text-2xl font-bold leading-tight">{p.name || 'Your Name'}</h1>
        {p.jobTitle && <p className="text-sm font-medium mt-0.5" style={{ color: accent }}>{p.jobTitle}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[10px] text-gray-500">
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>📞 {p.phone}</span>}
          {p.address  && <span>📍 {p.address}</span>}
          {p.linkedin && <span>🔗 {p.linkedin.replace('https://', '')}</span>}
          {p.github   && <span>⚙ {p.github.replace('https://', '')}</span>}
          {p.website  && <span>🌐 {p.website.replace('https://', '')}</span>}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* Left column (70%) */}
        <div className="flex-1 min-w-0">
          {summary && (
            <Section title="Professional Summary">
              <p className="text-[10.5px] leading-relaxed text-gray-700">{summary}</p>
            </Section>
          )}

          {experience.length > 0 && (
            <Section title="Work Experience">
              {experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[11px]">{exp.role}</h3>
                    <span className="text-[9px] text-gray-400 shrink-0 ml-2">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium" style={{ color: accent }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  {exp.responsibilities.filter(Boolean).length > 0 && (
                    <ul className="mt-1 space-y-0.5 list-disc list-outside pl-3.5">
                      {exp.responsibilities.filter(Boolean).map((r, i) => (
                        <li key={i} className="text-[10px] text-gray-700 leading-snug">{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </Section>
          )}

          {projects.length > 0 && (
            <Section title="Projects">
              {projects.map((proj) => (
                <div key={proj.id} className="mb-2.5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-bold text-[11px]">{proj.name}</h3>
                    {proj.technologies.length > 0 && (
                      <span className="text-[9px] text-gray-400">{proj.technologies.slice(0, 4).join(' · ')}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-700 leading-snug mt-0.5">{proj.description}</p>
                  {(proj.githubUrl || proj.liveUrl) && (
                    <p className="text-[9px] mt-0.5" style={{ color: accent }}>
                      {proj.githubUrl && <span className="mr-3">↗ {proj.githubUrl}</span>}
                      {proj.liveUrl && <span>🌐 {proj.liveUrl}</span>}
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {education.length > 0 && (
            <Section title="Education">
              {education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[11px]">{edu.degree}{edu.specialization ? ` in ${edu.specialization}` : ''}</h3>
                    <span className="text-[9px] text-gray-400">{edu.startYear} — {edu.current ? 'Present' : edu.endYear}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: accent }}>{edu.institution}</p>
                  {(edu.cgpa || edu.percentage) && (
                    <p className="text-[9px] text-gray-500">
                      {edu.cgpa ? `CGPA: ${edu.cgpa}` : ''}{edu.percentage ? `  ${edu.percentage}%` : ''}
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}
        </div>

        {/* Right column (30%) */}
        <div className="w-36 shrink-0">
          {skills.length > 0 && (
            <Section title="Skills">
              {skills.map((cat) => (
                <div key={cat.id} className="mb-2">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1">{cat.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                        style={{ background: `${accent}18`, color: accent }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {certifications.length > 0 && (
            <Section title="Certifications">
              {certifications.map((cert) => (
                <div key={cert.id} className="mb-1.5">
                  <p className="text-[10px] font-semibold leading-tight">{cert.name}</p>
                  <p className="text-[9px] text-gray-500">{cert.issuer}</p>
                </div>
              ))}
            </Section>
          )}

          {achievements.filter(Boolean).length > 0 && (
            <Section title="Achievements">
              <ul className="space-y-0.5 list-disc list-outside pl-3">
                {achievements.filter(Boolean).map((a, i) => (
                  <li key={i} className="text-[9.5px] text-gray-700 leading-snug">{a}</li>
                ))}
              </ul>
            </Section>
          )}

          {languages.length > 0 && (
            <Section title="Languages">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between text-[9.5px] mb-0.5">
                  <span>{l.language}</span>
                  <span className="text-gray-400 capitalize">{l.proficiency}</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
