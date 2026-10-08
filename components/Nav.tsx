"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site, ui } from "@/content/site";
import ThemeToggle from "./ThemeToggle";
import styles from "./Nav.module.css";

const sections = nav.filter((item) => item.id !== "contact");
const contactLink = nav.find((item) => item.id === "contact");

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
        {ui.skip}
      </a>
      <header ref={headerRef} className={styles.header} data-scrolled="false">
        <nav className={styles.bar} aria-label="Primary">
          <a className={styles.brand} href="#top">
            {site.name}
          </a>
          <ul className={styles.links}>
            {sections.map((item) => (
              <li key={item.id}>
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
          <div className={styles.end}>
            <ThemeToggle toLight={ui.toLight} toDark={ui.toDark} />
            <a
              className={`pill pill-solid ${styles.contact}`}
              href="#contact"
              aria-current={active === "contact" ? "true" : undefined}
            >
              {contactLink?.label}
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}
