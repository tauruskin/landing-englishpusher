import { test } from "node:test";
import assert from "node:assert/strict";
import { generateLead, pushEvent, trialFormError, trialFormOpen } from "./events.ts";

const ALLOWED_KEYS = new Set(["event", "form_name", "error_kind"]);

test("trial_form_open carries only the event name", () => {
  assert.deepEqual(trialFormOpen(), { event: "trial_form_open" });
});

test("generate_lead carries only the trial_lesson form name", () => {
  assert.deepEqual(generateLead(), { event: "generate_lead", form_name: "trial_lesson" });
});

test("trial_form_error names the form and the kind of failure, for each of the three kinds", () => {
  for (const kind of ["rejected", "network", "timeout"] as const) {
    assert.deepEqual(trialFormError(kind), {
      event: "trial_form_error",
      form_name: "trial_lesson",
      error_kind: kind,
    });
  }
});

test("trial_form_error refuses any other kind (no free text, so no personal data)", () => {
  assert.throws(() => trialFormError("anna@gmail.com" as never));
});

test("no payload has keys beyond event, form_name and error_kind", () => {
  for (const payload of [trialFormOpen(), generateLead(), trialFormError("network")]) {
    for (const key of Object.keys(payload)) assert.ok(ALLOWED_KEYS.has(key), `unexpected key ${key}`);
  }
});

test("pushEvent appends to an existing dataLayer", () => {
  const target: { dataLayer?: unknown[] } = { dataLayer: [{ event: "gtm.js" }] };
  pushEvent(target, generateLead());
  assert.deepEqual(target.dataLayer, [{ event: "gtm.js" }, { event: "generate_lead", form_name: "trial_lesson" }]);
});

test("pushEvent creates dataLayer when GTM is not loaded", () => {
  const target: { dataLayer?: unknown[] } = {};
  pushEvent(target, trialFormOpen());
  assert.deepEqual(target.dataLayer, [{ event: "trial_form_open" }]);
});
