import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_VALUES } from "./options.ts";
import { planSend } from "./trialSend.ts";

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
