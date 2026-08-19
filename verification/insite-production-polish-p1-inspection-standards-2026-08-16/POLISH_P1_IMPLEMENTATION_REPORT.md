# InSite Production Polish Phase 1 — Implementation Report

Date: 2026-08-16 · Branch `main` · HEAD unchanged throughout: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (no commits made).

## Status

**INSITE_POLISH_P1_CLOSED** for the UX-polish scope; the authoritative-text foundation closes with **real, working, live-verified infrastructure for OSHA and MSHA** beyond what was believed achievable at the start of this phase, with a narrow, explicitly-scoped residual gap (paragraph/subsection-level ingestion) reported honestly rather than fabricated.

## Recommended release gate

Unchanged from the P1 remediation phase's own recommendation: **`NOT_PRODUCTION_READY` is not the right frame here** — this was a polish phase, not a release-readiness audit. P0/P1 remain at 0/0 (unchanged, none regressed). One new, real defect was **discovered but deliberately not fixed** (see below) — it should gate before a production release, but fixing it was out of this phase's declared scope (auth/guard code).

## Files changed (all working tree, uncommitted per operating rules)

| File | Type | Change |
|---|---|---|
| `backend/src/database/migrations/1800000005800-RegulatorySectionCorpus.ts` | new | Provisions all 5 regulatory-text tables (`regulatory_agency/part/subpart/section/paragraph`) — none had ever been migrated. |
| `backend/src/regulatory/regulatory-sync.service.ts` | modified | Fixed a real data-quality bug: paragraph nodes with inline XML markup serialized to `"[object Object]"` instead of their real text; added `paragraphText()` to extract correctly. |
| `frontend-next/lib/canonicalWorkflowApi.ts` | modified (untracked, pre-existing new file) | Added `getRegulatorySection()` — on-demand, fail-soft lookup with exact + parent-section fallback and explicit scope-match reporting. |
| `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` | modified | Exported `StandardCitationHeading`; wired it to fetch and display real official text on expand, with a disclosed parent-section-scope banner when only the containing section (not the exact subsection) is available. |
| `frontend-next/app/inspection-workspace/page.tsx` | modified (untracked, pre-existing new file) | Removed redundant "Attempt finalization now" button/handler; humanized `Status`/finding-status enums; moved raw Finding/Analysis UUIDs behind an "Advanced details" disclosure; added the evidence-gap-count summary header; swapped the plain citation heading for the interactive `StandardCitationHeading`. |
| `frontend-next/app/command-center/page.tsx` | modified | Dashboard "Start Inspection" CTA now targets `/inspections` (canonical hub) instead of the legacy `/inspection` flow. |
| `frontend-next/components/inspection/CurrentHazardCard.tsx` | modified | Applied the `finding-builder-surface` class to fix the dark-mode white-on-white sticky summary defect. |
| `frontend-next/app/globals.css` | modified | Added one hand-authored `.dark .finding-builder-surface` override (Tailwind v4 cascade-layering issue defeated the equivalent utility class, including with `!important`). |

Verification artifacts (new, under `verification/insite-production-polish-p1-inspection-standards-2026-08-16/`): this file plus `POLISH_P1_BASELINE.md`, `P1_POLISH_SCOPE.md`, `INSPECTION_FLOW_BEFORE_AFTER.md`, `FINDING_HIERARCHY_IMPLEMENTATION.md`, `ADDITIONAL_QUESTIONS_IMPLEMENTATION.md`, `STANDARDS_TEXT_FOUNDATION.md`, `OSHA_STANDARDS_VERIFICATION.md`, `MSHA_STANDARDS_VERIFICATION.md`, `STANDARDS_BROWSER_VERIFICATION.md`, `LIGHT_DARK_VERIFICATION.md`, `MOBILE_VERIFICATION.md`, `FREE_PRO_OFFLINE_REGRESSION.md`, `POLISH_P1_REGRESSION.md`, `run_228_paced.mjs`, `P1_228_PACED_RESULT.json`.

## Discovered but out of scope (reported, not fixed)

