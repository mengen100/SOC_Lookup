---
name: source-grounded-soc-content
description: Create or revise SOC Windows Security and Sysmon event knowledge-base records only from verified primary sources. Use for every event JSON authoring or detection-notes revision in this repository.
---

# Source-Grounded SOC Content

## Non-Negotiable Rule

Do not invent field names, values, status codes, access masks, thresholds, registry paths, event semantics, or ATT&CK mappings. If a claim cannot be sourced, omit it or label it as a clearly attributed heuristic.

## Required Evidence Before Editing

For each event record, collect and retain in working notes:

1. Microsoft Learn or Sysinternals documentation for the event's actual fields and semantics.
2. MITRE ATT&CK page for the exact technique or sub-technique.
3. Optional SigmaHQ or published Splunk detection only when using its condition or threshold; name the publisher and state it is a starting point, not a universal threshold.

Use official Microsoft/Sysinternals documentation as the source for field names and values. Do not infer fields from similarly named events. For Sysmon, use the official Sysmon schema or event documentation.

## Writing Procedure

1. Read `docs/detection-notes-standard.md` and the JSON schema.
2. Verify fields and values against the collected source before writing them.
3. Select the narrowest justified ATT&CK sub-technique. Use a parent technique only if no justified sub-technique exists.
4. In `detection_notes`, state: observable field/value, why it supports the technique, and the next correlation action.
5. When using a threshold from a vendor rule, attribute it in the prose. Do not present it as a Microsoft or universal value.
6. Do not force a record to match a test regex with unrelated values. Flag a test limitation if the event lacks an applicable value.
7. Update `docs/PROGRESS.md` only after manual self-review and successful validation.

## Forbidden Shortcuts

- Template-only detection notes.
- `window=60`, `timeout=60`, or similar numbers without an identified source or explicit local-policy label.
- Guessed status codes, registry paths, or Sysmon fields.
- ATT&CK IDs appended solely to satisfy tests.
- Using sample-log values as evidence that a field or technique relationship is documented.

## Validation Gate

Before a local commit:

1. Manually compare every new or revised record with the cited source notes.
2. Run `npm.cmd test` and `npm.cmd run build`.
3. Confirm JSON is LF-only and schema-valid.
4. Commit locally only; never add a remote or push unless explicitly authorized.
