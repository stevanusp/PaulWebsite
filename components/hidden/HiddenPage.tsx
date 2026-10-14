"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  memo,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from "react";
import { hidden } from "@/content/hidden";
import { LIVE_QUERY, clamp } from "@/lib/motion";
import { art, type Art } from "./art";
import StoryArt from "./StoryArt";
import { BEATS, SCREENS, T, type Timed } from "./timeline";
import styles from "./HiddenPage.module.css";

type Props = { scroller: RefObject<HTMLDivElement | null> };

const NARROW_QUERY = "(max-width: 699px)";
const watch = (query: string) => (onChange: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
};
const watchLive = watch(LIVE_QUERY);
const watchNarrow = watch(NARROW_QUERY);
const isLive = () => window.matchMedia(LIVE_QUERY).matches;
const isNarrow = () => window.matchMedia(NARROW_QUERY).matches;
const no = () => false;

const cls = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/** How long a line takes to come in or to go: a seventh of a screen of scrolling. */
const FADE = 0.14 / SCREENS;
/** How far it travels while it does, in px. */
const RISE = 14;
const LAST = BEATS.length - 1;

/** For the calm version: after these moments, the drawing as it stands there. */
const STILL_AT: Record<string, number> = Object.fromEntries(
  (
    [
      ["glad", 0.5],
      ["found", 0.95],
      ["parts", 0.8],
      ["lost", 0.5],
      ["times", 0.9],
      ["stop", 0.5],
      ["yourself", 0.95],
      ["plans", 0.97],
      ["love", 0.6],
      ["end", 0.92],
    ] as const
  ) as readonly (readonly [string, number])[],
);
// Worked out the first time the calm version needs them, not when this file loads.
let stills: Partial<Record<string, Art>> | undefined;
const stillOf = (id: string): Art | undefined => {
  stills ??= Object.fromEntries(Object.entries(STILL_AT).map(([k, f]) => [k, art(T(k, f))]));
  return stills[id];
};

// The page behind the page (Curtain.tsx): one long post, told as a story. The drawing and the words
// hold still while the reader scrolls, and scrolling moves the story along, one line at a time.
// With reduced motion, it is the same words in one column, with stills of the drawing.
export default function HiddenPage({ scroller }: Props) {
  const live = useSyncExternalStore(watchLive, isLive, no);
  const narrow = useSyncExternalStore(watchNarrow, isNarrow, no);
  return live ? <Live scroller={scroller} narrow={narrow} /> : <Calm narrow={narrow} />;
}

function Live({ scroller, narrow }: Props & { narrow: boolean }) {
  const trackRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  // The post scrolls inside its own layer, so progress is read from there. The track is as many
  // screens tall as the story needs, measured in that layer's own height.
  useEffect(() => {
    const box = scroller.current;
    const track = trackRef.current;
    if (!box || !track) return;
    let raf = 0;
    let last = -1;

    const update = () => {
      raf = 0;
      const next = clamp(box.scrollTop / Math.max(1, track.offsetHeight - box.clientHeight));
      // Skip changes too small to see, about a pixel.
      if (Math.abs(next - last) < 0.00004 && next !== 0 && next !== 1) return;
      last = next;
      setP(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const size = () => {
      track.style.setProperty("--h", `${box.clientHeight}px`);
      onScroll();
    };

    const ro = new ResizeObserver(size);
    ro.observe(box);
    size();
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      box.removeEventListener("scroll", onScroll);
    };
  }, [scroller]);

  const frame = art(p);

  return (
    <article ref={trackRef} className={cls(styles.post, styles.track)} style={{ "--screens": SCREENS } as CSSProperties}>
      <div className={styles.stage}>
        <div className={styles.night} style={{ opacity: frame.night }} />
        <div className={styles.art}>
          <p className="visually-hidden">{hidden.description}</p>
          <StoryArt a={frame} uid="hp-live" narrow={narrow} />
        </div>
        <div className={styles.words}>
          {BEATS.map((b, i) => (
            <Beat
              key={b.id}
              b={b}
              leave={leaving(b, i, p)}
              enter={b.lines.map((_, j) => entering(b, i, j, p)).join(",")}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

/** How far a line has come in, 0 to 1: the same number every frame until it is within reach. */
const entering = (b: Timed, i: number, j: number, p: number) =>
  i === 0 && j === 0 ? 1 : clamp((p - (b.a + ((b.b - b.a) * j) / b.lines.length)) / FADE);
const leaving = (b: Timed, i: number, p: number) => (i === LAST ? 1 : clamp((b.b - p) / FADE));

/** One moment of the story: it rises in, holds, and lifts away as the next comes. A stanza's
    lines arrive one by one, and leave together. It only draws again when what it shows changes,
    so the many moments out of reach cost nothing as the reader scrolls. */
const Beat = memo(function Beat({ b, leave, enter }: { b: Timed; leave: number; enter: string }) {
  const enters = enter.split(",").map(Number);
  return (
    <p
      className={cls(styles.beat, b.size && styles[b.size])}
      style={leave < 1 ? { opacity: leave, transform: `translateY(${(-(1 - leave) * RISE).toFixed(1)}px)` } : undefined}
    >
      {b.lines.map((line, j) => {
        const e = enters[j] ?? 1;
        return (
          <span
            key={j}
            className={styles.line}
            style={e < 1 ? { opacity: e, transform: `translateY(${((1 - e) * RISE).toFixed(1)}px)` } : undefined}
          >
            {line}
          </span>
        );
      })}
    </p>
  );
});

function Calm({ narrow }: { narrow: boolean }) {
  return (
    <article className={cls(styles.post, styles.calm)}>
      <p className="visually-hidden">{hidden.description}</p>
      {BEATS.map((b) => {
        const still = stillOf(b.id);
        return (
          <Fragment key={b.id}>
            <p className={cls(styles.beat, b.size && styles[b.size])}>
              {b.lines.map((line, j) => (
                <span key={j} className={styles.line}>
                  {line}
                </span>
              ))}
            </p>
            {still ? (
              <div className={styles.still}>
                <StoryArt a={still} uid={`hp-still-${b.id}`} still narrow={narrow} />
              </div>
            ) : null}
          </Fragment>
        );
      })}
    </article>
  );
}
