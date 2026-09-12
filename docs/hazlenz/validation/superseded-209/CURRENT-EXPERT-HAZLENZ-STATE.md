# CURRENT EXPERT HAZLENZ STATE

**Primary entry point for every future Expert HazLenz session. Read this file first.**
Last consolidated: 2026-09-07, immediately after §203 (checkpoint/consolidation slice, no
behavioral changes). Successor development contract: **`hazlenz.expert.203-successor-boundary.v1`**.

## Status vocabulary (used consistently across this package)

`HISTORICAL/FROZEN` · `CURRENT SUCCESSOR DEVELOPMENT` · `ESTABLISHED` · `PARTIALLY_ESTABLISHED` ·
`NOT_EXERCISED` · `PRODUCT_OWNER_JUDGMENT_REQUIRED` · `KNOWN_DEFECT` · `OPEN_ARCHITECTURE_DECISION`
· `PRODUCTION_STATUS`. Path vocabulary: `FROZEN PATH` (§187-pinned + recorded-evidence-frozen
modules), `SUCCESSOR PATH` (§203 `expert-203-*` modules), `ACTIVE CUSTOMER PATH` (deterministic
HazLenz only). Claim vocabulary: `DEVELOPMENT-ONLY`, `HOSTED-EXECUTED`, `SEMANTICALLY ADJUDICATED`,
`STRUCTURALLY VALIDATED`, `PROVIDER ACCEPTED`. Never say "works", "validated", "clean" or
"production ready" without naming the exact scope.

## PRODUCTION_STATUS — the one paragraph that matters

**Deterministic HazLenz remains the only customer-authoritative analysis path.** Expert HazLenz has
**no customer activation, no production activation, and no final acceptance.** No `expert-20x-*`
module is importable from the production build (`backend/tsconfig.json` `include: ["src/**/*"]`),
and the verifier-v3 development gate is a literal `false`
(`owed-facts/verifier-v3-development-boundary.ts`). No semantic acceptance claim exists anywhere in
the program. Semantic adjudication is **COMPLETE at 120 / 120 product-owner verdicts**
(§204, 2026-09-07) — which is instrument completion, **not acceptance** — and the post-120
remediation slice is **IMPLEMENTED** (§205, same day, zero provider calls). Terminal:
`EXPERT_HAZLENZ_POST_120_REMEDIATION_IMPLEMENTED — PRODUCT_OWNER_REVIEW_AND_HOSTED_TRANSPORT_SMOKE_REQUIRED`.
§206 (2026-09-08) established the hosted governed-transport seam (3 provider calls, USD 0.134574);
§207 (same day, **zero provider calls**) authored and FROZE the 24-case product-owner truth
specification and preregistered the acceptance gates; and **§208 EXECUTED the fresh acceptance
cohort** against that frozen preregistration — 50 provider calls, USD 2.308554, 0 retries, 0
database operations, all three legs complete. **§208B (same day) then RECOVERED the verifier leg** against the frozen §208 first-pass outputs —
24 verifier calls, USD 0.612072, 0 retries, 0 first-pass calls, 0 governed-stage calls. Terminal is
now
`EXPERT_HAZLENZ_ADJUDICATION_SESSION_PREPARED — PRODUCT_OWNER_MUST_SUPPLY_THE_177_JUDGMENTS`
(§209, same day, **zero provider calls**).
**`ORIGINAL_§208_EXECUTION_CLEAN_ACCEPTANCE_VALIDITY = NOT_ESTABLISHED`** — the product owner
declined to waive the structural-rejection rule retrospectively, and §208B exists to establish the
clean verifier evidence §208 did not.
**EXECUTION COMPLETING IS NOT ACCEPTANCE.** All 177 preregistered judgments are OPEN and ZERO
verdicts are supplied — every verdict must carry `PRODUCT_OWNER` attribution — so eleven of the
thirteen hard gates have no evidence, and the acceptance determination is `NOT_DETERMINABLE`.
D08 and D15 are **CLOSED** (§207); D14 remains **OPEN** and must not be ruled on this evidence.
Read
`verification/expert-hazlenz-verifier-recovery-208b-2026-09-08/RECOVERY-REPORT-208B.md` first, then
`verification/expert-hazlenz-fresh-cohort-execution-208-2026-09-08/EXECUTION-REPORT-208.md` and its
`EXECUTOR-DEFECT-REGISTER-208.md` (whose appended product-owner rulings govern), then
`verification/expert-hazlenz-fresh-cohort-preregistration-207-2026-09-08/IMPLEMENTATION-REPORT-207.md`,
then
`verification/expert-hazlenz-governed-transport-smoke-206-2026-09-08/SMOKE-REPORT-206.md`, then
`verification/expert-hazlenz-post-120-remediation-205-2026-09-07/IMPLEMENTATION-REPORT-205.md`, then
`verification/expert-hazlenz-semantic-adjudication-204-2026-09-07/POST-120-CLOSURE-REPORT-204.md`.

