import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
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
    title: 'Data you provide',
    body: 'ResumeForge processes account details such as your name and email, plus the resume, application, and profile information you choose to enter.',
  },
  {
    title: 'Google sign-in',
    body: 'When you choose Google sign-in, ResumeForge receives your Google account identifier, verified email address, name, and profile image. It does not receive your Google password.',
  },
  {
    title: 'How data is used',
    body: 'Your data is used to authenticate you, save and export your work, provide requested AI assistance, operate security controls, and improve service reliability.',
  },
  {
    title: 'Storage and service providers',
    body: 'Account and resume data may be stored in the configured database and processed by the hosting, database, email, and AI providers used to run ResumeForge. Browser session tokens are stored locally on the device you use.',
  },
  {
    title: 'Sharing',
    body: 'ResumeForge does not sell personal data. Information is shared with infrastructure providers only as needed to deliver the service, or when required by law.',
  },
  {
    title: 'Your choices',
    body: 'You can edit profile information and exported documents at any time. To request account or stored-data deletion, contact the repository owner until self-service deletion is available.',
  },
  {
    title: 'Security and retention',
    body: 'Reasonable technical safeguards are used, but no online service can guarantee absolute security. Data is retained while needed to provide the account and meet legitimate operational or legal requirements.',
  },
];

export default function PrivacyPage() {
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
                <LockKeyhole className="h-4 w-4" />
              </span>
              <Badge variant="secondary">Effective July 18, 2026</Badge>
            </div>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>
              What ResumeForge processes and why.
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
              This policy should be updated if deployment providers or data practices
              change. Review the <Button asChild variant="link" className="h-auto px-1"><Link href="/terms">Terms of Service</Link></Button>
              alongside it.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
