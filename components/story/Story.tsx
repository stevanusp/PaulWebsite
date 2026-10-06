"use client";

import { useEffect, useRef, useState } from "react";
import { method } from "@/content/site";
import { BAR_S, BEAT_S, LOG, LOOP_S, NOTES, SPAN_W, STEP_S, VOICINGS, stepAt } from "./scene";
import StoryScene from "./StoryScene";
import styles from "./Story.module.css";

// A new log line every so often, sliding in over a short ease.
const FEED_S = 1.6;
const FEED_IN_S = 0.4;
const FEED_N = method.scene.feed.length;
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const mark = (el: Element, name: string, value: boolean) => {
  if (value) el.setAttribute(name, "");
  else el.removeAttribute(name);
};

// "How I listen", told as one scroll: a security console that slowly becomes the song in Logic,
// then the keyboard it is played on. CSS decides the mode (pinned and scrubbed, or a plain list
// with two stills); script only follows it, so no-JS, reduced motion and print get the whole story.
export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const pRef = useRef(0);
  const [p, setP] = useState(0);

  // Scroll drives the story.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    let top = 0;
    let span = 1;
    let last = -1;

    const live = () => getComputedStyle(section).getPropertyValue("--story-mode").trim() === "live";

    const measure = () => {
      top = section.getBoundingClientRect().top + window.scrollY;
      span = Math.max(1, section.offsetHeight - window.innerHeight);
    };

    const update = () => {
      raf = 0;
      if (!live()) return;
      const next = Math.min(1, Math.max(0, (window.scrollY - top) / span));
      pRef.current = next;
      // Skip changes too small to see.
      if (Math.abs(next - last) < 0.0006 && next !== 0 && next !== 1) return;
      last = next;
      setP(next);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    onScroll();
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Time drives what keeps moving while you stay: the event feed, then the song at 116 bpm in 3/4,
  // with the playhead, the display, the chord track, the meters and the keys in step. It writes to
  // the DOM directly, so nothing re-renders, and it only runs while the story is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    const live = liveRef.current;
    if (!section || !live) return;

    const all = (sel: string) => Array.from(live.querySelectorAll<SVGElement>(sel));
    const playheads = all('[data-clock="playhead"]');
    const barText = live.querySelector('[data-clock="bar"]')?.firstChild ?? null;
    const beatText = live.querySelector('[data-clock="beat"]')?.firstChild ?? null;
    const chords = all("[data-chord]");
    const keys = all("[data-key]");
    const meters = all("[data-meter]");

    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    let playFrom = -1;
    let lastBar = -1;
    let lastBeat = -1;
    let lastStep = -1;

    const isLive = () => getComputedStyle(section).getPropertyValue("--story-mode").trim() === "live";

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000;

      // The log: rows can mount and unmount with scroll, so look the group up each frame.
      const feed = live.querySelector<SVGElement>('[data-clock="feed"]');
      if (feed) {
        const k = t / FEED_S;
        const i = Math.floor(k);
        const rows = ((i % FEED_N) + easeOut(((k - i) * FEED_S) / FEED_IN_S)) * LOG.ROW;
        feed.style.transform = `translateY(${rows.toFixed(2)}px)`;
      }

      // Playback starts from the top of the loop once the window has become the song.
      if (pRef.current < 0.55) playFrom = -1;
      else if (playFrom < 0) {
        playFrom = now;
        lastBar = lastBeat = lastStep = -1;
      }
      const playing = playFrom >= 0;
      const pm = playing ? ((now - playFrom) / 1000) % LOOP_S : 0;
      const x = (pm / LOOP_S) * SPAN_W;
      for (const el of playheads) el.style.transform = `translateX(${x.toFixed(2)}px)`;

      const bar = Math.floor(pm / BAR_S);
      const beat = Math.floor((pm - bar * BAR_S) / BEAT_S);
      const step = Math.floor(pm / STEP_S);
      if (bar !== lastBar) {
        lastBar = bar;
        if (barText) barText.nodeValue = String(bar + 1);
        chords.forEach((el, i) => mark(el, "data-now", playing && i === bar));
        const chord = new Set(VOICINGS[bar]);
        keys.forEach((el) => mark(el, "data-down", playing && chord.has(Number(el.dataset.key))));
      }
      if (beat !== lastBeat) {
        lastBeat = beat;
        if (beatText) beatText.nodeValue = String(beat + 1);
      }
      if (step !== lastStep) {
        lastStep = step;
        for (const el of all("[data-note]")) {
          const n = NOTES[Number(el.dataset.note)];
          mark(el, "data-on", playing && n.start <= step && step < n.start + n.len);
        }
      }

      const sinceStep = pm - step * STEP_S;
      const sinceBar = pm - bar * BAR_S;
      const level = playing
        ? [
            0.3 + 0.62 * Math.exp(-sinceStep * 9),
            0.25 + 0.65 * Math.exp(-sinceBar * 1.8),
            bar >= 1 ? 0.52 + 0.1 * Math.sin(t * 5.3) : 0.03,
          ]
        : [0, 0, 0];
      for (const el of meters) el.style.transform = `scaleY(${level[Number(el.dataset.meter)].toFixed(3)})`;
    };

    const start = () => {
      if (raf || !visible || document.hidden || !isLive()) return;
      section.setAttribute("data-run", "");
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      section.removeAttribute("data-run");
    };
    const sync = () => {
      if (visible && !document.hidden && isLive()) start();
      else stop();
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      sync();
    });
    io.observe(section);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const step = stepAt(p);

  return (
    <section ref={sectionRef} id="method" className={styles.story} aria-labelledby="method-title" data-step={step}>
      <div className={styles.sticky}>
        <div className={`container ${styles.layout}`}>
          <div className={styles.text}>
            <h2 id="method-title" className={styles.title}>
              {method.title}
            </h2>
            <ol className={styles.steps}>
              {method.steps.map((s, i) => (
                <li key={s.title} className={styles.step}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepBody}>{s.body}</p>
                  {i === method.steps.length - 1 ? (
                    <a className={`pill pill-quiet ${styles.listen}`} href="#ear">
                      {method.listen}
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.stage}>
            <p className="visually-hidden">{method.description}</p>
            <div ref={liveRef} className={styles.live}>
              <StoryScene p={p} id="live" />
            </div>
            <div className={styles.stills}>
              <StoryScene p={0.42} id="still-a" still />
              <StoryScene p={1} id="still-b" still />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
