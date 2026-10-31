# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page in a warm, playful style. It gets a new hero, a scrolling
marquee, an interactive goal picker that pre-ticks goals in the trial form, a restyled tour,
"Meet Tetiana", an orange call-to-action panel and a new footer. The interim rules still hold: no
promises (AC-10), and not indexed (AC-11).

**Architecture:**

- Static Astro sections, with all their copy in `src/lib/landingCopy.ts`, unit-tested.
- Small inline scripts, no new island:
  - the picker passes the chosen goals to the existing `TrialDialog` React island through a
    `trial:goals` window event, plus a `window.__pendingTrialGoals` fallback;
  - `mergeGoals()` in `src/lib/goals.ts` merges the goals;
  - a reveal-on-scroll script runs only without reduced motion.
- Motion is CSS: Tailwind 4 `@theme` animations.
- Mascots are transparent WebP files, converted once with headless Chrome.

**Tech stack:** Astro 7 (static), Tailwind 4 (CSS-first `@theme` in `src/styles/global.css`), one
React 18 island (`TrialDialog`), Node's built-in test runner (`node --test`, `.ts` type stripping),
headless Chrome over the DevTools protocol for image conversion and checks.

**Spec:** [`docs/superpowers/specs/2026-10-31-landing-redesign-design.md`](../specs/2026-10-31-landing-redesign-design.md)

---

## Before you start

- **Branch:** `feature/redesign`. It already exists, and the spec is committed on it. Never touch
  `main`, never push.
- **Node:**
  - `npm test` and `npm run test:built` run on the local Node 22.20.
  - `astro check`, `build` and `preview` need Node 24:
    ```bash
    N24=/c/Users/Oleksandr/AppData/Local/npm-cache/_npx/387698761821791d/node_modules/node/bin/node.exe
    "$N24" node_modules/astro/bin/astro.mjs check
    "$N24" node_modules/astro/bin/astro.mjs build
    "$N24" node_modules/astro/bin/astro.mjs preview --port 4321   # serves on http://localhost:4321
    ```
- **Conventions** (`CLAUDE.md`):
  - Use Tailwind utilities, the brand tokens (`brand`, `cream`, `font-display`, `font-body`) and
    Tailwind's `stone` greys. No other CSS approach. The only exceptions are the `@theme`
    animations and the reveal rules in `global.css` (Task 4).
  - Logic goes in `src/lib/*.ts`, each with a sibling `*.test.ts`. Imports use `.ts` extensions.
  - `TrialForm.tsx` and `TrialDialog.tsx` must not gain hard-coded user-facing text; a syntax-tree
    guard in `formCopy.test.ts` checks this.
- **AC-10:** no visible text may state a price, "free", a lesson length or a learning result.
  `findPromises` in `src/lib/copyRules.ts` bans, among others, "improve", "fast", "quickly",
  "confident", "fluent", "guarantee" and "results".
- **Book links** (ADR-0002) are plain `<a href="#trial-lesson" data-trial-link>` elements. No
  element may have `id="trial-lesson"`.
- **Processes:** the user has their own Chrome open. Stop only the processes you started, filtering
  by command line, e.g. in PowerShell:
  `Get-CimInstance Win32_Process | ? { $_.CommandLine -match 'remote-debugging-port=93..|astro\.mjs preview' } | % { Stop-Process -Id $_.ProcessId -Force }`
- **Scratchpad** for throwaway scripts and screenshots (not the repo):
  `C:/Users/OLEKSA~1/AppData/Local/Temp/claude/d--VIBE-CODING-landing-englishpusher/0e5c4efe-64b9-4603-bf08-02325d342904/scratchpad`
- **Commits:** `git add <listed files>`, then `git commit -m "<message>"`. End every message with a
  blank line and `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never use `-A`,
  `--no-verify` or amend.
- **Merging to `main` publishes the page.** Don't.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/lib/goals.ts` (+ test) | create | `mergeGoals()`: union of goals, `GOALS` order, unknowns dropped |
| `src/lib/landingCopy.ts` (+ test) | create | Every new string; picker tiles (with `GOALS` values); mascot image sizes |
| `public/mascot-wave.webp`, `mascot-thinking.webp`, `mascot-celebrate.webp` | create | Transparent mascots |
| `src/styles/global.css` | modify | `@theme` animations (marquee, float), reveal rules |
| `src/layouts/BaseLayout.astro` | modify | Non-blocking Google Fonts, `stone` body text, reveal scripts |
| `src/components/BookTrialLink.astro` | modify | `variant` (brand / dark), `size` (md / lg), dark text on orange |
| `src/components/Hero.astro` | rewrite | Split hero with floating mascot |
| `src/components/Marquee.astro` | create | Scrolling course-name band |
| `src/components/GoalPicker.astro` | create | Six tiles, mascot swap, floating bar, script |
| `src/components/trial-form/TrialDialog.tsx` | modify | Listen for `trial:goals`, apply pending goals |
| `src/lib/tour.ts` (+ test) | modify | Heading without the full stop; `TOUR_FACTS` |
| `src/components/TourStrip.astro` | rewrite | Restyled tour; progress line instead of dots |
| `src/components/MeetTetiana.astro` | create | Mascot with rotating ring and paragraph |
| `src/components/CtaBand.astro` | create | Orange panel; replaces `InterimBlock.astro` (deleted) |
| `src/components/Footer.astro` | rewrite | Light footer |
| `src/pages/index.astro` | modify | Section order |
| `scripts/built-page.test.ts` | modify | Three Book links, six tiles, marquee duplicate hidden |
| `docs/features/landing-page/release-checklist.md`, `adr/0002-…md`, `docs/roadmap.md` | modify | Docs |

---

### Task 1: `mergeGoals`

**Files:**
- Create: `src/lib/goals.ts`
- Test: `src/lib/goals.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/goals.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeGoals } from "./goals.ts";

test("adds the picked goals to an empty form", () => {
  assert.deepEqual(mergeGoals([], ["travel", "it_english"]), ["it_english", "travel"]);
});

test("keeps goals the visitor already ticked in the form", () => {
  assert.deepEqual(mergeGoals(["speaking"], ["travel"]), ["speaking", "travel"]);
});

test("drops duplicates and values that are not form goals", () => {
  assert.deepEqual(mergeGoals(["travel"], ["travel", "chess", ""]), ["travel"]);
});

test("returns goals in the form's GOALS order", () => {
  assert.deepEqual(mergeGoals(["other"], ["everyday_life", "speaking", "work_business"]), [
    "speaking",
    "work_business",
    "everyday_life",
    "other",
  ]);
});

test("two empty lists give an empty list", () => {
  assert.deepEqual(mergeGoals([], []), []);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test src/lib/goals.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `./goals.ts`.

- [ ] **Step 3: Implement**

Create `src/lib/goals.ts`:

```ts
// Goals picked in the page's goal picker are added to the trial form's goals (redesign spec,
// "Goal picker → trial form"). The result is the union, in the form's GOALS order; anything that
// is not a GOALS value is dropped, so the form never sends a value HubSpot does not accept.
import { GOALS } from "./options.ts";

const ORDER: readonly string[] = GOALS.map((goal) => goal.value);

