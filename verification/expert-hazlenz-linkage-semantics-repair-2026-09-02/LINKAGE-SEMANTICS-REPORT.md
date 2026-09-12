# Expert HazLenz — Linkage-Semantics Precedence Repair

**§143. ZERO provider calls. ZERO local-model calls. $0.00. No cohort created, none rerun, no
reserved material opened. Nothing committed, pushed, tagged or deployed. The confirmation probe was
DESIGNED and VALIDATED but NOT EXECUTED.**

Historical results are untouched and remain what they were:

- **FORMAL_EVALUATION_FAIL — NOT ACCEPTED**, `FORMAL_COHORT_SPENT = TRUE`, historical
  `PROVIDER_INVOCATION_COUNT = 195` before and after.
- **§142: `EXPERT_HAZLENZ_HOSTED_LINKAGE_PROBE_FAILED — LINKAGE_CONTRACT_REVISION_REQUIRED`.** That
  terminal stands. Nothing here reclassifies it.

---

## 1. Terminal

```
EXPERT_HAZLENZ_LINKAGE_SEMANTICS_REPAIR_COMPLETE —
BOUNDED_HOSTED_CONFIRMATION_PROBE_AUTHORIZATION_REQUIRED
```

The taxonomy is now mutually exclusive and total (proved over all 16 condition combinations), LP-G3
classifies unambiguously, measurement is opportunity-scoped, and all zero-provider verification is
green.

---

## 2. The exact contradiction in the old taxonomy

v8 listed three linkage cases **without precedence** and wrote into FORBIDDEN:

> *"...or because the question is general PPE, procedure or documentation follow-up..."*

while REQUIRED read:

> *"SET IT when the answer would DIRECTLY DETERMINE, CONTRADICT, QUALIFY or RESOLVE ONE specific
> candidate..."*

**A single question could satisfy both at once, and nothing said which won.** The word carrying the
whole meaning in the FORBIDDEN clause was *general*, and the clause never said so. With no ordering,
a classifier — human or model — could land on either answer for the same input.

§142 measured the cost. On LP-G3 the model asked:

> *"What personal protective equipment, if any, do employees currently wear while decanting from
> these unlabeled drums?"* → linked to `decanting_skin_inhalation_exposure`

against four emitted candidates: three `hazcom` (unlabelled drums, no written program, no SDS — all
about **information**) and one `chemical_inhalation_contact` (the **physical exposure pathway**). PPE
bears on exactly one of those four. The model's own `whyItMatters` named both branches and two
different current actions: PPE in use → *"exposure ... at least partially mitigated"*; none →
*"uncontrolled direct exposure requiring immediate interim action beyond the labeling fix."*

That is a correct model behaviour scored as a violation, and it failed an advancement criterion.

---

## 3. The repaired precedence

**Governing principle, now stated in the type contract, the system prompt and the wire schema:**

> **SPECIFIC SEMANTIC RELATIONSHIP OVERRIDES SUPERFICIAL QUESTION FORM.**

A clarification is classified by the decision relationship it has to an actual emitted candidate —
never by whether its words contain PPE, procedure, documentation, inspection or training. The three
tests are applied **in order** and the first match decides.

**TEST 1 — REQUIRED.** All three must hold:
1. exactly **one** emitted candidate is the direct subject of the missing fact;
2. materially different answers would change **that** candidate's existence, active/current status,
   applicability, required control, exposure characterization, or accepted interpretation;
3. the clarification cannot be interpreted correctly without knowing which candidate it qualifies.

**TEST 2 — ALLOWED.** One candidate is clearly the primary subject and the question materially
refines it, but the question stands on its own and is decision-useful without the link.

**TEST 3 — FORBIDDEN.** Everything else, and only for a **positive reason**: no candidate is the
direct semantic subject; two or more are equally plausible; the question is genuinely row-level; it
concerns a different hazard; the only tie is a shared family; or it is **GENERIC** PPE / procedure /
documentation / training follow-up **with no candidate-specific decision effect**.

