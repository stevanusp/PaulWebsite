// "What I work on", as a pure function of scroll progress p (0 to 1), so the server and the client
// draw the same frame. The Keystation's keys come loose and fall; on the way down the white keys
// gather into a cloud and the black keys into a padlock, and it locks. Then it stays: the cloud
// only falls again later, by the pads, if someone presses one.
//
// The drawing is in "world" units, taller than the window; a camera follows the fall a step behind.

import { KEYSTATION } from "@/components/Keystation";
import {
  BLACK_SLOTS,
  KEYS,
  WHITE_SLOTS,
  clamp,
  ease,
  fitCloud,
  lerp,
  mix,
  place,
  span,
  traits,
  type CloudFrame,
  type Piece,
  type Rect,
} from "@/components/secure-cloud/geometry";

/** The window onto the world. */
export const VIEW = { w: 1000, h: 640 } as const;

export const KS = { scale: 0.78, x: (VIEW.w - KEYSTATION.w * 0.78) / 2, h: KEYSTATION.h * 0.78 } as const;
const onKs = (r: Rect): Rect => ({
  x: KS.x + r.x * KS.scale,
  y: r.y * KS.scale,
  w: r.w * KS.scale,
  h: r.h * KS.scale,
  r: r.r * KS.scale,
});

const FIT = fitCloud(500, 594, 0.8);
const CLOUD_MID = 470;

const CAMERA: [number, number][] = [
  [0, KS.h / 2],
  [0.1, KS.h / 2],
  [0.46, CLOUD_MID],
  [1, CLOUD_MID],
];
function camera(p: number) {
  for (let i = 1; i < CAMERA.length; i++) {
    const [p1, y1] = CAMERA[i];
    const [p0, y0] = CAMERA[i - 1];
    if (p <= p1) return lerp(y0, y1, ease((p - p0) / (p1 - p0)));
  }
  return CAMERA[CAMERA.length - 1][1];
}

export type Frame = CloudFrame & { shift: number; ks: number };

export function scene(p: number): Frame {
  const merge = span(p, 0.4, 0.48);
  const solid = span(p, 0.46, 0.54);

  const move = (top: Rect, open: Rect, shut: Rect, t: ReturnType<typeof traits>): Piece => {
    // A small hop out of the keybed, then the fall into the cloud.
    const pop = span(p, 0.03 + t.order * 0.06, 0.08 + t.order * 0.06);
    const g = clamp((p - (0.08 + t.order * 0.16)) / 0.18);
    const eg = ease(g);
    let r = mix(top, open, eg);
    r = { ...r, y: r.y - 7 * pop * (1 - eg) };
    r = mix(r, shut, merge);
    const turn = pop * (1 - eg) * t.spin * 0.08 + Math.sin(Math.PI * g) * t.spin;
    return { ...r, turn, tone: clamp((g - 0.5) / 0.5) };
  };

  return {
    shift: VIEW.h / 2 - camera(p),
    ks: 1 - span(p, 0.12, 0.3),
    fit: FIT,
    whites: KEYS.whites.map((k, i) =>
      move(onKs(k), place(WHITE_SLOTS[i].open, FIT), place(WHITE_SLOTS[i].shut, FIT), traits("white", i)),
    ),
    blacks: KEYS.blacks.map((k, j) => {
      const slot = place(BLACK_SLOTS[j], FIT);
      return move(onKs(k), slot, slot, traits("black", j));
    }),
    pieces: solid < 1,
    base: merge,
    cloud: solid,
    lock: solid,
    shackleDraw: span(p, 0.62, 0.82),
    shackleDrop: lerp(-12, 0, span(p, 0.84, 0.94)),
  };
}
