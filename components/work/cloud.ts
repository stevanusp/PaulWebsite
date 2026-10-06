// Geometry for "What I work on", as a pure function of scroll progress p (0 to 1), so the server
// and the client draw the same frame. Every piece is one of the Keystation's 49 keys, all the way:
//
// 1. The keys come loose from the controller and fall.
// 2. On the way down they gather into a cloud (the white keys) with a padlock in it (the black
//    keys), and it locks.
// 3. The cloud falls to the floor and shatters; the pieces are the keys again, and they land back
//    in a Keystation.
//
// The drawing is in "world" units, taller than the window; a camera follows a step behind, so the
// falls read as falls while whatever matters stays in frame.

import { KEYSTATION, keyRects } from "@/components/Keystation";

/** The window onto the world. */
export const VIEW = { w: 1000, h: 640 } as const;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const span = (p: number, a: number, b: number) => ease((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export type Rect = { x: number; y: number; w: number; h: number; r: number };
const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});

// ---- The two Keystations: one at the top of the world, one on the floor.

export const KS = { scale: 0.78, x: (VIEW.w - KEYSTATION.w * 0.78) / 2, h: KEYSTATION.h * 0.78 } as const;
export const FLOOR = 900;
export const KS_TOP = 0;
export const KS_FLOOR = FLOOR - KS.h;
const KEYS = keyRects();
const onKs = (r: Rect, y0: number): Rect => ({
  x: KS.x + r.x * KS.scale,
  y: y0 + r.y * KS.scale,
  w: r.w * KS.scale,
  h: r.h * KS.scale,
  r: r.r * KS.scale,
});

// ---- The cloud, drawn in its own units and placed in the world with CLOUD_FIT.

export const CIRCLES = [
  { cx: 362, cy: 352, r: 100 },
  { cx: 500, cy: 300, r: 140 },
  { cx: 648, cy: 350, r: 110 },
] as const;
export const BASE: Rect = { x: 262, y: 362, w: 496, h: 108, r: 54 };
export const LOCK = { x: 440, y: 374, w: 120, h: 86, r: 18 } as const;
export const SHACKLE = { cx: 500, top: 312, half: 34, foot: 380, stroke: 16 } as const;
export const KEYHOLE = { cx: 500, cy: 406, r: 10, stem: 22 } as const;

const CLOUD_SCALE = 0.8;
const CLOUD_Y = 470; // where the cloud's middle sits in the world
/** Cloud units to world: translate, then scale. */
export const CLOUD_FIT = { x: 500 - 510 * CLOUD_SCALE, y: CLOUD_Y - 315 * CLOUD_SCALE, scale: CLOUD_SCALE } as const;
const toWorld = (r: Rect): Rect => ({
  x: CLOUD_FIT.x + r.x * CLOUD_SCALE,
  y: CLOUD_FIT.y + r.y * CLOUD_SCALE,
  w: r.w * CLOUD_SCALE,
  h: r.h * CLOUD_SCALE,
  r: r.r * CLOUD_SCALE,
});
/** How far the cloud falls: from where it forms until its base touches the floor. */
const FALL = FLOOR - (CLOUD_FIT.y + (BASE.y + BASE.h) * CLOUD_SCALE);

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

const PITCH = BASE.w / KEYS.whites.length;
const SLICE = LOCK.w / KEYS.blacks.length;

// ---- Each key's path through the story.

type Path = {
  top: Rect; // in the first Keystation
  open: Rect; // a bar in the cloud, with gaps
  shut: Rect; // a bar in the cloud, closed up
  floor: Rect; // in the Keystation on the floor
  order: number; // 0..1, when it lets go
  spin: number; // how much it turns in the air
  burst: { dx: number; dy: number; turn: number }; // where it flies when the cloud breaks
};

const paths = (kind: "white" | "black"): Path[] =>
  (kind === "white" ? KEYS.whites : KEYS.blacks).map((k, i) => {
    const seed = (kind === "white" ? 0 : 100) + i;
    let open: Rect;
    let shut: Rect;
    if (kind === "white") {
      const cx = BASE.x + (i + 0.5) * PITCH;
      const [top, bottom] = outline(cx);
      open = toWorld({ x: cx - 5.5, y: top, w: 11, h: bottom - top, r: 5.5 });
      shut = toWorld({ x: cx - PITCH / 2 - 0.6, y: top, w: PITCH + 1.2, h: bottom - top, r: PITCH / 2 + 0.6 });
    } else {
      open = toWorld({ x: LOCK.x + i * SLICE - 0.3, y: LOCK.y, w: SLICE + 0.6, h: LOCK.h, r: 3 });
      shut = open;
    }
    const center = shut.x + shut.w / 2;
    return {
      top: onKs(k, KS_TOP),
      open,
      shut,
      floor: onKs(k, KS_FLOOR),
      order: rand(seed),
      spin: (rand(seed + 7) - 0.5) * 70,
      burst: {
        dx: (center - 500) * 0.55 + (rand(seed + 13) - 0.5) * 180,
        dy: -(50 + rand(seed + 21) * 190),
        turn: (rand(seed + 29) - 0.5) * 150,
      },
    };
  });

