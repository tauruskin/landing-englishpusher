# "How it works" Tour Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "How it works" section to the landing page: five swipeable, phone-framed
screenshots (trial form → Moodle → B1 flashcards → C1 flashcards → grammar testing), each with a
title and a one-line caption that makes no promises.

**Architecture:** The slide data lives in `src/lib/tour.ts` and is unit-tested, including the
no-promises rule (AC-10) and the image sizes. `src/components/TourStrip.astro` renders a CSS
scroll-snap strip that works with no JavaScript; a small inline script adds the desktop arrows
and the dots. The screenshots are WebP files in `public/tour/`, captured once with headless
Chrome over the DevTools protocol (no new npm dependency).

**Tech Stack:** Astro 7 (static), Tailwind 4 (brand tokens in `src/styles/global.css`), Node's
built-in test runner (`node --test`, `.ts` files run by type stripping), headless Chrome for
capture.

**Spec:** [`docs/superpowers/specs/2026-10-31-tour-strip-design.md`](../specs/2026-10-31-tour-strip-design.md)

---

## Before you start

- **Branch:** `feature/tour-strip` (it already exists, and the spec is committed on it).
- **Node:** `astro check` and `astro build` need Node >= 22.23.4. If `node -v` prints a lower
  version, run those two with Node 24 through npx:
  ```bash
  N24="$(npx -y -p node@24 -- node -e "process.stdout.write(process.execPath)")"
  "$N24" node_modules/astro/bin/astro.mjs check
  "$N24" node_modules/astro/bin/astro.mjs build
  ```
  `npm test` and `npm run test:built` work on any Node >= 22.6.
- **Conventions:**
  - Style with Tailwind utilities and brand tokens only (`brand`, `cream`, `font-display`,
    `font-body`). No other CSS approach.
  - Logic goes in `src/lib/*.ts`, each with a sibling `*.test.ts`.
  - Tests import with the `.ts` extension, e.g. `import { x } from "./tour.ts"`.
- **Copy rule (AC-10):** no title, caption, alt text or label may state a price, "free", a lesson
  length or a learning result. `findPromises` in `src/lib/copyRules.ts` enforces this; it bans,
  for example, "improve", "fast", "confident", "fluent" and "results".
- **Do not add a "Book a trial" link.** `scripts/built-page.test.ts` pins exactly two.
- **Do not merge to `main` until Task 7 is done.** A push to `main` publishes the page, and slide 2
  must not go live as a placeholder.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/lib/webp.ts` | create | Read the pixel width and height from a WebP file header |
| `src/lib/webp.test.ts` | create | Unit tests for `webpSize` on built byte arrays |
| `src/lib/tour.ts` | create | Tour heading, button labels, the five slides (the only place tour text lives) |
| `src/lib/tour.test.ts` | create | Order, non-empty text, no promises, image files exist at the stated size |
| `public/tour/1-trial.webp` … `5-grammar.webp` | create | Screenshots, 780×1688 px (390×844 CSS px at 2×) |
| `src/components/TourStrip.astro` | create | The section: markup, scroll-snap, phone frames, inline arrow and dot script |
| `src/pages/index.astro` | modify | Place `<TourStrip />` between `<Hero />` and `<InterimBlock />` |
| `docs/features/landing-page/release-checklist.md` | modify | Add the tour copy and the image-content check to §2 |
| `docs/roadmap.md` | modify | Note the tour strip as the first piece of step 3 |

The capture script lives in the session scratchpad, not the repo (the spec puts a kept script out
of scope).

---

### Task 1: `webpSize`, which reads a WebP image's dimensions

**Files:**
- Create: `src/lib/webp.ts`
- Test: `src/lib/webp.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/webp.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { webpSize } from "./webp.ts";

