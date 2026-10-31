# Landing page redesign — design

- Date: 2026-10-31
- Status: approved in brainstorming, awaiting spec review
- Roadmap: step 3 (sales content), second piece after the tour strip. Tetiana's story, numbers and
  photo still wait on D1.
- Mockups (local, not committed): `.superpowers/brainstorm/1006-1793463165/content/full-page.html`

## Goal

The live page reads as an empty skeleton: a small logo, a headline, one button, wide empty cream
gaps and plain blocks. This change makes it feel alive and on-brand, and tells a visitor quickly
who the lessons are for. It also turns that into a booking with the visitor's goals already
ticked. It keeps every rule of the interim page:

- no promises (AC-10);
- Tetiana approves all copy;
- the page is not indexed (AC-11).

## Decisions

| Question | Decision |
|---|---|
| Scope | Design plus a few short, factual sections. No prices, offers, testimonials or results |
| Visual direction | **Warm and playful**: soft orange circles, the mascot large, tilted "sticker" tags, a highlighter stroke, generous rounded cards |
| "Who it's for" | An interactive **goal picker**, "What do you want English for?". It has six tiles that map to the form's six goals and leads into the form with those goals ticked |
| "What lessons look like" block | Dropped. It repeated the tour; its three facts become tags in the tour header |
| Meet Tetiana | Shown now, with the mascot and a factual paragraph. Her own words, numbers and a photo come later |
| Goals into the form | A static Astro picker with a small script. A `trial:goals` window event (plus a pending-goals fallback) tells `TrialDialog` to tick them. No new React island |
| Hero image | `D:\EnglishPusher\images\contact_form.png` (1024×962) replaces the blurry 256×241 `teacher-trial.png` in the hero |

Rejected:

- **Bold and graphic, and notebook styles:** too loud, or too childish for IT professionals.
- **The picker inside the React island:** heavier, and blank until hydration.
- **A full sales page now:** it waits on D1 and would break AC-10.

## Page, top to bottom

On desktop, content sits in a `max-w-6xl` column with `px-6`. Sections run full width, with their
background running to the screen edges. Neutral greys move to Tailwind's warm `stone` scale, and
`neutral-*` is no longer used on the page. Brand tokens and fonts are unchanged: `brand`, `cream`,
`font-display` (Space Grotesk), `font-body` (Inter). On phones every multi-column row stacks into
one column.

1. **Hero** (`Hero.astro`, rewritten), on cream.
   - **Layout:** a split grid. Text is on the left; on the right the mascot floats inside an
     orange circle, with soft orange circles behind it.
   - **Text, top to bottom:**
     - the logo;
     - a badge with a pulsing green dot;
     - the h1, with "Tetiana" highlighted;
     - the subline;
     - the orange Book button and a text link to `#goals`.
   - **Mascot:** `contact_form.png`, with three tilted tags around it.
2. **Marquee** (`Marquee.astro`, new): a cream band between thin borders. Course names scroll
   slowly, separated by orange ✦. The second copy of the text is `aria-hidden="true"`.
3. **Goal picker** (`GoalPicker.astro`, new), on white, with `id="goals"`.
   - **Header:** an eyebrow, an h2 and a subline. On desktop the mascot sits to the right: the
     thinking pose with nothing chosen, the celebrating pose once anything is chosen.
   - **Tiles:** an uneven grid of six `<button aria-pressed>` tiles, 4 columns on large screens:
     - IT English: 2×2, dark, holding two code-review chat bubbles;
     - Work & business: 2 wide;
     - Speaking practice and Travel: one each;
     - Everyday life: 3 wide;
     - Something else: 1 wide, with a dashed border.
   - **Selected tile:** an orange border, a pale orange background, and an orange tick that
     springs in. The dark tile keeps its dark background and gets an orange ring.
   - **Floating bar:** fixed at the bottom while at least one goal is chosen. It is dark and
     pill-shaped, and holds "Your goals: …" in an `aria-live="polite"` region plus a Book link.
4. **How it works** (`TourStrip.astro`, restyled), on cream.
   - **Header:** an eyebrow, a big h2, three fact tags, and large round ‹ › buttons.
   - **Strip:** a numbered progress line above the cards; steps up to the current card are orange.
     The phones are larger, in white cards, with the title and caption below each card.
   - **Behaviour:** snap, arrows and the no-JS fallback stay as they are now. The dots row is
     replaced by the progress line: a step turns orange when its card is fully in view, or lies
     to the left of the view. The existing script drives the line instead of the dots.
5. **Meet Tetiana** (`MeetTetiana.astro`, new), on white.
   - **Left:** the celebrating mascot in an orange circle, with a decorative ring of text slowly
     rotating around it (`aria-hidden`).
   - **Right:** an eyebrow, an h2, the paragraph, and Instagram and LinkedIn links.