**This is not a loosening.** FORBIDDEN still demands a positive reason, the ambiguity rule is
unchanged, and omission remains legal. The change is that the categories can now be told apart. The
`candidateKey` / `relatesToCandidateKey` **mechanism was deliberately not touched** — §142 measured
it working at 4 of 4 with correct referent selection on three competing-candidate rows, so there was
nothing to repair in it.

`EXPERT_PROMPT_VERSION` → **`hazlenz.expert.prompt.v9`**. `EXPERT_ANALYSIS_CONTRACT_VERSION` stays
**`analysis.v2`**: no field added or removed, no enum member moved, no `required` entry changed.

```
system-prompt SHA-256   8f5c7960c559067626f12e239d63b5da2d312c9faf7dd19d329f555cf93b60f9   (v8 was 7f143cb6…)
wire-schema  SHA-256    fc37abc7eef49499655122ac0f09000056a16500fe8bcb4e597e35b2005891b1   (v8 was 614311db…)
```

---

## 4. LP-G3 — prospective classification

```
LP_G3_LINKAGE_TRUTH = REQUIRED
```

Applied to the persisted evidence only, and prospective contract interpretation only — **the
historical probe manifest and result are unaltered.**

| test | finding |
|---|---|
| **(a) exactly one candidate is the direct subject** | **Yes.** PPE bears on `decanting_skin_inhalation_exposure` and on none of `unlabeled_drums`, `no_hazcom_program`, `sds_unavailable` — those three are information-availability failures that PPE cannot affect. One of four. |
| **(b) answers change that candidate's decision** | **Yes.** Required-control determination for that candidate: mitigated versus *"uncontrolled direct exposure requiring immediate interim action"*, in the model's own words. |
| **(c) needs the link to be read correctly** | **Yes.** Beside three hazcom candidates, an unlinked PPE question reads as generic housekeeping; linked, it is unambiguously about the exposure candidate's control status. |

All three hold, so TEST 1 decides and TEST 3's generic-PPE clause is never reached.

**Recorded explicitly, as the authorization requires: the historical criterion-4 failure arose from
INSTRUMENT TRUTH MISCLASSIFICATION, not from a defect in the linkage mechanism.** The §142 terminal
stands unchanged; what changed is that the contract can now decide the case it could not decide then.

---

## 5. Audit of every prior FORBIDDEN label

The §142 manifest labelled **ten of sixteen** rows `FORBIDDEN`. Audited against the persisted run:

| finding | count |
|---|---|
| rows labelled `FORBIDDEN` | **10** |
| of those, carrying a **stated linkage rationale** | **1** (LP-L4 only) |
| of those, applied as a **blanket default** | **9** |
| of those, that emitted **no clarification at all** (no opportunity could arise) | **9** |
| of those, that produced an actual linkage opportunity | **1** (LP-G3 — and it was REQUIRED) |
| **rows that produced a VALID FORBIDDEN opportunity** | **0** |

**Not one row in the whole set produced a legitimate FORBIDDEN opportunity, yet the measure still
reported a violation and failed a criterion.** The FORBIDDEN denominator was empty while its
numerator was not.

**Nine blanket labels corrected**, by introducing the value the taxonomy lacked:

```
LinkageTruth = 'REQUIRED' | 'ALLOWED' | 'FORBIDDEN' | 'NOT_A_LINKAGE_TEST'
```

`NOT_A_LINKAGE_TEST` means *this row makes no linkage claim*. It is excluded from **every** linkage
denominator. `FORBIDDEN` is now a **positive claim that a link would be wrong**, and
`test:expert-confirmation-probe-fixtures` fails the build if any row omits its `linkageRationale` or
if a `FORBIDDEN` row does not state a positive reason (B.1–B.7). **No blanket defaults are possible
in the next set.**

---

## 6. Measurement repair — opportunity-scoped

