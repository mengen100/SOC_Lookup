import type { EventPageRecord } from "./events";
import { getEventHref } from "./events";
import { absoluteUrl } from "./site";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

interface BreadcrumbListItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export function eventDescription(event: EventPageRecord, maxLength = 155): string {
  if (event.definition.length <= maxLength) {
    return event.definition;
  }

  return `${event.definition.slice(0, maxLength - 1).trim()}...`;
}

export function eventPageTitle(event: EventPageRecord): string {
  const sourceName = event.source === "windows_security" ? "Windows" : "Sysmon";
  return `${sourceName} Event ID ${event.id}: ${event.name}`;
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
  };
}

export function buildEventStructuredData(event: EventPageRecord) {
  const url = absoluteUrl(getEventHref(event.source, event.id));
  const collectionName = event.source === "windows_security" ? "Windows Events" : "Sysmon Events";
  const collectionHref = event.source === "windows_security" ? "/windows-events/" : "/sysmon-events/";
  const itemListElement: BreadcrumbListItem[] = [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: collectionName, item: absoluteUrl(collectionHref) },
    { "@type": "ListItem", position: 3, name: `Event ID ${event.id}`, item: url },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: eventPageTitle(event),
        description: eventDescription(event),
        datePublished: event.last_reviewed,
        dateModified: event.last_reviewed,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        mainEntityOfPage: url,
        url,
        about: [event.category, collectionName, "SOC analysis"],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement,
      },
    ],
  };
}
