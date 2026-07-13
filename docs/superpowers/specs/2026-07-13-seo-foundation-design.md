# SEO Foundation Design

## Objective

Prepare SOC Event Lookup for initial indexing while the permanent domain is still undecided. Improve long-tail relevance, canonical consistency, crawl discovery, structured data, and social metadata without changing the event data schema or adding new routes.

## Current State

The site statically exports 108 event guides and already provides canonical URLs on event and collection pages, a root sitemap, robots.txt, and `TechArticle` JSON-LD. The current implementation repeats the Vercel URL in several modules, omits tool detail pages from the sitemap, assigns the current build time to unchanged static pages, and does not provide breadcrumbs, homepage canonical metadata, or social metadata.

## Site URL Strategy

Create one shared site configuration module. Its site URL will use `NEXT_PUBLIC_SITE_URL` when provided and otherwise fall back to `https://soc-event-lookup.vercel.app`.

The configured URL must be normalized by removing a trailing slash. Canonical URLs, sitemap entries, robots.txt, JSON exports, and JSON-LD must all use this shared value.

When a permanent domain is selected, deployment requires setting `NEXT_PUBLIC_SITE_URL=https://example.com` and rebuilding the static export. No event records or route modules should require manual URL replacement.

## Search Intent And Titles

Event pages will target explicit event lookup queries:

- Windows Security: `Windows Event ID {id}: {event name}`
- Sysmon: `Sysmon Event ID {id}: {event name}`

The existing root title template will append `| SOC Event Lookup`. The visible page title will include the same source and event ID phrasing so the `<title>`, H1, internal link context, and structured data describe the same subject.

Collection metadata will use direct descriptions focused on browsing Windows Security or Sysmon event IDs for SOC investigation. Descriptions must remain human-readable and must not become lists of repeated keyword variants.

## Canonical Metadata

Every indexable HTML route will declare a canonical URL:

- `/`
- `/windows-events/`
- `/sysmon-events/`
- Every completed event detail route
- `/tools/` and all three tool detail routes
- `/about/`
- `/privacy-policy/`
- `/disclaimer/`

The homepage canonical remains `/` even when the browser URL contains `?q=...`, preventing each search query from becoming a separate canonical page.

## Structured Data

### Homepage

Add `WebSite` JSON-LD with:

- `@context`: `https://schema.org`
- `@type`: `WebSite`
- `name`: `SOC Event Lookup`
- `url`: configured absolute homepage URL
- `description`: site description visible in metadata

Do not add `SearchAction`. Google retired the sitelinks search box visual feature, and the site does not need unsupported structured-data promises.

### Event Pages

Emit one JSON-LD `@graph` containing:

- The existing `TechArticle`
- A `BreadcrumbList`

The breadcrumb path is:

1. SOC Event Lookup
2. Windows Events or Sysmon Events
3. Event ID `{id}`

Render the same breadcrumb path visibly above the event header using ordinary crawlable links. Structured data must describe information that is also visible on the page.

`TechArticle` will retain `datePublished` and `dateModified` from `last_reviewed`, organization author, canonical URL, category, source, and SOC analysis context.

## Open Graph And Twitter Metadata

Set site-level defaults for:

- Open Graph type `website`
- Site name
- Title
- Description
- Canonical homepage URL
- Locale `en_US`
- Twitter card `summary`
- Matching title and description

Event pages will override Open Graph and Twitter title, description, URL, and type where supported.

An image is intentionally deferred until the product has a stable brand asset. The implementation must not generate a low-quality placeholder or imply that an image exists.

## Sitemap And Robots

The sitemap will include all indexable routes, including:

- Homepage
- Two event collections
- 108 event detail pages
- Tools overview
- Timestamp Converter
- Sigma Converter
- CVSS Calculator
- About
- Privacy Policy
- Disclaimer

Event `lastModified` values will continue to use each record's `last_reviewed` date. Static routes will omit `lastModified` until the repository has a reliable content modification date source. The sitemap must never assign the current build timestamp to unchanged pages.

robots.txt will allow crawling and point to the sitemap using the shared site URL.

## Internal Linking

Keep existing event cards and related-event links. Add visible event breadcrumbs as the new hierarchy links. Do not create automatically generated keyword pages, duplicate category routes, or thin FAQ sections during this phase.

## Validation And Tests

Add SEO-focused tests that verify:

- Site URL fallback and trailing-slash normalization
- Windows and Sysmon event title formats
- Homepage `WebSite` JSON-LD
- Event `TechArticle` and `BreadcrumbList` graph contents
- Absolute URLs use the shared site configuration
- Sitemap contains all static, tool, and event routes
- Static sitemap entries do not receive build-time `lastModified` values
- robots.txt references the shared sitemap URL

Tests for new helper behavior must be written and observed failing before implementation. Final verification requires `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run build`.

## Deployment Handoff

Domain setup is outside this implementation pass. After a domain is selected, the launch workflow will be documented and walked through with the user:

1. Add the domain to the hosting provider.
2. Configure the registrar DNS records requested by the host.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
4. Rebuild and deploy.
5. Confirm canonical URLs, robots.txt, and sitemap.xml use the final domain.
6. Add the domain property to Google Search Console.
7. Submit `/sitemap.xml` and inspect representative event URLs.

## Deferred Work

- Permanent domain purchase and DNS configuration
- Google Search Console ownership verification
- Analytics integration
- Advertising scripts or consent management
- Branded Open Graph image
- New keyword, category, FAQ, or editorial routes

These items require separate product or deployment decisions and are not part of the SEO foundation change.

## References

- Google Search Central, title links: https://developers.google.com/search/docs/appearance/title-link
- Google Search Central, breadcrumb structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google Search Central, canonical URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central, sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Next.js metadata and Open Graph images: https://nextjs.org/docs/15/app/getting-started/metadata-and-og-images
