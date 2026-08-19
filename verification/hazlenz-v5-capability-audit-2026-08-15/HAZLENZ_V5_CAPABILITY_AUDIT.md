# HazLenz V5 Capability, Intelligence & Efficiency Gap Audit

**Date:** 2026-08-15/16 · **Repo HEAD:** `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged) · **Mode:** diagnosis/architecture/product-design only — no production code modified.

**Companion documents:** `HAZLENZ_V5_ARCHITECTURE_MAP.md` (pipeline trace), `HAZLENZ_V5_CAPABILITY_BACKLOG.json` (scored/ranked backlog), `HAZLENZ_V5_EFFICIENCY_ANALYSIS.md` (efficiency detail), `HAZLENZ_V5_VALIDATION_PLAN.md` (new test matrices).

**Foundational finding governing this whole audit:** HazLenz's entire reasoning pipeline is deterministic, hand-authored TypeScript — there is no LLM/model call anywhere in it (see Architecture Map §0). This is not a defect to fix; it explains both the strength (228/228 recognition is a real, auditable, reproducible engineering achievement) and the ceiling (every "intelligence" module is only as smart as the regex/rule author anticipated) of the current system. It is the central fact any V5 design must reckon with.

---

## 1. Current HazLenz pipeline

See `HAZLENZ_V5_ARCHITECTURE_MAP.md` for the full stage-by-stage trace (16 stages, observation → persisted finding → report). Summary: one ~3,900-line `classify()` method fans out to a ~60-service deterministic "intelligence orchestrator," itself lazily constructed outside NestJS DI. Ten specific instances of duplicated reasoning, dead/disconnected computation, or information loss between stages are catalogued there (§3), including two parallel risk engines, two parallel standards engines, 3-4 parallel corrective-action engines, and a fully live-but-dead-code control-hierarchy QA layer.

## 2. Finding-scoped intelligence / PRA-006 — deep dive

**Current architecture:** risk is computed **twice**, and both times **once per `classify()` request, scoped to the single primary classification** — never per decomposed hazard.

- `risk/risk-engine.ts` `evaluateRisk({text: fusedText, classification: promotedPrimary.classification, riskProfileId})` runs once at `safescope-v2.service.ts:990`, before decomposition even happens. Its output becomes `promotedPrimary.risk`.
- `brain/risk-reasoning.service.ts` `RiskReasoningBrainService.evaluate(scenarioIntelligence, evidenceGaps)` runs once inside the orchestrator (`intelligence-orchestrator.service.ts:388`), where `scenarioIntelligence` is itself derived once from `promotedPrimary.classification` (`orchestrator.ts:363`).
- `multi-hazard-decomposition.service.ts` (protected V4 file) computes **zero** risk/severity/likelihood fields per hazard — confirmed by direct search (zero matches for "risk"/"severity"/"likelihood" in that file). Decomposition identifies *which* hazard families are present, evidence, mechanism, and condition state — not their risk.
- Persistence: `human_reviews.reviewedConclusion.reviewerRisk` is captured once per **review** (not per finding); `inspection_findings` has zero risk-related columns (confirmed via `\d inspection_findings` during the PRA-002 remediation). When a "split" disposition creates 2+ findings from one review, they inherit the review's one risk object by construction, not by omission.

**Concrete realistic examples, traced against the actual `evaluateRisk()` logic:**

- *Exposed electrical conductor + missing machine guard* (one observation, two hazard families: `Electrical`, `Machine Guarding`). `promotedPrimary.classification` resolves to whichever family the weighted classifier scores highest — say `Electrical`. `evaluateRisk()` then applies its `Electrical` branch (severity → major, fatality potential → high) and its keyword boosts (`"live"`, `"exposed"` → likelihood up). The `Machine Guarding` finding inherits this exact risk object, including `reasoning: ["Electrical hazards can create serious or fatal exposure."]` — a rationale that never mentions the guard. If the guard hazard's *own* severity/likelihood profile differs (e.g., lower likelihood because the machine is currently de-energized for a separate reason), that distinction is invisible; the reviewer sees one risk band for both.
- *Silica exposure + fall exposure* — same structural problem, worse consequence: silica (chronic, cumulative, `Housekeeping`/`industrial_hygiene`-adjacent) and fall-from-height (acute, immediate) have fundamentally different exposure-frequency and severity profiles. `evaluateRisk()`'s `Fall`/`Fall Protection` branch forces severity to `major` and fatality potential to `high` if `Fall` is primary; if `Housekeeping`/silica is primary instead, the fall finding could inherit an under-stated risk band, or vice versa — the direction of the error depends entirely on classifier ordering, not on the actual comparative risk.
- *Suspended load + struck-by/mobile-equipment exposure* — this is the exact scenario reproduced live during the production-readiness and PRA-002 audits: 3 findings (`mobile_equipment`, `suspended_loads`, `powered_industrial_trucks`) shared one risk object whose `reasoning` array explicitly named only "Mobile Equipment / Traffic hazards," even though a suspended load's struck-by mechanism (falling object, vertical energy) and a mobile-equipment pedestrian-strike mechanism (horizontal energy, different exposure geometry) are not interchangeable for severity/likelihood purposes.

**Does sharing one risk assessment produce materially incorrect or misleading safety information?** Yes, potentially — not because the shared number is fabricated (it's a real, deterministic output for *some* hazard in the observation), but because it is silently presented as if it applies equally to hazards it was never computed for. In a professional inspection tool whose entire value proposition is "defensible, evidence-bound conclusions," attaching a rationale that names the wrong hazard to a finding is a real trust/credibility defect, not merely a cosmetic one. It is bounded (not catastrophic) because: the tool is explicitly advisory throughout, a qualified human reviewer confirms/edits before finalization, and the reviewer sees the full observation text and both hazards' evidence side-by-side in the UI, so an attentive reviewer can catch the mismatch. It is not bounded enough to ignore, because nothing in the UI or data model *flags* that the shown risk was computed for a sibling hazard, so the burden of catching the error rests entirely on reviewer attentiveness rather than the system design.

**Migration cost, concretely assessed:** low-to-moderate, because `evaluateRisk()` is a pure, cheap, synchronous function already — no model call, no I/O. The engineering work is:
1. Call `evaluateRisk()` (and, if kept, `RiskReasoningBrainService.evaluate()`) once per entry in `multiHazardDecomposition.hazards[]`, passing that hazard's own `hazardFamily`/mechanism and (ideally) a hazard-scoped evidence excerpt rather than the whole fused text.
2. Attach the resulting risk object to each decomposed hazard rather than only to `promotedPrimary`.
3. Add risk columns (or a `riskSnapshot` jsonb) to `InspectionFinding`, or persist risk on `HumanReview` scoped by `findingId` where a review is genuinely per-finding.
4. Update `app/inspection-workspace/page.tsx`'s `reviewerRisk`/`proposedRisk` state to be indexed by finding, and update the Risk step to iterate per selected finding rather than showing one shared panel (this is the larger, non-trivial part — a real frontend/UX rework, not just a backend field).
5. Add a migration; this changes a persisted shape, so it needs the same discipline as any schema change (see `HAZLENZ_V5_VALIDATION_PLAN.md`).

**Recommendation: `MOVE_TO_FINDING_SCOPED_RISK`.**

Not `HYBRID_MODEL`, because a hybrid (e.g., "shared narrative rationale, distinct severity/likelihood numbers") still requires threading a per-finding risk object through persistence and the frontend — the hard parts of the migration — for only partial benefit. Given the underlying compute is cheap and pure, doing it properly (full finding-scoped risk object, not just the numbers) costs little more than a partial hybrid while fully closing the credibility gap. Recommend V5-P0 given how central "each finding must be independently, correctly assessed" is to a multi-hazard product's actual value proposition, and given the audit brief's own framing question #4 ("Can it assess each hazard independently?").

## 3. Clarification intelligence

Full trace in the delegated research (preserved in this audit's working notes; key facts below). All question generation is deterministic — no model decides what to ask. Four question-producing layers exist and are (mostly) live: `evidence-foundation.ts` (regulatory-predicate-gap questions), `buildStructuredClarifyingQuestions()` in `safescope-v2.service.ts` (the richest, primary source), the orchestrator's `EvidenceGapQuestionGeneratorService` (static scenario-keyed registry), and `StandardApplicabilityService`'s per-rule `followUpQuestions`.

**Necessity/redundancy:** `buildStructuredClarifyingQuestions()` already has real machinery for exactly the questions this audit asked about:
- A `requiredFor` field (`jurisdiction | standard-applicability | hazard-classification | risk | corrective-action`) — a coarse version of the requested `HAZARD_CONFIRMATION / RISK_REFINEMENT / STANDARD_APPLICABILITY / CONTROL_EFFECTIVENESS / TEMPORAL_STATE / JURISDICTION` taxonomy, but not that taxonomy itself, and no `TEMPORAL_STATE`/`CONTROL_EFFECTIVENESS` categories currently exist as distinct reasons.
- `impactedDecisions[]` and `expectedEvidenceFields[]` — a real, if informal, "what changes if this is answered" signal already present per question.
- `safetyDecisive`/`blocksFinalization` booleans that gate a hard-coded allowlist of question IDs — a real, working (if brittle) decision-value proxy.
- A hard cap of 4 questions (`safescope-v2.service.ts:627`, enforced by a regression test), plus separate caps of 3 and 12 in the other two layers.
- Real duplicate-question suppression via `answeredQuestionIds`, but **entirely dependent on the caller resending prior answers/context on every request** — there is no server-side "known facts for this inspection" store, so a caller that fails to resend `clarificationAnswers`/`priorStructuredObservation` could re-trigger an already-answered question. This matters directly for §6 (context reuse).
- Jurisdiction questions are explicitly and correctly separated from hazard-condition questions (`requiredFor: "jurisdiction"`) and are the one category explicitly excluded from blocking finalization.
- A real stop condition exists (`resultStage: 'final'` when zero unresolved contradictions and zero open safety-decisive questions) — but it is driven by a hardcoded question-ID allowlist and regex, not by the separately-computed, richer `EvidenceSufficiencyService` 9-dimension score, which is computed and then not consulted for this decision.

**Recommendation:** Do not build a new clarification-ranking system from scratch — formalize what already exists. Concretely:
1. Promote `requiredFor` into the exact `HAZARD_CONFIRMATION / RISK_REFINEMENT / STANDARD_APPLICABILITY / CONTROL_EFFECTIVENESS / TEMPORAL_STATE / JURISDICTION` enum requested by this audit brief (it is ~80% there already).
2. Give every question a machine-readable "consequence if yes / consequence if no" pair (a natural extension of `impactedDecisions`/`couldPromoteStandard`/`couldSuppressStandard`/`couldChangeShutdown`, which already model this ad hoc per-field rather than as one structured consequence object).
3. Wire the disconnected `EvidenceSufficiencyService` score into the actual `resultStage` decision, replacing (or validating against) the hardcoded safety-decisive-ID allowlist — this closes a real "computed but ignored" gap at low cost.
4. Solve duplicate-question suppression at the server/persistence layer (see §6) rather than requiring perfect client-side context threading.

## 4. Standards intelligence

Full trace preserved in working notes. Two independent citation-selection engines run per request and are reconciled by an ad hoc "governed citations" demotion rule (`safescope-v2.service.ts:1132-1153`) — a real consistency risk, since they can disagree.

**Corpus:** genuinely hybrid and non-trivial — a real `standards_master` DB table populated by live eCFR ingestion (`ingest-ecfr-standards.ts`, OSHA 1910/1926 + MSHA parts 46/47/48/50/56/57/62/75/77) with checksum/provenance columns (`sourceDocumentChecksum`, `retrievalDate`, `regulatory_releases` manifest/approval table), *plus* a separately-ingested `safescope_knowledge_chunks` corpus (8 connector sources), *plus* 44 hand-authored "expert applicability rules" (`standard-applicability.rules.ts`) with their own regex predicates and zero freshness tracking. A materially-misleading artifact exists: `hazard-taxonomy-coverage-map.v1.json` (41 domains, 24 flagged `gap`) is the most polished-looking coverage document in the repo but reflects a *different, mostly-dead* code path (`hazard-taxonomy-coverage.service.ts`, reached only transitively through the decomposition engine, not through the standards-selection path at all) — it should not be presented as "current standards coverage." **The actual live coverage measure is the 44-rule pack**, spanning 12 `hazardFamily` values (26 OSHA general industry, 12 MSHA, only 6 OSHA construction — construction coverage is thin), plus a ~dozen-entry generic keyword-fallback chain in `ApplicableStandardsService` for anything outside those 12 families.

**Tiering:** no `APPLICABLE / LIKELY_APPLICABLE / POSSIBLY_RELEVANT / INSUFFICIENT_CONTEXT / NOT_APPLICABLE` enum exists anywhere. Current reality is a patchwork of independently-defined, loosely-aligned vocabularies: `candidateStatus: "active"|"needs_more_evidence"`, an aspirational `applicabilityStatus: "confirmed"|"probable"|"candidate"|"needs-more-evidence"|"not-applicable"` (rarely actually set to `"confirmed"` by anything upstream), `confidenceLevel: "low"|"moderate"|"high"`, and `InspectionConditionStatus: "uncontrolled"|"controlled"|"insufficient_evidence"|"no_hazard_signal"` (describes the hazard condition, not the citation). Functionally closer to a binary suggested/excluded split with a confidence score layered on, not a 5-tier ladder.

**Jurisdiction:** handled explicitly and reasonably well — a proper `msha | osha_general_industry | osha_construction | unclear` type, inferred from text keywords with `requiresHumanConfirmation: true` on every branch, gates the standards SQL query directly (including MSHA sub-jurisdiction mine-type gating that blocks all 30 CFR citations when mine type is `unclear`).

**A live, reachable but confusing legacy artifact:** `POST /standards/match` (`StandardsController`/`StandardsService`, 3 hardcoded citations, naive keyword-overlap "confidence") still exists alongside the real engines and could mislead anyone exploring the API surface.

**Recommendation:** Design the requested 5-tier enum as a genuine unification layer sitting *above* the two existing engines (don't add a third parallel engine) — map each engine's native status into the shared enum at the point where `suggestedStandards`/`excludedStandards` are assembled (`safescope-v2.service.ts:1155-1173`), and resolve disagreements between the two engines explicitly (log or surface the disagreement, don't silently pick one). Do not fabricate coverage for the 24 `gap` domains in the taxonomy JSON — that map should either be reconnected to the real standards-selection path (so it reflects reality) or clearly marked as aspirational/roadmap, not shipped as if descriptive of current behavior. Surface existing corpus provenance (checksum, retrieval date, release ID — already tracked in the DB) in the API response; it costs nothing new to compute, only to expose.

## 5. Control intelligence

Three findings dominate this section:

1. **A real, working hierarchy-of-controls enforcement layer exists and is dead code.** `SafeScopeActionQualityService`/`SafeScopeControlEffectivenessService` explicitly detect when the "strongest control level" in generated text is `administrative`/`ppe`/`unknown` and downgrade/flag it, with real prose like *"Evaluate elimination, substitution, engineering controls... before relying on administrative controls or PPE."* Their `.evaluate()` method is never called anywhere in the repository. This is close to free to re-enable — the logic exists, it's just disconnected.
2. **A literal placeholder ships live.** `CorrectiveActionControlMapService.mapControls()` is explicitly commented `// Placeholder implementation.`, ignores its inputs, and is called with literal dummy arguments (`'hazard'`, `'mechanism'`, `[]`) from the live orchestrator — its constant output (`preferredControlFamilies: ['guarding']`, `weakActionsToAvoid: ['Be careful']`) reaches the API response's `intelligence.controlMap` today. This is the single most concrete "the system claims a capability it doesn't have" finding in this audit and should be either wired to real inputs or removed from the response, not left as an unlabeled stub.
3. **Genuine mechanism-specific reasoning does exist and is good**, primarily in `DefensibleCorrectiveActionService` (evidence-gated, ~13 distinct mechanism branches, e.g. distinct immediate/interim/permanent/verification text for `unexpected_startup` vs `rotating_equipment_nip_point` vs `struck_by_falling_suspended_load`) and `contextual-control.engine.ts` (extracts the actual equipment/component noun from the observation text and interpolates it into control language). Neither of these defaults to PPE for permanent corrections — PPE only appears for the literal PPE hazard family itself, which is a genuinely good, evidence-respecting design choice worth preserving in V5.
4. **But several structural (non-narrative) fields are static regardless of hazard**: `CorrectiveActionBrainService`'s `administrativeFollowUps`, `verificationSteps`, and `responsibleRoleSuggestions` are identical two-item lists for every call; the `CORRECTIVE_ACTION_TEMPLATE_REGISTRY`'s `interimControls` is the identical string across all 20 domain entries.
5. **Persistence severs the link entirely.** The `CorrectiveAction` DB entity has no FK to any AI-reasoning object, no hierarchy-level column, no verification-criterion column — all of that, if it survives at all, is buried in an untyped `originalSuggestion` jsonb blob, and even that only gets populated at report-package creation via a fuzzy `(reportId, findingId, title)` match, not automatically when `classify()` runs.

