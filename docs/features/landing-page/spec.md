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

Committed approach: the page is a frame with **Interim copy**: a hero with a neutral headline and a
"Book a trial lesson" button, one short interim block with a second button, and a footer with links
to Tetiana's Instagram and LinkedIn (their clicks record the existing `contact_click` event). It has
no placeholder sections for roadmap step 3. Every call to action opens the same trial form the app
already uses. The form keeps the app's fields, language (English) and
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
  reliably as one sent from the app, and a Prospective student never loses typed answers while the
  page is open.
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
**Then** the one trial form opens in a window over the page and the page records "trial_form_open" once for that opening; if they close the window and later open it from a different button, the answers they had typed are still there for as long as the page stays open (reloading the page clears them); after a confirmed send, opening the form again shows an empty form

### AC-04 (US-02) — happy

**Given** a Prospective student follows a shared link to the Landing page that points straight at the trial form (an address ending in `#trial-lesson`, as in the app)
**When** the page loads
**Then** the trial form opens once, straight away, and the page records "trial_form_open" once for that opening; after they close it, `#trial-lesson` is removed from the address and the form does not reopen by itself while they scroll, read or reload the page

### AC-05 (US-03) — error

**Given** a Prospective student has filled in the trial form correctly
**When** sending fails because the CRM refuses it, the connection drops, or no answer comes within 15 seconds (the page then cancels the send and ignores any later answer)
**Then** the Prospective student sees that the request did not go through, with links to write to Tetiana on Instagram and on LinkedIn; every answer they typed stays in the form so they can try again; no "generate_lead" event is recorded; one "trial_form_error" event per failed attempt is recorded, naming only the kind of failure (rejected, network or timeout; no personal data), so the Operator can count lost requests; a send stopped by the form's own checks (AC-02) records nothing

### AC-06 (US-04) — cross-context

**Given** the CRM has confirmed a Trial lesson request sent from the Landing page
**When** the Leads Bot next checks for new requests
**Then** the Leads Bot handles it exactly as it handles a request from the app, with no change to the Leads Bot: a new deal in the existing pipeline and a lead card for Tetiana and the Operator, or, when the same person already has an open deal, a "submitted again" note (and silence for a repeat within two minutes)

### AC-07 (US-06) — cross-context

**Given** a Prospective student sends a Trial lesson request from the Landing page, with or without the visitor-tracking cookie (an ad blocker may remove it)
**When** the Operator opens that request in the CRM
**Then** the request's page-address field in the CRM shows the address the visitor first arrived at, including any campaign tags, even if the page has changed the address since (for example by removing `#trial-lesson`), so the Operator can tell it is a Landing lead and not a lead from the app

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
**Then** the invariant "Interim copy makes no promises" holds: nothing states a price, that the trial lesson is free, its length, or a learning result (any outcome claim such as "speak confidently at work" or "improve your English fast" is banned); the only offer is to book a trial lesson with Tetiana; Tetiana approves all Interim copy, including the form's headline and thank-you, before the page is published

### AC-11 (US-07) — domain invariant

**Given** the Landing page shows Interim copy
**When** a search engine visits the page or reads the site's list of pages offered for search
**Then** the invariant "Interim copy is never indexed" holds: the page can be crawled but asks not to be indexed, and it is left out of the list of pages offered for search; one setting marks the page as showing Interim copy and drives both rules, so the release that replaces the Interim copy lifts both at the same time; while the page is interim, the site's crawling rules allow crawling and point to the list of pages, and that list is published empty

### AC-12 (US-07) — happy

**Given** the Landing page is published at its own address
**When** a Prospective student opens that address, opens it without the secure prefix, or receives a shared link to it in a messenger or a social network
**Then** the page opens over a secure connection, the insecure address sends them to the secure one, and the link preview shows the page title, a neutral description and a brand image

### AC-13 (US-06) — authorization

