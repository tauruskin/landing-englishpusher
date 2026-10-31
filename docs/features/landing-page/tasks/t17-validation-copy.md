---
id: T17
title: "Scan the validation messages for promises and name validate.ts and options.ts in the AC-10 approval pointer"
layer: "ui"
deps: ["T15", "T16"]
blocks: []
acs: ["AC-10"]
files_hint: ["src/lib/formCopy.test.ts", "docs/features/landing-page/release-checklist.md"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T17 — Scan the validation messages for promises and name validate.ts and options.ts in the AC-10 approval pointer

> Follow-up from review [review-2026-10-31-2.md](../_review/review-2026-10-31-2.md), finding N4 (verdict: Fix now).

## Why

Review [review-2026-10-31-2.md](../_review/review-2026-10-31-2.md) N4. The validation messages in `validate.ts` are never scanned, and the checklist says every form string is `FORM_COPY`, so Tetiana's pass would skip `validate.ts` and `options.ts`.

## Checklist

- [x] `formCopy.test.ts`: `findPromises` over every `validateTrialForm` message (empty form; invalid email) returns `[]`.
- [x] Test header and checklist approval item name `validate.ts` and `options.ts` alongside `FORM_COPY`.

## Definition of Done

- [x] `npm test` green; checklist links resolve.
