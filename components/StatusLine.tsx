"use client";

import { useEffect, useState } from "react";

const LINES = [
  "hardening AI models against prompt injection",
  "practicing a Some Jazz song by ear",
  "A/B testing DACs the desk rig doesn't need",
  "queuing the next HoloEN clip",
  "still deciding: M2 Pro or M4 Air",
  "reorganizing a sneaker shelf that lost the fight",
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
    <p className="font-mono text-sm text-muted sm:text-base">
      <span className="text-accent2">$</span> currently:{" "}
      <span key={index} className="status-swap inline-block text-ink">
        {LINES[index]}
      </span>
      <span className="cursor-blink ml-1 text-accent">▌</span>
    </p>
  );
}
