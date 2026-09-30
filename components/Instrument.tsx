"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ear } from "@/content/site";
import { cornersPath } from "@/lib/signal";
import { getEngine, inKey, type Engine } from "@/lib/epiano";
import styles from "./Instrument.module.css";

// Voicings with smooth voice leading: C, G, Am, F.
const VOICINGS: readonly (readonly number[])[] = [
  [48, 64, 67, 72],
  [43, 62, 67, 71],
  [45, 64, 69, 72],
  [41, 65, 69, 72],
];
// A note outside the key of C: F sharp, a tritone above the tonic.
const WRONG_NOTE = 66;
const FLAG_MS = 1700;
const SPAN = 1024; // samples shown, about 21 ms at 48 kHz
const H = 160;

export default function Instrument() {
  const rootRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const traceRef = useRef<SVGPathElement>(null);
  const cornersRef = useRef<SVGPathElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const rafRef = useRef(0);
  const quietRef = useRef(0);
  const widthRef = useRef(600);
  const historyRef = useRef<number[]>([]);
  const inViewRef = useRef(false);
  const padRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hitTimers = useRef<number[]>([]);

  const [current, setCurrent] = useState<number | null>(null);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const flat = useCallback(() => {
    const W = widthRef.current;
    traceRef.current?.setAttribute("d", `M0 ${H / 2}L${W} ${H / 2}`);
  }, []);

  const loop = useCallback(() => {
    const eng = engineRef.current;
    const trace = traceRef.current;
    if (!eng || !trace) return;
    const a = eng.analyser;
    const buf = new Float32Array(a.fftSize);
    const W = widthRef.current;
    const mid = H / 2;
    const h = H / 2;

    const tick = () => {
      a.getFloatTimeDomainData(buf);
      const N = buf.length;
      let sum = 0;
      for (let i = 0; i < N; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / N);

      // Trigger on an upward zero crossing of a smoothed copy, like a scope's sync.
      const win = 40;
      let acc = 0;
      for (let i = 0; i < win; i++) acc += buf[i];
      let prev = acc / win;
      let armed = false;
      let start = 0;
      for (let i = win; i < N - SPAN; i++) {
        acc += buf[i] - buf[i - win];
        const avg = acc / win;
        if (avg < -0.003) armed = true;
        if (armed && prev < 0 && avg >= 0) {
          start = Math.max(0, i - (win >> 1));
          break;
        }
        prev = avg;
      }

      const count = Math.max(40, Math.floor(W / 3));
      let d = "";
      for (let j = 0; j <= count; j++) {
        const idx = start + Math.floor((j * SPAN) / count);
        const v = Math.tanh((buf[idx] ?? 0) * 2.6);
        const x = (j * W) / count;
        const y = mid - v * h * 0.9;
        d += (j === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
      }
      trace.setAttribute("d", d);

      quietRef.current = rms < 0.0015 ? quietRef.current + 1 : 0;
      if (quietRef.current > 50) {
        flat();
        setCurrent(null);
        if (screenRef.current) screenRef.current.dataset.live = "false";
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [flat]);

  const play = useCallback(
    (index: number) => {
      // Created synchronously inside the gesture so every browser allows audio.
      if (!engineRef.current) engineRef.current = getEngine();
      engineRef.current.play(VOICINGS[index]);
      quietRef.current = 0;
      if (screenRef.current) screenRef.current.dataset.live = "true";
      setCurrent(index);
      if (!rafRef.current) loop();

      // Pad lights up on the hit, then decays.
      const pad = padRefs.current[index];
      if (pad) {
        window.clearTimeout(hitTimers.current[index]);
        pad.dataset.hit = "true";
        hitTimers.current[index] = window.setTimeout(() => {
          pad.dataset.hit = "false";
        }, 140);
      }

      setWrong(false);
      const hist = [...historyRef.current, index].slice(-4);
      historyRef.current = hist;
      if (hist.join() === "0,1,2,3") setFound(true);
    },
    [loop],
  );

  const playWrong = useCallback(() => {
    if (!engineRef.current) engineRef.current = getEngine();
    // Sounds on top of whatever is ringing, so the clash is audible.
    engineRef.current.play([WRONG_NOTE], { keep: true });
    quietRef.current = 0;
    if (screenRef.current) screenRef.current.dataset.live = "true";
    if (!rafRef.current) loop();

    const pad = padRefs.current[4];
    if (pad) {
      window.clearTimeout(hitTimers.current[4]);
      pad.dataset.hit = "true";
      hitTimers.current[4] = window.setTimeout(() => {
        pad.dataset.hit = "false";
      }, 140);
    }

    // The detector is real: it checks the pitch against the key the pads are in.
    if (!inKey(WRONG_NOTE)) {
      setWrong(true);
      setFlagged(true);
      if (screenRef.current) screenRef.current.dataset.flag = "true";
      window.clearTimeout(hitTimers.current[5]);
      hitTimers.current[5] = window.setTimeout(() => {
        setFlagged(false);
        if (screenRef.current) screenRef.current.dataset.flag = "false";
      }, FLAG_MS);
    }
  }, [loop]);

  useEffect(() => {
    const root = rootRef.current;
    const screen = screenRef.current;
    const svg = svgRef.current;
    if (!root || !screen || !svg) return;

    const measure = () => {
      widthRef.current = Math.max(1, Math.round(screen.clientWidth));
      svg.setAttribute("viewBox", `0 0 ${widthRef.current} ${H}`);
      cornersRef.current?.setAttribute("d", cornersPath(14, 34, widthRef.current - 14, H - 14, 12));
      if (!rafRef.current) flat();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(screen);

    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.35 },
    );
    io.observe(root);

    const onKey = (e: KeyboardEvent) => {
      if (!inViewRef.current || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        e.preventDefault();
        play(n - 1);
      } else if (n === 5) {
        e.preventDefault();
        playWrong();
      }
    };
    window.addEventListener("keydown", onKey);

    const timers = hitTimers.current;
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafRef.current);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [flat, play, playWrong]);

  return (
    <div ref={rootRef} className={styles.instrument}>
      <div className={styles.panel}>
        <div ref={screenRef} className={styles.screen} data-live="false" data-flag="false">
          <span className={`mono ${styles.screenLabel}`} aria-hidden="true">
            {ear.scopeLabel}
          </span>
          <span className={`mono ${styles.screenValue}`} aria-hidden="true">
            {flagged ? ear.wrongLabel : current === null ? ear.idleLabel : ear.chords[current].label}
          </span>
          <svg ref={svgRef} className={styles.svg} viewBox={`0 0 600 ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <line className={styles.center} x1="0" x2="100%" y1={H / 2} y2={H / 2} />
            <path ref={traceRef} className={styles.trace} d={`M0 ${H / 2}L600 ${H / 2}`} />
            <path ref={cornersRef} className={styles.corners} d="M0 0" />
          </svg>
        </div>

        <div className={styles.pads} role="group" aria-label="Chord pads">
          {ear.chords.map((chord, i) => (
            <button
              key={chord.name}
              ref={(el) => {
                padRefs.current[i] = el;
              }}
              type="button"
              className={styles.pad}
              data-hit="false"
              aria-keyshortcuts={String(i + 1)}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                play(i);
              }}
              onClick={(e) => {
                // Keyboard activation (Enter or Space) arrives as a click with detail 0.
                if (e.detail === 0) play(i);
              }}
            >
              <span className={styles.padName}>{chord.name}</span>{" "}
              <span className={`mono ${styles.padDegree}`}>{chord.degree}</span>
              <span className="visually-hidden">, play {chord.label}</span>
            </button>
          ))}
          <button
            ref={(el) => {
              padRefs.current[4] = el;
            }}
            type="button"
            className={`${styles.pad} ${styles.padWrong}`}
            data-hit="false"
            aria-keyshortcuts="5"
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              playWrong();
            }}
            onClick={(e) => {
              if (e.detail === 0) playWrong();
            }}
          >
            <span className={styles.padName}>{ear.wrongName}</span>{" "}
            <span className={`mono ${styles.padDegree}`}>{ear.wrongDegree}</span>
            <span className="visually-hidden">, {ear.wrongPlay}</span>
          </button>
        </div>
      </div>

      <p className={styles.caption}>
        {ear.caption}
        <span className={styles.keys}>{ear.captionKeys}</span>.
      </p>
      <p className={styles.found} aria-live="polite">
        {wrong ? ear.wrongLine : found ? ear.found : ""}
      </p>
    </div>
  );
}
