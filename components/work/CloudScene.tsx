import { BASE, CIRCLES, KEYHOLE, LOCK, SHACKLE, TRAY, VIEW, scene } from "./cloud";
import styles from "./Work.module.css";

const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);

// One frame of the piano becoming a cloud with a lock in it. The piano keeps its real colors;
// the cloud and lock take the theme's ink and background, so the logo inverts in dark mode.
export default function CloudScene({ p }: { p: number }) {
  const f = scene(p);
  const { cx, top, half, foot, stroke } = SHACKLE;
  const shackle = `M${cx - half} ${foot}V${top + half}A${half} ${half} 0 0 1 ${cx + half} ${top + half}V${foot}`;

  return (
    <svg
      className={styles.svg}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {f.tray > 0.002 ? (
        <rect className={styles.tray} x={TRAY.x} y={TRAY.y} width={TRAY.w} height={TRAY.h} rx={TRAY.r} opacity={f3(f.tray)} />
      ) : null}

      {f.base > 0.002 ? (
        <rect className={styles.ink} x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} opacity={f3(f.base)} />
      ) : null}

      {/* white keys, then bars, then the cloud's body */}
      <g opacity={f3(f.bars)}>
        {f.whites.map((k, i) => (
          <g key={i}>
            {k.light > 0.002 ? (
              <rect
                className={styles.white}
                x={f1(k.x)}
                y={f1(k.y)}
                width={f1(k.w)}
                height={f1(k.h)}
                rx={f1(k.r)}
                opacity={f3(k.light)}
              />
            ) : null}
            {k.dark > 0.002 ? (
              <rect
                className={styles.ink}
                x={f1(k.x)}
                y={f1(k.y)}
                width={f1(k.w)}
                height={f1(k.h)}
                rx={f1(k.r)}
                opacity={f3(k.dark)}
              />
            ) : null}
          </g>
        ))}
      </g>

      {f.cloud > 0.002 ? (
        <g className={styles.ink} opacity={f3(f.cloud)}>
          {CIRCLES.map((c) => (
            <circle key={c.cx} cx={c.cx} cy={c.cy} r={c.r} />
          ))}
          <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} />
        </g>
      ) : null}

      {/* black keys, then the slices of the lock */}
      {f.slices > 0.002
        ? f.blacks.map((k, j) => (
            <g key={j} opacity={f3(f.slices)}>
              <rect className={styles.black} x={f1(k.x)} y={f1(k.y)} width={f1(k.w)} height={f1(k.h)} rx={f1(k.r)} />
              {k.light > 0.002 ? (
                <rect
                  className={styles.cut}
                  x={f1(k.x)}
                  y={f1(k.y)}
                  width={f1(k.w)}
                  height={f1(k.h)}
                  rx={f1(k.r)}
                  opacity={f3(k.light)}
                />
              ) : null}
            </g>
          ))
        : null}

      {f.lock > 0.002 ? (
        <rect className={styles.cut} x={LOCK.x} y={LOCK.y} width={LOCK.w} height={LOCK.h} rx={LOCK.r} opacity={f3(f.lock)} />
      ) : null}
      {f.shackleDraw > 0.002 ? (
        <path
          className={styles.shackle}
          d={shackle}
          pathLength={1}
          strokeWidth={stroke}
          strokeDasharray="1 1"
          strokeDashoffset={f3(1 - f.shackleDraw)}
          transform={`translate(0 ${f1(f.shackleDrop)})`}
        />
      ) : null}
      {f.keyhole > 0.002 ? (
        <g className={styles.ink} opacity={f3(f.keyhole)}>
          <circle cx={KEYHOLE.cx} cy={KEYHOLE.cy} r={KEYHOLE.r} />
          <rect x={KEYHOLE.cx - 4} y={KEYHOLE.cy} width={8} height={KEYHOLE.stem} rx={4} />
        </g>
      ) : null}
    </svg>
  );
}
