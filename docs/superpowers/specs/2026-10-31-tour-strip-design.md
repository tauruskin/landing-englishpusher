# "How it works" tour strip — design

- Date: 2026-10-31
- Status: approved in brainstorming, awaiting spec review
- Roadmap: a first piece of step 3 (sales content). It does not resolve D1; Tetiana approves the copy.
- Mockups: `.superpowers/brainstorm/406-1793458335/content/` (local, not committed)

## Goal

Tell a stranger what happens after they book a trial lesson. The section shows five real screens
in order: the trial form, Moodle, and three parts of the EnglishPusher app. The page currently
has only a hero, one interim block and a footer, so nothing on it shows what learning with Tetiana
looks like.

## Decisions

| Question | Decision |
|---|---|
| Purpose | A short ordered tour ("what happens after I book?"). Trust comes as a side effect |
| Slides | 1 Trial form → 2 Moodle → 3 Flashcards → 4 C1 Business → 5 Grammar testing |
| Kind of slider | A swipe strip: horizontal scroll-snap cards, with the next card peeking in |
| Screenshot frame | A phone frame. Every screenshot is taken at phone width |
| Build approach | A static Astro component with CSS scroll-snap and a small inline script for the desktop arrows and dots. No React island and no new dependency |

Rejected: a classic carousel island (more JS, the extra slides are easy to miss on phones); a step
list with a preview (needs JS, stacks on mobile); pure CSS without arrows (desktop mouse users get
only a scrollbar).

## What visitors see

The section is placed between `Hero` and `InterimBlock` in `src/pages/index.astro`.

- Heading: **How it works**. Subline: *From your first message to practice between lessons.*
- Each card is a white rounded card holding a phone-framed screenshot, the step number in an orange disc, a title and one line of caption.

| # | Title | Caption (draft, Tetiana approves) | Screenshot |
|---|---|---|---|
| 1 | Book a trial lesson | Tell Tetiana about yourself, your level and your goals. | This page's trial form window, captured |
| 2 | Your course space | Lesson materials and homework in Moodle. | Moodle *Lesson 1. Activation*, listening exercise, phone width, **supplied by the owner** |
| 3 | Practise new words | Flashcards in the EnglishPusher app, between lessons. | `app.englishpusher.in.ua/b1-flashcards/`, captured |
| 4 | English for work | C1 vocabulary for work: leadership, innovation and business writing. | `app.englishpusher.in.ua/c1-flashcards/?topic=ceo-communication`, captured |
| 5 | Check your grammar | Short grammar tests, topic by topic. | `grammar.englishpusher.in.ua`, captured |

- **Phone (< 640 px):** one card is about 80% of the width, the next card peeks in, and visitors
  swipe to move.
- **Desktop:** about three cards are visible. Round ‹ › buttons sit at the top right of the section.
- **Dots** under the strip show the current card.
- **No autoplay.** Nothing moves unless the visitor moves it.

## Content rules

- **AC-10 applies to every title, caption and alt text.** They must not state a price, "free", a
  lesson length or a learning result. The only offer stays booking a trial.
- **No real people on any slide.** No student names, emails, grades, chats or account pages, and no
  stock photos of people.
- **No coursebook material on any slide.** The Moodle card uses screenshot 3, which shows no
  coursebook photos.
- The tour's titles, captions and alt texts are added to the copy Tetiana approves in writing
  (release checklist §2) before publishing.

## Build

### `src/lib/tour.ts`

The slide data, and nothing else:

```ts
export interface TourSlide {
  step: number;    // 1..5, display order
  title: string;
  caption: string;
  image: string;   // path under public/, e.g. "/tour/2-moodle.webp"
  alt: string;
  width: number;   // intrinsic pixel size of the image file
  height: number;
}
export const TOUR_HEADING: { title: string; subline: string };
export const TOUR_SLIDES: readonly TourSlide[];
```

### `src/components/TourStrip.astro`

