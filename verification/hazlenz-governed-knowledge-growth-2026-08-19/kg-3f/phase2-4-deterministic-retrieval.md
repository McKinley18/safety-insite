# KG-3F Phases 2–4 — deterministic candidate universe, implementation, and semantic regression

## Phase 2 — architecture chosen, by measurement

The brief required evaluating four options. Each was tested against the measured pipeline, not
assumed.

| Option | Verdict | Evidence |
|---|---|---|
| **A** — remove `take(50)` and rank the full population | **Rejected — it is a no-op** | `standards_master` holds **34 rows**, max **13 per scope**, and `safescope_knowledge_chunks` holds **0**. The caps *never bind*. Candidate-set membership at merge time is already stable; removing a cap that never truncates fixes nothing. |
| **B** — deterministic SQL preselection | **Adopted as defence-in-depth** | Not load-bearing today (see A), but it removes the leak at its source and keeps behaviour stable if the corpus later outgrows the caps. |
| **C** — move semantic filtering before the cap | **Rejected — not applicable** | Nothing is lost to truncation today, so there is no pre-cap loss to prevent. |
| **D** — deterministic tie-break after semantic score | **Adopted as the primary fix** | The defect is that the final comparator ends at `b.score - a.score` with no terminal tie-break; `Array.prototype.sort` is stable, so equal-scoring candidates retain **input order**, which is heap order. |

**Where physical order actually leaked** (three places, all downstream of retrieval):

1. Arrival order → stable-sort input order (no terminal tie-break).
2. Dedup `findIndex(isCitationMatch) === index` keeps the **first** survivor.
3. `.slice(0, finalLimit)` truncates by order.

## Phase 2b — a correctness defect found while designing the fix

`isCitationMatch` compared citations by **bidirectional substring containment** of a canonical form
that strips the dot:

```
canonicalizeCitation("29 CFR 1926.501") -> "1926501"
canonicalizeCitation("29 CFR 1926.50")  -> "192650"
"1926501".includes("192650")            -> true
```

Measured collisions:

| Pair | Collapsed? | Correct? |
|---|---|---|
| `1910.303` vs `1910.303(b)(1)` | yes | intended (parent/paragraph) |
| `56.14132` vs `56.14132(a)` | yes | intended |
| `1926.451(g)(1)` vs `(g)(2)` | no | correct — siblings stay distinct |
| **`1926.50` vs `1926.501`** | **yes** | **WRONG — different sections** |
| **`1910.95` vs `1910.9`** | **yes** | **WRONG** |
| **`1910.132(a)` vs `1910.13`** | **yes** | **WRONG** |

Because the dedup keeps only the first of a "matching" pair, a digit-prefix collision could
**silently drop a legitimately distinct citation** from a customer's results.

Replaced with structured comparison in `src/applicable-standards/citation-structure.ts`: a citation
is parsed to `(part, section, subsection path)` and two citations match only when they share part and
section **and** one subsection path is a prefix of the other. All four `isCitationMatch` call sites
(dedup, expected-citation scoring, priority, scaffold priority) keep the behaviour they relied on —
`1926.451(g)(1)` still matches the section `1926.451` — while the collisions disappear.

## Phase 2c — the terminal tie-break

Added **after** all semantic comparisons, so it fires only when two candidates are semantically
indistinguishable:

1. **Less specific citation first.** If the evidence did not distinguish a section from one of its
   own paragraphs, the section is the safer citation — promoting to a narrower paragraph asserts
   qualifiers the observation never established. This is the same rule KG-3D applied when refusing
   `1910.303(g)(2)(i)` and KG-3E when refusing `56.14132(b)(1)`.
2. **`citationSortKey` ascending** — a stable total order (sections zero-padded so `1926.50` sorts
   before `1926.501` numerically, not lexically).

This satisfies the brief's constraint that *"parent does not beat a properly established exact
paragraph merely because it is broader"*: a properly established paragraph scores higher and wins
**before** the tie-break is reached.

A naive `ORDER BY citation` was explicitly rejected — as KG-3E warned, it prefers paragraph records
to their parents on lexical grounds alone.

## Phase 3 — adversarial physical-layout harness

`test-kg3f-retrieval-determinism.ts` builds **nine** logically identical corpora with deliberately
different heap layouts — original, citation-asc, citation-desc, parent-before-child,
child-before-parent, reverse-insertion, and three fixed-seed randomised layouts — then runs the
**real** `ApplicableStandardsService.suggest()` against each via a separate process per layout, and
requires byte-identical membership **and** ordering for all 20 probe queries.