**Given** the Operator runs the page on their own computer, in a preview, or anywhere other than the published Landing page (the published Landing page is the page opened at exactly `landing.englishpusher.in.ua`; the production build opened anywhere else counts as not published)
**When** they open the page and send the trial form
**Then** no analytics are recorded at all (no events, page views or session recordings, because the tag manager is not loaded) and the request goes to the Test form, which no lead handling reads, so no deal, Leads Bot card or report line appears (the CRM still records a contact for each test send, which the Operator deletes the same day); only the published Landing page sends to the live CRM form, and the one end-to-end check on the published page uses a clearly marked test name whose contact and deal the Operator deletes the same day

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Page speed (mobile) | Largest content shown ≤ 2.5 s at p75; mobile performance score ≥ 90 | Clarity Core Web Vitals filtered to the Landing page's host; a mobile Lighthouse run before each release |
| Send feedback | Thank-you or failure message within ≤ 15 s of sending, in 100% of sends | The 15-second cut-off in the form logic, covered by a unit test |
| Lead delivery | A confirmed Trial lesson request becomes a Leads Bot card within ≤ 10 min | Timestamps recorded in the end-to-end check (the bot polls every 5 min) |
| Lost sends | `trial_form_error` ÷ (`generate_lead` + `trial_form_error`) ≤ 5% per calendar month | GA4 events, counted per failed attempt (needs a tag-manager tag for `trial_form_error`) |
| Availability | ≥ 99.5% per calendar month | External uptime check on the Landing page's address, every ≤ 5 min (tool chosen in design) |
| Accessibility | Trial form fully usable by keyboard alone and by a screen reader: the window takes focus when it opens, Tab stays inside it, Escape closes it, and focus returns to the button that opened it; 0 serious or critical issues; Lighthouse accessibility score ≥ 95 | Before each release: an axe scan (serious/critical count), a Lighthouse run (score), and one manual screen-reader pass (NVDA or VoiceOver) through open → fill → send → close |
| Field parity | 100% of English-level and goal values sent are values the live CRM form accepts | A unit test pins the values to the app's copy (`options.ts`) |

## 6.1 Security / privacy

- **Data classification:** confidential, because the form carries the contact details of private persons.
- **Personal data touched:** the page stores nothing: typed answers live only in the open page and are
  never saved in the browser (AC-03). It passes the existing fields to the CRM: first
  name and email (required), English level, learning goals, a messenger handle or phone, and a free-text
  message (optional), all personal contact data. Analytics events carry no personal data
  (`trial_form_error` names only the kind of failure). No new fields (brief §5).
- **AuthZ/AuthN impact:** there is no login and the page is public. Two rules apply: only the published
  Landing page (opened at exactly `landing.englishpusher.in.ua`) sends to the live CRM form, and everything else sends to the Test form (AC-13); the form
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
- [ ] What is the Test form's ID? Default now: the Operator creates it in HubSpot with the same fields as the live "Trial lesson request" form and records its ID in the repo's config (AC-13). — owner: Operator, due: before `/sdd:tasks landing-page`
- [ ] What is Tetiana's LinkedIn address for the failure message (AC-05) and the footer? Default now: her own personal profile, confirmed by her. — owner: Operator with Tetiana, due: before `/sdd:tasks landing-page`

## Test plan

<!-- plan-tests (size S, route quick): inline plan. Every §5 AC maps to ≥1 test row; levels are generic. -->

### AC coverage

