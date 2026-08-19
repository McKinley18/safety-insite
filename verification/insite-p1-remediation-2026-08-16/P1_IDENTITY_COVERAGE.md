# Phase 14 — Identity Coverage Gap Closure

Both gaps left open by the P0 phase (`P0_ADVERSARIAL_IDENTITY_MATRIX.md`) were closed with real, live API-driven tests against the canonical `/inspections/*` persistence lifecycle (the same durable-finding-identity model P0-02 fixed), disposable DB `test_p1_20260816`. Script: `verification/insite-p1-remediation-2026-08-16/identity_coverage_test.mjs`. No production code was modified to make these tests easier — the tests use exactly the same API sequence (`observations` → `analyses` → `reviews` → `findings`) the real frontend uses.

One workflow correction made while building the test (not a product defect): `POST /inspections/observations/:id/findings` (`finalizePersistedFinding` in the client) is itself the finalize action — it creates the finding row already in `finalized` status. There is no separate "create pending, then finalize" step for an explicitly-reviewed finding; "acting on" a finding means calling this endpoint with that observation/review's ID.

## Scenario 1 — three durable sibling findings, middle (B) finalized first

Created three independent observation → analysis → review chains under one inspection (machine-guarding, lockout-tagout, fall-protection), left all three un-finalized, then finalized **B (lockout-tagout) first**.

- After finalizing B only: B's finding exists, `status: "finalized"`, correct `hazardCategory: "lockout_tagout"`. No finding row exists yet for A or C (their reviews had not been finalized). **B mutated; A/C did not exist as findings yet — confirmed no premature/cross-created rows.**
- Finalized A and C next: all three now `finalized`, each with its own correct `hazardCategory` (`machine_guarding` / `lockout_tagout` / `fall_protection`) attached to its own `id` — zero crossover.
- **Persistence after reload**: a fresh `GET /inspections/:id` (simulating a page reload) returned all three findings with the same ids, statuses, and hazard categories as immediately after finalization. Confirmed durable.

**Result: PASS.** `scenario1_B_isolated_first: true`, `scenario1_all_finalized_correctly: true`, `scenario1_reload_persistence: true`.

## Scenario 2 — duplicate/similar labels, distinct durable IDs

Created two findings under one inspection with **byte-identical** conclusion text (`"machine_guarding finding for Missing machine guard on the north conveyor line drive shaft."` — D2 was deliberately given D1's exact label text, not just a similar one, to make this the strictest possible version of the test) but from two separate observation/review chains, hence two distinct durable ids.

- Both finalized independently. Final state: two rows, distinct `id`s, identical `conclusion` text, each correctly `finalized` on its own record.
- No mutation, deletion, or merge occurred on the sibling when the other was finalized — identity resolution is unambiguously by `id`, never by label/conclusion text, matching the durable-identity invariant P0-02 established (`P0_02_IDENTITY_CONTRACT.md`).

**Result: PASS.** `scenario2_zero_crossover: true`.

## Conclusion

No identity defect was found in either previously-open gap. Both are now closed with executed, evidence-backed passes rather than remaining honest-but-open coverage gaps. Zero crossover in every case tested, consistent with (and extending) the P0-02 fix's `id`-keyed invariant.
