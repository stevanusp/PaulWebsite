"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SongPlayer.module.css";

type Props = {
  title: string;
  note: string;
  src: string;
  seconds: number;
  play: string;
  pause: string;
  seek: string;
};

const clock = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

// A classic player: one round button, a title, and a rounded progress bar you can drag.
export default function SongPlayer({ title, note, src, seconds, play, pause, seek }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const [total, setTotal] = useState(seconds);

  useEffect(() => {
    const audio = audioRef.current;
    const range = rangeRef.current;
    if (!audio || !range) return;
    let raf = 0;
    let shown = -1;

    // The fill is a custom property set through the CSSOM, which the CSP allows.
    const paint = () => {
      const d = audio.duration || seconds;
      range.style.setProperty("--p", `${Math.min(100, (audio.currentTime / d) * 100).toFixed(2)}%`);
      range.value = String(audio.currentTime);
      const whole = Math.floor(audio.currentTime);
      if (whole !== shown) {
        shown = whole;
        setNow(audio.currentTime);
      }
    };
    const loop = () => {
      paint();
      raf = requestAnimationFrame(loop);
    };
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
      paint();
    };
    const onEnded = () => {
      audio.currentTime = 0;
      onPause();
    };
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setTotal(audio.duration);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("seeked", paint);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      cancelAnimationFrame(raf);
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("seeked", paint);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, [seconds]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    // play() can be refused or interrupted (autoplay rules, a pause right after); stay in sync.
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    e.target.style.setProperty("--p", `${((t / (audio.duration || total)) * 100).toFixed(2)}%`);
    setNow(t);
  };

  return (
    <div className={`tile ${styles.player}`} data-playing={playing ? "true" : "false"}>
      <audio ref={audioRef} src={src} preload="none" />

      <div className={styles.top}>
        <button
          type="button"
          className={styles.button}
          onClick={toggle}
          aria-label={`${playing ? pause : play}: ${title}`}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
            {playing ? (
              <path d="M5.5 4.2c0-.7.5-1.2 1.2-1.2h.9c.7 0 1.2.5 1.2 1.2v11.6c0 .7-.5 1.2-1.2 1.2h-.9c-.7 0-1.2-.5-1.2-1.2zM11.2 4.2c0-.7.5-1.2 1.2-1.2h.9c.7 0 1.2.5 1.2 1.2v11.6c0 .7-.5 1.2-1.2 1.2h-.9c-.7 0-1.2-.5-1.2-1.2z" fill="currentColor" />
            ) : (
              <path d="M6 3.9v12.2c0 .9 1 1.4 1.7 1l9.4-6.1c.7-.4.7-1.4 0-1.8L7.7 2.9C7 2.5 6 3 6 3.9z" fill="currentColor" />
            )}
          </svg>
        </button>
        <div className={styles.meta}>
          <p className={styles.title}>{title}</p>
          <p className={styles.note}>{note}</p>
        </div>
      </div>

      <div className={styles.progress}>
        <input
          ref={rangeRef}
          className={styles.range}
          type="range"
          min={0}
          max={total}
          step={0.1}
          defaultValue={0}
          onChange={onSeek}
          aria-label={seek}
          aria-valuetext={`${clock(now)} of ${clock(total)}`}
        />
        <div className={`fine ${styles.times}`} aria-hidden="true">
          <span>{clock(now)}</span>
          <span>{clock(total)}</span>
        </div>
      </div>
    </div>
  );
}
