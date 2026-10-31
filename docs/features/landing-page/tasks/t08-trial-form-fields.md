---
id: T8
title: "Copy TrialForm.tsx: fields, pills, validation with focus, trap field and the sending state"
layer: "ui"
deps: ["T1", "T2", "T3"]
blocks: ["T9"]
acs: ["AC-02", "AC-08", "AC-13"]
files_hint: ["src/components/trial-form/TrialForm.tsx", "public/teacher-trial.png", "package.json", "package-lock.json"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "M"
context_budget: "M"
status: "blocked"
step: "dep T1 blocked"
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

# T8 — Copy TrialForm.tsx: fields, pills, validation with focus, trap field and the sending state

## Place in the sequence

- **Blocked by:** T1 — `site.ts` (form ID by host), T2 — `validate.ts` + `options.ts`, T3 — `hubspot.ts` · **Blocks:** T9 — thank-you, failure banner and events · **Wave:** 2.
- **Lane:** shares `src/components/trial-form/TrialForm.tsx` with T9 — serialized (T8 first).

## Why (user story)

> **As a** Prospective student
> **I want** to send a trial lesson request from the Landing page
> **So that** I get a trial lesson with Tetiana without hunting for a contact
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

This task delivers SCR-02 (the form itself) up to the moment a valid send is in flight; T9 adds what happens when it ends.

## Inlined context

> `TrialForm.tsx` — copied form: fields, validation, sending state, thank-you, send-failed message
> with Instagram + LinkedIn, trial_form_error. Two runtime dependencies copied along with the app's
> form: `lucide-react` (icons) and `canvas-confetti` (the thank-you confetti).
>
> — `sad.md §5 trial-form/TrialForm.tsx + §2 Technical, abridged` · full text: [sad.md](../sad.md)

> SCR-02 `default`: close button, the waving teacher picture, the headline and subline (app copy),
> First name * and Email *, the level pills, the goal pills, Telegram/Viber/phone (optional),
> Message (optional), the hidden trap field (invisible, out of the Tab order) and a full-width Send
> button "Book a trial lesson" (app copy). Focus moves to First name.
> `validation`: under each problem field "Please enter your name" / "Please enter your email" /
> "Please enter a valid email", with `aria-invalid` and `aria-describedby`. Focus moves to the first
> problem field, every other answer is kept, nothing is sent or recorded. Typing in a field clears
> its message. `loading`: Send disabled with a spinner and `aria-busy`; fields stay visible; no
> thank-you. The close button stays available and closing does not cancel the send.
> Components: TrialForm, Field, OptionPill, Icon X, Icon Loader2.
>
> — `screens.md, SCR-02 default + validation + loading, abridged` · full text: [screens.md](../screens.md)

> Svc->>Svc: Builds the submission with the entry address and the visitor-tracking cookie when
> present · Svc->>Svc: Picks the live form on the published host, otherwise the Test form
>
> — `sad.md §6, F4 steps 6–7, verbatim` · full text: [sad.md](../sad.md)

> **Hard rule:** Typed answers live only in the island's memory, never in `localStorage` /
> `sessionStorage` / cookies.
>
> — `sad.md §8, Privacy, abridged` · full text: [sad.md](../sad.md)

Source to copy: `D:\VIBE CODING\app-englishpusher\src\shared\trialForm\TrialForm.tsx` (320 lines; `honeypot` state at line 80/124/289) and `src/assets/teacher-trial.png` → `public/teacher-trial.png`. Keep the header comment naming the source path. The values must live in a parent-owned state (props `values` / `onChange`) or the component must stay mounted, because T10 keeps answers across openings.

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md) · [screens.md](../screens.md) or the app file. Do not guess.

## Data delta

No DB changes.

## API contract

Calls `submitTrialForm` from `src/lib/hubspot.ts` (T3) with `portalId = PORTAL_ID`, `formId = formIdFor(location.hostname)` (T1), `pageUri = readEntryAddress(window)`, `pageName = document.title`, `hutk = readHutk(document.cookie)`; it returns `{ ok } | { ok: false, kind }`.

— `tasks/t03-hubspot-submit.md, Checklist step 2, abridged`

## Acceptance criteria

### AC-02 — error

> **Given** a Prospective student has left the name empty or typed an email that is not a valid address
> **When** they send the form
> **Then** nothing is sent; next to each problem field the page says what is missing or wrong (enter your name; enter a valid email), the cursor moves to the first problem field, and every other answer they typed stays as it was
>
> — `spec.md §5, AC-02, verbatim` · full text: [spec.md](../spec.md)

### AC-08 — domain invariant

> **Given** a Prospective student's send is still in progress, has failed, or was filled in by a bot through the hidden trap field
> **When** the page reacts to the send
> **Then** the invariant "a Trial lesson request counts only when the CRM confirms it" holds: no "generate_lead" event is ever recorded for an unconfirmed send, and a real visitor never sees the thank-you for a send in progress or a failed one; the one stated exception is the hidden trap field, where the bot is shown a thank-you so it learns nothing, while nothing is sent to the CRM and nothing is recorded
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

### AC-13 — authorization

> **Given** the Operator runs the page on their own computer, in a preview, or anywhere other than the published Landing page (the published Landing page is the page opened at exactly `landing.englishpusher.in.ua`; the production build opened anywhere else counts as not published)
> **When** they open the page and send the trial form
> **Then** no analytics are recorded at all (no events, page views or session recordings, because the tag manager is not loaded) and the request goes to the Test form, which no lead handling reads, so no deal, Leads Bot card or report line appears (the CRM still records a contact for each test send, which the Operator deletes the same day); only the published Landing page sends to the live CRM form, and the one end-to-end check on the published page uses a clearly marked test name whose contact and deal the Operator deletes the same day
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `npm install lucide-react canvas-confetti` (+ `@types/canvas-confetti` dev) — versions as in the app's `package.json`.
- [ ] Copy `TrialForm.tsx` into `src/components/trial-form/` with the source-path header; import from `src/lib/{options,validate,hubspot,site}.ts`; copy `teacher-trial.png` into `public/`.
- [ ] Lift `values` into props (`values`, `onChange`) so the parent (T10) owns them; keep validation errors local.
- [ ] On Send: validate → on errors set them, focus the first problem field, send nothing; trap field filled → call `onTrapped()` (T9 renders the thank-you), send nothing; else set `sending`, call `submitTrialForm` with `formIdFor(location.hostname)`, and pass the result to `onResult(result)` (T9 handles both outcomes).
- [ ] Remove any app-only code that does not apply (the app's own `generate_lead` push moves to T9 via `events.ts`).

## Edge cases

| Case | Behaviour |
|---|---|
| Both name and email invalid | Both messages shown; focus on First name. |
| Send pressed twice while `sending` | Button is disabled; one request only. |
| Trap field filled | No `fetch`, no event; T9 shows the thank-you. |
| Opened on `localhost` | Sends to `TEST_FORM_ID` (AC-13). |

## Definition of Done

- [ ] `npm run check` and `npm run build` pass with the form compiled (mounted by T10; until then type-checked only).
- [ ] Manual (dev server, form temporarily rendered): empty name + bad email shows both messages, focus on First name, other answers kept, no network request; a valid send on `localhost` targets the Test form ID in the request URL.
- [ ] every Hard Rule inlined above still holds
- [ ] `npm test && npm run check && npm run build` clean
