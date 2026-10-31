// Copied from app-englishpusher: src/shared/trialForm/validate.test.ts
// (a copy, not a shared package — keep the two in step).
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_VALUES } from "./options.ts";
import { validateTrialForm } from "./validate.ts";

test("an empty form needs a name and an email", () => {
  assert.deepEqual(validateTrialForm(EMPTY_VALUES), {
    firstname: "Please enter your name",
    email: "Please enter your email",
  });
});

test("a name made of spaces counts as empty", () => {
  const errors = validateTrialForm({ ...EMPTY_VALUES, firstname: "   ", email: "a@b.co" });
  assert.deepEqual(errors, { firstname: "Please enter your name" });
});

test("an email without a domain is invalid", () => {
  const errors = validateTrialForm({ ...EMPTY_VALUES, firstname: "Anna", email: "anna@gmail" });
  assert.deepEqual(errors, { email: "Please enter a valid email" });
});

test("a filled form has no errors, even with spaces around the email", () => {
  const errors = validateTrialForm({ ...EMPTY_VALUES, firstname: "Anna", email: "  anna@gmail.com " });
  assert.deepEqual(errors, {});
});
