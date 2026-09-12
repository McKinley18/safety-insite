# §204 — POST-RECORDING CLOSURE AFTER BATCH `204-A-SF08`

Written 2026-09-07, immediately after the ten authorized SF-08 judgments were recorded through
`record-204-adjudication-verdicts.ts` with `PRODUCT_OWNER` attribution.

**STATUS.** Synthesis of already-recorded results. Supplies no verdict, implies no verdict, and
pre-commits no open product-owner decision. Sequential adjudication is STOPPED. U10, U13, U14,
U18, U19 and the fourteen non-selected SF-08 slots are not presented here.

---

## 1. UPDATED HEADLINE COUNT

| | |
|---|---|
| SUPPLIED | **74 / 120** |
| REMAINING | **46 / 120** |
| Supplementary (deferred by §202 product-owner decision) | 0 / 66 |
| Excluded by product-owner decision (SG-01 / SG-02 row axes) | 8 |

Batch `204-A-SF08` applied 10 verdicts and 3 additives (U15, U16, U17 `reviewerNotes`). The
recorder reported the count above; it was not recomputed independently.

**Where the 46 sit.** SF-08 residual 14 (U15 `B`, `I`; U16 nine of ten; U17 `D`, `F`, `G`);
U10 (SF-05) 4; U13 (SF-07) 4; U14 (SF-07) 10; U18 (SF-11) 4; U19 (SF-11) 10.

---

## 2. CONSOLIDATED SEMANTIC DEFECT / SUCCESS REGISTER

Every entry names the cases it rests on and the cases that do not replicate it. Nothing here is
generalized beyond the adjudicated cases.

### 2.1 Successes recorded

| # | Success | Cases | Non-replicating / contrary cases |
|---|---|---|---|
| S1 | Clean single-fact recall, precision and projection on `SINGLE_REAL_UNRESOLVED_FACT` + `NEARBY_PROPERTY_COMPETITION` | SF-01 (U01 all-CORRECT, U02 all-CORRECT) | SF-07 (U13/U14) is the unadjudicated replicate |
| S2 | Clean false-gap suppression on `NO_REAL_GAP` rows | SF-03 (U03), SF-12 (U12 `I`=CORRECT, `B`=CORRECT) | SF-04 (U06 `B`=INCORRECT, `I`=INCORRECT) |
| S3 | Verifier target binding held on every adjudicated projected fact | U02, U05, U07, U09, U17 — all `L`=CORRECT | none |
| S4 | Conjunctive decomposition preserved both conjuncts through admission | SF-08 (U15 `A`=CORRECT, `H`=CORRECT) | the only `CONJUNCTIVE_FACT` row in the instrument; unreplicated |
| S5 | Exact owed-property identification on the capacitor-discharge conjunct | SF-08 U16 `C`=CORRECT | its sibling U17 `C`=PARTIALLY_CORRECT |

### 2.2 Defects recorded

| # | Defect mechanism | Stage it originates | Cases | Non-replicating cases |
|---|---|---|---|---|
| F1 | Independent multi-gap loss — a row with two genuinely independent unresolved facts did not carry both | first pass | SF-02 (U04-CORRECTION `A`=INCORRECT, `H`=INCORRECT) | SF-08 (U15 `H`=CORRECT) is the contrary case |
| F2 | Unsupported adverse counterfactual inflation — a decision-neutral unknown promoted to a decision-critical owed fact | first pass | SF-04 (U06 `B`/`I`=INCORRECT; U07 `F`=INCORRECT, `G`=INCORRECT, `E`=PARTIALLY_CORRECT) | SF-03, SF-12 clean |
| F3 | Temporal-qualifier loss with downstream clarification insufficiency | projection, then clarification | SF-06 (U09 `M`=INCORRECT, `Q`=CLARIFICATION_INSUFFICIENCY, `E`/`F`=PARTIALLY_CORRECT) | U02, U05, U07, U17 all `Q`=NO_OBSERVABLE_LOSS |
| F4 | **Incomplete semantic partition of the declared property** — the A/B branch pair omits a materially plausible third state ("control performed but the safety state was not established") | **first pass, at declaration time** | SF-08 U17 (`C`, `E`=PARTIALLY_CORRECT) | U16 `C`=CORRECT on the sibling conjunct; U16 `E` unadjudicated |
| F5 | **Clarification resolves performance, not result** — wording distinguishes imperfectly between a test performed *for the purpose of* confirming a state and a test that *confirmed* it | clarification | SF-08 U17 (`M`=PARTIALLY_CORRECT) | distinct in severity and mechanism from F3; U02, U05, U07 `M`=CORRECT |
| F6 | Deterministic priority floor materially understates safety significance | projection / floor policy | `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` on U02, U05, U09, U17 (4 of 5 adjudicated) | U07 `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` |

