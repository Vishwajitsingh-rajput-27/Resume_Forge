import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PortfolioData {
  personalInfo: { name: string; email: string; phone?: string; jobTitle?: string; linkedin?: string; github?: string; website?: string };
  summary?: string;
  skills: Array<{ category: string; skills: string[] }>;
  experience: Array<{ company: string; role: string; startDate: string; endDate?: string; current: boolean; responsibilities: string[] }>;
  projects: Array<{ name: string; description: string; technologies: string[]; githubUrl?: string; liveUrl?: string }>;
  education: Array<{ institution: string; degree: string; specialization?: string; startYear: number; endYear?: number }>;
}

function safeExternalUrl(value?: string): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  try {
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
    const url = new URL(hasScheme ? raw : `https://${raw.replace(/^\/+/, '')}`);

    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function getPortfolio(username: string): Promise<PortfolioData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/portfolios/${username}`,
      { cache: 'no-store' },
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
  const githubUrl = safeExternalUrl(p.github);
  const linkedinUrl = safeExternalUrl(p.linkedin);
  const websiteUrl = safeExternalUrl(p.website);

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
            {p.email && <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"><a href={`mailto:${p.email}`}><Mail className="text-[#00C896]" />{p.email}</a></Button>}
            {githubUrl && <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"><a href={githubUrl} target="_blank" rel="noopener noreferrer"><Github />GitHub</a></Button>}
            {linkedinUrl && <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"><a href={linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="text-blue-400" />LinkedIn</a></Button>}
            {websiteUrl && <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"><a href={websiteUrl} target="_blank" rel="noopener noreferrer"><Globe />Website</a></Button>}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-16">
        {data.skills.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.skills.map((cat, i) => (
                <Card key={i} className="border-white/10 bg-white/5 text-white shadow-none">
                  <CardContent className="p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#00C896] mb-3">{cat.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <Badge key={skill} className="bg-white/10 text-white hover:bg-white/10">{skill}</Badge>
                    ))}
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.projects.map((proj, i) => {
                const projectGithubUrl = safeExternalUrl(proj.githubUrl);
                const projectLiveUrl = safeExternalUrl(proj.liveUrl);

                return (
                  <Card key={i} className="border-white/10 bg-white/5 text-white shadow-none transition-colors hover:border-[#00C896]/40">
                  <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg">{proj.name}</h3>
                    <div className="flex gap-2">
                      {projectGithubUrl && <a href={projectGithubUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${proj.name} source`} className="text-[#A1A1AA] hover:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                      {projectLiveUrl && <a href={projectLiveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${proj.name} project`} className="text-[#A1A1AA] hover:text-[#00C896] transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  </div>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <Badge key={t} className="bg-[#00C896]/15 text-[#00C896] hover:bg-[#00C896]/15">{t}</Badge>
                    ))}
                  </div>
                  </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <Card key={i} className="border-white/10 bg-white/5 text-white shadow-none">
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl mb-6 text-center">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.education.map((edu, i) => (
                <Card key={i} className="border-white/10 bg-white/5 text-white shadow-none">
                  <CardContent className="p-5">
                  <h3 className="font-bold">{edu.degree}{edu.specialization ? ` in ${edu.specialization}` : ''}</h3>
                  <p className="text-[#00C896] text-sm mt-0.5">{edu.institution}</p>
                  <p className="text-xs text-[#71717A] mt-1">{edu.startYear} — {edu.endYear || 'Present'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="text-center py-12 border-t border-white/10">
          <h2 className="font-display font-bold text-2xl mb-3">Get In Touch</h2>
          <p className="text-[#A1A1AA] mb-6">Open to new opportunities and collaborations.</p>
          <Button asChild size="lg">
            <a href={`mailto:${p.email}`}>
              <Mail /> Say hello
            </a>
          </Button>
          <p className="text-xs text-[#71717A] mt-8">
            Portfolio powered by <Link href="/" className="text-[#00C896] hover:underline">ResumeForge</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
