# §201 — file ownership map

**Written by the lead orchestrator BEFORE any agent began, as the authorization requires.**

Every mutable file has **exactly one** owning agent. Other agents may read it and may not modify it.
Where two workstreams would have touched the same runtime file, the conflict was resolved by rule
**C — keep one workstream analysis-only** — or by assigning a new, separately namespaced file.

## The partition

| owner | may CREATE and MODIFY | mode |
|---|---|---|
| **Orchestrator** | `backend/package.json` · `backend/tsconfig.scripts-201.json` · `docs/INSITE_ENGINEERING_BLUEPRINT.md` · `docs/INSITE_CURRENT_STATE.json` · this map · `INTEGRATION-REPORT.md` · `RUN-SUMMARY.json` | integration only |
| **Agent 1** — adjudication evidence facilitator | `…/PRODUCT-OWNER-REVIEW-COMPANION.md` | **STRICT READ ONLY** over all code and evidence |
| **Agent 2** — governed-binding stage architect | `backend/scripts/lib/expert-201-governed-binding-stage.ts` · `backend/scripts/test-201-governed-binding-stage.ts` · `…/GOVERNED-BINDING-STAGE-ARCHITECTURE.md` | analysis + isolated prototype |
| **Agent 3** — OwedFact representation engineer | `backend/scripts/lib/expert-201-owed-property-representation.ts` · `backend/scripts/test-201-owed-property-representation.ts` · `…/OWEDFACT-REPRESENTATION-OPTIONS.md` | analysis + prototype |
| **Agent 4** — priority / escalation safety architect | `…/ESCALATION-ARCHITECTURE-ANALYSIS.md` | **READ-ONLY** analysis |
| **Agent 5** — verifier / clarification engineer | `backend/scripts/lib/expert-201-verifier-vnext-candidates.ts` · `backend/scripts/test-201-verifier-vnext-candidates.ts` · `…/VERIFIER-VNEXT-DESIGN.md` | generic development only |
| **Agent 6** — harness / experiment reliability engineer | `backend/scripts/lib/expert-201-harness-hardening.ts` · `backend/scripts/test-201-harness-hardening.ts` · `…/HARNESS-HARDENING-REPORT.md` | **implementation authorized** |
| **Agent 7** — Expert HazLenz system auditor | `…/INTEGRATION-RISK-REGISTER.md` | **STRICT READ ONLY** |

`…/` = `verification/expert-hazlenz-parallel-development-2026-09-07/`

## Conflicts identified in advance, and how each was resolved

**1. `expert-pre-inference-circuit-breaker.ts` and `expert-empty-run-safety.ts`.** Agent 6's authorized
items 1, 2 and 5 all bear on these. They are also hash-referenced by §199's frozen preregistration.

*Resolution:* Agent 6 is the **sole** owner. It is instructed to build an **additive successor**
module rather than mutate either file, following this repository's established versioning discipline
(v3 → v3.1 → v3.2 → v3.3; v15 → vNext). That keeps §198's 89/89 and §199's evidence attached to the
module hashes that produced them. Mutation is permitted only if additive construction is genuinely
impossible, and must be reported.

**2. Governed binding — Agent 2 designs it, Agent 7 audits it.** The authorization requires them to
inspect it *independently*.

*Resolution:* Agent 7 is strict read-only, so there is no file conflict. Neither is told the other's
conclusions, and the orchestrator reconciles only after both reports exist.

**3. Semantic information loss — Agent 3 and Agent 5 both examine it.**

*Resolution:* different files entirely (`OwedFact` representation vs verifier contract). Both are
told to reach their own conclusions without inheriting the other's.

**4. `backend/package.json` and any `tsconfig`.** Every implementing agent would otherwise want to
register a script or extend a scoped typecheck. This is the classic concurrent-edit hazard.

*Resolution:* **orchestrator-owned, agents forbidden.** Agents report the npm script and typecheck
entries they need; the orchestrator applies them serially after agents complete.

**5. §195–§200 evidence directories.** Immutable for every agent including the orchestrator.

*Resolution:* no agent has write access. The only new evidence directory is §201's. A preservation
gate re-verifies all prior packages by hashing after the run.

## Rules binding every agent

- **Provider calls = 0.** No agent may execute a HazLenz first-pass or verifier request, or any other
  Anthropic API call for experimental purposes.
- **Database operations = 0.** No commit, push, tag, branch, deploy, or remote change.
- **No production or customer activation**, and no wiring of any prototype into the active path.
- **§195–§200 evidence is immutable.**
- **NO SEMANTIC SELF-GRADING.** No agent may fill any of the §200 152 verdict slots, or declare
  `CORRECT`, `PARTIALLY_CORRECT`, `INCORRECT`, `AMBIGUOUS` or `TRUTH_SPECIFICATION_DEFECT` for any
  §199 semantic question. Agents may organise and present evidence neutrally and explain terminology.
  The product owner supplies every semantic judgement.
- **No agent may expand its own authority** or act outside the scope above. Where an agent believes
  further authority is needed, it reports it under `AUTHORIZATION REQUIRED` and stops.
