# InSite/HazLenz Standards Integrity and Provisioning — Final Report

**Completion state: STANDARDS_INTEGRITY_PARTIAL**

Closed on the core objective (data-provisioning ambiguity resolved; real resolver defect found, root-caused, and fixed; paragraph-level resolution wired; OSHA/MSHA/browser verification complete). Not fully closed because the named V4/V5-C01..C05/P1-02/PRA-002 regression harnesses referenced in the task are not discoverable as standing, re-runnable commands in this repo (see item 33-41), and one dedicated auth/entitlement test has its own environment guard that wasn't set up in this pass. See "Recommended next phase" at the end.

## 1. Status
Citation-resolution defect found, root-caused, fixed, and verified end-to-end (API + real browser). Paragraph-level exact-text resolution implemented where it previously didn't exist. Broad in-repo regression suite passes except two pre-existing, unrelated failures.

## 2. Release-gate recommendation
**Do not block release on this defect any longer** — the zero-citation bug is fixed and verified. **Do** run the two pre-existing Golden-Hardening/Production-Path sub-case failures and the named V4/V5/P1-02/PRA-002 suites through a dedicated pass before a compliance-sensitive release, since they were not exercised here (see items 33-41).

## 3. P0 count
1 (the citation-resolution defect — fixed).

## 4. P1 count
1 (missing `regulatory_paragraph` population, causing whole-section-only display for subsection citations — fixed). Plus one documented-not-fixed minor gap (heading `null` for `29 CFR 1910.1200` section lookups, a pre-existing `RegulatorySyncService` coverage gap — see `STANDARDS_OSHA_VERIFICATION.md`).

## 5. Original 19-case result
11/19 critical failures. Every one of 19 cases returned `activeCitations: []`, including the 8 negative/ambiguous cases where that's correct (hence 3 pass + 5 qualified-pass, 11 critical-fail). Hazard-family classification correct in all 19. Reproduced against a fully-provisioned disposable DB before any code fix — proving this was not a data gap.

## 6. Disposable DB provisioning result
`hazlenz_standards_verify_20260816`, fully migrated (37/37 migrations, including two never previously run against the real dev DB), fully provisioned, verified isolated from `safescope` at every step (see `STANDARDS_DISPOSABLE_DB_PROOF.md`), torn down at the end of this phase.

## 7. `standards_master` row count
19 (13 OSHA + 6 MSHA), via `npm run seed:safescope-standards`.

## 8. `regulatory_section` row count
889 (163 OSHA 1910 + 304 OSHA 1926 + 422 MSHA Part 56), live eCFR bulk XML.

## 9. `regulatory_paragraph` row count
24,911 (16,830 + 8,538 + 543 across the same three parts), via a new extractor written in this phase (`backend/scripts/verification-sync-regulatory-paragraphs.ts`) — this table had never been populated before.

## 10. Authoritative source provenance
Live eCFR bulk XML (`govinfo.gov/bulkdata/ECFR/title-29` and `title-30`) for `safescope_knowledge_chunks`, `regulatory_section`, and `regulatory_paragraph`. `standards_master` from the repo's existing curated `STANDARDS_INTELLIGENCE_SEED` (in-repo, hand-authored, real citation numbers). No text fabricated.

## 11. 19-case result after provisioning, before fixes
Identical to item 5: 11/19 critical failures, all 19 cases zero citations. Byte-for-byte same failures — proves the defect is not data-related.

## 12. True data-only failures
0 of the original 11.

## 13. True resolver defects
11 of 11, all explained by a single root cause (item 14).

## 14. Production changes
Two files edited, both narrowly scoped:
- `backend/src/safescope-v2/display/hazlenz-evidence-boundary.ts`: `standardCandidates()` now also sources from `result.standardDecisions` (the one field never stripped by the display sanitizer) instead of only the three fields (`primaryStandards`/`suggestedStandards`/`standards`) that get deleted by `sanitizeHazLenzDisplayOutput` between the controller's two calls to `enforceHazLenzEvidenceBoundary`. Also now preserves and correctly maps `applicabilityStatus` (`confirmed`/`probable`/`needs-more-evidence`) instead of dropping it, restoring vocabulary consistency with the rest of the pipeline.
- `backend/src/regulatory/regulatory.service.ts`: `RegulatoryParagraph` injected; `getSection()` now checks `regulatory_paragraph` for an exact subsection match before falling back to the existing whole-section lookup — additive, no existing behavior removed.

