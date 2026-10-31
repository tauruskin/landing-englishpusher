import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_VALUES } from "./options.ts";
import { outcomeOf, planSend } from "./trialSend.ts";

const valid = { ...EMPTY_VALUES, firstname: "Anna", email: "anna@gmail.com", level: "B1 \u2013 Intermediate" };

test("empty name and bad email: both messages, focus on First name, nothing sent", () => {
  assert.deepEqual(planSend({ ...valid, firstname: " ", email: "anna@gmail" }, ""), {
    action: "invalid",
    errors: { firstname: "Please enter your name", email: "Please enter a valid email" },
    focusId: "tf-firstname",
  });
});

test("only the email is wrong: focus on Email", () => {
  const plan = planSend({ ...valid, email: "" }, "");
  assert.equal(plan.action, "invalid");
  assert.equal(plan.action === "invalid" && plan.focusId, "tf-email");
});

test("validation runs before the trap check, like the app", () => {
  assert.equal(planSend({ ...valid, firstname: "" }, "http://spam").action, "invalid");
});

test("a filled trap field on a valid form is trapped: nothing is sent", () => {
  assert.deepEqual(planSend(valid, "http://spam"), { action: "trapped" });
});

test("a valid form with an empty trap field is sent", () => {
  assert.deepEqual(planSend(valid, ""), { action: "send" });
});

// --- T9: what each outcome shows and records (AC-01, AC-05, AC-08) ------------------------------

test("a confirmed send shows the thank-you and records exactly one generate_lead", () => {
  assert.deepEqual(outcomeOf({ ok: true }), {
    view: "done",
    events: [{ event: "generate_lead", form_name: "trial_lesson" }],
    emptyNextOpening: true,
  });
});

test("each kind of failure keeps the form, shows the banner and records one trial_form_error", () => {
  for (const kind of ["rejected", "network", "timeout"] as const) {
    assert.deepEqual(outcomeOf({ ok: false, kind }), {
      view: "error",
      events: [{ event: "trial_form_error", form_name: "trial_lesson", error_kind: kind }],
      emptyNextOpening: false,
    });
  }
});

test("a trapped bot sees the thank-you but nothing is recorded", () => {
  assert.deepEqual(outcomeOf("trapped"), { view: "done", events: [], emptyNextOpening: true });
});

test("no outcome other than a confirmed send ever records generate_lead", () => {
  for (const o of [outcomeOf("trapped"), outcomeOf({ ok: false, kind: "network" })]) {
    assert.ok(o.events.every((e) => e.event !== "generate_lead"));
  }
});
