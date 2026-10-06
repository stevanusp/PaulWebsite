import { memo } from "react";
import { method } from "@/content/site";
import {
  KEY_HIGH,
  KEY_LOW,
  LABEL_W,
  LANES_MUSIC,
  LANES_SECURITY,
  LAYOUT,
  VIEW_H,
  VIEW_W,
  WIN,
  scene,
} from "./scene";
import styles from "./Story.module.css";

const S = method.scene;
const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);

// ---- Keyboard: a 49-key controller drawn plainly, dark in both themes like the real thing.

const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);
const KEYS_X0 = 176;
const KEYS_X1 = 984;
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
        className={down.has(m) ? styles.blackDown : styles.black}
        x={f1(left + WW - bw / 2)}
        y={18}
        width={f1(bw)}
        height={down.has(m) ? 76 : 74}
        rx={4}
      />,
    );
  }
  return (
    <g>
      <rect className={styles.kbBody} x={0} y={0} width={VIEW_W} height={150} rx={20} />
      {/* wheels, a fader and a few buttons */}
      <rect className={styles.kbWell} x={24} y={30} width={24} height={90} rx={12} />
      <rect className={styles.kbWheel} x={28} y={60} width={16} height={30} rx={8} />
      <rect className={styles.kbWell} x={58} y={30} width={24} height={90} rx={12} />
      <rect className={styles.kbWheel} x={62} y={88} width={16} height={26} rx={8} />
      <rect className={styles.kbWell} x={104} y={30} width={8} height={90} rx={4} />
      <rect className={styles.kbKnob} x={96} y={52} width={24} height={14} rx={7} />
      <rect className={styles.kbButton} x={132} y={32} width={30} height={16} rx={8} />
      <rect className={styles.kbButton} x={132} y={58} width={30} height={16} rx={8} />
      <rect className={styles.kbButton} x={132} y={84} width={30} height={16} rx={8} />
      {WHITES.map((m) => (
        <rect
          key={m}
          className={down.has(m) ? styles.whiteDown : styles.white}
          x={f1((whiteX.get(m) ?? 0) + 1)}
          y={down.has(m) ? 20 : 18}
          width={f1(WW - 2)}
          height={120}
          rx={5}
        />
      ))}
      {blacks}
    </g>
  );
});

// ---- One frame of the story.

type Props = { p: number; id: string };

