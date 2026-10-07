// The drawing for the hidden post, as a pure function of progress p (0 to 1), so every frame is the
// same on every device and the stills (reduced motion) match the live scroll exactly.
//
// One small traveler made of the three parts the post names: the mind (an outlined capsule that
// carries the eyes), the body (a solid capsule) and the heart (amber). The heart is itself two
// capsules leaning on each other, which is what lets the mind and the body become a heart near the
// end. Walking is tied to scrolling: every bit of reading is a step.

import { clamp, ease, lerp, rand } from "@/lib/motion";
import { T } from "./timeline";

/** The scene's frame: the sky above, the ground near the bottom. */
export const VIEW = { x: 0, y: 20, w: 800, h: 400 } as const;
export const GROUND = 380;
const CX = 400;
/** The loop the traveler runs once, when it is okay to lose your way. */
export const LOOP = { cx: CX, cy: GROUND - 130, r: 130 } as const;
/** The plan, and the journey that replaces it: a doodle in the sky, from one dot to another. */
export const PLAN = { x0: 274, x1: 674, y: 150 } as const;
/** Where the experiences gather into a light. */
const ORB = { x: 640, y: 236 } as const;

// ---- Small tools

type Key = readonly [number, number];

/** A value that eases from key to key along the story; keys are [progress, value], in order. */
function keys(p: number, ks: readonly Key[]): number {
  if (p <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, v1] = ks[i];
    if (p <= t1) {
      const [t0, v0] = ks[i - 1];
      return lerp(v0, v1, ease((p - t0) / Math.max(1e-6, t1 - t0)));
    }
  }
  return ks[ks.length - 1][1];
}
const lin = (p: number, a: number, b: number) => clamp((p - a) / Math.max(1e-6, b - a));
const smooth = (p: number, a: number, b: number) => ease(lin(p, a, b));
/** 0, rising to 1 halfway, back to 0. */
const arc = (t: number) => Math.sin(Math.PI * clamp(t));
const rad = (deg: number) => (deg * Math.PI) / 180;

function rotateAbout(x: number, y: number, cx: number, cy: number, deg: number): [number, number] {
  const a = rad(deg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * c - dy * s, cy + dx * s + dy * c];
}

// ---- Shapes

/** A capsule: a rectangle with fully rounded ends, centered, long axis vertical before `rot`. */
export type Cap = { cx: number; cy: number; w: number; h: number; rot: number };
/** A heart by its center and height. */
export type HeartShape = { cx: number; cy: number; s: number; rot: number };

const mixCap = (a: Cap, b: Cap, t: number): Cap => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  rot: lerp(a.rot, b.rot, t),
});
const mixHeart = (a: HeartShape, b: HeartShape, t: number): HeartShape => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  s: lerp(a.s, b.s, t),
  rot: lerp(a.rot, b.rot, t),
});

/** A soft heart from two capsules leaning on each other: round lobes and a round tip, no point.
    It is s tall and 1.375 s wide; its top notch is 0.254 s above the center. */
export function heartCaps(h: HeartShape): [Cap, Cap] {
  const r = 0.3125 * h.s;
  const d = 0.375 * h.s;
  const len = d * Math.SQRT2 + 2 * r;
  const by = h.cy + 0.1875 * h.s; // the tip's round end
  const cap = (side: -1 | 1): Cap => {
    const [cx, cy] = rotateAbout(h.cx + (side * d) / 2, by - d / 2, h.cx, h.cy, h.rot);
    return { cx, cy, w: 2 * r, h: len, rot: side * 45 + h.rot };
  };
  return [cap(-1), cap(1)];
}

// ---- The traveler

type Pose = { x: number; y: number; rot: number };
const BODY_W = 44;
const MIND_W = 40; // across; the mind lies on its side, so it is drawn turned 90 degrees
const MIND_H = 64;

/** The three parts stacked into one figure standing at `pose` (its feet), turned about the feet. */
function assemble(pose: Pose, bodyH: number, headTilt: number, headDy: number) {
  const at = (lx: number, ly: number) => rotateAbout(pose.x + lx, pose.y + ly, pose.x, pose.y, pose.rot);
  const [bx, by] = at(0, -bodyH / 2);
  const [mx, my] = at(0, -bodyH - 30 + headDy);
  const [hx, hy] = at(0, -bodyH * 0.56);
  return {
    body: { cx: bx, cy: by, w: BODY_W, h: bodyH, rot: pose.rot } satisfies Cap,
    mind: { cx: mx, cy: my, w: MIND_W, h: MIND_H, rot: 90 + pose.rot + headTilt } satisfies Cap,
    heart: { cx: hx, cy: hy, s: 22, rot: pose.rot } satisfies HeartShape,
  };
}

