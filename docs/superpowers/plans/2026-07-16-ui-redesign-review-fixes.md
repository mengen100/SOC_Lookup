# UI Redesign Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve the two layout findings from the UI branch review and remove unused verification tooling before merging.

**Architecture:** Keep the existing Next.js routes and Tailwind styling. Make the root body a vertical flex container so `main` owns remaining viewport height, and split the desktop homepage hero into a primary lookup column and an unframed common-investigations aside that links to existing guides.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Node test runner.

## Global Constraints

- Do not add routes, event content, schema changes, or runtime dependencies.
- Preserve static export behavior and current search behavior.
- Keep all reader-facing copy in English.

---

### Task 1: Add UI layout regression contracts

**Files:**
- Create: `tests/ui-layout.test.ts`
- Modify: `tests/all.test.ts`

- [ ] Add failing checks for the full-height root layout and existing-route common-investigation links.
- [ ] Run `npm.cmd test` and confirm the new checks fail for the missing layout.

### Task 2: Fix the root layout and homepage composition

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] Make the body a vertical flex container and let `main` consume remaining height.
- [ ] Add a desktop common-investigations aside using existing Windows Security and Sysmon guide routes.
- [ ] Run `npm.cmd test` and confirm all checks pass.

### Task 3: Remove unused Playwright tooling and verify

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Remove `@playwright/test`, which has no configuration, specs, or package script.
- [ ] Run `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run build`.
- [ ] Inspect homepage and timestamp converter at desktop and mobile viewport sizes.
- [ ] Commit, merge into `master`, rerun verification on the merged result, and push `master`.
