// Copied from app-englishpusher: src/shared/trialForm/hubspot.test.ts (readHutk + buildSubmission
// cases), extended for the Landing page: form ID as a parameter, entry address as pageUri,
// a 15 s cut-off and a failure kind instead of a thrown error.
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_VALUES } from "./options.ts";
import {
  ENTRY_HREF_KEY,
  buildSubmission,
  readEntryAddress,
  readHutk,
  submitTrialForm,
  type SubmitResult,
} from "./hubspot.ts";

const page = {
  pageUri: "https://landing.englishpusher.in.ua/?utm_source=instagram#trial-lesson",
  pageName: "Englishpusher",
};

// --- copied from the app -------------------------------------------------------------------------

test("readHutk finds the hubspotutk cookie among others", () => {
  assert.equal(readHutk("_ga=GA1.1.5; hubspotutk=abc123; __hssc=1"), "abc123");
  assert.equal(readHutk("hubspotutk=first"), "first");
});

test("readHutk returns undefined when the cookie is missing", () => {
  assert.equal(readHutk("_ga=GA1.1.5; xhubspotutk=nope"), undefined);
  assert.equal(readHutk(""), undefined);
});

test("buildSubmission sends every filled field, trimmed, goals joined with ;", () => {
  const body = buildSubmission(
    {
      firstname: " Anna ",
      email: "anna@gmail.com ",
      level: "B1 \u2013 Intermediate",
      goals: ["speaking", "travel"],
      messenger: " @anna ",
      message: "Evenings, please",
    },
    { ...page, hutk: "abc123" },
  );
  assert.deepEqual(body, {
    fields: [
      { objectTypeId: "0-1", name: "firstname", value: "Anna" },
      { objectTypeId: "0-1", name: "email", value: "anna@gmail.com" },
      { objectTypeId: "0-1", name: "english_level", value: "B1 \u2013 Intermediate" },
      { objectTypeId: "0-1", name: "learning_goals", value: "speaking;travel" },
      { objectTypeId: "0-1", name: "messenger_contact", value: "@anna" },
      { objectTypeId: "0-1", name: "message", value: "Evenings, please" },
    ],
    context: { ...page, hutk: "abc123" },
  });
});

test("buildSubmission leaves out empty optional fields and a missing hutk", () => {
  const body = buildSubmission({ ...EMPTY_VALUES, firstname: "Anna", email: "anna@gmail.com", message: "  " }, page);
  assert.deepEqual(body, {
    fields: [
      { objectTypeId: "0-1", name: "firstname", value: "Anna" },
      { objectTypeId: "0-1", name: "email", value: "anna@gmail.com" },
    ],
    context: page,
  });
  assert.equal("hutk" in body.context, false);
});

test("readHutk does not throw on a malformed value", () => {
  assert.equal(readHutk("hubspotutk=%E0%A4%A"), "%E0%A4%A");
});

// --- Landing: submitTrialForm -------------------------------------------------------------------

const values = { ...EMPTY_VALUES, firstname: "Anna", email: "anna@gmail.com" };

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: (call: Call) => Promise<Response>) {
  const calls: Call[] = [];
  const fetchImpl = ((url: string, init: RequestInit) => {
    const call = { url: String(url), init };
    calls.push(call);
    return respond(call);
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

function send(fetchImpl: typeof fetch, extra: { hutk?: string; timeoutMs?: number } = {}) {
  return submitTrialForm({
    portalId: "149535757",
    formId: "test-form-id",
    values,
    pageUri: page.pageUri,
    pageName: page.pageName,
    fetchImpl,
    ...extra,
  });
}

test("a 2xx answer is a confirmed send, posted to the given portal and form", async () => {
  const { fetchImpl, calls } = fakeFetch(async () => new Response(null, { status: 200 }));
  const result: SubmitResult = await send(fetchImpl);
  assert.deepEqual(result, { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    "https://api.hsforms.com/submissions/v3/integration/submit/149535757/test-form-id",
  );
  assert.equal(calls[0].init.method, "POST");
});

test("a non-2xx answer is rejected", async () => {
  const { fetchImpl } = fakeFetch(async () => new Response("bad", { status: 400 }));
  assert.deepEqual(await send(fetchImpl), { ok: false, kind: "rejected" });
});

test("a thrown fetch (offline, DNS, CORS) is network", async () => {
  const { fetchImpl } = fakeFetch(async () => {
    throw new TypeError("Failed to fetch");
  });
  assert.deepEqual(await send(fetchImpl), { ok: false, kind: "network" });
});

test("no answer within 15 s is timeout, and the request is aborted", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { fetchImpl, calls } = fakeFetch(() => new Promise<Response>(() => {}));
  let settled: SubmitResult | undefined;
  const pending = send(fetchImpl).then((r) => (settled = r));
  await Promise.resolve();
  t.mock.timers.tick(14_999);
  await Promise.resolve();
  assert.equal(settled, undefined, "still waiting just before 15 s");
  t.mock.timers.tick(1);
  await pending;
  assert.deepEqual(settled, { ok: false, kind: "timeout" });
  assert.equal(calls[0].init.signal?.aborted, true);
});

test("an answer arriving after the cut-off is ignored", async () => {
  const { fetchImpl } = fakeFetch(
    () => new Promise<Response>((resolve) => setTimeout(() => resolve(new Response(null, { status: 200 })), 40)),
  );
  assert.deepEqual(await send(fetchImpl, { timeoutMs: 10 }), { ok: false, kind: "timeout" });
});

test("the body carries the entry address as pageUri, and hutk only when given", async () => {
  const { fetchImpl, calls } = fakeFetch(async () => new Response(null, { status: 204 }));
  await send(fetchImpl);
  await send(fetchImpl, { hutk: "abc123" });
  const first = JSON.parse(String(calls[0].init.body));
  const second = JSON.parse(String(calls[1].init.body));
  assert.deepEqual(first.context, page);
  assert.deepEqual(second.context, { ...page, hutk: "abc123" });
});

// --- Landing: readEntryAddress ------------------------------------------------------------------

test("readEntryAddress returns the address the head script stored", () => {
  const win = {
    [ENTRY_HREF_KEY]: "https://landing.englishpusher.in.ua/?utm_source=ig#trial-lesson",
    location: { href: "https://landing.englishpusher.in.ua/?utm_source=ig" },
  };
  assert.equal(ENTRY_HREF_KEY, "__entryHref");
  assert.equal(readEntryAddress(win), "https://landing.englishpusher.in.ua/?utm_source=ig#trial-lesson");
});

test("readEntryAddress falls back to the current address when nothing was stored", () => {
  assert.equal(readEntryAddress({ location: { href: "http://localhost:4321/" } }), "http://localhost:4321/");
});

