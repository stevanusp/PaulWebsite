// Geometry for the "How I listen" story, as a pure function of scroll progress p (0 to 1).
// One amber object travels through it: an alert on a security timeline, then a region on a
// piano track, then a wrong note in the piano roll, which is moved back into the key.
// Everything is deterministic, so the server and the client draw the same frame.

export const VIEW_W = 1000;
export const VIEW_H = 640;

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

// Window layout, in view units.
export const WIN = { x: 0, y: 0, w: 1000, h: 560, r: 22 };
const BAR_H = 44;
const TOOL_H = 48;
const RULER_Y = BAR_H + TOOL_H; // 92
const LANES_Y = RULER_Y + 26; // 118
export const LABEL_W = 170;
const LANES_X = LABEL_W + 4;
const LANES_END = 990;
const LANE_COUNT = 5;

export const LANES_SECURITY = ["Proxy", "Branch 041", "HQ Wi-Fi", "VPN", "Data center"];
export const LANES_MUSIC = ["Piano", "Bass", "Drums", "Strings", "Pad"];

type Rect = { x: number; y: number; w: number; h: number; r: number };

type Event = { lane: number; x: number; w: number; region: number | null };

// The security timeline: a steady rhythm per source, with small natural jitter.
const EVENTS: Event[] = [];
for (let lane = 0; lane < LANE_COUNT; lane++) {
  for (let k = 0; k < 15; k++) {
    const x = LANES_X + 18 + k * 55 + (rand(lane * 31 + k) - 0.5) * 22;
    if (x > LANES_END - 24) continue;
    EVENTS.push({ lane, x, w: 9 + rand(lane * 7 + k * 3) * 9, region: null });
  }
}

// The song's arrangement: where each track has a region, in view x.
const REGIONS: { lane: number; x0: number; x1: number }[] = [
  { lane: 0, x0: LANES_X, x1: LANES_END },
  { lane: 1, x0: LANES_X, x1: 590 },
  { lane: 1, x0: 600, x1: LANES_END },
  { lane: 2, x0: LANES_X, x1: LANES_END },
  { lane: 3, x0: 380, x1: LANES_END },
  { lane: 4, x0: LANES_X, x1: 480 },
  { lane: 4, x0: 700, x1: LANES_END },
];
for (const e of EVENTS) {
  const i = REGIONS.findIndex((r) => r.lane === e.lane && e.x >= r.x0 && e.x + e.w <= r.x1);
  e.region = i >= 0 ? i : null;
}

// The anomaly: a single event on the proxy lane, late in the window.
const ANOMALY = { lane: 0, x: 786 };

// Piano roll: one octave, C at the bottom. Rows are pitch classes 0 to 11.
const ROLL = { x: LABEL_W + 40, y: 336, w: LANES_END - LABEL_W - 40, h: 196 };
const ROW_H = ROLL.h / 12;
const rowY = (pc: number) => ROLL.y + ROLL.h - (pc + 1) * ROW_H;
const BLACK = new Set([1, 3, 6, 8, 10]);
// A short phrase in C major: [pitch class, start x, width].
const PHRASE: [number, number, number][] = [
  [4, 0.02, 0.09],
  [7, 0.12, 0.09],
  [0, 0.22, 0.18],
  [2, 0.42, 0.09],
  [4, 0.52, 0.09],
  [9, 0.72, 0.09],
  [7, 0.82, 0.16],
];
const WRONG_PC = 6; // F sharp: outside the key
const RIGHT_PC = 7; // G: where it belongs
const WRONG_X = 0.62;
const WRONG_W = 0.08;

// Keyboard: 49 keys, C2 (MIDI 36) to C6 (MIDI 84).
export const KEY_LOW = 36;
export const KEY_HIGH = 84;
export const CHORDS: readonly (readonly number[])[] = [
  [48, 64, 67, 72],
  [43, 62, 67, 71],
  [45, 64, 69, 72],
  [41, 65, 69, 72],
];

export type Frame = {
  // window
  winScale: number;
  winX: number;
  securityOn: number; // 1 = security, 0 = music (for shapes that morph)
  secText: number; // security words fade out in the first half of the change
  musText: number; // music words fade in during the second half, so the two never overlap
  scan: number; // x of the scan line in the security phase
  scanOn: number;
  playhead: number;
  playheadOn: number;
  laneY: number;
  laneH: number;
  events: { x: number; y: number; w: number; h: number; r: number; o: number }[];
  regions: (Rect & { o: number })[];
  regionNotes: { x: number; y: number; w: number; o: number }[];
  /** Three looks in turn: an ordinary event, flagged amber, then an ordinary note once fixed. */
  anomaly: Rect & { plain: number; alert: number; fixed: number; o: number };
  ring: Rect & { o: number };
  card: { x: number; y: number; o: number; contained: number };
  rollOn: number;
  roll: typeof ROLL;
  rows: { y: number; h: number; black: boolean }[];
  phrase: (Rect & { o: number })[];
  keysOn: number;
  keysY: number;
  pressed: readonly number[];
};

