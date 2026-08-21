"use client";

import { useEffect, useState } from "react";

const LINES = [
  "tuning access policy for real network behavior",
  "following the signal through a tricky access issue",
  "practicing a piano arrangement by ear",
  "A/B testing DACs the desk rig does not need",
  "making room for one more pair of sneakers",
];

export default function StatusLine() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LINES.length);
    }, 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-sm text-muted sm:text-base" aria-live="polite">
      <span className="text-accent2">$</span> currently:{" "}
      <span key={index} className="status-swap inline-block text-ink will-change-transform">
        {LINES[index]}
      </span>
      <span className="cursor-blink ml-1 text-accent">▌</span>
    </p>
  );
}
