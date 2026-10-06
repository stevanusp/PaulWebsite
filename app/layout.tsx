import type { Metadata, Viewport } from "next";
import { instrument, martian } from "./fonts";
import { site } from "@/content/site";
import ConsoleNote from "@/components/ConsoleNote";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Stevanus Paulus. I listen for what doesn't belong.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#070908",
  colorScheme: "dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Cyber Security Analyst",
  worksFor: { "@type": "Organization", name: "Bank Central Asia" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "BINUS University" },
  address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" },
  sameAs: [site.linkedin],
  knowsAbout: [
    "Network access control",
    "Zero Trust",
    "Secure web gateway",
    "Intrusion prevention",
    "Data loss prevention",
    "AI security",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${martian.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          // Static, trusted data. Serialized once at build time.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <ConsoleNote />
      </body>
    </html>
  );
}
