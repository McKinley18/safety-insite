# PRODUCTION CRITICAL PATH — RECONSTRUCTED AND **CORRECTED**

**The proposed sequence was wrong, and this phase corrects it.** The blueprint and current-state
documents are controlling, and they contradict the ordering recorded in §69.8.

## The correction, stated plainly

> **§69.8 placed `KG5C-DISC-01` at the head of the shortest path to production testing. That is
> incorrect.** The authoritative §26 entry classifies it `DEFECT_NONBLOCKING` and states it **"blocks
> neither production SHADOW nor governed CUTOVER for approved records"** — restated unchanged after
> the 2026-08-22 reclassification. §24 additionally **forbids a non-blocking defect from expanding
> the release gate**.
>
> **I recorded a non-blocking defect as the leading blocker. It is not on the production-testing
> critical path at all.**

The real gate is `productionShadowProtocol.stage1ExperimentDesign.productionPreconditions` plus
`futureOperationSequence`, and its head is **Operation 2 — push** — every step of which requires its
own explicit user authorization and is forbidden in this phase.

## The verified critical path to PRODUCTION TESTING (Stage-1 SHADOW)

| # | operation | current state | code work | prod access | DB mutation | deploy | completion criterion |
|---|---|---|---|---|---|---|---|
| 1 | commit the KG release package | **DONE (local only)** — six commits on `release/insite-rc-2026-08-18`, verified by clean-checkout build/typecheck | no | no | no | no | done |
| **2** | **push to `origin/release/...`** | **NOT AUTHORIZED — the next possible operation** | no | no | no | no | remote branch matches local |
| 3 | merge to `main` | ready | no | no | no | **triggers deploy** | `main` contains the package |
| 4 | apply the six migrations `1800000009000`–`1800000014000` | **UNAPPLIED** — production has 40; `migrationsRun` is false and the start command does not migrate | no | **yes** | **YES** | no | six migrations applied, schema verified |
| 5 | deploy with every `GOVERNED_CUTOVER_*` absent | automatic from `main` (Render) | no | **yes** | no | **YES** | service live on the new commit |
| 6 | verify production `LEGACY`/no-op | pending | no | **yes (read)** | no | no | resolver proven `LEGACY`, no governed effect |
| 7 | `release -- prepare federal-core-2026-07-30.1` | ready | no | **yes** | **YES** | no | release row created |
| 8 | `review:release-record -- approve`, **one record at a time by a named human** | ready | no | **yes** | **YES** | no | every delivering record carries a clause-by-clause review bound to its exact checksum |
| 9 | `release -- activate --dry-run` | ready | no | **yes (read)** | no | no | all **eight** finalization gates pass |
| 10 | `release -- activate` with **SHADOW OFF** | ready | no | **yes** | **YES** | no | exactly one ACTIVE release; `pinGovernedRelease()` never `NO_ACTIVE_RELEASE` |
| 11 | `release -- status` + re-verify `LEGACY`/no-op | ready | no | **yes (read)** | no | no | active release present, customer path still `LEGACY` |
| 12 | Stage-1 preflight re-run | pending | no | **yes (read)** | no | no | `STAGE1-OP-01` condition for closure met |
| 13 | **authorize Stage-1 SHADOW separately** | **SAFE TO BEGIN as a separately authorized stage** | no | **yes** | no | no | the four feature-control locks set; observation begins |

**Not one of these requires code work.** Every one from 2 onward requires **explicit per-operation
user authorization**, and steps 4, 7, 8 and 10 mutate the **production** database.

## Recorded blockers, verified against current state

* **B1 — code not shippable as-is:** the governed-knowledge subsystem was **untracked in git** at
  preflight time. **Now partly resolved** — Operation 1 committed it locally in six commits; the live
  production commit still contains none of it.
* **B2 — deployment path is not a no-op:** Render auto-deploys `main`; `main == origin/main ==` the
  live commit. Shipping is a **first-ever deployment of the whole subsystem**, and the working tree
  **also contains unrelated frontend theme work that must not ship with the backend**.
* **B3 — migrations unapplied:** six repo migrations absent from production; `migrationsRun` false.
* **B4 — no governed release exists in production:** `regulatory_releases` has zero rows;
  `regulatory_release_records` / `..._reviews` do not exist.

## Blockers to PRODUCTION TESTING (Stage-1 SHADOW)

1. **User authorization for Operations 2–13** — the single binding blocker. All are authorization
   gates, not engineering gates.
2. **B2's shipping-scope decision** — which working-tree files ship with the backend. §26 recommends
   the 3 KG display files ship and the 18 theme files do **not**. **This is a real decision that must
   be made before the merge**, not during it.
3. **A named human reviewer for Operation 8** — a person, not a script.

**`KG5C-DISC-01` is NOT among them.** Neither is Level 3.

## Blockers to INITIAL CUSTOMER LAUNCH — a different and larger set

Everything above, **plus**:

4. **`KG5C-DISC-01` — and here it genuinely does gate.** Its original classification is
   `LEGACY_CORPUS_QUALITY — MUST_ADJUDICATE_BEFORE_WIDENING_LEGACY_DELIVERY`, and launch **is**
   widening legacy delivery. **It does not block shadow; it does gate launch.** That distinction is
   the substance of this phase's correction.
5. Stage-1 SHADOW must **observe cleanly** across the eleven currently-unobserved discrepancy
   categories before cutover is even considered.
6. `KG4E-DISC-03` — `GET /inspection-reports` returns every version's full frozen `sourceSnapshot`.
7. The governed-mode gates that are already recorded as prohibitions: **`GOVERNED_STRICT` must not be
   a customer mode while emitted-approved coverage is 23/160**; **`GOVERNED_WITH_FALLBACK` must not be
   enabled for customers until a production shadow exercises the eleven unobserved categories.**
8. Operational controls: the platform log pipeline confirmed for `kg4c.shadow-comparison.v2`; the
   Stage-1 account named and its four locks set; the operator kill switch.

> **Launching on `LEGACY` does not require governed cutover at all.** Items 5 and 7 gate *governed
> mode*, not launch. If the initial launch ships `LEGACY` only — which is the current
> customer-authoritative posture — then the launch-critical set is items 1–4, 6 and 8.
