import { memo } from "react";
import styles from "./Keystation.module.css";

// A 49-key controller, C2 to C6, drawn from the M-Audio Keystation 49's top view: navigation pad,
// stop, play and record, the volume fader, Advanced and the octave buttons with their lights, the
// pitch and modulation wheels, and the keys. No logos or printed names; the marks above the keys
// stand in for the labels the real one prints there. It is dark in both themes, like the real one.
// Drawn as a <g> in a 1000 x 228 box, so it can sit inside another SVG or in its own.

export const KEYSTATION = { w: 1000, h: 228, low: 36, high: 84 } as const;

/** Pitch classes of the white keys. */
export const WHITE_PCS: ReadonlySet<number> = new Set([0, 2, 4, 5, 7, 9, 11]);
const KEYS_X0 = 138;
const KEYS_X1 = 963;
const KEYS_Y = 60;
const WHITE_LEN = 164;
const BLACK_LEN = 104;
const WHITES: number[] = [];
for (let m = KEYSTATION.low; m <= KEYSTATION.high; m++) if (WHITE_PCS.has(m % 12)) WHITES.push(m);
const WW = (KEYS_X1 - KEYS_X0) / WHITES.length;
const whiteX = new Map(WHITES.map((m, i) => [m, KEYS_X0 + i * WW]));

/** The keys' rectangles in the drawing's own 1000 x 228 box, white then black, low to high. */
type KeyRect = { midi: number; x: number; y: number; w: number; h: number; r: number };
export function keyRects(): { whites: KeyRect[]; blacks: KeyRect[] } {
  const whites = WHITES.map((m) => ({ midi: m, x: (whiteX.get(m) ?? 0) + 0.75, y: KEYS_Y - 4, w: WW - 1.5, h: WHITE_LEN, r: 4 }));
  const blacks: KeyRect[] = [];
  for (let m = KEYSTATION.low; m <= KEYSTATION.high; m++) {
    if (WHITE_PCS.has(m % 12)) continue;
    const left = whiteX.get(m - 1);
    if (left === undefined) continue;
    const bw = WW * 0.58;
    blacks.push({ midi: m, x: left + WW - bw / 2, y: KEYS_Y - 4, w: bw, h: BLACK_LEN, r: 3 });
  }
  return { whites, blacks };
}

const f1 = (n: number) => n.toFixed(1);
const on = (v: boolean) => (v ? "" : undefined);

type Props = {
  /** Keys held down, as MIDI note numbers joined with commas (a string, so memo can compare it). */
  pressed?: string;
  /** A held key to show in amber: the note that has nothing to belong to. */
  accent?: number | null;
  /** Without keys, for drawings that move the keys themselves. */
  keys?: boolean;
};

