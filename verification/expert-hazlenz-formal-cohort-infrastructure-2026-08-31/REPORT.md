# EXPERT HAZLENZ — FORMAL COHORT INFRASTRUCTURE AND SCORER FREEZE (2026-08-31)

**Terminal: `EXPERT_HAZLENZ_FORMAL_COHORT_INFRASTRUCTURE_READY — RESERVED_COHORT_SELECTION_AND_PRESPEND_AUTHORIZATION_REQUIRED`.**

Predecessor: §120. HEAD `37a5d1b5`, unmoved. **Provider calls: 0. API cost $0.00.
`RESERVED_MATERIAL_OPENED = FALSE`. `FORMAL_COHORT_SPENT = FALSE`.** Nothing committed, pushed,
tagged or deployed. No customer activation. `runExpertAnalysis` still has zero callers in `src/`.

The examination instrument is built, validated and frozen. **146 assertions, 0 failed, 0 provider
calls**, proved by the harness's own invocation counter rather than by reading the code.

---

## 1. The seven incomplete measures are closed

§120 recorded that seven measures had no computable definition and that five of those were HARD
GATEs. All seven now have an executable specification in
`expert-measurement-contract.ts`. The honest split:

| measure | gate | resolution | precedence |
|---|---|---|---|
| `M01` | reported | truth `presentHazardFamilies` **minus** the families the real engine emitted; family match, counted once per (row, family) | **level 2** |
| `M02` | **HARD 0.20** | the row partitions its vocabulary into present / defensible / forbidden; a candidate in `forbidden` is false | **level 2** |
| `M06` | **HARD 0.05** | denominator = rows with ≥1 governed record (**level 1**); numerator = obligation-marked statements adjudicated unsupported | level 3 |
| `M07` | **HARD 0.95** | denominator = statements found by the frozen `REGULATORY_STATEMENT_MARKERS` detector (**level 1**); numerator adjudicated | level 3 |
| `M09` | **HARD 0.70** | denominator = clarifications emitted (**level 1**); the map to an authored gap is adjudicated, and the `affectedDecision` comparison is the **scorer's**, over a closed vocabulary | level 3 |
| `M10` | **HARD 0.15** | rows whose authored `decisionCriticalGaps` is empty, and whether any question was asked | **level 2, fully mechanical** |
| `M11` | reported | `interactionKind` equality over a **closed vocabulary** plus participant containment | **level 2, fully mechanical** |

**Fourteen of seventeen resolve at precedence level 1 or 2. Exactly three need a human rubric**, and
in each of those the *detector* and the *denominator* stay mechanical, so only the irreducibly
semantic half is judged. Manufacturing a rule for that half would have been fabricating objectivity.

