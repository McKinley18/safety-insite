# §154 — Hardened v13 Replicate 3. Three-Draw Stability Characterization.

TERMINAL:

    EXPERT_HAZLENZ_HOSTED_OUTPUT_STABILITY_INCONCLUSIVE —
    PROVIDER_OUTPUT_RELIABILITY_REVIEW_REQUIRED   (CASE D)

CASE A is **also factually established on HS-H1** and is recorded in full below. CASE D is chosen as
the terminal because it names the condition that actually blocks the next development step: on three
draws of frozen material, 4 of 48 row-executions (8.3%) returned degenerate provider content, and
only 3 of 16 rows were stable on every compared axis. A targeted semantic repair cannot be validated
through a channel in that state.

---

## 1. Identity and freeze

| | |
|---|---|
| operation | §154 hardened v9 / v13 replicate 3 |
| provider / model | anthropic / claude-sonnet-5 |
| prompt | `hazlenz.expert.prompt.v13` — module sha256 `02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa` |
| system prompt sha256 | `c4b3162439988e74186c36f75ee1f14875835e1cc832251a8d7365a4b158e3f3` |
| wire schema sha256 | `15e2b80947355954f105f8b34bf8cf00c6c1153a82c2255b9e8151ccd66c4a97` |
| analysis contract | `hazlenz.expert.analysis.v2` |
| fixture set | hardened development set v9, digest `434c127c44a8d6d8592c1b6e6c1cd01599428143f44737b19335a3123a7fe194` |
| fixture file sha256 | `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb` |
| sidecar sha256 | `591a027d67232fdd246e87d6e4ab4ad662108ea7f42a2b81665fa5af67a2981f` (0444, write-once) |
| pre-spend identity sha256 | `f70ff0c11c906133291e8ed68b91015cbab1c99061ea80529f5633efefe9f795` |
| detector | `hazlenz.expert.degenerate-output-detector.v2`, sha256 `86fa9b1653d4b66b1665c41cc67de9853b7f2e8e22adb3c5b03b790cc202856d` |
| family map | `hazlenz.expert.family-comparison-map.v1` |
| started / finished | 2026-09-03T21:23:20.983Z → 2026-09-03T21:27:19.953Z |

Digest and file hash were taken **before the first request and again after the last**; both are
unchanged, and the fixture linter passes after the run with zero findings. No prompt, contract,
arbitration, normalization, deterministic-HazLenz, fixture-byte or signature change was made in this
operation. v14 and v15 do not exist.

## 2. Execution

    stop COMPLETED   logical calls 16/16   provider requests 16   retries 0   reruns 0
    tokens 292,688 in / 20,522 out
    spend $0.790596 against an enforced ceiling of $1.6640 (the lower of the $2.50 authorized and the
    model-priced cap), 16-request hard cap, retry budget 0

Persistence: 16 records on disk, 0 parse problems, 0 completeness problems, mid-run read-back proven
on HS-A1 with 15 calls still outstanding. Identity violation: none. A second write to the identity
file was refused with bytes unchanged.

Pre-spend gate: **52/52 PASS at $0.00**. Two of those gates are new in §154 and were added before
spend: B.10b (replicate-2 artifacts present) and B.10c, which loads both stored draws, proves they
cover all sixteen rows, and runs detector v2 over both — so the three-draw matrix could not fail
after the money was gone. Two earlier dry runs blocked at $0.00 on stale §153 constants; that record
is preserved as `GATE-BLOCKED-DURING-PRESPEND-CONSTRUCTION.txt` rather than deleted.

## 3. The three views, never substituted for one another

| view | REQUIRED spoke | FORBIDDEN silent |
|---|---|---|
| A — LITERAL (all 16 authored rows) | 5/8 | 8/8 |
| B — PREREGISTERED ADJUDICATED (minus HS-F1 confounded, HS-M1 fixture-defect) | 4/7 | 7/7 |
| C — EXECUTION-VALID (B minus rows condemned by detector v2 in *this* draw) | 4/7 | 6/6 |

REQUIRED rows silent in all three views: **HS-A1, HS-E1, HS-H1**. FORBIDDEN rows that spoke: **none**
— the first draw of the three with a clean 8/8 on the forbidden side.

LOOSE counts only. STRICT recall is adjudicated by a human from `CLARIFICATION-ADJUDICATION.csv`;
this script does not compute it and this report does not supply it.

## 4. REQUIRED failure decomposition (Phase 7)