export default function StoryScene({ p, id }: Props) {
  const f = scene(p);
  const { BAR_H, TOOL_H, RULER_Y, LANES_X, LANES_END, LANE_COUNT } = LAYOUT;
  const sec = f.secText;
  const mus = f.musText;
  const clip = `story-win-${id}`;
  const laneBottom = f.laneY + LANE_COUNT * f.laneH;
  const centre = (lane: number) => f.laneY + lane * f.laneH + f.laneH / 2;
  const bars = Array.from({ length: 8 }, (_, i) => LANES_X + ((LANES_END - LANES_X) / 8) * i);

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
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={WIN.r} />
        </clipPath>
      </defs>

      <g transform={`translate(${f1(f.winX)} 0) scale(${f3(f.winScale)})`}>
        <g clipPath={`url(#${clip})`}>
          <rect className={styles.win} x={0} y={0} width={WIN.w} height={WIN.h} />

          {/* title bar */}
          <rect className={styles.bar} x={0} y={0} width={WIN.w} height={BAR_H} />
          <circle className={styles.dot} cx={24} cy={22} r={6} />
          <circle className={styles.dot} cx={44} cy={22} r={6} />
          <circle className={styles.dot} cx={64} cy={22} r={6} />
          <text className={styles.winTitle} x={500} y={28} textAnchor="middle" opacity={f3(sec)}>
            {S.securityTitle}
          </text>
          <text className={styles.winTitle} x={500} y={28} textAnchor="middle" opacity={f3(mus)}>
            {S.musicTitle}
          </text>

          {/* toolbar: filters for the console, transport for the song */}
          <line className={styles.rule} x1={0} x2={WIN.w} y1={BAR_H} y2={BAR_H} />
          <g opacity={f3(sec)}>
            <rect className={styles.chip} x={LANES_X} y={BAR_H + 11} width={150} height={26} rx={13} />
            <text className={styles.chipText} x={LANES_X + 75} y={BAR_H + 29} textAnchor="middle">
              {S.range}
            </text>
            <rect className={styles.chip} x={LANES_X + 160} y={BAR_H + 11} width={120} height={26} rx={13} />
            <text className={styles.chipText} x={LANES_X + 220} y={BAR_H + 29} textAnchor="middle">
              {S.sources}
            </text>
          </g>
          <g opacity={f3(mus)}>
            <circle className={styles.chip} cx={LANES_X + 14} cy={BAR_H + 24} r={13} />
            <path className={styles.glyph} d={`M${LANES_X + 10} ${BAR_H + 17}v14l11-7z`} />
            <rect className={styles.chip} x={LANES_X + 34} y={BAR_H + 11} width={26} height={26} rx={13} />
            <rect className={styles.glyph} x={LANES_X + 42} y={BAR_H + 19} width={10} height={10} rx={2} />
            <rect className={styles.lcd} x={420} y={BAR_H + 9} width={260} height={30} rx={15} />
            <text className={styles.lcdText} x={550} y={BAR_H + 29} textAnchor="middle">
              {`${S.tempo}    ${S.meter}    ${S.key}`}
            </text>
          </g>
          <line className={styles.rule} x1={0} x2={WIN.w} y1={BAR_H + TOOL_H} y2={BAR_H + TOOL_H} />

          {/* side column with lane names */}
          <rect className={styles.side} x={0} y={RULER_Y} width={LABEL_W} height={WIN.h - RULER_Y} />
          <line className={styles.rule} x1={LABEL_W} x2={LABEL_W} y1={RULER_Y} y2={WIN.h} />
          {LANES_SECURITY.map((name, i) => (
            <text key={`s-${name}`} className={styles.lane} x={20} y={f1(centre(i) + 5)} opacity={f3(sec)}>
              {name}
            </text>
          ))}
          {LANES_MUSIC.map((name, i) => (
            <text key={`m-${name}`} className={styles.lane} x={20} y={f1(centre(i) + 5)} opacity={f3(mus)}>
              {name}
            </text>
          ))}

          {/* ruler: clock times, then bar numbers */}
          {bars.map((x, i) => (
            <g key={i}>
              <line className={styles.tick} x1={x} x2={x} y1={RULER_Y + 14} y2={RULER_Y + 26} />
              <text className={styles.ruler} x={x + 6} y={RULER_Y + 18} opacity={f3(sec)}>
                {S.times[i]}
              </text>
              <text className={styles.ruler} x={x + 6} y={RULER_Y + 18} opacity={f3(mus)}>
                {i + 1}
              </text>
            </g>
          ))}

          {/* lane separators */}
          {Array.from({ length: LANE_COUNT - 1 }, (_, i) => {
            const y = f.laneY + (i + 1) * f.laneH;
            return <line key={i} className={styles.rule} x1={0} x2={WIN.w} y1={f1(y)} y2={f1(y)} />;
          })}
          <line className={styles.rule} x1={0} x2={WIN.w} y1={f1(laneBottom)} y2={f1(laneBottom)} />

          {/* regions and their notes */}
          {f.regions.map((r, i) => (
            <rect
              key={i}
              className={styles.region}
              x={f1(r.x)}
              y={f1(r.y)}
              width={f1(r.w)}
              height={f1(r.h)}
              rx={f1(r.r)}
              opacity={f3(r.o)}
            />
          ))}
          {f.regionNotes.map((n, i) => (
            <rect
              key={i}
              className={styles.regionNote}
              x={f1(n.x)}
              y={f1(Math.min(n.y, laneBottom - 8))}
              width={f1(n.w)}
              height={3}
              rx={1.5}
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

          {/* piano roll */}
          {f.rollOn > 0.002 ? (
            <g opacity={f3(f.rollOn)}>
              {f.rows.map((r, i) => (
                <g key={i}>
                  <rect
                    className={r.black ? styles.rowBlack : styles.rowWhite}
                    x={f.roll.x}
                    y={f1(r.y)}
                    width={f.roll.w}
                    height={f1(r.h)}
                  />
                  <rect
                    className={r.black ? styles.miniBlack : styles.miniWhite}
                    x={LABEL_W + 8}
                    y={f1(r.y + 1)}
                    width={r.black ? 20 : 28}
                    height={f1(r.h - 2)}
                    rx={3}
                  />
                </g>
              ))}
              {f.phrase.map((n, i) => (
                <rect
                  key={i}
                  className={styles.note}
                  x={f1(n.x)}
                  y={f1(n.y)}
                  width={f1(n.w)}
                  height={f1(n.h)}
                  rx={f1(n.r)}
                  opacity={f3(n.o)}
                />
              ))}
            </g>
          ) : null}

          {/* the one that does not belong */}
          <rect
            className={styles.ring}
            x={f1(f.ring.x)}
            y={f1(f.ring.y)}
            width={f1(f.ring.w)}
            height={f1(f.ring.h)}
            rx={f1(f.ring.r)}
            opacity={f3(f.ring.o)}
          />
          {(
            [
              [styles.event, f.anomaly.plain],
              [styles.alert, f.anomaly.alert],
              [styles.note, f.anomaly.fixed],
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

          {/* the detail card */}
          {f.card.o > 0.002 ? (
            <g transform={`translate(${f1(f.card.x)} ${f1(f.card.y)})`} opacity={f3(f.card.o)}>
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
          ) : null}

          {/* scan line while the console fills, playhead once it is a song */}
          <line
            className={styles.scan}
            x1={f1(f.scan)}
            x2={f1(f.scan)}
            y1={RULER_Y}
            y2={WIN.h}
            opacity={f.scanOn}
          />
          <line
            className={styles.playhead}
            x1={f1(f.playhead)}
            x2={f1(f.playhead)}
            y1={RULER_Y}
            y2={WIN.h}
            opacity={f3(f.playheadOn)}
          />
        </g>
        <rect className={styles.winEdge} x={0.5} y={0.5} width={WIN.w - 1} height={WIN.h - 1} rx={WIN.r} />
      </g>

      {f.keysOn > 0.002 ? (
        <g transform={`translate(0 ${f1(f.keysY)})`} opacity={f3(f.keysOn)}>
          <Keyboard pressed={f.pressed.join(",")} />
        </g>
      ) : null}
    </svg>
  );
}
