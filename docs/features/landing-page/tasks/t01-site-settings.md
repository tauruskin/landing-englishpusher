---
id: T1
title: "Add src/lib/site.ts: live host, isPublished, live/Test form IDs and INTERIM_COPY"
layer: "domain"
deps: []
blocks: ["T5", "T6", "T8"]
acs: ["AC-11", "AC-13"]
files_hint: ["src/lib/site.ts", "src/lib/site.test.ts"]
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
`<file> §<section>, <identifier>, verbatim|abridged` — e.g. `spec.md §5, AC-02, verbatim`,
`data-model.md §Entities, table order, abridged`. Never «see the spec».

**Divergence risk.** An inline is a snapshot taken at breakdown time; upstream can move after it.
The source always wins — which is exactly why every chunk carries a signature pointing at where the
truth lives.

**To the executing agent:** work from what is inlined here. If a slice is insufficient, ambiguous,
or contradicts the code in front of you, open the named file for the full text and follow that.
Do not invent the missing part. -->

# T1 — Add src/lib/site.ts: live host, isPublished, live/Test form IDs and INTERIM_COPY

## Place in the sequence

- **Blocked by:** — · **Blocks:** T5 — SEO bodies from INTERIM_COPY, T6 — layout head, T8 — TrialForm sending · **Wave:** 1 (pure logic, no deps; one of four parallel starts).
- **Lane:** own lane.

## Why (user story)

> **As a** Operator
> **I want** each Landing lead and its form events to be recognisable as coming from the Landing page, with only real requests reaching the live pipeline
> **So that** I can count landing leads, and test the page without polluting the pipeline
>
> — `spec.md §4, US-06, verbatim` · full text: [spec.md](../spec.md)

This task supplies the one rule that decides "published" and the one setting that marks the copy as interim; the layout (T6), the SEO bodies (T5) and the form (T8) all read it.

## Inlined context

> **Chosen:** Option 1. **Exact host match in the browser, one shared constant** — `LIVE_HOST` and
> `isPublished(host)` in `src/lib/site.ts`; the form picks the live or Test form ID from it, and the
> layout passes the same constant to the inline GTM snippet through `define:vars`, which skips
> loading GTM when the host differs.
>
> — `adr/0001-choose-live-form-and-analytics-by-exact-runtime-host.md, Decision outcome + Option 1, abridged` · full text: [ADR-0001](../adr/0001-choose-live-form-and-analytics-by-exact-runtime-host.md)

> `site.ts (+ test)` — LIVE_HOST, isPublished(host), form IDs (live + Test), INTERIM_COPY
>
> — `sad.md §5, Internal decomposition, lib/site.ts, verbatim` · full text: [sad.md](../sad.md)

> **One setting marks the copy as interim.** `INTERIM_COPY` in `src/lib/site.ts` drives the
> `noindex` robots meta and the page's absence from `sitemap.xml`; `robots.txt` always allows
> crawling and points to the sitemap (AC-11). The release that replaces the Interim copy flips
> this one value.
>
> — `sad.md §4, choice 4, verbatim` · full text: [sad.md](../sad.md)

> HubSpot: portal `149535757`, region eu1, live form `2226dfee-47d4-406f-ae1a-2e8c0952dec2`.
> HubSpot: the Test form, with the same fields as the live form; its ID goes into `src/lib/site.ts`.
>
> — `sad.md §2 Technical + §7 one-time setup, abridged` · full text: [sad.md](../sad.md)

> **Hard rule:** Any host other than `landing.englishpusher.in.ua` (for example a future `www.`
> alias) silently sends to the Test form (ADR-0001). Adding a host means changing `LIVE_HOST`.
>
> — `sad.md §11, risk "Any host other than…", abridged` · full text: [sad.md](../sad.md)

> **Test isolation (AC-13).** How verify: a unit test of `isPublished()` and the form-ID choice.
>
> — `sad.md §10, QG-1 Test isolation, abridged` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface. (The form IDs are inputs to the HubSpot Forms submission URL built in T3; no `contracts/openapi.yaml` exists for this feature.)

## Acceptance criteria

### AC-13 — authorization

> **Given** the Operator runs the page on their own computer, in a preview, or anywhere other than the published Landing page (the published Landing page is the page opened at exactly `landing.englishpusher.in.ua`; the production build opened anywhere else counts as not published)
> **When** they open the page and send the trial form
> **Then** no analytics are recorded at all (no events, page views or session recordings, because the tag manager is not loaded) and the request goes to the Test form, which no lead handling reads, so no deal, Leads Bot card or report line appears (the CRM still records a contact for each test send, which the Operator deletes the same day); only the published Landing page sends to the live CRM form, and the one end-to-end check on the published page uses a clearly marked test name whose contact and deal the Operator deletes the same day
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

### AC-11 — domain invariant

> **Given** the Landing page shows Interim copy
> **When** a search engine visits the page or reads the site's list of pages offered for search
> **Then** the invariant "Interim copy is never indexed" holds: the page can be crawled but asks not to be indexed, and it is left out of the list of pages offered for search; one setting marks the page as showing Interim copy and drives both rules, so the release that replaces the Interim copy lifts both at the same time; while the page is interim, the site's crawling rules allow crawling and point to the list of pages, and that list is published empty
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Write `src/lib/site.test.ts` first: `isPublished("landing.englishpusher.in.ua")` is true; `localhost`, `127.0.0.1`, `tauruskin.github.io`, `www.landing.englishpusher.in.ua`, `landing.englishpusher.in.ua.evil.com`, `LANDING.englishpusher.in.ua:4321` and `""` are false; `formIdFor(host)` returns the live ID only for the live host and the Test ID otherwise; the live and Test IDs differ; `INTERIM_COPY === true`.
- [ ] `src/lib/site.ts`: export `LIVE_HOST = "landing.englishpusher.in.ua"`, `isPublished(host: string): boolean` (exact string equality, no suffix/prefix match), `PORTAL_ID = "149535757"`, `LIVE_FORM_ID = "2226dfee-47d4-406f-ae1a-2e8c0952dec2"`, `TEST_FORM_ID`, `formIdFor(host)`, `INTERIM_COPY = true`.
- [ ] Ask the Operator for the Test form ID (spec §8 open question); never fall back to the live ID.
- [ ] Delete `src/lib/smoke.test.ts` once this real test exists (its own comment says so).

## Edge cases

| Case | Behaviour |
|---|---|
| Host with a port (`localhost:4321`) or different case | Not published → Test form, no GTM (exact match on `location.hostname`, which carries no port). |
| A `www.` alias or the GitHub Pages default host | Not published (ADR-0001 negative consequence); only a `LIVE_HOST` change makes it live. |
| Test form ID not yet known | Stop and ask the Operator; do not commit a placeholder that equals the live ID. |

## Definition of Done

- [ ] `node --test src/lib/site.test.ts` passes, covering every host in the checklist and the form-ID choice.
- [ ] `TEST_FORM_ID` is the Operator's real Test form ID and differs from `LIVE_FORM_ID`.
- [ ] every Hard Rule inlined above still holds
- [ ] `npm test && npm run check` clean