// Builds the first 30 bytes of a WebP file: "RIFF" <size> "WEBP" <chunk id> <chunk body…>.
function webp(chunk: string, body: number[]): Uint8Array {
  const bytes = new Uint8Array(30);
  bytes.set([..."RIFF"].map((c) => c.charCodeAt(0)), 0);
  bytes.set([..."WEBP"].map((c) => c.charCodeAt(0)), 8);
  bytes.set([...chunk].map((c) => c.charCodeAt(0)), 12);
  bytes.set(body, 16);
  return bytes;
}

test("lossy VP8: width and height are 14-bit little-endian at bytes 26 and 28", () => {
  // bytes 16..19 chunk size, 20..22 frame tag, 23..25 start code 9d 01 2a, then w, h
  const body = [0, 0, 0, 0, 0, 0, 0, 0x9d, 0x01, 0x2a, 780 & 0xff, 780 >> 8, 1688 & 0xff, 1688 >> 8];
  assert.deepEqual(webpSize(webp("VP8 ", body)), { width: 780, height: 1688 });
});

test("lossless VP8L: width-1 and height-1 packed as 14-bit fields after the 0x2f signature", () => {
  const bits = (780 - 1) | ((1688 - 1) << 14);
  const body = [0, 0, 0, 0, 0x2f, bits & 0xff, (bits >> 8) & 0xff, (bits >> 16) & 0xff, (bits >>> 24) & 0xff];
  assert.deepEqual(webpSize(webp("VP8L", body)), { width: 780, height: 1688 });
});

test("extended VP8X: canvas width-1 and height-1 as 24-bit little-endian at bytes 24 and 27", () => {
  const w = 780 - 1;
  const h = 1688 - 1;
  const body = [0, 0, 0, 0, 0, 0, 0, 0, w & 0xff, (w >> 8) & 0xff, w >> 16, h & 0xff, (h >> 8) & 0xff, h >> 16];
  assert.deepEqual(webpSize(webp("VP8X", body)), { width: 780, height: 1688 });
});

