---
status: draft            # draft | approved
feature_size: "S"
tool: "code"
updated_at: "2026-10-31"
---

# Screens — landing-page

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` (each `ui` task cites SCR ids + states), `implement`
> (builds the screen to the declared states) and `review` (the built screen must match this).
> Downstream stages reference **only this manifest** — never the raw Figma / `.pen` file.

## Source

- **Tool:** code. There is no `docs/design-system.md` yet, so this manifest defaults to `code` mode
  (no design-tool degradation: no tool was ever chosen).
- **File:** inline wireframes below. They are mobile-first (spec posture, ux-flows §Platform
  decisions): about 40 characters wide, one per state with its own layout. Desktop uses the same
  order, with the window centred at most 520 px wide.
- **Component source:** there is no design-system inventory. Reuse comes from the app's trial form
  code, copied per repo ADR-0003 from `app-englishpusher/src/shared/` (`TrialLessonForm.tsx`,
  `trialForm/TrialForm.tsx`). Every component, copied or new, is listed in §New components so that
  `/sdd:design-system` can register it later.
- **Styling:** Tailwind utilities with the brand tokens only (`brand`, `cream`, `font-display`,
  `font-body`), matching the copied form's classes.
- **Copy:** every visible string in the wireframes is a placeholder for Interim copy that Tetiana
  approves before publishing (AC-10): no price, "free", length or learning result. Strings copied
  from the app's form are marked *(app copy)*. They are still subject to that approval.

## Screens

### SCR-01 — Landing page

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | The page is loaded from its address, the secure redirect or a shared link without `#trial-lesson` (F1, AC-12). It shows the Hero (neutral headline, one sentence, a "Book a trial lesson" link), the InterimBlock (a short heading, two or three lines, a second "Book a trial lesson" link) and the Footer (Instagram and LinkedIn links). Both Book links are plain `<a href="#trial-lesson">` (ADR-0002). All text is Interim copy (AC-10) | NEW: Hero, NEW: InterimBlock, NEW: Footer, NEW: BookTrialLink | wireframe "SCR-01 default" below |
| loading | N/A as a visible state: the page is pre-rendered HTML and shows no spinner. One case is related: a Book link pressed before the window code is ready puts `#trial-lesson` in the address while the page looks unchanged, and the window opens once the code is ready (F3 opt, ADR-0002) | NEW: BookTrialLink | — |
| empty | N/A: fixed static copy, nothing is fetched or listed | — | — |
| error | N/A: the page requests no data. An unreachable page is a hosting outage measured by the uptime check (sad.md §7), not a screen state. Off the published host the page looks identical (AC-13) | — | — |
| behind-window | SCR-02 is open on top: the page is dimmed by the backdrop, does not scroll, and Tab cannot reach it (sad.md §8 Accessibility). A press on the backdrop that both starts and ends there closes the window (copied app behaviour) | TrialDialog | wireframe "SCR-02 default" below |
| after-close | The window is closed with the close button, Escape or the backdrop. `#trial-lesson` is removed from the address and focus returns to the link that opened the window; a link pressed before the code was ready returns focus to the first Book link (sad.md §1 ¶4). The window does not reopen while the visitor scrolls, reads or reloads (AC-04). Typed answers stay in page memory (AC-03) | NEW: BookTrialLink, TrialDialog | wireframe "SCR-01 default" below |
| link-preview | A link to the page is shared in a messenger or a social network. The card shows the page title, a neutral description and the brand image `public/og-image.png`, 1200×630 (AC-12, F2), all Interim copy (AC-10) | BaseLayout (head meta) | wireframe "SCR-01 link-preview" below |

```text
SCR-01 default (mobile)
+--------------------------------------+
| [Hero]                               |
| # <Neutral headline>                 |
| <One sentence of Interim copy>       |
| ( [cal] Book a trial lesson )        |  -> #trial-lesson
|--------------------------------------|
| [InterimBlock]                       |
| ## <Short heading>                   |
| <Two or three lines of Interim copy> |
| ( [cal] Book a trial lesson )        |  -> #trial-lesson
|--------------------------------------|
| [Footer]                             |
| Write to Tetiana                     |
| Instagram ↗        LinkedIn ↗        |  -> off the page
+--------------------------------------+
```

```text
SCR-01 link-preview (messenger card)
+--------------------------------------+
| [ og-image.png 1200x630 brand image ]|
|--------------------------------------|
| <Page title>                         |
| <Neutral description, no promises>   |
| landing.englishpusher.in.ua          |
+--------------------------------------+
```

