# SOC Event Lookup: Agent Handoff (2026-07-13)

This replaces the previous handoff note. It was written after re-inspecting the actual
repository state — do not trust any prior chat summary about "12 files committed and
done"; that commit happened, but a stricter test landed on top of it afterward and
changed what "done" requires. Read this whole file before touching content.

The working directory is `C:\Users\Mengen Cang\Documents\SOC_Website`.

## Project purpose

Next.js static-export SOC event-ID knowledge base for Windows Security and Sysmon
event IDs. Static event detail pages, category lists, a few analyst tools, SEO
metadata, and machine-readable JSON exports.

- Static export: `output: "export"`. Dev: `npm run dev`. Build/preview: `npm run build`
  then `npx serve out`. Never add `npm run start` — unsupported for static export.
- PowerShell blocks bare `npm`; always call `npm.cmd`.
- Event content: `data/events/windows-security/{id}.json`, `data/events/sysmon/{id}.json`.
- Skeleton of all 108 event IDs (with priority P1/P2/P3): `data/event_ids.json`.
- Schema: `data/event-page-schema.json` (draft-07). A file only "counts" as a
  completed event if it exists under `data/events/...` — the skeleton list alone
  does not create a page.
- `docs/PROGRESS.md` is the canonical human checklist: `done` / `needs-rework` / `pending`.
  Update it in the same commit as any content change.

## THE CRITICAL FACT: the quality bar just got stricter, and most "done" records now fail it

`tests/events.test.ts` has a new test (not present when most of the older P1 batch
was written) starting at line ~104:

```ts
test("requires concrete detection values beyond ATT&CK technique identifiers", () => {
  const concreteValuePattern = /0x[0-9a-f]+|\b(?:type|port|threshold|mask|window|timeout)\s*[=:]?\s*\d+|HK(?:LM|CU)\\|\\(?:Users|Windows|ProgramData|Temp|AppData)\\/i;
  // strips T#### ATT&CK IDs out of detection_notes, then requires the pattern above
  // to match what's left. Fails the whole test if any completed event doesn't match.
});
```

Running `npm.cmd test` right now (verified moments ago) gives **14 pass / 1 fail**,
and the failing test lists **32 event records that are currently marked `done` in
docs/PROGRESS.md but do not satisfy this new pattern**:

```
windows_security: 1102, 4103, 4104, 4625, 4672, 4688, 4689, 4698, 4699, 4702,
                  4719, 4722, 4723, 4725, 4726, 4728, 4738, 4765, 4766, 4767,
                  4769, 5140
sysmon: 1, 2, 3, 5, 6, 7, 8, 10, 11, 22, 25
```

