# Event Content Authoring

Add new completed event pages by creating JSON files under `data/events/`.

## Source Folders

- Windows Security: `data/events/windows-security/{id}.json`
- Sysmon: `data/events/sysmon/{id}.json`

The `source` field inside the JSON must use the schema value:

- `windows_security`
- `sysmon`

## Required Fields

Every completed event JSON must satisfy `data/event-page-schema.json`. Important required fields include:

- `id`
- `source`
- `category`
- `name`
- `priority`
- `applicable_version`
- `last_reviewed`
- `definition`
- `trigger_scenarios`
- `key_fields`
- `false_positives`
- `related_event_ids`
- `detection_notes`
- `sample_log`
- `source_url`

Optional fields such as `kql_snippet`, `spl_snippet`, and `attck_mapping` should be included when reliable.

## Quality Rules

- Prefer official documentation links for `source_url`.
- Keep `last_reviewed` current when changing the interpretation.
- Use `related_event_ids` for practical investigation pivots, not loose keyword similarity.
- Do not create placeholder detail JSON for unfinished content. Keep unfinished entries only in `data/event_ids.json`.
- Run `npm run validate:data` before deploying.

## URL Rules

- `source: "windows_security"` becomes `/windows-events/{id}/`.
- `source: "sysmon"` becomes `/sysmon-events/{id}/`.

The site discovers completed detail pages from files in `data/events/`, not from the skeleton list.
