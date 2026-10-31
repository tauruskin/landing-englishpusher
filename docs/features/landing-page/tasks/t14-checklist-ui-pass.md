---
id: T14
title: "Add the Local UI pass to the release checklist: one checkbox per e2e-through-UI row of AC-01..04, 08, 09"
layer: "docs"
deps: ["T11", "T13"]
blocks: []
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-08", "AC-09"]
files_hint: ["docs/features/landing-page/release-checklist.md"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "todo"
step: "—"
---

# T14 — Add the Local UI pass to the release checklist: one checkbox per e2e-through-UI row of AC-01..04, 08, 09

> Follow-up from review [review-2026-10-31.md](../_review/review-2026-10-31.md), finding F1 (verdict: Fix now).

## Why

> Before each release (manual, from the release checklist, T11): every e2e-through-UI row on the test plan.
>
> — `spec.md §7, CI placement, abridged`

The checklist covers AC-13 local send, AC-05/AC-08 offline failure and AC-03 focus (screen-reader pass) only. The e2e-through-UI rows of AC-01, AC-02, AC-03 (answers kept / reload clears), AC-04, AC-08 (sending state, trap field) and AC-09 have no checkbox. Source rows: `spec.md` test plan, lines with `e2e-through-UI` for those ACs.

## Checklist

- [ ] Add a "Local UI pass (preview, Test form)" block to §2 with one checkbox per row, each naming its AC, the owner, and the observable expected result.
- [ ] Point the AC-10 copy approval at `src/lib/formCopy.ts` (T13).

## Definition of Done

- [ ] Each of AC-01, AC-02, AC-03, AC-04, AC-08, AC-09 appears in the new block; markdown links resolve.
