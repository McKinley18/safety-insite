# EXPERT HAZLENZ — FORMAL COHORT DEFINITION RECOVERY (2026-08-31)

**Terminal: `EXPERT_HAZLENZ_FORMAL_COHORT_BLOCKED — AUTHORITATIVE_COHORT_DEFINITION_INCOMPLETE`.**

Predecessor: §119. HEAD `37a5d1b5`, unmoved. **Provider calls attempted: 0. Completed: 0. API cost:
$0.00. `FORMAL_COHORT_SPENT = FALSE`.** No source file was modified. Nothing committed, pushed,
tagged or deployed. No customer activation.

The operation stopped at **Phase 0**, at the stop condition Phase 0 itself defines.

---

## 1. What the authorization asked for, and what the repository actually holds

The authorization set `FORMAL_EXPERT_EVALUATION_COHORT_AUTHORIZED = TRUE` and directed: recover the
authoritative cohort definition, prove a harness measures it literally, freeze it, preregister, and
spend the cohort once.

**The definition of the seventeen measures is complete and was recovered in full.** It lives in
`backend/src/safescope-v2/expert-hazlenz/expert-evaluation-plan.ts`
(`0b9b273a0c7bc24b226374fe544d5d32c5dba2dd03259b1bf7a3872a4d5b2bd8`), narrated at §99.7. Seventeen
measures, four families, twelve hard gates, five reported-only, four zero-tolerance gates,
`evaluateGateFamilies()` with no aggregate field, four preconditions, and a corpus policy. The full
recovery is `recovered/EXPERT_17_MEASURE_DEFINITION.md`.

**The cohort those measures are measured on does not exist, and seven of the seventeen have no
computable definition.** That is the blocker, stated precisely in
`recovered/MISSING_DEFINITION_MANIFEST.json` and summarised below.

---

## 2. The five gaps

### GAP 1 — no cohort exists

No cohort artifact exists anywhere in the repository. `EVALUATION_CORPUS_POLICY` names reserved
material — gauntlet offsets 2 and 3, realism offsets 1 and 2, the unopened 100-row `gauntlet.seed` —
but **never designates which of these is the Expert cohort**, and states no rowcount and no case
identities. A repository-wide search for preregistration or cohort artifacts returns only
`kg-4d/phase14-cohort-isolation.json`, a KG-4D shadow-cutover artifact unrelated to this evaluation.

Phase 3 requires freezing "complete frozen case/measure identities" and "hashes of frozen inputs."
There is nothing to freeze.

### GAP 2 — seven measures have no scorer, and five of those seven are HARD_GATEs

A search for the measure ids across `backend/` returns three hits and none of them computes a value:
the plan file itself, `test-expert-nocall-harness.ts:172-183` (which asserts *dispositions*, not
numbers), and one comment in `fixtures/grounding-fixtures.ts`. The only scorer in the Expert module
is `expert-routing-metrics.ts`, which scores collection routing — not one of the seventeen.

Nine measures are executable from their frozen `method` as written (`M03`, `M05`, `M08`, `M12`,
`M13`, `M14`, `M15`, `M16`, `M17`), and `M04` becomes executable once rows carry deterministic
findings. The remaining seven need a criterion that does not exist:

| id | gate | the missing piece |
|---|---|---|
| `M01` | reported | ground-truth "missed hazards in the cohort" — the denominator |
| `M02` | **HARD 0.20** | the rule deciding a candidate "is not a hazard" |
| `M06` | **HARD 0.05** | the rule deciding prose "asserts a regulatory requirement" |
| `M07` | **HARD 0.95** | the definition of "all regulatory statements" — the denominator |
| `M09` | **HARD 0.70** | the rule deciding a clarification is "genuinely decision-critical" |
| `M10` | **HARD 0.15** | "rows owing no clarification" — a per-row obligation key |
| `M11` | reported | "rows with a recorded interaction" — a per-row truth key |

Authoring these now would mean choosing four hard gates' denominators **after** §104–§118 made the
model's behaviour on exactly these axes visible. That is the failure the pre-registration exists to
prevent, and the operation's own words — "obtain an unbiased formal measurement" — are what rule it
out.

### GAP 3 — P4 is unmet, and on its own that blocks all four families

`P4_PRESPEND_AUTHORIZATION` requires "an explicit owner authorization naming **the cohort, the call
count and the ceiling**." Its `blocksIfUnmet` is all four families. The authorization for this
operation names none of the three. This gap is independent of the others and is dispositive alone.

