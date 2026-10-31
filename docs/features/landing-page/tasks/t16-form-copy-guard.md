---
id: T16
title: "Replace the regex guard in formCopy.test.ts with a TypeScript syntax-tree walk of TrialForm and TrialDialog"
layer: "ui"
deps: ["T13"]
blocks: ["T17"]
acs: ["AC-10"]
files_hint: ["src/lib/formCopy.test.ts"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
status: "todo"
step: "—"
---

# T16 — Replace the regex guard in formCopy.test.ts with a TypeScript syntax-tree walk of TrialForm and TrialDialog

> Follow-up from review [review-2026-10-31-2.md](../_review/review-2026-10-31-2.md), finding N3 (verdict: Fix now).

## Why

Review [review-2026-10-31-2.md](../_review/review-2026-10-31-2.md) N3. The regex guard misses `{"…"}`, template literals, ternaries, `alt={'…'}`, unlisted `aria-*`, module constants and text with `;` or `=`.

## Checklist

- [ ] Walk the TSX syntax tree (typescript is a devDependency) instead of matching regexes.
- [ ] Every bypass from the review is caught by a mutant check; the real components pass.

## Definition of Done

- [ ] `npm test` green; each bypass mutant goes red.
