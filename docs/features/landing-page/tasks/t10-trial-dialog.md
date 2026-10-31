---
id: T10
title: "Build TrialDialog (hash open, link intercept, focus trap and return, trial_form_open) and mount it with client:idle"
layer: "ui"
deps: ["T4", "T7", "T9"]
blocks: ["T11"]
acs: ["AC-03", "AC-04"]
files_hint: ["src/components/trial-form/TrialDialog.tsx", "src/lib/dialog.ts", "src/lib/dialog.test.ts", "src/pages/index.astro", "CLAUDE.md", "docs/architecture-map.md"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "M"
context_budget: "M"
status: "todo"
step: "—"
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

# T10 — Build TrialDialog and mount it with client:idle

## Place in the sequence

- **Blocked by:** T4 — `events.ts`, T7 — static sections in `index.astro`, T9 — TrialForm complete · **Blocks:** T11 — release checklist · **Wave:** 5.
- **Lane:** shares `src/pages/index.astro` with T7 — serialized (T7 first).

## Why (user story)

> **As a** Prospective student
> **I want** every "book a trial lesson" button, and a shared link to the form, to open the same trial form
> **So that** I reach the form from wherever I am on the page, and what I already typed is still there
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

This task delivers the one window that every Book link and every `#trial-lesson` address opens, keeping answers for the page lifetime.

## Inlined context

> **Chosen:** Option 1 — every button is `<a href="#trial-lesson">`; `<TrialDialog client:idle />`
> opens on that hash at hydration and on `hashchange`, and after hydration intercepts clicks on
> those links (opening without touching the address and remembering the link for focus return).
> Closing removes the hash with `history.replaceState`. A link pressed before hydration opens the
> window, but focus returns to the first "Book a trial lesson" link. Overrides the `client:visible`
> example in `CLAUDE.md` and `docs/architecture-map.md`; both are updated with the change that adds
> the island.
>
> — `adr/0002-…trial-lesson-hash-links.md, Option 1 + Consequences, abridged` · full text: [ADR-0002](../adr/0002-open-trial-dialog-island-via-trial-lesson-hash-links.md)

> UI-->>User: Opens SCR-02 over the page with any answers typed earlier, focus moves inside ·
> UI->>An: trial_form_open, once for this opening · Tab stays inside the window · Closes with the
> close button or Escape · Removes the trial-lesson hash, keeps typed answers in memory · focus
> returns to the link that opened the window · Scrolls, reads or reloads → the window stays closed,
> a reload clears the typed answers · Opens it again after a confirmed send → an empty form
>
> — `sad.md §6, F3, abridged` · full text: [sad.md](../sad.md)

> SCR-01 `behind-window`: page dimmed by the backdrop, does not scroll, Tab cannot reach it. A press
> on the backdrop that both starts and ends there closes the window (copied app behaviour).
> Desktop: window centred, at most 520 px wide.
>
> — `screens.md, SCR-01 behind-window + §Source, abridged` · full text: [screens.md](../screens.md)

> **Hard rule:** Accessibility — the window takes focus when it opens, Tab stays inside it, Escape
> closes it, and focus returns to the button that opened it; 0 serious or critical issues;
> Lighthouse accessibility score ≥ 95.
>
> — `spec.md §6, NFR Accessibility, abridged` · full text: [spec.md](../spec.md)

> **Hard rule:** Typed answers live only in the island's memory, never in `localStorage` /
> `sessionStorage` / cookies.
>
> — `sad.md §8, Privacy, abridged` · full text: [sad.md](../sad.md)

App source for the modal shell (backdrop, close button, Escape, scroll lock): `D:\VIBE CODING\app-englishpusher\src\shared\TrialLessonForm.tsx`; keep the source-path header.

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) · [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface. Pushes `trialFormOpen()` from `src/lib/events.ts`.

## Acceptance criteria

### AC-03 — happy

> **Given** a Prospective student is anywhere on the Landing page
> **When** they press any "Book a trial lesson" button
> **Then** the one trial form opens in a window over the page and the page records "trial_form_open" once for that opening; if they close the window and later open it from a different button, the answers they had typed are still there for as long as the page stays open (reloading the page clears them); after a confirmed send, opening the form again shows an empty form
>
> — `spec.md §5, AC-03, verbatim` · full text: [spec.md](../spec.md)

### AC-04 — happy

> **Given** a Prospective student follows a shared link to the Landing page that points straight at the trial form (an address ending in `#trial-lesson`, as in the app)
> **When** the page loads
> **Then** the trial form opens once, straight away, and the page records "trial_form_open" once for that opening; after they close it, `#trial-lesson` is removed from the address and the form does not reopen by itself while they scroll, read or reload the page
>
> — `spec.md §5, AC-04, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `src/lib/dialog.ts` + test (pure): `shouldOpenOnHash(hash)` (`"#trial-lesson"` only), `urlWithoutHash(href)` (keeps path + query), and a small open/close reducer that emits "record open" exactly once per closed→open transition.
- [ ] `TrialDialog.tsx`: owns `values` (from `EMPTY_VALUES`) and renders TrialForm (T8/T9) in a `role="dialog" aria-modal="true"` window; open on mount if the hash matches, on `hashchange`, and on clicks on `a[href="#trial-lesson"]` (`preventDefault`, remember the link).
- [ ] Close (X, Escape, backdrop press that starts and ends on it) → `history.replaceState` without the hash, restore focus to the remembered link or the first `a[href="#trial-lesson"]`; `onSent` resets `values` for the next opening.
- [ ] Focus trap (Tab / Shift+Tab cycle inside), body scroll lock, `inert` or `aria-hidden` on the page behind.
- [ ] `src/pages/index.astro`: add `<TrialDialog client:idle />`.
- [ ] Replace the `client:visible` example with `client:idle` in `CLAUDE.md` and `docs/architecture-map.md` (Conventions, Where things live), citing ADR-0002.

## Edge cases

| Case | Behaviour |
|---|---|
| Link pressed before hydration | Hash set; window opens at hydration; focus returns to the first Book link (accepted, sad §1 ¶4). |
| Window already open and `hashchange` fires again | No second `trial_form_open`. |
| Reload after closing | Hash already removed → stays closed; answers cleared. |
| Reload with `#trial-lesson` still in the address | Opens once (it is a deep link again). |

## Definition of Done

- [ ] `node --test src/lib/dialog.test.ts` passes (hash match, URL without hash keeps the query, one open event per opening).
- [ ] Manual on `npm run preview`: open from link 1, type, close, open from link 2 → answers kept, `dataLayer` has two `trial_form_open`; a `/?utm_source=x#trial-lesson` load opens once, close removes the hash, reload does not reopen; Tab cycles inside; Escape closes and focus returns to the pressed link.
- [ ] `CLAUDE.md` and `docs/architecture-map.md` show `client:idle`.
- [ ] every Hard Rule inlined above still holds
- [ ] `npm test && npm run check && npm run build` clean
