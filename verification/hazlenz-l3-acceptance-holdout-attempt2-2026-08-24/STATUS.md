# L3 ACCEPTANCE HOLDOUT — CONSTRUCTED, VALIDATED, REPRODUCED AND FROZEN (ATTEMPT 2)

> ## `L3_ACCEPTANCE_HOLDOUT_FROZEN — PROVIDER_GATE_REQUIRED_BEFORE_ACCEPTANCE_AUTHORIZATION`
> ## `PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · `HOLDOUT_SPENT = FALSE`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **Zero inference, zero provider probes, zero
credential access, zero egress, $0.00.** The three protected sources are byte-identical before and
after. Nothing committed, pushed, deployed or stashed. **`G1`…`G10` untouched.**

**The exam now exists. It has not been sat.**

---

## 1 — The one plan change, and why it changes nothing `PHASE 1`

Amendment 1's line 494 still read *"exactly `18`"*. This phase added **one**
`NON_NORMATIVE_SUPERSESSION_ANNOTATION` beside it — a **7-line pure insertion, 0 deletions, 0
modifications**. Amendment 1's original statement **and its original value `18`** survive verbatim;
the annotation records only that **Amendment 2 / `D-E` governs at `21`, membership unchanged**.

| | |
|---|---|
| plan sha256 before | `9e161cab9f2c409e0f51887f6a2f62491b237e8e29bee0a154b18d8621db4a18` · 747 lines |
| plan sha256 after | `8d8f6e8d4a34e16a90f19b511bf31b4dfe255bae9ad142856c913e625f4dd7c4` · 754 lines |
| **`SEMANTIC_DELTA`** | **`0`** — no rule, membership, truth state, scorer gate, allocation or selection rule changed |
| `D-F` checker re-run after | **39 / 39 MATCH · 0 MISMATCH** |

---

## 2 — `D-F` ran **before** any selection code executed `PHASE 4`

The gate that Attempt 1's failure exists to enforce was executed **first**, against the final
governing plan, with **39 quantities re-derived from frozen membership rules rather than accepted
from a prior amendment**: source counts, both offsets, both partition vectors, both selected counts,
the 367/366 inventory, the 87/2/28/89 ambiguity truth, every F1–F8 allocation, the 92/67/72.8%
composition, and the three gate denominators derived **three independent ways each**.

**39 / 39 MATCH, 0 MISMATCH.** Only then was a row allowed to be selected.

---

## 3 — A new freeze identity, written before the builder existed `PHASE 5`

`a0d97b3f78e3c8b63436ad48b7baad1b2743a303fe12fb10018d2421f8523d62` — **`HOLDOUT_FREEZE.txt`**,
written before any selection code was authored and **never rewritten**.

**Attempt 1's freeze `f0e33f14…` was not reused and not touched.** Attempt 1 remains invalidated
historical evidence, and its authored controls remain a **structural artifact admitted to no
holdout** — so Attempt 2 authored **its own 25 controls** from the frozen family table alone.

---

## 4 — The holdout `PHASES 6–9, 13`

| | |
|---|---|
| file | `holdout/holdout-l3-acceptance-attempt2.json` |
| **sha256** | **`69665e41d975f67515bf9864e221a4b05c0811e4c48089e4671c8a2ae1cc094c`** |
| bytes · rows | **105561** · **92** |
| `INDEPENDENT_GAUNTLET` | **38** — `gauntlet.source.v1`, offset **0**, `CMP(scenarioId)` asc, `i % 4 === 0` |
| `INDEPENDENT_REALISM` | **29** — `field-realism-pack-v2`, offset **3**, `CMP(id)` asc, `i % 4 === 3` |
| `AUTHORED_CONTROL` | **25** — `4+4+3+3+3+3+3+2` |
| independent share | **67 / 92 = 72.8%** |
| partitions | gauntlet **38/38/37/37** · realism **30/29/29/29** — both disjoint and exhaustive |

**Both offsets were derived, never chosen**: `parseInt("22f0adb4",16) % 4 = 0` and
`parseInt("5231a9cb",16) % 4 = 3`, from bytes frozen months before this programme began.

**No row was selected because it looked stronger, clearer, harder or more representative, and none
was replaced because it looked wrong.** There is no code path in the builder by which that could
happen: a collision, a missing carrier or a drifted source is a **throw**, never a substitution.

---

## 5 — Gate memberships, each derived three independent ways `PHASES 7, 10`

| quantity | declared | semantic | flag | enumerated |
|---|---|---|---|---|
| authored total | **25** | 25 | — | `4+4+3+3+3+3+3+2` |
| `G3` authored | **6** | 6 | 6 | F3 3 + F6 3 |
| `G7` pole | **11** | 11 | 11 | F1 4 + F2 4 + F7 3 |
| **`G4` denominator** | **21** | **21** | **21** | F1..F6 + F8b |
| closure | **25** | `G4` 21 + `ACTIVE`-truth 4 | | disjoint and exhaustive |

**The superseded `18` is unreachable.** It requires removing F6 from the denominator, and the
holdout's own rows show F6 = 3, all three inside `G4`, with `21 − 3 = 18`. A dedicated synthetic
scorer case proves it.

**`|DEN_A| = 29`** — the 6 authored floor plus **23** `INDEPENDENT_REALISM` rows carrying
`shouldHaveMissingEvidence === true`. That number was **discovered from frozen metadata after
selection**, exactly as `D-B.3` requires. It never gated selection and it did not revisit the
offset, the modulus or the population.

---

## 6 — Validation was structural, and stayed structural `PHASES 10–12`

**100 checks · 100 PASS · 0 FAIL.**

