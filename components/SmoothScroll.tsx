"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { LIVE_QUERY } from "@/lib/motion";
import { setPageScroll } from "@/lib/smooth";

// Eases the mouse wheel and in-page links (the keyboard keeps the browser's own scrolling). It scrolls the real page
// (scrollY and position: sticky keep working, so the scroll stories are unaffected), and touch
// stays native. Off without script, and off for reduced motion, where the page scrolls as usual.
export default function SmoothScroll() {
  useEffect(() => {
    const mode = window.matchMedia(LIVE_QUERY);
    let lenis: Lenis | null = null;

    const start = () => {
      if (lenis || !mode.matches) return;
      // In-page links stop below the floating nav: Lenis honors the page's scroll-padding-top.
      lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
      setPageScroll(lenis);
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
      setPageScroll(null);
    };
    const sync = () => (mode.matches ? start() : stop());

    start();
    mode.addEventListener("change", sync);
    return () => {
      mode.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
