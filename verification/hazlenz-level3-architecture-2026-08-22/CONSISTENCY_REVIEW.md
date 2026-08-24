# Phase 36 — Architecture consistency review

Twelve challenges, answered from the design, with contradictions resolved **in the architecture**.

| # | Challenge | Answer | Resolved by |
|---|---|---|---|
| 1 | Does any model get authority it should not have? | **No.** The model proposes; it never resolves citation identity, review state, release membership, provenance or badges — those run downstream of validation and are not fields in the output schema | `L3-INV-03`, `L3-INV-08`; structural |
| 2 | Does any old lexical rule remain customer-authoritative for semantic interpretation? | **Not after L3-6.** Interpretation, decomposition and condition state move at L3-3; applicability at L3-4; clarification/risk/action at L3-5; the two presentation regex repairs and the degraded-template fallback retire at L3-6 | disposition table + `L3-INV-12` reachability assertion |
| 3 | Can the model invent a citation? | **No** — it only ever sees a closed candidate list produced by `suggest()`, and the validator rejects anything outside it | `L3-INV-01`; structural, because the seam is downstream of retrieval |
| 4 | Can unsupported evidence survive? | **No** — every span must resolve to real offsets in the canonical source, and negation scope must be intact | `L3-INV-02`, `L3-INV-11` |
| 5 | Can uncertainty silently become ACTIVE? | **No** — the schema forces an explicit state plus a rationale, `INSUFFICIENT_EVIDENCE`/`UNKNOWN` are first-class, and ACTIVE without supporting spans is rejected | `L3-INV-04` |
| 6 | Can inference failure silently degrade to Level 1? | **No** — failure produces `ANALYSIS_UNAVAILABLE` with no family, state, risk, citation or action. **`buildDegradedHazLenzIntelligence()` is retired**, having been identified as this exact anti-pattern already in the tree | `L3-INV-10` |
| 7 | Does regulatory content remain governed? | **Yes** — the model never supplies regulatory text; bytes come from the KG release record | `L3-INV-09`; KG untouched |
| 8 | Does HYBRID jurisdiction still work? | **Yes** — explicit context constrains deterministically; strong wording is inferred and labelled `HAZLENZ_INFERRED`; genuine ambiguity withholds the **regulatory** conclusion while the **hazard** conclusion proceeds | §8 |
| 9 | Are learning and inference still separated? | **Yes** — Level 3 adds runtime reasoning only; no correction feeds back into behaviour | §11 |
| 10 | Is Level 3 achievable without Level 4? | **Yes** — every Level-3 gate is a runtime-competence measurement; none requires the engine to improve itself | §11, gates |
| 11 | Can it be evaluated without tuning against the sealed holdout? | **Yes** — three separate corpora; the holdout is authored by a party not tuning, opened once per acceptance, then retired | `EVALUATION_AND_GATES.md` |
| 12 | Can the existing inspection/report workflow consume the new result without a broad rewrite? | **Yes** — the seam returns the same `intelligence` object shape the downstream pipeline, persistence snapshot, guided-finding projection and PDF renderer already consume | seam selection rationale |

## Contradictions found and resolved in the architecture

**C-1 — The validator could become a second semantic engine.**
Phase 20 warns against this and the risk is real: "verify negation scope" edges toward re-parsing.
**Resolved** by making the check *structural rather than interpretive*: the validator verifies that a
span's offsets resolve and that a governing negation token binding the span is not excluded. It does
not decide what the sentence means — the model already asserted that in `conditionRationale`. L3-5
carries an explicit stop condition for exactly this drift.

**C-2 — RC-02/RC-03 scheduling was ambiguous.**
Placing them "after Level 3" would let the new engine inherit a corrupted candidate set; placing them
"before" would predate the candidate contract. **Resolved** by scheduling both inside **L3-4**, the
slice that owns retrieval, jurisdiction filtering and candidate-set membership.

**C-3 — Risk authority was under-specified.**
"Semantic risk" would let a model assign a band directly, reintroducing the inflation §28 measured
(Critical 25 on a document review). **Resolved** as HYBRID with a hard split: the model extracts
*factors*; `evaluateRisk()` retains *scoring*. The three forbidden couplings — serious family ⇒
automatic critical, hypothetical ⇒ active exposure, corrected ⇒ active exposure — are validator rules,
not prompt guidance.

**C-4 — `confidence` would have been carried forward unexamined.**
The existing scalar reads 0.25 on both correct and fabricated findings. **Resolved** by omitting a
numerical confidence field until its operational meaning and calibration are defined, per Phase 7.

**C-5 — "Advisory reasoning" is not advisory.**
`reasoningOrchestratorService.reason()` is named advisory but supplies customer citations and
decomposition inputs. **Resolved** by recording the true authority in the map and demoting it to a
retrieval signal at L3-3/L3-4; the name should be corrected when it loses authority, so a future reader
is not misled the way this phase initially was.

## Residual open decisions (do not block implementation planning)

| Open | Why it can wait | Decided at |
|---|---|---|
| Provider and pinned model id | the seam and contract are provider-agnostic by construction | provider-selection step of **L3-2** |
| Exact cost/latency budget numbers | must be measured, not guessed | **L3-2** from real token counts |
| Whether applicability is a 2nd model call or one combined call | depends on measured schema adherence with a larger combined schema | **L3-4** |
| Sealed-holdout authorship | a process question, not an architectural one | before the first **L3-3** acceptance run |
| Calibrated confidence field | needs a defined meaning and calibration procedure | post-L3-6, if ever |

**None of these is a fundamental authority decision.** The first implementation slice can be executed
without rediscovering any of them.
