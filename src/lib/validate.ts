// Copied from app-englishpusher: src/shared/trialForm/validate.ts
// (a copy, not a shared package — keep the two in step).
import type { TrialFormValues } from "./options.ts";

export type TrialFormErrors = Partial<Record<"firstname" | "email", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only name and email are required; everything else is optional.
export function validateTrialForm(values: TrialFormValues): TrialFormErrors {
  const errors: TrialFormErrors = {};
  if (!values.firstname.trim()) errors.firstname = "Please enter your name";
  const email = values.email.trim();
  if (!email) errors.email = "Please enter your email";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email";
  return errors;
}
