# HazLenz — AI capability truth audit

Date: 2026-08-18. Baseline `97941ca2`, all work uncommitted. Backend `:4010` (ts-node, restarted after each
backend change), frontend `:3010`, disposable PostgreSQL `insite_full_qa_20260818`; the original `safescope`
database was never targeted.

This document answers what HazLenz **is**, not what it could be described as. Every claim below is traced to
code or to a recorded run. Raw evidence: `capability-harness/capability-results.json` (64 live classify calls),
`capability-harness/capability-scores.json` (per-dimension scores and every individual failure),
`regression-logs/`, `standards-gold-set/`.

---

## 1. Is HazLenz legitimately an AI system?

**Yes, in the applied-AI sense (knowledge-based/symbolic AI), and no, in the "trained model" sense.**

There is no machine-learned model anywhere in the product. `backend/package.json` has no LLM SDK, no inference
runtime, no embedding model and no ML framework; a source-wide search for `openai|anthropic|gemini|cohere|
mistralai|langchain|onnxruntime|tensorflow|@xenova|node-llama` returns zero production imports. The only NLP
dependency is `natural` (classical tokenisation, Porter stemming, TF-IDF, string distance).

What it *is*: a large, hand-authored **knowledge-based reasoning system** — a weighted hazard-signal taxonomy,
a rule/predicate engine over extracted evidence facts, a negation-and-context analyser, a decomposition engine,
a deterministic risk matrix, and a corpus-backed regulatory-applicability decision layer, with explicit
provenance and uncertainty carried end to end. That is a legitimate and long-standing category of AI, and the
system's behaviour on the adversarial pairs below is not reducible to keyword matching. It is *not* generative
AI, *not* a statistical classifier trained on data, and *not* a system that learns.

**Accurate label: `HYBRID_SYMBOLIC_AI` — a rule/knowledge-based expert system with statistical information
retrieval, deterministic risk scoring, and governed uncertainty handling.** If one label from the supplied list
must be chosen, `RULE_ENGINE` is closer to the truth than `CLASSIFIER`, and `PROBABILISTIC_MODEL` /
`LLM_GENERATIVE_REASONING` are both wrong.

### Mechanism by mechanism

| Capability | Mechanism | Nature |
|---|---|---|
| Evidence extraction | `evidence/evidence-foundation.ts` `buildEvidenceFacts()` — pattern/predicate extraction of jurisdiction, condition, exposure, control facts with `source` + `status` provenance | Deterministic, rule-assisted |
| Hazard recognition | `classifier/weighted-classifier.service.ts` over `taxonomy/hazard-taxonomy` — hand-weighted signal terms, summed to a score and normalised to a confidence band, plus regex cue gates | Deterministic, corpus/lexicon-driven |
| Semantic / contextual interpretation | `reasoning-orchestrator/negation-context.util.ts` (`hasNonNegatedSubstring`) applies a negation window to every signal occurrence; `semantic-synonym-expansion`, `observation-context` normalisation | Deterministic |
| "Semantic vector search" | `semantic-vector-search/local-vector-store.ts` — TF-IDF over stemmed unigrams+bigrams with cosine similarity, over a small in-process catalogue | **Statistical IR, not learned embeddings** |
| Multi-hazard decomposition | `multi-hazard-decomposition.service.ts` — fragment splitting plus per-domain rule sets, each emitting `conditionState ∈ {ACTIVE, HISTORICAL, PLANNED_FUTURE, SAFE_VERIFIED, UNKNOWN}` | Deterministic |
| Negation / effective control | Negation windows in the classifier and decomposition; `control-intelligence`, `control-effectiveness` | Deterministic (see §7 for measured limits) |
| Evidence sufficiency | `evidence-sufficiency*`, `resultStage`/`mayFinalize` gating | Deterministic |
| Ambiguity management | `clarificationQuestions` generated from unsatisfied rule predicates (`evidence-question-generation`) — the question exists because a *named predicate* is unresolved | Deterministic, predicate-driven |
| Jurisdiction / context reasoning | Inspection `regulatoryContext` (user-set) overrides everything; otherwise inference from observation wording, labelled `HAZLENZ_INFERRED`; otherwise `UNKNOWN` | Deterministic, provenance-tracked |
| Regulatory candidate selection | `evidence-foundation.ts` `evaluate()` predicate satisfaction → `SUPPORTED / UNKNOWN / CONTRADICTED`, narrowed to the resolved regime, hydrated from `standards_master` | Deterministic + corpus-driven |
| Risk reasoning | `risk/risk-engine.ts` `evaluateRisk()` — severity × likelihood matrix on a fixed profile | Deterministic |
| Corrective-action reasoning | `getCorrectiveActionIntelligence()` per finding, from that finding's own evidence/risk/regulatory basis; **plus a hand-written family→action map in the frontend** (`safeActionDraftForFinding`) used when an observation yields several findings | Deterministic, partly hard-coded in the UI |
| Follow-up questions | As "ambiguity management" above | Deterministic |
| Confidence / provenance | Weighted-score normalisation → band; `jurisdictionProvenance`, `applicability`, `source` on every candidate | Deterministic |
| Narrative / explanation | `observation-narrative-synthesis` — template composition over the extracted structured facts | Deterministic template generation, **not** generative text |

**Nothing in the pipeline is model-driven. Everything is deterministic, corpus-driven, or rule-assisted.**
The one statistical element is TF-IDF retrieval.

---

## 2. Does HazLenz learn? — **`STATIC_RUNTIME_WITH_ENGINEERING_UPDATES`**

