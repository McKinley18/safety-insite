# KG-4B — the isolated shadow corpus and its analytics (Phases 3, 4, 5, 6, 9, 10, 14, 15, 17)

Machine-readable: `corpus/shadow-events.jsonl` (83 events) ·
`corpus/case-results.json` · `analytics/shadow-analytics.json` · `determinism/layout-invariance.json` ·
`perf/shadow-performance.json` · `privacy/privacy-review.json`

## 1. The corpus (Phases 4, 5)

| | |
|---|---|
| gold-set cases (hash-verified `93184abc…`, **read-only**) | **31** |
| KG-4B fixtures (added separately) | **12** |
| total analyses | **43** |
| findings | **54** |
| candidate standards | **74** |
| citation comparisons | **83** |

Regimes: osha_general_industry, msha, osha_construction, unknown
Shapes: positive_hazard, negative_control, multi_hazard, controlled_state, ambiguous_unknown_jurisdiction, parent_child, alternative_compliance, evidence_unknown, overlapping_vocabulary, mixed_provenance

Every declared gold-set case is captured — the parser asserts its count against the declared id count,
after an earlier version silently dropped `GI-NOISE-01` (its observation is double-quoted because it
contains an apostrophe).

**KG-4B fixtures deliberately cover what the gold set does not**: multi-hazard observations,
affirmatively controlled/safe states, genuine ambiguity, unestablished jurisdiction, section-vs-
paragraph competition, alternative compliance that *satisfies* the rule, overlapping-family
vocabulary, and a mixed-provenance observation. None was engineered to force an unused expert rule
into the corpus — the 137 declared-but-unemitted citations remain a separate backlog, and
manufacturing traffic to inflate coverage would make the corpus dishonest.

## 2. Customer-output invariance (Phase 3)

> **43/43 cases identical (100%) ·
> 0 SHADOW payloads carried governed keys**

The oracle is comparative and empirical, not a hand-written ignore-list:

1. one server, one database, one active release, `GOVERNED_CUTOVER_MODE=SHADOW`, **one** account
   allowlisted;
2. the legacy request is issued **twice** to derive the volatile field set **empirically** — only
   fields that already differ between two LEGACY runs are excluded;
3. everything stable in LEGACY must be identical in SHADOW, compared as flattened `path -> scalar`
   over the whole payload so a difference is reported by exact path.

Citation set **and order** identical on every case.

### A real defect this found

SHADOW correctly withheld governed *backing* and governed *text*, but `projectGovernedDisplay()` still
stamped `governedDeliveryState`, `governedFallbackReason` and `governedTextUnavailable` onto every
standard decision, and a null-valued `knowledgeReleaseId` alongside them. **Adding keys to a response
is altering customer output** — a SHADOW customer's payload was distinguishable from a LEGACY
customer's by inspection. Fixed with `customerVisible`, which is false in SHADOW and makes the
projection contribute an empty object.

## 3. Mismatch distribution (Phase 14)

Denominator = **83 citation comparisons**, stated explicitly because
"exact-match rate" is meaningless without it.

| category | count | rate |
|---|---|---|
| `EXACT_MATCH` | 41 | 49.4% |
| `GOVERNED_MISSING` | 15 | 18.07% |
| `GRANULARITY_DIFFERENCE` | 14 | 16.87% |
| `APPLICABILITY_DIFFERENCE` | 13 | 15.66% |

| severity | count |
|---|---|
| INFORMATIONAL | 56 |
| REVIEW | 27 |
| **BLOCKING** | **0** |

| root cause | count |
|---|---|
| `NONE` | 41 |
| `EXPECTED_FALLBACK` | 15 |
| `CITATION_GRANULARITY` | 14 |
| `APPLICABILITY_EVIDENCE` | 13 |

Key rates: exact-match **49.4%** · substantive mismatch **50.6%** ·
governed-missing **18.07%** · granularity **16.87%** ·
applicability **15.66%** · jurisdiction **0%** ·
content **0%** · resolver failure **0%** ·
integrity failure **0%** · **blocking 0%**

Categories the corpus did NOT exercise, listed rather than left as missing keys:
`CONTENT_EQUIVALENT`, `CONTENT_DIFFERENCE`, `CITATION_DIFFERENCE`, `GOVERNED_APPROVED_EXACT`, `GOVERNED_UNAPPROVED`, `GOVERNED_CITATION_ONLY`, `JURISDICTION_DIFFERENCE`, `ORDERING_DIFFERENCE`, `RESOLVER_FAILURE`, `INTEGRITY_FAILURE`, `PROVENANCE_DIFFERENCE`

### BLOCKING mismatches: **0**