export function mergeGoals(current: readonly string[], added: readonly string[]): string[] {
  const chosen = new Set([...current, ...added]);
  return ORDER.filter((value) => chosen.has(value));
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node --test src/lib/goals.test.ts`. Expected: 5 pass.
Run: `npm test`. Expected: 130 pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/lib/goals.ts src/lib/goals.test.ts
git commit -m "feat(redesign): merge picked goals into the trial form's goals"
```

---

### Task 2: All new copy in `landingCopy.ts`

**Files:**
- Create: `src/lib/landingCopy.ts`
- Test: `src/lib/landingCopy.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/landingCopy.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { allLandingText, PICKER } from "./landingCopy.ts";
import { GOALS } from "./options.ts";
import { findPromises } from "./copyRules.ts";

test("no landing text makes a promise (AC-10)", () => {
  for (const text of allLandingText()) assert.deepEqual(findPromises(text), [], text);
});

test("no landing text is empty", () => {
  for (const text of allLandingText()) assert.ok(text.trim(), JSON.stringify(text));
});

test("the six picker tiles cover the form's six goal values, each once", () => {
  const tileValues = PICKER.tiles.map((tile) => tile.value).sort();
  const formValues = GOALS.map((goal) => goal.value).sort();
  assert.deepEqual(tileValues, formValues);
});

test("only the IT English tile carries chat bubbles", () => {
  for (const tile of PICKER.tiles) {
    assert.equal(tile.chat !== undefined, tile.value === "it_english", tile.value);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test src/lib/landingCopy.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `./landingCopy.ts`.

- [ ] **Step 3: Implement**

Create `src/lib/landingCopy.ts`:

```ts
// Every word the redesigned landing page shows outside the trial form and the tour (redesign
// spec, "Copy"). Tetiana approves this file before publishing (release checklist §2). Interim copy
// rule AC-10 applies: no price, "free", lesson length or learning result — landingCopy.test.ts
// checks it with findPromises. Tile values are the trial form's GOALS values (options.ts).
import type { GOALS } from "./options.ts";

export type GoalValue = (typeof GOALS)[number]["value"];

export interface GoalTile {
  value: GoalValue;
  label: string; // on the tile and in the floating bar
  line: string;
  chat?: readonly [string, string]; // IT English only: a two-line code-review exchange
}

export const HERO = {
  badge: "One-to-one lessons, online",
  title: "English lessons with",
  titleHighlight: "Tetiana",
  subline: "Individual English lessons for adults and IT professionals.",
  goalsLink: "What do you want English for?",
  tags: ["General English", "English for IT", "Business English"],
} as const;

export const MARQUEE = ["General English", "Business English", "English for IT", "One-to-one", "Online"] as const;

const TILES: readonly GoalTile[] = [
  {
    value: "it_english",
    label: "IT English",
    line: "Stand-ups, code reviews, tickets and calls with your team.",
    chat: ["Can we sync on the PR before the release?", "Sure, I'll leave my comments by noon."],
  },
  { value: "work_business", label: "Work & business", line: "Emails, meetings and presentations." },
  { value: "speaking", label: "Speaking practice", line: "Talk more, in a calm one-to-one setting." },
  { value: "travel", label: "Travel", line: "Airports, hotels, directions and small talk." },
  { value: "everyday_life", label: "Everyday life", line: "Shops, doctors, neighbours, films and news." },
  { value: "other", label: "Something else", line: "Tell Tetiana what you need." },
];

export const PICKER = {
  eyebrow: "Who it's for",
  title: "What do you want English for?",
  subline: "Pick everything that fits. Tetiana builds the lessons around it.",
  chosenLabel: "Your goals:",
  tiles: TILES,
} as const;

export const MEET = {
  eyebrow: "Meet Tetiana",
  title: "Hi, I'm Tetiana",
  paragraph:
    "I teach English one-to-one, online, to adults and IT professionals. Between our lessons you'll find video lessons, quizzes and exercises on the EnglishPusher website, plus flashcards and grammar tests in the app.",
  ring: "ENGLISHPUSHER · ENGLISH WITH TETIANA · ONE-TO-ONE · ONLINE · ",
  instagram: "Instagram",
  linkedin: "LinkedIn",
} as const;

export const CTA = {
  title: "Start with a trial lesson",
  line: "Tell Tetiana a little about yourself. She will get in touch to arrange a time.",
} as const;

export const FOOTER = {
  line: "English lessons with Tetiana Pushkar",
  instagram: "Instagram",
  linkedin: "LinkedIn",
} as const;

// Transparent WebP mascots in public/, about 2× their display width (Task 3 converts them).
export const MASCOTS = {
  wave: { src: "/mascot-wave.webp", width: 760, height: 714 },
  thinking: { src: "/mascot-thinking.webp", width: 300, height: 325 },
  celebrate: { src: "/mascot-celebrate.webp", width: 620, height: 665 },
} as const;

export function allLandingText(): string[] {
  return [
    HERO.badge,
    HERO.title,
    HERO.titleHighlight,
    HERO.subline,
    HERO.goalsLink,
    ...HERO.tags,
    ...MARQUEE,
    PICKER.eyebrow,
    PICKER.title,
    PICKER.subline,
    PICKER.chosenLabel,
    ...PICKER.tiles.flatMap((tile) => [tile.label, tile.line, ...(tile.chat ?? [])]),
    MEET.eyebrow,
    MEET.title,
    MEET.paragraph,
    MEET.ring,
    MEET.instagram,
    MEET.linkedin,
    CTA.title,
    CTA.line,
    FOOTER.line,
    FOOTER.instagram,
    FOOTER.linkedin,
  ];
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node --test src/lib/landingCopy.test.ts`. Expected: 4 pass.
Run: `npm test`. Expected: 134 pass.
If `findPromises` flags any string, **stop and report it**. Do not reword it: the copy was approved
in brainstorming, and Tetiana approves the wording.

- [ ] **Step 5: Commit**

```bash
git add src/lib/landingCopy.ts src/lib/landingCopy.test.ts
git commit -m "feat(redesign): add the landing copy with promise and goal-parity checks"
```

---

### Task 3: Transparent WebP mascots

**Files:**
- Create: `public/mascot-wave.webp`, `public/mascot-thinking.webp`, `public/mascot-celebrate.webp`
- Modify: `src/lib/landingCopy.test.ts` (append the image test)
- Scratch, not committed: `<scratchpad>/convert-mascots.mjs`

- [ ] **Step 1: Write the failing image test**

Add these imports at the top of `src/lib/landingCopy.test.ts`, next to the others:

```ts
import { readFileSync } from "node:fs";
import { webpSize } from "./webp.ts";
import { MASCOTS } from "./landingCopy.ts";
```

(Merge `MASCOTS` into the existing `./landingCopy.ts` import line.) Then append:

```ts
test("each mascot is a transparent WebP at the width and height the <img> declares", () => {
  for (const mascot of Object.values(MASCOTS)) {
    const bytes = new Uint8Array(readFileSync(new URL(`../../public${mascot.src}`, import.meta.url)));
    assert.deepEqual(webpSize(bytes), { width: mascot.width, height: mascot.height }, mascot.src);
    const chunk = String.fromCharCode(...bytes.subarray(12, 16));
    assert.ok(chunk === "VP8X" && (bytes[20] & 0x10) !== 0, `${mascot.src} has an alpha channel`);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test src/lib/landingCopy.test.ts`
Expected: the new test fails with `ENOENT` for `public/mascot-wave.webp`; the other 4 pass.

- [ ] **Step 3: Write the converter (scratchpad)**

Save as `<scratchpad>/convert-mascots.mjs`:

```js
// One-off: converts the mascot PNGs to transparent WebP at the sizes landingCopy.ts declares.
// Usage: node convert-mascots.mjs "D:/VIBE CODING/landing-englishpusher/public"
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const OUT = process.argv[2];
const JOBS = [
  { src: "D:/EnglishPusher/images/contact_form.png", out: "mascot-wave.webp", w: 760, h: 714 },
  { src: "D:/VIBE CODING/app-englishpusher/src/assets/teacher-thinking.png", out: "mascot-thinking.webp", w: 300, h: 325 },
  { src: "D:/VIBE CODING/app-englishpusher/src/assets/teacher-celebrate.png", out: "mascot-celebrate.webp", w: 620, h: 665 },
];
const PORT = 9336;
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), "mascot-convert")}`, "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 30 && !target; i++) {
  try { target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json(); }
  catch { await sleep(500); }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener("message", (m) => { const x = JSON.parse(m.data); pending.get(x.id)?.(x); pending.delete(x.id); });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
for (const job of JOBS) {
  await send("Emulation.setDeviceMetricsOverride", { width: job.w, height: job.h, deviceScaleFactor: 1, mobile: false });
  const b64 = readFileSync(job.src).toString("base64");
  const html = `<!doctype html><meta name="viewport" content="width=device-width"><style>html,body{margin:0;background:transparent}img{display:block;width:${job.w}px;height:${job.h}px;object-fit:contain}</style><img src="data:image/png;base64,${b64}">`;
  await send("Page.navigate", { url: `data:text/html;base64,${Buffer.from(html).toString("base64")}` });
  await sleep(1200);
  const { result } = await send("Page.captureScreenshot", {
    format: "webp", quality: 85, clip: { x: 0, y: 0, width: job.w, height: job.h, scale: 1 },
  });
  writeFileSync(join(OUT, job.out), Buffer.from(result.data, "base64"));
  console.log("wrote", job.out);
}
ws.close();
chrome.kill();
process.exit(0);
```

- [ ] **Step 4: Run it**

Run: `node "<scratchpad>/convert-mascots.mjs" "D:/VIBE CODING/landing-englishpusher/public"`
Expected: three `wrote …` lines. Then run `ls -l public/mascot-*.webp`: each file should be under
120 KB.

- [ ] **Step 5: Look at each image** (the Read tool shows images). Check that:
  - each one is the right mascot (waving with the calendar; thinking; jumping);
  - each is sharp and uncropped;
  - the background is transparent (no white or black box).

- [ ] **Step 6: Run the tests**

Run: `node --test src/lib/landingCopy.test.ts`. Expected: 5 pass.
If only the alpha assertion fails, Chrome wrote WebP without alpha. **Stop and report**; don't
weaken the test.

- [ ] **Step 7: Commit**

```bash
git add public/mascot-wave.webp public/mascot-thinking.webp public/mascot-celebrate.webp src/lib/landingCopy.test.ts
git commit -m "feat(redesign): add transparent WebP mascots at 2x display size"
```

---

### Task 4: Foundation: theme, fonts, reveal, BookTrialLink

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro` (the font links at the end of `<head>`, plus `<body>`)
- Modify: `src/components/BookTrialLink.astro`

- [ ] **Step 1: Theme animations and reveal rules**

In `src/styles/global.css`, replace the existing `@theme { … }` block with:

```css
@theme {
  --color-brand: #f07c1a;
  --color-cream: #faf8f5;
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;

  /* Redesign motion (spec "Motion"): only transform/opacity, all stopped by motion-reduce:animate-none. */
  --animate-marquee: marquee 40s linear infinite;
  --animate-float: float 6s ease-in-out infinite;
  --animate-spin-slow: spin 40s linear infinite;

  @keyframes marquee {
    to { transform: translateX(-50%); }
  }
  @keyframes float {
    50% { transform: translateY(-8px) rotate(2deg); }
  }
}
```

Append to the end of the file:

```css
/* Reveal on scroll (spec "Motion"). BaseLayout adds .js-reveal to <html> only when JS runs and
   reduced motion is off, so without JS everything is simply visible. */
.js-reveal [data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.js-reveal [data-reveal].is-in {
  opacity: 1;
  transform: none;
}
```

- [ ] **Step 2: BaseLayout: non-blocking fonts, stone text, reveal scripts**

In `src/layouts/BaseLayout.astro`, replace:

```astro
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
    />
  </head>
  <body class="bg-cream font-body text-neutral-900">
    <slot />
  </body>
```

with:

```astro
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
      media="print"
      onload="this.media='all'"
    />
    <noscript>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
      />
    </noscript>
    <script is:inline>
      // Reveal on scroll is opt-in: only with JS and without reduced motion (spec "Motion").
      if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.documentElement.classList.add("js-reveal");
      }
    </script>
  </head>
  <body class="bg-cream font-body text-stone-900">
    <slot />
    <script>
      // Marks [data-reveal] blocks as they enter the viewport; global.css fades them in.
      if (document.documentElement.classList.contains("js-reveal")) {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          },
          { rootMargin: "0px 0px -10% 0px" },
        );
        document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
      }
    </script>
  </body>
