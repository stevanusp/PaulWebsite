import type { Config } from "tailwindcss";

// Colors are wired to CSS variables (see app/globals.css) that flip
// automatically based on the html[data-theme] attribute. No Tailwind
// `dark:` variant needed — bg-bg / text-ink etc. already respond to
// whichever theme is active.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        ink: "var(--text)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        prose: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
