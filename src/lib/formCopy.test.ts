// AC-10 over the form's copy. The built-page check (scripts/built-page.test.ts) cannot see it: the
// dialog renders nothing until it opens. So every visible string of the form lives in FORM_COPY,
// and this test scans it, the pill labels, and both form components for text written outside FORM_COPY.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { findPromises } from "./copyRules.ts";
import { FORM_COPY } from "./formCopy.ts";
import { GOALS, LEVELS } from "./options.ts";

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

test("no string of the form copy or its pill labels makes a promise (AC-10)", () => {
  const pills: [string, string][] = [
    ...GOALS.map((g): [string, string] => [`GOALS.${g.value}`, g.label]),
    ...LEVELS.map((l): [string, string] => [`LEVELS.${l.value}`, l.short]),
  ];
  for (const [path, text] of [...texts(FORM_COPY), ...pills]) {
    assert.deepEqual(findPromises(text), [], `${path}: ${text}`);
  }
});

for (const file of ["TrialForm.tsx", "TrialDialog.tsx"]) test(`${file} writes no user-facing text outside FORM_COPY`, () => {
  const source = readFileSync(new URL(`../components/trial-form/${file}`, import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  // A JSX text run sits between a tag or an expression and the next one; a run that reads like
  // code (a statement, an assignment, a condition) is not text.
  const jsxText = [...source.matchAll(/[>}]([^<>{}]*[A-Za-z][^<>{}]*)[<{]/g)]
    .map((m) => m[1].trim())
    .filter((run) => !/[;=]|&&|\|\||^:|^(?:return|catch|function|else|try|for|if|const|let)\b/.test(run));
  const attrText = [...source.matchAll(/\b(?:alt|placeholder|aria-label|title|label|hint)="([^"]*[A-Za-z][^"]*)"/g)].map((m) => m[0]);
  assert.deepEqual([...jsxText, ...attrText], []);
});