Important nuance: some of these (4726, 4728, 4766, 4767, sysmon 2/5/6/7/25) were
just rewritten in the last commit (`b8ceda1`) specifically to meet the *old*
detection-notes-standard.md bar (named concrete field/value + causal reasoning).
Reading their actual `detection_notes` text (I did — see below), several of them
plainly DO name concrete values (e.g. sysmon/25: `Type = "Image is replaced"`,
sysmon/2: `CreationUtcTime`/`PreviousCreationUtcTime`, windows_security/4767:
`Subject\Logon ID`, `Target Account`) — they just don't happen to contain the
literal substrings the new regex looks for (a `0x..` hex, a `type:123`-style
digit pattern, an `HKLM\`/`HKCU\` path, or one of those four `\Foldername\`
path fragments). **This means the new test is a stricter, narrower proxy for
the real standard, not a perfectly accurate one** — do not chase the regex
mechanically by stuffing in a fake hex code or irrelevant registry path just to
turn the test green. Fix content so it's actually correct AND matches the
pattern; if a record is genuinely correct without matching, that's a signal the
test itself may need a follow-up (flag it, don't silently game it).

**Do this first, before writing any new event content:**

1. Re-read `docs/detection-notes-standard.md` (unchanged, still the authoritative
   human standard — 4-item self-check list at the bottom).
2. For all 32 flagged records, read the current `detection_notes` value and decide,
   record by record: does it already satisfy the *human* standard (name a concrete
   observable value + causal reasoning) but just miss the regex? Or is it genuinely
   generic/weak (e.g. windows_security/4625's current text: "analyze aggregation and
   sequence... establish baselines... apply fixed thresholds" — this one IS weak,
   no concrete value at all, matches the "before revision" negative example already
   documented for 4740)?
3. Rewrite whichever ones are genuinely weak with real field names/values (same
   method as the last batch — see "Research method" below).
4. For ones that are already substantively correct but only miss the mechanical
   regex, decide the minimal honest fix: usually there IS a real concrete value you
   can surface that the regex would catch (a logon type number, an access mask in
   hex, a specific registry path) — add it rather than gaming the pattern. If you
   genuinely cannot find one because the underlying Windows event has no such field
   (this happened before with 4767 — Windows exposes no status/hex field, only
   identity fields), that is an acceptable exception, but say so explicitly in your
   report; don't just leave it failing silently.
5. Do NOT modify the test's regex to make failures disappear unless the user
   explicitly asks for that — that is a "schema/data-structure" — style decision
   change and one of the standing stop conditions below.

## Standing task instructions (still in force, unless the user says otherwise)

The user's original instruction, which this handoff continues under:

- Work through **all** remaining event IDs in `data/event_ids.json`, priority
  **P2 before P3**, in batches of roughly 10-15.
- For each batch: write real detection_notes and full record content (not
  placeholders), run the self-check against `docs/detection-notes-standard.md`,
  run `npm.cmd test` and `npm.cmd run build`, update `docs/PROGRESS.md`, then
  commit **locally only**.
- **Binding constraint: 只commit不push.** Never run `git push`, never add a
  git remote. Local commits only, always. No remote is configured
  (`git remote -v` returns nothing) — do not fabricate or add one even if you
  think it would help; if the user later supplies a private repo URL and
  explicitly authorizes it, only then add `origin` and push, and report the
  URL + commit SHA when you do.
- Proceed autonomously without pausing for check-ins, EXCEPT stop and ask the
  user first if you hit any of these five conditions:
  (a) a change to the JSON schema or data structure,
  (b) a new feature or route,
  (c) SEO/ads/deployment changes,
  (d) genuine ambiguity in what the reference standard (4768/4794 examples in
      detection-notes-standard.md) actually requires,
  (e) any git push/auth/permission problem.

## Immediate next step (pick this up first)

Given the new test, the most sensible order is:

1. **Fix the 32 flagged `done`/regression records** (see above) before starting
   any new P2/P3 content — the repo's test suite is currently red and that
   should be resolved before adding more surface area. Batch these in groups
   of ~10-15 the same way prior batches were done.
2. Then continue the original plan: remaining **P2** IDs not yet done —
   `sysmon: 12, 13, 16, 17, 18, 19, 20, 21, 23, 29` and
   `windows_security: 4649, 4715, 4716, 4780, 4964, 5030, 5035, 5038, 5376,
   5377, 5827, 5828` (confirmed via `data/event_ids.json` — none of these 22
   have a file under `data/events/` yet; all currently `pending` in PROGRESS.md).
3. Then all **P3** IDs (35 total, currently `pending`):
   `sysmon: 4, 9, 14, 15, 24, 26, 27, 28, 255`;
   `windows_security: 4770, 4778, 4779, 4700, 4701, 4670, 4729, 4733, 4735,
   4756, 4907, 4608, 4609, 4610, 4611, 4612, 4614, 4621, 4675, 4692, 4693,
   4713, 4714, 5027, 5028, 6145`.

## Research method (how the last batch was done — replicate this)

For each event ID, find the *real* field names and *real* observable values —
do not invent numbers or field names:

- Check Microsoft Learn's official event-ID documentation for the exact field
  list (e.g. confirm whether a "status"/"failure code" field even exists before
  writing about one — 4766 and 4767 both turned out to expose only identity
  fields, no status codes; a prior draft had fabricated `0x5`/`0x57` codes and
  a nonexistent "Caller Computer" field, both had to be removed).
- Check SigmaHQ rules and well-known published detections (e.g. Splunk's
  "Windows Multiple Accounts Deleted" rule, used for 4726) for realistic
  thresholds — attribute them, don't assert a number as universal fact if it's
  really one vendor's rule of thumb.
- Prefer Sysmon's own field names verified against `data/events/sysmon/1.json`
  (a clean reference) — a previous draft for sysmon/25 wrongly used
  "TamperingType"/"TargetImage" instead of the real field names "Type"/"Image".
- Get the ATT&CK technique ID *and* the precise sub-technique name right — don't
  default to a generic parent technique when a specific sub-technique fits
  better (4706 was wrongly mapped to "Domain Trust Discovery" instead of
  "Domain Policy Modification: Trust Modification" T1484.002; 4766 was
  under-mapped to generic T1098 instead of T1134.005 SID-History Injection).

Reference-quality examples worth re-reading before writing new content:
`data/events/windows-security/4768.json`, `4794.json`, `4732.json`, `4740.json`,
and `data/events/sysmon/1.json`.

## Content quality contract

Read `docs/detection-notes-standard.md` before authoring or fixing any event.
Core rule: `detection_notes` must name at least one concrete, observable field
value (status code, hex access mask, encryption type, port, timeout threshold,
registry path, or equivalent) and causally explain why that specific value
indicates an attack technique rather than normal activity. A trailing list of
ATT&CK IDs alone is not sufficient — the automated tests check for this
mechanically (see the two tests in `tests/events.test.ts` around line ~85 and
~104) but passing them is necessary, not sufficient. Manually self-check against
the 4-item list at the bottom of detection-notes-standard.md before marking
anything `done`.

## Working-tree hygiene — do not touch these

- `data.zip` and `tests.zip` (untracked, in repo root) were created by the user
  for their own manual review. Do not edit, delete, stage, or commit them.
- Run `git status --short` before editing anything, so you don't clobber
  in-progress user work you don't recognize.
- Current actual git status as of this handoff:
  ```
   M docs/PROGRESS.md      (uncommitted edits from a prior session marking many
                             records back to needs-rework — see below)
   M tests/events.test.ts  (contains the new stricter test described above)
  ?? data.zip
  ?? tests.zip
  ```
  The `docs/PROGRESS.md` and `tests/events.test.ts` modifications shown as `M`
  are **already in the working tree, uncommitted, from before this handoff** —
  they are NOT something you need to recreate. `docs/PROGRESS.md`'s uncommitted
  diff flips many previously-`done` windows_security/sysmon records to
  `needs-rework` (matching the 32 IDs the new test flags). This looks like a
  deliberate, correct edit reflecting the new test's findings — verify it lines
  up with the failing-test list above, and if so it's fine to keep and eventually
  include in your next commit once you've actually fixed the underlying content
  (don't commit PROGRESS.md saying `needs-rework` and then leave it that way
  forever — fix the content, then flip back to `done`).

## Validation commands (run after every batch, before every commit)

```powershell
npm.cmd test
npm.cmd run build
```

`npm.cmd run build` runs schema validation, JSON export, TypeScript checks,
static page generation, and static export — treat any failure there as
blocking, same as test failures.

Also confirm LF-only line endings on any JSON you write/rewrite (`.gitattributes`
enforces `text=auto eol=lf` plus `*.json text eol=lf`; the `fs_write`-equivalent
tool you use should already emit LF, but spot check with
`grep -cP "\r" <file>` → expect `0`).

## Architecture pointers

- Event loading/route helpers: `lib/events.ts`
- Windows detail route: `app/windows-events/[id]/page.tsx`
- Sysmon detail route: `app/sysmon-events/[id]/page.tsx`
- Detail-page renderer: `components/EventPage.tsx`
- JSON export generator: `scripts/export-json.ts`
- Schema validator: `scripts/validate-data.ts`
- Tests: `tests/events.test.ts`, `tests/export-json.test.ts`,
  `tests/validate-data.test.ts`, run together via `tests/all.test.ts`
  (`npm.cmd test`).

## GitHub / remote status

No remote is configured (`git remote -v` is empty). Do not add one. Local
commits only, per "只commit不push". If the user later supplies a private repo
URL and explicitly authorizes pushing, then add `origin`, push `master`, and
report the URL and commit SHA — not before.

## Session/environment note (not part of the content task, FYI only)

The user separately asked, in this session, to install two Claude Code
plugins: `superpowers` (obra/superpowers-marketplace — brainstorming/planning/
TDD workflow skills) and the official Anthropic `frontend-design` plugin. That
install was requested via `/plugin marketplace add` and `/plugin install` and
is unrelated to the SOC content task — it does not block or change anything
above. If those commands haven't been run yet in whatever session picks this
up, that's a separate, independent action item, not a blocker for content work.
