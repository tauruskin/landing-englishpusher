// What pressing Send does, as pure logic the TrialForm island follows (AC-02, AC-08).
import type { TrialFormValues } from "./options.ts";
import { validateTrialForm, type TrialFormErrors } from "./validate.ts";

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
