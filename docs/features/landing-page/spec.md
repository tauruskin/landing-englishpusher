---
status: Draft
owner: "Oleksandr Pushkar (Operator)"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-31"
feature_size: "S"
---

# Spec — landing-page

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (repo root; no feature-level glossary)
> **Reference module / docs / channels used:** [`docs/idea-brief.md`](../../idea-brief.md) (§2–§8),
> [`docs/roadmap.md`](../../roadmap.md) (steps 2, 4), [`docs/architecture-map.md`](../../architecture-map.md),
> [`docs/adr/0001`–`0003`](../../adr/), the app's trial form in `D:\VIBE CODING\app-englishpusher\src\shared\`
> (`TrialLessonForm.tsx`, `trialForm/`), brain notes `D:\brain\wiki\projects\Personal-EnglishpusherAnalytics.md`
> and `Personal-LeadsBot.md`.

## 1. Context

A stranger who reaches Englishpusher today lands on the app hub or the Moodle site. Both are built
for existing students, so too few strangers book a trial lesson (brief §2, owner-reported). The
direction agreed in the brief is a public **Landing page** that sells Tetiana's lessons to
**Prospective students** (IT or office professionals and general adults) and turns them into
**Trial lesson requests** in the existing lead pipeline (brief §7). This spec covers only the
**sales skeleton** of that page: the parts that work without Tetiana's content.

There is no external trigger (brief §4). The brief ended `needs-evidence`: Tetiana has not been
asked what the page should offer, and there is no proof yet that her posts drive clicks (roadmap
D1, D2). Both blockers are still open on 2026-10-31. What the skeleton contains does not depend on
the content of either answer, and the lead pipeline it plugs into is already live (since
2026-10-24), so it can be built now. A negative answer can still cancel it: if Tetiana does not
want the page (D1) or her posts bring too few visitors (D2), the roadmap falls back to improving the
app hub instead, and the skeleton becomes unused.

Committed approach: the page is a frame with **Interim copy**, and every call to action opens the
same trial form the app already uses. The form keeps the app's fields, language (English) and
validation, so requests land in the same CRM form and reach the deal pipeline, the Leads Bot and the
Monday report unchanged. It deliberately differs from the app's form in four ways (owner decisions
2026-10-31): one form serves every call to action on the page; a failed send also offers LinkedIn
next to Instagram; a failed send is recorded as an analytics event; and everything except the
published page sends to a Test form. Each request carries the page's address, so it is
recognisable as a **Landing lead** from day one. The page is served at its own secure address with
everything search engines and link previews need, but it asks search engines not to index it while
it shows interim copy. This rests on the brief's accepted constraints (§5) and on the failure-mode
review run for this spec: its sharpest risks were leads lost without trace, test submissions
polluting the live pipeline, and landing leads impossible to tell apart from app leads. Each of
those maps to an acceptance criterion below.

- Decision override: the brief's outcome is `needs-evidence` and its §7 rejected "specify now with
  assumptions". Rationale (owner, 2026-10-31): only the skeleton is specified now. Its content
  does not depend on Tetiana's answers or on the traffic test. Sales content stays in the fog
  (roadmap step 3) until D1 and D2 are resolved. Accepted cost: about a week of work that is lost if
  D1 or D2 comes back negative.
- Traceability: roadmap step 2 (trial form on the page) and step 4 (own address, ready for search)
  plus the page frame for step 3. Language (English), form placement (a window, as in the app) and
  indexing (closed until content) are owner decisions of 2026-10-31.

## 2. Goals

- Every Trial lesson request sent from the Landing page reaches the existing lead pipeline as
  reliably as one sent from the app, and a Prospective student never loses typed answers.
- Landing leads can be told apart from app leads and counted from the first request, so the
  brief's success measure can be tracked once the page launches.
- The page is ready for search and link sharing at its own address, without interim copy reaching
  search results or making promises Tetiana has not approved.

## 3. Non-goals

