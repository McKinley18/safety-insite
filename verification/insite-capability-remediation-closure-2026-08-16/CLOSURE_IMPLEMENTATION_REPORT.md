# InSite Capability Remediation Closure — Final Report

Date: 2026-08-16. Branch `main`, HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged
throughout this phase — no commits made).

## Completion state

**INSITE_CAPABILITY_REMEDIATION_CLOSED**

Every gap the prior phase left open — V5-C02, V5-C03, V5-C04, and report-generation regression,
all previously confirmed only by git-diff non-interference — was independently re-run live this
session and passed. The full end-to-end browser walkthrough (real photo upload, multi-hazard
decomposition, standards, corrective actions, review, completion, PDF export) was completed in
both light and dark mode with a mobile spot check. Along the way this phase found and fixed five
narrow, real defects (detailed below), each confirmed live and re-verified against the frozen V4
228-case matrix and a fresh build after every change — zero regressions introduced.

## 1–50 point answers

1. **Status**: Closed (see above).
2. **Recommended release gate**: Proceed to Final Production Release Validation (per the
   release-gate rule — P0=0, P1=0, V4=228/228, V5-C01–C05 verified, auth/permissions clean,
   report clean, light/dark/mobile workflow clean, no new material defect left open).
3. **P0 count**: 0.
4. **P1 count**: 0 open. Five were found and fixed live during this closure phase itself (not
   carried over from before) — see items 6–10 below.
5. **V5-C02 result**: PASS — live re-run (`c02_shared_fact_reuse_proof.ts`,
   `c02_semantic_adversarial_tests.ts`), 13/13 checks pass. See `CLOSURE_V5_C02.md`.
6. **V5-C03 result**: PASS — live re-run (`c03_finalization_gate_unit_tests.ts` 8/8,
   `c03_live_harness.ts` 11/11 fixtures against a real disposable-DB backend). Negation
   improvements did not make the sufficiency gate more permissive or more restrictive. See
   `CLOSURE_V5_C03.md`.
7. **V5-C04 result**: PASS — static/runtime re-confirmation (no executable script exists for
   this one by design); all 6 originally-deleted files remain deleted, no orphaned imports, clean
   `tsc` build. See `CLOSURE_V5_C04.md`.
8. **Defect found #1 — report risk display**: The canonical PDF's Executive Summary and per-finding
   risk badges read only `riskSnapshot.riskBand`, but the primary reviewer-confirmed risk path
   (the guided "Confirm risk and finalize finding" flow) persists the chosen band under
   `riskSnapshot.overallRisk` instead — so every professionally reviewed finding rendered as
   "Not rated" and was silently excluded from Critical/High counts in the report. Fixed with a
   `riskBand`-then-`overallRisk` fallback at all 3 read sites in
   `canonical-report-pdf-renderer.ts`. Verified live with the exact real-UI payload shape (no
   `riskBand` key present) — confirmed correct rendering after the fix.
9. **Defect found #2 — multi-hazard electrical/hydraulic under-detection**: Three narrow
   regex-completeness gaps in `multi-hazard-decomposition.service.ts`'s electrical and
   hydraulic-energy detectors caused genuine hazards to be silently dropped on ordinary inspection
   phrasing: (a) `\bconductor\b`/`\bwire\b`-style patterns had no plural form, so "bare
   conductors" (plural) never matched; (b) `pressure remains?` matched present tense only, not the
   equally common past tense "remained"; (c) "junction box" — a common way to describe an exposed
   electrical enclosure — was absent from the source-word list. Reproduced live via a fresh
   4-hazard fixture (only 2/4 hazards recovered before the fix); fixed with 3 narrow, additive
   regex widenings (no clause-splitting or negation logic touched); re-verified 4/4 and 3/3
   recovered on fresh fixtures, and the full V4 228-case matrix re-run clean afterward.
