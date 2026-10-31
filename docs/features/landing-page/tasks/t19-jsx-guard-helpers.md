---
id: T19
title: "Follow calls to local helper functions in the jsxText guard"
layer: "ui"
deps: ["T18"]
blocks: []
acs: ["AC-10"]
files_hint: ["src/lib/jsxText.ts", "src/lib/jsxText.test.ts"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T19 — Follow calls to local helper functions in the jsxText guard

> Follow-up from review [review-2026-10-31-4.md](../_review/review-2026-10-31-4.md), finding Q1 (verdict: Fix now).

## Why

`{submitLabel(status)}`, where `submitLabel` is a local helper returning `"Sending…"`, passes the
guard. A "Sending…" label on Send is a plausible next edit, and the approval checklist would not
see it either.

## Checklist

- [x] A rendered call to a local arrow / function-expression helper checks what it returns.
- [x] A rendered call to a local `function` declaration does the same.
- [x] A `pillClass`-style helper used only in `className` stays ignored.

## Definition of Done

- [x] `npm test` + `tsc` green; both components pass.
