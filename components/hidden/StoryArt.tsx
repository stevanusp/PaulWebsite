import { memo, type CSSProperties } from "react";
import { BASE, BOX, CIRCLES } from "@/components/secure-cloud/geometry";
import { hidden } from "@/content/hidden";
import { rand } from "@/lib/motion";
import { GROUND, LOOP, PLAN, VIEW, heartCaps, type Art, type Cap, type Dot, type HeartShape } from "./art";
import styles from "./HiddenPage.module.css";

const f1 = (n: number) => n.toFixed(1);
const f3 = (n: number) => n.toFixed(3);
const seen = (o: number) => o > 0.002;
const cls = (...names: (string | false)[]) => names.filter(Boolean).join(" ") || undefined;
const delay = (s: number): CSSProperties => ({ animationDelay: `${s.toFixed(2)}s` });
/** The heart's red, from bright (0) to deep (1). */
const red = (deep: number) => `color-mix(in oklab, var(--hp-heart-deep) ${(deep * 100).toFixed(1)}%, var(--hp-heart))`;

/** The whole scene, and a narrower frame for phones that keeps the middle of it. */
const FRAMES = {
  wide: `${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`,
  narrow: `${VIEW.x + 100} ${VIEW.y} ${VIEW.w - 200} ${VIEW.h}`,
} as const;

// ---- Details that never move

const star = (x: number, y: number, k: number) =>
  `M${f1(x)} ${f1(y - k)}Q${f1(x)} ${f1(y)} ${f1(x + k)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y + k)}` +
  `Q${f1(x)} ${f1(y)} ${f1(x - k)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y - k)}Z`;

const STARS = Array.from({ length: 22 }, (_, i) => ({
  x: 40 + rand(i + 50) * 720,
  y: 36 + rand(i + 80) * 180,
  k: 2.6 + rand(i + 110) * 3.2,
  delay: -rand(i + 140) * 3.6,
}))
  .filter((s) => Math.hypot(s.x - 232, s.y - 108) > 46)
  .map((s) => ({ d: star(s.x, s.y, s.k), delay: s.delay }));

// The rain cloud is the site's secure cloud, without its lock.
const CLOUD = { cx: BOX.x + BOX.w / 2, cy: BOX.y + BOX.h / 2, bottom: BOX.y + BOX.h };
const DROPS = Array.from({ length: 14 }, (_, i) => ({
  x: -84 + i * 13 + (rand(i + 7) - 0.5) * 8,
  y: rand(i + 23) * 180,
  delay: -rand(i + 37) * 0.8,
}));

const PETALS = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(a) * 7.5, y: Math.sin(a) * 7.5 };
});

const GRID = { x: 250, y: 94, w: 448, h: 112, step: 16 } as const;
const GRID_X = Array.from({ length: GRID.w / GRID.step - 1 }, (_, i) => GRID.x + (i + 1) * GRID.step);
const GRID_Y = Array.from({ length: GRID.h / GRID.step - 1 }, (_, i) => GRID.y + (i + 1) * GRID.step);

// The way it actually goes: between the same two dots as the plan, with a wave, a loop and a dip.
const JOURNEY =
  `M${PLAN.x0} ${PLAN.y}C314 112 346 192 386 150C416 118 470 98 476 136C482 176 428 178 440 140` +
  `C452 104 530 112 552 150C572 186 624 182 636 156C646 136 664 140 ${PLAN.x1} ${PLAN.y}`;

// Drawn from the bottom, the way the traveler runs it.
const LOOP_PATH =
  `M${LOOP.cx} ${LOOP.cy + LOOP.r}A${LOOP.r} ${LOOP.r} 0 1 0 ${LOOP.cx} ${LOOP.cy - LOOP.r}` +
  `A${LOOP.r} ${LOOP.r} 0 1 0 ${LOOP.cx} ${LOOP.cy + LOOP.r}`;

const BUBBLE =
  "M-42 -24H42A18 18 0 0 1 60 -6V6A18 18 0 0 1 42 24H-20L-44 42L-34 24H-42A18 18 0 0 1 -60 6V-6A18 18 0 0 1 -42 -24Z";

const QUESTION = "M-6 -9C-6 -16 6 -16 6 -9C6 -4 0 -4 0 2";

