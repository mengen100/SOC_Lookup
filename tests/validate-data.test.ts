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

test("validates enriched event metadata, queries, references, FAQs, and sources", () => {
  const enriched = {
    ...event4625,
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
        source_url: "https://docs-cortex.paloaltonetworks.com/",
      },
    ],
    value_references: [
      {
        field: "Status",
        value: "0xC000006A",
        meaning: "The username is correct but the password is wrong.",
        security_relevance: "Repeated failures can indicate password guessing.",
        source_url: "https://learn.microsoft.com/",
      },
    ],
    faqs: [{ question: "What does Event ID 4625 mean?", answer: "It records a failed logon." }],
    sources: [
      {
        title: "4625(S): An account failed to log on",
        url: "https://learn.microsoft.com/",
        publisher: "Microsoft",
        source_type: "vendor",
      },
    ],
  };

  assert.deepEqual(validateEventRecord(enriched, "4625.json"), []);

  const invalid = {
    ...enriched,
    queries: [{ ...enriched.queries[0], language: "lucene" }],
    attck_mapping: [{ ...enriched.attck_mapping[0], technique_id: "Password Guessing" }],
    value_references: [{ ...enriched.value_references[0], source_url: "not-a-url" }],
    sources: [{ ...enriched.sources[0], url: "not-a-url" }],
  };
  const errors = validateEventRecord(invalid, "invalid-enriched.json");

  assert.ok(errors.length >= 4, `Expected all enriched validation errors:\n${errors.join("\n")}`);
  assert.ok(errors.some((error) => error.includes("queries")));
  assert.ok(errors.some((error) => error.includes("attck_mapping")));
  assert.ok(errors.some((error) => error.includes("value_references")));
  assert.ok(errors.some((error) => error.includes("sources")));
});

test("validates all event files under data/events", () => {
  const result = validateAllEventFiles("data/events");

  assert.deepEqual(result, []);
});
