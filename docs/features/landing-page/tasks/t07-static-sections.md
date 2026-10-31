---
id: T7
title: "Build the static sections (Hero, InterimBlock, Footer, BookTrialLink) and compose index.astro with Interim copy"
layer: "ui"
deps: ["T2", "T6"]
blocks: ["T10"]
acs: ["AC-10"]
files_hint: ["src/pages/index.astro", "src/components/Hero.astro", "src/components/InterimBlock.astro", "src/components/Footer.astro", "src/components/BookTrialLink.astro"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "M"
status: "todo"
step: ""
---

<!-- The governing rule of this file: **inline the slice the task actually needs, name where it came
from, and keep the link as the fallback for when the slice turns out not to be enough.** A task is
self-contained: it carries its own context instead of sending the executing agent off to reconstruct it.

Every inlined chunk ends with a one-line **provenance signature**:
`<file> §<section>, <identifier>, verbatim|abridged`. Never «see the spec».

**Divergence risk.** An inline is a snapshot taken at breakdown time; upstream can move after it.
The source always wins.

**To the executing agent:** work from what is inlined here. If a slice is insufficient, ambiguous,
or contradicts the code in front of you, open the named file for the full text and follow that.
Do not invent the missing part. -->

# T7 — Build the static sections and compose index.astro with Interim copy

## Place in the sequence

- **Blocked by:** T2 — `options.ts` (Instagram / LinkedIn URLs), T6 — `BaseLayout` head · **Blocks:** T10 — TrialDialog (mounted in `index.astro`) · **Wave:** 4.
- **Lane:** shares `src/pages/index.astro` with T10 — serialized (T7 first).

## Why (user story)

> **As a** Tetiana
> **I want** the page to promise nothing I have not approved
> **So that** no Prospective student arrives expecting a price, a free lesson or a result I did not offer
>
> — `spec.md §4, US-05, verbatim` · full text: [spec.md](../spec.md)

This task builds SCR-01 as plain static HTML with Interim copy only, and gives US-02 its two "Book a trial lesson" links.

## Inlined context

> Committed approach: the page is a frame with **Interim copy**: a hero with a neutral headline and
> a "Book a trial lesson" button, one short interim block with a second button, and a footer with
> links to Tetiana's Instagram and LinkedIn (their clicks record the existing `contact_click`
> event). It has no placeholder sections for roadmap step 3.
>
> — `spec.md §1, Committed approach, abridged` · full text: [spec.md](../spec.md)

> SCR-01 `default`: the Hero (neutral headline, one sentence, a "Book a trial lesson" link), the
> InterimBlock (a short heading, two or three lines, a second "Book a trial lesson" link) and the
> Footer (Instagram and LinkedIn links). Both Book links are plain `<a href="#trial-lesson">`
> (ADR-0002). All text is Interim copy (AC-10). Components: NEW Hero, NEW InterimBlock, NEW Footer,
> NEW BookTrialLink. BookTrialLink takes the app button's look (brand pill, CalendarCheck icon).
>
> — `screens.md, SCR-01 default + §New components BookTrialLink, abridged` · full text: [screens.md](../screens.md)

> **Hard rule:** No element on the page may carry `id="trial-lesson"`, or a pre-hydration click
> would scroll to it.
>
> — `adr/0002-…trial-lesson-hash-links.md, Consequences Neutral, verbatim` · full text: [ADR-0002](../adr/0002-open-trial-dialog-island-via-trial-lesson-hash-links.md)

> **Hard rule:** The skeleton's meta description says "Book a free trial lesson", which breaks
> AC-10 — replaced with Tetiana-approved Interim copy in the first page task.
>
> — `sad.md §11, risk "The skeleton's meta description…", abridged` · full text: [sad.md](../sad.md)

> **Hard rule:** Static by default: sections are `.astro`; styling with Tailwind utilities and the
> brand tokens only (`brand`, `cream`, `font-display`, `font-body`).
>
> — `CLAUDE.md §Conventions, abridged` · full text: [CLAUDE.md](../../../../CLAUDE.md)

```text
SCR-01 default (mobile)
| [Hero]  # <Neutral headline> / <One sentence> / ( [cal] Book a trial lesson ) -> #trial-lesson
| [InterimBlock]  ## <Short heading> / <Two or three lines> / ( [cal] Book a trial lesson )
| [Footer]  Write to Tetiana / Instagram ↗   LinkedIn ↗  -> off the page
```
— `screens.md, wireframe "SCR-01 default", abridged` · full text: [screens.md](../screens.md)

**Fallback:** read [spec.md](../spec.md) · [screens.md](../screens.md) · [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-10 — domain invariant

> **Given** the Landing page shows Interim copy
> **When** a Prospective student reads any text on the page, the form, the page title and description shown in search results, or the preview of a shared link
> **Then** the invariant "Interim copy makes no promises" holds: nothing states a price, that the trial lesson is free, its length, or a learning result (any outcome claim such as "speak confidently at work" or "improve your English fast" is banned); the only offer is to book a trial lesson with Tetiana; Tetiana approves all Interim copy, including the form's headline and thank-you, before the page is published
>
> — `spec.md §5, AC-10, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `src/components/BookTrialLink.astro`: `<a href="#trial-lesson" data-trial-link>` brand pill with an inline CalendarCheck SVG (no React), label "Book a trial lesson".
- [ ] `Hero.astro`, `InterimBlock.astro` (each with one BookTrialLink) and `Footer.astro` (Instagram + LinkedIn from `src/lib/options.ts`, `target="_blank" rel="noopener"`).
- [ ] `src/pages/index.astro`: compose Hero, InterimBlock, Footer in `<main>`; neutral title and description with no "free", price, length or outcome.
- [ ] Put every visible string in one place at the top of each section (or a `copy` object) so Tetiana's approved wording drops in without layout edits.

## Edge cases

| Case | Behaviour |
|---|---|
| A Book link is pressed before the island exists (until T10) | Hash becomes `#trial-lesson`; nothing scrolls (no element has that id). |
| Draft copy contains "free", a price, a lesson length or an outcome | Not allowed; rewrite neutrally and flag it for Tetiana. |
| Copy not yet approved by Tetiana | Ship the neutral placeholder; approval is a pre-publish gate in T11. |

## Definition of Done

- [ ] `npm run build` → `dist/index.html` has exactly two `href="#trial-lesson"` links, no `id="trial-lesson"`, and the Instagram + LinkedIn links.
- [ ] `grep -iE "free|price|₴|\\$|minutes|confident|fast" dist/index.html` finds no promise in visible copy or meta.
- [ ] every Hard Rule inlined above still holds
- [ ] `npm test && npm run check && npm run build` clean
