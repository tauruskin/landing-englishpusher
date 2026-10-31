---
id: T18
title: "Harden the jsxText guard: Field's error prop, constants in any scope, non-ASCII text and HTML entities"
layer: "ui"
deps: ["T16"]
blocks: []
acs: ["AC-10"]
files_hint: ["src/lib/jsxText.ts", "src/lib/jsxText.test.ts"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "done"
step: "COMMIT"
---

# T18 — Harden the jsxText guard: Field's error prop, constants in any scope, non-ASCII text and HTML entities

> Follow-up from review [review-2026-10-31-3.md](../_review/review-2026-10-31-3.md), findings P1–P3 (verdict: Fix now).

## Why

The guard misses `<Field error="…" />`, any text constant that is not a top-level `const` holding a
string literal, and text with no ASCII letter (a bare `₴500`, banned by AC-10). It also flags
harmless entity-only text such as `&nbsp;`.

## Checklist

- [x] `error` is a text prop.
- [x] `const` / `let` in every scope resolve; the initializer is checked as a rendered value; `{T.a}` resolves an object-literal field.
- [x] Text counts by `\p{L}`, `\p{N}`, `\p{Sc}` after stripping HTML entities.

## Definition of Done

- [x] New caught and ignored cases in `jsxText.test.ts`; both components pass; `npm test` + `tsc` green.