| row | classification | evidence |
|---|---|---|
| HS-A1 | RETAINED_BUT_NOT_ASKED | raised `flame_failure_device_unverifiable` at INSUFFICIENT_EVIDENCE and stated the owed fact in `uncertainty`, then closed the summary "…though this alone does not establish a decision-changing gap without further stated facts." |
| HS-E1 | SILENCE_WITHOUT_RETAINED_GAP | zero candidates, zero uncertainty, and a substantive summary that affirmatively settles the owed fact: "The overnight rotor tooth change is a resolved historical event… nothing in the text gives reason to believe the machine is not properly restored." |
| HS-H1 | RETAINED_BUT_NOT_ASKED (of a distractor, not of the owed fact) | retained gauge-verification doubt at INSUFFICIENT_EVIDENCE, then "this is a routine reliance on instrument accuracy that does not by itself change any action, so it is noted only as a low-confidence candidate rather than a clarification." |

FORBIDDEN speaking rows: none. Nothing to classify.

**A mechanism shared by HS-A1 and HS-H1 in this draw.** Both retained the unknown, then explicitly
ran the v13 retention bridge's own test — *would learning this fact change what is done now* — and
answered NO in prose. The bridge is not switched off; it is returning the wrong answer on rows whose
authored truth says the answer changes the immediate action. The identical construction appears on
FORBIDDEN rows HS-J1 (this draw) and HS-R1 (all three draws), where answering NO is correct. The
mechanism is therefore a **relevance mis-evaluation inside a bridge that is running**, not a failure
to reach the bridge — a materially different repair target from §150's.

## 5. HS-H1 three-draw analysis (Phase 8)

| draw | surface classification | what the model engaged with |
|---|---|---|
| R1 §152 | C — DISTRACTOR_SELECTION | asked whether the over-temperature alarm's silence was a normal profile or a fault |
| R2 §153 | D — SILENCE_RETAINED | retained gauge cross-verification and residual steam pockets; asked nothing |
| R3 §154 | **D — SILENCE_RETAINED**, with an explicit relevance denial | retained gauge accuracy; asked nothing |

Row level: **RECURRENT ROW-LEVEL FAILURE.** No valid owed clarification was delivered in any of the
three valid executions.

Mechanism level: **REPLICATED MECHANISM EVIDENCE, 3/3.** The owed fact is whether the load was given
a cooling hold before the door was opened. The strings `cool`, `cooling hold` and `boil` appear
**nowhere in any of the three draws** for this row. Every draw anchors on chamber-side
instrumentation — the alarm in R1, the gauge in R2 and R3 — and never entertains the load-side
thermal state at all. The surface classification changed between draws; the causal mechanism did not.

This satisfies both limbs of CASE A on this row. The remediation target, named from evidence, is
**chamber/instrument anchoring that never reaches the load-side fact**, not the old HAZARD_SEVERITY
mechanism. It must not be called v14.

## 6. HS-E1 three-draw analysis (Phase 9)

| draw | classification | candidates |
|---|---|---|
| R1 §152 | EXACT_RECOVERY | `lockout_return_to_service` CORRECTED, asked the owed question |
| R2 §153 | SILENCE | `lockout_maintenance_completed` CORRECTED, asked nothing |
| R3 §154 | **SILENCE_WITHOUT_RETAINED_GAP** — and total candidate suppression | **zero candidates** |

R3 did not recover. The row now carries **2/3 failure evidence**, which is not converted here into a
population failure rate. R3 is the worse of the two failures: R2 at least held a CORRECTED candidate
on the lockout family, whereas R3 emitted nothing at all and used its summary to reason the state
closed. Detector v2 correctly did **not** condemn this row — the summary is substantive, specific to
the observation, and reaches a decision. This is a genuine semantic disagreement with the authored
truth, not an execution failure, and it is the distinction detector v2 was built to make: compare
HS-K1 in the same draw, whose summary is the literal string `"placeholder"`.

Note for Phase 13: HS-E1's R3 summary converts *no stated failure* into *properly restored*. That is
the mirror image of the pattern §149 closed. It is recorded as **one observation on a previously
repaired axis**; one recurrence does not establish that §149's repair is globally reopened.

## 7. Three-draw stability matrix (Phase 10)

    ROWS_STABLE_3_OF_3        3
    ROWS_WITH_SINGLE_FLIP     3
    ROWS_MULTI_STATE_VARIABLE 8
    ROWS_EXECUTION_CONTAMINATED 2
    NOT_COMPARABLE            0

