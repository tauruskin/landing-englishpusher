---
status: Accepted
owner: "Oleksandr Pushkar"
reviewers: []
updated_at: "2026-10-30"
feature_size: ""
ticket: ""
---

# 0001 — Build the landing page as a static Astro 7 site with a React island for the form

- **Status:** Accepted
- **Date:** 2026-10-30
- **Deciders:** Oleksandr Pushkar (owner), with Claude during `survey` (greenfield)

## Context

The repo is empty and needs a stack for one public marketing page whose job is to turn strangers
into trial-lesson requests (`docs/idea-brief.md`). Google search is one of the three planned
traffic sources. The owner already runs `app-englishpusher` (React 18 + Vite 6 + TypeScript +
Tailwind 3, `node --test`), which contains a finished, tested trial-lesson form.

## Decision drivers

- Search is a planned traffic source (brief §3), so the page should ship as pre-rendered HTML
  that loads fast.
- Reuse the owner's existing skills and the app's React trial form with minimal rewriting.
- One person maintains it, so keep the moving parts small.

## Considered options

1. **Astro 7 static + TypeScript + Tailwind 4 + a React 18 island for the form** — HTML is
   pre-rendered at build time; React loads only for the form.
2. **Vite + React single-page app, same as the app** — most familiar; the page is drawn in the
   browser, which is weaker for search and slower on first paint.
3. **Plain HTML + Tailwind + a small script** — simplest; the React form would have to be
   rewritten.

## Decision outcome

**Chosen:** Option 1. It gives search engines and slow phones real HTML, while the trial form
can be copied from the app almost unchanged. The owner confirmed this bundle on 2026-10-30.
Version facts checked on npm the same day: `astro` 7.4.4 (engines: node >= 22.23.4),
`@astrojs/react` 7.1.2 (react 17–19), `tailwindcss` / `@tailwindcss/vite` 4.3.3. React stays on 18
to match the app.

## Consequences

**Positive**
- Pre-rendered, mostly script-free page; good for search and first load.
- The app's form, tests and brand tokens carry over.

**Negative**
- A second framework (Astro) next to the app's Vite setup to learn and keep updated.
- Tailwind 4 here vs Tailwind 3 in the app: tokens are written differently (CSS `@theme` vs
  `tailwind.config.js`).
- Requires Node >= 22.23.4; the local machine had 22.20.0 and must be upgraded.
