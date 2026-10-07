# PLAN: Stevanus Paulus, personal site (as built, v3)

Status: redesigned on 6 Oct 2026 on branch `redesign-v3`. This file is the as-built spec.
Earlier versions: `docs/plan-v1.md` (original plan), `docs/plan-v2.md` (light and dark, motion v2).
House rule: no em dash characters anywhere (copy, code, comments, commits).

## 1. Decisions from Paulus (6 Oct 2026)

1. Redesign because the old look felt generic. Direction: a dark control room.
2. Always dark. The light theme is gone; print keeps its own light styles.
3. Instrument chrome (graticules, readouts, scopes) only where something is interactive: hero, method stage, By ear.
4. The quieter sections get their character from type plus one connecting line, not from panels.
5. Mono for headlines, sans for reading text. Open-source fonts only, self-hosted.
6. Amber stays for what does not belong. A dim phosphor green is added for the normal signal and live status, used only on signals and indicators, never on text blocks or buttons.
7. Section order unchanged.

Later the same day (v3.1, "make it elegant, like Apple"):

8. Headlines move to Instrument Sans semibold, set tight, with a soft sheen on the two display titles. Mono stays only for small readouts. Pill buttons, rounded panels and media.
9. A real photo of Paulus playing live, and a 52 s excerpt of a song he wrote, both in By ear. The goal is to show the social, musical side, not only the analyst.
10. The "ransomware that wasn't" field note is removed.

Everything from v2 section 1 (dates, canonical URL, résumé, field notes) still holds.

## 2. Concept

One line tells the whole story, and now the whole page listens with it.

- Hero: the headline is part of the signal. Every 6.5 s the hero line bursts; it announces the burst on an event bus (`lib/anomaly.ts`), the headline glyph nearest to it jitters, turns amber and is locked by corner brackets, and a dashed tether runs from the glyph down to the burst. A readout above the headline (`listening`, `flagged 03`) counts every anomaly flagged anywhere on the page. A tap or click on the line still makes one on demand.
- Rail: on wide screens a thread runs down the left gutter. It grows out of the bottom of the hero, branches into every section title, lights the branch being read and ends at "Say hello." It is still while the reader is still, stirs with scroll speed, and rings amber when the piano plays the wrong note.
- Method stage: unchanged mechanics, now on a scope graticule with a green trace and a green normal band.
- Section intros come up line by line as they scroll into the reading zone.
- By ear: the lead as a lit intro, the photo beside the text, then a song card ("It's been a while", play button, a 144-bar waveform measured from the master that fills green as it plays and doubles as a keyboard-operable seek slider), then the chord instrument under "Or play it yourself".
- 404: the same flagged burst, in the new palette.

Color rule: green means normal and alive, amber means it does not belong, everything else is grey on near black.

## 3. What changed from v2

| v2 | v3 | Why |
|---|---|---|
| Light and dark themes | Always dark | One identity; the instrument metaphor is strongest in the dark |
| Instrument Sans for everything, Plex Mono for labels | Martian Mono for headlines and readouts, Instrument Sans for reading | Mono headlines give the page its voice; one mono file (weight and width axes) replaces two |
| Monochrome plus amber | Green for normal signal and live state, amber for anomalies | The line needed a "normal" color to make the anomaly read as a change of state |
| Headline only animates in | Headline glyphs get flagged in sync with the line | The concept happens to the words, not just next to them |
| Hero line below the copy on every screen | On phones the line sits right under the headline | Glyph, tether and burst share the first screen |
| Section title left, body right | Wide title, large lit intro offset to column 5, shared row grammar | Fewer template tells, stronger rhythm |
| No connection between sections | Rail thread with branches | The agreed "connecting line" |
| Instrument Sans headlines | Martian Mono headlines (v3), back to Instrument Sans semibold (v3.1) | v3.1 asked for Apple-like elegance; mono now reads as a detail, not the voice |
| No photo, no music | Photo and a song in By ear | Shows the person and the social side |
| Three field notes | Two | The DDoS and ransomware story is out |

## 4. Tokens

All tokens live at the top of `app/globals.css`. Key values:

