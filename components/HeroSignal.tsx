"use client";

import { useEffect, useRef, useState } from "react";
import {
  BURST,
  HERO_AMP,
  HERO_SPOTS,
  burst,
  burstEnvelope,
  clamp,
  cornersPath,
  easeOutCubic,
  heroStaticPath,
  limit,
  normal,
  pathFor,
  reachFor,
  smoothstep,
} from "@/lib/signal";
import styles from "./HeroSignal.module.css";

// The server renders a wide, calm frame. With xMinYMid slice at the usual 160px height,
// the first client frame lines up with it, so hydration does not jump.
const SSR_W = 2560;
const SSR_H = 160;
const SSR_PATH = heroStaticPath(SSR_W, SSR_H);

type Props = { label: string; description: string; hint: string };

// A poke is ignored for this long after the previous one started.
const POKE_COOLDOWN = 1.2;

export default function HeroSignal({ label, description, hint }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const alertRef = useRef<SVGPathElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const boxRef = useRef<SVGGElement>(null);
  const cornersRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<SVGTextElement>(null);
  const pausedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const [paused, setPaused] = useState(false);
  const [hinted, setHinted] = useState(true);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    syncRef.current();
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const base = baseRef.current;
    const alert = alertRef.current;
    const grad = gradRef.current;
    const box = boxRef.current;
    const corners = cornersRef.current;
    const text = labelRef.current;
    if (!wrap || !svg || !base || !alert || !grad || !box || !corners || !text) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let W = Math.max(1, Math.round(wrap.clientWidth));
    let H = Math.max(1, Math.round(wrap.clientHeight)) || SSR_H;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let clock = 0;
    // A poke replaces the scheduled burst. After it, the schedule restarts from `epoch`.
    let manual: { cx: number; t0: number } | null = null;
    let epoch = 0;
    let lastPoke = -Infinity;
    const sigmaFor = () => (W < 640 ? 13 : 19);

    const render = (t: number, cx: number, E: number, flag: number, lock: number) => {
      const mid = H / 2;
      const h = H / 2;
      const sigma = sigmaFor();
      const amp = HERO_AMP * h;
      const reach = reachFor(amp, h, 3);
      // A soft limiter keeps every excursion inside the detection box.
      const y = (x: number) => {
        const v = h * normal(x, t) + (E > 0.001 ? amp * E * burst(x, t, cx, sigma) : 0);
        return mid - limit(v, reach);
      };

      base.setAttribute("d", pathFor(y, 0, W, 3));

      const colorAmt = flag * smoothstep(0.02, 0.25, E);
      if (colorAmt > 0.01) {
        // Same sampling grid as the base line, so the highlight covers it exactly.
        const a0 = Math.max(0, Math.floor((cx - 3 * sigma) / 3) * 3);
        const a1 = Math.min(W, Math.ceil((cx + 3 * sigma) / 3) * 3);
        alert.setAttribute("d", pathFor(y, a0, a1, 3));
        grad.setAttribute("x1", a0.toFixed(1));
        grad.setAttribute("x2", a1.toFixed(1));
        alert.style.opacity = colorAmt.toFixed(3);
      } else {
        alert.style.opacity = "0";
      }

      if (flag > 0.01) {
        const pad = 7;
        const x0 = cx - 2.4 * sigma - pad;
        const x1 = cx + 2.4 * sigma + pad;
        const y0 = mid - reach;
        const y1 = mid + reach;
        corners.setAttribute("d", cornersPath(x0, y0, x1, y1, 9));
        const s = 1.32 - 0.32 * lock;
        box.setAttribute(
          "transform",
          `translate(${cx.toFixed(1)} ${mid}) scale(${s.toFixed(4)}) translate(${(-cx).toFixed(1)} ${-mid})`,
        );
        box.style.opacity = (flag * smoothstep(0, 0.35, lock)).toFixed(3);
        text.setAttribute("x", x0.toFixed(1));
        text.setAttribute("y", (y0 - 7).toFixed(1));
        text.style.opacity = (flag * smoothstep(0.55, 1, lock)).toFixed(3);
      } else {
        box.style.opacity = "0";
        text.style.opacity = "0";
      }
    };

    const paint = (t: number, cx: number, tau: number) => {
      const E = burstEnvelope(tau);
      const flagIn = smoothstep(BURST.flagStart, BURST.flagStart + 0.12, tau);
      const flagOut = 1 - smoothstep(BURST.flagEnd - 0.45, BURST.flagEnd, tau);
      const lock = easeOutCubic((tau - BURST.flagStart) / 0.34);
      render(t, cx, E, flagIn * flagOut, lock);
    };

    const frame = (t: number) => {
      if (manual) {
        const tau = t - manual.t0;
        if (tau <= BURST.flagEnd) {
          paint(t, manual.cx, tau);
          return;
        }
        manual = null;
        epoch = t;
      }
      const since = t - epoch - BURST.firstAt;
      if (since < 0) {
        render(t, W * HERO_SPOTS[0], 0, 0, 0);
        return;
      }
      const n = Math.floor(since / BURST.period);
      paint(t, W * HERO_SPOTS[n % HERO_SPOTS.length], since - n * BURST.period);
    };

    // Tap or click the line to make an anomaly right there. A drag is a scroll, not a poke.
    let down: { x: number; y: number; at: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY, at: performance.now() };
    };
    const onUp = (e: PointerEvent) => {
      const d = down;
      down = null;
      if (!d || !running || reduce.matches || pausedRef.current) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8 || performance.now() - d.at > 350) return;
      if (clock - lastPoke < POKE_COOLDOWN) return;
      // Keep the whole detection box inside the viewport.
      const margin = 2.4 * sigmaFor() + 9;
      const x = e.clientX - svg.getBoundingClientRect().left;
      manual = { cx: clamp(x, margin, Math.max(margin, W - margin)), t0: clock };
      lastPoke = clock;
      setHinted(false);
    };
    const onCancel = () => {
      down = null;
    };
    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onCancel);

    // Reduced motion: one still frame that still tells the story.
    const renderStill = () => render(0.62, W * HERO_SPOTS[0], 1, 1, 1);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      frame(clock);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (reduce.matches) {
        stop();
        renderStill();
        return;
      }
      if (visible && !document.hidden && !pausedRef.current) start();
      else stop();
    };
    syncRef.current = sync;

    const measure = () => {
      W = Math.max(1, Math.round(wrap.clientWidth));
      H = Math.max(1, Math.round(wrap.clientHeight)) || SSR_H;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      if (reduce.matches) renderStill();
      else if (!running) frame(clock);
    };

    measure();
    frame(0);

    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    sync();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onCancel);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${SSR_W} ${SSR_H}`}
        preserveAspectRatio="xMinYMid slice"
        role="img"
        aria-label={description}
      >
        <defs>
          <linearGradient ref={gradRef} id="hero-alert" gradientUnits="userSpaceOnUse" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" className={styles.stopClear} />
            <stop offset="0.3" className={styles.stop} />
            <stop offset="0.7" className={styles.stop} />
            <stop offset="1" className={styles.stopClear} />
          </linearGradient>
        </defs>
        <path ref={baseRef} className={styles.base} d={SSR_PATH} />
        <path ref={alertRef} className={styles.alert} d="M0 0" stroke="url(#hero-alert)" opacity="0" />
        <g ref={boxRef} className={styles.box} opacity="0">
          <path ref={cornersRef} className={styles.corners} d="M0 0" />
        </g>
        <text ref={labelRef} className={styles.label} x="0" y="0" opacity="0">
          {label}
        </text>
      </svg>
      {hinted ? (
        <span className={styles.hint} aria-hidden="true">
          {hint}
        </span>
      ) : null}
      <button
        type="button"
        className={styles.pause}
        onClick={toggle}
        aria-label={paused ? "Play the signal animation" : "Pause the signal animation"}
      >
        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" focusable="false">
          {paused ? (
            <path d="M3 2l7 4-7 4z" fill="currentColor" />
          ) : (
            <path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" />
          )}
        </svg>
        <span aria-hidden="true">{paused ? "play" : "pause"}</span>
      </button>
    </div>
  );
}
