"use client";

import { useEffect, useRef, useState } from "react";
import { onAnomaly } from "@/lib/anomaly";
import styles from "./Hero.module.css";

type Props = {
  title: string;
  words: readonly string[];
  live: string;
  flagged: string;
};

// How long one flagged glyph stays locked. Matches the hero line's own burst (BURST.flagEnd).
const HOLD_MS = 3300;

export default function HeroHead({ title, words, live, flagged }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tetherRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const tether = tetherRef.current;
    if (!root || !tether) return;
    const hero = root.closest("section");
    let current: HTMLElement | null = null;
    let lastRow = -1;
    let timer = 0;

    const release = () => {
      current?.classList.remove(styles.hit, styles.still);
      tether.classList.remove(styles.tetherOn);
      current = null;
    };

    const off = onAnomaly(({ x, y, still }) => {
      // Anomalies from elsewhere on the page (they know their own y) only move the counter.
      if (y !== undefined) {
        if (!still) setCount((c) => c + 1);
        return;
      }
      const glyphs = Array.from(root.querySelectorAll<HTMLElement>("[data-ch]"));
      if (!glyphs.length || !hero) return;
      window.clearTimeout(timer);
      release();

      // Nearest letters to the burst, on a row we did not just use, so the headline varies.
      const heroTop = hero.getBoundingClientRect().top;
      const ranked = glyphs
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, r, dx: Math.abs(r.left + r.width / 2 - x), row: Math.round(r.top) };
        })
        .sort((a, b) => a.dx - b.dx);
      // A still frame is announced again on every resize; keep it on the same glyph.
      const pick = still ? ranked[0] : (ranked.find((g) => g.row !== lastRow) ?? ranked[0]);
      lastRow = pick.row;

      current = pick.el;
      current.classList.add(styles.hit);
      if (still) current.classList.add(styles.still);

      // The tether runs from the glyph down to the line it came from.
      const signal = hero.querySelector<HTMLElement>("[data-signal]");
      if (signal && !still) {
        const bottom = pick.r.bottom - heroTop;
        const lineTop = signal.getBoundingClientRect().top - heroTop + 6;
        tether.style.left = `${(pick.r.left + pick.r.width / 2).toFixed(1)}px`;
        tether.style.top = `${bottom.toFixed(1)}px`;
        tether.style.height = `${Math.max(0, lineTop - bottom).toFixed(1)}px`;
        void tether.offsetWidth; // restart the draw animation
        tether.classList.add(styles.tetherOn);
      }

      if (!still) {
        setCount((c) => c + 1);
        timer = window.setTimeout(release, HOLD_MS);
      }
    });

    return () => {
      off();
      window.clearTimeout(timer);
      release();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.head}>
      <p className={styles.hud}>
        <span className={styles.dot} aria-hidden="true" />
        <span>{live}</span>
        <span className={styles.hudCount} aria-hidden="true">
          {flagged} {String(count).padStart(2, "0")}
        </span>
      </p>

      <h1 id="hero-title" className={styles.title}>
        <span className="visually-hidden">{title}</span>
        <span className={styles.words} aria-hidden="true">
          {words.map((word, i) => (
            <span key={`${word}-${i}`}>
              <span className={styles.word}>
                <span className={styles.wordInner}>
                  {Array.from(word).map((ch, j) =>
                    /[a-z]/i.test(ch) ? (
                      <span key={j} className={styles.ch} data-ch="">
                        {ch}
                      </span>
                    ) : (
                      <span key={j}>{ch}</span>
                    ),
                  )}
                </span>
              </span>
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      </h1>

      <span ref={tetherRef} className={styles.tether} aria-hidden="true" />
    </div>
  );
}
