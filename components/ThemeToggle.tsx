"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import styles from "./Nav.module.css";

type Theme = "light" | "dark";
const EVENT = "sp:theme";

const current = (): Theme => {
  const pinned = document.documentElement.getAttribute("data-theme");
  if (pinned === "light" || pinned === "dark") return pinned;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// The theme lives outside React (an attribute on <html> and the device setting); subscribe to both.
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener(EVENT, onChange);
  };
};

// Follows the device until someone picks a side; the pick is remembered on this device only.
export default function ThemeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  const theme = useSyncExternalStore<Theme | null>(subscribe, current, () => null);

  useLayoutEffect(() => {
    // Re-apply after React's dev remount clears the attribute the inline script set.
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        document.documentElement.setAttribute("data-theme", saved);
        window.dispatchEvent(new Event(EVENT));
      }
    } catch {
      /* storage blocked: follow the device */
    }
  }, []);

  const toggle = () => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* not saved, still switched */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const label = theme === "dark" ? toLight : toDark;

  return (
    <button type="button" className={styles.theme} onClick={toggle} aria-label={label} title={label}>
      {/* Both glyphs are drawn; CSS shows the one for the theme you would switch to. */}
      <svg className={styles.sun} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M10 1.8v2.1M10 16.1v2.1M18.2 10h-2.1M3.9 10H1.8M15.8 4.2l-1.5 1.5M5.7 14.3l-1.5 1.5M15.8 15.8l-1.5-1.5M5.7 5.7L4.2 4.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <svg className={styles.moon} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <path
          d="M16.6 12.6A7 7 0 0 1 7.4 3.4a7 7 0 1 0 9.2 9.2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
