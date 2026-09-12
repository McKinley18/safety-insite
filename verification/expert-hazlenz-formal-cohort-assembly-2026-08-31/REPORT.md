# EXPERT HAZLENZ — FORMAL COHORT ASSEMBLY AND TRUTH-KEY (2026-08-31)

**Terminal: `EXPERT_HAZLENZ_FORMAL_COHORT_ASSEMBLY_BLOCKED — COHORT_SOURCE_MATERIAL_INSUFFICIENT_FOR_FROZEN_COMPOSITION`.**

Predecessor: §121. HEAD `37a5d1b5`, unmoved. **Provider calls 0. `PROVIDER_INVOCATION_COUNT = 0`.
API cost $0.00. `FORMAL_COHORT_SPENT = FALSE`. `TRUTH_LEAK = 0`.** Nothing committed, pushed, tagged
or deployed. No customer activation. `runExpertAnalysis` still has zero callers.

The reserve was opened once, correctly, and the machinery works on real rows. **The cohort could not
be frozen**, and the reason is not the row count: two frozen composition requirements have no
authorized source at any row count.

---

## 1. Phase 1 — pre-exposure freeze: PASS, zero drift

All nine §121 hashes re-proved identical **before** anything was opened: evaluation plan
`0b9b273a…`, measurement contract `022fb9db…`, cohort contract `c6d593be…`, input constructor
`2210cbe6…`, scorers `bec26908…`, harness `b4ea8b75…`, composition `96f6c848…`, prompt `e02c15ea…`,
projection `f1cc7a61…`.

## 2. Phase 2 — supplemental policy frozen before exposure

`backend/scripts/lib/expert-cohort-supplemental-policy.ts`, **sha256
`cc69d28e74308f492271ff573357b5c346ebe915f253e692f108e9e962f94967`**, written and hashed **before**
`gauntlet.seed` was read. It imports no provider, no probe artifact and no run record, so "selection
may not be driven by observed model behaviour" is structural rather than promised. Selection order is
fixed (`scenarioId` ascending; supplemental by row id) with no randomness and no seed.

## 3. Phase 3 — the reserved open, and open-once compliance

| | |
|---|---|
| artifact | `safescope-data/gauntlets/safescope-gauntlet.seed.json` |
| reserve | "the unopened 100-row gauntlet.seed" |
| range | all 100 rows |
| pre-open sha256 | `49aa40fd…` — **matches** the blueprint's §7785 record, so the reserve was unmodified |
| post-operation sha256 | `49aa40fd…` — **unchanged**, read only, never mutated |
| **not opened** | gauntlet offsets 2 and 3, realism offsets 1 and 2 — all four remain available as future single-use exams |

**Open-once compliance, measured:** **0 of 100** scenarioIds appear anywhere in `verification/` or
`docs/`. The realism pack was left untouched at `6f6897f1…`, deliberately: §121 measured its
`shouldHaveMissingEvidence` distribution as true 87 / false 2 / unlabelled 28, so opening it would
have spent a reserved offset to gain two zero-owed rows against a requirement of fourteen.

## 4. Phase 4 — the two condition mappings

### `HISTORICAL` — **RESOLVED from production semantics**, and §121's provisional reading was wrong

`inferConditionState()` reaches HISTORICAL through five branches and stamps `correctionStatus` on
the same object each time. **Four of five carry `reported`** and say in their own text that the
current status or exposure is *not established*; only one — "described as **corrected** before the
current observation" — carries `verified`. The frozen definition of `CORRECTED` is "the hazard
existed and the observation asserts it was **put right**". Mapping the other four to `CORRECTED`
would tell Expert the hazard was fixed precisely where the engine said it could not establish the
current status: a false statement, not an approximation.

The engine supplies its own discriminator, so no judgement of ours is needed:

```
HISTORICAL + correctionStatus === 'verified'  ->  CORRECTED
HISTORICAL + anything else                    ->  INSUFFICIENT_EVIDENCE
```

`INSUFFICIENT_EVIDENCE` rather than `UNKNOWN` because the engine *did* establish something — a prior
condition is documented — and failed only on the current state; and because it keeps the engine's own
`UNKNOWN` branch distinguishable in the Expert view. Implemented, and asserted by `C.5a`–`C.5c`.
**Independent of provider behaviour: read entirely from the deterministic engine.**

### `PLANNED_FUTURE` — **UNRESOLVED. Not guessed.**

The engine produces it for "the hazardous activity is **planned but not yet underway**", and the
invariant regression's own example is "guardrails are **planned** for removal next quarter … no
current exposure was observed today". The frozen definition of `HYPOTHETICAL` is "the text frames the
situation as **contingent** and asserts no present occurrence", triggered by if / were / would /
could / might. A **scheduled** activity satisfies the second clause and **fails the first**.

**No member of the eight-state vocabulary means "scheduled but not yet begun."** This is a vocabulary
gap, not a choice between readings, so it is returned rather than decided:

| alternative | consequence |
|---|---|
| **A — `HYPOTHETICAL`** (§121's carry-forward, currently in code) | Right in effect (no present exposure; L3's HYPOTHETICAL sets `clarificationOwed: false`), wrong in kind: tells the model the situation is contingent when the observation asserts it is scheduled. Risk: Expert reasonably declines to raise a hazard that *is* going to occur. |
| **B — `INSUFFICIENT_EVIDENCE`** | Wrong in a different direction: the engine *did* settle the state, so this reports an uncertainty that does not exist. Risk: invites a clarification on a row that owes none, which pushes directly against `M10`'s 0.15 ceiling. |

**Measured mitigation: the mapping is exercised by ZERO of the 45 eligible reserved rows.** Across
all 100 reserved rows the engine produced 92 `ACTIVE` and 1 `HISTORICAL` and **no `PLANNED_FUTURE`
at all**. So this decision changes nothing for the material now in hand — but it is left to you
rather than settled by default.

## 5. Phases 5–7 — the candidate cohort executes the real path

45 eligible reserved rows (matching §121's metadata prediction exactly), built with **mechanical
truth only** — corpus labels and deterministic-engine output, precedence levels 1 and 2:

| field | provenance |
|---|---|
| `presentHazardFamilies` | LEVEL 2 corpus label (`primaryHazardFamily` + `secondaryHazardFamilies`, mapped) |
| `forbiddenHazardFamilies` | LEVEL 2 corpus label (`unacceptableStandardFamilies`, mapped) |
| `defensibleHazardFamilies` | LEVEL 1 derived (accepted taxonomy − present − forbidden; "the corpus said neither") |
| `negatedOrSafeStateFamilies` | LEVEL 1 deterministic (engine `conditionState`) |
| `lifeCriticalHazardFamilies` | LEVEL 2 corpus proxy (`severityExpectation === 'critical'`, primary family only) |
| `decisionCriticalGaps`, `recordedInteractions` | **NOT AUTHORED** — deliberately withheld; see §6 |
| `governedStandards` | **UNAVAILABLE** — see BLOCKER 1 |

**Results:** row validity **0 problems across 45 rows**; **135 requests constructed** (45 × 3 arms)
through the canonical constructor and the permanent prompt builder; **0 sent**;
**`PROVIDER_INVOCATION_COUNT = 0`**; **`TRUTH_LEAK = 0`**.

`CANONICAL_CONSTRUCTOR_PROVEN = TRUE` on real reserved rows, not fixtures.

## 6. Phase 6 — composition proof: **FORMAL_COHORT_COMPOSITION_VALID = FALSE**

Candidate pool is **77 rows** (45 reserved + 24 Population A + 8 Population B) against a 60-row
target, so **row count is not the constraint**. Maximum achievable per class, from the sources this
authorization permits:

| class | required | max achievable | status |
|---|---|---|---|
| DETERMINISTIC_HAZARD_PRESENT | 30 | 53 | ok |
| DETERMINISTIC_MISS_RECALL_OPPORTUNITY | 10 | 33 | ok |
| MULTI_HAZARD | 12 | 21 | ok |
| CROSS_HAZARD_INTERACTION | 10 | 13 | ok, needs level-3 authoring |
| LIFE_CRITICAL_PRESENT | 10 | 27 | ok |
| NO_GOVERNED_RECORD | 8 | 77 | ok |
| CLARIFICATION_OWED | 20 | 45 | ok, needs level-3 authoring |
| CLARIFICATION_NOT_OWED | 14 | **15** | ok, needs level-3 authoring — **one row of margin** |
| NEGATED_OR_SAFE_STATE | 10 | 14 | ok, needs level-3 authoring |
| **FORBIDDEN_FAMILY_NEGATIVE_CONTROL** | **48** | **27** | **BLOCKED, short 21** |
| **GOVERNED_RECORD_SUPPLIED** | **40** | **0** | **BLOCKED, short 40** |
| **DISAGREEMENT_OPPORTUNITY** | **6** | **0** | **BLOCKED, short 6** |

### BLOCKER 1 — no authorized governed-record source exists

`safescope-data/approved-knowledge/approved-knowledge-registry.v1.json` contains **zero records**.
The governed release — the authority that defines governed regulatory content — lives in the
database, which this authorization does not permit touching. `safescope-standards.data.ts` holds 8
legacy records, and the blueprint records `standards_master` as **COMPATIBILITY_EVIDENCE_ONLY,
explicitly not the authority**. Raw eCFR XML exists under the governed-knowledge-growth
source-evidence directories, but turning raw regulatory source into a `GovernedStandardView` with a
`backingState` would be constructing governed content outside the governed pipeline, and asserting
`APPROVED` for text nobody approved is exactly what `EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD` and
`EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE` exist to prevent.

**Cascade:** `M06` (HARD 0.05) and `M07` (HARD 0.95) both depend on governed-record rows. At a zero
denominator `M06` is UNMEASURED, and an unmeasured hard gate FAILS — so `REGULATORY_INTEGRITY` would
fail **by construction rather than on the model's behaviour**. That is the §100.4 failure this
programme has already paid for once: burning the reserve to measure our own defect.

### BLOCKER 2 — the frozen taxonomy limits the negative control

All 100 reserved rows carry `unacceptableStandardFamilies`, but only **14 of the 45** eligible rows
have one that maps into the accepted seven-family taxonomy through the frozen `toExpertFamily`.
Population A adds 13, for **27 against a requirement of 48**. The rest name unacceptable families the
taxonomy cannot express — Housekeeping, PPE, Emergency egress, Material Handling.

Closing it needs either **widening `toExpertFamily`** — prohibited by name in this authorization, and
a change to the accepted §119 projection — or **labelling families forbidden on rows where no corpus
says they are**, which is fabricating truth for a hard gate's numerator. Neither was done.

## 7. Phase 9 — recalculated spend (unauthorized; for the P4 decision)

Measured from the **45 real constructed request bodies**, not estimated:

| | |
|---|---|
| full request body bytes | min 22,862 · **mean 23,406** · max 24,857 |
| implied input tokens (at §118's measured 2.626 bytes/token) | min 8,706 · **mean 8,913** · max 9,466 |
| output-token assumption | **1,279** (§118 measured mean; cap configured at 8,000) |
| cost model | **$2.00/M input, $10.00/M output** — fitted to the 18 real §118 calls, residual 0.00000000 |
| expected per call | **$0.0306** without governed records; **$0.0318** once records are supplied |
| **expected spend at 180 calls** | **$5.51 – $5.72** |
| conservative maximum at 200 calls (12,000 in + full 8,000 out cap + 10% retry) | **$22.88** |

**$25.00 remains a sufficient hard financial ceiling** — confirmed against measured inputs, with
about 9% headroom over the conservative maximum.

## 8. Readiness gate

```
FORMAL_COHORT_ROW_COUNT              = 45 candidate (target 60)      FAIL
FORMAL_COHORT_COMPOSITION_VALID      = FALSE                          FAIL
TRUTH_KEYS_FROZEN                    = FALSE                          FAIL
ADJUDICATION_RUBRIC_FROZEN           = TRUE   (unchanged from §121)
CANONICAL_CONSTRUCTOR_PROVEN         = TRUE   (on 45 real reserved rows)
TRUTH_LEAK                           = 0      PASS
RESERVED_OPEN_ONCE_POLICY_SATISFIED  = TRUE   PASS
PROVIDER_INVOCATION_COUNT            = 0      PASS
FORMAL_COHORT_SPENT                  = FALSE  PASS
P4_PRESPEND_AUTHORIZATION            = FALSE  (unmet by design)
PROVIDER_VALIDATED                   = FALSE
CUSTOMER_ACTIVE                      = FALSE
LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN    = TRUE   (untouched)
```

Three bits fail, so the cohort was **not** frozen and no identifier was claimed.

## 9. Regression

Expert suites identical to §121 after the constructor change: **56 / 51 / 131 / 141 / 58 / 88 / 40 /
30**, plus the instrument suite at **150/0** (up from 146 — four new mapping assertions). Quarantine
**61/0** and **37/0**. `hazlenz-precision` PASS with 0 dangerous and 0 life-critical omissions;
`hazlenz-actionable-coverage` PASS; `evidence-foundation` 35; `hazlenz-evidence-boundary` 13; `tsc`
exit 0. **No new failing suite.** The §119 projection equivalence gate still passes at 88/0.

The only source file this operation changed is `expert-input-constructor.ts`
(`2210cbe6…` → `c28c2d9f…`), for the authorized `HISTORICAL` resolution. Prompt, projection, plan,
measurement contract, cohort contract, scorers, composition and harness are all **byte-unchanged**.

## 10. Exact next operation

A product-owner decision on **three** items, none of which an engineer may settle:

1. **Governed records.** Either authorize a governed-record source for the cohort — an export from
   the governed release, or an explicit decision that a defined subset of eCFR source-evidence may
   be supplied with a stated non-`APPROVED` `backingState` — or amend the frozen composition
   requirement, which is itself a governance act. Without one, `M06` and `M07` cannot be measured.
2. **The negative-control shortfall.** Either accept 27 rows against the frozen 48 (an amendment to
   the frozen contract), or authorize widening `toExpertFamily` as a separate, re-verified change to
   the accepted §119 projection. This operation refused to do either on its own.
3. **`PLANNED_FUTURE`** — alternative A or B in §4. Zero rows currently exercise it.

Once 1 and 2 are settled, the remaining work is level-3 truth authoring for
`decisionCriticalGaps`, `recordedInteractions` and the zero-owed set — bounded, and no longer
blocked. The reserve stays open-once compliant: `gauntlet.seed` has been opened and the other four
offsets have not.
