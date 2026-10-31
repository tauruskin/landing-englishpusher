import { test } from "node:test";
import assert from "node:assert/strict";
import { TOUR_HEADING, TOUR_LABELS, TOUR_SLIDES } from "./tour.ts";
import { findPromises } from "./copyRules.ts";
import { readFileSync } from "node:fs";
import { webpSize } from "./webp.ts";

test("five slides, numbered 1 to 5 in display order", () => {
  assert.deepEqual(TOUR_SLIDES.map((s) => s.step), [1, 2, 3, 4, 5]);
});

test("every slide has a title, a caption, alt text and an image under /tour/", () => {
  for (const s of TOUR_SLIDES) {
    assert.ok(s.title.trim(), `step ${s.step}: title`);
    assert.ok(s.caption.trim(), `step ${s.step}: caption`);
    assert.ok(s.alt.trim(), `step ${s.step}: alt`);
    assert.match(s.image, /^\/tour\/\d-[a-z]+\.webp$/, `step ${s.step}: image path`);
    assert.ok(s.image.startsWith(`/tour/${s.step}-`), `step ${s.step}: image number matches step`);
  }
});

test("no tour text makes a promise (AC-10)", () => {
  const texts = [
    TOUR_HEADING.title,
    TOUR_HEADING.subline,
    TOUR_LABELS.previous,
    TOUR_LABELS.next,
    ...TOUR_SLIDES.flatMap((s) => [s.title, s.caption, s.alt]),
  ];
  for (const text of texts) assert.deepEqual(findPromises(text), [], text);
});

test("every slide image exists in public/ at the width and height the <img> declares", () => {
  for (const s of TOUR_SLIDES) {
    const file = new URL(`../../public${s.image}`, import.meta.url);
    const size = webpSize(new Uint8Array(readFileSync(file)));
    assert.deepEqual(size, { width: s.width, height: s.height }, s.image);
  }
});
