# Phase 3 — The actual executable customer reasoning path

Traced from source at HEAD `1feda622`. **Executable behaviour, not intended behaviour.**
`D` = deterministic · `S` = semantic · `CA` = customer-authoritative today.

| # | Stage | File · symbol | Decision performed | D/S | CA | Level-3 authority |
|---|---|---|---|---|---|---|
| 1 | Request entry | `safescope-v2.controller.ts::classify()` | auth, entitlement, regulatory-context resolution | D | yes | **keep D** |
| 2 | Text normalization | `hazlenz-evidence-boundary.ts::normalizeHazardObservationText()` | canonicalizes observation text | D | yes | **keep D** (offset base for evidence binding) |
| 3 | Structured-observation merge | `safescope-v2.service.ts::mergeStructuredObservation()` | merges prior + current + clarification answers | D | yes | **keep D** |
| 4 | Evidence fusion | `evidenceFusion.synthesize()` → `fusedText` | concatenates observation + evidence texts | D | yes | **keep D**, but must preserve source provenance per span |
| 5 | **Primary classification** | `classifier.classify(fusedText)` (`weighted-classifier.service.ts`) | the hazard family label | **D (lexical)** | **yes** | **RETIRE from customer authority → SEMANTIC** |
| 6 | Risk | `evaluateRisk({...})` | severity/likelihood/band | D (matrix) | yes | **HYBRID** — semantic factors, deterministic scoring |
| 7 | Advisory reasoning | `reasoningOrchestratorService.reason()` — **synchronous** | jurisdiction assessment, hazard classification, missing evidence, applicability signals, corrective-action reasoning, equipment/mechanism detection, contradiction intelligence | D | **yes, despite the name** | **RETIRE from customer authority; keep as retrieval signal** |
| 8 | Knowledge routing | `knowledgeRouter.route()`, `knowledgeShardService.getShardSummary()` | shard/route selection | D | yes | **keep as retrieval signal** |
| 9 | **Standards retrieval (Path A)** | `applicableStandards.suggest()` — 15 stages over `standards_master` | eligible candidate citations, ranked, jurisdiction-filtered, truncated | D | yes | **KEEP D AND AUTHORITATIVE** — this is what makes `L3-INV-01` structural |
| 10 | Citation recovery | `citationRecoveryService.recover()` | recovers citations when arrays empty | D | yes | keep as guardrail; re-scope |
| 11 | **Corrective actions** | `actionEngine.generateActionsFromReport()` | selects a canned hazard→fixes template | **D (template)** | **yes** | **RETIRE from customer authority → SEMANTIC intent + D grounding** |
| 12 | **Intelligence orchestration** | `intelligence-orchestrator.service.ts::evaluate()` — the **single call site** at `safescope-v2.service.ts:1576`, inside try/catch | `observationContextEngine.normalize`, `observationUnderstandingEngine.evaluate`, **`multiHazardEngine.decompose(fusedText)`**, `buildEvidenceFacts()`, confidence/reasoning/trend/energy engines | **D** | **yes** | **THE SEAM — see §Seam** |
| 12b | Degraded fallback | `safescope-v2.service.ts:1392 buildDegradedHazLenzIntelligence()` | on heap-guard or config-disable, emits family-keyed `evidenceGaps` + `classReason` prose | **D (template)** | **yes** | **RETIRE — it is the `L3-INV-10` anti-pattern already in the tree** |
| 13 | Evidence boundary | `enforceHazLenzEvidenceBoundary()` | suppresses unsupported citations | D | yes | keep as guardrail |
| 14 | **Per-finding predicates (Path B)** | `evidence/evidence-foundation.ts::applyEvidenceFoundation()` | applicability predicates and **citation selection in code** | D | yes | **semantic applicability over retrieved candidates only**; citation identity stays D |
| 15 | Finding-scoped standards | `applyFindingScopedStandards()` → `hydrateFindingScopedStandards(cutover)` | per-finding hydration + governed resolution | D | yes | **keep D** |
| 16 | Finalization gate | `applyFinalizationGate()` | may-finalize state | D | yes | keep D |
| 17 | Display sanitize | `sanitizeHazLenzDisplayOutput()` | strips internal vocabulary | D | yes | keep D |
| 18 | **Contract repair** | `controller::ensureVisiblePrimaryCitationContract()` | regex-recovers a citation when arrays are empty | **D (regex)** | **yes** | **RETIRE — repair-by-regex is not a reasoning contract** |
| 19 | Guided response | `attachGuidedFindingResponse()` | customer finding projection | D | yes | keep D (rendering) |
| 20 | **Verified-control display** | `controller::enforceVerifiedControlDisplay()` | regex detects "verified control" phrasings and strips hazards | **D (regex)** | **yes** | **RETIRE — this is RC-01 compensation in the presentation layer** |
| 21 | Governed/shadow boundary | `orchestrateShadowRequest()` | the ONE cutover seam | D | yes | **UNCHANGED** |
| 22 | Persistence + provenance gate | `inspection.service.ts::addAnalysis()` → `resolveKnowledgeReleaseId()` | server-side provenance | D | yes | **UNCHANGED** |
| 23 | Finalization | `finalizeFinding()` | requires a current human review per finding | D | yes | **UNCHANGED** — measured working |
| 24 | Report + PDF | `canonical-reports.service.ts`, `canonical-report-pdf-renderer.ts` | closed-allowlist rendering | D | yes | **UNCHANGED** |

## What this establishes

**Every substantive semantic judgement a customer sees today — what the hazard is, how many hazards
there are, whether the condition is active, which evidence supports it, and what to do about it — is
made by deterministic lexical machinery (stages 5, 7, 11, 12) and then patched by regex in the
presentation layer (stages 18, 20).** Stages 9, 15, 21–24 are deterministic *and correct*, and the
Level-3 design must not disturb them.

## The seam

**`intelligence-orchestrator.service.ts::evaluate()`, called from exactly one place
(`safescope-v2.service.ts:1576`), already inside a try/catch with a fallback contract.**

Selected over the alternatives on blast radius and structural invariant preservation:

| Candidate seam | Rejected because |
|---|---|
| Inside `classifier.classify()` | Replaces a label, not the reasoning; leaves decomposition, condition state and evidence binding untouched |
| A new pre-stage before `service.classify()` | Adds semantics without removing deterministic authority — both would compete |
| A new controller-level boundary beside `orchestrateShadowRequest()` | Duplicates orchestration and bypasses the persistence snapshot shape |
| **`intelligenceOrchestrator.evaluate()`** | **Selected** |

Why it is the smallest correct seam:
* it already **owns** the four artifacts behind RC-01, RC-04, RC-07 and RC-08 — `multiHazardDecomposition`, `observationUnderstanding`, `sharedEvidenceFacts`, `confidenceIntelligence`;
* it is called from **one** place, already guarded, already has a documented fallback state;
* it returns a structured object the whole downstream pipeline already consumes, so persistence, guided-finding projection, reports and PDFs need **no rewrite** (Phase 36 Q12);
* it **does not** own standards retrieval (stage 9) or governed content (stages 15, 21) — so `L3-INV-01`, `L3-INV-03` and `L3-INV-09` hold **structurally**, not by policy;
* corrective action (stage 11) and Path B applicability (stage 14) sit outside it, which is why they become **later slices** rather than one large rewrite.
