"use client";

import { useEffect, useRef } from "react";
import { onAnomaly } from "@/lib/anomaly";
import { clamp, noise1, smoothstep } from "@/lib/signal";
import styles from "./Rail.module.css";

// The thread that ties the page together. A vertical trace in the left gutter grows out of
// the bottom of the hero, branches into every section title and ends at the contact title.
// It is still while you are still: scrolling stirs it, a burst elsewhere on the page shows
// up on it in amber, and then it settles. No frames are drawn while nothing changes.

type Burst = { pageY: number; t0: number };

const BURST_LIFE = 2.4; // seconds
const READ_LINE = 0.42; // the reading position, as a fraction of the viewport height

export default function Rail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = getComputedStyle(document.documentElement);
    const color = (name: string) => root.getPropertyValue(name).trim();
    const C = {
      signal: color("--signal"),
      dim: color("--signal-dim"),
      line: color("--line-strong"),
      alert: color("--alert"),
    };

    type Title = { el: HTMLElement; half: number };
    let hero: HTMLElement | null = null;
    let stage: HTMLElement | null = null;
    let end: Title | null = null;
    let titles: Title[] = [];

    let W = 0;
    let H = 0;
    let dpr = 1;
    let spineX = 0;
    let branchEnd = 0;
    let active = false;
    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let energy = 0;
    const bursts: Burst[] = [];

    // Everything that does not change while scrolling is read here, not per frame.
    const measure = () => {
      active = getComputedStyle(canvas).display !== "none";
      if (!active) return;
      hero = document.getElementById("top");
      stage = document.getElementById("method");
      titles = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]")).map((el) => {
        const fs = parseFloat(getComputedStyle(el).fontSize) || 40;
        const lh = parseFloat(getComputedStyle(el).lineHeight) || fs * 1.08;
        return { el, half: lh / 2 };
      });
      end = titles.find((t) => t.el.closest("#contact")) ?? null;
      const container = document.querySelector<HTMLElement>("main .container");
      if (!container) return;
      const r = container.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(container).paddingLeft) || 32;
      const contentLeft = r.left + pad;
      spineX = Math.round(Math.max(14, contentLeft - pad * 0.72)) + 0.5;
      branchEnd = contentLeft - 12;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.ceil(contentLeft);
      H = window.innerHeight;
      canvas.width = Math.ceil(W * dpr);
      canvas.height = Math.ceil(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (!hero || !end) return;

      // Centre of a title's first line.
      const centerOf = (t: Title) => t.el.getBoundingClientRect().top + t.half;

      const y0 = Math.max(0, hero.getBoundingClientRect().bottom);
      const y1 = Math.min(H, centerOf(end));
      if (y1 <= y0) return;

      const scroll = window.scrollY;
      const s = stage?.getBoundingClientRect();
      const amp = 0.7 + energy * 7;

      // Bursts live in page coordinates, so they scroll away with the content they belong to.
      const t = now / 1000;
      for (let i = bursts.length - 1; i >= 0; i--) if (t - bursts[i].t0 > BURST_LIFE) bursts.splice(i, 1);
      const burstAt = (pageY: number) => {
        let v = 0;
        for (const b of bursts) {
          const age = t - b.t0;
          const env = smoothstep(0, 0.18, age) * (1 - smoothstep(1.1, BURST_LIFE, age));
          const d = (pageY - b.pageY) / 22;
          v += env * Math.exp(-d * d) * Math.sin(pageY / 2.6 + age * 24) * 11;
        }
        return v;
      };

      // The spine. Its wiggle is fixed to the page and its size follows how fast you scroll.
      const xAt = (y: number) => {
        const py = y + scroll;
        const shape = 0.6 * Math.sin(py / 19) + 0.4 * noise1(py / 7);
        return spineX + amp * shape + burstAt(py);
      };

      const segment = (from: number, to: number, stroke: string, alpha: number) => {
        if (to <= from) return;
        ctx.beginPath();
        for (let y = from; y <= to; y += 2) {
          const x = xAt(y);
          if (y === from) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      // Quieter where it passes behind the pinned stage, which has a line of its own.
      if (s && s.bottom > y0 && s.top < y1) {
        segment(y0, Math.max(y0, s.top), C.signal, 0.5);
        segment(Math.max(y0, s.top), Math.min(y1, s.bottom), C.dim, 0.4);
        segment(Math.min(y1, s.bottom), y1, C.signal, 0.5);
      } else {
        segment(y0, y1, C.signal, 0.5);
      }

      // Amber where a burst is still ringing.
      for (const b of bursts) {
        const by = b.pageY - scroll;
        if (by < y0 - 60 || by > y1 + 60) continue;
        const age = t - b.t0;
        const alpha = smoothstep(0, 0.1, age) * (1 - smoothstep(1.4, BURST_LIFE, age));
        segment(Math.max(y0, by - 54), Math.min(y1, by + 54), C.alert, alpha);
      }

      // Branches into each section title. The one you are reading is lit.
      const read = H * READ_LINE;
      let current = -1;
      const ys = titles.map(centerOf);
      ys.forEach((y, i) => {
        if (y <= read) current = i;
      });
      ys.forEach((y, i) => {
        if (y < y0 - 4 || y > y1 + 4) return;
        const lit = i === current;
        const x = xAt(y);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(branchEnd, y);
        ctx.strokeStyle = lit ? C.signal : C.line;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, lit ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = lit ? C.signal : C.line;
        ctx.fill();
      });

    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.max(0.001, Math.min(0.1, (now - lastT) / 1000));
      lastT = now;
      const y = window.scrollY;
      if (!reduce.matches) {
        const speed = Math.abs(y - lastY) / dt; // px per second
        energy = Math.max(energy * Math.exp(-dt / 0.35), clamp(speed / 2600));
      } else {
        energy = 0;
      }
      lastY = y;
      draw(now);
      if (energy > 0.01 || bursts.length) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!active || raf) return;
      lastT = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      wake();
    };

    const off = onAnomaly(({ y, still }) => {
      if (still || y === undefined || reduce.matches) return;
      bursts.push({ pageY: y + window.scrollY, t0: performance.now() / 1000 });
      wake();
    });

    measure();
    wake();
    // Late layout (fonts, images) moves the titles; redraw once things settle.
    document.fonts?.ready.then(() => {
      measure();
      wake();
    });

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduce.addEventListener("change", wake);

    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", wake);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.rail} aria-hidden="true" />;
}
