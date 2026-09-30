"use client";

import { useId } from "react";
import { burst, cornersPath, limit, normal, pathFor, reachFor, smoothstep } from "@/lib/signal";
import { useScene } from "./useScene";
import styles from "./Scenes.module.css";

const W = 480;
const H = 150;
const MID = H / 2;
const HALF = 60;
const AMP = 0.8 * HALF;
const REACH = reachFor(AMP, HALF, 3);
const CX = 300;
const SIGMA = 16;

type Props = { alarm: string; calm: string };

// An alert that looks huge is triaged down to a small, understood ripple.
export default function Triage({ alarm, calm }: Props) {
  const { ref, p } = useScene(3600);
  const gid = useId().replace(/:/g, "");

  const t = p * 3.2;
  const grow = smoothstep(0.02, 0.2, p);
  const shrink = smoothstep(0.55, 0.75, p);
  const E = grow * (1 - 0.8 * shrink);
  const y = (x: number) => MID - limit(HALF * normal(x, t) + AMP * E * burst(x, t, CX, SIGMA), REACH);

  const a0 = Math.floor((CX - 3 * SIGMA) / 3) * 3;
  const a1 = Math.ceil((CX + 3 * SIGMA) / 3) * 3;
  const alert = 1 * smoothstep(0.03, 0.15, p) * (1 - smoothstep(0.55, 0.72, p));

  const bs = 1 - 0.62 * shrink;
  const halfW = (2.4 * SIGMA + 7) * (1 - 0.3 * shrink);
  const x0 = CX - halfW;
  const corners = cornersPath(x0, MID - REACH * bs, CX + halfW, MID + REACH * bs, 9);
  const boxOpacity = smoothstep(0.1, 0.2, p);
  const cool = smoothstep(0.58, 0.74, p);
  const labelY = MID - REACH * bs - 7;

  return (
    <svg ref={ref} className={styles.scene} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={a0} x2={a1} y1="0" y2="0">
          <stop offset="0" className={styles.stopClear} />
          <stop offset="0.3" className={styles.stop} />
          <stop offset="0.7" className={styles.stop} />
          <stop offset="1" className={styles.stopClear} />
        </linearGradient>
      </defs>
      <path className={styles.base} d={pathFor(y, 0, W, 3)} />
      <path
        className={styles.alert}
        d={pathFor(y, a0, a1, 3)}
        stroke={`url(#${gid})`}
        opacity={alert.toFixed(3)}
      />
      <path className={styles.corners} d={corners} opacity={(boxOpacity * (1 - cool)).toFixed(3)} />
      <path className={styles.cornersCalm} d={corners} opacity={(boxOpacity * cool).toFixed(3)} />
      <text
        className={`${styles.label} ${styles.labelAlert}`}
        x={x0}
        y={labelY}
        opacity={(smoothstep(0.12, 0.22, p) * (1 - smoothstep(0.55, 0.62, p))).toFixed(3)}
      >
        {alarm}
      </text>
      <text
        className={`${styles.label} ${styles.labelCalm}`}
        x={x0}
        y={labelY}
        opacity={smoothstep(0.66, 0.78, p).toFixed(3)}
      >
        {calm}
      </text>
    </svg>
  );
}
