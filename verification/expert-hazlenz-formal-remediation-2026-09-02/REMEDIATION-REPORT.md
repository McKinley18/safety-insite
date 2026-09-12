# Expert HazLenz — Supported-Defect Remediation

**§139. Zero provider calls, zero local-model calls, $0.00. No cohort created, none rerun, no
reserved material opened. Nothing committed, pushed, tagged or deployed.**

**The formal result is untouched and immutable: FORMAL_EVALUATION_FAIL — NOT ACCEPTED**, cohort
`hazlenz.expert.formal.cohort.65.v1+d7c8f9c15f0a`, `FORMAL_COHORT_SPENT = TRUE`,
`PROVIDER_INVOCATION_COUNT = 195` before and after. This operation repairs supported product and
harness defects. **It does not repair M14, does not re-measure anything, and produces no acceptance
claim of any kind.**

---

## 1. Defects repaired, and the evidence each rests on

| # | Defect | Classification it came from | Repair |
|---|---|---|---|
| 1 | Clarification licensing used a **possibility** test — a fact whose answer *"could change"* a decision | M10 `PROVEN_MODEL_OR_CONTRACT_DEFECT`; contributes M09 denominator | Counterfactual test in the system prompt and the wire schema: two named answers, two different current outcomes, or do not ask. Seven excluded shapes enumerated. Empty-by-default stated in both places. |
| 2 | All six `EXPERT_AFFECTED_DECISIONS` members were **undefined** — no definition in the type, the prompt or the schema | M09 mismatch half; M12 trigger | Every member defined in all three places, with the three collision pairs §138 measured decided explicitly. |
| 3 | **No cross-collection arbitration existed** anywhere in the pipeline | M12, architectural | New stage G in `normalizeExpertOutput`: a `HAZARD_EXISTENCE` clarification that declares a link to the asker's own `ACTIVE` candidate is refused, item-scoped. |
| 4 | Citation-shaped text was in the model's **own input** on all 195 calls | M05 `MIXED` | The prohibition no longer demonstrates the forbidden form; governed records are rendered under opaque handles with citation tokens redacted. |
| 5 | The governed-evidence contract did not name **abstention** as the correct response to an unrelated or absent record | M07 product component (the instrument itself is *not* repaired) | Explicit abstention rule; extension in either direction refused; background regulatory memory barred. |
| 6 | Typed collections read as a **coverage checklist** | M10, M11 overproduction | Empty-by-default on clarifications, insights and disagreements; the worked-example questions that were reproduced in 35 of 165 emitted clarifications are gone. |
| 7 | `CohortRunRecord[]` was **never persisted** | Harness defect, explicitly not normalized | Append-only, `fsync`-per-record store written *during* execution, plus a completeness preflight read back from disk. |
| 8 | `EXPERT_PROMPT_VERSION` **does not uniquely identify the prompt** | §138 instrument finding | Identity is now the label plus SHA-256 of the system prompt and of the wire schema, with a mismatch comparator. |

### 1.1 Counterfactual decision-criticality (Phase 1)

`EXPERT_SYSTEM_PROMPT` now requires all five conditions the authorization named, and states the test
operationally rather than as an exhortation: *"name TWO materially different answers that lead to
DIFFERENT current outcomes… if you cannot name both, do not ask."* `whyItMatters` in the schema now
demands both branches be written. The seven non-decision-critical shapes are listed by name. The
measured three-question exposure/severity/control pattern is named a **COVERAGE HABIT** and refused.

**The v6 worked examples were removed**, not softened: *"Is the pump isolated?"*, *"What PPE is in
use?"* and their siblings were reproduced in 35 of the 165 clarifications the formal run emitted.

### 1.2 `affectedDecision` definitions (Phase 2)

Defined in `expert-contract.types.ts`, in the system prompt, and — for the first time — as a
per-value `description` on the schema enum. The draft definitions supplied in the authorization were
reconciled against the frozen semantics rather than pasted: `REGULATORY_INTERPRETATION` is bounded to
**supplied** records (with none supplied there is no text to interpret), and `HAZARD_EXISTENCE`
carries the explicit incompatibility with the asker's own `ACTIVE` candidate, which is what makes
repair 3 coherent rather than arbitrary.

### 1.3 Cross-collection arbitration (Phase 3) — and the one judgment call in this operation

The stage **drops the question and never the candidate.** Two rules already settled in
`expert-normalization.ts` decide that direction: *"A SUPERFLUOUS QUESTION IS DROPPED; IT NEVER
DESTROYS THE ANALYSIS THAT CARRIED IT"*, and the §101/§105 finding that suppressing a hazard to tidy
an output is the failure this programme exists to prevent. The ACTIVE candidate reaches the reviewer
untouched; the contradicting question does not, and the refusal is recorded with collection and
index.

