// Field parity (spec §6 NFR): every level and goal value the form sends must be a value the live
// HubSpot form accepts. These strings are pinned to app-englishpusher:
// src/shared/trialForm/options.ts — if this test fails, a value drifted from the app's copy.
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_VALUES, GOALS, INSTAGRAM_URL, LEVELS, LINKEDIN_URL } from "./options.ts";

test("level values match the app's HubSpot dropdown text exactly (EN DASH)", () => {
  assert.deepEqual(
    LEVELS.map((l) => l.value),
    [
      "A1 \u2013 Beginner",
      "A2 \u2013 Elementary",
      "B1 \u2013 Intermediate",
      "B2 \u2013 Upper-Intermediate",
      "C1 \u2013 Advanced",
      "Not sure",
    ],
  );
});

test("goal values match the app's HubSpot checkbox internal values", () => {
  assert.deepEqual(
    GOALS.map((g) => g.value),
    ["speaking", "work_business", "it_english", "travel", "everyday_life", "other"],
  );
});

test("contact links are the confirmed https addresses", () => {
  assert.equal(INSTAGRAM_URL, "https://www.instagram.com/teti_push_english");
  assert.equal(LINKEDIN_URL, "https://www.linkedin.com/in/tanya-pushkar/");
});

test("the empty form has every field blank", () => {
  assert.deepEqual(EMPTY_VALUES, {
    firstname: "",
    email: "",
    level: "",
    goals: [],
    messenger: "",
    message: "",
  });
});
