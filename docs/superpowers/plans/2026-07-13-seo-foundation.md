# SEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every indexable route consistent canonical metadata, long-tail event titles, accurate structured data, and complete crawl discovery while keeping the temporary Vercel domain replaceable at build time.

**Architecture:** Centralize the site origin and identity in `lib/site.ts`. Keep event title and JSON-LD generation in `lib/schema-org.ts`, render matching visible breadcrumbs through a focused component, and let route modules consume those helpers. SEO behavior is verified through pure unit tests plus direct sitemap and robots function tests before production code changes.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Node test runner, static export.

## Global Constraints

- Keep `https://soc-event-lookup.vercel.app` as the fallback origin until a permanent domain is selected.
- Allow `NEXT_PUBLIC_SITE_URL` to replace the origin at build time.
- Do not change the event JSON schema or add routes.
- Keep all reader-facing copy in English.
- Do not add `SearchAction`, analytics, advertising, consent scripts, or placeholder Open Graph images.
- Event structured data must describe visible page content.
- Use each event's `last_reviewed` for event sitemap dates; omit dates for static routes.
- Run `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run build` before completion.

---

### Task 1: Central Site Configuration

**Files:**
- Create: `lib/site.ts`
- Modify: `lib/schema-org.ts`
- Modify: `scripts/export-json.ts`
- Modify: `tests/export-json.test.ts`
- Create: `tests/seo.test.ts`
- Modify: `tests/all.test.ts`

**Interfaces:**
- Produces: `SITE_NAME`, `SITE_DESCRIPTION`, `SITE_URL`, `normalizeSiteUrl(value)`, and `absoluteUrl(path)` from `lib/site.ts`.
- Consumes: `absoluteUrl(path)` in schema generation and machine-readable export generation.

- [ ] **Step 1: Write failing site URL tests**

Add `tests/seo.test.ts` and import it from `tests/all.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { absoluteUrl, normalizeSiteUrl, SITE_URL } from "../lib/site";

test("normalizes the configured site origin", () => {
  assert.equal(normalizeSiteUrl("https://example.com/"), "https://example.com");
  assert.equal(normalizeSiteUrl(undefined), "https://soc-event-lookup.vercel.app");
  assert.equal(SITE_URL, normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL));
  assert.equal(absoluteUrl("/windows-events/4625/"), `${SITE_URL}/windows-events/4625/`);
});
```

- [ ] **Step 2: Run the tests and observe the missing-module failure**

Run: `npm.cmd test`

Expected: TypeScript fails because `../lib/site` does not exist.

- [ ] **Step 3: Implement the shared site configuration**

Create `lib/site.ts`:

```ts
export const SITE_NAME = "SOC Event Lookup";
export const SITE_DESCRIPTION = "Structured Windows Security and Sysmon event ID reference for SOC analysts.";
export const DEFAULT_SITE_URL = "https://soc-event-lookup.vercel.app";

export function normalizeSiteUrl(value: string | undefined): string {
  return (value?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
```

Move `absoluteUrl` imports in `lib/schema-org.ts` and `scripts/export-json.ts` to `lib/site.ts`. Keep export behavior otherwise unchanged.

- [ ] **Step 4: Run tests and confirm the shared origin is green**

Run: `npm.cmd test`

Expected: All tests pass, including the new URL normalization test and existing canonical export assertion.

- [ ] **Step 5: Commit the site configuration**

```powershell
git add lib/site.ts lib/schema-org.ts scripts/export-json.ts tests/seo.test.ts tests/all.test.ts tests/export-json.test.ts
git commit -m "refactor: centralize site URL configuration"
```

---

### Task 2: Event Titles, Breadcrumbs, And Structured Data

**Files:**
- Modify: `lib/schema-org.ts`
- Create: `components/Breadcrumbs.tsx`
- Modify: `components/EventPage.tsx`
- Modify: `app/windows-events/[id]/page.tsx`
- Modify: `app/sysmon-events/[id]/page.tsx`
- Modify: `tests/seo.test.ts`

**Interfaces:**
- Produces: `eventPageTitle(event)`, `buildWebsiteJsonLd()`, and `buildEventStructuredData(event)`.
- Produces: `<Breadcrumbs event={event} />` with visible Home, collection, and current-event levels.
- Consumes: `EventPageRecord`, `absoluteUrl`, and `getEventHref`.

- [ ] **Step 1: Write failing title and JSON-LD tests**

Append to `tests/seo.test.ts`:

```ts
import { getEventByRoute } from "../lib/events";
import { buildEventStructuredData, buildWebsiteJsonLd, eventPageTitle } from "../lib/schema-org";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";

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
  assert.deepEqual(graph[1].itemListElement.map((item: { name: string }) => item.name), [
    "SOC Event Lookup",
    "Windows Events",
    "Event ID 4625",
  ]);
});
```

- [ ] **Step 2: Run tests and observe missing helper failures**

Run: `npm.cmd test`

Expected: TypeScript reports that the three SEO helper exports do not exist.

- [ ] **Step 3: Implement the event SEO helpers**

Update `lib/schema-org.ts` so `eventPageTitle` prefixes the source, `buildWebsiteJsonLd` returns homepage `WebSite` data, and `buildEventStructuredData` returns:

```ts
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      headline: eventPageTitle(event),
      description: eventDescription(event),
      datePublished: event.last_reviewed,
      dateModified: event.last_reviewed,
      author: { "@type": "Organization", name: SITE_NAME },
      mainEntityOfPage: url,
      url,
      about: [event.category, collectionName, "SOC analysis"],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: collectionName, item: absoluteUrl(collectionHref) },
        { "@type": "ListItem", position: 3, name: `Event ID ${event.id}`, item: url },
      ],
    },
  ],
}
```

- [ ] **Step 4: Add matching visible breadcrumbs and titles**

Create `components/Breadcrumbs.tsx` with crawlable links:

```tsx
import Link from "next/link";
import type { EventPageRecord } from "../lib/events";

export function Breadcrumbs({ event }: { event: EventPageRecord }) {
  const collectionHref = event.source === "windows_security" ? "/windows-events/" : "/sysmon-events/";
  const collectionName = event.source === "windows_security" ? "Windows Events" : "Sysmon Events";
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-steel">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link className="hover:text-accent" href="/">Home</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link className="hover:text-accent" href={collectionHref}>{collectionName}</Link></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">Event ID {event.id}</li>
      </ol>
    </nav>
  );
}
```

In `components/EventPage.tsx`, render `<Breadcrumbs event={event} />`, use `buildEventStructuredData(event)`, and set the H1 to `eventPageTitle(event)`.

In both dynamic route files, set title, Open Graph title/description/type/url, and Twitter title/description/card from `eventPageTitle(event)` and `eventDescription(event)`.

- [ ] **Step 5: Run tests and type checking**

Run: `npm.cmd test; npm.cmd run typecheck`

Expected: All tests pass and TypeScript exits with code 0.

- [ ] **Step 6: Commit event SEO**

```powershell
git add lib/schema-org.ts components/Breadcrumbs.tsx components/EventPage.tsx app/windows-events/[id]/page.tsx app/sysmon-events/[id]/page.tsx tests/seo.test.ts
git commit -m "feat: add event breadcrumbs and long-tail metadata"
```

---

### Task 3: Site Metadata And Canonicals

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/windows-events/page.tsx`
- Modify: `app/sysmon-events/page.tsx`
- Modify: `app/tools/page.tsx`
- Modify: `app/tools/timestamp-converter/page.tsx`
- Modify: `app/tools/sigma-converter/page.tsx`
- Modify: `app/tools/cvss-calculator/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/privacy-policy/page.tsx`
- Modify: `app/disclaimer/page.tsx`

**Interfaces:**
- Consumes: `SITE_DESCRIPTION`, `SITE_NAME`, `SITE_URL`, and `buildWebsiteJsonLd()`.
- Produces: canonical metadata for every indexable static route and site-level Open Graph/Twitter defaults.

- [ ] **Step 1: Add root metadata and homepage structured data**

Update `app/layout.tsx` metadata:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary", title: SITE_NAME, description: SITE_DESCRIPTION },
};
```

In `app/page.tsx`, inject `buildWebsiteJsonLd()` as an `application/ld+json` script before visible content.

- [ ] **Step 2: Add canonical metadata to all static pages**

Add these exact canonical paths to the existing metadata objects:

```text
/windows-events/
/sysmon-events/
/tools/
/tools/timestamp-converter/
/tools/sigma-converter/
/tools/cvss-calculator/
/about/
/privacy-policy/
/disclaimer/
```

Update collection descriptions to describe complete investigation guides rather than unfinished pipeline entries, because all 108 records are complete. Update the visible collection intro copy to match.

- [ ] **Step 3: Run tests, type checking, and metadata build**

Run: `npm.cmd test; npm.cmd run typecheck; npm.cmd run build`

Expected: All tests pass, type checking succeeds, and Next.js exports 123 static pages.