| row | exp. | classification | clarifications R1/R2/R3 | affectedDecision R1/R2/R3 |
|---|---|---|---|---|
| HS-A1 | REQ | EXECUTION_CONTAMINATED | 0 / 0 / 0 | — / — / — |
| HS-B1 | REQ | MULTI_STATE_VARIABLE | 1 / 1 / 1 | EXPOSURE / REQUIRED_CONTROL / EXPOSURE |
| HS-C1 | REQ | MULTI_STATE_VARIABLE | 1 / 1 / 1 | REQUIRED_CONTROL ×3 |
| HS-D1 | REQ | MULTI_STATE_VARIABLE | 1 / 1 / 1 | REG_INTERP / REG_INTERP / REQUIRED_CONTROL |
| HS-E1 | REQ | SINGLE_FLIP | 1 / 0 / 0 | REQUIRED_CONTROL / — / — |
| HS-F1 | REQ | MULTI_STATE_VARIABLE | 1 / 1 / 1 | REQUIRED_CONTROL / REQUIRED_CONTROL / EXPOSURE |
| HS-G1 | REQ | MULTI_STATE_VARIABLE | 2 / 1 / 1 | EXPOSURE+RC / RC / APPLICABILITY |
| HS-H1 | REQ | SINGLE_FLIP | 1 / 0 / 0 | REQUIRED_CONTROL / — / — |
| HS-J1 | FORB | MULTI_STATE_VARIABLE | 0 / 0 / 0 | — |
| HS-K1 | FORB | EXECUTION_CONTAMINATED | 0 / 0 / 0 | — |
| HS-L1 | FORB | **STABLE_3_OF_3** | 0 / 0 / 0 | — |
| HS-M1 | FORB | SINGLE_FLIP | 1 / 1 / 0 | RC / RC / — |
| HS-N1 | FORB | MULTI_STATE_VARIABLE | 0 / 0 / 0 | — |
| HS-P1 | FORB | **STABLE_3_OF_3** | 0 / 0 / 0 | — |
| HS-Q1 | FORB | **STABLE_3_OF_3** | 0 / 0 / 0 | — |
| HS-R1 | FORB | MULTI_STATE_VARIABLE | 0 / 0 / 0 | — |

**A labelling caveat that must be read with the table.** The classifier compares six axes —
candidate presence, candidate state, candidate family, clarification presence, affectedDecision and
linkage — and `MULTI_STATE_VARIABLE` is the residual bucket for *any* row that varies on some axis
without being a clarification-presence flip. Several rows in that bucket (HS-C1, HS-J1, HS-N1,
HS-R1) were perfectly stable in clarification behaviour and vary only in candidate state or family.
The clarification-only picture is given separately by the dispersion figures below. The classifier
was frozen before spend and is **not** re-cut here to flatter the result; the naming is disclosed as
a measurement-layer defect to fix in a later operation, not corrected after seeing the data.

Per-axis, THREE-DRAW EMPIRICAL STABILITY — **not** population variance estimates:

    CLARIFICATION_PRESENCE_3_DRAW_STABILITY   13/16
    AFFECTED_DECISION_3_DRAW_STABILITY         9/16
    CANDIDATE_STATE_3_DRAW_STABILITY           4/16
    CANDIDATE_FAMILY_3_DRAW_STABILITY          5/16
    LINKAGE_3_DRAW_STABILITY                  14/16
    CANDIDATE_PRESENCE_3_DRAW_STABILITY       13/16

## 8. Behavioural dispersion (Phase 11) — descriptive only

Distinct observed clarification states per row across the three draws, over the 14 rows not
execution-contaminated:

    rows with 1 observed state   10
    rows with 2 observed states   4
    rows with 3 observed states   0
    MEAN_DISTINCT_STATES_PER_VALID_ROW  1.286

No probability is inferred from three draws.

## 9. HAZARD_SEVERITY (Phase 12)

Counted from raw wire, not from a keyword rule:

| probe | prompt | material | HAZARD_SEVERITY / labelled clarifications |
|---|---|---|---|
| §148 | v11 | v6 | 0 / 5 |
| §149 | v12 | v7 | 1 / 5 |
| §150 | v13 | v8 | 4 / 7 |
| §152 (R1) | v13 | hardened v9 | **0 / 9** |
| §153 (R2) | v13 | hardened v9 | **0 / 6** |
| §154 (R3) | v13 | hardened v9 | **0 / 5** |