```

- [ ] **Step 3: BookTrialLink variants**

Replace the whole of `src/components/BookTrialLink.astro` with:

```astro
---
// A plain link that opens the trial form window (ADR-0002): TrialDialog opens on #trial-lesson and,
// once hydrated, intercepts clicks on these links. No element may carry id="trial-lesson".
// variant "brand" = dark text on orange (≈6.4:1); "dark" = cream on near-black.
// data-goal-book marks the goal picker's floating-bar link (GoalPicker.astro).
interface Props {
  variant?: "brand" | "dark";
  size?: "md" | "lg";
  "data-goal-book"?: boolean;
}
const { variant = "brand", size = "md", ...rest } = Astro.props;
const copy = { label: "Book a trial lesson" };
const colours = {
  brand: "bg-brand text-stone-900 shadow-[0_12px_24px_-12px_rgba(240,124,26,0.8)]",
  dark: "bg-stone-900 text-cream",
}[variant];
const sizing = { md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" }[size];
---

<a
  href="#trial-lesson"
  data-trial-link
  {...rest}
  class:list={[
    "inline-flex w-fit shrink-0 items-center gap-2 rounded-full font-semibold transition",
    "hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none",
    "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    colours,
    sizing,
  ]}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path
      d="M3 10h18"></path><path d="m9 16 2 2 4-4"></path>
  </svg>
  {copy.label}
</a>
```

- [ ] **Step 4: Gate**

```bash
"$N24" node_modules/astro/bin/astro.mjs check
"$N24" node_modules/astro/bin/astro.mjs build
npm run test:built
npm test
```

Expected: `check` 0 errors and 0 warnings; the build completes; `test:built` 3/3 (still two Book
links); `npm test` 135 pass. Open `dist/index.html` and confirm the fonts `<link>` has
`media="print"` and the `<noscript>` fallback is present.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/BookTrialLink.astro
git commit -m "feat(redesign): theme animations, non-blocking fonts, reveal-on-scroll and Book link variants"
```

---

### Task 5: Hero and Marquee

**Files:**
- Rewrite: `src/components/Hero.astro`
- Create: `src/components/Marquee.astro`
- Modify: `src/pages/index.astro`
- Modify: `scripts/built-page.test.ts` (marquee check)

- [ ] **Step 1: Add the failing marquee check**

Append to `scripts/built-page.test.ts`:

```ts
test("the marquee's second copy is hidden from screen readers", () => {
  const copies = [...html.matchAll(/<div\b[^>]*data-marquee-copy[^>]*>/g)].map((m) => m[0]);
  assert.equal(copies.length, 2);
  assert.equal(copies.filter((tag) => /aria-hidden="true"/.test(tag)).length, 1);
});
```

- [ ] **Step 2: Rewrite `src/components/Hero.astro`**

```astro
---
// Hero (redesign spec, Page 1): text left, the waving mascot floating in an orange circle on the
// right with three tilted tags. All copy from landingCopy.ts; the Book button is BookTrialLink.
import BookTrialLink from "./BookTrialLink.astro";
import { HERO, MASCOTS } from "../lib/landingCopy.ts";

const tagStyles = [
  "-left-4 top-10 rotate-[-6deg] bg-white text-stone-900",
  "-right-2 top-1/2 rotate-[5deg] bg-white text-stone-900",
  "bottom-6 left-2 rotate-[-3deg] bg-stone-900 text-cream",
];
---

<header class="relative overflow-hidden">
  <div aria-hidden="true" class="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand/15"></div>
  <div aria-hidden="true" class="pointer-events-none absolute -bottom-32 right-[30%] h-64 w-64 rounded-full bg-brand/10"></div>
  <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-[1.15fr_0.85fr] md:pt-14">
    <div>
      <img src="/logo.png" alt="EnglishPusher" width="320" height="320" class="h-16 w-auto" />
      <p class="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium shadow-[0_6px_16px_-10px_rgba(120,60,10,0.4)]">
        <span aria-hidden="true" class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        {HERO.badge}
      </p>
      <h1 class="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl">
        {HERO.title}
        <span class="relative whitespace-nowrap">
          <span class="relative z-10">{HERO.titleHighlight}</span>
          <span aria-hidden="true" class="absolute inset-x-0 bottom-1 h-4 rounded bg-brand/35"></span>
        </span>
      </h1>
      <p class="mt-5 max-w-[46ch] text-lg leading-relaxed text-stone-600">{HERO.subline}</p>
      <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <BookTrialLink size="lg" />
        <a
          href="#goals"
          class="font-medium text-stone-800 underline decoration-brand decoration-2 underline-offset-4 hover:text-stone-950 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
        >
          {HERO.goalsLink}
        </a>
      </div>
    </div>
    <div class="relative mx-auto w-72 md:w-full md:max-w-sm">
      <div aria-hidden="true" class="absolute inset-6 rounded-full bg-brand/30"></div>
      <img
        src={MASCOTS.wave.src}
        alt=""
        width={MASCOTS.wave.width}
        height={MASCOTS.wave.height}
        fetchpriority="high"
        decoding="async"
        class="relative h-auto w-full animate-float drop-shadow-[0_24px_30px_rgba(120,60,10,0.25)] motion-reduce:animate-none"
      />
      {
        HERO.tags.map((tag, i) => (
          <span class={`absolute rounded-2xl px-3 py-2 text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(120,60,10,0.45)] ${tagStyles[i]}`}>
            {tag}
          </span>
        ))
      }
    </div>
  </div>
</header>
```

