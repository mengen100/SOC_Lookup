import assert from "node:assert/strict";
import test from "node:test";

import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { getEventByRoute } from "../lib/events";
import { buildEventStructuredData, buildWebsiteJsonLd, eventPageTitle } from "../lib/schema-org";
import { absoluteUrl, buildPageMetadata, normalizeSiteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

test("normalizes the configured site origin", () => {
  assert.equal(normalizeSiteUrl("https://example.com/"), "https://example.com");
  assert.equal(normalizeSiteUrl(undefined), "https://soceventlookup.com");
  assert.equal(SITE_URL, normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL));
  assert.equal(absoluteUrl("/windows-events/4625/"), `${SITE_URL}/windows-events/4625/`);
});

test("keeps static page canonical and social URLs aligned", () => {
  const metadata = buildPageMetadata({
    title: "SOC Tools",
    description: "Browser-based tools for SOC analysts.",
    path: "/tools/",
  });

  assert.equal(metadata.alternates?.canonical, "/tools/");
  assert.equal(metadata.openGraph?.url, "/tools/");
  assert.equal(metadata.twitter?.title, `SOC Tools | ${SITE_NAME}`);
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
  const breadcrumbItems = graph[1].itemListElement as Array<{ name: string }>;
  assert.deepEqual(breadcrumbItems.map((item) => item.name), [
    "SOC Event Lookup",
    "Windows Events",
    "Event ID 4625",
  ]);
});

test("builds stable TechArticle and visible-data FAQPage nodes", () => {
  const event = getEventByRoute("windows-events", "4625");
  assert.ok(event);
  const faqs = [
    { question: "What does Event ID 4625 mean?", answer: "It records a failed Windows logon attempt." },
    { question: "Where is Event ID 4625 logged?", answer: "It is logged in the Windows Security channel." },
  ];
  const enriched = {
    ...event,
    faqs,
    attck_mapping: [
      {
        tactic_id: "TA0006",
        tactic_name: "Credential Access",
        technique_id: "T1110.001",
        technique_name: "Password Guessing",
        source_url: "https://attack.mitre.org/techniques/T1110/001/",
      },
    ],
  };
  const canonical = absoluteUrl("/windows-events/4625/");
  const graph = buildEventStructuredData(enriched)["@graph"] as Array<Record<string, unknown>>;
  const article = graph.find((item) => item["@type"] === "TechArticle");
  const faqPage = graph.find((item) => item["@type"] === "FAQPage");

  assert.equal(article?.["@id"], `${canonical}#article`);
  assert.equal(article?.mainEntityOfPage, canonical);
  assert.deepEqual(article?.about, [
    {
      "@type": "Thing",
      name: "T1110.001 Password Guessing",
      sameAs: "https://attack.mitre.org/techniques/T1110/001/",
    },
  ]);

  const mainEntity = faqPage?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
  assert.deepEqual(
    mainEntity.map((item) => [item.name, item.acceptedAnswer.text]),
    faqs.map((item) => [item.question, item.answer]),
  );
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