### SCR-02 — Trial form window

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default | First opening on this page, from any Book link or a `#trial-lesson` address on load (AC-03, AC-04, F3). The window sits over the dimmed page with a close button, the waving teacher picture, the headline and subline *(app copy)*, First name * and Email *, the level pills, the goal pills, Telegram/Viber/phone (optional), Message (optional), the hidden trap field (invisible, out of the Tab order) and a full-width Send button "Book a trial lesson" *(app copy)*. Focus moves to First name; Tab stays inside the window; `trial_form_open` is recorded once for this opening | TrialDialog, TrialForm, Field, OptionPill, Icon X | wireframe "SCR-02 default" below |
| reopened | Opened again on the same page after a close: every typed answer is still there, and `trial_form_open` is recorded again, once. After a confirmed send the next opening shows the empty form (`default`). A reload clears the answers (AC-03, F3) | TrialDialog, TrialForm, Field, OptionPill | wireframe "SCR-02 default" below (filled) |
| validation | Send is pressed with an empty name or an email that is missing or not valid (AC-02, F4). Under each problem field: "Please enter your name" / "Please enter your email" / "Please enter a valid email" *(app copy)*, with `aria-invalid` and `aria-describedby` set. Focus moves to the first problem field, every other answer is kept, and nothing is sent or recorded. Any SCR-04 banner left from an earlier attempt is hidden. Typing in a field clears its message | TrialForm, Field | wireframe "SCR-02 validation" below |
| loading | A valid Send is pressed and the trap field is empty (F4). The Send button is disabled and shows a spinner, with `aria-busy`. Fields stay visible and no thank-you is shown (AC-08). Within 15 s the window moves to SCR-03 (confirmed) or SCR-04 (failed). The close button stays available, and closing does not cancel the send: if the send is confirmed, the next opening shows an empty form; if it fails, the next opening shows SCR-04 (copied app behaviour) | TrialForm, Icon Loader2 | wireframe "SCR-02 loading" below |
| empty | N/A: the form has no list; the empty form is `default` | — | — |
| error | The send fails (rejected, network or timeout) → SCR-04, shown inside this window (AC-05) | see SCR-04 | see SCR-04 |
| off-host | N/A as a visual state: off `landing.englishpusher.in.ua` the window looks identical, but the send goes to the Test form and no tag manager is loaded (AC-13) | — | — |

```text
SCR-02 default (mobile; "reopened" = same layout with answers filled in)
+--------------------------------------+
|            (o_o)/ teacher-trial  [X] |
|   Book a trial lesson with Tetiana   |
|  Tell me a little about yourself and |
|     I'll get back to you soon.       |
| First name *                         |
| [|_________________________________] |  <- focus
| Email *                              |
| [__________________________________] |
| Your English level                   |
| (A1)(A2)(B1)(B2)(C1)(Not sure)       |
| What's your goal? (choose any)       |
| (Speaking)(Work)(IT)(Travel)         |
| (Everyday life)(Other)               |
| Telegram, Viber or phone (optional)  |
| [@username or +380...______________] |
| Message (optional)                   |
| [Anything I should know?...        ] |
| [                                  ] |
| (       Book a trial lesson        ) |
+--------------------------------------+
  (sm and up: First name | Email side by side; window max 520 px)
```

```text
SCR-02 validation
+--------------------------------------+
| First name *                         |
| [|_________________________________] |  <- focus, red border
| ! Please enter your name             |
| Email *                              |
| [anna@mail________________________ ] |
| ! Please enter a valid email         |
| ... level, goals, messenger, message |
|     exactly as typed ...             |
| (       Book a trial lesson        ) |
+--------------------------------------+
```

```text
SCR-02 loading (bottom of the window)
+--------------------------------------+
| ... every field as typed ...         |
| ( [spin]  Book a trial lesson      ) |  disabled, aria-busy
+--------------------------------------+
```

### SCR-03 — Thank-you

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default (success) | The CRM confirms within 15 s (AC-01, F4). The form is replaced in the same window by the celebrating teacher picture, "Thank you, ‹First name›! 🎉", the line "I'll contact you soon." *(app copy)* and a Close button. The heading takes focus and the region is `role="status"`. The first name is shown as plain text, never as HTML, with long names wrapping (sad.md §8 Privacy). `generate_lead` (`form_name: "trial_lesson"`) is recorded only after the confirmation. Confetti plays, except with reduced motion. Close → SCR-01 `after-close`, and the next opening shows an empty form (AC-03) | TrialForm (done view), Confetti | wireframe "SCR-03 default" below |
| trap-field | The hidden trap field was filled (a bot): the window looks exactly like `default`, but nothing is sent and nothing is recorded (AC-08) | TrialForm (done view), Confetti | wireframe "SCR-03 default" below |
| known-email | The email already belongs to a CRM contact: the same thank-you as `default`, and nothing reveals that the email was known (AC-09) | TrialForm (done view), Confetti | wireframe "SCR-03 default" below |
| loading | N/A: the thank-you appears only after the CRM confirms; the wait before it is SCR-02 `loading` | — | — |
| empty | N/A: no list; the first name is required, so it is never empty | — | — |
| error | N/A: a failed send never reaches the thank-you (AC-08); it shows SCR-04 | — | — |

```text
SCR-03 default (mobile)
+--------------------------------------+
|                                  [X] |
|        \(^o^)/ teacher-celebrate     |
|     Thank you, <First name>! 🎉      |  <- focus, role=status
|        I'll contact you soon.        |
|             (  Close  )              |
+--------------------------------------+
   confetti behind it, none with reduced motion
```

