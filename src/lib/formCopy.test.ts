// AC-10 over the form's copy. The built-page check (scripts/built-page.test.ts) cannot see it: the
// dialog renders nothing until it opens. The form's text lives in three places, all scanned here:
// FORM_COPY (src/lib/formCopy.ts) holds every string the two form components write; the field
// error messages come from validate.ts (the app's own wording, AC-02); the pill labels come from
// options.ts. A last check fails if either component writes visible text outside FORM_COPY.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { findPromises } from "./copyRules.ts";
import { FORM_COPY } from "./formCopy.ts";
import { EMPTY_VALUES, GOALS, LEVELS } from "./options.ts";
import { hardCodedText } from "./jsxText.ts";
import { validateTrialForm } from "./validate.ts";

// Every string leaf of the copy; a function (text with the visitor's name) is called with a sample.
function texts(node: unknown, path = "FORM_COPY"): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  if (typeof node === "function") return [[path, String((node as (name: string) => unknown)("Anna"))]];
  return Object.entries(node as object).flatMap(([key, value]) => texts(value, `${path}.${key}`));
}

test("the form copy holds the headline, thank-you and send-failed banner", () => {
  const all = texts(FORM_COPY).map(([, text]) => text).join(" | ");
  assert.match(all, /Book a trial lesson with Tetiana/);
  assert.match(all, /Thank you, Anna!/);
  assert.match(all, /did not go through/);
  assert.ok(texts(FORM_COPY).length >= 20, "every visible string of the form is in FORM_COPY");
});

// Every message validateTrialForm can show: both fields empty, then a name with a malformed email.
const errorMessages = (): [string, string][] =>
  [
    validateTrialForm({ ...EMPTY_VALUES }),
    validateTrialForm({ ...EMPTY_VALUES, firstname: "Anna", email: "anna@" }),
  ].flatMap((errors) => Object.entries(errors).map(([field, text]): [string, string] => [`validate.${field}`, text]));

test("the validation messages are all collected for the scan", () => {
  assert.equal(new Set(errorMessages().map(([, text]) => text)).size, 3, "name, email and malformed email");
});

test("no string of the form copy, its error messages or its pill labels makes a promise (AC-10)", () => {
  const pills: [string, string][] = [
    ...GOALS.map((g): [string, string] => [`GOALS.${g.value}`, g.label]),
    ...LEVELS.map((l): [string, string] => [`LEVELS.${l.value}`, l.short]),
  ];
  for (const [path, text] of [...texts(FORM_COPY), ...errorMessages(), ...pills]) {
    assert.deepEqual(findPromises(text), [], `${path}: ${text}`);
  }
});

for (const file of ["TrialForm.tsx", "TrialDialog.tsx"]) test(`${file} writes no user-facing text outside FORM_COPY`, () => {
  const source = readFileSync(new URL(`../components/trial-form/${file}`, import.meta.url), "utf8");
  assert.deepEqual(hardCodedText(source), []);
});
