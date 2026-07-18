import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { GoogleProvider } from '@/components/providers/GoogleProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | ResumeForge',
    default: 'ResumeForge — The completely free AI resume builder',
  },
  description:
    'Build ATS-friendly resumes, improve your writing, tailor applications, export PDF and DOCX files, and publish a portfolio. Every feature and template is free.',
  keywords: [
    'free resume builder',
    'ATS resume',
    'AI resume writer',
    'cover letter generator',
    'job match',
    'resume templates',
  ],
  authors: [{ name: 'ResumeForge' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'ResumeForge',
    title: 'ResumeForge — Every resume tool, completely free',
    description: 'A polished, ATS-aware resume builder with AI writing, seven templates, and unlimited exports.',
    images: [
      {
        url: '/og-resumeforge.png',
        width: 1735,
        height: 906,
        alt: 'ResumeForge free career toolkit and resume builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeForge — Every resume tool, completely free',
    description: 'Build, tailor, and export a stronger resume without premium locks or watermarks.',
    images: ['/og-resumeforge.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <GoogleProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
        </GoogleProvider>
      </body>
    </html>
  );
}
