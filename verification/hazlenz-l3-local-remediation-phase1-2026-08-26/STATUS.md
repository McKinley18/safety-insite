# L3 LOCAL REMEDIATION PHASE 1 — RC-1 / RC-2 / RC-3 (2026-08-26)

> ## `L3_LOCAL_REMEDIATION_PHASE1_PARTIAL — ADDITIONAL_LOCAL_REMEDIATION_REQUIRED`
> ### provider calls **0** · inference **0** · **`$0.00`** · no corpus opened · no tranche spent
> ### the frozen Run-2 result is preserved **VERBATIM**: `L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9`
> ### `MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL` · `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN` · Run 3 **NOT** justified and **NOT** constructed

---

## 1. The finding that governs this phase

**THE RECORDING CANNOT CARRY THE REMEDIATION, AND THAT IS A PROPERTY OF THE RECORDING, NOT A LIMIT OF
THE ARCHITECTURE.**

`§68.6` already stated that raw model prose was not persisted. Enumerating every field of all 186
recorded rows makes the consequence exact. Run 2 persisted **63 structured fields per row and not one
of them is evidence**: no evidence spans, no `conditionRationale`, no `uncertainties`, no clarification
body, no `affectedDecision`, no corrective action, no `riskFactors`, no observation text.

Two things follow, and they decide the whole phase:

* **`RC-2` cannot be *measured* on the recording.** Three of the four `G4` false-`ACTIVE` rows
  (`H2B-086`, `H2B-087`, `H2B-088`) are, in every recorded field, **INDISTINGUISHABLE FROM A CORRECT
  `ACTIVE` ROW** — one `ACTIVE` candidate, no clarification, validator `VALID`, binder bound, no fatal
  binder code. Any transform that moves them must key on evidence the recording does not hold, or on a
  row id, which is prohibited.
* **`RC-1` cannot be *measured* on the recording either.** All 13 `G3` misses carry
  `candidateBorneClarification = false` **and** `proposalLevelClarificationCount = 0` in **both**
  processes. No question existed anywhere upstream, so nothing downstream can retain one.

So this phase does what remains legitimate: it builds the zero-cost replay harness, measures every
downstream architecture the recording *can* discriminate, implements the one deterministic defect that
is provable from the shipped source with no corpus at all, and reports honestly that the rest needs
evidence that must be *persisted on a development cohort* before it can be settled.

---

## 2. What was implemented `PRODUCTION`

**A deterministic condition-state resolution boundary**, `backend/src/safescope-v2/reasoning-l3/condition-state-resolution.ts`,
wired into `reasoning-runner.ts` between the validator and the binder:

```
provider -> deterministic validator -> CONDITION-STATE RESOLUTION -> semantic binder -> outcome
```

**Placement was decided mechanically, not by preference** — the earliest layer at which the inputs a
correct state decision needs actually exist, without consulting anything hidden. `A` (post-proposal) is
rejected because offsets are unverified there; `D` (validator) is rejected by §29's contradiction C-1
and because reject/accept is the wrong verb for an undecided proposal; `C` (binder) remains the right
owner of judgements needing evidence TEXT but is a separate tier by design (`D-58`), so a state settled
there is invisible to every consumer of the validated tier. `B` is what is left and it is correct.

**The invariant it enforces** is `ACTIVE REQUIRES AFFIRMATIVE, DECISION-SUFFICIENT EVIDENCE`, expressed
as a contradiction the proposal states about itself:

> a candidate may not carry a **decided** `conditionState` while its own `ClarificationDecision`
> declares `affectedDecision: 'condition_state'` — the decision cannot be both made and open.

It reads exactly two frozen contract fields and nothing else. **No truth label, no gate membership, no
provenance class, no row id, no scenario family, no lexical pattern, no `F6`.**

### The deterministic defect this exposed, provable with no corpus at all

