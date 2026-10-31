---
id: T15
title: "Release checklist: a trap-field step that fires React's onChange, and the retry clause of the offline row"
layer: "docs"
deps: ["T14"]
blocks: ["T17"]
acs: ["AC-05", "AC-08"]
files_hint: ["docs/features/landing-page/release-checklist.md"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T15 — Release checklist: a trap-field step that fires React's onChange, and the retry clause of the offline row

> Follow-up from review [review-2026-10-31-2.md](../_review/review-2026-10-31-2.md), finding N1, N2 (verdict: Fix now).

## Why

Review [review-2026-10-31-2.md](../_review/review-2026-10-31-2.md) N1 + N2. `company_url` is a controlled React input: editing it in the Elements panel fires no `onChange`, so the trap step sends a real request. The offline row leaves out the spec's "trying again records one more error" (`spec.md:297`).

## Checklist

- [x] The AC-08 trap step: fill a valid form, then set `company_url` from the console with the native `HTMLInputElement` value setter and dispatch an `input` event (React's `onChange` sees it; a key press after `focus()` from the console would go to the console), then press Send.
- [x] The offline-failure row: press Send again while still offline → one more `trial_form_error` with `error_kind: "network"`, still no `generate_lead`.

## Definition of Done

- [x] Both rows read as above; links in the checklist resolve.
