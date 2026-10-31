---
id: T2
title: "Copy validate.ts and options.ts from the app, pin field parity, add the LinkedIn address"
layer: "domain"
deps: []
blocks: ["T7", "T8"]
acs: ["AC-02"]
files_hint: ["src/lib/validate.ts", "src/lib/validate.test.ts", "src/lib/options.ts", "src/lib/options.test.ts"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "M"
status: "done"
step: "COMMIT"
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

# T2 — Copy validate.ts and options.ts from the app, pin field parity, add the LinkedIn address

## Place in the sequence

- **Blocked by:** — · **Blocks:** T7 — static sections (Footer links), T8 — TrialForm fields · **Wave:** 1 (pure logic, parallel start).
- **Lane:** own lane.

## Why (user story)

> **As a** Prospective student
> **I want** to send a trial lesson request from the Landing page
> **So that** I get a trial lesson with Tetiana without hunting for a contact
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

This task brings over the app's name/email rules and the field values the live CRM form accepts, unchanged.

## Inlined context

> `validate.ts (+ test)` copied: name and email rules · `options.ts (+ test)` copied: level and goal
> values pinned to the app (field parity), Instagram and LinkedIn addresses
>
> — `sad.md §5, Internal decomposition, lib/validate.ts + lib/options.ts, abridged` · full text: [sad.md](../sad.md)

> | Field parity | 100% of English-level and goal values sent are values the live CRM form accepts | A unit test pins the values to the app's copy (`options.ts`) |
>
> — `spec.md §6, NFR Field parity, verbatim` · full text: [spec.md](../spec.md)

> **Hard rule:** Code copied from `app-englishpusher` stays a copy (not a package) and keeps a header
> comment naming its source path; a HubSpot field change is made in both repos.
>
> — `sad.md §2, Conventions, verbatim` · full text: [sad.md](../sad.md)

> Tetiana's LinkedIn address is not confirmed yet (footer and send-failed message) — confirm her
> personal profile with Tetiana and record it in `src/lib/options.ts`.
>
> — `sad.md §11, risk "Tetiana's LinkedIn address…", abridged` · full text: [sad.md](../sad.md)

Sources to copy: `D:\VIBE CODING\app-englishpusher\src\shared\trialForm\validate.ts`, `validate.test.ts`, `options.ts` (`LEVELS`, `GOALS`, `INSTAGRAM_URL`, `TrialFormValues`, `EMPTY_VALUES`).

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md) or the app files in full. Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-02 — error

> **Given** a Prospective student has left the name empty or typed an email that is not a valid address
> **When** they send the form
> **Then** nothing is sent; next to each problem field the page says what is missing or wrong (enter your name; enter a valid email), the cursor moves to the first problem field, and every other answer they typed stays as it was
>
> — `spec.md §5, AC-02, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Copy `validate.ts` + `validate.test.ts` into `src/lib/` with a header comment naming `app-englishpusher/src/shared/trialForm/validate.ts`; fix the import to `./options.ts`.
- [ ] Copy `options.ts` into `src/lib/` with its source-path header; add `LINKEDIN_URL` (the Operator-confirmed profile).
- [ ] `src/lib/options.test.ts`: pin every `LEVELS[].value` (EN DASH included) and `GOALS[].value` to the exact strings in the app's `options.ts`; assert `INSTAGRAM_URL` and `LINKEDIN_URL` are `https://` URLs.

## Edge cases

| Case | Behaviour |
|---|---|
| Name of only spaces | "Please enter your name" (trimmed). |
| Email `anna@mail` | "Please enter a valid email". |
| LinkedIn address unconfirmed | Stop and ask the Operator (spec §8); do not invent a URL. |

## Definition of Done

- [ ] `node --test src/lib/validate.test.ts src/lib/options.test.ts` passes; the parity test fails if any level/goal value is edited.
- [ ] Both copied files carry the source-path header.
- [ ] `npm test && npm run check` clean
