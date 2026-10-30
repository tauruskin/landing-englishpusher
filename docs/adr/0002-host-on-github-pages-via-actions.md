---
status: Accepted
owner: "Oleksandr Pushkar"
reviewers: []
updated_at: "2026-10-30"
feature_size: ""
ticket: ""
---

# 0002 — Host the landing page on GitHub Pages, deployed by GitHub Actions

- **Status:** Accepted
- **Date:** 2026-10-30
- **Deciders:** Oleksandr Pushkar (owner), with Claude during `survey` (greenfield)

## Context

The page is static (ADR-0001) and must live at its own address, separate from the Moodle site on
`englishpusher.in.ua` (brief §5). The app already deploys to GitHub Pages from `main` through
`.github/workflows/deploy.yml` (`peaceiris/actions-gh-pages`, custom domain via `cname`).

## Decision drivers

- No hosting cost, no server to maintain.
- Same deploy path the owner already operates for the app.
- The custom address is not chosen yet; hosting must work without one.

## Considered options

1. **GitHub Pages via a GitHub Actions workflow on push to `main`** — same as the app.
2. **Cloudflare (static assets Worker or Pages)** — the app has a beta Worker config
   (`wrangler.jsonc`); one more account and toolchain in the production path.

## Decision outcome

**Chosen:** Option 1, confirmed by the owner on 2026-10-30. The build runs in CI and publishes
`dist/`; a `CNAME` is added once the address is decided.

## Consequences

**Positive**
- Free, familiar, and every deploy is a git push.

**Negative**
- No server-side code is possible (fine for now: see ADR-0003).
- The repo must be on GitHub, and GitHub Pages on a free account needs a public repository.
