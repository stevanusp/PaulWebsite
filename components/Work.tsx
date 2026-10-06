"use client";

import { useEffect, useRef, useState } from "react";
import { work } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import CloudScene from "./work/CloudScene";
import styles from "./work/Work.module.css";

// The work, told beside one picture: the Keystation's keys fall into a locked cloud, which stays
// (it falls again later, by the pads, if someone presses one). CSS decides
// the mode; script only follows it, so without it the tiles and two stills tell the same thing.
export default function Work() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [p, setP] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const list = listRef.current;
    if (!root || !stage || !list) return;
    let raf = 0;
    let last = -1;
    const wide = window.matchMedia("(min-width: 900px)");

    const live = () => getComputedStyle(root).getPropertyValue("--work-mode").trim() === "live";

    const update = () => {
      raf = 0;
      if (!live()) return;
      const items = Array.from(list.children) as HTMLElement[];
      const a = items[0].getBoundingClientRect();
      const b = items[items.length - 1].getBoundingClientRect();
      // Read against the middle of the screen, or on phones the middle of what the stage leaves.
      const anchor = wide.matches ? window.innerHeight / 2 : (stage.getBoundingClientRect().bottom + window.innerHeight) / 2;
      const c0 = a.top + a.height / 2;
      const c1 = b.top + b.height / 2;
      const next = Math.min(1, Math.max(0, (anchor - c0) / Math.max(1, c1 - c0)));
      setActive(Math.round(next * (items.length - 1)));
      if (Math.abs(next - last) < 0.0008 && next !== 0 && next !== 1) return;
      last = next;
      setP(next);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Section id="work" title={work.title} intro={work.intro}>
      <div ref={rootRef} className={styles.scrolly}>
        <div ref={stageRef} className={styles.stage}>
          <p className="visually-hidden">{work.description}</p>
          <div className={styles.live}>
            <CloudScene p={p} />
          </div>
          <div className={styles.stills}>
            <CloudScene p={0} />
            <CloudScene p={1} />
          </div>
        </div>
        <ul ref={listRef} className={styles.items}>
          {work.rows.map((row, i) => (
            <li key={row.title} className={`tile ${styles.item}`} data-active={i === active ? "true" : "false"}>
              <div className={s.tileInner}>
                <h3 className={s.tileTitle}>{row.title}</h3>
                <p className={s.tileText}>{row.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