Two new files added: `backend/scripts/verification-sync-regulatory-paragraphs.ts` (paragraph extractor) and `backend/scripts/verification-sync-regulatory-sections.ts` (disposable-DB-only section sync helper, hard-guarded to refuse running against anything but the disposable DB by name).

Neither `safescope-v2.service.ts`, `standard-applicability.rules.ts`, nor any other file in the protected 228-case family-recognition surface was modified.

## 15. Final 19-case result
0/19 critical failures. 7 pass, 12 qualified-pass. `primaryCitationRecall: 1.0`, `primaryCaseRecall: 1.0`, `falsePositiveCount: 0`, `unsupportedCitationRate: 0`.

## 16. Machine-guarding citation result
`osha-gi-operating-unguarded-shaft` → `29 CFR 1910.212(a)(1)`, `29 CFR 1910.219(c)` — pass (qualified). Verified end-to-end in a real browser: exact-paragraph text for `1910.219(c)` rendered correctly, separately labeled from HazLenz's summary.

## 17. Electrical citation result
`osha-gi-damaged-cord-wet-exposed` → `29 CFR 1910.305(g)(1)(iii)` — pass. Exact authoritative text verified via API.

## 18. LOTO citation result
`msha-conveyor-jam-energized` → `30 CFR 56.12016` (plus `56.14107(a)`) — pass. Text verified via API (`STANDARDS_MSHA_VERIFICATION.md`).

## 19. Fall citation result
`construction-edge-eight-feet` → `29 CFR 1926.501(b)(1)` — qualified-pass. Exact authoritative text verified via API.

## 20. HazCom citation result
`osha-gi-unlabeled-secondary-solvent` → `29 CFR 1910.1200(f)(1)` — qualified-pass. Exact paragraph text correct; parent-section heading enrichment missing for this one section due to a pre-existing, undisturbed `RegulatorySyncService` gap (documented, not fixed).

## 21. MSHA citation result
`msha-conveyor-jam-energized` (56.14107(a), 56.12016) and `msha-backup-alarm-reversing` (56.14132(a), 56.9100(a)) — both pass, real text verified.

## 22. Exact paragraph/subsection lookup result
Working, verified via API and live browser: `29 CFR 1910.212(a)(1)`, `56.14107(a)`, `1926.501(b)(1)`, `1910.1200(f)(1)` all resolve to their exact paragraph text (not whole-section fallback), confirmed against real fetched eCFR source.

## 23. Parent-section fallback behavior
Working, unchanged (already correctly implemented in the frontend pre-existing code): amber disclosure banner shown whenever only the containing section is available, never presented as exact subsection text.

## 24. Unavailable-text behavior
Working: a citation with no matching paragraph or section returns an empty/no-body response; frontend's existing null-safe handling degrades to the honest "not currently available" path — no fabricated text.

## 25. HazLenz-summary labeling
Correct in the live UI: "HAZLENZ STANDARD SUMMARY" heading, visually and structurally distinct from the official-text panel.

## 26. Official-text labeling
Correct: "OFFICIAL REGULATION TEXT" heading with an explicit "verify against the agency's own published text" caveat — never presented as HazLenz's own output.

## 27. OSHA browser result
Verified live: machine-guarding finding → exact `1910.219(c)` paragraph text rendered correctly in the guided-inspection review UI.

## 28. MSHA browser result
Not separately click-through-tested in the browser this pass (API-level MSHA verification complete in `STANDARDS_MSHA_VERIFICATION.md`); same code path proven for OSHA in the browser, and the backend mechanism is agency-agnostic (same `getSection`/paragraph lookup regardless of `agencyCode`).

## 29. Sibling standards isolation
Verified by code inspection, not by a second live click-through this pass — the lookup is stateless per citation string, keyed by `sectionCitation` + `paragraphPath` with no cross-finding caching (`STANDARDS_BROWSER_VERIFICATION.md`).

## 30. Light-mode result
Verified — default theme throughout registration/login/inspection flow, correct rendering.

