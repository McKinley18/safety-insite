# What happens next

> ## `L3_INDEPENDENT_EVIDENCE_PLAN_AMENDED_V2 — HOLDOUT_CONSTRUCTION_REAUTHORIZATION_REQUIRED`
> ## The plan is executable again. **The holdout is still not built, and this phase did not build it.**

---

## Next prerequisite — separately authorize construction **Attempt 2** `USER ACTION`

Amendment 2 closes `D-E` and adds `D-F`, and the full re-run review returned **84/84**. **That
authorizes nothing by itself.**

**Attempt 2 must:**

1. **use the combined plan through Amendment 2** — base plan + Amendment 1 + Amendment 2;
2. **begin from a new construction authorization**;
3. **create a NEW freeze record** — and **never reuse or rewrite** Attempt 1's `f0e33f14…`, which
   stays as immutable failed-attempt evidence;
4. **perform the `D-F` derived-cardinality checks BEFORE any source-row selection**, and **stop
   before selection** if any declared/derived mismatch exists;
5. **keep validation structural-only after materialization** — no semantic *"looks right"* inspection
   of the selected rows, ever;
6. **stop before all Anthropic activity.**

Order inside Attempt 2 is unchanged: new `HOLDOUT_FREEZE.txt` **first** → builder with the `S-5`
drift guard and throw-enforced overlap → the 25 controls from the family table with the positive
stride **unopened** → materialise, hash, record (92 rows: 38 + 29 + 25) → structural and verbatim
validation → deterministic byte-identical rebuild → the acceptance scorer against `D-84`'s frozen
`G1`–`G10` and §53.4's predicates, unit-tested on **synthetic fixtures only**.

---

## Then, and only then

The phase after a successful Attempt 2 is **execution-time Anthropic credential + exact-model
identity readiness** — which must itself **stop before sending any frozen holdout row**. It verifies
the frozen hashes and establishes that exactly **`claude-sonnet-5`** is callable under a credential
governed by the required Anthropic Commercial Terms (`D-79`).

Only after that readiness gate passes may a **final explicit user authorization** permit the first
single-use acceptance inference call — the call that flips `HOLDOUT_SPENT` to `true` and retires
gauntlet offset `0` and realism offset `3` permanently, whatever the result.

---

## If Attempt 2 finds another gap

**It must STOP, not choose.** `D-F` is explicit: a contradiction is a new amendment, decided by the
user, and *"do not repair a second contradiction opportunistically."* `D-72` stands.

---

## One residual worth knowing

**Amendment 1's line 494 still reads *"exactly `18`"* and was deliberately left unmarked**, because
this phase was instructed not to rewrite or erase Amendment 1. The plan is therefore only correct
**read through Amendment 2**, which supersedes that number explicitly. Amendment 2's title, `D-E.2`,
blueprint §55 and the current-state record all state the correction; a reader who stops at
Amendment 1 would take the wrong value. **If an in-place supersession marker on that line is wanted,
that is a one-line change and a user decision.**

---

## Explicitly NOT done by this phase

No holdout constructed · no freeze record created · no row selected or materialized · no reserved
semantic evidence inspected · `G4` membership unchanged · no authored control changed · `G1`–`G10`
unchanged · both `G3` denominators unchanged · `G7` membership unchanged · Amendment 1 not rewritten
or erased · prompt, schema, validator, binder and sanctioned input builder unchanged · no provider
called or probed · no credential accessed · no production provider selected · L3-3 not begun ·
nothing committed, pushed, merged, rebased, reset, deployed or stashed.
