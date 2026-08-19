# InSite Production Polish + HazLenz Efficiency Audit — Executive Report

Date: 2026-08-16 · Branch: `main` · Method: real local app, real Chromium browser, real API timing — audit/diagnosis only, no production code modified.

## 1. Audit status
**INSITE_POLISH_EFFICIENCY_AUDIT_COMPLETE**, with explicitly documented material limitations: no final PDF/durable report was successfully generated (blocked by a real, confirmed product defect — see item 34), and several performance/database dimensions were measured qualitatively rather than with exact instrumentation because adding that instrumentation would have required modifying production code, which this pass does not do. All gaps are called out by name in the relevant sub-documents rather than papered over.

## 2. Release gate recommendation
**Downgrade** from `PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES`. Three P0-severity, live-reproduced defects were found (finding-identity swap during finalization, corrective-action content mismatch on multi-hazard observations, and a fully dead-ended PDF export path) that were not present in the prior gate's stated P0/P1 counts of 0/0. Recommend **`NOT_PRODUCTION_READY — P0 REMEDIATION REQUIRED`** until items 3-5 below are resolved.

## 3. P0 count: 3
(1) Finding-identity swap during finalization · (2) Corrective-action content mismatch on multi-hazard observations · (3) PDF export dead end. Full detail in `PRODUCTION_POLISH_BACKLOG.md`.

## 4. P1 count: 4
Default dev config breaks HazLenz entirely (`DEV_AUTH_BYPASS` + UUID crash) · standards mislabeled as "official text" · standards not clickable · `PayloadTooLargeError` on report save.

## 5. P2 count: 0 explicitly new (the pre-existing, brief-acknowledged "failed-but-present control" limitation was not independently re-broken or re-confirmed fixed in this pass — see item 25).

## 6. P3 count: 0 tracked separately in this pass (folded into POLISH_LOW).

## 7. POLISH_HIGH count: 3
Two-parallel-inspection-systems architecture · dark-mode white-on-white Settings cards · raw technical identifiers shown to end users.

## 8. EFFICIENCY_HIGH count: 2
Unconsumed service output driving payload bloat · the 3-way corrective-action generator merge (efficiency and correctness finding at once).

## 9. Local browser verification status
**Confirmed real.** Register/login round-tripped through real `/auth/register` and `/auth/login` HTTP calls (201 responses) against a disposable local database; every screen in the linked sub-reports was actually rendered and interacted with via Chromium automation, not inferred from source.

## 10. Light-mode overall assessment
Strong. Every screen tested was POLISHED or MINOR_INCONSISTENCY; the 5×5 risk matrix is the standout visual element in the product. See `LIGHT_MODE_AUDIT.md`.

## 11. Dark-mode overall assessment
Mixed. Primary inspection workflow and dashboard are well-themed; Settings' Appearance/Billing cards have a severe, confirmed white-on-white contrast bug, and a mobile sticky summary component doesn't re-theme at all. See `DARK_MODE_AUDIT.md`.

## 12. Mobile overall assessment
Good. Clean single-column stacking, working bottom nav, no overflow found. One real issue: the sticky "Finding Builder" summary is oversized relative to a phone viewport. See `RESPONSIVE_MOBILE_AUDIT.md`.

## 13. Largest visual inconsistency
The Settings page's Appearance and Billing cards in dark mode: white card background retained while text switched to a near-white dark-mode color, producing genuinely illegible white-on-white text.

## 14. Largest first-time-user friction
Two parallel inspection systems (legacy client-side vs. canonical server-saved), reachable from different entry points, with the more prominent dashboard CTA leading to the weaker/dead-ending one.

## 15. Current inspection-step count
5 steps in both systems (legacy: Hazard Details → HazLenz AI Review → Standards & Actions → Finalize Findings → Generate Report; canonical: Capture → Review → Risk → Action → Complete) — already close to the target shape once a user is on the canonical path.

## 16. Recommended simplified inspection journey
Retire or clearly demote the legacy flow; make the canonical `Capture → HazLenz analyzes → Review findings → Assign risk/corrective action → Complete → Report` the only path reachable from the dashboard. Full detail in `INSPECTION_SIMPLIFICATION.md`.

