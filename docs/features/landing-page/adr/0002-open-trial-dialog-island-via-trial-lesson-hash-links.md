---
status: Accepted
owner: "Oleksandr Pushkar (Operator)"
reviewers: []
updated_at: "2026-10-31"
feature_size: "S"
ticket: ""
---

# 0002 — Open one trial dialog island through `#trial-lesson` links, hydrated when idle

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** Oleksandr Pushkar (Operator), with Claude during `design`

## Context

The page is static `.astro` sections with one React island for the trial form (repo ADR-0001).
Every "Book a trial lesson" button must open the same form window, keeping typed answers for the
page lifetime (AC-03), and a shared link ending in `#trial-lesson` must open it as the page loads
(AC-04). The buttons live in static sections that have no React. `CLAUDE.md` shows islands hydrated
with `client:visible`, but a closed modal window is never visible on screen, so that directive would
never hydrate it.

## Decision drivers

- AC-03 and AC-04: one form, answers kept across openings, opened straight away from `#trial-lesson`.
- Spec §6 page speed: largest content ≤ 2.5 s at p75, mobile performance score ≥ 90, so React must
  not compete with the first paint.
- Spec §6 accessibility: focus moves into the window and returns to the link that opened it.
- Static by default (`CLAUDE.md`): no JavaScript in the sections themselves.

## Considered options

1. **`#trial-lesson` links + one island hydrated on idle** — every button is
   `<a href="#trial-lesson">`; `<TrialDialog client:idle />` opens on that hash at hydration and on
   `hashchange`, and after hydration intercepts clicks on those links (opening without touching the
   address and remembering the link for focus return). Closing removes the hash with
   `history.replaceState`.
2. **`data-trial-open` buttons + one island hydrated on load** — buttons are
   `<button data-trial-open>`; `<TrialDialog client:load />` listens for clicks on the whole document.
3. **One island per button, sharing state through nanostores** — each button is a small React island;
   they open the one dialog island through a shared store.

## Decision outcome

**Chosen:** Option 1. Buttons and shared links use one mechanism, a click before hydration is not
lost (it sets the hash, which the island reads when it hydrates), and React loads after the first
paint. Option 2 loses clicks made before hydration and loads React earlier; Option 3 adds a
dependency and several React roots while the dialog still has to be a single island to keep the
answers.

## Consequences

**Positive**
- The sections stay plain HTML; each button is a link with no script.
- The deep link (AC-04) and the buttons (AC-03) share one tested open path.
- React hydrates after the first paint, protecting the mobile speed targets.

**Negative**
- A link pressed before hydration opens the window, but the island cannot know which link was
  pressed, so focus returns to the first "Book a trial lesson" link (§11).
- Overrides the `client:visible` example in `CLAUDE.md` and `docs/architecture-map.md`; both are
  updated with the change that adds the island (§11).

**Neutral**
- No element on the page may carry `id="trial-lesson"`, or a pre-hydration click would scroll to it.
- Moving to option 2 later only changes the buttons' markup and the island's listener.

## Links

- Spec: [[../spec.md]] US-02, AC-03, AC-04, §6 (page speed, accessibility)
- SAD: [[../sad.md]] §4 (choice 2), §5, §8 (Accessibility)
- Related ADR: repo [[../../../adr/0001-astro-static-site-with-react-island]]

## Note (2026-10-31): third Book link from the goal picker

The redesign adds a third plain `#trial-lesson` Book link, in the goal picker's floating bar. The
picker hands the chosen goals to `TrialDialog` through a `trial:goals` window event, with
`window.__pendingTrialGoals` as a fallback for clicks before hydration. `TrialDialog` merges them
with `mergeGoals` (`src/lib/goals.ts`). The decision still holds: every Book link is a plain
`#trial-lesson` link, and no element carries `id="trial-lesson"`. See
[the redesign spec](../../../superpowers/specs/2026-10-31-landing-redesign-design.md).
