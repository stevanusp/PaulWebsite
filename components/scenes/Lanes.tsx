"use client";

import { noise1, smoothstep } from "@/lib/signal";
import { useScene } from "./useScene";
import styles from "./Scenes.module.css";

const W = 480;
const H = 150;
const LANES = [28, 75, 122] as const;
const BOX_W = 74;
const BOX_H = 28;
const BOX_X = [104, 214, 324] as const;

type Props = { lanes: readonly [string, string, string] };

// A tangled line settles into three lanes and a path anyone can follow.
export default function Lanes({ lanes }: Props) {
  const { ref, p } = useScene(3000);

  const tangle = 1 - smoothstep(0, 0.45, p);
  const tangleOpacity = 1 - smoothstep(0.3, 0.5, p);
  let d = "";
  for (let x = 0; x <= W; x += 3) {
    const y = 75 + tangle * (30 * noise1(x / 9 + 3) + 18 * Math.sin(x / 6 + p * 22));
    d += (x === 0 ? "M" : "L") + x + " " + y.toFixed(1);
  }

  const lanesOpacity = smoothstep(0.35, 0.5, p);
  const box = [smoothstep(0.45, 0.55, p), smoothstep(0.62, 0.72, p), smoothstep(0.8, 0.9, p)];
  const arrows = [
    { d: `M${BOX_X[0] + BOX_W} ${LANES[0]}H${BOX_X[1] - 18}V${LANES[1]}H${BOX_X[1]}`, k: smoothstep(0.55, 0.68, p) },
    { d: `M${BOX_X[1] + BOX_W} ${LANES[1]}H${BOX_X[2] - 18}V${LANES[2]}H${BOX_X[2]}`, k: smoothstep(0.72, 0.84, p) },
    { d: `M${BOX_X[2] + BOX_W} ${LANES[2]}H${BOX_X[2] + BOX_W + 40}`, k: smoothstep(0.9, 1, p) },
  ];

  return (
    <svg ref={ref} className={styles.scene} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <path className={styles.base} d={d} opacity={tangleOpacity.toFixed(3)} />
      <g opacity={lanesOpacity.toFixed(3)}>
        {LANES.map((y, i) => (
          <g key={lanes[i]}>
            <line className={styles.lane} x1="0" x2={W} y1={y} y2={y} />
            <text className={styles.laneLabel} x={0} y={y - 22}>
              {lanes[i]}
            </text>
          </g>
        ))}
      </g>
      {BOX_X.map((x, i) => (
        <rect
          key={x}
          className={styles.step}
          x={x}
          y={LANES[i] - BOX_H / 2}
          width={BOX_W}
          height={BOX_H}
          rx={6}
          opacity={box[i].toFixed(3)}
        />
      ))}
      {arrows.map((a, i) => (
        <path
          key={i}
          className={styles.arrow}
          d={a.d}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={(1 - a.k).toFixed(3)}
          opacity={a.k > 0.001 ? 1 : 0}
        />
      ))}
    </svg>
  );
}
