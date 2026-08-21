# KG-3F Phase 1 — the complete `suggest()` candidate pipeline

Traced from `ApplicableStandardsService.suggest()`,
`backend/src/applicable-standards/applicable-standards.service.ts:984–2299` (≈1,315 lines).

---

## 1. The stages, and where each runs

| # | Stage | Line | SQL or JS? | Ordering guarantee |
|---|---|---|---|---|
| 1 | Tokenise the observation into search terms (`length > 4`, plus critical short words) | 1042 | JS | n/a |
| 2 | Knowledge-chunk retrieval `queryBuilder.take(50).getMany()` | 1142 | **SQL** | **none** |
| 3 | Score + sort knowledge chunks by `score` desc | 1162–1171 | JS | ties unbroken |
| 4 | Focused (route-hint) standards `focusedQuery.take(25).getMany()` | 1277 | **SQL** | **none** |
| 5 | Jurisdiction gating (`agency_code`, `scope_code`) | 1244, 1303 | SQL | n/a |
| 6 | Fallback standards `query.take(50).getMany()` — `title ILIKE` / `keywords ILIKE` | 1335 | **SQL** | **none** |
| 7 | Merge focused + fallback into `candidateStandardsMap = new Map<citation, Standard>()` | 1340 | JS | **insertion order = arrival order** |
| 8 | Hard-coded scenario boosts (`score: 240/122/120/118…`) | 1385–1609 | JS | n/a |
| 9 | Per-candidate semantic scoring (route hints, keyword hits, family boosts/penalties) | 1620–1946 | JS | n/a |
| 10 | Final `.sort()` — scaffold priority, then priority, then `b.score - a.score` | 2212–2226 | JS | **no terminal tie-break** |
| 11 | Dedup: `arr.findIndex(other => isCitationMatch(other.citation, item.citation)) === index` | 2227–2230 | JS | **keeps FIRST** |
| 12 | Jurisdiction re-filter (`msha` / `osha_general_industry` / `osha_construction`) | 2231–2243 | JS | n/a |
| 13 | `applyCandidateEvidenceFit(...)` | 2244 | JS | preserves order |
| 14 | Partition active-before-inactive, then `.slice(0, finalLimit)` (`finalLimit = 10`) | 2248–2252 | JS | **truncates by order** |
| 15 | Governed resolution / backing annotation | 2254+ | SQL+JS | reads the chosen set |

---

## 2. Why the 50-row cap exists — and why it is **not** today's problem

Measured on the KG-3F corpus (`test_kg3f_remediation_20260820`):

```
standards_master               34 rows       max per scope_code: 13
safescope_knowledge_chunks      0 rows
safescope_knowledge_documents   0 rows
```

- Stage 6's `take(50)` **can never truncate** — there are only 34 rows in total, and jurisdiction
  gating narrows that to at most 13.
- Stage 4's `take(25)` is additionally citation-filtered and cannot truncate either.
- Stage 2's `take(50)` operates on a table with **zero rows**; the knowledge-chunk path is entirely
  inert on this corpus.

**Conclusion: the caps do not currently bind, so removing them would fix nothing.** The full
candidate population is already retrieved on every query regardless of physical order, which means
*candidate-set membership at stage 7 is stable*. What is unstable is which candidates **survive**
stages 11 and 14.

This measurement is what rules out architecture option **A** (remove the cap) as the fix. It is a
no-op against the actual defect.

---

## 3. Where physical row order leaks in — three distinct places

### Leak 1 — arrival order becomes sort input order

`Array.prototype.sort` is **stable** in V8. The comparator at stage 10 ends with
`return b.score - a.score` and has **no terminal tie-break**, so any two candidates with equal
scaffold priority, equal priority and equal score retain their **input order**. Input order is
`[...knowledgeMatches, ...codeFallbackStandards, ...standardMatches]`, and `standardMatches` derives
from `candidateStandardsMap`, whose insertion order is the order rows came back from stages 4 and 6
— i.e. **heap-scan order**.

### Leak 2 — the dedup keeps whichever tied candidate sorted first

Stage 11 keeps the **first** occurrence. Combined with Leak 1, for two candidates the dedup considers
equivalent, *heap position decides which one the customer sees*.

### Leak 3 — truncation at `finalLimit`

Stage 14 slices to 10. Equal-scoring candidates at the boundary are included or dropped according to
the same unstable order.

---

## 4. The dedup is also **semantically wrong**, independently of determinism

`isCitationMatch` (line 17) canonicalises by stripping the agency prefix and every non-alphanumeric
character, then tests **bidirectional substring containment**:

