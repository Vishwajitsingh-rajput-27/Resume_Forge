'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { resumeApi } from '@/lib/api-client';
import { useResumeStore } from '@/store/resume-store';
import ResumeBuilderPage from '../page';

export default function EditResumePage() {
  const params   = useParams();
  const router   = useRouter();
  const { loadResume, setResumeId } = useResumeStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    if (!id) { router.replace('/resume/builder'); return; }

    resumeApi.getById(id)
      .then(({ data }) => {
        // Map MongoDB document → store shape
        loadResume({
          id: data._id,
          title: data.title,
          templateId: data.templateId || 'modern',
          colorTheme: data.colorTheme || '#00C896',
          fontFamily: data.fontFamily || 'inter',
          personalInfo: data.personalInfo || { name:'', email:'', phone:'', address:'', linkedin:'', github:'', website:'', jobTitle:'' },
          summary: data.summary || '',
          education: (data.education || []).map((e: Record<string,unknown>, i: number) => ({ ...e, id: (e._id as string) || String(i) })),
          experience: (data.experience || []).map((e: Record<string,unknown>, i: number) => ({ ...e, id: (e._id as string) || String(i) })),
          projects: (data.projects || []).map((p: Record<string,unknown>, i: number) => ({ ...p, id: (p._id as string) || String(i) })),
          skills: (data.skills || []).map((s: Record<string,unknown>, i: number) => ({ ...s, id: (s._id as string) || String(i) })),
          certifications: (data.certifications || []).map((c: Record<string,unknown>, i: number) => ({ ...c, id: (c._id as string) || String(i) })),
          achievements: data.achievements || [],
          languages: (data.languages || []).map((l: Record<string,unknown>, i: number) => ({ ...l, id: (l._id as string) || String(i) })),
          interests: data.interests || [],
        });
        setResumeId(data._id);
      })
      .catch(() => {
        toast.error('Failed to load resume.');
        router.replace('/resume/builder');
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C896]" />
        <span className="ml-3 text-[var(--text-muted)]">Loading resume…</span>
      </div>
    );
  }

  return <ResumeBuilderPage />;
}
