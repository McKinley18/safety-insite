# V5-C04 Performance Notes

Date: 2026-08-16

## What changed computationally

Two synchronous, O(1), hardcoded-return functions (`CorrectiveActionControlMapService.mapControls()`
and `GovernanceReportAdapterService.adapt()`) were removed from the classify() call path. Neither
performed I/O, loops over evidence text, or any non-trivial work — both simply constructed and
returned a fixed literal object. The dead-but-protected chain
(`SafeScopeNativeReasoningService`/`SafeScopeActionQualityService`/`SafeScopeControlEffectivenessService`)
was **not** removed (blocked by protected-file constraint, see runtime census) and its constructor
cost is a one-time, per-process-singleton cost, not a per-request cost — it was not measured here
because it is unaffected by this phase's changes.

## Measurement approach and honest limits

Wall-clock timing of a full `classify()` call is dominated by the ~60-engine orchestrator pipeline
(hazard classification, standards matching, multi-hazard decomposition, ~10+ intelligence layers,
etc.), running on a disposable local dev instance under `ts-node` (no JIT warmup control, no
isolation from other local processes). A handful of single-request curl timings is not a rigorous
enough sample to detect a sub-millisecond delta from removing two O(1) function calls, and no such
claim is made.

Observed per-request wall-clock time after the removal (5 consecutive requests, disposable backend,
port 4300): 0.17s, 0.09s, 0.08s, 0.08s, 0.07s. This is consistent with, not meaningfully different
from, informal timings taken earlier in the same session before the removal. No measurable
per-request latency improvement is claimed.

## What was measured and is honestly attributable to this change

Response payload size for the same fixture, same code path, before vs. after removal:

- Before (`controlMap` + `adapter` present): 76,608 bytes
- After (both removed): 75,324 bytes
- Delta: 1,284 bytes smaller (~1.7%)

This reduction applies to every `classify()` HTTP response and every `hazlenz_analyses.resultSnapshot`
row persisted going forward (the removed fields are no longer computed, transmitted, or stored).

## Conclusion

The removed computations were negligible from a CPU-cost standpoint (two cheap object literals);
the real, measurable benefit of removing them is response/payload/storage size and elimination of
misleading placeholder content from the wire and from persisted rows, not raw performance. This
matches the task's own framing of the concern ("consuming CPU without affecting decisions" was one
of several listed symptoms, not the primary one for these two engines — "misleadingly present in
production outputs" is the more accurate characterization here). No overclaiming of a performance
win is made.
