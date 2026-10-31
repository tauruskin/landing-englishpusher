// Goals picked in the page's goal picker are added to the trial form's goals (redesign spec,
// "Goal picker → trial form"). The result is the union, in the form's GOALS order; anything that
// is not a GOALS value is dropped, so the form never sends a value HubSpot does not accept.
import { GOALS } from "./options.ts";

const ORDER: readonly string[] = GOALS.map((goal) => goal.value);

export function mergeGoals(current: readonly string[], added: readonly string[]): string[] {
  const chosen = new Set([...current, ...added]);
  return ORDER.filter((value) => chosen.has(value));
}
