import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDependencies, normalizeVersion, summary } from "../src/analyzer.js";

test("normalizes common npm version ranges", () => {
  assert.equal(normalizeVersion("^16.1.4"), "16.1.4");
  assert.equal(normalizeVersion("~1.8.0"), "1.8.0");
});

test("creates cards only for imported dependencies", () => {
  const result = analyzeDependencies({ name: "demo", dependencies: { next: "^16.1.4", axios: "^1.7.9" } });
  assert.equal(result.cards.length, 2);
  assert.deepEqual(summary(result.cards), { high: 2, medium: 0, low: 0 });
});
