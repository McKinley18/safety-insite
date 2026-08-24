# L3-2k — SHIPPED-LADDER RESIDUAL ROOT CAUSE: `F-WC-09` + `C-CS-05`

> ## `L3_2K_COMPLETE — SHIPPED_PROVIDER_DELTA_ROOT_CAUSED`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. **DIAGNOSIS ONLY — nothing was repaired.** Zero production
files, zero shipped-prompt bytes, zero shipped-schema bytes, zero historical harnesses and zero
historical scorers modified. Nothing committed, pushed or deployed; no stash operation; no sealed
corpus opened; no production provider selected; L3-3 not begun.

§29–§42 are not rewritten and `D-55` … `D-62` stand exactly as recorded.

---

## 1. The two findings

> ### `F-WC-09` — `THE_HAZARD_IS_NOT_MISLABELLED, IT IS DELETED — AND THE PIPELINE ALREADY HOLDS THE CORRECT FACT`

> ### `C-CS-05` — `THE §34.2 GATE IS DEFEATED BY THE SAME MOVE THAT CREATES THE QUESTION`

Both required tracing a stage **no prior artifact had ever reached**. Every existing corpus runner
stops at `validateReasoningProposal`; `bindEvidenceSemantically` runs **after** it
(`reasoning-runner.ts:81`) and owns §34.2's clarification gate and the state-support check. Reading
`validationIssues: []` as "the deterministic pipeline was content" would have been §42.4's error one
level further on — a boundary the instrument never reached.

---

## 2. `F-WC-09` — root cause

**Observation:** *"The operators on the swage press have been issued gloves and told to keep their
hands clear, and the two-hand control on the press has been strapped down with tape."*

### 2.1 The trace, `qwen3-coder:30b`, shipped v6 ladder, two isolated processes

| stage | result |
|---|---|
| **provider** | ONE candidate `machine_guarding_1`, `conditionState` **`CONTROLLED`** |
| — its rationale, verbatim | *"The two-hand control has been secured with tape, which prevents accidental activation of the press mechanism. This physical control prevents contact with the hazard and makes the condition controlled."* |
| **normalizer** | 1 quotation, **0 unbound, 0 ambiguous** — evidence binding is clean |
| **validator** | **`VALID`, zero issues** |
| **semantic binder** | candidate **REJECTED** — `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` |
| **`boundHazards`** | **`[]`** |
| **final** | `assertsActive` **false**, and an emptied `ANALYZED` becomes `INSUFFICIENT_EVIDENCE` at `reasoning-runner.ts` |

**The customer receives NO hazard at all** on a high-consequence scenario — not a hazard wearing a
reassuring `CONTROLLED` label. `HC (model-asserted) 12/13` (§41.2, §42.3) is a **model-tier** metric
and stops before this stage; it recorded the miss but not its severity.

### 2.2 The pipeline already holds the correct fact, and by design cannot act on it

`control-adequacy.ts` recorded, on the same candidate, in the same run:

```
adequacy: CONTROL_ABSENT   matchedTerm: "strapped down"
detail: "'strapped down' states a required control is absent or defeated;
         an absence written as one word is still an absence"
```

§36.4 fixed that module as **recording only** — *"`control-adequacy.ts` **records** … and decides
nothing"* — the `observation-availability.ts` restraint of §35.2, under `L3-INV-12`. So the
deterministic layer independently reached the right reading of the very phrase the provider
inverted, filed it as an advisory, and the hazard was deleted anyway.

### 2.3 The control discriminates — the binder is not the originating fault

`F-WC-03` is the other §36.6 `F6`-class scenario and was run in the **same process**, on the **same
prompt and schema**:

| | model state | binder | `controlAdequacy` | final |
|---|---|---|---|---|
| `F-WC-09` | `CONTROLLED` | **REJECTED** | `CONTROL_ABSENT` ("strapped down") | **no hazard** |
| `F-WC-03` | `ACTIVE` | kept | `CONTROL_ABSENT` ("missing") | **ACTIVE** ✓ |

Identical pipeline, identical advisory, opposite outcome — **decided entirely by the model's state
choice.** Without this control the finding would be vacuous (`D-54`); with it, the binder is
exonerated as the origin and indicted only as the amplifier.

### 2.4 Gemini, same sequence, two isolated processes — the delta is REAL and survives the binder

