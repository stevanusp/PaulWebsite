// The secure cloud: a cloud with a padlock in it, built from the Keystation's 49 keys. The white
// keys are bars along the cloud's outline; the black keys are slices of the lock. Shared by the
// "What I work on" picture (keys fall into the cloud) and the pads (the cloud falls, breaks, and
// its pieces land as the keyboard), so the same pieces travel through the whole page.

import { keyRects } from "@/components/Keystation";

export type Rect = { x: number; y: number; w: number; h: number; r: number };
/** Where the cloud sits: cloud units are scaled, then moved. */
export type Fit = { x: number; y: number; scale: number };
/** A key on its way somewhere: a rectangle, a turn in degrees, and its tone (0 key, 1 cloud). */
export type Piece = Rect & { turn: number; tone: number };

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const span = (p: number, a: number, b: number) => ease((p - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rand = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});

// ---- The shape, in cloud units: three circles on a rounded base, and a lock at the middle.

export const CIRCLES = [
  { cx: 362, cy: 352, r: 100 },
  { cx: 500, cy: 300, r: 140 },
  { cx: 648, cy: 350, r: 110 },
] as const;
export const BASE: Rect = { x: 262, y: 362, w: 496, h: 108, r: 54 };
export const LOCK = { x: 440, y: 374, w: 120, h: 86, r: 18 } as const;
export const SHACKLE = { cx: 500, top: 312, half: 34, foot: 380, stroke: 16 } as const;
export const KEYHOLE = { cx: 500, cy: 406, r: 10, stem: 22 } as const;
/** The cloud's bounds, in cloud units. */
export const BOX = { x: 262, y: 160, w: 496, h: 310 } as const;

export const shacklePath = () => {
  const { cx, top, half, foot } = SHACKLE;
  return `M${cx - half} ${foot}V${top + half}A${half} ${half} 0 0 1 ${cx + half} ${top + half}V${foot}`;
};

/** A fit that centers the cloud on cx and stands it on `bottom`. */
export const fitCloud = (cx: number, bottom: number, scale: number): Fit => ({
  x: cx - (BOX.x + BOX.w / 2) * scale,
  y: bottom - (BOX.y + BOX.h) * scale,
  scale,
});

export const place = (r: Rect, f: Fit): Rect => ({
  x: f.x + r.x * f.scale,
  y: f.y + r.y * f.scale,
  w: r.w * f.scale,
  h: r.h * f.scale,
  r: r.r * f.scale,
});

/** Top and bottom of the cloud at a given x, in cloud units. */
function outline(x: number): [number, number] {
  let top = Infinity;
  let bottom = -Infinity;
  for (const c of CIRCLES) {
    const dx = x - c.cx;
    if (Math.abs(dx) >= c.r) continue;
    const dy = Math.sqrt(c.r * c.r - dx * dx);
    top = Math.min(top, c.cy - dy);
    bottom = Math.max(bottom, c.cy + dy);
  }
  const mid = BASE.y + BASE.h / 2;
  const l = BASE.x + BASE.r;
  const r = BASE.x + BASE.w - BASE.r;
  const dx = x < l ? l - x : x > r ? x - r : 0;
  if (dx < BASE.r) {
    const dy = Math.sqrt(BASE.r * BASE.r - dx * dx);
    top = Math.min(top, mid - dy);
    bottom = Math.max(bottom, mid + dy);
  }
  return [top, bottom];
}

// ---- The keys, and where each one goes in the cloud.

export const KEYS = keyRects();
const PITCH = BASE.w / KEYS.whites.length;
const SLICE = LOCK.w / KEYS.blacks.length;

/** White keys: an open bar (with gaps) and a shut one (closed up). Cloud units. */
export const WHITE_SLOTS = KEYS.whites.map((_, i) => {
  const cx = BASE.x + (i + 0.5) * PITCH;
  const [top, bottom] = outline(cx);
  return {
    open: { x: cx - 5.5, y: top, w: 11, h: bottom - top, r: 5.5 },
    shut: { x: cx - PITCH / 2 - 0.6, y: top, w: PITCH + 1.2, h: bottom - top, r: PITCH / 2 + 0.6 },
  };
});

/** Black keys: a slice of the lock's body. Cloud units. */
export const BLACK_SLOTS = KEYS.blacks.map((_, i) => ({
  x: LOCK.x + i * SLICE - 0.3,
  y: LOCK.y,
  w: SLICE + 0.6,
  h: LOCK.h,
  r: 3,
}));

/** Per-key randomness that never changes: when it lets go, how it turns, where it flies. */
export const traits = (kind: "white" | "black", i: number) => {
  const seed = (kind === "white" ? 0 : 100) + i;
  return {
    order: rand(seed),
    spin: (rand(seed + 7) - 0.5) * 70,
    fling: { x: rand(seed + 13) - 0.5, y: rand(seed + 21), turn: (rand(seed + 29) - 0.5) * 150 },
  };
};

/** Everything the cloud layer needs to draw one moment. */
export type CloudFrame = {
  fit: Fit;
  whites: Piece[];
  blacks: Piece[];
  /** Whether the keys themselves show. Off while the smooth cloud and lock cover them: the bars'
      corners poke past the curve, so they only show while they move. */
  pieces: boolean;
  /** The rounded base under the bars, while they close up. */
  base: number;
  /** The smooth cloud over the bars. */
  cloud: number;
  /** The lock's body and keyhole over the slices. */
  lock: number;
  shackleDraw: number;
  shackleDrop: number;
};
