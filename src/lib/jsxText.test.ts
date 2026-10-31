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
];

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
];

for (const [name, jsx, before] of ignored) {
  test(`ignores ${name}`, () => {
    assert.deepEqual(hardCodedText(component(jsx, before)), [], jsx);
  });
}
