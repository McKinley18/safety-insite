# What must be decided before construction can be re-attempted

> ## `L3_ACCEPTANCE_HOLDOUT_CONSTRUCTION_BLOCKED — AMENDMENT_IMPLEMENTATION_CONTRADICTION`
> ## One decision. It is the user's, because it fixes a gate-bearing cardinality.

---

## `D-E` — reconcile the `G4` denominator in Amendment 1 `USER ACTION`

Amendment 1 states the G4 denominator as **exactly 18** (line 494) while enumerating a set that sums
to **21** (line 495: F1, F2, F3, F4, F5, F6, F8b). The difference is exactly **F6 (n = 3)**.

| option | consequence | consistency with the rest of Amendment 1 |
|---|---|---|
| **A — the cardinality is wrong; the correct value is `21`** | F6 stays in the G4 denominator. Only the number `18` is corrected to `21` | **CONSISTENT.** Preserves line 480 (F6's G4 column = `YES`) and lines 497–499 (asserting `ACTIVE` on F6 **is** a G4 false-`ACTIVE`). Requires changing one number |
| **B — the enumeration is wrong; F6 leaves the G4 denominator** | The denominator becomes 18 | **INCONSISTENT.** Contradicts line 480 **and** lines 497–499, and would mean a model asserting `ACTIVE` on a row whose deciding fact is absent is not a false `ACTIVE` — which is what G4 exists to catch |

**The evidence points to A**, and this phase says so rather than doing it: three of the four clauses
already agree that F6 belongs in G4, and only the arithmetic disagrees. **But G4 is a hard zero gate
(`D-84`), the number is gate-bearing, and `D-72` reserves requirement changes to the user.**

Whichever is chosen must land as **Amendment 2** to `INDEPENDENT_EVIDENCE_PLAN.md`, before any
construction phase re-runs.

### Recommended alongside it — close the review gap that let this through

The `D-86` executability review verified each derived membership was *predeclared*; it did not
**cross-check each derived cardinality against its own enumerated set**. Adding that single check
would have caught this before a freeze was written. It is cheap, mechanical, and belongs in the
re-run's Phase 7.

---

## Then — re-authorize construction as a NEW attempt

Attempt 1 is invalidated. Its freeze record `f0e33f14…` is **not** reusable and **must not be
rewritten**; a re-run writes a **new** `HOLDOUT_FREEZE.txt` under Amendment 2, before any selection
code runs, and proceeds through builder → 25 authored controls (the positive stride still unopened)
→ materialise → validate → deterministic rebuild → scorer → synthetic tests.

**Everything else in Amendment 1 survives untouched and was re-verified by this phase:** the
`D-A`/`D-B` reservation rules, both offsets (`0` and `3`), the 38 + 29 + 25 = 92 composition, the
`D-C` correction, both `G3` predicates, the `G3` authored floor of **6**, and the `G7` pole of **11**.
**Only the G4 cardinality is in dispute.**

---

## Still further out, and unchanged

After a successful construction the next phase is **execution-time Anthropic credential + exact-model
identity readiness** — which must itself stop before sending any frozen holdout row. Only after that
gate passes may a final explicit user authorization permit the first single-use acceptance inference
call.

---

## Explicitly NOT done by this phase

No holdout materialized · no acceptance builder executed · no row selected from any protected source ·
no source identifier materialized · no observation text read, printed or inspected · no scorer written
· freeze record **not** rewritten · `G1`–`G10` unchanged · both `G3` denominators unchanged · `G7`
membership unchanged · Amendment 1 unchanged · prompt, schema, validator, binder and sanctioned input
builder unchanged · no provider called · no credential accessed · no production provider selected ·
L3-3 not begun · nothing committed, pushed, merged, rebased, reset, deployed or stashed.
