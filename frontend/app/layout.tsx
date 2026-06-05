import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: { template: '%s | ResumeAI', default: 'ResumeAI — Build ATS-Optimized Resumes with AI' },
  description:
    'Create ATS-friendly resumes, generate cover letters, match job descriptions, and build portfolio websites — all powered by free AI. Trusted by 10,000+ professionals.',
  keywords: ['resume builder', 'ATS resume', 'AI cover letter', 'job matching', 'portfolio website'],
  authors: [{ name: 'ResumeAI' }],
  openGraph: {
    type: 'website',
    siteName: 'ResumeAI',
    title: 'ResumeAI — AI-Powered Career Platform',
    description: 'Build ATS-optimized resumes with AI. Free forever.',
  },
  twitter: { card: 'summary_large_image', title: 'ResumeAI', description: 'AI Resume Builder' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                style: {
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