## 17. Optional-question current behavior
Two of three clarification tiers already correctly implement the "collapsed, optional" pattern (pre-analysis context, and "Additional checks"). The third tier — decision-critical evidence-gap questions — is fully expanded by default, which is defensible (these gate confidence) but is currently the largest single scroll cost in the review step.

## 18. Recommended expandable-question behavior
Keep tiers 1 and 3 exactly as implemented; add a compact summary header to tier 2 ("3 evidence gaps — answer to raise confidence") rather than collapsing it outright. Full detail in `CLARIFICATION_UX_AUDIT.md`.

## 19. Mandatory-vs-optional clarification recommendation
Do not force decision-critical (CRITICAL/IMPORTANT-tagged) questions behind a collapse — that would hide the reason a standard's confidence is Low. Keep truly optional enrichment collapsed, as it already is.

## 20. OSHA standards text result
**SUMMARY_ONLY**, live-confirmed, mislabeled by the frontend's own label logic as "Official standard text" in at least some code paths.

## 21. MSHA standards text result
**SUMMARY_ONLY**, same mechanism as OSHA; fewer seeded rows in this environment (6 vs. 13 OSHA).

## 22. Standards click-through result
**No click-through exists at all** — confirmed via accessibility-tree inspection and direct interaction; the citation is styled text, not a link.

## 23. Actual-text-versus-summary result
Genuine, real verbatim-regulatory-text infrastructure exists in the codebase (`safescope-knowledge` ingestion connectors pulling real eCFR/MSHA XML) but is **completely disconnected** from the live finding/citation display path.

## 24. Finding presentation assessment
Strong content model — the right things are primary, the right things are collapsed (AI reasoning trace, evidence detail). Undermined by content-integrity issues elsewhere (standards, corrective actions), not by hierarchy/layout problems.

## 25. Corrective-action UX assessment
Strong surface design, undermined by a confirmed P0 content-mismatch defect on multi-hazard observations. The pre-existing "failed-but-present control" P2 limitation was not independently stress-tested to confirm current status in this pass — flagged as an open question, not a clean bill of health.

## 26. Information architecture assessment
The core 4-item bottom nav is clean. The real IA defect is the duplicate inspection-system problem (item 14), plus a `/settings` vs. `/profile` overlap that wasn't deeply verified either way.

## 27. Terminology consistency
Good — no legacy brand-name leaks into user-visible copy, "HazLenz" spelling is 100% consistent, core nouns (finding/corrective action/review) don't have competing synonyms. The real copy problem is raw technical identifiers (UUIDs, ISO timestamps, checksums, JSON error bodies) leaking into user-facing text.

## 28. Error/loading/empty-state assessment
Mixed but instructive: empty states and the free-tier degraded-HazLenz fallback are genuinely well-designed and safety-conscious. The two highest-stakes actions in the product (HazLenz review under one dev config, and PDF export) have confirmed dead-end or raw-error failure modes.

## 29. Offline experience
Real and usable — "Use Offline Review" produces an honestly-labeled, clearly-flagged degraded result a user can still act on, not a broken button.

## 30. Free experience
Honest, well-gated, doesn't feel broken when a Pro feature is denied — clean `402`-style messaging with a working fallback.