**Safety-classification distribution so far:** `PLAUSIBLY_LIFE_CRITICAL` on U05, U09, U17;
`ORDINARY_NON_ESCALATING` on U02, U07.

**Affected-decision coverage:** five projected facts adjudicated — four `REQUIRED_CONTROL`
(U05, U07, U09, U17), one `HAZARD_SEVERITY` (U02), plus one `REQUIRED_CONTROL` partially
adjudicated (U16 `C` only). **No `FP.EXPOSURE` fact has been adjudicated.**

---

## 3. WHAT SF-08 DEMONSTRATES

**Answer: clean compound-property preservation, accompanied by a separately-classed defect that
is not compound-property loss — with one stated evidence limit.**

1. **Not broader compound-property loss.** The conjunctive safety condition was decomposed into
   two separately resolvable declarations — a representation the frozen design explicitly allows
   — and both conjuncts survived independently from first-pass declaration through admission
   (U15 `A`=CORRECT, `H`=CORRECT). Two projected facts exist for the row. Neither conjunct was
   dropped, merged, or collapsed into the other.
2. **Not a replication of SF-06's temporal/sequence-specific loss.** SF-06's mechanism was an
   explicit temporal qualifier present in `missingFact`, absent from the projected `OwedFact`,
   followed by a clarification that could be answered YES while the declared property stayed
   unresolved. On SF-08, `missingFact` is likewise absent from both projected `OwedFact`s, yet
   the recorded judgment for the voltage-test fact is `Q`=NO_OBSERVABLE_LOSS: the evidence span,
   branch A's de-energized-state requirement, branch B, and the clarification's after-isolation
   and before-work scope carried the semantics forward, and the verifier stayed bound (`L`=CORRECT).
3. **The SF-08 defect is intra-conjunct partition incompleteness, located before projection.**
   U17's omitted state — a voltage test performed that did *not* establish a de-energized
   condition — is absent from the first-pass semantic declaration itself. The recorded product-owner
   reasoning states expressly that restoring `missingFact` alone would not cure it. This is
   therefore a declaration-stage semantic-completeness defect, not a projection-stage
   compound-property loss, and it is classed separately (F4) from F1 and F3.
4. **Evidence limit, stated rather than buried.** This reading rests on U15 (4 axes, 2 recorded)
   and U17's eight recorded axes. **U16's `Q_OWED_PROPERTY_LOSS_IMPACT` is unadjudicated**, so
   "SF-08 shows no observable projection loss" is established for one of the row's two projected
   facts, not both. SF-08 is also the instrument's only `CONJUNCTIVE_FACT` row; the S4 success is
   unreplicated and must not be read as proof that conjunctive decomposition is universally correct.

---

## 4. RESULTING FUNCTIONAL REMEDIATION REQUIREMENTS

Derived from §2. Each names the defect it answers and the stage it acts on. None of these is a
representation change; none is authorized here.

