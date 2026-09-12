# EXPERT HAZLENZ — GOVERNED NEGATIVE-CONTROL CORPUS AUGMENTATION (2026-08-31)

**Terminal: `EXPERT_HAZLENZ_FORMAL_NEGATIVE_CONTROL_AUGMENTATION_SEALED — FINAL_COHORT_ASSEMBLY_AND_GOVERNED_SNAPSHOT_READY`.**

Predecessor: §124. HEAD `37a5d1b5`, unmoved. **Provider calls 0. `PROVIDER_INVOCATION_COUNT = 0`.
$0.00. No production access. No reserved material opened. `FORMAL_COHORT_SPENT = FALSE`.**
Nothing committed, pushed, tagged or deployed. `runExpertAnalysis` still has zero callers.

**29 validation assertions, 0 failed.** The negative-control blocker is closed with a margin of 9.

---

## 1–2. Retirement registry and corrected corpus status

`backend/src/safescope-v2/expert-hazlenz/expert-corpus-retirement-registry.ts` —
**`cd1a114d0aaad100cc7d9eb61762da6d4e5b73c43140884da3c8ddbc6f58ef6c`**. Machine-readable copy:
`registry/RETIREMENT-REGISTRY.json`. **13 partition records, 6 permanently retired.**

| partition | rows | status | evidence |
|---|---|---|---|
| `GAUNTLET_OFFSET_0` | 38 | **RETIRED** | §61 Run 1, corpus spent, measurement not obtained |
| `GAUNTLET_OFFSET_1` | 38 | **RETIRED** | Run 2, corpus spent |
| `GAUNTLET_OFFSET_2` / `_3` | 37 / 37 | RESERVED | never opened |
| `REALISM_OFFSET_3` / `_0` | 29 each | **RETIRED** | §61 Run 1 / Run 2 |
| `REALISM_OFFSET_1` / `_2` | — | RESERVED | zero negative-control capability |
| `gauntlet.seed` | 100 | OPENED (§122) | committed to this exam |
| field-validation-dataset | 200 | **RETIRED** | §36.10, all five strides exhausted |
| L3 Run 1 / Run 2 holdouts | — | CLOSED | spent |
| precision corpus, Expert fixtures | — | DEVELOPMENT | never a gate result |

The **fail-closed guard** `assertMayOpen()` consults **both** the frozen plan and the registry and
refuses on any conflict. Verified: retired offsets 0 and 1 **REFUSED**, retired realism offset 3
**REFUSED**, unknown `GAUNTLET_OFFSET_4` **REFUSED**, reserved offsets 2 and 3 permitted.

**The frozen plan under-reports exactly three retirements** — `GAUNTLET_OFFSET_0`,
`REALISM_OFFSET_3` and the field-validation dataset. Reported by `planListDiscrepancies()`, **not
silently reconciled**: the plan file is frozen and `test:expert-nocall-harness` asserts
`closed.length === 4`. Amending it remains a separate governance act.

## 3. Construction policy

`backend/scripts/lib/expert-augmentation-construction-policy.ts` —
**`9865e7d09f9b1fbb1d23ceea150e642315693216f35c5441ed36d05f51eabcbf`**, frozen **before a single
case existed**. It imports no provider, probe artifact or run record, so "construction may not be
informed by provider behaviour" is enforced by the dependency graph. It states the purpose as
**coverage, not challenge**, and requires every forbidden family to have a **lure plus a defeating
fact** — absence is never a reason.

## 4. The sixteen rows

`AUG-01` … `AUG-16`, authored order, immutable after seal.

| requirement | required | actual |
|---|---|---|
| rows with forbidden-family truth | 10 | **14** |
| safe / resolved / negated | 4 | **6** |
| active hazard | 4 | **8** |
| multi-family or sibling routing | 4 | **4** |
| clarification NOT owed | 4 | **13** |
| clarification owed | 2 | **3** |
| governed-record matchable | 4 | **14** |

Plus **3 recorded cross-hazard interactions** (`CONFINED_SPACE_ATMOSPHERIC`,
`ELECTRICAL_WET_ENVIRONMENT`, `LOTO_STORED_ENERGY`), each over the closed vocabulary.

Every forbidden family's lure was verified **mechanically** (`B.4`): the observation must contain a
token from that family's lure lexicon. A family nothing in the text points at cannot be forbidden.

## 5. Safety-domain review — **and its limitation, stated plainly**

Full record: `review/SOURCE-CASE-REVIEW.md`.

**The review was performed by the same agent that authored the cases.** It is an authoring
self-review against the frozen policy, **not an independent human safety-domain review**. That
matters: this corpus feeds `M02`, a **HARD GATE at 0.20**, and a forbidden-family label a qualified
reviewer would dispute would score a *correct* model observation as a false positive.

**Recommendation: have a qualified safety professional review the sixteen rows — especially the
fourteen forbidden determinations — before this corpus produces a gate result.** The corpus is
sealed, so that review can only confirm or find it defective, which is the correct order.

The review's substantive result was **two rejections**, both caught by asking whether a competent
reviewer could legitimately raise the family:

- **`AUG-04`, `lockout_tagout`** — isolating or blanking lines into a vessel before entry is a real
  requirement. Forbidding it would penalise correct reasoning. **Downgraded to defensible.**
- **`AUG-15`, `electrical`** — a carton sealer is electrically powered; unisolated electrical energy
  is a genuine second source. **Downgraded to defensible.**

Cost: two opportunities, 16 → 14. Neither row was rewritten to restore one. Three borderline
determinations (`AUG-14` dock edge, `AUG-07` eyewash, `AUG-16` explicit exclusions) are recorded
rather than hidden.

