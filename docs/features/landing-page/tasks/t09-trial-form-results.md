---
id: T9
title: "Add the thank-you, the send-failed banner with Instagram + LinkedIn, and generate_lead / trial_form_error to TrialForm"
layer: "ui"
deps: ["T4", "T8"]
blocks: ["T10"]
acs: ["AC-01", "AC-05", "AC-08", "AC-09"]
files_hint: ["src/components/trial-form/TrialForm.tsx", "public/teacher-celebrate.png"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "M"
context_budget: "M"
status: "todo"
step: ""
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

# T9 — Add the thank-you, the send-failed banner and the lead events to TrialForm

## Place in the sequence

- **Blocked by:** T4 — `events.ts`, T8 — TrialForm fields and sending · **Blocks:** T10 — TrialDialog · **Wave:** 3.
- **Lane:** shares `src/components/trial-form/TrialForm.tsx` with T8 — serialized (T8 first).

## Why (user story)

> **As a** Prospective student
> **I want** a clear way to reach Tetiana when sending fails, with my answers kept
> **So that** my request is not lost when something breaks
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

This task delivers SCR-03 and SCR-04: what the visitor sees, and what is recorded, once a send ends (US-01, US-03).

## Inlined context

> SCR-03 `default (success)`: the form is replaced in the same window by the celebrating teacher
> picture, "Thank you, ‹First name›! 🎉", the line "I'll contact you soon." (app copy) and a Close
> button. The heading takes focus and the region is `role="status"`. The first name is shown as
> plain text, never as HTML, with long names wrapping. `generate_lead` (`form_name: "trial_lesson"`)
> is recorded only after the confirmation. Confetti plays, except with reduced motion. Close → the
> next opening shows an empty form. `trap-field`: looks exactly like `default`, but nothing is sent
> and nothing is recorded. `known-email`: the same thank-you; nothing reveals the email was known.
>
> — `screens.md, SCR-03 default + trap-field + known-email, abridged` · full text: [screens.md](../screens.md)

> SCR-04 `default (error)`: the form stays on screen with every answer kept, and a banner above the
> Send button (`role="alert"`) says the request did not go through and offers links to write to
> Tetiana on Instagram and on LinkedIn (both open in a new tab). All three kinds of failure look the
> same; the kind goes only into `trial_form_error`, recorded once for this attempt. No
> `generate_lead`, no thank-you. `retry`: Send pressed again hides the banner and goes to `loading`;
> a failed validation on retry also hides it. There is no separate "Try again" button.
> `closed-and-back`: the next opening shows the form with every answer and the banner.
>
> — `screens.md, SCR-04 default + retry + closed-and-back, abridged` · full text: [screens.md](../screens.md)

> **Hard rule:** Submitted text is never shown back except the visitor's own first name, as plain
> text (no HTML injection). Analytics events carry no personal data.
>
> — `sad.md §8 Privacy + spec.md §6.1, abridged` · full text: [sad.md](../sad.md)

App source for the done view, confetti and `role="alert"` paragraph: `D:\VIBE CODING\app-englishpusher\src\shared\trialForm\TrialForm.tsx`; copy `src/assets/teacher-celebrate.png` → `public/teacher-celebrate.png`.

**Fallback:** read [spec.md](../spec.md) · [screens.md](../screens.md) · [sad.md](../sad.md). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — consumes T8's `onResult({ ok } | { ok: false, kind })` / `onTrapped()` and pushes `generateLead()` / `trialFormError(kind)` from `src/lib/events.ts` (T4). Exposes `onSent()` to the parent so T10 can empty the form for the next opening.

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

### AC-08 — domain invariant

> **Given** a Prospective student's send is still in progress, has failed, or was filled in by a bot through the hidden trap field
> **When** the page reacts to the send
> **Then** the invariant "a Trial lesson request counts only when the CRM confirms it" holds: no "generate_lead" event is ever recorded for an unconfirmed send, and a real visitor never sees the thank-you for a send in progress or a failed one; the one stated exception is the hidden trap field, where the bot is shown a thank-you so it learns nothing, while nothing is sent to the CRM and nothing is recorded
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

### AC-09 — authorization

> **Given** a Prospective student uses an email that already belongs to a contact in the CRM (a past lead or an existing student)
> **When** they send the trial form
> **Then** they see the same thank-you as a new visitor; the page never reveals whether the email was already known, so no visitor can use the form to find out who is a client
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `ok: true` → done view (SCR-03) with `{firstname}` as a React text node, focus on the heading, `role="status"`, confetti unless `prefers-reduced-motion`; then `pushEvent(window, generateLead())`; call `onSent()`.
- [ ] `ok: false` → keep values, show the `role="alert"` banner with `INSTAGRAM_URL` and `LINKEDIN_URL` (`target="_blank" rel="noopener"`), `pushEvent(window, trialFormError(kind))` once.
- [ ] Trap path → the same done view, no event, no `onSent` side effects beyond emptying.
- [ ] Next Send hides the banner (also when validation fails); validation failures push nothing.
- [ ] Copy `teacher-celebrate.png` into `public/`.

## Edge cases

| Case | Behaviour |
|---|---|
| HubSpot answers 2xx for a known email | Same thank-you (AC-09); the response body is never inspected for "existing contact". |
| Name with `<script>` | Rendered as text (React escapes); never `dangerouslySetInnerHTML`. |
| Two failed attempts in a row | Two `trial_form_error` events, one per attempt. |
| Window closed while sending, send then fails | Next opening shows the answers and the banner (SCR-04 `closed-and-back`). |

## Definition of Done

- [ ] Manual (dev server, `localhost`, Test form): a valid send shows "Thank you, ‹name›!" and `dataLayer` gets exactly one `generate_lead` after the 2xx; with the network offline the banner shows both links, answers are kept, and `dataLayer` gets one `trial_form_error` with `error_kind: "network"` and no `generate_lead`.
- [ ] every Hard Rule inlined above still holds
- [ ] `npm test && npm run check && npm run build` clean