None. Every difference in this isolated corpus is either a designed fallback (`GOVERNED_MISSING`,
root cause `EXPECTED_FALLBACK`) or a review item (`GRANULARITY_DIFFERENCE`, `APPLICABILITY_DIFFERENCE`).
Blocking mismatches are listed **individually** whenever any exist — never summarised into a
percentage alone.

### What the REVIEW population actually is

| mismatch | root cause | count | meaning |
|---|---|---|---|
| `GRANULARITY_DIFFERENCE` | `CITATION_GRANULARITY` | 14 | HazLenz cited a paragraph; only its parent section is governed. **No promotion occurs** — the paragraph gets no badge. |
| `APPLICABILITY_DIFFERENCE` | `APPLICABILITY_EVIDENCE` | 13 | The corpus fully backs the exact citation while an applicability trigger is unestablished. Not wrong — the axes are independent — but it is where presentation must be checked. |

**54 of 54** events carrying both a legacy and a governed digest **agree**. Where governed content
exists, it is the same text the customer already sees.

## 4. Event volume and idempotency (Phases 9, 10)

| | |
|---|---|
| analyses observed | 38 |
| events | 83 |
| distinct event keys | 83 |
| **duplicates** | **0** |
| events/analysis | min 1 · p50 2 · max 5 · mean 2.18 |
| cardinality | one event per (analysis x distinct citation) — holds: **True** |

**Cardinality is one event per (analysis × distinct citation)** — not per resolver step and not per
candidate occurrence. A citation appearing on a primary standard, its decision row and a hazard
candidate produces **one** event, because the context memoises by citation.

**Idempotency**: `eventKey = sha256(correlationId, findingKey, citation, releaseId)`. A retried
analysis reproduces the *same* keys, so retries deduplicate rather than double-count.

**Storage (Phase 9)**: structured JSONL from stdout, collected by the isolated run. **No production
database schema was created for a verification artifact.** The options considered were a dedicated
shadow-comparison table, the existing observability pipeline, and JSONL; JSONL is the narrowest thing
that answers KG-4B's questions, and a durable production store is a decision for the slice that
actually needs one — with its own retention contract.

## 5. Layout determinism (Phase 15)

**52 probes × 7 physically different layouts → ONE telemetry digest
`0bce5a71a9d2664293834b5eeaa443eb…`**

Layouts: original, citation_asc, citation_desc, parent_before_child, child_before_parent, random_seed_1, random_seed_2. Each is a clone whose `regulatory_release_records` heap is
physically rewritten in a different order. Compared per probe: resolved citation, backing, health,
granularity, release, manifest, mismatch, **all ten dimensions**, severity, root cause — plus the
aggregate distributions, because a per-row match with a different total would still mean something
moved. No heap-order-dependent telemetry.

## 6. Performance (Phase 17)

| shape | mean | p50 | p95 | worst |
|---|---|---|---|---|
| LEGACY   10 findings (context never created) | 0.0003 ms | 0.0003 ms | 0.0006 ms | 0.0009 ms |
| SHADOW   10 findings (6 distinct citations) | 1.1872 ms | 1.1725 ms | 1.2753 ms | 1.8269 ms |
| GOVERNED 10 findings (KG-4A comparison) | 0.8784 ms | 0.873 ms | 0.9578 ms | 0.965 ms |
| SHADOW   multi-hazard 10 findings / 6 distinct | 1.1113 ms | 1.076 ms | 1.5698 ms | 1.7815 ms |
| governed resolver — one citation | 0.1178 ms | 0.1162 ms | 0.1306 ms | 0.141 ms |
| classification — one comparison | 0.0033 ms | 0.0032 ms | 0.0038 ms | 0.0039 ms |
| telemetry — build + guard + serialise | 0.0193 ms | 0.0187 ms | 0.0283 ms | 0.03 ms |

* **SHADOW overhead: 1.1869 ms/analysis at 10 findings (0.1187 ms/finding)**
* GOVERNED overhead: 0.8781 ms/analysis (KG-4A measured 0.793 ms — consistent)
* SHADOW cost **above** GOVERNED: 0.3088 ms — the comparison plus telemetry
* telemetry (build + privacy guard + serialise): **0.0193 ms/event**

### Query counts — counted, not estimated

The DataSource logger is intercepted, so an N+1 would show as a rising count:

| findings | distinct citations | queries |
|---|---|---|
| 1 | 1 | 2 |
| 5 | 5 | 6 |
| 10 | 6 | 7 |

Queries track **distinct citations**, not findings: 10 findings over 6 distinct citations costs 7
queries (one pin + six resolutions). **No N+1.**

Against a classify path dominated by seconds of AI inference this is not a material cost. Nothing was
optimised further.