| gate | result |
|---|---|
| source identity + row counts (S-5) | **3 of 3 MATCH**, plan digest MATCH |
| sort keys pairwise distinct (S-2) | **150 / 150** and **117 / 117** |
| offsets, partitions, selected counts | **all MATCH** |
| holdout ids == the reserved partitions | **exactly**, both sources; **0** rows outside the offsets |
| **verbatim carriage** | **38/38** and **29/29 byte-identical** to the frozen source carriers |
| aggregate carrier digest vs source-side digest | **equal** — one machine-comparable witness |
| duplicates within the holdout | **0** carriers, **0** `sourceId`s |
| **overlap surfaces** | **49 evaluated · 0 collisions** |
| truth metadata | assigned **only** by table lookup on frozen fields |
| `G7` pole | **11**, all authored, families exactly F1/F2/F7; **0** independent rows |

The 49 surfaces cover the three protected sources plus **all six** prior sealed holdouts
`holdout-l32{,b,c,d,e,f}.json`, **all four** development sets, and the exhausted field corpus.

> **No semantic question was asked of any selected row.** Not whether it looks good, not whether the
> set is hard enough, not whether an item is representative, not whether a different row would be
> better. No post-selection curation occurred.

---

## 7 — Deterministic rebuild `PHASE 14`

Rebuilt independently into a second location from the same frozen inputs:

```
FIRST  69665e41d975f67515bf9864e221a4b05c0811e4c48089e4671c8a2ae1cc094c   105561 bytes
REBUILD 69665e41d975f67515bf9864e221a4b05c0811e4c48089e4671c8a2ae1cc094c   105561 bytes
cmp: 0 differing bytes
```

Row ordering, `rowId`s, `sourceId`s, provenance, poles, selection rules, truth/gate metadata and
carrier bytes: **identical**. **Neither output was chosen for looking preferable** — they are
required to match, and they do.

---

## 8 — The acceptance scorer `PHASES 15–16`

`scorer/acceptance-scorer.js` · `ea5e50ae…` implements **exactly** `D-84`'s `G1`…`G10` and §53.4's
predicates, with the corrected **`G4` denominator of 21**. **It introduces no acceptance policy.**

**38 synthetic cases · 38 PASS · 0 FAIL. No provider was run and no holdout semantics were
consumed** — every fixture is synthesized from `rowId`s and frozen gate flags alone, so each
expected outcome is known **by construction**.

Proved mechanically: the all-pass baseline · **each of `G1`–`G10` failing individually** ·
hard-zero behaviour (one violation fails the gate; 28/29 is not a pass) · `G3` numerator/denominator
arithmetic · `G3` membership · the **21-row `G4` membership** and the unreachability of `18` ·
**F3 and F6 `ACTIVE` being a `G4` false-`ACTIVE` **and** a `G3` recall miss** · `G7` membership with
F4/F5/F8 correctly excluded · missing / extra / duplicate / malformed result handling ·
deterministic scoring · terminal classification · and **`|DEN_A| = 0` treated as a scoring
invalidity rather than a vacuous 100%**.

**No gate threshold was adjusted to make a case pass.**

---

## 9 — Two builder defects found and corrected **before** the artifact was frozen

Recorded rather than concealed. Neither is a rule change; both were defects in **my traversal
code**, and each was fixed by **restarting the frozen deterministic process**, never by patching a
materialized file.

1. **The surface enumerator initially included this attempt's own output**, which self-collided.
   D-D.6's surfaces 5–7 are *prior* sets; the artifact under construction is not one.
2. **The traversal roots initially missed `backend/src/.../eval/`**, where the canonical prior
   sealed holdouts `holdout-l32c/d/e/f.json` and the development sets live. Surfaces went from
   **39 → 49**.

**The holdout hash is `69665e41…` under both the narrow and the complete surface set** — the fuller
contamination check found **0** collisions, so the artifact is unchanged and the stricter check is
the one that stands.

---

## 10 — The holdout is unspent `PHASE 18`

| check | result |
|---|---|
| Anthropic credential accessed · `ANTHROPIC_API_KEY` read | **NO · NO** |
| Claude Code authentication inspected | **NO** |
| provider probed · model called · inference | **NO · NO · NO** |
| holdout rows or source observations transmitted | **0 · 0** |
| acceptance result artifacts anywhere | **0 — none exists** |
| tuning · semantic remediation | **NO · NO** |
| **network-primitive audit** of every script in this package | **ZERO** occurrences of fetch, http/https, axios, net, dns or child_process |

**`HOLDOUT_SPENT = FALSE`.** Gauntlet offset `0` and realism offset `3` are **reserved and
unspent**; gauntlet `1`,`2`,`3` and realism `0`,`1`,`2` remain reserved; the entire `gauntlet.seed`
tranche remains unopened. **Nothing is retired.**

---

## 11 — What is frozen, and what that does not authorize

**Acceptance artifact identity:**
`189a3cbf780d859d45f753ea41e616591cb4fdfa9dd2d86b8d44ef4871f1cb1f`
— the SHA-256 of the sorted manifest of all 16 artifacts (`ACCEPTANCE_ARTIFACT_MANIFEST.txt`).

> **Freezing the exam is not sitting it.** This freeze authorizes **no** provider activity. The
> first inference call containing any row flips `HOLDOUT_SPENT` to `true` and retires both offsets
> permanently, whatever the result — and that call additionally requires a valid credential under
> the Commercial Terms (`D-79`), the execution-time identity gate passing for exactly
> `claude-sonnet-5`, and **explicit user authorization**.

`D-79`…`D-88` are not rewritten; `D-89` is added. **`D-83`'s artifact-level precondition is now
SATISFIED — the holdout exists.** `D-84`'s `G1`–`G10` untouched. **`claude-sonnet-5` was not called
or probed; there is no model performance result in this phase.**
