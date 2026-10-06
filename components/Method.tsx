"use client";

import { useEffect, useRef } from "react";
import { method } from "@/content/site";
import { STILL_P, STILL_T, activeStep, stageFrame, type StageFrame } from "@/lib/stage";
import { clamp } from "@/lib/signal";
import styles from "./Method.module.css";

const SSR_W = 1440;
const SSR_H = 340;
const SSR_FRAME = stageFrame(0, 0, SSR_W, SSR_H, { inset: 48 });

function StillFrame({ index }: { index: number }) {
  const W = 480;
  const H = 150;
  const f = stageFrame(STILL_P[index], STILL_T, W, H, { inset: 6, step: 3 });
  const gid = `still-alert-${index}`;
  return (
    <svg
      className={styles.still}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={f.alertX0} x2={f.alertX1} y1="0" y2="0">
          <stop offset="0" className={styles.stopClear} />
          <stop offset="0.3" className={styles.stop} />
          <stop offset="0.7" className={styles.stop} />
          <stop offset="1" className={styles.stopClear} />
        </linearGradient>
      </defs>
      <line className={styles.center} x1="0" x2={W} y1={f.mid} y2={f.mid} />
      <g opacity={f.band.opacity}>
        <rect className={styles.bandFill} x="0" y={f.band.y0} width={f.band.x1} height={f.band.y1 - f.band.y0} />
        <line className={styles.bandEdge} x1="0" x2={f.band.x1} y1={f.band.y0} y2={f.band.y0} />
        <line className={styles.bandEdge} x1="0" x2={f.band.x1} y1={f.band.y1} y2={f.band.y1} />
      </g>
      <path className={styles.base} d={f.base} />
      <path className={styles.alert} d={f.alert} stroke={`url(#${gid})`} opacity={f.alertOpacity} />
      <rect
        className={styles.cell}
        x={f.rect.x}
        y={f.rect.y}
        width={f.rect.w}
        height={f.rect.h}
        opacity={f.rect.opacity}
      />
      <g transform={f.lockTransform} opacity={f.cornersOpacity}>
        <path className={styles.corners} d={f.corners} />
      </g>
    </svg>
  );
}