- [ ] **Step 3: Create `src/components/Marquee.astro`**

```astro
---
// Scrolling band of course names (redesign spec, Page 2). Two identical copies slide left by 50%
// for a seamless loop; the second copy is aria-hidden. Stops under reduced motion.
import { MARQUEE } from "../lib/landingCopy.ts";

const items = [...MARQUEE, ...MARQUEE]; // long enough to fill a wide screen
---

<div class="overflow-hidden border-y border-stone-200 bg-cream py-4">
  <div class="flex w-max animate-marquee motion-reduce:animate-none">
    {
      [1, 2].map((copy) => (
        <div
          data-marquee-copy
          aria-hidden={copy === 2 ? "true" : undefined}
          class="flex shrink-0 items-center gap-10 pr-10 font-display text-xl font-semibold text-stone-500"
        >
          {items.map((item) => (
            <>
              <span>{item}</span>
              <span aria-hidden="true" class="text-brand">✦</span>
            </>
          ))}
        </div>
      ))
    }
  </div>
</div>
```

- [ ] **Step 4: Update `src/pages/index.astro`**

Replace the `<main>…</main>` block with the version below. The other sections keep a temporary
narrow wrapper until Tasks 7–8 restyle them. Also add `import Marquee from "../components/Marquee.astro";`
after the `Hero` import.

```astro
  <main>
    <Hero />
    <Marquee />
    <div class="mx-auto max-w-3xl px-6">
      <TourStrip />
      <InterimBlock />
      <Footer />
    </div>
  </main>
```

- [ ] **Step 5: Gate**

```bash
"$N24" node_modules/astro/bin/astro.mjs check
"$N24" node_modules/astro/bin/astro.mjs build
npm run test:built
npm test
```

Expected: `check` 0 errors; the build completes; `test:built` 4/4; `npm test` 135 pass.

- [ ] **Step 6: Look at it**

Start the preview. Take headless-Chrome screenshots of `http://localhost:4321/` at 1440×900 and
390×844 (DPR 2) into the scratchpad as `t5-desktop.png` and `t5-mobile.png`, and view them.

Expected:
- desktop: text on the left; the sharp waving mascot on the right in an orange circle, with three
  tilted tags; the marquee band below;
- mobile: one column with the mascot under the text; no horizontal scroll
  (`document.documentElement.scrollWidth === innerWidth`).

Stop only your own processes.

- [ ] **Step 7: Commit**

```bash
git add src/components/Hero.astro src/components/Marquee.astro src/pages/index.astro scripts/built-page.test.ts
git commit -m "feat(redesign): split hero with floating mascot and a scrolling course band"
```

---

### Task 6: Goal picker → trial form

**Files:**
- Create: `src/components/GoalPicker.astro`
- Modify: `src/components/trial-form/TrialDialog.tsx`
- Modify: `src/pages/index.astro`
- Modify: `scripts/built-page.test.ts`

- [ ] **Step 1: Update the built-page tests (failing)**

In `scripts/built-page.test.ts`, replace the test `"exactly two Book links point at #trial-lesson and nothing has that id (ADR-0002)"` with:

```ts
test("exactly three Book links point at #trial-lesson and nothing has that id (ADR-0002)", () => {
  // hero, the goal picker's floating bar, the call-to-action panel (InterimBlock until Task 8)
  assert.equal([...html.matchAll(/<a\b[^>]*href="#trial-lesson"/g)].length, 3);
  assert.doesNotMatch(html, /id="trial-lesson"/);
});

test("the goal picker has six unpressed goal buttons", () => {
  const tiles = [...html.matchAll(/<button\b[^>]*data-goal="[^"]+"[^>]*>/g)].map((m) => m[0]);
  assert.equal(tiles.length, 6);
  for (const tag of tiles) assert.match(tag, /aria-pressed="false"/);
});
```

Build and run `npm run test:built`. Expected: both new tests FAIL (2 links, 0 tiles).

- [ ] **Step 2: Create `src/components/GoalPicker.astro`**

