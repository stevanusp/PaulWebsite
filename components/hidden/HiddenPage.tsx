"use client";

import { useEffect, useState, type RefObject } from "react";
import { hidden } from "@/content/hidden";
import { clamp } from "@/lib/motion";
import PostScene from "./PostScene";
import styles from "./HiddenPage.module.css";

type Props = { scroller: RefObject<HTMLDivElement | null> };

type View = { part: number; within: number };

// The page behind the page: one long post, told with the same scroll habit as the rest of the
// site. A picture holds still beside the text and follows whichever part is in the middle of the
// screen. It scrolls inside its own layer (see Curtain.tsx), so it reads progress from there.
export default function HiddenPage({ scroller }: Props) {
  const [view, setView] = useState<View>({ part: 0, within: 0 });

  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    const parts = Array.from(box.querySelectorAll<HTMLElement>("[data-part]"));
    let raf = 0;

    const update = () => {
      raf = 0;
      const top = box.getBoundingClientRect().top;
      const middle = box.clientHeight / 2;
      let part = 0;
      let within = 0;
      parts.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const start = r.top - top;
        if (start <= middle) {
          part = i;
          within = clamp((middle - start) / Math.max(1, r.height));
        }
      });
      setView((v) => (v.part === part && Math.abs(v.within - within) < 0.002 ? v : { part, within }));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    onScroll();
    box.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      box.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scroller]);

  return (
    <article className={styles.post} aria-labelledby="hidden-title">
      <header className={styles.cover}>
        <h2 id="hidden-title" className={styles.title}>
          {hidden.title}
        </h2>
        <p className={styles.intro}>{hidden.intro}</p>
      </header>

      <div className={styles.body}>
        <div className={styles.stage}>
          <PostScene part={view.part} within={view.within} count={hidden.parts.length} />
        </div>
        <div className={styles.text}>
          {hidden.parts.map((part, i) => (
            <section key={part.title} className={styles.part} data-part={i}>
              <h3 className={styles.partTitle}>{part.title}</h3>
              {part.paragraphs.map((p, j) => (
                <p key={j} className={styles.paragraph}>
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className={styles.signoff}>{hidden.signoff}</p>
        </div>
      </div>
    </article>
  );
}
