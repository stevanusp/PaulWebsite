// Signal math shared by the hero line, the method stage and the 404 page.
// Everything is deterministic (no Math.random) so server and client agree.

export const TAU = Math.PI * 2;

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOutCubic = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

function hash1(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/** Smooth 1D value noise in [-1, 1]. */
export function noise1(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return (hash1(i) * (1 - u) + hash1(i + 1) * u) * 2 - 1;
}

/** Normal traffic. Units of half-height, stays within about +-0.29. */
export function normal(x: number, t: number): number {
  return (
    0.15 * Math.sin((TAU * x) / 160 - t * 0.85) +
    0.075 * Math.sin((TAU * x) / 57 + t * 1.6 + 1.3) +
    0.06 * noise1(x / 15 + t * 0.55)
  );
}

/**
 * Soft limiter with a knee: linear below 75% of reach, then eases into reach and never passes it.
 * Keeps every excursion inside a detection box without flattening the normal line.
 */
export function limit(v: number, reach: number, kneeRatio = 0.75): number {
  const a = Math.abs(v);
  const knee = reach * kneeRatio;
  if (a <= knee) return v;
  const room = reach - knee;
  return Math.sign(v) * (knee + room * Math.tanh((a - knee) / room));
}

/** How far the line may travel from the middle for a burst of amplitude amp. */
export const reachFor = (amp: number, h: number, pad: number) => 0.8 * amp + 0.15 * h + pad;

/** Upper bound of |normal|, used to draw the "normal" band. */
export const NORMAL_BOUND = 0.3;

/** A burst: a Gaussian window over a fast, irregular carrier. Units of half-height, within +-1. */
export function burst(x: number, t: number, cx: number, sigma: number): number {
  const d = (x - cx) / sigma;
  const env = Math.exp(-d * d);
  if (env < 0.002) return 0;
  const k = x - cx;
  const carrier =
    0.72 * Math.sin((TAU * k) / 10.5 + t * 19) + 0.28 * Math.sin((TAU * k) / 6.2 - t * 26 + 0.7);
  return env * carrier;
}

/** Burst life cycle for the hero loop, in seconds since the burst began. */
export const BURST = {
  rise: 0.32,
  holdEnd: 1.25,
  decayEnd: 2.1,
  flagStart: 0.2,
  flagEnd: 3.3,
  period: 6.5,
  firstAt: 1.35,
} as const;

export function burstEnvelope(tau: number): number {
  if (tau <= 0) return 0;
  if (tau < BURST.rise) return easeOutCubic(tau / BURST.rise);
  if (tau < BURST.holdEnd) return 1 - 0.07 * Math.sin((tau - BURST.rise) * 9);
  if (tau < BURST.decayEnd)
    return 1 - easeInOutCubic((tau - BURST.holdEnd) / (BURST.decayEnd - BURST.holdEnd));
  return 0;
}

/** Where successive hero anomalies appear, as a fraction of the width. */
export const HERO_SPOTS = [0.7, 0.48, 0.83, 0.6, 0.39, 0.76, 0.54];

const r1 = (v: number) => Math.round(v * 10) / 10;

export type SampleFn = (x: number) => number;

/** Build an SVG polyline path for y = f(x) across [x0, x1] with a fixed step. */
export function pathFor(f: SampleFn, x0: number, x1: number, step = 3): string {
  const parts: string[] = [];
  let first = true;
  for (let x = x0; x <= x1 + 0.001; x += step) {
    const xx = Math.min(x, x1);
    parts.push((first ? "M" : "L") + r1(xx) + " " + r1(f(xx)));
    first = false;
  }
  return parts.join("");
}

/** Corner brackets around a box, like a detection lock. */
export function cornersPath(x0: number, y0: number, x1: number, y1: number, len = 10): string {
  const l = Math.min(len, (x1 - x0) / 2, (y1 - y0) / 2);
  return [
    `M${r1(x0)} ${r1(y0 + l)}V${r1(y0)}H${r1(x0 + l)}`,
    `M${r1(x1 - l)} ${r1(y0)}H${r1(x1)}V${r1(y0 + l)}`,
    `M${r1(x1)} ${r1(y1 - l)}V${r1(y1)}H${r1(x1 - l)}`,
    `M${r1(x0 + l)} ${r1(y1)}H${r1(x0)}V${r1(y1 - l)}`,
  ].join("");
}

/** The static hero frame rendered on the server (a calm line at t = 0). */
export const HERO_AMP = 0.8;

export function heroStaticPath(width: number, height: number): string {
  const mid = height / 2;
  const h = height / 2;
  const reach = reachFor(HERO_AMP * h, h, 3); // same limiter as the live hero line
  return pathFor((x) => mid - limit(h * normal(x, 0), reach), 0, width, 3);
}