// Where the traveler walks, and how far: [moment, from, to, distance]. Distance moves the world.
const WALKS: readonly (readonly [string, number, number, number])[] = [
  ["carry", 0.5, 1, 120],
  ["forget", 0, 1, 150],
  ["alive", 0, 0.72, 190],
  ["change", 0, 1, 210],
  ["lost", 0.85, 1, 40],
  ["wander", 0, 1, 200],
  ["answers", 0, 1, 140],
  ["times", 0, 0.33, 120],
  ["allowed", 0.05, 0.3, 40],
  ["again", 0.55, 1, 90],
  ["plans", 0.6, 1, 180],
  ["find", 0, 0.8, 150],
  ["forward", 0.4, 1, 220],
  ["going", 0, 1, 240],
  ["alright", 0, 1, 120],
  ["end", 0, 0.8, 140],
];
const walked = (p: number) => WALKS.reduce((d, [id, f0, f1, dist]) => d + dist * lin(p, T(id, f0), T(id, f1)), 0);

// ---- One frame

export type Dot = { x: number; y: number; r: number; o: number };
export type Label = { text: "mind" | "body" | "heart"; x: number; y: number; o: number };

export type Art = {
  night: number;
  dawn: number;
  sun: Dot;
  moon: Dot;
  ahead: Dot;
  ground: { o: number; draw: number; path: string };
  pebbles: Dot[];
  eyes: { x: number; y: number; gap: number; r: number; rot: number; open: number; happy: number; o: number };
  confetti: (Cap & { o: number; tone: number })[];
  box: { o: number; y: number; lid: number };
  bubble: { x: number; y: number; o: number };
  mind: Cap & { o: number; warm: number };
  body: Cap & { o: number; warm: number };
  heart: HeartShape & { o: number; glow: number; dim: number };
  labels: Label[];
  thoughts: Dot[];
  flower: { x: number; y: number; bloom: number; o: number };
  flags: { x: number; y: number; rise: number; o: number }[];
  fireflies: Dot[];
  orb: Dot;
  loop: { o: number; draw: number };
  birds: (Dot & { flap: number })[];
  questions: Dot[];
  cloud: { x: number; y: number; s: number; o: number };
  rain: number;
  tears: Dot[];
  splash: Dot;
  feelings: (Dot & { warm: boolean })[];
  cushion: { x: number; o: number; squish: number };
  breathing: boolean;
  cracks: { cx: number; cy: number; s: number; draw: number; gold: number; o: number };
  arms: { cx: number; cy: number; s: number; draw: number; o: number };
  others: Dot[];
  halo: { cx: number; cy: number; o: number; s: number };
  grid: number;
  route: { draw: number; o: number };
  journey: { draw: number; o: number };
  pulse: boolean;
  specks: (Dot & { warm: number })[];
  beam: { x: number; y: number; o: number };
  sparks: Dot[];
};

