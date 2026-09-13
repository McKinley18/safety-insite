# Gemini Rebuild Instructions — Sentinel Safety / SafeScope Current State

## Purpose

This document is the authoritative rebuild and continuity instruction file for Gemini or any AI coding assistant. Its purpose is to rebuild, inspect, validate, and continue the Sentinel Safety application and SafeScope engine exactly from the current committed state.

Do not infer the app from older Desktop folders, recovery folders, archived folders, screenshots, or previous partial rebuilds. The only authoritative working app is the Git repository and structure described below.

---

## Current Authoritative Repo

Active local path:

```bash
/Users/mckinley/Sentinel_Safety
```

GitHub remote:

```bash
https://github.com/McKinley18/sentinel_safety.git
```

Current branch:

```bash
main
```

Current authoritative commit:

```bash
e9b0dce5d402c3e6a7504448f7c1b186aa425a4e
```

Current commit summary:

```bash
e9b0dce Organize SafeScope data artifacts
331969f Move business docs into project docs and remove root legacy files
1f5321d Remove minor unused cleanup artifacts
cc0256b Archive and remove legacy recovery folders
56dfe37 Remove duplicate root project documents
```

If rebuilding from scratch, clone the repository, check out `main`, and use the latest commit on `origin/main`. If the goal is to reproduce this exact checkpoint, verify that HEAD equals:

```bash
e9b0dce5d402c3e6a7504448f7c1b186aa425a4e
```

---

## Critical Rule

Do not use or restore from any legacy Desktop folder, old recovery folder, archive folder, or copied project folder unless the user explicitly asks for historical comparison.

The current app is not on the Desktop. The current app lives at:

```bash
~/Sentinel_Safety
```

The Desktop folder is only a convenience folder containing shortcuts to the active repo and working documents.

---

## Current Top-Level Project Structure

The active project should include these primary folders:

```text
backend/
frontend-next/
project-docs/
safescope-data/
scripts/
tools/
research/
test-data/
tests/
verification/
.github/
```

Important top-level files include:

```text
GEMINI.md
docker-compose.yml
docker-compose.offline.yml
verify-local.sh
.gitignore
.env.local
.env
.ci-rerun
```

---

## Application Architecture

Sentinel Safety is the application.

SafeScope is the proprietary safety intelligence / AI engine inside Sentinel Safety.

Current stack:

- Frontend: Next.js app in `frontend-next/`
- Backend: NestJS / TypeScript backend in `backend/`
- SafeScope engine: backend SafeScope and SafeScope v2 modules
- Data artifacts: `safescope-data/`
- Working project documentation: `project-docs/`
- Verification scripts: `scripts/` and backend scripts

---

## Current Frontend Location

Frontend path:

```bash
frontend-next
```

Primary frontend app routes live in:

```bash
frontend-next/app
```

Primary frontend components live in:

```bash
frontend-next/components
```

The frontend currently validates with:

```bash
cd ~/Sentinel_Safety
./scripts/verify-production-readiness.sh
```

This script includes the frontend production build.

---

## Current Backend Location

Backend path:

```bash
backend
```

Primary backend source lives in:

```bash
backend/src
```

SafeScope-related backend source is primarily under:

```bash
backend/src/safescope
backend/src/safescope-v2
backend/src/safescope-knowledge
backend/src/standards
backend/src/database
backend/scripts
```

---

## Current SafeScope Data Location

SafeScope generated and curated data artifacts are organized under:

```bash
safescope-data/source-intelligence
safescope-data/gauntlets
```

Do not move these back to the repo root.

---

## Current Project Documentation Location

All working documents are organized under:

```bash
project-docs
```

Main categories:

```text
00-index/
01-checkpoints/
02-architecture/
03-production-readiness/
04-safescope-engine/
05-source-intelligence/
06-validation-and-gauntlets/
07-ui-ux/
08-audits/
09-archive-reference/
10-business-launch/
```

Use these documents as the working blueprint for app direction, SafeScope architecture, production readiness, source intelligence, UI consolidation, audits, and business launch materials.

---

## Validation Command

After any rebuild, restore, cleanup, or code change, run:

```bash
cd ~/Sentinel_Safety
./scripts/verify-production-readiness.sh
```

Expected high-level result:

```text
✅ SafeScope production readiness verification passed.
✅ Frontend production build passed.
✅ Sentinel Safety production readiness verification passed.
```

