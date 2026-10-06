"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/content/site";
import styles from "./Nav.module.css";

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState("");

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let ticking = false;

    const update = () => {
      ticking = false;

      // Read everything first, then write, so the browser lays out once per frame.
      const scrolled = window.scrollY > 8;

      const line = window.innerHeight * 0.4;
      let current = "";
      for (const item of nav) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) current = item.id;
      }

      header.dataset.scrolled = scrolled ? "true" : "false";
      setActive(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <header ref={headerRef} className={styles.header} data-scrolled="false">
        <nav className={`container ${styles.inner}`} aria-label="Primary">
          <a className={styles.brand} href="#top">
            <svg className={styles.mark} viewBox="0 0 28 16" width="28" height="16" aria-hidden="true" focusable="false">
              <path className={styles.markLine} d="M0 8H7l2.5-4 3 8 3-11 2.5 7H28" />
            </svg>
            {site.name}
          </a>
          <ul className={styles.links}>
            {nav.map((item) => (
              <li key={item.id} className={item.id === "contact" ? styles.keep : undefined}>
                <a
                  className={styles.link}
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
