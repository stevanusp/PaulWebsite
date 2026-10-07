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
  fitCloud,
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
const FADE = 0.14; // the smooth cloud gives way to its pieces
const FLY = 0.78; // each key's flight from the cloud to its place
const SPREAD = 0.14; // keys leave a moment apart
const END = FALL + SPREAD + FLY + 0.04;

type Drop = CloudFrame & { body: number; shadow: number; shown: number };

function frame(t: number): Drop {
  const u = clamp(t / FALL);
  const broken = t >= FALL;
  const fit = { ...FIT, y: FIT.y - HEIGHT * (1 - u * u) }; // gravity: slow, then fast

  // One continuous arc per key: from its place in the cloud, up through a point it is flung
  // toward, down into its place on the keyboard. No second move, so nothing snaps.
  const piece = (slot: Rect, key: Rect, tr: ReturnType<typeof traits>, kind: "white" | "black"): Piece => {
    const from = place(slot, fit);
    const k = clamp((t - FALL - tr.order * SPREAD) / FLY);
    const e = ease(k);
    const fx = from.x + from.w / 2;
    const tx = key.x + key.w / 2;
    const cx = (fx + tx) / 2 + ((fx - KEYSTATION.w / 2) * 0.35 + tr.fling.x * 180);
    const cy = Math.min(from.y, key.y) - (60 + tr.fling.y * 160);
    const q = (a: number, c: number, b: number) => (1 - e) * (1 - e) * a + 2 * (1 - e) * e * c + e * e * b;
    const size = mix(from, key, e);
    const mid = { x: q(fx, cx, tx), y: q(from.y + from.h / 2, cy, key.y + key.h / 2) };
    const r = { ...size, x: mid.x - size.w / 2, y: mid.y - size.h / 2 };
    const turn = tr.fling.turn * Math.sin(Math.PI * e);
    // White keys pale on the way; black keys darken almost at once so their pieces show.
    const tone = kind === "white" ? 1 - e : 1 - clamp(k * 5);
    return { ...r, turn, tone };
  };

  const cloud = broken ? 1 - clamp((t - FALL) / FADE) : 1;
  return {
    fit,
    whites: KEYS.whites.map((k, i) => piece(WHITE_SLOTS[i].shut, k, traits("white", i), "white")),
    blacks: KEYS.blacks.map((k, j) => piece(BLACK_SLOTS[j], k, traits("black", j), "black")),
    pieces: broken,
    base: cloud,
    cloud,
    lock: cloud,
    shackleDraw: cloud > 0.002 ? 1 : 0,
    shackleDrop: 0,
    body: ease((t - FALL - 0.2) / 0.55),
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
