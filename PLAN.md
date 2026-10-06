# PLAN: Stevanus Paulus, personal site (as built, v4 "simple")

Status: redesigned on 6 Oct 2026 on branch `redesign-v3`. This file is the as-built spec.
Earlier versions: `docs/plan-v1.md`, `docs/plan-v2.md` (light and dark, motion v2), `docs/plan-v3.md` (dark control room, then the first elegant pass).
House rule: no em dash characters anywhere (copy, code, comments, commits).

## 1. Decisions from Paulus (6 Oct 2026)

1. "I'm a simple person": the site should feel simple and classic, like an Apple product page, not like an instrument panel.
2. Light and dark mode both. The site follows the device; a toggle in the nav pins a choice on that device.
3. No sharp corners anywhere: pills for buttons and the nav, generous radii for tiles and the photo.
4. Motion is welcome if it is classic. No waveforms.
5. A real photo (playing live) and his own song, "It's been a while" (a song he wrote; no other performers), stay.
6. The ransomware field note stays out.

Everything from v2 section 1 (dates, canonical URL, résumé) still holds.

## 2. Concept

Plain, kind, rounded. The headline still says the one idea, "I listen for what doesn't belong.", and the page lets the person carry it: a photo at the keys in the hero, the work in a few soft tiles, a song near the end.

- Color: a near white and a near black, one gray scale, and amber as the only accent, used only for what does not belong (the wrong note on the pads, the 404 badge).
- Type: Instrument Sans only. Large titles are semibold and set tight; the hero and contact titles carry a soft top to bottom sheen.
- Motion: one entrance on load (the headline words rise, the copy settles, the photo arrives), section intros that come up line by line as they scroll in, press feedback on buttons and pads. Nothing loops.

## 3. What changed from v3

| v3 | v4 | Why |
|---|---|---|
| Always dark | Light and dark, follows the device, toggle in the nav | Asked for both |
| Live signal line, flagged headline glyph, tether, rail, scope graticules | Removed | Simple and classic, no waveforms |
| Pinned method stage | Three numbered tiles | The steps are a real sequence; no scroll-jacking |
| Field note scenes (animated SVG) | Text tiles | Simpler |
| Photo in By ear | Photo in the hero | The person is the first thing you meet |
| Song waveform slider | Classic rounded progress bar (`<input type="range">`) | Simpler, accessible by default |
| Piano scope | Pads with a status line | Simpler |
| Martian Mono plus Instrument Sans | Instrument Sans only | One family |
| Green signal color | Gone; amber only | One accent |

## 4. Tokens

All tokens live at the top of `app/globals.css`, written once with `light-dark()`:

- bg `#fbfbfa` / `#0c0c0d`, surface (tiles) `#f1f1ef` / `#18181a`, surface-2 `#e7e7e4` / `#232326`.
- ink `#1b1b1d` / `#f3f3f1`, muted `#66666c` / `#a2a2a8` (5.6:1 and 8.1:1 on bg), line `#e3e3e0` / `#29292c`.
- alert `#b45309` / `#f2a23a`.
- Display `clamp(3rem, 1rem + 6.4vw, 7.5rem)`, tracking -0.045em. H2 `clamp(2.25rem, 1.1rem + 3.6vw, 4.5rem)`, tracking -0.04em.
- Radius: pills for buttons, 22 px pads, 30 px tiles, 34 px media, 12 px focus rings.
- Shared global classes: `.pill`, `.pill-solid`, `.pill-quiet`, `.tile`, `.sheen`, `.fine`.

## 5. Page order

1. Nav: a floating capsule with the name, section links (the current one in a soft capsule), the theme toggle and a Contact pill. Phones keep the name, toggle and Contact.
2. Hero (`#top`): name, headline, lead, status, Email me, Résumé; the photo on the right (below on phones).
3. How I listen (`#method`): three numbered tiles.
4. What I work on (`#work`): lit intro, three tiles.
5. Field notes (`#notes`): lit intro, two tiles.
6. Built after hours (`#built`): four tiles, the stack at the foot of each.
7. Path (`#path`): one tile with the timeline; the present role carries a "Now" pill.
8. By ear (`#ear`): lit intro, text beside the song card, then the pads under "Or play it yourself".
9. Say hello (`#contact`): one large rounded panel, centred.
10. Footer.

## 6. Moving parts

- Theme: an inline script in `<head>` (`app/layout.tsx`) applies a saved `data-theme` before first paint; `components/ThemeToggle.tsx` reads the theme with `useSyncExternalStore` and re-applies it after React's dev remount. Storage failures fall back to the device setting.
- `components/Lit.tsx`: words as spans with a CSS `view()` timeline, guarded by `@supports` and reduced motion.
- `components/SongPlayer.tsx`: a plain `<audio preload="none">` and a native range input; the fill is a `--p` custom property set through the CSSOM. Media in `public/media/` (AAC 160 kbps, about 1 MB). `scripts/serve.mjs` answers byte ranges, which Safari needs for audio.
- `components/Instrument.tsx`: FM electric piano pads (`lib/epiano.ts`); the F sharp pad is checked against the key and flagged in amber.
- The photo is a plain `<img>`: `next/image` adds an inline style attribute, which the CSP build rejects.

## 7. Security

Unchanged: static export, per-page hash CSP from `scripts/csp.mjs` (the theme script is hashed like the others), no inline `style=""` or `on*=` in markup, security headers in `vercel.json`.

## 8. Verified (6 Oct 2026)

- Chromium (built-in browser) at 375x812 and 1440x900, in light and dark.
- Theme toggle switches, persists across reloads and is applied before paint in the production export.
- Production export: zero CSP violations, zero console errors, no horizontal overflow at 375. `tsc` and `eslint` clean. No em dash in authored files.
- Not yet run for v4: Lighthouse, print, a live reduced-motion pass, Safari and Firefox.

## 9. Open items

- The photo is the 360 x 540 copy from chat. Replace `public/media/paulus-at-the-keys.jpg` with the original (at least 900 px wide) and update `hero.photo.width/height` in `content/site.ts`; it is slightly soft on large screens until then.
- `public/og.png` still shows an earlier design.

## 10. How to change things

- Copy: `content/site.ts` only.
- A new section: `components/Section.tsx` plus `.tile` and the `tiles` grid classes in `Section.module.css`.
- After any change: `npm run build && npm run preview`, check 375 and 1440 in both themes, and confirm the build log says every page is protected.
