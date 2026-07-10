import assert from "node:assert/strict";
import test from "node:test";

import {
  getCompleteEvents,
  getCompletedEventKeys,
  getEventByRoute,
  getSkeletonEvents,
  routeSlugToSource,
  sourceToRouteSlug,
} from "../lib/events";

test("maps data sources to public route slugs", () => {
  assert.equal(sourceToRouteSlug("windows_security"), "windows-events");
  assert.equal(sourceToRouteSlug("sysmon"), "sysmon-events");
  assert.equal(routeSlugToSource("windows-events"), "windows_security");
  assert.equal(routeSlugToSource("sysmon-events"), "sysmon");
});

test("loads all skeleton events while marking completed records as linkable", () => {
  const skeleton = getSkeletonEvents();
  const completedKeys = getCompletedEventKeys();

  assert.equal(skeleton.length, 108);
  assert.equal(completedKeys.has("windows_security:4625"), true);
  assert.equal(completedKeys.has("sysmon:1"), true);
});

test("discovers complete event records from data/events", () => {
  const completeEvents = getCompleteEvents();

  const expectedEvents = [
    "windows_security:4624",
    "windows_security:4625",
    "windows_security:4688",
    "windows_security:4720",
    "windows_security:4768",
    "windows_security:4769",
    "windows_security:5140",
    "windows_security:4104",
    "windows_security:4648",
    "windows_security:4672",
    "windows_security:4776",
    "windows_security:4697",
    "windows_security:4698",
    "windows_security:4732",
    "windows_security:1102",
    "windows_security:4719",
    "sysmon:1",
    "sysmon:3",
    "sysmon:8",
    "sysmon:10",
    "sysmon:11",
    "sysmon:22",
  ];

  assert.equal(completeEvents.length, expectedEvents.length);
  assert.deepEqual(
    new Set(completeEvents.map((event) => `${event.source}:${event.id}`)),
    new Set(expectedEvents),
  );
});

test("ships reader-facing event content in English", () => {
  const readerFacingText = getCompleteEvents().flatMap((event) => [
    event.applicable_version,
    event.definition,
    event.trigger_scenarios,
    ...event.key_fields.flatMap((field) => [field.field, field.explanation]),
    ...event.false_positives,
    event.detection_notes,
  ]);

  for (const value of readerFacingText) {
    assert.equal(/[\u3400-\u9fff]/.test(value), false, `Expected English reader-facing content: ${value}`);
  }
});

test("returns completed events by public route", () => {
  const windowsEvent = getEventByRoute("windows-events", "4625");
  const sysmonEvent = getEventByRoute("sysmon-events", "1");

  assert.equal(windowsEvent?.name, "An account failed to log on");
  assert.equal(sysmonEvent?.name, "Process creation");
});
