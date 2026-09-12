# Formal cohort assembly — BLOCKED, and the reserve was NOT spent

**Terminal.** `FORMAL_COHORT_ASSEMBLY_BLOCKED — FROZEN_COMPOSITION_MINIMA_JOINTLY_UNSATISFIABLE_AT_HARD_CEILING`

```
RESERVED_MATERIAL_OPENED  = FALSE
GAUNTLET_OFFSET_2         = RESERVED, NOT OPENED
GAUNTLET_OFFSET_3         = RESERVED, NOT OPENED
PROVIDER_INVOCATION_COUNT = 0
FORMAL_COHORT_SPENT       = FALSE
P4_PRESPEND_AUTHORIZATION = FALSE
COHORT_STATUS             = CANDIDATE (never advanced to FROZEN)
```

The opening of offsets 2 and 3 was authorized. **It was not performed**, because it was proved in
advance — from label metadata alone, spending nothing — that it cannot achieve the purpose the
authorization states for it.

## The finding

The authorization exists *"solely to construct the frozen formal cohort and close the measured
`FORBIDDEN_FAMILY_NEGATIVE_CONTROL` composition shortfall."*

**The shortfall is not what blocks the cohort, and the reserve cannot close what does.**

Every class is individually satisfiable. No selection satisfies them **simultaneously** inside the
frozen hard ceiling.

### The proof

For one selected row set `R`, by inclusion–exclusion:

```
H  >=  |R|  >=  |OWED ∪ FORBIDDEN|  =  |OWED| + |FORBIDDEN| - |OWED ∩ FORBIDDEN|
=>  |OWED ∩ FORBIDDEN|  >=  O + F - H
```

with the frozen values:

| symbol | meaning | value | source |
|---|---|---|---|
| `O` | `CLARIFICATION_OWED` minimum | 20 | `REQUIRED_CLASS_MINIMUMS` |
| `F` | `FORBIDDEN_FAMILY_NEGATIVE_CONTROL` minimum | 48 | `REQUIRED_CLASS_MINIMUMS` |
| `H` | hard ceiling | 60 | `COHORT_SIZE_POLICY.hardCeiling` |

```
REQUIRED  |OWED ∩ FORBIDDEN|  >=  20 + 48 - 60  =  8
AVAILABLE |OWED ∩ FORBIDDEN|                    =  3     AUG-10, AUG-11, SEM-30
```

**3 < 8.** No cohort exists, at any selection.

Equivalently, stated as the shortfall: the most `FORBIDDEN` rows reachable in a 60-row cohort that
also carries 20 `OWED` rows is `3 + min(60 - 20, non-OWED forbidden available) = 3 + 40 = 43`,
against a required 48 — **short by 5**.

### Why opening offsets 2 and 3 cannot help

The binding term is the **overlap**, and those partitions contribute **zero** to it. Field-name
inventory of `safescope-gauntlet.source.v1.json` (labels only, no observation read):

```
gap label present in ANY field name         : false
interaction label present in ANY field name : false
```

A row from that artifact can never be `CLARIFICATION_OWED` without Level-3 authoring, which this
operation does not authorize. Offsets 2 and 3 add only **not-OWED** forbidden rows.

And the not-OWED side is already saturated: only `H - O = 40` slots exist for non-OWED rows, and the
**already-open** pool supplies 41 non-OWED forbidden rows. The maximum is 43 with or without the
reserve. **Opening would have burned two irreplaceable open-once partitions to reach the identical
number.** That is the §126 outcome exactly, and `COHORT_SIZE_POLICY.onInsufficiency` — *"If 60 rows
cannot satisfy every frozen composition requirement, STOP and report the exact reason. The cohort is
NEVER silently enlarged and a requirement is NEVER relaxed."* — governs.

## A second finding, independently blocking an open-once action

**The record contains two different partition schemes for "gauntlet offset 2 / offset 3", and they
designate different material.**

| source | rule | partition sizes | "offset 2" |
|---|---|---|---|
| `expert-corpus-retirement-registry.ts` (D-86, cited as reproduced live in §124) | `i % 4`, `k = parseInt(sha256.slice(-8),16) % 4 = 0` | 38 / 38 / 37 / 37 | **37 rows** |
| §123 `reserved/NEGATIVE-CONTROL-DETERMINATION.json` | `i % 5` — *"offset 2 (i % 5 == 2) … rows 30"* | 30 / 30 / 30 / 30 / 30 | **30 rows** |

The two "offset 2" sets **share only 8 rows**. The two "offset 3" sets also share only 8. Both
schemes are internally consistent with the artifact's 150 rows, so neither is self-evidently a typo.

An open-once instruction naming "offset 2 and 3" therefore does not designate a determinate row set,
and **opening the wrong one is irreversible**. This must be resolved by the owner before any opening,
independently of the feasibility verdict above. The registry is the governance surface and cites
D-86 explicitly, so it is the stronger candidate — but that is a determination for the owner to
record, not for me to assume while executing an irreversible action.

## Step 3 — the governed-record determination, reported precisely

The instruction was to measure `REVIEWER_APPROVED_GOVERNED_RECORDS` against **the frozen
definition** and to stop if the existing records do not satisfy it.

**Measured result: there is no frozen `REVIEWER_APPROVED_GOVERNED_RECORDS` requirement to satisfy or
fail.**

