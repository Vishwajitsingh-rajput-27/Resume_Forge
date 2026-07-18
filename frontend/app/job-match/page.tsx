'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Loader2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api, { aiApi } from '@/lib/api-client';

interface MatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordGaps: string[];
  suggestions: string[];
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Low Match';

  return (
    <div className="py-6 text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={140} height={140} className="-rotate-90" aria-hidden="true">
          <circle cx={70} cy={70} r={58} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
          <circle
            cx={70}
            cy={70}
            r={58}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={364.4}
            strokeDashoffset={364.4 - (score / 100) * 364.4}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute text-center">
          <div className="font-display text-4xl font-extrabold">{score}%</div>
          <div className="mt-0.5 text-xs font-medium" style={{ color }}>{label}</div>
        </div>
      </div>
      <Progress value={score} className="mx-auto mt-3 h-1.5 max-w-48" />
    </div>
  );
}

export default function JobMatchPage() {
  const [selectedId, setSelectedId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((response) => response.data),
  });

  const analyze = async () => {
    if (!selectedId) {
      toast.error('Select a resume');
      return;
    }
    if (jobDescription.trim().length < 50) {
      toast.error('Paste more of the job description');
      return;
    }
    if (jobDescription.length > 5000) {
      toast.error('Keep the job description under 5,000 characters');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const resume = resumes.find((item: { _id: string }) => item._id === selectedId);
      const skills =
        resume?.skills?.flatMap((category: { skills: string[] }) => category.skills).join(', ') || '';
      const experience =
        resume?.experience
          ?.map((item: { role: string; company: string }) => `${item.role} at ${item.company}`)
          .join('; ') || '';
      const resumeText =
        `Name: ${resume?.personalInfo?.name}\n` +
        `Role: ${resume?.personalInfo?.jobTitle}\n` +
        `Skills: ${skills}\n` +
        `Experience: ${experience}\n` +
        `Summary: ${resume?.summary || ''}`;

      const { data } = await aiApi.jobMatch(resumeText, jobDescription);
      setResult(data);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })
        .response?.data?.error;
      toast.error(message || 'Analysis failed. Check your AI API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Job Match Engine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste any job description — AI compares it to your resume and shows your match score.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compare your fit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-match-resume">Resume</Label>
              <Select
                value={selectedId}
                onValueChange={(value) => {
                  setSelectedId(value);
                  setResult(null);
                }}
              >
                <SelectTrigger id="job-match-resume">
                  <SelectValue placeholder="Select resume…" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume: { _id: string; title: string }) => (
                    <SelectItem key={resume._id} value={resume._id}>{resume.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="job-description">Job description</Label>
                <span className="text-xs text-muted-foreground">More context improves the match</span>
              </div>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={14}
                maxLength={5000}
                placeholder={'Paste the full job description here…\n\nWe are looking for a Senior React Engineer with 5+ years of experience…'}
              />
            </div>

            <Button type="button" onClick={analyze} disabled={loading} className="w-full">
              {loading
                ? <><Loader2 className="size-4 animate-spin" /> Analyzing…</>
                : <><BarChart3 className="size-4" /> Analyze match</>}
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="flex min-h-[28rem] flex-col items-center justify-center p-8">
                <Loader2 className="mb-4 size-10 animate-spin text-violet-500" />
                <p className="text-sm text-muted-foreground">AI is comparing your resume…</p>
              </Card>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <ScoreGauge score={result.matchScore} />
                <Separator />
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <TrendingUp className="size-3.5" />
                      Matched skills ({result.matchedSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {result.missingSkills.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="size-4" />
                      <AlertTitle>Missing skills ({result.missingSkills.length})</AlertTitle>
                      <AlertDescription>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingSkills.map((skill) => (
                            <Badge key={skill} variant="destructive">{skill}</Badge>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {result.keywordGaps.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-amber-600">Keyword gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywordGaps.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="outline"
                            className="border-amber-500/30 text-amber-600"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestions.length > 0 && (
                    <Alert>
                      <Sparkles className="size-4 text-violet-500" />
                      <AlertTitle>AI recommendations</AlertTitle>
                      <AlertDescription>
                        <ul className="space-y-1.5">
                          {result.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 size-3 shrink-0 text-violet-500" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/resume/builder/${selectedId}`}>
                      Improve resume <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="flex min-h-[28rem] flex-col items-center justify-center p-8 text-muted-foreground">
                <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-muted">
                  <BarChart3 className="size-7" />
                </div>
                <p className="text-center text-sm">
                  Select a resume and paste a<br />job description to see your match.
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
