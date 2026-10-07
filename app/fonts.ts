import localFont from "next/font/local";

// Self-hosted, no third-party font requests (keeps the CSP at font-src 'self').
// One family for everything: Instrument Sans (OFL), variable weight 400 to 700.
export const instrument = localFont({
  src: "./fonts/InstrumentSans-Variable.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-instrument",
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
