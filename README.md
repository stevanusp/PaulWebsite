# paulus-site-2026

Personal site of Stevanus Paulus, live at https://aboutspm.vercel.app. One page, built around a single idea: *I listen for what doesn't belong.* Behind the footer there is a second page, for whoever keeps scrolling.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, for editing (no CSP in dev)
npm run build      # static export to out/, then a hash-based CSP is added to every page
npm run preview    # http://localhost:4173, the built site with the security headers
npm run lint       # eslint; check types with: npx tsc --noEmit
```

Node 20 or newer.

## Where things live

| What | Where |
|---|---|
| Every word on the page | `content/site.ts` (the hidden post's words: `content/hidden.ts`) |
| Colors, type, spacing, motion tokens | `app/globals.css` (top of the file) |
| Shared motion math, the loop's chords, smooth scroll | `lib/motion.ts`, `lib/loop.ts`, `lib/smooth.ts` |
| Electric piano (Web Audio) | `lib/epiano.ts` |
| Sections | `components/` |
| The scroll stories | `components/story/` (How I listen), `components/work/` and `components/secure-cloud/` (What I work on, and the pads' drop) |
| The hidden page behind the footer | `components/hidden/`: `Curtain.tsx` lifts the page, `art.ts` and `StoryArt.tsx` draw the story |
| Security headers and cache rules | `vercel.json` |
| Script and style CSP | `scripts/csp.mjs` (runs after `next build`, as part of `npm run build`) |
| security.txt | `public/.well-known/security.txt` (renew `Expires` before 29 Sep 2027) |
| Résumé | `public/resume.pdf` (replace the file, keep the name) |
| Share image and icons | `public/og.jpg`, `public/apple-touch-icon.png`, `app/icon.svg` |
| Plans and decisions | `PLAN.md` (current), `docs/` (earlier versions) |

## Security, in one paragraph

The site is a static export: no server, no cookies, no third-party requests, no analytics. Fonts are self-hosted. After the build, `scripts/csp.mjs` hashes every inline script and injects a `Content-Security-Policy` meta tag per page with `script-src 'self'` plus those SHA-256 hashes, so nothing inline runs without a matching hash. The build fails on purpose if anyone adds an inline style attribute or an inline event handler. `vercel.json` adds HSTS, `frame-ancestors 'none'`, `nosniff`, a strict referrer policy, a locked-down permissions policy and COOP.

## Deploy

Vercel deploys `main` to aboutspm.vercel.app, and every pull request gets a preview behind Vercel's login. The build command must be `npm run build`, not `next build`: only the former runs `scripts/csp.mjs`, which adds the CSP. The output is detected automatically for a static export (`out`).

- Optional: set `NEXT_PUBLIC_SITE_URL` if you move to a custom domain, then update the `Canonical` line in `security.txt`.
- After a deploy, check that the live HTML carries the policy: `curl -s https://aboutspm.vercel.app/ | grep -c Content-Security-Policy` should print `1`. Then check the headers at securityheaders.com and the share card with LinkedIn's Post Inspector.

## Fonts

Instrument Sans, under the SIL Open Font License, stored in `app/fonts/`.
