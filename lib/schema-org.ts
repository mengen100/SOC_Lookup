import type { EventPageRecord } from "./events";
import { getEventHref } from "./events";
import { absoluteUrl } from "./site";

export function eventDescription(event: EventPageRecord, maxLength = 155): string {
  if (event.definition.length <= maxLength) {
    return event.definition;
  }

  return `${event.definition.slice(0, maxLength - 1).trim()}...`;
}

export function buildTechArticleJsonLd(event: EventPageRecord) {
  const url = absoluteUrl(getEventHref(event.source, event.id));

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${event.name} (Event ID ${event.id})`,
    description: eventDescription(event),
    datePublished: event.last_reviewed,
    dateModified: event.last_reviewed,
    author: {
      "@type": "Organization",
      name: "SOC Event Lookup",
    },
    mainEntityOfPage: url,
    url,
    about: [
      event.category,
      event.source === "windows_security" ? "Windows Security" : "Sysmon",
      "SOC analysis",
    ],
  };
}