## 31. Pro experience
Works end-to-end once entitled (verified via a legitimate, repo-provided disposable-database test-entitlement grant, since Stripe billing isn't configured locally): real confidence scores, real risk, real standards suggestions, real multi-hazard decomposition. Undermined downstream by the P0 defects (items 3-5).

## 32. Report visual quality assessment
The pre-export final-review screen (the furthest this audit could get) looks genuinely professional — clean metadata card, sensible typography, per-finding structure. **Could not be assessed past this point** because export failed. This is itself the headline report finding.

## 33. Report content-integrity assessment
Sibling findings correctly retain independent risk and standards; corrective actions did **not** reliably stay matched to the correct finding (confirmed defect); a finding-identity bug was confirmed at the finalize step (see item 3).

## 34. Worst report-formatting issue
There is no "worst formatting issue" to report because **no report was successfully exported** in this pass — export is blocked by a confirmed dead-end gate (legacy flow) and was not reached to completion (canonical flow, time-budget-limited). This is reported as the report-quality finding itself.

## 35. Strongest report improvement opportunity
Get end-to-end export working at all, then re-run this audit's report-quality phases against real output — nothing about visual polish can be meaningfully assessed until that's true.

## 36. HazLenz warm p50
**51.9 ms** (measured, n=24 warm reps across 10 corpus categories).

## 37. HazLenz warm p95
**147.5 ms** (measured, same sample).

## 38. Cold classify result
"Cold-ish" (first request per corpus item, not isolated from JIT/pool warmup) p50 = 55.5 ms, p95 = 161.5 ms — very close to warm numbers, suggesting no severe cold-start penalty in this pipeline, though true isolated cold-start was not separately measured.

## 39. Single-hazard timing
38-69 ms (short text) up to 147-204 ms (long single-hazard paragraph) — text length correlated with latency more than hazard count did.

## 40. Multi-hazard timing
75-78 ms for a 3+ hazard, multi-sentence observation — cheaper than the single long-text scenario.

## 41. Long-narrative timing
Slowest measured category overall: 147.5-203.9 ms (`long_single_hazard`).

## 42. Dominant pipeline stage
Not conclusively isolated — stage-level instrumentation wasn't added (would require touching production code). The ~50-engine orchestrator's cost appears spread thin across many small calls rather than concentrated in one dominant stage, based on total-latency behavior and existing bracket-log timestamps.

## 43. Repeated raw-text scan findings
Real duplication found in unprotected orchestration code: double-invocation of `enforceHazLenzEvidenceBoundary`, repeated lowercase-normalization passes, 4x-repeated citation-string cleanup in one function. Full detail in `RAW_TEXT_REGEX_WORK_AUDIT.md`.

## 44. Duplicated-work findings
Three independent corrective-action generators and two independent risk-reasoning implementations both run unconditionally on every request; only a subset of each set's output actually drives what the user sees.

## 45. Dead/unconsumed-work findings
At least 4 services' outputs (detected-entity fields, evidence-question generation, the absorption/composer/learning-queue trio, most of the knowledge-retrieval payload) are computed, awaited, and never read downstream — the most direct explanation found for payload bloat.

## 46. Database query findings
Not exactly measured (no query logging enabled — would require a production-code change this pass doesn't make). Traced qualitatively: entitlement/billing checks each perform at least one DB read per gated request; classify itself does not appear to touch the database. Full detail and the reason for the gap in `DATABASE_EFFICIENCY_AUDIT.md`.

## 47. Response payload findings
55-86 KB average classify response (~59 KB avg) for inputs as short as 5 words — the clearest, most confidently-measured inefficiency in the whole audit.

## 48. Memory findings
Flat to slightly down across the session (877 MB → 850 MB RSS after ~30 requests + full browser walkthrough) — no evidence of a leak at this sample size.

## 49. CPU findings
Not measured (no profiler attached; local tooling limitation, reported honestly rather than estimated).

## 50. Scaling findings
No nonlinear scaling observed in the sample collected; latency tracked roughly with input text length. Sample is small (n=30, sequential only) — not a guarantee at production/concurrent scale.

## 51. Frontend performance findings
Healthy build-time signal (all 26 routes statically generated); subjectively immediate navigation throughout testing; the confirmed homepage hydration mismatch is a real, if likely small, source of wasted client-side work on every load.

## 52. Proposed performance budgets
See `PERFORMANCE_BUDGET_PROPOSAL.md` — warm p50 warning at 150ms/failure at 400ms, warm p95 warning at 350ms/failure at 800ms, payload-size warning at 40KB (deliberately below the measured ~59KB baseline to force attention on the confirmed bloat).

## 53. Protected V4 status
**Unchanged, byte-identical.** All 3 core protected files plus the 4 frozen data/manifest artifacts were re-hashed at both the start and end of this session and matched exactly — no drift, no modification, confirmed via both `git hash-object` and SHA-256.

## 54. V5 regression status
V5-C01 through C05 and P1-02's tracked files were all confirmed byte-identical to their last-recorded baselines (see `POLISH_EFFICIENCY_BASELINE.md`) — no regression from this session, and the C04 deletion set remains absent as expected. This audit's *own* findings (finding-identity swap, corrective-action mismatch) may indicate a live, pre-existing behavioral gap in the multi-hazard/finding-scoping work, but no source file involved in that work was modified or found to differ from its recorded baseline during this pass.

## 55. Backend build
**PASS** (Phase 0, `tsc`, exit 0, no errors). Not re-run at the end since no production files were touched during the session.

## 56. Frontend build
**PASS** (Phase 0, Next.js 16.2.12 / Turbopack, exit 0, 26 static routes). Not re-run at the end for the same reason.

## 57. `git diff --check`
Clean at both start and end of session (exit 0, no output).

## 58. HEAD before/after
`24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` — unchanged (matches the expected HEAD given for this audit).

## 59. Working-tree preservation
**Confirmed.** `git status` at the end of the session is identical to the Phase 0 snapshot except for the addition of this audit's own output directory (`verification/insite-production-polish-efficiency-audit-2026-08-16/`). No pre-existing modified, deleted, or untracked file was touched, staged, committed, or reverted.

## 60. Disposable infrastructure teardown
**Confirmed executed.** Backend and frontend dev servers stopped; disposable database `test_audit_20260816` dropped (`dropdb`, exit 0, confirmed absent from `\l`); original `safescope` database re-confirmed untouched (still exactly 35 migrations, same as the Phase 0 baseline read).

## 61. Top 10 polish issues, ranked
1. PDF export dead end (P0) · 2. Finding-identity swap on finalize (P0) · 3. Corrective-action content mismatch (P0) · 4. Default dev config breaks HazLenz entirely (P1) · 5. Standards mislabeled as official text (P1) · 6. Standards not clickable (P1) · 7. Two parallel inspection systems / weak-path-more-discoverable (POLISH_HIGH) · 8. Dark-mode white-on-white Settings cards (POLISH_HIGH) · 9. Raw technical identifiers shown to users (POLISH_HIGH) · 10. `PayloadTooLargeError` on report save, raw error text (P1).

## 62. Top 10 efficiency opportunities, ranked
1. Strip/gate unconsumed service output driving payload bloat (EFFICIENCY_HIGH) · 2. Investigate 3-way corrective-action generator merge (EFFICIENCY_HIGH, tied to Polish P0-3) · 3. Two independent risk-reasoning implementations (EFFICIENCY_MEDIUM) · 4. Double-invocation of the evidence-boundary enforcement function (EFFICIENCY_MEDIUM) · 5. Repeated lowercase/citation-normalization passes (EFFICIENCY_MEDIUM) · 6. Rich knowledge-retrieval payload collapsed to an unused boolean downstream (EFFICIENCY_LOW) · 7-10. Enable temporary query logging / stage-level timing / concurrent-load testing / CPU profiling as measurement-infrastructure follow-ups, since each of these dimensions currently has no measured baseline to optimize against.

## 63. DO_NOT_TOUCH optimization areas
`safescope-v2.service.ts`, `multi-hazard-decomposition.service.ts`, `deterministic-classifier.ts`, and the frozen 228/228 family-matrix/taxonomy artifacts — all confirmed unchanged and explicitly out of scope for any consolidation, threshold, or regex-migration work per Phase 27.

## 64. Recommended implementation roadmap
1. **Root-cause the multi-hazard finding-identity and corrective-action-merge defects together** (P0-2 and P0-3 share a plausible mechanism — see `HAZLENZ_EFFICIENCY_BACKLOG.md` EH-2). 2. **Fix or replace the PDF export gate** (P0-1) so report generation can be verified at all. 3. **Fix the default dev config** so the product is usable out of the box (P1-1) — cheap, high-leverage. 4. **Resolve the standards-text labeling risk** (P1-2/P1-3) — relabel honestly as an interim step, wire real text as a larger follow-up. 5. **Consolidate to one inspection journey** (POLISH_HIGH-1) once the canonical path's defects above are fixed. 6. Dark-mode and raw-identifier polish sweep (POLISH_HIGH-2/3) can proceed in parallel at any point — low risk, no dependencies. 7. Payload-bloat cleanup (EFFICIENCY_HIGH-1) once the P0-3 investigation clarifies what's actually needed from each generator.

## 65. Exactly one recommended NEXT phase
**A focused remediation phase covering P0-1, P0-2, and P0-3 only** (PDF export, finding-identity-on-finalize, and corrective-action content-mismatch), each root-caused against real source (not assumed) and re-verified against the same live-browser method used in this audit, before any broader polish or efficiency work begins. These three are the only items that currently block a user from completing the product's core promise — a trustworthy, exportable inspection report.
