# EXPERT HAZLENZ — NEXT WORK DEPENDENCY GRAPH

Consolidated 2026-09-07 after §203. **This is the orchestration source for future multi-agent
slices.** Every workstream below still requires explicit product-owner authorization to begin;
"CAN RUN NOW" means *no other* blocking dependency exists. Decision IDs refer to
`EXPERT-HAZLENZ-DECISION-REGISTER.md`.

---

## SUPERSEDING STATUS — §204, §205, §206 AND §207 (2026-09-07 / 2026-09-08)

**GATE S IS CLOSED.** D11 is **120 / 120**, not 0/120. The dependency graph below still describes
the workstreams correctly, but every "MUST WAIT FOR SEMANTIC ADJUDICATION" entry is now unblocked.
120/120 is instrument completion, **not acceptance**.

**§205 has implemented the post-120 remediation slice**, zero provider calls, zero database
operations, nothing outside the §205 namespace modified. Terminal:
`EXPERT_HAZLENZ_POST_120_REMEDIATION_IMPLEMENTED — PRODUCT_OWNER_REVIEW_AND_HOSTED_TRANSPORT_SMOKE_REQUIRED`.
**§206 passed the hosted governed-transport smoke** (3 calls, USD 0.134574) and **§207 froze the
fresh-cohort truth specification and preregistered the gates** (zero provider calls). Terminal is
now
`EXPERT_HAZLENZ_FRESH_COHORT_PREREGISTRATION_FROZEN — PRODUCT_OWNER_REVIEW_AND_COHORT_EXECUTION_AUTHORIZATION_REQUIRED`.

Read
`verification/expert-hazlenz-fresh-cohort-preregistration-207-2026-09-08/IMPLEMENTATION-REPORT-207.md`
first, then its `TRUTH-SPECIFICATION-207.md` and `GATES-AND-APPLICABILITY-207.md`, then
`verification/expert-hazlenz-governed-transport-smoke-206-2026-09-08/SMOKE-REPORT-206.md` and
`verification/expert-hazlenz-post-120-remediation-205-2026-09-07/IMPLEMENTATION-REPORT-205.md`,
before planning any further slice.

### The post-§207 execution order (this replaces the ordering guidance below)

