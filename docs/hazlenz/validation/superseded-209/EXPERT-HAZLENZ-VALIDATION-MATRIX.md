# EXPERT HAZLENZ — VALIDATION MATRIX

Consolidated 2026-09-07 after §203. **This matrix references immutable evidence; it does not
restate historical metrics.** States: `ESTABLISHED` · `PARTIALLY_ESTABLISHED` · `NOT_EXERCISED` ·
`INCONCLUSIVE` · `BLOCKED` · `PRODUCT_OWNER_REVIEW_REQUIRED`. Rules honored throughout: zero
opportunities never become PASS; structural success never becomes semantic correctness; a single
observation is never a rate.

Columns: **Det** = deterministic test status · **Hosted** = hosted execution status · **Sem** =
semantic adjudication status · **Gov** = governed-evidence status · **Prod** = production
authorization. Evidence paths relative to `verification/`.

| capability | version / path | Det | Hosted | Sem | Gov | Prod | evidence |
|---|---|---|---|---|---|---|---|
| Deterministic HazLenz analysis | `backend/src/safescope-v2` (ACTIVE CUSTOMER PATH) | ESTABLISHED | n/a (deterministic) | n/a | governed standards integrated under kill-switch governance | **ACTIVE** | `insite-v1-*` slices; blueprint §5 |
| Ordinary structured Expert first pass (capability-ABSENT grammar) | FROZEN PATH; prompt vNext + `expert-first-pass-owed-fact-projection.ts` | ESTABLISHED (§196 92/92; §198 89/89; §199 43/43) | ESTABLISHED as transport+structure: §199 10/10 ABSENT rows PROVIDER ACCEPTED and inferred | **NOT_EXERCISED — 0/120 verdicts** | uses supplied governed ids only | NOT AUTHORIZED | §196, §198, §199 dirs |
| Structured first pass, capability-PRESENT grammar | same path, PRESENT request contract | ESTABLISHED offline | **PROVIDER REJECTED** (§199: SG-01, SG-02 — 2 observations, not a rate) | NOT_EXERCISED | as above | NOT AUTHORIZED | §199; §202 `EFFECTIVE-GRAMMAR-IDENTITY.md` |
| Owed-fact ledger / binding / projection (frozen) | §187-pinned modules | ESTABLISHED structurally; **KNOWN_DEFECTs open** (ABF-4/5/6/9/10 on this path) | via §199 | NOT_EXERCISED | n/a | NOT AUTHORIZED | §187 pin; §202 `AUTHORITY-BOUNDARY-INVENTORY.md` |
| Successor boundary (guards + collision + closed schemas) | **`hazlenz.expert.203-successor-boundary.v1`**, `expert-203-*` | ESTABLISHED as DEVELOPMENT-ONLY (52+63+45+107; 5 EXPECTED-FINDINGs recorded) | **NOT_EXERCISED** | NOT_EXERCISED | n/a | NOT AUTHORIZED; no caller promoted (D10) | §203 dir |
| Governed-binding separate stage | §202 `expert-202-governed-binding-*`; mode **REDACTED** | ESTABLISHED offline (54/54; B20 diagnostic only, **not PROVIDER ACCEPTED**) | **NOT_EXERCISED** (canary = D12) | NOT_EXERCISED | verbatim mode NOT AUTHORIZED (D13) | NOT AUTHORIZED | §202 `GOVERNED-STAGE-INTEGRATION.md` |
| Effective grammar identity / rejection cache | §203 identity (retires §201 prototype); §202 cache unwired | ESTABLISHED as proxy (45/45; §199 cohort partition 10/2 reproduced; SG-02 suppressed under §203 key) | proxy only — **agreement on one 12-request cohort, not equality** | n/a | n/a | NOT AUTHORIZED (executor wiring open) | §203 `EFFECTIVE-GRAMMAR-IDENTITY-203.md` |
| Verifier v3.x | FROZEN PATH; dev gate literal `false` | ESTABLISHED structurally (49/49, 40/40 + §192–§194 record) | §187A/B hosted record: **INCONCLUSIVE** terminal | PRODUCT_OWNER_REVIEW_REQUIRED (verdicts among the 120 + deferred sub-axes) | regulatory-basis record §194 | NOT AUTHORIZED | §187, §192–§194 dirs |
| Settlement stage | consumer present, **producer deliberately absent** (HIGH-2 / D09) | runtime protections measured (brand holds; `ledgerUnchanged`) | NOT_EXERCISED | NOT_EXERCISED | n/a | BLOCKED on D09 | §202 `HIGH-1-HIGH-2-DISPOSITION.md` |
| Semantic quality of Expert output | — | — | — | **PRODUCT_OWNER_REVIEW_REQUIRED: 0/120 supplied; no acceptance claim exists** | — | — | §202 `ADJUDICATION-WORKSHEET-202.json` |
| Expert customer activation | — | — | — | — | — | **NOT AUTHORIZED; no acceptance; deterministic path remains sole customer authority** | this package |

## Scope-labeled program-wide checks (as of 2026-09-07, §203 close)

`SRC_TYPECHECK` PASS (src/** only) · `EXPERIMENT_SCOPE_TYPECHECK (§203)` PASS ·
`EXPERIMENT_SCOPE_TYPECHECK (§202)` PASS · eleven legacy suites at recorded §202-baseline counts ·
`verify:203-source-integrity` PASS (0 successor drift, 0 ancestor drift) ·
`verify:203-text-integrity` PASS · preservation 2,470/2,470 byte-unchanged. `backend/scripts`
retains its 181-diagnostic pre-existing baseline. None of these is a semantic claim.