## Current high-level state

| surface | state |
|---|---|
| Deterministic HazLenz | `ESTABLISHED`, customer-authoritative, `PRODUCTION_STATUS: ACTIVE` |
| Ordinary structured Expert first pass | `HOSTED-EXECUTED` once (§199: 10 capability-ABSENT rows accepted and inferred; 2 capability-PRESENT rows `PROVIDER REJECTED` at the grammar). `STRUCTURALLY VALIDATED`; **not** `SEMANTICALLY ADJUDICATED` |
| Successor boundary hardening (§203) | `CURRENT SUCCESSOR DEVELOPMENT`, `DEVELOPMENT-ONLY`, deterministic suites green (52+63+45+107), zero hosted execution, no caller promoted |
| Governed-binding separate stage (§202) | `DEVELOPMENT-ONLY`, mode **`REDACTED`** (verbatim-evidence mode NOT authorized — Ruling 2), `NOT_EXERCISED` against any hosted transport; offline grammar measurements are diagnostic only, **not** `PROVIDER ACCEPTED` |
| Semantic adjudication | **120 / 120** answerable verdicts supplied, all `PRODUCT_OWNER`-attributed (152 worksheet slots; 24 structural `NOT_EXERCISED`; 8 excluded `OUT_OF_SCOPE_NO_MODEL_OUTPUT`). 66 supplementary slots remain DEFERRED and are not opened. Opportunity-adjusted clean rate 82.4 % (75 / 91 pass/fail-bearing exercised slots); 8 defect mechanisms recorded (F1–F8) plus one evidence-tooling defect (T1). Governed axes N/S/T carry **zero** evidence — the two governed rows were rejected before inference |
| Post-120 remediation (§205) | **IMPLEMENTED, DEVELOPMENT ONLY.** 11 new §205-namespaced files; 0 files modified outside that namespace; the §199-executed vNext prompt, the `OwedFact` contract, §202 `recordAdditive` and every §203 module byte-unchanged. Suites: `test-205-remediation` **92/0**, `test-205-acceptance-design` **35/0**, §202/§203/§204 regressions all green. Delivered: R2 instruction successor (RR-1/2A/2B/3/5, byte-identically reversible to vNext); RR-7 declaration preservation (SF-05 now fails closed with the property preserved and nothing invented); T1 append-only evidence tooling; governed transport routed and measured |
| Governed transport (§206) | **HOSTED SMOKE PASSED, 2026-09-08.** `PROVIDER_TRANSPORT_ACCEPTED = TRUE`, `SEMANTIC_OUTPUT_CORRECT = NOT JUDGED`. 3 provider calls, USD 0.134574, 0 database operations. Both legs HTTP 200 / `tool_use`: the routed capability-ABSENT first pass projected to 1 admitted fact with `safetyStateComplete=true`; the governed stage returned `bindings` only, no HazLenz-owned field, addressing the fact by minted reference `F1`. The §199 `COMPILED_GRAMMAR_TOO_LARGE` failure did not recur and the retired PRESENT form was never transmitted. One of the 3 calls was wasted by operator error and is reported as an unintended clean replicate. This is infrastructure/callability evidence — **NOT** governed behavioural acceptance |
| Governed transport (§205, superseded by the above) | CONSTRUCTIBLE AND WITHIN THE ACCEPTED ENVELOPE — NOT PROVIDER ACCEPTED. Routed first pass 18,730 B, byte-identical to the capability-ABSENT schema §199 executed on 10/10 rows; governed stage 1,478 B; the retired PRESENT shape that drew `COMPILED_GRAMMAR_TOO_LARGE` was 19,152 B. §199 measured a 433-byte accept/reject margin, so byte size is not the provider's metric. Needs a 2–4 call hosted transport smoke |
| Representation (D15) | **CLOSED 2026-09-08 (§207): `O1_RETAINED`, `O4_AVAILABLE_NOT_ADOPTED`.** O2 and O5 not evidence-supported. O4 was built and exercised and works; it is not adopted merely because it was implemented successfully. Decisive argument: 6 of 8 §204 defect mechanisms originate before projection, where no representation change reaches them. Revisit trigger RETAINED AND LIVE — a second consequential axis-Q loss in the fresh cohort, or a recorded reviewer difficulty from the missing back-reference |
| Escalation (RR-6 / D14) | **DESIGNED, NOT ACTIVATED.** E3 raises 6 of 7 correctly with 0 over-escalations; E1 over-raises U07 because `affectedDecision` alone cannot separate the six `REQUIRED_CONTROL` facts; E2 is untested rather than conservative. No option reaches `LIFE_CRITICAL`. Shipped floor unchanged, Ruling 5 unchanged, D14 open |
| Fresh acceptance cohort | **FROZEN AND PREREGISTERED (§207, 2026-09-08), NOT RUN, NOT AUTHORIZED.** 24 cases with a full product-owner truth specification (exact observation and supplied context, per-property status, independent owed facts with conjuncts and essential qualifiers, acceptable branch partitions, per-fact prohibited decision claims, acceptable settling evidence, false-gap traps, governed constraints, containment expectations, frozen safety classification, and the gates each case feeds). 24 expected projected facts, 23 of them frozen safety-critical. **15 gates PREREGISTERED** (13 hard safety-critical, all 100 %/zero). Risk-targeted instrument at **177 judgments** (57 row + 120 fact; 43 % of the 408 full factorial) — 18 above the §205 target of 159, from two declared, reversible axis amendments that give gates G6 and G7 real denominators. Ordinary quality is set as **7 explicit criteria, not a headline percentage**. Preregistration identity `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`, pinned in the execution gate, which refuses on two remaining product-owner acts |
| Architecture (D08) | **CLOSED 2026-09-08 (§207) in favour of the current architecture.** MODEL AUTHORS SEMANTIC SAFETY CONTENT. Deterministic code may validate, reject, refuse admission, preserve unresolved truth, normalize without semantic change, and project valid model-authored declarations; it may not invent, reconstruct from prose, repair branch meaning, infer divergence, or recreate the retired matcher. Preregistered gate G11 is the run-time expression of the ruling, and a G11 failure reopens D08 |
| Fresh cohort execution (§208) | **EXECUTED 2026-09-08, NOT ADJUDICATED, NOT ACCEPTED.** 50 provider calls (24 first pass + 1 governed + 25 verifier, one of which was rejected pre-inference by an executor defect), USD 2.308554 of a USD 6.00 ceiling, 0 retries, 0 database operations. 24 of 24 cases execution-valid; 24 admitted owed facts; **0 declarations refused** and therefore RR-7 had nothing to preserve, so gate G13 is `NOT_EXERCISED_ZERO_DENOMINATOR` rather than PASSED. Deterministic scans clean: 0 citation-shaped strings, 0 forbidden fields, 0 provider-returned factKeys, 0 unsupplied governed ids, 0 degenerate outputs. **G10 PASSED** (50/24 deterministic), **G11 PASSED on its automated half**; the other 13 gates are `AWAITING_ADJUDICATION`. **177 slots open, 0 verdicts supplied.** Three §208 EXECUTOR defects are recorded rather than absorbed (projection parameterisation, verifier strict-mode transport, verifier candidate-block fidelity); one NON-MATERIAL preregistration defect is recorded and the frozen truth was NOT repaired |
| Verifier-leg recovery (§208B) | **RECOVERED 2026-09-08. THE AUTHORITATIVE VERIFIER EVIDENCE.** 24 verifier calls against the frozen §208 first-pass outputs, USD 0.612072 of a USD 1.50 ceiling, 0 retries, 0 failures, all HTTP 200 / `tool_use`. **0 first-pass calls, 0 governed-stage calls, 0 database operations, 0 human verdicts.** Offline preflight clean: 15 identity checks + 15 proofs, including that the empty-candidate-block defect **cannot recur** (three independent transmission guards). All 49 persisted candidate records assembled verbatim; every one of the 24 requests carries 1–3 candidates where §208 carried none. Verifier schema, prompt, admission contract, provider and model **byte-unchanged**; the wrapper is §199's, with no strict flag. Recovered verdicts: 23 `VERIFIED_AS_IS`, 1 `ADD_OR_REPLACE_CLARIFICATION`; admission 23 admitted / 1 refused (AC-02 fact 1, missing proposal + source mode). Replacement is **UNIFORM** across all 24 facts — §208's outputs are `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE` and no per-fact selection is possible. Diagnostic comparison only: 23 of 24 verdicts identical, 1 differs (AC-22), 2 admission outcomes changed — **this decides nothing and was fixed as a rule before it was computed** |
| Product-owner adjudication (§209) | **SESSION PREPARED, JUDGMENTS NOT SUPPLIED.** 0 provider calls, 0 database operations. **177 slots, 0 PRODUCT_OWNER verdicts, 177 open** — an agent may not write one, and no §209 script contains a scorer, heuristic or comparison against the frozen truth. Bound to the §208B `ACCEPTANCE_VERIFIER_EVIDENCE` (24 records; the builder aborts below 24) and never opening the §208 verifier file. The human session document **removes per-slot gate linkage** that §208/§208B exposed — with G6's headroom at one slot, that linkage revealed which single answer would decide a hard gate, which §209 forbids showing during adjudication; it is retained in the machine worksheet. Recorder refusals proved by execution: unknown slot, bad vocabulary, non-PRODUCT_OWNER attribution, unexplained NOT_EXERCISED, scoring a frozen no-opportunity slot, silent conflicting revision, and omitted verdict → nothing written. Gates: **G10 PASSED**, **G11 PASSED_AUTOMATED_HALF**, **G13 NOT_EXERCISED_ZERO_DENOMINATOR**, the other twelve `AWAITING_ADJUDICATION`; acceptance `NOT_DETERMINABLE`. D08 reopen trigger did NOT fire; D15 revisit trigger did NOT fire (all three axis-Q slots open); D14 OPEN and must not be evaluated on 11 unfilled measurement judgments |
| Stated residual limit | **F7 (downstream-claim overreach) is not reachable by deterministic code.** Both overreach fixtures are structurally well-formed and admitted. Answered by the RR-2B instruction and by adjudication only; gate G9 measures it |
| Expert acceptance | none exists; `PRODUCT_OWNER_JUDGMENT_REQUIRED` at every semantic gate |

