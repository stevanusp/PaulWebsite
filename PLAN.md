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
7. Later the same day: "How I listen" becomes a scrollytelling story that starts as a security event view and slowly turns into a music project, ending on his M-Audio Keystation 49.
8. Then, for accuracy: the song is in B major, 116 bpm, 3/4, with xylophone, bass and violin and no drums (checked against his Logic Pro project). The chords should be his favorite loop, Fmaj7, E7, Am9, D/F#, C, which he chose to show moved into the song's key: Emaj7, D#7, G#m9, C#/E#, B. His view of music: every note belongs to something once it has context. The Keystation and both interfaces get more detail, and the illustration gets motion of its own.
9. Then: F#m7 after C#/E#, and B becomes B7, so the loop is Emaj7, D#7, G#m9, C#/E#, F#m7, B7 (a ii-V back to Emaj7). The pads get an easter egg: the first hit drops the Keystation in above them, and it plays along. He loves the Rhodes sound, so the pads should sound like one.
10. Then: "What I work on" gets its own scroll illustration, a piano that turns smoothly into a cloud-security logo. And a fun fact by the pads: the progression is one YOASOBI uses.
11. Then, for consistency (corrected the same day): the Work picture goes from the Keystation to the secure cloud and stays there. The fall happens by the pads: the first press drops the secure cloud (not the keyboard), it shatters on landing, and the pieces form the Keystation, which plays along. The fun fact shows only after someone presses a pad. One set of pieces across the page: Keystation (story), cloud (work), cloud breaking into the Keystation (pads).
12. Then (7 Oct 2026): the site does not stop at the footer. Whoever keeps pushing past the end lifts the whole page like a curtain and finds a hidden page underneath: one long post, told with scrollytelling, with its own smooth scroll. It must not open easily (only for people who are genuinely curious), it gives no hint except the page giving a little under a continued push, it relaxes back if they stop, and it is not indexed. Paulus writes the post later; placeholder text for now.
13. Then (7 Oct 2026): Paulus wrote the post. His words are kept exactly as written (`content/hidden.ts`); the story only decides where each line pauses and which lines of a stanza arrive one by one. It is told with a drawing, with room to move: a small traveler made of the three parts the post names, the mind (an outlined capsule that carries the eyes), the body (solid) and the heart, who walks, rests, cries, falls and gets up, and at the end becomes a heart made of only the mind and the body, which walks into a sunrise.
14. Then: the heart is a bright red, and as the traveler walks it deepens to a deep red. Red is for this page only; amber stays the site's accent.
15. Then: the fireflies (and the light they gather into) are a bright yellow, so they read as their own thing beside the amber sun and the red heart.

Everything from v2 section 1 (dates, canonical URL, résumé) still holds.

## 2. Concept

Plain, kind, rounded. The headline still says the one idea, "I listen for what doesn't belong.", and the page lets the person carry it: a photo at the keys in the hero, the work in a few soft tiles, a song near the end.

- Color: a near white and a near black, one gray scale, and amber as the only accent, used only for what does not belong yet (the flagged upload, the lone note on the pads, the 404 badge). The story's song regions carry one calm blue-gray tint so they read as a DAW.
- Type: Instrument Sans only. Large titles are semibold and set tight; the hero and contact titles carry a soft top to bottom sheen.
- Motion: one entrance on load (the headline words rise, the copy settles, the photo arrives), one scroll story, section intros that come up line by line as they scroll in, press feedback on buttons and pads. The only things that loop are inside the story, and only while it is on screen.

### The story ("How I listen", `components/story/`)

A pinned stage (620svh of scroll) with six captions beside one illustration. One amber object travels through all of it:

