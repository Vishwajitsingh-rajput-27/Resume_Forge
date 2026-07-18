'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { resumeApi } from '@/lib/api-client';
import { useResumeStore } from '@/store/resume-store';
import ResumeBuilderPage from '../page';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditResumePage() {
  const params   = useParams();
  const router   = useRouter();
  const { loadResume, resetResume } = useResumeStore();
  const [loading, setLoading] = useState(true);
  const rawRouteId = params?.id;
  const routeId = Array.isArray(rawRouteId) ? rawRouteId[0] : rawRouteId;

  useEffect(() => {
    let active = true;
    setLoading(true);
    resetResume();

    if (!routeId) {
      router.replace('/resume/builder');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    resumeApi.getById(routeId)
      .then(({ data }) => {
        if (!active) return;
        // Map MongoDB document → store shape
        loadResume({
          id: data._id,
          status: data.status === 'complete' ? 'complete' : 'draft',
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
      })
      .catch(() => {
        if (!active) return;
        toast.error('Failed to load resume.');
        router.replace('/resume/builder');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadResume, resetResume, routeId, router]);

  if (loading) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading resume…</span>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return <ResumeBuilderPage />;
}
