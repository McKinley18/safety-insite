# Validated HazLenz failure clusters

The original 32 failure rows were replayed with evaluation-only stage tracing against the authenticated production endpoint. All 32 expected families now appear in the final response after the evidence-bound changes.

| Cluster | Original rows | Result after iteration | Layer |
|---|---:|---|---|
| multi-hazard decomposition / dominance and response serialization | 22 | Resolved for the 22 formerly missed family observations | decomposition + response contract |
| candidate generation / family mapping | 10 | Resolved for hot-work, chemical identity/release, and powered-truck family aliases | taxonomy + decomposition + response contract |

No life-critical family was among the 32 failed rows. Safe-state false positives were a separate downstream compatibility issue and were corrected by preventing controlled-condition outputs from inheriting UNKNOWN applicability decisions.