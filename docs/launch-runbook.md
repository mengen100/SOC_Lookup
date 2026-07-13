# Production Launch Runbook

## Production Identity

| Setting | Value |
| --- | --- |
| Site name | SOC Event Lookup |
| Canonical origin | `https://soceventlookup.com` |
| Secondary hostname | `www.soceventlookup.com` redirects to apex |
| Registrar and DNS | Cloudflare Registrar and Cloudflare DNS |
| Hosting | Cloudflare Pages Free |
| Repository | `mengen100/SOC_Lookup` |
| Production branch | `master` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Environment variable | `NEXT_PUBLIC_SITE_URL=https://soceventlookup.com` |

The domain was registered on 2026-07-13 for USD 10.46 per year. The checkout screen displayed the same USD 10.46 renewal price. Do not store invoices, payment details, account identifiers, API tokens, or DNS ownership tokens in this repository.

## Cloudflare Pages Setup

1. Open **Workers & Pages** in the Cloudflare dashboard.
2. Create a Pages application by importing `mengen100/SOC_Lookup` from GitHub.
3. Select `master` as the production branch.
4. Set the build command to `npm run build`.
5. Set the output directory to `out`.
6. Add `NEXT_PUBLIC_SITE_URL` with value `https://soceventlookup.com` to both Production and Preview environments.
7. Deploy and verify the generated `pages.dev` URL before attaching the purchased domain.
8. Add `soceventlookup.com` as the primary custom domain.
9. Add `www.soceventlookup.com`, then configure a permanent redirect from `www` to the HTTPS apex origin.
10. Wait until Cloudflare reports active DNS and TLS for both hostnames.

## Local Release Gate

Run from PowerShell before pushing a release-affecting change:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://soceventlookup.com"
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Inspect the export:

```powershell
Select-String -Path out/index.html,out/sitemap.xml,out/robots.txt -Pattern "soc-event-lookup.vercel.app"
```

Expected: no matches. `out/sitemap.xml` must contain 118 `<url>` entries and `out/robots.txt` must reference `https://soceventlookup.com/sitemap.xml`.

## Production Acceptance

After DNS and TLS are active:

```powershell
npm.cmd run verify:production -- https://soceventlookup.com
```

The command verifies representative pages, canonical and Open Graph URLs, structured data, robots.txt, all 118 sitemap URLs, the 108-event JSON index, and a representative event JSON export. Every check must pass before search engine submission.

Manually confirm:

- HTTP redirects to HTTPS.
- `www.soceventlookup.com` permanently redirects to `https://soceventlookup.com`.
- An unknown event ID returns 404.
- Homepage search, collection filters, header search, and the tools dropdown work.
- Timestamp, Sigma, and CVSS tools work at desktop and mobile widths.

## Launch Evidence

Record only non-sensitive operational evidence:

| Evidence | Status |
| --- | --- |
| Pages project | `soc-event-lookup` deployed on 2026-07-13 |
| Production `pages.dev` URL | `https://soc-event-lookup.pages.dev` |
| Deployed commit | `5b3f126` |
| Apex DNS and TLS | Active on 2026-07-13 |
| `www` redirect | Active 301 to apex with path and query preserved |
| Production verifier | Passed against `pages.dev` and `https://soceventlookup.com` on 2026-07-13 |
| HTTP and 404 checks | HTTP redirects to HTTPS; unknown routes return 404 |
| Search smoke test | Homepage and detail-page header search passed |
| Search Console Domain property | Not configured |
| Sitemap submission | Not submitted |

## Search Console

After production acceptance passes:

1. Add a Domain property for `soceventlookup.com` in Google Search Console.
2. Add the provided TXT ownership record in Cloudflare DNS without recording its value in this repository.
3. Verify ownership and submit `https://soceventlookup.com/sitemap.xml`.
4. Inspect and request indexing for `/`, `/windows-events/4625/`, `/windows-events/4688/`, `/sysmon-events/1/`, and `/tools/timestamp-converter/`.
5. Update only the status and date fields in this runbook.

## Rollback

If production validation fails, do not submit the sitemap. Fix the repository with a normal commit, let Cloudflare build the new `master`, and repeat the acceptance checks. Do not force-push or rewrite production history.