## 31. Dark-mode result
Verified — citation panel re-rendered correctly with proper contrast after toggling `localStorage.safety_insite_theme`.

## 32. Mobile result
Verified at 640px effective viewport width — single-column layout, no overflow/truncation of the citation panel.

## 33. V4 result
Not run under its historical name (not discoverable as a standing command — see `STANDARDS_REGRESSION.md`). Closest available proxy, `test:hazlenz-core-regression` (20 in-repo suites covering hazard-family recognition), run and passed 18/20 with two pre-existing, unrelated failures (see item 41).

## 34-38. V5-C01 through V5-C05 result
Not run — no re-runnable script found under these names; only prior-session one-off harness files under `verification/hazlenz-v5-*` folders, not integrated as standing commands.

## 39. P1-02 result
Not run — same reason as above.

## 40. PRA-002 result
Not run — same reason as above.

## 41. Auth/permissions result
`npm run test:hazlenz-core-regression` exercised the same protected classify path with no auth-specific regressions surfaced. The dedicated `scripts/test-entitlement-boundary.ts` was not run — it refuses to execute unless `DATABASE_URL` matches `/phase[0-9]+|test|closure/i` and `NODE_ENV=test`, neither of which matched this phase's disposable DB naming or running backend instance.

## 42. Classify performance
p50 151ms, p95 222ms (20 requests). Response carries citation metadata with empty `standardText` — no full regulatory text embedded.

## 43. Standards lookup performance
p50 6ms, p95 8ms (30 requests, 3 representative citations).

## 44. Backend build
`npm run build` (`tsc`): clean, no errors, run after all fixes.

## 45. Frontend build
`next build --webpack` (run against an isolated rsync copy to avoid disturbing the user's live dev server; identical source, zero frontend files were changed): clean, all 26 routes compiled successfully.

## 46. `git diff --check`
Clean, no whitespace/conflict-marker issues.

## 47. HEAD before/after
`24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` → unchanged (no commits made).

## 48. Files changed
`backend/src/safescope-v2/display/hazlenz-evidence-boundary.ts` (edited), `backend/src/regulatory/regulatory.service.ts` (edited), `backend/scripts/verification-sync-regulatory-paragraphs.ts` (new), `backend/scripts/verification-sync-regulatory-sections.ts` (new). All temporary diagnostic `console.log` instrumentation added during root-causing was fully removed before any fix was applied (verified via diff-size before/after).

## 49. Working-tree preservation
All pre-existing uncommitted work (auth, billing, corrective-actions, migrations, etc., present at session start) preserved untouched throughout. No `git reset`/`checkout --`/`restore`/`stash`/`clean` used at any point.

## 50. Disposable infrastructure teardown
Disposable DB `hazlenz_standards_verify_20260816` dropped at the end of this phase (confirmed absent afterward). Isolated frontend copy under the session scratchpad directory removed. All background backend/frontend dev processes for this phase stopped. Original `safescope` DB confirmed unmodified throughout (0 rows in `standards_master`, unchanged migration count, zero writes detected in a full 47-table timestamp scan).

## 51. Remaining standards-data gaps
- `29 CFR 1910.1200` whole-section text was never ingested by `RegulatorySyncService` (pre-existing gap, likely the same multi-volume-block issue the newer `OshaEcfConnector` already handles but the older sync service doesn't) — paragraph-level text is unaffected and correct, only the section heading enrichment is missing for that one section.
- The paragraph extractor's marker-disambiguation heuristic is best-effort for standard CFR outline conventions; not exhaustively fuzz-tested against every edge case in the ~25K rows it produced (spot-checked ~6 known citations, all correct).
- `standards_master` curated seed only covers 19 of many possible citations; broader coverage would come from running the ingestion scripts against more OSHA/MSHA parts (mechanism already proven to work).

## Recommended next phase (exactly one)
Run the dedicated named regression harnesses this phase could not locate as standing commands — reconstruct or re-integrate `V4 228/228`, `V5-C01`..`V5-C05`, `P1-02`, `PRA-002`, and a properly-configured `test:entitlement-boundary` run (via a `NODE_ENV=test` server against a disposable DB named to match its guard regex) — to close the remaining regression-coverage gap before a compliance-sensitive release.