export const Keystation = memo(function Keystation({ pressed = "", accent = null, keys = true }: Props) {
  const down = new Set(pressed ? pressed.split(",").map(Number) : []);
  const key = (m: number) => ({
    "data-key": m,
    "data-down": on(down.has(m)),
    "data-accent": on(down.has(m) && m === accent),
  });

  const blacks = [];
  for (let m = KEYSTATION.low; m <= KEYSTATION.high; m++) {
    if (WHITE_PCS.has(m % 12)) continue;
    const left = whiteX.get(m - 1);
    if (left === undefined) continue;
    const bw = WW * 0.58;
    blacks.push(
      <rect
        key={m}
        className={styles.black}
        {...key(m)}
        x={f1(left + WW - bw / 2)}
        y={KEYS_Y - 4}
        width={f1(bw)}
        height={BLACK_LEN}
        rx={3}
      />,
    );
  }
  const dpad: [number, number][] = [
    [29, 23],
    [16, 36],
    [29, 36],
    [42, 36],
    [29, 49],
  ];
  const ticks = Array.from({ length: 9 }, (_, i) => 70 + i * 6);

  return (
    <g>
      <rect className={styles.body} x={0} y={0} width={KEYSTATION.w} height={KEYSTATION.h} rx={16} />
      <rect className={styles.edge} x={10} y={1} width={KEYSTATION.w - 20} height={2.5} rx={1.25} />
      <rect className={styles.edge} x={10} y={KEYSTATION.h - 3.5} width={KEYSTATION.w - 20} height={2.5} rx={1.25} />

      {/* navigation pad, then stop, play and record */}
      {dpad.map(([x, y], i) => (
        <rect key={i} className={styles.button} x={x - 5.5} y={y - 5.5} width={11} height={11} rx={3} />
      ))}
      <path className={styles.glyph} d="M29 20.5l2.2 3.2h-4.4zM13 36l3.2-2.2v4.4zM45 36l-3.2-2.2v4.4zM29 51.5l2.2-3.2h-4.4z" />
      <circle className={styles.glyph} cx={29} cy={36} r={1.8} />
      <rect className={styles.button} x={61} y={27} width={18} height={18} rx={4.5} />
      <rect className={styles.glyph} x={67} y={33} width={6} height={6} rx={1} />
      <rect className={styles.button} x={86} y={27} width={18} height={18} rx={4.5} />
      <path className={styles.glyph} d="M92.5 32.2v7.6l6-3.8z" />
      <circle className={styles.button} cx={120} cy={36} r={9.5} />
      <circle className={styles.glyph} cx={120} cy={36} r={3.4} />

      {/* volume fader */}
      {ticks.map((y) => (
        <g key={y}>
          <rect className={styles.print} x={21} y={y} width={6} height={1.2} rx={0.6} />
          <rect className={styles.print} x={36} y={y} width={6} height={1.2} rx={0.6} />
        </g>
      ))}
      <rect className={styles.well} x={29} y={66} width={5} height={56} rx={2.5} />
      <rect className={styles.cap} x={23.5} y={104} width={16} height={13} rx={3} />
      <rect className={styles.edge} x={24.5} y={110} width={14} height={1.2} rx={0.6} />

      {/* advanced, then octave down and up, with their lights */}
      <circle className={styles.ledBlue} cx={71} cy={64} r={2.2} />
      <rect className={styles.button} x={62} y={74} width={18} height={11} rx={3} />
      <rect className={styles.print} x={85} y={79} width={22} height={1.4} rx={0.7} />
      <circle className={styles.ledGreen} cx={71} cy={94} r={2} />
      <circle className={styles.ledGreen} cx={105} cy={94} r={2} />
      <rect className={styles.button} x={62} y={104} width={18} height={11} rx={3} />
      <rect className={styles.button} x={96} y={104} width={18} height={11} rx={3} />
      <rect className={styles.print} x={80} y={120} width={16} height={4} rx={2} />

      {/* pitch and modulation wheels in their well */}
      <rect className={styles.well} x={16} y={136} width={104} height={70} rx={26} />
      <rect className={styles.slot} x={34} y={139} width={22} height={64} rx={11} />
      <rect className={styles.wheel} x={36} y={142} width={18} height={58} rx={9} />
      <rect className={styles.grip} x={39} y={163} width={12} height={16} rx={6} />
      <rect className={styles.slot} x={79} y={139} width={22} height={64} rx={11} />
      <rect className={styles.wheel} x={81} y={142} width={18} height={58} rx={9} />
      <rect className={styles.grip} x={84} y={146} width={12} height={16} rx={6} />
      <rect className={styles.print} x={36} y={213} width={18} height={1.6} rx={0.8} />
      <rect className={styles.print} x={78} y={213} width={24} height={1.6} rx={0.8} />

      {/* the strip above the keys, where the real one prints each key's second job */}
      {WHITES.map((m, i) => (
        <rect
          key={m}
          className={styles.print}
          x={f1((whiteX.get(m) ?? 0) + WW / 2 - 4 - (i % 3) * 1.5)}
          y={44}
          width={8 + (i % 3) * 3}
          height={1.6}
          rx={0.8}
        />
      ))}

      <rect
        className={styles.well}
        x={KEYS_X0 - 3}
        y={KEYS_Y - 6}
        width={KEYS_X1 - KEYS_X0 + 6}
        height={KEYSTATION.h - KEYS_Y + 3}
        rx={4}
      />
      {keys
        ? WHITES.map((m) => (
        <rect
          key={m}
          className={styles.white}
          {...key(m)}
          x={f1((whiteX.get(m) ?? 0) + 0.75)}
          y={KEYS_Y - 4}
          width={f1(WW - 1.5)}
          height={WHITE_LEN}
          rx={4}
        />
          ))
        : null}
      {keys ? blacks : null}
    </g>
  );
});