**It fires only on a declared link.** A new **optional** `relatesToCandidateKey` lets the producer
name which candidate a question is about. This is the judgment call, and it is disclosed as one:

- **Why a schema field rather than a row-level rule.** §138 measured what guessing costs — 6 of the
  11 rows the frozen row-level gate flagged fired on a question that was not an existence question
  at all, or concerned a different hazard than the one raised. A row-level rule would delete real
  questions to fix an artefact, and would score better on M12 by suppressing content. That is
  tuning to the metric.
- **Why not a text heuristic.** Matching family names in question prose is exactly the fragile
  pattern the prompt itself warns against elsewhere.
- **Why this is not a contract break.** The field is optional on the wire and optional in the
  TypeScript interface. Absent, blank or non-string normalises to `null`, and arbitration then
  **abstains** — byte-identical behaviour to today. No field was removed, no enum member moved, no
  `required` entry changed, so `EXPERT_ANALYSIS_CONTRACT_VERSION` stays `analysis.v2`.
- **No provisional state was invented**, per the authorization. `INSUFFICIENT_EVIDENCE` and
  `UNKNOWN` already exist and already serve that purpose.

**If the product owner would rather the arbitration be row-level and unconditional, that is a policy
choice this report does not make.** It would raise suppression risk and would make M12 look better
without evidence that the underlying contradictions were real.

### 1.4 Citation provenance (Phase 4)

Against the six stated requirements:

1. **Attributable to an allowed source** — satisfied in the strictest possible form: the allowlist
   is **empty**. Expert prose may carry no citation at all, and the boundary condemns the whole
   analysis on the first match. No permission was added; adding one would have *weakened* a
   protected gate.
2. **Enumerated from structured input, never scanned from prompt text** — no scan of prompt prose
   exists or was added; there is nothing to discover because nothing is permitted.
3. **Instruction examples must not become allowlisted** — the examples are **gone from the
   instructions entirely**, which is stronger than excluding them from an allowlist.
4. **Prompt prose / prohibition examples / schema text / unrelated records may not support a claim**
   — none of them can, because no citation output is accepted from any provenance.
5. **Fails closed before merge** — unchanged and re-proved: four adversarial provenances plus a
   citation smuggled through an evidence quote, all rejected, none reaching merge.
6. **Existing protected behaviour intact** — `CITATION_SHAPED_PATTERN` is byte-unchanged and
   `CITATION_SHAPED_TEXT_NOT_PERMITTED` remains `ANALYSIS_FATAL`.

The substantive change is on the **input** side: `redactCitationTokens` uses the same pattern the
boundary rejects on, so what is stripped from the prompt is exactly what would have condemned the
analysis. Record meaning is preserved — title and approved text survive, only the token class is
replaced — and records stay referenceable as `R1`, `R2`. **Neither `POPA-A-28` nor either observed
string appears anywhere in the repair.**

### 1.5 Governed-evidence contract (Phase 5)

The prompt now states that an unrelated supplied record, a record narrower or wider than the claim,
and no record at all are all **abstention** cases, and that *"Abstaining is a correct answer and is
never penalised."* No attempt is made to have the model match a mechanically unrelated record —
which is what a naive "repair M07" would have produced, and would have been a defect.

### 1.6 Empty-by-default (Phase 6)

`decisionCriticalClarifications`, `crossHazardInsights` and `disagreements` all declare **EMPTY BY
DEFAULT** in the schema; the per-request prompt states that an empty list is a *complete, correct*
answer. `crossHazardInsights` additionally requires a nameable mechanism, so co-occurrence is no
longer an interaction. Candidate emission was **not** loosened or tightened — M01/M02 showed no
defect there, and changing it without evidence would be speculative.

### 1.7 Evidence persistence (Phase 7)

`scripts/lib/expert-run-record-store.ts` (new) provides an append-only JSONL store with `fsync`
per record. `HarnessOptions.recordSink` is invoked the moment each `CohortRunRecord` completes,
before the next row starts, and is deliberately **not** wrapped in try/catch: if evidence for a
spent call cannot be written, continuing would spend more money producing more unwritable evidence.
`execute-formal-cohort-65.ts` opens the store before the first request and runs a completeness
preflight **read back from disk** after the run — reading `run.records` from memory would prove
nothing, since the 2026-09-01 run had them in memory too.