export function art(p: number): Art {
  const wx = walked(p);

  // The ground: a line that draws in once there is somewhere to walk, and rolls into hills while
  // wandering.
  const wave = keys(p, [
    [T("wander", 0), 0],
    [T("wander", 0.35), 16],
    [T("answers", 0.1), 16],
    [T("answers", 0.45), 0],
  ]);
  const groundY = (x: number) => GROUND + wave * Math.sin((x + wx) * 0.018);
  const groundO = keys(p, [
    [T("carry", 0.15), 0],
    [T("carry", 0.45), 1],
    [T("wounds", 0), 1],
    [T("wounds", 0.3), 0],
    [T("plans", 0.05), 0],
    [T("plans", 0.3), 1],
    [T("recap", 0), 1],
    [T("recap", 0.4), 0],
    [T("forward", 0.1), 0],
    [T("forward", 0.4), 1],
  ]);
  let groundPath = `M-40 ${groundY(-40).toFixed(1)}`;
  for (let x = -20; x <= 840; x += 20) groundPath += `L${x} ${groundY(x).toFixed(1)}`;

  // ---- The traveler's pose: lying down to rest, sitting up in the rain, standing, leaning when
  // tired, falling onto a cushion, getting up again slowly. And once, a loop.
  const turn = keys(p, [
    [T("times", 0.36), 0],
    [T("times", 0.58), -90],
    [T("times", 0.72), -90],
    [T("times", 0.95), -38],
    [T("feel", 0.3), -38],
    [T("feel", 0.6), 0],
    [T("allowed", 0.05), 0],
    [T("allowed", 0.3), 9],
    [T("allowed", 0.7), 9],
    [T("allowed", 0.9), 90],
    [T("again", 0.05), 90],
    [T("again", 0.55), 0],
  ]);
  const cushion = keys(p, [
    [T("allowed", 0.72), 0],
    [T("allowed", 0.86), 1],
    [T("again", 0.3), 1],
    [T("again", 0.6), 0],
  ]);
  const th = rad(turn);
  // Leaning, the body's round end rolls on the ground; lying, it rests on its side, and on the
  // cushion when there is one. The step's little bounce only shows upright.
  const lift = 22 * (1 - Math.cos(th)) + 24 * cushion * Math.abs(Math.sin(th));
  const bob = (1 - Math.cos(wx * 0.12)) * 1.6 * Math.cos(th);
  const stand: Pose = { x: CX, y: groundY(CX) - bob - lift, rot: turn };
  const loopT = smooth(p, T("lost", 0.15), T("lost", 0.85));
  let pose = stand;
  if (loopT > 0 && loopT < 1) {
    const phi = loopT * Math.PI * 2;
    pose = {
      x: LOOP.cx + LOOP.r * Math.sin(phi),
      y: LOOP.cy + LOOP.r * Math.cos(phi),
      rot: -(phi * 180) / Math.PI,
    };
  }
  const bodyH = keys(p, [
    [T("feel", 0.5), 78],
    [T("feel", 0.9), 90],
  ]);
  const droop = keys(p, [
    [T("allowed", 0.05), 0],
    [T("allowed", 0.3), 1],
    [T("allowed", 0.66), 1],
    [T("allowed", 0.82), 0],
  ]);
  // Lying down, the head turns to lie flat too (the mind is wider than the body), facing up.
  const flat = Math.sin(th) ** 2;
  const A = assemble(pose, bodyH, -turn * flat + 14 * droop, 6 * droop);

  // The mind and the body: alone in a row twice (first mind, body, heart; later body, mind, heart),
  // stacked into the traveler in between.
  const asm = keys(p, [
    [T("carry", 0), 0],
    [T("carry", 0.45), 1],
    [T("recap", 0.1), 1],
    [T("recap", 0.6), 0],
  ]);
  const grow = keys(p, [
    [T("parts", 0), 0.6],
    [T("parts", 0.4), 1],
  ]);
  const freeMind: Cap = {
    cx: keys(p, [
      [T("carry", 0.5), 250],
      [T("recap", 0.05), 400],
    ]),
    cy: 250,
    w: MIND_W * grow,
    h: MIND_H * grow,
    rot: 90,
  };
  const freeBody: Cap = {
    cx: keys(p, [
      [T("carry", 0.5), 400],
      [T("recap", 0.05), 250],
    ]),
    cy: 250,
    w: BODY_W * grow,
    h: bodyH * grow,
    rot: 0,
  };
  let mind = mixCap(freeMind, A.mind, asm);
  let body = mixCap(freeBody, A.body, asm);

  // "Only the body and the mind": the two lean together into a heart, which then carries on alone.
  // Each turns an eighth of the way round, the body into the left half, the mind into the right.
  const toHeart = smooth(p, T("make", 0.2), T("make", 1));
  const lock = smooth(p, T("love", 0), T("love", 0.35));
  const hop =
    p > T("forward", 0.4) ? Math.abs(Math.sin(wx * 0.05)) * 14 * (1 - smooth(p, T("end", 0.5), T("end", 0.8))) : 0;
  const big: HeartShape = {
    cx: keys(p, [
      [T("end", 0), CX],
      [T("end", 0.8), 610],
    ]),
    cy:
      keys(p, [
        [T("love", 0), 250],
        [T("hears", 0), 250],
        [T("hears", 0.6), 236],
        [T("forward", 0.05), 236],
        [T("forward", 0.4), GROUND - 18],
        [T("end", 0), GROUND - 18],
        [T("end", 0.8), 352],
      ]) - hop,
    s: keys(p, [
      [T("make", 0.2), 120],
      [T("love", 0.35), 150],
      [T("forward", 0.05), 150],
      [T("forward", 0.4), 34],
      [T("end", 0), 34],
      [T("end", 0.8), 6],
    ]),
    rot: 0,
  };
  if (toHeart > 0) {
    const [l, r] = heartCaps(big);
    const gap = 24 * (1 - lock);
    body = mixCap(body, { ...l, cx: l.cx - gap }, toHeart);
    mind = mixCap(mind, { ...r, cx: r.cx + gap }, toHeart);
  }
  const partsO = keys(p, [
    [T("parts", 0), 0],
    [T("parts", 0.35), 1],
    [T("wounds", 0), 1],
    [T("wounds", 0.35), 0],
    [T("plans", 0), 0],
    [T("plans", 0.3), 1],
    [T("end", 0.55), 1],
    [T("end", 0.85), 0],
  ]);
  const warm = smooth(p, T("love", 0.05), T("love", 0.4));

  // ---- The heart: out of a box, into its place in the row, onto the chest; dim while forgotten;
  // large and cracked when it hurts; back on the chest; gone when "only the body and the mind".
  const heartFree = keys(p, [
    [T("carry", 0), 1],
    [T("carry", 0.45), 0],
    [T("wounds", 0), 0],
    [T("wounds", 0.45), 1],
    [T("plans", 0), 1],
    [T("plans", 0.35), 0],
    [T("recap", 0.1), 0],
    [T("recap", 0.6), 1],
  ]);
  const freeHeart: HeartShape = {
    cx: keys(p, [
      [T("parts", 0.05), CX],
      [T("parts", 0.45), 550],
      [T("carry", 0.5), 550],
      [T("wounds", 0), CX],
      [T("plans", 0.4), CX],
      [T("recap", 0.05), 550],
    ]),
    cy: keys(p, [
      [T("found", 0.5), 345],
      [T("found", 0.95), 255],
      [T("parts", 0.05), 255],
      [T("parts", 0.45), 250],
      [T("carry", 0.5), 250],
      [T("wounds", 0), 232],
      [T("plans", 0.4), 232],
      [T("recap", 0.05), 250],
      [T("two", 0.2), 250],
      [T("two", 0.7), 274],
    ]),
    s: keys(p, [
      [T("found", 0.5), 22],
      [T("found", 0.95), 64],
      [T("parts", 0.45), 60],
      [T("carry", 0.5), 60],
      [T("wounds", 0.05), 40],
      [T("wounds", 0.45), 190],
      [T("plans", 0), 190],
      [T("plans", 0.35), 24],
      [T("recap", 0.05), 60],
    ]),
    rot: 0,
  };
  const heartShape = mixHeart(freeHeart, A.heart, 1 - heartFree);
  const feelGlow = arc(lin(p, T("feel", 0.4), T("feel", 0.78)));
  const heart = {
    ...heartShape,
    o: keys(p, [
      [T("found", 0.45), 0],
      [T("found", 0.55), 1],
      [T("two", 0.2), 1],
      [T("two", 0.7), 0],
    ]),
    glow: Math.max(
      keys(p, [
        [T("found", 0.5), 0],
        [T("found", 0.9), 1],
        [T("parts", 0.3), 1],
        [T("parts", 0.6), 0],
      ]),
      feelGlow,
    ),
    dim: keys(p, [
      [T("forget", 0.3), 1],
      [T("forget", 0.9), 0.4],
      [T("alive", 0.75), 0.4],
      [T("alive", 0.95), 1],
    ]),
  };

  // ---- The eyes: alone at first (the page noticing you), then on the mind.
  const attach = smooth(p, T("parts", 0), T("parts", 0.45));
  const soloS = keys(p, [
    [T("oh", 0), 0.82],
    [T("oh", 0.28), 1.3],
    [T("oh", 0.6), 1],
  ]);
  const soloY =
    keys(p, [
      [T("found", 0.05), 205],
      [T("found", 0.4), 150],
    ]) + 6 * arc(lin(p, T("found", 0.2), T("found", 0.75)));
  const soloRot = keys(p, [
    [T("huh", 0.05), 0],
    [T("huh", 0.4), -14],
    [T("still", 0.05), -14],
    [T("still", 0.35), 0],
  ]);
  const happy = keys(p, [
    [T("glad", 0), 0],
    [T("glad", 0.25), 1],
    [T("found", 0), 1],
    [T("found", 0.25), 0],
  ]);
  const open = keys(p, [
    [T("still", 0.2), 1],
    [T("still", 0.4), 0.35],
    [T("still", 0.62), 0.35],
    [T("still", 0.8), 1],
    [T("times", 0.4), 1],
    [T("times", 0.55), 0.12],
    [T("times", 0.72), 0.12],
    [T("times", 0.85), 0.75],
    [T("feel", 0.4), 0.75],
    [T("feel", 0.6), 1],
    [T("allowed", 0.05), 1],
    [T("allowed", 0.25), 0.5],
    [T("allowed", 0.85), 0.5],
    [T("allowed", 0.95), 0.1],
    [T("again", 0.1), 0.1],
    [T("again", 0.4), 1],
  ]);
  const lookBack = 4 * arc(lin(p, T("alive", 0.7), T("alive", 1)));
  const along = [Math.sin(rad(mind.rot)), -Math.cos(rad(mind.rot))] as const;
  const eyes = {
    x: lerp(CX, mind.cx - along[0] * lookBack, attach),
    y: lerp(soloY, mind.cy - along[1] * lookBack, attach),
    gap: lerp(52 * soloS, 24, attach),
    r: lerp(8.5 * soloS, 4.6, attach),
    rot: lerp(soloRot, mind.rot - 90, attach),
    open,
    happy: happy * (1 - attach),
    o: (1 - attach + attach * partsO) * (1 - smooth(p, T("make", 0), T("make", 0.3))),
  };
  const leftEye = (): [number, number] => [eyes.x - (along[0] * eyes.gap) / 2, eyes.y - (along[1] * eyes.gap) / 2];

  // ---- Congratulations: little capsules raining down from the top, swaying as they fall.
  const burst = lin(p, T("glad", 0.05), T("found", 0.55));
  const confetti =
    burst > 0 && burst < 1
      ? Array.from({ length: 26 }, (_, i) => {
          const fall = burst * (300 + rand(i + 17) * 160) - rand(i + 41) * 90;
          return {
            cx: 150 + rand(i + 3) * 500 + Math.sin(burst * 7 + i) * 14,
            cy: 30 + fall,
            w: 6,
            h: 14,
            rot: (rand(i + 29) - 0.5) * 900 * burst,
            o: lin(fall, -10, 20) * (1 - lin(burst, 0.6, 1)),
            tone: i % 4,
          };
        })
      : [];

  // ---- A part rarely shown: a box that opens, the heart rising out of it.
  const box = {
    o: keys(p, [
      [T("found", 0), 0],
      [T("found", 0.22), 1],
      [T("share", 0), 1],
      [T("share", 0.35), 0],
    ]),
    y: 340 + 30 * smooth(p, T("share", 0), T("share", 0.35)),
    lid: smooth(p, T("found", 0.3), T("found", 0.62)),
  };
  const bubble = {
    x: 500,
    y: 108,
    o: keys(p, [
      [T("share", 0.35), 0],
      [T("share", 0.6), 1],
      [T("parts", 0), 1],
      [T("parts", 0.25), 0],
    ]),
  };

  // ---- Names under the parts, the two times they line up.
  const first = keys(p, [
    [T("parts", 0.4), 0],
    [T("parts", 0.7), 1],
    [T("carry", 0), 1],
    [T("carry", 0.25), 0],
  ]);
  const second = keys(p, [
    [T("three", 0), 0],
    [T("three", 0.3), 1],
    [T("make", 0), 1],
    [T("make", 0.25), 0],
  ]);
  const labels: Label[] = [
    { text: "mind", x: 250, y: 330, o: first },
    { text: "body", x: 400, y: 330, o: first },
    { text: "heart", x: 550, y: 330, o: first },
    { text: "body", x: 250, y: 330, o: second },
    { text: "mind", x: 400, y: 330, o: second },
    { text: "heart", x: 550, y: 330, o: second * (1 - smooth(p, T("two", 0.2), T("two", 0.6))) },
  ];

  // ---- Forgetting: thoughts drift off one by one.
  const thoughts = (
    [
      [22, -34, 5],
      [38, -56, 7],
      [58, -82, 10],
    ] as const
  ).map(([dx, dy, r], i) => {
    const born = smooth(p, T("forget", 0.02 + i * 0.08), T("forget", 0.14 + i * 0.08));
    const away = smooth(p, T("forget", 0.45 + i * 0.1), T("forget", 0.85 + i * 0.1));
    return { x: mind.cx + dx - 60 * away, y: mind.cy + dy - 50 * away, r, o: born * (1 - away) };
  });

  // ---- Being alive: a flower by the path, passed by, then looked back at.
  const flowerX = CX + 150 + walked(T("alive", 0)) - wx;
  const flower = {
    x: flowerX,
    y: groundY(flowerX),
    bloom: smooth(p, T("alive", 0.05), T("alive", 0.5)),
    o: keys(p, [
      [T("alive", 0), 0],
      [T("alive", 0.1), 1],
      [T("change", 0.3), 1],
      [T("change", 0.5), 0],
    ]),
  };

  // ---- Destinations change: the flag ahead sinks away and another rises further on.
  const w0 = walked(T("change", 0));
  const sink = smooth(p, T("change", 0.42), T("change", 0.62));
  const flagA = CX + 300 + w0 - wx;
  const flagB = CX + 470 + w0 - wx;
  const flags = [
    {
      x: flagA,
      y: groundY(flagA),
      rise: 1 - sink,
      o: keys(p, [
        [T("change", 0), 0],
        [T("change", 0.12), 1],
      ]),
    },
    {
      x: flagB,
      y: groundY(flagB),
      rise: smooth(p, T("change", 0.5), T("change", 0.7)),
      o: 1 - smooth(p, T("lost", 0), T("lost", 0.15)),
    },
  ];

  // ---- Experiences stay with us: fireflies that follow, later gathering into a light ahead. They
  // keep to where the traveler walks, and wait there while it runs its loop.
  let gathered = 0;
  const fireflies = Array.from({ length: 5 }, (_, i) => {
    const born = smooth(p, T("change", 0.2 + i * 0.13), T("change", 0.3 + i * 0.13));
    const gather = smooth(p, T("find", 0.05 + i * 0.1), T("find", 0.35 + i * 0.1));
    gathered += gather;
    const fx = stand.x - 54 - i * 17 + Math.sin(wx * 0.05 + i * 1.7) * 6;
    const fy = GROUND - 128 - (i % 2) * 16 + Math.cos(wx * 0.04 + i) * 6;
    return {
      x: lerp(fx, ORB.x, gather),
      y: lerp(fy, ORB.y, gather),
      r: 3.2,
      o: born * (1 - lin(gather, 0.85, 1)) * partsO,
    };
  });
  const orb = {
    ...ORB,
    r: 6 + gathered * 3.2,
    o: smooth(p, T("find", 0.05), T("find", 0.25)) * (1 - smooth(p, T("recap", 0), T("recap", 0.4))),
  };

  // ---- Lost, and wandering.
  const loop = {
    o: keys(p, [
      [T("lost", 0), 0],
      [T("lost", 0.12), 1],
      [T("lost", 0.86), 1],
      [T("lost", 1), 0],
    ]),
    draw: smooth(p, T("lost", 0), T("lost", 0.15)),
  };
  const fly = lin(p, T("wander", 0), T("answers", 0.2));
  const birds =
    fly > 0 && fly < 1
      ? [0, 1].map((i) => ({
          x: 760 - fly * 620 + i * 46,
          y: 120 + i * 18 + Math.sin(fly * 12 + i) * 6,
          r: 1,
          o: arc(fly),
          flap: Math.sin(fly * 70 + i * 2.1),
        }))
      : [];
  const questions = Array.from({ length: 4 }, (_, i) => {
    const t = lin(p, T("answers", 0.05 + i * 0.12), T("answers", 0.45 + i * 0.12));
    return { x: mind.cx - 24 + i * 16 + Math.sin(t * 4 + i) * 4, y: mind.cy - 30 - t * 70, r: 1, o: arc(t) };
  });

  // ---- The sky: a morning sun, an arc across the day, a sunset; a night with a moon and stars;
  // a second dawn; and at the end, a large sunrise ahead.
  const sky = keys(p, [
    [T("again", 0), 1],
    [T("wounds", 0), 1],
    [T("wounds", 0.3), 0],
    [T("plans", 0), 0],
    [T("plans", 0.3), 1],
    [T("recap", 0), 1],
    [T("recap", 0.4), 0],
  ]);
  let sun: Dot;
  if (p < T("again", 0)) {
    const rise = smooth(p, T("alive", 0), T("alive", 0.8));
    const s = smooth(p, T("answers", 0.3), T("answers", 1));
    const set = smooth(p, T("times", 0), T("times", 0.33));
    sun = {
      x: 180 + 460 * s,
      y: lerp(430, 140, rise) - 60 * Math.sin(Math.PI * s) + 160 * s + 140 * set,
      r: 26,
      o: rise * (1 - set),
    };
  } else if (p < T("alright", 0)) {
    const rise = smooth(p, T("again", 0.3), T("again", 1));
    sun = { x: 150, y: lerp(440, 140, rise), r: 26, o: rise * sky };
  } else {
    const rise = smooth(p, T("alright", 0), T("alright", 0.9));
    sun = { x: 600, y: lerp(440, 330, rise), r: lerp(30, 58, rise), o: rise };
  }
  const night = keys(p, [
    [T("times", 0.33), 0],
    [T("times", 0.58), 1],
    [T("feel", 0.7), 1],
    [T("feel", 1), 0.55],
    [T("allowed", 0.6), 0.55],
    [T("stop", 0.3), 0.9],
    [T("again", 0.2), 0.9],
    [T("again", 0.8), 0],
  ]);
  const moon = { x: 232, y: 108, r: 20, o: lin(night, 0.35, 0.9) };
  const ahead = {
    x: 690,
    y: GROUND,
    r: lerp(30, 90, smooth(p, T("forward", 0.3), T("going", 1))),
    o: keys(p, [
      [T("forward", 0.2), 0],
      [T("forward", 0.5), 1],
      [T("alright", 0.6), 1],
      [T("alright", 1), 0],
    ]),
  };

  // ---- Rain, tears, and the feelings that become part of you.
  const cloud = {
    x: 430 + 170 * smooth(p, T("feel", 0.6), T("feel", 0.9)),
    y: 112,
    s: 0.4,
    o: keys(p, [
      [T("times", 0.66), 0],
      [T("times", 0.8), 1],
      [T("feel", 0.6), 1],
      [T("feel", 0.9), 0],
    ]),
  };
  const rain = keys(p, [
    [T("times", 0.7), 0],
    [T("times", 0.82), 1],
    [T("feel", 0.5), 1],
    [T("feel", 0.66), 0],
  ]);
  const tear = (a: number, b: number): Dot => {
    const t = lin(p, a, b);
    const [ex, ey] = leftEye();
    return { x: ex, y: ey + (groundY(ex) - 4 - ey) * t * t, r: 4.4, o: t > 0 && t < 1 ? 1 - lin(t, 0.85, 1) : 0 };
  };
  const tears = [tear(T("times", 0.8), T("times", 0.98)), tear(T("allowed", 0.38), T("allowed", 0.6))];
  const splashT = lin(p, T("allowed", 0.6), T("allowed", 0.7));
  const splash = { x: leftEye()[0], y: GROUND - 2, r: 2 + 14 * splashT, o: splashT > 0 && splashT < 1 ? 1 - splashT : 0 };
  const feelings = (
    [
      [300, 150, 0.12, false],
      [520, 160, 0.18, false],
      [360, 120, 0.24, false],
      [560, 230, 0.3, true],
    ] as const
  ).map(([x, y, at, isWarm]) => {
    const t = lin(p, T("feel", at), T("feel", at + 0.3));
    const k = ease(t);
    return {
      x: lerp(x, heart.cx, k),
      y: lerp(y, heart.cy, k) - 30 * arc(t),
      r: isWarm ? 5 : 4,
      o: t > 0 && t < 1 ? 1 : 0,
      warm: isWarm,
    };
  });

  // ---- Wounds: cracks, an embrace, the others leaving, the cracks turning to gold, and peace.
  const cracks = {
    cx: heart.cx,
    cy: heart.cy,
    s: heart.s,
    draw: smooth(p, T("wounds", 0.25), T("wounds", 0.62)),
    gold: smooth(p, T("yourself", 0.36), T("yourself", 0.62)),
    o: keys(p, [
      [T("wounds", 0.2), 1],
      [T("plans", 0), 1],
      [T("plans", 0.25), 0],
    ]),
  };
  const arms = {
    cx: heart.cx,
    cy: heart.cy,
    s: heart.s,
    draw: smooth(p, T("wounds", 0.6), T("wounds", 0.98)),
    o: keys(p, [
      [T("wounds", 0.55), 1],
      [T("yourself", 0.75), 1],
      [T("yourself", 1), 0.35],
      [T("plans", 0), 0.35],
      [T("plans", 0.2), 0],
    ]),
  };
  const leave = smooth(p, T("yourself", 0.12), T("yourself", 0.32));
  const othersO =
    keys(p, [
      [T("wounds", 0.85), 0],
      [T("yourself", 0.08), 1],
    ]) *
    (1 - leave);
  const others = [
    { x: 140 - 70 * leave, y: 330, r: 1, o: othersO },
    { x: 660 + 70 * leave, y: 330, r: 1, o: othersO },
  ];
  const halo = {
    cx: heart.cx,
    cy: heart.cy,
    o: keys(p, [
      [T("yourself", 0.66), 0],
      [T("yourself", 0.9), 1],
      [T("plans", 0), 1],
      [T("plans", 0.25), 0],
    ]),
    s: lerp(0.85, 1, smooth(p, T("yourself", 0.66), T("yourself", 1))),
  };

  // ---- Plans and the journey: a grid and a straight dashed line, then the real way, which loops.
  const grid = keys(p, [
    [T("plans", 0.08), 0],
    [T("plans", 0.3), 1],
    [T("plans", 0.62), 1],
    [T("plans", 0.9), 0],
  ]);
  const route = {
    draw: smooth(p, T("plans", 0.22), T("plans", 0.45)),
    o: keys(p, [
      [T("plans", 0.5), 1],
      [T("plans", 0.75), 0.3],
      [T("find", 0.5), 0.3],
      [T("recap", 0.1), 0],
    ]),
  };
  const journey = {
    draw: smooth(p, T("plans", 0.5), T("plans", 0.95)),
    o: keys(p, [
      [T("plans", 0.5), 1],
      [T("find", 0.5), 1],
      [T("recap", 0.1), 0],
    ]),
  };

  // ---- Healing, and being heard.
  const specks = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const born = smooth(p, T("heal", 0.02 + i * 0.02), T("heal", 0.2 + i * 0.02));
    const rise = smooth(p, T("heal", 0.3 + i * 0.06), T("heal", 0.6 + i * 0.06));
    return {
      x: big.cx + Math.cos(a) * big.s * 0.3,
      y: big.cy - 0.04 * big.s + Math.sin(a) * big.s * 0.2 - rise * 150,
      r: 3.4,
      o: born * (1 - lin(rise, 0.6, 1)),
      warm: rise,
    };
  });
  const beam = {
    x: big.cx,
    y: big.cy,
    o: keys(p, [
      [T("hears", 0), 0],
      [T("hears", 0.4), 1],
      [T("forward", 0), 1],
      [T("forward", 0.3), 0],
    ]),
  };
  const sparks = Array.from({ length: 6 }, (_, i) => {
    const t = lin(p, T("hears", 0.15 + i * 0.1), T("hears", 0.55 + i * 0.1));
    return { x: big.cx + (rand(i + 40) - 0.5) * big.s * 0.6, y: lerp(big.cy - big.s * 0.4, 30, t), r: 2.6, o: arc(t) };
  });

  return {
    night,
    dawn: smooth(p, T("alright", 0), T("alright", 1)),
    sun,
    moon,
    ahead,
    ground: { o: groundO, draw: smooth(p, T("carry", 0.15), T("carry", 0.6)), path: groundPath },
    pebbles: Array.from({ length: 10 }, (_, i) => {
      const x = ((((i * 97 + 40 - wx) % 970) + 970) % 970) - 85;
      return { x, y: groundY(x) + 9 + (i % 3) * 3, r: 2 + (i % 2), o: groundO };
    }),
    eyes,
    confetti,
    box,
    bubble,
    mind: { ...mind, o: partsO, warm },
    body: { ...body, o: partsO, warm },
    heart,
    labels,
    thoughts,
    flower,
    flags,
    fireflies,
    orb,
    loop,
    birds,
    questions,
    cloud,
    rain,
    tears,
    splash,
    feelings,
    cushion: { x: CX + 62, o: cushion, squish: 1 - 0.18 * arc(lin(p, T("allowed", 0.86), T("allowed", 0.96))) },
    breathing: p > T("stop", 0.05) && p < T("again", 0.1),
    cracks,
    arms,
    others,
    halo,
    grid,
    route,
    journey,
    pulse: p > T("love", 0.35) && p < T("heal", 1),
    specks,
    beam,
    sparks,
  };
}
