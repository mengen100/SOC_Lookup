# Event Page GEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the enriched event-page model, renderer, structured data, and source-grounded pilot content for Windows 4625, 4688, 4104, 4769, and Sysmon 1 without breaking the other 103 static pages.

**Architecture:** Extend the existing event JSON as the single source of truth and keep new fields optional during the pilot migration. Focused React components render each structured section, while JSON-LD is derived from the same objects to prevent visible/structured drift. Semantic tests require the complete enriched model for the five pilot IDs and preserve compatibility for unmigrated records.

**Tech Stack:** Next.js 15 static export, React 19, TypeScript 5.7, JSON Schema Draft 7, AJV 8, Node test runner, Tailwind CSS.

## Global Constraints

- Use Microsoft Learn or Sysinternals for Windows/Sysmon semantics and field values.
- Use exact MITRE ATT&CK technique or sub-technique pages for every mapping.
- Use Palo Alto Networks documentation for Cortex XQL datasets, syntax, and fields.
- Cortex XQL must use `microsoft_windows_raw` and `edr_event_id`; it must not use `winlog.event_id`.
- SigmaHQ and Splunk rules are attributed detection starting points, not universal facts.
- Do not invent fields, codes, masks, paths, thresholds, tactics, techniques, or query syntax.
- Keep all reader-facing content in English and all text files on LF line endings.
- Run `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, and `git diff --check` before completion.

---

### Task 1: Enriched Event Types and JSON Schema

**Files:**
- Modify: `lib/events.ts`
- Modify: `data/event-page-schema.json`
- Modify: `tests/validate-data.test.ts`

**Interfaces:**
- Produces: `TechnicalMetadata`, `AttackMapping`, `DetectionQuery`, `EventValueReference`, `EventFaq`, and `EventSourceReference` interfaces.
- Produces: optional `technical_metadata`, `queries`, `value_references`, `faqs`, and `sources` properties on `EventPageRecord` during migration.

- [ ] **Step 1: Write failing schema validation tests**

Add a complete enriched fixture and invalid variants to `tests/validate-data.test.ts`. Assert that invalid query languages, malformed ATT&CK IDs, source objects without URLs, and value references without sources produce validation errors.

```ts
const enriched = {
  ...validRecord,
  technical_metadata: {
    provider: "Microsoft-Windows-Security-Auditing",
    channel: "Security",
    level: "Information",
    audit_keyword: "Audit Failure",
  },
  attck_mapping: [{
    tactic_id: "TA0006",
    tactic_name: "Credential Access",
    technique_id: "T1110.001",
    technique_name: "Password Guessing",
    source_url: "https://attack.mitre.org/techniques/T1110/001/",
  }],
  queries: [{
    language: "xql",
    title: "Failed logons",
    query: "dataset = microsoft_windows_raw\n| filter edr_event_id = 4625",
    data_source: "Cortex XDR microsoft_windows_raw",
    assumptions: ["Windows event logs are collected by Cortex XDR."],
    source_url: "https://docs-cortex.paloaltonetworks.com/",
  }],
  value_references: [{
    field: "Status",
    value: "0xC000006A",
    meaning: "The username is correct but the password is wrong.",
    security_relevance: "Repeated failures can indicate password guessing.",
    source_url: "https://learn.microsoft.com/",
  }],
  faqs: [{ question: "What does Event ID 4625 mean?", answer: "It records a failed logon." }],
  sources: [{
    title: "4625(S): An account failed to log on",
    url: "https://learn.microsoft.com/",
    publisher: "Microsoft",
    source_type: "vendor",
  }],
};