## HISTORICAL/FROZEN vs CURRENT SUCCESSOR DEVELOPMENT

- **FROZEN PATH:** the four §187 `owedFactSourceHashes` modules (`owed-fact.types.ts`,
  `owed-fact-ledger.ts`, `owed-fact-binding.ts`, `verifier-v3-development-boundary.ts`), plus
  `expert-prompt.ts`, `expert-verifier-contract-v3.ts`, and
  `expert-first-pass-owed-fact-projection.ts` (FROZEN_BY_RECORDED_EVIDENCE). Byte-identical as of
  §203; re-asserted by eleven `verify-19x-source-integrity` scripts and by
  `verify:203-source-integrity` (7/7 ancestor pins). **Never modify these to enable new behavior.**
- **SUCCESSOR PATH:** `backend/scripts/lib/expert-203-*.ts` under
  `hazlenz.expert.203-successor-boundary.v1`, with its own manifest
  (`SUCCESSOR-SOURCE-MANIFEST.json`), integrity gate, and 267 assertions. It integrates the five
  §202 Category-A guards (all three facts proven per guard: GUARD_EXISTS / GUARD_CALLED /
  GUARD_REJECTS_ADVERSARIAL_INPUT), implements `FACT_IDENTITY_COLLISION` (ABF-5), removes the
  provider-authored priority field (Ruling 5), and closes every model-facing schema
  (`additionalProperties: false` at every node, runtime-enforced — Ruling 4). **Nothing imports it
  outside §203 tests; promotion requires product-owner authorization (D10).**