All six requirements are met and tested: crash-survival (G.1 reads a record back *before* the run
ends), post-exit reproducibility, no semantic reconstruction (a corrupt line is reported, never
repaired), append-only telemetry, unchanged ceilings/retry accounting/identity binding/prospective
spend, and completeness validation.

### 1.8 Prompt identity (Phase 8)

`expertPromptIdentity()` returns the version label plus `systemPromptSha256` and `wireSchemaSha256`;
`expertPromptIdentityMismatches()` reports which fields moved. The schema hash uses a stable
key-ordering serializer so formatting cannot masquerade as behavioural drift. `EXPERT_PROMPT_VERSION`
is bumped to **`hazlenz.expert.prompt.v7`**, following the file's own convention for an authorized
prompt change.

---

## 2. Defects intentionally NOT repaired

| Defect | Why not |
|---|---|
| **M14 order sensitivity** | `M14_CAUSE_UNIDENTIFIABLE_FROM_SPENT_RUN`. **No repair was attempted, none is claimed, and none may be claimed.** Canonicalization, deterministic semantic IDs and permutation-specific prompt changes were all considered and **rejected as unsupported** — §138 found nothing that supports them, and the projection sorts every collection so they could not explain the observed divergence. Two assertions in the new suite (M14.1, M14.2) *fail the build* if such a change is introduced without evidence. |
| **M07 instrument** | `PROVEN_INSTRUMENT_DEFECT`. The lexical denominator and the index-paired record attachment belong to cohort construction. Design proposals only, §4 below. The formal 0/9 stands. |
| **M12 scorer trigger** | Family-coupling the trigger needs a hazard family on the clarification type — a wire-schema change flagged for separate authorization. The frozen scorer is untouched. |
| **M09 scorer** | Neither the denominator nor the gap-credit rule was changed. Design proposals only. |
| **Candidate emission thresholds** | No measured defect. Changing them would be speculative. |
| **M17 / process forking** | Harness debt recorded, not implemented; out of scope for this authorization. |

---

## 3. Files changed

**New**

| file | SHA-256 |
|---|---|
| `backend/scripts/lib/expert-run-record-store.ts` | `2dfbafe14cae421dcfc0189e03f53e6262cefe473aeba8c5de06c68169a4ad55` |
| `backend/scripts/test-expert-remediation-contract.ts` | `53f1b674f4a98596b9240ce0cce0fedab36335114494441c0cb79313e3f6c594` |

**Modified**

| file | SHA-256 | change |
|---|---|---|
| `expert-prompt.ts` | `3dd172666aa7eb9916a98ae441870787df39b3307d3af38ad606c169c6ad6f09` | v7; counterfactual test; decision definitions; prohibition without examples; abstention rule; empty-by-default; record redaction; prompt identity |
| `expert-contract.types.ts` | `5705870db16edca69828538e4f734b37e813bb7ef70109feff744c5bf9a40ae0` | six decision definitions; optional `relatesToCandidateKey` |
| `expert-normalization.ts` | `a69932b8ec4f2c9dd6894cdb69da0bc6448efc0c6ad76b9804fadf6307107b51` | arbitration stage G; new item-scoped reason code |
| `fixtures/cohort-validation-fixtures.ts` | `8fa63438f161d1f227ac44ca3e09fb0eca8b5efa2e492dfb8e3bc3c55dc65ca3` | fixture declares no link |
| `scripts/lib/expert-cohort-harness.ts` | `76b8fb7c74f122e3c13ae0d7ef0112e58d1f0c5dd1b6466927054a59a2ac142d` | `recordSink`, invoked per completed record |
| `scripts/execute-formal-cohort-65.ts` | `a31c5d6e318246e05f9d6de628f8d4c7d6688ef2253bf4982af0abcee2ec8688` | opens the store before first request; completeness preflight from disk |
| `scripts/test-expert-routing-contract.ts` | — | v7 re-anchor; new hash-identity assertions |
| `scripts/test-expert-grounding-contract.ts` | — | A.4 re-anchored to the invariant |
| `scripts/test-expert-projection-equivalence.ts` | — | F.2 re-anchored; F.2b/F.2c assert the real property |
| `scripts/test-expert-cohort-instrument.ts` | — | v7 re-anchor |
| `backend/package.json` | — | registers `test:expert-remediation-contract` |

### 3.1 Four protected assertions were re-anchored — disclosed in full

None was weakened to obtain a pass, and each carries an in-file comment explaining the move.