6. **Call to action** (`CtaBand.astro`, new; replaces `InterimBlock.astro`, which is deleted): a
   large rounded orange panel with a dark Book button. The waving mascot peeks in at the bottom
   right on desktop.
7. **Footer** (`Footer.astro`, restyled), on white. It has the logo, the line, Instagram and
   LinkedIn, and "© <build year>".

`TrialDialog` stays mounted with `client:idle`, exactly as now.

## Copy

Every new string lives in `src/lib/landingCopy.ts`. The tour's copy stays in `src/lib/tour.ts`,
which gains the three fact tags. All of it must pass `findPromises` (AC-10), and Tetiana approves
all of it before publishing.

| Where | Text |
|---|---|
| Hero badge | One-to-one lessons, online |
| Hero h1 | English lessons with **Tetiana** |
| Hero subline | Individual English lessons for adults and IT professionals. |
| Hero buttons | Book a trial lesson · What do you want English for? |
| Hero tags | General English · English for IT · Business English |
| Marquee | General English ✦ Business English ✦ English for IT ✦ One-to-one ✦ Online |
| Picker eyebrow / h2 / subline | Who it's for · What do you want English for? · Pick everything that fits. Tetiana builds the lessons around it. |
| Tile: IT English (`it_english`) | Stand-ups, code reviews, tickets and calls with your team. Bubbles: "Can we sync on the PR before the release?" / "Sure, I'll leave my comments by noon." |
| Tile: Work & business (`work_business`) | Emails, meetings and presentations. |
| Tile: Speaking practice (`speaking`) | Talk more, in a calm one-to-one setting. |
| Tile: Travel (`travel`) | Airports, hotels, directions and small talk. |
| Tile: Everyday life (`everyday_life`) | Shops, doctors, neighbours, films and news. |
| Tile: Something else (`other`) | Tell Tetiana what you need. |
| Floating bar | Your goals: <chosen tile labels, joined with " · "> · Book a trial lesson |
| Tour eyebrow / h2 | How it works · From your first message to practice between lessons |
| Tour fact tags | One-to-one on a video call · Your own course in Moodle · Practice app between lessons |
| Meet eyebrow / h2 | Meet Tetiana · Hi, I'm Tetiana |
| Meet paragraph | I teach English one-to-one, online, to adults and IT professionals. Between our lessons you'll find video lessons, quizzes and exercises on the EnglishPusher website, plus flashcards and grammar tests in the app. |
| Meet ring (decorative) | ENGLISHPUSHER · ENGLISH WITH TETIANA · ONE-TO-ONE · ONLINE · |
| CTA h2 / line / button | Start with a trial lesson · Tell Tetiana a little about yourself. She will get in touch to arrange a time. · Book a trial lesson |
| Footer | English lessons with Tetiana Pushkar · Instagram · LinkedIn · © <year> |

- **Tile values:** each tile's value is a `GOALS` value from `src/lib/options.ts`. The six tiles
  cover the six values exactly once.
- **Labels:** the picker labels ("Work & business", "Speaking practice", "Something else") differ
  from the form's labels on purpose. The form keeps the app's copy.
- **Not used:** the Moodle site's marketing paragraph is not used as written. "Improve", "fluency",
  "confidence" and "expert" are result claims, banned by AC-10.

## Behaviour

### Goal picker → trial form

- A tile click toggles the goal in a `Set` and flips `aria-pressed`. It also updates the bar text,
  shows the bar while the set is not empty, and swaps the mascot (thinking ↔ celebrating).
- The bar's Book link is a plain `<a href="#trial-lesson" data-trial-link>`, like every Book link
  (ADR-0002). Its own click listener runs before `TrialDialog`'s document-level listener, and:
  1. sets `window.__pendingTrialGoals = [...chosen]`;
  2. dispatches `window.dispatchEvent(new CustomEvent("trial:goals", { detail: { goals: [...chosen] } }))`.
- `TrialDialog` listens for `trial:goals` and runs
  `setValues(v => ({ ...v, goals: mergeGoals(v.goals, detail.goals) }))`. On mount it also applies
  and clears `window.__pendingTrialGoals`, which covers a click before hydration.
- `mergeGoals(current, added)` lives in `src/lib/goals.ts`. It is a pure function:
  - it returns the union;
  - it drops values that are not `GOALS` values, and duplicates;
  - it orders the result as `GOALS` is ordered.
- Nothing is stored in the browser beyond the open page (spec §6.1 privacy holds). No new analytics
  event: `trial_form_open` fires as before.

### Motion

