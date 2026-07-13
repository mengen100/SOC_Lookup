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
    "windows_security:4634",
    "windows_security:4724",
    "windows_security:4738",
    "windows_security:4740",
    "windows_security:4103",
    "windows_security:4765",
    "windows_security:4794",
    "windows_security:4647",
    "windows_security:4771",
    "windows_security:4689",
    "windows_security:4699",
    "windows_security:4702",
    "windows_security:4657",
    "windows_security:4663",
    "windows_security:4722",
    "windows_security:4723",
    "windows_security:4725",
    "sysmon:1",
    "sysmon:3",
    "sysmon:8",
    "sysmon:10",
    "sysmon:11",
    "sysmon:22",
    "sysmon:25",
    "sysmon:12",
    "sysmon:13",
    "sysmon:16",
    "sysmon:17",
    "sysmon:18",
    "sysmon:19",
    "sysmon:20",
    "sysmon:21",
    "sysmon:23",
    "sysmon:29",
    "sysmon:7",
    "sysmon:6",
    "sysmon:2",
    "sysmon:5",
    "windows_security:4616",
    "windows_security:4706",
    "windows_security:4726",
    "windows_security:4728",
    "windows_security:4766",
    "windows_security:4767",
    "windows_security:5145",
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

test("connects each completed event to a specific ATT&CK technique in detection guidance", () => {
  const incompleteEvents: string[] = [];

  for (const event of getCompleteEvents()) {
    const techniqueIds = event.attck_mapping?.map((mapping) => mapping.technique_id) ?? [];
    const eventKey = `${event.source}:${event.id}`;

    if (techniqueIds.length === 0 || !techniqueIds.some((techniqueId) => event.detection_notes.includes(techniqueId))) {
      incompleteEvents.push(eventKey);
    }
  }

  assert.deepEqual(incompleteEvents, [], `Detection guidance missing ATT&CK technique IDs:\n${incompleteEvents.join("\n")}`);
});

test("requires concrete detection values beyond ATT&CK technique identifiers", () => {
  const incompleteEvents: string[] = [];
  const concreteValuePattern = /0x[0-9a-f]+|\b(?:type|port|threshold|mask|window|timeout)\s*[=:]?\s*\d+|HK(?:LM|CU)\\|\\(?:Users|Windows|ProgramData|Temp|AppData)\\/i;

  for (const event of getCompleteEvents()) {
    const guidanceWithoutAttackIds = event.detection_notes.replace(/T\d{4}(?:\.\d{3})?/g, "");

    if (!concreteValuePattern.test(guidanceWithoutAttackIds)) {
      incompleteEvents.push(`${event.source}:${event.id}`);
    }
  }

  assert.deepEqual(
    incompleteEvents,
    [],
    `Detection guidance missing a concrete value after ATT&CK IDs are removed:\n${incompleteEvents.join("\n")}`,
  );
});

test("returns completed events by public route", () => {
  const windowsEvent = getEventByRoute("windows-events", "4625");
  const sysmonEvent = getEventByRoute("sysmon-events", "1");

  assert.equal(windowsEvent?.name, "An account failed to log on");
  assert.equal(sysmonEvent?.name, "Process creation");
});
