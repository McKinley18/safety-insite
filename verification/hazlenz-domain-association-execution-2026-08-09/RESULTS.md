# Results

- Fresh frozen raw: `EXECUTION_FROZEN_RAW.json` in `verification/safety-insite-independent-ai-readiness-2026-08-04`; 180/180 HTTP 201. Corrected scorer result: hazard-family recall 0.993333 (one miss, `holdout-0088`, historical HazCom expected row); scorer also reports unsupported-safe-state 0.525 and requires adjudication rather than being treated as a pass.
- Precision raw: `EXECUTION_PRECISION_RAW.json`; 134/170 HTTP 201, 36 transport failures after three bounded retries. No completion claim is made for the missing rows.
- Evidence-intake holdout: `EVIDENCE_HOLDOUT_RUN.json`; 80/80, 69 PASS, 11 NEEDS REVIEW, 0 FAIL, life-safety misses 0, unsupported definitive promotions 0, safe-state failures 0.
- Metamorphic raw: 120/120 HTTP 201; exact consistency 92.5%.
- Targeted domain-association and narrative regressions: PASS. Backend build, frontend TypeScript/build, and diff-check: PASS.

The frozen recall miss and incomplete precision transport are hard blockers. The browser checks were invoked but could not reach a selected persisted inspection because the disposable development-auth stub uses numeric user id `1` against UUID ownership when bypass is enabled; after disabling bypass, the harness still failed to stabilize the selected-inspection capture state. No inference or production reasoning change was made.
