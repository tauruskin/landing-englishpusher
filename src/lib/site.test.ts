import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INTERIM_COPY,
  LIVE_FORM_ID,
  LIVE_HOST,
  PORTAL_ID,
  TEST_FORM_ID,
  formIdFor,
  isPublished,
} from "./site.ts";

const NOT_PUBLISHED = [
  "localhost",
  "127.0.0.1",
  "tauruskin.github.io",
  "www.landing.englishpusher.in.ua",
  "landing.englishpusher.in.ua.evil.com",
  "LANDING.englishpusher.in.ua:4321",
  "LANDING.englishpusher.in.ua",
  "englishpusher.in.ua",
  "",
];

test("only the exact live host counts as published", () => {
  assert.equal(LIVE_HOST, "landing.englishpusher.in.ua");
  assert.equal(isPublished("landing.englishpusher.in.ua"), true);
  for (const host of NOT_PUBLISHED) assert.equal(isPublished(host), false, `${host} must not be published`);
});

test("the live form ID is used only on the live host, the Test form everywhere else", () => {
  assert.equal(formIdFor("landing.englishpusher.in.ua"), LIVE_FORM_ID);
  for (const host of NOT_PUBLISHED) assert.equal(formIdFor(host), TEST_FORM_ID, host);
});

test("the HubSpot IDs are the real portal, live form and Test form, and the two forms differ", () => {
  assert.equal(PORTAL_ID, "149535757");
  assert.equal(LIVE_FORM_ID, "2226dfee-47d4-406f-ae1a-2e8c0952dec2");
  assert.equal(TEST_FORM_ID, "b0bbb13b-2b4b-4d5e-b7b6-2d75de3db87b");
  assert.notEqual(TEST_FORM_ID, LIVE_FORM_ID);
});

test("the page currently shows Interim copy", () => {
  assert.equal(INTERIM_COPY, true);
});
