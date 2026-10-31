// The trial form window's rules as pure logic (ADR-0002, AC-03, AC-04): which address opens it,
// what closing does to the address, and when an opening is recorded or starts with an empty form.
import { trialFormOpen, type TrialFormOpen } from "./events.ts";

export const TRIAL_HASH = "#trial-lesson";

export function shouldOpenOnHash(hash: string): boolean {
  return hash === TRIAL_HASH;
}

/** The address to put back with history.replaceState on close: path + query, no hash. */
export function urlWithoutHash(href: string): string {
  const url = new URL(href);
  return url.pathname + url.search;
}

export type DialogState = { open: boolean; emptyNextOpening: boolean };
export type DialogAction = "open" | "close" | "sent";
export type DialogStep = { state: DialogState; events: TrialFormOpen[]; resetForm: boolean };

export const CLOSED: DialogState = { open: false, emptyNextOpening: false };

/**
 * open: closed → open records one trial_form_open, and empties the form if a send was confirmed
 * since the last opening. An open window asked to open again records nothing.
 * sent: a thank-you was shown; the next opening starts empty (the thank-you itself stays).
 */
export function dialogStep(state: DialogState, action: DialogAction): DialogStep {
  switch (action) {
    case "open":
      if (state.open) return { state, events: [], resetForm: false };
      return {
        state: { open: true, emptyNextOpening: false },
        events: [trialFormOpen()],
        resetForm: state.emptyNextOpening,
      };
    case "close":
      if (!state.open) return { state, events: [], resetForm: false };
      return { state: { ...state, open: false }, events: [], resetForm: false };
    case "sent":
      return { state: { ...state, emptyNextOpening: true }, events: [], resetForm: false };
  }
}