```ts
function canonicalizeCitation(cit: string) {
  return cit.toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, "")
    .replace(/[^a-z0-9]/g, "");
}
function isCitationMatch(dbCit, targetCit) {
  const c1 = canonicalizeCitation(dbCit), c2 = canonicalizeCitation(targetCit);
  return c1.includes(c2) || c2.includes(c1);          // <-- substring, both directions
}
```

Measured behaviour:

| Pair | canon 1 | canon 2 | Treated as the same citation? |
|---|---|---|---|
| `1910.303` vs `1910.303(b)(1)` | `1910303` | `1910303b1` | **YES** — parent collapsed into child |
| `1910.303` vs `1910.303(g)(2)(i)` | `1910303` | `1910303g2i` | **YES** |
| `56.14132` vs `56.14132(a)` | `5614132` | `5614132a` | **YES** |
| `1926.652(a)(1)` vs `1926.652` | `1926652a1` | `1926652` | **YES** |
| `1910.28` vs `1910.28(b)(1)` | `191028` | `191028b1` | **YES** |
| `1910.22(a)` vs `1910.22` | `191022a` | `191022` | **YES** |
| **`1910.95` vs `1910.9`** | `191095` | `19109` | **YES — unrelated sections** |
| **`1926.50` vs `1926.501`** | `192650` | `1926501` | **YES — unrelated sections** |
| **`1910.132(a)` vs `1910.13`** | `1910132a` | `191013` | **YES — unrelated sections** |
| `1926.451(g)(1)` vs `1926.451(g)(2)` | `1926451g1` | `1926451g2` | no (correct) |

Two separate defects:

1. **Parent/paragraph collapse.** This directly contradicts the KG-3E Phase 4 granularity contract
   (*"prefix similarity cannot substitute one paragraph requirement for another"*). KG-3E asserted
   that contract at the **governed-resolver** layer; `suggest()` violates it at the **dedup** layer,
   which is upstream of everything the customer sees.
2. **Digit-prefix collision between unrelated sections.** Because the dot is stripped, `192650` is a
   literal prefix of `1926501`. `29 CFR 1926.50` (scope) and `29 CFR 1926.501` (duty to have fall
   protection) are different sections; so are `1910.95` (noise) and `1910.9`. The dedup can silently
   drop a legitimately distinct citation.

`isCitationMatch` is used in four places — dedup (2229), expected-citation scoring (1635), priority
lookup (2169), and scaffold priority (2192/2196) — so any change must be measured against all four,
not just the dedup.

---

## 5. Measured pre-fix behaviour

`test:kg3f-retrieval-determinism`, nine logically identical corpora with different heap layouts
(content digest `5ce50455fddf…` identical across all nine, nine distinct heap heads):

```
72 passed, 98 failed
```

**98 of 170 invariance checks fail.** The failures are not confined to the KG-3E symptom:

- **Parent/child flips** — `FP-03` and `LO-01` return `29 CFR 1910.303(b)(1)` under one layout and
  `29 CFR 1910.303` under another. This is precisely the KG-3E reproduction, still live.
- **Pure ordering flips** — `EG-01`, `EG-02`, `EX-01`, `NO-01`, `NO-02`, `ME-01`, `SI-01` return the
  same set in different orders. Order is customer-visible (it decides the primary standard).

So the KG-3E finding understated the problem: it observed one membership flip; the defect actually
perturbs **more than half** of the measured query surface.

**Why the nine canned `measure:suggest-backing-impact` queries showed no difference between
`citation-asc` and `citation-desc`:** those two layouts happen to place the competing records such
that the ties resolve the same way, and the KG-3E remediation changed
`29 CFR 1910.303(b)(1)`'s keywords so it no longer matches the specific *"exposed live parts"* query
KG-3E used. The defect was latent for that query set, not repaired. A harness that only re-ran the
old query would have wrongly concluded the bug was gone — which is why KG-3F measures across nine
layouts and 20 queries instead.

---

## 6. What a correct fix must do

1. **Give the final ranking a total order** — a deterministic terminal tie-break, applied only after
   semantic relevance has been established, so it never overrides a genuine scoring difference.
2. **Stop the dedup collapsing distinct citations** — parent ≠ paragraph, and `1926.50` ≠ `1926.501`.
3. **Make retrieval order stable at the source** — an explicit `ORDER BY` on the SQL stages, so
   arrival order stops being heap order even if the corpus later grows past the caps.

A naive `ORDER BY citation` alone satisfies none of these correctly: it is stable but, as KG-3E
warned, it systematically sorts `1910.303(b)(1)` ahead of `29 CFR 1910.303`, preferring paragraph
records to their parents purely on lexical grounds. Determinism must come *after* semantics, not
instead of it.
