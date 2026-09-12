# §195 — Preregistration (human-readable mirror)

Frozen before any provider call. **No provider call was made.** The authoritative machine copy is
`PREREGISTRATION.json`; this file adds nothing.

- **System under test:** raw observation → Expert first pass → **owed-fact / task-state
  construction** → first-pass clarifications → verifier-v3.2 → deterministic admission → unresolved /
  settlement-eligibility state. **The third stage does not exist** — see `PIPELINE-STAGE-BLOCKER.md`.
  §195 stopped before spend.
- **Population:** verifier-**v3.2**, zero hosted evidence. v3 (§187B), v3.1 (§192) and v3.2 are never
  combined into one score.
- **Cohort:** 12 fresh rows × 3 replicates = 36 executions, 72 provider calls. Nothing reused from
  §187 or §192.
- **Truth is never injected.** The hosted system would receive the raw observation and normal allowed
  context only. Expected owed facts exist solely for scoring. A first-pass miss propagates and is
  scored as an end-to-end failure; **no downstream stage is rescued.**
- **Coverage, verified before freeze:** 6 valid-reliance executions (floor 6) across two hazard
  families; 6 unsupported-reliance executions (floor 6), unrelated and too-narrow; 30 NONE-expected
  executions; A∧B and A∧B∧C conjunctives; one multi-gap row; two zero-owed-fact rows; all ten
  fixture families; every expected `evidenceSpan` verbatim.
- **Two families cannot be guaranteed.** `EXISTING-SUFFICIENT-FIRST-PASS-QUESTION` and
  `FIRST-PASS-INSUFFICIENT-QUESTION` are **outcomes** in an end-to-end run, not fixture properties.
  Rows carry `sufficientQuestionLikelihood` as design intent only.
- **Governed evidence** uses the canonical `{ sourceId, text }` shape and deliberately contains **no
  citation-shaped strings**; the freeze script aborts if any appears. See
  `CITATION-RELIANCE-COLLISION.md`.
- **Axis classification, frozen before spend:** mechanical axes listed; all semantic axes
  `MODEL_DIAGNOSTIC`; `HUMAN_REQUIRED` empty. Model adjudication is authorized for this development
  validation and is never called human adjudication. §189 remains `UNMEASURED` at 65/112 and §195
  does not require its completion.
- **Mechanical gates:** provider errors 0 · contract-invalid 0 · wrong factKey bindings 0 · unknown
  regulatory sourceIds 0 · raw prohibited citation admitted 0 · unauthorized settlement 0 · adjacent
  ledger mutation 0 · `PROVIDER_SETTLEMENT_AUTHORITY = NEVER`. None waivable after results.
- **Fourteen preregistered thresholds**, none derived from observed output. Transfer fidelity is
  100% and mechanical — it admits no shortfall.
- **End-to-end strict success** requires **every** stage to succeed. A downstream verifier success
  does not erase an upstream first-pass miss.
- **Budget:** 72 calls, hard cap 80, ceiling **$7.50**, worst case $7.056. The ceiling was corrected
  upward once, **pre-spend**, after the freeze script exposed an internal inconsistency; zero calls
  had occurred.
- **No mid-run remediation** after first spend: no prompt, schema, fixture, truth, scorer, threshold
  or rubric change.
