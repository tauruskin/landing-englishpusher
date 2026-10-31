# Release checklist — landing-page

What has to happen outside the code before the Landing page goes live at
`https://landing.englishpusher.in.ua`, and the checks that prove it works once it does. **A push
to `main` publishes the page** (the deploy workflow builds and pushes to GitHub Pages), so
everything in sections 1 and 2 is done before that push.

Each item names who does it and the acceptance criterion (AC, [spec.md §5](spec.md)) or
non-functional requirement (NFR, [spec.md §6](spec.md)) it proves. Tick the box and add the
date (and timestamps where asked) when done.

## 1. One-time setup

- [ ] **Operator** — DNS: add a `CNAME` record `landing` → `tauruskin.github.io` at the
  `englishpusher.in.ua` DNS provider. Proves AC-12.
- [ ] **Operator** — GitHub Pages settings: custom domain `landing.englishpusher.in.ua` is shown
  (the deploy workflow writes `CNAME`), and **Enforce HTTPS** is switched on once the certificate
  is issued. Proves AC-12.
- [x] **Operator** — HubSpot: create the Test form with the same fields as the live
  "Trial lesson request" form and record its ID in [`src/lib/site.ts`](../../../src/lib/site.ts)
  (`TEST_FORM_ID = b0bbb13b-2b4b-4d5e-b7b6-2d75de3db87b`, done 2026-10-31). Proves AC-13.
- [ ] **Operator** — Leads Bot (n8n): confirm that the polling workflow reads **only** the live form
  `2226dfee-47d4-406f-ae1a-2e8c0952dec2`, or limit it to that form. **Publishing is blocked until
  this is confirmed**: if the bot reads every form, test sends create deals and lead cards
  ([sad.md §11](sad.md), high risk). Proves AC-13 and AC-06.
- [x] **Operator + Tetiana** — record Tetiana's LinkedIn profile
  (`https://www.linkedin.com/in/tanya-pushkar/`) in
  [`src/lib/options.ts`](../../../src/lib/options.ts) (done 2026-10-31). Proves AC-05.
- [x] **Operator** — link-preview image: [`public/og-image.png`](../../../public/og-image.png)
  is the brand logo on a cream 1200×630 canvas, not a placeholder. Replace it only if Tetiana
  wants a different picture. Proves AC-12.
- [ ] **Operator** — GTM `GTM-KJVX8GRG`: add GA4 event tags (and triggers on the Custom Events) for
  `trial_form_open` and `trial_form_error` (with `form_name` and `error_kind` as event
  parameters); check that the existing `generate_lead` tag fires for the Landing host too. Proves
  AC-03, AC-05 and NFR Lost sends.
- [ ] **Operator** — GTM: check that the existing `contact_click` trigger also fires on the Landing
  page's Instagram and LinkedIn links (footer and send-failed message). Proves AC-05
  ([spec.md §1](spec.md), contact clicks).
- [ ] **Operator** — n8n uptime workflow on Hetzner: request the page every 5 min; "up" = a success
  status and the page title; one Google Sheet row per check; two failures in a row → Telegram
  alert. Proves NFR Availability.

## 2. Before publishing

- [ ] **Tetiana** — approve every visible string in writing: the page (Hero, InterimBlock, Footer),
  the page title and description, the link preview (title, description, image), the form's
  headline and subline, the thank-you and the send-failed message. Check them against the banned
  list: no price, no "free", no lesson length, no learning result. The wording lives in one `copy`
  object at the top of each file in [`src/components/`](../../../src/components/) and in
  [`src/pages/index.astro`](../../../src/pages/index.astro). Proves AC-10.
- [ ] **Operator** — after any copy change: `npm run build && npm run test:built` passes (the
  automated AC-10 scan of the built page; CI runs it too). Proves AC-10.
- [ ] **Operator** — local send: run `npm run build && npm run preview`, open
  `http://localhost:4321/#trial-lesson`, send the form with a clearly marked test name
  (e.g. "TEST Landing local"). Check: no `googletagmanager.com` request in the network panel; the
  submission appears **only** on the Test form in HubSpot; no deal and no Leads Bot card appear.
  Delete the test contact the same day. Proves AC-13.
- [ ] **Operator** — local failure: with the network switched off in DevTools, send again. The
  banner shows the Instagram and LinkedIn links, every answer is kept, and `dataLayer` gets one
  `trial_form_error` with `error_kind: "network"` and no `generate_lead`. Proves AC-05 and AC-08.
- [ ] **Operator** — accessibility: an axe scan of the page with the form open (0 serious or
  critical issues) and a Lighthouse accessibility score ≥ 95. Proves NFR Accessibility.
- [ ] **Operator** — one screen-reader pass (NVDA or VoiceOver): open the form from a Book link →
  fill it in → send → close. Focus moves into the window, Tab stays inside, Escape closes, focus
  returns to the link. Proves NFR Accessibility and AC-03.
- [ ] **Operator** — mobile Lighthouse run: performance score ≥ 90. Proves NFR Page speed.

## 3. On the published page

Do these right after the push to `main` that publishes the page.

- [ ] **Operator** — `http://landing.englishpusher.in.ua` redirects to `https://`, and the
  certificate is valid. Proves AC-12.
- [ ] **Operator** — share the address in Telegram (and one other messenger or social network): the
  preview shows the title, the neutral description and the brand image. Proves AC-12 and AC-10.
- [ ] **Operator** — `https://landing.englishpusher.in.ua/robots.txt` allows crawling and names
  the sitemap; `/sitemap.xml` is an empty list; the page source has
  `<meta name="robots" content="noindex, follow">`. Proves AC-11.
- [ ] **Operator** — one end-to-end send. Open
  `https://landing.englishpusher.in.ua/?utm_source=release_check#trial-lesson` and send the form
  with a clearly marked test name ("TEST Landing E2E"). Record the send time. Proves AC-06, AC-07
  and AC-13.
  - [ ] **Operator** — HubSpot: the submission is on the **live** form, and its page-address field
    shows the full entry address with `utm_source=release_check`. Proves AC-07 and AC-13.
  - [ ] **Operator** — a new deal in the existing pipeline and a Leads Bot card appear within
    10 min. Record both timestamps. Proves AC-06 and NFR Lead delivery.
  - [ ] **Operator** — GA4 (Realtime / DebugView) shows `trial_form_open` and `generate_lead` from
    the Landing host. Proves AC-01 and AC-03.
  - [ ] **Operator** — a second send with the same email within 2 min stays silent in the Leads
    Bot; after 2 min a repeat gives a "submitted again" note. Proves AC-06.
  - [ ] **Operator** — delete the test contact and deal in HubSpot the same day. Proves AC-13.
- [ ] **Operator** — note for the result: a retry after a timeout can create a second submission,
  because the CRM may have received the first one. The Leads Bot's duplicate check absorbs it
  ([sad.md §6](sad.md), F5). Proves AC-05.

## Drift

The form exists in four copies: this repo's `src/lib/` + `TrialForm.tsx`, the app's
`src/shared/trialForm/`, the live HubSpot form and the Test form. **A HubSpot field change is made
in both repos and in both HubSpot forms.** The parity test
([`src/lib/options.test.ts`](../../../src/lib/options.test.ts)) pins every level and goal value to
the app's copy and fails the build if one drifts. Copied files carry a header naming their source
path in `app-englishpusher`.
