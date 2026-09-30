"use client";

import { useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/signal";

/**
 * Drives a scene from progress 0 to 1, once, when it scrolls into view.
 *
 * The server and the first client render both show the finished frame (p = 1), so no-JS,
 * print and reduced motion get the complete picture. When motion is allowed, the scene
 * rewinds to its start while it is still off screen, then plays when half of it is visible.
 */
export function useScene(duration: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [p, setP] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let started = false;

    const play = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const q = clamp((now - t0) / duration);
        setP(q);
        if (q < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (started) return;
        const visible = entries[entries.length - 1]?.isIntersecting ?? false;
        setP(0);
        if (visible) {
          started = true;
          io.disconnect();
          play();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    // Printing always shows the finished frame.
    const onPrint = () => {
      started = true;
      cancelAnimationFrame(raf);
      setP(1);
    };
    window.addEventListener("beforeprint", onPrint);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("beforeprint", onPrint);
    };
  }, [duration]);

  return { ref, p };
}