assert.deepEqual(validateEventRecord(enriched, "4625.json"), []);
```

- [ ] **Step 2: Run the validation test and confirm failure**

Run: `npm.cmd test`

Expected: FAIL because the current schema rejects the new ATT&CK properties and does not constrain the enriched fields.

- [ ] **Step 3: Add TypeScript interfaces and schema definitions**

Define the interfaces exactly as approved in `docs/superpowers/specs/2026-07-21-event-page-geo-design.md`. Add Draft 7 definitions and references in `data/event-page-schema.json`. During the pilot, new top-level fields are optional, but every nested object has required properties and `additionalProperties: false`.

Use these identifier patterns:

```json
{
  "tactic_id": { "type": "string", "pattern": "^TA[0-9]{4}$" },
  "technique_id": { "type": "string", "pattern": "^T[0-9]{4}(\\.[0-9]{3})?$" },
  "language": { "enum": ["kql", "spl", "xql", "sigma"] }
}
```

- [ ] **Step 4: Run schema and type checks**

Run: `npm.cmd test`

Expected: all tests pass.

Run: `npm.cmd run typecheck`

Expected: exit code 0.

- [ ] **Step 5: Commit the schema foundation**

```powershell
git add lib/events.ts data/event-page-schema.json tests/validate-data.test.ts
git commit -m "feat: add enriched event content schema"
```

### Task 2: Semantic Validation for Enriched Records

**Files:**
- Create: `lib/event-content-validation.ts`
- Modify: `tests/events.test.ts`

**Interfaces:**
- Produces: `validateEnrichedEvent(event: EventPageRecord): string[]`.
- Consumes: enriched interfaces from Task 1.

- [ ] **Step 1: Write failing semantic validation tests**

Add unit cases for a valid record and each prohibited state. The validator must collect every error instead of stopping at the first one.

```ts
assert.deepEqual(validateEnrichedEvent(validEvent), []);
assert.match(validateEnrichedEvent({ ...validEvent, definition: "First. Second. Third." }).join("\n"), /two sentences/);
assert.match(validateEnrichedEvent(eventWithDuplicateXql).join("\n"), /duplicate query language/);
assert.match(validateEnrichedEvent(eventWithBadXql).join("\n"), /winlog\.event_id/);
assert.match(validateEnrichedEvent(eventWithoutVendorSource).join("\n"), /vendor source/);
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm.cmd test`

Expected: FAIL because `validateEnrichedEvent` does not exist.

- [ ] **Step 3: Implement collected semantic checks**

Implement checks for:

- one or two sentences in `definition`;
- non-empty technical metadata;
- unique query languages;
- XQL containing `dataset = microsoft_windows_raw` and `edr_event_id`;
- XQL not containing `winlog.event_id`;
- official ATT&CK URLs matching each technique ID;
- two to four FAQs;
- at least one `vendor` source;
- every value reference using an HTTP(S) source URL.

Apply `validateEnrichedEvent` only to pilot keys in the repository-wide test:

```ts
const pilotKeys = new Set([
  "windows_security:4104",
  "windows_security:4625",
  "windows_security:4688",
  "windows_security:4769",
  "sysmon:1",
]);
```

- [ ] **Step 4: Run tests and type checks**

Run: `npm.cmd test`

Expected: all tests pass before pilot data is made mandatory; focused validator unit cases pass.

Run: `npm.cmd run typecheck`

Expected: exit code 0.

- [ ] **Step 5: Commit semantic validation**

```powershell
git add lib/event-content-validation.ts tests/events.test.ts
git commit -m "test: validate enriched event evidence"
```

### Task 3: Event Page Components and Visible FAQ

**Files:**
- Create: `components/EventMetadataTable.tsx`
- Create: `components/DetectionQueries.tsx`
- Create: `components/EventValueTable.tsx`
- Create: `components/EventFaq.tsx`
- Create: `components/EventSources.tsx`
- Modify: `components/EventPage.tsx`
- Modify: `tests/ui-layout.test.ts`

**Interfaces:**
- `EventMetadataTable({ event }: { event: EventPageRecord })`
- `DetectionQueries({ event }: { event: EventPageRecord })`
- `EventValueTable({ values }: { values?: EventValueReference[] })`
- `EventFaq({ faqs }: { faqs?: EventFaq[] })`
- `EventSources({ event }: { event: EventPageRecord })`

- [ ] **Step 1: Add failing renderer structure tests**

Extend `tests/ui-layout.test.ts` to inspect component source and require:

- `<section id="quick-summary">`;
- semantic `<table>` elements in metadata and value components;
- controlled `overflow-x-auto` around tables and code blocks;
- visible FAQ headings and answers sourced from `event.faqs`;
- no nested card containers around page sections.

- [ ] **Step 2: Run UI tests and confirm failure**

Run: `npm.cmd test`

Expected: FAIL because the new components and quick-summary section do not exist.

- [ ] **Step 3: Implement focused components**

Render the approved order. Preserve a compatibility path for unmigrated records:

```tsx
<section id="quick-summary" className="border-b border-line pb-8">
  <h2 className="sr-only">Quick summary</h2>
  <p className="max-w-3xl text-lg leading-8 text-steel">{event.definition}</p>
