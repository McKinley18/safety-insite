# EXPERT HAZLENZ — COHORT SOURCE BLOCKERS (2026-08-31)

**Terminal: `EXPERT_HAZLENZ_FORMAL_COHORT_ASSEMBLY_BLOCKED — RESERVED_NEGATIVE_CONTROL_COVERAGE_INSUFFICIENT`.**

Predecessor: §122. HEAD `37a5d1b5`, unmoved. **Provider calls 0. API cost $0.00.
`FORMAL_COHORT_SPENT = FALSE`. No production mutation. No reserved material spent this phase.**
Nothing committed, pushed, tagged or deployed. `runExpertAnalysis` still has zero callers.

Both mappings are now frozen with regression tests. **Neither source blocker closed**, and the
second one closed *against* us on measurement: the negative-control requirement is unreachable from
authorized material by exactly three rows.

---

## 1. Constructor drift — proven, not inspected

**Method:** revert only the five §122 edits from the current file and hash the result. If that
reproduces the §121 hash byte-for-byte, those edits *are* the complete diff.

```
§121 frozen hash : 2210cbe620ff3ad837389a4b84b5ab166d39cff1f374b8964fc52e019b3723e5
reverted copy    : 2210cbe620ff3ad837389a4b84b5ab166d39cff1f374b8964fc52e019b3723e5   MATCH
```

**Zero unrelated semantic drift.** The five edits: the condition-mapping block (HISTORICAL default,
`CONDITION_MAPPING_RESOLUTIONS`, `VERIFIED_CORRECTION_STATUS`, the second parameter) plus four
`correctionStatus` pass-through lines.

| claim | result |
|---|---|
| prompt semantics changed | **NO** — `expert-prompt.ts` byte-unchanged `e02c15ea…`, version `v6` |
| projection semantics changed | **NO** — `expert-deterministic-projection.ts` byte-unchanged `f1cc7a61…` |
| truth leakage introduced | **NO** — `TRUTH_LEAK = 0` re-measured |
| evaluation-only behaviour introduced | **NO** — the added parameter is a *production* engine field (`HazardDecomposition.correctionStatus`); no cohort or truth type is reachable from any signature here |
| still the single canonical path | **YES** — no second builder exists |
| §119 equivalence holds | **YES** — `test:expert-projection-equivalence` **88/0** |
| §121 regressions green | **YES** — instrument suite **155/0** |

## 2. New authoritative constructor hash

```
72dab946616496bdd4fcb529828b14041ce7ae7723e857961c1f253fe4ff8279
```

## 3–4. Both condition mappings frozen

**`HISTORICAL` — resolved from engine semantics.** Preserved verbatim in the module header: four of
the engine's five HISTORICAL branches stamp `correctionStatus: 'reported'` and state in their own
`currentCondition` text that current status or exposure is *not established*; only the "described as
corrected" branch stamps `'verified'`. Since `CORRECTED` is defined as "the hazard existed and the
observation asserts it was **put right**", a blanket `HISTORICAL → CORRECTED` is **false** for four
of five cases. Frozen as `verified → CORRECTED`, otherwise `INSUFFICIENT_EVIDENCE`.

**`PLANNED_FUTURE → HYPOTHETICAL` — frozen as the canonical mapping** on your decision, with the
approximation recorded rather than absorbed:

```
PLANNED_FUTURE_REPRESENTATION_DEBT = TRUE  (open, notResolvableHere)
```

The debt object states the cost in code: the engine **asserts** a scheduled activity while
`HYPOTHETICAL` means the text framed it as **contingent**; the foreseeable failure is that Expert
declines or under-weights a hazard that is in fact going to occur; resolving it requires adding a
member to `EXPERT_CONDITION_STATES`, which is byte-identical to the Level-3 vocabulary by frozen
assertion and therefore a governance act with its own authorization. **The vocabulary was not
expanded** — asserted by `C.5i`.

