"use client";

import { clamp, normal, pathFor, smoothstep } from "@/lib/signal";
import { useScene } from "./useScene";
import styles from "./Scenes.module.css";

const W = 480;
const H = 160;
const COLS = 21;
const ROWS = 4;
const TOTAL = 83;

type Props = { label: string; total: string };

// 83 branches move to the new edge one after another while the line above never breaks.
export default function Branches({ label, total }: Props) {
  const { ref, p } = useScene(2600);

  const line = pathFor((x) => 26 - 38 * normal(x, p * 4), 0, W, 3);
  const count = Math.round(TOTAL * clamp(p / 0.85));
  const counter = p >= 1 ? total : String(count);

  const dots = [];
  for (let i = 0; i < TOTAL; i++) {
    const col = Math.floor(i / ROWS);
    const row = i % ROWS;
    const start = (col / (COLS - 1)) * 0.7 + row * 0.015;
    dots.push(
      <circle
        key={i}
        className={styles.dot}
        cx={16 + col * 22.4}
        cy={68 + row * 22}
        r={4}
        fillOpacity={smoothstep(start, start + 0.14, p).toFixed(3)}
      />,
    );
  }

  return (
    <svg ref={ref} className={styles.scene} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <path className={styles.base} d={line} />
      {dots}
      <text className={styles.count} x={468} y={154} textAnchor="end">
        {counter} {label}
      </text>
    </svg>
  );
}
