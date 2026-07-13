# SOC Event Lookup: Agent Handoff

Last updated: 2026-07-13

## Current State

The project is a Next.js static-export SOC event knowledge base for Windows
Security and Sysmon event IDs. It includes static event detail pages, category
list pages, analyst tools, SEO metadata, Schema.org JSON-LD, and deterministic
machine-readable JSON exports.

All 108 planned event records are currently authored:

- Windows Security: complete
- Sysmon: complete
- `docs/PROGRESS.md`: no `pending` or `needs-rework` entries
- Static JSON export count: 108 records

The repository has been pushed to:

```text
https://github.com/mengen100/SOC_Lookup.git
```

Current primary branch:

```text
master
```

## Core Commands

Use PowerShell on Windows. Prefer the explicit `.cmd` form for npm commands:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

Production-style preview:

```powershell
npm.cmd run build
npx.cmd serve out
```

Do not use `npm run start`. The app uses `output: "export"`, and `next start`
is not supported for static export mode.

## Important Paths

```text
data/event_ids.json
data/event-page-schema.json
data/events/windows-security/
data/events/sysmon/
docs/PROGRESS.md
docs/detection-notes-standard.md
lib/events.ts
components/EventBrowser.tsx
components/EventCard.tsx
components/EventPage.tsx
scripts/export-json.ts
scripts/validate-data.ts
tests/
```

## Content Quality Standard

Before revising event content, read:

```text
docs/detection-notes-standard.md
```

For every event record:

- Use Microsoft Learn or Sysinternals documentation for real event fields and
  event semantics.
- Use MITRE ATT&CK for exact technique or sub-technique mapping.
- Use SigmaHQ or published Splunk rules only as attributed detection references,
  not as universal truth.
- Do not invent field names, status codes, access masks, registry paths, port
  values, thresholds, or ATT&CK mappings.
- `detection_notes` must include concrete observable values and causal reasoning.
  A trailing ATT&CK ID alone is not enough.

Reference-quality event records:

```text
data/events/windows-security/4768.json
data/events/windows-security/4794.json
data/events/windows-security/4732.json
data/events/windows-security/4740.json
data/events/sysmon/1.json
```

## Validation Expectations

Before committing meaningful changes:

```powershell
npm.cmd test
npm.cmd run build
```

`npm.cmd run build` runs:

1. data validation
2. static JSON export
3. Next.js production build
4. static export generation

Treat any failure as blocking.

## Local-Only Files

These files/directories are local agent or tool configuration and should stay out
of the repository:

```text
AGENTS.md
.claude/
```

Both are ignored by `.gitignore`.

## Suggested Next Work

The content set is complete, so the next phase is not bulk authoring. Recommended
next steps:

1. Verify the app remains English-only in user-facing UI and data.
2. Run a source-grounded quality spot check on high-risk records:
   `4768`, `4769`, `4771`, `4713`, `4720`, `4724`, `4732`, `4672`,
   `1102`, `4719`, `4612`, `4621`, `sysmon:1`, `sysmon:10`, `sysmon:11`,
   and `sysmon:25`.
3. Review SEO surfaces:
   `sitemap.xml`, `robots.txt`, canonical URLs, Schema.org JSON-LD, and static
   JSON exports under `/api/events/`.
4. Prepare a deployment checklist before enabling analytics, ads, or production
   hosting changes.
