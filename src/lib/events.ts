// dataLayer payloads for the trial form, with the app's event names. Everything goes through GTM;
// off the published host GTM is not loaded and pushes land in an array nothing reads (sad §11).
// No event carries personal data: the builders take no free-form input beyond the failure kind.
import type { FailureKind } from "./hubspot.ts";

const FORM_NAME = "trial_lesson";
const FAILURE_KINDS: readonly FailureKind[] = ["rejected", "network", "timeout"];

export type TrialFormOpen = { event: "trial_form_open" };
export type GenerateLead = { event: "generate_lead"; form_name: typeof FORM_NAME };
export type TrialFormError = { event: "trial_form_error"; form_name: typeof FORM_NAME; error_kind: FailureKind };
export type TrialFormEvent = TrialFormOpen | GenerateLead | TrialFormError;

/** One per opening of the trial form window (AC-03). */
export function trialFormOpen(): TrialFormOpen {
  return { event: "trial_form_open" };
}

/** Only after HubSpot confirms the send (AC-01). */
export function generateLead(): GenerateLead {
  return { event: "generate_lead", form_name: FORM_NAME };
}

/** One per failed send attempt, naming only the kind of failure (AC-05). */
export function trialFormError(kind: FailureKind): TrialFormError {
  if (!FAILURE_KINDS.includes(kind)) throw new Error("unknown failure kind");
  return { event: "trial_form_error", form_name: FORM_NAME, error_kind: kind };
}

export function pushEvent(target: { dataLayer?: unknown[] }, payload: TrialFormEvent): void {
  target.dataLayer ??= [];
  target.dataLayer.push(payload);
}