| | `qwen3-coder:30b` | `gemini-3.1-pro-preview` |
|---|---|---|
| candidate | `machine_guarding_1` | `machine_guarding_bypassed_two_hand_control` |
| model state | **`CONTROLLED`** ×2 | **`ACTIVE`** ×2 |
| rationale | *"…secured with tape, which prevents accidental activation…"* | *"Strapping it down **bypasses** the control, making the hazard active. Verbal instructions and gloves are administrative…"* |
| binder | **REJECTED** ×2 | kept ×2 |
| final `assertsActive` | **false** ×2 | **true** ×2 |

§42's `13/13 vs 12/13` was a model-tier figure. **Measured through the full shipped sequence the
delta is larger than that number implied**: hazard delivered versus hazard destroyed.

### 2.5 Classification

| axis | verdict |
|---|---|
| **primary boundary** | **`ASSERTION_STATE_SELECTION`** — provider stage |
| separate, newly measured amplifier | **`SEMANTIC_BINDER`** — a *correct* refusal of an unsupported state **deletes the candidate** rather than demoting it |
| `MODEL DID NOT PROPOSE` vs `MODEL PROPOSED, PIPELINE REJECTED` | **MODEL PROPOSED, PIPELINE REJECTED.** One candidate, cleanly bound evidence, `VALID` at the validator |
| deterministic? | **YES** — `CONTROLLED` is the sole state in **13 of the 14** recorded qwen ladder-family runs across 6 artifacts and 4 sessions, plus **2 of 2** this phase. The one exception is `V_A_LADDER` built on the **rejected v7 declaration** (`a76debe5`), which returned `['CONTROLLED','ACTIVE']` — recorded because a rejected prompt's behaviour is evidence, not a recommendation, and `D-59` is not reopened by it |
| order-sensitive? | **NO** — `V_A_LADDER` (§36.7, sha `a6dea73f`) also returns `CONTROLLED` |
| before or after proposal validation? | the fault is **before**; the loss is **after** |
| §24 disposition | **`DEFECT_NONBLOCKING`**, owner split: provider-stage state selection (RESOLUTION-adjacent, §23) plus a recorded architectural question about refusal semantics |

### 2.6 Generalization risk — quantified from existing artifacts, zero inference

`CONTROLLED` is chosen by qwen on **exactly 1 of 24** shipped-ladder scenarios, and it is `F-WC-09`.
Gemini chooses it **0 of 24**. So the measured binder-deletion exposure on the already-open cohort is
one scenario. **The mechanism is general and the exposure is not**: any candidate whose state the
model cannot support from the cited span is deleted rather than demoted, and the number of such
candidates is a provider property.

---

## 3. `C-CS-05` — root cause

**Observation:** *"If the level probe on the caustic tank were to fail closed during a transfer, the
vent could pressurise and lift the manway gasket."* Pole: **`CLARIFICATION_MUST_NOT_ASK`**.

### 3.1 Eight isolated processes, four per variant — the single-shot comparison could not see this

| variant | model `conditionState` | model raised a question | §34.2 gate fired | **final carries a question** |
|---|---|---|---|---|
| **B** — shipped v6 (`b8cc50fc`) ×4 | `HYPOTHETICAL` ×4 | **no ×4** | — | **no ×4** ✓ |
| **A** — §36.7, one block moved (`a6dea73f`) ×4 | `HYPOTHETICAL` ×3, **`INSUFFICIENT_EVIDENCE` ×1** | **yes ×4** | **yes ×3** | **yes ×1** ✗ |

Variant A's prompt was reconstructed by the locked harness's own manipulation and then **asserted
against the sha256 the frozen L3-2g artifact recorded** — the instrument refuses to run otherwise.

### 3.2 Two separable effects, and conflating them is the error this section exists to prevent

1. **Deterministic, at the model tier.** The one-block move makes qwen raise a question on a
   MUST-NOT-ASK scenario in **4 of 4** runs; under the shipped prompt it raises none in 4 of 4. This
   is the real §36.7 signal and it is **not** noise.
2. **Non-deterministic, at the state tier.** On **byte-identical variant-A prompts in separate
   processes** qwen returns `INSUFFICIENT_EVIDENCE` once and `HYPOTHETICAL` three times. That is
   provider variance at temperature 0 with a pinned seed — **not** an effect of block order.

