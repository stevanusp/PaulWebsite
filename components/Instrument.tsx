"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ear } from "@/content/site";
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
const IDLE_MS = 2600;

export default function Instrument() {
  const rootRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const historyRef = useRef<number[]>([]);
  const inViewRef = useRef(false);
  const padRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  const [current, setCurrent] = useState<number | null>(null);
  const [found, setFound] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const engine = () => {
    // Created inside the gesture so every browser allows audio.
    if (!engineRef.current) engineRef.current = getEngine();
    return engineRef.current;
  };

  // The pad lights on the hit and fades out, like a pad light.
  const light = (index: number) => {
    const pad = padRefs.current[index];
    if (!pad) return;
    window.clearTimeout(timers.current[index]);
    pad.dataset.hit = "true";
    timers.current[index] = window.setTimeout(() => {
      pad.dataset.hit = "false";
    }, 140);
  };

  const settle = () => {
    window.clearTimeout(timers.current[6]);
    timers.current[6] = window.setTimeout(() => setCurrent(null), IDLE_MS);
  };

  const play = useCallback((index: number) => {
    engine().play(VOICINGS[index]);
    light(index);
    setCurrent(index);
    setWrong(false);
    settle();
    const hist = [...historyRef.current, index].slice(-4);
    historyRef.current = hist;
    if (hist.join() === "0,1,2,3") setFound(true);
  }, []);

  const playWrong = useCallback(() => {
    // Sounds on top of whatever is ringing, so the clash is audible.
    engine().play([WRONG_NOTE], { keep: true });
    light(4);
    // The check is real: the pitch is tested against the key the pads are in.
    if (!inKey(WRONG_NOTE)) {
      setWrong(true);
      setFlagged(true);
      window.clearTimeout(timers.current[5]);
      timers.current[5] = window.setTimeout(() => setFlagged(false), FLAG_MS);
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
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

    const pending = timers.current;
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, [play, playWrong]);

  const status = flagged ? ear.wrongLabel : current === null ? ear.idleLabel : ear.chords[current].label;

  return (
    <div ref={rootRef} className={`tile ${styles.instrument}`}>
      <p className={styles.status} data-flag={flagged ? "true" : "false"} aria-hidden="true">
        {status}
      </p>

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
            <span className={styles.padDegree}>{chord.degree}</span>
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
          <span className={styles.padDegree}>{ear.wrongDegree}</span>
          <span className="visually-hidden">, {ear.wrongPlay}</span>
        </button>
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
