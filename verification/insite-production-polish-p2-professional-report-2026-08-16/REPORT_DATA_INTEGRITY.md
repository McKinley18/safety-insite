# Production Polish P2 — Data Integrity & Sibling Isolation

## Method

Three real inspections (Reports A/B/C) were driven end-to-end through the actual canonical API (register → login → create site/inspection/observation → real `/safescope-v2/classify` call → submit analysis snapshot → review → finalize → corrective actions → transition → generate report → download PDF) against a disposable database (`test_reportp2_20260816`). Report C's underlying data was then queried directly from Postgres and cross-checked against the rendered PDF.

## Report C direct DB query (7 findings, 3 hazard families spanning "no action" and "has action" cases)

```
id             hazardKey                  riskBand   sev  lik  conclusion (truncated)
5b8b5f30…      machine-guarding           High       4    3    Additional hazard identified during decomposition: guard.
330ef3d1…      guarding-interlocks        High       4    3    During a full-shift walkthrough of the fabrication bay...
47e6c155…      compressed-gas             High       4    3    Oxygen and acetylene cylinders were stored together...
1fa6c435…      hot-work                   Moderate   2    3    Additional hazard identified during decomposition: hot_work.
eefd09a8…      housekeeping               Moderate   2    3    Additional hazard identified during decomposition: debris.
a443231a…      emergency-egress           Moderate   2    3    Additional hazard identified during decomposition: egress.
08c83064…      walking-working-surfaces   Moderate   3    3    Pallets and packaging debris were partially obstructing...
```

Every row has a distinct `id`, distinct `hazardKey`, and independently-computed `riskSnapshot` — no two findings share risk values by coincidence of copy-paste (330ef3d1 and 5b8b5f30 both happen to be High/4/3 because they came from the same severe observation, decomposed into two related hazards — a legitimate outcome, not contamination, confirmed by their entirely different `hazardKey`s and conclusions).

```
corrective_actions.findingId  →  title
330ef3d1…                      →  Restore CNC Mill 3 point-of-operation interlock and remove bypass
47e6c155…                      →  Separate and secure compressed gas cylinders
08c83064…                      →  Clear obstructed egress route at receiving dock
```

Cross-referenced against the rendered PDF: the Corrective Action Summary table showed exactly these three actions against **Finding #2, #3, #7** — which are precisely the 2nd, 3rd, and 7th rows of the findings table above, in creation order. Exact match, DB → PDF, with zero manual reconciliation needed.

## Sibling isolation — risk

Confirmed live for Report B (`Findings Summary` table): Machine Guarding = Critical, Fall Protection = Critical, Electrical = High, Lockout/Tagout = Moderate — four distinct findings from three source observations, each independently risk-rated (no shared/duplicated risk value across dissimilar hazards).

## Sibling isolation — standards

Confirmed live for Report B: Finding 1 (Machine Guarding) cited `29 CFR 1910.212(a)(3)(ii)`; Finding 2 (Fall Protection) cited `29 CFR 1910.28(b)(1)`; Findings 3/4 (Electrical / Lockout-Tagout, same source observation) both cited `29 CFR 1910.147` — correct, since both genuinely concern hazardous-energy control from the same evidence, and each still carries its own independent risk/review/action state.

## Sibling isolation — corrective actions

Confirmed live for both Report B and Report C: every corrective action's `findingId` in the database matches exactly the finding it appears under in the rendered PDF, and findings without an action (Report B's Finding 3/Electrical; Report C's Findings 1, 4, 5, 6) correctly show no "Recommended Corrective Action" block at all rather than an empty placeholder or a neighboring finding's action.

## No regenerated risk replacing validated risk

The renderer (`canonical-report-pdf-renderer.ts`) contains no risk-scoring logic of any kind — it only reads `finding.riskSnapshot` fields that were already computed and persisted by `InspectionService.computeFindingRisk()` (protected V5-C01 surface, untouched this phase) at reconciliation/finalization time. Confirmed by source read: no `severity * likelihood`, no band-threshold logic, anywhere in the new file.

## No generated paraphrase labeled as official text

Every standard-text line the renderer can emit is explicitly prefixed `HazLenz standard summary:` (see `REPORT_STANDARDS_VERIFICATION.md`); the string "Official" never appears anywhere in the renderer source.
