# Event Page GEO Migration Plan

**Goal:** Migrate the remaining 103 event records to the enriched event-page model, leaving all 108 Windows Security and Sysmon pages source-grounded, query-ready, and eligible for the same visible and structured-data presentation.

**Pilot already complete:** `windows_security:4104`, `windows_security:4625`, `windows_security:4688`, `windows_security:4769`, `sysmon:1`.

## Required Evidence

Every migrated record must include:

- `technical_metadata` verified against Microsoft Learn or Sysinternals documentation;
- exact MITRE ATT&CK tactic and technique or sub-technique mappings with matching official URLs;
- KQL, Splunk SPL, Cortex XQL, and Sigma queries with explicit data-source assumptions;
- documented field values only when a primary source establishes the value and meaning;
- two to four visible FAQs answered directly from the verified event semantics;
- a complete `sources` list containing at least one vendor or primary source;
- `reviewed_at` set to the actual review date.

Do not infer provider fields, status codes, channels, levels, paths, masks, or ATT&CK mappings from the event title. When a product-specific query depends on a field mapping, state that dependency in `assumptions`. Cortex XQL must use the native raw collector model (`dataset = microsoft_windows_raw` and `edr_event_id`) and must not use `winlog.event_id`.

## Batch Workflow

For every batch:

1. Research each record using primary sources first. Treat SigmaHQ and Splunk detections as attributed implementation references, not universal product facts.
2. Edit only the assigned event JSON files and `docs/PROGRESS.md`.
3. Run `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`, and `git diff --check`.
4. Confirm changed text files use LF line endings.
5. Manually compare the visible definitions, values, queries, and FAQs with the cited sources.
6. Commit one batch with `content: enrich GEO event batch N`.

## Migration Batches

### Batch 1 (12)

`windows_security:1102`, `windows_security:4103`, `windows_security:4624`, `windows_security:4634`, `windows_security:4648`, `windows_security:4672`, `windows_security:4697`, `windows_security:4698`, `windows_security:4719`, `windows_security:4720`, `windows_security:4724`, `windows_security:4732`

### Batch 2 (12)

`windows_security:4738`, `windows_security:4740`, `windows_security:4765`, `windows_security:4768`, `windows_security:4776`, `windows_security:4794`, `windows_security:5140`, `sysmon:3`, `sysmon:8`, `sysmon:10`, `sysmon:11`, `sysmon:22`

### Batch 3 (12)

`windows_security:4616`, `windows_security:4647`, `windows_security:4649`, `windows_security:4657`, `windows_security:4663`, `windows_security:4689`, `windows_security:4699`, `windows_security:4702`, `windows_security:4706`, `windows_security:4715`, `windows_security:4716`, `windows_security:4722`

### Batch 4 (12)

`windows_security:4723`, `windows_security:4725`, `windows_security:4726`, `windows_security:4728`, `windows_security:4766`, `windows_security:4767`, `windows_security:4771`, `windows_security:4780`, `windows_security:4964`, `windows_security:5030`, `windows_security:5035`, `windows_security:5038`

### Batch 5 (12)

`windows_security:5145`, `windows_security:5376`, `windows_security:5377`, `windows_security:5827`, `windows_security:5828`, `sysmon:2`, `sysmon:5`, `sysmon:6`, `sysmon:7`, `sysmon:12`, `sysmon:13`, `sysmon:16`

### Batch 6 (12)

`sysmon:17`, `sysmon:18`, `sysmon:19`, `sysmon:20`, `sysmon:21`, `sysmon:23`, `sysmon:25`, `sysmon:29`, `windows_security:4608`, `windows_security:4609`, `windows_security:4610`, `windows_security:4611`

### Batch 7 (12)

`windows_security:4612`, `windows_security:4614`, `windows_security:4621`, `windows_security:4670`, `windows_security:4675`, `windows_security:4692`, `windows_security:4693`, `windows_security:4700`, `windows_security:4701`, `windows_security:4713`, `windows_security:4714`, `windows_security:4729`

### Batch 8 (12)

`windows_security:4733`, `windows_security:4735`, `windows_security:4756`, `windows_security:4770`, `windows_security:4778`, `windows_security:4779`, `windows_security:4907`, `windows_security:5027`, `windows_security:5028`, `windows_security:6145`, `sysmon:4`, `sysmon:9`

### Batch 9 (7)

`sysmon:14`, `sysmon:15`, `sysmon:24`, `sysmon:26`, `sysmon:27`, `sysmon:28`, `sysmon:255`

## Coverage Check

Run this check whenever the batch manifest changes. It must report `catalog=108`, `planned=108`, `missing=0`, `extra=0`, and `duplicates=0`.

```powershell
node -e "const fs=require('fs');const catalog=require('./data/event_ids.json').map(x=>x.source+':'+x.id);const text=fs.readFileSync('./docs/superpowers/plans/2026-07-21-event-page-geo-migration.md','utf8');const planned=[...text.matchAll(/`((?:windows_security|sysmon):\d+)`/g)].map(x=>x[1]);const counts=new Map(planned.map(x=>[x,planned.filter(y=>y===x).length]));const missing=catalog.filter(x=>!counts.has(x));const extra=[...counts.keys()].filter(x=>!catalog.includes(x));const duplicates=[...counts].filter(([,n])=>n>1);console.log({catalog:catalog.length,planned:planned.length,missing,extra,duplicates});if(missing.length||extra.length||duplicates.length||planned.length!==catalog.length)process.exit(1)"
```

The five pilot keys appear once in the introductory line and the 103 remaining keys appear once in the batches.

## Completion Gate

After Batch 9:

- change `docs/PROGRESS.md` to `Enriched: 108 / 108`;
- make enriched fields mandatory for every repository event in the semantic test;
- verify the static export still contains all event routes and public JSON exports;
- run production verification against representative Windows Security and Sysmon pages;
- complete a final manual audit for source accuracy, mobile overflow, visible FAQ/JSON-LD parity, canonical URLs, and query assumptions.
