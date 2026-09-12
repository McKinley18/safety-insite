# Expert HazLenz — v9 Bounded Hosted Linkage Confirmation Probe

**§144. ONE bounded hosted DEVELOPMENT confirmation probe against the v9 precedence contract.
9 logical calls, 9 provider requests, 0 retries, $0.369354 of a $1.248 enforced ceiling.**

**Not a formal evaluation, not a new formal cohort, not a rerun of the spent cohort, not an
acceptance run, not an M14 experiment, not a broad clarification-recall evaluation, not a
crossHazardInsights campaign.** No frozen scorer ran. No formal measure was computed. No formal gate
status is claimed.

Historical results are untouched: **FORMAL_EVALUATION_FAIL — NOT ACCEPTED**,
`FORMAL_COHORT_SPENT = TRUE`, historical `PROVIDER_INVOCATION_COUNT = 195` before and after. No
reserved material was opened. No spent-cohort row was read or mimicked. The spent §142 probe script
was not edited.

---

## 1. Terminal

```
LINKAGE_V9_HOSTED_CONFIRMATION = FAIL_FORBIDDEN_LINKAGE

EXPERT_HAZLENZ_V9_LINKAGE_CONFIRMATION_FAILED —
LINKAGE_SEMANTICS_OR_MODEL_BEHAVIOR_REVIEW_REQUIRED
```

**Three of four linkage criteria pass, and the headline result is strong:**

- **REQUIRED linkage: 3 of 3 opportunities populated and valid** — including CL-R3, the
  control/PPE-shaped question that v8 could not classify and that this whole repair line exists for.
- **0 invalid or unresolved candidate keys.**
- **No forced linkage** on the `NOT_A_LINKAGE_TEST` row.

**One criterion fails: `FORBIDDEN_LINKAGE_ACCEPTED = 1`**, on `CL-F1`, the ambiguous same-family
control. §5 diagnoses it. **Fixture truth was not reinterpreted after spend**, so the failure stands
as measured, and the terminal names review of *either* the semantics *or* the model behaviour —
because §5 shows the honest answer is neither of those alone.

---

## 2. Confinement

```
historical PROVIDER_INVOCATION_COUNT   195 before, 195 after
provider requests this operation       9 (9 logical calls, 1 arm, 0 retries, 0 suppressed)
spend                                  $0.369354    enforced ceiling $1.2480    authorized $2.00
tokens                                 115,067 in / 13,922 out
latency                                9,809 – 27,789 ms per call
model identity                         anthropic / claude-sonnet-5, bound pre-spend, verified per response
prompt / contract                      hazlenz.expert.prompt.v9 / hazlenz.expert.analysis.v2
system-prompt SHA-256                  8f5c7960c559067626f12e239d63b5da2d312c9faf7dd19d329f555cf93b60f9
wire-schema  SHA-256                   fc37abc7eef49499655122ac0f09000056a16500fe8bcb4e597e35b2005891b1
normalization SHA-256                  a12b478d80111ac570d1f7660f7f119dc86def251045520ee5fa17522dca1d9b
contract-types SHA-256                 fec3fd5fea5514929717258178883b7b63f7a4f73b4bf5a7d7412bee88bbdfdd
fixture-manifest SHA-256               888bb8b02553ae2cbaba0da0a06b2b64ab81e543cf7b102ad8e0b9ed19a757b8
probe-script SHA-256                   recorded in PRE-SPEND-IDENTITY.json
reserved material                      NOT OPENED
spent formal cohort                    NOT read, NOT reused, NOT mimicked
spent §142 probe script                NOT edited
new formal cohort                      NONE
M14_REMEDIATION_STATUS                 NOT_ATTEMPTED
formal scorer / truth / thresholds     UNCHANGED
production / database / customer       NONE
commit / push / tag / deploy           NONE
```

Spend ceiling is the lower of the two allowed: 12 requests at the frozen worst case ($0.104) is
$1.248, below the authorized $2.00. Enforcement is prospective.

---

## 3. Phases 0–2 — pre-spend gate, tooling, and identity

**27 of 27 gate checks passed at $0.00** before a provider object was constructed, plus H.3 proved on
the live artifact afterwards.

| | |
|---|---|
| Protected suites before spend | **35 of 35 PASS** |
| `SOURCE_PROJECT_TSC` | **PASS** |
| `CONFIRMATION_PROBE_SCRIPT_EXECUTABLE` | **TRUE** |

