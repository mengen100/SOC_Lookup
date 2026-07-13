# Production Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the verified static site to Cloudflare Pages Free on `soceventlookup.com`, validate the canonical production output, and prepare Search Console submission without committing credentials.

**Architecture:** Keep deployment configuration build-time and environment-driven through `NEXT_PUBLIC_SITE_URL`. Add a small production verifier with dependency-injected HTTP access so its behavior is unit-testable, then use that verifier against the real Cloudflare Pages deployment after DNS and TLS activate. Record the account steps and launch evidence in a focused runbook.

**Tech Stack:** Next.js 15 static export, TypeScript, Node test runner, Cloudflare Pages Free, GitHub, Google Search Console

## Global Constraints

- Canonical origin: `https://soceventlookup.com`
- Canonical hostname: apex domain; permanently redirect `www` to apex.
- Production branch: `master` from `mengen100/SOC_Lookup`.
- Never commit credentials, tokens, payment details, ownership TXT values, or generated Cloudflare account metadata.
- Domain registration is complete at USD 10.46 per year; Pages hosting must remain on the Free plan.
- Do not submit a sitemap until production verification passes.

---

### Task 1: Production Verification Command

**Files:**
- Create: `lib/production-verification.ts`
- Create: `scripts/verify-production.ts`
- Create: `tests/production-verification.test.ts`
- Modify: `tests/all.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: an HTTPS origin and a fetch-compatible function.
- Produces: `verifyProductionSite(origin, fetchImpl)` and the `npm run verify:production -- <origin>` command.

- [ ] **Step 1: Write failing verifier tests**

Test a successful response set and failures for incorrect canonical origin, incorrect sitemap count, old Vercel hostname leakage, missing JSON-LD types, broken representative routes, and an invalid non-HTTPS origin. Use an in-memory fetch stub; tests must not access the network.

- [ ] **Step 2: Run the test suite and confirm the new module is missing**

Run:

```powershell
npm.cmd test
```

Expected: TypeScript compilation fails because `../lib/production-verification` does not exist.

- [ ] **Step 3: Implement the verifier**

`verifyProductionSite` must request:

```text
/
/windows-events/4625/
/sysmon-events/1/
/tools/timestamp-converter/
/tools/sigma-converter/
/tools/cvss-calculator/
/robots.txt
/sitemap.xml
/api/events/index.json
/api/events/windows-security/4625.json
```

It must return a result object containing `passed`, `checks`, and `errors`. Verify HTTP 200, canonical and Open Graph origins, homepage `WebSite`, event `TechArticle` and `BreadcrumbList`, exactly 118 sitemap URLs, a canonical sitemap line in robots.txt, no `soc-event-lookup.vercel.app` leakage, and valid event index JSON.

The CLI must validate one positional HTTPS origin, print each failed check, and exit non-zero on failure.

- [ ] **Step 4: Add the command and test registration**

Add this script to `package.json`:

```json
"verify:production": "ts-node --compiler-options \"{\\\"module\\\":\\\"commonjs\\\"}\" scripts/verify-production.ts"
```

Import `./production-verification.test` from `tests/all.test.ts`.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm.cmd test
npm.cmd run typecheck
git diff --check
```

Expected: all tests pass, TypeScript exits zero, and no whitespace errors are reported.

Commit:

```powershell
git add lib/production-verification.ts scripts/verify-production.ts tests/production-verification.test.ts tests/all.test.ts package.json
git commit -m "feat: add production launch verifier"
```

---

### Task 2: Launch Runbook And Build Proof

**Files:**
- Create: `docs/launch-runbook.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: the command from Task 1 and the production architecture from the design specification.
- Produces: a repeatable deployment, DNS, verification, and Search Console checklist.

- [ ] **Step 1: Document Cloudflare Pages project settings**

Record the GitHub repository, production branch, build command, output directory, environment variable, apex canonical policy, `www` redirect, and the rule that both hostnames must resolve through the Cloudflare zone.

- [ ] **Step 2: Document purchase and DNS checkpoints**

Include explicit blanks for non-sensitive evidence only: registration date, registrar, initial cost, renewal cost, deployment URL, deployed commit, DNS active time, TLS active time, production verification time, Search Console verification date, and sitemap submission date. State that payment data and DNS ownership values must never be entered into the file.

- [ ] **Step 3: Document verification commands**

Include:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://soceventlookup.com"
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run verify:production -- https://soceventlookup.com
```