Five new regression tests (`C.5d`–`C.5i`) cover: the recorded status, the mapping itself, that
`correctionStatus` does *not* discriminate it, that it is **not** `INSUFFICIENT_EVIDENCE` (the engine
positively knows the activity is planned, so reporting uncertainty would be false), that the debt
flag is open, and that the vocabulary is unexpanded.

## 5. Production database access — **not technically possible here**

| check | result |
|---|---|
| `DATABASE_URL` in this environment | **localhost**, 48 chars, and **malformed** — `new URL()` rejects it; `pg` resolves its host to the literal `base` |
| discrete `DB_*` | `localhost` / `safescope` / `5432` — the **local development** database |
| any Render/production host in configuration | **none** |
| `regulatory_releases` rows locally | **0** |
| `regulatory_release_records` table | **ABSENT** |
| `knowledge_release_events` table | **ABSENT** |

The accepted production governed release is **not reachable from this machine**, and the local
development database does not contain it. Your standing instruction is that I never ask for or handle
the production `DATABASE_URL`, so the deliverable is a **guarded read-only runbook** you execute:
`governed/READ-ONLY-EXTRACTION-RUNBOOK.md`.

**Read-only enforcement was proven achievable** and the runbook uses it: on `BEGIN TRANSACTION READ
ONLY`, a `WHERE false` write probe was refused by the server with **`SQLSTATE 25006 — cannot execute
UPDATE in a read-only transaction`**. Server-side, not discipline. Recorded honestly alongside it:
the local role is a **superuser**, so the *role* is unconstrained and only the *transaction* is —
which is why the runbook sets `default_transaction_read_only` at session level too.

## 6–8. Governed release identity, snapshot, coverage

**Not obtained.** No release identity, checksum, provenance, snapshot hash, record count or coverage
count can be reported, because the release is unreachable. `standards_master` was **not** used as
authority, and no eCFR evidence was turned into invented governed records.

## 9–10. Reserved material opened this phase: **NONE**

`gauntlet.seed` remains the only reserve ever opened (§122), unchanged at `49aa40fd…`. **Gauntlet
offsets 2 and 3 and realism offsets 1 and 2 were NOT opened** — the negative-control question was
answered from label metadata alone, so opening was authorized but **not needed**, and spending
single-use material to learn the same number is the failure this programme has already paid for.

**Open-once compliance, sharpened.** §122 reported 0 of 100 scenarioIds in any prior artifact. A
follow-up full-text sweep initially flagged 110 files; that was an artifact of two generic
short fragments — *"unguarded conveyor tail pulley"* and *"missing fire extinguisher in haul truck"*
— that occur independently in other corpora. Re-run over the **98 distinctive (≥40 char)** fragments
across **6,400** files: **0 matches**. The §122 claim stands, now on stronger evidence.

## 11. Final truth-supported negative-control count: **45 < 48**

| source | status | negative-control capable |
|---|---|---|
| `gauntlet.seed` (opened §122) | OPENED | **14** |
| precision corpus Population A | already-open | **13** |
| gauntlet source offset 2 (`i % 5 == 2`) | reserved, counted from metadata | **9** |
| gauntlet source offset 3 (`i % 5 == 3`) | reserved, counted from metadata | **9** |
| realism offsets 1 and 2 | reserved, **zero contribution** | **0** |
| | **TOTAL** | **45** |

Realism contributes nothing for a structural reason: it carries **`forbiddenTerms`, not forbidden
families** — its 48 distinct values are citations and phrases (`29 cfr 1926.651`, `active exposure`,
`bare conductor`). Under the frozen truth-precedence rules a forbidden-*family* truth cannot be
inferred from a forbidden *term*, and only 39 of 117 rows carry any.

**Shortfall: 3.** Per Phase 4 this is a STOP. No synthetic forbidden labels were created,
`toExpertFamily` was not widened, 48 was not reinterpreted, and no family was inferred from the
absence of a positive label.

