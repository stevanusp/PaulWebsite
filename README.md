# paulus.sys — personal site

A minimal, terminal-inflected personal site built with Next.js (App Router),
TypeScript, and Tailwind CSS. Includes a light/dark theme, scroll-triggered
reveal animations, a mobile nav, and full SEO metadata.

---

## 1. Run it locally (do this before deploying)

### Prerequisites

- **Node.js 18.18 or newer** (Node 20 LTS recommended). Check with:
  ```bash
  node -v
  ```
  If you don't have it, install from https://nodejs.org or via a version
  manager like `nvm`.

### Steps

1. **Unzip the project** and open a terminal in the folder:
   ```bash
   cd paulus-site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This creates a `node_modules` folder — it's normal for this to take a
   minute and print some warnings; only actual errors matter.

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

4. **Open the site:** go to [http://localhost:3000](http://localhost:3000)
   in your browser.

5. **Check it over before deploying:**
   - Click the sun/moon icon top-right and confirm both **light and dark
     mode** look right.
   - Resize the browser (or open dev tools' device toolbar) and check the
     **mobile hamburger menu** opens/closes properly.
   - Click every nav link (About, Experience, Focus, Off-duty, Writing,
     Contact) and confirm it scrolls to the right section.
   - Scroll down slowly and confirm sections **fade in** as they enter
     view.
   - Click the **Résumé** button in Contact — it will 404 until you add a
     PDF (see below).

6. **Test a production build** (this is what actually gets deployed, and
   catches issues `dev` mode doesn't):
   ```bash
   npm run build
   npm run start
   ```
   Then re-check [http://localhost:3000](http://localhost:3000) again.
   If `npm run build` fails, read the error in the terminal — it will
   point at the exact file and line.

Only move on to deploying once both `npm run dev` and the `build`/`start`
combo work without errors and everything above checks out.

---

## 2. Personalize before shipping

Everything content-related lives in a few places:

| What | Where |
|---|---|
| Hero text, About, Experience timeline, Focus, Off-duty modules, Contact links | `app/page.tsx` — look for the `FACTS`, `EXPERIENCE`, `FOCUS_AREAS`, `MODULES` arrays near the top |
| Rotating "currently:" line in the hero | `components/StatusLine.tsx` → `LINES` array |
| Page title/description, Open Graph tags, domain | `app/layout.tsx` → `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION` |
| Favicon | `app/icon.svg` (swap for your own SVG or PNG) |

**Specifically replace these placeholders:**
- `SITE_URL` in `app/layout.tsx` — your real domain once you have one.
- `mailto:hello@paulus.dev` and the LinkedIn/GitHub URLs in the Contact
  section of `app/page.tsx`.
- The `EXPERIENCE` array dates — currently placeholders, swap in your
  actual timeline.
- Add your real résumé as `public/resume.pdf` (see
  `public/PUT-YOUR-RESUME-HERE.txt`), then delete that note file.

---

## 3. Theming

Colors live as CSS variables in `app/globals.css`, split between `:root`
(light) and `html[data-theme="dark"]`. Tailwind utilities like `bg-bg`,
`text-ink`, `text-muted`, `text-accent`, `text-accent2`, and
`border-border` all read from those variables, so anything built with
them adapts to both themes automatically — no `dark:` prefix needed.
The theme choice is saved to `localStorage` and respects the visitor's
OS-level preference on first visit.

---

## 4. Deploying

**Vercel (recommended, zero-config for Next.js):**
```bash
npm i -g vercel
vercel
```
Follow the prompts. Vercel auto-detects Next.js and handles the build.

**Any other Node host:** run `npm run build` then `npm run start`, and
point the platform at port 3000 (or set the `PORT` env var).

**Static export** (no server-side features are used here, so this works):
add `output: "export"` to `next.config.mjs`, then `npm run build` and
deploy the generated `out/` folder anywhere that serves static files.
