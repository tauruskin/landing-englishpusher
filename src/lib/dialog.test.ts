import { test } from "node:test";
import assert from "node:assert/strict";
import { CLOSED, TRIAL_HASH, dialogStep, shouldOpenOnHash, urlWithoutHash } from "./dialog.ts";

test("only #trial-lesson opens the window on load (AC-04)", () => {
  assert.equal(TRIAL_HASH, "#trial-lesson");
  assert.equal(shouldOpenOnHash("#trial-lesson"), true);
  for (const hash of ["", "#", "#trial", "#trial-lesson-x", "#TRIAL-LESSON", "trial-lesson"]) {
    assert.equal(shouldOpenOnHash(hash), false, hash);
  }
});

test("closing removes only the hash and keeps the path and campaign tags (AC-04)", () => {
  assert.equal(
    urlWithoutHash("https://landing.englishpusher.in.ua/?utm_source=ig&utm_campaign=bio#trial-lesson"),
    "/?utm_source=ig&utm_campaign=bio",
  );
  assert.equal(urlWithoutHash("http://localhost:4321/#trial-lesson"), "/");
  assert.equal(urlWithoutHash("https://landing.englishpusher.in.ua/some/path#trial-lesson"), "/some/path");
});

test("each opening records one trial_form_open; asking to open an open window records nothing (AC-03)", () => {
  const first = dialogStep(CLOSED, "open");
  assert.equal(first.state.open, true);
  assert.deepEqual(first.events, [{ event: "trial_form_open" }]);

  const again = dialogStep(first.state, "open");
  assert.equal(again.state.open, true);
  assert.deepEqual(again.events, []);

  const closed = dialogStep(again.state, "close");
  assert.equal(closed.state.open, false);
  assert.deepEqual(closed.events, []);

  const reopened = dialogStep(closed.state, "open");
  assert.deepEqual(reopened.events, [{ event: "trial_form_open" }]);
});

test("closing without a confirmed send keeps the answers for the next opening (AC-03)", () => {
  const closed = dialogStep(dialogStep(CLOSED, "open").state, "close").state;
  assert.equal(dialogStep(closed, "open").resetForm, false);
});

test("after a confirmed send the next opening starts empty, once (AC-03)", () => {
  let s = dialogStep(CLOSED, "open").state;
  s = dialogStep(s, "sent").state;
  const sentStep = dialogStep(s, "sent");
  assert.equal(sentStep.resetForm, false, "sent itself does not clear the thank-you");
  s = dialogStep(s, "close").state;
  const next = dialogStep(s, "open");
  assert.equal(next.resetForm, true);
  const later = dialogStep(dialogStep(next.state, "close").state, "open");
  assert.equal(later.resetForm, false);
});

test("closing an already closed window changes nothing", () => {
  assert.deepEqual(dialogStep(CLOSED, "close"), { state: CLOSED, events: [], resetForm: false });
});
