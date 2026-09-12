# §202 — file ownership map

**Written by the lead orchestrator BEFORE any agent began.** Every mutable file has **exactly one**
owning agent. Where two workstreams would have touched the same file, the conflict is resolved by
assigning a separately namespaced new file or by holding one workstream analysis-only.

`…/` = `verification/expert-hazlenz-governed-stage-integration-2026-09-07/`

## The partition

| owner | may CREATE and MODIFY | mode |
|---|---|---|
| **Orchestrator** | `backend/package.json` · `backend/tsconfig.scripts-202.json` · `docs/INSITE_ENGINEERING_BLUEPRINT.md` · `docs/INSITE_CURRENT_STATE.json` · this map · `…/INTEGRATION-REPORT.md` · `…/RUN-SUMMARY.json` · `…/PRESERVATION-VERIFICATION.txt` · **all recording of product-owner verdicts** | integration + the only party that speaks to the product owner |
| **Agent A** — adjudication facilitator | `backend/scripts/build-202-adjudication-session.ts` · `backend/scripts/lib/expert-202-adjudication-grouping.ts` · `backend/scripts/test-202-adjudication-grouping.ts` · `…/ADJUDICATION-SESSION-202.md` · `…/ADJUDICATION-WORKSHEET-202.json` · `…/ADJUDICATION-PRESENTATION-PACKET.md` | **READ ONLY** over all §195–§201 evidence and all runtime code; writes only new §202 files |
| **Agent B1** — governed-binding stage | `backend/scripts/lib/expert-202-governed-binding-contract.ts` · `backend/scripts/lib/expert-202-governed-stage-pipeline.ts` · `backend/scripts/test-202-governed-binding-stage.ts` · `…/GOVERNED-STAGE-INTEGRATION.md` | development implementation authorized, **provider calls = 0** |
| **Agent B2** — grammar identity + circuit breaker | `backend/scripts/lib/expert-202-effective-grammar-identity.ts` · `backend/scripts/lib/expert-202-rejection-cache.ts` · `backend/scripts/test-202-grammar-identity-and-cache.ts` · `…/EFFECTIVE-GRAMMAR-IDENTITY.md` | development implementation authorized, **provider calls = 0** |
| **Agent C** — authority-boundary sweep | `backend/scripts/lib/expert-202-authority-boundary-guards.ts` · `backend/scripts/test-202-authority-boundary-guards.ts` · `…/AUTHORITY-BOUNDARY-INVENTORY.md` · `…/HIGH-1-HIGH-2-DISPOSITION.md` | analysis + **bounded category-A hardening only** |
| **Agent D** — red team | `…/RED-TEAM-CHALLENGE.md` | **STRICT READ ONLY** |

## Conflicts identified in advance, and how each is resolved

**1. Agent B1 and Agent B2 both bear on the governed-stage request grammar.** B1 builds the contract;
B2 builds the identity function that must classify it.

*Resolution:* **B1 does not import B2's module** — it measures its own grammar offline and reports the
metrics. B2 builds the identity function against the *recorded §199 requests*, which already exist and
are frozen. The orchestrator wires the two results together in reconciliation. Neither blocks the
other and neither writes the other's file.

**2. Agent C hardens boundaries; Agent D attacks them.** The authorization requires D to challenge C
independently.

*Resolution:* D is strict read-only, so there is no file conflict. D is not told C's conclusions in
advance and reads C's artifacts only as they land; the orchestrator reconciles after both finish.

**3. Agent C and Agent B1 both touch governed-binding authority.** C sweeps the invariant
`provider cannot inject an unsupplied sourceId`; B1 implements it.

*Resolution:* **B1 owns the governed-stage implementation; C treats the governed stage as
read-only and reports findings as findings.** C's own hardening is confined to the pre-existing
development path.

**4. `backend/package.json` and every `tsconfig`.** Every implementing agent would want to register a
script.

*Resolution:* **orchestrator-owned, agents forbidden.** Agents report the entries they need; the
orchestrator applies them serially after agents complete. This was the decisive measure in §201 and
is retained unchanged.

**5. Historical evidence §195–§201.** Immutable for every agent including the orchestrator.

*Resolution:* no write access. A 1,177-file baseline manifest covering all 96 `expert-hazlenz-*`
evidence directories plus the runtime module was taken before launch and is re-verified after.

**6. The 24 structurally pre-filled `NOT_EXERCISED` slots.** The product owner ruled these legitimate.

*Resolution:* **no agent may overwrite, clear or reinterpret them.** Agent A must carry them forward
as they stand and must not present them as open.

## Rules binding every agent

- **Provider calls = 0.** No hosted call of any kind, and no hosted governed-stage canary.
- **Database operations = 0.** No commit, push, tag, branch, deploy, or remote change.
- **No production or customer activation**, and no wiring of any prototype into the active path.
- **§195–§201 evidence is immutable.** No test utility may write into a historical evidence path.
- **NO SEMANTIC SELF-GRADING — absolute.** No agent may fill any of the **128 genuinely open**
  product-owner slots, or declare `CORRECT`, `PARTIALLY_CORRECT`, `INCORRECT`, `AMBIGUOUS` or
  `TRUTH_SPECIFICATION_DEFECT` for any §199 semantic question. Agents may organise and present
  evidence neutrally and explain terminology. **Only the product owner supplies a semantic verdict,
  and only the orchestrator records one.**
- **No final OwedFact policy decision, no final escalation-policy decision, no semantic prompt
  tuning.** These are explicitly withheld from §202.
- **Verification labels must name their scope** — `SRC_TYPECHECK`, `EXPERIMENT_SCOPE_TYPECHECK`, or
  an explicitly named other scope. The corrected `backend/scripts` baseline is **181** diagnostics;
  the erroneous ~2011 figure must not reappear.
- **No agent may expand its own authority.** Where further authority is needed, report it under
  `AUTHORIZATION REQUIRED` and stop.
