import { memo } from "react";
import { Keystation } from "@/components/Keystation";
import SecureCloud from "@/components/secure-cloud/SecureCloud";
import { KS, VIEW, scene } from "./cloud";
import styles from "./Work.module.css";

const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);

// One frame: the Keystation's keys falling into a locked cloud. Memoized so the hidden stills
// render once, not on every scroll frame.
export default memo(function CloudScene({ p }: { p: number }) {
  const f = scene(p);
  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={`translate(0 ${f1(f.shift)})`}>
        {f.ks > 0.002 ? (
          <g transform={`translate(${f1(KS.x)} 0) scale(${KS.scale})`} opacity={f3(f.ks)}>
            <Keystation keys={false} />
          </g>
        ) : null}
        <SecureCloud f={f} />
      </g>
    </svg>
  );
});
