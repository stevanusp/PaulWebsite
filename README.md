# paulus-site-2026

Personal site of Stevanus Paulus. One page, built around a single idea: *I listen for what doesn't belong.*

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, for editing (no CSP in dev)
npm run build      # static export to out/, then a hash-based CSP is added to every page
npm run preview    # http://localhost:4173, the built site with production headers
```

Node 20 or newer.

## Where things live

| What | Where |
|---|---|
| Every word on the page | `content/site.ts` |
| Colors, type, spacing, motion tokens | `app/globals.css` (top of the file) |
| Signal math (hero line, stage, 404) | `lib/signal.ts`, `lib/stage.ts` |
| Electric piano (Web Audio) | `lib/epiano.ts` |
| Sections | `components/` |
| Security headers | `vercel.json` |
| Script and style CSP | `scripts/csp.mjs` (runs after `next build`) |
| security.txt | `public/.well-known/security.txt` (renew `Expires` before 29 Sep 2027) |
| Résumé | `public/resume.pdf` (replace the file, keep the name) |
| Share image and icons | `public/og.png`, `public/apple-touch-icon.png`, `app/icon.svg` |

## Security, in one paragraph

The site is a static export: no server, no cookies, no third-party requests, no analytics. Fonts are self-hosted. After the build, `scripts/csp.mjs` hashes every inline script and injects a `Content-Security-Policy` meta tag per page with `script-src 'self'` plus those SHA-256 hashes, so nothing inline runs without a matching hash. The build fails on purpose if anyone adds an inline style attribute or an inline event handler. `vercel.json` adds HSTS, `frame-ancestors 'none'`, `nosniff`, a strict referrer policy, a locked-down permissions policy and COOP.

## Deploy (when you decide to)

Nothing here is published automatically. To replace aboutspm.vercel.app:

1. Push this folder to the GitHub repo you use for the old site (or a new private one).
2. In Vercel, point the existing `aboutspm` project at it. Framework preset: Next.js. Build command: `npm run build`. Output: detected automatically for a static export (`out`).
3. Optional: set `NEXT_PUBLIC_SITE_URL` if you move to a custom domain, then update the `Canonical` line in `security.txt`.
4. After it is live, check the headers at securityheaders.com and the share card with LinkedIn's Post Inspector.

## Fonts

Martian Mono (headlines and readouts) and Instrument Sans (reading text), both under the SIL Open Font License, stored in `app/fonts/` with the Martian Mono license as `MartianMono-OFL.txt`.
