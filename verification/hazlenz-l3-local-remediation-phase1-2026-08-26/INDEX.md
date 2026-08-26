# INDEX — L3 LOCAL REMEDIATION PHASE 1 (2026-08-26)

`L3_LOCAL_REMEDIATION_PHASE1_PARTIAL — ADDITIONAL_LOCAL_REMEDIATION_REQUIRED`
Provider calls **0** · `$0.00` · frozen Run-2 result unchanged.

## replay/
| file | what it is |
|---|---|
| `recorded-output-replay.js` | the zero-cost harness. Loads the digest-asserted Run-2 recording, decomposes each row into the four tiers (provider · validator · binder · scored), applies a downstream transform, and calls the FROZEN scorer. Seals the network; refuses any transform that touches truth. |
| `prove-harness-fidelity.js` | 22 checks. Positive control (identity reproduces the frozen verdict byte-identically on all ten gates), negative control (a wrong transform moves the arithmetic), truth-leak refusal, network-seal interception. |

## analysis/
| file | what it measures |
|---|---|
| `tier-divergence.js` | where the scored, validated and bound tiers disagree (93/93 vs 86/93 A, 85/93 B) |
| `structural-survey.js` | what a downstream layer can actually SEE — and that 3 of 4 `G4` rows are structurally indistinguishable from correct `ACTIVE` rows |
| `counterfactual-scenarios-lib.js` | the six scenario transforms, defined ONCE and shared |
| `counterfactual-scenarios.js` | `RUN2_RECORDED_OUTPUT_COUNTERFACTUAL_REPLAY` — G1–G10 per scenario |
| `safety-vetoes.js` | the Phase-4/7 vetoes measured SUBSTANTIVELY, not through the gates |
| `g9-materiality.js` | `G9-S1` / `G9-S2` split before and after |
| `binder-rejection-precision.js` | the Phase-9 decider: the binder deleted a truth-matching state 8/8 |
| `rc4-grounding-rate.js` | `EVIDENCE_OUT_OF_BOUNDS` rate, 3 / 5,263, with a self-exclusion soundness proof |
| `print-g1-g10-table.js` | renders the counterfactual table |

## results/
`HARNESS_FIDELITY.json` · `TIER_DIVERGENCE.json` · `STRUCTURAL_SURVEY.json` ·
`COUNTERFACTUAL_SCENARIOS.json` · `SAFETY_VETOES.json` · `G9_MATERIALITY.json` ·
`BINDER_REJECTION_PRECISION.json` · `RC4_GROUNDING_RATE.json` · `G1_G10_COUNTERFACTUAL_TABLE.txt`

## regression/
15 suite logs. 14 zero-cost suites pass with 1,035 assertions; `hazlenz-core`'s two failures are
pre-existing Level-1 suites structurally unreachable from this phase's edits.

## preservation/
`prove-preservation.js` · `PRESERVATION.json` — 36/36.

## Production changes (2 files, both in `backend/src/safescope-v2/reasoning-l3/`)
| file | sha256 |
|---|---|
| `condition-state-resolution.ts` (new) | `47278ea374edceb35f567f5e5781108828d9d514e6ae25be5df36e390d6f13e6` |
| `reasoning-runner.ts` (modified) | `599f5d2ab479a2b3bf4097c1068aa8c2790b9b70e7a8b11b0bab3ea7b2174cc8` |
| `backend/scripts/test-l3-condition-state-resolution.ts` (new suite, 155 assertions) | — |

## Reproduction
```
node verification/hazlenz-l3-local-remediation-phase1-2026-08-26/replay/prove-harness-fidelity.js
node verification/hazlenz-l3-local-remediation-phase1-2026-08-26/analysis/counterfactual-scenarios.js
node verification/hazlenz-l3-local-remediation-phase1-2026-08-26/analysis/safety-vetoes.js
node verification/hazlenz-l3-local-remediation-phase1-2026-08-26/analysis/g9-materiality.js
node verification/hazlenz-l3-local-remediation-phase1-2026-08-26/analysis/binder-rejection-precision.js
node verification/hazlenz-l3-local-remediation-phase1-2026-08-26/analysis/rc4-grounding-rate.js
node verification/hazlenz-l3-local-remediation-phase1-2026-08-26/preservation/prove-preservation.js
cd backend && npm run test:l3-condition-state-resolution
```