The shipped binder resolves that same collision **in favour of the state**: `clarificationBelongsHere`
drops the question (`SEMANTIC_CLARIFICATION_ON_DECIDED_STATE`) and keeps `ACTIVE`. So when the model
says *"this is active"* and *"I cannot decide whether it is active"* in one object, **the pipeline
discards the doubt and keeps the assertion.** That is pinned as a measured fixture in
`test-l3-condition-state-resolution.ts`, not asserted in prose.

`L3-2d` is **NOT overturned**. It never looked at `affectedDecision`; for the other four values the
state genuinely *is* decided and a question on it genuinely *is* noise, and `L3-2d` continues to govern
those unchanged. Its 71 assertions still pass.

### The default is `CHECK`, and that is a measured decision

`CHECK` records the contradiction and **changes nothing**; `RESOLVE` resolves the candidate to
`INSUFFICIENT_EVIDENCE` keeping key, family, evidence, rationale, uncertainties, corrective action,
risk factors **and the question**. `CHECK` is wired in because `RESOLVE` moves a state away from a
decided claim, a direction this programme has already measured costing a correct hazard (`H-NG-02`,
§35.2), and the evidence that would settle it — **WHICH candidate carried the question** — was never
persisted. Recording changes nothing on its own, which is exactly why it can be adopted before that
measurement exists. Same two-mode discipline `state-facts.ts` declares, for the same reason.

---

## 3. `RUN2_RECORDED_OUTPUT_COUNTERFACTUAL_REPLAY` — the measurement

**NOT AN ACCEPTANCE RESULT.** The frozen scorer is *required and called*, digest-asserted, never
reimplemented. The harness reproduces the frozen Run-2 verdict **byte-identically on all ten gates**
through the identity transform (22/22 fidelity checks), moves under a deliberately wrong transform,
**refuses any transform that touches truth**, and **seals the network** for the duration.

| gate | baseline | tier=BOUND | +demote | +carrier question | RC-2 approx |
|---|---|---|---|---|---|
| `G1` | 1/36 | 1/36 | 1/36 | 1/36 | 1/36 |
| `G2` | 4/21 81.0% | 4/21 | 4/21 | **7/25 72.0%** | 4/21 |
| `G3` | A 17/30 B 17/29 | A 17/30 | A 17/30 | A 18/30 | A 17/30 |
| `G4` | 4/21 | 4/21 | 4/21 | 4/21 | **3/21** |
| `G5` | 1/93 | 1/93 | 1/93 | 1/93 | 1/93 |
| `G6` | 1/93 | 1/93 | 1/93 | 1/93 | 1/93 |
| `G7` | 0/11 | 0/11 | 0/11 | **3/11** | 0/11 |
| `G8` | 0/93 | 0/93 | 0/93 | 0/93 | 0/93 |
| `G9` | 14/93 84.95% | **10/93 89.25%** | 14/93 | 14/93 | 13/93 86.02% |
| `G10` | 93/93 | 93/93 | 93/93 | 93/93 | 93/93 |

**NO SCENARIO TURNS ANY FAILED GATE INTO A PASS.** Every one still terminates
`L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9`.

### Two scenarios look like improvements on the gate table and are REJECTED by the substantive vetoes

* **`+carrier question`** (synthesize a clarification wherever the binder rejected a state) buys
  `G3` **one** row and costs clarification precision **81.0% → 72.0%** in A and **78.9% → 64.0%** in B,
  `G2` **4 → 7**, and **breaks `G7`, a currently-PASSING hard gate, 0 → 3**. This is **`D-59`'s failure
  mode, measured a second time.** REJECTED under Phase-7 vetoes 2, 4 and 6.
* **`RC-2` proposal-level approximation** improves `G4` 4→3 and `G9` 14→13 — and **reduces
  high-consequence `ACTIVE` assertions 35→34 in A and 35→33 in B.** `G1` **cannot see this**, because
  `G1` counts only "no validated candidate at all" and the candidate survives. REJECTED under Phase-4
  and Phase-7 veto 1. *The gate arithmetic would have rewarded a change that degrades safety.*

---

## 4. `RC-3` — containment **NOT** achieved