## 6. Truth provenance

| field | provenance |
|---|---|
| present / forbidden / negated families | LEVEL 2 authored source-case truth (forbidden each with a defeating fact) |
| defensible families | LEVEL 1 derived — taxonomy minus present minus forbidden |
| life-critical, gaps, interactions | LEVEL 3 authored safety-domain judgement (interactions over the closed vocabulary) |
| governed standards | **DEFERRED** — supplied at assembly from the governed release snapshot |

## 7–8. Capability

**`NEW_TRUTH_SUPPORTED_NEGATIVE_CONTROL_OPPORTUNITIES = 14` (≥ 10 required).**

```
seed 14 + Population A 13 + offset2 8 + offset3 8 + realism 0 = 43
                                        + augmentation 14     = 57
```

**`AVAILABLE_NEGATIVE_CONTROL_CAPABILITY = 57 ≥ 48`, margin 9.** Offsets 2 and 3 counted from
**metadata only** — neither was opened, per Phase 9.

## 9–12. Contamination, leak, dry run, calls

- **`KNOWN_PROVIDER_CASE_COPY = FALSE`** — all 16 observations yield a distinctive ≥40-char fragment;
  **0 matches** across `verification/`, `docs/`, `safescope-data/` and the Expert fixtures (which
  include every §104–§119 diagnostic fixture a provider has seen). Retired material was **not read**
  for this check — excluded by path, with identity established by hash in the registry instead.
- **`TRUTH_LEAK = 0`** across all **48** constructed requests (16 rows × 3 arms).
- Dry run through the real canonical constructor, permanent prompt builder and harness, provider
  **DISABLED**: 48 requests constructed, **0 sent**, no score produced.
- **`PROVIDER_INVOCATION_COUNT = 0`**, by the harness's own counter.

## 13–17. Seal and hashes

**`FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1` — SEALED.** Now formal RESERVED material,
**not yet spent**.

| artifact | sha256 |
|---|---|
| ordered 16-row manifest | `b2e96cc5b4fcfd61aa1159a85fcdd34915f883e3fba2d30948cdf65cad30bf64` |
| truth keys | `51afb054af7f9858fc6b0b1ffb980aa81ef9208a9e73eaa959a559e9e8b620b2` |
| truth provenance | `e33fb8df7dd3e7e2eeb07bd616f66a8134c235785d20318911000bfa36a10339` |
| corpus source module | `c744c9398c8895cf…` |
| retirement registry | `cd1a114d0aaad100…` |
| construction policy | `9865e7d09f9b1fbb…` |
| validator | `caccccaa73cecc7e…` |
| seal record | `97bb5e67d39ae97e…` |
| review record | `2352dc210b7b8f2e…` |

**Unchanged frozen artifacts:** constructor `72dab946…`, plan `0b9b273a…`, measurement contract
`022fb9db…`, cohort contract `c6d593be…`, scorers `bec26908…`, composition `96f6c848…`, harness
`b4ea8b75…`, prompt `e02c15ea…`, projection `f1cc7a61…`. Reserved corpora byte-unchanged
(`49aa40fd…`, `a95e5480…`, `6f6897f1…`).

## 18. Remaining blockers and debt

1. **Governed records 0 < 40** — the only remaining cohort blocker. Awaiting your execution of the
   read-only runbook (§123).
2. **Independent safety review of the 16 rows** — recommended before a gate result.
3. `EVALUATION_CORPUS_POLICY.closed` under-reports three retirements — needs its own authorization.
4. `PLANNED_FUTURE_REPRESENTATION_DEBT = TRUE`; `LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN = TRUE`, untouched.
5. Carried: `M02`/`M07`/`M09` denominators model-output-dependent; `P2_DETERMINISTIC_CONTROL = ABSENT`;
   extraction pattern-based; `CONTRADICTS_DETERMINISTIC` not authoritative.

## 19. Readiness

```
AUGMENTATION_SEALED                     = TRUE
NEW_NEGATIVE_CONTROL_OPPORTUNITIES      = 14  (>= 10)
AVAILABLE_NEGATIVE_CONTROL_CAPABILITY   = 57  (>= 48, margin 9)
KNOWN_PROVIDER_CASE_COPY                = FALSE
TRUTH_LEAK                              = 0
PROVIDER_INVOCATION_COUNT               = 0
RESERVED_OFFSETS_OPENED                 = 0
GOVERNED_RECORD_SUPPLIED                = 0   (>= 40 required)  STILL BLOCKED
FORMAL_COHORT_SPENT                     = FALSE
P4_PRESPEND_AUTHORIZATION               = FALSE
PROVIDER_VALIDATED                      = FALSE
CUSTOMER_ACTIVE                         = FALSE
```

## 20. Worktree

HEAD `37a5d1b5`, 1 ahead of `origin/main`, 0 staged, 4 stashes, 24 tags — all preserved. Four files
added; `backend/package.json` gained one script line. Regression: **56 / 51 / 131 / 141 / 58 / 88 /
40 / 30**, instrument **155/0**, augmentation **29/0**, quarantine **61/0** and **37/0**, precision
PASS with 0 dangerous and 0 life-critical omissions, `tsc` exit 0. No new failing suite.

---

**Next operation: `FORMAL_COHORT_FINAL_ASSEMBLY_AND_GOVERNED_SNAPSHOT`** — reconcile the governed
read-only extraction, open only the minimum reserved material needed, assemble the 60 rows, freeze,
and produce the P4 proposal. Not performed here.
