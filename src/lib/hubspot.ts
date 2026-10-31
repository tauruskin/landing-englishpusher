// Copied from app-englishpusher: src/shared/trialForm/hubspot.ts
// (a copy, not a shared package — a HubSpot field change goes into both repos).
// Landing changes: the form ID is a parameter (live vs Test form, ADR-0001), pageUri is the entry
// address the head script stored (AC-07), and a send resolves to a failure kind instead of throwing
// (rejected | network | timeout, AC-05), with a 15 s cut-off that ignores any later answer.
import type { TrialFormValues } from "./options.ts";

// ---------------------------------------------------------------------------
// Sends the trial form to a HubSpot form through HubSpot's public submission
// API (no key needed). The hubspotutk cookie, set by the HubSpot tracking code
// that GTM loads, links the submission to the visitor's history (UTM, referrer).
// ---------------------------------------------------------------------------

export const SUBMIT_TIMEOUT_MS = 15_000;

/** The `window` key the inline head script stores the arrival address under (T6 writes it). */
export const ENTRY_HREF_KEY = "__entryHref";

export type SubmitContext = { hutk?: string; pageUri: string; pageName: string };

export type FailureKind = "rejected" | "network" | "timeout";
export type SubmitResult = { ok: true } | { ok: false; kind: FailureKind };

type Field = { objectTypeId: "0-1"; name: string; value: string };

export function submitUrl(portalId: string, formId: string): string {
  return `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
}

export function readHutk(cookie: string): string | undefined {
  const match = cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** The address the visitor arrived at, as stored by the head script; the current one if absent. */
export function readEntryAddress(win: { location: { href: string } }): string {
  const stored = (win as Record<string, unknown>)[ENTRY_HREF_KEY];
  return typeof stored === "string" && stored !== "" ? stored : win.location.href;
}

// HubSpot property name -> value. Empty optional fields are not sent.
export function buildSubmission(values: TrialFormValues, context: SubmitContext) {
  const pairs: [string, string][] = [
    ["firstname", values.firstname.trim()],
    ["email", values.email.trim()],
    ["english_level", values.level],
    ["learning_goals", values.goals.join(";")],
    ["messenger_contact", values.messenger.trim()],
    ["message", values.message.trim()],
  ];
  const fields: Field[] = pairs
    .filter(([, value]) => value !== "")
    .map(([name, value]) => ({ objectTypeId: "0-1", name, value }));
  const ctx: SubmitContext = { pageUri: context.pageUri, pageName: context.pageName };
  if (context.hutk) ctx.hutk = context.hutk;
  return { fields, context: ctx };
}

export type SubmitOptions = {
  portalId: string;
  formId: string;
  values: TrialFormValues;
  pageUri: string;
  pageName: string;
  hutk?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

// Never throws. Only the failure kind leaves this function — HubSpot's error text may echo
// personal data and must not reach analytics.
export async function submitTrialForm(opts: SubmitOptions): Promise<SubmitResult> {
  const { portalId, formId, values, pageUri, pageName, hutk } = opts;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? SUBMIT_TIMEOUT_MS;
  const body = buildSubmission(values, { pageUri, pageName, hutk });

  // Each call has its own controller and timer, so a retry is never cut off by an earlier one.
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<SubmitResult>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve({ ok: false, kind: "timeout" });
    }, timeoutMs);
  });

  const sent = (async (): Promise<SubmitResult> => {
    try {
      const res = await fetchImpl(submitUrl(portalId, formId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return res.ok ? { ok: true } : { ok: false, kind: "rejected" };
    } catch {
      return { ok: false, kind: controller.signal.aborted ? "timeout" : "network" };
    }
  })();

  // Whichever settles first wins; an answer after the cut-off is ignored.
  try {
    return await Promise.race([sent, timedOut]);
  } finally {
    clearTimeout(timer);
  }
}
