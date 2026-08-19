# State-aware HazLenz metrics

| Metric | Before | After |
|---|---:|---:|
| Legacy expected-family recall | 77.78% | 92.59% |
| Adjudicated ACTIVE family recall | 0.00% | 100.00% |
| Adjudicated semantic family recall | 50.00% | 100.00% |
| Canonical family recall | 0.00% | 100.00% |
| State accuracy on represented rows | 0.00% | 100.00% |
| Unsupported ACTIVE promotion | 0.00% | 0.00% |
| Definitive unsupported promotions | 0 | 0 |
| Safe-state unsupported rate | 0.00% | 0.00% |
| Clarification recall | 100.00% | 100.00% |
| Metamorphic consistency | 92.50% | 92.50% |

The remaining ten legacy misses are the duplicated solvent/sealed-container oracle rows. They remain in the frozen corpus and are not silently relabeled.

The pre-change adjudicated values are intentionally canonical-projection values: internal provisional/absorption mentions do not count as a persisted or user-facing finding. After the fixes, both true-miss clusters appear in the canonical decomposition with the expected state.