Three consecutive draws of the same frozen prompt on hardened material: **0 of 20**. The §151 v14
mechanism remains **unsupported**, and its own pre-registered falsifier has now triggered three
times. The comparison across rows sharpens the earlier reading: the concentration §151 measured
(7 occurrences, 0 correct) came from the §149/§150 fixture material, not from v13's semantics — the
same prompt produces none of it on hardened material. v14 is not implemented, and must not be.

Label usage this draw: EXPOSURE 2, REQUIRED_CONTROL 2, APPLICABILITY 1. Exact match against authored
expected labels on REQUIRED rows: **2/5** (R1 was 4/5, R2 4/5). Confusion, REQUIRED rows only —
expected REQUIRED_CONTROL answered as EXPOSURE ×2 and REQUIRED_CONTROL ×1; expected
REGULATORY_INTERPRETATION answered as REQUIRED_CONTROL ×1; expected APPLICABILITY answered as
APPLICABILITY ×1. A cell is a disagreement, not automatically a model error; per-question
adjudication is a human step and is not performed here.

## 10. Repaired-axis regressions (Phase 13) — observations, not reopenings

| axis | R3 | note |
|---|---|---|
| unsupported settlement | not computed by script; **one observation** | HS-E1's summary converts absence of a stated failure into "properly restored" |
| candidate suppression | 2 rows — HS-E1, HS-K1 | HS-K1 is degenerate execution; HS-E1 is semantic |
| retained-but-not-asked | not computed by script; REQUIRED silent = HS-A1, HS-E1, HS-H1; retention signals 5 | screening aid only, never a gate |
| reasoned-but-destroyed | **0** | 5 emitted on the wire, 5 delivered |
| affectedDecision survival | **1.0** (5/5 on REQUIRED rows) | gate satisfied |
| invalid clarification objects | **0** | |
| raw / normalized linkage | 4 attempts, 0 invalid, 4 normalized-valid, 0 stripped, **reconciled true** | raw capture available; nothing back-inferred |
| accepted invalid linkage | **0** | |
| citations | 0 emitted, 0 accepted, 0 merged, 0 raw-wire citation hits; 2 governed-authority and 4 supplied-record citations redacted pre-render | |
| protected-authority contradictions | **0** | |
| forbidden candidate families | **0** | |
| duplicate candidates | **0** | 27 candidates across 16 rows |
| over-fragmentation | none | no row exceeded 3 candidates; HS-B1 raised two `suspended_loads` candidates plus `fall_protection`, which is within the authored allowance |
| deterministic regression | deterministic covered 0 of 9 truth families, unchanged from §153 | this is the two-taxonomy finding, not a regression |
| arbitration | 0 events, 0 true contradictions emitted, 0 rejected | byte-unchanged |
| protected suites | 21 suites, **0 failures** | see §12 |

## 11. Degenerate output and the post-hoc common-detector diagnostic

This draw: **HS-K1**, summary the literal string `"placeholder"`, zero candidates. Signals
`PLACEHOLDER_SUMMARY` and `ALL_PROSE_IS_PLACEHOLDER`. Denominator loss 1. **No rerun was authorized
or performed**; the row keeps its request, its cost, its raw response and its normalized result, and
is excluded only from view C.

Detector v2 applied retrospectively to the preserved §152 and §153 wire, so execution quality is
comparable across draws. This **overwrites no historical score** — §152 ran with no detector, §153
with v1, and both keep the figures they were scored under:

| draw | degenerate under v2 (post hoc) | as scored at the time |
|---|---|---|
| R1 §152 | HS-A1 (`candidateKey: "placeholder"`) | no detector existed |
| R2 §153 | HS-A1 (`candidateKey: "x"`), HS-K1 | HS-K1 (v1) |
| R3 §154 | HS-K1 | HS-K1 (v2) |

**4 degenerate executions in 48 row-executions — 8.3% — across two distinct rows and all three
draws.** This is the finding that selects the terminal.

Detector v2 changes from v1: two signals added to the existing set, with the two-signal conviction
threshold unchanged — `isNearPlaceholderGarbled` (≥1 strict placeholder lexeme, ≤1 non-filler token,
fewer than 8 tokens) and `isMeaninglessIdentifier` (a single alphanumeric character, or a repeated
character run of ≤4). Three false positives were caught by adversarial tests during construction and
fixed before spend: ordinary keys `c1`/`q1`, an edit-distance near-token rule that was rejected
outright as unfixable, and `"A substantive summary."` reading as garbled because `summary` sat in the
placeholder lexicon. Those three are retained as regression tests. 66 assertions green.