| AC (spec.md §5) | Test name (intent-based) | Level | How it runs | Expected outcome |
|---|---|---|---|---|
| AC-01 | a confirmed CRM answer is a successful send | unit | automated (T3) | any success answer from the CRM ends as "ok" |
| AC-01 | generate_lead carries only the trial_lesson form name | unit | automated (T4) | the event has exactly the event name and `form_name: "trial_lesson"`, no other keys |
| AC-01 | only a confirmed send shows the thank-you and records generate_lead | unit | automated (pure send-outcome helper in `src/lib/`) | "ok" gives thank-you + one generate_lead; every other outcome gives neither |
| AC-01 | visitor sends a valid form and is thanked by name | e2e-through-UI | manual, preview on the Test form (T9, T11) | thank-you greets the visitor by first name, then exactly one generate_lead appears in the event log |
| AC-02 | empty name and invalid email are reported with the app's messages | unit | automated (T2) | "enter your name" and "enter a valid email"; first problem field is the name when both fail |
| AC-02 | invalid form is not sent and keeps the other answers | e2e-through-UI | manual, dev (T8) | both messages shown, cursor on First name, no request leaves the page, other answers unchanged |
| AC-03 | each opening of the window records one trial_form_open | unit | automated (T10) | one event per opening; asking to open an already-open window records nothing |
| AC-03 | a confirmed send resets the form for the next opening | unit | automated (T10) | after "ok", the next opening starts empty; after close without sending, answers remain |
| AC-03 | answers survive closing and reopening from another button | e2e-through-UI | manual, preview (T10, T11) | answers kept across openings with one trial_form_open each; a reload clears them; focus enters the window, Tab stays inside, Escape closes, focus returns to the opener |
| AC-04 | an address ending in #trial-lesson opens the form on load | unit | automated (T10) | with the hash → open once; without it → stay closed |
| AC-04 | closing the window removes #trial-lesson and keeps the rest of the address | unit | automated (T10) | the address loses only the hash; path and campaign tags stay |
| AC-04 | a shared #trial-lesson link opens the form once and never again by itself | e2e-through-UI | manual, preview (T10, T11) | form opens straight away with one trial_form_open; after close the hash is gone and scrolling or reloading does not reopen it |
| AC-05 | a refused send is reported as rejected | unit | automated (T3) | a non-success CRM answer ends as "rejected" |
| AC-05 | a dropped connection is reported as network | unit | automated (T3) | a send that throws ends as "network" |
| AC-05 | no answer within 15 seconds is a timeout and a late answer is ignored | unit | automated (T3) | the send is cancelled at 15 s and ends as "timeout"; an answer arriving after that changes nothing |
| AC-05 | trial_form_error names only the kind of failure | unit | automated (T4) | the event carries the event name, the form name and the failure kind (rejected, network or timeout), and no personal data |
| AC-05 | a failed send shows the fallback and records one error per attempt | unit | automated (pure send-outcome helper in `src/lib/`) | each failure gives the fallback message + one trial_form_error and no generate_lead; a send stopped by the form's own checks records nothing |
| AC-05 | an offline send keeps every answer and offers Instagram and LinkedIn | e2e-through-UI | manual, dev or preview with the network off (T9, T11) | fallback message with both links, every answer kept, one trial_form_error with kind "network", no generate_lead; trying again records one more error |
| AC-06 | a published-page send reaches the Leads Bot like an app send | e2e | manual, published page, marked test name (T11) | a new deal in the existing pipeline and a lead card within 10 min; a second send with the same email gives a "submitted again" note; contact and deal deleted the same day |
| AC-06 | the published page sends to the same live CRM form and fields as the app | contract | automated (T1, T2) | on the live host the form ID is the live "Trial lesson request" form, and the field names and level/goal values match the app's copy |
| AC-07 | the send carries the entry address, not the current one | unit | automated (T3) | the page address in the request is the address the visitor arrived at, with campaign tags, even after #trial-lesson was removed |
| AC-07 | the send is valid with and without the visitor-tracking cookie | unit | automated (T3) | with the cookie it is included; without it the request is still well-formed and still carries the entry address |
| AC-07 | the CRM shows the landing address on a published-page lead | e2e | manual, published page entered through a campaign-tagged #trial-lesson link (T11) | the request's page-address field in the CRM holds the full entry address with the campaign tag |
| AC-08 | a filled trap field fakes success without sending | unit | automated (pure send-outcome helper in `src/lib/`) | thank-you shown, no request to the CRM, no event recorded |
| AC-08 | a send in progress or a failed send never counts as a lead | unit | automated (pure send-outcome helper in `src/lib/`) | while sending and after any failure: no thank-you, no generate_lead |
| AC-08 | a slow send shows the sending state, not the thank-you | e2e-through-UI | manual, dev with a throttled network (T8, T9) | the form shows that it is sending until the CRM answers; filling the hidden trap field shows a thank-you with no request and no event |
| AC-09 | any success answer gives the same result whatever its content | unit | automated (T3) | the outcome is "ok" for every success answer; nothing in the answer body changes it, so no "known contact" branch exists |
| AC-09 | a known email gets the same thank-you as a new one | e2e-through-UI | manual, preview on the Test form (T9, T11) | a send with an email already in the CRM and one with a new email show the identical thank-you |
| AC-10 | the built page states no price, free lesson, length or learning result | unit | automated, over the built page (runs after the build step; T7) | visible text, page title, description and link-preview text contain no currency amount, "free", lesson length or outcome claim from the spec's banned list |
| AC-10 | Tetiana approves every piece of Interim copy | e2e-through-UI | manual, release checklist before publishing (T11) | Tetiana has reviewed the page, the form, the thank-you, the failure message and the link preview, and approved them in writing |
| AC-11 | one interim setting closes indexing and empties the page list | unit | automated (T5) | interim: "do not index" and an empty page list; not interim: "index" and one address; crawling rules always allow crawling and name the page list |
| AC-11 | the built and published page asks not to be indexed | e2e | manual, after the build and after deploy (T6, T11) | the build and the live address serve the crawling rules, an empty page list, and the "do not index" request on the page |
| AC-12 | the published address is secure and shares with a preview | e2e | manual, after deploy (T11) | the insecure address redirects to the secure one, the certificate is valid, and a link shared in a messenger shows the title, a neutral description and the brand image |
| AC-13 | only the exact live host counts as published | unit | automated (T1) | true only for `landing.englishpusher.in.ua`; false for localhost, a `www.` or other subdomain, and any preview address |
| AC-13 | everything but the published page sends to the Test form | unit | automated (T1) | the form choice is the live form only when published, otherwise the Test form |
| AC-13 | a local preview loads no analytics and sends to the Test form | e2e | manual, local preview (T6, T8, T11) | no tag-manager request in the network log; the send appears only on the Test form in the CRM, with no deal and no Leads Bot card; the test contact is deleted the same day |

