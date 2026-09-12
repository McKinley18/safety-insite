# Expert HazLenz — Linkage Instrument Closure and Expanded-Validation Readiness

**§145. ZERO provider calls. ZERO local-model calls. $0.00.** No cohort created or rerun, no reserved
material opened, no formal scorer/truth/threshold touched, nothing committed, pushed, tagged or
deployed. The expanded validation was **designed, not executed**.

**Every historical result is immutable and unchanged**, including the one this operation re-examines:

- **FORMAL_EVALUATION_FAIL — NOT ACCEPTED**, `FORMAL_COHORT_SPENT = TRUE`, historical
  `PROVIDER_INVOCATION_COUNT = 195` before and after.
- **The v9 hosted confirmation probe keeps its recorded terminal**:
  `LINKAGE_V9_HOSTED_CONFIRMATION = FAIL_FORBIDDEN_LINKAGE`,
  `EXPERT_HAZLENZ_V9_LINKAGE_CONFIRMATION_FAILED — LINKAGE_SEMANTICS_OR_MODEL_BEHAVIOR_REVIEW_REQUIRED`.
  Not one byte of its artifacts was written.

*Numbering note: the authorization calls that probe "§143"; the repository recorded it as §144 in
`verification/expert-hazlenz-v9-linkage-confirmation-2026-09-03/`. The directory name is used below
where it matters.*

---

## 1. Terminal

```
EXPERT_HAZLENZ_LINKAGE_DEVELOPMENT_BLOCKER_CLOSED —
EXPANDED_POST_REMEDIATION_VALIDATION_AUTHORIZATION_REQUIRED
```

All eight Phase-6 closure conditions hold (§6). The alternative terminal —
`…CLOSED — CANDIDATE_DECOMPOSITION_VALIDATION_REQUIRED` — is also supported by the evidence in §7,
and the product owner may prefer it; it is not selected here because candidate decomposition is **one**
axis of the expanded validation rather than the sole unresolved issue. Clarification recall (§8) is
equally open and is the expanded plan's **primary** axis.

---

## 2. The construct-validity defect

The v9 probe failed on exactly one criterion: `FORBIDDEN_LINKAGE_ACCEPTED = 1` on `CL-F1`. The fixture
authored `FORBIDDEN` on this premise:

> *"ambiguous referent. Two presses of the same family in the same state, and the authorisation
> question applies to both identically. There is no unique candidate to name, so any link is wrong."*

**That premise is a prediction about the model's candidate decomposition, and the fixture cannot make
it true.** Ambiguity is a property of the candidate set; the candidate set is model-generated.

The model decomposed the row **per defect**, not per press, and one of the candidates it produced —
`unverified_muting_authorisation` — *is* the missing fact the question asks about. Against the set it
actually emitted, the link is correct. Scoring that as a linkage defect charged the model for a
**decomposition choice**, not for a linkage error.

This is the fourth instrument defect in this programme and the first of its kind. The earlier three
were **scope** errors in a measurement. This one is a **construct** error: the measure asked a
question the instrument had no standing to ask.

---

## 3. Phase 1 — the two questions, permanently separated

Frozen in `scripts/lib/expert-probe-measures.ts` and asserted at `C2.7`–`C2.11`:

> **QUESTION A — LINKAGE VALIDITY.** Given the **accepted candidate set actually emitted**, does the
> clarification have a unique semantic relationship to one candidate?
>
> **QUESTION B — CANDIDATE DECOMPOSITION QUALITY.** Should that candidate have been emitted at all?

- A valid link to a spurious candidate is **`LINKAGE_VALID = TRUE`** and
  **`CANDIDATE_PRECISION` = potentially FALSE**.
- **A bad candidate must never turn a mechanically correct link into a linkage failure.**
- A good candidate with a wrongly attached clarification **is** a linkage failure, however clean the
  candidates are.

The two are reported on separate axes and are never summed. `C2.11` asserts the first direction
directly.

---

## 4. Phase 2/3 — output-relative evaluation and scenario intent

`FORBIDDEN` is no longer authorable as fixture truth. A fixture now declares
**`EXPECTED_SCENARIO_INTENT`** — what it was *built to challenge* — and the instrument computes
**`SCENARIO_INTENT_REALIZED`** mechanically against the accepted candidate set:

| intent | realized when |
|---|---|
| `AMBIGUOUS_CANDIDATE_CHALLENGE` | ≥2 accepted candidates within the presumed families **and** no emitted link resolves outside them |
| `DIFFERENT_HAZARD_CHALLENGE` | accepted candidates span ≥2 distinct families |
| `GENERIC_FOLLOWUP_CHALLENGE` | ≥2 accepted candidates, so a row-level question has no unique subject |
| `NO_LINKAGE_CLAIM` | never — excluded from every denominator |
| any | **never**, if no clarification was emitted |

**A row whose intent is not realized leaves the FORBIDDEN denominator for that execution.** Any
unexpected candidate is evaluated on the candidate axis instead.

**The correction is not a way to pass.** `C2.3` proves that when the model *does* link to one of two
interchangeable candidates within the presumed families, the ambiguity is realized and the link is
still counted as a violation. The denominator narrows; the measure stays armed.

---

## 5. Phase 4 — CL-F1 re-derivation, from persisted output only

| question | finding |
|---|---|
| **A. Was `unverified_muting_authorisation` accepted?** | **YES.** It survived the boundary (`issues: []`, `layerStatus: PRESENT`), carries 1 bound quote, `assertedConditionState: INSUFFICIENT_EVIDENCE`, `requiresUserConfirmation: true`, and reached `merged.expertAdvisory.hazardCandidates`. |
| **B. Given the complete accepted set, was the authorization clarification uniquely related to it?** | **YES.** The set was `muted_light_curtains` (machine_guarding, ACTIVE), `mute_key_left_in_panel` (machine_guarding, ACTIVE) and `unverified_muting_authorisation` (training_procedure_supervision, INSUFFICIENT_EVIDENCE). The physical guard is defeated and the key is in the panel **whatever the authorisation answer is** — neither changes. Only the third candidate's status turns on it. |
| **C. Did `relatesToCandidateKey` point to that exact candidate?** | **YES.** `unverified_muting_authorisation`, resolving to an emitted key. |
| **D. Output-relative classification** | **`REQUIRED`.** All three v9 TEST-1 conditions hold against the accepted set: one direct subject; both answers change its status (the model wrote both branches — *"authorised → verify compensating measures and key control; never authorised → uncontrolled defeat… presses should be stopped"*); and among three candidates the link is needed to read the question correctly. |
| **E. Candidate quality** | **`PLAUSIBLE_BUT_UNVERIFIED`.** `training_procedure_supervision` is in the row's authored **DEFENSIBLE** bucket — a reviewer would find it defensible but would not require it. It is neither supported nor spurious. |

**Whether three candidates for one defeated-guard situation is over-fragmented is NOT decided here.**
The authored partition says which *families* are present, defensible or forbidden; it says nothing
about how many candidates a family should be decomposed into. That is genuinely unresolvable from the
development truth available, and it is routed to §7 rather than guessed. **Candidate-quality
uncertainty was not converted into a linkage defect.**

---

## 6. Phase 5 — `PROSPECTIVE_INSTRUMENT_CORRECTED_REDERIVATION`

From the persisted `RUN-RECORDS.jsonl` (`1d344c44…`) only. **This does not replace the historical
result.**

| metric | value |
|---|---|
| `REQUIRED_LINKAGE_OPPORTUNITIES` | **3** |
| `REQUIRED_LINKAGE_POPULATED` | **3** |
| `REQUIRED_LINKAGE_VALID` | **3** |
| `ALLOWED_LINKAGE_OPPORTUNITIES` | 2 |
| `ALLOWED_LINKAGE_VALID` | 2 |
| `FORBIDDEN_SCENARIO_INTENTS` | 3 |
| `FORBIDDEN_SCENARIO_INTENTS_REALIZED` | **0** |
| `FORBIDDEN_LINKAGE_OPPORTUNITIES` | **0** |
| `FORBIDDEN_LINKAGE_ACCEPTED` | **0** |
| `SCENARIO_INTENT_NOT_REALIZED` | **3** |
| `INVALID_LINKAGE_ACCEPTED` | **0** |
| `NO_LINKAGE_OPPORTUNITY` | 3 |

Why each FORBIDDEN intent went unrealized:

- **CL-F1** — the link resolved to an accepted candidate **outside** the presumed
  `machine_guarding` families, so the model found a unique referent the fixture did not anticipate.
- **CL-F2**, **CL-F3** — **no clarification was emitted**, so no linkage situation arose in either
  direction.

