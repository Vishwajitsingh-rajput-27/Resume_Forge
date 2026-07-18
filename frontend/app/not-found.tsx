import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileQuestion className="h-5 w-5" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            404
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            This page is not part of your resume.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The link may be outdated, or the page may have moved.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Open workspace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