### Edge cases / error paths

Each error and authorization AC (AC-02, AC-05, AC-08, AC-09, AC-13) already has its own rows above.
The cases below are the boundaries those rows must include:

- Name made of spaces only → expected: treated as empty, "enter your name" (AC-02).
- Email with no domain part or with spaces → expected: "enter a valid email" (AC-02).
- Optional fields left empty → expected: the send goes ahead; empty optional fields do not block it (AC-01).
- CRM answers just before the 15-second cut-off → expected: the answer is used, no timeout (AC-05).
- CRM answers after the cut-off → expected: ignored; the visitor keeps the failure message and the event stays "timeout" (AC-05).
- Double press of the send button → expected: one request and at most one generate_lead (AC-08).
- Send pressed again after a failure → expected: a new attempt; a second failure records a second trial_form_error (AC-05).
- Address with campaign tags and #trial-lesson → expected: closing removes only the hash, and the CRM still gets the full entry address (AC-04, AC-07).
- Host with uppercase letters, a trailing dot, `www.` or a port → expected: never counts as published unless it is exactly the live host (AC-13).
- Visitor-tracking cookie removed by an ad blocker → expected: the send still succeeds and carries the entry address (AC-07).
- Failed send with a filled trap field → expected: impossible by design; the trap path never contacts the CRM (AC-08).

### Test data

- Seed strategy: small in-file fixtures per test — a valid answer set (first name, email, one level,
  one goal), an invalid set (blank name, bad email), entry addresses with and without campaign tags
  and `#trial-lesson`, and a list of host names for AC-13. Level and goal values come from the
  copied `options.ts`, never retyped.
- Integration dependency: <!-- N/A: the page owns no datastore, cache or queue. --> The only
  outside dependency is the CRM, and it is not mocked as a datastore. Unit tests replace only the
  network call (a fake that answers success, refuses, throws, or never answers, with a controllable
  clock for the 15-second cut-off). The real CRM is reached only by the manual e2e rows: the Test
  form for local and preview sends, and the live form once on the published page.
- Cleanup boundary: unit tests are per-test and stateless (fresh fixtures, the clock restored after
  each). Manual e2e sends: every Test form contact, and the one marked live test contact and deal,
  is deleted by the Operator the same day (AC-13), so the Monday report shows 0 test leads (§7).

### NFR validation (load)

<!-- N/A: no numeric load NFR. §6 has numbers, but none is a throughput or concurrency target for a load run: -->
The page is static and the send goes straight from the browser to the CRM, so there is nothing in
this repo to load. Each numeric §6 NFR is checked elsewhere:

- Send feedback ≤ 15 s → the AC-05 timeout unit test.
- Lead delivery ≤ 10 min → the AC-06 manual e2e (timestamps).
- Page speed (largest content ≤ 2.5 s at p75, mobile score ≥ 90) and accessibility (score ≥ 95,
  0 serious/critical issues, keyboard and screen-reader pass) → release checklist (T11) plus field
  data after launch.
- Lost sends ≤ 5% and availability ≥ 99.5% → monthly monitoring after launch (analytics events,
  uptime check); not a pre-release test.
- Field parity 100% → the AC-06 contract row (values pinned to the app's copy).

### CI placement

- On every PR (existing pipeline: tests, type check, build): all unit and contract rows. The AC-10
  copy scan needs the built page, so it runs after the build step: either as its own command
  outside the default test glob, or by building the page itself (implement picks).
- Before each release (manual, from the release checklist, T11): every e2e-through-UI row on the
  local preview with the Test form, then the AC-06, AC-07, AC-11, AC-12 e2e rows on the published
  page, plus the page-speed and accessibility runs.
- After launch (monitoring, not tests): lost sends and availability, read monthly.
