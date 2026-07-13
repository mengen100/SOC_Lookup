# Production Launch Design

## Objective

Launch SOC Event Lookup on its permanent `.com` domain using Cloudflare Pages Free, with one canonical hostname, reproducible build configuration, verified crawl metadata, and a documented Search Console handoff.

## Domain Decision

`soceventlookup.com` was registered through Cloudflare Registrar for USD 10.46 per year. The registrar displayed the same USD 10.46 renewal price at checkout. Domain registration is the only required recurring launch cost; Cloudflare Pages hosting remains on the Free plan.

## Hosting Architecture

- GitHub repository: `mengen100/SOC_Lookup`
- Production branch: `master`
- Hosting provider: Cloudflare Pages Free
- Build command: `npm run build`
- Output directory: `out`
- Production environment variable: `NEXT_PUBLIC_SITE_URL=https://soceventlookup.com`
- Canonical origin: `https://soceventlookup.com`
- Secondary hostname: `www.soceventlookup.com`

The apex hostname is the canonical production hostname. Cloudflare must permanently redirect `www.soceventlookup.com` to `https://soceventlookup.com`. Both hostnames must resolve through the Cloudflare zone so neither returns a platform error.

Preview deployments may retain Cloudflare-generated `pages.dev` URLs, but generated canonical URLs, structured data, sitemap entries, and machine-readable event URLs must continue to point to the production origin.

## Deployment Flow

1. Authenticate to Cloudflare using the account that owns `soceventlookup.com`.
2. Create a Pages project by connecting the GitHub repository `mengen100/SOC_Lookup`.
3. Select `master` as the production branch.
4. Configure `npm run build` as the build command and `out` as the output directory.
5. Configure `NEXT_PUBLIC_SITE_URL=https://soceventlookup.com` for production and preview builds.
6. Deploy the current `master` commit.
7. Attach the apex and `www` hostnames and configure the permanent redirect.
8. Wait for DNS verification and TLS certificate issuance.
9. Run the launch verification checklist before submitting the site to search engines.

## Launch Verification

The launch is acceptable only when all of the following pass:

- `https://soceventlookup.com/` returns HTTP 200 over a valid TLS connection.
- HTTP and `www` requests permanently redirect to the canonical HTTPS apex hostname.
- Representative routes return 200: `/windows-events/4625/`, `/sysmon-events/1/`, and all three tool routes.
- An unknown event route returns 404.
- Search works on the homepage, collection pages, and header search.
- Canonical URLs, Open Graph URLs, `WebSite`, `TechArticle`, and `BreadcrumbList` data use the production origin.
- `/robots.txt` references `https://soceventlookup.com/sitemap.xml`.
- `/sitemap.xml` contains 118 canonical production URLs.
- `/api/events/index.json` and representative event JSON exports load successfully.
- The production HTML contains no references to `soc-event-lookup.vercel.app`.
- Mobile and desktop smoke tests show no broken navigation or overlapping content.

## Search Engine Handoff

After launch verification:

1. Create a Google Search Console Domain property for `soceventlookup.com`.
2. Add the provided DNS TXT ownership record and wait for verification.
3. Submit `https://soceventlookup.com/sitemap.xml`.
4. Inspect and request indexing for the homepage, Windows Event 4625, Windows Event 4688, Sysmon Event 1, and one tool page.
5. Record verification status and submission date in the launch runbook.

Search Console verification and sitemap submission require the user's authenticated Google session. They do not require adding Google credentials or tokens to the repository.

## Safety And Rollback

- Never store Cloudflare, registrar, GitHub, or Google credentials in project files.
- Do not expose payment details in logs, screenshots, commits, or reports.
- Do not attach the apex domain before a successful `pages.dev` production deployment exists.
- If production validation fails, keep the domain attached but do not submit the sitemap. Fix the repository, deploy a new immutable commit, and repeat verification.
- Do not force-push or rewrite `master`; every deployment fix is a normal commit.

## Deferred Work

Analytics, advertising, cookie consent, newsletter collection, paid acquisition, and additional editorial routes remain outside this launch pass. They require separate product and privacy decisions after the stable production site is measurable in Search Console.
