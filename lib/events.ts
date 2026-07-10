import fs from "node:fs";
import path from "node:path";

export type EventSource = "windows_security" | "sysmon";
export type EventRouteSlug = "windows-events" | "sysmon-events";
export type EventPriority = "P1" | "P2" | "P3";

export interface SkeletonEvent {
  id: string;
  source: EventSource;
  category: string;
  name: string;
  priority: EventPriority;
  notes?: string;
}

export interface KeyField {
  field: string;
  explanation: string;
}

export interface AttackMapping {
  technique_id: string;
  technique_name: string;
}

export interface EventPageRecord extends SkeletonEvent {
  applicable_version: string;
  last_reviewed: string;
  definition: string;
  trigger_scenarios: string;
  key_fields: KeyField[];
  false_positives: string[];
  related_event_ids: string[];
  attck_mapping?: AttackMapping[];
  detection_notes: string;
  kql_snippet?: string;
  spl_snippet?: string;
  sample_log: string;
  source_url: string;
}

const DATA_DIR = path.join(process.cwd(), "data");

const sourceToFolder: Record<EventSource, string> = {
  windows_security: "windows-security",
  sysmon: "sysmon",
};

const sourceToSlug: Record<EventSource, EventRouteSlug> = {
  windows_security: "windows-events",
  sysmon: "sysmon-events",
};

const slugToSource: Record<EventRouteSlug, EventSource> = {
  "windows-events": "windows_security",
  "sysmon-events": "sysmon",
};

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function sourceToRouteSlug(source: EventSource): EventRouteSlug {
  return sourceToSlug[source];
}

export function routeSlugToSource(slug: string): EventSource | undefined {
  return slugToSource[slug as EventRouteSlug];
}

export function eventKey(source: EventSource, id: string): string {
  return `${source}:${id}`;
}

export function getSkeletonEvents(): SkeletonEvent[] {
  return readJsonFile<SkeletonEvent[]>(path.join(DATA_DIR, "event_ids.json"));
}

export function getCompleteEvents(): EventPageRecord[] {
  const eventsRoot = path.join(DATA_DIR, "events");
  if (!fs.existsSync(eventsRoot)) {
    return [];
  }

  return (Object.entries(sourceToFolder) as Array<[EventSource, string]>).flatMap(([source, folder]) => {
    const sourceDir = path.join(eventsRoot, folder);
    if (!fs.existsSync(sourceDir)) {
      return [];
    }

    return fs
      .readdirSync(sourceDir)
      .filter((fileName) => fileName.endsWith(".json"))
      .map((fileName) => {
        const record = readJsonFile<EventPageRecord>(path.join(sourceDir, fileName));
        return { ...record, source };
      });
  });
}

export function getCompletedEventKeys(): Set<string> {
  return new Set(getCompleteEvents().map((event) => eventKey(event.source, event.id)));
}

export function getEventByRoute(sourceSlug: string, id: string): EventPageRecord | undefined {
  const source = routeSlugToSource(sourceSlug);
  if (!source) {
    return undefined;
  }

  return getCompleteEvents().find((event) => event.source === source && event.id === id);
}

export function getEventHref(source: EventSource, id: string): string {
  return `/${sourceToRouteSlug(source)}/${id}/`;
}

export function findSkeletonEvent(source: EventSource, id: string): SkeletonEvent | undefined {
  return getSkeletonEvents().find((event) => event.source === source && event.id === id);
}

export function getCategoriesForSource(source: EventSource): string[] {
  return Array.from(
    new Set(
      getSkeletonEvents()
        .filter((event) => event.source === source)
        .map((event) => event.category),
    ),
  ).sort((a, b) => a.localeCompare(b));
}
