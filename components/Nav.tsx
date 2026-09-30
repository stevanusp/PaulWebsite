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
      header.dataset.scrolled = window.scrollY > 8 ? "true" : "false";

      // Switch to a dark material while the dark instrument stage sits under the bar.
      const probe = header.offsetHeight / 2;
      const stage = document.getElementById("method");
      let dark = false;
      if (stage) {
        const r = stage.getBoundingClientRect();
        dark = r.top <= probe && r.bottom >= probe;
      }
      header.dataset.tone = dark ? "dark" : "light";

      const line = window.innerHeight * 0.4;
      let current = "";
      for (const item of nav) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) current = item.id;
      }
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
      <header ref={headerRef} className={styles.header} data-scrolled="false" data-tone="light">
        <nav className={`container ${styles.inner}`} aria-label="Primary">
          <a className={styles.brand} href="#top">
            <span className={styles.mark} aria-hidden="true">
              SP<span className={styles.markDot}>.</span>
            </span>
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
