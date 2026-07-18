'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api, { portfolioApi } from '@/lib/api-client';

interface Portfolio {
  _id: string;
  slug: string;
  title: string;
  isPublic: boolean;
  personalInfo: { name: string; jobTitle?: string };
  updatedAt: string;
}

function PortfolioCard({
  portfolio,
  onTogglePublic,
  onDelete,
}: {
  portfolio: Portfolio;
  onTogglePublic: (id: string, isPublic: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${portfolio.slug}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="group h-full transition-colors hover:border-primary/30">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="size-5 text-primary" />
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant={portfolio.isPublic ? 'secondary' : 'outline'}
                onClick={() => onTogglePublic(portfolio._id, !portfolio.isPublic)}
                className="h-8 rounded-full px-3 text-xs"
              >
                {portfolio.isPublic ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                {portfolio.isPublic ? 'Live' : 'Hidden'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDelete(portfolio._id)}
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={`Unpublish ${portfolio.personalInfo?.name}'s portfolio`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          <div>
            <CardTitle className="truncate text-base">{portfolio.personalInfo?.name}</CardTitle>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {portfolio.personalInfo?.jobTitle}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2.5">
            <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
              /portfolio/{portfolio.slug}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={copy}
              className="size-7 shrink-0"
              aria-label="Copy portfolio URL"
            >
              {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/portfolio/${portfolio.slug}`} target="_blank">
                <ExternalLink className="size-3.5" /> View live
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link href={`/resume/builder/${portfolio._id}`}>
                <RefreshCw className="size-3.5" /> Update
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((response) => response.data),
  });

  const portfolios: Portfolio[] = (resumes as Portfolio[]).filter((resume) => resume.isPublic);

  const generate = async () => {
    if (!selectedResumeId) {
      toast.error('Select a resume first');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await portfolioApi.generate(selectedResumeId);
      toast.success('Portfolio published! 🎉', {
        description: `Live at: /portfolio/${data.slug}`,
        action: {
          label: 'View',
          onClick: () => window.open(`/portfolio/${data.slug}`, '_blank'),
        },
      });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })
        .response?.data?.error;
      toast.error(message || 'Failed to generate portfolio.');
    } finally {
      setGenerating(false);
    }
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    try {
      await api.put(`/resumes/${id}`, { isPublic });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success(isPublic ? 'Portfolio is now live!' : 'Portfolio hidden');
    } catch {
      toast.error('Update failed');
    }
  };

  const deletePortfolio = async (id: string) => {
    await togglePublic(id, false);
    setPendingDeleteId(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Portfolio Sites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert your resume into a public portfolio website in one click.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-violet-500/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Generate new portfolio</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Creates a public URL like{' '}
                <code className="font-mono text-primary">your-domain.com/portfolio/your-name</code>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder="Select a resume to publish…" />
              </SelectTrigger>
              <SelectContent>
                {(resumes as { _id: string; title: string }[]).map((resume) => (
                  <SelectItem key={resume._id} value={resume._id}>{resume.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={generate}
              disabled={generating || !selectedResumeId}
              className="shrink-0"
            >
              {generating
                ? <><Loader2 className="size-4 animate-spin" /> Publishing…</>
                : <><Globe className="size-4" /> Publish</>}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'Instant deployment',
              'Mobile responsive',
              'Dark mode included',
              'SEO optimized',
            ].map((feature) => (
              <Badge key={feature} variant="secondary">{feature}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {portfolios.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-muted">
              <Globe className="size-8" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">No portfolios published yet</p>
            <p className="text-xs">Select a resume above and click Publish to create your first portfolio.</p>
          </CardContent>
        </Card>
      ) : (
        <section>
          <h2 className="mb-4 font-semibold">Your portfolios ({portfolios.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio._id}
                  portfolio={portfolio}
                  onTogglePublic={togglePublic}
                  onDelete={setPendingDeleteId}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      <Dialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unpublish this portfolio?</DialogTitle>
            <DialogDescription>
              Its public URL will stop working immediately. Your resume remains saved and can be published again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingDeleteId(null)}>
              Keep published
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => pendingDeleteId && void deletePortfolio(pendingDeleteId)}
            >
              <Trash2 />
              Unpublish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
