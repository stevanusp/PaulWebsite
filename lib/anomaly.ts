// One anomaly, many views. Anything that flags something (the hero line, a wrong note on the
// piano) announces where it happened, in viewport pixels, and anything else on the page
// (the headline glyph, the counter, the side rail) reacts to it.

export const ANOMALY_EVENT = "sp:anomaly";

export type AnomalyDetail = {
  /** Viewport x where it happened. */
  x: number;
  /** Viewport y where it happened, when the source knows it. */
  y?: number;
  /** A calm still frame (reduced motion): show the state, do not animate it. */
  still: boolean;
};

export function emitAnomaly(x: number, opts: { y?: number; still?: boolean } = {}) {
  const detail: AnomalyDetail = { x, y: opts.y, still: opts.still ?? false };
  window.dispatchEvent(new CustomEvent<AnomalyDetail>(ANOMALY_EVENT, { detail }));
}

export function onAnomaly(fn: (d: AnomalyDetail) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<AnomalyDetail>).detail);
  window.addEventListener(ANOMALY_EVENT, handler);
  return () => window.removeEventListener(ANOMALY_EVENT, handler);
}
