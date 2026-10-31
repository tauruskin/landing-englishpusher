---
id: T4
title: "Add src/lib/events.ts: dataLayer payloads for trial_form_open, generate_lead, trial_form_error"
layer: "domain"
deps: []
blocks: ["T9", "T10"]
acs: ["AC-01", "AC-05"]
files_hint: ["src/lib/events.ts", "src/lib/events.test.ts"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
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

# T4 — Add src/lib/events.ts: dataLayer payloads for trial_form_open, generate_lead, trial_form_error

## Place in the sequence

- **Blocked by:** — · **Blocks:** T9 — TrialForm results and events, T10 — TrialDialog · **Wave:** 1 (pure logic, parallel start).
- **Lane:** own lane.

## Why (user story)

> **As a** Operator
> **I want** each Landing lead and its form events to be recognisable as coming from the Landing page, with only real requests reaching the live pipeline
> **So that** I can count landing leads, and test the page without polluting the pipeline
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

This task fixes the exact shape of the three form events, with no personal data, so the form and the dialog cannot drift from the app's names.

## Inlined context

> | Analytics events | `dataLayer` only, through GTM: `trial_form_open` once per opening, `generate_lead`
> (`form_name: "trial_lesson"`) only after HubSpot confirms, `trial_form_error` (`form_name`,
> `error_kind: rejected / network / timeout`) once per failed attempt. No personal data in any
> event. | `src/lib/events.ts`, `CLAUDE.md` |
>
> — `sad.md §8, Analytics events, abridged` · full text: [sad.md](../sad.md)

> Off the published host, `dataLayer` pushes land in an array that nothing reads: harmless, and
> simpler than gating every push.
>
> — `sad.md §11, Accepted debt, verbatim` · full text: [sad.md](../sad.md)

App precedent: `TrialLessonForm.tsx` pushes `{ event: "trial_form_open" }`; `TrialForm.tsx` pushes through `(window as …).dataLayer?.push(data)`.

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface. `dataLayer` payloads: `{ event: "trial_form_open" }` · `{ event: "generate_lead", form_name: "trial_lesson" }` · `{ event: "trial_form_error", form_name: "trial_lesson", error_kind }`.

## Acceptance criteria

### AC-01 — happy

> **Given** a Prospective student has the trial form open on the Landing page
> **When** they enter a name and a valid email (level, goals, messenger and message are optional) and send the form
> **Then** the CRM confirms it received the Trial lesson request, the Prospective student sees a thank-you that greets them by name, and only then the page records the "generate_lead" event with the form name "trial_lesson"
>
> — `spec.md §5, AC-01, verbatim` · full text: [spec.md](../spec.md)

### AC-05 — error

> **Given** a Prospective student has filled in the trial form correctly
> **When** sending fails because the CRM refuses it, the connection drops, or no answer comes within 15 seconds (the page then cancels the send and ignores any later answer)
> **Then** the Prospective student sees that the request did not go through, with links to write to Tetiana on Instagram and on LinkedIn; every answer they typed stays in the form so they can try again; no "generate_lead" event is recorded; one "trial_form_error" event per failed attempt is recorded, naming only the kind of failure (rejected, network or timeout; no personal data), so the Operator can count lost requests; a send stopped by the form's own checks (AC-02) records nothing
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `src/lib/events.ts`: pure builders `trialFormOpen()`, `generateLead()`, `trialFormError(kind)` and `pushEvent(target, payload)` that appends to `target.dataLayer`, creating the array if missing.
- [ ] `src/lib/events.test.ts`: exact payload shapes; `trialFormError` accepts only the three kinds; no payload has keys beyond `event`, `form_name`, `error_kind`; `pushEvent` on an object without `dataLayer` creates it.

## Edge cases

| Case | Behaviour |
|---|---|
| GTM not loaded (off the published host) | Push still goes into a plain array, nothing reads it (accepted debt). |
| Caller passes personal data | Not possible: builders take no free-form input beyond `kind`. |

## Definition of Done

- [ ] `node --test src/lib/events.test.ts` passes with the exact payloads above.
- [ ] `npm test && npm run check` clean
