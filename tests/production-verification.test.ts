import assert from "node:assert/strict";
import test from "node:test";

import { verifyProductionSite, type FetchLike } from "../lib/production-verification";

const canonicalOrigin = "https://soceventlookup.com";

function htmlPage(path: string, structuredTypes: string[] = []): string {
  const jsonLd = structuredTypes.map((type) => `{"@type":"${type}"}`).join(",");
  return `<html><head><link rel="canonical" href="${canonicalOrigin}${path}"><meta property="og:url" content="${canonicalOrigin}${path}"></head><body>${jsonLd}</body></html>`;
}

function successfulResponses(): Map<string, string> {
  const sitemapEntries = Array.from(
    { length: 118 },
    (_, index) => `<url><loc>${canonicalOrigin}/route-${index}/</loc></url>`,
  ).join("");
  const eventIndex = {
    schema_version: 1,
    event_count: 108,
    events: Array.from({ length: 108 }, (_, index) => ({
      id: String(index + 1),
      canonical_url: `${canonicalOrigin}/windows-events/${index + 1}/`,
    })),
  };

  return new Map([
    ["/", htmlPage("/", ["WebSite"])],
    ["/windows-events/4625/", htmlPage("/windows-events/4625/", ["TechArticle", "BreadcrumbList"])],
    ["/sysmon-events/1/", htmlPage("/sysmon-events/1/", ["TechArticle", "BreadcrumbList"])],
    ["/tools/timestamp-converter/", htmlPage("/tools/timestamp-converter/")],
    ["/tools/sigma-converter/", htmlPage("/tools/sigma-converter/")],
    ["/tools/cvss-calculator/", htmlPage("/tools/cvss-calculator/")],
    ["/robots.txt", `User-Agent: *\nAllow: /\n\nSitemap: ${canonicalOrigin}/sitemap.xml\n`],
    ["/sitemap.xml", `<urlset>${sitemapEntries}</urlset>`],
    ["/api/events/index.json", JSON.stringify(eventIndex)],
    ["/api/events/windows-security/4625.json", JSON.stringify({ id: "4625", canonical_url: `${canonicalOrigin}/windows-events/4625/` })],
  ]);
}

function createFetch(responses: Map<string, string>, status = 200): FetchLike {
  return async (url) => {
    const path = new URL(url).pathname;
    const body = responses.get(path);
    return new Response(body ?? "Not found", { status: body === undefined ? 404 : status });
  };
}

test("accepts a complete production deployment with canonical metadata", async () => {
  const result = await verifyProductionSite(canonicalOrigin, { fetchImpl: createFetch(successfulResponses()) });

  assert.equal(result.passed, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
  assert.ok(result.checks.length >= 10);
});

test("collects deployment failures instead of stopping at the first one", async () => {
  const responses = successfulResponses();
  responses.set("/", responses.get("/")!.replace(canonicalOrigin, "https://soc-event-lookup.vercel.app"));
  responses.set("/sitemap.xml", "<urlset><url><loc>https://wrong.example/</loc></url></urlset>");
  responses.set("/robots.txt", "User-Agent: *\nAllow: /");
  responses.set("/api/events/index.json", JSON.stringify({ event_count: 1, events: [] }));

  const result = await verifyProductionSite(canonicalOrigin, { fetchImpl: createFetch(responses) });

  assert.equal(result.passed, false);
  assert.ok(result.errors.length >= 5, result.errors.join("\n"));
  assert.ok(result.errors.some((error) => error.includes("canonical")));
  assert.ok(result.errors.some((error) => error.includes("118")));
  assert.ok(result.errors.some((error) => error.includes("robots")));
  assert.ok(result.errors.some((error) => error.includes("108")));
  assert.ok(result.errors.some((error) => error.includes("legacy Vercel")));
});

test("rejects origins that are not canonical HTTPS origins", async () => {
  await assert.rejects(
    () => verifyProductionSite("http://soceventlookup.com/path", { fetchImpl: createFetch(successfulResponses()) }),
    /HTTPS origin without a path/,
  );
});
