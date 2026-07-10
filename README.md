# SOC Event Lookup

Static Windows Security / Sysmon event ID reference for SOC analysts.

## What Is Implemented

- Next.js App Router static site with local JSON data.
- `/windows-events/4625/` and `/sysmon-events/1/` render complete sample event records.
- `/windows-events/` and `/sysmon-events/` list all 108 skeleton entries with category filters.
- Unfinished skeleton entries are visible but not linked, avoiding empty detail pages.
- Detail pages include canonical metadata, TechArticle JSON-LD, related event pivots, source links, KQL, SPL, and sample log blocks.
- `sitemap.xml` and `robots.txt` are generated from static routes and complete event records.
- Data validation fails the build when full event JSON misses required schema fields.
- Lightweight browser tools:
  - timestamp converter
  - simple Sigma selection to KQL/SPL converter
  - CVSS 3.1 base score calculator

## Trade-Offs

- The core MVP is static and file-driven. There is no database, login, API server, or live third-party lookup.
- Code blocks use plain styled `<pre>` blocks for now instead of Shiki. This avoids extra bundle and build complexity for the first data-backed release.
- CVSS 4.0 is visible as a planned mode, but it does not emit a score yet. The MVP only scores CVSS 3.1 because a partial 4.0 formula would be misleading.
- npm reported two moderate advisories during install. I did not force dependency upgrades because that can introduce breaking changes in the Next.js toolchain.

## Commands

```bash
npm run test
npm run validate:data
npm run typecheck
npm run build
npm run dev
```

## Local Development

Use the development server while editing:

```bash
npm run dev
```

Then open `http://127.0.0.1:3000`.

For production-style static preview, build first and serve the exported `out/` directory:

```bash
npm run build
npx serve out
```

Do not use `npm run start` for this project. The app is configured with `output: "export"`, and `next start` is not supported for that mode.

## Data Layout

```text
data/
  event-page-schema.json
  event_ids.json
  events/
    windows-security/
      4625.json
    sysmon/
      1.json
```

`event_ids.json` is the skeleton index. Detail pages are generated only from JSON files under `data/events/`.

## Deployment

The project uses `output: "export"` and is suitable for Vercel or static hosting. Run `npm run build`; the exported site is written to `out/`.
