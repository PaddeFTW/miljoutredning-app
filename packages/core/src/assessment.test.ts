import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateResult, classifyAspect, isSignificant } from "./assessment.ts";

test("original scoring model mängd × miljöpåverkan", () => {
  assert.equal(calculateResult(2, 4), 8);
  assert.equal(classifyAspect(6), "mindre");
  assert.equal(classifyAspect(7), "mattlig");
  assert.equal(classifyAspect(12), "mattlig");
  assert.equal(classifyAspect(13), "betydande");
  assert.equal(classifyAspect(18), "betydande");
  assert.equal(isSignificant(13), true);
  assert.equal(isSignificant(12), false);
});
