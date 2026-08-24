# HazLenz Level-3 Reasoning Architecture — TARGET, NOT YET IMPLEMENTED

**Status:** `TARGET — NOT YET IMPLEMENTED`. Nothing in this document describes current behaviour.
Baseline HEAD `1feda622`. No implementation file was changed by the phase that produced it.

---

## 1 — Target flow, observation to customer finding

```
observation + inspection context
   │
   ├─(D) normalize text ─────────────────────► CANONICAL SOURCE (offset base for all evidence spans)
   │
   ├─(D) deterministic signals ──────────────► retrieval hints only, never customer-authoritative
   │        taxonomy routing · lexical classifier · registries · evidence facts
   │
   ▼
 (S) SEMANTIC_REASONING_AUTHORITY                            ◄── ONE structured call per observation
       input: SemanticReasoningInput v1 (minimum sufficient context)
       output: StructuredReasoningResult v1  ── A PROPOSAL, never a finding
   │
   ▼
 (D) DETERMINISTIC_SAFETY_VALIDATOR
       schema · taxonomy · evidence spans exist in source · negation scope intact ·
       condition-state legality · duplicate control · grounding
   │
   ├── REJECTED ──► truthful bounded failure state (never a fabricated conclusion, never silent L1)
   │
   ▼ VALID
 VALIDATED FINDING FACTS
   │
   ├─(D) REGULATORY_RETRIEVAL_AUTHORITY  `applicableStandards.suggest()`  ── UNCHANGED
   │        → eligible candidate set (ranked, jurisdiction-filtered, truncated)
   │
   ▼
 (S) REGULATORY_APPLICABILITY_REASONING   ── may ONLY select/reject among supplied candidates
   │
   ▼
 (D) citation identity validation → (D) GOVERNED_CONTENT_AUTHORITY (KG) ── UNCHANGED
   │
   ├─ HYBRID RISK: (S) factors → (D) bounded scoring
   ├─ (S) corrective-action intent → (D) grounding validation → (D) template rendering
   ├─ (S) clarification decision → (D) dependency validation
   │
   ▼
 (D) PRESENTATION_AUTHORITY — renders validated results, performs no hidden reasoning
   │
   ▼
 (D) persistence · provenance gate · human review · finalization · report ── UNCHANGED
```

**The single structural guarantee:** the semantic layer sits *between* deterministic retrieval and
deterministic governance, and touches neither. It cannot originate a citation because it never sees a
citation it was not handed, and it cannot mark anything governed because governance runs after it.

---

## 2 — Authority map

| Concern | Authoritative today | Authoritative at Level 3 | Transition |
|---|---|---|---|
| Observation interpretation | weighted lexical classifier | **SEMANTIC** (proposal) → validator | L3-2 |
| Hazard decomposition | `multiHazardEngine.decompose()` regex | **SEMANTIC** → validator | L3-3 |
| Condition state | `inferConditionState()` cascade, default ACTIVE | **SEMANTIC** → validator, **no default ACTIVE** | L3-3 |
| Evidence binding | fragment slicing | **SEMANTIC spans** → validator verifies offsets against canonical source | L3-2 |
| Jurisdiction | lexical inference | **SEMANTIC** proposes; user context is a **deterministic constraint** when set | L3-4 |
| Regulatory retrieval | `applicableStandards.suggest()` | **DETERMINISTIC — unchanged** | — |
| Regulatory applicability | `evidence-foundation.ts` predicates | **SEMANTIC over retrieved candidates only**; identity stays deterministic | L3-4 |
| Governed content, citation identity, review state, release membership, provenance, badges | KG subsystem | **DETERMINISTIC — unchanged** | — |
| Risk | `evaluateRisk()` matrix | **HYBRID** — semantic factors, deterministic scoring | L3-5 |
| Corrective action | canned template library | **SEMANTIC intent** → deterministic grounding → template *rendering* | L3-5 |
| Clarification | per-family question registry | **SEMANTIC decision-boundary** → deterministic dependency validation | L3-5 |
| Presentation | includes regex repair (`ensureVisiblePrimaryCitationContract`, `enforceVerifiedControlDisplay`) | **rendering only**; both regex repairs retired | L3-6 |
| Persistence, provenance gate, human review, finalization, report/PDF | deterministic | **DETERMINISTIC — unchanged** | — |

---

## 3 — Protected Level-3 invariants

