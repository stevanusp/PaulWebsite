import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://paulus.dev"; // TODO: replace with your real domain
const SITE_TITLE = "Stevanus Paulus — Cybersecurity Analyst & Off-duty Tinkerer";
const SITE_DESCRIPTION =
  "Personal site of Paulus: cybersecurity analyst in Jakarta working on NAC, Secure Access, IPS and proxy — also a by-ear pianist, audiophile, and sneaker collector.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Paulus",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Paulus" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Paulus",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e13" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Set theme before paint to avoid a light/dark flash on load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  document.documentElement.classList.add('motion-ready');
                  var stored = localStorage.getItem('theme');
                  var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Without JS, reveal elements must not stay hidden. */}
        <noscript>
          <style>{`.reveal-onscroll{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      <body className="bg-bg text-ink font-sans antialiased">
        <a href="#top-content" className="skip-link rounded bg-ink px-4 py-2 font-mono text-sm text-bg">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
