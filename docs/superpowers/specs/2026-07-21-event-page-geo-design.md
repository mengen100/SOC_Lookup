# Event Page GEO and Detection Content Design

## Goal

Restructure all 108 Windows Security and Sysmon event pages into source-grounded technical references that are easy for analysts, search engines, and retrieval systems to parse and cite.

## Scope

This work covers the event record schema, event detail renderer, structured data, validation, source attribution, and migration of all existing event records. It does not add a new route, change deployment, or create new event IDs.

## Design Decision

Use explicit schema enrichment and migrate records in reviewed batches of 10-15. Do not infer technical metadata, ATT&CK mappings, error-code meanings, or vendor query fields from prose at render time.

The alternatives were rejected for these reasons:

- Renderer-only inference is fast but cannot meet the accuracy requirement.
- Separate GEO overlay files duplicate facts and can drift from the event JSON.

## Source Policy

Every event migration follows `source-grounded-soc-content` and `docs/detection-notes-standard.md`.

Source precedence:

1. Microsoft Learn or Sysinternals for event semantics, fields, channels, levels, keywords, and values.
2. MITRE ATT&CK for tactic, technique, and sub-technique identifiers and names.
3. Palo Alto Networks documentation for Cortex datasets, XQL syntax, and fields.
4. SigmaHQ or Splunk published rules as attributed detection starting points, never as universal event semantics.

Unknown or deployment-dependent facts are omitted or explicitly qualified. They are never filled with plausible values.

## Data Model

Existing core fields remain valid. The schema gains the following structured fields.

### Technical Metadata

```ts
interface TechnicalMetadata {
  provider: string;
  channel: string;
  level: string;
  audit_keyword?: string;
}
```

`level` and `audit_keyword` are separate because values such as `Audit Failure` are Windows audit keywords/outcomes, not necessarily Event Viewer levels.

### ATT&CK Mapping

```ts
interface AttackMapping {
  tactic_id: string;
  tactic_name: string;
  technique_id: string;
  technique_name: string;
  source_url: string;
}
```

Mappings use the most precise defensible sub-technique. A record may have no mapping when no reliable event-specific relationship exists.

### Detection Queries

```ts
interface DetectionQuery {
  language: "kql" | "spl" | "xql" | "sigma";
  title: string;
  query: string;
  data_source: string;
  assumptions: string[];
  source_url?: string;
}
```

Queries are analyst starting points, not claims of universal maliciousness. Thresholds and environmental assumptions must be stated.

Cortex XQL uses the native Windows event dataset:

```xql
dataset = microsoft_windows_raw
| filter edr_event_id = 4625
```

The project must not use `winlog.event_id` as a Cortex-native field. Event-specific raw payload fields may only be referenced when Palo Alto documentation or a verified tenant schema establishes their names. Otherwise, the XQL query filters by `edr_event_id` and exposes the raw event for follow-up.

### Code and Value References

```ts
interface EventValueReference {
  field: string;
  value: string;
  meaning: string;
  security_relevance: string;
  source_url: string;
}
```

This optional array contains status codes, sub-status codes, masks, logon types, encryption types, ports, or other documented values. Pages without such values do not render an empty table.

### FAQ

```ts
interface EventFaq {
  question: string;
  answer: string;
}
```

Each migrated record contains two to four concise factual questions and answers. Answers must be supported by the same sources as the visible page content.

### Sources

```ts
interface EventSourceReference {
  title: string;
  url: string;
  publisher: string;
  source_type: "vendor" | "attack" | "detection-rule";
}
```

The existing `source_url` remains during migration for compatibility. `sources` becomes the complete provenance list and must include at least one vendor source.

## Page Information Architecture

The event page remains a restrained analyst reference and uses this order:

1. Breadcrumbs and title.
2. `<section id="quick-summary">` containing the 1-2 sentence definition.
3. Technical metadata table.
4. Trigger scenarios and key fields.
5. Threat hunting queries for KQL, SPL, Cortex XQL, and Sigma when verified.
6. Deep-dive value/code table when applicable.
7. Detection notes, false positives, and related events.
8. Visible FAQ section.
9. Sources and machine-readable JSON link.

The metadata and code tables must remain horizontally usable on narrow screens through wrapping or controlled overflow. Missing optional content is omitted rather than replaced with generic filler.

## Structured Data

Each event page emits one JSON-LD `@graph` containing:

- `TechArticle`
- `FAQPage` when visible FAQ items exist
- `BreadcrumbList`

The `TechArticle` includes a stable canonical `@id`, headline, description, URL, date modified, publisher/author organization, and structured `about` references for the event and verified ATT&CK techniques.

The `FAQPage` content must exactly match visible questions and answers. FAQ markup is implemented for semantic clarity and machine consumption; the product must not claim that it guarantees a Google FAQ rich result.

## Migration Strategy

### Foundation

Add schema types, validation, renderer support, structured data, and compatibility adapters for existing `kql_snippet` and `spl_snippet` records. Existing pages must continue to build while migration proceeds.

### Pilot

Migrate these representative records first:

- Windows Security 4625: status/sub-status and logon types.
- Windows Security 4688: process creation and command-line fields.
- Windows PowerShell 4104: script block logging.
- Windows Security 4769: Kerberos ticket encryption and options.
- Sysmon 1: process creation and hashes.

The pilot validates every new component and all source categories before bulk migration.

### Bulk Migration

Migrate the remaining 103 records in batches of 10-15. Each batch receives source review, automated validation, build verification, progress updates, and one focused commit.

## Validation

Automated checks must verify:

- All event JSON files satisfy the enriched schema.
- The quick summary is present and limited to two sentences.
- Technical metadata fields are non-empty.
- Every ATT&CK mapping has tactic and technique identifiers, names, and an official ATT&CK URL.
- Query language values are unique per record and required query metadata is present.
- XQL uses `microsoft_windows_raw` and `edr_event_id`, and does not contain `winlog.event_id`.
- Every value reference has a source URL.
- FAQ JSON-LD is generated from the same event FAQ objects rendered visibly.
- JSON-LD parses and canonical identifiers match the event URL.
- The exported machine-readable JSON includes the enriched fields.
- All 108 event routes remain in the sitemap and static export.

Manual checks must verify:

- Field names and enumerated values against primary vendor documentation.
- ATT&CK mappings against exact technique or sub-technique pages.
- KQL, SPL, XQL, and Sigma assumptions are stated and syntactically credible.
- Tables, code blocks, FAQ content, and source links render correctly on desktop and mobile.
- No prose presents an environment-specific threshold as a universal indicator.

## Verification Commands

Each implementation and content batch runs:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
git diff --check
```

Production-facing completion also runs `npm.cmd run verify:production` against the deployed site after release.

## Completion Criteria

The project is complete when all 108 records use the enriched schema, every page renders the approved information architecture, all citations and queries have been reviewed under the source policy, automated checks pass, static export succeeds, and `docs/PROGRESS.md` records all entries as done.
