import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import type { Metadata, Viewport } from 'next';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

// The Font Awesome CSS is imported above; stop the library injecting it again
// at runtime (which causes oversized icon flashes in Next.js).
fontAwesomeConfig.autoAddCss = false;

export const metadata: Metadata = {
  title: {
    default: 'AutoVista — Know the right price before you buy',
    template: '%s | AutoVista',
  },
  description:
    'AutoVista is a premium Sri Lankan vehicle marketplace with AI-powered price prediction trained on thousands of real listings.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

/**
 * Applies the persisted (or system-preferred) theme before first paint so
 * users never see a flash of the wrong theme.
 */
const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem('autovista:theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
