// A pure description of the method stage at scroll progress p (0 to 1) and time t.
// The live stage applies it to the DOM every frame; the static fallback renders it once.

import {
  NORMAL_BOUND,
  burst,
  cornersPath,
  easeInOutCubic,
  limit,
  normal,
  pathFor,
  reachFor,
  smoothstep,
} from "./signal";

export type Label = { x: number; y: number; opacity: number };

export type StageFrame = {
  width: number;
  height: number;
  mid: number;
  base: string;
  alert: string;
  alertOpacity: number;
  alertX0: number;
  alertX1: number;
  band: { x1: number; y0: number; y1: number; opacity: number };
  corners: string;
  cornersOpacity: number;
  lockTransform: string;
  rect: { x: number; y: number; w: number; h: number; opacity: number };
  normalLabel: Label;
  anomalyLabel: Label;
  containedLabel: Label;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const f1 = (v: number) => Math.round(v * 10) / 10;

/** Scroll thresholds for the three steps. */
export const STEP_EDGES = [1 / 3, 2 / 3] as const;

export function activeStep(p: number): 0 | 1 | 2 {
  return p < STEP_EDGES[0] ? 0 : p < STEP_EDGES[1] ? 1 : 2;
}

export function stageFrame(
  p: number,
  t: number,
  W: number,
  H: number,
  opts: { inset?: number; step?: number } = {},
): StageFrame {
  const inset = opts.inset ?? 16;
  const step = opts.step ?? 3;
  const narrow = W < 640;
  const mid = H / 2;
  const h = (H / 2) * 0.86;
  const sigma = narrow ? 13 : 21;
  const cx = W * (narrow ? 0.62 : 0.64);
  const amp = 0.8 * h;

  const grow = smoothstep(0.36, 0.5, p);
  const contain = smoothstep(0.7, 0.83, p);
  const E = grow * (1 - 0.9 * contain);

  // Everything the line does stays inside the detection box: a soft limiter, like a scope's clip.
  const reach = reachFor(amp, h, 4);
  const y = (x: number) => {
    const v = h * normal(x, t) + (E > 0.001 ? amp * E * burst(x, t, cx, sigma) : 0);
    return mid - limit(v, reach);
  };

  const base = pathFor(y, 0, W, step);

  const detect = smoothstep(0.42, 0.47, p);
  const alertOpacity = detect * (1 - 0.4 * contain) * smoothstep(0, 0.12, E);
  // Sample the highlight on the same grid as the base line so the two coincide exactly.
  const alertX0 = Math.max(0, Math.floor((cx - 3 * sigma) / step) * step);
  const alertX1 = Math.min(W, Math.ceil((cx + 3 * sigma) / step) * step);
  const alert = alertOpacity > 0.01 ? pathFor(y, alertX0, alertX1, step) : "M0 0";

  // The learned "normal" range.
  const bandHalf = h * NORMAL_BOUND + 6;
  const band = {
    x1: W * easeInOutCubic(smoothstep(0.02, 0.26, p)),
    y0: mid - bandHalf,
    y1: mid + bandHalf,
    opacity: smoothstep(0.03, 0.16, p),
  };

  // Detection lock: corner brackets that settle onto the burst.
  const pad = 8;
  const bx0 = cx - 2.4 * sigma - pad;
  const bx1 = cx + 2.4 * sigma + pad;
  const by0 = mid - reach;
  const by1 = mid + reach;
  const lock = smoothstep(0.44, 0.52, p);
  const cornersOpacity = smoothstep(0.43, 0.47, p) * (1 - smoothstep(0.7, 0.76, p));
  const s = 1.3 - 0.3 * lock;
  const lockTransform = `translate(${f1(cx)} ${f1(mid)}) scale(${s.toFixed(4)}) translate(${f1(-cx)} ${f1(-mid)})`;

  // Containment: the lock closes into a cell that shrinks around the quieted burst.
  const cellHalfY = lerp(reach, bandHalf + 10, easeInOutCubic(contain));
  const cellHalfX = lerp(2.4 * sigma + pad, 2.1 * sigma + pad, easeInOutCubic(contain));
  const rect = {
    x: cx - cellHalfX,
    y: mid - cellHalfY,
    w: cellHalfX * 2,
    h: cellHalfY * 2,
    opacity: smoothstep(0.7, 0.78, p),
  };

  return {
    width: W,
    height: H,
    mid,
    base,
    alert,
    alertOpacity,
    alertX0,
    alertX1,
    band,
    corners: cornersPath(bx0, by0, bx1, by1, 10),
    cornersOpacity,
    lockTransform,
    rect,
    normalLabel: { x: inset, y: band.y0 - 10, opacity: band.opacity * smoothstep(0.08, 0.2, p) },
    anomalyLabel: {
      x: bx0,
      y: by0 - 10,
      opacity: smoothstep(0.47, 0.53, p) * (1 - smoothstep(0.69, 0.74, p)),
    },
    containedLabel: {
      x: rect.x,
      y: rect.y - 10,
      opacity: smoothstep(0.76, 0.84, p),
    },
  };
}

/** Representative progress values for each step's still frame. */
export const STILL_P = [0.3, 0.6, 0.97] as const;
export const STILL_T = 0.9;