// Cracks across a heart, in units of its height, from its center.
const CRACKS = [
  [
    [0, -0.25],
    [0.045, -0.16],
    [-0.03, -0.07],
    [0.035, 0.03],
    [-0.01, 0.12],
  ],
  [
    [-0.66, -0.12],
    [-0.53, -0.07],
    [-0.47, 0.01],
    [-0.37, 0.02],
    [-0.31, 0.1],
  ],
  [
    [0.36, -0.48],
    [0.32, -0.39],
    [0.4, -0.31],
    [0.33, -0.21],
    [0.37, -0.13],
  ],
] as const;

// ---- Shapes that move

type At = { cx: number; cy: number; s: number };

const crack = (pts: (typeof CRACKS)[number], h: At) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${f1(h.cx + x * h.s)} ${f1(h.cy + y * h.s)}`).join("");

/** One arm of an embrace, from under the heart up around its side. */
const arm = (h: At, side: -1 | 1) => {
  const x = (k: number) => f1(h.cx + side * k * h.s);
  const y = (k: number) => f1(h.cy + k * h.s);
  return `M${x(0.14)} ${y(0.64)}C${x(0.78)} ${y(0.62)} ${x(0.98)} ${y(-0.05)} ${x(0.74)} ${y(-0.44)}`;
};

const crescent = ({ x, y, r }: Dot) => {
  const hx = f1(x + 0.2 * r);
  return `M${hx} ${f1(y - 0.98 * r)}A${r} ${r} 0 1 0 ${hx} ${f1(y + 0.98 * r)}A${r} ${r} 0 0 1 ${hx} ${f1(y - 0.98 * r)}Z`;
};

const teardrop = ({ x, y, r }: Dot) =>
  `M${f1(x)} ${f1(y - 2.2 * r)}Q${f1(x + 1.1 * r)} ${f1(y - 0.6 * r)} ${f1(x + r)} ${f1(y + 0.1 * r)}` +
  `A${r} ${r} 0 0 1 ${f1(x - r)} ${f1(y + 0.1 * r)}Q${f1(x - 1.1 * r)} ${f1(y - 0.6 * r)} ${f1(x)} ${f1(y - 2.2 * r)}Z`;

const bird = ({ x, y, flap }: Dot & { flap: number }) => {
  const tip = f1(y - 4 + flap * 5);
  return `M${f1(x - 10)} ${tip}Q${f1(x - 5)} ${f1(y - 2)} ${f1(x)} ${f1(y + 1)}Q${f1(x + 5)} ${f1(y - 2)} ${f1(x + 10)} ${tip}`;
};

function Capsule({ c, className, opacity, style }: { c: Cap; className?: string; opacity?: number; style?: CSSProperties }) {
  return (
    <rect
      className={className}
      style={style}
      x={f1(c.cx - c.w / 2)}
      y={f1(c.cy - c.h / 2)}
      width={f1(c.w)}
      height={f1(c.h)}
      rx={f1(Math.min(c.w, c.h) / 2)}
      transform={c.rot ? `rotate(${f1(c.rot)} ${f1(c.cx)} ${f1(c.cy)})` : undefined}
      opacity={opacity === undefined ? undefined : f3(opacity)}
    />
  );
}

function Heart({ h, className, style }: { h: HeartShape; className: string; style?: CSSProperties }) {
  const [l, r] = heartCaps(h);
  return (
    <g className={className} style={style}>
      <Capsule c={l} />
      <Capsule c={r} />
    </g>
  );
}

/** Someone else: the same shapes, grey, with no face. */
function Other({ x, y }: { x: number; y: number }) {
  return (
    <>
      <Capsule c={{ cx: x, cy: y - 27, w: 30, h: 54, rot: 0 }} />
      <Capsule c={{ cx: x, cy: y - 76, w: 26, h: 42, rot: 90 }} />
    </>
  );
}

type Props = {
  /** One frame of the story (art.ts). */
  a: Art;
  /** Prefix for this drawing's gradient and clip ids, unique on the page. */
  uid: string;
  /** Stills (reduced motion) leave out the small looping motions too. */
  still?: boolean;
  narrow: boolean;
};

// One frame of the hidden post's drawing. It only draws what art.ts says is there; anything fully
// faded out is left out of the DOM. The small motions that loop while you read (a blink, typing
// dots, rain, stars, breathing, a heartbeat) are CSS, and only run with motion allowed.
export default memo(function StoryArt({ a, uid, still = false, narrow }: Props) {
  const live = !still;
  const glow = `url(#${uid}-glow)`;
  const flyGlow = `url(#${uid}-fly)`;
  const { eyes } = a;
  const rainTop = a.cloud.y + (CLOUD.bottom - CLOUD.cy) * a.cloud.s + 4;
  const pinO = Math.max(a.route.o, a.journey.o) * Math.min(1, a.route.draw * 5);

  return (
    <svg
      className={styles.svg}
      viewBox={narrow ? FRAMES.narrow : FRAMES.wide}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" className={styles.glowIn} />
          <stop offset="1" className={styles.glowOut} />
        </radialGradient>
        <radialGradient id={`${uid}-fly`}>
          <stop offset="0" className={styles.flyIn} />
          <stop offset="1" className={styles.flyOut} />
        </radialGradient>
        <radialGradient id={`${uid}-love`}>
          <stop offset="0" className={styles.loveIn} />
          <stop offset="1" className={styles.loveOut} />
        </radialGradient>
        <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles.beamOut} />
          <stop offset="0.4" className={styles.beamIn} />
          <stop offset="1" className={styles.beamOut} />
        </linearGradient>
        <clipPath id={`${uid}-sky`}>
          <rect x={-200} y={-200} width={VIEW.w + 400} height={GROUND + 200} />
        </clipPath>
      </defs>

      {seen(a.night) ? (
        <g opacity={f3(a.night * 0.7)}>
          {STARS.map((s, i) => (
            <path
              key={i}
              className={cls(styles.star, live && styles.twinkle)}
              d={s.d}
              style={live ? delay(s.delay) : undefined}
            />
          ))}
        </g>
      ) : null}

      <g clipPath={`url(#${uid}-sky)`}>
        {seen(a.dawn) ? (
          <circle fill={glow} cx={f1(a.sun.x)} cy={f1(a.sun.y)} r={f1(a.sun.r * 5.5)} opacity={f3(a.dawn * 0.4)} />
        ) : null}
        {seen(a.ahead.o) ? (
          <circle fill={glow} cx={a.ahead.x} cy={a.ahead.y} r={f1(a.ahead.r * 2.2)} opacity={f3(a.ahead.o)} />
        ) : null}
        {seen(a.sun.o) ? (
          <g opacity={f3(a.sun.o)}>
            <circle fill={glow} cx={f1(a.sun.x)} cy={f1(a.sun.y)} r={f1(a.sun.r * 2.6)} />
            <circle className={styles.sun} cx={f1(a.sun.x)} cy={f1(a.sun.y)} r={f1(a.sun.r)} />
          </g>
        ) : null}
        {seen(a.moon.o) ? <path className={styles.moon} d={crescent(a.moon)} opacity={f3(a.moon.o)} /> : null}
      </g>

      {seen(a.beam.o) ? (
        <polygon
          fill={`url(#${uid}-beam)`}
          points={`${f1(a.beam.x - 34)},${VIEW.y} ${f1(a.beam.x + 34)},${VIEW.y} ${f1(a.beam.x + 150)},${f1(a.beam.y + 40)} ${f1(a.beam.x - 150)},${f1(a.beam.y + 40)}`}
          opacity={f3(a.beam.o)}
        />
      ) : null}

      {seen(a.grid) ? (
        <g opacity={f3(a.grid)}>
          <g className={styles.grid}>
            {GRID_X.map((x) => (
              <line key={x} x1={x} x2={x} y1={GRID.y} y2={GRID.y + GRID.h} />
            ))}
            {GRID_Y.map((y) => (
              <line key={y} x1={GRID.x} x2={GRID.x + GRID.w} y1={y} y2={y} />
            ))}
          </g>
          <rect className={styles.gridFrame} x={GRID.x} y={GRID.y} width={GRID.w} height={GRID.h} rx={12} />
        </g>
      ) : null}
      {seen(a.route.o) && a.route.draw > 0.002 ? (
        <line
          className={styles.route}
          x1={PLAN.x0}
          y1={PLAN.y}
          x2={f1(PLAN.x0 + (PLAN.x1 - PLAN.x0) * a.route.draw)}
          y2={PLAN.y}
          opacity={f3(a.route.o)}
        />
      ) : null}
      {seen(a.journey.o) && a.journey.draw > 0.002 ? (
        <path
          className={styles.journey}
          d={JOURNEY}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={f3(1 - a.journey.draw)}
          opacity={f3(a.journey.o)}
        />
      ) : null}
      {seen(pinO) ? (
        <g opacity={f3(pinO)}>
          <circle className={styles.pin} cx={PLAN.x0} cy={PLAN.y} r={6} />
          <circle className={styles.pinEnd} cx={PLAN.x1} cy={PLAN.y} r={7} />
        </g>
      ) : null}

      {seen(a.ground.o) ? (
        <g opacity={f3(a.ground.o)}>
          <path
            className={styles.ground}
            d={a.ground.path}
            pathLength={1}
            strokeDasharray={a.ground.draw < 1 ? "1 1" : undefined}
            strokeDashoffset={a.ground.draw < 1 ? f3(1 - a.ground.draw) : undefined}
          />
          <g className={styles.pebble} opacity={f3(a.ground.draw)}>
            {a.pebbles.map((d, i) => (
              <circle key={i} cx={f1(d.x)} cy={f1(d.y)} r={d.r} />
            ))}
          </g>
        </g>
      ) : null}

      {seen(a.loop.o) ? (
        <path
          className={styles.loop}
          d={LOOP_PATH}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={f3(1 - a.loop.draw)}
          opacity={f3(a.loop.o)}
        />
      ) : null}

      {seen(a.flower.o) ? (
        <g opacity={f3(a.flower.o)} transform={`translate(${f1(a.flower.x)} ${f1(a.flower.y)})`}>
          <path className={styles.stem} d="M0 0V-36" />
          <path className={styles.leaf} d="M0 -12C6 -22 15 -22 19 -18C14 -11 7 -9 0 -12Z" />
          {a.flower.bloom > 0.01 ? (
            <g transform={`translate(0 -40) scale(${f3(a.flower.bloom)})`}>
              {PETALS.map((pt, i) => (
                <circle key={i} className={styles.petal} cx={f1(pt.x)} cy={f1(pt.y)} r={6} />
              ))}
              <circle className={styles.dot} r={4.2} />
            </g>
          ) : null}
        </g>
      ) : null}
      {a.flags.map((f, i) =>
        seen(f.o) && f.rise > 0.01 ? (
          <g key={i} opacity={f3(f.o)} transform={`translate(${f1(f.x)} ${f1(f.y)}) scale(1 ${f3(f.rise)})`}>
            <path className={styles.pole} d="M0 0V-76" />
            <path className={styles.flag} d="M0 -76L38 -64L0 -52Z" />
          </g>
        ) : null,
      )}

      {seen(a.cushion.o) ? (
        <rect
          className={styles.cushion}
          x={a.cushion.x - 86}
          y={f1(GROUND - 26 * a.cushion.squish)}
          width={172}
          height={f1(26 * a.cushion.squish)}
          rx={f1(13 * a.cushion.squish)}
          opacity={f3(a.cushion.o)}
        />
      ) : null}

      {a.others.map((o, i) =>
        seen(o.o) ? (
          <g key={i} className={styles.other} opacity={f3(o.o)}>
            <Other x={o.x} y={o.y} />
          </g>
        ) : null,
      )}
      {seen(a.halo.o) ? (
        <g className={styles.halo} opacity={f3(a.halo.o)}>
          <circle fill={`url(#${uid}-glow)`} stroke="none" cx={f1(a.halo.cx)} cy={f1(a.halo.cy)} r={f1(150 * a.halo.s)} opacity={0.5} />
          <circle cx={f1(a.halo.cx)} cy={f1(a.halo.cy)} r={f1(158 * a.halo.s)} opacity={0.55} />
          <circle cx={f1(a.halo.cx)} cy={f1(a.halo.cy)} r={f1(196 * a.halo.s)} opacity={0.25} />
        </g>
      ) : null}

      <g className={cls(live && a.breathing && styles.breathe, live && a.pulse && styles.pulse)}>
        {seen(a.body.o) ? (
          <g opacity={f3(a.body.o)}>
            {a.body.warm < 0.998 ? <Capsule c={a.body} className={styles.body} /> : null}
            {seen(a.body.warm) ? (
              <Capsule c={a.body} className={styles.warm} opacity={a.body.warm} style={{ fill: red(a.body.deep), stroke: red(a.body.deep) }} />
            ) : null}
          </g>
        ) : null}
        {seen(a.heart.o) ? (
          <g opacity={f3(a.heart.o * a.heart.dim)}>
            {seen(a.heart.glow) ? (
              <circle
                fill={`url(#${uid}-love)`}
                cx={f1(a.heart.cx)}
                cy={f1(a.heart.cy)}
                r={f1(a.heart.s * 1.5)}
                opacity={f3(a.heart.glow)}
              />
            ) : null}
            <Heart h={a.heart} className={styles.keyline} />
            <Heart h={a.heart} className={styles.heart} style={{ fill: red(a.heart.deep) }} />
          </g>
        ) : null}
        {seen(a.box.o) ? (
          <g opacity={f3(a.box.o)}>
            <rect className={styles.box} x={340} y={f1(a.box.y)} width={120} height={72} rx={10} />
            <rect
              className={styles.box}
              x={334}
              y={f1(a.box.y - 17)}
              width={132}
              height={17}
              rx={7}
              transform={`rotate(${f1(-112 * a.box.lid)} 334 ${f1(a.box.y)})`}
            />
          </g>
        ) : null}
        {seen(a.mind.o) ? (
          <g opacity={f3(a.mind.o)}>
            {a.mind.warm < 0.998 ? <Capsule c={a.mind} className={styles.mind} /> : null}
            {seen(a.mind.warm) ? (
              <Capsule c={a.mind} className={styles.warm} opacity={a.mind.warm} style={{ fill: red(a.mind.deep), stroke: red(a.mind.deep) }} />
            ) : null}
          </g>
        ) : null}
        {seen(eyes.o) ? (
          <g opacity={f3(eyes.o)} transform={`rotate(${f1(eyes.rot)} ${f1(eyes.x)} ${f1(eyes.y)})`}>
            {([-1, 1] as const).map((side) => {
              const x = eyes.x + (side * eyes.gap) / 2;
              const r = eyes.r;
              return (
                <g key={side}>
                  {eyes.happy < 0.998 ? (
                    <ellipse
                      className={cls(styles.eye, live && styles.blink)}
                      cx={f1(x)}
                      cy={f1(eyes.y)}
                      rx={f1(r)}
                      ry={f1(r * eyes.open)}
                      opacity={eyes.happy > 0.002 ? f3(1 - eyes.happy) : undefined}
                    />
                  ) : null}
                  {seen(eyes.happy) ? (
                    <path
                      className={styles.happy}
                      d={`M${f1(x - 1.25 * r)} ${f1(eyes.y + 0.45 * r)}Q${f1(x)} ${f1(eyes.y - 1.35 * r)} ${f1(x + 1.25 * r)} ${f1(eyes.y + 0.45 * r)}`}
                      opacity={f3(eyes.happy)}
                    />
                  ) : null}
                </g>
              );
            })}
          </g>
        ) : null}
      </g>

      {seen(a.cracks.o) && a.cracks.draw > 0.002 ? (
        <g opacity={f3(a.cracks.o)}>
          {CRACKS.map((pts, i) => {
            const d = crack(pts, a.cracks);
            return (
              <g key={i}>
                {a.cracks.gold < 0.998 ? (
                  <path
                    className={styles.crack}
                    d={d}
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={f3(1 - a.cracks.draw)}
                    opacity={f3(1 - a.cracks.gold)}
                  />
                ) : null}
                {seen(a.cracks.gold) ? (
                  <g opacity={f3(a.cracks.gold)}>
                    <path className={styles.gold} d={d} />
                    <path className={styles.shine} d={d} />
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      ) : null}
      {seen(a.arms.o) && a.arms.draw > 0.002 ? (
        <g className={styles.arm} opacity={f3(a.arms.o)}>
          {([-1, 1] as const).map((side) => (
            <path
              key={side}
              d={arm(a.arms, side)}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={f3(1 - a.arms.draw)}
            />
          ))}
        </g>
      ) : null}

      {a.labels.map((l, i) =>
        seen(l.o) ? (
          <text key={i} className={styles.label} x={l.x} y={l.y} opacity={f3(l.o)}>
            {hidden.labels[l.text]}
          </text>
        ) : null,
      )}

      {a.confetti.map((c, i) =>
        seen(c.o) ? <Capsule key={i} c={c} className={styles[`c${c.tone}`]} opacity={c.o} /> : null,
      )}

      {seen(a.bubble.o) ? (
        <g opacity={f3(a.bubble.o)} transform={`translate(${a.bubble.x} ${a.bubble.y})`}>
          <path className={styles.bubble} d={BUBBLE} />
          {[-18, 0, 18].map((x) => (
            <circle key={x} className={cls(styles.dot, live && styles.typing)} cx={x} cy={0} r={4.5} />
          ))}
        </g>
      ) : null}

      {a.thoughts.map((t, i) =>
        seen(t.o) ? (
          <circle key={i} className={styles.thought} cx={f1(t.x)} cy={f1(t.y)} r={t.r} opacity={f3(t.o)} />
        ) : null,
      )}
      {a.questions.map((q, i) =>
        seen(q.o) ? (
          <g key={i} opacity={f3(q.o)} transform={`translate(${f1(q.x)} ${f1(q.y)}) scale(1.5)`}>
            <path className={styles.question} d={QUESTION} />
            <circle className={styles.questionDot} cx={0} cy={8} r={2} />
          </g>
        ) : null,
      )}
      {a.birds.map((b, i) => (seen(b.o) ? <path key={i} className={styles.bird} d={bird(b)} opacity={f3(b.o)} /> : null))}

      {a.fireflies.map((f, i) =>
        seen(f.o) ? (
          <g key={i} opacity={f3(f.o)}>
            <circle
              className={live ? styles.flicker : undefined}
              fill={flyGlow}
              cx={f1(f.x)}
              cy={f1(f.y)}
              r={f1(f.r * 4)}
              style={live ? delay(-i * 0.7) : undefined}
            />
            <circle className={styles.firefly} cx={f1(f.x)} cy={f1(f.y)} r={f.r} />
          </g>
        ) : null,
      )}
      {seen(a.orb.o) ? (
        <g opacity={f3(a.orb.o)}>
          <circle fill={flyGlow} cx={a.orb.x} cy={a.orb.y} r={f1(a.orb.r * 4)} />
          <circle className={styles.firefly} cx={a.orb.x} cy={a.orb.y} r={f1(a.orb.r)} />
        </g>
      ) : null}

      {a.feelings.map((f, i) =>
        seen(f.o) ? (
          <circle
            key={i}
            className={f.warm ? styles.ember : styles.cool}
            cx={f1(f.x)}
            cy={f1(f.y)}
            r={f.r}
            opacity={f3(f.o)}
          />
        ) : null,
      )}
      {a.tears.map((t, i) => (seen(t.o) ? <path key={i} className={styles.tear} d={teardrop(t)} opacity={f3(t.o)} /> : null))}
      {seen(a.splash.o) ? (
        <ellipse
          className={styles.splash}
          cx={f1(a.splash.x)}
          cy={f1(a.splash.y)}
          rx={f1(a.splash.r)}
          ry={f1(a.splash.r * 0.3)}
          opacity={f3(a.splash.o)}
        />
      ) : null}

      {a.specks.map((s, i) =>
        seen(s.o) ? (
          <g key={i} opacity={f3(s.o)}>
            {s.warm < 0.998 ? (
              <circle className={styles.speck} cx={f1(s.x)} cy={f1(s.y)} r={s.r} opacity={f3(1 - s.warm)} />
            ) : null}
            {seen(s.warm) ? (
              <circle className={styles.spark} cx={f1(s.x)} cy={f1(s.y)} r={s.r} opacity={f3(s.warm)} />
            ) : null}
          </g>
        ) : null,
      )}
      {a.sparks.map((s, i) =>
        seen(s.o) ? <circle key={i} className={styles.spark} cx={f1(s.x)} cy={f1(s.y)} r={s.r} opacity={f3(s.o)} /> : null,
      )}

      {seen(a.rain) ? (
        <g opacity={f3(a.rain)} transform={`translate(${f1(a.cloud.x)} ${f1(rainTop)})`}>
          {DROPS.map((d, i) => (
            <line
              key={i}
              className={cls(styles.rain, live && styles.fall)}
              x1={d.x}
              y1={live ? 0 : f1(d.y)}
              x2={d.x - 2}
              y2={live ? 12 : f1(d.y + 12)}
              style={live ? delay(d.delay) : undefined}
            />
          ))}
        </g>
      ) : null}
      {seen(a.cloud.o) ? (
        <g opacity={f3(a.cloud.o)}>
          <g
            className={styles.cloud}
            transform={`translate(${f1(a.cloud.x)} ${f1(a.cloud.y)}) scale(${a.cloud.s}) translate(${-CLOUD.cx} ${-CLOUD.cy})`}
          >
            {CIRCLES.map((c) => (
              <circle key={c.cx} cx={c.cx} cy={c.cy} r={c.r} />
            ))}
            <rect x={BASE.x} y={BASE.y} width={BASE.w} height={BASE.h} rx={BASE.r} />
          </g>
        </g>
      ) : null}
    </svg>
  );
});
