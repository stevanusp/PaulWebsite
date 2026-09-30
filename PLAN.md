# PLAN: Stevanus Paulus, personal site (as built, v2)

Status: built and verified by Opus on 30 Sep 2026. This file is now the as-built spec.
The original plan (v1) is kept in `docs/plan-v1.md`. Use this file for any future change.
House rule: no em dash characters anywhere (copy, code, comments, commits).

## 1. Decisions from Paulus (30 Sep 2026)

1. Relocation line in the hero: yes.
2. "83+ branches" field note: yes.
3. AI traffic inspection field note: removed for now.
4. Master's plan in Path: not shown for now.
5. Dates follow the CV: BCA from 2023, BINUS 2018 to 2023, Zalmon Fabric 2017 to 2023.
6. paulus.dev is not his domain. Canonical is `https://aboutspm.vercel.app` (override with `NEXT_PUBLIC_SITE_URL`).
7. Résumé: reuse `resume.pdf` from the old project.

## 2. Concept

One line tells the whole story. Paulus listens for what doesn't belong, in networks and at the piano.

- Hero: a live signal line. Every 6.5 s a burst breaks the pattern, a detection box locks onto it and it turns amber with the label "anomaly". The burst fades, the box lingers, the next one appears somewhere else.
- Method stage ("How I listen"): a dark instrument screen, pinned while you scroll through 3 steps. The same line learns a "normal" band, a burst breaks out and is locked ("doesn't belong"), then it is boxed into a cell and quieted ("contained") while the rest of the line keeps moving.
- By ear: a small instrument. Four pads (C, G, Am, F) play an FM electric piano synthesized in the browser; the screen is a triggered oscilloscope of the real audio. Playing I, V, vi, IV in order reveals a quiet line: "You found it".
- 404: "This page doesn't belong." with a flagged burst labelled 404.

Color rule: amber is used only for things that don't belong. Everything else is monochrome.

## 3. What changed from v1

| v1 plan | v2 as built | Why |
|---|---|---|
| Static SVG line with a one-time draw | Live line with a detection lock loop, paused offscreen, still frame under reduced motion | The concept is detection; seeing it happen says it faster than copy |
| No method section | Pinned, scroll-driven "How I listen" stage | Shows judgment visually; replaces the old "How I work" list |
| Clean line under "By ear" | Playable pads plus oscilloscope | A personal, memorable moment that is true to him |
| Accent on the primary button | Black pill buttons; amber only for anomalies | Keeps the one color meaningful |
| Next.js server output | Static export plus a post-build hash CSP | Strict CSP without `unsafe-inline`, served from a CDN |
| Google Fonts via next/font | Self-hosted woff2 in `app/fonts/` | No third-party requests; builds offline |

## 4. Tokens

All tokens live at the top of `app/globals.css`. Key values:

- Light: bg `#f3f4f1`, surface `#ffffff`, ink `#15171a`, muted `#565c63` (6.12:1), line `#dcdfda`, alert stroke `#c25e00` (3.89:1, graphics only), alert text `#b45309` (4.55:1).
- Dark: bg `#0e1012`, ink `#ecede9` (16.21:1), muted `#a0a6ac` (7.76:1), alert `#f2a23a` (9.08:1).
- Stage (dark in both themes): `#0b0c0d` light theme, `#000000` dark theme; stage ink `#ecede9`, stage alert `#f2a23a`.
- Type: Instrument Sans variable (400 to 700) for everything; IBM Plex Mono 400/500 only for technical annotations (signal labels, years, stacks, footer note).
- Display size: `clamp(3rem, min(1.2rem + 7.2vw, 14.5vh), 7.75rem)`, tracking -0.045em.
- Motion: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, press 120 ms.

## 5. Page order

1. Nav (translucent, turns dark over the stage, active section highlight).
2. Hero (`#top`): headline word reveal, lead, relocation line, Email me, Résumé, live signal.
3. How I listen (`#method`): 300svh pinned stage; static 3-panel diagram under reduced motion, without JS and in print.
4. What I work on (`#work`): 3 domains, category level only, no vendor names.
5. Field notes (`#notes`): 83+ branches, the ransomware that wasn't, making process legible.
6. Built after hours (`#built`): Hermes, Mission Control, Self-audit kit, Respawn.
7. Path (`#path`): 2023 to now back to 2017.
8. By ear (`#ear`): text plus the instrument.
9. Say hello (`#contact`): email, copy button, LinkedIn, résumé.
10. Footer: "No cookies. No trackers. Strict CSP."

## 6. Security

- Static export (`output: "export"`), no server code, no cookies, no third-party requests.
- `scripts/csp.mjs` adds per page: `default-src 'self'; script-src 'self' <sha256 hashes>; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; manifest-src 'self'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`.
- The build fails if an inline `style=""` or `on*=` handler appears. Keep styles in CSS modules.
- `vercel.json`: HSTS, X-Frame-Options DENY, `frame-ancestors 'none'`, nosniff, referrer policy, permissions policy, COOP.
- `public/.well-known/security.txt` (RFC 9116). Renew `Expires` yearly.

## 7. Verified (30 Sep 2026)

- Viewports 390, 768, 1024, 1366x650, 1440; light and dark; reduced motion; print (4 A4 pages); 404.
- Zero CSP violations and zero console errors in Chromium; no horizontal overflow.
- Lighthouse (local, gzip): desktop 100 / 100 / 100 / 100; mobile 94 / 100 / 100 / 100.
- `tsc` and `eslint` clean. No em dash in authored files.

## 8. Open items

- Optional: a 30 to 60 s recording of Paulus playing by ear. The instrument can play it through the same oscilloscope ("Hear me play").
- Optional: a real photo. The design does not need one.
- Deploy is manual and up to Paulus (see README).

## 9. How to change things

- Copy: edit `content/site.ts` only.
- A new section: follow `components/Section.tsx` and the row pattern in `Section.module.css`.
- Signal feel: `lib/signal.ts` (`normal`, `burst`, `BURST` timings, `HERO_SPOTS`) and `lib/stage.ts` (scroll thresholds).
- After any change: `npm run build && npm run preview`, check 390 and 1440 in both themes, and confirm the build log says every page is protected.