**The customer-visible failure needs BOTH.** The block move supplies the question deterministically;
provider variance supplies the demotion about one time in four.

### 3.3 Why the deterministic gate cannot catch it — and why that is not a gate defect

`clarificationBelongsHere(h)` returns true iff `h.conditionState ∈ L3_UNDECIDED_STATES`
(`{INSUFFICIENT_EVIDENCE, UNKNOWN}`). §34.2 made that exemption deliberately: *"it runs AFTER
demotion, so a candidate the impression gate moved to `INSUFFICIENT_EVIDENCE` keeps the clarification
it was demoted in order to carry."*

So the gate is **load-bearing, not lax** — on the same 24-scenario cohort it is exactly what lets all
**5 of 5** `CLARIFICATION_REQUIRED` scenarios (`F-OA-01`, `F-OA-02`, `F-CL-01`, `F-CL-03`, `B10`)
carry their legitimate question on both providers.

> #### `A GATE CONDITIONED ON THE CANDIDATE'S STATE IS DEFEATED BY ANY MOVE THAT CHANGES THAT STATE`
>
> §41.3 recorded the **drop** form: declaration rev 1 removed the candidate, so §34.2's gate never
> fired and a question landed on `C-CS-05`. This phase measures the **demote** form: the candidate
> survives but at an undecided state, and the gate is inert for the same structural reason. Two
> mechanically unrelated perturbations — a prompt-block move and a prompt declaration — defeat the
> same control by the same route.

**The vacuity control is satisfied and it is measured, not argued.** In the three variant-A runs where
the state came back `HYPOTHETICAL`, the gate **did** fire — `SEMANTIC_CLARIFICATION_ON_DECIDED_STATE`,
`clarificationsDropped` populated, final question suppressed. The gate demonstrably works; it is
demonstrably unreachable when the state is undecided.

### 3.4 `FIELD-LEVEL VARIANCE` versus `SEMANTIC DECISION VARIANCE` — both, at different tiers

| tier | what differs | class |
|---|---|---|
| **model** (`raisedClarification`) | deterministic, 4/4 | **FIELD-LEVEL VARIANCE that is not noise** |
| **shipped decision** (final question delivered) | 1 of 4 | **SEMANTIC DECISION VARIANCE** — a false question reaches a safety professional |
| hazard decision (`assertsActive`) | **never** — false in all 8 runs | unchanged |
| false ACTIVE | **never** | unchanged |
| high-consequence | **never** — `C-CS-05` is not an HC scenario | unchanged |
| evidence spans | not implicated | — |

The delivered question is a real one, not an empty shell: *"Is the level probe on the caustic tank
currently failing closed during a transfer?"* — a plausible, answerable question that the scenario's
own conditional phrasing already answers, which is exactly why the pole is MUST-NOT-ASK.

### 3.5 Classification

| axis | verdict |
|---|---|
| **primary boundary** | **`ASSERTION_STATE_SELECTION`** — provider stage, the same boundary as `F-WC-09` |
| separate, newly measured composition | **`SEMANTIC_BINDER`** — §34.2's undecided-state exemption is defeated by the demotion |
| deterministic? | **the question: YES (4/4). The demotion: NO (1/4).** They must not be reported as one number |
| semantically decision-affecting? | **YES at the shipped tier, in 1 of 4 runs.** Not merely internal variation |
| does the changed block carry semantic instruction? | **YES** — it is the ABSENT-CONTROLS + CONTROL-ADEQUACY material, not formatting. §36.7 measured the same trade from the other end |
| §24 disposition | **`DEFECT_NONBLOCKING`** — the shipped configuration is variant **B**, under which the failure does not occur in 4/4 runs |

### 3.6 Generalization risk — quantified from existing artifacts, zero inference

`C-CS-05` is the **only** scenario in the 24-scenario cohort that produces a `HYPOTHETICAL` candidate,
on **either** provider. It is therefore the only place on this cohort where the demote-defeats-the-gate
composition has anything to act on. All **5** undecided-state scenarios are `CLARIFICATION_REQUIRED`
and all 5 correctly carry their question on both providers — **the exemption is doing its job 5 times
for every 1 time it is exploited.**

---

## 4. What the two cases share `STABLE_INVARIANT`