Warnings about development auth bypass are acceptable only in local development:

```text
DEV_AUTH_BYPASS=true
NEXT_PUBLIC_DISABLE_AUTH=true
```

These are not production-safe settings.

---

## Current Verified Routes

The frontend production build currently includes these routes:

```text
/
 /about
 /actions
 /analytics
 /command-center
 /company
 /forgot-password
 /inspection
 /inspection-cover
 /inspection-quick
 /inspection-review
 /inspection-walkthrough
 /inspections
 /legal
 /login
 /profile
 /register
 /reports
 /safescope
 /safescope-knowledge
 /safety-calendar
 /settings
 /settings/workspace
 /unlock
```

---

## SafeScope Current Capability Baseline

SafeScope currently includes validated production-readiness checks for:

- Reasoning result contract
- Equipment-specific reasoning mode
- Archetype fallback reasoning mode
- Insufficient equipment context mode
- Reasoning snapshot equipment fields
- Reasoning snapshot summary contract
- Live equipment snapshot context
- Reasoning snapshot access control
- Supervisor validation workspace scope
- Standards scope-fit ranking

Current validated standards scope-fit examples:

```text
Surface MNM top citation: 30 CFR 56.14107
Underground MNM top citation: 30 CFR 57.14107
Coal underground top citation: 30 CFR 75.1722
Coal surface top citation: 30 CFR 77.400
```

---

## Cleanup Status

The repo has been cleaned. Legacy recovery folders, duplicate root docs, older root business docs, and loose SafeScope JSON data artifacts were removed or reorganized.

Do not recreate these old folders at the root:

```text
archive/
RECOVERY_WORKSPACE/
RECOVERY_WORKSPACE_BACKUP/
backend_broken_dependency_loop_20260510-194649/
CLEAN_REBUILD_20260512/
UI_RECOVERY_AUDIT/
UI_CONSOLIDATION_WORKSPACE/
MODULARIZATION_SELF_AUDIT/
backups/
local-validation-logs/
safescope-gauntlet-archive/
docs/
app/
components/
lib/
types/
database/
source-data/
```

Business docs now belong under:

```bash
project-docs/10-business-launch
```

SafeScope JSON artifacts now belong under:

```bash
safescope-data
```

---

## Gemini Operating Instructions

When using Gemini on this project:

1. Start in the active repo:

```bash
cd ~/Sentinel_Safety
```

2. Read this file first:

```bash
project-docs/00-index/GEMINI_REBUILD_CURRENT_STATE.md
```

3. Read the main Gemini instruction file:

```bash
GEMINI.md
```

4. Read the project docs index:

```bash
project-docs/00-index/PROJECT_DOCS_INDEX.md
```

5. Inspect the current code before making changes.

6. Do not deploy, push, or change production settings unless the user explicitly requests it.

7. Prefer local validation first.

8. After changes, run:

```bash
./scripts/verify-production-readiness.sh
```

9. Preserve the existing architecture:
   - Frontend remains in `frontend-next/`
   - Backend remains in `backend/`
   - Project docs remain in `project-docs/`
   - SafeScope data remains in `safescope-data/`

10. Do not resurrect legacy folders or older duplicated project copies.

---

## Rebuild From GitHub

To rebuild the current app on a new machine:

```bash
git clone https://github.com/McKinley18/sentinel_safety.git Sentinel_Safety
cd Sentinel_Safety
git checkout main
git pull origin main
git log --oneline -5
```

Then install and validate according to the package files and scripts.

Run:

```bash
./scripts/verify-production-readiness.sh
```

If validation passes, the app and SafeScope have been restored to the current working format.

---

## Current Desktop Convenience Folder

A Desktop convenience folder may exist at:

```bash
~/Desktop/Sentinel Safety Project
```

It should contain shortcuts to:

```text
ACTIVE_APP_REPO -> ~/Sentinel_Safety
project-docs -> ~/Sentinel_Safety/project-docs
safescope-data -> ~/Sentinel_Safety/safescope-data
GEMINI.md -> ~/Sentinel_Safety/GEMINI.md
```

This Desktop folder is not the source of truth. It is only a shortcut hub.

---

## Final Instruction

The source of truth is the Git repository at the current commit on `origin/main`.

Do not guess from memory. Read the repo, read the project docs, run validation, and preserve the current Sentinel Safety / SafeScope structure.
