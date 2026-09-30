import localFont from "next/font/local";

// Self-hosted, no third-party font requests (keeps the CSP at font-src 'self').
// Instrument Sans (OFL) variable weight axis, IBM Plex Mono (OFL) 400 and 500.
export const instrument = localFont({
  src: "./fonts/InstrumentSans-Variable.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-instrument",
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const plexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-plex-mono",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "Menlo", "monospace"],
});
