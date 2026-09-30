# PLAN: Stevanus Paulus, personal site (2026)

Project folder: `~/Downloads/paulus-site-2026`
Planned by: Opus. Executed by: Sonnet, step by step, in order.
Hard rule: never use the em dash character anywhere (copy, code, comments, commit messages). Use commas, colons, or periods. For year ranges in copy write "2017 to 2023".

---

## 1. PRD (short)

**Problem.** The current site (aboutspm.vercel.app) reads as a template: numbered 01 to 06 section markers, a fake terminal cursor, middle dots between every label, six identical hobby tiles with two-letter icons. It has no career history before 2024, names the internal security vendor stack in detail (an OPSEC risk for someone defending a bank), and never says the one thing an international recruiter needs: what kind of role he wants and where.

**Target user.** A recruiter or hiring manager in Singapore, Australia, or Europe (secondary: a scholarship panel). They give the page about 60 seconds. They want: who is this, what does he actually do, how senior, is he open to relocating, how do I contact him.

**Primary job.** Email Paulus or download the résumé. Secondary: read two or three short field notes that prove judgment.

**In scope.** One long page, English only, light and dark (follows system), résumé PDF, SEO metadata, Open Graph image, JSON-LD Person.
**Out of scope.** Blog, CMS, theme toggle, analytics, contact form (mailto only), hobbies not selected (sneakers, gaming, Hololive), photos (none available), Indonesian version.

**Design principles.** Needs-first, minimal, Apple-like restraint. One typeface family plus one mono for tiny technical annotations. Neutral palette with one accent used only for the "anomaly" and for focus states. No cards, no shadows. One signature moment.

**Definition of done.** All build steps ticked, all quality gates in section 13 pass, `npm run build` succeeds, screenshots at 390 and 1440 px reviewed, zero em dash characters in the repo.

**Open decisions for Paulus** (build with the default, flag in final report):
1. Relocation line in hero: "Open to network security roles in Singapore, Australia and Europe." Default: include.
2. Field note "A cloud edge for 83+ branches" mentions the branch count. Default: include.
3. Field note "Putting AI traffic under inspection" mentions that encoded content slipped past inspection. Default: include, phrased as already resolved and vendor-neutral.
4. Path row "Next: a master's in cybersecurity, likely in Australia." Default: include.
5. Dates conflict: CV says BCA from 2023 and BINUS 2018 to 2023; old site says 2024 and 2019 to 2023. Default: follow the CV (2023, 2018 to 2023).
6. Canonical domain: old site metadata points to paulus.dev. Default: `NEXT_PUBLIC_SITE_URL`, falling back to `https://aboutspm.vercel.app`.
7. Résumé PDF: copied from the old project; it may be outdated.

---

## 2. Direction: "I listen for what doesn't belong"

The thread that ties his three sides together is listening:
- As a security analyst he learns what normal traffic looks like so the abnormal stands out.
- As a pianist he plays by ear.
- As an audiophile he cares about a clean signal chain.

**The one bold element:** a thin, hand-tuned signal line (SVG waveform) under the hero headline. It is calm and regular except for one short irregular burst, which is drawn in the accent color with a tiny mono label "anomaly". The page ends with the same line, now perfectly clean, next to the music section. Open with the anomaly, close with a clean signal. Everything else stays quiet.

**Primary direction skill:** `mengto-design-skills:light-mode-paper-technical` is closest in spirit (precise, light, technical) but we do NOT copy its paper texture, dark framing or bracket geometry. We only borrow its precision. Motion decisions follow `emil-kowalski-skills:apple-design` and `emil-kowalski-skills:animate`.
Note: `frontend-design` is not installed in this session; `mengto-design-skills:no-ai-design-slop` is used as the gate instead.

## 3. References (borrow, never copy)

| Reference | Borrow | Do not copy |
|---|---|---|
| apple.com product pages | Huge confident headline, generous whitespace, pill buttons, one idea per viewport | Imagery, product layouts, SF Pro |
| linear.app | Tight tracking on display type, quiet muted grey hierarchy | Dark gradient hero, glow |
| Teenage Engineering product pages | Tiny mono annotations as if labelling hardware | Orange brand, grid of products |
| Oscilloscope / audio analyzer screens | A single waveform as meaning, not decoration | Green phosphor look, grids of graticules |