export function scene(p: number): Frame {
  // Beats
  const reveal = span(p, 0, 0.12); // the timeline fills in
  const flag = span(p, 0.17, 0.24); // one event turns amber
  const contain = span(p, 0.33, 0.4); // it is contained
  const morph = span(p, 0.48, 0.62); // security becomes music
  const roll = span(p, 0.64, 0.72); // the piano roll opens
  const fix = span(p, 0.74, 0.8); // the wrong note moves into the key
  const keys = span(p, 0.84, 0.9); // the keyboard arrives

  const laneH = lerp(84, 40, roll);
  const laneY = LANES_Y;
  const center = (lane: number) => laneY + lane * laneH + laneH / 2;

  const scan = lerp(LANES_X, LANES_END, reveal);

  // Events fade in behind the scan line, then melt into the regions they belong to.
  const events = EVENTS.map((e) => {
    const seen = clamp((scan - e.x) / 40);
    const reg = e.region !== null ? REGIONS[e.region] : null;
    const from = { x: e.x, y: center(e.lane) - 7, w: e.w, h: 14, r: 7 };
    const to = reg
      ? { x: reg.x0, y: laneY + e.lane * laneH + 6, w: reg.x1 - reg.x0, h: laneH - 12, r: 10 }
      : from;
    // Stagger the melt a little from left to right.
    const t = clamp(morph * 1.25 - (e.x / LANES_END) * 0.25);
    // They dissolve as they stretch, so the change reads as one thing melting into another.
    const o = seen * (reg ? Math.pow(1 - t, 1.6) : 1 - morph);
    return {
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      w: lerp(from.w, to.w, t),
      h: lerp(from.h, to.h, t),
      r: lerp(from.r, to.r, t),
      o,
    };
  });

  const regions = REGIONS.map((r) => ({
    x: r.x0,
    y: laneY + r.lane * laneH + 6,
    w: r.x1 - r.x0,
    h: laneH - 12,
    r: lerp(10, 8, roll),
    o: span(morph, 0.3, 0.85),
  }));

  // Little note dashes inside the regions, so they read as MIDI.
  const regionNotes: Frame["regionNotes"] = [];
  REGIONS.forEach((r, ri) => {
    const top = laneY + r.lane * laneH + 6;
    const h = laneH - 12;
    for (let x = r.x0 + 10; x < r.x1 - 18; x += 22) {
      const k = ri * 97 + x;
      regionNotes.push({
        x,
        y: top + 6 + rand(k) * (h - 14),
        w: 8 + rand(k + 1) * 10,
        o: span(morph, 0.8, 1) * (1 - roll * 0.4),
      });
    }
  });

  // The amber object: an event, then a region note, then a note in the roll.
  const aEvent = { x: ANOMALY.x, y: center(ANOMALY.lane) - 7, w: 22, h: 14, r: 7 };
  const aGrow = { x: ANOMALY.x - 4, y: center(ANOMALY.lane) - 9, w: 30, h: 18, r: 9 };
  const aRegion = { x: ANOMALY.x - 6, y: center(ANOMALY.lane) - 5, w: 30, h: 10, r: 5 };
  const pcY = lerp(rowY(WRONG_PC), rowY(RIGHT_PC), fix);
  const aRoll = {
    x: ROLL.x + WRONG_X * ROLL.w,
    y: pcY + 2,
    w: WRONG_W * ROLL.w,
    h: ROW_H - 4,
    r: (ROW_H - 4) / 2,
  };
  let a = aEvent;
  a = mix(a, aGrow, flag * (1 - morph));
  a = mix(a, aRegion, morph);
  a = mix(a, aRoll, roll);
  const anomaly = {
    ...a,
    plain: 1 - flag,
    alert: flag * (1 - fix),
    fixed: fix,
    o: clamp((scan - ANOMALY.x) / 40),
  };

  const ring = {
    x: a.x - 8,
    y: a.y - 8,
    w: a.w + 16,
    h: a.h + 16,
    r: a.h / 2 + 8,
    o: contain * (1 - morph),
  };

  const card = {
    x: ANOMALY.x - 250,
    y: center(1) + 18,
    o: flag * (1 - span(p, 0.44, 0.5)),
    contained: contain,
  };

  const rows = Array.from({ length: 12 }, (_, pc) => ({ y: rowY(pc), h: ROW_H, black: BLACK.has(pc) }));
  const phrase = PHRASE.map(([pc, sx, sw]) => ({
    x: ROLL.x + sx * ROLL.w,
    y: rowY(pc) + 2,
    w: sw * ROLL.w,
    h: ROW_H - 4,
    r: (ROW_H - 4) / 2,
    o: span(roll, 0.4, 1),
  }));

  // The window steps back to make room for the keyboard.
  const winScale = lerp(1, 0.78, keys);
  const winX = (VIEW_W - VIEW_W * winScale) / 2;

  // Once the keyboard is in, it plays I, V, vi, IV.
  let pressed: readonly number[] = [];
  if (p >= 0.9) pressed = CHORDS[Math.min(3, Math.floor((p - 0.9) / 0.025))];

  return {
    winScale,
    winX,
    securityOn: 1 - morph,
    secText: 1 - span(morph, 0, 0.45),
    musText: span(morph, 0.55, 1),
    scan,
    scanOn: reveal > 0 && reveal < 1 ? 1 : 0,
    playhead: lerp(LANES_X, LANES_END, clamp((p - 0.6) / 0.38)),
    playheadOn: span(p, 0.58, 0.64),
    laneY,
    laneH,
    events,
    regions,
    regionNotes,
    anomaly,
    ring,
    card,
    rollOn: roll,
    roll: ROLL,
    rows,
    phrase,
    keysOn: keys,
    keysY: lerp(VIEW_H + 40, 476, keys),
    pressed,
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

export const LAYOUT = { BAR_H, TOOL_H, RULER_Y, LANES_Y, LANES_X, LANES_END, LANE_COUNT };
