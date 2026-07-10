import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildKnowledgeExports } from "../scripts/export-json";

test("exports deterministic machine-readable event JSON files", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "soc-event-export-"));

  const result = buildKnowledgeExports(outputDir);
  const indexPath = path.join(outputDir, "api", "events", "index.json");
  const windowsPath = path.join(outputDir, "api", "events", "windows-security", "4625.json");
  const sysmonPath = path.join(outputDir, "api", "events", "sysmon", "1.json");

  assert.equal(result.eventCount, 12);
  assert.equal(fs.existsSync(indexPath), true);
  assert.equal(fs.existsSync(windowsPath), true);
  assert.equal(fs.existsSync(sysmonPath), true);

  const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as {
    schema_version: number;
    event_count: number;
    events: Array<{ id: string; json_url: string; route: string; source: string }>;
  };
  const sysmon = JSON.parse(fs.readFileSync(sysmonPath, "utf8")) as {
    id: string;
    source: string;
    route: string;
    canonical_url: string;
    name: string;
  };

  assert.equal(index.schema_version, 1);
  assert.equal(index.event_count, 12);
  assert.equal(index.events.some((event) => event.id === "4625" && event.json_url === "/api/events/windows-security/4625.json"), true);
  assert.equal(index.events.some((event) => event.id === "1" && event.route === "/sysmon-events/1/"), true);
  assert.equal(sysmon.name, "Process creation");
  assert.equal(sysmon.source, "sysmon");
  assert.equal(sysmon.route, "/sysmon-events/1/");
  assert.equal(sysmon.canonical_url, "https://soc-event-lookup.vercel.app/sysmon-events/1/");
});
