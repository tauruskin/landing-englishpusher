---
id: T13
title: "Move the form's user-facing strings into one exported copy object and check it with findPromises"
layer: "ui"
deps: ["T9"]
blocks: ["T14"]
acs: ["AC-10"]
files_hint: ["src/lib/formCopy.ts", "src/lib/formCopy.test.ts", "src/components/trial-form/TrialForm.tsx"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "todo"
step: "—"
---

# T13 — Move the form's user-facing strings into one exported copy object and check it with findPromises

> Follow-up from review [review-2026-10-31.md](../_review/review-2026-10-31.md), finding F2 (verdict: Fix now).

## Why

`scripts/built-page.test.ts` scans `dist/index.html`, but the dialog renders nothing until opened, so the form's headline, subline, labels, thank-you and send-failed banner are never scanned for AC-10 promises.

> **Then** the invariant "Interim copy makes no promises" holds: nothing states a price, that the trial lesson is free, its length, or a learning result […] Tetiana approves all Interim copy, including the form's headline and thank-you, before the page is published
>
> — `spec.md §5, AC-10, abridged`

## Checklist

- [ ] `src/lib/formCopy.ts` exports `FORM_COPY`: every visible string of `TrialForm.tsx` (headline, subline, field labels, hints, placeholders, legends, submit, thank-you heading parts + line, Close, send-failed banner parts, avatar alt).
- [ ] `TrialForm.tsx` renders those strings only from `FORM_COPY` — no user-facing literal stays in the component.
- [ ] `src/lib/formCopy.test.ts`: `findPromises` over every string in `FORM_COPY` and every `GOALS` / `LEVELS` label returns `[]`.

## Definition of Done

- [ ] `npm test` green; `tsc --noEmit` clean; rendered text unchanged.
