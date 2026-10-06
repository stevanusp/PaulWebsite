// Geometry for "What I work on": a piano whose keys turn into a cloud with a padlock in it.
// Pure function of scroll progress p (0 to 1), so the server and the client draw the same frame.
//
// 1. The keys go down in a wave, left to right, like devices being let in one by one.
// 2. The white keys stand up into bars that trace the outline of a cloud.
// 3. The bars close up into one cloud; the black keys gather into a padlock and it locks.

/** The drawing's box, cropped to what is drawn: the piano's tray across, the cloud's top down. */
export const VIEW = { x: 40, y: 140, w: 920, h: 400 } as const;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const span = (p: number, a: number, b: number) => ease((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Rect = { x: number; y: number; w: number; h: number; r: number };
const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});

// ---- The piano: 49 keys, C2 to C6, in a dark tray.

const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);
const KX0 = 84;
const KX1 = 916;
const KY = 300;
const WHITE_H = 210;
const BLACK_H = 130;
const WHITES: number[] = [];
const BLACKS: { midi: number; left: number }[] = [];
for (let m = 36; m <= 84; m++) {
  if (WHITE_PCS.has(m % 12)) WHITES.push(m);
  else BLACKS.push({ midi: m, left: WHITES.length - 1 });
}
const WW = (KX1 - KX0) / WHITES.length;
const BW = WW * 0.58;
export const TRAY: Rect = { x: KX0 - 16, y: KY - 16, w: KX1 - KX0 + 32, h: WHITE_H + 30, r: 22 };

// ---- The cloud: three circles on a rounded base, all one shape once they share a fill.

export const CIRCLES = [
  { cx: 362, cy: 352, r: 100 },
  { cx: 500, cy: 300, r: 140 },
  { cx: 648, cy: 350, r: 110 },
] as const;
export const BASE: Rect = { x: 262, y: 362, w: 496, h: 108, r: 54 };
const BASE_MID = BASE.y + BASE.h / 2;

/** Top and bottom of the cloud at a given x. */
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
  const l = BASE.x + BASE.r;
  const r = BASE.x + BASE.w - BASE.r;
  const dx = x < l ? l - x : x > r ? x - r : 0;
  if (dx < BASE.r) {
    const dy = Math.sqrt(BASE.r * BASE.r - dx * dx);
    top = Math.min(top, BASE_MID - dy);
    bottom = Math.max(bottom, BASE_MID + dy);
  }
  return [top, bottom];
}

const BAR_PITCH = BASE.w / WHITES.length;

// ---- The padlock, cut out of the cloud.

export const LOCK = { x: 440, y: 374, w: 120, h: 86, r: 18 } as const;
export const SHACKLE = { cx: 500, top: 312, half: 34, foot: 380, stroke: 16 } as const;
export const KEYHOLE = { cx: 500, cy: 406, r: 10, stem: 22 } as const;
const SLICE = LOCK.w / BLACKS.length;

export type Frame = {
  tray: number;
  whites: (Rect & { light: number; dark: number })[];
  blacks: (Rect & { light: number })[];
  base: number;
  bars: number;
  cloud: number;
  slices: number;
  lock: number;
  shackleDraw: number;
  shackleDrop: number;
  keyhole: number;
};

export function scene(p: number): Frame {
  const wave = clamp(p / 0.24); // linear: the wave's position along the keys
  const rise = span(p, 0.26, 0.56);
  const merge = span(p, 0.6, 0.8);
  const finish = span(p, 0.8, 0.9);
  const draw = span(p, 0.72, 0.88);
  const close = span(p, 0.9, 0.98);

  // How far down each key is: a soft bump that travels from the lowest key to the highest.
  const front = wave * 56 - 4;
  const pressAt = (k: number) => {
    if (wave <= 0 || wave >= 1) return 0;
    const d = (front - k) / 3.2;
    return Math.abs(d) < 1 ? 1 - d * d : 0;
  };
  const order = new Map<number, number>();
  for (let m = 36; m <= 84; m++) order.set(m, m - 36);

  const whites = WHITES.map((m, i) => {
    const press = pressAt(order.get(m) ?? 0);
    const piano: Rect = { x: KX0 + i * WW + 1, y: KY, w: WW - 2, h: WHITE_H - 6 * press, r: 6 };
    const cx = BASE.x + (i + 0.5) * BAR_PITCH;
    const [top, bottom] = outline(cx);
    const open: Rect = { x: cx - 5.5, y: top, w: 11, h: bottom - top, r: 5.5 };
    const shut: Rect = { x: cx - BAR_PITCH / 2 - 0.6, y: top, w: BAR_PITCH + 1.2, h: bottom - top, r: BAR_PITCH / 2 + 0.6 };
    // The middle keys move first; the ends follow, so it opens like a bloom rather than a slide.
    const t = ease(clamp(rise * 1.5 - (Math.abs(i - 14) / 14) * 0.5));
    const rect = mix(mix(piano, open, t), shut, merge);
    const dark = Math.max(0.12 * press, clamp((t - 0.3) / 0.7));
    return { ...rect, dark, light: 1 - clamp((t - 0.5) / 0.5) };
  });

  const blacks = BLACKS.map((b, j) => {
    const press = pressAt(order.get(b.midi) ?? 0);
    const left = KX0 + (b.left + 1) * WW;
    const piano: Rect = { x: left - BW / 2, y: KY, w: BW, h: BLACK_H - 5 * press, r: 4 };
    const slice: Rect = { x: LOCK.x + j * SLICE - 0.3, y: LOCK.y, w: SLICE + 0.6, h: LOCK.h, r: 3 };
    const t = ease(clamp(rise * 1.4 - 0.15 - (j / (BLACKS.length - 1)) * 0.25));
    return { ...mix(piano, slice, t), light: Math.max(0.28 * press, clamp((t - 0.45) / 0.55)) };
  });

  return {
    tray: 1 - span(p, 0.24, 0.36),
    whites,
    blacks,
    base: merge,
    // The smooth cloud and lock fade in on top of the bars and slices, which stay solid until
    // they are covered: fading both ways at once would dip through gray in the middle.
    bars: finish < 1 ? 1 : 0,
    cloud: finish,
    slices: finish < 1 ? 1 : 0,
    lock: finish,
    shackleDraw: draw,
    shackleDrop: lerp(-12, 0, close),
    keyhole: finish,
  };
}