**The tooling qualification is honoured, not glossed.** `tsc -p tsconfig.json` covers `src/**/*`
only. It does **not** compile `backend/scripts/`. So the two are reported as separate facts:
`SOURCE_PROJECT_TSC = PASS`, and separately a zero-provider execution of the *actual* v9 probe
entrypoint which imported the repaired API, parsed the frozen manifest, built all nine inputs, built
the measurement structures, exercised identity validation, and **made zero provider calls and created
zero artifacts**. A direct script-level compile of the probe file reported **zero errors in the probe
script** (the 30 diagnostics it surfaces are all in `src/safescope-v2/dto/classify.dto.ts`, from
decorator handling under ad-hoc `--strict` flags the project config does not use).

**A new script was written rather than repairing the spent one.** `probe-expert-hosted-linkage-2026-09-02.ts`
is byte-identical and untouched; gate check B.1 proves the v9 script does not import it.

### Identity, write-once

- **DRY RUN does not create the live artifact** — verified: after the rehearsal the output directory
  was empty.
- **First live initialization creates it once.**
- **Second write refuses and the bytes are unchanged** — gate H.3, proved on the live artifact:
  `sha256 893e01a6… stable`.

---

## 4. Phases 6–7 — persistence and linkage

```
records on disk 9   parse problems 0   completeness problems 0
sha256          1d344c44fff801d3c6259540543d8fc9a85e2a767bbd2d5151f99c6ae6892ce6
mid-run proof   CL-R1 read back FROM DISK with 8 calls still outstanding — provenBeforeExit = true
```

| readout | value |
|---|---|
| `REQUIRED_LINKAGE_OPPORTUNITIES` | **3** |
| `REQUIRED_LINKAGE_POPULATED` | **3** |
| `REQUIRED_LINKAGE_VALID` | **3** |
| `REQUIRED_LINKAGE_MISSING` | **0** |
| `ALLOWED_LINKAGE_OPPORTUNITIES` / `_POPULATED` / `_VALID` | 2 / 2 / 2 |
| `FORBIDDEN_LINKAGE_OPPORTUNITIES` | **1** |
| `FORBIDDEN_LINKAGE_ATTEMPTS` | **1** |
| `FORBIDDEN_LINKAGE_ACCEPTED` | **1** |
| `NOT_A_LINKAGE_TEST_ROWS` | 1 |
| `NO_LINKAGE_OPPORTUNITY_ROWS` | 2 |
| `INVALID_LINKAGE_ATTEMPTS` / `_STRIPPED` | **0** / 0 |

### The REQUIRED result — 3 of 3, with the right referent every time

| row | question | link | candidate set | verdict |
|---|---|---|---|---|
| **CL-R1** | *"Has the pump's… "* isolation at the motor control centre | `cand-loto` | 2 candidates | **correct referent** |
| **CL-R2** | was the booth/collector isolated | `fire-explosion-vent-defeated` | 2 candidates | **correct referent** |
| **CL-R3** | **what respiratory protection was worn inside the booth** | `cand-resp-protection-unknown` | **3 candidates** | **correct referent** |

**CL-R3 is the row this repair line exists for.** Under v8 a PPE-shaped question collided with the
"general PPE follow-up" clause and would have been scored a FORBIDDEN link. Under v9, TEST 1 runs
first, the question uniquely qualifies one of three emitted candidates, and **the model linked it.**
Its generic counterpart **CL-F3 emitted no clarification and no link at all.** The precedence pair
behaved as designed: identical question FORM, opposite outcome.

---

## 5. Phase 8 — the one failed criterion, diagnosed

`CL-F1` — the ambiguous same-family control. Observation: two trim presses, both running with light
curtains muted, mute override key left in each panel, and *"the observation does not record whether
either machine has been through the site muting-authorisation process."*

**The authored FORBIDDEN rationale was:** *"ambiguous referent. Two presses of the same family in the
same state, and the authorisation question applies to both identically. There is no unique candidate
to name."*

**What the model actually emitted:**

| candidate | family | state |
|---|---|---|
| `muted_light_curtains` | machine_guarding | ACTIVE |
| `mute_key_left_in_panel` | machine_guarding | ACTIVE |
| **`unverified_muting_authorisation`** | **training_procedure_supervision** | **INSUFFICIENT_EVIDENCE** |

and the clarification — *"Has either the east or west trim press actually completed the site
muting-authorisation process…?"* — was linked to **`unverified_muting_authorisation`**.

