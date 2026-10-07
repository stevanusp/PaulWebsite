"use client";

import { useEffect, useState } from "react";
import { KEYSTATION, Keystation } from "@/components/Keystation";
import SecureCloud from "./SecureCloud";
import {
  BLACK_SLOTS,
  KEYS,
  WHITE_SLOTS,
  clamp,
  ease,
  easeOut,
  fitCloud,
  lerp,
  mix,
  place,
  traits,
  type CloudFrame,
  type Piece,
  type Rect,
} from "./geometry";
import styles from "./CloudDrop.module.css";

// The pads' easter egg. The secure cloud from "What I work on" falls in from above, hits, and
// breaks; its pieces are the Keystation's keys, and they land as the keyboard, which then plays
// along. Drawn in the Keystation's own 1000 x 228 box, overflowing upward while it falls.

const FIT = fitCloud(KEYSTATION.w / 2, KEYSTATION.h, 0.68);
const FALL = 0.5; // seconds in the air
const HEIGHT = 640; // how far above it starts, in drawing units
const BURST = 0.18;
const LAND = 0.42;
const END = 1.2;

type Drop = CloudFrame & { body: number; shadow: number; shown: number };

function frame(t: number): Drop {
  const u = clamp(t / FALL);
  const broken = t >= FALL;
  const fit = { ...FIT, y: FIT.y - HEIGHT * (1 - u * u) }; // gravity: slow, then fast
  const burst = easeOut((t - FALL) / BURST);

  const piece = (slot: Rect, key: Rect, tr: ReturnType<typeof traits>, kind: "white" | "black"): Piece => {
    let r = place(slot, fit);
    let turn = 0;
    if (broken) {
      const cx = r.x + r.w / 2;
      r = {
        ...r,
        x: r.x + ((cx - KEYSTATION.w / 2) * 0.45 + tr.fling.x * 220) * burst,
        y: r.y - (30 + tr.fling.y * 150) * burst,
      };
      turn = tr.fling.turn * burst;
    }
    // Each key finds its own place, a moment apart.
    const a = ease((t - (FALL + 0.1 + tr.order * 0.14)) / LAND);
    r = mix(r, key, a);
    turn = lerp(turn, 0, a);
    // Black keys go dark again as it breaks, so their pieces show; white keys pale as they land.
    const back = kind === "black" && broken ? burst : 0;
    return { ...r, turn, tone: (1 - back) * (1 - a) };
  };

  const whole = broken ? 0 : 1;
  return {
    fit,
    whites: KEYS.whites.map((k, i) => piece(WHITE_SLOTS[i].shut, k, traits("white", i), "white")),
    blacks: KEYS.blacks.map((k, j) => piece(BLACK_SLOTS[j], k, traits("black", j), "black")),
    pieces: broken,
    base: whole,
    cloud: whole,
    lock: whole,
    shackleDraw: whole,
    shackleDrop: 0,
    body: ease((t - (FALL + 0.15)) / 0.4),
    shadow: broken ? 1 : u * u,
    shown: clamp(u * 6),
  };
}

type Props = { pressed: string; accent: number | null };

export default function CloudDrop({ pressed, accent }: Props) {
  // Reduced motion skips the fall: the keyboard is simply there (and fades in through CSS).
  const [done, setDone] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (done) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const s = (now - start) / 1000;
      if (s >= END) {
        setDone(true);
        return;
      }
      setT(s);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  const f = done ? null : frame(t);
  const shadow = f ? f.shadow : 1;

  return (
    <svg
      className={styles.svg}
      data-done={done ? "true" : "false"}
      viewBox={`0 0 ${KEYSTATION.w} ${KEYSTATION.h}`}
      focusable="false"
    >
      <g opacity={shadow.toFixed(3)}>
        <ellipse className={styles.shadow} cx={KEYSTATION.w / 2} cy={KEYSTATION.h + 6} rx={480 * (0.4 + 0.6 * shadow)} ry={12} />
        <ellipse className={styles.shadow} cx={KEYSTATION.w / 2} cy={KEYSTATION.h + 4} rx={360 * (0.4 + 0.6 * shadow)} ry={6} />
      </g>
      {f ? (
        <>
          {f.body > 0.002 ? (
            <g opacity={f.body.toFixed(3)}>
              <Keystation keys={false} />
            </g>
          ) : null}
          <g opacity={f.shown.toFixed(3)}>
            <SecureCloud f={f} />
          </g>
        </>
      ) : (
        <Keystation pressed={pressed} accent={accent} />
      )}
    </svg>
  );
}