- [ ] **Step 4: Build with the production origin**

Run the first three commands above, then inspect `out/index.html`, `out/sitemap.xml`, and `out/robots.txt`. Expected: production-domain canonical metadata, 118 sitemap entries, and no old Vercel hostname.

- [ ] **Step 5: Update README and commit**

Link the launch runbook from README and state that production verification is required after every domain or deployment-origin change.

Commit:

```powershell
git add docs/launch-runbook.md README.md
git commit -m "docs: add production launch runbook"
```

---

### Task 3: Cloudflare Pages Deployment And Domain Binding

**Files:**
- Modify only if needed after platform inspection: `docs/launch-runbook.md`

**Interfaces:**
- Consumes: the authenticated Cloudflare account that owns the domain, GitHub authorization, the pushed `master` commit, and the approved production origin.
- Produces: an active Cloudflare Pages deployment with the apex and `www` hostnames configured.

- [ ] **Step 1: Inspect the Cloudflare account**

Confirm the active Cloudflare account owns `soceventlookup.com`. Do not expose account identifiers or billing information in project files.

- [ ] **Step 2: Create the Pages project**

Connect GitHub, select `mengen100/SOC_Lookup`, choose `master`, use `npm run build`, and set the build output directory to `out`.

- [ ] **Step 3: Configure the production origin**

Set `NEXT_PUBLIC_SITE_URL` to `https://soceventlookup.com` for Production and Preview, then deploy the current pushed commit to its `pages.dev` address.

- [ ] **Step 4: Verify the Pages deployment**

Run the automated production verifier against the `pages.dev` deployment while checking that generated metadata still uses `https://soceventlookup.com`. Fix any build problem before attaching the domain.

- [ ] **Step 5: Attach both hostnames**

Attach `soceventlookup.com` and `www.soceventlookup.com`. Configure a Cloudflare permanent redirect from `www` to the HTTPS apex hostname.

- [ ] **Step 6: Verify platform state**

Confirm Cloudflare reports active custom domains and TLS, the correct production deployment, and the correct canonical domain.

---

### Task 4: Production Acceptance And Search Console Handoff

**Files:**
- Modify: `docs/launch-runbook.md`

**Interfaces:**
- Consumes: the active production deployment and Task 1 verifier.
- Produces: recorded launch evidence and a submitted production sitemap.

- [ ] **Step 1: Run automated production verification**

Run:

```powershell
npm.cmd run verify:production -- https://soceventlookup.com
```

Expected: every check passes and the command exits zero.

- [ ] **Step 2: Run browser smoke tests**

Verify homepage search, collection filtering, event navigation, header search, tools dropdown, timestamp converter, Sigma converter, and CVSS calculator at desktop and mobile widths.

- [ ] **Step 3: Verify redirects and error behavior**

Confirm HTTP and `www` permanently redirect to the HTTPS apex hostname and an unknown event path returns 404.

- [ ] **Step 4: Configure Search Console**

The user authenticates to Google Search Console. Add a Domain property for `soceventlookup.com`, add the displayed DNS TXT record through the domain DNS provider, verify ownership, and submit `/sitemap.xml`.

- [ ] **Step 5: Request representative indexing**

Inspect and request indexing for `/`, `/windows-events/4625/`, `/windows-events/4688/`, `/sysmon-events/1/`, and `/tools/timestamp-converter/`.

- [ ] **Step 6: Record non-sensitive evidence and commit**

Update the runbook dates, deployed commit, and verification outcomes. Do not record ownership tokens or account identifiers.

Run:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
git diff --check
```

Commit:

```powershell
git add docs/launch-runbook.md
git commit -m "docs: record production launch verification"
```

Push all launch commits normally to `origin master` after local verification passes.