```astro
---
// Goal picker (redesign spec, Page 3): "What do you want English for?". Six tiles map to the trial
// form's GOALS values. The script below toggles tiles, swaps the mascot, shows a floating bar and,
// when the bar's Book link is clicked, hands the chosen goals to TrialDialog: it sets
// window.__pendingTrialGoals and dispatches a "trial:goals" window event. The link's own click
// listener runs before TrialDialog's document-level one. Without JS the tiles do nothing.
import BookTrialLink from "./BookTrialLink.astro";
import { MASCOTS, PICKER, type GoalValue } from "../lib/landingCopy.ts";

const layout: Record<GoalValue, string> = {
  it_english: "lg:col-span-2 lg:row-span-2",
  work_business: "lg:col-span-2",
  speaking: "",
  travel: "",
  everyday_life: "lg:col-span-3",
  other: "",
};
// 24×24 stroke icons (path data).
const icons: Record<GoalValue, string> = {
  it_english: "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M8 21h8 M9 9l-2 2 2 2 M15 9l2 2-2 2",
  work_business: "M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2 M3 13h18",
  speaking: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z",
  travel: "M2 16l20-6-3-3-6 2-6-5-2 1 4 6-4 1-2-2-2 1z",
  everyday_life: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  other: "M12 5v14 M5 12h14",
};
const tileBase = [
  "group relative rounded-[2rem] border-2 p-7 text-left transition duration-300",
  "hover:-translate-y-[3px] hover:shadow-[0_24px_40px_-20px_rgba(120,60,10,0.25)] active:scale-[0.98]",
  "motion-reduce:transition-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
].join(" ");
const tileSkin: Record<GoalValue, string> = {
  it_english: "border-transparent bg-stone-900 text-cream aria-pressed:ring-4 aria-pressed:ring-brand/50",
  work_business: "border-stone-200 bg-cream aria-pressed:border-brand aria-pressed:bg-brand/10",
  speaking: "border-stone-200 bg-cream aria-pressed:border-brand aria-pressed:bg-brand/10",
  travel: "border-stone-200 bg-cream aria-pressed:border-brand aria-pressed:bg-brand/10",
  everyday_life: "border-stone-200 bg-cream aria-pressed:border-brand aria-pressed:bg-brand/10",
  other: "border-dashed border-stone-300 bg-white aria-pressed:border-solid aria-pressed:border-brand aria-pressed:bg-brand/10",
};
---

<section id="goals" aria-labelledby="goals-heading" class="bg-white py-20 md:py-24" data-goal-picker>
  <div class="mx-auto max-w-6xl px-6">
    <div class="flex items-end justify-between gap-6" data-reveal>
      <div>
        <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand">{PICKER.eyebrow}</p>
        <h2 id="goals-heading" class="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">{PICKER.title}</h2>
        <p class="mt-3 max-w-[52ch] text-stone-600">{PICKER.subline}</p>
      </div>
      <div aria-hidden="true" class="relative hidden h-32 w-32 shrink-0 md:block">
        <img data-mascot="thinking" src={MASCOTS.thinking.src} alt="" width={MASCOTS.thinking.width} height={MASCOTS.thinking.height} loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-contain" />
        <img data-mascot="celebrate" hidden src={MASCOTS.celebrate.src} alt="" width={MASCOTS.celebrate.width} height={MASCOTS.celebrate.height} loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-contain" />
      </div>
    </div>

    <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
      {
        PICKER.tiles.map((tile) => (
          <button type="button" data-goal={tile.value} data-label={tile.label} aria-pressed="false" class:list={[tileBase, layout[tile.value], tileSkin[tile.value]]}>
            <span aria-hidden="true" class="absolute right-5 top-5 grid h-8 w-8 scale-60 place-items-center rounded-full bg-brand text-stone-900 opacity-0 transition duration-300 group-aria-pressed:scale-100 group-aria-pressed:opacity-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7" /></svg>
            </span>
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f07c1a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={icons[tile.value]} /></svg>
            <span class:list={["mt-4 block font-display font-bold", tile.value === "it_english" ? "text-3xl" : "text-xl"]}>{tile.label}</span>
            <span class:list={["mt-1 block", tile.value === "it_english" ? "max-w-[34ch] text-stone-300" : "text-sm text-stone-600"]}>{tile.line}</span>
            {tile.chat && (
              <span class="mt-8 block space-y-2 font-mono text-sm">
                <span class="block w-fit rounded-xl bg-white/10 px-3 py-2">“{tile.chat[0]}”</span>
                <span class="ml-8 block w-fit rounded-xl bg-brand px-3 py-2 text-stone-900">“{tile.chat[1]}”</span>
              </span>
            )}
          </button>
        ))
      }
    </div>
  </div>

  <div
    data-goal-bar
    class="invisible fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl translate-y-[140%] items-center gap-4 rounded-full bg-stone-900 py-2.5 pl-6 pr-2.5 text-cream shadow-2xl transition duration-500 data-[open]:visible data-[open]:translate-y-0 motion-reduce:transition-none"
  >
    <p class="min-w-0 flex-1 truncate text-sm" aria-live="polite">
      <span class="text-stone-400">{PICKER.chosenLabel}</span> <span data-goal-chosen class="font-semibold"></span>
    </p>
    <BookTrialLink data-goal-book />
  </div>
</section>

<script>
  const root = document.querySelector<HTMLElement>("[data-goal-picker]");
  const bar = root?.querySelector<HTMLElement>("[data-goal-bar]");
  const chosenOut = root?.querySelector<HTMLElement>("[data-goal-chosen]");
  const book = root?.querySelector<HTMLAnchorElement>("[data-goal-book]");
  const thinking = root?.querySelector<HTMLElement>('[data-mascot="thinking"]');
  const celebrate = root?.querySelector<HTMLElement>('[data-mascot="celebrate"]');
  if (root && bar && chosenOut && book && thinking && celebrate) {
    const tiles = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-goal]"));
    const chosen = new Set<string>();

    const render = () => {
      for (const tile of tiles) tile.setAttribute("aria-pressed", String(chosen.has(tile.dataset.goal ?? "")));
      chosenOut.textContent = tiles
        .filter((tile) => chosen.has(tile.dataset.goal ?? ""))
        .map((tile) => tile.dataset.label)
        .join(" · ");
      bar.toggleAttribute("data-open", chosen.size > 0);
      thinking.hidden = chosen.size > 0;
      celebrate.hidden = chosen.size === 0;
    };

    for (const tile of tiles) {
      tile.addEventListener("click", () => {
        const goal = tile.dataset.goal ?? "";
        if (chosen.has(goal)) chosen.delete(goal);
        else chosen.add(goal);
        render();
      });
    }

    book.addEventListener("click", () => {
      const goals = [...chosen];
      (window as Window & { __pendingTrialGoals?: string[] }).__pendingTrialGoals = goals;
      window.dispatchEvent(new CustomEvent("trial:goals", { detail: { goals } }));
    });
  }
</script>
```

- [ ] **Step 3: Make `TrialDialog` tick the picked goals**

In `src/components/trial-form/TrialDialog.tsx`:

(a) add the import after the `options.ts` import:

```ts
import { mergeGoals } from "../../lib/goals.ts";
```

(b) add this effect directly after the "Open on a #trial-lesson address…" `useEffect` block (the one
ending with `}, [openWindow]);`):