test("a file that is not WebP is rejected", () => {
  assert.throws(() => webpSize(new TextEncoder().encode("\x89PNG\r\n\x1a\n0000000000000000000000")), /not a WebP/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/webp.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `./webp.ts`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/webp.ts`:

```ts
// Reads the pixel size from a WebP file header, so the tour test can check that every screenshot
// matches the width/height the <img> declares (no layout shift). Handles the three WebP
// bitstream chunks: lossy "VP8 ", lossless "VP8L" and extended "VP8X".
export function webpSize(bytes: Uint8Array): { width: number; height: number } {
  const ascii = (offset: number, length: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + length));
  if (bytes.length < 30 || ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WEBP") {
    throw new Error("not a WebP file");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunk = ascii(12, 4);
  if (chunk === "VP8 ") {
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    const u24 = (offset: number) => bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
    return { width: u24(24) + 1, height: u24(27) + 1 };
  }
  throw new Error(`unknown WebP chunk "${chunk}"`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/lib/webp.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/webp.ts src/lib/webp.test.ts
git commit -m "feat(tour): read WebP image dimensions from the file header"
```

---

### Task 2: The slide data, with copy checks

**Files:**
- Create: `src/lib/tour.ts`
- Test: `src/lib/tour.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/tour.test.ts`. The image test comes in Task 3; this task covers the text only.

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { TOUR_HEADING, TOUR_LABELS, TOUR_SLIDES, stepLabel } from "./tour.ts";
import { findPromises } from "./copyRules.ts";

test("five slides, numbered 1 to 5 in display order", () => {
  assert.deepEqual(TOUR_SLIDES.map((s) => s.step), [1, 2, 3, 4, 5]);
});

test("every slide has a title, a caption, alt text and an image under /tour/", () => {
  for (const s of TOUR_SLIDES) {
    assert.ok(s.title.trim(), `step ${s.step}: title`);
    assert.ok(s.caption.trim(), `step ${s.step}: caption`);
    assert.ok(s.alt.trim(), `step ${s.step}: alt`);
    assert.match(s.image, /^\/tour\/\d-[a-z]+\.webp$/, `step ${s.step}: image path`);
  }
});

test("no tour text makes a promise (AC-10)", () => {
  const texts = [
    TOUR_HEADING.title,
    TOUR_HEADING.subline,
    TOUR_LABELS.previous,
    TOUR_LABELS.next,
    ...TOUR_SLIDES.flatMap((s) => [s.title, s.caption, s.alt, stepLabel(s)]),
  ];
  for (const text of texts) assert.deepEqual(findPromises(text), [], text);
});

test("the step label names the position and the title, for screen readers", () => {
  assert.equal(stepLabel(TOUR_SLIDES[1]), `Step 2 of 5: ${TOUR_SLIDES[1].title}`);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/tour.test.ts`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `./tour.ts`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/tour.ts`:

```ts
// The "How it works" tour strip: every word it shows lives here, so Tetiana reviews one file
// (release checklist §2). Interim copy rule AC-10 applies: no price, "free", lesson length or
// learning result. tour.test.ts checks this with findPromises and checks each image's size.
export interface TourSlide {
  step: number; // 1..5, display order
  title: string;
  caption: string;
  image: string; // path under public/
  alt: string;
  width: number; // intrinsic pixel size of the image file
  height: number;
}

export const TOUR_HEADING = {
  title: "How it works",
  subline: "From your first message to practice between lessons.",
} as const;

export const TOUR_LABELS = {
  previous: "Previous slide",
  next: "Next slide",
} as const;

// Screenshots are 390×844 CSS px captured at 2× pixel ratio.
const W = 780;
const H = 1688;

export const TOUR_SLIDES: readonly TourSlide[] = [
  {
    step: 1,
    title: "Book a trial lesson",
    caption: "Tell Tetiana about yourself, your level and your goals.",
    image: "/tour/1-trial.webp",
    alt: "The trial lesson form, with fields for name, email, English level and goals",
    width: W,
    height: H,
  },
  {
    step: 2,
    title: "Your course space",
    caption: "Lesson materials and homework in Moodle.",
    image: "/tour/2-moodle.webp",
    alt: "A Moodle lesson page with a listening exercise and a Check button",
    width: W,
    height: H,
  },
  {
    step: 3,
    title: "Practise new words",
    caption: "Flashcards in the EnglishPusher app, between lessons.",
    image: "/tour/3-flashcards.webp",
    alt: "A B1 vocabulary flashcard in the EnglishPusher app",
    width: W,
    height: H,
  },
  {
    step: 4,
    title: "English for work",
    caption: "C1 vocabulary for work: leadership, innovation and business writing.",
    image: "/tour/4-business.webp",
    alt: "A C1 flashcard from the Writing CEO Communication topic",
    width: W,
    height: H,
  },
  {
    step: 5,
    title: "Check your grammar",
    caption: "Short grammar tests, topic by topic.",
    image: "/tour/5-grammar.webp",
    alt: "A grammar test question in the EnglishPusher grammar app",
    width: W,
    height: H,
  },
];

export function stepLabel(slide: TourSlide): string {
  return `Step ${slide.step} of ${TOUR_SLIDES.length}: ${slide.title}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/lib/tour.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tour.ts src/lib/tour.test.ts
git commit -m "feat(tour): add the tour slide data with copy checks"
```

---

### Task 3: Capture the screenshots and pin their sizes

**Files:**
- Create: `public/tour/1-trial.webp`, `3-flashcards.webp`, `4-business.webp`, `5-grammar.webp`
- Create: `public/tour/2-moodle.webp` (a placeholder until Task 7)
- Modify: `src/lib/tour.test.ts` (append the image test)
- Scratch, not committed: `<scratchpad>/capture-tour.mjs`

- [ ] **Step 1: Write the failing image test**

Append to `src/lib/tour.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { webpSize } from "./webp.ts";

test("every slide image exists in public/ at the width and height the <img> declares", () => {
  for (const s of TOUR_SLIDES) {
    const file = new URL(`../../public${s.image}`, import.meta.url);
    const size = webpSize(new Uint8Array(readFileSync(file)));
    assert.deepEqual(size, { width: s.width, height: s.height }, s.image);
  }
});
```

Move the two new `import` lines to the top of the file with the other imports.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/tour.test.ts`
Expected: FAIL with `ENOENT` for `public/tour/1-trial.webp`.

- [ ] **Step 3: Write the capture script (scratchpad)**

Save as `capture-tour.mjs` in the session scratchpad. It needs Node >= 22 (global `WebSocket`)
and Chrome at the standard Windows path.

```js
// One-off: captures the tour screenshots at 390×844 CSS px, 2× pixel ratio, as WebP.
// Usage: node capture-tour.mjs <repo>/public/tour [moodle-png]
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const OUT = process.argv[2];
const MOODLE_PNG = process.argv[3];
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;
mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), "tour-capture")}`,
  "--no-first-run", "--hide-scrollbars", "about:blank",
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
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

async function shot(name, url, wait = 3000, before) {
  await send("Page.navigate", { url });
  await sleep(wait);
  if (before) await send("Runtime.evaluate", { expression: before, awaitPromise: true });
  await sleep(800);
  const { result } = await send("Page.captureScreenshot", { format: "webp", quality: 80 });
  writeFileSync(join(OUT, name), Buffer.from(result.data, "base64"));
  console.log("wrote", name);
}

if (MOODLE_PNG) {
  // Task 7: fit the owner's phone-width Moodle screenshot to the 390×844 frame, top-aligned.
  const b64 = readFileSync(MOODLE_PNG).toString("base64");
  const html = `<body style="margin:0"><img src="data:image/png;base64,${b64}" style="display:block;width:390px;height:844px;object-fit:cover;object-position:top"></body>`;
  await shot("2-moodle.webp", `data:text/html;base64,${Buffer.from(html).toString("base64")}`, 1000);
} else {
  // Slide 1: this page's own trial form; needs `astro preview` running on :4321.
  await shot("1-trial.webp", "http://localhost:4321/#trial-lesson", 3000);
  // Slide 2 placeholder: brand colours, no text (spec: never published like this).
  const placeholder = `<body style="margin:0;background:#faf8f5;display:flex;flex-direction:column;gap:24px;padding:48px 32px">
    <div style="height:56px;border-radius:16px;background:#f07c1a;opacity:.85"></div>
    ${'<div style="height:72px;border-radius:16px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.08)"></div>'.repeat(6)}</body>`;
  await shot("2-moodle.webp", `data:text/html;base64,${Buffer.from(placeholder).toString("base64")}`, 500);
  await shot("3-flashcards.webp", "https://app.englishpusher.in.ua/b1-flashcards/?topic=jobs", 4000);
  await shot("4-business.webp", "https://app.englishpusher.in.ua/c1-flashcards/?topic=ceo-communication", 4000);
  await shot("5-grammar.webp", "https://grammar.englishpusher.in.ua/", 4000);
}
ws.close();
chrome.kill();
```

- [ ] **Step 4: Build, start the preview and run the capture**

```bash
"$N24" node_modules/astro/bin/astro.mjs build
"$N24" node_modules/astro/bin/astro.mjs preview --port 4321 &
node "<scratchpad>/capture-tour.mjs" "D:/VIBE CODING/landing-englishpusher/public/tour"
```

Expected: five lines, `wrote 1-trial.webp` through `wrote 5-grammar.webp`. Stop the preview
afterwards.

- [ ] **Step 5: Check every image by eye**

Open each file in `public/tour/` (the Read tool shows images). For each one, confirm:

- it shows the intended screen (the trial form is open; a flashcard is visible, not a loading
  spinner or a cookie banner);
- there are **no real people**, no names, emails or account details;
- there is **no coursebook material**.

If a screen shows a start or chooser page instead of a card, add a `before` expression to that
`shot(...)` call that clicks into the first card, e.g.
`document.querySelector('button')?.click()`, and re-run.
Check each file is roughly 40–150 KB: `ls -l public/tour`.

- [ ] **Step 6: Run the test to verify it passes**

Run: `node --test src/lib/tour.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add public/tour src/lib/tour.test.ts
git commit -m "feat(tour): add phone-size tour screenshots (Moodle slide is a placeholder)"
```

---

### Task 4: The `TourStrip` section, static

**Files:**
- Create: `src/components/TourStrip.astro`
- Modify: `src/pages/index.astro` (import and place the component)

- [ ] **Step 1: Create the component without the script**

Create `src/components/TourStrip.astro`:

```astro
---
// "How it works" tour (spec docs/superpowers/specs/2026-10-31-tour-strip-design.md): a CSS
// scroll-snap strip of phone-framed screenshots. Swiping and scrolling work with no JS. The
// inline script below only adds the desktop arrows and the dots. All text comes from tour.ts.
import { TOUR_HEADING, TOUR_LABELS, TOUR_SLIDES, stepLabel } from "../lib/tour.ts";

const arrowClass = [
  "flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-brand shadow-sm",
  "transition-opacity hover:bg-cream disabled:cursor-default disabled:opacity-40",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
].join(" ");
---

<section aria-labelledby="tour-heading" class="py-12" data-tour>
  <div class="flex items-end justify-between gap-4">
    <div>
      <h2 id="tour-heading" class="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
        {TOUR_HEADING.title}
      </h2>
      <p class="mt-2 text-neutral-600">{TOUR_HEADING.subline}</p>
    </div>
    <div class="hidden gap-2 sm:flex" data-tour-nav hidden>
      <button type="button" class={arrowClass} aria-label={TOUR_LABELS.previous} data-tour-prev>
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" class={arrowClass} aria-label={TOUR_LABELS.next} data-tour-next>
        <span aria-hidden="true">›</span>
      </button>
    </div>
  </div>

  <ol
    tabindex="0"
    aria-label={TOUR_HEADING.title}
    data-tour-track
    class={[
      "mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 motion-reduce:scroll-auto",
      "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      "rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    ].join(" ")}
  >
    {
      TOUR_SLIDES.map((slide, i) => (
        <li
          aria-label={stepLabel(slide)}
          class="shrink-0 basis-[80%] snap-start rounded-3xl bg-white p-4 shadow-sm sm:basis-[calc((100%-2rem)/3)]"
        >
          <div class="mx-auto w-40 overflow-hidden rounded-[1.75rem] border-[6px] border-neutral-900 bg-white sm:w-36">
            <img
              src={slide.image}
              alt={slide.alt}
              width={slide.width}
              height={slide.height}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              class="block h-auto w-full"
            />
          </div>
          <p class="mt-4 font-display text-base font-semibold text-neutral-900">
            <span class="text-brand">{slide.step}</span> · {slide.title}
          </p>
          <p class="mt-1 text-sm text-neutral-600">{slide.caption}</p>
        </li>
      ))
    }
  </ol>

  <div aria-hidden="true" class="mt-4 flex justify-center gap-1.5" data-tour-dots>
    {
      TOUR_SLIDES.map((_, i) => (
        <span
          data-dot
          class={`h-1.5 rounded-full transition-all ${i === 0 ? "w-5 bg-brand" : "w-1.5 bg-neutral-300"}`}
        />
      ))
    }
  </div>
</section>
```

The `hidden` attribute on the arrows' wrapper beats `sm:flex`: Tailwind's preflight makes
`[hidden]` `display: none !important`. The arrows stay invisible until the script in Task 5
removes the attribute.

- [ ] **Step 2: Place it on the page**

In `src/pages/index.astro`, add the import after the `Hero` import:

```astro
import TourStrip from "../components/TourStrip.astro";
```

and place the component between `Hero` and `InterimBlock`:

```astro
  <main class="mx-auto max-w-3xl px-6">
    <Hero />
    <TourStrip />
    <InterimBlock />
    <Footer />
  </main>
```

- [ ] **Step 3: Type-check, build and run the built-page tests**

```bash
"$N24" node_modules/astro/bin/astro.mjs check
"$N24" node_modules/astro/bin/astro.mjs build
npm run test:built
```

Expected:

- `check`: 0 errors, 0 warnings.
- The build completes.
- `test:built`: 3 of 3 pass, including "exactly two Book links" and the AC-10 scan, which now
  covers the tour's visible text.

- [ ] **Step 4: Look at it**

Run `"$N24" node_modules/astro/bin/astro.mjs preview` and open `http://localhost:4321` at phone
width (DevTools device mode, 390 px) and at desktop width. Expected:

- phone: one card at about 80% width with the next peeking in, and swiping snaps card to card;
- desktop: about three cards;
- no arrows yet; the first dot is orange.

- [ ] **Step 5: Commit**

```bash
git add src/components/TourStrip.astro src/pages/index.astro
git commit -m "feat(tour): add the How it works swipe strip between the hero and the interim block"
```

---

### Task 5: Desktop arrows and dots, as progressive enhancement

**Files:**
- Modify: `src/components/TourStrip.astro` (append a `<script>` after `</section>`)

- [ ] **Step 1: Add the script**

Append to the end of `src/components/TourStrip.astro`:

```astro
<script>
  // Progressive enhancement: without this script the strip still swipes and scrolls, and the
  // arrows stay hidden. With it, arrows scroll one card and the dots follow the scroll position.
  const root = document.querySelector<HTMLElement>("[data-tour]");
  const track = root?.querySelector<HTMLElement>("[data-tour-track]");
  const nav = root?.querySelector<HTMLElement>("[data-tour-nav]");
  const prev = root?.querySelector<HTMLButtonElement>("[data-tour-prev]");
  const next = root?.querySelector<HTMLButtonElement>("[data-tour-next]");
  if (root && track && nav && prev && next) {
    const cards = Array.from(track.children) as HTMLElement[];
    const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-dot]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cardStep = () => cards[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    const atStart = () => track.scrollLeft <= 1;
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

    const update = () => {
      const current = atEnd() ? dots.length - 1 : Math.round(track.scrollLeft / cardStep());
      dots.forEach((dot, i) => {
        const on = i === current;
        dot.classList.toggle("w-5", on);
        dot.classList.toggle("bg-brand", on);
        dot.classList.toggle("w-1.5", !on);
        dot.classList.toggle("bg-neutral-300", !on);
      });
      prev.disabled = atStart();
      next.disabled = atEnd();
    };
    const go = (direction: number) =>
      track.scrollBy({ left: direction * cardStep(), behavior: reduceMotion ? "auto" : "smooth" });

    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    nav.hidden = false;
    update();
  }
</script>
```

- [ ] **Step 2: Type-check and build**

```bash
"$N24" node_modules/astro/bin/astro.mjs check
"$N24" node_modules/astro/bin/astro.mjs build
npm run test:built
```

Expected: 0 errors, the build completes, 3 of 3 pass.

- [ ] **Step 3: Check the behaviour in a browser**

Preview the build (`astro preview`) and check at desktop width:

- ‹ › appear top right; ‹ is disabled at the start.
- › scrolls one card; at the end › is disabled and the last dot is orange.
- Tab focuses the strip (orange ring), and the ← → keys scroll it.
- With DevTools "Emulate prefers-reduced-motion: reduce", arrows jump without animation.
- With JavaScript disabled (DevTools → Run command → "Disable JavaScript"), the arrows are hidden
  and the strip still scrolls.

At phone width (390 px):

- the arrows are hidden;
- swiping moves the dots.

- [ ] **Step 4: Commit**

```bash
git add src/components/TourStrip.astro
git commit -m "feat(tour): add desktop arrows and position dots to the tour strip"
```

---

### Task 6: Docs, then the full gate

**Files:**
- Modify: `docs/features/landing-page/release-checklist.md` (§2, the Tetiana approval item)
- Modify: `docs/roadmap.md` (step 3 row)

- [ ] **Step 1: Release checklist**

In `docs/features/landing-page/release-checklist.md` §2, in the item that starts
"**Tetiana** — approve every visible string in writing", add this bullet after the
`options.ts` bullet:

```markdown
  - [`src/lib/tour.ts`](../../../src/lib/tour.ts): the "How it works" heading, subline, the five
    slide titles and captions, their alt texts and the arrow labels.
```

Add a new item directly after that one:

```markdown
- [ ] **Operator** — tour screenshots in [`public/tour/`](../../../public/tour/): no real people,
  no names, emails or account details, no coursebook material, and slide 2 is the real Moodle
  screenshot, not the placeholder. Proves AC-10 and the tour spec's content rules.
```

- [ ] **Step 2: Roadmap**

In `docs/roadmap.md`, change the step 3 row's step text from
`Sales content that persuades strangers → see [Not yet specified](#not-yet-specified)` to:

```markdown
Sales content that persuades strangers → see [Not yet specified](#not-yet-specified); first piece: the "How it works" tour strip ([spec](superpowers/specs/2026-10-31-tour-strip-design.md))
```

Leave its status as `idea`. D1 still blocks the rest of step 3.

- [ ] **Step 3: Run the full gate**

```bash
npm test
"$N24" node_modules/astro/bin/astro.mjs check
"$N24" node_modules/astro/bin/astro.mjs build
npm run test:built
```

Expected:

- `npm test`: 114 + 4 (`webp`) + 5 (`tour`) = 123 tests pass, 0 fail.
- `astro check`: 0 errors.
- The build completes.
- `test:built`: 3 of 3 pass.

- [ ] **Step 4: Lighthouse (mobile)**

With the preview running, in Chrome DevTools → Lighthouse → Mobile, run on
`http://localhost:4321`. Expected: Performance ≥ 90, Accessibility ≥ 95. If performance drops
below 90, check that slides 2–5 have `loading="lazy"` and that each image is under 150 KB.

- [ ] **Step 5: Commit**

```bash
git add docs/features/landing-page/release-checklist.md docs/roadmap.md
git commit -m "docs(tour): add the tour copy and screenshots to the release checklist and the roadmap"
```

---

### Task 7: The real Moodle screenshot (blocked on the owner)

**Waits on:** the owner's phone-width screenshot of Moodle *Lesson 1. Activation*, listening
exercise. It should be taken in Chrome DevTools device mode at iPhone 12 size (390 px wide) and
saved as a PNG.

**Files:**
- Modify: `public/tour/2-moodle.webp`

- [ ] **Step 1: Convert it**

```bash
node "<scratchpad>/capture-tour.mjs" "D:/VIBE CODING/landing-englishpusher/public/tour" "<path-to>/moodle-lesson1.png"
```

Expected: `wrote 2-moodle.webp`.

- [ ] **Step 2: Check it by eye**

Confirm the image shows the lesson structure and the listening exercise, with no student names,
no photos of people and no coursebook pictures. The top of the screenshot should be the useful
part, because the image is cropped from the top.

- [ ] **Step 3: Run the tests**

Run: `node --test src/lib/tour.test.ts`
Expected: PASS, 5 tests. The size is still 780×1688.

- [ ] **Step 4: Commit**

```bash
git add public/tour/2-moodle.webp
git commit -m "feat(tour): replace the Moodle placeholder with the real lesson screenshot"
```

After this task, the branch can go to a PR. Merging it publishes the page, so first get
Tetiana's approval of `src/lib/tour.ts` (release checklist §2).
