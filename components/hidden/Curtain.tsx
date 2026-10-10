"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { curtain } from "@/content/site";
import { LIVE_QUERY, clamp, ease } from "@/lib/motion";
import { pageScroll } from "@/lib/smooth";
import styles from "./Curtain.module.css";

// The page behind the page loads only once someone starts pushing past the end, so its text is
// never in the HTML and never indexed. Near the bottom its code is fetched ahead, to be ready.
const loadPage = () => import("./HiddenPage");
const HiddenPage = dynamic(loadPage, { ssr: false });
const preload = () => {
  void loadPage();
};

const SHADOW = 96; // px below the lifted page that its shadow needs
const HOLD = 280; // ms an effort is held after the last push, before it starts to let go
const RELAX = 0.45; // s, how quickly it lets go after that
const SETTLE = 300; // ms at an edge before pushing counts, so a fling's leftover momentum does not
const TOUCH = 2; // a finger's travel counts double against a wheel's
const OPEN_MS = 900;
const CLOSE_MS = 820;
const CALM_MS = 260; // with reduced motion, the change is a short fade instead
// Once open, the post holds still for a moment, and until the wheel has gone quiet (a trackpad's
// momentum outlasts the push), so its first line is seen before anything scrolls.
const STILL_MS = 600;
const QUIET_MS = 180;
const STILL_MAX_MS = 1800;

// How much pushing one pull takes, in wheel pixels, and under one screen to close.
const pullEffort = () => clamp(window.innerHeight * 0.6, 400, 700);
// Opening is pull by pull, like a feed: each pull lifts the sheet a little and shows a line, and
// letting go drops it again. A pull counts once it has gone this far (a nudge does not).
const PULL_MIN = 0.45;
const SHOWS_AT = 0.12; // effort at which the line of the pull appears
const COMMIT = 0.78; // the pull after the last line: letting go from here opens it
const FORGET_MS = 12000; // the count starts over after this long without a pull
const closeEffort = () => clamp(window.innerHeight * 0.8, 520, 800);
// How far the page gives while it is being pushed, before it lets go.
const give = () => clamp(window.innerHeight * 0.18, 90, 180);

type Phase = "closed" | "lifting" | "open" | "lowering";