**`FORBIDDEN_LINKAGE_ACCEPTED = 0` here means "no defect established", not "FORBIDDEN behaviour
verified".** Zero opportunities is zero evidence. Across §142 and the v9 probe, **no execution has
yet produced a realized FORBIDDEN opportunity** — that is stated plainly in §11 as an open item, not
smuggled in as a pass.

---

## 7. Phase 6 — the closure decision, condition by condition

| # | condition | evidence | met |
|---|---|---|---|
| 1 | REQUIRED linkage repeatedly demonstrated live | §142 **4/4** valid; v9 probe **3/3** valid — **7 of 7 across two independent executions** | **YES** |
| 2 | competing-candidate referent selection demonstrated | v9: candidate sets of **2, 2 and 3**, correct referent each time; §142: 3 rows with two candidates each | **YES** |
| 3 | candidate-specific PPE/control precedence demonstrated | **CL-R3** — a control/PPE-shaped question uniquely qualifying one of three candidates, linked | **YES** |
| 4 | generic counterpart does not force linkage | **CL-F3** emitted no clarification and no link; **CL-N1** fully silent | **YES** |
| 5 | invalid accepted candidate keys = 0 | **0** in both probes | **YES** |
| 6 | no output-relative FORBIDDEN linkage defect established | **0** accepted over **0** realized opportunities (§6) | **YES** |
| 7 | deterministic arbitration green | `test:expert-linkage-contract` C.1–C.10, all passing | **YES** |
| 8 | no protected regression | **35/35** before and after, identical | **YES** |

**Linkage is CLOSED as a development blocker.**

```
ARBITRATION_LIVE_STATUS = DETERMINISTICALLY_PROVEN_HOSTED_UNEXERCISED
```

Zero `HAZARD_EXISTENCE` clarifications across **41 hosted calls in three probes**. Per the
authorization, **linkage is not held open waiting for a naturally rare contradiction**, and none was
ever fabricated.

---

## 8. Phase 7 — candidate-decomposition debt

The candidate axis, run over the same persisted records, reports **8 anomalies** — deliberately not
folded into any linkage count:

| row | candidate | family | quality |
|---|---|---|---|
| CL-T1 | `cand-2` | material_handling_storage | **SPURIOUS_CANDIDATE** (authored FORBIDDEN) |
| CL-R3 | `cand-resp-protection-unknown`, `cand-fire-explosion-solvent` | respiratory_protection, fire_explosion | PLAUSIBLE_BUT_UNVERIFIED |
| CL-F1 | `unverified_muting_authorisation` | training_procedure_supervision | PLAUSIBLE_BUT_UNVERIFIED |
| CL-F3 | `weld-fumes-1` | welding_fumes | PLAUSIBLE_BUT_UNVERIFIED |
| CL-T1 | `cand-1` | walking_working_surfaces | PLAUSIBLE_BUT_UNVERIFIED |
| CL-T2 | `combustible_lagging_proximity`, `unknown_line_contents` | fire_explosion, chemical_release | PLAUSIBLE_BUT_UNVERIFIED |

The single SPURIOUS one is worth stating carefully: CL-T1's `cand-2` reasons that *"using a loose
length of conduit as a prop is an unsecured object at height over an opening with a 20-foot drop"* —
**grounded in a stated fact**, with a bound quote. Whether that is a genuine precision defect or a
disagreement about which family it belongs to **is not settled here**, and it is exactly the question
the new axis exists to ask.

Recorded as **`CANDIDATE_PRECISION_AND_DECOMPOSITION`** debt. **It is not repaired from CL-F1, or
from any single row.** Future validation must distinguish: legitimate additive hazard · duplicate
semantic candidate · overly fragmented candidate · unsupported candidate · useful distinct
interacting hazard.

---

## 9. Phase 8 — LP-B2 and clarification recall

```
LP_B2_STATUS = GENUINE_TRUE_GAP_RETENTION_MISS
```

Truth unchanged. **Not repaired from one row.** Clarification *overproduction* is substantially
improved and repeatedly measured (§140 0.188/call, §142 0.438, v9 0.667, no coverage template in any
of them), but **recall is not closed**: 5/5 on the v9 probe is narrow evidence from five controls on
nine rows, not a recall measurement.

`CLARIFICATION_RECALL` becomes the **primary** axis of the expanded validation, on fresh development
cases spanning multiple `affectedDecision` categories, **not copying LP-B2**.

---