### SCR-04 — Send-failed message

Drawn as a banner inside the trial form window, above the Send button, as in the app. The
"Try again" step in ux-flows.md (Flow US-03) is **pressing the Send button again**: there is no
separate panel or "Try again" button (owner decision, 2026-10-31).

| State | Trigger / condition | Components (from the inventory) | Source-ref |
|---|---|---|---|
| default (error) | A valid send fails: the CRM refuses it, the connection drops, or 15 s pass with no answer, after which any later answer is ignored (AC-05, F5). The form stays on screen with every answer kept, and a banner above the Send button (`role="alert"`, announced at once) says the request did not go through and offers links to write to Tetiana on Instagram and on LinkedIn (both open in a new tab). All three kinds of failure look the same; the kind goes only into `trial_form_error`, recorded once for this attempt. No `generate_lead`, no thank-you (AC-08) | TrialForm, SendFailedBanner | wireframe "SCR-04 default" below |
| retry | Send is pressed again: the banner hides and the window goes to SCR-02 `loading` with the same answers, then SCR-03 or SCR-04 again. A failed validation on retry also hides the banner (SCR-02 `validation`) | TrialForm, Icon Loader2 | wireframe "SCR-02 loading" above |
| closed-and-back | The window is closed while the banner shows: back on SCR-01 `after-close`, and the next opening on the same page shows the form with every answer and the banner (AC-05, F5) | TrialDialog, TrialForm, SendFailedBanner | wireframe "SCR-04 default" below |
| loading | N/A: the send in progress is SCR-02 `loading` | — | — |
| empty | N/A: no list | — | — |

```text
SCR-04 default (bottom of the window; fields above as typed)
+--------------------------------------+
| ... every field exactly as typed ... |
| Message (optional)                   |
| [Mornings are best                 ] |
| +----------------------------------+ |
| | Your request did not go through. | |  role=alert, red-50 / red-700
| | Please try again or write to me  | |
| | on Instagram ↗ or LinkedIn ↗.    | |
| +----------------------------------+ |
| (       Book a trial lesson        ) |  = try again
+--------------------------------------+
  Tetiana's LinkedIn address: open question in spec §8
```

## New components

There is no `docs/design-system.md`, so there is no inventory to reuse from. Every component named
above is listed here: either copied from `app-englishpusher` (repo ADR-0003, header comment naming
the source path) or new. `/sdd:design-system` registers them when it runs.

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| TrialDialog | Copied and adapted from the modal shell in `app-englishpusher/src/shared/TrialLessonForm.tsx` (backdrop, close button, Escape, scroll lock). Its open trigger changes: it is opened by `#trial-lesson` links and a hash on load instead of its own button (ADR-0002), and it adds the focus trap and focus return (sad.md §8) | pending (no design-system.md) |
| TrialForm | Copied from `app-englishpusher/src/shared/trialForm/TrialForm.tsx`: fields, validation, sending, done view and error banner. Changes per spec §1: a LinkedIn link in the banner, the 15 s cut-off, `trial_form_error` | pending (no design-system.md) |
| Field | Copied: the label + input + error-message wrapper inside `TrialForm.tsx` | pending (no design-system.md) |
| OptionPill | Copied: the level and goal toggle buttons (`pillClass`, `aria-pressed`) inside `TrialForm.tsx`, named here so tasks can cite it | pending (no design-system.md) |
| SendFailedBanner | Copied: the `role="alert"` error paragraph inside `TrialForm.tsx`, extended with the LinkedIn link | pending (no design-system.md) |
| Confetti | Copied: the `canvas-confetti` call in `TrialForm.tsx` (decoration only, reduced motion respected) | pending (no design-system.md) |
| Icon X, Icon Loader2, Icon CalendarCheck | Copied: `lucide-react` icons the app's form and button use (close, spinner, Book-link icon) | pending (no design-system.md) |
| BaseLayout (head meta) | Existing repo file `src/layouts/BaseLayout.astro`; extended with the title, description, robots, Open Graph and Twitter card meta for the link preview (sad.md §5) | pending (no design-system.md) |
| Hero | NEW: a static `.astro` section (sad.md §5). The app has no landing hero, and static HTML cannot use the app's React components | pending (no design-system.md) |
| InterimBlock | NEW: a static `.astro` section with one short Interim block and the second Book link (sad.md §5); no counterpart in the app | pending (no design-system.md) |
| Footer | NEW: a static `.astro` footer with the Instagram and LinkedIn links (sad.md §5); the app's shell footer is React and app-specific | pending (no design-system.md) |
| BookTrialLink | NEW: the app's trigger is a React `<button>` inside the island, but ADR-0002 needs plain `<a href="#trial-lesson">` links in static HTML, so that a press before hydration is not lost. It takes the app button's look (brand pill, CalendarCheck icon) | pending (no design-system.md) |
