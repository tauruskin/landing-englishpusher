// Checks over the built page (run after `npm run build`: `npm run test:built`). AC-10: the Interim
// copy makes no promises in visible text, title, description or link-preview text. ADR-0002: every
// Book link is a plain #trial-lesson link and no element carries id="trial-lesson".
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { findPromises } from "../src/lib/copyRules.ts";
import { INSTAGRAM_URL, LINKEDIN_URL } from "../src/lib/options.ts";

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

test("exactly two Book links point at #trial-lesson and nothing has that id (ADR-0002)", () => {
  assert.equal([...html.matchAll(/<a\b[^>]*href="#trial-lesson"/g)].length, 2);
  assert.doesNotMatch(html, /id="trial-lesson"/);
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

test("the marquee's second copy is hidden from screen readers", () => {
  const copies = [...html.matchAll(/<div\b[^>]*data-marquee-copy[^>]*>/g)].map((m) => m[0]);
  assert.equal(copies.length, 2);
  assert.equal(copies.filter((tag) => /aria-hidden="true"/.test(tag)).length, 1);
});