</section>
```

`DetectionQueries` prefers `event.queries`; when absent it renders the existing `kql_snippet` and `spl_snippet`. Each enriched query visibly displays its data source, assumptions, and optional source link.

Tables use native `table`, `thead`, `tbody`, `th`, and `td` elements inside `overflow-x-auto`. Optional sections return `null` when their arrays are absent or empty.

- [ ] **Step 4: Run tests and build**

Run: `npm.cmd test`

Expected: all tests pass.

Run: `npm.cmd run typecheck`

Expected: exit code 0.

Run: `npm.cmd run build`

Expected: static export succeeds for all routes.

- [ ] **Step 5: Commit the visible page structure**

```powershell
git add components/EventMetadataTable.tsx components/DetectionQueries.tsx components/EventValueTable.tsx components/EventFaq.tsx components/EventSources.tsx components/EventPage.tsx tests/ui-layout.test.ts
git commit -m "feat: restructure event reference pages"
```

### Task 4: TechArticle and FAQPage JSON-LD

**Files:**
- Modify: `lib/schema-org.ts`
- Modify: `tests/seo.test.ts`
- Modify: `lib/production-verification.ts`
- Modify: `tests/production-verification.test.ts`

**Interfaces:**
- Consumes: `event.faqs`, `event.attck_mapping`, and canonical event URLs.
- Produces: a JSON-LD `@graph` with stable `TechArticle`, optional `FAQPage`, and `BreadcrumbList` nodes.

- [ ] **Step 1: Write failing JSON-LD tests**

Require stable identifiers and visible-data parity:

```ts
const graph = buildEventStructuredData(event)["@graph"];
const article = graph.find((item) => item["@type"] === "TechArticle");
const faq = graph.find((item) => item["@type"] === "FAQPage");

assert.equal(article?.["@id"], `${canonical}#article`);
assert.equal(article?.mainEntityOfPage, canonical);
assert.deepEqual(
  faq?.mainEntity.map((item) => [item.name, item.acceptedAnswer.text]),
  event.faqs?.map((item) => [item.question, item.answer]),
);
```

- [ ] **Step 2: Run SEO tests and confirm failure**

Run: `npm.cmd test`

Expected: FAIL because the current graph has no `FAQPage` or stable `@id`.

- [ ] **Step 3: Build structured data from event objects**

Add:

- `@id: ${url}#article` on `TechArticle`;
- organization author and publisher;
- `mainEntityOfPage: url`;
- ATT&CK `about` entries using official mapping URLs;
- `FAQPage` only when `event.faqs` is non-empty;
- `Question` and `Answer` text copied directly from `event.faqs`.

Update production verification to accept and check `FAQPage` on enriched event routes without requiring it on unmigrated routes.

- [ ] **Step 4: Run SEO and production verification tests**

Run: `npm.cmd test`

Expected: all tests pass.

Run: `npm.cmd run typecheck`

Expected: exit code 0.

- [ ] **Step 5: Commit structured data**

```powershell
git add lib/schema-org.ts tests/seo.test.ts lib/production-verification.ts tests/production-verification.test.ts
git commit -m "feat: add event FAQ structured data"
```

### Task 5: Source-Grounded Pilot Migration