| ID | Invariant | How it is guaranteed |
|---|---|---|
| **L3-INV-01** | **No invented citations.** All regulatory candidates originate from deterministic eligible retrieval. | **Structural** — the seam sits downstream of `suggest()` and the model receives a closed candidate list. A citation not in that list is rejected by the validator. |
| **L3-INV-02** | **Evidence-bound findings.** No finding becomes customer-authoritative without traceable observation/context evidence. | Validator: every span must resolve to real offsets in the canonical source. |
| **L3-INV-03** | **No model governance authority.** The model cannot mark content reviewed, approved, current, governed, released or authoritative. | **Structural** — governance resolution runs *after* validation; those fields are not in the output schema at all. |
| **L3-INV-04** | **No default ACTIVE.** Failure to understand a condition must never become ACTIVE. | Schema requires an explicit condition state **and** a `conditionRationale`; `INSUFFICIENT_EVIDENCE`/`UNKNOWN` are first-class. Validator rejects ACTIVE without supporting spans. |
| **L3-INV-05** | **Safe failure.** Model failure produces a truthful bounded failure state, not a fabricated conclusion. | See §6. |
| **L3-INV-06** | **Decision-boundary clarification.** Ask only when an unresolved fact materially changes a substantive decision. | Schema requires `clarificationDecision` naming the affected decision and its branches; validator rejects a question with no dependent decision. |
| **L3-INV-07** | **Structured output only.** Customer-path inference uses a strict machine-validated structure. | Free-form prose is never authoritative; only schema fields are consumed. |
| **L3-INV-08** | **Model output is a proposal.** Nothing reaches a customer until deterministic validation succeeds. | Validator is the only path from `StructuredReasoningResult` to `ValidatedFinding`. |
| **L3-INV-09** | **Regulatory text remains governed.** Pretrained knowledge cannot substitute for reviewed regulatory content. | **Structural** — text bytes come from the KG release record; the model never supplies regulatory text. |
| **L3-INV-10** | **No silent Level-1 fallback.** A degraded lexical result is never presented as equivalent Level-3 analysis. | See §6. **The existing `buildDegradedHazLenzIntelligence()` violates this today** and is retired. |
| **L3-INV-11** *(added)* | **Negation scope is preserved.** An evidence span may not exclude a negation or control token that governs its meaning. | Validator rule; RC-08 is the proof it is required. |
| **L3-INV-12** *(added)* | **Deterministic signals are advisory.** No lexical registry, template or regex may re-acquire customer authority over a semantic judgement. | Architectural inventory (§7) plus a reachability assertion in the L3 default-off suite. |

---

## 4 — Semantic input contract (`SemanticReasoningInput v1`)

**Minimum sufficient context.** Sent:

* the canonical normalized observation text (the offset base);
* inspection-level context actually needed to reason: work environment / area, task, equipment named by the user;
* the user-selected regulatory context **and its provenance** (`USER_CONFIRMED` / `UNKNOWN`);
* answered decision-critical clarifications for this observation;
* the **allowed hazard taxonomy** (closed vocabulary the model must choose from);
* the **deterministic retrieval candidate set** (citation ids + titles only), when the call is the applicability call;
* minimal already-established findings for this inspection — ids, family, condition state, and span ranges — **for duplicate control only**.

**Explicitly NOT sent:**

* employee names, inspector names, customer/company names, site names or addresses;
* photos or attachments (see §9, `TEXT_FIRST_LEVEL3`);
* arbitrary database rows, full `resultSnapshot`s, prior analyses, or any `standards_master` row body;
* governed release identity, review state, approval digests or provenance;
* reviewed regulatory text (the model reasons about applicability, not about text it might paraphrase);
* any other organization's data.

Contract is versioned; the version is recorded on every telemetry record.

---

## 5 — Structured reasoning output (`StructuredReasoningResult v1`)

```
analysisStatus: HAZARD_ESTABLISHED | NO_HAZARD_ESTABLISHED | INSUFFICIENT_EVIDENCE | CONTROLLED_OR_CORRECTED
observationInterpretation: string            // summary, NOT authoritative on its own
hazardCandidates[]:
    hazardFamily            // MUST be from the supplied closed taxonomy
    conditionState          // ACTIVE | CONTROLLED | CORRECTED | REMOVED_FROM_SERVICE |
                            // NEGATED | HYPOTHETICAL | PLANNED_FUTURE | HISTORICAL |
                            // INSUFFICIENT_EVIDENCE | UNKNOWN
    evidenceSpans[]         // {sourceId, startOffset, endOffset} — mechanically verifiable
    conditionRationale      // why THIS state, referencing its spans
    independentHazardRationale   // why this is a SEPARATE hazard, not another cue for a sibling
    uncertainties[]
    clarificationRequired: boolean
    clarificationDecision   // {unresolvedFact, affectedDecision, branches[], question} or null
    correctiveActionIntent  // {objective, hierarchyLevel, immediateControl, longTermAction}
    riskFactors             // {consequenceSeverity, exposure, frequency, affectedPersons,
                            //  existingControls[], uncertainty}
```

