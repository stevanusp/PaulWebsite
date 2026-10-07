// Motion math shared by every scroll and drop scene: clamping, easing, mixing, and a seeded
// random that is the same on the server and the client.

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Ease in and out (cubic). */
export const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Ease out (cubic). */
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

/** 0 before a, 1 after b, eased in between. */
export const span = (p: number, a: number, b: number) => ease((p - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A fixed pseudo-random number in [0, 1) for a seed. */
export const rand = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export type Rect = { x: number; y: number; w: number; h: number; r: number };

export const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});

/** The media query under which the scroll scenes run live (pinned, scrubbed, moving). */
export const LIVE_QUERY = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";
