# landing-englishpusher

One public, static marketing page that sells Tetiana's English lessons and turns visitors into
trial-lesson requests in the existing HubSpot pipeline. The source of truth for architecture is
[docs/architecture-map.md](docs/architecture-map.md) and its ADRs in [docs/adr/](docs/adr/).

## Stack

- Astro 7 (static output) + one React 18 island for the trial form + Tailwind 4 via
  `@tailwindcss/vite` (CSS-first config, no `tailwind.config.js`).
- TypeScript, Node **>= 22.23.4** (`.nvmrc` pins 24 LTS; CI reads it).
- Hosting: GitHub Pages, deployed by `.github/workflows/deploy.yml` on push to `main`.

## Commands

| What | Command |
|---|---|
| Dev server | `npm run dev` |
| Build → `dist/` | `npm run build` |
| Preview the build | `npm run preview` |
| Tests | `npm test` (`node --test "src/**/*.test.ts"`, Node's type stripping) |
| Type check | `npm run check` (`astro check`; there is no separate linter) |

The skeleton smoke test is `npm test && npm run check && npm run build`; CI runs the same three.

## Layout

```
src/pages/index.astro         the landing page, composed of sections
src/layouts/BaseLayout.astro  <head>: meta/SEO, fonts, GTM snippet, global CSS
src/components/               static sections (<Name>.astro); React islands in <name>/ folders
src/lib/                      pure TS logic, each file with a sibling *.test.ts
src/styles/global.css         Tailwind import + @theme brand tokens
public/                       served as-is (images, favicon)
```

## Conventions

- **Static by default.** Sections are `.astro`. React only where interactivity is needed, as an
  island hydrated with `client:visible` (e.g. `<TrialForm client:visible />`).
- **Styling:** Tailwind utilities with the brand tokens only: `brand` (#f07c1a), `cream`
  (#faf8f5), `font-display` (Space Grotesk), `font-body` (Inter). No other CSS approach.
- **Tests:** logic lives in `src/lib/*.ts` with a sibling `*.test.ts`. UI and the HubSpot
  integration are checked by a manual end-to-end submit.
- **Code copied from `app-englishpusher`** (`D:\VIBE CODING\app-englishpusher`) is copied, not
  shared as a package, and keeps a header comment naming its source path in that repo.
- **Tracking:** everything goes through GTM `GTM-KJVX8GRG` (loaded in `BaseLayout.astro`); no
  separate GA4/Clarity snippets. Push `dataLayer` events with the app's names: `trial_form_open`
  and `generate_lead` (`form_name: "trial_lesson"`), the latter only after HubSpot confirms.
- **Leads:** no backend. The form POSTs from the browser to the HubSpot Forms API — form
  `2226dfee-47d4-406f-ae1a-2e8c0952dec2`, portal `149535757`, region eu1 — with the `hubspotutk`
  cookie and page URL, so the Leads Bot, deal pipeline and Monday report keep working. A change
  to the HubSpot fields must be made in both this repo and `app-englishpusher`.
- **Error handling:** the form never loses typed answers; a failed submit shows a fallback message
  with a contact link and keeps the values.
- **Address:** `https://landing.englishpusher.in.ua` — `site` in `astro.config.mjs`, `cname:` in
  the deploy workflow (it writes `CNAME` into the published branch). Served from `/`, no base path.
  The Moodle site on `englishpusher.in.ua` itself is untouched.
- No datastore, no migrations, no stored IDs.