> ### `BOTH SHIPPED-PATH RESIDUALS ARE THE MODEL'S SINGLE-ENUM conditionState CHOICE, NOT ITS FACTS`

Neither is a candidate omission, an evidence-binding failure, a validator rejection, a resolver fault
or a scorer artifact. In both cases the model proposes the right hazard on the right evidence and then
selects the wrong `conditionState` — and in both cases the deterministic layer already holds the fact
that would have decided it correctly:

| | the model's choice | the fact the pipeline already held |
|---|---|---|
| `F-WC-09` | `CONTROLLED` | `control-adequacy.ts` → `CONTROL_ABSENT` ("strapped down"), and `V_S_STRUCT` → `controlReading: DEFEATED` → derived `ACTIVE` |
| `C-CS-05` | `INSUFFICIENT_EVIDENCE` (1 in 4) | its own other three runs → `HYPOTHETICAL`, a decided state the gate can act on |

**This is §37's structural-separation thesis, on the shipped path.** §42.6 recorded that
`TERMINAL_A`'s decisive axis is not measurable on the shipped ladder; this phase supplies the shipped-
path evidence that the ladder's single-enum state selection is where qwen loses both cases, while the
separated-fact representation answers both correctly. **It is two scenarios and it is not a
mandate** — §36.7's trade and §37.11 item 2 both still stand, and nothing here promotes a
representation or a resolver ordering.

---

## 5. Instrumentation boundary — what came from where

| conclusion | source |
|---|---|
| the model states, candidate counts, outcomes and cross-representation comparison for both cases | **EXISTING ARTIFACT** — 80 rows across L3-2g, L3-2h, L3-2h-final, L3-2i, L3-2j and L3-2j-closure |
| `F-WC-09` deterministic across 11 qwen runs; not order-sensitive | **EXISTING ARTIFACT** |
| `V_S_STRUCT` recovers `F-WC-09` via `controlReading: DEFEATED` → `ASSERTED_WITH_DEFEATED_CONTROL` | **EXISTING ARTIFACT** (frozen L3-2g `derived` facts) |
| §36.7's `V_B` vs `V_A` `C-CS-05` movement, and its exact fields | **EXISTING ARTIFACT** |
| `CONTROLLED` chosen 1/24 (qwen), 0/24 (Gemini); `HYPOTHETICAL` 1/24 both | **EXISTING ARTIFACT** |
| the candidate identity, rationale, evidence binding and clarification TEXT | **NEW DIAGNOSTIC INSTRUMENTATION** |
| the semantic binder's rejection of `F-WC-09` and the resulting empty `boundHazards` | **NEW DIAGNOSTIC INSTRUMENTATION** |
| `controlAdequacy` recording `CONTROL_ABSENT` on the same candidate | **NEW DIAGNOSTIC INSTRUMENTATION** |
| §34.2's gate firing 3/4 and inert 1/4 under variant A | **NEW DIAGNOSTIC INSTRUMENTATION** |
| qwen's variant-A state instability across isolated processes | **NEW DIAGNOSTIC INSTRUMENTATION** |
| Gemini's `F-WC-09` candidate surviving the binder to `ACTIVE` | **NEW DIAGNOSTIC INSTRUMENTATION** |

`backend/scripts/diagnose-l32k-shipped-residual.ts` **imports** the shipped schema builder, user-prompt
builder, normalizer, validator and semantic binder and reproduces none of them. It modifies no
production file, no shipped prompt, no shipped schema, no provider adapter, no historical harness and
no historical scorer — all verified byte-identical before and after.

---

## 6. Provider-decision implication — descriptive only

**Class `B` — one or two narrow diagnostic differences, insufficient on their own to justify a
provider decision — with one material qualification that class B does not by itself convey.**

Supporting `B`: the delta is **two scenarios of twenty-four**; the `C-CS-05` half does not occur under
the **shipped** configuration at all (0/4 under variant B) and is therefore not a live shipped defect;
the corpus is already-open diagnostic material, never sealed; and §42.8's confounds are undiminished —
Gemini's `thinkingLevel: low` still spends ~592 thought tokens per call against qwen's none, and its
noise floor is instrument-dependent.

Against reading `B` too comfortably: `F-WC-09`'s shipped consequence is **worse than the recorded
metric showed**. It is not a mislabel, it is the total loss of a high-consequence finding, on a
scenario whose correct reading the deterministic layer already computed. One scenario is a small
number; *a high-consequence hazard silently deleted* is not a small failure mode.

