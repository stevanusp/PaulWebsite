// Geometry for the "How I listen" story, as a pure function of scroll progress p (0 to 1).
// One amber object travels through it: an upload flagged on a security timeline, then a note in
// the song's xylophone part that sits outside B major until the chord under it shows up.
// Everything here is deterministic, so the server and the client draw the same frame. The motion
// that runs on its own (the event feed, playback, the keys) lives in Story.tsx and adds to this.

import { KEYSTATION } from "@/components/Keystation";

export const VIEW_W = 1000;
export const VIEW_H = 660;

/** Where each caption begins, in progress. Six captions, six beats. */
export const BEATS = [0, 0.16, 0.32, 0.48, 0.66, 0.84] as const;

export const stepAt = (p: number) => {
  let i = 0;
  for (let k = 0; k < BEATS.length; k++) if (p >= BEATS[k]) i = k;
  return i;
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** 0 before a, 1 after b, eased in between. */
const span = (p: number, a: number, b: number) => ease((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---- The song, as it sits in the project: 116 bpm, 3/4, B major. The loop is six bars.

export const BPM = 116;
export const METER = 3;
export const BEAT_S = 60 / BPM;
export const BAR_S = BEAT_S * METER;
export const LOOP_BARS = 6;
export const LOOP_S = BAR_S * LOOP_BARS;
/** Eighth notes per bar. Notes and steps below count in eighths from the top of the loop. */
export const STEPS = 6;
export const STEP_S = BAR_S / STEPS;

export { VOICINGS, inKey } from "@/lib/loop";

export type Note = { track: number; pitch: number; start: number; len: number };

// Xylophone: the chords broken into eighths. Bass: one note a bar. Violin: a falling line from
// bar 2, holding the A from F#m7 across into B7, where it becomes the seventh.
const XYLO = [
  [64, 68, 71, 75, 71, 68],
  [63, 67, 70, 73, 70, 67],
  [68, 70, 71, 75, 78, 75],
  [65, 68, 73, 77, 73, 68],
  [66, 69, 73, 76, 73, 69],
  [63, 66, 69, 71, 69, 66],
];
const BASS = [40, 39, 44, 41, 42, 35];
const VIOLIN = [
  { bar: 1, pitch: 73, bars: 1 },
  { bar: 2, pitch: 71, bars: 1 },
  { bar: 3, pitch: 68, bars: 1 },
  { bar: 4, pitch: 69, bars: 2 },
];

export const NOTES: Note[] = [
  ...XYLO.flatMap((bar, b) => bar.map((pitch, s) => ({ track: 0, pitch, start: b * STEPS + s, len: 1 }))),
  ...BASS.map((pitch, b) => ({ track: 1, pitch, start: b * STEPS, len: STEPS })),
  ...VIOLIN.map((v) => ({ track: 2, pitch: v.pitch, start: v.bar * STEPS, len: v.bars * STEPS })),
];

/** The last eighth of bar 2: F double sharp (it sounds as G), the third of D#7. */
export const ODD = 11;
/** Where it goes next: G# at the top of bar 3. */
export const RESOLVE = 12;

// ---- Window layout, in view units.

export const WIN = { w: 1000, h: 560, r: 22 };
export const LAYOUT = {
  BAR_H: 40,
  TOOL_H: 52,
  RULER_Y: 92,
  STRIP_Y: 116,
  STRIP_H: 36,
  LANES_Y: 152,
  LABEL_W: 170,
  LANES_X: 174,
  LANES_END: 990,
  LANE_COUNT: 3,
} as const;
const { STRIP_Y, STRIP_H, LANES_Y, LANES_X, LANES_END } = LAYOUT;

export const SPAN_W = LANES_END - LANES_X;
export const BAR_W = SPAN_W / LOOP_BARS;
export const STEP_W = BAR_W / STEPS;
export const xAt = (step: number) => LANES_X + step * STEP_W;

// Lane heights: short above the event log, tall once it is a song, short again above the piano roll.
const LANE_SEC = 64;
const LANE_MUS = 136;
const LANE_ROLL = 56;

/** Each track's pitch range, for the small notes drawn inside its regions. */
export const TRACKS = [
  { lo: 62, hi: 79 },
  { lo: 33, hi: 48 },
  { lo: 66, hi: 75 },
] as const;

export const REGIONS = [
  { lane: 0, from: 0, to: 6 },
  { lane: 1, from: 0, to: 6 },
  { lane: 2, from: 1, to: 6 },
] as const;

/** Piano roll panel, local to its own top: a header, then one row per semitone, high at the top. */
export const ROLL = { HEAD: 24, LOW: 62, HIGH: 79, ROW: 12 } as const;
export const rollY = (pitch: number) => ROLL.HEAD + (ROLL.HIGH - pitch) * ROLL.ROW;

/** Event log panel: a header row, then rows. */
export const LOG = { HEAD: 26, ROW: 27 } as const;

// ---- Keyboard: the Keystation drawing, in a 1000 x 228 box under the window.

const KB = KEYSTATION;

// ---- The security timeline.

type Rect = { x: number; y: number; w: number; h: number; r: number };

const ANOMALY_X = xAt(ODD) + 2;

type Ev = { lane: number; x: number; w: number; region: number | null; to: number };
const EVENTS: Ev[] = [];
const GAP = [30, 52, 88]; // the proxy is busy, access is steady, intrusion prevention is quiet
for (let lane = 0; lane < 3; lane++) {
  let x = LANES_X + 10 + rand(lane + 4) * 16;
  let k = 0;
  while (x < LANES_END - 22) {
    const w = 9 + rand(lane * 7 + k * 3) * 9;
    if (!(lane === 0 && Math.abs(x - ANOMALY_X) < 30)) {
      const region = REGIONS.findIndex(
        (r) => r.lane === lane && x >= xAt(r.from * STEPS) && x + w <= xAt(r.to * STEPS),
      );
      EVENTS.push({ lane, x, w, region: region >= 0 ? region : null, to: 0 });
    }
    x += GAP[lane] * (0.7 + rand(lane * 31 + k) * 0.6);
    k++;
  }
}
// In the change to music, each event widens to meet the next one in its region, so together
// they tile the region instead of piling up on top of each other.
EVENTS.forEach((e, i) => {
  if (e.region === null) return;
  const r = REGIONS[e.region];
  const next = EVENTS[i + 1];
  e.to = next && next.lane === e.lane && next.region === e.region ? next.x : xAt(r.to * STEPS);
});

// Event volume over time, one bar per bucket, with a spike where the upload happened.
const HIST_N = 34;
const HIST_W = SPAN_W / HIST_N;
const HIST = Array.from({ length: HIST_N }, (_, i) => 0.28 + 0.34 * rand(i * 13 + 5) + 0.14 * Math.sin(i * 0.55));
const SPIKE = Math.floor((ANOMALY_X - LANES_X) / HIST_W);

// ---- One frame.

export type Frame = {
  winScale: number;
  winX: number;
  winY: number;
  sec: number;
  mus: number;
  morph: number;
  laneH: number;
  laneTop: (lane: number) => number;
  lanesBottom: number;
  scan: number;
  scanOn: number;
  playheadOn: number;
  events: (Rect & { o: number })[];
  hist: { x: number; y: number; w: number; h: number; o: number; spike: boolean }[];
  histAlert: number;
  chordsOn: number;
  chordFocus: number;
  regions: (Rect & { o: number })[];
  minis: (Rect & { o: number })[];
  anomaly: Rect & { plain: number; alert: number; belongs: number; o: number };
  ring: Rect & { o: number };
  ping: number;
  card: { x: number; y: number; o: number; contained: number; from: { x: number; y: number } };
  logO: number;
  flagRow: number;
  contained: number;
  rollTop: number;
  rollO: number;
  /** Opacity of each note in the roll, indexed like NOTES (the xylophone is the first 30). */
  rollNotes: number[];
  band: number;
  tagAlone: number;
  tagBelongs: number;
  arrow: number;
  keysO: number;
  keysY: number;
};

export function scene(p: number): Frame {
  // Beats
  const reveal = span(p, 0, 0.12); // the timeline fills in
  const flag = span(p, 0.17, 0.24); // one upload turns amber
  const contain = span(p, 0.33, 0.4); // it is contained
  const morph = span(p, 0.48, 0.62); // the console becomes the song
  const roll = span(p, 0.66, 0.72); // the piano roll opens on one note
  const ctx = span(p, 0.74, 0.8); // its chord arrives around it
  const keys = span(p, 0.84, 0.9); // the keyboard

  const laneH = lerp(lerp(LANE_SEC, LANE_MUS, morph), LANE_ROLL, roll);
  const laneTop = (lane: number) => LANES_Y + lane * laneH;
  const center = (lane: number) => laneTop(lane) + laneH / 2;
  const lanesBottom = LANES_Y + 3 * laneH;

  const scan = lerp(LANES_X, LANES_END, reveal);
  const seenAt = (x: number) => clamp((scan - x) / 40);

  const regionRect = (i: number): Rect => {
    const r = REGIONS[i];
    return {
      x: xAt(r.from * STEPS) + 1.5,
      y: laneTop(r.lane) + 5,
      w: (r.to - r.from) * BAR_W - 3,
      h: laneH - 10,
      r: 8,
    };
  };

  // Events fade in behind the scan line, then join up into the region they fall in.
  const events = EVENTS.map((e, i) => {
    const from = { x: e.x, y: center(e.lane) - 7, w: e.w, h: 14, r: 7 };
    let to: Rect = from;
    if (e.region !== null) {
      const box = regionRect(e.region);
      const first = EVENTS[i - 1]?.region !== e.region || EVENTS[i - 1]?.lane !== e.lane;
      const x0 = first ? box.x : e.x;
      to = { x: x0, y: box.y, w: Math.max(4, e.to - x0 - 2), h: box.h, r: 8 };
    }
    const t = clamp(morph * 1.25 - ((e.x - LANES_X) / SPAN_W) * 0.25);
    const o = seenAt(e.x) * (e.region !== null ? Math.pow(1 - t, 1.2) * 0.9 : 1 - morph);
    return { ...mix(from, to, t), o };
  });

  const histTop = STRIP_Y + 6;
  const histH = STRIP_H - 12;
  const hist = HIST.map((v, i) => {
    const x = LANES_X + i * HIST_W + 3;
    const spike = i === SPIKE;
    const h = histH * (spike ? lerp(v, 1, flag) : v) * (1 - morph * 0.85);
    return { x, y: histTop + histH - h, w: HIST_W - 6, h, o: seenAt(x) * (1 - span(morph, 0, 0.6)), spike };
  });

  const regions = REGIONS.map((_, i) => ({ ...regionRect(i), o: span(morph, 0.3, 0.85) }));

  // The small notes inside each region, so they read as MIDI.
  const mini = (n: Note): Rect => {
    const t = TRACKS[n.track];
    const top = laneTop(n.track) + 22;
    const bottom = laneTop(n.track) + laneH - 9;
    const h = clamp((bottom - top) / (t.hi - t.lo + 1), 2.5, 4);
    return {
      x: xAt(n.start) + 1.5,
      y: lerp(top, bottom - h, (t.hi - n.pitch) / (t.hi - t.lo)),
      w: n.len * STEP_W - 3,
      h,
      r: h / 2,
    };
  };
  const miniO = span(morph, 0.75, 1);
  const minis = NOTES.map((n, i) => ({ ...mini(n), o: i === ODD ? 0 : miniO }));

  // Piano roll panel: slides up from the bottom as the lanes make room.
  const rollTop = lanesBottom;
  const rollO = roll;
  const rollNotes = NOTES.map((n, i) => {
    if (n.track !== 0 || i === ODD) return 0;
    const bar = Math.floor(n.start / STEPS);
    return bar === 1 ? span(ctx, 0, 0.55) : span(ctx, 0.3, 1);
  });

  // The amber object: an event, then a note in the xylophone region, then a note in the roll.
  const aEvent = { x: ANOMALY_X, y: center(0) - 7, w: 22, h: 14, r: 7 };
  const aGrow = { x: ANOMALY_X - 4, y: center(0) - 9, w: 30, h: 18, r: 9 };
  const m = mini(NOTES[ODD]);
  const aMini = { ...m, h: 5, y: m.y - 1, r: 2.5 };
  const rollH = ROLL.ROW - 4;
  const aRoll = { x: xAt(NOTES[ODD].start) + 1.5, y: rollTop + rollY(NOTES[ODD].pitch) + 2, w: STEP_W - 3, h: rollH, r: rollH / 2 };
  let a: Rect = aEvent;
  a = mix(a, aGrow, flag * (1 - morph));
  a = mix(a, aMini, morph);
  a = mix(a, aRoll, roll);
  const anomaly = {
    ...a,
    plain: 1 - flag,
    alert: flag * (1 - ctx),
    belongs: ctx,
    o: seenAt(ANOMALY_X),
  };

  const ring = { x: a.x - 8, y: a.y - 8, w: a.w + 16, h: a.h + 16, r: a.h / 2 + 8, o: contain * (1 - morph) };

  const card = {
    x: ANOMALY_X + 44,
    y: center(0) + 22,
    o: flag * (1 - span(p, 0.44, 0.5)),
    contained: contain,
    from: { x: a.x + a.w / 2, y: a.y + a.h },
  };

  // The window steps back and up to make room for the keyboard.
  const winScale = lerp(1, 0.74, keys);
  const winX = (VIEW_W - VIEW_W * winScale) / 2;
  const winY = lerp((VIEW_H - WIN.h) / 2, 0, keys);

  return {
    winScale,
    winX,
    winY,
    sec: 1 - span(morph, 0, 0.45),
    mus: span(morph, 0.55, 1),
    morph,
    laneH,
    laneTop,
    lanesBottom,
    scan,
    scanOn: reveal > 0 && reveal < 1 ? 1 : 0,
    playheadOn: span(p, 0.6, 0.65),
    events,
    hist,
    histAlert: flag,
    chordsOn: span(morph, 0.5, 1),
    chordFocus: ctx * (1 - keys),
    regions,
    minis,
    anomaly,
    ring,
    ping: flag * (1 - contain) * (1 - morph),
    card,
    logO: 1 - span(morph, 0, 0.5),
    flagRow: flag,
    contained: contain,
    rollTop,
    rollO,
    rollNotes,
    band: ctx * (1 - keys),
    tagAlone: span(roll, 0.6, 1) * (1 - span(ctx, 0, 0.4)),
    tagBelongs: span(ctx, 0.5, 1) * (1 - keys),
    arrow: span(ctx, 0.6, 1) * (1 - keys),
    keysO: clamp(keys * 1.6),
    keysY: lerp(VIEW_H + 20, VIEW_H - KB.h, keys),
  };
}

function mix(a: Rect, b: Rect, t: number): Rect {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
    r: lerp(a.r, b.r, t),
  };
}
