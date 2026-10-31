import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webpSize } from "./webp.ts";
import { allLandingText, MASCOTS, PICKER } from "./landingCopy.ts";
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

test("each mascot is a transparent WebP at the width and height the <img> declares", () => {
  for (const mascot of Object.values(MASCOTS)) {
    const bytes = new Uint8Array(readFileSync(new URL(`../../public${mascot.src}`, import.meta.url)));
    assert.deepEqual(webpSize(bytes), { width: mascot.width, height: mascot.height }, mascot.src);
    const chunk = String.fromCharCode(...bytes.subarray(12, 16));
    assert.ok(chunk === "VP8X" && (bytes[20] & 0x10) !== 0, `${mascot.src} has an alpha channel`);
  }
});
