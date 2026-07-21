import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(__dirname, "..");

test("keeps the footer at the bottom of short pages", () => {
  const layout = fs.readFileSync(path.join(projectRoot, "app", "layout.tsx"), "utf8");

  assert.match(layout, /<body className="[^"]*\bflex\b[^"]*\bflex-col\b[^"]*"/);
  assert.match(layout, /<main className="[^"]*\bflex-1\b[^"]*">/);
});

test("links common investigations to existing event guides", () => {
  const homepage = fs.readFileSync(path.join(projectRoot, "app", "page.tsx"), "utf8");
  const expectedRoutes = [
    "/windows-events/4625/",
    "/windows-events/4688/",
    "/windows-events/4104/",
    "/windows-events/4769/",
    "/sysmon-events/1/",
  ];

  assert.match(homepage, /Common investigations/);
  for (const route of expectedRoutes) {
    assert.ok(homepage.includes(route), `Missing common-investigation route: ${route}`);
  }
});

test("renders enriched event sections with semantic and responsive structure", () => {
  const eventPage = fs.readFileSync(path.join(projectRoot, "components", "EventPage.tsx"), "utf8");
  const metadata = fs.readFileSync(path.join(projectRoot, "components", "EventMetadataTable.tsx"), "utf8");
  const values = fs.readFileSync(path.join(projectRoot, "components", "EventValueTable.tsx"), "utf8");
  const queries = fs.readFileSync(path.join(projectRoot, "components", "DetectionQueries.tsx"), "utf8");
  const faq = fs.readFileSync(path.join(projectRoot, "components", "EventFaq.tsx"), "utf8");

  assert.match(eventPage, /<section id="quick-summary"/);
  assert.match(eventPage, /<section className="min-w-0">/);
  assert.match(eventPage, /<EventMetadataTable event=\{event\}/);
  assert.match(eventPage, /<DetectionQueries event=\{event\}/);
  assert.match(metadata, /overflow-x-auto/);
  assert.match(metadata, /<table/);
  assert.match(values, /overflow-x-auto/);
  assert.match(values, /<table/);
  assert.match(queries, /event\.queries/);
  assert.match(queries, /event\.kql_snippet/);
  assert.match(queries, /event\.spl_snippet/);
  assert.match(faq, /faq\.question/);
  assert.match(faq, /faq\.answer/);
});