- `REQUIRED_CLASS_MINIMUMS` contains no approved-record class. The twelve entries are
  `GOVERNED_RECORD_SUPPLIED`, `NO_GOVERNED_RECORD`, `CLARIFICATION_NOT_OWED`, `CLARIFICATION_OWED`,
  `FORBIDDEN_FAMILY_NEGATIVE_CONTROL`, `LIFE_CRITICAL_PRESENT`, `CROSS_HAZARD_INTERACTION`,
  `DETERMINISTIC_MISS_RECALL_OPPORTUNITY`, `MULTI_HAZARD`, `NEGATED_OR_SAFE_STATE`,
  `DISAGREEMENT_OPPORTUNITY`, `DETERMINISTIC_HAZARD_PRESENT`.
- `COHORT_CASE_CLASSES` contains no approved-record class either.
- M06 keys off `governedStandards.length > 0`; M07's denominator is detected regulatory statements;
  M08 is **exercised by** unapproved records — `expert-cohort-composition.ts` states that rows
  carrying an UNAPPROVED record are what actually exercises it.

This was already adjudicated in §126 (`GOVERNED-SNAPSHOT-RECONCILIATION.md` §4): *"No immutable
measure requires approved-record coverage … This is therefore a reported limitation, not a failed
gate."*

**Nothing was self-approved and no `reviewState` was converted.** The snapshot is present and
unchanged at `a2c5dc32…`, 64 records, `approvedText` on 64/64, `reviewState =
mechanically_validated` on 64/64 → `UNAPPROVED_RECORD` on all 64.

The limitation stands and is carried forward, not waved through:

```
REVIEWER_APPROVED_GOVERNED_RECORDS  = 0
APPROVED_RECORD_GROUNDING_EXERCISED = FALSE
```

One axis of M07 — behaviour when Expert is handed a cleanly *approved* governed record — cannot be
exercised by any cohort built from this corpus, because production contains no such record. Had the
cohort frozen, that limitation would have had to be written into the manifest so no later green M07
result could imply otherwise.

**If the owner intended `REVIEWER_APPROVED_GOVERNED_RECORDS` to be a gate rather than a reported
limitation, that is a governance change to the frozen contract and must be made deliberately — it is
not something to discover by having me treat 0 as passing.**

## Composition ledger

Per-class supply. **Per-class status is not sufficient** — the joint constraint above is what decides.

| class | required | open pool | + reserve (upper bound) | per-class |
|---|---|---|---|---|
| CLARIFICATION_OWED | 20 | 25 | 25 | ok |
| CLARIFICATION_NOT_OWED | 14 | 127 | 201 | ok |
| FORBIDDEN_FAMILY_NEGATIVE_CONTROL | 48 | 44 | 115 | ok per-class, **unreachable jointly** |
| CROSS_HAZARD_INTERACTION | 10 | 17 | 17 | ok |
| MULTI_HAZARD | 12 | 61 | 135 | ok |
| LIFE_CRITICAL_PRESENT | 10 | 72 | 120 | ok |
| NEGATED_OR_SAFE_STATE | 10 | 45 | 45 | ok |
| DETERMINISTIC_HAZARD_PRESENT | 30 | 123 | 197 | ok |
| DETERMINISTIC_MISS_RECALL_OPPORTUNITY | 10 | 33 | 33 | ok |
| GOVERNED_RECORD_SUPPLIED | 40 | attachment | attachment | satisfiable by attachment |
| NO_GOVERNED_RECORD | 8 | attachment | attachment | satisfiable by attachment |
| DISAGREEMENT_OPPORTUNITY | 6 | attachment | attachment | satisfiable by attachment |

**On the reserve counts.** The `+ reserve` column uses a label-metadata **upper bound with no
eligibility filter** (35 + 36 = 71 forbidden-label-bearing rows). It is **not comparable** to §123's
`9 + 9 = 18` or §126's recorded `16`, both of which applied an eligibility filter this count does
not — in `gauntlet.seed` only 45 of 100 rows were eligible, and the rule is not reproducible from
labels alone (8 of 100 rows carry a taxonomy-mappable primary family and are still marked
ineligible). Reproducing it would require opening the partitions. **The verdict does not rest on this
number**: the binding side is the 40-slot count, which the already-open pool's 41 non-OWED forbidden
rows already exceed.

## What would unblock assembly

Stated as options. **I am not proposing a number for any frozen value.**

1. **Author more Level-3 material that is simultaneously `CLARIFICATION_OWED` and
   forbidden-family-carrying** — at least 5 more such rows — under a construction policy frozen
   first and then independently reviewed, exactly as §127–§129 did. This is the route that closed the
   last two blockers, and it is a full operation of its own.
2. **Re-examine the frozen minima as a deliberate governance act.** `O + F - H = 8` is a consequence
   of three separately chosen numbers — 20, 48 and 60 — that were never checked against each other
   for joint satisfiability. If `FORBIDDEN_FAMILY_NEGATIVE_CONTROL = 48` out of a 60-row ceiling no
   longer reflects what you want measured, that is a decision you can take in the open. **It is
   emphatically not something to relax in order to reach a freezable cohort**, and I will not propose
   a replacement value.
3. **Raise the hard ceiling** — also a threshold change, with the same caveat, and it would increase
   the formal call count and spend proportionally.
4. **Freeze a smaller measured scope** that does not claim the classes it cannot supply, accepting
   that a HARD_GATE with zero opportunity is UNMEASURED and **UNMEASURED FAILS**.

## Confinement

```
PROVIDER_INVOCATION_COUNT = 0    no Anthropic request of any kind
RESERVED_MATERIAL_OPENED  = FALSE
PRODUCTION_ACCESS         = FALSE
DATABASE_ACCESS           = FALSE
DEPLOYMENT                = FALSE
COMMIT / PUSH / TAG       = FALSE
```

No semantic corpus modification. No governed-record content modification. No self-approval. No
prompt, scorer, threshold or taxonomy change. No other reserved material inspected — realism offsets
1 and 2 and every retired partition were not touched.
