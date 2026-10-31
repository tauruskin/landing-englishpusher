import { test } from "node:test";
import assert from "node:assert/strict";
import { hardCodedText } from "./jsxText.ts";

const component = (jsx: string, before = "") =>
  `${before}\nexport default function C({ on, xs }: { on: boolean; xs: string[] }) {\n  return (\n    ${jsx}\n  );\n}\n`;

// Every way of writing a visible string that the review found the old regex guard missed.
const caught: [string, string, string?][] = [
  ["bare JSX text", "<p>Free lesson</p>"],
  ["text with an equals sign", "<p>Price = 500 UAH</p>"],
  ["text with a semicolon", "<p>Hi; it is free</p>"],
  ["a string literal in braces", '<p>{"Free lesson"}</p>'],
  ["a single-quoted literal in braces", "<p>{'Free lesson'}</p>"],
  ["a template literal", "<p>{`Free lesson`}</p>"],
  ["a template literal with a substitution", "<p>{`Free ${xs.length} lessons`}</p>"],
  ["a ternary branch", '<p>{on ? "Free lesson" : null}</p>'],
  ["the right side of &&", '<p>{on && "Free lesson"}</p>'],
  ["a string returned from map", '<ul>{xs.map(() => "Free lesson")}</ul>'],
  ["alt in double quotes", '<img alt="Tetiana" />'],
  ["alt in single quotes", "<img alt='Tetiana' />"],
  ["alt in braces", '<img alt={"Tetiana"} />'],
  ["title", '<a title="Free lesson" />'],
  ["placeholder in braces", "<input placeholder={`Your name`} />"],
  ["aria-label", '<button aria-label="Close" />'],
  ["aria-description", '<div aria-description="Free lesson" />'],
  ["aria-roledescription", '<div aria-roledescription="slide" />'],
  ["a component's label prop", '<Field label="Your name" />'],
  ["a component's hint prop as a ternary", '<Field hint={on ? "optional" : ""} />'],
  ["a module constant rendered as a child", "<p>{PROMO}</p>", 'const PROMO = "Free 30 minute lesson";'],
  ["a module constant as alt", "<img alt={PROMO} />", "const PROMO = `Tetiana`;"],
  ["a component's error prop", '<Field error="Free lesson" />'],
  ["a component's error prop as a ternary", '<Field error={on ? "Free lesson" : undefined} />'],
  ["a bare price with no letter", "<p>₴500</p>"],
  ["a price in braces", '<p>{"500 ₴"}</p>'],
  ["a Cyrillic word", "<p>Безкоштовно</p>"],
  ["a module let", "<p>{PROMO}</p>", 'let PROMO = "Free lesson";'],
  ["a module constant with a ternary", "<p>{PROMO}</p>", 'const PROMO = Math.random() > 1 ? "Free lesson" : "";'],
  ["a field of a module object constant", "<p>{T.promo}</p>", 'const T = { promo: "Free lesson" };'],
];

// A constant declared inside the component, before it returns its JSX.
const inside = (decl: string, jsx: string) =>
  `export default function C({ on }: { on: boolean }) {
  ${decl}
  return (
    ${jsx}
  );
}
`;

const caughtInside: [string, string, string][] = [
  ["a constant inside the component", 'const promo = "Free lesson";', "<p>{promo}</p>"],
  ["a ternary constant inside the component", 'const cta = on ? "Try again" : COPY.submit;', "<button>{cta}</button>"],
  ["a template constant inside the component", "const line = `Free ${1} lesson`;", '<img alt={line} />'],
];

for (const [name, decl, jsx] of caughtInside) {
  test(`catches ${name}`, () => {
    assert.notDeepEqual(hardCodedText(inside(decl, jsx)), [], decl);
  });
}

for (const [name, jsx, before] of caught) {
  test(`catches ${name}`, () => {
    assert.notDeepEqual(hardCodedText(component(jsx, before)), [], jsx);
  });
}

// Code the real components contain: none of it is visible text.
const ignored: [string, string, string?][] = [
  ["classes, ids and copy lookups", '<p className="text-sm font-bold" id={`${xs[0]}-error`}>{COPY.line}</p>'],
  ["an id chosen by a ternary", '<input aria-describedby={on ? "tf-email-error" : undefined} />'],
  ["boolean and role attributes", '<div role="dialog" aria-modal="true" aria-hidden="true" />'],
  ["a space joiner and a symbol", '<span>{" "}*</span>'],
  ["strings inside an event handler", '<button type="button" onClick={() => set("level", "")} />'],
  ["a map over data", "<ul>{xs.map((x) => <li key={x}>{x}</li>)}</ul>"],
  ["a filter argument inside a child", '<ul>{xs.filter((x) => x === "goal").map((x) => <li key={x}>{x}</li>)}</ul>'],
  ["a class-list constant", '<p className={labelClass}>{COPY.line}</p>', 'const labelClass = "text-sm font-semibold";'],
  ["comments", "<p>{/* Header: the avatar sticks out */}{COPY.line}</p>"],
  ["entity-only text", "<span>&nbsp;</span><b>&times;</b>"],
  ["a local class constant", "<p className={cls}>{COPY.line}</p>", 'const cls = on ? "text-brand" : "text-neutral-600";'],
  ["a local copy alias", "<p>{line}</p>", "const line = COPY.line;"],
];

for (const [name, jsx, before] of ignored) {
  test(`ignores ${name}`, () => {
    assert.deepEqual(hardCodedText(component(jsx, before)), [], jsx);
  });
}
