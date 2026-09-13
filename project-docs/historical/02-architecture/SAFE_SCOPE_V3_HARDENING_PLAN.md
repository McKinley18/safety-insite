# SAFE_SCOPE_V3_HARDENING_PLAN.md

## Current Checkpoint
- **Commit:** 4c1bc6e
- **Golden Hazard Tests:** 11/11 Passed
- **Golden Standards Tests:** 5/5 Passed
- **Source-Grounded Gauntlet:** 100/100 Passed
- **Generated v2 Gauntlet:** 500/500 Equivalent

## Production Readiness Definition
- Fully validated against both synthetic (v2 500) and real-world (source-grounded 100) datasets.
- Zero integrity failures in gauntlet datasets.
- All golden tests pass at 100%.

## Testing Layers
- **Golden Hazard Tests:** Logic verification for taxonomy and classifier.
- **Golden Standards Tests:** Mapping verification for regulatory citations.
- **Generated v2 Gauntlet:** Systemic edge-case coverage.
- **Source-Grounded Gauntlet:** Real-world fidelity against MSHA/OSHA reports.
- **Dataset Integrity Audit:** Continuous enforcement of dataset consistency and source-grounding metadata.

## Pass/Fail Thresholds
- Build: 100% Pass.
- Golden Tests: 100% Pass.
- Gauntlets: 100% on Source-Grounded, >95% on v2.

## Phases
- Phase 1: Tooling (Audit/Summary gates).
- Phase 2: Source-grounded expansion (100 -> 250).
- Phase 3: Standards quality (Citation relevance audits).
- Phase 4: Confidence/Reviewer logic hardening.
- Phase 5: Database-backed source intelligence engine.
