# P0 Adversarial Identity Matrix

Method: real backend + real browser against disposable DB `test_p0_20260816`, post-fix.

| Case | Tested | Result |
|---|---|---|
| Two findings, review A then B | Yes | `machine-guarding` finalized correctly (Critical), then `lockout-tagout` finalized correctly (Moderate); A's state and risk unaffected by B's review. Zero identity crossover. |
| Two findings, review B then A | Partially — tested as part of a 3-finding sequential run (`machine-guarding` → `lockout-tagout` → `fall-protection`), not as an isolated 2-finding B-then-A case | All three finalized to their own correct `hazardKey`/risk; no crossover observed at any step. Not independently re-run as an isolated 2-case in strict B→A order — recorded honestly as a coverage gap, not fabricated as a pass. |
| Three findings, middle finding reviewed first | No | Not executed as an isolated middle-first case within this phase's time budget. The 3-finding run performed used first→second→third order. Flagged as a coverage gap for a follow-up phase. |
| Reordering (UI sort changes, selection stays by ID) | N/A | No UI reordering/sorting control was observed on the findings-review screens in this build; nothing to test. |
| Refresh (select/review after browser refresh) | Yes (incidental) | A JWT expiry (15-minute token) forced a re-login and full page reload mid-sequence. After re-authenticating and restoring `sentinel_selected_inspection_context`, the in-progress inspection resumed with all prior finding state (`machine-guarding: finalized`) intact; the remaining findings were reviewed correctly afterward. |
| Resume (leave inspection and come back) | Yes | Navigated away to `/inspections`, `/login`, and back to `/inspection-workspace` multiple times across the session; each time the persisted inspection and its findings' correct states were restored via `getPersistedInspection`. |
| Duplicate/similar labels, two findings with similar titles but different IDs | No | Not constructed/tested in this phase. Given the fix keys strictly off `finding.id`/`hazardKey` (never label text) for both the write path (already correct) and the display fix (matches by slugified `hazardKey`, not by display title), duplicate labels are not expected to be a distinguishing risk factor, but this was not empirically verified. Flagged as a coverage gap. |
| Multi-hazard corrective actions — separate actions for sibling findings | Yes | Verified via real PDF export twice (pre-fix showing the defect, post-fix showing correct isolation): `Finding #1 Machine Guarding → "Install or restore a fixed guard over the moving part"`, `Finding #2 Walking/Working Surfaces → "Control walking-surface exposure"` — fully isolated, no cross-contamination. |

## Zero identity crossovers

True for every case actually executed. Two matrix cells (three-finding middle-first order, and duplicate-label disambiguation) were not executed in this phase and are reported as open coverage gaps rather than claimed as passed — see `P0_IMPLEMENTATION_REPORT.md` for the recommended next phase.