The one rule: **an opportunity requires an emitted clarification on a row that makes a linkage
claim.** Two things are explicitly *not* sufficient, and both are historical bugs now reproduced and
rejected by self-tests:

- *"the row has a candidate and a clarification"* — §140's broad denominator, which scored a correct
  model 1-of-3 (`C.3`, `C.4`);
- *"the row is labelled FORBIDDEN"* — §142's blanket-label defect (`C.2`).

Counters now reported separately:

```
REQUIRED_LINKAGE_OPPORTUNITIES / _POPULATED / _VALID / _MISSING
ALLOWED_LINKAGE_OPPORTUNITIES / _POPULATED / _VALID
FORBIDDEN_LINKAGE_OPPORTUNITIES / _ATTEMPTS / _ACCEPTED
NO_LINKAGE_OPPORTUNITY_ROWS        NOT_A_LINKAGE_TEST_ROWS
INVALID_LINKAGE_ATTEMPTS           INVALID_LINKAGE_STRIPPED
ARBITRATION_EVENTS
```

Three separations that were previously conflated:

- **ATTEMPTED vs ACCEPTED** — a link the boundary stripped never reached the customer path and is not
  an accepted violation (`C.7`).
- **NO_LINKAGE_OPPORTUNITY vs FORBIDDEN** — a question never asked is a *retention* event, counted
  once, never a linkage failure in either direction (`C.1`).
- **ALLOWED omission** — reported, never scored as a failure (`C.8`).

**The repair narrows the denominator; it does not disarm the measure.** `C.5`/`C.6` prove a genuine
forbidden link on a row that truly owed none is still counted and still blocks `LINKAGE_READY`.

---

## 7. Tests

**`test:expert-linkage-precedence` — 44 assertions, new.**

- **A.1–A.15** the principle, the numbered tests and the ordering are stated in the prompt, the
  schema and the type; FORBIDDEN still demands a positive reason; the ambiguity rule is unchanged;
  omission stays legal; **the candidateKey mechanism is unchanged**.
- **B** the ten enumerated classification cases. The decisive one is **B.PAIR**: two PPE questions,
  *identical in form*, classify oppositely — candidate-specific → REQUIRED, generic → FORBIDDEN. If
  those two ever agree, the taxonomy has collapsed again. **B.EXHAUSTIVE** enumerates all 16
  condition combinations and proves each lands in exactly one category: **total and mutually
  exclusive**, which v8 was not.
- **C.1–C.10** opportunity-scoped measurement, reproducing and rejecting both historical bugs.
- **D.1–D.5** the pre-spend identity rule: a dry run validates all identity material and **does not
  create the live artifact**; live initialization creates it once; a second live write fails with a
  typed error and **the bytes remain unchanged**.
- **M14.1–M14.3** no canonicalization, no permutation claim, rationale recorded.

**`test:expert-confirmation-probe-fixtures` — 42 assertions, new.** Structure, budget within the
authorized envelope, the no-blanket-label rule, the precedence pair, **proof that CL-R3 does not
reuse LP-G3's surface facts** (C.4/C.5), and containment.

**The eight arbitration tests are preserved**, in `test:expert-linkage-contract` C.1–C.10, unchanged.

**Two supersessions, disclosed.** `test:expert-linkage-contract` had (i) an A-section asserting the
v8 linkage *wording* and (ii) a D-section asserting the old linkage counters. Both are now covered
more thoroughly by `test:expert-linkage-precedence`, so that suite hands them over with an in-file
note rather than maintaining a second, drifting set of needles. What stays there is what §141
uniquely established and §143 does not cover: **structural feasibility** (A.13/A.14) and the
link-resolution and arbitration behaviour (B, C). Its count moves 73 → 51 as a result; the 22 moved
assertions are replaced by 44 + 42 new ones.

---

## 8. Verification actually executed

**Zero provider calls. Zero local-model calls. $0.00.**