1. **`test-expert-grounding-contract.ts` A.4** matched the literal *"populate this even when the
   hazard list is empty"*. That sentence is one of five measured overproduction drivers. The
   invariant it protects — a clarification must not require a candidate, blueprint 39.5.1 — is
   unchanged and is now asserted **twice**: textually against the independence wording, and
   behaviourally by A.1–A.3, which run a candidate-free clarification through the real boundary. A
   new **A.4b** additionally requires the schema to state empty-by-default. **Strictly stronger.**
2. **`test-expert-routing-contract.ts` A.7** required the schema to contain the worked-example
   questions *"de-energized"* and *"lockout/tagout"*. A needle satisfiable only by restoring a
   measured defect driver would make the test enforce the defect. The needles now anchor on the
   **definitions** that replaced them, and a new **A.7b** asserts all six decision labels are defined
   and the collision pairs decided — seven new assertions where there were two.
3. **`test-expert-routing-contract.ts` A.2** and **`test-expert-cohort-instrument.ts` C.17** pinned
   the literal `v6`. Both files' own comments establish re-anchoring as the convention for an
   authorized bump. New **A.2b–A.2e** assert the hash identity, which is the §138 repair.
4. **`test-expert-projection-equivalence.ts` F.2** pinned `v6` to prove the §119 projection was
   input data rather than a prompt revision. That property is now asserted **directly** by new
   **F.2b/F.2c** — the disposition block is absent from the system prompt and still rendered from
   supplied dispositions — instead of by proxy through a version literal that a later authorized
   operation legitimately moved.

---

## 4. Formal-instrument redesign — DESIGN PROPOSALS ONLY, nothing implemented

No spent scorer was modified. Every item requires separate authorization and a new version
identifier.

- **M07** — split into three measures: regulatory-statement *detection*, governed-record
  *relevance*, and *exact support*. Narrow the detection denominator to statements that assert an
  obligation (on the spent run that alone would have moved the denominator from 9 to 3). Future
  attachment must carry explicit semantic relevance instead of index pairing.
- **M09** — a denominator that any overproduction can drive out of reach is only sound if that is
  the intended construct. Consider three measures: clarification *precision*, gap *recall*, and
  `affectedDecision` *accuracy*. Decide explicitly whether one gap may be credited more than once;
  the current scorer permits it, which is why the ceiling was 59 and not 20.
- **M12** — score semantic contradiction rather than an enum label, which requires the clarification
  to carry a hazard family.
- **M14** — split into **stochastic reproducibility** (report, never gate, while
  `P2_DETERMINISM_CONTROL = ABSENT`) and **order perturbation sensitivity**, measured with a 2×2
  factorial of canonical ×2 and permuted ×2 replicates. The disposition must be pre-registered
  before a cohort opens.
- **M05** — distinguish three outcomes that the single count currently conflates: model emitted an
  unsupported citation; the boundary blocked it; an unsupported citation reached merged output. Only
  the third is a customer-visible safety defect.

---

## 5. Verification actually executed

**Zero provider calls. Zero local-model calls. $0.00.** TypeScript project typecheck clean.

| suite | before | after |
|---|---|---|
| `hazlenz-core` | PASS | **PASS** |
| `expert-contract-foundation` | PASS | **PASS** (56) |
| `expert-authority-merge` | PASS | **PASS** (51) |
| `expert-provider-failure` | PASS | **PASS** (131) |
| `expert-nocall-harness` | PASS | **PASS** (141) |
| `expert-routing-contract` | PASS | **PASS** (67) |
| `expert-grounding-contract` | PASS | **PASS** (41) |
| `expert-projection-equivalence` | PASS | **PASS** (90) |
| `expert-anthropic-adapter-repair` | PASS | **PASS** (30) |
| `expert-execution-budget` | PASS | **PASS** (66) |
| `expert-cohort-instrument` | PASS | **PASS** (155) |
| **`expert-remediation-contract`** (new) | — | **PASS (92)** |

A baseline run of all eleven pre-existing suites was captured **before** the first edit, so every
result above is a comparison rather than an assertion.

Deterministic HazLenz and governed-mode protected surface, all **PASS**: `hazlenz-evidence-boundary`,
`evidence-foundation`, `guided-finding-response`, `risk-policy`, `l31-reasoning-contract`,
`l32-semantic-contract`, `l32b-binder-precision`, `l32c-gate-polarity`, `l32d-clarification-scope`,
`l32e-syntactic-role`, `l32f-predicate-scope`, `l32g-state-separation`,
`l32i-clarification-carrier`, `l32j-carrier-activation`, `hazlenz-understanding`,
`hazlenz-precision`, `hazlenz-level1-recall`, `hazlenz-actionable-coverage`,
`hazlenz-guarding-applicability`.