**No numerical confidence field.** Its operational meaning and calibration are undefined today, and
§28 measured the existing `confidence` scalar carrying no usable signal (0.25 on both correct and
fabricated findings). A calibrated confidence may be added later **with** a defined meaning and a
calibration procedure — not before.

**Candidate ≠ finding.** `hazardCandidates[]` are proposals. Only the validator emits
`ValidatedFinding`, which is the sole type the downstream pipeline consumes.

### Evidence binding (RC-08 is the hard requirement)

Spans are `{sourceId, startOffset, endOffset}` against the **canonical normalized text**, so they are
mechanically verifiable rather than re-matched by string search. The validator asserts:

* the span resolves inside the named source and the substring equals what the model claimed;
* the `sourceId` is one that was actually supplied;
* **negation scope is intact** — a span may not end or begin such that a governing `no / not / never /
  without / removed / corrected / locked out` token immediately preceding or binding it is excluded
  (`L3-INV-11`). W2's `"safety net or personal fall arrest system in use"` is the canonical rejection case;
* several spans may support one candidate, and a span may be widened to preserve meaning;
* any span that cannot be resolved rejects the candidate.

The existing "Why flagged" data can evolve into this representation: it already carries a fragment and
a finding link; it needs offsets and a source id rather than a sliced string.

---

## 6 — Failure and fallback behaviour

| Condition | Response |
|---|---|
| Provider timeout | one bounded retry, then `ANALYSIS_UNAVAILABLE` |
| Provider outage / rate limit | `ANALYSIS_UNAVAILABLE` — no retry storm |
| Malformed / non-JSON output | one bounded retry with the same input, then `REJECTED_MODEL_OUTPUT` |
| Schema violation | `RETRYABLE_MODEL_OUTPUT` once, then reject |
| Invented evidence span | **reject the candidate, no retry** — a model that invented evidence once is not asked again for the same observation |
| Hazard family outside the taxonomy | reject the candidate |
| Citation outside the retrieved candidate set | reject the candidate (`L3-INV-01`) |
| Contradiction with user-established context | reject the candidate; surface as a clarification if the contradiction is itself decision-critical |
| All candidates rejected | `INSUFFICIENT_EVIDENCE` |

**What the customer experiences (`L3-INV-05`, `L3-INV-10`).** The analysis surface states plainly that
**HazLenz reasoning did not complete**, that no hazard conclusion was produced, and that the
observation is saved and can be re-analysed. It does **not** show a hazard family, a condition state, a
risk band, a citation or a corrective action derived from lexical fallback.

> **Explicitly retired:** `buildDegradedHazLenzIntelligence()`. It emits family-keyed `evidenceGaps`
> and `classReason` prose and tells the customer "Core classification, risk, standards candidates, and
> corrective actions were still generated" — presenting degraded template output as substantively
> complete. That is precisely the `L3-INV-10` failure, already in the tree.

