import fs from "node:fs";
import path from "node:path";

import { getCompleteEvents, getEventHref, sourceToRouteSlug, type EventPageRecord } from "../lib/events";
import { absoluteUrl } from "../lib/schema-org";

const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), "public");

interface ExportedEvent extends EventPageRecord {
  route: string;
  canonical_url: string;
  json_url: string;
}

interface ExportIndexEvent {
  id: string;
  source: EventPageRecord["source"];
  category: string;
  name: string;
  priority: string;
  last_reviewed: string;
  route: string;
  canonical_url: string;
  json_url: string;
}

interface ExportIndex {
  schema_version: 1;
  event_count: number;
  events: ExportIndexEvent[];
}

export function buildKnowledgeExports(outputDir = DEFAULT_OUTPUT_DIR): { eventCount: number; files: string[] } {
  const events = getCompleteEvents().sort((a, b) => `${a.source}:${a.id}`.localeCompare(`${b.source}:${b.id}`));
  const apiRoot = path.join(outputDir, "api", "events");
  const files: string[] = [];

  fs.mkdirSync(apiRoot, { recursive: true });

  const indexEvents = events.map((event) => {
    const route = getEventHref(event.source, event.id);
    const jsonUrl = `/api/events/${sourceToExportFolder(event.source)}/${event.id}.json`;
    const exportedEvent: ExportedEvent = {
      ...event,
      route,
      canonical_url: absoluteUrl(route),
      json_url: jsonUrl,
    };

    const eventPath = path.join(apiRoot, sourceToExportFolder(event.source), `${event.id}.json`);
    writeJson(eventPath, exportedEvent);
    files.push(eventPath);

    return {
      id: event.id,
      source: event.source,
      category: event.category,
      name: event.name,
      priority: event.priority,
      last_reviewed: event.last_reviewed,
      route,
      canonical_url: absoluteUrl(route),
      json_url: jsonUrl,
    };
  });

  const index: ExportIndex = {
    schema_version: 1,
    event_count: indexEvents.length,
    events: indexEvents,
  };

  const indexPath = path.join(apiRoot, "index.json");
  writeJson(indexPath, index);
  files.push(indexPath);

  return { eventCount: events.length, files };
}

function sourceToExportFolder(source: EventPageRecord["source"]): string {
  return sourceToRouteSlug(source) === "windows-events" ? "windows-security" : "sysmon";
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

if (require.main === module) {
  const result = buildKnowledgeExports();
  console.log(`Exported ${result.eventCount} event records to public/api/events.`);
}