**Files:**
- Modify: `data/events/windows-security/4104.json`
- Modify: `data/events/windows-security/4625.json`
- Modify: `data/events/windows-security/4688.json`
- Modify: `data/events/windows-security/4769.json`
- Modify: `data/events/sysmon/1.json`
- Modify: `docs/PROGRESS.md`
- Modify: `tests/events.test.ts`

**Interfaces:**
- Consumes: the enriched schema and semantic validator.
- Produces: five complete reference records exercising all new page sections.

- [ ] **Step 1: Collect primary sources before editing data**

For each event, record the exact Microsoft Learn or Sysinternals page, exact ATT&CK mapping pages, and applicable Palo Alto XQL documentation. Use SigmaHQ/Splunk only when a query is adapted from a published rule, and preserve its URL in the query object.

- [ ] **Step 2: Add the five pilot records to mandatory semantic validation**

Update the pilot set in `tests/events.test.ts`, run `npm.cmd test`, and confirm it reports every missing enriched field for all five keys in one failure message.

- [ ] **Step 3: Migrate Windows Security 4625 and 4769**

Add technical metadata, precise tactic mappings, KQL/SPL/XQL/Sigma queries, documented status or encryption values, two to four FAQs, and complete sources. Keep environment-specific thresholds in `assumptions` rather than presenting them as Microsoft defaults.

- [ ] **Step 4: Migrate Windows Security 4688 and PowerShell 4104**

Use each event's real provider and channel. Do not copy Security-channel metadata onto PowerShell Operational logs. Ensure query field names match the declared SIEM data source.

- [ ] **Step 5: Migrate Sysmon 1**

Use the current Sysinternals Event ID 1 field definitions and exact Sysmon provider/channel. Treat configured hashing algorithms and command-line availability as deployment assumptions.

- [ ] **Step 6: Update progress and manually review rendered output**

Mark the five records as GEO-enriched in a new legend/status note in `docs/PROGRESS.md` without changing the existing content-completion meaning of `done`.

Run the development server and inspect:

- `/windows-events/4625/`
- `/windows-events/4688/`
- `/windows-events/4104/`
- `/windows-events/4769/`
- `/sysmon-events/1/`

Check desktop and mobile widths for table overflow, code wrapping, FAQ visibility, source links, and section order.

- [ ] **Step 7: Run the complete verification suite**

Run: `npm.cmd test`

Expected: all tests pass.

Run: `npm.cmd run typecheck`

Expected: exit code 0.

Run: `npm.cmd run build`

Expected: static export succeeds for all 108 event routes and supporting pages.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 8: Commit the pilot migration**

```powershell
git add data/events/windows-security/4104.json data/events/windows-security/4625.json data/events/windows-security/4688.json data/events/windows-security/4769.json data/events/sysmon/1.json docs/PROGRESS.md tests/events.test.ts
git commit -m "content: enrich pilot event references"
```

### Task 6: Prepare the Remaining 103-Record Migration

**Files:**
- Create: `docs/superpowers/plans/2026-07-21-event-page-geo-migration.md`

**Interfaces:**
- Consumes: verified schema, renderer, validator, and pilot patterns.
- Produces: an exact 10-15 record batch manifest covering every non-pilot event once.

- [ ] **Step 1: Audit pilot findings**

Record any data-model adjustment revealed by the five pilots. A schema adjustment requires a focused test-first commit before bulk content work.

- [ ] **Step 2: Generate and verify the batch manifest**

List all remaining keys from `data/event_ids.json`, grouped by shared source family where research can be reused. Add a test or script assertion that the pilot set plus migration manifest equals all 108 unique skeleton keys.

- [ ] **Step 3: Define the repeated batch gate**

Every batch in the migration plan must include primary-source collection, manual review against `docs/detection-notes-standard.md`, `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`, progress update, and one commit.

- [ ] **Step 4: Commit the full migration plan**

```powershell
git add docs/superpowers/plans/2026-07-21-event-page-geo-migration.md
git commit -m "docs: plan full event GEO migration"
```