1. Learn what normal sounds like: a "Network events" console fills in behind a scan line. Filters, a search field and a Live chip; an event-volume histogram; four sources (Web proxy, Network access, VPN, DNS) at their own rhythms; an event log underneath.
2. Notice what doesn't belong: one proxy event turns amber and pulses, its histogram bar spikes, a card says "Unusual upload", and the log pins a flagged row marked Review.
3. Respond without breaking work: a ring contains it; the card and the log row say "Contained".
4. After hours, the same ears: the log closes, the events join up into the regions of "It's been a while", the sources become Xylophone, Bass and Violin (with M and S buttons and meters), the histogram becomes a chord track (Emaj7, D#7, G#m9, C#/E#, F#m7, B7), the clock becomes bars of 3/4, and the search field becomes the display: bar, beat, 116 bpm, 3/4, B major. Playback starts; the loop is six bars.
5. Every note belongs to something: the xylophone's piano roll opens with only the amber note in it, on a row outside B major, tagged "Outside B major". Then its chord arrives around it (D#7 lights up in the chord track, bar 2 is shaded, the rest of the part fills in), the note turns ordinary, the tag says "Belongs to D#7", and a line leads it up to G# at the start of G#m9.
6. Then I play it: the window steps back and the Keystation 49 rises, drawn from its top view (navigation pad, stop, play, record, volume fader, Advanced, octave buttons and lights, pitch and modulation wheels, 49 keys). Its keys follow the loop in time. A pill links to the song.

The notes are real: the xylophone breaks each chord into eighths, the bass plays one note a bar, the violin falls C#, B, G# over bars 2 to 4, then holds A from F#m7 into B7, where it becomes the seventh. The odd note is F double sharp (sounding G), the third of D#7, which resolves up to G#.

Motion that runs by itself, from one clock in `Story.tsx`: the log takes a new row every 1.6 s; once the window is the song, the playhead loops the six bars at 116 bpm, the display counts bars and beats, the current chord lights up, notes light as the playhead passes, the meters move, and the keyboard presses each bar's chord. The clock writes straight to the DOM (no re-render), and stops when the section is off screen, the tab is hidden, or the story is not in live mode. The Live dot and the alert pulse are CSS animations paused unless the clock is running.

The interface is drawn in the style of Logic Pro, not copied from it, and carries no Apple or M-Audio marks; the product names appear only in the copy. Everything that depends on scroll is a pure function of progress (`scene.ts`), rendered by React (`StoryScene.tsx`); captions swap with a short exit before the next entrance so they never overlap. Without script, with reduced motion and in print, the captions are a plain list next to two still frames (beats 3 and 6, the second stopped on D#7).

The loop's voicings and the key live in `lib/loop.ts`, shared with the pads. The keyboard is one component, `components/Keystation.tsx`, drawn inside the story's SVG and on its own above the pads.

## 3. What changed from v3

| v3 | v4 | Why |
|---|---|---|
| Always dark | Light and dark, follows the device, toggle in the nav | Asked for both |
| Live signal line, flagged headline glyph, tether, rail, scope graticules | Removed | Simple and classic, no waveforms |
| Pinned method stage | A pinned scroll story (security view to music project to keyboard) | Asked for scrollytelling that joins the two kinds of listening |
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
- alert `#a94e07` / `#f2a23a` (light: 5.4:1 on bg and 4.9:1 on the gray cards, which is what the 404 badge and the pads' status sit on).
- Display `clamp(3rem, 1rem + 6.4vw, 7.5rem)`, tracking -0.045em. H2 `clamp(2.25rem, 1.1rem + 3.6vw, 4.5rem)`, tracking -0.04em.
- Radius: pills for buttons, 22 px pads, 30 px tiles, 34 px media, 12 px focus rings.
- Shared global classes: `.pill`, `.pill-solid`, `.pill-quiet`, `.tile`, `.sheen`, `.fine`.

## 5. Page order

1. Nav: a floating capsule with the name, section links (the current one in a soft capsule), the theme toggle and a Contact pill. Phones keep the name, toggle and Contact.
2. Hero (`#top`): name, headline, lead, status, Email me, Résumé; the photo on the right (below on phones).
3. How I listen (`#method`): the scroll story.
4. What I work on (`#work`): lit intro, then the three tiles scroll past a picture that holds still beside them (above them on phones): the Keystation's keys fall into a locked cloud, which stays.
5. Field notes (`#notes`): lit intro, two tiles.
6. Built after hours (`#built`): four tiles, the stack at the foot of each.
7. Path (`#path`): one tile with the timeline; the present role carries a "Now" pill.
8. By ear (`#ear`): lit intro, text beside the song card, then the pads under "Or play it yourself".
9. Say hello (`#contact`): one large rounded panel, centred.
10. Footer.
11. Behind the page (no anchor, no link): the hidden post, reached only by pushing past the end (see 6).

## 6. Moving parts

- Theme: an inline script in `<head>` (`app/layout.tsx`) applies a saved `data-theme` before first paint; `components/ThemeToggle.tsx` reads the theme with `useSyncExternalStore` and re-applies it after React's dev remount. Storage failures fall back to the device setting.
- `components/Lit.tsx`: words as spans with a CSS `view()` timeline, guarded by `@supports` and reduced motion.
- `components/SongPlayer.tsx`: a plain `<audio preload="none">` and a native range input; the fill is a `--p` custom property set through the CSSOM. Media in `public/media/` (AAC 160 kbps, about 1 MB). `scripts/serve.mjs` answers byte ranges, which Safari needs for audio.
- `components/Instrument.tsx`: pads playing the loop in B major, keys 1 to 6, plus a lone G on key 7. The first hit drops the Keystation into the space beside the heading (above it on phones), which is kept from the start so the pads never move; it falls, squashes, bounces twice and settles (a fade with reduced motion), then holds each chord's keys, with the G in amber when it is outside.
- The secure cloud (`components/secure-cloud/`): `geometry.ts` holds the cloud (three circles on a rounded base), the lock, and where each of the Keystation's 49 keys sits in it (white keys as bars along the outline, black keys as slices of the lock); `SecureCloud.tsx` draws keys, bars, the smooth cloud over them and the lock, in that order. The keys show only while they move, since the bars' corners poke past the curve. Keys keep their real colors; as a cloud they take ink and background, so the mark inverts in dark mode. A generic cloud-and-lock mark, not any vendor's logo.
- `components/Work.tsx` with `components/work/` (`cloud.ts`, `CloudScene.tsx`): the tile nearest the middle of the screen is at full strength and sets progress. The keys hop out of the Keystation and tumble down into the cloud and lock; the smooth cloud fades in over them and the shackle draws on and drops shut. A camera follows the fall a step behind. It ends on the cloud. Static mode shows the Keystation and the locked cloud side by side over the tiles.
- `components/secure-cloud/CloudDrop.tsx`: the pads' easter egg, on the first press. The locked cloud falls in from above with gravity (0.5 s), breaks on landing into its keys, which fly out and land as the Keystation (about 1.2 s in all, driven by rAF, then the normal interactive keyboard takes over). Reduced motion: the keyboard simply fades in.
- Under the pads, a fact, shown only once someone presses a pad (it fades in after the keyboard lands): the loop is the Just the Two of Us progression (IVmaj7, III7, vim7, vm7, I7; marusa in Japan) with one passing chord, and Japanese write-ups cite it in the chorus of YOASOBI's Yoru ni Kakeru.
- The hidden page (`components/hidden/`): `Curtain.tsx` wraps the whole page (nav, main, footer) as an opaque sheet over a fixed layer that holds the post. At the very bottom, after a 300 ms settle (so a fling's leftover momentum does not count), every further push fills an effort: wheel deltas, a finger moving up (counted double, with a non-passive touchmove attached only for touches that start at the edge), or ArrowDown, PageDown, Space and End. The sheet gives up to about 18% of the screen as the effort grows and relaxes back about 280 ms after the pushing stops. About 2.6 screens of pushing lifts it off (ease-out, 0.9 s); the page is then inert, the document locked (`html[data-curtain="open"]`, page Lenis stopped) and the post scrolls in its own layer with its own Lenis. Pushing up at the post's top (under one screen of effort, so leaving is easier than finding), ArrowUp, PageUp, Home, or Escape lays the sheet back down (0.82 s), exactly where it was. Reduced motion: the same effort, but the page fades instead of travelling. The post (`HiddenPage.tsx`, text in `content/hidden.ts`) loads through `next/dynamic` with `ssr: false` only on the first push, so its words are never in the HTML and never indexed; the code is fetched ahead once the reader is near the bottom. Once open, the post holds still for at least 0.6 s and until the wheel has been quiet for 180 ms (1.8 s at most), so a trackpad's momentum cannot scroll past its first line.
- The hidden post (`HiddenPage.tsx`): one pinned stage, as many screens tall as the story needs (about 26), measured in the post layer's own height. Each of its 34 moments (`timeline.ts`) gets scroll in proportion to its words, and a stanza gets room for each line; the words rise in over a seventh of a screen, hold, and lift away as the next arrive. They are all stacked in one place, so screen readers still get every line, in order. The drawing (`art.ts`) is a pure function of progress, rendered by `StoryArt.tsx` the way the story above is, and walking is tied to scrolling. In order: two eyes noticing you; confetti; a box with the heart in it; the three parts, named; put together and walking; forgetting (thoughts drift off, the heart dims); a flower, passed and looked back at; a flag that sinks while fireflies (the experiences) start to follow; a loop; hills and birds; question marks while the sun crosses the sky; sunset, rest under the moon, the site's secure cloud as a rain cloud, a tear; feelings flying into the heart as the body grows; tired, crying, falling onto a cushion; breathing; a slow dawn; the heart alone and large, cracked, held by two arms while two grey figures leave, the cracks turning gold, a halo; a grid and a dashed plan, and the real way, which loops; the fireflies gathering into a light; the three in a row again, the heart fading, the mind and the body leaning into a heart that turns red and beats; dark specks rising as light; a beam from above; the small heart hopping toward a glow on the horizon, into a sunrise. The heart is red: bright when it is found, deepening with every step to a deep red about halfway through. The heart the mind and the body make is new, so it starts bright again and deepens on its own walk to the end, where it stays visible against the amber sun. A thin ring of background keeps the deep red readable on the dark body. The fireflies are a bright yellow with a yellow glow (a thin darker edge on the light page, so the yellow does not wash out); the warm spark that flies into the heart during "feel" stays amber. What loops while you read (a blink, typing dots, rain, stars, fireflies, breathing, a heartbeat) is CSS and runs only with motion allowed. Phones get a narrower frame of the same drawing across the top, with the words below. Reduced motion: the words as one column, with ten stills.
- `lib/epiano.ts`: a Rhodes-style voice, no samples. Per note a 1:1 FM pair whose index jumps with velocity (bark) and mellows, a 1:14 pair for the tine's ping, and a touch of second harmonic; low notes ring longer. On the bus a soft lopsided drive, a 3.9 kHz low-pass, a 4.6 Hz Suitcase stereo tremolo, and a small room. Rendered offline to check: no clipping (peak about -5 dB), no DC, tremolo swings about 6 dB left to right, chords ring about four seconds. Nobody has listened to it from this side; tune by ear. The G is checked against the chord still ringing, then the key: after D#7 it "Belongs to D#7"; alone it is "Outside B major" and flagged in amber.
- The photo is a plain `<img>`: `next/image` adds an inline style attribute, which the CSP build rejects.

## 7. Security

Static export, per-page hash CSP from `scripts/csp.mjs` (the theme script is hashed like the others, and the JSON-LD block too), no inline `style=""` or `on*=` in markup, security headers in `vercel.json`.

`vercel.json` sets `"buildCommand": "npm run build"`. Without it Vercel ran `next build` alone, `scripts/csp.mjs` never ran, and for a while the live HTML had no CSP meta tag at all (only the four header directives), although every local check passed. Found on 8 Oct 2026 when the live HTML was 499 bytes shorter than the local export, exactly the meta's length. After any change to the build or the deploy, check the live page: `curl -s https://aboutspm.vercel.app/ | grep -c Content-Security-Policy` must print 1.

Forced colors (Windows High Contrast): backgrounds and shadows are dropped, so `.pill` and every `button` get a real 1px border there and nowhere else (`app/globals.css`).

## 8. Verified (6 Oct 2026)

- Chromium (built-in browser) at 375x812 and 1440x900, in light and dark.
- Theme toggle switches, persists across reloads and is applied before paint in the production export.
- Production export: zero CSP violations, zero console errors, no horizontal overflow at 375. `tsc` and `eslint` clean. No em dash in authored files.
- The story at each beat at 1440x900 (light and dark) and 375x812, plus the two still frames; the production export protects every page with zero CSP violations, and its clock runs (feed, playhead, display, meters) with zero violations.
- Pads: lone G flags amber, G after D#7 belongs, playing all six chords in order finds the loop; the Keystation drops on the first hit and follows each chord, in dev and in the production export, with zero CSP violations.
- Share image `public/og.jpg` (1200 x 630, 86 KB) is wired into Open Graph and Twitter metadata.
- The hidden post (7 Oct 2026): every moment at 1440x900 in light and dark and at 390x844, the reduced-motion column, and the curtain flow (nudge and relax, wheel, keys, Escape, touch), in dev and in the production export, with zero CSP violations and zero console errors. Scrolling through it holds 60 fps with no long animation frames (headless Chrome). The exported HTML has none of its words; they load in one lazy chunk (11 KB gzipped).
- The "production export" checks above ran on the local export (`npm run build`, then `scripts/serve.mjs`), which has the CSP meta; see section 7 for what that missed.
- The live site (8 Oct 2026, headless Chrome, cold cache): desktop FCP and LCP 0.28 s, CLS 0, no long tasks, about 290 KB in all (170 KB of it JS). A phone profile (390 px, 4x slower CPU, slow 4G): FCP 0.9 s, LCP 1.6 s, CLS 0, one 82 ms long task. Every asset, `robots.txt`, `sitemap.xml`, `security.txt` and the 404 page answer correctly; security headers are all present. Text contrast passes AA in both themes (amber on the gray cards was 4.44:1 and is now 4.9:1). Forced colors: the gradient titles stay readable; the pills lost their shape (fixed).
- Not yet run for v4: Lighthouse, print, a live reduced-motion pass, Safari and Firefox.

## 9. Open items

- The hidden post has only been seen in headless Chrome: look at it on a real phone and in Safari.
- `public/.well-known/security.txt` expires on 29 Sep 2027. Renew its `Expires` line before then; an expired file is worse than none.
- "Zero Trust" was dropped from the JSON-LD `knowsAbout` because nothing on the page says it. If it is a real strength, add a sentence to the page first, then put it back.

- The photo is the 360 x 540 copy from chat. Replace `public/media/paulus-at-the-keys.jpg` with the original (at least 900 px wide) and update `hero.photo.width/height` in `content/site.ts`; it is slightly soft on large screens until then.

## 10. How to change things

- Copy: `content/site.ts` only.
- A new section: `components/Section.tsx` plus `.tile` and the `tiles` grid classes in `Section.module.css`.
- Story timing: `BEATS` and the `span(...)` ranges in `components/story/scene.ts`; captions in `method.steps` and the interface words in `method.scene` in `content/site.ts`.
- The loop: `lib/loop.ts` (voicings, key); the parts in `scene.ts` (`XYLO`, `BASS`, `VIOLIN`); tempo and meter in `BPM` and `METER`.
- After any change: `npm run build && npm run preview`, check 375 and 1440 in both themes, and confirm the build log says every page is protected.

## 10. Housekeeping (8 Oct 2026)

A full scan for dead code, made with the TypeScript compiler already in `node_modules` (nothing was installed): unused locals and parameters, exports and files nothing reaches, CSS classes, custom properties, keyframes and `data-*` states, content strings, dependencies and assets. Frames of the whole page and of the hidden post were captured before and after (reduced motion, light and dark, desktop and phone): identical, apart from the Live dot below.

- **Removed:** the `.three` grid class (`Section.module.css`); `styles.text` in Hero and Story, which pointed at a rule that does not exist; the tokens `--s-8` and `--ease-in-out`, which nothing read; the meaningless `r: 1` on points that have no radius (`Pt` in `art.ts`); `export` on 11 things only their own file uses; imports that sat in the middle of `story/scene.ts`.
- **Icons:** `app/icon.svg` carried an embedded C2PA (Content Credentials) manifest, the provenance record of the tool that drew it, and `public/apple-touch-icon.png` a `caBX` chunk with the same. Browsers ignore both. Stripped losslessly (renders and pixels identical): 10.7 KB to 2.9 KB and 9.1 KB to 3.3 KB.
- **Fixed on the way:** `.pulse` and `.ping` in `Story.module.css` never paused, because `animation-play-state: paused` came before the `animation:` shorthand, which resets it. The Live dot pulsed off screen and with reduced motion. `paused` now sits inside the shorthand, and `data-run` runs them only while the story is on screen.
- **Cache:** `/media/*` is `max-age=3600, stale-while-revalidate=604800` (it was revalidated on every visit, which delays the hero photo, the LCP image on phones, for returning visitors). Replacing a photo shows up within the hour, or on the visit after.
- **Found clean:** no unused dependency (4 runtime and 6 dev packages, all imported), no unreachable file, no unused content string (274 checked), no dead `data-*` state, no debug leftovers or commented-out code.
- **Looked at and left alone:** about 80% of the client JavaScript is React and Next's own runtime; the site's code is about 35 KB gzipped including the lazy hidden post, and Lenis 5 KB. The HTML is 77% inline SVG (the story's live scene plus two stills, which no-JS and print need) and gzips to 20 KB. The `nomodule` polyfill (39 KB gzipped) is listed in the HTML but modern browsers never fetch it.
- **Open:** `npm audit` flags 7 packages as high: `next` 16.0 to 16.3.7 (fixed in 16.4.0, outside the pinned version) and, in the lint toolchain only, `braces` and `source-map-js` with the packages that depend on them. None of it runs in the deployed static files (there is no Next server); the dev-server advisory only matters while `npm run dev` runs. Upgrade deliberately, in its own change.
