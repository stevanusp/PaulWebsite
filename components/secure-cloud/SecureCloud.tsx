import { BASE, CIRCLES, KEYHOLE, LOCK, SHACKLE, shacklePath, type CloudFrame, type Fit, type Piece } from "./geometry";
import styles from "./SecureCloud.module.css";

const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
const at = (f: Fit) => `translate(${f1(f.x)} ${f1(f.y)}) scale(${f.scale})`;
const spin = (k: Piece) => (Math.abs(k.turn) > 0.05 ? `rotate(${f1(k.turn)} ${f1(k.x + k.w / 2)} ${f1(k.y + k.h / 2)})` : undefined);

/** The secure cloud and the keys it is made of, in drawing order: base, white keys, the smooth
    cloud over them, black keys, then the lock over those. */
export default function SecureCloud({ f }: { f: CloudFrame }) {
  return (
    <g>
      {f.base > 0.002 ? (
        <g transform={at(f.fit)}>
          <rect className={styles.ink} x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} opacity={f3(f.base)} />
        </g>
      ) : null}

      {f.pieces &&
        f.whites.map((k, i) => (
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
        <g transform={at(f.fit)}>
          <g className={styles.ink} opacity={f3(f.cloud)}>
            {CIRCLES.map((c) => (
              <circle key={c.cx} cx={c.cx} cy={c.cy} r={c.r} />
            ))}
            <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} />
          </g>
        </g>
      ) : null}

      {f.pieces &&
        f.blacks.map((k, j) => (
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
        <g transform={at(f.fit)}>
          <rect className={styles.cut} x={LOCK.x} y={LOCK.y} width={LOCK.w} height={LOCK.h} rx={LOCK.r} opacity={f3(f.lock)} />
          {f.shackleDraw > 0.002 ? (
            <path
              className={styles.shackle}
              d={shacklePath()}
              pathLength={1}
              strokeWidth={SHACKLE.stroke}
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
  );
}