| ID | Requirement | Answers | Stage acted on |
|---|---|---|---|
| **RR-1** | Independent-gap enumeration: where a row contains genuinely independent unresolved facts, each must be declared separately and survive to admission. SF-08 shows the decomposition path works when taken. | F1 | first pass |
| **RR-2** | Decision-neutrality gate before promotion: an unknown may become a decision-critical owed fact only where a genuine material decision difference exists. Adverse counterfactual branches must not be invented to manufacture that difference. | F2 | first pass |
| **RR-3** | **Branch-partition completeness:** the branch set must exhaust the plausible resolution states of the exact declared property. Specifically, for any verification-type control, "control performed but the required safety state was NOT established" is a distinct state from "performed and established" and from "not performed", and must be representable. | **F4 (new)** | first pass |
| **RR-4** | Property-faithful clarification wording: a clarification must be checked against the exact declared property — including temporal qualifiers (`before` X) — not merely against its topic. A clarification answerable YES while the declared property remains unresolved is insufficient. | F3 | clarification |
| **RR-5** | **Result-not-performance clarification:** where the owed property is that a control *achieved* a safety state, the clarification must establish both that the control was performed and what it showed. | **F5 (new)** | clarification |
| **RR-6** | Priority-floor escalation policy: 4 of 5 adjudicated facts carry `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE`, three of them `PLAUSIBLY_LIFE_CRITICAL` projected at priority `OTHER`. **This remains diagnostic measurement only.** It authorizes no priority-policy mutation and grants no provider escalation authority; it is input to D14, which stays open. | F6 | floor policy (D14) |

**Not a requirement on this evidence:** a dedicated owed-property field on `OwedFact`. One
observation of projection loss with downstream harm (SF-06) against four `NO_OBSERVABLE_LOSS`
observations (U02, U05, U07, U17) does not establish that remedy, and both the U09 and U17
records carry the product owner's explicit bar on that inference.

---

## 5. CAN ANY DEFERRED UNIT STILL MATERIALLY CHANGE §4?

**Yes — two can, one might, one cannot.**

- **CAN: U16's nine remaining slots (SF-08, `D` `E` `F` `G` `L` `M` `Q` `R_SAFETY` `R_FLOOR`).**
  U16 is the only remaining place where a second `Q ≠ NO_OBSERVABLE_LOSS` observation could arise
  under an explicitly conjunctive design. A `Q` other than `NO_OBSERVABLE_LOSS` there would give
  F3 its second, non-temporal case and would materially strengthen the evidentiary basis for a
  representation remedy — the exact question D08/D15 turn on. A `Q`=NO_OBSERVABLE_LOSS would
  leave F3 unreplicated at 1 of 6.
- **CAN: U18 + U19 (SF-11, 14 slots).** The only `EXPOSURE_DECISION` row, the only
  `NOT_OBSERVED_IS_NOT_ABSENT` row, and the only `FP.EXPOSURE` projected fact. Every recorded
  finding rests on `REQUIRED_CONTROL` or `HAZARD_SEVERITY`. U19 is the only unit that can show
  whether RR-2 through RR-6 hold across the exposure family or are specific to the
  affected-decision types adjudicated so far. It can also produce a third data point on RR-3.
- **MIGHT: U10 (SF-05, 4 slots).** The only row whose sole declaration was structurally refused,
  and therefore the only headline measurement of row-level recall and precision under a refused
  declaration. It can add a requirement about refusal-path behaviour; it cannot disturb RR-1
  through RR-6, since SF-05 has no projected fact.
- **CANNOT MATERIALLY: U13 + U14 (SF-07, 14 slots).** Pure replicate of SF-01's family
  combination, which is recorded all-CORRECT. It can strengthen or disturb S1, but is not
  positioned to open a question that is currently unanswerable, and is not positioned to change
  any of RR-1 through RR-6.

---

## 6. DO D08 / D15 NOW HAVE SUFFICIENT EVIDENCE?

**D08 — the three sub-questions: YES, and they never depended on this evidence.** Prototype
retire-vs-replay-substrate, `COVERAGE_DECISION_FORBIDDEN_INPUTS` restoration, and the fate of the
eight prototype importers are structural questions about which implementation survives. No
semantic adjudication result bears on any of them. They are rulable now, and the §202 drift
tripwire holds the two copies in the meantime.

**D08 — "which owed-fact implementation is canonical", and D15 — the representation choice:
PARTIALLY. The option space has narrowed; a final choice is not yet evidence-supported.**