| # | Step | Gate it clears | Authorized? |
|---|---|---|---|
| 1 | ~~Product owner reviews the §205 implementation evidence~~ — **DONE. §205 ACCEPTED** as the completed post-120 remediation implementation slice (local implementation and regression evidence only) | — | complete |
| 2 | ~~Hosted governed TRANSPORT SMOKE~~ — **DONE (§206, 2026-09-08). PASSED.** 3 calls, USD 0.134574. `PROVIDER_TRANSPORT_ACCEPTED = TRUE`; `SEMANTIC_OUTPUT_CORRECT = NOT JUDGED` | **CLEARED** — the §205 transport claim is upgraded from CONSTRUCTIBLE to REACHES INFERENCE; cohort block H can now be exercised and gate G14 is achievable | complete |
| 3 | ~~Rule D08 and D15~~ — **DONE (§207, 2026-09-08). D08 CLOSED in favour of the current architecture; D15 CLOSED as `O1_RETAINED` / `O4_AVAILABLE_NOT_ADOPTED` with the revisit trigger retained and live** | Gate A for owed-fact canonicalization — **CLEARED**; D10 is now next in that chain | complete |
| 4 | ~~Author and FREEZE the 24-case truth specification~~ — **AUTHORED AND FROZEN (§207).** Identity `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`. **The product-owner REVIEW of it is NOT done and is tracked separately** | the execution gate's freeze blocker — **CLEARED**; the review blocker is **NOT** | freeze complete, review outstanding |
| 5 | ~~Preregister the gates and set the ordinary-quality rule~~ — **DONE (§207).** 15 gates preregistered, 13 hard; ordinary quality set as 7 explicit criteria rather than a headline percentage, with the reasoning recorded | the execution gate's gates blocker — **CLEARED** | complete |
| 5a | ~~Product owner reviews the frozen specification~~ — **DONE (§208 authorization, 2026-09-08). ACCEPTED**, with AM-1/AM-2, the 159→177 instrument, all 15 gates, the seven ordinary-quality criteria and the AC-06 / AC-02-P3 rulings retained | `PRODUCT_OWNER_REVIEW_NOT_RECORDED` — **CLEARED** | complete |
| 5b | ~~Authorize cohort execution~~ — **DONE.** Reference `SECTION-208-PRODUCT-OWNER-AUTHORIZATION-2026-09-08` | `COHORT_EXECUTION_NOT_AUTHORIZED` — **CLEARED** | complete |
| 6 | ~~Execute ONE bounded hosted acceptance cohort~~ — **DONE (§208).** 50 calls, USD 2.308554, 0 retries, 0 database operations, 24/24 cases execution-valid. Deterministic scoring ran first and is evidence, never a suggested verdict | — | complete |
| 6a | ~~Decide the three §208 executor-defect classifications~~ — **DONE (§208B authorization).** Defect 1 `LOCAL_EXECUTOR_PARAMETERIZATION_DEFECT`, re-derivation ACCEPTED. Defect 2 `LOCAL_EXECUTOR_TRANSPORT_ENVELOPE_DEFECT` — **the structural-rejection rule was NOT waived, so `ORIGINAL_§208_EXECUTION_CLEAN_ACCEPTANCE_VALIDITY = NOT_ESTABLISHED`.** Defect 3 `SYSTEMATIC_VERIFIER_INPUT_ASSEMBLY_DEFECT`, **MATERIAL** — a caveat may not convert lower-fidelity evidence into acceptance evidence | run validity | complete |
| 6b | ~~Decide whether a bounded verifier re-run is required~~ — **DONE. REQUIRED AND EXECUTED (§208B).** 24 calls, USD 0.612072, 0 retries, 0 failures, 0 first-pass calls, 0 governed-stage calls. Offline preflight clean; the empty-candidate-block defect is unreachable by three guards | axis L / G6 evidence | complete |
| 6c | ~~Prepare the adjudication session~~ — **DONE (§209, zero provider calls).** 177-slot machine worksheet plus a non-disclosing human session document, bound to the §208B acceptance verifier evidence; recorder, completeness check and gate computation wired, with every recorder refusal proved by execution | adjudication infrastructure | complete |
| 7 | **PRODUCT_OWNER SUPPLIES THE 177 JUDGMENTS.** ← **THE IMMEDIATE GATE, AND IT REQUIRES A HUMAN.** §209 wrote **0** verdicts because no agent, deterministic scorer, heuristic, language model or code path may write one. Record each through `record-209-verdict.ts --attribution=PRODUCT_OWNER`, in frozen order, reading `ADJUDICATION-SESSION-209.md`. **AMBIGUOUS is legitimate** — do not force a determinate gate. Carry in: **G6's headroom is ONE slot**, and AC-03, AC-05, AC-07, AC-23 and AC-02 fact 1 are where the frozen truth and the run diverge most visibly | the only record that can support an acceptance claim | **product-owner time — NOT DONE** |
| 8 | **Rule D14** using RR-6's design plus the fresh axis-R distribution. **Not before adjudication:** G15 is measurement-only on 7 `R_SAFETY` and 4 `R_FLOOR` judgments, all currently unfilled | Gate for final escalation policy | product-owner decision |
| 9 | **Decide Expert HazLenz advancement.** Only then are D10 (successor promotion) and D12 (hosted canary) in scope | — | product-owner decision |

**Steps 1–6c are complete.** The immediate gate is **step 7 — the 177 judgments** — and it is the
one step in this chain that an agent cannot perform. §209 built the whole session and supplied
nothing: 177 slots, 0 verdicts, 177 open. No provider call is needed or authorized for step 7.

**Execution completing is not acceptance.** Every structural result in §208 is clean — zero refused
declarations, zero containment breaches, zero degenerate outputs, a clean provider-authority scan —
and every one of those results is equally consistent with a system whose *semantics* fail on the
axes no deterministic check may decide. Eleven of thirteen hard gates have no evidence at all.

**A frozen specification is not a reviewed one, and an executed cohort is not an accepted one.**
§207 kept the freeze and the review as separate acts; §208 keeps execution and adjudication as
separate acts, for the same reason. The 177 verdicts are `PRODUCT_OWNER`-attributed and no agent,
default or code path may supply one — §200 recorded zero model verdicts on 152 slots on the same
principle.

