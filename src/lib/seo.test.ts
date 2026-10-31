import { test } from "node:test";
import assert from "node:assert/strict";
import { robotsMeta, robotsTxt, sitemapXml } from "./seo.ts";

const SITE = "https://landing.englishpusher.in.ua";

test("interim copy asks not to be indexed; real copy asks to be indexed", () => {
  assert.equal(robotsMeta(true), "noindex, follow");
  assert.equal(robotsMeta(false), "index, follow");
});

test("by default the robots meta follows INTERIM_COPY (true) — noindex", () => {
  assert.equal(robotsMeta(), "noindex, follow");
});

test("robots.txt allows crawling and names the sitemap, with or without a trailing slash", () => {
  for (const site of [SITE, `${SITE}/`]) {
    const body = robotsTxt(site);
    assert.equal(body, `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
    assert.doesNotMatch(body, /Disallow/);
  }
});

test("the sitemap is a valid empty urlset while the copy is interim", () => {
  const xml = sitemapXml(SITE, true);
  assert.equal(
    xml,
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
  );
  assert.doesNotMatch(xml, /<url>/);
  assert.equal(sitemapXml(SITE), xml, "default follows INTERIM_COPY");
});

test("the sitemap lists exactly the home page once the copy is real", () => {
  for (const site of [SITE, `${SITE}/`]) {
    assert.equal(
      sitemapXml(site, false),
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        "  <url><loc>https://landing.englishpusher.in.ua/</loc></url>\n</urlset>\n",
    );
  }
});
