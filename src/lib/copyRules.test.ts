import { test } from "node:test";
import assert from "node:assert/strict";
import { findPromises } from "./copyRules.ts";

test("neutral Interim copy passes", () => {
  for (const text of [
    "English lessons with Tetiana",
    "Book a trial lesson",
    "Speaking confidence", // a goal option label, not a promise
    "Tell me a little about yourself and I'll get back to you soon.",
    "Thank you, Anna! I'll contact you soon.",
    "Telegram, Viber or phone @username or +380…",
    "Have breakfast", // contains 'fast' only inside a word
  ]) {
    assert.deepEqual(findPromises(text), [], text);
  }
});

test("a free trial lesson is a promise", () => {
  assert.ok(findPromises("Book a free trial lesson").length > 0);
  assert.ok(findPromises("FREE first lesson").length > 0);
});

test("prices and currency amounts are promises", () => {
  for (const text of ["Only 400 ₴ per lesson", "$15 a lesson", "from 20 €", "500 грн", "300 UAH", "See the price list"]) {
    assert.ok(findPromises(text).length > 0, text);
  }
});

test("lesson length is a promise", () => {
  for (const text of ["A 30-minute trial", "45 minutes with Tetiana", "a one-hour lesson", "1 hour", "60 min"]) {
    assert.ok(findPromises(text).length > 0, text);
  }
});

test("learning results are promises", () => {
  for (const text of [
    "Speak confidently at work",
    "Improve your English fast",
    "Become fluent in 3 months",
    "Guaranteed results",
    "Learn English quickly",
  ]) {
    assert.ok(findPromises(text).length > 0, text);
  }
});
