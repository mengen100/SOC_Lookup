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