## KNOWN_DEFECT register (open, frozen-path unless noted)

ABF-4 (contract contradiction over `priority` — dissolved on the successor path only) · ABF-5
(silent nomination discard — repaired on the successor path only; frozen path still silently
no-ops) · ABF-6 (ungated merge fourth parameter) · ABF-9 (provider-escalated question outranks
deterministic life-critical one under budget) · ABF-10 / BYPASS-1 (citation detector recognizes
essentially one spelling — blocks D13) · AB203-1 (depth-8 fail-open deep scans in normalization) ·
AB203-2 (TYPE_ONLY raw-JSON merge seam) · AB203-3 (unbranded settlement trust root) · RT203-1/2/3
(successor-path value-shape gaps, no authority acquired) · HIGH-1 (two divergent owed-fact
implementations, both live) · HIGH-2 (settlement consumer has no wired producer; compile-time-only
barrier). Details and evidence: `EXPERT-HAZLENZ-DECISION-REGISTER.md` and the §202/§203 evidence
directories.

## OPEN_ARCHITECTURE_DECISION

All open product-owner decisions are D01–D15 in `EXPERT-HAZLENZ-DECISION-REGISTER.md`. **No agent
may decide any of them silently.**

## How future sessions consume this package (token / context policy)

Default reading order:
1. this file;
2. `EXPERT-HAZLENZ-DECISION-REGISTER.md`;
3. `EXPERT-HAZLENZ-NEXT-WORK.md`;
4. only the architecture/validation file relevant to the assigned workstream
   (`EXPERT-HAZLENZ-ARCHITECTURE-MAP.md`, `EXPERT-HAZLENZ-VALIDATION-MATRIX.md`);
5. historical evidence via `EXPERT-HAZLENZ-EVIDENCE-INDEX.md` **only** to verify a particular
   claim.

Do **not** read all §187–§203 reports by default, and do not load unrelated historical evidence
into subagents. An orchestrator gives each specialist only: the invariant it owns, its source
files, its evidence references, and the current decision constraints (the relevant D-items). Treat
everything in this package as a snapshot to verify against the repository when it is load-bearing.

## Standing constraints (every session)

Provider calls and database operations require explicit authorization. No commit/push/tag/deploy
without explicit authorization (pushing `main` IS a production deploy — Render auto-deploys). §187
pins and §195–§203 evidence are immutable. No semantic self-adjudication, ever. Raw NUL bytes are
forbidden in all new files. Verification claims must name their scope (`SRC_TYPECHECK`,
`EXPERIMENT_SCOPE_TYPECHECK (§NNN)`); `backend/scripts` carries a 181-diagnostic pre-existing
baseline.