- Ground `#070908`, surface `#0d1210`, surface-2 `#141b18`, line `#1a231f`, line-strong `#2b3832`.
- Ink `#e8ece7` (16.3:1), muted `#94a199` (7.4:1), faint `#56635b` (decoration only).
- Signal `#4fc48b` (9.1:1), signal-dim `#2a7050`. Alert `#f2a23a` (9.3:1).
- Stage `#020403` with stage-line `#17201c` for graticules.
- Type: Instrument Sans variable (`--font-sans`) for headlines (600) and text; Martian Mono variable (`--font-mono`) only for readouts.
- Display `clamp(3rem, 0.9rem + 7.6vw, 8.75rem)`, tracking -0.045em, with a `#f6f8f5` to `#a7b5ad` sheen on the hero and contact titles (set per glyph in the hero, see section 6). H2 `clamp(2.375rem, 1rem + 4.4vw, 5.5rem)`, tracking -0.04em.
- Radius: pills for buttons, 16 px pads, 28 px panels and media.
- Motion: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, press 120 ms.

## 5. Page order

1. Nav: signal mark, mono links with a live underline on the active section, Contact as a small button.
2. Hero (`#top`): readout, flaggable headline, live line, lead, Email me, Résumé.
3. How I listen (`#method`): pinned stage on a graticule; static three-panel diagram under reduced motion, without JS and in print.
4. What I work on (`#work`).
5. Field notes (`#notes`): two notes, text beside full-width scenes.
6. Built after hours (`#built`): name, story, stack.
7. Path (`#path`): the present role is marked live.
8. By ear (`#ear`): lit intro, photo, song card, chord instrument.
9. Say hello (`#contact`): the end of the rail.
10. Footer.

## 6. Moving parts

- `lib/anomaly.ts`: `emitAnomaly(x, { y, still })` and `onAnomaly(fn)`. Sources: `HeroSignal` (no y), `Instrument` wrong note (with y). Listeners: `HeroHead` (glyph and tether for hero bursts, counter for all), `Rail` (bursts that carry a y).
- `components/HeroHead.tsx`: headline glyph spans, the flag classes and the tether. Word masks are a `clip-path` released after the rise, so a flagged glyph can leave its box.
- `components/Rail.tsx`: one fixed canvas, hidden under 1024 px. Reads layout in `measure()` (resize, font load), draws only on scroll, resize or while energy or a burst is decaying.
- `components/Lit.tsx`: words as spans with a CSS `view()` timeline, guarded by `@supports` and reduced motion.
- `components/SongPlayer.tsx`: a plain `<audio preload="none">`. The waveform (`content/song.ts`) is drawn on the server; playback only moves one clip rectangle. Media lives in `public/media/` (AAC 160 kbps, about 1 MB). `scripts/serve.mjs` answers byte ranges, which Safari needs for audio.
- The hero sheen is a `background-clip: text` gradient on each glyph, not on the word: Chrome paints a transformed child's glyph in the wrong place when the parent is the one clipped to text.
- The photo is a plain `<img>`: `next/image` adds an inline style attribute, which the CSP build rejects.

## 7. Security

Unchanged from v2: static export, per-page hash CSP from `scripts/csp.mjs`, no inline `style=""` or `on*=` in markup (dynamic values go through CSSOM, which the policy allows), security headers in `vercel.json`.

## 8. Verified (6 Oct 2026)

- Chromium (built-in browser): 375x812 and 1440x900, dev server and the production export via `npm run preview`.
- Hero flag, tether and counter; rail growth, branches and an amber burst; method stage; 404.
- Production export: zero CSP violations, zero console errors, no horizontal overflow at 375.
- `npm run build` protects every page (0 inline styles). `tsc` and `eslint` clean. No em dash in authored files.
- v3.1: the song plays from the production export (byte ranges, `audio/mp4`), the waveform fills and the slider seeks by keyboard; zero CSP violations; By ear checked at 375 and 1440.
- Not yet re-run for v3: Lighthouse, print, a live reduced-motion pass, Safari and Firefox.

## 8b. Open items

- The photo is the 360 x 540 copy from chat. Replace `public/media/paulus-at-the-keys.jpg` with the original (at least 1080 px wide) and update `ear.photo.width/height` in `content/site.ts`; it is upscaled on desktop until then.
- Confirm the song title and credits shown in the card.

## 9. How to change things

- Copy: `content/site.ts` only.
- A new section: `components/Section.tsx` (add `data-rail` to its title, which `Section` already does) and the row pattern in `Section.module.css`.
- Signal feel: `lib/signal.ts` and `lib/stage.ts`. Rail feel: `BURST_LIFE`, `READ_LINE` and the energy constants in `components/Rail.tsx`.
- After any change: `npm run build && npm run preview`, check 375 and 1440, and confirm the build log says every page is protected.