| suite | §142 baseline | §143 | detail |
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
| `expert-linkage-precedence` | — | **PASS** | 44 passed, 0 failed |
| `expert-confirmation-probe-fixtures` | — | **PASS** | 42 passed, 0 failed |

**33 of 33 previously protected suites PASS, identical line for line to the §142 baseline.** Two new suites add 86 assertions. Total 35 suites, 0 failures. TypeScript (`src/` project) clean — see §8.1 for what that check does and does not cover.

**Four protected assertions were re-anchored v8 → v9**, on the convention those files' own comments
establish: `test-expert-routing-contract` A.2, `test-expert-cohort-instrument` C.17,
`test-expert-remediation-contract` H, `test-expert-projection-equivalence` F.2. **None was
weakened**; each still pins the current authorized version and the content-hash assertions that a
label cannot substitute for are untouched.

### 8.1 A correction to prior reporting

**`tsconfig.json` includes only `src/**/*`, so `tsc -p tsconfig.json` has never typechecked
`backend/scripts/`.** Previous reports in §140, §141 and §142 stated "TypeScript clean" or "static
checks PASS"; **that covered the `src/` project only.** Script-level type errors surface when
`ts-node` executes each suite — which is how every one in this operation was actually caught — but
they were not covered by the check those reports named. `src/` is clean; the scripts are typechecked
by execution.

### 8.2 The §142 probe script is frozen, and that is deliberate

`scripts/probe-expert-hosted-linkage-2026-09-02.ts` **no longer compiles** against the repaired
measures API. It has been left **byte-identical** rather than updated:

```
on disk                      ccb89a92e5968304975067275abe81066cf19058a9ebc6947e16757d19aec29e
recorded in its PRE-SPEND-IDENTITY.json   ccb89a92e5968304975067275abe81066cf19058a9ebc6947e16757d19aec29e
```

Editing it would break the correspondence between the spent evidence and its recorded identity —
precisely the defect §141 closed. It is a spent, single-use instrument that must never run again
(its write-once identity artifact already exists and would refuse a second run), and the same
convention already applies to `execute-formal-cohort-65.ts`. **Recorded as known debt: it is
non-compiling by design, and a future scripts-wide typecheck must exclude spent probe scripts rather
than "fix" them.**

---

## 9. LP-B2 — preserved, untouched

```
LP-B2 = GENUINE TRUE-GAP RETENTION MISS
```

Truth unchanged (`APPLICABILITY`, one authored gap). **No worked example resembling it was added, and
no wording targeting its surface condition was written.** `test-expert-confirmation-probe-fixtures`
B.10 asserts its truth is unchanged. It is recorded as evidence for the future expanded validation
phase, and the next probe's TRUE-GAP bar is deliberately **1 of 2** because broad
clarification-retention validation is **intentionally deferred** — asserted at A.14 so the narrow
probe cannot later be read as having closed it.

---

## 10. Next hosted confirmation probe — designed, NOT executed

`fixtures/linkage-confirmation-probe-v3.ts`. **Nine rows, one arm. Not run.** Execution requires its
own authorization.

| row | linkage truth | why |
|---|---|---|
| `CL-R1` | REQUIRED | isolation question determines one LOTO candidate; an atmospheric candidate competes |
| `CL-R2` | REQUIRED | booth/collector isolation determines the fire-explosion candidate, not the dust one |
| **`CL-R3`** | **REQUIRED** | **the precedence test** — respiratory protection during one specific booth-cleaning task, uniquely qualifying the inhalation-exposure candidate. Control/PPE-shaped in form; REQUIRED by TEST 1 |
| `CL-F1` | FORBIDDEN | **ambiguous referent** — two presses, same family, same state, one question |
| `CL-F2` | FORBIDDEN | **different hazard** — eyewash inspection vs a parked lift; shared location only |
| **`CL-F3`** | **FORBIDDEN** | **genuinely generic PPE** — a missing PPE matrix across three workstations, changing no single candidate's decision |
| `CL-N1` | NOT_A_LINKAGE_TEST | makes no linkage claim; also the NO-GAP silence control |
| `CL-T1` | ALLOWED | general positive clarification control |
| `CL-T2` | ALLOWED | second positive control, unrelated family, incidental unrelated-governed-record check |

