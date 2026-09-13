# SAFE_SCOPE_V3_CHECKLIST.md

## Next Work Session Tasks

- [ ] Execute `node tools/safescope-gauntlet/run-all-safescope-checks.mjs` to establish v3 baseline.
- [ ] Expand source gauntlet from 100 to 125 scenarios:
    - [ ] Curate 25 additional high-quality MSHA/OSHA sources.
    - [ ] Update `SAFE_SCOPE_SOURCE_LEDGER.md`.
    - [ ] Append to `safescope-gauntlet.source.v1.json` & `safescope-source-intelligence.v1.json`.
- [ ] Maintain 1:1 source intelligence parity and ensure 0 integrity failures.
- [ ] Run `node tools/safescope-gauntlet/audit-source-quality.mjs`.
- [ ] Run `node tools/safescope-gauntlet/run-gauntlet.mjs`.
- [ ] Triage any new failures using the standard triage category rules.
- [ ] Do NOT edit engine logic until new failures are fully categorized.
