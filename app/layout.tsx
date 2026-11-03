import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Public_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PulseForge AI — YouTube & Facebook Content Automation OS',
  description:
    'Complete end-to-end YouTube and Facebook AI content automation system covering trend intelligence, 7-factor idea scoring, fact-checking, multi-format scriptwriting, creative production, 8-point video QC, authorized publishing, analytics optimization, community comment triage, and human approval gates.',
  openGraph: {
    title: 'PulseForge AI — YouTube & Facebook Content Automation OS',
    description:
      'Complete end-to-end YouTube and Facebook AI content automation system covering trend intelligence, 7-factor idea scoring, fact-checking, multi-format scriptwriting, creative production, 8-point video QC, authorized publishing, analytics optimization, community comment triage, and human approval gates.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseForge AI — YouTube & Facebook Content Automation OS',
    description:
      'Complete end-to-end YouTube and Facebook AI content automation system covering trend intelligence, 7-factor idea scoring, fact-checking, multi-format scriptwriting, creative production, 8-point video QC, authorized publishing, analytics optimization, community comment triage, and human approval gates.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${publicSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('pf_theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen overflow-x-hidden relative"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
