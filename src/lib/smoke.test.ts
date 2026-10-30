// Skeleton smoke test: proves `npm test` (node --test with type stripping)
// picks up TypeScript tests in src/lib. Delete once real tests exist.
import { test } from "node:test";
import assert from "node:assert/strict";

test("test harness runs TypeScript tests", () => {
  const sum: number = 1 + 1;
  assert.equal(sum, 2);
});
