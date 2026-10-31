// Checks over the built page (run after `npm run build`: `npm run test:built`). AC-10: the Interim
// copy makes no promises in visible text, title, description or link-preview text. ADR-0002: every
// Book link is a plain #trial-lesson link and no element carries id="trial-lesson".
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { findPromises } from "../src/lib/copyRules.ts";
import { MARQUEE } from "../src/lib/landingCopy.ts";
import { GOALS, INSTAGRAM_URL, LINKEDIN_URL } from "../src/lib/options.ts";

const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");

const decode = (s: string) =>
  s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function visibleText(page: string): string {
  return decode(
    page
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
}

function metaTexts(page: string): string[] {
  const title = page.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
  const metas = [...page.matchAll(/<meta\s+(?:name|property)="(description|og:title|og:description|twitter:title|twitter:description)"\s+content="([^"]*)"/g)].map((m) => m[2]);
  return [title, ...metas].map(decode);
}

test("visible text, title and link-preview text make no promises (AC-10)", () => {
  const texts = [visibleText(html), ...metaTexts(html)];
  assert.ok(metaTexts(html).filter(Boolean).length >= 6, "title + 5 description/preview metas present");
  for (const text of texts) assert.deepEqual(findPromises(text), [], text.slice(0, 120));
});

test("exactly three Book links point at #trial-lesson and nothing has that id (ADR-0002)", () => {
  // hero, the goal picker's floating bar, the call-to-action panel (InterimBlock until Task 8)
  assert.equal([...html.matchAll(/<a\b[^>]*href="#trial-lesson"/g)].length, 3);
  assert.doesNotMatch(html, /id="trial-lesson"/);
});

test("the goal picker has six unpressed goal buttons", () => {
  const tiles = [...html.matchAll(/<button\b[^>]*data-goal="[^"]+"[^>]*>/g)].map((m) => m[0]);
  assert.equal(tiles.length, 6);
  for (const tag of tiles) assert.match(tag, /aria-pressed="false"/);
});

test("every goal button carries a value the trial form accepts", () => {
  const allowed: string[] = GOALS.map((goal) => goal.value);
  const values = [...html.matchAll(/data-goal="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(values.length > 0);
  for (const value of values) assert.ok(allowed.includes(value), value);
});

test("the footer links Tetiana's Instagram and LinkedIn in a new tab", () => {
  const anchors = [...html.matchAll(/<a\s[^>]*>/g)].map((m) => m[0]);
  for (const url of [INSTAGRAM_URL, LINKEDIN_URL]) {
    const tag = anchors.find((a) => a.includes(`href="${url}"`));
    assert.ok(tag, url);
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener[^"]*"/);
  }
});

test("the marquee reads each course once; the repeats are hidden", () => {
  const copies = [...html.matchAll(/<div\b[^>]*data-marquee-copy[^>]*>/g)].map((m) => m[0]);
  assert.ok(copies.length >= 2 && copies.length % 2 === 0, "an even number of copies keeps the -50% loop seamless");
  assert.equal(copies.filter((tag) => !/aria-hidden="true"/.test(tag)).length, 1);
  const visible = [...html.matchAll(/<div\b(?![^>]*aria-hidden)[^>]*data-marquee-copy[^>]*>([^]*?)<\/div>/g)];
  assert.equal(visible.length, 1);
  const names = [...visible[0][1].matchAll(/<span>([^<]*)<\/span>/g)].map((m) => decode(m[1]));
  assert.deepEqual(names, [...MARQUEE]);
});