```ts
  // Goals picked in the page's goal picker (redesign spec): tick them in the form. The picker sets
  // window.__pendingTrialGoals (read once on mount, for a click before hydration) and dispatches
  // a "trial:goals" event (for clicks after hydration).
  useEffect(() => {
    const page = window as Window & { __pendingTrialGoals?: unknown };
    const addGoals = (goals: unknown) => {
      if (!Array.isArray(goals)) return;
      const picked = goals.filter((goal): goal is string => typeof goal === "string");
      setValues((v) => ({ ...v, goals: mergeGoals(v.goals, picked) }));
    };
    addGoals(page.__pendingTrialGoals);
    delete page.__pendingTrialGoals;
    const onGoals = (e: Event) => {
      addGoals((e as CustomEvent<{ goals?: unknown }>).detail?.goals);
      delete page.__pendingTrialGoals;
    };
    window.addEventListener("trial:goals", onGoals);
    return () => window.removeEventListener("trial:goals", onGoals);
  }, []);
```

- [ ] **Step 4: Place the picker**

In `src/pages/index.astro`, add `import GoalPicker from "../components/GoalPicker.astro";` after the
`Marquee` import, and put `<GoalPicker />` directly after `<Marquee />`.

- [ ] **Step 5: Gate**

```bash
"$N24" node_modules/astro/bin/astro.mjs check
"$N24" node_modules/astro/bin/astro.mjs build
npm run test:built
npm test
```

Expected:
- `check`: 0 errors;
- `test:built`: 5/5 (three links, six tiles);
- `npm test`: 135 pass. The `TrialDialog.tsx` text guard in `formCopy.test.ts` must still pass:
  no new text.

- [ ] **Step 6: Check the behaviour in a browser**

Run the preview and drive headless Chrome at 1440×1000. Record the observed values:

1. Click the `it_english` and `travel` tiles. Each has `aria-pressed="true"`. The bar has
   `data-open`, and `[data-goal-chosen]` reads `IT English · Travel`. The thinking mascot is
   hidden and the celebrating one is shown.
2. Click `[data-goal-book]`. Within 1 s the dialog is open, and the form's goal pills for IT
   English and Travel are active (the pill buttons with `aria-pressed="true"` inside
   `[role=dialog]`). `window.dataLayer.filter(e => e.event === "trial_form_open").length === 1`.
3. Reload. Open the form with the hero Book link, tick "Speaking confidence" in the form, and close
   it. Pick `everyday_life` in the picker and click the bar link: the form shows Speaking
   confidence and Everyday life both active.
4. Click a pressed tile again: it unpresses. Unpress all: the bar loses `data-open`.

Save a screenshot with two tiles picked and the bar visible to `<scratchpad>/t6-picker.png`, and
view it. If a check fails, fix it minimally and report what you changed. Stop only your own
processes.

- [ ] **Step 7: Commit**

```bash
git add src/components/GoalPicker.astro src/components/trial-form/TrialDialog.tsx src/pages/index.astro scripts/built-page.test.ts
git commit -m "feat(redesign): goal picker that pre-ticks the chosen goals in the trial form"
```

---

### Task 7: Tour restyle

**Files:**
- Modify: `src/lib/tour.ts`, `src/lib/tour.test.ts`
- Rewrite: `src/components/TourStrip.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Copy changes, test first**

In `src/lib/tour.test.ts`:
- import `TOUR_FACTS` next to `TOUR_HEADING`;
- in the "no tour text makes a promise" test, add `...TOUR_FACTS,` to the `texts` array;
- append:

```ts
test("the tour header carries three fact tags", () => {
  assert.equal(TOUR_FACTS.length, 3);
  for (const fact of TOUR_FACTS) assert.ok(fact.trim());
});
```

Run `node --test src/lib/tour.test.ts`. Expected: FAIL, because `TOUR_FACTS` is not exported.

- [ ] **Step 2: Update `src/lib/tour.ts`**

Change `TOUR_HEADING` to the block below. `title` is now the eyebrow, and `subline` the h2, without
a full stop. Add `TOUR_FACTS` right after it:

```ts
export const TOUR_HEADING = {
  title: "How it works", // eyebrow
  subline: "From your first message to practice between lessons", // h2
} as const;

// The three facts from the dropped "What lessons look like" block (redesign spec).
export const TOUR_FACTS = [
  "One-to-one on a video call",
  "Your own course in Moodle",
  "Practice app between lessons",
] as const;
```

Run `node --test src/lib/tour.test.ts`. Expected: 6 pass.

- [ ] **Step 3: Rewrite `src/components/TourStrip.astro`**

```astro
---
// "How it works" tour (tour spec + redesign spec, Page 4): a CSS scroll-snap strip of
// phone-framed screenshots. Swiping and scrolling work with no JS. The inline script is
// progressive enhancement: it reveals the arrows (scroll by one card) and marks a step "reached"
// when its card is fully in view or lies to the left of the view; reached steps turn the
// numbered progress line orange. All text comes from tour.ts.
import { TOUR_FACTS, TOUR_HEADING, TOUR_LABELS, TOUR_SLIDES } from "../lib/tour.ts";

const arrowBase =
  "grid h-12 w-12 place-items-center rounded-full text-xl shadow-sm transition disabled:cursor-default disabled:opacity-40 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
---

<section aria-labelledby="tour-heading" class="bg-cream py-20 md:py-24" data-tour>
  <div class="mx-auto max-w-6xl px-6">
    <div class="grid gap-8 md:grid-cols-[1fr_auto] md:items-end" data-reveal>
      <div>
        <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand">{TOUR_HEADING.title}</p>
        <h2 id="tour-heading" class="mt-2 max-w-[22ch] font-display text-4xl font-bold tracking-tight md:text-5xl">
          {TOUR_HEADING.subline}
        </h2>
        <ul class="mt-5 flex flex-wrap gap-2 text-sm font-medium" role="list">
          {TOUR_FACTS.map((fact) => <li class="rounded-full border border-stone-300 px-3 py-1.5">{fact}</li>)}
        </ul>
      </div>
      <div class="hidden gap-2 md:flex" data-tour-nav hidden>
        <button type="button" class={`${arrowBase} bg-white text-stone-900`} aria-label={TOUR_LABELS.previous} data-tour-prev>
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" class={`${arrowBase} bg-stone-900 text-cream`} aria-label={TOUR_LABELS.next} data-tour-next>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>

    <ol
      tabindex="0"
      role="list"
      aria-labelledby="tour-heading"
      data-tour-track
      class={[
        "-mx-6 mt-12 flex scroll-px-6 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-4 motion-reduce:scroll-auto",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand",
      ].join(" ")}
    >
      {
        TOUR_SLIDES.map((slide, i) => (
          <li class="group shrink-0 basis-[80%] snap-start sm:basis-[calc((100%-3rem)/3)]" data-reached={i === 0 ? "" : undefined}>
            <div aria-hidden="true" class="flex items-center gap-3">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white font-display font-bold text-stone-500 transition-colors group-data-[reached]:bg-brand group-data-[reached]:text-stone-900">
                {slide.step}
              </span>
              <span class="h-0.5 flex-1 bg-stone-200 transition-colors group-data-[reached]:bg-brand" />
            </div>
            <div class="mt-6 rounded-[2rem] bg-white p-5 shadow-[0_20px_40px_-24px_rgba(120,60,10,0.3)]">
              <div class="mx-auto w-44 overflow-hidden rounded-[1.9rem] border-[7px] border-stone-900 bg-white">
                <img src={slide.image} alt={slide.alt} width={slide.width} height={slide.height} loading="lazy" decoding="async" class="block h-auto w-full" />
              </div>
            </div>
            <p class="mt-5 font-display text-xl font-bold">{slide.title}</p>
            <p class="mt-1 text-stone-600">{slide.caption}</p>
          </li>
        ))
      }
    </ol>
  </div>
