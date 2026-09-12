# §192 — Preregistration (human-readable mirror)

Written and frozen **before the first provider call**. The authoritative machine copy is
`PREREGISTRATION.json` (sha256 `68ba7ffa80fd8d111760cb628bff2493f46181cb41c124da2e0614e365f13267`);
this file adds nothing.

- **Population:** verifier-**v3.1**, a NEW prospective population. §187B's fifteen v3 executions are
  never combined with these. v3.1 prompt `7e73d175…`, schema `d39c86bc…`; v3 prompt `678160c9…`,
  schema `1bddc1a5…`.
- **Cohort:** 13 fresh rows × 3 replicates = 39 calls. No §187 stimulus, owed fact, question or
  output reused.
- **First-pass sets are AUTHORED, not generated.** This guarantees the behaviour families and
  removes the §187A stimulus confound entirely. The cost, recorded rather than discovered: §192
  validates the verifier **in isolation**, not the end-to-end pipeline.
- **Size:** 13 rather than the suggested 8–10, justified before spend — the coverage floors (≥6
  unconditional opportunities across ≥3 property families, ≥3 regression rows, ≥2 challenge
  opportunities, one A∧B and one A∧B∧C row, plus fully-established and obstructed families) cannot
  all be met in 10 rows.
- **Order:** three interleaved blocks, Fisher-Yates under mulberry32 seeded from the v3.1 prompt
  hash, frozen in `EXECUTION-ORDER.json`. Never reordered after seeing output.
- **Budget:** 39 planned, hard cap 44, ceiling $3.25, worst case $2.808. Retries 0. Provider-returned
  usage is the sole basis for actual spend. Credit rejection stops the run on FIRST occurrence.
- **Axis classification, frozen before spend so the §189 ambiguity cannot recur:** all ten semantic
  axes are `MODEL_DIAGNOSTIC`; `HUMAN_REQUIRED` is **empty**; a human acceptance gate is **not part
  of §192** and is not discharged by it. No model-produced adjudication is called human.
- **Mechanical gates:** provider errors 0 · contract-invalid 0 · wrong supplied factKey bindings 0 ·
  unauthorized settlement 0 · `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` · adjacent-state ledger
  mutation 0. None may be waived after observing outputs.
- **Semantic development gates G1–G10:** frozen thresholds, reported separately and never collapsed
  into one aggregate. See `PREREGISTRATION.json`.
- **Clarification-policy denominator:** NEVER raw `proposedClarification` / total. `OPPORTUNITIES`,
  `PROPOSALS`, `APPROPRIATE_PROPOSALS`, `MISSED_PROPOSALS`, `UNNECESSARY_PROPOSALS` reported
  separately. 18 opportunity executions across 6 owed-property families.
- **No mid-run repair:** after the first call, prompt, schema, fixtures, order, scorers and
  thresholds are frozen. Raw output is persisted before any derivation.
