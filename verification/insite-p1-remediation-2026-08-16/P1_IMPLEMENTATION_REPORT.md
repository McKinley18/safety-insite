# InSite P1 Remediation — Implementation Report

Date: 2026-08-16 · Branch `main` · HEAD unchanged throughout: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (no commits made, per operating rules).

## Summary

All four P1s are closed. Post-P0 228/228 baseline was established before any P1 edit (required gate), and reproduced again 228/228 after all edits. Two open P0 identity-coverage gaps were closed with new passing evidence. No P0 regressed. No new P0/P1 was found.

## Files changed (working tree, uncommitted per operating rules)

| File | Type | Change |
|---|---|---|
| `backend/src/auth/entitlements/entitlement.service.ts` | untracked (new, part of in-progress canonical migration) | +1 line: reject non-UUID `userId` before the grants query instead of letting Postgres throw |
| `frontend-next/lib/inspection/standardDisplay.ts` | tracked, modified | Relabeled `"Official standard text"` → `"HazLenz standard summary"`; added explanatory comment |
| `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` | tracked, modified | Added `StandardCitationHeading` (interactive expand/collapse with honest "not available" disclosure), replacing the static citation `<p>` |
| `frontend-next/lib/cloudReports.ts` | tracked, modified | Added `stripInlinePhotoData`, `parseCloudResponseBody`, `cloudErrorMessage`; removed body duplication in create/update; applied to all 5 response-handling call sites |
| `frontend-next/lib/auth.ts` | tracked, modified | `saveWorkspaceReport` now strips inline photo data before serializing |

Verification artifacts (new, under `verification/insite-p1-remediation-2026-08-16/`): `P1_BASELINE.md`, `P1_POST_P0_228_BASELINE.md`, `run_228_paced.mjs`, `P1_228_PACED_RESULT.json`, `P1_AUTH_ROOT_CAUSE.md`, `P1_AUTH_VERIFICATION.md`, `P1_STANDARDS_DATA_TRACE.md`, `P1_STANDARDS_INTEGRITY_CONTRACT.md`, `P1_STANDARDS_BROWSER_VERIFICATION.md`, `P1_REPORT_SAVE_ROOT_CAUSE.md`, `P1_REPORT_SAVE_CONTRACT.md`, `P1_REPORT_SAVE_VERIFICATION.md`, `identity_coverage_test.mjs`, `P1_IDENTITY_COVERAGE.md`, `P1_REGRESSION.md`, this file.

Created and removed within this phase (net zero, disposable verification aid): `frontend-next/app/dev-standards-preview/page.tsx` (a temporary `initiallyExpanded` prop on `StandardCitationHeading` was added then reverted alongside it).

## Working-tree preservation

All pre-existing uncommitted work (100+ modified tracked files, 15 deleted tracked files, 160+ untracked paths from the in-progress "canonical" architecture migration) was left untouched. Verified via `git hash-object` re-checks of every protected surface (V4 core, V5-C01–C05, P1-02, C05) immediately before closing this phase — all byte-identical to the Phase 0 baseline. No `git add`, `commit`, `stash`, `reset`, `checkout --`, or destructive `clean` was run.

## Disposable infrastructure

- Database `test_p1_20260816` (Postgres, local): created, migrated (35 migrations), seeded (19 standards, 8 knowledge docs), used for all live verification, then `dropdb`'d at close. Confirmed absent afterward.
- Backend (`node dist/main.js`, port 4000) and a frontend dev server (`npm run dev`, port 3001, `NEXT_PUBLIC_API_BASE_URL` pointed at the disposable backend) were started for this phase's live verification and killed at close. Confirmed no longer listening.
- The original `safescope` database was never read, migrated, seeded, or mutated.
- Pre-existing, unrelated `npm run dev`/`node dist/main.js` processes found running at session start (from before this session, using the real `.env` configuration) were identified and left untouched throughout.

## Known, honestly-reported limitations

1. **Browser click automation issue**: an automated Chromium session in this environment failed to deliver `onClick`-driven React state updates anywhere in the app — reproduced on code this phase never touched, not just the new standards UI. Worked around for the standards-citation verification via a temporary disposable preview route rendering the real, unmodified production component with real data; not fully worked around for the `/inspection` wizard's own navigation, so wizard-level, end-to-end click-through of the standards UI in its native context was not captured. See `P1_STANDARDS_BROWSER_VERIFICATION.md`.
2. **Report cloud-save remains non-functional** (by explicit user direction) — the payload/error-handling defect is fully fixed, but `POST /reports` still has no live handler (a prior session's deliberate retirement, part of an in-progress canonical-migration direction this phase did not reverse). See `P1_REPORT_SAVE_CONTRACT.md`.
3. **Verbatim regulatory text remains unavailable** in the live data path for both OSHA and MSHA — documented as backlog, not fabricated or silently worked around. See `P1_STANDARDS_INTEGRITY_CONTRACT.md`.

## Current P2/P3 backlog (unchanged by this phase; carried from the 2026-08-16 Production Polish audit)

See `verification/insite-production-polish-efficiency-audit-2026-08-16/PRODUCTION_POLISH_BACKLOG.md` for the full prioritized list (payload-bloat reduction in the classify response itself, dark/light mode polish items, information-architecture simplification, etc.). New items surfaced by this phase, worth folding into that backlog:
- Provision the `regulatory_section` table (migration is missing entirely) and either run the existing eCFR/MSHA ingestion connectors for real, or formally retire that code path if it's not going to be completed.
- `POST /reports` has zero live handler; either wire the `/inspection` wizard onto the canonical `inspections/:id/reports` generation flow, or give the legacy path a real minimal persistence implementation — a deliberate product decision, not an engineering default.
- The automated-browser click-delegation issue observed in this phase's environment is worth a root-cause pass independent of any specific feature, since it blocks reliable automated UI regression testing generally.