// The whole page is a sheet over a second page. Nothing says so. Someone who keeps scrolling at
// the very end feels the sheet give a little, and lets go of it if they stop; whoever keeps
// pushing lifts it off, and the post underneath is theirs to read. Pushing up at the top of the
// post (or Escape) lays the sheet back down, exactly where it was.
export default function Curtain({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const underRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const [armed, setArmed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const page = pageRef.current;
    const under = underRef.current;
    const scroller = scrollerRef.current;
    const inner = innerRef.current;
    if (!page || !under || !scroller || !inner) return;
    const root = document.documentElement;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smooth = window.matchMedia(LIVE_QUERY);

    let phase: Phase = "closed";
    let stage = 0; // pulls so far, each one showing its line (0 to the number of lines)
    let peak = 0; // the furthest this pull went
    let startStage = 0; // the count when this pull began: only a pull that begins after the last line opens it
    let lastPull = 0;
    let effort = 0; // toward opening while closed, toward closing while open; 0 to 1
    let last = 0; // when the last push came
    let edgeSince = 0; // when the current edge was reached: the page's bottom, or the post's top
    let y = 0; // the page's offset in px: 0 covers, negative lifts
    let anim = { from: 0, to: 0, start: 0, dur: 1 };
    let raf = 0;
    let prev = 0;
    let maxScroll = 0;
    let fetched = false;
    let mounted = false;
    let lifted = false;
    let post: Lenis | null = null;
    let openedAt = 0;
    let holding = 0; // the timer that ends the hold

    const release = () => {
      clearTimeout(holding);
      holding = 0;
      post?.start();
      scroller.style.overflowY = "";
    };
    const hold = (now: number) => {
      clearTimeout(holding);
      const wait = Math.min(Math.max(openedAt + STILL_MS - now, QUIET_MS), openedAt + STILL_MAX_MS - now);
      holding = window.setTimeout(release, Math.max(0, wait));
    };

    const measure = () => {
      maxScroll = root.scrollHeight - window.innerHeight;
    };
    const atEdge = () =>
      phase === "closed" ? window.scrollY >= maxScroll - 2 : phase === "open" ? scroller.scrollTop <= 1 : false;
    const track = () => {
      if (!atEdge()) edgeSince = 0;
      else if (!edgeSince) edgeSince = performance.now();
    };

    let shownHint = -1;
    const paint = () => {
      // Until the sheet is let go of, the room underneath shows only a line of encouragement, not the post.
      scroller.style.visibility = phase === "closed" ? "hidden" : "";
      const hint = hintRef.current;
      if (hint) {
        const at = phase === "closed" && effort >= SHOWS_AT ? Math.min(startStage, curtain.hints.length - 1) : -1;
        if (at >= 0 && at !== shownHint) hint.textContent = curtain.hints[at] ?? "";
        if (at >= 0) shownHint = at;
        hint.style.opacity = at >= 0 ? "1" : "0";
      }
      const full = window.innerHeight + SHADOW;
      if (calm.matches) {
        // No travel with reduced motion: the page fades as far as it would have moved.
        page.style.transform = "";
        page.style.opacity = y < 0 ? String(clamp(1 + y / full)) : "";
      } else {
        page.style.opacity = "";
        page.style.transform = y < 0 ? `translate3d(0, ${y.toFixed(2)}px, 0)` : "";
      }
      page.style.visibility = y <= -full + 0.5 ? "hidden" : "";
      const nowLifted = y < -0.5 || phase !== "closed";
      if (nowLifted !== lifted) {
        lifted = nowLifted;
        page.toggleAttribute("data-lifted", lifted);
        under.style.visibility = lifted ? "visible" : "";
      }
    };

    const begin = (next: "lifting" | "lowering", now: number) => {
      phase = next;
      effort = 0;
      const to = next === "lifting" ? -(window.innerHeight + SHADOW) : 0;
      anim = { from: y, to, start: now, dur: calm.matches ? CALM_MS : next === "lifting" ? OPEN_MS : CLOSE_MS };
      if (next === "lowering") {
        // The post lets go of the scroll; the page takes it back once it has landed (closed()),
        // so a push that carries on past the threshold cannot scroll the page as it comes down.
        release();
        post?.destroy();
        post = null;
        setOpen(false);
      }
    };

    const opened = () => {
      phase = "open";
      y = -(window.innerHeight + SHADOW);
      // The page behind cannot move while the post is open; the post scrolls in its own layer.
      root.dataset.curtain = "open";
      pageScroll()?.stop();
      if (smooth.matches) {
        post = new Lenis({
          wrapper: scroller,
          content: inner,
          eventsTarget: scroller,
          autoRaf: true,
          lerp: 0.1,
          overscroll: false,
        });
      }
      openedAt = performance.now();
      if (post) post.stop();
      else scroller.style.overflowY = "hidden";
      hold(openedAt);
      setOpen(true);
      edgeSince = 0;
      track();
    };

    const closed = () => {
      phase = "closed";
      y = 0;
      scroller.scrollTop = 0;
      delete root.dataset.curtain;
      pageScroll()?.start();
      edgeSince = 0;
      track();
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (phase === "closed" || phase === "open") {
        if (effort >= 1) begin(phase === "closed" ? "lifting" : "lowering", now);
        else {
          if (phase === "closed" && startStage >= curtain.hints.length && effort >= COMMIT && now - last > HOLD) {
            begin("lifting", now);
          } else if (now - last > HOLD) {
            // Let go: a pull that went far enough counts, and the sheet drops back.
            if (phase === "closed" && peak > 0) {
              if (peak >= PULL_MIN && stage < curtain.hints.length) {
                stage++;
                lastPull = now;
              }
              peak = 0;
            }
            effort *= Math.exp(-dt / RELAX);
            if (effort < 0.002) effort = 0;
          }
          const d = give() * Math.pow(effort, 0.8);
          // Lifting shows what is below the bottom edge. Lowering brings the page's edge in from
          // the top, first past the room its shadow takes, so the very first push already shows.
          y = phase === "closed" ? -d : -window.innerHeight - SHADOW * (1 - clamp(effort * 12)) + d;
        }
      }
      if (phase === "lifting" || phase === "lowering") {
        const t = clamp((now - anim.start) / anim.dur);
        const k = phase === "lifting" ? 1 - Math.pow(1 - t, 4) : ease(t);
        y = anim.from + (anim.to - anim.from) * k;
        if (t >= 1) {
          if (phase === "lifting") opened();
          else closed();
        }
      }
      paint();
      if (phase === "lifting" || phase === "lowering" || effort > 0) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (raf) return;
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // A push toward the other page counts only at the edge, after a moment there; a push back the
    // other way always eases the effort off.
    const push = (amount: number) => {
      if (!amount || (phase !== "closed" && phase !== "open")) return;
      const now = performance.now();
      const fresh = now - last > HOLD; // the first push of a new pull
      if (amount > 0) {
        track();
        if (!edgeSince || now - edgeSince < SETTLE) return;
        last = now;
        if (phase === "closed" && !mounted) {
          mounted = true;
          preload();
          setArmed(true);
        }
      }
      if (phase === "closed" && effort === 0 && stage > 0 && now - lastPull > FORGET_MS) stage = 0;
      // Until every line has been shown, a pull stops just short of opening.
      if (phase === "closed" && fresh && amount > 0) startStage = stage;
      const cap = phase === "closed" && startStage < curtain.hints.length ? 0.95 : 1;
      effort = Math.min(cap, clamp(effort + amount / (phase === "closed" ? pullEffort() : closeEffort())));
      if (phase === "closed") peak = Math.max(peak, effort);
      kick();
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch to zoom
      const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? window.innerHeight : 1;
      const dy = clamp(e.deltaY * unit, -240, 240);
      if (holding && phase === "open" && dy > 0) hold(performance.now());
      if (phase === "closed") push(dy > 0 ? dy : effort > 0 ? dy * 2 : 0);
      else if (phase === "open") push(dy < 0 ? -dy : effort > 0 ? -dy * 2 : 0);
    };

    // Touch: a finger moving up at the bottom (or down at the post's top) is the push. Only a
    // touch that starts at an edge, or while the page is moving, needs to hold the page still,
    // so only then is a non-passive listener attached.
    let touchY = 0;
    let watching = false;
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const d = touchY - t.clientY; // > 0 when the finger moves up
      touchY = t.clientY;
      if (phase === "lifting" || phase === "lowering") {
        if (e.cancelable) e.preventDefault();
        return;
      }
      const toward = phase === "closed" ? d : -d;
      if (toward > 0 && atEdge()) {
        if (e.cancelable) e.preventDefault();
        push(toward * TOUCH);
      } else if (toward < 0 && effort > 0) {
        if (e.cancelable) e.preventDefault();
        push(toward * TOUCH * 2);
      }
    };
    const stopWatching = () => {
      last = 0; // a finger lifted counts as letting go right away
      if (!watching) return;
      watching = false;
      window.removeEventListener("touchmove", onTouchMove);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        stopWatching();
        return;
      }
      touchY = e.touches[0].clientY;
      track();
      if (!watching && (atEdge() || effort > 0 || phase === "lifting" || phase === "lowering")) {
        watching = true;
        window.addEventListener("touchmove", onTouchMove, { passive: false });
      }
    };

    // Keyboard: the same pushes from the keys that scroll, plus Escape to lay the page back down.
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && phase === "open") {
        begin("lowering", performance.now());
        kick();
        return;
      }
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === " " && el && /^(BUTTON|A|SUMMARY)$/.test(el.tagName)) return;
      const screen = window.innerHeight * 0.45;
      const down =
        e.key === "ArrowDown" ? 90 : e.key === "PageDown" || e.key === "End" || (e.key === " " && !e.shiftKey) ? screen : 0;
      const up = e.key === "ArrowUp" ? 90 : e.key === "PageUp" || e.key === "Home" || (e.key === " " && e.shiftKey) ? screen : 0;
      if (phase === "closed") push(down);
      else if (phase === "open") push(up);
    };

    const onScroll = () => {
      if (phase === "closed") track();
      if (!fetched && window.scrollY > maxScroll - window.innerHeight * 1.5) {
        fetched = true;
        preload();
      }
    };
    const onPostScroll = () => {
      if (phase === "open") track();
    };
    const onResize = () => {
      measure();
      if (phase === "open" && effort === 0) {
        y = -(window.innerHeight + SHADOW);
        paint();
      }
      onScroll();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(page);
    measure();
    onScroll();
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", stopWatching, { passive: true });
    window.addEventListener("touchcancel", stopWatching, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    scroller.addEventListener("scroll", onPostScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(holding);
      scroller.style.overflowY = "";
      ro.disconnect();
      stopWatching();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", stopWatching);
      window.removeEventListener("touchcancel", stopWatching);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      scroller.removeEventListener("scroll", onPostScroll);
      post?.destroy();
      if (phase !== "closed") pageScroll()?.start();
      delete root.dataset.curtain;
      page.style.transform = "";
      page.style.opacity = "";
      page.style.visibility = "";
      page.removeAttribute("data-lifted");
      under.style.visibility = "";
    };
  }, []);

  // Hand focus to the post once it is open, after React has made it reachable.
  useEffect(() => {
    if (open) scrollerRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <>
      <div ref={pageRef} className={styles.page} inert={open}>
        {children}
      </div>
      <div ref={underRef} className={styles.under} data-lenis-prevent="" inert={!open}>
        <div ref={scrollerRef} className={styles.scroller} tabIndex={-1}>
          <div ref={innerRef}>{armed ? <HiddenPage scroller={scrollerRef} /> : null}</div>
        </div>
        {armed ? <p ref={hintRef} className={styles.hint} aria-hidden="true" /> : null}
      </div>
    </>
  );
}
