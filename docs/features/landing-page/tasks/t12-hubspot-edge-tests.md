---
id: T12
title: "Pin two hubspot.ts edge cases: an answer just before the 15 s cut-off and an answer body that never changes the result"
layer: "domain"
deps: ["T3"]
blocks: []
acs: ["AC-05", "AC-09"]
files_hint: ["src/lib/hubspot.test.ts"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T12 — Pin two hubspot.ts edge cases: an answer just before the 15 s cut-off and an answer body that never changes the result

> Follow-up from review [review-2026-10-31.md](../_review/review-2026-10-31.md), finding F3 (verdict: Fix now).

## Why

The code is correct today; two test-plan cases have no assertion, so a regression would pass CI.

> CRM answers just before the 15-second cut-off → expected: the answer is used, no timeout (AC-05).
>
> — `spec.md §7, Edge cases, verbatim`

> AC-09 · any success answer gives the same result whatever its content · unit · the outcome is "ok" for every success answer; nothing in the answer body changes it, so no "known contact" branch exists
>
> — `spec.md §7, test plan row AC-09, abridged`

## Checklist

- [x] A 2xx answer that arrives at 14,999 ms under mock timers returns `{ ok: true }` (and the timer then firing changes nothing).
- [x] A 2xx answer whose JSON body says the contact already exists returns `{ ok: true }`, same as an empty 2xx.

## Definition of Done

- [x] Both tests in `src/lib/hubspot.test.ts`; `npm test` green; no production change needed (if one is, the test found a bug — report it).