**CL-R3 and CL-F3 are the pair the whole operation turns on.** If a model links on both, or on
neither, the precedence rule has not landed. **CL-R3 shares no surface facts with LP-G3** — different
industry, families and question — because the rule is what is under test, not the row.

```
target logical calls   9        hard request ceiling  12        hard spend ceiling  $2.00
one arm (BASE)                  max one retry per logical call, frozen causes only
```

12 requests priced at the frozen worst case is $1.248, within the $2.00 ceiling (A.12).

**Frozen development criteria** (in the manifest, so they cannot be chosen after seeing the result):
REQUIRED ≥3/3 valid; **0** accepted forbidden links across all three dedicated controls; **0**
unresolved bad keys accepted; no forced link where no opportunity exists; TRUE-GAP ≥1/2 *(broad
retention validation intentionally deferred)*; NO-GAP no meaningful regression from v8; arbitration
natural-opportunity-only, **zero events is not a failure**.

---

## 11. Hosted arbitration status

```
ARBITRATION_LIVE_STATUS = NO_NATURAL_OPPORTUNITY (unchanged)
```

**Zero `HAZARD_EXISTENCE` clarifications across 32 hosted calls in two probes.** Arbitration remains
**deterministically proven** (`test:expert-linkage-contract` C.1–C.10) and **hosted-unexercised**. A
contradiction is a model error, must arise naturally, and **was not manufactured here**. This
operation does not change that status and does not claim to.

---

## 12. Remaining unknowns

1. **Whether v9 changes model behaviour at all.** Everything here is verified deterministically. No
   hosted evidence exists under the new hashes.
2. **Whether CL-F3 is genuinely generic to the model.** It is generic by construction and by the
   authored key, but "would a competent reader see one referent or none" is the judgement the fixture
   tests, and a fixture cannot validate its own premise.
3. **Hosted arbitration is still unexercised**, and cannot be closed without the model making the
   error.
4. **LP-B2's miss is unrepaired and unexplained**, by instruction.
5. **A fifth instrument defect of this family could still be present.** Four have now been found —
   three measurement-scope errors and one labelling default — two of them only after spending.
6. **`crossHazardInsights` precision** remains open and untouched since §140.
7. **M14 remains causally unresolved.**

---

## 13. Confinement

```
provider calls 0     local-model calls 0     cost $0.00
historical PROVIDER_INVOCATION_COUNT      195 before, 195 after
frozen formal artifacts                   BYTE-IDENTICAL
§140 / §141 / §142 evidence               BYTE-IDENTICAL (11 artifacts verified)
§142 spent probe script                   BYTE-IDENTICAL, hash matches its recorded identity
LP-G3 prospective classification          REQUIRED (historical result NOT altered)
blanket FORBIDDEN labels corrected        9 of 10
LP-B2                                     GENUINE TRUE-GAP RETENTION MISS, truth unchanged
reserved material                         not opened
formal cohort                             spent, unmodified, not rerun, not mimicked
new formal cohort                         NONE
M14_REMEDIATION_STATUS                    NOT_ATTEMPTED
formal scorer / truth / thresholds        UNCHANGED
hosted confirmation probe                 DESIGNED, NOT EXECUTED
production / database / customer          NONE
commit / push / tag / deploy              NONE
```

No formal acceptance is declared. The formal evaluation remains **FORMAL_EVALUATION_FAIL — NOT
ACCEPTED**, and the §142 probe terminal remains
**`EXPERT_HAZLENZ_HOSTED_LINKAGE_PROBE_FAILED — LINKAGE_CONTRACT_REVISION_REQUIRED`**.
