# Changelog — landing-page

## landing-page — the sales skeleton: a public page whose every button opens the trial form

**What:** A public Landing page at `https://landing.englishpusher.in.ua` with Interim copy (a hero,
one short interim block, a footer with Tetiana's Instagram and LinkedIn). Every "Book a trial
lesson" button, and any link ending in `#trial-lesson`, opens the same trial form in a window. The
form is the app's form (same fields, English, validation) and sends to the existing HubSpot form,
so landing requests reach the deal pipeline, the Leads Bot and the Monday report unchanged. Each
request carries the address the visitor arrived at, campaign tags included, so it is recognisable
as a Landing lead. A failed send keeps every answer, offers Instagram and LinkedIn, and records a
`trial_form_error` event. The page is ready for search and link previews, but asks not to be
indexed while it shows Interim copy.

**Why:** Strangers who reach the app hub or Moodle rarely book a trial, because both are built for
existing students ([spec §1](spec.md)). This ships only the skeleton, the part that does not depend
on Tetiana's content or the traffic test (roadmap D1, D2). Sales content stays roadmap step 3. Key
decisions:

- Astro static site with one React island, on GitHub Pages, no backend: the browser posts straight
  to the HubSpot Forms API ([ADR-0001](../../adr/0001-astro-static-site-with-react-island.md),
  [ADR-0002](../../adr/0002-host-on-github-pages-via-actions.md),
  [ADR-0003](../../adr/0003-no-backend-leads-via-hubspot-forms-api.md)).
- Only the page opened at exactly `landing.englishpusher.in.ua` loads GTM and sends to the live
  form. Everywhere else (local, preview, a copy on another host) it sends to the Test form and
  records no analytics ([feature ADR-0001](adr/0001-choose-live-form-and-analytics-by-exact-runtime-host.md)).
- The form window is one island opened by plain `#trial-lesson` links, so the buttons work before
  React loads and shared app links keep working
  ([feature ADR-0002](adr/0002-open-trial-dialog-island-via-trial-lesson-hash-links.md)).

**How to use:** Link to `https://landing.englishpusher.in.ua/` (add UTM tags for posts). Link to
`https://landing.englishpusher.in.ua/#trial-lesson` to open the form straight away. To add a CTA to
a new section, use `<BookTrialLink />`.

**Operational notes:**

- **Merging to `main` publishes the page.** The deploy workflow builds and pushes to GitHub Pages.
  Finish sections 1 and 2 of the [release checklist](release-checklist.md) first. Two items block
  publishing:
  - confirming the Leads Bot reads only the live form, otherwise test sends create deals;
  - Tetiana's written approval of every visible string (AC-10).
  Section 3 (the end-to-end send on the published page) follows the deploy.
- Migration: none. There is no datastore.
- Config: `INTERIM_COPY` in `src/lib/site.ts` drives both `noindex` and the empty sitemap (AC-11).
  When step 3's real content replaces the Interim copy, turn it off in that same release. The live
  and Test HubSpot form IDs are also in `src/lib/site.ts`. A change to the HubSpot fields must be
  made here and in `app-englishpusher`.
- Node: the build needs Node >= 22.23.4 (`.nvmrc` pins 24, CI uses it). Local Node 22.20 cannot run
  `astro check` / `astro build`.
- Rollback: revert the merge on `main`. The workflow redeploys the previous build. Nothing else
  changes state: the app, Moodle and HubSpot are untouched.

**Acceptance criteria delivered:** AC-01 to AC-13 ([spec §5](spec.md)). In short:

- A confirmed request shows a named thank-you, and only then records `generate_lead`.
- Bad input is never sent, and a failed send never loses answers.
- One form serves every CTA and `#trial-lesson` links.
- Landing leads are attributable by their entry address.
- Bots tripping the trap field send nothing.
- The form never reveals known emails.
- Interim copy makes no promises and is not indexed.
- The page is served at its own HTTPS address with a link preview.
- Off the live host the page sends to the Test form and records no analytics.
- AC-06 (the Leads Bot), AC-07 in the CRM, and AC-12 (DNS/HTTPS) can only be proven on the
  published page. They are checklist section 3.
