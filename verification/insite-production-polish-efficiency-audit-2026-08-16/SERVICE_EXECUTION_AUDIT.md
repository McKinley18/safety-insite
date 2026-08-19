# Service Execution / Dead-Work Audit

Method: source trace of every service invoked in one classify request, cross-referenced with what actually consumes each service's output downstream. C04 already removed the previously-identified dead placeholders (`corrective-action-control-map`, `governance-report-adapter`) — confirmed still absent in `POLISH_EFFICIENCY_BASELINE.md`. This pass looked for *remaining* or *new* unconsumed work without assuming deadness from static imports alone (each item below was traced to its actual read sites, or lack thereof).

## Per-service classification

| Service | Runs unconditionally? | Consumer | Classification |
|---|---|---|---|
| `multi-hazard-decomposition.service.ts` decompose() **[PROTECTED]** | Yes | Promoted to `additionalHazards`, drives temporal narrative | DECISION_CRITICAL |
| `deterministic-classifier.ts` **[PROTECTED]** | Yes | Root `promotedPrimary`, feeds nearly everything | DECISION_CRITICAL |
| `reasoning-orchestrator.service.ts.reason()` (standards/applicability + temporal + vague-input) | Yes | `advisoryReasoning.inspectionIntelligence.*` | DECISION_CRITICAL |
| `applicable-standards.suggest()` | Yes (awaited) | `suggestedStandards` | DECISION_CRITICAL |
| `ObservationContextService.normalize()` | Yes | Only `rawObservation`/`normalizedText` are actually read downstream | **CONDITIONAL_CANDIDATE / partially REMOVABLE_CANDIDATE** — the service's `detectedEquipment`/`detectedTasks`/`detectedUnsafeConditions` outputs have **zero downstream readers** found in this trace |
| `ObservationUnderstandingService.evaluate()` | Yes | Feeds `scenarioIntelligence`, `evidenceSufficiency`, corrective-action engine | DECISION_CRITICAL |
| `EvidenceSufficiencyService.evaluateEvidenceSufficiency` | Yes | The service's own inline comment states its **top-level verdict is never read** by `safescope-v2.service.ts` (0 references found); inner facts do feed other engines | **UNCONSUMED (top-level verdict) / REUSED (inner facts)** — mixed |
| `EvidenceQuestionGenerationService.generateQuestions` | Yes | Attached to output at `orchestrator.ts:912` but **never read downstream** (0 references in service.ts or the display layer) | **UNCONSUMED** |
| `EvidenceGapQuestionGeneratorService.generate` | Yes | Feeds `narrative.generate/enrich` — this *is* consumed | REUSED |
| `RiskReasoningBrainService.evaluate` **and** legacy `evaluateRisk()` | Both unconditional | Legacy feeds `promotedPrimary.risk` (the risk actually shown to users); the "brain" version only feeds `calibrationMeta.riskBand`/governance | **DUPLICATED** — two independent risk-reasoning implementations run on every request; only one drives the user-visible risk |
| `CorrectiveActionBrainService`, `DefensibleCorrectiveActionService`, `ActionEngineService` (3 separate corrective-action generators) | All unconditional | All three merged into final actions | **DUPLICATED** — 3 independent corrective-action generation paths per request, merged at the end. This is directly relevant to the content-mismatch defect found live in `CORRECTIVE_ACTION_UX_AUDIT.md`: 3 independent generators merging output is a plausible mechanism for cross-hazard content bleed. |
| `HazardInformationAbsorptionService.absorb`, `FieldOutputComposerV1Service.compose`, `LearningCandidateQueueService.createCandidate` | Yes (awaited) | Attached to output but **never read downstream** | **UNCONSUMED** — awaited (i.e., blocking request latency) for output nobody reads |
| `ApprovedKnowledgeRetrievalOutputV1Service.retrieve` | Yes | Only `Boolean(intelligence.retrieval)` is used — the rich retrieval payload itself is discarded | **UNCONSUMED (payload) / REUSED (boolean flag only)** |
| Entire `evaluate()` (~50 engines) | **The only real gate in the whole pipeline**: skipped and replaced by a degraded stub when a Render heap-memory guard trips or config disables it | — | CONDITIONAL_CANDIDATE at the top level only |
| `enforceHazLenzEvidenceBoundary` | Yes — invoked **twice** per request (`controller.ts:262` and `268`) | Final response shape | **DUPLICATED** (literal double-invocation) |

No LLM/external AI API calls exist anywhere in this pipeline (confirmed by source search) — every "intelligence"/"brain" service is deterministic regex/rule logic.

## Headline efficiency findings
1. **Three independent corrective-action generators run and get merged on every request.** This is the strongest efficiency finding *and* plausibly connects directly to the live-observed content-mismatch defect — worth investigating together, not as separate workstreams.
2. **Two independent risk-reasoning implementations run on every request**, but only one actually drives the user-visible risk rating.
3. **At least 4 services' outputs (`ObservationContextService`'s detected-entity fields, `EvidenceQuestionGenerationService`, the absorption/composer/learning-queue trio, and most of the knowledge-retrieval payload) are computed and awaited but never consumed by anything downstream** — this is real, unrewarded latency and memory cost on every single classify call, and is the most direct explanation for the response-payload bloat measured in `API_PAYLOAD_AUDIT.md`.
