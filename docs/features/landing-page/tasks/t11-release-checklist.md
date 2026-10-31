---
id: T11
title: "Write the release checklist: one-time setup, pre-publish checks and the end-to-end send"
layer: "docs"
deps: ["T6", "T10"]
blocks: []
acs: ["AC-06", "AC-10", "AC-12", "AC-13"]
files_hint: ["docs/features/landing-page/release-checklist.md"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
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

# T11 — Write the release checklist: one-time setup, pre-publish checks and the end-to-end send

## Place in the sequence

- **Blocked by:** T6 — layout head (preview meta, GTM gate), T10 — TrialDialog (the whole form flow exists) · **Blocks:** — · **Wave:** 6 (last).
- **Lane:** own lane. The agent writes the checklist; the Operator executes it (CLAUDE.md: "UI and the HubSpot integration are checked by a manual end-to-end submit").

## Why (user story)

> **As a** Tetiana
> **I want** requests from the Landing page to arrive as the usual Leads Bot card and deal
> **So that** I handle them exactly like requests from the app
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

This task turns the setup outside the code and the manual checks into one ordered list, so the published page is proven to feed the pipeline before launch.

## Inlined context

> One-time setup outside the code: DNS `CNAME` record `landing` → `tauruskin.github.io`; GitHub
> Pages "Enforce HTTPS" switched on (AC-12); HubSpot: the Test form, with the same fields as the
> live form, its ID in `src/lib/site.ts`; Leads Bot: confirmed (or limited) to read only the live
> form; GTM: GA4 event tags for `trial_form_open` and `trial_form_error`; n8n uptime workflow on
> Hetzner: requests the page every 5 min, up = success status + page title, one Google Sheet row
> per check, two failures in a row → Telegram alert.
>
> — `sad.md §7, Deployment view + Monitoring, abridged` · full text: [sad.md](../sad.md)

> **Lead delivery** ≤ 10 min (timestamps in the end-to-end check) · **Accessibility** before each
> release: an axe scan (serious/critical count), a Lighthouse run (score ≥ 95), one manual
> screen-reader pass (NVDA or VoiceOver) through open → fill → send → close · **Page speed** a
> mobile Lighthouse run (performance ≥ 90).
>
> — `spec.md §6, NFR Lead delivery + Accessibility + Page speed, abridged` · full text: [spec.md](../spec.md)

> F5: after a timeout the CRM may still have received the request, so "try again" can create a
> second submission. The Leads Bot's duplicate check (F6) absorbs it — noted for the end-to-end
> check.
>
> — `sad.md §6, Flagged by sequences, abridged` · full text: [sad.md](../sad.md)

> Open before publishing: Leads Bot reads only the live form? · Test form ID · Tetiana's LinkedIn
> address · drift detection between the four form copies (default: parity test + a note in both
> repos) · a personal-data notice (before launch).
>
> — `spec.md §8, Open questions, abridged` · full text: [spec.md](../spec.md)

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-06 — cross-context

> **Given** the CRM has confirmed a Trial lesson request sent from the Landing page
> **When** the Leads Bot next checks for new requests
> **Then** the Leads Bot handles it exactly as it handles a request from the app, with no change to the Leads Bot: a new deal in the existing pipeline and a lead card for Tetiana and the Operator, or, when the same person already has an open deal, a "submitted again" note (and silence for a repeat within two minutes)
>
> — `spec.md §5, AC-06, verbatim` · full text: [spec.md](../spec.md)

### AC-10 — domain invariant

> **Given** the Landing page shows Interim copy
> **When** a Prospective student reads any text on the page, the form, the page title and description shown in search results, or the preview of a shared link
> **Then** the invariant "Interim copy makes no promises" holds: nothing states a price, that the trial lesson is free, its length, or a learning result (any outcome claim such as "speak confidently at work" or "improve your English fast" is banned); the only offer is to book a trial lesson with Tetiana; Tetiana approves all Interim copy, including the form's headline and thank-you, before the page is published
>
> — `spec.md §5, AC-10, verbatim` · full text: [spec.md](../spec.md)

### AC-12 — happy

> **Given** the Landing page is published at its own address
> **When** a Prospective student opens that address, opens it without the secure prefix, or receives a shared link to it in a messenger or a social network
> **Then** the page opens over a secure connection, the insecure address sends them to the secure one, and the link preview shows the page title, a neutral description and a brand image
>
> — `spec.md §5, AC-12, verbatim` · full text: [spec.md](../spec.md)

### AC-13 — authorization

> **Given** the Operator runs the page on their own computer, in a preview, or anywhere other than the published Landing page (the published Landing page is the page opened at exactly `landing.englishpusher.in.ua`; the production build opened anywhere else counts as not published)
> **When** they open the page and send the trial form
> **Then** no analytics are recorded at all (no events, page views or session recordings, because the tag manager is not loaded) and the request goes to the Test form, which no lead handling reads, so no deal, Leads Bot card or report line appears (the CRM still records a contact for each test send, which the Operator deletes the same day); only the published Landing page sends to the live CRM form, and the one end-to-end check on the published page uses a clearly marked test name whose contact and deal the Operator deletes the same day
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Create `docs/features/landing-page/release-checklist.md` with three ordered sections, each item a checkbox naming who does it and the AC/NFR it proves:
  1. **One-time setup** — the six §7 items above, plus: confirm the Leads Bot polls only the live form (or limit it), record Tetiana's LinkedIn address, replace `og-image.png` if T6 shipped a placeholder.
  2. **Before publishing** — Tetiana approves every visible string (page, form headline, thank-you, meta, preview) against AC-10; a local send on `localhost` lands in the Test form only (no deal, no Leads Bot card; delete the contact); axe + Lighthouse (a11y ≥ 95, mobile performance ≥ 90) + one screen-reader pass.
  3. **On the published page** — `http://` redirects to `https://`; a shared link in Telegram shows title, description and image; `robots.txt` / empty `sitemap.xml` / `noindex` present; one end-to-end send with a clearly marked test name → HubSpot page-address field shows the entry address with UTM tags, a deal + Leads Bot card within 10 min (record timestamps), GA4 shows `trial_form_open` + `generate_lead`; a second send within 2 min stays silent; delete the test contact and deal the same day.
- [ ] Add a short "Drift" note: a HubSpot field change goes into both repos, the parity test pins the values.

## Edge cases

| Case | Behaviour |
|---|---|
| The Leads Bot reads every form | Publishing is blocked until it is limited to the live form (sad §11 High risk). |
| Retry after a timeout created two submissions | Expected; the bot's duplicate check absorbs it — note it in the E2E result. |
| Tetiana has not approved the copy | Do not publish (push to `main` deploys). |

## Definition of Done

- [ ] `docs/features/landing-page/release-checklist.md` exists with the three sections, and every item names its owner and the AC or NFR it proves (AC-06, AC-10, AC-12, AC-13 each appear at least once).
- [ ] Markdown links in it resolve.
