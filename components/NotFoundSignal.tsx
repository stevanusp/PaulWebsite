"use client";

// A client component on purpose: its paths are computed here, so the root layout's
// payload only carries a reference to it instead of the full SVG geometry.
import { HERO_AMP, burst, cornersPath, limit, normal, pathFor, reachFor } from "@/lib/signal";

const W = 1200;
const H = 160;
const CX = 600;
const SIGMA = 19;

const mid = H / 2;
const h = H / 2;
const amp = HERO_AMP * h;
const reach = reachFor(amp, h, 3);
const t = 0.62;
const y = (x: number) => mid - limit(h * normal(x, t) + amp * burst(x, t, CX, SIGMA), reach);
const pad = 7;
const x0 = CX - 2.4 * SIGMA - pad;
const x1 = CX + 2.4 * SIGMA + pad;
const A0 = Math.floor((CX - 3 * SIGMA) / 3) * 3;
const A1 = Math.ceil((CX + 3 * SIGMA) / 3) * 3;
const BASE = pathFor(y, 0, W, 3);
const ALERT = pathFor(y, A0, A1, 3);
const CORNERS = cornersPath(x0, mid - reach, x1, mid + reach, 9);

export default function NotFoundSignal({ label }: { label: string }) {
  return (
    <svg
      className="nf-signal"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="nf-alert" gradientUnits="userSpaceOnUse" x1={A0} x2={A1} y1="0" y2="0">
          <stop offset="0" className="nf-stopClear" />
          <stop offset="0.3" className="nf-stop" />
          <stop offset="0.7" className="nf-stop" />
          <stop offset="1" className="nf-stopClear" />
        </linearGradient>
      </defs>
      <path className="nf-base" d={BASE} />
      <path className="nf-alert" d={ALERT} stroke="url(#nf-alert)" />
      <path className="nf-corners" d={CORNERS} />
      <text className="nf-label" x={x0} y={mid - reach - 8}>
        {label}
      </text>
    </svg>
  );
}
