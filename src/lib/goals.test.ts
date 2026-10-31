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