**It is NOT class `C`** — nothing here shows the qwen defect generalizing: `CONTROLLED` is chosen once
in twenty-four. **It is NOT class `D`** — the deterministic layer behaved correctly at every stage in
every run, and the binder's refusal is right on its own terms. **It is NOT `A`** on two scenarios, and
**not `E`**, because both mechanisms are established rather than inconclusive.

**No production provider is selected, and `D-55` and `D-62` are not overwritten.** One additive
decision is proposed for each case.

---

## 7. Regression, authority, egress and preservation

**L3 offline: 814 assertions over 10 suites, 0 failed** — `l31` 49 · `l32` 189 · `l32b` 105 · `l32c` 86 ·
`l32d` 71 · `l32e` 82 · `l32f` 77 · `l32g` 57 · `l32i` 61 · `l32j` 37. **Identical to §41.8 and §42.9,
suite for suite.** `test:hazlenz-core` **206 pass / 2 fail** — the two documented §13.1 failures only,
**not** reclassified. KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off`
51/51, `kg4b-shadow-contract` 123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170,
`evidence-foundation` 35. Backend and frontend `tsc --noEmit` both exit **0** — with the new
verification-side script present and typechecked.

**Customer authority:** the seam, its call site `safescope-v2.service.ts:1576` and
`backend/src/standards/` are byte-unmodified vs HEAD; all 19 `reasoning-l3` modules byte-identical
before and after; **zero** importers of `reasoning-l3` or `state-facts` outside the module;
`reasoning-l3` declares only `L3_OLLAMA_*`. `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.

**Egress:** two destinations. `http://127.0.0.1:11434` — **13 local inference calls**, 1 metadata call
(`/api/tags`, model inventory only). `https://generativelanguage.googleapis.com` — **4 hosted
inference calls, 0 auth or metadata calls** (the credential was checked by variable **presence and
length class only**; no `models` probe was issued this phase). Scenario IDs transmitted: **`F-WC-09`,
`F-WC-03`, `C-CS-05` locally; `F-WC-09` and `F-WC-03` only to the hosted provider.** No unexpected
destination. No customer or production data. No sealed-corpus content. **The credential appears in
zero artifacts — verified by scanning all 37 files.**

**Preservation:** HEAD `1feda622`, branch and upstream 0/0, **23 tag objects** identical by the §38.8
method, **4 stash entries** with no stash operation, the locked harness and all companion scorers
digest-verified, the shipped prompt `b8cc50fc` at version `v6` with schema key order
`outcome │ observationInterpretation │ hazardCandidates` and `unresolvedDecisions` absent, the run
schema `a522cf5a`, and the sealed corpus (`a95e5480…`, `49aa40fd…`, `6f6897f1…`) hash-verified and
**not opened**. The worktree gains exactly two entries: this evidence directory and the disposable
diagnostic script.

---

## 8. Acceptance gates

| # | gate | result |
|---|---|---|
| 1 | artifacts exhausted before any inference | **PASS** — 80 existing rows analysed; new inference only for the two questions artifacts could not answer |
| 2 | the shipped prompt and schema unchanged | **PASS** — `b8cc50fc` / key order intact, asserted by the instrument at startup |
| 3 | no historical harness or scorer touched | **PASS** — all digest-verified identical |
| 4 | §38.3 process isolation | **PASS** — 12 variants, 12 processes, pids in every artifact |
| 5 | variant A is the already-open §36.7 variant | **PASS** — reconstructed and pinned to the frozen `a6dea73f` digest; refuses to run otherwise |
| 6 | a non-vacuous control for each case (`D-54`) | **PASS** — `F-WC-03` for `F-WC-09`; the gate firing 3/4 for `C-CS-05` |
| 7 | `MODEL DID NOT PROPOSE` separated from `PIPELINE REJECTED` | **PASS** — and the answer is the second |
| 8 | field-level variance separated from semantic decision variance | **PASS** — measured at both tiers, 4/4 and 1/4 |
| 9 | no remediation | **PASS** — nothing repaired, nothing tuned, nothing promoted |
| 10 | sealed corpus untouched | **PASS** — hash-verified, unopened, absent from every artifact |
