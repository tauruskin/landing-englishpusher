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