- The markup is a `<section aria-labelledby>` containing the `<h2>`, the subline, and the
  scrolling container: an `<ol role="list" aria-labelledby="tour-heading">` (the explicit role keeps list semantics in
  Safari, since preflight removes list-style) with one `<li>` per slide.
- Each card shows the phone frame (a CSS border and radius around the `<img>`), the step number
  in an orange disc with dark text (orange text on white fails contrast), the title and the caption.
- Each image sets `width`/`height` to avoid layout shift. All images use `loading="lazy"` (the strip sits below the hero) and
  `decoding="async"`.
- Scrolling uses Tailwind utilities: `overflow-x-auto snap-x snap-mandatory`, each card
  `snap-start shrink-0 basis-[80%] sm:basis-[calc((100%-2rem)/3)]`. The strip bleeds to the column edge (`-mx-6 px-6 scroll-px-6`) so the peeking card is not
  clipped. The scrollbar is hidden
  visually, and the container keeps `tabindex="0"` with a visible focus ring so the keyboard
  arrow keys scroll it.
- The inline `<script>`, about 15 lines with no framework, is progressive:
  - it shows the ‹ › buttons, which are hidden until it runs;
  - each button press scrolls by one card width;
  - on `scroll` it updates the current dot and disables a button at either end.
  - Without the script, swiping and scrolling still work and the buttons stay hidden.
- **Accessibility:**
  - The list announces position itself; the `<li>`s carry no `aria-label`.
  - Focus rings use `focus:outline-hidden` plus `focus-visible:ring`, so they survive forced-colors.
  - The buttons are `<button type="button">` labelled "Previous slide" / "Next slide".
  - The dots are decorative (`aria-hidden`).
  - With `prefers-reduced-motion: reduce`, scrolling is instant (`behavior: "auto"`).
- **Styling** uses brand tokens only: `brand`, `cream`, `font-display`, `font-body`. This follows
  the project's conventions.

### `src/pages/index.astro`

Add `<TourStrip />` between `<Hero />` and `<InterimBlock />`. Add no new "Book a trial" links.
The built-page test pins exactly two.

### Images in `public/tour/`

- The images are `1-trial.webp`, `2-moodle.webp`, `3-flashcards.webp`, `4-business.webp` and
  `5-grammar.webp`. Each is the visible screen at phone width (390 CSS px at 2× pixel ratio),
  compressed to about 80–120 KB.
- Slides 1, 3, 4 and 5 are captured once with headless Chrome (a one-off script, not kept in the
  repo).
- Slide 2 is converted from the owner's screenshot.
- Every image is checked by eye for the content rules before it is committed.
- **Until the owner's Moodle screenshot arrives,** slide 2 uses a neutral placeholder in brand
  colours with no text. The section must not be published with the placeholder.

## Testing

`src/lib/tour.test.ts` (Node test runner, like the other `src/lib` tests) checks that:

1. there are five slides with steps 1–5 in order;
2. every `image` exists under `public/` and its real pixel size matches `width`/`height` (read
   from the WebP header);
3. every `alt`, `title` and `caption` is non-empty;
4. `findPromises` from `src/lib/copyRules.ts` returns `[]` for the heading, subline and every title,
   caption and alt text.

The existing `scripts/built-page.test.ts` already scans all visible text of the built page for
promises and pins two Book links, so it covers the rendered section unchanged.

Checks by hand before release:

- swipe on a phone;
- arrows, keyboard scrolling and focus on desktop;
- the strip with JS disabled;
- mobile Lighthouse: performance ≥ 90, accessibility ≥ 95 (spec NFRs).

## Docs to update

- `docs/features/landing-page/release-checklist.md` §2: add `src/lib/tour.ts` to the copy Tetiana
  approves, and add the "no people, no coursebook material" image check.
- `docs/roadmap.md`: note under step 3 that the tour strip is its first piece.

## Out of scope

- Autoplay, video and lightbox or zoom on the screenshots.
- Testimonials, prices and Tetiana's story. Those stay roadmap step 3 and wait on D1.
- A capture script kept in the repo. The screenshots are retaken by hand if the app changes.