- [ ] **Step 4: Inspect generated metadata**

Run focused checks against `out/index.html`, `out/windows-events/4625/index.html`, and `out/tools/timestamp-converter/index.html` for canonical, Open Graph, Twitter, `WebSite`, and event `BreadcrumbList` output.

- [ ] **Step 5: Commit site metadata**

```powershell
git add app/layout.tsx app/page.tsx app/windows-events/page.tsx app/sysmon-events/page.tsx app/tools/page.tsx app/tools/timestamp-converter/page.tsx app/tools/sigma-converter/page.tsx app/tools/cvss-calculator/page.tsx app/about/page.tsx app/privacy-policy/page.tsx app/disclaimer/page.tsx
git commit -m "feat: add canonical and social metadata"
```

---

### Task 4: Accurate Sitemap And Robots

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `app/robots.ts`
- Modify: `tests/seo.test.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: `SITE_URL`, `absoluteUrl`, `getCompleteEvents()`, and `getEventHref()`.
- Produces: a sitemap containing 118 URLs and robots.txt referencing the shared sitemap origin.

- [ ] **Step 1: Write failing sitemap and robots tests**

Append to `tests/seo.test.ts`:

```ts
import robots from "../app/robots";
import sitemap from "../app/sitemap";

test("includes every indexable route without fake static modification dates", () => {
  const entries = sitemap();
  assert.equal(entries.length, 118);
  assert.equal(entries.some((entry) => entry.url === `${SITE_URL}/tools/timestamp-converter/`), true);
  assert.equal(entries.some((entry) => entry.url === `${SITE_URL}/tools/sigma-converter/`), true);
  assert.equal(entries.some((entry) => entry.url === `${SITE_URL}/tools/cvss-calculator/`), true);
  const homepage = entries.find((entry) => entry.url === `${SITE_URL}/`);
  assert.ok(homepage);
  assert.equal("lastModified" in homepage, false);
  const event = entries.find((entry) => entry.url === `${SITE_URL}/windows-events/4625/`);
  assert.ok(event?.lastModified);
});

test("points robots.txt to the configured sitemap", () => {
  assert.equal(robots().sitemap, `${SITE_URL}/sitemap.xml`);
});
```

- [ ] **Step 2: Run tests and observe sitemap failures**

Run: `npm.cmd test`

Expected: The sitemap count and tool-route checks fail, and the homepage has an unexpected `lastModified` field.

- [ ] **Step 3: Implement sitemap and robots fixes**

Use this static route list in `app/sitemap.ts`:

```ts
const staticRoutes = [
  "/",
  "/windows-events/",
  "/sysmon-events/",
  "/tools/",
  "/tools/timestamp-converter/",
  "/tools/sigma-converter/",
  "/tools/cvss-calculator/",
  "/about/",
  "/privacy-policy/",
  "/disclaimer/",
];
```

Map these to `{ url: absoluteUrl(route) }` without `lastModified`. Keep event entries as `{ url: absoluteUrl(getEventHref(...)), lastModified: new Date(event.last_reviewed) }`.

Set robots sitemap to `absoluteUrl("/sitemap.xml")`.

- [ ] **Step 4: Update documentation**

Document `NEXT_PUBLIC_SITE_URL`, the fallback origin, canonical coverage, breadcrumb JSON-LD, and the rule for switching to a permanent domain in `README.md`.

- [ ] **Step 5: Run final verification**

Run: `npm.cmd test; npm.cmd run typecheck; npm.cmd run build; git diff --check`

Expected: 0 test failures, type checking exits 0, 123 pages export, sitemap contains 118 URLs, and `git diff --check` reports no whitespace errors.

- [ ] **Step 6: Commit crawl discovery changes**

```powershell
git add app/sitemap.ts app/robots.ts tests/seo.test.ts README.md
git commit -m "fix: complete SEO crawl discovery"
```

---

## Plan Self-Review

- Spec coverage: centralized domain, titles, canonical metadata, visible and JSON-LD breadcrumbs, `WebSite`, `TechArticle`, Open Graph, Twitter, sitemap, robots, internal hierarchy links, tests, documentation, and domain handoff are covered.
- Deferred items remain excluded: permanent domain, Search Console verification, analytics, advertising, consent management, Open Graph image, and new editorial routes.
- Interface consistency: all absolute URL consumers use `lib/site.ts`; all event title and JSON-LD consumers use `lib/schema-org.ts`; all tests are loaded through `tests/all.test.ts`.
- Expected sitemap count: 10 static routes plus 108 event routes equals 118 URLs.
