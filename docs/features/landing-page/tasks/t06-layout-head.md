---
id: T6
title: "Rework BaseLayout head (entry address, host-gated GTM, robots/OG meta) and add robots.txt + sitemap.xml routes"
layer: "wiring"
deps: ["T1", "T5"]
blocks: ["T7", "T11"]
acs: ["AC-07", "AC-11", "AC-12", "AC-13"]
files_hint: ["src/layouts/BaseLayout.astro", "src/pages/robots.txt.ts", "src/pages/sitemap.xml.ts", "public/og-image.png"]
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

# T6 — Rework BaseLayout head and add robots.txt + sitemap.xml routes

## Place in the sequence

- **Blocked by:** T1 — `site.ts`, T5 — `seo.ts` · **Blocks:** T7 — static sections and page copy, T11 — release checklist · **Wave:** 3.
- **Lane:** own lane (`index.astro` is T7's; keep `BaseLayout`'s `title` / `description` props compatible).

## Why (user story)

> **As a** Operator
> **I want** the page at its own secure address with search and link-preview data ready, but kept out of search results while it shows Interim copy
> **So that** the skeleton never lands in search results, and search can start the moment real content ships
>
> — `spec.md §4, US-07, verbatim` · full text: [spec.md](../spec.md)

This task builds everything in `<head>` and the two crawler files: the entry-address record (US-06), the host gate for GTM, and the search/preview meta.

## Inlined context

> `BaseLayout.astro` — `<head>`: entry-address script, host-gated GTM, title/description, robots
> meta, Open Graph + Twitter card, lang="en"; no `<noscript>` GTM · `public/og-image.png` —
> 1200×630 brand image for link previews
>
> — `sad.md §5, Internal decomposition, layouts/BaseLayout.astro + public/og-image.png, verbatim` · full text: [sad.md](../sad.md)

> An inline script at the top of `<head>` records `location.href` in page memory before anything
> can change the address.
>
> — `sad.md §4, choice 3, abridged` · full text: [sad.md](../sad.md)

> The layout passes the same constant to the inline GTM snippet through `define:vars`, which skips
> loading GTM when the host differs. The GTM `<noscript>` iframe cannot check the host, so it is
> removed.
>
> — `adr/0001-…exact-runtime-host.md, Option 1 + Consequences Negative, abridged` · full text: [ADR-0001](../adr/0001-choose-live-form-and-analytics-by-exact-runtime-host.md)

> SCR-01 `link-preview`: the card shows the page title, a neutral description and the brand image
> `public/og-image.png`, 1200×630 (AC-12, F2), all Interim copy (AC-10).
>
> — `screens.md, SCR-01 link-preview, abridged` · full text: [screens.md](../screens.md)

> **Hard rule:** Tracking only through GTM `GTM-KJVX8GRG`, loaded in `src/layouts/BaseLayout.astro`;
> no separate GA4 / Clarity snippets. Internationalisation: English only (`<html lang="en">`).
>
> — `sad.md §2 Technical + §8 Internationalisation, abridged` · full text: [sad.md](../sad.md)

Current state: `BaseLayout.astro` loads GTM unconditionally, has a `<noscript>` iframe, and defaults `lang = "uk"`.

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md) · [adr/](../adr/). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface. Static outputs: `/robots.txt` (`text/plain`), `/sitemap.xml` (`application/xml`).

## Acceptance criteria

### AC-07 — cross-context

> **Given** a Prospective student sends a Trial lesson request from the Landing page, with or without the visitor-tracking cookie (an ad blocker may remove it)
> **When** the Operator opens that request in the CRM
> **Then** the request's page-address field in the CRM shows the address the visitor first arrived at, including any campaign tags, even if the page has changed the address since (for example by removing `#trial-lesson`), so the Operator can tell it is a Landing lead and not a lead from the app
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

### AC-11 — domain invariant

> **Given** the Landing page shows Interim copy
> **When** a search engine visits the page or reads the site's list of pages offered for search
> **Then** the invariant "Interim copy is never indexed" holds: the page can be crawled but asks not to be indexed, and it is left out of the list of pages offered for search; one setting marks the page as showing Interim copy and drives both rules, so the release that replaces the Interim copy lifts both at the same time; while the page is interim, the site's crawling rules allow crawling and point to the list of pages, and that list is published empty
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

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

- [ ] `BaseLayout.astro`: first child of `<head>` is an inline script storing `location.href` under the key exported by `src/lib/hubspot.ts` (T3, e.g. `window.__entryHref`).
- [ ] Wrap the GTM snippet in `if (location.hostname === LIVE_HOST)`, with `LIVE_HOST` passed from `site.ts` via `define:vars`; always initialise `window.dataLayer = window.dataLayer || []`; delete the `<noscript>` iframe.
- [ ] `lang` default `"en"`; add `<meta name="robots" content={robotsMeta(INTERIM_COPY)}>`, `<link rel="canonical">`, `og:title`, `og:description`, `og:type=website`, `og:url`, `og:image` (absolute URL from `Astro.site`, 1200×630), `twitter:card=summary_large_image` + title/description/image.
- [ ] `src/pages/robots.txt.ts` and `src/pages/sitemap.xml.ts`: static `GET` endpoints returning `robotsTxt` / `sitemapXml` from `seo.ts`.
- [ ] `public/og-image.png` 1200×630: use the Operator's brand image; if none is supplied, ship a plain `brand`-orange image with the "EnglishPusher" wordmark and record "replace og-image" in T11's checklist.

## Edge cases

| Case | Behaviour |
|---|---|
| Opened on `localhost` / preview / `tauruskin.github.io` | No GTM request is made; `dataLayer` is a plain array (AC-13). |
| Visitor arrives with `?utm_source=…#trial-lesson` | Entry address keeps both, even after the dialog removes the hash (AC-07). |
| JavaScript disabled | No GTM, no form; nothing tracked (ADR-0001 accepted). |
| Insecure `http://` address | Redirect is GitHub Pages "Enforce HTTPS", an Operator setup step in T11, not code. |

## Definition of Done

- [ ] `npm run build` emits `dist/robots.txt` (allows crawling, names the sitemap), an empty `dist/sitemap.xml`, and `dist/index.html` with `noindex`, OG + Twitter meta and the entry-address script before the GTM snippet.
- [ ] `npm run preview` on `localhost` shows no request to `googletagmanager.com` in the network panel.
- [ ] every Hard Rule inlined above still holds
- [ ] `npm test && npm run check && npm run build` clean