10. **Defect found #3, #4, #5 — live browser findings**: found while independently confirming
    sibling risk isolation in the real UI (not from a script) —
    (#3) the same risk-display bug as item 8 was also present in
    `inspection-workspace/page.tsx`'s live findings-list badge; fixed the same way.
    (#4) the selected-finding card and risk-step status banner used hardcoded
    light-only `bg-sky-50`/`border-sky-300`, illegible in dark mode; fixed using the codebase's
    existing theme-aware `--guided-*` CSS variables (already used elsewhere in the same file).
    (#5) the risk-proposal form didn't reset when the flow auto-advanced to the next unreviewed
    finding after finalizing one — the previous finding's dropdown values and typed reason
    silently carried over, so an inattentive reviewer could persist the wrong risk under the new
    finding's id; fixed by applying the same reset the manual "Review this finding" button already
    performed correctly. All three confirmed live and cross-checked directly against the database.
11. **Report regression overall**: PASS with the one fix above. See
    `CLOSURE_REPORT_REGRESSION.md`.
12. **Simple-report (Report A, 1 finding) result**: PASS — 6-page PDF, cover/exec
    summary/metadata/finding/corrective action all correct.
13. **Multi-hazard-report (Report B, 3 findings) result**: PASS — 6-page PDF, 3 independent
    findings, no cross-finding text bleed.
14. **Stress-report (Report C, 8 findings) result**: PASS — 8-page PDF, 8 independent findings
    across 8 observations, no blank pages, correct pagination.
15. **Photo workflow result**: PASS — real PNG uploaded via `POST /inspections/:id/evidence`
    (201, real storage record with sha256), downloaded back byte-identical (200), inspection
    unaffected. See `CLOSURE_PHOTO_WORKFLOW.md`.
16. **Canonical photo-to-report result**: **PHOTO_REPORT_GAP_CONFIRMED** — confirmed by code
    review that the report generator never queries evidence-category storage records; this is a
    pre-existing architecture gap, not a regression, and was not fabricated as working.
17. **Complete browser workflow result**: PASS — full real-Chromium walkthrough, dashboard →
    inspection → capture (with photo) → HazLenz multi-hazard analysis → 4 independent findings
    reviewed and risk-confirmed → corrective actions → completion → report → PDF download and
    open. See `CLOSURE_END_TO_END_BROWSER.md`.
18. **Light-mode result**: PASS — no defects found; all screens visually coherent. See
    `CLOSURE_LIGHT_MODE.md`.
19. **Dark-mode result**: PASS after fixing defect #4 above. See `CLOSURE_DARK_MODE.md`.
20. **Theme persistence result**: PASS — confirmed across hard refresh mid-workflow; theme and
    inspection state both correctly reloaded from the server.
21. **Mobile result**: PASS (spot check) — dashboard, findings review, reports list all reflow
    cleanly at 390px width, no horizontal overflow, no inaccessible controls. See
    `CLOSURE_MOBILE.md`.
22. **Negated-electrical result**: PASS — 0.2 (low) confidence, no positive high-confidence
    finding, unchanged before/after this phase's fixes.
23. **Effective-control result**: PASS — no hazard flagged at all for a fully-effective-guard
    description.
24. **Failed-control result**: PASS — still recognized (low confidence, not suppressed).
25. **3-hazard result**: FIXED — 1/3 → 3/3 recovered after defect #2's fix.
26. **4-hazard result**: FIXED — 2/4 → 4/4 recovered after defect #2's fix; also confirmed live
    in the real browser UI, not just via script.
27. **5-hazard result**: Recorded, not forced — 6 tags returned (5 real hazards + 1 secondary
    `hot_work` tag from "grinding," a pre-existing, unrelated ignition-word detector). See
    `CLOSURE_NEGATION_MULTIHAZARD.md`.
28. **Mixed-negation/multi-hazard result**: FIXED — previously returned 0 findings at all
    (the active electrical sibling was also lost); now correctly suppresses the negated guard
    condition while recovering the active electrical sibling (confidence 0.9).
29. **Anonymous permission result**: PASS — 401 across all tested routes.
30. **Free permission result**: PASS — allowed functionality (site/inspection access) works;
    paid workflow (`classify`) and corrective-action creation both correctly blocked (402).
31. **Paid permission result**: PASS — full guided workflow, HazLenz, standards, corrective
    actions (201, persisted), professional report generation all work for the Expert-tier account.
32. **Corrective-action entitlement result**: PASS — the P1 fix from the prior remediation phase
    (Free → 402, Paid → 201) independently re-confirmed live, not inferred from diff.
33. **AUTH-P1 result**: PASS — full matrix re-run across 3 backend configurations (bypass ON,
    bypass OFF, bypass ON + Force-Pro); no identity collapse, no raw 500s, invalid tokens always
    rejected in both bypass states, Force-Pro isolation confirmed structurally separate from real
    identity. See `CLOSURE_SUBSCRIPTION_AUTH.md`.
34. **P1-02 result**: PASS — all 9 adversarial scenarios (A–I) ran clean with coherent,
    differentiated output; multi-hazard sibling-isolation case confirmed no cross-contamination.
35. **PRA-002 result**: PASS — `test-finding-scoped-reviews.ts` live-executed,
    `"passed":true`, `finalStatus:"completed"`, sibling findings reviewed independently. See
    `CLOSURE_P1_02_PRA002.md`.
36. **V4 result**: **228/228 PASS** — re-run twice this session (once before, once after the
    multi-hazard fixes); both clean, zero semantic failures. See `CLOSURE_V4.md`.
37. **Report/PDF visual result**: PASS — correct cover, exec summary, metadata, finding
    numbering, risk badges/colors, standards citations, corrective actions, page numbers,
    headers/footers, no blank pages, no raw UUID exposure in any PDF.
38. **Standards official-text result**: Renderer confirmed correct and non-fabricating — omits
    the "Applicable standard" section when no real citation is present in the analysis snapshot,
    and renders it correctly (citation + heading + summary) when one is. The pre-existing,
    documented `regulatory_section`-unpopulated environment gap (network-restricted sandbox) is
    unchanged and unrelated to this session.
39. **Sibling standards isolation**: Structurally isolated (each finding's citation drawn only
    from its own analysis snapshot) — but all 4 findings in the live E2E report cited the same
    `30 CFR 56.14107(a)` despite spanning 4 different hazard families. Recorded as a possible
    standards-matching precision gap worth a dedicated follow-up; not chased further this session
    (no reproducible defect isolated within remaining scope).
40. **Sibling risk isolation**: PASS after fixing defect #5 — independently cross-checked
    against the database; each of the 4 live-reviewed findings' `riskSnapshot` was distinct and
    correctly attributed, not contaminated by a neighboring finding's review.
41. **Sibling corrective-action isolation**: PASS — confirmed via both the P1-02 script
    (explicit cross-contamination check, both directions false) and the live report (4 distinct,
    independent corrective actions, one per finding).
42. **Performance result**: Not formally load-tested this session (an extended curl-loop timing
    check was declined mid-session). No anomalies observed informally: both 228-case V4 runs
    completed with normal pacing (~2.2s/case, no unusual retries beyond the script's built-in
    rate-limit backoff), and all interactive browser actions responded within a few seconds.
    Recommend a dedicated p50/p95 benchmark as part of the next (release-validation) phase rather
    than treating this session's informal observation as a substitute.
43. **Backend build**: PASS — clean `tsc`, zero errors, re-confirmed as the final check.
44. **Frontend build**: PASS — all routes compiled/prerendered, re-confirmed as the final check.
45. **`git diff --check`**: PASS.
46. **HEAD before/after**: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`, unchanged.
47. **Files modified**: exactly 3 — `backend/src/reports/canonical-report-pdf-renderer.ts`,
    `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`,
    `frontend-next/app/inspection-workspace/page.tsx`. No files added or deleted by this session
    (the closure verification directory itself is new, under `verification/`). No commits made.
48. **Working-tree preservation**: Confirmed — the large pre-existing set of uncommitted changes
    (299 lines at session start) was left untouched; only the 3 files above were intentionally
    edited, each tied to a specific demonstrated defect.
49. **Disposable infrastructure teardown**: Completed — all 3 disposable backend instances and
    the frontend dev server stopped, disposable database `test_hazlenz_closure_20260816` dropped
    and confirmed removed. `safescope`'s `migrations` row count (35) confirmed unchanged from
    session start to session end.
50. **Remaining known P2/P3 issues and verified product gaps**: `PHOTO_REPORT_GAP_CONFIRMED`
    (photo evidence doesn't reach the canonical PDF — architecture gap, unchanged); possible
    standards-matching precision gap (item 39); `/reports` list page shows raw inspection UUIDs
    in its heading (PDF itself is fine); `/reports` list page uses light-only card styling
    regardless of active theme (legible, but visually inconsistent in dark mode); 5-hazard
    `hot_work` secondary-tag question (item 27); the `PricingContent.tsx` vs. entitlement
    discrepancy on corrective-action tier noted by the prior phase (unchanged); OSHA/MSHA
    `regulatory_section` unpopulated in this sandboxed environment (documented, unrelated to
    product code); PRA-001/003/004/005/006/007 open items from the earlier PRA-002 remediation
    phase (unrelated, not re-investigated this session). **Recommended next phase**: Final
    Production Release Validation, with a dedicated performance benchmark and a closer look at
    the standards-matching precision observation (item 39) as its first two items.
