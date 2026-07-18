import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Using ResumeForge',
    body: 'You may use ResumeForge to create resumes, cover letters, portfolios, and related career materials. You are responsible for the accuracy and legality of the content you enter and export.',
  },
  {
    title: 'Free access',
    body: 'ResumeForge currently provides its product features and templates without a paid tier. Free access does not guarantee uninterrupted availability, and reasonable safeguards may be used to prevent abuse of shared infrastructure.',
  },
  {
    title: 'Your content',
    body: 'You retain ownership of the content you provide. You grant ResumeForge only the limited permission needed to store, process, render, and export that content at your request.',
  },
  {
    title: 'AI-assisted content',
    body: 'AI suggestions can be incomplete or inaccurate. Review every generated statement before using it in an application, and do not present invented credentials or experience as fact.',
  },
  {
    title: 'Account security',
    body: 'Keep your credentials private and notify the service owner if you believe your account has been accessed without permission. You may not attempt to disrupt the service or access another user’s data.',
  },
  {
    title: 'Service disclaimer',
    body: 'ResumeForge is provided as available without a guarantee of employment outcomes, recruiter acceptance, or compatibility with every applicant tracking system.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="mb-5">
          <Link href="/auth/signup"><ArrowLeft />Back to sign up</Link>
        </Button>
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </span>
              <Badge variant="secondary">Effective July 18, 2026</Badge>
            </div>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription>
              Plain-language terms for using ResumeForge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            {sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="font-display text-lg font-semibold">{section.title}</h2>
                <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
              </section>
            ))}
            <Separator />
            <p className="text-sm text-muted-foreground">
              Questions about these terms can be directed to the repository owner. See
              the <Button asChild variant="link" className="h-auto px-1"><Link href="/privacy">Privacy Policy</Link></Button>
              for details about personal data.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
