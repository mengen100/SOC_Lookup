import assert from "node:assert/strict";
import test from "node:test";

import robots from "../app/robots";
import sitemap from "../app/sitemap";
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

test("includes every indexable route without fake static modification dates", () => {
  const entries = sitemap();
  assert.equal(entries.length, 118);

  for (const path of [
    "/tools/",
    "/tools/timestamp-converter/",
    "/tools/sigma-converter/",
    "/tools/cvss-calculator/",
  ]) {
    assert.ok(entries.some((entry) => entry.url === absoluteUrl(path)), `Missing sitemap route: ${path}`);
  }

  const homepage = entries.find((entry) => entry.url === absoluteUrl("/"));
  assert.ok(homepage);
  assert.equal("lastModified" in homepage, false);

  const event = entries.find((entry) => entry.url === absoluteUrl("/windows-events/4625/"));
  assert.ok(event?.lastModified);
});

test("points robots.txt at the configured sitemap origin", () => {
  assert.equal(robots().sitemap, absoluteUrl("/sitemap.xml"));
});
