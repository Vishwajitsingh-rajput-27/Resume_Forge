'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api-client';

interface ATSSection {
  name: string;
  score: number;
  weight: number;
  issues: string[];
  suggestions: string[];
}

interface ATSReport {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  sections: ATSSection[];
  keywords: { found: string[]; missing: string[]; density: number };
  priorityFixes: string[];
  strengths: string[];
  readabilityScore: number;
  formattingScore: number;
}

const gradeColor: Record<string, string> = {
  A: '#10B981',
  B: '#00C896',
  C: '#F59E0B',
  D: '#F97316',
  F: '#EF4444',
};

function ScoreRing({ score, size = 96, grade }: { score: number; size?: number; grade: string }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = gradeColor[grade] || '#00C896';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-extrabold leading-none">{score}</div>
        <div className="mt-0.5 text-xs font-bold" style={{ color }}>{grade}</div>
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: ATSSection }) {
  const [open, setOpen] = useState(false);
  const color = section.score >= 80 ? '#10B981' : section.score >= 55 ? '#F59E0B' : '#EF4444';

  return (
    <Card className="overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        className="h-auto w-full justify-start rounded-none px-4 py-3.5"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{section.name}</span>
            <span className="ml-4 shrink-0 text-xs font-bold" style={{ color }}>
              {section.score}/100
            </span>
          </div>
          <Progress value={section.score} className="mt-2 h-1.5" />
        </div>
        {open
          ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t"
          >
            <div className="space-y-3 p-4">
              {section.issues.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Issues</AlertTitle>
                  <AlertDescription>
                    <ul className="space-y-1">
                      {section.issues.map((issue, index) => <li key={index}>× {issue}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {section.suggestions.length > 0 && (
                <Alert>
                  <Info className="size-4 text-primary" />
                  <AlertTitle>Suggestions</AlertTitle>
                  <AlertDescription>
                    <ul className="space-y-1">
                      {section.suggestions.map((suggestion, index) => (
                        <li key={index}>→ {suggestion}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {section.issues.length === 0 && section.suggestions.length === 0 && (
                <Alert variant="success">
                  <CheckCircle className="size-4" />
                  <AlertTitle>This section looks great</AlertTitle>
                </Alert>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function ATSPage() {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [report, setReport] = useState<ATSReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((response) => response.data),
  });

  const analyze = async () => {
    if (!selectedResumeId) {
      toast.error('Select a resume first');
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await api.get(`/ats/${selectedResumeId}`);
      setReport(data);
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">ATS Analyzer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Score your resume across 7 dimensions. No external API — built-in engine.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Label>Select a resume to analyze</Label>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="py-6 text-center">
              <p className="mb-3 text-sm text-muted-foreground">No resumes yet.</p>
              <Button asChild variant="secondary">
                <Link href="/resume/builder">
                  Build your first resume <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                value={selectedResumeId}
                onValueChange={(value) => {
                  setSelectedResumeId(value);
                  setReport(null);
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose resume…" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume: { _id: string; title: string }) => (
                    <SelectItem key={resume._id} value={resume._id}>{resume.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={analyze} disabled={analyzing || !selectedResumeId}>
                {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
                {analyzing ? 'Analyzing…' : 'Analyze'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <ScoreRing score={report.totalScore} grade={report.grade} />
                  <div className="flex-1">
                    <CardTitle className="mb-1">
                      {report.totalScore >= 80
                        ? 'ATS-ready resume'
                        : report.totalScore >= 60
                          ? 'Good foundation'
                          : report.totalScore >= 40
                            ? 'Needs improvement'
                            : 'Critical issues found'}
                    </CardTitle>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {report.totalScore >= 80
                        ? 'Your resume will pass most ATS filters. Focus on tailoring keywords per job.'
                        : 'Follow the priority fixes below to increase your interview callback rate.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-display text-lg font-bold text-primary">{report.readabilityScore}%</div>
                        <div className="text-xs text-muted-foreground">Readability</div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="font-display text-lg font-bold text-violet-500">{report.formattingScore}%</div>
                        <div className="text-xs text-muted-foreground">Formatting</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {report.priorityFixes.length > 0 && (
              <Alert variant="destructive">
                <Zap className="size-4" />
                <AlertTitle>Priority fixes ({report.priorityFixes.length})</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal space-y-1 pl-4">
                    {report.priorityFixes.map((fix, index) => <li key={index}>{fix}</li>)}
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {report.strengths.length > 0 && (
              <Alert variant="success">
                <CheckCircle className="size-4" />
                <AlertTitle>Strengths</AlertTitle>
                <AlertDescription>
                  <ul className="space-y-1">
                    {report.strengths.map((strength, index) => <li key={index}>✓ {strength}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="mb-3 font-display text-lg font-bold">Section breakdown</h3>
              <div className="space-y-2">
                {report.sections.map((section) => <SectionCard key={section.name} section={section} />)}
              </div>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Keyword analysis</CardTitle>
                <p className="text-xs text-muted-foreground">Density: {report.keywords.density}%</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium text-primary">
                      Found ({report.keywords.found.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.keywords.found.slice(0, 15).map((keyword) => (
                        <Badge key={keyword} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-amber-600">
                      Missing ({report.keywords.missing.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.keywords.missing.slice(0, 10).map((keyword) => (
                        <Badge key={keyword} variant="outline" className="border-amber-500/30 text-amber-600">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button asChild size="lg" className="w-full">
              <Link href={`/resume/builder/${selectedResumeId}`}>
                Fix issues in builder <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