| scenario | divergent | reproducibility | `G9-S1` safety-material | `G9-S2` traceability-only |
|---|---|---|---|---|
| baseline | 14 | 84.95% | **7** | 7 |
| authoritative tier = BOUND | 10 | 89.25% | **7** | 3 |
| + demote-not-delete | 14 | 84.95% | **7** | 7 |
| + carrier question | 14 | 84.95% | **11** | 3 |
| `RC-2` approximation | 13 | 86.02% | 6 | 7 |

> **THE SAFETY-MATERIAL HALF IS IMMOVABLE. `G9-S1` STAYS AT 7 UNDER EVERY DOWNSTREAM ARCHITECTURE THE
> RECORDING CAN DISCRIMINATE**, and the one scenario that moves it moves it the wrong way. Only the
> traceability half responds, and §5 shows *how* it responds.

---

## 5. Result-tier governance `PHASE 9` — the BOUND tier must **NOT** be promoted

The `G9` gain from reading the binder's tier is **4 rows, all `G9-S2`**. What produced it was measured
directly, and the answer is unambiguous:

> **ON EVERY DECIDABLE ROW WHERE THE BINDER DELETED ALL CANDIDATES, IT DELETED A STATE THAT *MATCHES*
> THE FROZEN TRUTH. 3/3 IN PROCESS A, 5/5 IN PROCESS B — 8/8.**

`SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` fired fatally on eight decidable rows in Run 2 and was wrong
on all eight, deleting correct `NEGATED` and `CORRECTED` answers. **The bound tier's reproducibility
gain is bought by suppression, not by correctness**, and promoting it would propagate a demonstrably
imprecise rejection into the customer-authoritative tier.

**Intended architecture, therefore:** the authoritative candidate is the output of the
**condition-state resolution boundary** — downstream of the validator, upstream of the binder — which
is why the boundary was placed there rather than in the binder. The binder keeps its separate tier
until its rejection precision is repaired. **No customer authority changes. Level 1 remains
authoritative.** This is a recommendation with evidence attached, not an enacted promotion.

**A new established defect:** binder state-rejection precision is 0/8 on Run-2 evidence. Repairing it
needs the evidence text, which the recording does not hold.

---

## 6. `RC-4` — `INSUFFICIENT_EVIDENCE`, and consistent with being an `RC-3` facet

§69.6 required a rate over **≥ 500** development calls before any binder offset behaviour is touched.
Measured across **20 verification packages and 5,263 recorded evaluations** (upper bound on distinct
calls; some artifacts re-record the same run):

**`EVIDENCE_OUT_OF_BOUNDS` = 3 / 5,263 = 0.057%.**

* Two are the **same scenario** (`F-FLD-159`, L3-2f) on `qwen3-coder:30b` at `temperature 0` with a
  fixed seed, with the detail persisted: **span `[-1,-1)`** — the not-found sentinel of a failed
  string search, i.e. **provider-emitted offsets**, and it **reproduced identically** across two runs.
* One is `H2B-004` on the Anthropic path, and it **did not reproduce**: process A rejected, process B
  validated the same row.

`H2B-004` mechanism, positively narrowed on the recording: observation is **82 characters, pure ASCII,
NFC-stable**, `redactionCount = 0`, `promptTokens` identical (6013) in both processes, and telemetry
shows `binding: {total 1, unbound 1}` in A versus `{total 1, unbound 0}` in B. **Unicode/normalisation,
redaction, the input builder and observation slicing are ruled out**; the binder is ruled out because
the failure is in the validator, upstream of it. The exact sub-form (negative sentinel versus a
wrong-but-positive span) **cannot** be established — Run 2 persisted the issue *code* but not its
*detail*.

> **DETERMINISTIC WHERE A DETERMINISM CONTROL EXISTS, NON-REPRODUCING WHERE ONE DOES NOT.** That is the
> §69.6 signature of a facet of `RC-3`, and §69.6 pre-registered the disposition: *if random, `RC-4` is
> a facet of `RC-3` and must not be fixed separately.* **NO BINDER CHANGE WAS MADE AND NONE IS
> PROPOSED.**

