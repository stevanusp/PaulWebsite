import { Keystation } from "@/components/Keystation";
import {
  BASE,
  CIRCLES,
  CLOUD_FIT,
  FLOOR,
  KEYHOLE,
  KS,
  KS_FLOOR,
  KS_TOP,
  LOCK,
  SHACKLE,
  VIEW,
  scene,
  type Piece,
} from "./cloud";
import styles from "./Work.module.css";

const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
const spin = (k: Piece) => (Math.abs(k.turn) > 0.05 ? `rotate(${f1(k.turn)} ${f1(k.x + k.w / 2)} ${f1(k.y + k.h / 2)})` : undefined);

// One frame: a Keystation whose keys fall into a locked cloud, which falls and breaks back into a
// Keystation. The keys keep their real colors while they are keys; as a cloud they take the
// theme's ink (white keys) and background (black keys, the cut-out lock), so it inverts in dark.
export default function CloudScene({ p }: { p: number }) {
  const f = scene(p);
  const { cx, top, half, foot, stroke } = SHACKLE;
  const shackle = `M${cx - half} ${foot}V${top + half}A${half} ${half} 0 0 1 ${cx + half} ${top + half}V${foot}`;
  const cloudAt = `translate(${f1(CLOUD_FIT.x)} ${f1(CLOUD_FIT.y + f.drop)}) scale(${CLOUD_FIT.scale})`;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={`translate(0 ${f1(f.shift)})`}>
        {/* the floor, felt only through a shadow */}
        {f.shadow.o > 0.002 ? (
          <g opacity={f3(f.shadow.o)}>
            <ellipse className={styles.shadow} cx={500} cy={FLOOR + 4} rx={f1(f.shadow.w / 2)} ry={9} />
            <ellipse className={styles.shadow} cx={500} cy={FLOOR + 3} rx={f1(f.shadow.w / 2.6)} ry={5} />
          </g>
        ) : null}

        {f.ksTop > 0.002 ? (
          <g transform={`translate(${f1(KS.x)} ${KS_TOP}) scale(${KS.scale})`} opacity={f3(f.ksTop)}>
            <Keystation keys={false} />
          </g>
        ) : null}
        {f.ksFloor > 0.002 ? (
          <g transform={`translate(${f1(KS.x)} ${f1(KS_FLOOR)}) scale(${KS.scale})`} opacity={f3(f.ksFloor)}>
            <Keystation keys={false} />
          </g>
        ) : null}

        {f.base > 0.002 ? (
          <g transform={cloudAt}>
            <rect className={styles.ink} x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} opacity={f3(f.base)} />
          </g>
        ) : null}

        {/* white keys: keys, then bars of the cloud, then pieces of it, then keys again */}
        {f.whites.map((k, i) => (
          <g key={i} transform={spin(k)}>
            {k.tone < 0.998 ? (
              <rect className={styles.white} x={f1(k.x)} y={f1(k.y)} width={f1(k.w)} height={f1(k.h)} rx={f1(k.r)} />
            ) : null}
            {k.tone > 0.002 ? (
              <rect
                className={styles.ink}
                x={f1(k.x)}
                y={f1(k.y)}
                width={f1(k.w)}
                height={f1(k.h)}
                rx={f1(k.r)}
                opacity={f3(k.tone)}
              />
            ) : null}
          </g>
        ))}

        {f.cloud > 0.002 ? (
          <g transform={cloudAt}>
            <g className={styles.ink} opacity={f3(f.cloud)}>
              {CIRCLES.map((c) => (
                <circle key={c.cx} cx={c.cx} cy={c.cy} r={c.r} />
              ))}
              <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} />
            </g>
          </g>
        ) : null}

        {/* black keys: keys, then slices of the lock, then pieces, then keys again */}
        {f.blacks.map((k, j) => (
          <g key={j} transform={spin(k)}>
            <rect className={styles.black} x={f1(k.x)} y={f1(k.y)} width={f1(k.w)} height={f1(k.h)} rx={f1(k.r)} />
            {k.tone > 0.002 ? (
              <rect
                className={styles.cut}
                x={f1(k.x)}
                y={f1(k.y)}
                width={f1(k.w)}
                height={f1(k.h)}
                rx={f1(k.r)}
                opacity={f3(k.tone)}
              />
            ) : null}
          </g>
        ))}

        {f.lock > 0.002 || f.shackleDraw > 0.002 ? (
          <g transform={cloudAt}>
            <rect className={styles.cut} x={LOCK.x} y={LOCK.y} width={LOCK.w} height={LOCK.h} rx={LOCK.r} opacity={f3(f.lock)} />
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
            <g className={styles.ink} opacity={f3(f.lock)}>
              <circle cx={KEYHOLE.cx} cy={KEYHOLE.cy} r={KEYHOLE.r} />
              <rect x={KEYHOLE.cx - 4} y={KEYHOLE.cy} width={8} height={KEYHOLE.stem} rx={4} />
            </g>
          </g>
        ) : null}
      </g>
    </svg>
  );
}