**The model did not decompose the row per press. It decomposed it per DEFECT**, and in doing so it
raised a candidate that *is* the authorisation gap itself. Against that candidate set the link
satisfies all three REQUIRED conditions: exactly one candidate is the direct subject (the two
guarding candidates are about the physical guard state, which the authorisation answer does not
change); the two answers change that candidate's status, which the model wrote out in full
(*"authorised → verify compensating measures and key control; never authorised → uncontrolled defeat
of point-of-operation guarding… presses should be stopped"*); and among three candidates the link is
needed to read the question correctly.

**So the fixture's FORBIDDEN premise was conditional on a candidate decomposition the model did not
produce.** The ambiguity was constructed at the level of *two instances of one thing*; the model never
created two instance-candidates, so the "two identical referents" situation never materialised.

**This is reported as a failure, not reclassified.** `FORBIDDEN_LINKAGE_ACCEPTED = 1` and
`LINKAGE_V9_HOSTED_CONFIRMATION = FAIL_FORBIDDEN_LINKAGE` stand exactly as measured, because fixture
truth must not be reinterpreted after spend. What the diagnosis adds is the reason the review is
needed and what it should consider:

> **A FORBIDDEN-ambiguity fixture's premise depends on the model's candidate decomposition, which the
> fixture cannot control.** This is structurally the same limitation already accepted for
> arbitration — a contradiction cannot be commissioned — and it may mean *ambiguous-referent* FORBIDDEN
> controls cannot be reliably commissioned either. That is a product-owner decision about what the
> FORBIDDEN measure can honestly be, not something to settle by relabelling a row.

**The FORBIDDEN denominator remains thin, and that is the second finding.** Of three dedicated
FORBIDDEN controls, **two emitted no clarification at all** (CL-F2, CL-F3), so only one produced an
opportunity. §142 had 0 of 10; §144 has 1 of 3. Better, still not enough to characterise FORBIDDEN
behaviour.

---

## 6. Phase 9 — clarification behaviour (narrow, not a recall probe)

| readout | value |
|---|---|
| total clarifications, 9 rows | **6** |
| average per call | **0.667** |
| TRUE-GAP controls with a question | **5 of 5** |
| TRUE-GAP with the authored `affectedDecision` | 4 of 5 |
| NO-GAP / `NOT_A_LINKAGE_TEST` rows silent | **1 of 1** |
| duplicate questions | 0 |
| exposure/severity/control coverage template | **0 rows** |

`affectedDecision`: `REQUIRED_CONTROL` 3, `EXPOSURE` 2, `HAZARD_SEVERITY` 1, others 0.
Outcomes: `ANALYZED` 8, `NOTHING_TO_ADD` 1 (CL-N1, all collections empty).

**No LP-B2-like retention weakness appeared** — all five clarification-positive controls produced a
question. **This must not be read as closing broad clarification recall**: five controls on nine rows
is a narrow check, and broad retention validation remains **intentionally deferred**. **The prompt was
not tuned during this operation.**

---

## 7. Phases 10–12 — arbitration, governed/citation, coverage

```
ARBITRATION_LIVE_STATUS = NO_NATURAL_OPPORTUNITY     events 0
```

**Zero `HAZARD_EXISTENCE` clarifications** across the probe, so no contradiction arose and nothing was
arbitrated. Per the authorization this is acceptable and **no contradiction was fabricated**.
Arbitration remains deterministically proven and hosted-unexercised — now across **41 hosted calls in
three probes**.

**Citation regression — clean.**

| readout | value |
|---|---|
| `INPUT_CITATION_SHAPED_COUNT` | **0** |
| `EXPERT_OUTPUT_CITATION_SHAPED_COUNT` | **0** |
| `ACCEPTED_CITATION_COUNT` | **0** |
| `MERGED_CITATION_COUNT` | **0** |
| supplied record fields carrying a citation pre-render | 1 — redaction exercised |
| governed-authority block (context, not a defect) | 1 |

`UNSUPPORTED_ACCEPTED_CITATIONS = 0`. `UNSUPPORTED_MERGED_CITATIONS = 0`.

**Governed control:** CL-T2 carried an APPROVED respiratory-protection record against a hot-work
observation. The model **referenced no record handle and asserted no governed obligation** — correct
abstention against an unrelated record. No forbidden hazard family was emitted on any row.

**Additive coverage — no misses.**

| readout | value |
|---|---|
| truth-present families | 11 |
| deterministic coverage | 2 |
| **additive Expert coverage** | **9** |
| **combined coverage** | **11 of 11** |
| **truth-present misses after union** | **0** |
| Expert-only families supplied | 17 |

The deterministic layer covered only 2 of 11 on this material; **Expert supplied the other 9**. That
is the additive contract doing exactly what it exists for, and it is why coverage must never be
measured against Expert alone.

---

## 8. Phase 13 — M14

```
M14_REMEDIATION_STATUS = NOT_ATTEMPTED
```

One arm, asserted at gate D.2 against the requests actually built. No permutation, no same-input
replicate, no order-sensitivity conclusion, no reliability conclusion. **This probe says nothing about
M14.**

---

## 9. Phase 14 — post-probe verification

| suite | before probe | after probe | detail |
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
| `expert-linkage-precedence` | PASS | **PASS** | 44 passed, 0 failed |
| `expert-confirmation-probe-fixtures` | PASS | **PASS** | 42 passed, 0 failed |

**35 of 35 PASS before the first request and after the last, identical line for line.**

Reported separately, as required:

```
SOURCE_PROJECT_TSC                      = PASS   (src/**/* only — does NOT cover backend/scripts/)
CONFIRMATION_PROBE_SCRIPT_EXECUTABLE    = TRUE   (measure-only zero-provider path, re-run after the probe)
```

**One thing worth recording rather than smoothing over.** The first post-probe executability check
re-ran the script's DRY-RUN path and returned **FALSE**. The cause was not a script defect: gate
checks H.1 and H.2 — *the run-record store must be empty* and *PRE-SPEND-IDENTITY.json must not
already exist* — correctly refused to re-arm a run against a directory that had just been spent.
**That is the anti-double-spend guard working exactly as designed**, and a dry run against a spent
output directory can never pass it.

The valid post-probe path is MEASURE-ONLY, which exercises the same imports, the frozen manifest, the
input construction and the full measurement pipeline at $0.00. It returns **TRUE**, and it
regenerated a **byte-identical** `RESULTS-SUMMARY.json` — so the measurement is deterministic — while
leaving `PRE-SPEND-IDENTITY.json` untouched (`893e01a6…`).

The failed diagnostic dry run left a `GATE-BLOCKED.txt` in the output directory. **It was removed**:
it post-dates the successful probe, describes a rehearsal rather than the run, and a future reader
finding it beside a complete `RUN-RECORDS.jsonl` would reasonably misread the probe as blocked.

---

## 10. Advancement criteria

| # | criterion | required | observed | met |
|---|---|---|---|---|
| 1 | REQUIRED linkage | 3 of 3 valid (exactly 3 present) | **3 of 3** | **YES** |
| 2 | FORBIDDEN linkage | 0 accepted | **1** (§5) | **NO** |
| 3 | invalid candidate keys | 0 accepted | **0** | **YES** |
| 4 | no forced linkage on NOT_A_LINKAGE_TEST | none | **none** | **YES** |
| — | TRUE-GAP (narrow minimum ≥1/2) | ≥1 of 2 | **5 of 5** | met |
| — | arbitration | natural only; 0 not a failure | `NO_NATURAL_OPPORTUNITY` | met |
| — | protected suites after probe | 35 of 35 | see §9 | met |

---

## 11. Remaining unknowns

1. **Whether FORBIDDEN-ambiguity can be commissioned at all.** §5's finding — that the premise depends
   on a candidate decomposition the fixture cannot control — is the open question this probe hands
   back, and it needs a product-owner decision rather than another fixture attempt.
2. **The FORBIDDEN denominator is 1.** Two of three dedicated controls produced no opportunity.
   Nothing here characterises FORBIDDEN behaviour at scale.
3. **Hosted arbitration is still unexercised** across 41 calls in three probes, and cannot be closed
   without the model making the error.
4. **Broad clarification recall remains unvalidated**, by design. 5 of 5 here is narrow evidence, and
   LP-B2's §142 miss is still unrepaired and unexplained.
5. **One arm, one replicate, nine rows.** No rate, no distribution, no reproducibility claim.
6. **`crossHazardInsights` precision** remains open since §140 (6 items here; not a validation
   campaign).
7. **M14 remains causally unresolved.**

---

## 12. Files

**Created** (`verification/expert-hazlenz-v9-linkage-confirmation-2026-09-03/`): `PROBE-REPORT.md`,
`PRE-SPEND-IDENTITY.json` (write-once, refusal proven live), `RUN-RECORDS.jsonl` (`1d344c44…`),
`RESULTS-SUMMARY.json`, `FIXTURE-MANIFEST.json`, `ATTEMPT-LEDGER.json`; plus
`backend/scripts/probe-expert-v9-linkage-confirmation.ts`.

**Modified**: `docs/INSITE_ENGINEERING_BLUEPRINT.md`, `docs/INSITE_CURRENT_STATE.json` — additively.

**No production source, formal scorer, formal truth, threshold or frozen artifact was modified. No
historical §140/§141/§142 evidence was altered, and the spent §142 probe script was not edited.**
