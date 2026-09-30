"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Contact.module.css";

type Props = { email: string; copy: string; copied: string };

export default function CopyEmail({ email, copy, copied }: Props) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.copy}
        onClick={onClick}
        data-done={done ? "true" : "false"}
        aria-label={`${copy} email address`}
      >
        <span className={styles.copyLabel} aria-hidden="true">
          {copy}
        </span>
        <span className={styles.copyDone} aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {copied}
        </span>
      </button>
      <span className="visually-hidden" aria-live="polite">
        {done ? `${copied}: ${email}` : ""}
      </span>
    </>
  );
}
