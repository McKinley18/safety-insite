# Pipeline-loss analysis

The frozen holdout rows contain 32 misses. The prior blind evaluation recorded only final family output, so internal-versus-downstream loss cannot be proven from this artifact alone. The actionable next instrumentation is to persist stage-level family sets (candidate, decomposition, serialization) under an opaque request correlation ID without exposing evaluator answers.

Observed evidence-bound clusters are safe-state boundary/serialization (2) and candidate-generation/family mapping (20). The current phase implemented and reran general corrections; the final metrics and residual forbidden-family rows are recorded in `HAZLENZ_FINAL_PHASE_RESULTS.json`.
# Pipeline loss analysis

The prior aggregate failures were not caused by transport or persistence in this focused endpoint evaluation. The decomposition engine already identified the secondary mechanisms, but the orchestrator response left them nested under `multiHazardDecomposition` while downstream consumers primarily read `additionalHazards`. Family labels also remained machine keys (`hot_work`, `chemical_release`, `powered_industrial_trucks`) rather than the display labels used by the compatibility scorer. This was a serialization/response-contract loss, not a reason to broaden the classifier.

The active chemical-release fallback initially matched “release status unknown”; that predicate was tightened to require an active leak/spill/release statement. A controlled-condition adapter separately reintroduced an UNKNOWN hazardous-energy candidate; it now suppresses applicability decisions when the condition state is explicitly controlled or verified safe.

Final stage trace results show all 32 formerly failed expected family observations returned after these general corrections. Remaining eight forbidden-family rows are non-safe contradiction/condition-state cases and are intentionally not hidden by this phase.
