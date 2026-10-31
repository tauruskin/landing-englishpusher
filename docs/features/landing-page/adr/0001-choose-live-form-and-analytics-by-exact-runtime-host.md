---
status: Accepted
owner: "Oleksandr Pushkar (Operator)"
reviewers: []
updated_at: "2026-10-31"
feature_size: "S"
ticket: ""
---

# 0001 — Choose the live form and analytics by an exact runtime host match

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** Oleksandr Pushkar (Operator), with Claude during `design`

## Context

Spec AC-13 says only the published Landing page (the page opened at exactly
`landing.englishpusher.in.ua`) may send to the live HubSpot "Trial lesson request" form and load the
tag manager. Everything else, including the production build opened anywhere else, sends to the
Test form and records no analytics. The site is static on GitHub Pages (repo ADR-0002) with no
server (repo ADR-0003), so the rule must run in the browser. Two parts of the page depend on it:
the inline GTM snippet in `BaseLayout.astro` and the form ID used by the trial form.

## Decision drivers

- Spec AC-13 and §6.1: test sends never reach the live pipeline; no analytics off the published page.
- The failure-mode review behind the spec named "test submissions polluting the live pipeline" as
  one of its sharpest risks (spec §1).
- One maintainer: one rule in one place, covered by a unit test (`CLAUDE.md` test convention).
- The form and portal IDs are public by design (repo ADR-0003), so shipping both IDs in the bundle
  exposes nothing.

## Considered options

1. **Exact host match in the browser, one shared constant** — `LIVE_HOST` and `isPublished(host)` in
   `src/lib/site.ts`; the form picks the live or Test form ID from it, and the layout passes the
   same constant to the inline GTM snippet through `define:vars`, which skips loading GTM when the
   host differs.
2. **Build flag set only by the deploy workflow, plus the host match** — the page is live only when
   both `PUBLIC_LIVE=true` (set in `deploy.yml`) and the host match hold.

## Decision outcome

**Chosen:** Option 1. The host match alone already meets AC-13 in every case the spec names (local
run, preview, the production build opened elsewhere), and a single rule is simpler to test and to
keep right. Option 2 adds a second condition in CI that, if lost, would make the published page
silently send everything to the Test form.

## Consequences

**Positive**
- The same built files behave correctly wherever they are opened; no per-environment builds.
- One constant and one pure function, unit-tested; the GTM snippet and the form cannot disagree.

**Negative**
- Any other host that serves the page (for example a future `www.` alias) is treated as not
  published until it is added to `LIVE_HOST` (§11).
- The GTM `<noscript>` iframe cannot check the host, so it is removed; visitors without JavaScript
  are not tracked (they cannot use the form either).

**Neutral**
- Both form IDs ship in the public JavaScript bundle (already public by design).
- Switching to a build flag later is a small change confined to `src/lib/site.ts` and the layout.

## Links

- Spec: [[../spec.md]] AC-13, §6.1
- SAD: [[../sad.md]] §4 (choice 1), §8 (Environment)
- Related ADR: repo [[../../../adr/0003-no-backend-leads-via-hubspot-forms-api]]