Traced independently this session and consistent with `../insite-core-closure-standards-validation-2026-08-18/LEARNING_ARCHITECTURE.md`.

Nothing a user does changes any future inspection. Specifically:

- **No weights, models or rules are mutated at runtime.** There is no training code, no persisted weight store,
  no online update path.
- `learning-memory`, `learning`, `learning-candidate-queue`, `human-review-feedback-loop`,
  `reviewer-correction-capture`, `site-memory`, `human-review-learning-governance` are **not registered in
  `SafescopeV2Module`'s providers**. Two of them (`SafeScopeLearningMemoryService`, `WorkspaceLearningService`)
  are instantiated directly inside `orchestration/intelligence-orchestrator.service.ts`, and both are **pure
  functions returning advisory narrative strings** — no repository, no persistence, no state.
- At the production call site (`safescope-v2.service.ts`, the only caller of `orchestrator.evaluate`),
  `standardsFeedback` and `correctiveActionOutcomes` are **not passed at all**, `supervisorValidations` is
  hard-coded `[]`, and `priorFindings` comes from the request body — which the canonical workspace client
  (`analyzeObservation`) never sends. So these engines run every request with empty inputs and emit nothing.
- The `SafeScopeFeedback` table is written by its own controller and read only by its own GET endpoints;
  `safescope-v2.service.ts` never reads it. `human_reviews`, reviewer-confirmed `riskSnapshot`, corrective-action
  edits and report edits are persisted for **audit and finalisation only**.

**How it actually improves:** by engineering. Taxonomy/rule/corpus changes are made in versioned commits and
seeds, gated by the frozen regression suites (`test:hazlenz-core`, golden hazard/standards/domain suites) and the
adjudicated standards gold set. A user correction can become a regression case only through human adjudication.

**Future architecture:** the governed, not-yet-built path is documented in
`../insite-core-closure-standards-validation-2026-08-18/LEARNING_ARCHITECTURE.md`
(correction event → aggregation → human adjudication → frozen regression case → reviewed code/corpus update).
Everything in that document is **FUTURE**; the "What exists today" table in it is CURRENT and remains accurate.

---

## 3. Contextual reasoning vs keyword matching — **demonstrated, with limits**

`ADVERSARIAL_SEPARATION: 5/5`. In every pair the conclusion changed materially although most vocabulary was
shared, and **no controlled variant produced a SUPPORTED citation**:

| Pair | Hazard wording | Controlled wording |
|---|---|---|
| guard | Critical, `1910.212(a)(1)` candidate | no standard at all |
| energised conductors | High, `1910.303(g)(2)(i)` candidate | **no hazard domain survived**, no standard |
| trench | **SUPPORTED `1926.652(a)(1)`** | risk band `Controlled`, no standard |
| damaged cord | High, `1910.334(a)(2)(ii)` candidate | risk band `Controlled`, no standard |
| 92 dBA | *(no standard — a recall miss, see §7)* | noise hazard, no standard |

This is genuine negation/control reasoning, not vocabulary overlap. Regime separation is also real: identical
fall wording produced `1910.28` under General Industry and `1926.501` under Construction.

---

## 4. Multi-hazard reasoning — **partly**

`MULTI_HAZARD_SEPARATION: 4/5`. Three simultaneous hazards in one observation separate correctly with evidence
owned by the right finding (verified again end-to-end in the generated Construction report: fall protection,
electrical and hazard communication each carried their own fragment, standard and action).

Measured failures:

- **Under-separation.** The four-condition Construction observation (leading edge / scaffold / no GFCI / short
  ladder) yielded 2 domains, losing the scaffold and ladder hazards.
- **Over-splitting.** One observation split a single clause into repeated same-domain hazards
  (`"no shoring"` and `"shielding or sloping in place"` became two excavation findings). In the 13-finding
  end-to-end report this produced four separate "Excavation Trenching" findings from one excavation paragraph.
- **Evidence ownership degrades on long observations.** In the long Construction report the Hazard Communication
  finding received the *entire* observation as its fragment and consequently cited the electrical standard
  `1926.416(a)(1)`. The same hazard in a short observation correctly cited `1926.59`. Standards are only as
  finding-specific as the fragment the decomposition assigns.

**Fixed this session (was a hard failure):** several distinct hazards of the same domain in one observation all
derived the same `stableHazardKey` and collided on `inspection_findings (observationId, segmentKey, revision)`.
The `QueryFailedError` rolled back the whole `addAnalysis` transaction and surfaced to the user as
*"A newer analysis request already exists."* — the analysis could not be saved at all. See §12.

---

## 5. Controls, negation, safe states, ambiguity, uncertainty — **mixed**

`CONTROL_STATE: 18/24`, `UNCERTAINTY: 4/5`, `CLARIFICATION_QUALITY: 20/21`, `NO_UNSUPPORTED_PROMOTION: 49/54`.

Working:

- No zero-result failure when jurisdiction is unknown: an unguarded tail pulley with no regime still produced
  `30 CFR 56.14107(a)` as a **candidate** with two clarifying questions.
- No unprovenanced assertion: under an unknown inspection context, a regime is only asserted as SUPPORTED when
  the observation itself established the agency.
- Clarification questions are predicate-derived and rare (never more than 2 in 64 runs) — no interrogation.
- Every advisory output carries explicit limitations and never declares a violation.

Not working (see §7 for the full list): a **bypassed** interlock guard is read as `Controlled`; contradictory
evidence ("operator says locked out, but the disconnect is ON with no lock") produced no hazard, no standard and
no question; a resolved-yesterday/controlled-today trench still produced a SUPPORTED violation.

---