const WHITE_PATHS = paths("white");
const BLACK_PATHS = paths("black");

// The camera's target height in the world, by progress. It trails each fall, then settles.
const CAMERA: [number, number][] = [
  [0, KS_TOP + KS.h / 2],
  [0.1, KS_TOP + KS.h / 2],
  [0.4, CLOUD_Y],
  [0.64, CLOUD_Y],
  [0.82, KS_FLOOR + KS.h / 2 - 60],
  [0.96, KS_FLOOR + KS.h / 2],
  [1, KS_FLOOR + KS.h / 2],
];
function camera(p: number) {
  for (let i = 1; i < CAMERA.length; i++) {
    const [p1, y1] = CAMERA[i];
    const [p0, y0] = CAMERA[i - 1];
    if (p <= p1) return lerp(y0, y1, ease((p - p0) / (p1 - p0)));
  }
  return CAMERA[CAMERA.length - 1][1];
}

export type Piece = Rect & { turn: number; tone: number };

export type Frame = {
  /** Vertical shift from world to window. */
  shift: number;
  ksTop: number;
  ksFloor: number;
  whites: Piece[];
  blacks: Piece[];
  base: number;
  cloud: number;
  lock: number;
  shackleDraw: number;
  shackleDrop: number;
  /** How far the formed cloud has fallen, in world units. */
  drop: number;
  shadow: { w: number; o: number };
};

// Beats, in progress.
const IMPACT = 0.74;

export function scene(p: number): Frame {
  const merge = span(p, 0.36, 0.44);
  const solid = span(p, 0.42, 0.48);
  const draw = span(p, 0.42, 0.5);
  const close = span(p, 0.5, 0.54);
  const fallT = clamp((p - 0.64) / (IMPACT - 0.64));
  const drop = FALL * fallT * fallT; // gravity: slow, then fast
  const burst = easeOut((p - IMPACT) / 0.07);
  const broken = p >= IMPACT;

  const move = (path: Path, kind: "white" | "black"): Piece => {
    // Let go: a small hop out of the keybed, then the fall into the cloud.
    const pop = span(p, 0.03 + path.order * 0.06, 0.08 + path.order * 0.06);
    const g = clamp((p - (0.08 + path.order * 0.14)) / 0.18);
    const eg = ease(g);
    let r = mix(path.top, kind === "white" ? path.open : path.shut, eg);
    r = { ...r, y: r.y - 7 * pop * (1 - eg) };
    let turn = pop * (1 - eg) * path.spin * 0.08 + Math.sin(Math.PI * g) * path.spin;
    r = mix(r, path.shut, merge);
    r = { ...r, y: r.y + drop };
    if (broken) {
      r = { ...r, x: r.x + path.burst.dx * burst, y: r.y + path.burst.dy * burst };
      turn = lerp(turn, path.burst.turn, burst);
    }
    // Land back in a keyboard, each key in its own time.
    const a = ease((p - (0.8 + path.order * 0.06)) / 0.12);
    r = mix(r, path.floor, a);
    turn = lerp(turn, 0, a);
    // tone: 0 is the key's own color, 1 is the cloud's (ink for white keys, background for black).
    // Black keys go dark again as the cloud breaks, so their pieces show against the page.
    const back = kind === "black" && broken ? burst : 0;
    const tone = clamp((g - 0.5) / 0.5) * (1 - back) * (1 - a);
    return { ...r, turn, tone };
  };

  const shadowNear = broken ? 1 : fallT;
  return {
    shift: VIEW.h / 2 - camera(p),
    ksTop: 1 - span(p, 0.12, 0.3),
    ksFloor: span(p, 0.82, 0.92),
    whites: WHITE_PATHS.map((path) => move(path, "white")),
    blacks: BLACK_PATHS.map((path) => move(path, "black")),
    base: broken ? 0 : merge,
    cloud: broken ? 0 : solid,
    lock: broken ? 0 : solid,
    shackleDraw: broken ? 0 : draw,
    shackleDrop: lerp(-12, 0, close),
    drop,
    shadow: {
      w: broken ? lerp(420, 760, span(p, 0.8, 0.92)) : lerp(160, 420, shadowNear),
      o: broken ? 0.5 + 0.5 * span(p, 0.82, 0.92) : shadowNear * 0.8,
    },
  };
}
