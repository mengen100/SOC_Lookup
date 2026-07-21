import yaml from "js-yaml";

import type { EventPageRecord } from "./events";

const SENTENCE_END_PATTERN = /[.!?](?=\s|$)/g;

export function validateEnrichedEvent(event: EventPageRecord): string[] {
  const errors: string[] = [];
  const key = `${event.source}:${event.id}`;
  const sentenceCount = event.definition.match(SENTENCE_END_PATTERN)?.length ?? 0;

  if (sentenceCount < 1 || sentenceCount > 2) {
    errors.push(`${key}: definition must contain one or two sentences`);
  }

  if (!event.technical_metadata) {
    errors.push(`${key}: technical metadata is required`);
  } else {
    for (const [field, value] of Object.entries(event.technical_metadata)) {
      if (!value.trim()) {
        errors.push(`${key}: technical metadata ${field} must not be empty`);
      }
    }
  }

  const queryLanguages = new Set<string>();
  for (const query of event.queries ?? []) {
    if (queryLanguages.has(query.language)) {
      errors.push(`${key}: duplicate query language ${query.language}`);
    }
    queryLanguages.add(query.language);

    if (query.language === "xql") {
      if (!/dataset\s*=\s*microsoft_windows_raw/i.test(query.query)) {
        errors.push(`${key}: XQL must query dataset = microsoft_windows_raw`);
      }
      if (!/\bedr_event_id\b/i.test(query.query)) {
        errors.push(`${key}: XQL must filter on edr_event_id`);
      }
      if (/\bwinlog\.event_id\b/i.test(query.query)) {
        errors.push(`${key}: XQL must not use winlog.event_id`);
      }
    }

    if (query.language === "sigma") {
      try {
        const rule = yaml.load(query.query);
        if (!isRecord(rule) || !isRecord(rule.logsource) || !isRecord(rule.detection) || typeof rule.detection.condition !== "string") {
          errors.push(`${key}: query must contain valid Sigma YAML with logsource, detection, and condition`);
        }
      } catch {
        errors.push(`${key}: query must contain valid Sigma YAML with logsource, detection, and condition`);
      }
    }
  }

  for (const mapping of event.attck_mapping ?? []) {
    if (!mapping.tactic_id || !mapping.tactic_name || !mapping.source_url) {
      errors.push(`${key}: each ATT&CK mapping requires tactic details and an official ATT&CK URL`);
      continue;
    }

    const techniquePath = mapping.technique_id.replace(".", "/");
    const expectedUrl = `https://attack.mitre.org/techniques/${techniquePath}/`;
    if (mapping.source_url !== expectedUrl) {
      errors.push(`${key}: ${mapping.technique_id} must use its official ATT&CK URL ${expectedUrl}`);
    }
  }

  const faqCount = event.faqs?.length ?? 0;
  if (faqCount < 2 || faqCount > 4) {
    errors.push(`${key}: enriched records require two to four FAQs`);
  }

  if (!event.sources?.some((source) => source.source_type === "vendor")) {
    errors.push(`${key}: enriched records require at least one vendor source`);
  }

  for (const reference of event.value_references ?? []) {
    if (!isHttpUrl(reference.source_url)) {
      errors.push(`${key}: value reference ${reference.field}=${reference.value} requires an HTTP(S) source URL`);
    }
  }

  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