## 4. Anti-default check

| Default found (old site or common AI look) | Replacement and why |
|---|---|
| 01 to 06 numbers above each section | Removed. Sections are not a sequence. Hierarchy comes from size and placement. |
| Fake terminal line with blinking cursor | Removed. The waveform carries the "security" meaning without cosplay. |
| Middle dots joining meta text | Removed. Use line breaks or a comma. |
| Six identical hobby tiles with two-letter icons | Replaced by one short prose section, "By ear". |
| Dark background plus neon accent (the usual security look) | Light neutral default, amber accent that reads like a status LED on audio gear. Dark mode exists but only as a system preference. |
| Fade-up on every section, hover lift on cards | No scroll reveals except the one signature. No cards. |
| Arrow glyphs appended to every link | Only external links get the small "external" icon; internal links do not. |
| Tracked-out all-caps eyebrows | None. The only small labels are lowercase mono annotations in the waveform. |

---

## 5. Tokens

Fonts (via `next/font/google`, self-hosted at build, `display: swap`):
- Sans: **Instrument Sans**, weights 400, 500, 600. Variable `--font-sans`.
- Mono: **IBM Plex Mono**, weight 400. Variable `--font-mono`. Used ONLY for: waveform annotations, years in the Path list, stack lists in "Built after hours". Nowhere else.

Paste into `app/globals.css`:

```css
:root {
  /* color, light */
  --bg: #F3F4F1;          /* page */
  --surface: #FFFFFF;     /* buttons (secondary), focus halo */
  --ink: #15171A;         /* primary text, waveform */
  --muted: #565C63;       /* secondary text */
  --faint: #8A9097;       /* decorative only: rules, clean waveform, never text */
  --line: #DCDFDA;        /* 1px dividers */
  --accent: #A34A00;      /* anomaly, focus ring, primary button bg */
  --accent-ink: #FFFFFF;  /* text on accent */

  /* type scale, desktop (>=1024px) */
  --fs-display: 104px; --lh-display: 0.98; --ls-display: -0.035em;
  --fs-h2: 44px;       --lh-h2: 1.08;      --ls-h2: -0.02em;
  --fs-h3: 21px;       --lh-h3: 1.3;       --ls-h3: -0.005em;
  --fs-lead: 22px;     --lh-lead: 1.5;
  --fs-body: 18px;     --lh-body: 1.6;
  --fs-small: 15px;    --lh-small: 1.5;
  --fs-mono: 13px;     --lh-mono: 1.4;

  /* spacing */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px;
  --s-7: 48px; --s-8: 64px; --s-9: 96px; --s-10: 128px; --s-11: 160px;
  --section-y: var(--s-11);
  --gutter: 40px;
  --max: 1200px;
  --measure: 62ch;

  /* shape */
  --radius-pill: 999px;   /* buttons only */
  --radius-focus: 6px;    /* focus ring on text links */

  /* motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-draw: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 150ms;
  --dur-base: 300ms;
  --dur-draw: 1400ms;
}

@media (max-width: 1023px) {
  :root {
    --fs-display: 72px; --fs-h2: 36px; --fs-lead: 20px;
    --section-y: var(--s-10); --gutter: 32px;
  }
}
@media (max-width: 767px) {
  :root {
    --fs-display: 46px; --lh-display: 1.02; --ls-display: -0.03em;
    --fs-h2: 30px; --fs-h3: 19px; --fs-lead: 19px; --fs-body: 17px;
    --section-y: var(--s-9); --gutter: 20px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0E1012; --surface: #16191C; --ink: #ECEDE9; --muted: #A0A6AC;
    --faint: #6B7178; --line: #24282C; --accent: #F2A23A; --accent-ink: #0E1012;
  }
}
```

Contrast (computed, WCAG):
- Light: ink on bg 16.27:1, muted on bg 6.12:1, accent on bg 5.38:1, white on accent 5.94:1.
- Dark: ink on bg 16.21:1, muted on bg 7.76:1, accent on bg 9.08:1, bg on accent 9.08:1.
- `--faint` is 2.92:1 (light) and is therefore never used for text or for any meaningful UI; decoration only.

