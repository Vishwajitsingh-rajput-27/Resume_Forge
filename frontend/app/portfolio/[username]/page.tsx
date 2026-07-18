import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Globe, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

interface PortfolioData {
  personalInfo: { name: string; email: string; phone?: string; jobTitle?: string; linkedin?: string; github?: string; website?: string };
  summary?: string;
  skills: Array<{ category: string; skills: string[] }>;
  experience: Array<{ company: string; role: string; startDate: string; endDate?: string; current: boolean; responsibilities: string[] }>;
  projects: Array<{ name: string; description: string; technologies: string[]; githubUrl?: string; liveUrl?: string }>;
  education: Array<{ institution: string; degree: string; specialization?: string; startYear: number; endYear?: number }>;
}

async function getPortfolio(username: string): Promise<PortfolioData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/portfolios/${username}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const data = await getPortfolio(username);
  if (!data) return { title: 'Portfolio not found' };
  return {
    title: `${data.personalInfo.name} — ${data.personalInfo.jobTitle || 'Portfolio'}`,
    description: data.summary?.slice(0, 160),
  };
}

export default async function PortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getPortfolio(username);
  if (!data) notFound();

  const { personalInfo: p } = data;

  return (
    <main className="min-h-screen bg-[#09090B] text-white">
      <section className="relative px-6 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00C896]/8 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-xl shadow-[#00C896]/20">
            {p.name[0]}
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl mb-3">{p.name}</h1>
          {p.jobTitle && <p className="text-xl text-[#00C896] font-medium mb-4">{p.jobTitle}</p>}
          {data.summary && <p className="text-[#A1A1AA] text-lg leading-relaxed mb-8 max-w-xl mx-auto">{data.summary}</p>}
          <div className="flex justify-center flex-wrap gap-3">
            {p.email    && <a href={`mailto:${p.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"><Mail className="w-4 h-4 text-[#00C896]" />{p.email}</a>}
            {p.github   && <a href={p.github.startsWith('http') ? p.github : `https://${p.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"><Github className="w-4 h-4" />GitHub</a>}
            {p.linkedin && <a href={p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"><Linkedin className="w-4 h-4 text-blue-400" />LinkedIn</a>}
            {p.website  && <a href={p.website.startsWith('http') ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"><Globe className="w-4 h-4" />Website</a>}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-16">
        {data.skills.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.skills.map((cat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#00C896] mb-3">{cat.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-white/10 text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00C896]/40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg">{proj.name}</h3>
                    <div className="flex gap-2">
                      {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                      {proj.liveUrl  && <a href={proj.liveUrl}   target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#00C896] transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  </div>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#00C896]/15 text-[#00C896] text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{exp.role}</h3>
                      <p className="text-[#00C896]">{exp.company}</p>
                    </div>
                    <span className="text-sm text-[#71717A] bg-white/5 px-3 py-1 rounded-full">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {exp.responsibilities.filter(Boolean).map((r, ri) => (
                      <li key={ri} className="text-sm text-[#A1A1AA] flex items-start gap-2">
                        <span className="text-[#00C896] shrink-0 mt-1">→</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.education.map((edu, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-bold">{edu.degree}{edu.specialization ? ` in ${edu.specialization}` : ''}</h3>
                  <p className="text-[#00C896] text-sm mt-0.5">{edu.institution}</p>
                  <p className="text-xs text-[#71717A] mt-1">{edu.startYear} — {edu.endYear || 'Present'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="text-center py-12 border-t border-white/10">
          <h2 className="font-display font-bold text-2xl mb-3">Get In Touch</h2>
          <p className="text-[#A1A1AA] mb-6">Open to new opportunities and collaborations.</p>
          <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00C896] to-[#6C63FF] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#00C896]/20">
            <Mail className="w-5 h-5" /> Say Hello
          </a>
          <p className="text-xs text-[#71717A] mt-8">
            Portfolio powered by <a href="/" className="text-[#00C896] hover:underline">ResumeForge</a>
          </p>
        </section>
      </div>
    </main>
  );
}