The script for the motion is about 15 lines and runs only when reduce motion is off. It adds
`js-reveal` to `<html>`, then an `IntersectionObserver` adds `is-in` to `[data-reveal]` elements as
they enter the viewport. The CSS animates only when `.js-reveal` is present: opacity 0 → 1 and
translateY 16px → 0, with a cascade through a `--i` delay.

Without JS, or with reduce motion on, everything is visible and still. The continuous animations
are all CSS, and all stop under `prefers-reduced-motion: reduce`:

- the marquee (40 s loop);
- the rotating ring (40 s);
- the hero mascot float (6 s);
- the badge dot ping.

Hover states raise tiles and cards 3 px; active states scale to 0.98. Only `transform` and
`opacity` are animated.

### Accessibility

- **Headings:** one h1, then an h2 per section.
- **Tiles:** real buttons with `aria-pressed`, and a visible `focus-visible` ring that uses
  `outline-hidden` (forced colours).
- **Floating bar:** the "Your goals" text sits in an `aria-live="polite"` region.
- **Decorative elements are `aria-hidden`:** the duplicate marquee copy, the rotating ring, and the
  mascots (`alt=""`).
- **Contrast:**
  - Book buttons have dark text on orange (`bg-brand text-stone-900`, about 6.4:1), or cream on
    near-black.
  - Footer and Meet links are dark text with an orange underline.
  - No orange text on white or cream at body size, apart from eyebrows, which use `text-brand`
    at 14px semibold uppercase. This needs checking: if axe flags them, they become `text-stone-900`
    with an orange underline mark.

### Images and performance

All images go into `public/` as WebP with alpha, at about 2× their display width.

| File | Source | Size (px) | Used in |
|---|---|---|---|
| `mascot-wave.webp` | `D:\EnglishPusher\images\contact_form.png` | 760 wide | Hero (eager, `fetchpriority="high"`), CTA band (lazy) |
| `mascot-thinking.webp` | app `teacher-thinking.png` | 300 wide | Picker header (lazy) |
| `mascot-celebrate.webp` | app `teacher-celebrate.png` | 620 wide | Picker header and Meet Tetiana (lazy) |

- Every `<img>` has `width` and `height`.
- `teacher-trial.png` and `teacher-celebrate.png` stay in `public/`: the trial form uses them.
- **Fonts:** the Google Fonts stylesheet stops blocking the first render. It loads with
  `media="print" onload="this.media='all'"`, plus a `<noscript>` fallback. This addresses the
  2.8 s LCP (render delay on the hero h1).

## Testing

**Unit tests** (`npm test`):

- `src/lib/landingCopy.test.ts`:
  - `findPromises` returns `[]` for every string;
  - no string is empty;
  - the tile values equal the set of `GOALS` values, each once.
- `src/lib/goals.test.ts` checks that `mergeGoals`:
  - adds new goals;
  - keeps existing ones;
  - drops unknown values and duplicates;
  - returns the result in `GOALS` order;
  - returns `[]` for two empty lists.
- `src/lib/tour.test.ts` also scans the new fact tags.

**Built page** (`npm run test:built`, `scripts/built-page.test.ts`), updated on purpose:

- exactly **three** `#trial-lesson` links (hero, floating bar, CTA band), and no `id="trial-lesson"`;
- six `[data-goal]` buttons, each with `aria-pressed="false"`;
- the duplicate marquee copy is `aria-hidden="true"`;
- the existing AC-10 scan covers all the new visible text.

**By hand** (headless Chrome, observed values recorded):

- desktop 1440 and mobile 390 screenshots of every section;
- pick IT English and Travel, then click the bar: the form opens with exactly those goals ticked
  and `trial_form_open` = 1;
- a goal ticked in the form before picking is kept;
- JS disabled: every section is visible;
- reduce motion: nothing moves;
- mobile Lighthouse: performance ≥ 90, accessibility ≥ 95, contrast audit passing, LCP recorded.

## Docs to update

- `docs/features/landing-page/release-checklist.md` §2:
  - add `src/lib/landingCopy.ts`, including the Meet Tetiana paragraph, to the copy Tetiana
    approves;
  - change "Hero, TourStrip, InterimBlock, Footer" to the new section list.
- `docs/features/landing-page/adr/0002-…`: add a dated note. The goal picker's floating bar adds a
  third `#trial-lesson` link, which passes the chosen goals by a window event. The rule "Book links
  are plain `#trial-lesson` links" still holds.
- `docs/roadmap.md`, step 3 note: the redesign is in; Tetiana's story, numbers and photo are
  still to come.

## Out of scope

- Prices, offers, testimonials, results and a real photo (roadmap step 3, D1).
- A new analytics event for goal picks.
- Changes to the trial form's own fields, labels or HubSpot mapping.
- Indexing: `INTERIM_COPY` stays `true`.