## 6. Regulatory / jurisdiction integrity — **preserved, and it is the system's strongest property**

- Adjudicated standards gold set, re-run after every change this session: **precision 1.00 (24/24), recall 1.00
  (24/24), wrong-regime 0, false-positive 0, correct no-match 7/7.** Unchanged from the frozen contract.
- Across the 49 harness scenarios, **every** SUPPORTED citation belonged to the inspection's own regime
  (`STANDARD_PRECISION 15/15`), and there was **no cross-regime leakage** in any output
  (`JURISDICTION 49/49`).
- The report prints the inspection's regulatory context, labels HazLenz-inferred jurisdiction explicitly, and
  omits a per-finding standard rather than fabricating one.

---

## 7. Measured gaps (all newly discovered this session, none tuned away)

> **Update — safety-semantics pre-commit closure.** Gaps 1, 2 and 4 were re-examined against the
> release-significance taxonomy, found to be safety-meaning inversions / false-controlled states,
> and **fixed**. See `SAFETY_SEMANTICS_PRECOMMIT_CLOSURE` at the end of this document for the
> full 12-gap classification, before/after evidence, and the new permanent regression suite. The
> table below is the original audit record and is left unedited.

Classified per the required taxonomy. None was made to pass by editing an expectation.

| # | Behaviour | Evidence | Class |
|---|---|---|---|
| 1 | Bypassed interlock ("guard installed but bypassed with a jumper wire") returns risk `Controlled`, no standard — indistinguishable from a verified-good guard | `B3-03` vs `B3-02` | **ENGINE_DEFECT** |
| 2 | Contradictory evidence ("operator says locked out, but disconnect ON, no lock or tag") produces no hazard domain, no standard, no question, no contradiction flag | `B3-04` | **ENGINE_DEFECT** |
| 3 | Temporal resolution not honoured: "no protective system yesterday; trench box installed and inspected today" still yields SUPPORTED `1926.652(a)(1)` at High risk | `B3-09` | **ENGINE_DEFECT** |
| 4 | Blocked exit ("exit door blocked w/ pallets, been like that all week") returns `1910.36` as **CONTRADICTED** and risk `Controlled` | `B10-04` | **ENGINE_DEFECT** |
| 5 | Explicitly all-clear observations still emit hazard domains and a Moderate risk band | `B10-15`, `B10-30` | **ENGINE_DEFECT** |
| 6 | Top-level `classification`/`hazardCategory` frequently disagrees with the decomposition domain (rebar caps → "Compressed Gas Cylinders"; oxidizer/flammable storage → "Electrical"; bench grinder → "Noise Exposure") | `B10-12`, `B10-23`, shape probe | **ENGINE_DEFECT** (display-level; the PDF reads the decomposition family, not this field, so customer-facing impact is limited) |
| 7 | Recall is phrasing-sensitive: `94 dba 8hr TWA` → SUPPORTED `1910.95`; `92 dBA sustained across the full eight hour shift` → nothing | `B10-08` vs `B4-05` | **ENGINE_DEFECT** |
| 8 | No candidate standard for: eyewash, electrical working clearance, incompatible chemical storage, cylinder securing, construction GFCI/temporary power, ladder extension, rebar impalement, aerial-lift tie-off, haul-road berm | 13 of 37 unsafe scenarios | **CORPUS_GAP** |
| 9 | Multi-hazard under-separation and same-clause over-splitting | `B5-construction`, `B3-09` | **ENGINE_DEFECT** |
| 10 | Long observations give a finding the whole observation as its fragment, so its standard follows the wrong hazard | long Construction report, Finding 2 | **ENGINE_DEFECT** |
| 11 | Multi-finding corrective-action specificity comes from a hand-written family map in the **frontend**; families outside that map fall back to a generic template ("Immediate hazard control required to prevent contact/exposure to X hazard") | `safeActionDraftForFinding`, report findings 4–9 | **SUPPORTED_BEHAVIOR** (works, but it is not model reasoning) |
| 12 | Under-specified observation ("There is an opening in the mezzanine floor") is finalisable with zero questions | `B7-02` | **APPLICABILITY_AMBIGUITY** |

The two `test:hazlenz-core` suite failures (Golden Hardening #7 "LOTO energized maintenance", Production Path
"tagged but not locked") are **pre-existing baseline failures**, byte-identical to the frozen baseline log — 27
suites pass in both runs. They were not introduced here and were not suppressed.

---

## 8. Explanation quality

`EXPLANATION_QUALITY: 49/49` against the test "does the customer-facing rationale restate the observed condition
and say something specific about it". Every finding carries `observedCondition` verbatim, a scenario explanation
naming the mechanism and exposure, the standard's plain-language requirement, and the evidence basis. A competent
safety professional can follow why a standard was proposed.

Two honest caveats: the wording is **template-composed**, so several findings in one report read alike; and the
`explanation` field ("HazLenz AI matched weighted *X* signals") is internal-sounding — it is not printed in the
report, and should not be.

---

## 9. Customer-facing claims — audit

Copy reviewed: `app/page.tsx`, `app/about/page.tsx`, `app/hazlenz/page.tsx`, `components/pricing/PricingContent.tsx`,
in-app HazLenz sections, and the generated report.

