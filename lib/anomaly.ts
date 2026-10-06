// One anomaly, many views. The hero line announces where a burst begins, in viewport pixels,
// and anything else on the page (the headline glyph, the counter, the side rail) reacts to it.

export const ANOMALY_EVENT = "sp:anomaly";

export type AnomalyDetail = {
  /** Viewport x where the burst begins. */
  x: number;
  /** A calm still frame (reduced motion): show the state, do not animate it. */
  still: boolean;
};

export function emitAnomaly(x: number, still = false) {
  window.dispatchEvent(new CustomEvent<AnomalyDetail>(ANOMALY_EVENT, { detail: { x, still } }));
}

export function onAnomaly(fn: (d: AnomalyDetail) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<AnomalyDetail>).detail);
  window.addEventListener(ANOMALY_EVENT, handler);
  return () => window.removeEventListener(ANOMALY_EVENT, handler);
}
