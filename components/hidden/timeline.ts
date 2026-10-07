// When each moment of the hidden post happens, as progress p from 0 to 1 through the story.
// A moment holds for a stretch of scrolling that grows with its words; a stanza gets room for each
// of its lines. The drawing (art.ts) and the words (HiddenPage.tsx) both read these ranges, so
// they cannot drift apart.

import { hidden, type Beat } from "@/content/hidden";
import { clamp } from "@/lib/motion";

/** Screens of scrolling for one moment. */
const lengthOf = (b: Beat) =>
  b.lines.length > 1 ? 0.35 + 0.42 * b.lines.length : clamp(0.42 + b.lines[0].length * 0.0042, 0.46, 0.98);

/** Screens after the last line, so the end can rest. */
const HOLD = 0.6;

const lengths = hidden.beats.map(lengthOf);
const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));

/** How many screens the whole story scrolls through. */
export const SCREENS = lengths.reduce((a, b) => a + b, 0) + HOLD;

export type Timed = Beat & { a: number; b: number };

/** Every moment with its range [a, b] in progress. */
export const BEATS: readonly Timed[] = hidden.beats.map((beat, i) => ({
  ...beat,
  a: starts[i] / SCREENS,
  b: (starts[i] + lengths[i]) / SCREENS,
}));

const RANGES = new Map(BEATS.map((b) => [b.id, [b.a, b.b] as const]));

/** The point a fraction f of the way through moment `id`, in progress. */
export const T = (id: string, f = 0) => {
  const r = RANGES.get(id);
  if (!r) throw new Error(`hidden post: no moment "${id}"`);
  return r[0] + (r[1] - r[0]) * f;
};
