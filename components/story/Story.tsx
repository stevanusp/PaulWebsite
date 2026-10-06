"use client";

import { useEffect, useRef, useState } from "react";
import { method } from "@/content/site";
import { stepAt } from "./scene";
import StoryScene from "./StoryScene";
import styles from "./Story.module.css";

// "How I listen", told as one scroll: a security console that slowly becomes a music project,
// then a keyboard. CSS decides the mode (pinned and scrubbed, or a plain list with two stills);
// script only follows it, so no-JS, reduced motion and print get the complete story.
export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

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
            <div className={styles.live}>
              <StoryScene p={p} id="live" />
            </div>
            <div className={styles.stills}>
              <StoryScene p={0.42} id="still-a" />
              <StoryScene p={1} id="still-b" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
