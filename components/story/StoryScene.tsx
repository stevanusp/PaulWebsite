import { memo } from "react";
import { method } from "@/content/site";
import {
  BAR_W,
  KB,
  KEY_HIGH,
  KEY_LOW,
  LAYOUT,
  LOG,
  LOOP_BARS,
  NOTES,
  ODD,
  RESOLVE,
  ROLL,
  SPAN_W,
  STEPS,
  STEP_W,
  VIEW_H,
  VIEW_W,
  VOICINGS,
  WIN,
  inKey,
  rollY,
  scene,
  xAt,
} from "./scene";
import styles from "./Story.module.css";

const S = method.scene;
const { BAR_H, TOOL_H, RULER_Y, STRIP_Y, STRIP_H, LANES_Y, LABEL_W, LANES_X, LANE_COUNT } = LAYOUT;
const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
const on = (v: boolean) => (v ? "" : undefined);

// Where a still frame stops the song: bar 2, beat 3, on the note this story is about.
const STILL_STEP = 11;
const STILL_BAR = 1;
const lit = (i: number) => NOTES[i].start <= STILL_STEP && STILL_STEP < NOTES[i].start + NOTES[i].len;

// ---- Keyboard: drawn from the controller's top view, dark in both themes like the real one.
// No logos or printed names: the function marks above the keys are just marks.

const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);
const KEYS_X0 = 138;
const KEYS_X1 = 963;
const KEYS_Y = 60;
const WHITE_LEN = 164;
const BLACK_LEN = 104;
const WHITES: number[] = [];
for (let m = KEY_LOW; m <= KEY_HIGH; m++) if (WHITE_PCS.has(m % 12)) WHITES.push(m);
const WW = (KEYS_X1 - KEYS_X0) / WHITES.length;
const whiteX = new Map(WHITES.map((m, i) => [m, KEYS_X0 + i * WW]));