What the recorded evidence now supports:

- **O2 (`OwedFact.owedProperty` required) is not evidence-required.** It is already structurally
  `NOT MET` on R4 (backward compatibility) in §201's matrix, and the semantic record does not
  supply the countervailing necessity: 1 of 5 adjudicated facts shows projection loss with
  downstream harm, and the U17 record states explicitly that restoring the field would not have
  cured that fact's defect.
- **The two most consequential defects are not representation defects at all.** F2 and F4
  originate in the first-pass declaration; F3 and F5 are clarification-wording defects. RR-1
  through RR-5 are satisfiable without mutating the `OwedFact` contract.
- Consequently the low-migration, backward-compatible options — **O4 (declaration-reference
  sidecar)** and **O5 (additive `OwedFactV2` successor)** — remain the live candidates, together
  with **O1 (unchanged)** if the sidecar is judged unnecessary.

What is still missing before D15 can be ruled on evidence rather than on preference:

1. **U16's `Q`** — the only remaining chance for a second projection-loss observation on the
   conjunctive row.
2. **U19's `Q` and `M`** — the only `FP.EXPOSURE` fact; every loss judgment to date is drawn from
   `REQUIRED_CONTROL`/`HAZARD_SEVERITY` facts.

If both come back `NO_OBSERVABLE_LOSS`, the loss ratio stands at 1 of 7 and the evidence-honest
reading is that no contract mutation is warranted — O1 or O4. If either shows loss, F3 replicates
outside the temporal family and O4/O5 become the discriminating choice, decided on migration
burden and hash-pin consequence rather than on semantics.

**D15 should still be decided with D08, as the register prescribes.**

---

## 7. SHORTEST EVIDENCE-HONEST PATH TO IMPLEMENTATION AND A FRESH ACCEPTANCE COHORT

Seven steps. Steps 1 and 2 are parallel; nothing below is authorized by this document.

1. **Close the residual discriminating set — 23 slots, not 46.** U16's remaining 9, then U18 (4)
   and U19 (10). That reaches **97 / 120** and closes both questions named in §6. Defer U10 (4),
   U13 (4) and U14 (10) — 18 slots that cannot materially change RR-1 through RR-6. Each unit
   stays independently recordable through the existing append-only machinery, so the set can be
   stopped at any point without leaving a partial unit.
2. **Rule D08's three structural sub-questions now**, in parallel with step 1, since they do not
   depend on step 1's outcome. This unblocks D10 sequencing.
3. **Rule D15 immediately after step 1**, using the decision rule stated in §6: no contract
   mutation if the loss ratio stays at 1, O4-vs-O5 on migration burden if it does not.
4. **Implement RR-1 through RR-5 as first-pass and clarification-stage changes**, not
   representation changes. All four established defect mechanisms (F1–F5) are reachable there.
   RR-6 stays measurement-only pending D14.
5. **Preregister a fresh cohort before running anything.** The §199 twelve are now a remediation
   target and cannot serve as their own acceptance evidence — any post-remediation pass on those
   rows measures fitting, not capability. The new cohort must cover, with new rows, at minimum:
   `MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS` (F1), `NO_REAL_GAP` paired against a decision-neutral
   unknown (F2), `TEMPORAL_SCOPE` (F3), `CONJUNCTIVE_FACT` carrying a verification-type property
   with a genuine third state (F4/F5), and `EXPOSURE_DECISION` (coverage gap).
6. **Run the fresh cohort against the same frozen instrument and the same axis vocabulary**, so
   pre- and post-remediation results are comparable, and score deterministically first.
7. **Adjudicate the fresh cohort under the same append-only, `PRODUCT_OWNER`-attributed
   machinery.** Only that record can support an acceptance claim. Until it exists, every quality
   statement remains scoped to the §199 cohort.

---

## 8. AUTHORITY

Sequential semantic adjudication remains STOPPED. No further review unit is presented and none is
authorized automatically. No priority-policy mutation, no provider escalation authority, no
representation choice, and no cohort run is authorized by this document.