| Claim | Where | Verdict |
|---|---|---|
| "A governed hazard intelligence engine that interprets inspection observations, extracts structured hazard context, reasons across equipment, task, exposure, energy, and control factors, identifies evidence gaps, and supports advisory corrective action review." | HazLenz hero | **SUPPORTED_AS_WRITTEN** |
| "HazLenz AI processes natural language safety observations into clean, structured datasets…" | HazLenz | **SUPPORTED_AS_WRITTEN** |
| "…when a single observation describes more than one hazard, it decomposes the passage into separate, independently tracked findings" | HazLenz | **SUPPORTED_WITH_QUALIFICATION** — real and verified, but separation is imperfect (§4) |
| "Matches structured observations against approved MSHA and OSHA frameworks to surface **potentially applicable** standard families … **for qualified safety review**" | HazLenz | **SUPPORTED_AS_WRITTEN** (precision 1.00 on the gold set) |
| "Autonomously identifies missing or ambiguous parameters … and flags them as critical questions" | HazLenz | **SUPPORTED_AS_WRITTEN** |
| "Recommends **custom**, layered action plans … **tailored to the hazard mechanism**" | HazLenz | **OVERSTATED** — actions are per-finding and hierarchy-of-controls shaped, but for families outside the hand-written map they are a generic template (§7 #11) |
| "Every finding includes a full visual and step-by-step AI Reasoning Trace … the exact reasoning sequence, inputs used, and matched logic" | HazLenz | **SUPPORTED_WITH_QUALIFICATION** — the trace is real and shown in-app; "exact reasoning sequence" oversells a template-composed rationale |
| "HazLenz AI acts purely as a decision-support advisory tool. It never auto-finalizes findings, declares violations, creates official citations, or replaces qualified safety professionals." | HazLenz | **SUPPORTED_AS_WRITTEN** — enforced in code |
| "Repeat-hazard insight support" | Pricing (Pro) | **OVERSTATED if read as learning** — no cross-inspection memory reaches the reasoning path (§2). Defensible only as *reporting* over stored findings |
| "Adaptive Standards Reasoning" | in-app section heading | **SUPPORTED_WITH_QUALIFICATION** — "adaptive" means the ranking adapts to the observation's context within one request, not that it adapts over time |
| "Tier 3 · Incident learning" | knowledge-tier label | **SUPPORTED_AS_WRITTEN** — describes a source-authority tier, not system learning |
| "HazLenz AI output is advisory and requires qualified human review." | generated report | **SUPPORTED_AS_WRITTEN** |

**No claim anywhere states or implies that HazLenz learns from customer inspections.** No "continuously learns",
"gets smarter", "improves from your inspections" or "trained on" copy exists. Nothing needed to be changed to
avoid a false learning claim; the two `OVERSTATED` items are about action tailoring and repeat-hazard insight,
not about learning.

**Defensible description:**

> HazLenz is an AI-assisted safety reasoning system that evaluates inspection evidence in context, separates
> distinct hazards, considers controls and regulatory context, identifies applicable standards, evaluates risk,
> and explains its assessment while preserving uncertainty when evidence is incomplete. It is a governed,
> deterministic engine: it does not learn from your inspections, and every conclusion is advisory and requires
> qualified human review.

**Would be misleading:** "learns from every inspection", "continuously improves", "gets smarter over time",
"adapts to your site", "machine learning", "trained model", "understands like a safety professional", or any
implication that a correction changes future behaviour.

---

## 10. Scores (not collapsed into one number)

64 live classify calls: 16 situational (B3), 5 adversarial pairs (B4), 3 multi-hazard (B5), 5 uncertainty (B7),
30 natural-language field scenarios (B10), across General Industry, Construction and MSHA.

| Dimension | Score | Rate |
|---|---|---|
| HAZARD_IDENTIFICATION | 54/54 | 1.00 |
| MULTI_HAZARD_SEPARATION | 4/5 | 0.80 |
| CONTROL_STATE | 18/24 | 0.75 |
| ADVERSARIAL_SEPARATION | 5/5 | 1.00 |
| RISK_COHERENCE | 17/19 | 0.89 |
| JURISDICTION | 49/49 | 1.00 |
| STANDARD_PRECISION | 15/15 | 1.00 |
| STANDARD_RECALL (any candidate for an unsafe scenario) | 24/37 | 0.65 |
| CORRECTIVE_ACTION_RELEVANCE | 49/49 | 1.00 |
| CLARIFICATION_QUALITY | 20/21 | 0.95 |
| UNCERTAINTY | 4/5 | 0.80 |
| NO_UNSUPPORTED_PROMOTION | 49/54 | 0.91 |
| EXPLANATION_QUALITY | 49/49 | 1.00 |
| OVERALL_CONTEXTUAL_COHERENCE (zero failures on any dimension) | 14/19 | 0.74 |

Note on `STANDARD_RECALL`: this is a *coverage* measure over unadjudicated field scenarios, not the frozen gold
set. It is low because the corpus is deliberately narrow (26 adjudicated rows). Missing a standard is honest
behaviour — the engine says nothing rather than fabricating — but a safety professional will not receive a
citation for roughly a third of real field observations.

---

## 11. Answers to the fourteen questions

1. **Legitimately AI?** Yes — knowledge-based/symbolic AI. No trained model, no generative model.
2. **What architecture?** `HYBRID_SYMBOLIC_AI`: weighted signal taxonomy + rule/predicate engine + TF-IDF
   retrieval + deterministic risk matrix + corpus-backed applicability, with provenance and uncertainty.
3. **Deterministic vs model-driven?** Everything decision-bearing is deterministic. Nothing is model-driven.
   The only statistical component is TF-IDF similarity.
4. **Does it learn autonomously from customer usage?** **No.** `STATIC_RUNTIME_WITH_ENGINEERING_UPDATES`.
5. **How does it improve?** Reviewed, versioned engineering changes to rules/taxonomy/corpus, gated by frozen
   regression suites and the adjudicated gold set.
6. **Future learning architecture?** Documented but unbuilt — see `LEARNING_ARCHITECTURE.md` in the previous
   closure directory. Entirely FUTURE.
7. **Contextual reasoning, not keywords?** Yes — 5/5 adversarial pairs, plus correct regime separation on
   identical wording. Real negation and control reasoning.
8. **Multi-hazard reasoning correct?** Partly — 4/5, with both under-separation and same-clause over-splitting,
   and fragment-ownership degradation on long observations.
9. **Controls, negation, safe states, ambiguity, uncertainty?** Recognised in most cases, with four specific,
   reproducible failures (bypassed control, contradiction, temporal resolution, blocked exit).
10. **Regulatory/jurisdiction integrity preserved?** Yes — precision 1.00, recall 1.00, zero wrong-regime, zero
    cross-regime leakage in 49 scenarios.
11. **Defensible claims?** Interprets, extracts structure, separates hazards, considers controls and regulatory
    context, surfaces potentially applicable standards for qualified review, evaluates risk, asks materially
    decisive questions, explains itself, never declares a violation.
12. **Misleading claims?** Anything implying learning, adaptation over time, training, or that a correction
    changes future behaviour. Plus, today, "custom … tailored" corrective actions and "repeat-hazard insight".
13. **Remaining gaps?** §7 — four control/contradiction/temporal engine defects, corpus coverage (~35% of field
    scenarios get no citation), multi-hazard separation quality, display-level family mislabelling.
14. **Are any gaps release blockers?** See §12.

---

## 12. Release judgement

**One blocker was found and fixed this session:** multiple same-domain hazards in one observation made the
analysis unsaveable (`inspection.service.ts`, `uniqueHazardKey`). Without it, a routine observation describing
two excavation defects or two electrical defects could not be persisted at all, and the user saw a misleading
version-conflict message. Fixed, verified by a 13-finding end-to-end inspection, gold set and core regression
unchanged.

**The remaining gaps are not release blockers**, because in every case the product fails *safe and visibly*:

- It never declares a violation, never auto-finalises, and labels every standard as a candidate for qualified
  review — a missed or mis-scoped standard is a reviewer's correction, not a false compliance assertion.
- Cross-regime contamination — the failure mode that would actually mislead a customer — measured **zero**.
- The two mis-read control cases (bypassed guard, blocked exit) produce an *under*-call that a competent reviewer
  sees on the finding page with the observation text next to it; they do not fabricate a finding.

They **are** the highest-value engineering backlog, and #1, #2 and #4 in §7 should be fixed before the capability
is marketed as control-state reasoning rather than hazard identification.

---

## Final classification

**`HAZLENZ_CAPABILITY_VERIFIED`** — with the scope stated in this document.

Verified means: the system demonstrably reasons contextually rather than by keyword (5/5 adversarial), preserves
regulatory and jurisdiction integrity absolutely (precision 1.00, recall 1.00, zero leakage), preserves
uncertainty rather than fabricating certainty (candidate-not-supported, no zero-result failure under unknown
jurisdiction, no unsupported promotion), produces coherent evidence→hazard→standard→risk→action→explanation
chains in 14/19 full-chain scenarios, and is honestly describable to customers without any learning claim.

Verified does **not** mean complete: control-state reasoning, contradiction handling, temporal resolution and
corpus coverage are measurably incomplete and are recorded above rather than smoothed over.

---

# SAFETY_SEMANTICS_PRECOMMIT_CLOSURE

Date: 2026-08-18, after the capability-truth audit and before commit. Baseline `97941ca2`, still
uncommitted. Scope: decide which of the 12 audited gaps are safety-semantic defects that must not
ship, fix exactly those, and freeze them with permanent regression coverage. The report/PDF work
was frozen and is untouched (renderer SHA-256 unchanged — see §"Report work unchanged" below).

Governing invariant, unchanged: **unsupported citation < honest uncertainty**. But
**false SAFE / false CONTROLLED / meaning inversion / a hazard disappearing because evidence
conflicts is not acceptable**, and those were treated as blockers regardless of the fact that
they "only" under-call.

## 1. All 12 gaps by release significance

| # | Gap | Classification | Hazard recog. | Control state | Risk coherent | Standards | Clarification | Blocker | Disposition |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Bypassed/defeated interlock read as an effective control | **SAFETY_MEANING_INVERSION** | correct | **WRONG** | **WRONG** (risk 0 / Controlled) | wrong (`NOT_APPLICABLE`) | not asked | **YES** | **FIXED** |
| 2 | Contradicted lockout evidence erases the hazard entirely | **CONTRADICTION_HANDLING_DEFECT** (with SUPPORTED_HAZARD_SUPPRESSION) | **WRONG** (no hazard) | **WRONG** | incoherent (High risk, no hazard) | none | not asked | **YES** | **FIXED** |
| 3 | Resolved-yesterday trench still cites 1926.652(a)(1) SUPPORTED at High | APPLICABILITY_AMBIGUITY | correct | wrong (temporal resolution ignored) | over-called | over-called, correct regime | n/a | NO | backlog |
| 4 | Blocked exit → 1910.36 `CONTRADICTED`, risk `Controlled` | **FALSE_SAFE_OR_CONTROLLED** | correct | **WRONG** | **WRONG** | wrong (contradicted) | not asked | **YES** | **FIXED** |
| 5 | Explicitly all-clear observations still emit hazard domains | LOW_VALUE_QUALITY_GAP | over-called | n/a | over-called | correctly none | n/a | NO | backlog |
| 6 | Top-level `classification`/`hazardCategory` disagrees with the decomposition domain | LOW_VALUE_QUALITY_GAP | display-level only | n/a | n/a | unaffected | n/a | NO | backlog |
| 7 | Noise recall is phrasing-sensitive (`94 dba 8hr TWA` cites, `92 dBA sustained…` does not) | NATURAL_LANGUAGE_COVERAGE_GAP | correct | correct | correct | honest empty | n/a | NO | backlog |
| 8 | 13 field scenarios with no candidate standard | STANDARD_COVERAGE_GAP | mostly correct | correct | correct | honest empty | some asked | NO | backlog (breakdown in §4) |
| 9 | Multi-hazard under-separation and same-clause over-splitting | LOW_VALUE_QUALITY_GAP | partial | correct | correct | correct | n/a | NO | backlog |
| 10 | Long observations give a finding the whole observation as its fragment, so its standard follows the wrong hazard | APPLICABILITY_AMBIGUITY | correct | correct | correct | **finding-scope misattribution** (right regime, wrong hazard) | n/a | NO | backlog — highest-priority of the non-blockers |
| 11 | Multi-finding corrective-action specificity comes from a hand-written family map in the frontend | SUPPORTED_BEHAVIOR | correct | correct | correct | correct | n/a | NO | behaviour kept; the marketing claim it supported was corrected (§6) |
| 12 | "There is an opening in the mezzanine floor" is finalisable with zero questions | APPLICABILITY_AMBIGUITY | correct | unknown | High | honest empty | **should have asked** | NO | backlog |

Nothing was called non-blocking merely because the system under-called. Gaps 1, 2 and 4 were
blockers precisely because a safety professional reading the output would have been told a
dangerous condition was controlled, or would have seen no finding at all.

## 2. Bypassed interlock — before / after

Root cause: `shared-evidence-facts.ts` matched `guard|interlock … installed|bolted|secured|tested`
and recorded `guardState = 'present_and_effective'`. That made 1910.212(a)(1) `NOT_APPLICABLE`;
`evidence-foundation.ts` then took its suppressed-only branch and declared the **whole
observation** a `controlled_condition` with `riskBand: 'Controlled'`, risk score 0.

Fix (semantic, not fixture-matching): a protective device that is **defeated** is recorded as
`absent_or_ineffective` — the vocabulary the predicate names already use ("guard absent **or
ineffective**"). Detection covers bypass/defeat/override/jumper/tape/tie-back/wedge/block-open/
prop-open/pin-open/disable/deactivate/make-inoperative/disconnect, in either word order, over
guards, interlocks, safety switches, limit switches, light curtains, presence sensors, two-hand
controls, e-stops and safety gates. Three states are distinguished: defeated-and-unresolved →
ineffective; defeated-then-restored-**and**-verified → effective; **merely suspected** → no fact
at all, so applicability stays UNKNOWN rather than fabricating certainty either way.
`present_and_effective` was also widened to accept `functioning|works as designed|operational|in
service`, which fixed the mirror-image inversion (a *functioning* interlock previously read High).

| Observation | Before | After |
|---|---|---|
| interlock guard installed **but bypassed with a jumper wire**, machine runs with guard open | risk **Controlled**, 1910.212(a)(1) `NOT_APPLICABLE`, 0 questions | risk **High**, 1910.212(a)(1) `UNKNOWN`, 1 question |
| Operator **bypassed** the interlock | risk Moderate, no standard | risk Moderate, 1910.212(a)(1) `UNKNOWN`, 1 question |
| Interlock **defeated** so the machine will run with the guard open | risk High, `UNKNOWN` | unchanged (was already correct) |
| **Jumper installed across** the safety interlock | risk **Controlled**, `NOT_APPLICABLE` | risk Moderate, `UNKNOWN`, 1 question |
| Interlock installed but intentionally **disabled** | risk **Controlled**, `NOT_APPLICABLE` | risk Moderate, `UNKNOWN`, 1 question |
| The machine interlock **is functioning normally** | risk **High** (inverted) | risk **Controlled** |
| Guard interlock **tested and works as designed** | Controlled | Controlled (no regression) |
| Previously bypassed but **restored and function-tested** | Controlled | Controlled (no regression) |
| Worker says the interlock **may have been** bypassed; not confirmed | Moderate, no standard | Moderate, no standard — uncertainty preserved, no Controlled claim |
| Fixed guard verified in place, interlock function-tested (genuinely good) | Controlled | Controlled (no regression) |

## 3. Contradictory LOTO evidence — before / after

Root cause, two layers:
1. `shared-evidence-facts.ts` recorded `energyIsolationState = 'isolated_and_verified'` from the
   positive clause alone, so "worker says equipment is locked out, **but I could not verify
   isolation**" asserted verified isolation — the affirmative phrase cancelled the contradicting
   evidence.
2. `multi-hazard-decomposition.service.ts` requires a *recognised control-failure phrase* to keep
   a `lockout_tagout` route. An observation that claims the control and then contradicts it
   matched none of them, and the per-fragment gates zeroed the route — the hazard vanished
   entirely: no domain, no standard, no question.

Fixes: (a) isolation is not recorded as verified when the same observation reports it unverified
or contradicted — and the opposite is **not** asserted either, because "I could not verify" is
uncertainty, not a proven live circuit; (b) a **last-resort** preservation rule, evaluated after
every other detector and filter so it can only add a hazard that would otherwise be lost, keeps a
`lockout_tagout` finding when an **affirmed** control claim (negation-aware, via the same
negation-window utility the classifier uses) coexists with contradicting or unverified evidence.
The contradiction is carried as the finding's evidence gap and reviewer question.

| Observation | Before | After |
|---|---|---|
| A. Locked and tagged out. Disconnect **may still be energized** | **no hazard**, no standard | `lockout_tagout` ACTIVE, High |
| B. Lock installed but **power was never verified** | **no hazard** | `lockout_tagout` ACTIVE, 1 question |
| C. De-energized and locked out, but **stored hydraulic pressure remains** | `hydraulic_pneumatic_energy` ACTIVE; isolation wrongly `isolated_and_verified` | `hydraulic_pneumatic_energy` ACTIVE; isolation no longer claimed verified |
| D. Lockout complete; electrician **measured voltage at the work point** | **no hazard** | `lockout_tagout` ACTIVE, High |
| E. Locked out, but **I could not verify isolation** | **no hazard**; isolation wrongly `isolated_and_verified` | `lockout_tagout` ACTIVE, High; isolation not claimed verified |
| F. Disconnect open, lock applied, **zero-energy verification completed**, stored energy relieved | no hazard | no hazard, `isolated_and_verified` retained (**must not** become a hazard — verified) |
| Originating case: says locked out, **disconnect found ON, no lock or tag** | **no hazard** | `lockout_tagout` ACTIVE, High |

## 4. Blocked exit (gap 4) and the empty-standard breakdown

**Blocked exit.** The 1910.36 / 1926.34(a) "occupied workplace" predicate was a bare boolean, so
an observation that simply did not use the word "employees" made the predicate **FALSE**, which
`CONTRADICTED` the standard, which (contradicted-only decision set) reported the observation as a
`controlled_condition` at risk 0 — a blocked exit presented as safe. Unstated facts are now
`undefined` (UNKNOWN), matching the idiom the neighbouring exit-state predicate already used.

| Observation | Before | After |
|---|---|---|
| exit door by shipping blocked w/ pallets, been like that all week | risk **Controlled**, 1910.36 **CONTRADICTED** | risk **High**, 1910.36 **UNKNOWN** (candidate) |
| ground-floor exit door chained shut while twelve **workers are on shift** | SUPPORTED | SUPPORTED (no regression) |
| exit is open, unlocked, illuminated and clear | Controlled / NOT_APPLICABLE | Controlled / NOT_APPLICABLE (no regression) |

**Empty-standard breakdown (13 of 37 unsafe field scenarios, ~35%).** Analysed individually; no
attempt was made to chase 100% candidate production.

| Category | Count | Cases |
|---|---|---|
| CORPUS_GAP (hazard identified, no adjudicated rule exists in the 26-row corpus) | 8 | eyewash (B10-09), electrical working clearance (B10-11), incompatible chemical storage (B10-12), cylinder securing (B10-13), construction GFCI/temporary power (B10-19), ladder extension (B10-20), aerial-lift tie-off (B10-25), haul-road berm (B10-28) |
| RULE_MAPPING_GAP (rule exists in corpus and fires on fuller wording, but the terse field phrasing does not satisfy its predicates) | 1 | MSHA tail pulley "guard off" (B10-26) — 56.14107(a) fires as SUPPORTED on "the tail pulley guard on the conveyor is missing" |
| HAZARD_RECOGNITION_GAP (the hazard itself is misidentified, not merely uncited) | 1 | rebar impalement read as "Compressed Gas Cylinders" (B10-23) |
| INSUFFICIENT_APPLICABILITY_EVIDENCE (honest — the deciding fact is genuinely unstated) | 1 | contradicted lockout (B3-04); now yields a hazard and a candidate-free UNKNOWN, which is correct |
| SUPPORTED_BEHAVIOR (deliberately safe observations; no citation is the right answer) | 2 | B10-15, B10-30 |

Only the HAZARD_RECOGNITION_GAP is a different class from "no standard": a missed or misnamed
hazard is a real recall defect. It is recorded as backlog, not fixed here, because it is a
taxonomy-routing issue rather than a safety-meaning inversion.

## 5. New permanent regression coverage

`backend/src/safescope-v2/tests/hazlenz-defeated-control-contradiction-regression.ts`, registered
in `hazlenz-core-regression.ts` (core suite count 27 → 28). **30 invariants, all passing**, over:
active bypassed/defeated controls (8 phrasings incl. light curtain, safety gate, limit switch);
genuinely functioning controls; restored-and-verified controls; suspected-only bypass; unverified
and contradicted isolation (5 phrasings); verified zero-energy state; explicit "no lock or tag";
contradiction survival (5 phrasings) including the finding's condition state, review requirement,
evidence gap and reviewer question; verified isolation **not** becoming a hazard; positive and
negative evidence about different hazards in one observation yielding exactly one LOTO and one
electrical finding with no whole-observation catch-all; residual stored energy after partial
lockout; and unstated-occupancy egress (UNKNOWN, SUPPORTED, NOT_APPLICABLE).

## 6. Marketing claims

Both flagged claims were confirmed **visible to customers** and neither could be proven from the
production path, so both received the narrowest truthful correction. No new AI superlatives were
added, and nothing implying human-level understanding, complete understanding, continuous
learning or self-improvement was introduced.

- **"Recommends custom, layered action plans … tailored to the hazard mechanism"** (`/hazlenz`).
  Verified: per-finding layered structure always holds; the *tailoring* comes from a hand-written
  family map, and families outside it receive generically worded steps. Reworded to claim the
  structure ("an immediate containment step, a permanent correction, and a verification step")
  and to qualify the tailoring ("with the wording matched to the hazard family where a specific
  control is established"), plus the existing advisory caveat.
- **"Repeat-hazard insight support"** (Pro tier, `/pricing`). Verified inert: `trendIntelligence`
  and `siteMemory` read only `priorFindings` from the classify request, which the inspection
  workspace never sends — every analysis returns recurrence risk `low`, `relatedFindingCount: 0`,
  `repeatedClassificationCount: 0`. **Removed** rather than reworded: no adjacent capability was
  verified closely enough to justify a substitute claim, and the adjacent "Saved inspection
  history" bullet already states what the tier genuinely provides.

## 7. Architecture and learning classification — unchanged

Re-confirmed, not re-derived from scratch, and **not** altered by this pass: HazLenz remains a
**knowledge-based / symbolic AI** system — no LLM, no neural model, no embedding model, no
continuously self-learning component. The fixes made here are rule and evidence-extraction
changes; they add no learning of any kind.

Learning classification remains **`STATIC_RUNTIME_WITH_ENGINEERING_UPDATES`**.

The distinction stated in the audit is preserved and matters commercially: **HazLenz reasons
contextually** (demonstrated again here — a defeated control, a restored control and a merely
suspected defeat now produce three different conclusions from near-identical vocabulary) **without
learning autonomously from use**. Those are different capabilities and only the first is claimed.

## 8. Re-verified invariants

| Check | Result |
|---|---|
| New safety-semantic suite | **30/30 invariants pass** |
| `test:hazlenz-core` | **28 suites pass, 2 fail** — the same two pre-existing baseline failures (Golden Hardening Scenarios, Production Path "tagged but not locked"), unchanged before/after |
| Standards gold set (31 cases) | **precision 1.00 (24/24), recall 1.00 (24/24), wrong-regime 0, false-positive 0**, correct no-match 7/7 |
| `test:safescope` | 11/12 — same pre-existing case as baseline |
| `test:safescope-standards` | 15/15 |
| `test:safescope-domains` | pass |
| `test:safescope-operational` | pass |
| `test:standards-corpus-integrity` | all invariants pass, 0 failed |
| Adversarial semantic pairs | re-run live; controlled variants still produce no SUPPORTED citation, hazard variants still differ materially |
| Jurisdiction | no cross-regime leakage introduced; gold set wrong-regime remains 0 |
| Inspection-context / autonomy suite | all invariants pass (see the regression note below) |
| Clarification gauntlet | pre-existing failure, unrelated to this pass (see below) |
| Backend build / `tsc --noEmit` | clean |
| Frontend build / `tsc --noEmit` | clean (only the two pre-existing `.next/types/* 2.ts` generated-file duplicates) |
| `git diff --check` | clean (exit 0) |

**A regression was introduced and caught during this pass.** The first version of the contradiction
rule ran before the other detectors and used a non-negation-aware claim test, so "hazardous energy
has *not* been isolated or locked out" was treated as a contradiction and produced a second,
whole-observation LOTO finding that absorbed a co-occurring electrical clause — failing invariant
10a of the Inspection-Context / Autonomy suite (finding A must not contaminate finding B). It was
fixed by moving the rule to last-resort position, scoping its fragment to the relevant clauses,
and using the shared negation-window utility. That case is now itself frozen as an invariant in
the new suite.

**Attribution of the extractor change was proved, not assumed.** A before/after A/B of
`buildEvidenceFacts` over 17 texts (the clarification gauntlet's own inputs, the golden-suite
inputs and the semantics corpus) shows **exactly 2 of 17 changed** — the two intended defect
cases. `"Guard is missing."`, `"Cord is damaged."`, `"Equipment is being serviced without
lockout."`, `"The circuit was deenergized, locked out, and verified before work began."` and the
rest are byte-identical. The clarification gauntlet's `machine-controls` failure therefore does not
originate here; that gauntlet also defaults to `http://localhost:4000` (a pre-existing nodemon dev
watcher, not the verification backend) and has no clean passing run in any archived log.

## 9. Report work unchanged and re-verified

`canonical-report-pdf-renderer.ts` and `canonical-reports.service.ts` are **byte-identical** to the
frozen candidate (SHA-256 matches `changed-files-sha256.txt` exactly). To prove report generation
still works with the changed semantics, a new inspection built from the three fixed defect
observations was driven end to end through the real product path: 3 findings, 6-page PDF, layout
checker **OK**, and the customer-facing pages now read "Finding 1 — Machine Guarding, Risk: High"
for the bypassed interlock and "Finding 2 — Lockout Tagout, Risk: High" for the contradicted
lockout, where the frozen candidate would have printed a controlled condition and no finding at
all.

## 10. Final state

- Files changed in this pass: `backend/src/safescope-v2/evidence/shared-evidence-facts.ts`,
  `backend/src/safescope-v2/evidence/evidence-foundation.ts`,
  `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`,
  `backend/src/safescope-v2/tests/hazlenz-core-regression.ts`,
  `backend/src/safescope-v2/tests/hazlenz-defeated-control-contradiction-regression.ts` (new),
  `frontend-next/app/hazlenz/page.tsx`, `frontend-next/components/pricing/PricingContent.tsx`.
- Original `safescope` database untouched: 0 `regulatoryContext` columns, migration timestamp
  `1800000005700`, `standards_master` still 0 rows — re-verified after all work. It was never a
  migration/seed/mutation target. (Note: the user's own `nodemon` dev server on `:4000` connects
  to it and restarts on file save; `TYPEORM_SYNCHRONIZE` is not set, and the schema was confirmed
  unchanged.)
- Four pre-existing stashes untouched.
- Nothing committed, pushed, or deployed.

## Classification

**READY_FOR_DIFF_INTEGRITY_AND_COMMIT**