**Still true and unchanged by §206 and §207:** no priority-policy mutation (RR-6 is diagnostic,
E3 stays `RECOMMENDED_NOT_AUTHORIZED`, D14 open, gate G15 is measurement only and carries its own
denominator limit), no representation mutation (O1 retained under a now-closed D15), no provider
settlement or escalation authority (Ruling 5), no successor promotion, and no deterministic
semantic matcher — including for F7, which gate G9 measures by human adjudication only.

## The four gates

```
                                ┌────────────────────────────────────────────┐
                                │ GATE S — product-owner semantic            │
                                │ adjudication (D11) — CLOSED 120/120 §204   │
                                └────────────────────────────────────────────┘
                                    blocks: semantic quality claims, prompt
                                    tuning, semantic remediation, any Expert
                                    acceptance, D14 finalization
                                ┌────────────────────────────────────────────┐
                                │ GATE C — hosted canary authorization (D12) │
                                └────────────────────────────────────────────┘
                                    blocks: governed-stage HOSTED-EXECUTED
                                    status, rejection-cache live behavior,
                                    FrozenCapabilityRequirement validation
                                ┌────────────────────────────────────────────┐
                                │ GATE A — architecture decisions            │
                                │ (D01, D02–D07, D08+D15, D09, D10, D14)     │
                                └────────────────────────────────────────────┘
                                    blocks: each corresponding implementation
                                ┌────────────────────────────────────────────┐
                                │ GATE P — production/customer activation    │
                                │ (far future; requires S + acceptance)      │
                                └────────────────────────────────────────────┘
```

## CAN RUN NOW (zero provider, zero database, no open decision consumed)

| workstream | notes | parallelizable with |
|---|---|---|
| N1 — D11 adjudication session itself | product-owner time; U01 presented; instrument ready | everything |
| N2 — complete Agent F's declared unswept surfaces (measurement/cohort contract modules, `fixtures/`, §195–§201 script-libs, §202 governed-binding contract internals) | read-only audit, same method as §203 | everything |
| N3 — read-only archive index refresh / evidence navigation upkeep | this package | everything |
| N4 — adversarial-suite extension over successor path (more red-team cases, no implementation change) | new test files only | N1–N3 |

## MUST WAIT FOR AN ARCHITECTURE DECISION (Gate A)

| workstream | waits for | then |
|---|---|---|
| W1 — fact-identity revision implementation | D01 | zero-provider successor change + regression suite |
| W2 — depth-bound fail-closed + value-shape closure on successor path | D05, D06, D07 (batchable) | small successor edits, all deterministic |
| W3 — normalization/merge-seam/settlement-trust-root successor treatments | D02, D03, D04 (class-level ruling possible) | successor-module pattern from Ruling 1 |
| W4 — owed-fact unification | D08 + D15 (decide together) | large; touches importer families; plan as its own slice |
| W5 — settlement producer wiring (or explicit recorded non-wiring) | D09 (after D04 ideally) | activation-class change |
| W6 — successor promotion into existing callers | D10 (after D08 recommended) | the integration slice; migration path already written (§203 §5) |
| W7 — escalation policy finalization | D14 (after Gate S evidence) | do not start before D11 progress |

## MUST WAIT FOR HOSTED CANARY (Gate C)

| workstream | waits for | then |
|---|---|---|
| H1 — governed-binding stage transport validation | D12 | small spend; grammar measured offline at 6,074 B vs the accepted §199 63,691 B request |
| H2 — rejection-cache + FrozenCapabilityRequirement executor wiring | D12 (+ its own authorization) | §202 accounting design ready |

## MUST WAIT FOR SEMANTIC ADJUDICATION (Gate S)

Any semantic quality claim, prompt tuning, semantic remediation targeting, verifier semantic
acceptance, Expert acceptance, D14 finalization, and every customer-activation conversation.
**Nothing on this list can be advanced by engineering alone.**

## Parallelization guidance for the next multi-agent slice

- N1 runs parallel to all engineering, always.
- W2 items are one small slice (three rulings, three tiny successor edits, one suite).
- W3 is one coherent slice if ruled as a class (provenance-brand pattern).
- W1 is independent of W2/W3 (different modules).
- W4 and W6 should not run concurrently with anything touching owed-fact files.
- H1/H2 are independent of all W-items but should follow, not precede, W2 if both are authorized
  (cheaper to canary the hardened stage once).