## 10. Phases 9–11 — expanded validation, designed not executed

**Deliberately NOT another linkage probe.** Linkage drops to a regression check only — valid keys, no
obviously unrelated links, no forced linking — and must not consume a large fraction of the probe.

| axis | focus |
|---|---|
| **A. Clarification recall** *(primary)* | true-gap survival, no-gap precision, `affectedDecision` accuracy |
| **B. Candidate recall** | hazards the deterministic layer missed that Expert should add |
| **C. Candidate precision / decomposition** | spurious rate, duplicate/fragmented candidates, legitimate distinct additive hazards |
| **D. Cross-hazard insights** | interaction precision, spurious rate, no forced output — open since §140 |
| **E. Disagreements** | appropriate generation, no unnecessary contradiction of deterministic authority |
| **F. Governed evidence** | relevant grounding, unrelated/no-record abstention, no unsupported extension |
| **G. Citation containment** | zero unsupported accepted/merged |
| **H. Collection sparsity** | empty-by-default intact |
| **I. Additive union quality** | deterministic ∪ Expert; **never penalise Expert for non-repetition** |

**Proposed envelope (not executed):** ~20–30 logical calls, one `BASE` arm, hard request ceiling
**32**, hard spend ceiling the lower of **$3.50** and 32 × frozen worst case ($0.104) = **$3.328**;
fresh development fixtures spanning multiple semantic families rather than variants of one defect;
write-once pre-spend identity recording probe-script, fixture-manifest, system-prompt, wire-schema,
normalization and contract hashes; scorer-visible outputs persisted append-only with `fsync`.
**No spent formal rows. No reserved material.**

### Tooling debt, recorded

```
SOURCE_PROJECT_TSC        covers src/**/* ONLY
backend/scripts/          require their own execution/compile validation
```

**For every future ACTIVE probe script, `ACTIVE_SCRIPT_EXECUTABLE_PROOF = TRUE` is required before
provider spend.** Historical spent scripts may remain intentionally non-compiling against newer APIs
where their immutable identity requires preservation — `probe-expert-hosted-linkage-2026-09-02.ts`
was **not edited** and its hash still matches its spent identity record.

---

## 11. Remaining unknowns

1. **No realized FORBIDDEN opportunity has ever occurred.** Across §142 and the v9 probe the
   FORBIDDEN denominator is 0. FORBIDDEN behaviour is **unverified**, not verified — and it may not
   be reliably commissionable, for the same reason a contradiction is not.
2. **Hosted arbitration remains unexercised** across 41 calls; deterministically proven only.
3. **Candidate decomposition is open**, with one SPURIOUS and seven PLAUSIBLE_BUT_UNVERIFIED
   candidates as the starting evidence, and the fragmentation question unresolved.
4. **Clarification recall is open**; LP-B2 unexplained.
5. **`crossHazardInsights` precision** open since §140.
6. **Every hosted result to date is one arm, one replicate.** No rate, no distribution, no
   reproducibility claim.
7. **M14 remains causally unresolved.** `M14_REMEDIATION_STATUS = NOT_ATTEMPTED`.

---

## 12. Confinement

```
provider calls 0     local-model calls 0     cost $0.00
historical PROVIDER_INVOCATION_COUNT   195 before, 195 after
historical artifacts                   BYTE-IDENTICAL (11 verified, incl. the v9 probe and the spent §142 script)
v9 probe recorded terminal             UNCHANGED — FAIL_FORBIDDEN_LINKAGE stands
CL-F1 output-relative linkage          REQUIRED
CL-F1 candidate quality                PLAUSIBLE_BUT_UNVERIFIED (fragmentation UNRESOLVABLE)
linkage blocker                        CLOSED as a development blocker
arbitration                            DETERMINISTICALLY_PROVEN_HOSTED_UNEXERCISED
LP_B2_STATUS                           GENUINE_TRUE_GAP_RETENTION_MISS (preserved)
reserved material                      not opened
formal cohort / new cohort             spent & unmodified / NONE
M14                                    NOT_ATTEMPTED
formal scorer / truth / thresholds     UNCHANGED
expanded validation                    DESIGNED, NOT EXECUTED
production / database / customer       NONE
commit / push / tag / deploy           NONE
```

## 13. Zero-provider verification

