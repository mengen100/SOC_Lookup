import assert from "node:assert/strict";
import test from "node:test";

import { getEventByRoute } from "../lib/events";
import { buildEventStructuredData, buildWebsiteJsonLd, eventPageTitle } from "../lib/schema-org";
import { absoluteUrl, normalizeSiteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

test("normalizes the configured site origin", () => {
  assert.equal(normalizeSiteUrl("https://example.com/"), "https://example.com");
  assert.equal(normalizeSiteUrl(undefined), "https://soc-event-lookup.vercel.app");
  assert.equal(SITE_URL, normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL));
  assert.equal(absoluteUrl("/windows-events/4625/"), `${SITE_URL}/windows-events/4625/`);
});

test("builds source-specific long-tail event titles", () => {
  const windowsEvent = getEventByRoute("windows-events", "4625");
  const sysmonEvent = getEventByRoute("sysmon-events", "1");

  assert.ok(windowsEvent);
  assert.ok(sysmonEvent);
  assert.equal(eventPageTitle(windowsEvent), "Windows Event ID 4625: An account failed to log on");
  assert.equal(eventPageTitle(sysmonEvent), "Sysmon Event ID 1: Process creation");
});

test("builds website and event breadcrumb structured data", () => {
  const event = getEventByRoute("windows-events", "4625");
  assert.ok(event);

  assert.deepEqual(buildWebsiteJsonLd(), {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
  });

  const graph = buildEventStructuredData(event)["@graph"];
  assert.equal(graph[0]["@type"], "TechArticle");
  assert.equal(graph[0].headline, eventPageTitle(event));
  assert.equal(graph[1]["@type"], "BreadcrumbList");
  assert.deepEqual(graph[1].itemListElement?.map((item) => item.name), [
    "SOC Event Lookup",
    "Windows Events",
    "Event ID 4625",
  ]);
});
