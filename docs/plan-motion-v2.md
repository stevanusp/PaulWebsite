# Plan: Motion v2 (three additions)

Status: plan only, nothing built yet. Written 30 Sep 2026.
House rules: no em dash anywhere. Local build first, push only when Paulus says so.

## 0. Goal and guardrails

Use the signal line (the site's one visual idea) in more places, so the page feels alive
without adding a new visual language. Amber stays reserved for things that don't belong.

Guardrails that apply to every feature:

1. Reduced motion, no JS and print show a finished still frame. Motion is an enhancement.
2. No new mandatory scrolling. No new pinned sections.
3. Nothing runs off screen. Each animation starts only when visible and stops when done or hidden.
4. CSP stays strict: no inline `style=""`, set values with `setAttribute` or CSSOM in effects.
5. Copy lives in `content/site.ts`. Signal math lives in `lib/`.
6. Budget: Lighthouse mobile stays at 93 or better, desktop 100, hero idle CPU no higher than today
   (about 133 ms of task time per second on desktop), zero console errors, zero CSP violations.

Order of work (each one is its own commit on a branch `motion-v2`, no push until asked):
F3 (touchable hero), then F2 (wrong note), then F1 (field note scenes).

---

## F3. Touchable hero

What the visitor sees: tap or click the line and an anomaly bursts out at that exact spot.
The detection box locks onto it and the label says "anomaly", exactly like the automatic ones.
After it fades, the automatic loop carries on.

Behavior
- Trigger: `pointerdown` on the signal area, accepted on `pointerup` if the pointer moved less
  than 8 px and less than 350 ms passed. This keeps vertical scrolling on phones untouched
  (`touch-action: pan-y` on the wrap).
- Ignored while paused, under reduced motion, and on the pause button itself.
- Cooldown: 1.2 s after the previous burst starts, so it cannot be spammed into noise.
- The burst uses the same envelope, box and label as the automatic one, at `cx = pointer x`.
- Hint: a small mono label at the right of the signal, "poke the line", visible until the first
  interaction, then removed for the session (in-memory only, no storage).
- Keyboard: not needed, the effect is purely decorative and the automatic bursts still run.

Implementation
- `components/HeroSignal.tsx`: add `manual: { cx: number; t0: number } | null` and an `epoch`.
  In `frame(t)`, if `manual` is set use `tau = t - manual.t0` and `cx = manual.cx`; when
  `tau > BURST.flagEnd` clear it and set `epoch = t - BURST.firstAt` so the automatic schedule
  restarts cleanly after the poke.
- Pointer x is converted with `clientX - wrap.getBoundingClientRect().left`, clamped to the
  sampled width so the box stays inside the viewport.
- `HeroSignal.module.css`: `touch-action: pan-y`, cursor style on fine pointers only, hint label.
- `content/site.ts`: `hero.signalHint`.

Cost: zero extra frames, it reuses the running loop.

Acceptance
- Poke at the far left, the middle and the far right: box never clips outside the viewport.
- Scrolling by dragging on the line on a phone does not trigger a burst.
- Pause, reduced motion and tab-hidden all disable it.
- Idle CPU unchanged.

---

## F2. Wrong note in By ear

What the visitor sees: a fifth, smaller pad, "F#" with a mono "?" underneath. Pressing it plays
a note that clashes with whatever chord was last played, and the scope reacts like the hero does:
the trace turns amber, a box locks onto it and the screen label says "doesn't belong".
A second later it settles back to normal.

Behavior
- The detection is real, not scripted: `lib/epiano.ts` exports `inKey(midi)` against the C major
  pitch classes {0, 2, 4, 5, 7, 9, 11}. F# (MIDI 66) is not in the set, so it is flagged.
- Audio: the note is added on top of the currently ringing chord (so the clash is audible), at
  velocity 0.9. If nothing is ringing it plays alone.
- Visual: `data-flag="true"` on the scope for about 1.6 s. The trace stroke uses the stage alert
  color, four corner marks animate in (reuse `cornersPath` from `lib/signal.ts`), and
  `ear.wrongLabel` replaces the idle label.
- Caption line under the instrument (the existing `aria-live` region) says
  "That one doesn't belong." for screen readers and everyone else.
- The existing "found it" chord sequence (I, V, vi, IV) keeps working. The wrong note does not
  enter the history.

Layout
- Desktop: pads grid becomes `1fr 1fr 1fr 1fr 0.55fr`, the fifth pad visually quieter (no fill,
  dashed hairline).
- Phone: the fifth pad sits on its own row, full width, same height as the others.

Implementation
- `lib/epiano.ts`: `play(notes, { keep?: boolean })`. With `keep` the held voices are not damped.
  Export `inKey`.
- `components/Instrument.tsx`: fifth button, `playWrong()`, timer for the flag, corners path
  in the scope svg.
- `components/Instrument.module.css`: pad variant, scope flag state, corner stroke.
- `content/site.ts`: `ear.wrongName`, `ear.wrongDegree`, `ear.wrongLabel`, `ear.wrongLine`.

Cost: no new loops. The scope's existing analyser loop keeps running as it does today.

Acceptance
- Works by tap, click, keyboard (key `5`, Enter and Space on the button).
- Silent switch on iPhone still plays (already handled by `audioSession`).
- Reduced motion: flag appears without the transition, no animated corners.
- Screen reader announces the caption line once per press.

---

## F1. Field note scenes

What the visitor sees: under each field note, a small scene of the same signal line that plays
once when it scrolls into view and then stays on its final frame.

Scene A, "A cloud edge for 83+ branches"
- A steady line across the top. Below it a grid of 83 dots, all hollow.
- Over about 2.4 s the dots fill in, in a wave from left to right, while the line above never
  breaks. A mono counter counts to 83 and ends on "83+".
- Message: everything moved, nothing dropped.

Scene B, "The ransomware that wasn't"
- Calm line. An amber burst grows large, the box locks on and the label reads "ransomware?".
- Then the burst shrinks to a small ripple, the box tightens, and the label changes to
  "a script renaming files". The line is calm again.
- Message: careful triage turns a scary alert into a small one.

Scene C, "Making process legible"
- A tangled, high-frequency line settles into three straight swimlanes with small step boxes
  and arrows drawn in with a stroke-dash reveal.
- Message: a decision path anyone can follow.

Layout
- Inside each row's text column, below the body text, at the reading measure. Aspect about
  3.2 : 1. Full column width on phones.
- Monochrome ink strokes on the light page. Amber only for the burst in scene B.

Implementation
- `components/scenes/`: `SceneFrame.tsx` (shared wrapper, svg, `aria-hidden`, intersection
  observer at threshold 0.5), `useSceneClock.ts` (a rAF that runs only during the 2.4 s and
  reports progress 0 to 1), `Branches.tsx`, `Triage.tsx`, `Swimlane.tsx`.
- Server render: each scene renders its final frame, so no-JS, print and reduced motion get the
  finished picture. On hydration, if motion is allowed, the effect rewinds to frame 0 (scene is
  below the fold, so no visible flash) and plays when it enters the viewport.
- Math reuses `lib/signal.ts` (`normal`, `burst`, `limit`, `cornersPath`).
- `content/site.ts`: scene labels (`ransomware?`, `a script renaming files`, counter text),
  and an optional `caption` per scene for assistive tech (the scenes stay `aria-hidden`; the
  note text already tells the story).
- `components/FieldNotes.tsx`: render the scene under each `rowText`, keyed by item.

Cost: each scene runs a rAF for about 2.4 s, once. Idle cost afterwards is zero.

Acceptance
- Scrolling fast past all three does not start them off screen or at the same time.
- Reduced motion, no JS and print show the final frames correctly, on one A4 page count no
  worse than today (4 pages).
- No layout shift (fixed aspect ratio box reserved in CSS).

---

## Checks after each feature

1. `npx tsc --noEmit`, `npx eslint .`, `npm run build` (the build fails on inline styles).
2. Playwright at 1440 and 390, light and dark, reduced motion on and off, print.
3. Lighthouse mobile and desktop against `npm run preview`.
4. Profile idle CPU on the hero and while scrolling the field notes at 4x CPU throttle.
5. Grep for the em dash in every authored file.

## Deferred ideas (not in this round)

- Path as a timeline on the signal line.
- Logo dot blinking amber once when an anomaly appears.
- Contact line calming on email hover.

## Defaults I chose (change any of these)

- Hint text: "poke the line".
- Wrong note is F# over the last chord, not a separate scale demo.
- Scenes play once and do not replay when re-entering the viewport.
- Nothing is pushed until you say so.