Two frozen rubrics — `EXPERT_REG_SUPPORT_V1` and `EXPERT_CLARIFICATION_MAPPING_V1` — each carry a
closed verdict set, a decision rule, an explicit list of **forbidden inputs** (including "whether the
mapping helps or hurts the floor"), and record requirements. An **unadjudicated queue item makes its
measure UNMEASURED, and an unmeasured hard gate FAILS.**

**No threshold, disposition or measure was changed.** `assertContractMatchesPlan()` proves it
mechanically: the contract stores no threshold at all, reads every immutable field from
`expert-evaluation-plan.ts`, and **derives** each zero-opportunity treatment from the plan's own
disposition, so there is no table entry a later edit could flip to make a hard gate lenient.

---

## 2. The canonical constructor — one path, not two

`expert-input-constructor.ts` is the single transformation from authoritative analysis state into
`ExpertAnalysisInput`. The harness calls `buildExpertAnalysisInputFromAnalysis`; a future
customer-reachable caller would call the same function. There is no evaluation-only variant, which
is what §120 GAP 5 warned the alternative would cost.

- The **§119 projection semantics are preserved exactly**: `C.10` asserts the constructor emits
  precisely what `projectDeterministicDispositions` produces, and `C.11`–`C.13` assert that
  `undefined` and `[]` stay distinguishable and render identically without synthesising a
  `NOT_APPLICABLE`.
- The **condition-state map is total with no default branch**; an unmapped state throws (`C.3`).
  The two interpretive mappings (`HISTORICAL → CORRECTED`, `PLANNED_FUTURE → HYPOTHETICAL`) are
  exported in `INTERPRETIVE_CONDITION_MAPPINGS` rather than buried, and are listed in §6 below as
  decisions the product owner may reasonably make differently.
- **`expert-prompt.ts` is byte-unchanged** — `e02c15ea…`, identical to the hash at operation start —
  and `EXPERT_PROMPT_VERSION` is still `hazlenz.expert.prompt.v6`. No prompt was redesigned.

### The anti-leak guarantee is structural, then measured

`buildExpertAnalysisInput` has one parameter and that parameter cannot express a truth key. The
interesting case is life-criticality: **the model is shown none** (`DeterministicFindingView.isLifeCritical`
is production-derived, and production establishes none, so it is `false`), while the corpus label
reaches the **merge input**, which the model never sees. `M04` measures the merge, so it loses
nothing, and the model cannot preferentially protect a finding it was never told to protect.

**`TRUTH_LEAK = 0`**, measured across every validation row by rendering the system prompt, the user
prompt and the serialized input and scanning for every truth-only string (`D.1`).

---

## 3. The harness cannot make a call, and did not

- `mode: 'DISABLED'` **refuses** a provider (`G.7`); `mode: 'ENABLED'` **requires** one (`G.8`).
- Ceilings are checked **before** each call, never after.
- An invalid cohort stops **before any request is built** (`G.9`).
- A DISABLED run produces **no score** — development material may not yield a gate result (`G.5`).
- The real deterministic engine ran, at $0.00 and with no database (`G.10`).
- **`providerInvocationCount() === 0`** after every check (`G.6`, `G.12`).

The harness built **18 requests** (6 rows × 3 arms) through the canonical path without sending any.

---

## 4. Validation matrix

| section | result |
|---|---|
| A — contract is a faithful reading of the plan | **23 / 23** |
| B — cohort totality rule enforced at freeze time | **11 / 11** |
| C — canonical constructor is the permanent path | **18 / 18** |
| D — truth key cannot reach the model | **2 / 2** |
| E — scorer mechanics, positive/negative/boundary | **56 / 56** |
| F — fail-closed gate adjudication | **7 / 7** |
| G — harness makes no call, and cannot | **12 / 12** |
| I — composition and topology are derived, not chosen | **17 / 17** |
| **total** | **146 passed, 0 failed** |

Every trap the authorization named is exercised: exact threshold (`M02` at 0.20, `M10` at 0.15) and
one step past it; zero eligible opportunities; malformed object; missing collection; fabricated and
out-of-bounds quotes; exact binding; deterministic agreement; unsupported deterministic
contradiction; appropriate, missing and unnecessary clarifications; sibling routing; over-routing;
provider failure; partial execution.

Two proofs are worth naming. **`E.M09.5`**: a model that emits nothing cannot score 1.00 on
clarification quality — the denominator is zero, the gate is UNMEASURED, and it fails. **`E.M02.4`**:
a candidate outside all three truth buckets is UNMEASURED, not read benignly.

### Protected regression, re-run at $0.00

`expert-contract-foundation` **56/0** · `expert-authority-merge` **51/0** · `expert-provider-failure`
**131/0** · `expert-nocall-harness` **141/0** · `expert-routing-contract` **58/0** ·
`expert-projection-equivalence` **88/0** · `expert-grounding-contract` **40/0** ·
`expert-anthropic-adapter-repair` **30/0** — every count identical to §119. Quarantine
`l32i` **61/0** and `l32j` **37/0**, intact. `hazlenz-precision` **PASS, 0 dangerous and 0
life-critical omissions**; `hazlenz-actionable-coverage` PASS; `evidence-foundation` 35;
`hazlenz-evidence-boundary` 13. Backend `tsc --noEmit` **exit 0**. No new failing suite.

---

## 5. Composition and topology — derived from the thresholds, not chosen

**The sizing rule, stated before it was applied:** `N ≥ ceil(2/t)` for a MAX ceiling, `N ≥ ceil(2/(1−f))`
for a MIN floor. One rule, applied uniformly. It puts a single failure at or below half the ceiling
and keeps every gate violable. `I.1` asserts each stated minimum equals the rule's output.

| binding constraint | minimum |
|---|---|
| `M06` rows carrying a governed record | **40** |
| `M14` rows paired base/permuted | **40** |
| `M13` attempted calls | **100** |
| `M12` rows | 20 · `M10` zero-owed rows | 14 · `M09` clarifications | 7 · `M02` candidates | 10 |

**Minimum defensible: 48 rows** (40 with a governed record + 8 without, so the no-record class
exists). **Preferred: 60 rows.**

**Three denominators the cohort cannot guarantee** — `M02` (candidates), `M07` (regulatory
statements), `M09` (clarifications) count what the *model* emits. Composition creates the
opportunity; it cannot manufacture the output. If the model emits fewer than the minimum, those
gates are measured on a coarser denominator or are UNMEASURED at zero and therefore FAIL. That is a
real limitation of the design and it is stated, not hidden.

### Call and cost topology

Three calls per row, each earning its place: **BASE** (every content measure reads this arm and only
this arm), **PERMUTED** (M14), **CROSS_PROCESS** (M17). No repetition beyond that — a repeat count
would be a variance study no measure asks for.

The cost model is **fitted from the 18 real §118 calls**, not quoted: a two-parameter least squares
fit gives **$2.00/M input and $10.00/M output tokens** and reproduces every recorded cost with a
**residual of 0.00000000 USD**.

| | rows | planned calls | expected spend |
|---|---|---|---|
| minimum | 48 | **144** | **$4.57** |
| preferred | 60 | **180** | **$5.72** |

**Hard call ceiling: 200.** **Conservative maximum spend: $25.00** — computed, not guessed: 200 calls
each at a larger prompt than any observed (12,000 input tokens) *and* the full configured output cap
(8,000 tokens), plus a 10% retry-billing allowance, giving $23 and rounded up.

Observed p95 latency for reference: **18,942 ms**; mean call cost **$0.031757**.

---

## 6. Reserved-material sufficiency — determined WITHOUT opening anything

`analyze:reserved-cohort-sufficiency` reads only field names, row counts and closed-vocabulary label
distributions, and enforces a content boundary that refuses to emit any observation text.

**`RESERVED_MATERIAL_SUFFICIENT_WITHOUT_OPENING = FALSE`**, and the reason is specific.

**`gauntlet.seed`, 100 rows.** Carries `primaryHazardFamily`, `secondaryHazardFamilies`,
`unacceptableStandardFamilies`, `severityExpectation`. Through the accepted, unchanged `toExpertFamily`
map: **45 rows** express fully in the Expert taxonomy (19 of them `critical`, 14 multi-hazard);
8 map only partially; **47 do not map at all**. 45 is **3 short** of the 48-row minimum on its own.

**Field realism pack v2, 117 rows** (offsets 1 and 2 are a portion of it). Carries
`shouldHaveMissingEvidence`, which is the M10 signal — but the distribution is **true 87, false 2,
unlabelled 28**. Only **2 rows** are labelled as owing no clarification, against a minimum of **14**,
and the 28 unlabelled rows are UNKNOWN, not zero-owed.

**Five truth-key fields have no corresponding label in either corpus:**
`defensibleHazardFamilies` (without which every row fails the M02 partition), `decisionCriticalGaps`,
zero-owed rows at the required count, `recordedInteractions`, and governed records to supply.

Authoring any of them requires **reading each observation — which is opening the offset.** Volume is
adequate; composition cannot be settled from metadata. This script does not pretend otherwise, and
no observation text was read or emitted.

---

## 7. Frozen hashes

| file | sha256 |
|---|---|
| `expert-evaluation-plan.ts` (unchanged authority) | `0b9b273a0c7bc24b226374fe544d5d32c5dba2dd03259b1bf7a3872a4d5b2bd8` |
| `expert-measurement-contract.ts` | `022fb9db7e55a05db0870405bcccd4ba1140c41ae4750371143d93e3fdd5f330` |
| `expert-cohort-contract.ts` | `c6d593bef0a0c139af9fee3727068785ddff92e0bdbbc9102c883770c8b5b633` |
| `expert-input-constructor.ts` | `2210cbe620ff3ad837389a4b84b5ab166d39cff1f374b8964fc52e019b3723e5` |
| `expert-measure-scorers.ts` | `bec26908b814bf80d6da4f563a83d57759c49d619c75d233325b8dbf71bb41cc` |
| `expert-cohort-composition.ts` | `96f6c84895ece2bad0750a4ef0194433b5e1f116cea4a034269328b7c7cf7323` |
| `fixtures/cohort-validation-fixtures.ts` | `ca8c7e7d0720255840ca2f49ac9e662e8a5717d66b24557e7e5e2ea80c3f8ca0` |
| `scripts/lib/expert-cohort-harness.ts` | `b4ea8b750afc5f4c88fb7f2892e71d894767427a7310b4b4314c6687e65e0fcd` |
| `scripts/test-expert-cohort-instrument.ts` | `106e3be435208f79b69fa9c0518d860f092bf06f78ba7d7d7e6a9012e323da95` |
| `scripts/analyze-reserved-cohort-sufficiency.ts` | `9e7a5bc4c378c7b48343e295a9460437248ab077d4f286a1c546d0b7500995fc` |
| `expert-prompt.ts` (**byte-unchanged**) | `e02c15ea2f9439def5cef2ba0b00cda3cb892bf1e85fef3bb9a461f3b36cf458` |
| `expert-deterministic-projection.ts` (**byte-unchanged**) | `f1cc7a61cf957a45449274eaa1763fece0bd9cfee095a636421cd5a0ff88e467` |

---

## 8. Readiness bits

```
M01_M17_EXECUTABLE                          = TRUE
CANONICAL_EXPERT_INPUT_CONSTRUCTOR_READY    = TRUE
SCORERS_FROZEN                              = TRUE
HARNESS_READY                               = TRUE
DEVELOPMENT_VALIDATION                      = PASS  (146/0)
RESERVED_MATERIAL_OPENED                    = FALSE
HOSTED_CALLS                                = 0
FORMAL_COHORT_SPENT                         = FALSE
COHORT_FROZEN                               = FALSE   (no rows selected -- Decision 1 deferred)
P4_PRESPEND_AUTHORIZATION                   = UNMET   (by design)
TRUTH_LEAK                                  = 0
PROMPT_SEMANTIC_VERSION                     = v6, byte-unchanged
EXPERT_HAZLENZ_PROVIDER_VALIDATED           = FALSE
EXPERT_HAZLENZ_CUSTOMER_ACTIVE              = FALSE
LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN           = TRUE   (untouched)
```

---

## 9. Remaining policy decisions for the product owner

1. **Where the truth key gets authored.** It cannot be authored without reading the rows, and reading
   them is opening the offset. Either the offset is opened for authoring (and is thereby spent on
   this evaluation), or rows are authored fresh outside the reserved material. The corpus policy
   governs the first; the second is a new decision.
2. **The taxonomy gap.** 47 of 100 `gauntlet.seed` rows do not map into the Expert taxonomy. Widening
   `toExpertFamily` would change the accepted §119 projection, which this phase was not authorized
   to do — so either the cohort draws only from mappable rows, or the map's extension gets its own
   authorization and re-verification.
3. **`M10`'s zero-owed rows.** The reserved labels supply 2 against a minimum of 14. These rows must
   be authored deliberately; they are the negative control for asking and the gate is unmeasurable
   without them.
4. **The two interpretive condition mappings** (`HISTORICAL → CORRECTED`, `PLANNED_FUTURE →
   HYPOTHETICAL`). Both are the closest members of a frozen vocabulary and neither is exact.
5. **Who adjudicates** `EXPERT_REG_SUPPORT_V1` and `EXPERT_CLARIFICATION_MAPPING_V1`, and the record
   the adjudication produces.
6. **`M12`'s row-level reading.** Implemented literally as the plan words it, because
   `DecisionCriticalClarification` carries no hazard family and no family-coupled test is expressible.
   Narrowing it would be weakening a frozen gate, so it is recorded as a limitation instead.

---

## 10. Exact next operation

**`RESERVED_COHORT_SELECTION_AND_PRESPEND_AUTHORIZATION`** — one decision naming: which reserved
material is opened and how many rows (recommended **60**, minimum **48**); who authors the truth key
and when; the call count (**180**), the hard ceiling (**200**) and the maximum spend (**$25.00**);
and how items 1–3 above are resolved. That authorization satisfies `P4` and nothing before it does.

Expert remains OFF the customer path. A passing cohort would still not be authorization to activate
it; that is a separate operation with its own safety analysis.