**Minimum architecture for evidence-bound control recommendations (V5):**
- Re-enable the existing hierarchy/effectiveness QA layer as a required post-process on every generated action set (cheap — it's already written).
- Replace or delete the `CorrectiveActionControlMapService` placeholder.
- Consolidate the 3-4 parallel corrective-action engines into one canonical pipeline with `DefensibleCorrectiveActionService`'s evidence-gating as the governing pattern (it is the most rigorous of the four).
- Add `hierarchyLevel`, `mechanism`, `verificationCriterion`, and a stable `sourceRecommendationId` column to `CorrectiveAction`, and make the `classify()` → persisted-action link automatic and ID-based rather than fuzzy-title-matched at report time.

## 6. Inspection-context intelligence

Available context today, by level: **inspection** (id, status, org/site, `title`), **observation** (`rawText`, `evidenceSource`, version), **analysis** (full `resultSnapshot`, `requestVersion`, idempotency key), **finding** (`hazardCategory`, `segmentKey`/`hazardKey`, `finalReviewId`, `reviewerDisposition`), **review** (`decision`, `rationale`, `reviewedConclusion` including `reviewerRisk`).

**Critical gap:** `SiteMemoryService` (the module most plausibly responsible for "don't ask about known site conditions again") is a **pure, stateless function** — it takes `priorFindings` as a parameter supplied by the *caller* on each request; it does not query the database for actual site/inspection history. There is no automatic reuse of persisted context: jurisdiction, site, equipment, or previously-confirmed facts are not fetched server-side and merged into a new `classify()` call — the frontend must collect and resend everything (`priorStructuredObservation`, `clarificationAnswers`, `priorFindings`) on every request, and if it doesn't, HazLenz has no way to know it already has the answer. This is consistent with, and the root cause of, the "duplicate question" risk noted in §3.

**Recommended explicit distinction for V5:**
- `GLOBAL_INSPECTION_CONTEXT` — jurisdiction (once confirmed), site/facility, inspection type, default regulatory agency (already exists as a per-user setting per the browser audit's "HazLenz AI uses the default regulatory agency from Settings" copy) — safe to reuse across every observation in one inspection, and should be **fetched server-side from the persisted `Inspection`/`Site` rows**, not re-sent by the client every time.
- `OBSERVATION_CONTEXT` — task/activity, equipment, location-within-site, evidence attached to *this* observation — safe to reuse across re-analyses of the same observation, not across different observations.
- `FINDING_CONTEXT` — evidence, mechanism, and clarification-answer state specific to *one* decomposed hazard — must **not** be shared with sibling findings from the same observation (this is the same principle underlying the PRA-006 recommendation: don't let one hazard's evidence silently justify a conclusion about a different hazard).

This is a genuinely different concern from PRA-006: PRA-006 is about not sharing *conclusions* (risk) across findings; this section is about *safely* sharing *context* (jurisdiction, site) across observations within one inspection — the two must not be conflated in implementation, since a naive "just share everything" fix for one would reintroduce the failure mode the other is designed to prevent.

## 7. Multi-hazard reasoning

`multi-hazard-decomposition.service.ts` (protected V4) genuinely does preserve independent **evidence, mechanism, and condition state (`conditionState`)** per decomposed hazard — confirmed by the field names present in `intelligence.multiHazardDecomposition.hazards[]` and by the live browser evidence from the production-readiness audit (3 findings, each with its own `Finding ID`, `hazardKey`, and evidence in the UI). What is **not** preserved independently per hazard:

- **Risk** — confirmed shared (§2/PRA-006).
- **Confidence** — the decomposition engine does assign a per-hazard-pattern confidence literal at generation time (24 hardcoded values found, e.g. 0.84, 0.88 per hazard branch), which is genuinely per-hazard; but no per-hazard confidence survives into the shared `confidenceIntelligence`/`ConfidenceGovernanceService` outputs, which operate on the whole fused text once.
- **Controls/standards/narrative** — `standardFamilyCandidates`, `narrative`, `correctiveActionReasoning`, and `riskReasoning` are all derived from the single `scenarioIntelligence` object, itself derived once from `promotedPrimary.classification` — i.e., every downstream "brain" output after decomposition collapses back to a single-hazard view, even though decomposition itself correctly identified multiple hazards.
- **Clarification needs** — `clarifyingQuestions` are built from the whole fused observation, not scoped per decomposed hazard, so a question relevant only to the secondary hazard is indistinguishable in the response from one relevant to the primary hazard.

**Net assessment:** HazLenz genuinely *detects* multiple independent hazards (this is the real, hard-won V4 achievement) but does **not** carry that independence through scenario understanding, risk, standards-family narrowing, narrative, or clarification — the pipeline re-collapses to single-hazard reasoning immediately after decomposition. This is the single clearest architectural gap between "hazard-recognition engine" and "true multi-hazard inspection intelligence," and it is broader than PRA-006 alone (PRA-006 is the risk instance of this general pattern).

## 8. Evidence provenance

A well-designed type already exists and should be the foundation, not reinvented: `EvidenceFact.source: 'user_text' | 'user_confirmation' | 'photo_model' | 'site_context' | 'inspection_context' | 'clarification' | 'qualified_review' | 'system_inference'`, plus `FactStatus: 'observed' | 'confirmed' | 'inferred' | 'unknown' | 'contradicted' | 'corrected'` (`evidence/evidence-foundation.ts:4-17`). This maps closely onto the audit brief's requested model:

| Brief's requested category | Nearest existing value |
|---|---|
| OBSERVED | `user_text` (narrative) / `photo_model` (image) |
| USER_PROVIDED | `user_confirmation` / `clarification` |
| INSPECTION_CONTEXT | `site_context` / `inspection_context` |
| DERIVED | `system_inference` (conflated with ASSUMED — see gap below) |
| ASSUMED | **no distinct value** — collapses into `system_inference` |
| EXTERNAL_REFERENCE | not modeled on `EvidenceFact`; a parallel `ApplicabilityDecision.source: {authority:'regulation', bundle, version}` exists for regulatory citations specifically |

**The gap is not the taxonomy, it's the coverage.** This fact model is real and used *inside* `evidence-foundation.ts`'s own predicate-evaluation logic (jurisdiction, energy state, control presence/absence, etc. are all tracked as `EvidenceFact`s with real source/status). But the ~60 orchestrator engines that produce classification, temporal state, risk, standard applicability, control recommendations, and narrative text each independently re-derive their own view of the evidence via ad hoc regex on raw text — they do not consume or produce `EvidenceFact`s. So most of what actually reaches the inspector (risk band, narrative sentence, recommended action) cannot today be traced back to a specific fact with a known source and status; it can only be traced back to "some regex, in some file, matched."

**Recommendation:** extend `EvidenceFact.source` with an explicit `assumed`/`derived` split, and — this is the larger, real work — make `EvidenceFact[]` (or an equivalent shared structured-fact object) the thing every orchestrator engine consumes as input, rather than raw `fusedText`. This is the same underlying fix that would also resolve the duplicated-regex-scanning efficiency problem in §10 below; provenance and efficiency point at the same architectural remedy (compute the fact set once, pass it everywhere, stop letting each engine re-derive facts from raw text).

## 9. Confidence architecture

At least **9 structurally different confidence subsystems** were catalogued, using **4 incompatible numeric scales** (0–1 float, 0–100 integer, 0–10 scale, and unbounded modifier deltas) and **4+ incompatible categorical vocabularies** (`low/medium/high`; `insufficient/low/moderate/high`; `reliable/use_with_review/limited_reliability`; `high/moderate/low/hold`). 105+ hard-coded confidence literals were found outside test files, concentrated in the decomposition engine (24, one per hazard-pattern branch) and `safescope-v2.service.ts` itself (10, including `confidence: 0.5` for every auto-generated "vague observation" action and specific literals like `0.96`/`0.86`/`0.82` tied to specific standard citations matching a regex). Two classifier implementations (`deterministic-classifier.ts`, `weighted-classifier.service.ts`) each convert a raw keyword-match integer into 3-5 fixed float "confidence" literals via a step function — this produces the *appearance* of calibrated probability while actually only encoding a match-count bucket.

**Is confidence actually used, or mostly display?** Mostly display / self-referential. Each sub-service gates its *own* output with its *own* score (reasonable, locally), but the pipeline-level decisions that matter most — finalize vs. keep asking, require human review — are driven by separate hardcoded regex/ID-allowlist logic, not by any confidence number. `ConfidenceGovernanceService`, the one module actually designed to gate output permissions from an aggregated confidence floor, is only reachable through the lazy orchestrator and its `outputPermissions` are never read by the main pipeline (zero matches for `canSupportCitationCandidate`/`canSupportStrongRecommendation` in `safescope-v2.service.ts`); it also hardcodes `humanReviewRequired: true` unconditionally, so even where it does run, its central gate is a constant.

**Recommendation:** given there is no model producing genuine calibrated probabilities, **do not keep numeric confidence as the primary signal** — numeric precision here is not earned and actively misleads (a `0.96` reads as far more rigorous than "this citation's regex matched"). Move to a **small categorical scale with a defined, singular meaning per category** (e.g., the existing `confidenceLevel: low/moderate/high` pattern used in `standard-applicability`), reserve numeric scores strictly for internal ranking/sorting (never surfaced to the inspector as a percentage), and **unify all 9 subsystems onto one shared type** before adding any new confidence-producing module. Wire the one real gating service (`ConfidenceGovernanceService`) into the actual pipeline decision it was built for, or remove it. This is explicitly a hybrid recommendation, not "keep numeric" or "go purely categorical everywhere" — internal computation can stay numeric where it's genuinely just a sorting key; anything inspector-facing should be categorical.

## 10. Efficiency

Full detail in `HAZLENZ_V5_EFFICIENCY_ANALYSIS.md`. Headline finding: since there is no LLM call, the efficiency question is CPU/memory/maintainability, not token cost. Five largest opportunities, in priority order, with rationale, are in that document; summarized: (1) compute a shared structured-fact set once per request instead of ~250+ independent regex scans of the same text across ~115-180 files, (2) re-enable production heap-guard transparency so degraded responses are distinguishable from full ones, (3) add any caching at all for standards/taxonomy lookups (currently zero, beyond two static disk-read caches), (4) make re-analysis incremental (currently a full pipeline rerun on every clarification answer), (5) remove or gate the confirmed-dead-code paths (`SafeScopeNativeReasoningService.evaluate()` never called; `EvidenceQuestionGenerationService`/`JurisdictionApplicabilityDecisionTreeService` outputs apparently unconsumed) so they stop paying their CPU cost for zero benefit.

## 11. Inspector-facing output

Current API response is extremely wide (100+ top-level keys observed on `hazlenz_analyses.resultSnapshot` during the PRA-002 remediation) — far more than an inspector should see at once, and the browser-verified UI (production-readiness audit) already does real curation (a clean "Human review required" card, per-finding "Persisted hazard findings," a focused "What HazLenz understood" fact panel, capped clarification questions). The gap is not that nothing is curated — it's that the curation happens ad hoc in frontend components reading from an uncurated firehose object, rather than the backend shaping a stable, intentional output contract.

**Recommended ideal hierarchy** (immediate vs. expandable), per finding:

*Immediate (always visible):*
1. Hazard (family + one-line mechanism)
2. Why it matters (the specific evidence that triggered it — quoted/highlighted from the observation, not generic)
3. Risk (categorical band, not a bare number — per §9)
4. Applicable requirement (top citation only, with its tier per §4's 5-tier model)
5. Clarification required, if any (ranked, capped, with the §3 reason category shown)

*Expandable detail:*
6. Full evidence trace (every `EvidenceFact` behind this finding, with source/status — per §8)
7. Existing/failed controls and why they were judged that way
8. Recommended action, hierarchy-of-controls-ranked, with verification criterion
9. Full confidence/uncertainty breakdown
10. Alternative/excluded standards and why they were excluded

The organizing principle: an inspector deciding "do I trust this and can I act on it" needs 1-5 in ten seconds; everything else is for justifying the decision later (audit trail, dispute resolution, training) and should not compete for attention with it.

## 12. Intelligence boundaries

Decisions HazLenz must not autonomously make, several of which the current code already gets right and should be preserved as hard invariants in V5, not weakened:

- **Declaring a legal violation without sufficient applicability evidence** — currently respected in spirit (`status: 'candidate_standard'`, never "confirmed violation"; `EvidenceSufficiencyGateService` gates suggestion on sufficiency) but the aspirational `applicabilityStatus: "confirmed"` value exists in the type system and, if it ever starts getting set, needs a hard rule that "confirmed" requires human sign-off, never an algorithmic score alone.
- **Inventing exposure measurements, equipment state, or exposure duration** — `EvidenceFact` already models `unknown` explicitly rather than defaulting to a guessed value in several places (e.g. `exposureDuration: 'unknown'` literal in `risk-reasoning.service.ts`); this discipline should be a checked invariant (a fact that is `unknown` must never silently become a specific value downstream) rather than an incidental property of current code.
- **Closing corrective actions without verification evidence** — the persisted `CorrectiveAction.closureNotes` is free text with no structured link to the "verification criterion" the AI reasoning proposed (§5); this is a real gap — closure should require satisfying a specific, stored verification criterion, not just any note.
- **Silently resolving ambiguous jurisdiction** — currently respected: `likelyJurisdiction: 'unclear'` always carries `requiresHumanConfirmation: true`; must remain non-negotiable in V5.
- **Inferring facts solely to produce a more confident answer** — the biggest live risk here is PRA-006 and §7's finding-independence gaps: reusing one hazard's risk/context for another is a form of this failure even though no single module "invented" anything. Any V5 context-sharing work (§6) must be explicitly scoped (`GLOBAL_INSPECTION_CONTEXT` vs `FINDING_CONTEXT`) to avoid quietly reintroducing this.

---

## Required V5 design question

**If we could add only three capabilities before doing any further recognition work, which three, and why?**

1. **Finding-scoped risk (PRA-006 fix, §2).** Highest safety-credibility impact per unit of engineering effort in this entire audit — the compute is already cheap and correct in isolation; it is only ever applied to the wrong scope. Every multi-hazard observation HazLenz correctly decomposes today ships a risk statement that may misdescribe some of its own findings.
2. **A shared, once-computed structured-evidence-fact layer that every reasoning engine consumes** (unifying §8's provenance gap and §10's efficiency gap, and the mechanism behind §7's "independence" gap). This is the single highest-leverage architectural change: it simultaneously stops ~60 engines from independently re-deriving the same facts from raw text, makes every downstream conclusion traceable to a specific fact with a known source/status, and is the natural place to also compute per-hazard (not just per-observation) facts, which is the prerequisite for genuinely independent multi-hazard reasoning beyond just risk.
3. **A real evidence-sufficiency-driven stop condition for clarification, replacing the hardcoded safety-decisive-ID allowlist with the already-computed-but-disconnected `EvidenceSufficiencyService` score** (§3). This directly targets the audit brief's own framing questions ("can it stop asking when sufficient evidence exists," "ask the smallest number of highest-value questions") using work that has already been done and simply needs to be connected, making it unusually cheap for its impact on perceived intelligence and inspector time-to-decision.

Common thread: all three are primarily **connecting and correctly scoping work that already exists** in the codebase, not net-new AI capability — which is exactly what a deterministic, non-model system should prioritize before any recognition work, because the ceiling on "smarter" is bounded by rule-authoring effort, while the ceiling on "correctly scoped and connected" is bounded only by engineering discipline.

## Required efficiency question

**What should HazLenz stop doing, do once, cache, defer, or perform only when needed?**

- **Stop doing (as currently implemented) / remove or fix:** the `CorrectiveActionControlMapService` placeholder stub (§5) — it does no real work and should not silently ship in output; `SafeScopeNativeReasoningService.evaluate()`'s never-called path should either be wired in (it's the hierarchy-QA layer, §5/§9) or deleted, not left instantiated and unused; the parallel `SafeScopeCorrectiveActionReasoningService` self-labeled `'deterministic_test_only_advisory'` running in the live path should be resolved (either merged into the real output or removed from the live path).
- **Do once instead of ~60 times:** structured-fact extraction from raw text (§8/§10) — this is the largest single efficiency win available and is architecturally identical to the largest intelligence win available (§8), which is not a coincidence.
- **Cache:** standards/knowledge-chunk DB lookups (currently zero caching beyond two static disk-read caches for reference JSON) — identical or near-identical observation text and identical jurisdiction/classification combinations will re-run the same DB query and regex scoring from scratch every time.
- **Defer:** the full ~60-service intelligence-orchestrator fan-out currently runs unconditionally (modulo the memory heap-guard) even when only a subset of its output survives to the response — worth auditing which of the ~60 sub-outputs are actually read downstream (this audit found at least 2-3 that are computed and apparently discarded) and skip computing outputs nothing reads.
- **Perform only when needed:** re-analysis on a clarification answer currently reruns the entire pipeline from scratch (§10); an incremental model that recomputes only the stages downstream of the changed fact (e.g., re-answering a jurisdiction question shouldn't force re-running decomposition if the hazard families didn't change) would materially cut backend CPU time and inspector-perceived latency on the most common interaction loop (answer → wait → next question).

## Required architecture question

**What is the smallest architectural evolution that turns HazLenz from a hazard-recognition engine into an evidence-driven inspection intelligence system, without replacing the proven V4 recognition foundation?**

Insert one new layer between "fused text" and "the ~60 orchestrator engines": a **shared structured-evidence-fact builder**, extending the already-well-designed `EvidenceFact`/`FactStatus` model from `evidence-foundation.ts` to be the mandatory input contract for every reasoning engine, computed once per request (and, critically, once per *decomposed hazard* where a fact is hazard-specific, not just once per observation). Concretely:

1. Keep the V4 classifier (`weighted-classifier.service.ts`) and `MultiHazardDecompositionService` exactly as they are — they are the protected, working recognition core and are not the bottleneck this evolution targets.
2. After classification and decomposition (stages 3 and 8a in the architecture map), run the evidence-fact builder once, extended to tag each fact with which decomposed hazard(s) it pertains to (a hazard-scoped fact array, not just an observation-scoped one).
3. Change the ~60 orchestrator engines' inputs, one at a time and without changing their individual output shapes, from `fusedText` (raw string) to the relevant slice of the fact array. This is a mechanical, low-risk, incremental migration — each engine can be moved independently, and its existing regression tests (there are dozens under `safescope-v2/tests/`) validate that its output didn't change in the process.
4. Once risk, standards, and narrative engines consume hazard-scoped facts instead of the whole fused text, finding-scoped risk (V5-P0 capability #1) and finding-scoped everything-else (§7's broader independence gap) fall out as natural consequences rather than requiring bespoke per-capability rework.
5. Confidence and provenance unification (§8, §9) become straightforward once there's one fact model everything reads from — a fact's `source`/`status` becomes the honest basis for confidence, replacing today's per-module hand-picked literals.

This is an **evolution, not a rewrite**: it does not touch the classifier, does not touch decomposition, does not require a model call, and can be rolled out engine-by-engine behind the existing regression-test suite. It directly answers the audit brief's own diagnostic questions (§8/§9's "does it understand enough," "can it distinguish facts from assumptions") by construction, because a fact-driven architecture makes those questions structurally answerable instead of requiring per-module discipline that today's raw-text-regex approach cannot guarantee.