**`DEV_AUTH_BYPASS=true`'s `JwtGuard` unconditionally overrides every authenticated request with a hardcoded `userId: 1`, regardless of the real `Authorization` header.** The prior P1 remediation's fix for this class of defect only patched the entitlement-grants query (one call site); the guard itself still does this for every route. Reproduced live: with the default `.env` (`DEV_AUTH_BYPASS=true`) and a real registered/logged-in user, `GET /sites`, `GET /inspections`, and `GET /billing/status` all 500'd (`invalid input syntax for type uuid: "1"`) despite a valid JWT being sent. Worked around for this phase's own testing by running the disposable backend with `DEV_AUTH_BYPASS=false`. Not fixed — it's auth/guard code, outside this phase's declared inspection-UX/standards scope, and the correct fix (don't unconditionally discard a real, valid token) deserves its own careful pass rather than a rushed edit to a security-relevant guard.

## Polish items implemented

1. Single canonical inspection entry point (dashboard CTA → `/inspections`).
2. Removed the redundant "Attempt finalization now" / "Confirm risk and finalize finding" pair.
3. Humanized raw `Status: {enum} · version {n}` and moved raw Finding/Analysis UUIDs behind "Advanced details."
4. Evidence-gap-count summary header on the "Essential clarification" tier-2 questions.
5. Fixed the sticky "Finding Builder" mobile dark-mode white-on-white defect (root-caused, not just patched).
6. Ported the existing standards-citation interactivity (P1-2/P1-3) into `/inspection-workspace`, which hadn't had it before.
7. Provisioned the `regulatory_*` migration, ran real OSHA/MSHA ingestion, fixed a real paragraph-serialization bug in the ingestion code, and wired genuine verbatim regulatory text into the live citation display with honest section/subsection scope disclosure.

## Inspection journey — before / after

See `INSPECTION_FLOW_BEFORE_AFTER.md` for full detail. Headline: the dashboard's primary CTA now leads to the canonical, server-saved, 5-stage flow (Capture → Review → Risk → Action → Complete) instead of the weaker legacy flow; the legacy flow is not deleted and remains reachable.

## Clicks/steps before → after

The Risk step previously presented 2 finalize actions with no legible distinction; now presents 1. No other step count changed — the audits that fed this phase's scope selection found the individual screens were already appropriately simple; the friction was architectural (which flow you land in) and a small number of legibility/content-integrity issues, not excess steps within a screen.

## Finding hierarchy before/after

See `FINDING_HIERARCHY_IMPLEMENTATION.md`.

## Additional-question behavior before/after, decision-critical / optional / enrichment behavior

See `ADDITIONAL_QUESTIONS_IMPLEMENTATION.md`. Summary: tiers 1 and 3 (optional/enrichment) were already correct and untouched; tier 2 (decision-critical) correctly stays fully expanded (not collapsed — collapsing it would hide why the standard's confidence is Low) and now carries a compact count/reason header.

## Standards citation behavior / HazLenz summary behavior

Citation is now an interactive, expandable heading in both the legacy and canonical flows (previously canonical-flow-only gap closed this phase). The "HazLenz standard summary" label (from the prior P1 phase) is preserved unchanged and visually separated above the newly-added "Official regulation text" tier.

## Authoritative-text architecture, regulatory_section migration result, OSHA/MSHA result, provenance model, unavailable-text behavior

See `STANDARDS_TEXT_FOUNDATION.md`, `OSHA_STANDARDS_VERIFICATION.md`, `MSHA_STANDARDS_VERIFICATION.md`. Summary: migration created and applied to the disposable DB only; real government-source ingestion proven for OSHA §1910 (163 sections) and MSHA §56 (422 sections); a real data-quality bug found and fixed; live wiring proven end-to-end in the real wizard for a real HazLenz-generated OSHA citation, with honest section-vs-subsection scope disclosure. Original `safescope` database confirmed untouched (35 migrations, unchanged) throughout and at close.

## Actual click/expand browser verification; sibling-finding standards isolation

See `STANDARDS_BROWSER_VERIFICATION.md`. The prior phase's documented Chromium click-automation failure did not reproduce in this session — real clicks, real state transitions, real navigation all verified directly. Sibling-finding standards isolation: the underlying mechanism (`resolveSelectedFindingStandard()`) is hash-unchanged from its P0-02-verified state; a **fresh live multi-finding walkthrough was not re-performed** this phase — reported as an honest coverage gap.

## Light-mode / dark-mode / mobile results

See `LIGHT_DARK_VERIFICATION.md` / `MOBILE_VERIFICATION.md`. One real, previously-undocumented dark-mode defect found (not just the one already known from the source audit) — root-caused to a Tailwind v4 cascade-layering issue, fixed with a hand-authored CSS override, verified fixed in dark mode and confirmed unaffected in light mode.

## Free / Pro / offline result

See `FREE_PRO_OFFLINE_REGRESSION.md`. Free/Quick path untouched. New standards-text lookup fails soft on any error (network, offline, unauthenticated, not-yet-ingested) — never blocks or degrades the rest of the inspection.

## Copy/terminology result

Consistent with product terminology throughout (`Draft`/`In review`/`Completed`, `Pending review`/`Finalized`) — no developer-facing terms introduced; existing raw-identifier leaks in `/inspection-workspace` specifically fixed.

## Accessibility/contrast result

Not separately audited with a dedicated tool this phase; the dark-mode contrast defect fixed (white-on-near-white) was the most severe accessibility-relevant issue on the touched surfaces and is now resolved. No new accessibility regressions identified during live browser testing (buttons/links remained keyboard-focusable per existing markup patterns, unchanged).

## V4 228 / V5-C01–C05 / P1-02 / P0 / P1 / PRA-002 / identity / authorization / report regressions

See `POLISH_P1_REGRESSION.md` for full detail per item. Headline: **228/228** (with an honestly-reported and corrected aggregation-script bug on this session's own side, not a classifier issue), all protected file hashes unchanged, 3 fresh live regression scripts passed, no auth code touched, no report code touched.

## Performance non-regression

Warmed classify: 61.6–74.3ms across 5 samples, consistent with the prior baseline. New standards-text lookup confirmed structurally separate from the classify path (on-demand only, never bundled).

## Backend build / frontend build / `git diff --check`

All **PASS**, run fresh after every edit and again at close.

## HEAD before/after

`24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` — unchanged. No commit made.

## Working-tree preservation

All pre-existing uncommitted work (100+ modified tracked files, deleted tracked files, 160+ untracked paths from the in-progress "canonical" architecture migration) was left untouched except this phase's 8 targeted files (listed above) plus the new migration and verification directory.

## Disposable infrastructure teardown

Confirmed: backend (port 4000) and frontend dev server (port 3001) stopped and confirmed no longer listening; disposable database `test_polish1_20260816` dropped and confirmed absent from `psql -l`; original `safescope` database re-confirmed untouched (still exactly 35 migrations) both before starting and at close.

## Remaining polish backlog

- `PH-2` (Settings dark-mode white-on-white) — confirmed still present, not an inspection surface, deferred to a future general dark-mode phase.
- `PM-1`/`PM-2`/`PL-2` — marketing/auth/registration surfaces, out of this phase's scope.
- Paragraph/subsection-level regulatory-text ingestion (`RegulatoryParagraph` population) — see `STANDARDS_TEXT_FOUNDATION.md`.
- Full-corpus ingestion beyond OSHA §1910 / MSHA §56.
- **The `DEV_AUTH_BYPASS` guard defect** (discovered this phase, not fixed) — recommend prioritizing this alongside/before the next feature phase, since it silently breaks the default local dev experience for any route beyond the one the prior P1 fix touched.
- Sibling-finding standards-isolation coverage gap (fresh multi-finding walkthrough not re-performed this phase).

## Remaining efficiency backlog

Unchanged from `HAZLENZ_EFFICIENCY_BACKLOG.md` — not in scope for this phase, not touched.

## Recommended next phase

A focused remediation phase for the newly-discovered `DEV_AUTH_BYPASS` guard defect (small, well-isolated fix: stop unconditionally discarding a valid `Authorization` header when the flag is set), paired with the sibling-finding standards-isolation live re-verification this phase left as a coverage gap. Broader dark-mode (Settings) and paragraph-level regulatory-text ingestion are reasonable candidates for a later phase but are not blocking.