Breakpoints: 390 (design base), 768, 1024, 1440. Layout grid: 12 columns, 24px column gap, max width `--max`, side padding `--gutter`.

---

## 6. Page map (single page, `app/page.tsx`)

Global layout on >=1024px: every content section uses a two-zone grid. Section title sits in columns 1 to 4 (sticky is NOT used), content in columns 5 to 12. Below 1024px everything stacks, title first.

```
Desktop section grid
| title (cols 1-4) |            content (cols 5-12)              |
```

### 6.1 Nav (`components/Nav.tsx`)
- Purpose: identity and quick jump.
- Left: text wordmark "Stevanus Paulus", 16px, weight 600, links to `#top`.
- Right (>=768px): links "Work", "Field notes", "Built", "Path", "Contact" (15px, weight 500, `--muted`, hover and current `--ink`).
- Right (<768px): only "Contact". No hamburger.
- Height 64px, position sticky top 0, background `color-mix(in srgb, var(--bg) 82%, transparent)` with `backdrop-filter: saturate(180%) blur(16px)`, bottom border 1px `--line` that only appears after scrolling 8px (toggle a `data-scrolled` attribute with a passive scroll listener).
- Skip link "Skip to content" as first focusable element, visually hidden until focused.

```
[Stevanus Paulus]                    Work  Field notes  Built  Path  Contact
```

### 6.2 Hero (`components/Hero.tsx`), id `top`
- Purpose: in five seconds, who, what, where, and what he wants.
- Padding: top 160px desktop / 96px mobile, bottom 96px / 64px.
- Copy:
  - H1 (display, weight 600, max-width 12ch): **I listen for what doesn't belong.**
  - Lead (`--fs-lead`, `--muted`, max-width 40ch, margin-top 32px): "I'm Stevanus Paulus, a cybersecurity analyst at Bank Central Asia in Jakarta. I work where devices meet the network: deciding what gets in, what gets inspected, and what gets stopped."
  - Status line (`--fs-small`, `--ink`, margin-top 24px) with an 8px accent dot before it (the dot is the only other accent use in the hero): "Open to network security roles in Singapore, Australia and Europe."
  - Actions (margin-top 40px, gap 12px): primary button "Email me" (`mailto:stevanuspmp@gmail.com`), secondary button "Download résumé" (`/resume.pdf`, `download` attribute, add small text "PDF" in `--muted` after the label).
- Signal (margin-top 96px desktop / 64px mobile): `<Signal variant="anomaly" />`, full content width (cols 1 to 12), height 160px desktop / 96px mobile.

```
Desktop                                        Mobile (390)
I listen for                                   I listen for
what doesn't                                   what doesn't
belong.                                        belong.
I'm Stevanus Paulus, a cybersecurity...        I'm Stevanus Paulus...
* Open to network security roles in ...        * Open to network ...
( Email me )  ( Download résumé PDF )          ( Email me )
                                               ( Download résumé PDF )
~~~~~~~~~~~~~~~~~~~~~~~~~~/\/\|\~~~~~~~~        ~~~~~~~~~~~/\|\~~~~~
                        anomaly                          anomaly
```
Left aligned everywhere. On mobile buttons are full width, stacked.

### 6.3 Work (`components/Domains.tsx`), id `work`
- Purpose: what he does, at category level (no vendor names, OPSEC).
- Title (h2): **Where devices meet the network**
- Intro (`--fs-lead`, `--muted`): "Inside a regulated bank's security stack since 2023, and six years before that as a one-person IT department."
- Definition list, three rows, each row: 1px top border `--line`, padding 32px 0, h3 left (cols 5 to 8), description right (cols 9 to 12). Mobile: stacked.
  1. **Network access control**: "Deciding which devices are trusted to join the network, by identity, posture and behavior, across branches and data centers."
  2. **Web security at the edge**: "Proxy and secure web gateway policy for a bank-wide fleet, from on-premise appliances to a cloud security edge."
  3. **Detection and data-loss inspection**: "Tuning intrusion prevention against real traffic instead of vendor defaults, including traffic headed to AI tools."
- Below the list, one small line (`--fs-small`, `--muted`): "CompTIA Security+. Working toward CySA+."