| suite | before | after | detail |
|---|---|---|---|
| `hazlenz-core` | PASS | **PASS** | Overall Result: PASS |
| `expert-contract-foundation` | PASS | **PASS** | 56 passed, 0 failed |
| `expert-authority-merge` | PASS | **PASS** | 51 passed, 0 failed |
| `expert-provider-failure` | PASS | **PASS** | 131 passed, 0 failed |
| `expert-nocall-harness` | PASS | **PASS** | 141 passed, 0 failed |
| `expert-routing-contract` | PASS | **PASS** | 67 passed, 0 failed |
| `expert-grounding-contract` | PASS | **PASS** | 41 passed, 0 failed |
| `expert-projection-equivalence` | PASS | **PASS** | 90 passed, 0 failed |
| `expert-anthropic-adapter-repair` | PASS | **PASS** | 30 passed, 0 failed |
| `expert-execution-budget` | PASS | **PASS** | 66 passed, 0 failed |
| `expert-cohort-instrument` | PASS | **PASS** | 155 passed, 0 failed |
| `expert-remediation-contract` | PASS | **PASS** | 92 passed, 0 failed |
| `hazlenz-evidence-boundary` | PASS | **PASS** | {"passed":true,"assertions":13} |
| `evidence-foundation` | PASS | **PASS** | {"passed":true,"assertions":35} |
| `guided-finding-response` | PASS | **PASS** | {"passed":true,"assertions":28} |
| `risk-policy` | PASS | **PASS** | Risk policy: 10/10 checks passed |
| `l31-reasoning-contract` | PASS | **PASS** | 49 passed, 0 failed |
| `l32-semantic-contract` | PASS | **PASS** | L3-2 semantic contract suite: 191 passed, 0 failed |
| `l32b-binder-precision` | PASS | **PASS** | L3-2b binder precision suite: 105 passed, 0 failed |
| `l32c-gate-polarity` | PASS | **PASS** | L3-2c gate polarity suite: 86 passed, 0 failed |
| `l32d-clarification-scope` | PASS | **PASS** | L3-2d clarification scope suite: 71 passed, 0 failed |
| `l32e-syntactic-role` | PASS | **PASS** | L3-2e syntactic role suite: 82 passed, 0 failed |
| `l32f-predicate-scope` | PASS | **PASS** | L3-2f predicate scope suite: 77 passed, 0 failed |
| `l32g-state-separation` | PASS | **PASS** | L3-2g state separation + binder residual: 57 assertions passed, 0 failed |
| `l32i-clarification-carrier` | PASS | **PASS** | L3-2i candidate-independent clarification carrier: 61 assertions passed, 0 failed |
| `l32j-carrier-activation` | PASS | **PASS** | L3-2j shipped carrier activation (measured and refused): 37 assertions passed, 0 failed |
| `hazlenz-understanding` | PASS | **PASS** | HazLenz hazard understanding benchmark: 25/25 passed. |
| `hazlenz-precision` | PASS | **PASS** | PASS HazLenz decomposition precision/recall gate |
| `hazlenz-level1-recall` | PASS | **PASS** | PASS HazLenz Level-1 recall gate (17 checks) |
| `hazlenz-actionable-coverage` | PASS | **PASS** | PASS HazLenz actionable-coverage gate (17 checks) |
| `hazlenz-guarding-applicability` | PASS | **PASS** | HazLenz machine-guarding applicability precedence regression: all invariants passed, 0 failed |
| `expert-linkage-contract` | PASS | **PASS** | 51 passed, 0 failed |
| `expert-linkage-probe-fixtures` | PASS | **PASS** | 37 passed, 0 failed |
| `expert-linkage-precedence` | PASS | **PASS** | 57 passed, 0 failed |
| `expert-confirmation-probe-fixtures` | PASS | **PASS** | 42 passed, 0 failed |

**35 of 35 PASS, identical line for line to the Phase-0 baseline.** The linkage-precedence suite grew 44 → 57 assertions with the §145 scenario-intent and candidate-quality tests (`C2.1`–`C2.11`).

```
SOURCE_PROJECT_TSC                                  = PASS   (src/**/* ONLY)
ACTIVE_SCRIPT_EXECUTABLE_PROOF
  rederive-v9-linkage-output-relative.ts            = TRUE
  probe-expert-v9-linkage-confirmation.ts           = TRUE (measure-only path)
provider calls / local-model calls                  = 0 / 0
```

No formal acceptance is declared. The formal evaluation remains **FORMAL_EVALUATION_FAIL — NOT
ACCEPTED**.