### GAP 4 — the corpus policy forbids the only Expert-shaped material that exists

Every `ExpertAnalysisInput` in `src/` comes from one of six fixture files. The seven cases §118
measured and §119 proved byte-equivalent are drawn from `hazard-actuality-fixtures.ts` and
`restoration-transition-fixtures.ts`. That is development material, and the policy is explicit:
development cohorts are "**never a source of a gate result.**" The reserved material is raw
observation text carrying Level-3 reasoning keys — not Expert-shaped rows, and carrying no key for
any of the seventeen measures.

### GAP 5 — no production constructor exists for cohort rows

`grep -rn 'ExpertAnalysisInput' backend/src/` at this HEAD returns only consumers and the six fixture
files; `grep -rn 'runExpertAnalysis' backend/src/` returns only its own declaration at
`expert-runner.ts:81` — **zero callers**, re-verified live, both facts unchanged from §119.1.

Building cohort rows from reserved corpus material would therefore require authoring a new
input-construction path — choosing jurisdiction, `allowedHazardFamilies`, `governedStandards` and
`deterministicFindings` per row. The evaluation would then measure that new, unproven constructor as
much as it measures the model, and those construction choices are themselves unpreregistered and
acceptance-relevant.

---

## 3. What is NOT the blocker

**The credential is present.** Checked presence/absence only — no value, prefix, suffix, length or
hash was read. `ANTHROPIC_API_KEY` is **PRESENT** in `backend/.env` (20 keys, mtime
`2026-08-30T15:06:33.826Z`) and absent from the process environment, which is the same shape §118
ran under. The §104 credential blocker is **CLOSED**.

**The permanent path is proven.** §119's equivalence gate holds at this HEAD: the permanent Expert
path emits byte-identical provider request bodies to the seven cases §118 measured.
`PERMANENT_EXPERT_PATH_PROVEN = TRUE`, `DETERMINISTIC_PROJECTION_PRESENT = TRUE`.

Transport, credential, and the projection are all ready. What is missing is the exam, not the
instrument.

---

## 4. Flags, unchanged or newly recorded

```
COHORT_DEFINITION_COMPLETE                 = FALSE   <-- the blocker
COHORT_FROZEN                              = FALSE
SCORERS_FROZEN                             = FALSE
HARNESS_SELF_TEST                          = NOT_RUN
PERMANENT_EXPERT_PATH_PROVEN               = TRUE
DETERMINISTIC_PROJECTION_PRESENT           = TRUE
FORMAL_EXPERT_EVALUATION_COHORT_AUTHORIZED = TRUE
FORMAL_COHORT_SPENT                        = FALSE
PROVIDER_VALIDATED                         = FALSE
CUSTOMER_ACTIVE                            = FALSE
LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN          = TRUE
P1_TRANSPORT_PROBE                         = ESTABLISHED
P2_DETERMINISM_CONTROL                     = ABSENT
P3_MODEL_IDENTITY                          = ENFORCEABLE
P4_PRESPEND_AUTHORIZATION                  = UNMET
```

`LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN` was not investigated and not repaired, as instructed.

---

## 5. What the product owner must decide

1. **Name the cohort** — which reserved material is opened, and how many rows.
2. **Name the call count and the hard ceiling, and the maximum authorized spend.** P4 requires all
   three, and all three are a spend decision.
3. **Decide who authors the truth keys for `M02`, `M06`, `M07`, `M09`, `M10`** (and the reported
   `M01`, `M11`), and settle them *before* any result is visible. A criterion fixed after the
   numbers are in is not a criterion — that is the G9 lesson this plan already carries.
4. **Decide whether an Expert cohort may be constructed before a production `ExpertAnalysisInput`
   constructor exists**, given that the constructor's choices would be measured alongside the model.

A defensible sequence, offered as engineering input and not as an authorization: settle 3 and 4
first on **development** material at `$0.00` — the policy permits unlimited development re-use — and
open a reserved offset only once the scorers are frozen and the constructor is proven. That keeps
the single-use cohort for the measurement it was reserved for.

---

## 6. Worktree

`state/WORKTREE-STATE.txt`. HEAD `37a5d1b5`, branch `main`, 1 ahead of `origin/main` (`de655d2f`),
0 behind. 0 staged, 14 tracked modified, 1 tracked deleted, 3,093 untracked, 4 stashes, 24 tags —
all pre-existing and preserved untouched. The uncommitted permanent-projection implementation and
equivalence work from §119 is intact and was not modified by this operation.

The only files this operation wrote are this evidence directory and the two documentation files.
