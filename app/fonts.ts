import localFont from "next/font/local";

// Self-hosted, no third-party font requests (keeps the CSP at font-src 'self').
// Instrument Sans (OFL) carries the reading text. Martian Mono (OFL) carries everything
// that is part of the instrument: headlines, labels and readouts. It is one variable file
// with a weight axis (100 to 800) and a width axis (75% to 112.5%).
export const instrument = localFont({
  src: "./fonts/InstrumentSans-Variable.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-instrument",
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const martian = localFont({
  src: "./fonts/MartianMono-Variable.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-martian",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
  declarations: [{ prop: "font-stretch", value: "75% 112.5%" }],
});