</section>

<script>
  // Progressive enhancement: without this script the strip still swipes and scrolls, the arrows
  // stay hidden and only step 1 is marked reached.
  const root = document.querySelector<HTMLElement>("[data-tour]");
  const track = root?.querySelector<HTMLElement>("[data-tour-track]");
  const nav = root?.querySelector<HTMLElement>("[data-tour-nav]");
  const prev = root?.querySelector<HTMLButtonElement>("[data-tour-prev]");
  const next = root?.querySelector<HTMLButtonElement>("[data-tour-next]");
  if (root && track && nav && prev && next) {
    const cards = Array.from(track.children) as HTMLElement[];
    const cardStep = () => cards[0].offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    const maxScroll = () => track.scrollWidth - track.clientWidth;

    const update = () => {
      const view = track.getBoundingClientRect();
      for (const card of cards) {
        const box = card.getBoundingClientRect();
        card.toggleAttribute("data-reached", box.right <= view.right + 1);
      }
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= maxScroll() - 1;
    };
    const go = (direction: number) =>
      track.scrollBy({
        left: direction * cardStep(),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });

    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    nav.hidden = false;
    update();
  }
</script>
```

- [ ] **Step 4: Move the tour out of the temporary wrapper**

In `src/pages/index.astro`, move `<TourStrip />` out of the narrow wrapper, directly after
`<GoalPicker />`, so `<main>` reads:

```astro
  <main>
    <Hero />
    <Marquee />
    <GoalPicker />
    <TourStrip />
    <div class="mx-auto max-w-3xl px-6">
      <InterimBlock />
      <Footer />
    </div>
  </main>
```

- [ ] **Step 5: Gate**

Run the gate (as in Task 6 Step 5). Expected: `check` 0 errors; `test:built` 5/5; `npm test` 136
pass.

- [ ] **Step 6: Check in a browser**

At 1440×1000:
- the arrows are visible and prev is disabled;
- steps 1–3 have `data-reached`, steps 4–5 do not;
- one click on next marks step 4 reached;
- clicking through to the end disables next, and all five steps are reached.

At 390×844:
- the arrows are hidden;
- step 1 is reached;
- scrolling by one card marks step 2.

Save `<scratchpad>/t7-tour.png` at 1440 and view it. Stop only your own processes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/tour.ts src/lib/tour.test.ts src/components/TourStrip.astro src/pages/index.astro
git commit -m "feat(redesign): restyle the tour with fact tags, big arrows and a progress line"
```

---

### Task 8: Meet Tetiana, CTA panel, footer

**Files:**
- Create: `src/components/MeetTetiana.astro`, `src/components/CtaBand.astro`
- Rewrite: `src/components/Footer.astro`
- Delete: `src/components/InterimBlock.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/MeetTetiana.astro`**

```astro
---
// Meet Tetiana (redesign spec, Page 5): the celebrating mascot in an orange circle with a slowly
// rotating ring of text (decorative), and a short factual paragraph in Tetiana's voice. Her own
// words, numbers and a photo come later (roadmap step 3).
import { MASCOTS, MEET } from "../lib/landingCopy.ts";
import { INSTAGRAM_URL, LINKEDIN_URL } from "../lib/options.ts";

const linkClass =
  "font-medium text-stone-900 underline decoration-brand decoration-2 underline-offset-4 hover:text-stone-950 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand";
---

<section aria-labelledby="meet-heading" class="bg-white py-20 md:py-24">
  <div class="mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-[0.9fr_1.1fr]">
    <div aria-hidden="true" class="relative mx-auto aspect-square w-80 md:w-full md:max-w-md" data-reveal>
      <svg viewBox="0 0 200 200" class="absolute inset-0 h-full w-full animate-spin-slow text-stone-400 motion-reduce:animate-none">
        <defs><path id="meet-ring" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" /></defs>
        <text font-family="Space Grotesk, sans-serif" font-size="11" font-weight="600" letter-spacing="3.2" fill="currentColor">
          <textPath href="#meet-ring">{MEET.ring}</textPath>
        </text>
      </svg>
      <div class="absolute inset-[14%] rounded-full bg-brand/30"></div>
      <img
        src={MASCOTS.celebrate.src}
        alt=""
        width={MASCOTS.celebrate.width}
        height={MASCOTS.celebrate.height}
        loading="lazy"
        decoding="async"
        class="absolute inset-x-[12%] bottom-[10%] h-auto w-[76%]"
      />
    </div>
    <div data-reveal>
      <p class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand">{MEET.eyebrow}</p>
      <h2 id="meet-heading" class="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">{MEET.title}</h2>
      <p class="mt-5 max-w-[52ch] text-lg leading-relaxed text-stone-600">{MEET.paragraph}</p>
      <div class="mt-8 flex gap-6">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" class={linkClass}>
          {MEET.instagram} <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span>
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" class={linkClass}>
          {MEET.linkedin} <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/CtaBand.astro`**

```astro
---
// Call to action (redesign spec, Page 6): replaces InterimBlock. A large orange panel with a dark
// Book button; the waving mascot peeks in on desktop.
import BookTrialLink from "./BookTrialLink.astro";
import { CTA, MASCOTS } from "../lib/landingCopy.ts";
---

<section aria-labelledby="cta-heading" class="bg-white px-4 pb-6 md:px-6">
  <div class="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-brand px-8 py-14 md:px-16 md:py-16" data-reveal>
    <div aria-hidden="true" class="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/15"></div>
    <img
      src={MASCOTS.wave.src}
      alt=""
      width={MASCOTS.wave.width}
      height={MASCOTS.wave.height}
      loading="lazy"
      decoding="async"
      class="absolute -bottom-6 right-6 hidden h-auto w-64 rotate-[4deg] md:block"
    />
    <div class="relative max-w-xl">
      <h2 id="cta-heading" class="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">{CTA.title}</h2>
      <p class="mt-4 text-lg text-stone-900">{CTA.line}</p>
      <div class="mt-8"><BookTrialLink variant="dark" size="lg" /></div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Rewrite `src/components/Footer.astro`**

```astro
---
// Footer (redesign spec, Page 7): logo, line, Tetiana's links, build year.
import { FOOTER } from "../lib/landingCopy.ts";
import { INSTAGRAM_URL, LINKEDIN_URL } from "../lib/options.ts";

const links = [
  { href: INSTAGRAM_URL, label: FOOTER.instagram },
  { href: LINKEDIN_URL, label: FOOTER.linkedin },
];
const year = new Date().getFullYear();
---