---

## 7. Zero-cost regression `14 SUITES, 1,035 ASSERTIONS, 0 FAILURES`

TypeScript compile clean. `l31` 49 · `l32` 191 · `l32b` 105 · `l32c` 86 · `l32d` **71** · `l32e` 82 ·
`l32f` 77 · `l32g` 57 · `l32i` 61 · `l32j` 37 · **`l3-condition-state-resolution` 155** ·
`hazlenz-evidence-boundary` 13 · `kg3f-56-14132-predicate` 16 · `evidence-foundation` 35.

`test:hazlenz-core` **FAILS on two sub-suites** — *Golden Hardening Scenarios* and *HazLenz Production
Path Regression* — and **neither is reachable from this phase's edits**, proven structurally rather
than assumed: **`reasoning-l3` has ZERO importers anywhere in `backend/src` (0 matches)**, both edited
files are inside `reasoning-l3`, and both failing suites are `src` modules. *Golden Hardening* imports
`typeorm`'s `DataSource` and requires a database this phase is forbidden to touch. The failing
assertions are Level-1 lexical/standards expectations (`tagged but not locked` classified as machine
guarding rather than LOTO). **Pre-existing and out of scope; not silenced, not repaired.**

## 8. `INSTRUMENT_SELF_REFERENCE_PROHIBITED` — obeyed mechanically

Every instrument in this package **enumerates and prints its target set**, **fails closed on an empty
one**, and carries **positive and negative controls**. The two instruments that scan text
(`rc4-grounding-rate.js`, `prove-preservation.js`) **strip comments and string/regex literals before
matching**, **exclude their own source**, then **re-scan the exclusion and print the delta**: the RC-4
scan hides **0** records, and the egress scan hides exactly **1** — the replay harness's own network
**seal**, whose purpose is to *prevent* contact. **No sixth occurrence of the defect fired.**

## 9. Preservation `36 CHECKS, 36 PASS`

All five frozen Run-2 identities byte-identical. Frozen terminal, `scorable`, `pass`,
`modelAcceptanceResult` and `failedGates` unchanged. `git diff HEAD -- safescope-data` **0 lines**; no
eval corpus modified; `gauntlet.seed` not written; reserved tranches untouched. Production edits are
**exactly two files, both in `reasoning-l3`**. **Nine of the eleven pre-existing modified files are
byte-identical to their phase-start digests**; the two that changed are the master documents Phase 16
requires this phase to extend, and the extension is **additive** — the blueprint is **+3,815 / −0**
lines against `HEAD`, and the current-state document **lost no top-level key** and still carries every
historical Run-2 phase record. 4 stashes, 23 tags, upstream 0/0, `HEAD` `a7b21a26` — all unchanged.

## 10. Classification and what is next

`RC-1` **PARTIAL** · `RC-2` **PARTIAL** · `RC-3` **UNRESOLVED** · `RC-4` **INSUFFICIENT_EVIDENCE**

**A paid Tier-3 cohort is NOT yet justified**, on this phase's own criteria: the `RC-2` replay gates
could not be *run*, the `RC-1` vetoes were *failed* by the only replayable clarification change, and
`G9`'s safety-material half did not move. **Run 3 remains NOT AUTHORIZED** — its binding blocker is
`RC-3`, untouched here.

**The exact next prerequisite** is not another architecture: it is **a development-cohort run that
PERSISTS RAW PROPOSAL BODIES** — evidence spans, `conditionRationale`, `uncertainties`, and the
per-candidate `clarification` with its `affectedDecision`. Without that field this phase's boundary
cannot be measured in `RESOLVE` mode, `RC-2` cannot leave PARTIAL, and no Tier-3 spend can be
justified. It is a **Tier-3 bounded development cohort, ≤ `$3`**, and it needs authorization.

**Level 1 is unaffected and unblocked.** `customerDefaultMode = LEGACY`, production shadow off, no
customer has ever received Level-3 output, and `reasoning-l3` is imported by nothing in `backend/src`.
