# SOC Event Lookup MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Next.js MVP for a Windows Security / Sysmon event ID lookup site, driven by local JSON data and ready for Vercel.

**Architecture:** Use Next.js App Router with build-time JSON reads from `data/`. Detail pages are generated only from complete event records under `data/events/`, while category pages list all skeleton entries from `data/event_ids.json` and mark unfinished content as pending.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, local JSON, AJV validation, Node test runner via `tsx`.

## Global Constraints

- No login, database, backend service, or live third-party API calls.
- Full event records must follow `event-page-schema.json` field names.
- `/windows-events/{id}` and `/sysmon-events/{id}` must be generated from existing full JSON files only.
- Category list pages must use the 108-entry skeleton list and avoid dead links for unfinished records.
- Detail pages need canonical metadata, TechArticle JSON-LD, KQL/SPL/sample log code blocks, related-event links, and source URL.
- Core MVP quality takes priority over optional tools; tools can be lightweight if the core remains solid.

---

### Task 1: Project Scaffold And Data

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`
- Create: `data/event-page-schema.json`, `data/event_ids.json`, `data/events/windows-security/4625.json`

**Interfaces:**
- Produces a Next.js app shell and local data files for later tasks.

- [x] Add framework configuration and copy the provided JSON data into `data/`.
- [x] Install dependencies with `npm install`.
- [x] Verify TypeScript can load JSON modules.

### Task 2: Event Data Library With Tests

**Files:**
- Create: `lib/events.ts`
- Create: `tests/events.test.ts`

**Interfaces:**
- Produces `getSkeletonEvents()`, `getCompleteEvents()`, `getEventByRoute(sourceSlug, id)`, `getCompletedEventKeys()`, `sourceToRouteSlug(source)`, and `routeSlugToSource(slug)`.

- [x] Write tests proving source slug mapping, complete event discovery, route lookup for `windows-events/4625`, and pending skeleton behavior.
- [x] Run tests and confirm they fail because `lib/events.ts` does not exist.
- [x] Implement `lib/events.ts`.
- [x] Run tests and confirm they pass.

### Task 3: Schema Validation With Tests

**Files:**
- Create: `scripts/validate-data.ts`
- Create: `tests/validate-data.test.ts`

**Interfaces:**
- Produces `validateEventRecord(record, filePath)` and `validateAllEventFiles(rootDir)`.

- [x] Write tests proving valid 4625 data passes and a record missing `definition` fails with file and field details.
- [x] Run tests and confirm they fail because validation functions do not exist.
- [x] Implement AJV-based validation.
- [x] Run tests and confirm they pass.

### Task 4: Static Pages And SEO

**Files:**
- Create: `lib/schema-org.ts`, `components/CodeBlock.tsx`, `components/EventCard.tsx`, `components/RelatedEvents.tsx`, `components/EventPage.tsx`, `components/CategoryFilter.tsx`
- Create: `app/page.tsx`, `app/windows-events/page.tsx`, `app/windows-events/[id]/page.tsx`, `app/sysmon-events/page.tsx`, `app/sysmon-events/[id]/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/about/page.tsx`, `app/privacy-policy/page.tsx`, `app/disclaimer/page.tsx`

**Interfaces:**
- Consumes event library functions.
- Produces static event list/detail pages and SEO metadata.

- [x] Build the homepage and navigation.
- [x] Build category pages with static-export-safe client filtering.
- [x] Build event detail pages with `generateStaticParams`, `generateMetadata`, and JSON-LD.
- [x] Build sitemap and robots from actual complete events.

### Task 5: Lightweight Tools With Tests

**Files:**
- Create: `lib/tools/timestamp.ts`, `lib/tools/sigma.ts`, `lib/tools/cvss.ts`
- Create: `tests/tools.test.ts`
- Create: `components/tools/TimestampConverter.tsx`, `components/tools/SigmaConverter.tsx`, `components/tools/CvssCalculator.tsx`
- Create: `app/tools/page.tsx`, `app/tools/timestamp-converter/page.tsx`, `app/tools/sigma-converter/page.tsx`, `app/tools/cvss-calculator/page.tsx`

**Interfaces:**
- Produces pure functions for tool logic and client components for UI.

- [x] Write tests for Unix/Windows/ISO timestamp parsing, simple Sigma selection conversion, and CVSS 3.1 scoring.
- [x] Run tests and confirm they fail because tool modules do not exist.
- [x] Implement pure tool logic.
- [x] Run tests and confirm they pass.
- [x] Add client UI pages.

### Task 6: Documentation And Verification

**Files:**
- Create: `README.md`, `docs/content-authoring.md`
- Modify: `package.json`

**Interfaces:**
- Produces user-facing build, validation, authoring, and scope notes.

- [x] Add scripts for `validate:data`, `test`, `typecheck`, and `build`.
- [x] Document trade-offs and content authoring rules.
- [x] Run `npm run test`, `npm run validate:data`, `npm run typecheck`, and `npm run build`.