<footer class="bg-white">
  <div class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-4">
      <img src="/logo.png" alt="EnglishPusher" width="320" height="320" loading="lazy" class="h-12 w-auto" />
      <p class="text-sm text-stone-600">{FOOTER.line}</p>
    </div>
    <ul class="flex flex-wrap items-center gap-6 text-sm font-medium" role="list">
      {
        links.map(({ href, label }) => (
          <li>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              class="text-stone-900 underline decoration-brand decoration-2 underline-offset-4 hover:text-stone-950 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
            >
              {label} <span aria-hidden="true">↗</span>
              <span class="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))
      }
      <li class="text-stone-600">© {year}</li>
    </ul>
  </div>
</footer>
```

- [ ] **Step 4: Final page order; delete InterimBlock**

```bash
git rm src/components/InterimBlock.astro
```

Then set `src/pages/index.astro`'s imports and body to:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
import Marquee from "../components/Marquee.astro";
import GoalPicker from "../components/GoalPicker.astro";
import TourStrip from "../components/TourStrip.astro";
import MeetTetiana from "../components/MeetTetiana.astro";
import CtaBand from "../components/CtaBand.astro";
import Footer from "../components/Footer.astro";
import TrialDialog from "../components/trial-form/TrialDialog.tsx";

// Interim copy (AC-10): neutral title and description, no "free", price, length or outcome.
const copy = {
  title: "EnglishPusher — English lessons with Tetiana",
  description: "Individual English lessons with Tetiana for adults and IT professionals. Book a trial lesson.",
};
---

<BaseLayout title={copy.title} description={copy.description}>
  <main>
    <Hero />
    <Marquee />
    <GoalPicker />
    <TourStrip />
    <MeetTetiana />
    <CtaBand />
  </main>
  <Footer />
  <TrialDialog client:idle />
</BaseLayout>
```

Update the comment in `scripts/built-page.test.ts`'s three-links test: replace
"(InterimBlock until Task 8)" with nothing, so it reads `// hero, the goal picker's floating bar, the call-to-action panel`.

Search for leftover references: `grep -rn "InterimBlock" src scripts`. Expected: none.

- [ ] **Step 5: Gate**

Run the gate. Expected: `check` 0 errors; `test:built` 5/5; `npm test` 136 pass.

- [ ] **Step 6: Look at it**

Take full-page screenshots at 1440 and 390 into `<scratchpad>/t8-desktop.png` and
`<scratchpad>/t8-mobile.png`, using `captureBeyondViewport: true` with the clip set to
`document.documentElement.scrollHeight`. View them.

Expected:
- the sections appear in order: hero, marquee, picker, tour, Meet Tetiana, orange panel, footer;
- no horizontal overflow at 390;
- the rotating ring is readable;
- the orange panel's mascot is hidden on mobile.

Stop only your own processes.

- [ ] **Step 7: Commit**

```bash
git add src/components/MeetTetiana.astro src/components/CtaBand.astro src/components/Footer.astro src/pages/index.astro scripts/built-page.test.ts
git commit -m "feat(redesign): Meet Tetiana, orange call-to-action panel and a new footer"
```

(The `git rm` from Step 4 is already staged and goes into this commit.)

---

### Task 9: Docs, then full verification

**Files:**
- Modify: `docs/features/landing-page/release-checklist.md` (§2)
- Modify: `docs/features/landing-page/adr/0002-open-trial-dialog-island-via-trial-lesson-hash-links.md`
- Modify: `docs/roadmap.md`

- [ ] **Step 1: Release checklist §2.** In the item "**Tetiana** — approve every visible string in writing":
  - replace `the page (Hero, TourStrip, InterimBlock, Footer),` with
    `the page (Hero, Marquee, GoalPicker, TourStrip, MeetTetiana, CtaBand, Footer),`;
  - replace `The form's wording is in three files, and the tour's in a fourth:` with
    `The form's wording is in three files; the tour's and the page sections' in two more:`;
  - add this bullet after the `tour.ts` bullet, and end the `tour.ts` bullet with `;` instead of `.`:

```markdown
  - [`src/lib/landingCopy.ts`](../../../src/lib/landingCopy.ts): the hero, the course band, the
    goal picker (tiles and chat bubbles), the "Meet Tetiana" paragraph written in her voice, the
    call-to-action panel and the footer.
```

- [ ] **Step 2: ADR-0002 note.** Append to the end of
  `docs/features/landing-page/adr/0002-open-trial-dialog-island-via-trial-lesson-hash-links.md`:

```markdown

## Note (2026-10-31): third Book link from the goal picker

The redesign adds a third plain `#trial-lesson` Book link, in the goal picker's floating bar. The
picker hands the chosen goals to `TrialDialog` through a `trial:goals` window event, with
`window.__pendingTrialGoals` as a fallback for clicks before hydration. `TrialDialog` merges them
with `mergeGoals` (`src/lib/goals.ts`). The decision still holds: every Book link is a plain
`#trial-lesson` link, and no element carries `id="trial-lesson"`. See
[the redesign spec](../../../superpowers/specs/2026-10-31-landing-redesign-design.md).
```

- [ ] **Step 3: Roadmap.** In `docs/roadmap.md`, step 3's Step cell ends with
  `first piece: the "How it works" tour strip ([spec](superpowers/specs/2026-10-31-tour-strip-design.md))`.
  Append `; then the page redesign with the goal picker ([spec](superpowers/specs/2026-10-31-landing-redesign-design.md)) — Tetiana's story, numbers and photo still to come`.
  Leave the status as `idea`.

- [ ] **Step 4: Full gate.** Run `npm test` (136 pass), `astro check` (0 errors), the build, and
  `npm run test:built` (5/5).

- [ ] **Step 5: Browser checks** (preview plus headless Chrome; record observed values)
  1. **No JS** (`Emulation.setScriptExecutionDisabled` true, then reload, 1440): every section's
     heading is visible. The computed opacity of the `[data-reveal]` blocks is `1`, and `<html>`
     does not have `js-reveal`.
  2. **Reduced motion** (`Emulation.setEmulatedMedia` with `prefers-reduced-motion: reduce`, then
     reload): `<html>` has no `js-reveal`. The marquee's, ring's and hero mascot's computed
     `animation-name` is `none`.
  3. **JS on:** scroll to the bottom slowly. Every `[data-reveal]` gets `is-in`.
- [ ] **Step 6: Lighthouse (mobile)** with the preview running (on `localhost`):

```bash
PATH="$(dirname "$N24"):$PATH" CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" \
  npx -y lighthouse@12 http://localhost:4321/ --form-factor=mobile --screenEmulation.mobile \
  --only-categories=performance,accessibility --chrome-flags="--headless=new" \
  --output=json --output-path="<scratchpad>/lh-redesign.json" --quiet
```

  Report:
  - the performance and accessibility scores, LCP and CLS;
  - every accessibility audit with score 0.

  Targets: performance ≥ 90, accessibility ≥ 95, and **no `color-contrast` failure**. If
  `color-contrast` flags the orange eyebrows (`text-brand` on white or cream), change those
  eyebrow `<p>` classes in `GoalPicker.astro`, `TourStrip.astro` and `MeetTetiana.astro` from
  `text-brand` to `text-stone-900`, and add a decorative mark before the text:
  `<span aria-hidden="true" class="mr-2 inline-block h-2 w-2 rounded-full bg-brand align-middle"></span>`.
  Rebuild and re-run Lighthouse.
- [ ] **Step 7: Commit**

```bash
git add docs/features/landing-page/release-checklist.md docs/features/landing-page/adr/0002-open-trial-dialog-island-via-trial-lesson-hash-links.md docs/roadmap.md
git commit -m "docs(redesign): copy approval list, ADR-0002 note and roadmap"
```

If Step 6 changed the eyebrows, commit those three component files separately with the message
`fix(redesign): dark eyebrows with an orange mark for contrast`.