### 6.4 Field notes (`components/FieldNotes.tsx`), id `notes`
- Purpose: prove judgment with specific, OPSEC-safe stories.
- Title: **Field notes**
- Intro: "A few things from the job, told without the parts that should stay inside the bank."
- Four entries in a vertical list (NOT cards). Each entry: h3, paragraph (max `--measure`), then one "outcome" line in `--ink` weight 500. 1px `--line` top border per entry, padding 40px 0.
  1. **A cloud edge for 83+ branches**. "Part of the team that moved web security for more than 83 branches onto a cloud security edge, keeping policy behavior consistent while the network underneath kept changing." Outcome: "Same rules, new edge, no surprise outages."
  2. **Putting AI traffic under inspection**. "Tested how an internal AI assistant handled prompt injection and found that encoded content could slip past inspection. Compared vendor controls, wrote the proposal, and defended it in front of senior leadership." Outcome: "The gap was named, and a fix was put on the roadmap." (Open decision 3.)
  3. **The ransomware that wasn't**. "An alert that looked like a DDoS with ransomware on top. Careful triage showed a crude script renaming files. Contained, then written up so the next analyst starts from evidence instead of panic." Outcome: "Calm first, then conclusions."
  4. **Making process legible**. "Wrote the SOPs, RACI matrices and swimlane flows for how proxy exceptions are requested and approved, so decisions stop living in one person's head." Outcome: "Faster approvals, easier audits."

### 6.5 Built after hours (`components/Built.tsx`), id `built`
- Purpose: show he builds, especially around AI security.
- Title: **Built after hours**
- Intro: "Side projects, mostly to understand something by making it."
- Four rows. Each row: name (h3), description paragraph, stack line in mono `--muted` (items separated by commas). 1px `--line` top border, padding 32px 0. No links (projects are private).
  1. **Hermes**. "A personal AI agent that lives in Discord. Running it taught me more about prompt injection than any paper: an agent that reads files will also read the instructions hidden inside them." Stack: `python, llm apis, discord`
  2. **Mission Control**. "A dashboard to watch and steer a small crew of specialised agents: tasks, calendar, memory and docs in one place. Built first for a client who runs a music school." Stack: `next.js, typescript`
  3. **Self-audit kit**. "A local-only tool my sister and I use to check our own data exposure, keep encrypted evidence, and see what our laptops talk to. The code is deliberately never published." Stack: `flask, argon2, aes-256-gcm, sqlite, mitmproxy`
  4. **Respawn**. "A small resale business for secondhand electronics. My first startup, a furniture company, closed. This one runs on unit economics I can explain on one page." Stack: `side business, jakarta`

### 6.6 Path (`components/Path.tsx`), id `path`
- Purpose: full history for international applications (fixes the old open item).
- Title: **Path**
- Ordered list, newest first. Each row: years in mono `--muted` (cols 5 to 6), role + place (cols 7 to 12, role weight 500, place `--muted`), one line below. Mobile: years above role.
  - `next`: **Master's in cybersecurity**, "likely in Australia, planned for around 2027." (Open decision 4.)
  - `2023 to now`: **Cyber Security Analyst**, Group IT Security, Bank Central Asia. "Network access control, web security, detection."
  - `2024`: **CompTIA Security+**. "Valid through 2027. CySA+ in progress."
  - `2022`: **Founder and full-stack developer**, EdooMoo. "Built a learning platform end to end, from product to operations."
  - `2020`: **Co-founder, operations**, Rooma Living. "Ran operations and hiring for a furniture startup. It closed; the lessons stayed."
  - `2017 to 2023`: **Sole IT engineer**, Zalmon Fabric. "The whole IT department: network, systems, internal apps and support."
  - `2018 to 2023`: **B.Sc. Computer Science**, BINUS University, Bandung.

### 6.7 By ear (`components/ByEar.tsx`), id `ear`
- Purpose: the human side, closing the "listening" loop.
- Title: **By ear**
- Body (two paragraphs, `--fs-lead` for the first, `--fs-body` for the second, max `--measure`):
  - "I play piano without sheet music. I hear a chord, find it, then look for the next one."
  - "It's the same habit I bring to traffic: learn what normal sounds like, and the wrong note announces itself. Away from the keys I'm an audiophile, which mostly means strong opinions about DACs, amplifiers, and the difference between a clean signal and a loud one."
