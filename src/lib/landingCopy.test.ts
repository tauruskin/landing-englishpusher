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
