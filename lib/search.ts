import type { EventPageRecord, EventSource, SkeletonEvent } from "./events";

export interface EventSearchDocument extends SkeletonEvent {
  href: string;
  isComplete: boolean;
  searchText: string;
  compactSearchText: string;
}

const priorityRank = { P1: 0, P2: 1, P3: 2 } as const;

export function buildEventSearchDocuments(
  skeletonEvents: SkeletonEvent[],
  completeEvents: EventPageRecord[],
): EventSearchDocument[] {
  const completedByKey = new Map(completeEvents.map((event) => [getEventKey(event.source, event.id), event]));

  return skeletonEvents.map((event) => {
    const complete = completedByKey.get(getEventKey(event.source, event.id));
    const sourceTerms = event.source === "windows_security"
      ? "windows security windows event security event event id"
      : "sysmon system monitor sysmon event event id";
    const completeTerms = complete
      ? [
          complete.definition,
          complete.trigger_scenarios,
          ...complete.key_fields.flatMap((field) => [field.field, field.explanation]),
          ...complete.false_positives,
          ...complete.attck_mapping?.flatMap((mapping) => [mapping.technique_id, mapping.technique_name]) ?? [],
          complete.detection_notes,
        ]
      : [];

    const searchText = normalizeSearchText([
      event.id,
      event.name,
      event.category,
      event.priority,
      event.notes ?? "",
      sourceTerms,
      ...completeTerms,
    ].join(" "));

    return {
      ...event,
      href: getSearchResultHref(event.source, event.id),
      isComplete: Boolean(complete),
      searchText,
      compactSearchText: compactSearchText(searchText),
    };
  });
}

function getEventKey(source: EventSource, id: string): string {
  return `${source}:${id}`;
}

function getSearchResultHref(source: EventSource, id: string): string {
  const route = source === "windows_security" ? "windows-events" : "sysmon-events";
  return `/${route}/${id}/`;
}

export function searchEventDocuments(documents: EventSearchDocument[], query: string): EventSearchDocument[] {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = Array.from(new Set(normalizedQuery.split(" ").filter(Boolean)));

  if (tokens.length === 0) {
    return [...documents];
  }

  return documents
    .filter((document) => tokens.every((token) => (
      document.searchText.includes(token) || document.compactSearchText.includes(compactSearchText(token))
    )))
    .sort((left, right) => {
      const scoreDifference = scoreDocument(right, normalizedQuery, tokens) - scoreDocument(left, normalizedQuery, tokens);
      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      const priorityDifference = priorityRank[left.priority] - priorityRank[right.priority];
      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return left.id.localeCompare(right.id, undefined, { numeric: true });
    });
}

function scoreDocument(document: EventSearchDocument, query: string, tokens: string[]): number {
  let score = document.isComplete ? 10 : 0;
  const normalizedName = normalizeSearchText(document.name);
  const sourceName = document.source === "windows_security" ? "windows security" : "sysmon";

  if (document.id === query) {
    score += 1000;
  }
  if (tokens.includes(document.id)) {
    score += 700;
  }
  if (normalizedName === query) {
    score += 500;
  } else if (normalizedName.startsWith(query)) {
    score += 300;
  }
  if (query.includes(sourceName)) {
    score += 80;
  }

  score += tokens.filter((token) => normalizedName.includes(token)).length * 40;
  return score;
}

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9.\\/_:-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compactSearchText(value: string): string {
  return value.replace(/[^a-z0-9]+/g, "");
}