Two guard assertions prevent a vacuous pass: the corpora must have an identical content digest, and
the layouts must have genuinely different heap heads.

### Result

```
BEFORE the fix:  72 passed,  98 failed      <-- 98 of 170 invariance checks failed
AFTER  the fix: 170 passed,   0 failed
```

Both runs confirmed `all 9 layouts hold logically IDENTICAL content (digest 5ce50455fddf…)` and
`the layouts genuinely differ physically (9 distinct heap heads)`.

The pre-fix failures were far broader than the single KG-3E symptom: parent/child flips on `FP-03`
and `LO-01` (`1910.303(b)(1)` ↔ `1910.303`, the KG-3E reproduction, still live), plus pure ordering
flips on `EG-01`, `EG-02`, `EX-01`, `NO-01`, `NO-02`, `ME-01`, `SI-01`.

**Note on why the KG-3E query set looked clean.** Re-running the nine canned
`measure:suggest-backing-impact` queries across asc/desc layouts showed **zero** differences — the
KG-3E remediation had changed `1910.303(b)(1)`'s keywords so it no longer matched the specific
*"exposed live parts"* query. The defect was **latent for that query set, not repaired**. A harness
that only re-ran the old query would have wrongly concluded the bug was gone.

## Phase 4 — semantic regression, and a scoring defect the fix exposed

Making order deterministic exposed a pre-existing ranking gap. For
*"dry-cutting concrete with a masonry saw, generating a visible dust cloud, with no water
suppression"*, **all five construction candidates scored exactly 15** — the silica standard could not
outrank the noise standard, because scoring compared only the **title** against the observation
(`+6` per word) and none of `respirable`/`crystalline`/`silica`/`occupational`/`noise` appears in the
text. Previously the "right" answer surfaced first often enough by heap luck to look acceptable.

**Root cause:** `keywords` — the column the SQL `WHERE` clause actually matches on
(`s.keywords ILIKE :term`) — **was never in the SELECT list**, so `standard.keywords` was `undefined`
by the time scoring ran. The corpus's richest relevance signal was used to *retrieve* and was
literally unavailable to *rank*.

**Fix (two lines of intent):** select `s.keywords`, and score whole comma-delimited tags that appear
in the observation — weighted below title matches (`+4` vs `+6`), whole tags only so `"masonry saw"`
counts as one specific phrase, and capped at `+40` so verbose records cannot outrank better-matched
ones by tag count alone.

### Measured effect

| Query | Before | After |
|---|---|---|
| SI-01 silica | `1926.52` (noise) 15, `1926.1153` 15 — five-way tie | **`1926.1153` 51**, decisive; `1926.52` drops out of the top four |
| NO-01 noise | `1910.95` 27 | `1910.95` **39** |
| FP-03 stairway | tie-dependent | `1910.22(a)` **119**, `1910.28` 37 |
| EG-01 egress | `1910.36` 27 | `1910.36` 27, first |

### Regression after both changes

| Gate | Result |
|---|---|
| `test-kg3f-retrieval-determinism` | **170/170**, 0 failed (unchanged by the scoring fix) |
| `test:kg3e-citation-granularity` | **48/48** — incl. all 15 positive/negative selection pairs and the 1910.303 granularity contract |
| `test:safescope-standards` | **15 passed, 0 failed** |
| `test:standards-corpus-integrity` | pass |
| `test:governed-corpus-matrix` | **59/59** |
| `test:standards-backing-contract` | **35/35** |
| `test:reviewer-approval` | **62/62** |
| `test:kg3d-corpus-remediation` | **31/31** |
| Backend build | pass |
| `test:hazlenz-core` | **206 suites passing; the two documented baseline failures only**, byte-identical (`golden-hardening` *"7. LOTO energized maintenance"* 16/1; `production-path` *"FAIL tagged but not locked"*) |

## A separate pre-existing finding, recorded not fixed

`MG-01` — *"Rotating shaft on the mixer has no guard and the operator works beside it"* — returns
only `29 CFR 1910.28` (fall protection), **not** `1910.212(a)(1)` (machine guarding). This is
**identical to the KG-3E baseline** (`suggest-impact.json` records the same single result for
*machine guarding (general industry)*), so it is not a KG-3F regression. It is a genuine wrong-family
result and belongs to the selection-quality work, not the determinism work.