**Material that would close it, and why it was not used:** gauntlet source-pool offsets **0 and 4**
hold **15** further capable rows, which would take the total to **60**. But
`EVALUATION_CORPUS_POLICY` designates only offsets 2 and 3, realism 1 and 2, and the seed as
RESERVED. Offsets 0 and 4 appear in **neither** the closed nor the reserved list, and Phase 3 permits
opening only material "already explicitly designated RESERVED". Designating them is a governance act,
not an engineering choice. (Offset 1 is retired/closed — 8 capable rows — and may not be reopened.)

## 12–18. Downstream phases

Phases 6–8 did not run: Phase 6 requires **both** blockers closed, and neither is. Consequently no
final zero-owed count, eligible-row pool, selected row count, composition result, fresh truth-leak
run or new dry run is reported beyond §122's, which stands unchanged (45 rows, 135 requests
constructed, 0 sent, `TRUTH_LEAK = 0`).

**`PROVIDER_INVOCATION_COUNT = 0`.**

## 19–22. Cohort and P4

**`FORMAL_EXPERT_COHORT_V1` was NOT frozen.** No identifier was claimed and no manifest, truth-key,
provenance or composition hash exists. No P4 proposal is returned — Phase 8 is conditional on the
freeze, and recalculating spend from "the final 60 real request bodies" is impossible when there are
no 60 rows. §122's measured figures stand as the current best estimate: mean ≈ 8,913 input tokens,
$0.0306–$0.0318 per call, **$5.51–$5.72 at 180 calls**, conservative maximum **$22.88**, so **$25.00
remains sufficient**.

## 23. Remaining blockers and debt

1. **Governed release unreachable** — runbook issued; needs you to execute it.
2. **Negative-control 45 < 48** — needs a governed corpus-augmentation decision. Cheapest identified
   route: designate source-pool offsets 0 and 4 as RESERVED for this exam (→ 60).
3. **`PLANNED_FUTURE_REPRESENTATION_DEBT = TRUE`** — open by decision, resolvable only by expanding a
   frozen shared vocabulary.
4. `LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN = TRUE` — untouched, as instructed.
5. Carried: `M02`/`M07`/`M09` denominators remain model-output-dependent;
   `P2_DETERMINISTIC_CONTROL = ABSENT`; extraction remains pattern-based;
   `CONTRADICTS_DETERMINISTIC` not authoritative.

## 24. Readiness bits

```
FORMAL_COHORT_ROW_COUNT             = 45 (target 60)          FAIL
FORMAL_COHORT_COMPOSITION_VALID     = FALSE                    FAIL
GOVERNED_RECORD_SUPPLIED            = 0  (>= 40 required)      FAIL
NEGATIVE_CONTROL_OPPORTUNITIES      = 45 (>= 48 required)      FAIL
TRUTH_KEYS_FROZEN                   = FALSE                    FAIL
ADJUDICATION_RUBRIC_FROZEN          = TRUE
CONDITION_MAPPINGS_FROZEN           = TRUE   (both)
TRUTH_LEAK                          = 0
RESERVED_OPEN_ONCE_POLICY_SATISFIED = TRUE
PROVIDER_INVOCATION_COUNT           = 0
FORMAL_COHORT_SPENT                 = FALSE
P4_PRESPEND_AUTHORIZATION           = FALSE
PROVIDER_VALIDATED                  = FALSE
CUSTOMER_ACTIVE                     = FALSE
PLANNED_FUTURE_REPRESENTATION_DEBT  = TRUE
```

## 25. Worktree

HEAD `37a5d1b5`, 1 ahead of `origin/main`, 0 staged, 4 stashes, 24 tags — all preserved.
`frontend-next/tsconfig.json` untouched. Reserved corpora byte-unchanged (`49aa40fd…`, `6f6897f1…`,
`a95e5480…`). The only source file changed this phase is `expert-input-constructor.ts`
(`c28c2d9f…` → `72dab946…`), for the authorized mapping freeze.

Regression: **56 / 51 / 131 / 141 / 58 / 88 / 40 / 30**, instrument **155/0**, quarantine **61/0** and
**37/0**, precision PASS with 0 dangerous and 0 life-critical omissions, `tsc` exit 0. No new failing
suite.