export default function Method() {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const centerRef = useRef<SVGLineElement>(null);
  const bandRef = useRef<SVGGElement>(null);
  const bandFillRef = useRef<SVGRectElement>(null);
  const bandTopRef = useRef<SVGLineElement>(null);
  const bandBottomRef = useRef<SVGLineElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const alertRef = useRef<SVGPathElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const cellRef = useRef<SVGRectElement>(null);
  const lockRef = useRef<SVGGElement>(null);
  const cornersRef = useRef<SVGPathElement>(null);
  const normalLabelRef = useRef<SVGTextElement>(null);
  const anomalyLabelRef = useRef<SVGTextElement>(null);
  const containedLabelRef = useRef<SVGTextElement>(null);
  const barsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;
    const svg = svgRef.current;
    const center = centerRef.current;
    const band = bandRef.current;
    const bandFill = bandFillRef.current;
    const bandTop = bandTopRef.current;
    const bandBottom = bandBottomRef.current;
    const base = baseRef.current;
    const alert = alertRef.current;
    const grad = gradRef.current;
    const cell = cellRef.current;
    const lock = lockRef.current;
    const corners = cornersRef.current;
    const nl = normalLabelRef.current;
    const al = anomalyLabelRef.current;
    const cl = containedLabelRef.current;
    const bars = barsRef.current;
    if (
      !section || !visual || !svg || !center || !band || !bandFill || !bandTop || !bandBottom ||
      !base || !alert || !grad || !cell || !lock || !corners || !nl || !al || !cl || !bars
    )
      return;

    // CSS decides the mode (pinned and live, or a static list). JS follows it.
    const isLive = () => getComputedStyle(section).getPropertyValue("--stage-mode").trim() === "live";
    const fills = Array.from(bars.querySelectorAll<HTMLElement>("i"));

    let W = 1;
    let H = 1;
    let inset = 16;
    let raf = 0;
    let running = false;
    let inView = false;
    let last = 0;
    let t = 0;
    let lastActive = -1;
    let top = 0; // section top in page coordinates, refreshed in measure()
    let span = 0;

    const setLabel = (el: SVGTextElement, l: StageFrame["normalLabel"]) => {
      el.setAttribute("x", l.x.toFixed(1));
      el.setAttribute("y", l.y.toFixed(1));
      el.style.opacity = l.opacity.toFixed(3);
    };

    const progress = () => (span > 0 ? clamp((window.scrollY - top) / span) : 0);

    const draw = () => {
      const p = progress();
      const f = stageFrame(p, t, W, H, { inset });
      center.setAttribute("x2", String(W));
      center.setAttribute("y1", String(f.mid));
      center.setAttribute("y2", String(f.mid));
      band.style.opacity = f.band.opacity.toFixed(3);
      bandFill.setAttribute("y", f.band.y0.toFixed(1));
      bandFill.setAttribute("width", f.band.x1.toFixed(1));
      bandFill.setAttribute("height", (f.band.y1 - f.band.y0).toFixed(1));
      bandTop.setAttribute("x2", f.band.x1.toFixed(1));
      bandTop.setAttribute("y1", f.band.y0.toFixed(1));
      bandTop.setAttribute("y2", f.band.y0.toFixed(1));
      bandBottom.setAttribute("x2", f.band.x1.toFixed(1));
      bandBottom.setAttribute("y1", f.band.y1.toFixed(1));
      bandBottom.setAttribute("y2", f.band.y1.toFixed(1));
      base.setAttribute("d", f.base);
      alert.setAttribute("d", f.alert);
      alert.style.opacity = f.alertOpacity.toFixed(3);
      grad.setAttribute("x1", f.alertX0.toFixed(1));
      grad.setAttribute("x2", f.alertX1.toFixed(1));
      cell.setAttribute("x", f.rect.x.toFixed(1));
      cell.setAttribute("y", f.rect.y.toFixed(1));
      cell.setAttribute("width", f.rect.w.toFixed(1));
      cell.setAttribute("height", f.rect.h.toFixed(1));
      cell.style.opacity = f.rect.opacity.toFixed(3);
      lock.setAttribute("transform", f.lockTransform);
      lock.style.opacity = f.cornersOpacity.toFixed(3);
      corners.setAttribute("d", f.corners);
      setLabel(nl, f.normalLabel);
      setLabel(al, f.anomalyLabel);
      setLabel(cl, f.containedLabel);

      for (let i = 0; i < fills.length; i++) {
        fills[i].style.transform = `scaleX(${clamp((p - i / 3) * 3).toFixed(4)})`;
      }
      const a = activeStep(p);
      if (a !== lastActive) {
        lastActive = a;
        section.dataset.active = String(a);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      draw();
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
      if (isLive() && inView && !document.hidden) start();
      else stop();
    };

    const measure = () => {
      W = Math.max(1, Math.round(visual.clientWidth));
      H = Math.max(1, Math.round(visual.clientHeight));
      // Align the "normal" label with the text column above it.
      const container = section.querySelector<HTMLElement>(".container");
      if (container) {
        const cs = getComputedStyle(container);
        const left =
          container.getBoundingClientRect().left - visual.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
        inset = Math.max(16, Math.round(left));
      }
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      top = section.getBoundingClientRect().top + window.scrollY;
      span = section.offsetHeight - window.innerHeight;
      if (isLive()) draw();
      sync();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(visual);
    // Content above can change height (font swap, wrapping), which moves the section.
    ro.observe(document.body);
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(section);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => {
      measure();
    };
    mq.addEventListener("change", onMq);
    document.addEventListener("visibilitychange", sync);
    measure();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const f = SSR_FRAME;

  return (
    <section
      ref={sectionRef}
      id="method"
      className={styles.stage}
      aria-labelledby="method-title"
      data-active="0"
    >
      <div className={styles.sticky}>
        <div className={`container ${styles.top}`}>
          <div className={styles.head}>
            <h2 id="method-title" className={styles.title} data-rail="">
              {method.title}
            </h2>
            <span ref={barsRef} className={styles.bars} aria-hidden="true">
              <span>
                <i />
              </span>
              <span>
                <i />
              </span>
              <span>
                <i />
              </span>
            </span>
          </div>
          <ol className={styles.steps}>
            {method.steps.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <StillFrame index={i} />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div ref={visualRef} className={styles.visual}>
          <svg
            ref={svgRef}
            className={styles.svg}
            viewBox={`0 0 ${SSR_W} ${SSR_H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={method.description}
          >
            <defs>
              <linearGradient
                ref={gradRef}
                id="stage-alert"
                gradientUnits="userSpaceOnUse"
                x1={f.alertX0}
                x2={f.alertX1}
                y1="0"
                y2="0"
              >
                <stop offset="0" className={styles.stopClear} />
                <stop offset="0.3" className={styles.stop} />
                <stop offset="0.7" className={styles.stop} />
                <stop offset="1" className={styles.stopClear} />
              </linearGradient>
            </defs>
            <line ref={centerRef} className={styles.center} x1="0" x2={SSR_W} y1={f.mid} y2={f.mid} />
            <g ref={bandRef} opacity="0">
              <rect ref={bandFillRef} className={styles.bandFill} x="0" y={f.band.y0} width="0" height={f.band.y1 - f.band.y0} />
              <line ref={bandTopRef} className={styles.bandEdge} x1="0" x2="0" y1={f.band.y0} y2={f.band.y0} />
              <line ref={bandBottomRef} className={styles.bandEdge} x1="0" x2="0" y1={f.band.y1} y2={f.band.y1} />
            </g>
            <path ref={baseRef} className={styles.base} d={f.base} />
            <path ref={alertRef} className={styles.alert} d="M0 0" stroke="url(#stage-alert)" opacity="0" />
            <rect ref={cellRef} className={styles.cell} x="0" y="0" width="0" height="0" opacity="0" />
            <g ref={lockRef} opacity="0">
              <path ref={cornersRef} className={styles.corners} d="M0 0" />
            </g>
            <text ref={normalLabelRef} className={`${styles.label} ${styles.labelNormal}`} x="0" y="0" opacity="0">
              {method.labels.normal}
            </text>
            <text ref={anomalyLabelRef} className={`${styles.label} ${styles.labelAlert}`} x="0" y="0" opacity="0">
              {method.labels.anomaly}
            </text>
            <text ref={containedLabelRef} className={`${styles.label} ${styles.labelContained}`} x="0" y="0" opacity="0">
              {method.labels.contained}
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
