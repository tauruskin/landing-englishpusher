// What pressing Send does and what its outcome shows and records, as pure logic the TrialForm island follows (AC-02, AC-08).
import type { TrialFormValues } from "./options.ts";
import { validateTrialForm, type TrialFormErrors } from "./validate.ts";
import type { SubmitResult } from "./hubspot.ts";
import { generateLead, trialFormError, type TrialFormEvent } from "./events.ts";

export type SendPlan =
  | { action: "invalid"; errors: TrialFormErrors; focusId: "tf-firstname" | "tf-email" }
  | { action: "trapped" }
  | { action: "send" };

/**
 * Invalid → show the messages and focus the first problem field, send nothing. Valid but the
 * hidden trap field is filled (a bot) → pretend it worked, send nothing. Otherwise → send.
 */
export function planSend(values: TrialFormValues, trap: string): SendPlan {
  const errors = validateTrialForm(values);
  if (Object.keys(errors).length > 0) {
    return { action: "invalid", errors, focusId: errors.firstname ? "tf-firstname" : "tf-email" };
  }
  if (trap) return { action: "trapped" };
  return { action: "send" };
}

export type Outcome = {
  /** done = the thank-you (SCR-03); error = the form with the send-failed banner (SCR-04). */
  view: "done" | "error";
  /** dataLayer payloads to push, in order. */
  events: TrialFormEvent[];
  /** After a thank-you, the next opening of the window starts empty (AC-03). */
  emptyNextOpening: boolean;
};

/**
 * "A Trial lesson request counts only when the CRM confirms it" (AC-08): generate_lead only for a
 * confirmed send; one trial_form_error per failed attempt naming only the kind (AC-05); a trapped
 * bot sees the thank-you and nothing is recorded.
 */
export function outcomeOf(result: SubmitResult | "trapped"): Outcome {
  if (result === "trapped") return { view: "done", events: [], emptyNextOpening: true };
  if (result.ok) return { view: "done", events: [generateLead()], emptyNextOpening: true };
  return { view: "error", events: [trialFormError(result.kind)], emptyNextOpening: false };
}
