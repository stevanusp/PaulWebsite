"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ear } from "@/content/site";
import { getEngine, type Engine } from "@/lib/epiano";
import { ODD_NOTE, VOICINGS, inChord, inKey } from "@/lib/loop";
import { KEYSTATION, Keystation } from "./Keystation";
import styles from "./Instrument.module.css";

const CHORDS = VOICINGS.length;
const NOTE_PAD = CHORDS;
const FLAG_MS = 1700;
const IDLE_MS = 2600;

export default function Instrument() {
  const rootRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const historyRef = useRef<number[]>([]);
  const inViewRef = useRef(false);
  const padRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  const currentRef = useRef<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [found, setFound] = useState(false);
  // What the lone note turned out to be, given what was ringing under it.
  const [heard, setHeard] = useState<"outside" | "belongs" | null>(null);
  const [flagged, setFlagged] = useState(false);
  const [noteDown, setNoteDown] = useState(false);
  // A small reward for whoever presses things: the first hit drops the keyboard in above the pads.
  const [dropped, setDropped] = useState(false);

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
    window.clearTimeout(timers.current[CHORDS + 2]);
    timers.current[CHORDS + 2] = window.setTimeout(() => {
      currentRef.current = null;
      setCurrent(null);
      setNoteDown(false);
    }, IDLE_MS);
  };

  const play = useCallback((index: number) => {
    engine().play(VOICINGS[index]);
    light(index);
    currentRef.current = index;
    setCurrent(index);
    setHeard(null);
    setFlagged(false);
    setNoteDown(false);
    setDropped(true);
    settle();
    const hist = [...historyRef.current, index].slice(-CHORDS);
    historyRef.current = hist;
    if (hist.join() === VOICINGS.map((_, i) => i).join()) setFound(true);
  }, []);

  const playNote = useCallback(() => {
    // Sounds on top of whatever is ringing, so you hear it against the chord.
    engine().play([ODD_NOTE], { keep: true });
    light(NOTE_PAD);
    // The check is real: the note is tested against the chord still ringing, then the key.
    const chord = currentRef.current;
    const belongs = (chord !== null && inChord(ODD_NOTE, VOICINGS[chord])) || inKey(ODD_NOTE);
    setHeard(belongs ? "belongs" : "outside");
    setFlagged(!belongs);
    setNoteDown(true);
    setDropped(true);
    window.clearTimeout(timers.current[CHORDS + 1]);
    timers.current[CHORDS + 1] = window.setTimeout(() => {
      setFlagged(false);
      setNoteDown(false);
    }, FLAG_MS);
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
      if (n >= 1 && n <= CHORDS) {
        e.preventDefault();
        play(n - 1);
      } else if (n === CHORDS + 1) {
        e.preventDefault();
        playNote();
      }
    };
    window.addEventListener("keydown", onKey);

    const pending = timers.current;
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, [play, playNote]);

  const status =
    heard === "outside" && flagged
      ? ear.note.outside
      : heard === "belongs"
        ? ear.note.belongs
        : current === null
          ? ear.idleLabel
          : ear.chords[current].label;

  const held = [...(current !== null ? VOICINGS[current] : []), ...(noteDown ? [ODD_NOTE] : [])];

  return (
    <>
      <div className={styles.head}>
        <h3 className={styles.label}>{ear.tryLabel}</h3>
        <div className={styles.dock} aria-hidden="true">
          {dropped ? (
            <>
              <span className={styles.shadow} />
              <svg
                className={styles.keys}
                viewBox={`0 0 ${KEYSTATION.w} ${KEYSTATION.h}`}
                focusable="false"
              >
                <Keystation pressed={held.join(",")} accent={heard === "outside" && flagged ? ODD_NOTE : null} />
              </svg>
            </>
          ) : null}
        </div>
      </div>

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
              padRefs.current[NOTE_PAD] = el;
            }}
            type="button"
            className={`${styles.pad} ${styles.padNote}`}
            data-hit="false"
            data-outside={heard === "outside" ? "true" : "false"}
            aria-keyshortcuts={String(NOTE_PAD + 1)}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              playNote();
            }}
            onClick={(e) => {
              if (e.detail === 0) playNote();
            }}
          >
            <span className={styles.padName}>{ear.note.name}</span>{" "}
            <span className={styles.padDegree}>{ear.note.sub}</span>
            <span className="visually-hidden">, {ear.note.play}</span>
          </button>
        </div>

        <p className={styles.caption}>
          {ear.caption}
          <span className={styles.shortcuts}>{ear.captionKeys}</span>.
        </p>
        <p className={styles.fact}>{ear.fact}</p>
        <p className={styles.found} aria-live="polite">
          {heard === "outside" ? ear.note.outsideLine : heard === "belongs" ? ear.note.belongsLine : found ? ear.found : ""}
        </p>
      </div>
    </>
  );
}
