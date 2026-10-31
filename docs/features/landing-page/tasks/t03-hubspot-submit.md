---
id: T3
title: "Copy hubspot.ts: submission with entry address and hubspotutk, 15 s cut-off, failure kind"
layer: "domain"
deps: []
blocks: ["T8"]
acs: ["AC-05", "AC-07"]
files_hint: ["src/lib/hubspot.ts", "src/lib/hubspot.test.ts"]
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

# T3 — Copy hubspot.ts: submission with entry address and hubspotutk, 15 s cut-off, failure kind

## Place in the sequence

- **Blocked by:** — · **Blocks:** T8 — TrialForm sending · **Wave:** 1 (pure logic, parallel start).
- **Lane:** own lane. Takes the form ID as a parameter, so it does not import `site.ts` (T1 runs in parallel).

## Why (user story)

> **As a** Prospective student
> **I want** a clear way to reach Tetiana when sending fails, with my answers kept
> **So that** my request is not lost when something breaks
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

This task makes every send end within 15 s as either confirmed or one named kind of failure, and carries the entry address that marks a Landing lead (US-06).

## Inlined context

> `hubspot.ts (+ test)` copied: buildSubmission (entry address, hubspotutk), 15 s cut-off,
> failure kind (rejected | network | timeout)
>
> — `sad.md §5, Internal decomposition, lib/hubspot.ts, verbatim` · full text: [sad.md](../sad.md)

> **The page address sent with each request is the address the visitor arrived at.** An inline
> script at the top of `<head>` records `location.href` in page memory before anything can change
> the address; the form sends that value as the page address, plus `hubspotutk` when the cookie
> exists (AC-07).
>
> — `sad.md §4, choice 3, verbatim` · full text: [sad.md](../sad.md)

> Svc->>CRM: Sends the submission, cut off after 15 s · CRM refuses → kind of failure is rejected ·
> Connection drops → kind of failure is network · No answer within 15 s → Cancels the send and
> ignores any later answer, kind of failure is timeout
>
> — `sad.md §6, F4 step "Sends the submission" + F5 alt branches, abridged` · full text: [sad.md](../sad.md)

> **Send feedback.** How verify: a unit test of the 15-second cut-off in `src/lib/hubspot.ts` (a
> request that never answers ends as `timeout` at 15 s and a later answer is ignored).
>
> — `sad.md §10, QG-1 Send feedback, abridged` · full text: [sad.md](../sad.md)

> **Hard rule:** Copied code keeps a header comment with its source path. Analytics events carry no
> personal data (`trial_form_error` names only the kind of failure).
>
> — `sad.md §8 Copied code + spec.md §6.1 Personal data, abridged` · full text: [sad.md](../sad.md)

Source to copy: `D:\VIBE CODING\app-englishpusher\src\shared\trialForm\hubspot.ts` + `hubspot.test.ts` (`readHutk`, `buildSubmission`, `timeoutSignal`, `submitTrialForm`). The app version hard-codes `FORM_ID`, reads `window.location.href` at send time and throws one generic error — all three change here.

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md) or the app file in full. Do not guess.

## Data delta

No DB changes.

## API contract

- `POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formId}` (HubSpot Forms API, public, no key) → `2xx` = confirmed; any non-2xx = `rejected`; fetch throws (offline, DNS, CORS) = `network`; abort after 15 000 ms = `timeout`.
- Body: `{ fields: [{ objectTypeId: "0-1", name, value }], context: { pageUri, pageName, hutk? } }`; field names `firstname`, `email`, `english_level`, `learning_goals` (`;`-joined), `messenger_contact`, `message`; empty optional fields not sent.

— `app-englishpusher/src/shared/trialForm/hubspot.ts, buildSubmission + submitTrialForm, abridged` · full text: the app file

## Acceptance criteria

### AC-05 — error

> **Given** a Prospective student has filled in the trial form correctly
> **When** sending fails because the CRM refuses it, the connection drops, or no answer comes within 15 seconds (the page then cancels the send and ignores any later answer)
> **Then** the Prospective student sees that the request did not go through, with links to write to Tetiana on Instagram and on LinkedIn; every answer they typed stays in the form so they can try again; no "generate_lead" event is recorded; one "trial_form_error" event per failed attempt is recorded, naming only the kind of failure (rejected, network or timeout; no personal data), so the Operator can count lost requests; a send stopped by the form's own checks (AC-02) records nothing
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

### AC-07 — cross-context

> **Given** a Prospective student sends a Trial lesson request from the Landing page, with or without the visitor-tracking cookie (an ad blocker may remove it)
> **When** the Operator opens that request in the CRM
> **Then** the request's page-address field in the CRM shows the address the visitor first arrived at, including any campaign tags, even if the page has changed the address since (for example by removing `#trial-lesson`), so the Operator can tell it is a Landing lead and not a lead from the app
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Copy `hubspot.ts` + `hubspot.test.ts` into `src/lib/` with the source-path header; keep `readHutk` and `buildSubmission` behaviour.
- [ ] Change `submitTrialForm` to take `{ portalId, formId, values, pageUri, pageName, hutk?, fetchImpl?, timeoutMs = 15000 }` and resolve to `{ ok: true } | { ok: false, kind: "rejected" | "network" | "timeout" }` instead of throwing.
- [ ] Add `readEntryAddress(win)`: returns the value the head script stored (T6 writes it as `window.__entryHref`; export the key name as a constant) and falls back to `location.href` when absent.
- [ ] Tests with a fake `fetch`: 200 → ok; 400 → `rejected`; fetch rejects with `TypeError` → `network`; never-resolving fetch → `timeout` at 15 s (use a short `timeoutMs` or mock timers) and a late response after abort is ignored; `pageUri` equals the passed entry address with UTM tags and `#trial-lesson`; `hutk` present only when the cookie exists.

## Edge cases

| Case | Behaviour |
|---|---|
| No `hubspotutk` cookie (ad blocker) | `context.hutk` omitted; `pageUri` still sent (AC-07). |
| CRM answers after the 15 s abort | Ignored; the result stays `timeout`. |
| Response 2xx after a timeout already fired on a retry | Each call has its own signal; only the current call's result counts. |
| Error text from HubSpot | Never surfaced in an event (no personal data); only `kind` leaves the function. |

## Definition of Done

- [ ] `node --test src/lib/hubspot.test.ts` passes, covering the three failure kinds, the 15 s cut-off with a late answer ignored, and `pageUri` = entry address.
- [ ] The file carries the source-path header.
- [ ] `npm test && npm run check` clean
