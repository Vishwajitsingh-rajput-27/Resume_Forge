'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">
            Something interrupted the flow.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your saved data is still available. Try this screen again.
          </p>
          <Button onClick={reset} className="mt-6">
            <RotateCcw />
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
