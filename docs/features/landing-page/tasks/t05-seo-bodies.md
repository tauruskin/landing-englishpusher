---
id: T5
title: "Add src/lib/seo.ts: robots meta value, robots.txt and sitemap.xml bodies from INTERIM_COPY"
layer: "domain"
deps: ["T1"]
blocks: ["T6"]
acs: ["AC-11"]
files_hint: ["src/lib/seo.ts", "src/lib/seo.test.ts"]
owner: "Oleksandr Pushkar (Operator)"
estimate: "S"
context_budget: "S"
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

# T5 — Add src/lib/seo.ts: robots meta value, robots.txt and sitemap.xml bodies from INTERIM_COPY

## Place in the sequence

- **Blocked by:** T1 — `site.ts` (`INTERIM_COPY`, `LIVE_HOST`) · **Blocks:** T6 — layout head and the robots/sitemap routes · **Wave:** 2.
- **Lane:** own lane.

## Why (user story)

> **As a** Operator
> **I want** the page at its own secure address with search and link-preview data ready, but kept out of search results while it shows Interim copy
> **So that** the skeleton never lands in search results, and search can start the moment real content ships
>
> — `spec.md §4, US-07, verbatim` · full text: [spec.md](../spec.md)

This task turns the one interim setting into the three outputs search engines read, as pure, tested functions.

## Inlined context

> `seo.ts (+ test)` — robots meta value, robots.txt and sitemap.xml bodies from INTERIM_COPY ·
> `robots.txt.ts` — robots.txt built from lib/seo.ts (always allows crawling, names the sitemap) ·
> `sitemap.xml.ts` — sitemap.xml built from lib/seo.ts (empty while INTERIM_COPY)
>
> — `sad.md §5, Internal decomposition, lib/seo.ts + pages/robots.txt.ts + pages/sitemap.xml.ts, verbatim` · full text: [sad.md](../sad.md)

> Host-->>Cr: Crawling allowed, with a pointer to the list of pages · Host-->>Cr: An empty list
> while the copy is interim · Host-->>Cr: Page with a do-not-index tag, the title, a neutral
> description and the brand image
>
> — `sad.md §6, F2 steps 2, 4, 6, abridged` · full text: [sad.md](../sad.md)

**Fallback:** read [spec.md](../spec.md) · [sad.md](../sad.md). Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface. (Static outputs served by GitHub Pages: `/robots.txt`, `/sitemap.xml`; routes are wired in T6.)

## Acceptance criteria

### AC-11 — domain invariant

> **Given** the Landing page shows Interim copy
> **When** a search engine visits the page or reads the site's list of pages offered for search
> **Then** the invariant "Interim copy is never indexed" holds: the page can be crawled but asks not to be indexed, and it is left out of the list of pages offered for search; one setting marks the page as showing Interim copy and drives both rules, so the release that replaces the Interim copy lifts both at the same time; while the page is interim, the site's crawling rules allow crawling and point to the list of pages, and that list is published empty
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] `src/lib/seo.ts`: `robotsMeta(interim: boolean)` → `"noindex, follow"` when interim, `"index, follow"` otherwise; `robotsTxt(siteUrl)` → `User-agent: *` / `Allow: /` / `Sitemap: <site>/sitemap.xml` (never `Disallow: /`); `sitemapXml(siteUrl, interim)` → a valid `<urlset>` with no `<url>` when interim, one `<url><loc>https://landing.englishpusher.in.ua/</loc></url>` otherwise. Defaults read `INTERIM_COPY` from `site.ts`.
- [ ] `src/lib/seo.test.ts`: both values of `interim` for meta and sitemap; robots.txt never disallows and always names the sitemap.

## Edge cases

| Case | Behaviour |
|---|---|
| `INTERIM_COPY` flipped to false | Meta becomes `index, follow` and the sitemap lists the page, in the same build (one setting, both rules). |
| Trailing slash in the site URL | Sitemap URL is not doubled (`…in.ua/sitemap.xml`). |

## Definition of Done

- [ ] `node --test src/lib/seo.test.ts` passes for interim and non-interim.
- [ ] `npm test && npm run check` clean