- Below, full width: `<Signal variant="clean" />`, height 96px, stroke `--faint`, no label. Static (no draw animation), `aria-hidden`.

### 6.8 Contact (`components/Contact.tsx`), id `contact`
- Purpose: the primary action, impossible to miss.
- Title: **Say hello** (h2, but set at `--fs-display` scale on this section only via a modifier class; it is the second loudest moment).
- Line: "If you're hiring for network or cloud security, I'd like to hear from you."
- Email as large link (`--fs-h2`, weight 500, underline offset 6px, thickness 1px, accent underline on hover): `stevanuspmp@gmail.com`
- Secondary links row (gap 24px, `--fs-body`): "LinkedIn" (https://www.linkedin.com/in/stevanuspmp/, external icon, `rel="noopener noreferrer"`, `target="_blank"`), "Résumé (PDF)".
- No phone number.

### 6.9 Footer (`components/Footer.tsx`)
- One line, `--fs-small`, `--muted`, padding 48px 0, top border 1px `--line`: "© 2026 Stevanus Paulus. Designed and built in Jakarta."

---

## 7. Signal component spec (`components/Signal.tsx`, `lib/wave.ts`)

`lib/wave.ts` exports `buildWave({ width: 1200, height: 160, anomaly: boolean }): { base: string; spike: string | null; peak: {x:number,y:number} | null }`.
- Deterministic (no Math.random): seeded PRNG mulberry32 with seed 1987.
- Sample every 4px across x from 0 to 1200.
- Base: `y = mid + 9 * sin(x / 17) + 3 * sin(x / 5.3) + noise`, where `mid = height / 2`, noise in [-1.5, 1.5] from the PRNG.
- If `anomaly`, the window x in [812, 876] replaces the base with a burst: 8 alternating points with amplitudes [18, -34, 58, -64, 46, -22, 12, -6] relative to mid, linearly interpolated. `spike` is the path of just that window (x 808 to 880) so it can be overlaid in accent. `peak` is the point with the smallest y.
- If not anomaly: amplitude of both sines halved, noise 0 (a clean signal).
- Path strings rounded to 1 decimal.

`Signal.tsx` (client component only because of the draw animation):
- `<svg viewBox="0 0 1200 160" preserveAspectRatio="none" role="img" aria-label="A steady signal line with one irregular burst, marked as an anomaly">`. The clean variant is `aria-hidden="true"`.
- Base path: stroke `var(--ink)` (clean variant `var(--faint)`), width 1.25, `vector-effect: non-scaling-stroke`, fill none, round joins.
- Spike overlay: stroke `var(--accent)`, width 2, non-scaling.
- Peak marker and label are HTML absolutely positioned over the SVG (so text does not stretch with `preserveAspectRatio="none"`): an 8px accent dot at `left: peak.x/1200*100%`, `top: peak.y/160*100%`, and the label "anomaly" in mono `--fs-mono`, `--accent`, offset 12px right and 4px up from the dot.

---

## 8. Motion

Only one signature moment plus small feedback.

1. **Signature (hero signal, on load):**
   - Base path draws left to right: `stroke-dasharray` equal to path length (use `getTotalLength()` on mount), `stroke-dashoffset` from length to 0, `--dur-draw`, `--ease-draw`, delay 250ms.
   - When the draw reaches the spike (at about 70% of duration), the spike overlay fades from opacity 0 to 1 over 200ms.
   - Then the peak dot plays one pulse: a pseudo-element ring scaling 1 to 2.6 and opacity 0.5 to 0 over 700ms `--ease-out`, once. The label fades in over `--dur-base`.
   - Start only when the SVG is in view (IntersectionObserver, threshold 0.3); it is in view on load for most viewports.
   - `prefers-reduced-motion: reduce`: render the final state immediately. No dash animation, no pulse.
   - Before hydration (SSR) the path must be visible in its final state; the animation is applied only after mount adds `data-animate`. This avoids a blank line if JS fails.
2. **Feedback:**
   - Links: color and underline-color transition `--dur-fast` ease.
   - Buttons: background transition `--dur-fast`; `:active { transform: scale(0.98) }` over 100ms.
   - Nav border appear: opacity transition `--dur-base`.
3. Nothing else animates. No scroll reveals, no smooth-scroll library. Use `scroll-behavior: smooth` in CSS, disabled under reduced motion.

## 9. Components and states

- **Button primary:** bg `--accent`, text `--accent-ink`, 16px weight 500, padding 14px 24px, radius pill, min-height 44px. Hover: bg `color-mix(in srgb, var(--accent) 88%, var(--ink))`. Focus-visible: 2px outline `--accent`, offset 3px. Active: scale 0.98.
- **Button secondary:** bg `--surface`, text `--ink`, 1px border `--line`, same size. Hover: border `--muted`.
- **Text link:** `--ink`, underline 1px, offset 4px, underline color `--line`; hover underline color `--accent`. Focus-visible: outline 2px `--accent`, offset 2px, radius `--radius-focus`.
- **Nav link:** `--muted`, hover `--ink`, current section `--ink` (set via IntersectionObserver on sections, `aria-current="true"`).
- External link icon: inline SVG 12px arrow-up-right, `aria-hidden`, plus visually hidden "(opens in new tab)".

## 10. Assets

| Asset | Source | Size | Format | Loading | Alt |
|---|---|---|---|---|---|
| Résumé | copy `~/Downloads/Projects/paulus-site/public/resume.pdf` | as is | PDF | link | n/a |
| Favicon | new, `app/icon.svg`: 32x32, `--ink` rounded square (radius 7) with a 2px accent polyline spike in the middle | 32 | SVG | n/a | n/a |
| OG image | `app/opengraph-image.tsx` with `next/og`: 1200x630, bg #F3F4F1, name 64px, headline 40px, a simple accent polyline spike | 1200x630 | PNG | n/a | "Stevanus Paulus, cybersecurity analyst" |
| Photos | none | | | | |

## 11. Tech

- Next.js latest (App Router), TypeScript, React, plain CSS: `app/globals.css` for tokens and base, CSS Modules per component. No Tailwind, no animation libraries, no UI kit.
- Content lives in `content/site.ts` as typed data; components never hardcode copy.
- Site URL: `process.env.NEXT_PUBLIC_SITE_URL ?? "https://aboutspm.vercel.app"`.
- Local only until Paulus deploys. Do not create a GitHub repo and do not push anything. Do not deploy.

File tree:
```
paulus-site-2026/
  PLAN.md  DEVIATIONS.md (only if needed)  README.md
  app/ layout.tsx page.tsx globals.css icon.svg opengraph-image.tsx sitemap.ts robots.ts
  components/ Nav.tsx Hero.tsx Signal.tsx Domains.tsx FieldNotes.tsx Built.tsx Path.tsx ByEar.tsx Contact.tsx Footer.tsx Section.tsx ExternalIcon.tsx (+ *.module.css)
  content/ site.ts
  lib/ wave.ts
  public/ resume.pdf
```

---

## 12. Build steps

### Step 1: Scaffold
- [ ] Status
- Skill to load: none
- Files: project root
- Do:
  1. The folder `~/Downloads/paulus-site-2026` already exists and holds only this PLAN.md. create-next-app refuses non-empty folders, so: `cd ~/Downloads/paulus-site-2026 && mv PLAN.md ../PLAN.paulus-site-2026.md && npx create-next-app@latest . --ts --app --eslint --no-tailwind --no-src-dir --import-alias "@/*" --use-npm --yes && mv ../PLAN.paulus-site-2026.md PLAN.md` (if it still prompts, answer: Turbopack yes, React Compiler no).
  2. Confirm PLAN.md is back in the project root.
  3. Delete the starter content in `app/page.tsx`, `app/page.module.css`, `public/*.svg`.
  4. `cp ~/Downloads/Projects/paulus-site/public/resume.pdf public/resume.pdf`.
  5. Do NOT run `git remote add` or push. If create-next-app ran `git init`, leave the local repo.
- Don't: install Tailwind, GSAP, Framer Motion or any UI library.
- Done when: `npm run dev` serves an empty page at localhost:3000.
- Verify: open http://localhost:3000.

### Step 2: Tokens, fonts, base styles
- [ ] Status
- Skill to load: `emil-kowalski-skills:apple-design`
- Files: `app/globals.css`, `app/layout.tsx`
- Do:
  1. Paste the token block from section 5 into `app/globals.css`.
  2. Base: modern reset (box-sizing, margin 0), `html { background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; scroll-behavior: smooth; }`, body font `var(--font-sans)`, `--fs-body` / `--lh-body`.
  3. `::selection { background: var(--accent); color: var(--accent-ink); }`
  4. Utility classes: `.container` (max-width var(--max), margin auto, padding-inline var(--gutter)), `.visually-hidden`, `.mono` (font-family var(--font-mono), size var(--fs-mono)).
  5. `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`
  6. In `layout.tsx` load Instrument Sans (400, 500, 600) and IBM Plex Mono (400) with `next/font/google`, expose `--font-sans` and `--font-mono` variables on `<html lang="en">`. Add theme-color for light (#F3F4F1) and dark (#0E1012) via the `viewport` export.
- Don't: add any color outside the tokens.
- Done when: body text renders in Instrument Sans on the token background in both color schemes.
- Verify: toggle macOS appearance, reload, both look correct.

### Step 3: Content file
- [ ] Status
- Skill to load: `design:ux-copy`
- Files: `content/site.ts`
- Do: encode every string from section 6 exactly as written (nav items with ids, hero, domains, notes, built, path, byEar, contact, footer, email, linkedin URL, resume path). Export TypeScript types.
- Don't: rewrite copy, add em dashes, invent numbers.
- Done when: `npx tsc --noEmit` passes.
- Verify: `grep -rn $'\xe2\x80\x94' content` returns nothing.

### Step 4: Layout primitives, Nav, Footer
- [ ] Status
- Skill to load: none
- Files: `components/Section.tsx(+css)`, `Nav.tsx(+css)`, `Footer.tsx(+css)`, `ExternalIcon.tsx`, `app/page.tsx`
- Do:
  1. `Section` renders `<section id aria-labelledby>` with `.container`, padding-block `var(--section-y)`, and the 12-column grid from section 6 (title cols 1 to 4, content cols 5 to 12 at >=1024px; stacked below, title margin-bottom 32px).
  2. Nav exactly per 6.1, including skip link to `#main`, scrolled border, and active section via IntersectionObserver (rootMargin "-45% 0px -50% 0px").
  3. Footer per 6.9.
  4. `page.tsx`: `<Nav/><main id="main">...sections...</main><Footer/>`.
- Done when: nav sticks, border appears after scroll, skip link works with keyboard.
- Verify: screenshots at 390 and 1440.

### Step 5: Signal
- [ ] Status
- Skill to load: `emil-kowalski-skills:animate`
- Files: `lib/wave.ts`, `components/Signal.tsx`, `components/Signal.module.css`
- Do: implement section 7 exactly, including the animation and reduced-motion rules from section 8.1. Height via CSS: 160px (>=768px), 96px below.
- Don't: use random values, canvas, or an animation library.
- Done when: line draws once on load, spike turns accent, dot pulses once, label appears; with reduced motion the final state shows immediately; with JS disabled the line is visible.
- Verify: check in the browser; emulate reduced motion in DevTools.

### Step 6: Hero
- [ ] Status
- Skill to load: none
- Files: `components/Hero.tsx(+css)`
- Do: per 6.2. H1 is the only h1 on the page. Buttons per section 9.
- Done when: at 390px the headline wraps as "I listen for / what doesn't / belong." with no overflow; buttons are full width on mobile.
- Verify: screenshots at 390, 768, 1024, 1440.

### Step 7: Work
- [ ] Status
- Skill to load: none
- Files: `components/Domains.tsx(+css)`
- Do: per 6.3 using `Section`.
- Done when: three rows align to the grid, no vendor names appear.
- Verify: screenshots at 390 and 1440.

### Step 8: Field notes
- [ ] Status
- Skill to load: none
- Files: `components/FieldNotes.tsx(+css)`
- Do: per 6.4. Use `<article>` per entry with h3.
- Verify: screenshots at 390 and 1440.

### Step 9: Built after hours
- [ ] Status
- Skill to load: none
- Files: `components/Built.tsx(+css)`
- Do: per 6.5. Stack line uses `.mono`, `--muted`.
- Verify: screenshots at 390 and 1440.

### Step 10: Path
- [ ] Status
- Skill to load: none
- Files: `components/Path.tsx(+css)`
- Do: per 6.6 as an `<ol>`; years in `.mono`.
- Verify: screenshots at 390 and 1440.

### Step 11: By ear
- [ ] Status
- Skill to load: none
- Files: `components/ByEar.tsx(+css)`
- Do: per 6.7, clean Signal variant, static, `aria-hidden`.
- Verify: screenshots at 390 and 1440.

### Step 12: Contact
- [ ] Status
- Skill to load: none
- Files: `components/Contact.tsx(+css)`
- Do: per 6.8. On mobile the email link must not overflow: use `overflow-wrap: anywhere` and `--fs-h3` size below 768px.
- Verify: screenshots at 390 and 1440.

### Step 13: Metadata, OG, JSON-LD, sitemap
- [ ] Status
- Skill to load: `searchfit-seo:schema-markup`
- Files: `app/layout.tsx`, `app/opengraph-image.tsx`, `app/icon.svg`, `app/sitemap.ts`, `app/robots.ts`
- Do:
  1. `metadata`: title "Stevanus Paulus, cybersecurity analyst", description "Cybersecurity analyst in Jakarta working on network access control, web security and detection. Open to network security roles in Singapore, Australia and Europe.", `metadataBase` from site URL, openGraph and twitter (summary_large_image).
  2. JSON-LD `Person` in layout: name "Stevanus Paulus", jobTitle "Cyber Security Analyst", worksFor Organization "Bank Central Asia", address Jakarta ID, alumniOf "BINUS University", email mailto, sameAs LinkedIn, knowsAbout ["Network access control","Zero Trust","Secure web gateway","Intrusion prevention","AI security"].
  3. Icon and OG image per section 10.
- Verify: view source shows JSON-LD; visit /opengraph-image.

### Step 14: Responsive pass
- [ ] Status
- Skill to load: none
- Do: check 390, 768, 1024, 1440 for every section. Fix overflow and orphaned single words in headings (use `text-wrap: balance` on h1/h2 and `text-wrap: pretty` on paragraphs).
- Verify: `npx playwright screenshot --viewport-size=390,844 --full-page http://localhost:3000 shot-390.png` and the same for 768, 1024, 1440. No horizontal scroll.

### Step 15: Accessibility pass
- [ ] Status
- Skill to load: `design:accessibility-review`
- Do: heading order (one h1, h2 per section, h3 inside), landmarks, focus visible on every interactive element, aria per section 7, keyboard-only walkthrough, 44px minimum touch targets for buttons and nav links.
- Verify: Lighthouse accessibility 95 or higher.

### Step 16: Performance and build
- [ ] Status
- Skill to load: `mengto-design-skills:optimize-web-animations`
- Do: `npm run build && npm run start`, Lighthouse desktop. Signal must not run any rAF loop after the animation ends. No layout shift from fonts.
- Verify: Performance 90 or higher desktop, CLS under 0.05.

### Step 17: Final sweep and README
- [ ] Status
- Skill to load: none
- Do:
  1. `grep -rn $'\xe2\x80\x94' --exclude-dir=node_modules --exclude-dir=.next .` must return nothing.
  2. Write README.md: how to run locally, where copy lives (`content/site.ts`), how to replace `public/resume.pdf`, the deploy steps for Vercel (done by Paulus himself), and the open decisions from section 1.
  3. Report to Paulus in Indonesian: what was built, the folder, deviations, open decisions.
- Don't: deploy, create a remote repo, or push.

## 13. Quality gates
- [ ] Layout holds at 390, 768, 1024, 1440 px with no horizontal scroll.
- [ ] WCAG AA contrast; visible focus everywhere; one h1; logical heading order.
- [ ] `prefers-reduced-motion` respected; line visible without JS.
- [ ] No placeholder text, no invented numbers, no vendor product names.
- [ ] Lighthouse desktop: Performance 90+, Accessibility 95+.
- [ ] Nothing from the anti-default table in section 4.
- [ ] Zero em dash characters in the repo.

## 14. Fix pass
(added during review)
