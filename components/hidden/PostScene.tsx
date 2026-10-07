import styles from "./HiddenPage.module.css";

type Props = {
  /** The part of the post in the middle of the screen, from 0. */
  part: number;
  /** How far through that part the reader is, 0 to 1. */
  within: number;
  count: number;
};

const CX = 200;
const CY = 186;
const R = 112;

// A stand-in for the post's illustration. It already follows the reading (which part, and how far
// into it), so the real drawing can take its place without touching the mechanism.
export default function PostScene({ part, within, count }: Props) {
  const gap = 20;
  const left = CX - ((count - 1) * gap) / 2;
  return (
    <svg className={styles.scene} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <rect className={styles.frame} x={8} y={8} width={384} height={384} rx={34} />
      <circle className={styles.track} cx={CX} cy={CY} r={R} />
      <circle
        className={styles.arc}
        cx={CX}
        cy={CY}
        r={R}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={(1 - within).toFixed(4)}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
      <text className={styles.numeral} x={CX} y={CY} textAnchor="middle" dominantBaseline="central">
        {part + 1}
      </text>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          className={i <= part ? styles.dotOn : styles.dot}
          cx={left + i * gap}
          cy={346}
          r={i === part ? 5 : 4}
        />
      ))}
    </svg>
  );
}
