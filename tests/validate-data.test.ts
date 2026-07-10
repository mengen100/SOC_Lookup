import assert from "node:assert/strict";
import test from "node:test";

import event4625 from "../data/events/windows-security/4625.json";
import { validateAllEventFiles, validateEventRecord } from "../scripts/validate-data";

test("accepts a complete event record that matches the schema", () => {
  const result = validateEventRecord(event4625, "data/events/windows-security/4625.json");

  assert.deepEqual(result, []);
});

test("reports missing required fields with file and field details", () => {
  const invalid = { ...event4625 };
  delete (invalid as Partial<typeof event4625>).definition;

  const result = validateEventRecord(invalid, "broken.json");

  assert.equal(result.length, 1);
  assert.match(result[0], /broken\.json/);
  assert.match(result[0], /definition/);
});

test("validates all event files under data/events", () => {
  const result = validateAllEventFiles("data/events");

  assert.deepEqual(result, []);
});
