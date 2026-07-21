import assert from "node:assert/strict";
import test from "node:test";

import { validateEnrichedEvent } from "../lib/event-content-validation";
import {
  type EventPageRecord,
  getCompleteEvents,
  getCompletedEventKeys,
  getEventByRoute,
  getSkeletonEvents,
  routeSlugToSource,
  sourceToRouteSlug,
} from "../lib/events";

function makeEnrichedEvent(): EventPageRecord {
  const event = getEventByRoute("windows-events", "4625");
  assert.ok(event);

  return {
    ...event,
    definition: "Windows Security Event ID 4625 records an unsuccessful logon attempt.",
    technical_metadata: {
      provider: "Microsoft-Windows-Security-Auditing",
      channel: "Security",
      level: "Information",
      audit_keyword: "Audit Failure",
    },
    attck_mapping: [
      {
        tactic_id: "TA0006",
        tactic_name: "Credential Access",
        technique_id: "T1110.001",
        technique_name: "Password Guessing",
        source_url: "https://attack.mitre.org/techniques/T1110/001/",
      },
    ],
    queries: [
      {
        language: "xql",
        title: "Failed logons",
        query: "dataset = microsoft_windows_raw\n| filter edr_event_id = 4625",
        data_source: "Cortex XDR microsoft_windows_raw",
        assumptions: ["Windows event logs are collected by Cortex XDR."],
      },
    ],
    value_references: [
      {
        field: "SubStatus",
        value: "0xC000006A",
        meaning: "The username is correct but the password is wrong.",
        security_relevance: "Repeated failures can indicate password guessing.",
        source_url: "https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4625",
      },
    ],
    faqs: [
      { question: "What does Event ID 4625 mean?", answer: "It records a failed logon." },
      { question: "Where is it logged?", answer: "It is logged in the Windows Security channel." },
    ],
    sources: [
      {
        title: "4625(S): An account failed to log on",
        url: "https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4625",
        publisher: "Microsoft",
        source_type: "vendor",
      },
    ],
  };
}

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
    "windows_security:4649",
    "windows_security:4715",
    "windows_security:4716",
    "windows_security:4780",
    "windows_security:4964",
    "windows_security:5030",
    "windows_security:5035",
    "windows_security:5038",
    "windows_security:5376",
    "windows_security:5377",
    "windows_security:5827",
    "windows_security:5828",
    "sysmon:4",
    "sysmon:9",
    "sysmon:14",
    "sysmon:15",
    "sysmon:24",
    "sysmon:26",
    "sysmon:27",
    "sysmon:28",
    "sysmon:255",
    "windows_security:4770",
    "windows_security:4778",
    "windows_security:4779",
    "windows_security:4700",
    "windows_security:4701",
    "windows_security:4670",
    "windows_security:4729",
    "windows_security:4733",
    "windows_security:4735",
    "windows_security:4756",
    "windows_security:4907",
    "windows_security:4608",
    "windows_security:4609",
    "windows_security:4610",
    "windows_security:4611",
    "windows_security:4612",
    "windows_security:4614",
    "windows_security:4621",
    "windows_security:4675",
    "windows_security:4692",
    "windows_security:4693",
    "windows_security:4713",
    "windows_security:4714",
    "windows_security:5027",
    "windows_security:5028",
    "windows_security:6145",
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
  const noDirectAttackMapping = new Set([
    "windows_security:4616",
    "windows_security:4647",
    "windows_security:4689",
  ]);

  for (const event of getCompleteEvents()) {
    const techniqueIds = event.attck_mapping?.map((mapping) => mapping.technique_id) ?? [];
    const eventKey = `${event.source}:${event.id}`;

    if (techniqueIds.length === 0) {
      if (!noDirectAttackMapping.has(eventKey) || !event.detection_notes.includes("no direct ATT&CK technique mapping")) {
        incompleteEvents.push(eventKey);
      }
      continue;
    }

    if (noDirectAttackMapping.has(eventKey) || !techniqueIds.some((techniqueId) => event.detection_notes.includes(techniqueId))) {
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

test("collects every semantic error in an enriched event record", () => {
  const valid = makeEnrichedEvent();
  assert.deepEqual(validateEnrichedEvent(valid), []);

  const invalid: EventPageRecord = {
    ...valid,
    definition: "First sentence. Second sentence. Third sentence.",
    queries: [
      ...(valid.queries ?? []),
      {
        language: "xql",
        title: "Invalid duplicate",
        query: "dataset = microsoft_windows_raw | filter winlog.event_id = 4625",
        data_source: "Cortex XDR",
        assumptions: [],
      },
      {
        language: "sigma",
        title: "Invalid Sigma",
        query: "title: [",
        data_source: "Sigma",
        assumptions: [],
      },
    ],
    attck_mapping: [
      {
        tactic_id: "TA0006",
        tactic_name: "Credential Access",
        technique_id: "T1110.001",
        technique_name: "Password Guessing",
        source_url: "https://attack.mitre.org/techniques/T1078/",
      },
    ],
    faqs: [{ question: "Only one?", answer: "Only one." }],
    sources: [
      {
        title: "Community rule",
        url: "https://example.com/rule",
        publisher: "Example",
        source_type: "detection-rule",
      },
    ],
  };
  const errors = validateEnrichedEvent(invalid);

  assert.ok(errors.some((error) => error.includes("one or two sentences")));
  assert.ok(errors.some((error) => error.includes("duplicate query language")));
  assert.ok(errors.some((error) => error.includes("winlog.event_id")));
  assert.ok(errors.some((error) => error.includes("valid Sigma YAML")));
  assert.ok(errors.some((error) => error.includes("official ATT&CK URL")));
  assert.ok(errors.some((error) => error.includes("two to four FAQs")));
  assert.ok(errors.some((error) => error.includes("vendor source")));
});

test("requires migrated GEO records to satisfy enriched content validation", () => {
  const migratedKeys = new Set([
    "windows_security:1102",
    "windows_security:4616",
    "windows_security:4103",
    "windows_security:4104",
    "windows_security:4624",
    "windows_security:4625",
    "windows_security:4634",
    "windows_security:4647",
    "windows_security:4648",
    "windows_security:4649",
    "windows_security:4657",
    "windows_security:4663",
    "windows_security:4672",
    "windows_security:4688",
    "windows_security:4689",
    "windows_security:4697",
    "windows_security:4698",
    "windows_security:4699",
    "windows_security:4702",
    "windows_security:4706",
    "windows_security:4715",
    "windows_security:4716",
    "windows_security:4719",
    "windows_security:4720",
    "windows_security:4722",
    "windows_security:4723",
    "windows_security:4724",
    "windows_security:4725",
    "windows_security:4726",
    "windows_security:4728",
    "windows_security:4732",
    "windows_security:4738",
    "windows_security:4740",
    "windows_security:4765",
    "windows_security:4766",
    "windows_security:4767",
    "windows_security:4768",
    "windows_security:4769",
    "windows_security:4771",
    "windows_security:4776",
    "windows_security:4780",
    "windows_security:4794",
    "windows_security:4964",
    "windows_security:5030",
    "windows_security:5035",
    "windows_security:5038",
    "windows_security:5140",
    "sysmon:1",
    "sysmon:3",
    "sysmon:8",
    "sysmon:10",
    "sysmon:11",
    "sysmon:22",
  ]);
  const errors = getCompleteEvents()
    .filter((event) => migratedKeys.has(`${event.source}:${event.id}`))
    .flatMap(validateEnrichedEvent);

  assert.deepEqual(errors, [], `GEO migration validation errors:\n${errors.join("\n")}`);
});

test("returns completed events by public route", () => {
  const windowsEvent = getEventByRoute("windows-events", "4625");
  const sysmonEvent = getEventByRoute("sysmon-events", "1");

  assert.equal(windowsEvent?.name, "An account failed to log on");
  assert.equal(sysmonEvent?.name, "Process creation");
});
