"use client";

import { useEffect, useRef, useState } from "react";
import { SONG_PEAKS } from "@/content/song";
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

const BAR_W = 3;
const GAP = 2;
const VIEW_W = SONG_PEAKS.length * (BAR_W + GAP) - GAP;
const VIEW_H = 56;

const clock = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

// The waveform is drawn once on the server. Playback only moves one clip rectangle,
// so the bars that have played turn green without re-rendering anything.
const BARS = SONG_PEAKS.map((p, i) => {
  const h = Math.max(3, (p / 100) * VIEW_H);
  return <rect key={i} x={i * (BAR_W + GAP)} y={(VIEW_H - h) / 2} width={BAR_W} height={h} rx={1.5} />;
});

export default function SongPlayer({ title, note, src, seconds, play, pause, seek }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const [total, setTotal] = useState(seconds);

  useEffect(() => {
    const audio = audioRef.current;
    const clip = clipRef.current;
    if (!audio || !clip) return;
    let raf = 0;
    let shown = -1;

    const paint = () => {
      const d = audio.duration || seconds;
      const p = Math.min(1, audio.currentTime / d);
      clip.setAttribute("width", (p * VIEW_W).toFixed(1));
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

  const seekTo = (t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const d = audio.duration || total;
    audio.currentTime = Math.min(Math.max(0, t), d - 0.05);
    setNow(audio.currentTime);
    clipRef.current?.setAttribute("width", ((audio.currentTime / d) * VIEW_W).toFixed(1));
  };

  // Click or drag along the waveform to move through the song.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = waveRef.current;
    if (!el) return;
    const at = (clientX: number) => {
      const r = el.getBoundingClientRect();
      seekTo(((clientX - r.left) / r.width) * total);
    };
    el.setPointerCapture(e.pointerId);
    at(e.clientX);
    const move = (ev: PointerEvent) => at(ev.clientX);
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      seekTo(audio.currentTime + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      seekTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      seekTo(total);
    }
  };

  return (
    <div className={styles.player} data-playing={playing ? "true" : "false"}>
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
              <path d="M5.5 3.5h3v13h-3zM11.5 3.5h3v13h-3z" fill="currentColor" />
            ) : (
              <path d="M6 3.2v13.6c0 .6.7 1 1.2.7l10.3-6.8c.5-.3.5-1.1 0-1.4L7.2 2.5C6.7 2.2 6 2.6 6 3.2z" fill="currentColor" />
            )}
          </svg>
        </button>
        <div className={styles.meta}>
          <p className={styles.title}>{title}</p>
          <p className={styles.note}>{note}</p>
        </div>
        <p className={`mono ${styles.time}`} aria-hidden="true">
          {clock(now)} / {clock(total)}
        </p>
      </div>

      <div
        ref={waveRef}
        className={styles.wave}
        role="slider"
        tabIndex={0}
        aria-label={seek}
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(now)}
        aria-valuetext={`${clock(now)} of ${clock(total)}`}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      >
        <svg
          className={styles.svg}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id="song-played">
              <rect ref={clipRef} x="0" y="0" width="0" height={VIEW_H} />
            </clipPath>
          </defs>
          <g className={styles.rest}>{BARS}</g>
          <g className={styles.played} clipPath="url(#song-played)">
            {BARS}
          </g>
        </svg>
      </div>
    </div>
  );
}