const Keyboard = memo(function Keyboard({ pressed }: { pressed: string }) {
  const down = new Set(pressed ? pressed.split(",").map(Number) : []);
  const blacks = [];
  for (let m = KEY_LOW; m <= KEY_HIGH; m++) {
    if (WHITE_PCS.has(m % 12)) continue;
    const left = whiteX.get(m - 1);
    if (left === undefined) continue;
    const bw = WW * 0.58;
    blacks.push(
      <rect
        key={m}
        className={styles.black}
        data-key={m}
        data-down={on(down.has(m))}
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
      <rect className={styles.kbBody} x={0} y={0} width={KB.w} height={KB.h} rx={16} />
      <rect className={styles.kbEdge} x={10} y={1} width={KB.w - 20} height={2.5} rx={1.25} />
      <rect className={styles.kbEdge} x={10} y={KB.h - 3.5} width={KB.w - 20} height={2.5} rx={1.25} />

      {/* navigation pad, then stop, play and record */}
      {dpad.map(([x, y], i) => (
        <rect key={i} className={styles.kbButton} x={x - 5.5} y={y - 5.5} width={11} height={11} rx={3} />
      ))}
      <path className={styles.kbGlyph} d="M29 20.5l2.2 3.2h-4.4zM13 36l3.2-2.2v4.4zM45 36l-3.2-2.2v4.4zM29 51.5l2.2-3.2h-4.4z" />
      <circle className={styles.kbGlyph} cx={29} cy={36} r={1.8} />
      <rect className={styles.kbButton} x={61} y={27} width={18} height={18} rx={4.5} />
      <rect className={styles.kbGlyph} x={67} y={33} width={6} height={6} rx={1} />
      <rect className={styles.kbButton} x={86} y={27} width={18} height={18} rx={4.5} />
      <path className={styles.kbGlyph} d="M92.5 32.2v7.6l6-3.8z" />
      <circle className={styles.kbButton} cx={120} cy={36} r={9.5} />
      <circle className={styles.kbGlyph} cx={120} cy={36} r={3.4} />

      {/* volume fader */}
      {ticks.map((y) => (
        <g key={y}>
          <rect className={styles.kbPrint} x={21} y={y} width={6} height={1.2} rx={0.6} />
          <rect className={styles.kbPrint} x={36} y={y} width={6} height={1.2} rx={0.6} />
        </g>
      ))}
      <rect className={styles.kbWell} x={29} y={66} width={5} height={56} rx={2.5} />
      <rect className={styles.kbCap} x={23.5} y={104} width={16} height={13} rx={3} />
      <rect className={styles.kbEdge} x={24.5} y={110} width={14} height={1.2} rx={0.6} />

      {/* advanced, then octave down and up, with their lights */}
      <circle className={styles.kbLedBlue} cx={71} cy={64} r={2.2} />
      <rect className={styles.kbButton} x={62} y={74} width={18} height={11} rx={3} />
      <rect className={styles.kbPrint} x={85} y={79} width={22} height={1.4} rx={0.7} />
      <circle className={styles.kbLedGreen} cx={71} cy={94} r={2} />
      <circle className={styles.kbLedGreen} cx={105} cy={94} r={2} />
      <rect className={styles.kbButton} x={62} y={104} width={18} height={11} rx={3} />
      <rect className={styles.kbButton} x={96} y={104} width={18} height={11} rx={3} />
      <rect className={styles.kbPrint} x={80} y={120} width={16} height={4} rx={2} />

      {/* pitch and modulation wheels in their well */}
      <rect className={styles.kbWell} x={16} y={136} width={104} height={70} rx={26} />
      <rect className={styles.kbSlot} x={34} y={139} width={22} height={64} rx={11} />
      <rect className={styles.kbWheel} x={36} y={142} width={18} height={58} rx={9} />
      <rect className={styles.kbGrip} x={39} y={163} width={12} height={16} rx={6} />
      <rect className={styles.kbSlot} x={79} y={139} width={22} height={64} rx={11} />
      <rect className={styles.kbWheel} x={81} y={142} width={18} height={58} rx={9} />
      <rect className={styles.kbGrip} x={84} y={146} width={12} height={16} rx={6} />
      <rect className={styles.kbPrint} x={36} y={213} width={18} height={1.6} rx={0.8} />
      <rect className={styles.kbPrint} x={78} y={213} width={24} height={1.6} rx={0.8} />

      {/* the strip above the keys, where the real one prints each key's second job */}
      {WHITES.map((m, i) => (
        <rect
          key={m}
          className={styles.kbPrint}
          x={f1((whiteX.get(m) ?? 0) + WW / 2 - 4 - (i % 3) * 1.5)}
          y={44}
          width={8 + (i % 3) * 3}
          height={1.6}
          rx={0.8}
        />
      ))}

      <rect className={styles.kbWell} x={KEYS_X0 - 3} y={KEYS_Y - 6} width={KEYS_X1 - KEYS_X0 + 6} height={KB.h - KEYS_Y + 3} rx={4} />
      {WHITES.map((m) => (
        <rect
          key={m}
          className={styles.white}
          data-key={m}
          data-down={on(down.has(m))}
          x={f1((whiteX.get(m) ?? 0) + 0.75)}
          y={KEYS_Y - 4}
          width={f1(WW - 1.5)}
          height={WHITE_LEN}
          rx={4}
        />
      ))}
      {blacks}
    </g>
  );
});

// ---- Piano roll: the parts that never move, local to the panel's top.

const ROLL_ROWS = Array.from({ length: ROLL.HIGH - ROLL.LOW + 1 }, (_, i) => ROLL.HIGH - i);
const ROLL_BOTTOM = rollY(ROLL.LOW) + ROLL.ROW;

const RollGrid = memo(function RollGrid() {
  return (
    <g>
      <rect className={styles.win} x={0} y={0} width={WIN.w} height={WIN.h} />
      <rect className={styles.bar} x={0} y={0} width={WIN.w} height={ROLL.HEAD} />
      <line className={styles.rule} x1={0} x2={WIN.w} y1={0} y2={0} />
      <line className={styles.rule} x1={0} x2={WIN.w} y1={ROLL.HEAD} y2={ROLL.HEAD} />
      <text className={styles.editorTitle} x={20} y={16}>
        {S.editor}
      </text>
      <text className={styles.small} x={92} y={16}>
        {S.editorSub}
      </text>
      {Array.from({ length: LOOP_BARS }, (_, b) => (
        <text key={b} className={styles.ruler} x={f1(xAt(b * STEPS) + 5)} y={16}>
          {b + 1}
        </text>
      ))}

      {ROLL_ROWS.map((m) => (
        <rect
          key={m}
          className={inKey(m) ? styles.rowIn : styles.rowOut}
          x={LANES_X}
          y={rollY(m)}
          width={SPAN_W}
          height={ROLL.ROW}
        />
      ))}
      {Array.from({ length: LOOP_BARS * 3 + 1 }, (_, i) => {
        const x = LANES_X + i * (BAR_W / 3);
        return (
          <line
            key={i}
            className={i % 3 === 0 ? styles.gridBar : styles.gridBeat}
            x1={f1(x)}
            x2={f1(x)}
            y1={ROLL.HEAD}
            y2={ROLL_BOTTOM}
          />
        );
      })}

      {/* the little keyboard on the left */}
      <rect className={styles.side} x={0} y={ROLL.HEAD} width={LABEL_W} height={WIN.h} />
      {ROLL_ROWS.filter((m) => WHITE_PCS.has(m % 12)).map((m) => (
        <rect key={m} className={styles.miniWhite} x={118} y={rollY(m) + 0.5} width={50} height={ROLL.ROW - 1} rx={2} />
      ))}
      {ROLL_ROWS.filter((m) => !WHITE_PCS.has(m % 12)).map((m) => (
        <rect key={m} className={styles.miniBlack} x={118} y={rollY(m) + 1.5} width={30} height={ROLL.ROW - 3} rx={2} />
      ))}
      <line className={styles.rule} x1={LABEL_W} x2={LABEL_W} y1={ROLL.HEAD} y2={WIN.h} />
    </g>
  );
});

// ---- One frame of the story.

type Props = { p: number; id: string; still?: boolean };

export default function StoryScene({ p, id, still = false }: Props) {
  const f = scene(p);
  const sec = f.sec;
  const mus = f.mus;
  const clip = `story-win-${id}`;
  const logClip = `story-log-${id}`;
  const times = Array.from({ length: 8 }, (_, i) => LANES_X + (SPAN_W / 8) * i);
  const odd = NOTES[ODD];
  const next = NOTES[RESOLVE];
  const oddX = xAt(odd.start) + 1.5;
  const oddY = rollY(odd.pitch) + 2;

  // The toolbar's search field becomes the song's display.
  const field = {
    x: 330 + (372 - 330) * f.morph,
    y: 51 + (47 - 51) * f.morph,
    w: 340 + (256 - 340) * f.morph,
    h: 30 + (38 - 30) * f.morph,
    r: 15 + (12 - 15) * f.morph,
  };

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clip}>
          <rect x={0} y={0} width={WIN.w} height={WIN.h} rx={WIN.r} />
        </clipPath>
        <clipPath id={logClip}>
          <rect x={0} y={LOG.HEAD} width={WIN.w} height={WIN.h} />
        </clipPath>
      </defs>

      <g transform={`translate(${f1(f.winX)} ${f1(f.winY)}) scale(${f3(f.winScale)})`}>
        <g clipPath={`url(#${clip})`}>
          <rect className={styles.win} x={0} y={0} width={WIN.w} height={WIN.h} />

          {/* title bar */}
          <rect className={styles.bar} x={0} y={0} width={WIN.w} height={BAR_H} />
          <circle className={styles.dot} cx={22} cy={20} r={6} />
          <circle className={styles.dot} cx={42} cy={20} r={6} />
          <circle className={styles.dot} cx={62} cy={20} r={6} />
          <text className={styles.winTitle} x={500} y={25} textAnchor="middle" opacity={f3(sec)}>
            {S.securityTitle}
          </text>
          <text className={styles.winTitle} x={500} y={25} textAnchor="middle" opacity={f3(mus)}>
            {S.musicTitle}
          </text>
          <line className={styles.rule} x1={0} x2={WIN.w} y1={BAR_H} y2={BAR_H} />

          {/* toolbar: filters and a search for the console, transport and display for the song */}
          <g opacity={f3(sec)}>
            <rect className={styles.chip} x={20} y={52} width={112} height={28} rx={14} />
            <text className={styles.chipText} x={76} y={70.5} textAnchor="middle">
              {S.sources}
            </text>
            <rect className={styles.chip} x={140} y={52} width={136} height={28} rx={14} />
            <text className={styles.chipText} x={208} y={70.5} textAnchor="middle">
              {S.range}
            </text>
            <rect className={styles.chip} x={902} y={52} width={76} height={28} rx={14} />
            <circle className={`${styles.liveDot} ${styles.pulse}`} cx={922} cy={66} r={4} />
            <text className={styles.chipText} x={934} y={70.5}>
              {S.live}
            </text>
          </g>
          <rect
            className={styles.lcd}
            x={f1(field.x)}
            y={f1(field.y)}
            width={f1(field.w)}
            height={f1(field.h)}
            rx={f1(field.r)}
          />
          <g opacity={f3(sec)}>
            <circle className={styles.glass} cx={351} cy={65} r={5.5} />
            <path className={styles.glass} d="M355 69.5l4 4" />
            <text className={styles.placeholder} x={366} y={70.5}>
              {S.search}
            </text>
          </g>
          <g opacity={f3(mus)}>
            {[20, 52, 84].map((x) => (
              <g key={x}>
                <rect className={styles.chip} x={x} y={53} width={26} height={26} rx={8} />
                <rect className={styles.glyphSoft} x={x + 7} y={61} width={12} height={2} rx={1} />
                <rect className={styles.glyphSoft} x={x + 7} y={65} width={8} height={2} rx={1} />
                <rect className={styles.glyphSoft} x={x + 7} y={69} width={10} height={2} rx={1} />
              </g>
            ))}
            {[228, 264, 300, 336].map((cx) => (
              <circle key={cx} className={styles.chip} cx={cx} cy={66} r={14} />
            ))}
            <path className={styles.glyph} d="M222 60v12h2.4V60zM234 60v12l-9-6z" />
            <path className={styles.glyph} d="M260.5 59.5v13l10.5-6.5z" />
            <circle className={styles.glyph} cx={300} cy={66} r={5} />
            <path
              className={styles.glyphLine}
              d="M330.5 64.5a5.5 5.5 0 0 1 9.5-3.2M341.5 67.5a5.5 5.5 0 0 1-9.5 3.2M338.5 59v3h3M333.5 73v-3h-3"
            />

            <text className={styles.lcdBig} x={394} y={71} textAnchor="middle" data-clock="bar">
              {still ? STILL_BAR + 1 : 1}
            </text>
            <text className={styles.lcdBig} x={420} y={71} textAnchor="middle" data-clock="beat">
              {still ? 3 : 1}
            </text>
            <text className={styles.lcdLabel} x={394} y={81} textAnchor="middle">
              {S.bar}
            </text>
            <text className={styles.lcdLabel} x={420} y={81} textAnchor="middle">
              {S.beat}
            </text>
            <line className={styles.rule} x1={440} x2={440} y1={53} y2={79} />
            <text className={styles.lcdMid} x={472} y={69} textAnchor="middle">
              {S.tempo}
            </text>
            <text className={styles.lcdLabel} x={472} y={81} textAnchor="middle">
              {S.tempoLabel}
            </text>
            <line className={styles.rule} x1={504} x2={504} y1={53} y2={79} />
            <text className={styles.lcdMid} x={566} y={64} textAnchor="middle">
              {S.meter}
            </text>
            <text className={styles.lcdSub} x={566} y={79} textAnchor="middle">
              {S.key}
            </text>

            {[900, 932, 964].map((x) => (
              <g key={x}>
                <rect className={styles.chip} x={x - 13} y={53} width={26} height={26} rx={8} />
                <circle className={styles.glyphSoft} cx={x} cy={66} r={3} />
              </g>
            ))}
          </g>
          <line className={styles.rule} x1={0} x2={WIN.w} y1={BAR_H + TOOL_H} y2={BAR_H + TOOL_H} />

          {/* side column */}
          <rect className={styles.side} x={0} y={RULER_Y} width={LABEL_W} height={WIN.h - RULER_Y} />
          <line className={styles.rule} x1={LABEL_W} x2={LABEL_W} y1={RULER_Y} y2={WIN.h} />

          {/* ruler: clock times, then bars and beats under a cycle */}
          <g opacity={f3(sec)}>
            {times.map((x, i) => (
              <g key={i}>
                <line className={styles.tick} x1={f1(x)} x2={f1(x)} y1={RULER_Y + 14} y2={RULER_Y + 24} />
                <text className={styles.ruler} x={f1(x + 5)} y={RULER_Y + 18}>
                  {S.times[i]}
                </text>
              </g>
            ))}
          </g>
          <g opacity={f3(mus)}>
            <rect className={styles.cycle} x={LANES_X} y={RULER_Y + 3} width={SPAN_W} height={7} rx={3.5} />
            {Array.from({ length: LOOP_BARS * 3 }, (_, i) => {
              const x = LANES_X + i * (BAR_W / 3);
              const bar = i % 3 === 0;
              return (
                <g key={i}>
                  <line className={styles.tick} x1={f1(x)} x2={f1(x)} y1={RULER_Y + (bar ? 12 : 18)} y2={RULER_Y + 24} />
                  {bar ? (
                    <text className={styles.ruler} x={f1(x + 5)} y={RULER_Y + 21}>
                      {i / 3 + 1}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
          <line className={styles.rule} x1={0} x2={WIN.w} y1={STRIP_Y} y2={STRIP_Y} />

          {/* the strip: event volume, then the chord track */}
          <text className={styles.laneSub} x={20} y={STRIP_Y + 22} opacity={f3(sec)}>
            {S.volume}
          </text>
          <text className={styles.laneSub} x={20} y={STRIP_Y + 22} opacity={f3(mus)}>
            {S.chordsLabel}
          </text>
          {f.hist.map((h, i) =>
            h.o > 0.002 ? (
              <g key={i} opacity={f3(h.o)}>
                <rect className={styles.hist} x={f1(h.x)} y={f1(h.y)} width={f1(h.w)} height={f1(h.h)} rx={2} />
                {h.spike ? (
                  <rect
                    className={styles.alert}
                    x={f1(h.x)}
                    y={f1(h.y)}
                    width={f1(h.w)}
                    height={f1(h.h)}
                    rx={2}
                    opacity={f3(f.histAlert)}
                  />
                ) : null}
              </g>
            ) : null,
          )}
          <g opacity={f3(f.chordsOn)}>
            {S.chords.map((name, i) => (
              <g key={name} className={styles.chordCell} data-chord={i} data-now={on(still && i === STILL_BAR)}>
                <rect x={f1(xAt(i * STEPS) + 2)} y={STRIP_Y + 5} width={f1(BAR_W - 4)} height={STRIP_H - 10} rx={8} />
                <text x={f1(xAt(i * STEPS) + 12)} y={STRIP_Y + 22.5}>
                  {name}
                </text>
              </g>
            ))}
            <rect
              className={styles.focus}
              x={f1(xAt(STEPS) + 2)}
              y={STRIP_Y + 5}
              width={f1(BAR_W - 4)}
              height={STRIP_H - 10}
              rx={8}
              opacity={f3(f.chordFocus)}
            />
          </g>
          <line className={styles.rule} x1={0} x2={WIN.w} y1={LANES_Y} y2={LANES_Y} />

          {/* lane headers: sources, then tracks */}
          {Array.from({ length: LANE_COUNT }, (_, i) => {
            const top = f.laneTop(i);
            return (
              <g key={i}>
                <g opacity={f3(sec)}>
                  <text className={styles.lane} x={20} y={f1(top + 27)}>
                    {S.lanes[i]}
                  </text>
                  <text className={styles.laneSub} x={20} y={f1(top + 45)}>
                    {S.laneCounts[i]}
                  </text>
                </g>
                <g opacity={f3(mus)}>
                  <text className={styles.laneSub} x={16} y={f1(top + 25)}>
                    {i + 1}
                  </text>
                  <text className={styles.lane} x={34} y={f1(top + 25)}>
                    {S.tracks[i]}
                  </text>
                  <rect className={styles.chip} x={34} y={f1(top + 33)} width={20} height={15} rx={5} />
                  <text className={styles.ms} x={44} y={f1(top + 44)} textAnchor="middle">
                    M
                  </text>
                  <rect className={styles.chip} x={58} y={f1(top + 33)} width={20} height={15} rx={5} />
                  <text className={styles.ms} x={68} y={f1(top + 44)} textAnchor="middle">
                    S
                  </text>
                  <rect className={styles.meterBed} x={152} y={f1(top + 8)} width={6} height={f1(f.laneH - 16)} rx={3} />
                  <rect
                    className={styles.meter}
                    data-meter={i}
                    x={152}
                    y={f1(top + 8)}
                    width={6}
                    height={f1(f.laneH - 16)}
                    rx={3}
                    data-still={on(still)}
                  />
                </g>
                <line
                  className={styles.rule}
                  x1={0}
                  x2={WIN.w}
                  y1={f1(top + f.laneH)}
                  y2={f1(top + f.laneH)}
                />
              </g>
            );
          })}

          {/* regions and the notes inside them */}
          {f.regions.map((r, i) =>
            r.o > 0.002 ? (
              <g key={i} opacity={f3(r.o)}>
                <rect className={styles.region} x={f1(r.x)} y={f1(r.y)} width={f1(r.w)} height={f1(r.h)} rx={r.r} />
                <text className={styles.regionName} x={f1(r.x + 9)} y={f1(r.y + 13)}>
                  {S.tracks[i]}
                </text>
              </g>
            ) : null,
          )}
          {f.minis.map((n, i) => (
            <rect
              key={i}
              className={styles.mini}
              data-note={i}
              data-on={on(still && lit(i))}
              x={f1(n.x)}
              y={f1(n.y)}
              width={f1(n.w)}
              height={f1(n.h)}
              rx={f1(n.r)}
              opacity={f3(n.o)}
            />
          ))}

          {/* events: the steady rhythm of a network */}
          {f.events.map((e, i) =>
            e.o > 0.002 ? (
              <rect
                key={i}
                className={styles.event}
                x={f1(e.x)}
                y={f1(e.y)}
                width={f1(e.w)}
                height={f1(e.h)}
                rx={f1(e.r)}
                opacity={f3(e.o)}
              />
            ) : null,
          )}

          {/* event log, newest on top */}
          {f.logO > 0.002 ? (
            <g transform={`translate(0 ${f1(f.lanesBottom)})`} opacity={f3(f.logO)}>
              <rect className={styles.win} x={0} y={0} width={WIN.w} height={WIN.h} />
              <rect className={styles.bar} x={0} y={0} width={WIN.w} height={LOG.HEAD} />
              <text className={styles.laneSub} x={38} y={17}>
                {S.columns[0]}
              </text>
              <text className={styles.laneSub} x={210} y={17}>
                {S.columns[1]}
              </text>
              <text className={styles.laneSub} x={860} y={17}>
                {S.columns[2]}
              </text>
              <line className={styles.rule} x1={0} x2={WIN.w} y1={LOG.HEAD} y2={LOG.HEAD} />
              <g clipPath={`url(#${logClip})`}>
                <g transform={`translate(0 ${f1(LOG.ROW * f.flagRow)})`}>
                  <g data-clock="feed">
                    {Array.from({ length: S.feed.length * 2 }, (_, k) => {
                      const [source, event, action] = S.feed[k % S.feed.length];
                      const y = LOG.HEAD + (k - S.feed.length) * LOG.ROW;
                      return (
                        <g key={k} transform={`translate(0 ${y})`}>
                          <circle className={styles.feedDot} cx={24} cy={LOG.ROW / 2} r={3} />
                          <text className={styles.feedText} x={38} y={LOG.ROW / 2 + 4}>
                            {source}
                          </text>
                          <text className={styles.feedText} x={210} y={LOG.ROW / 2 + 4}>
                            {event}
                          </text>
                          <text className={styles.feedMuted} x={860} y={LOG.ROW / 2 + 4}>
                            {action}
                          </text>
                          <line className={styles.rule} x1={16} x2={WIN.w - 16} y1={LOG.ROW} y2={LOG.ROW} />
                        </g>
                      );
                    })}
                  </g>
                </g>
                {f.flagRow > 0.002 ? (
                  <g transform={`translate(0 ${LOG.HEAD})`} opacity={f3(f.flagRow)}>
                    <rect className={styles.flagRow} x={8} y={2} width={WIN.w - 16} height={LOG.ROW - 4} rx={8} />
                    <circle className={styles.alert} cx={24} cy={LOG.ROW / 2} r={4} opacity={f3(1 - f.contained)} />
                    <circle className={styles.cardDot} cx={24} cy={LOG.ROW / 2} r={4} opacity={f3(f.contained)} />
                    <text className={styles.feedStrong} x={38} y={LOG.ROW / 2 + 4}>
                      {S.flagged[0]}
                    </text>
                    <text className={styles.feedStrong} x={210} y={LOG.ROW / 2 + 4}>
                      {S.flagged[1]}
                    </text>
                    <text className={styles.feedAlert} x={860} y={LOG.ROW / 2 + 4} opacity={f3(1 - f.contained)}>
                      {S.flagged[2]}
                    </text>
                    <text className={styles.feedStrong} x={860} y={LOG.ROW / 2 + 4} opacity={f3(f.contained)}>
                      {S.flagged[3]}
                    </text>
                  </g>
                ) : null}
              </g>
            </g>
          ) : null}

          {/* piano roll for the xylophone */}
          {f.rollO > 0.002 ? (
            <g transform={`translate(0 ${f1(f.rollTop)})`} opacity={f3(Math.min(1, f.rollO * 1.5))}>
              <RollGrid />
              <rect
                className={styles.band}
                x={f1(xAt(STEPS))}
                y={ROLL.HEAD}
                width={f1(BAR_W)}
                height={ROLL_BOTTOM - ROLL.HEAD}
                opacity={f3(f.band)}
              />
              {NOTES.map((n, i) =>
                n.track === 0 && i !== ODD ? (
                  <rect
                    key={i}
                    className={styles.note}
                    data-note={i}
                    data-on={on(still && lit(i))}
                    x={f1(xAt(n.start) + 1.5)}
                    y={rollY(n.pitch) + 2}
                    width={f1(STEP_W - 3)}
                    height={ROLL.ROW - 4}
                    rx={(ROLL.ROW - 4) / 2}
                    opacity={f3(f.rollNotes[i])}
                  />
                ) : null,
              )}
              <path
                className={styles.lead}
                d={`M${f1(oddX + STEP_W - 3)} ${oddY + 4}C${f1(oddX + STEP_W + 4)} ${oddY + 4} ${f1(xAt(next.start) - 4)} ${rollY(next.pitch) + 6} ${f1(xAt(next.start) + 1.5)} ${rollY(next.pitch) + 6}`}
                opacity={f3(f.arrow)}
              />
              <g transform={`translate(${f1(oddX + (STEP_W - 3) / 2)} ${oddY + 26})`}>
                <g opacity={f3(f.tagAlone)}>
                  <rect className={styles.tagAlert} x={-58} y={-12} width={116} height={22} rx={11} />
                  <text className={styles.tagAlertText} x={0} y={3.5} textAnchor="middle">
                    {S.outside}
                  </text>
                </g>
                <g opacity={f3(f.tagBelongs)}>
                  <rect className={styles.tag} x={-58} y={-12} width={116} height={22} rx={11} />
                  <text className={styles.tagText} x={0} y={3.5} textAnchor="middle">
                    {S.belongs}
                  </text>
                </g>
              </g>
            </g>
          ) : null}

          {/* the one this story follows */}
          <rect
            className={styles.ring}
            x={f1(f.ring.x)}
            y={f1(f.ring.y)}
            width={f1(f.ring.w)}
            height={f1(f.ring.h)}
            rx={f1(f.ring.r)}
            opacity={f3(f.ring.o)}
          />
          {f.ping > 0.002 ? (
            <rect
              className={`${styles.ringSoft} ${styles.ping}`}
              x={f1(f.anomaly.x)}
              y={f1(f.anomaly.y)}
              width={f1(f.anomaly.w)}
              height={f1(f.anomaly.h)}
              rx={f1(f.anomaly.r)}
              opacity={f3(f.ping)}
            />
          ) : null}
          {(
            [
              [styles.event, f.anomaly.plain],
              [styles.alert, f.anomaly.alert],
              [styles.note, f.anomaly.belongs],
            ] as const
          ).map(([cls, k]) =>
            k > 0.002 ? (
              <rect
                key={cls}
                className={cls}
                x={f1(f.anomaly.x)}
                y={f1(f.anomaly.y)}
                width={f1(f.anomaly.w)}
                height={f1(f.anomaly.h)}
                rx={f1(f.anomaly.r)}
                opacity={f3(f.anomaly.o * k)}
              />
            ) : null,
          )}

          {/* the detail card, tied to the event it describes */}
          {f.card.o > 0.002 ? (
            <g opacity={f3(f.card.o)}>
              <path
                className={styles.connector}
                d={`M${f1(f.card.from.x)} ${f1(f.card.from.y + 4)}V${f1(f.card.y + 25)}Q${f1(f.card.from.x)} ${f1(f.card.y + 33)} ${f1(f.card.from.x + 8)} ${f1(f.card.y + 33)}H${f1(f.card.x)}`}
              />
              <g transform={`translate(${f1(f.card.x)} ${f1(f.card.y)})`}>
                <rect className={styles.card} x={0} y={0} width={264} height={66} rx={18} />
                <circle className={styles.alert} cx={24} cy={33} r={6} opacity={f3(1 - f.card.contained)} />
                <circle className={styles.cardDot} cx={24} cy={33} r={6} opacity={f3(f.card.contained)} />
                <g opacity={f3(1 - f.card.contained)}>
                  <text className={styles.cardTitle} x={42} y={29}>
                    {S.cardAlert}
                  </text>
                  <text className={styles.cardSub} x={42} y={50}>
                    {S.cardAlertSub}
                  </text>
                </g>
                <g opacity={f3(f.card.contained)}>
                  <text className={styles.cardTitle} x={42} y={29}>
                    {S.cardContained}
                  </text>
                  <text className={styles.cardSub} x={42} y={50}>
                    {S.cardContainedSub}
                  </text>
                </g>
              </g>
            </g>
          ) : null}

          {/* scan line while the console fills, playhead once it is a song */}
          <line
            className={styles.scan}
            x1={f1(f.scan)}
            x2={f1(f.scan)}
            y1={RULER_Y}
            y2={f1(f.lanesBottom)}
            opacity={f.scanOn}
          />
          <g opacity={f3(f.playheadOn)}>
            <g
              data-clock="playhead"
              transform={still ? `translate(${f1(xAt(STILL_STEP + 0.4) - LANES_X)} 0)` : undefined}
            >
              <line className={styles.playhead} x1={LANES_X} x2={LANES_X} y1={RULER_Y + 2} y2={WIN.h} />
              <rect className={styles.playheadCap} x={LANES_X - 5} y={RULER_Y + 2} width={10} height={14} rx={5} />
            </g>
          </g>
        </g>
        <rect className={styles.winEdge} x={0.5} y={0.5} width={WIN.w - 1} height={WIN.h - 1} rx={WIN.r} />
      </g>

      <g
        transform={`translate(0 ${f1(f.keysY)})`}
        opacity={f3(f.keysO)}
        visibility={f.keysO > 0.002 ? undefined : "hidden"}
      >
        <Keyboard pressed={still ? VOICINGS[STILL_BAR].join(",") : ""} />
      </g>
    </svg>
  );
}

