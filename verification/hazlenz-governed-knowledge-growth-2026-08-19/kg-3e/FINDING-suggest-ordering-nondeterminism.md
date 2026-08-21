# KG-3E finding — `suggest()` result membership depends on physical row order

**Severity: cutover blocker.** Discovered while re-establishing the KG-3D baseline in Phase 2, before
any KG-3E content reached a measurement. Not caused by KG-3E.

---

## What was observed

Re-running `measure:suggest-backing-impact` against **the retained KG-3D database
`test_kg3d_remediation_20260819`, unmodified, with unmodified selection code**, reproduced 19 of
KG-3D's 20 rows but disagreed on one:

| Query | KG-3D recorded | KG-3E re-run |
|---|---|---|
| *exposed live parts (general industry)* | `29 CFR 1910.303` — `APPROVED_GOVERNED_CONTENT` | `1910.303(b)(1)` — `UNAPPROVED_CONTENT` |

Consequently the headline moved: **`governedApprovedBacked` 8 → 7**, and
`wouldBeLostIfCutoverFilteredOnGovernedBacking` 12 → 13.

The re-run was repeated five times in-session and was **stable at 7** every time, so this is not
run-to-run flakiness. The KG-3D database had not been written to — both `1910.303` rows still carry
their KG-3D `updated_at` timestamps (`22:34:10` and `23:17:40` on 2026-08-19).

## Root cause

`ApplicableStandardsService` issues its fallback corpus query as:

```ts
fallbackStandards = await query.take(50).getMany();   // applicable-standards.service.ts:1336
```

**There is no `ORDER BY`.** `grep -c "orderBy" applicable-standards.service.ts` returns **0** — not a
single query in the service specifies an ordering. With `LIMIT`/`take()` and no ordering, PostgreSQL
may return matching rows in any order, and in practice returns them in heap-scan order.

Two records legitimately match the *"electrical panel cover missing, energized conductors exposed"*
observation, because both carry `panel` and `conductor` keywords:

```
ctid  (1,5)  1910.303(b)(1)    keywords: electrical,wire,conductor,energized,panel,shock,arc flash
ctid  (2,3)  29 CFR 1910.303   keywords: exposed live parts,open electrical panel,missing panel cover,…
```

Whichever is scanned first wins. Heap position is not stable: every `UPDATE` relocates a row's live
tuple, and `VACUUM`, `CLUSTER` and plan changes rewrite or re-traverse the heap. KG-3D updated
`29 CFR 1910.303` at 23:17:40 (its §5.3 control-tag fix) and measured at 23:19 — with that row then
positioned ahead of the paragraph record.

## Causal proof

Run on a throwaway copy `test_kg3e_ordering_probe_20260820`. **Only physical row order was changed**
— via `CLUSTER` on a `citation DESC` index, which rewrites the heap without altering any value.

```
BEFORE   (1,2) 1910.303(b)(1)      (1,6) 29 CFR 1910.303
         suggest -> 1910.303(b)(1), 1910.22(a)   | governedApprovedBacked = 7

CLUSTER standards_master USING (citation DESC)

AFTER    (3,3) 29 CFR 1910.303     (4,2) 1910.303(b)(1)
         suggest -> 29 CFR 1910.303, 1910.22(a)  | governedApprovedBacked = 8
```

Logical content is provably unchanged across the reorder:

```
test_kg3d_remediation_20260819      22b072e27b6c1a468792073bbd463dc0
test_kg3e_ordering_probe_20260820   22b072e27b6c1a468792073bbd463dc0
```

Same corpus content, same code, same query, same release — **different citation returned, and a
different governed-coverage number**, determined solely by where the rows sit on disk.

## Why this matters more than a flaky metric

The two records are not interchangeable, and this is the same granularity hazard KG-3D documented
for this exact citation pair:

- `29 CFR 1910.303` is the **section**, reviewer-approved in KG-3D, and carries the guarding,
  working-space and warning-sign content the electrical predicate actually needs.
- `1910.303(b)(1)` is the **paragraph** *Examination*, a `starter-unverified:` placeholder record
  with no registered provenance and no approval.

So for one and the same observation, HazLenz may return either an approved section record or an
unprovenanced paragraph record about a different requirement. Under a governed-only cutover the
customer-visible consequence is that the same finding shows **"Verified standard text" on one day and
no standard text on another**, with nothing in the data or the code having changed — only an
autovacuum.

It also means **any coverage or shadow measurement that counts `suggest()` output is only valid for
the heap layout it was taken on.** KG-3D's "8 of 20 governed-backed" and "12 would be lost" were
correct measurements of a transient physical state, not stable properties of the corpus. KG-3E's own
Phase 11 numbers inherit the same caveat and are reported with it.

## What KG-3E did and did not do about it

**Did not fix it.** The KG-3E brief is explicit: *"Do not broadly rewrite HazLenz standards
selection."* Adding a deterministic ordering to `suggest()` changes which citations customers
receive for real observations across the whole corpus — a selection-behaviour change well beyond
corpus remediation, and one that needs its own gold-set regression pass. Introducing it here would
also have made every KG-3E coverage measurement incomparable with KG-3D's.

**Did do:**

1. Diagnosed and proved the root cause rather than treating the changed baseline as drift.
2. Recorded that KG-3D's suggest-derived figures are layout-dependent, so the 8→7 difference is
   explained and is **not** a KG-3E regression.
3. Pinned KG-3E's own suggest measurements to a recorded heap state and reported the instability
   alongside them.
4. Carried it into the Phase 12 readiness verdict as a **blocking** condition: a cutover that
   filters on governed backing cannot be safe while the thing being filtered is chosen
   non-deterministically.

## Recommended remedy (KG-3F)

Give the corpus query a **total** ordering — deterministic and semantically defensible, not merely
stable. A raw `ORDER BY citation` would be stable but would systematically prefer paragraph records
over their parent sections (`1910.303(b)(1)` sorts before `29 CFR 1910.303`), which is the wrong
default given the granularity contract in Phase 4. Ordering should prefer, in sequence: exact
citation match, then registered over placeholder provenance, then reviewer-approved over unapproved,
then specificity appropriate to the established predicate, with `citation` last purely as a
tie-break. That change belongs with a full gold-set regression run.
