# Blind failure clusters

Source corpus: b494c0038b241e15f2facc86a66af49059b9c599bfb552d0920370eba128c5e3

- Total scenarios: 180
- Failure rows: 32
- Life-critical misses: 0
- Safe-state unsupported rate: 0.05

| Cluster | Count | First iteration decision |
|---|---:|---|
| candidate_generation_or_family_mapping | 20 | Prioritize only after confirming upstream evidence loss; do not tune to IDs. |
| multi_hazard_decomposition_or_dominance | 10 | Prioritize only after confirming upstream evidence loss; do not tune to IDs. |
| safe_state_boundary_or_downstream_serialization | 2 | Prioritize only after confirming upstream evidence loss; do not tune to IDs. |

Final stage tracing confirmed the first two clusters were response/decomposition visibility losses and the safe-state cluster was a compatibility-adapter leak. General fixes were implemented and all 32 expected family observations are now returned; residual non-safe forbidden-family rows are tracked separately in `HAZLENZ_FINAL_PHASE_RESULTS.json`.
