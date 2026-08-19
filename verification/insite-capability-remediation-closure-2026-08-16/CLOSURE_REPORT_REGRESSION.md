# CLOSURE — Professional Report Regression (Live PDF Generation + Fix)

Date: 2026-08-16. Branch `main`, HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged —
this session's fix is uncommitted working-tree only, per operating rules: no commits).

## What was generated

Three canonical reports built end-to-end through the real API (site → inspection → observation →
analysis → review → finding → corrective action → transition to `in_review`/`completed` →
`POST /inspections/:id/reports` → `GET /inspection-reports/:id/versions/1/download`), all against
the disposable DB, all opened and read as real PDFs (not just checked for HTTP 201):

- **Report A** — 1 finding (machine guarding). 6-page PDF.
- **Report B** — multi-hazard, 3 independent findings (hazardous energy, electrical, fall
  protection) from one observation. 6-page PDF.
- **Report C** — long-content stress report, 8 independent findings across 8 observations
  (machine guarding, electrical, hazardous energy, fall protection, respiratory, struck-by,
  ergonomic, fire hazard), each with padded long-form observation text. 8-page PDF.

All three: correct cover page, executive summary, inspection metadata, sequential finding
numbering, independent per-finding sections (no cross-finding text bleed), independent
corrective actions, page footers reading "Page X of Y" (content-relative, cover page
unnumbered — no regression), running header on every content page, short truncated
record-reference codes only (e.g. "138EBE48") — **no raw UUID exposure anywhere in the
rendered text**, no legacy branding, no blank pages, no incorrect official-text labeling.

## Defect found and fixed: Executive Summary / risk badge silently drops reviewer-confirmed risk

While verifying "independent risks" and "standards official-text" rendering, Reports A/B/C all
showed **"Not rated"** for every finding and all-zero Risk Distribution — traced this to my own
test payloads omitting `riskAssessment` on finding creation, not a product bug at first glance.
To close the loop I generated a finding with a real risk assessment using the **exact payload
shape the guided-review UI actually sends** (`app/inspection-workspace/page.tsx`'s `reviewerRisk`
state: `{ severity, likelihood, exposure, overallRisk, rationale }` — capitalized values like
`"High"`, no `riskBand` key at all) and reproduced a genuine, live, reachable defect:

- `backend/src/reports/canonical-report-pdf-renderer.ts` read risk only from
  `riskSnapshot.riskBand`.
- The system-generated risk path (`computeFindingRisk()` → `evaluateRisk()` in
  `inspection.service.ts`) does write `riskBand` (`'Low'|'Moderate'|'High'|'Critical'`).
- But the **primary, canonical reviewer-confirmed path** — a qualified person using the guided
  finding-review UI's "Confirm risk and finalize finding" button, the main way risk actually gets
  set in real use — persists the chosen band under `riskSnapshot.overallRisk`, never `riskBand`.
- Result: every reviewer-confirmed finding rendered as "Not rated" in the professional report and
  was silently excluded from "Critical/High risk findings" and "Risk Distribution" — a real
  safety-reporting correctness defect, not cosmetic (a qualified reviewer's High/Critical call
  would disappear from the report a manager reads).

**Fix** (smallest generalized correction, 3 read-sites + 1 helper,
`canonical-report-pdf-renderer.ts`): added `findingRiskBand(riskSnapshot)`, which reads
`riskBand` first and falls back to `overallRisk` (treating the dropdown's default
`"Not established"` as unrated), and used it at all three places risk is read: the Executive
Summary aggregation, the Findings Summary table, and the Detailed Findings risk badge. Backend
`tsc` build: clean. `git diff --check`: clean.

**Verified fixed, live**: regenerated a fresh report with the exact real-UI payload shape
(`riskSnapshot: {severity, likelihood, exposure, overallRisk: "High", rationale, source:
"reviewer_confirmed", ...}` — confirmed no `riskBand` key present). The new PDF correctly shows
"Critical / High risk findings: 1", a filled orange "High: 1" bar in Risk Distribution, and a
correctly colored "HIGH" badge in Detailed Findings (previously muted gray from a `RISK_COLOR`
lookup miss). Also confirmed (separately) that when `riskBand` *is* present alongside
`overallRisk` — the earlier ad hoc test — nothing regressed; the `riskBand`-first fallback order
means system-generated snapshots are unaffected.

## Standards / official-text rendering — confirmed correct, no fabrication

Reports A/B/C showed no "Applicable standard" section per finding because my test payloads never
put a `primaryCitation`/`executiveJudgment.topStandard` in the analysis `resultSnapshot` — traced
via `extractStandard()` in the renderer, which is explicitly commented "Honest, never-fabricated
standard summary... drawn only from what HazLenz actually produced," and correctly returns `null`
(section omitted) rather than inventing a citation. Verified the positive case too: an analysis
snapshot with a real `primaryCitation`/`topStandard` renders "APPLICABLE STANDARD — 29 CFR
1910.303(g)(1) — Electrical — working space about equipment" correctly. Matches the documented,
pre-existing OSHA/MSHA `regulatory_section`-unpopulated environment gap — not a regression.

## Environment note (not a code defect)

Both disposable backend instances initially lacked `STORAGE_LOCAL_ROOT`, which the report
generator's `StorageService.store()` call needs (reports are persisted as blobs before download).
`LocalTestStorageProvider` correctly threw rather than silently degrading. Fixed by setting
`STORAGE_LOCAL_ROOT=/tmp/closure-storage-<port>` on the disposable backends and restarting — a
verification-harness setup step, not a change to any tracked file.

## Result: **Report regression PASS, one defect found and fixed**

Files changed this phase: `backend/src/reports/canonical-report-pdf-renderer.ts` only.