**NOT RUN, and not claimed as passing:**

- `hazlenz-clarification-gauntlet` — requires a database. Not run; no database was touched.
- `hazlenz-authentic-reasoning` — an integration test against a live
  `http://localhost:4000/safescope-v2/classify`. With no server running it reports 0.0 % on all 20
  scenarios. **This is an unreachable endpoint, not a regression**; it exercises the deterministic
  API, which this operation did not modify. Confirming it needs a disposable local service, which
  was not started.

### 5.1 Evidence-persistence proof

G.1 reads a record back from disk **while the store is still open and the run is still in progress**
— durability does not depend on `close()`, which is the whole repair. G.6 refuses to reopen a
non-empty store. G.7–G.11 prove the completeness preflight detects a missing row, a missing arm,
missing attempt telemetry, and — G.10 — **a `PRESENT` layer with no persisted analysis, which is
precisely the 2026-09-01 shape.** G.12 proves a corrupt line is reported rather than repaired.

### 5.2 Prompt-identity proof

H.5 constructs the exact §138 failure — same version label, different system prompt — and asserts it
is detected. H.6 does the same for the wire schema. H.7/H.8 prove the hash is stable under object-key
reordering but not under array reordering.

---

## 6. A consequence that must be recorded, not buried

`EVALUATION-RESULT.json.integrityHashesBeforeFirstCall` pins the SHA-256 of the source that executed
the formal cohort. Before this operation all sixteen matched the working tree. **They no longer do**,
because `expert-prompt.ts`, `expert-normalization.ts` and `expert-contract.types.ts` have moved
forward under this authorization.

That is expected and correct. The recorded hashes remain the authoritative statement of what ran on
2026-09-01, every frozen artifact is byte-identical, and the divergence is evidence of an authorized
repair rather than of tampering. **A future reader comparing source to that manifest will see a
mismatch and must read it as §139, not as corruption.** `execute-formal-cohort-65.ts` will now refuse
to run against the frozen manifest because the prompt hash no longer matches — which is the correct
behaviour, since the spent cohort must never be rerun.

---

## 7. Remaining unknowns

1. **M14's cause.** Unidentifiable from the spent run; no repair targets it.
2. **Whether the repairs change model behaviour at all.** Everything here is a contract change
   verified deterministically. **No hosted evidence exists that clarification volume falls, that gap
   coverage is retained, or that the decision labels are now applied consistently.** Those are model
   properties and cannot be established without a provider call.
3. **Whether A1 suppresses genuine questions.** The falsification criterion stands: if volume falls
   but gap coverage falls with it, the repair is wrong.
4. **Whether `relatesToCandidateKey` is populated by the model in practice.** If it is rarely set,
   arbitration abstains and M12's cause goes unaddressed — which would be an argument for the
   row-level policy this report declined to adopt unilaterally.
5. **`POPA-A-28` echo vs invention** — still unrecoverable. Redaction makes the question moot going
   forward but does not answer it retrospectively.

---

## 8. Hosted development probe — recommended, NOT authorized here

A small bounded probe is warranted before any future cohort, and is the only way to close unknowns
2–4. Suggested shape, for the product owner to authorize or reject: synthetic development fixtures
only, no reserved material; both arms of a same-input pair so within-condition divergence is
measured at the same time; primary readouts = clarifications per row on rows owing none, retention on
rows that do owe one, `relatesToCandidateKey` population rate, and `affectedDecision` agreement with
an independent labeller. **No cohort, no formal measurement, no acceptance implication.**

---

## 9. Confinement

```
PROVIDER_INVOCATION_COUNT   195 before, 195 after      provider calls 0      local-model calls 0
cost this operation         $0.00                      spend unchanged at $6.930238
frozen formal artifacts     ALL 15 BYTE-IDENTICAL (verified by diff, before vs after)
spent cohort                unmodified                 cohort rerun NO       new cohort NO
reserved material           not opened
scorer formulas             UNCHANGED                  thresholds UNCHANGED  truth UNCHANGED
M14                         NO implementation change, no repair claimed
production / database / customer activation            NONE
commit / push / tag / deploy                           NONE
```

**Terminal:** `EXPERT_HAZLENZ_SUPPORTED_DEFECT_REMEDIATION_COMPLETE —
HOSTED_DEVELOPMENT_PROBE_AUTHORIZATION_REQUIRED`

No formal acceptance is declared. The formal evaluation remains **FORMAL_EVALUATION_FAIL — NOT
ACCEPTED**.