- **Sales content** (Tetiana's story, offers, formats, prices, testimonials, photos, FAQ): blocked on
  her answers (roadmap D1); it is a separate feature (roadmap step 3).
- **Splitting landing leads in the Leads Bot and the Monday report:** those workflows live outside
  this repo (roadmap step 5). This spec only makes each Landing lead recognisable.
- **Moving bio and post links to the page:** that is the launch (roadmap step 6). Until then, links
  keep pointing at the app.
- **New lead fields or a new lead flow:** the existing CRM form is reused as is (brief §5). Any field
  change must be made in this repo and in the app together.
- **A Ukrainian or multilingual version:** owner decision 2026-10-31, English like the app's form.
- **Spam protection beyond the hidden-field trap the app already uses:** accepted in ADR-0003;
  revisited only if abuse appears.

## 4. User stories

### US-01: Send a trial lesson request

**As a** Prospective student
**I want** to send a trial lesson request from the Landing page
**So that** I get a trial lesson with Tetiana without hunting for a contact

### US-02: Reach one form from anywhere

**As a** Prospective student
**I want** every "book a trial lesson" button, and a shared link to the form, to open the same trial form
**So that** I reach the form from wherever I am on the page, and what I already typed is still there

### US-03: Keep answers when sending fails

**As a** Prospective student
**I want** a clear way to reach Tetiana when sending fails, with my answers kept
**So that** my request is not lost when something breaks

### US-04: Handle landing requests as usual

**As a** Tetiana
**I want** requests from the Landing page to arrive as the usual Leads Bot card and deal
**So that** I handle them exactly like requests from the app

### US-05: No unapproved promises

**As a** Tetiana
**I want** the page to promise nothing I have not approved
**So that** no Prospective student arrives expecting a price, a free lesson or a result I did not offer

### US-06: Recognise and count landing leads

**As a** Operator
**I want** each Landing lead and its form events to be recognisable as coming from the Landing page, with only real requests reaching the live pipeline
**So that** I can count landing leads, and test the page without polluting the pipeline

### US-07: Own address, closed to search

**As a** Operator
**I want** the page at its own secure address with search and link-preview data ready, but kept out of search results while it shows Interim copy
**So that** the skeleton never lands in search results, and search can start the moment real content ships

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** a Prospective student has the trial form open on the Landing page
**When** they enter a name and a valid email (level, goals, messenger and message are optional) and send the form
**Then** the CRM confirms it received the Trial lesson request, the Prospective student sees a thank-you that greets them by name, and only then the page records the "generate_lead" event with the form name "trial_lesson"

### AC-02 (US-01) — error

**Given** a Prospective student has left the name empty or typed an email that is not a valid address
**When** they send the form
**Then** nothing is sent; next to each problem field the page says what is missing or wrong (enter your name; enter a valid email), the cursor moves to the first problem field, and every other answer they typed stays as it was

### AC-03 (US-02) — happy

**Given** a Prospective student is anywhere on the Landing page
**When** they press any "Book a trial lesson" button
**Then** the one trial form opens in a window over the page and the page records "trial_form_open" once for that opening; if they close the window and later open it from a different button, the answers they had typed are still there

### AC-04 (US-02) — happy

**Given** a Prospective student follows a shared link to the Landing page that points straight at the trial form
**When** the page loads
**Then** the trial form opens once, straight away; after they close it, it does not reopen by itself while they scroll or read the page

### AC-05 (US-03) — error

**Given** a Prospective student has filled in the trial form correctly
**When** sending fails because the CRM refuses it, the connection drops, or no answer comes within 15 seconds
**Then** the Prospective student sees that the request did not go through, with links to write to Tetiana on Instagram and on LinkedIn; every answer they typed stays in the form so they can try again; no "generate_lead" event is recorded; a "trial_form_error" event naming only the kind of failure (no personal data) is recorded so the Operator can count lost requests

### AC-06 (US-04) — cross-context

**Given** the CRM has confirmed a Trial lesson request sent from the Landing page
**When** the Leads Bot next checks for new requests
**Then** the Leads Bot handles it exactly as it handles a request from the app, with no change to the Leads Bot: a new deal in the existing pipeline and a lead card for Tetiana and the Operator, or, when the same person already has an open deal, a "submitted again" note (and silence for a repeat within two minutes)

### AC-07 (US-06) — cross-context

**Given** a Prospective student sends a Trial lesson request from the Landing page, with or without the visitor-tracking cookie (an ad blocker may remove it)
**When** the Operator opens that request in the CRM
**Then** the request carries the Landing page's address, including any campaign tags the visit arrived with, so the Operator can tell it is a Landing lead and not a lead from the app

### AC-08 (US-01) — domain invariant

**Given** a Prospective student's send is still in progress, has failed, or was filled in by a bot through the hidden trap field
**When** the page reacts to the send
**Then** the invariant "a Trial lesson request counts only when the CRM confirms it" holds: no "generate_lead" event is ever recorded for an unconfirmed send, and a real visitor never sees the thank-you for a send in progress or a failed one; the one stated exception is the hidden trap field, where the bot is shown a thank-you so it learns nothing, while nothing is sent to the CRM and nothing is recorded

### AC-09 (US-01) — authorization

**Given** a Prospective student uses an email that already belongs to a contact in the CRM (a past lead or an existing student)
**When** they send the trial form
**Then** they see the same thank-you as a new visitor; the page never reveals whether the email was already known, so no visitor can use the form to find out who is a client

### AC-10 (US-05) — domain invariant

**Given** the Landing page shows Interim copy
**When** a Prospective student reads any text on the page, the form, the page title and description shown in search results, or the preview of a shared link
**Then** the invariant "Interim copy makes no promises" holds: nothing states a price, that the trial lesson is free, its length, or a learning result; the only offer is to book a trial lesson with Tetiana

### AC-11 (US-07) — domain invariant

**Given** the Landing page shows Interim copy
**When** a search engine visits the page or reads the site's list of pages offered for search
**Then** the invariant "Interim copy is never indexed" holds: the page can be crawled but asks not to be indexed, and it is left out of the list of pages offered for search; the release that replaces the Interim copy lifts both at the same time

### AC-12 (US-07) — happy

**Given** the Landing page is published at its own address
**When** a Prospective student opens that address, opens it without the secure prefix, or receives a shared link to it in a messenger or a social network
**Then** the page opens over a secure connection, the insecure address sends them to the secure one, and the link preview shows the page title, a neutral description and a brand image

### AC-13 (US-06) — authorization

**Given** the Operator runs the page on their own computer, in a preview, or anywhere other than the published Landing page
**When** they open the page and send the trial form
**Then** no analytics events are recorded and the request goes to the Test form, which no lead handling reads, so no deal, Leads Bot card or report line appears (the CRM still records a contact for each test send, which the Operator deletes the same day); only the published Landing page sends to the live CRM form, and the one end-to-end check on the published page uses a clearly marked test name whose contact and deal the Operator deletes the same day

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Page speed (mobile) | Largest content shown ≤ 2.5 s at p75; mobile performance score ≥ 90 | Clarity Core Web Vitals filtered to the Landing page's host; a mobile Lighthouse run before each release |
| Send feedback | Thank-you or failure message within ≤ 15 s of sending, in 100% of sends | The 15-second cut-off in the form logic, covered by a unit test |
| Lead delivery | A confirmed Trial lesson request becomes a Leads Bot card within ≤ 10 min | Timestamps recorded in the end-to-end check (the bot polls every 5 min) |
| Lost sends | `trial_form_error` ÷ (`generate_lead` + `trial_form_error`) ≤ 5% per calendar month | GA4 events (needs a tag-manager tag for `trial_form_error`) |
| Availability | ≥ 99.5% per calendar month | External uptime check on the Landing page's address, every ≤ 5 min (tool chosen in design) |
| Accessibility | Trial form fully usable by keyboard alone and by a screen reader; 0 serious or critical issues; accessibility score ≥ 95 | Automated accessibility check (Lighthouse) before each release |
| Field parity | 100% of English-level and goal values sent are values the live CRM form accepts | A unit test pins the values to the app's copy (`options.ts`) |

## 6.1 Security / privacy

- **Data classification:** confidential, because the form carries the contact details of private persons.
- **Personal data touched:** the page stores nothing. It passes the existing fields to the CRM: first
  name and email (required), English level, learning goals, a messenger handle or phone, and a free-text
  message (optional), all personal contact data. Analytics events carry no personal data
  (`trial_form_error` names only the kind of failure). No new fields (brief §5).
- **AuthZ/AuthN impact:** there is no login and the page is public. Two rules apply: only the published
  Landing page sends to the live CRM form, and everything else sends to the Test form (AC-13); the form
  never reveals whether an email is already known (AC-09). The CRM form and portal identifiers are
  public by design (ADR-0003).
- **Abuse cases:**
  - Spam bots: the hidden trap field stays (ADR-0003). A bot that fills it sees a thank-you and nothing is
    sent (AC-08). Bots that get past it create junk contacts and deals, which the Operator deletes. More
    than 3 junk requests in a week reopens ADR-0003 (rate limiting or a challenge).
  - Contact enumeration (does this email belong to a client?): hidden. Every send gets the same
    thank-you (AC-09).
  - Injection through text fields: the page never shows submitted text back, except the visitor's own
    first name on their thank-you, as plain text.
  - Address discovered before launch (new certificates are public): accepted. Interim copy makes no
    promises (AC-10) and asks not to be indexed (AC-11).
- **Security review:** N/A. These are the same fields the app already collects through the same CRM
  form, there is no new access boundary, and the size is S.

## 7. Metrics / KPIs

- **Landing leads that carry the page address** — baseline: 0 (page not live), target: 100% of
  Landing leads in the CRM carry the Landing page's address, checked on the first real one and in a
  monthly sample.
- **Lost sends** — baseline: unknown (the app records no failures), target: ≤ 5% of sends per month,
  first read 30 days after the page is published.
- **Form completion** (`generate_lead` ÷ `trial_form_open`) — baseline: TBD, measured as the app's rate
  over Oct–Nov 2026 in GA4 by the Operator (a GA4 tag for `trial_form_open` is needed first), target:
  the Landing page at or above the app's rate within 60 days of launch.
- **Test leads left in the live pipeline** — baseline: 1 (the uncleaned app test lead), target: 0 in
  every Monday report after the page is published.
- **Stranger trial requests from the page** (north star, brief §7) — baseline: 0, target: 2–4 a month
  attributed to the Landing page within ~3 months of launch (roadmap step 6). The skeleton does not
  reach this by itself. It makes it countable.

## 8. Open questions

- [ ] Who lifts the "do not index" request, and when? Default now: the release that replaces the Interim copy lifts it and adds the page to the search list (AC-11). — owner: Operator, due: before the sales-content spec (roadmap step 3)
- [ ] Should Landing page visits and contact-link clicks stay in the same analytics reports as the app's (the existing `contact_click` and `app_click` key events)? Default now: same container, reports filtered by host. — owner: Operator, due: before the reports spec (roadmap step 5)
- [ ] How is drift detected between the Landing page's form copy, the app's form, the live CRM form and the Test form? Default now: the field-parity unit test plus a note in both repos. — owner: Operator, due: before `/sdd:tasks landing-page`
- [ ] Does the Leads Bot read only the live CRM form, or every form (its notes say it "catches leads from any future form")? Default now: check the polling workflow and, if needed, limit it to the live form, so the Test form stays out of deals, cards and reports (AC-13). — owner: Operator, due: before `/sdd:tasks landing-page`
- [ ] Does the trial form need a personal-data notice or consent line (for the app's form too)? Default now: none, as in the app. — owner: Operator with Tetiana, due: before launch (roadmap step 6)