A **narrow deterministic safety warning** may be preserved where it is truthful and clearly labelled
as not-a-HazLenz-analysis (for example: "this observation contains wording associated with a
high-consequence hazard family; HazLenz reasoning did not complete — qualified review required").
It carries no citation, no risk band and no condition state.

---

## 7 — Disposition of the current rule engine

**Nothing is deleted in this programme.**

| Component | Disposition |
|---|---|
| Taxonomy routing (`taxonomy/hazard-taxonomy.ts`) | **KEEP_AS_GUARDRAIL** — supplies the closed vocabulary the model must choose from |
| Weighted lexical classifier | **KEEP_AS_RETRIEVAL_SIGNAL** + **RETIRE_FROM_CUSTOMER_AUTHORITY** |
| Condition-state regexes (`inferConditionState`) | **RETIRE_FROM_CUSTOMER_AUTHORITY**; **KEEP_AS_REGRESSION_CONTROL** |
| Evidence extraction (`shared-evidence-facts.ts`) | **KEEP_AS_GUARDRAIL** — negation-first extraction is a validator input for `L3-INV-11` |
| Multi-hazard decomposition | **RETIRE_FROM_CUSTOMER_AUTHORITY**; **KEEP_AS_REGRESSION_CONTROL** |
| Clarification templates | **KEEP_AS_RENDERING_AID** — wording helpers, not reasoning authorities |
| Corrective-action templates | **KEEP_AS_RENDERING_AID**; template *selection* retires from authority |
| Standards candidate routing / `suggest()` | **KEEP_AUTHORITATIVE** — unchanged |
| Standards applicability (`evidence-foundation.ts`) | **KEEP_AS_GUARDRAIL** for citation identity; applicability judgement moves to semantic-over-candidates |
| Risk logic (`evaluateRisk`) | **KEEP_AUTHORITATIVE for scoring**; factor extraction moves to semantic |
| `ensureVisiblePrimaryCitationContract`, `enforceVerifiedControlDisplay` | **RETIRE_FROM_CUSTOMER_AUTHORITY** — presentation-layer compensation for RC-01/RC-07 |
| `buildDegradedHazLenzIntelligence` | **RETIRE_FROM_CUSTOMER_AUTHORITY** (`L3-INV-10`) |
| `reasoningOrchestratorService.reason()` | **KEEP_AS_RETRIEVAL_SIGNAL**; its name overstates its role and should be corrected when it loses authority |

---

## 8 — Hybrid regulatory context (target behaviour)

`HYBRID` is the accepted decision and is not reopened.

| Case | Behaviour |
|---|---|
| **Explicit context set** | Treated as a **deterministic constraint** on retrieval and on the final regulatory conclusion. The semantic layer may not override it; it may surface a contradiction as a clarification. |
| **Unknown but strongly inferable** | Semantic layer infers the regime, labelled `HAZLENZ_INFERRED`, never `USER_CONFIRMED`. Retrieval is then constrained to that regime. |
| **Genuinely ambiguous** | The **hazard conclusion still proceeds**; the **regulatory conclusion is withheld** pending one targeted jurisdiction clarification. |

**Hazard reasoning is separated from regulatory conclusion.** RC-09 measured 26% cross-regime citation
sets under `unknown`; the fix is not to stop analysing, it is to stop *citing* until the regime is
established. This reuses the existing one-time `jurisdiction-work-environment` question, which already
fires and whose answer already persists onto the inspection.

The uncommitted `REQUIRE_EXPLICIT` proposal is **not** the implementation target.

---

## 9 — Multimodal scope

> ### `TEXT_FIRST_LEVEL3`

Evidence: `real-image-analysis.service.ts` operates on `simulatedVisionFindings`, captions, field notes
and metadata; its own advisory boundary says so; no image-decoding or vision library is present in
`backend/package.json` (33 runtime dependencies, zero model/vision providers). **HazLenz performs no
image inference today**, so image reasoning is not a capability being *preserved* — it would be a new
one.

Level-3 acceptance therefore covers observation and context reasoning. Photo reasoning becomes a later,
separately scoped capability slice. Every measured Level-3 blocker (RC-01/04/05/07/08) is a text-reasoning
failure; none would be resolved by adding images, and adding them now would widen the privacy boundary
(§10) and the evaluation surface at the same time.

---

## 10 — Security / privacy boundary

Sent to the provider: normalized observation text, minimal inspection context, the closed taxonomy, the
retrieval candidate list, answered clarifications. **Not sent:** personal names, site names/addresses,
photos, arbitrary records, governed release state, or cross-organization data.

Requirements on the provider: **zero training on submitted data**, a stated retention window with the
ability to opt to zero/short retention, regional/data-handling terms compatible with customer
commitments, and no provider-side logging of request bodies beyond that window. Redaction runs
**before** transport, in the input-contract builder, so it cannot be bypassed by a later caller.
Secrets via environment, never in the repository. Organization isolation is preserved because the input
contract is built per analysis from that analysis's own inspection.

---

## 11 — Level 3 vs Level 4 / 5

**Level 3 is runtime reasoning competence. It does not require self-modification.** The verified
finding stands: stored corrections do not influence later reasoning today, and Level 3 does not change
that.

Future **Level 4** flow, conceptual only: reviewed feedback → governed learning artifact → evaluation
→ controlled policy/retrieval/model improvement → regression proof → release. Raw user corrections
never mutate safety behaviour directly. **Not implemented, not scheduled here.**

**Knowledge freshness stays governed.** Reasoning ≠ regulatory authority. The interface between the
Level-3 engine and KG is exactly two directions: KG supplies eligible candidates and reviewed artifact
bytes; the engine returns a selection among those candidates. Nothing else crosses. The KG architecture
is **not reopened**.