## 12. Verification actually executed

    21 expert protected suites, 0 failures
      ok-line suites: 1,379 assertions
      differently-formatted suites: projection-equivalence 90, cohort-instrument 155,
      execution-budget 66 — all "0 failed"
    SOURCE_PROJECT_TSC (tsc -p tsconfig.json --noEmit): clean, exit 0
    fixture linter after the run: pass, 0 findings
    pre-spend gate: 52/52 at $0.00
    post-spend analysis path proved end-to-end at $0.00 before the run, by replaying the frozen
      §153 artifacts through a scratch copy of the probe in the scratchpad (deleted afterwards)

## 13. Decision (Phase 14) and dominant blocker (Phase 15)

**Terminal: CASE D —** `EXPERT_HAZLENZ_HOSTED_OUTPUT_STABILITY_INCONCLUSIVE —
PROVIDER_OUTPUT_RELIABILITY_REVIEW_REQUIRED`.

CASE A is **factually satisfied on HS-H1** — recurrent failure on authoring-valid material plus a
common causal mechanism demonstrated across three valid draws — and is recorded above with its
remediation target named. It is not the terminal because CASE D's condition better represents what
blocks the next step: 8.3% of executions on frozen material returned degenerate content, and only
3 of 16 rows held every axis across three draws. A semantic repair aimed at HS-H1 could not be
validated through that channel; its effect would be inside the noise.

CASE B does not fit (HS-H1's mechanism does recur). CASE C does not fit (HS-H1 did not recover).
CASE E does not fit — the instrument passed 52/52 pre-spend gates, both integrity checks, and the
linter, and the only measurement-layer defect found is a classifier *name*, disclosed above and
not silently recut.

**Dominant blocker: C — general hosted-output instability.** Not D (instrument integrity): the
instrument is sound and its residual defect is cosmetic. Not A: a stable semantic defect exists on
HS-H1 but is one row against a background of 3/16 whole-row stability. B is present and subsumed by
C — the variance is spread across nearly every row and axis rather than confined to a few rows.

Phase 15 requires, since C dominates, an explicit evaluation of whether Expert reliability should be
addressed through architecture rather than further semantic prompt rules. **Analysis only — nothing
below is implemented, and none of it is authorized by this operation.**

- *Bounded second-pass verification.* Directly addresses the dominant blocker: a second pass over
  the model's own retained unknowns would catch precisely the HS-A1/HS-H1 shape, where the fact is
  already written down and only the relevance verdict is wrong. Cost is roughly a second call on the
  subset of rows carrying a retained unknown — 5 of 16 in this draw, not 16. It does nothing about
  degenerate output unless the pass can detect and re-issue, which this operation did not authorize.
- *Deterministic postcondition checks.* Cheap and well-matched to the degenerate output: a
  postcondition asserting the summary is not a placeholder and that at least one candidate exists on
  a row whose observation states a hazard would have caught all four degenerate executions at zero
  provider cost. It cannot judge relevance, so it does not touch the HS-H1 mechanism.
- *Selective re-query for decision-critical unresolved states.* The narrowest intervention that
  addresses both, but it re-issues requests, and every re-issue must be visible in the attempt ledger
  and the accounting — the no-hidden-retry rule cannot be weakened to accommodate it.
- *Consensus on high-value clarification opportunities.* The three-draw data is the argument for it
  and against it at once: clarification presence agrees 13/16 across draws, so consensus would change
  few outcomes, while candidate state agrees 4/16, so consensus over states would change many. It is
  the most expensive option and its benefit is concentrated where the disagreement is, which is not
  where the customer-facing question is.
- *Fail-closed abstention.* Appropriate for degenerate output — a `"placeholder"` summary should
  never reach a customer — and inappropriate for a retained unknown, where abstention discards the
  very finding the layer exists to produce.

The honest reading is that the two problems want different remedies: a deterministic postcondition
for the output-reliability blocker, and a bounded second pass for the relevance mis-evaluation. That
is an architecture decision for the product owner, not an engineering default, and no part of it is
built here.

## 14. What this evidence does not establish

Three draws do not characterize the provider/model distribution, and nothing here should be read as
a rate. STRICT recall is not computed. Per-question label correctness is not adjudicated. Whether
§149's unsupported-settlement repair is reopened is not decided on one observation. M14 remains
NOT_ATTEMPTED, expanded validation remains NOT AUTHORIZED, and no prompt, contract, arbitration,
fixture or deterministic change was made.
