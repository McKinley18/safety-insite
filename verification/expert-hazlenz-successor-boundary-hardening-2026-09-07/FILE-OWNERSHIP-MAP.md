# §203 — file ownership map

**Written by the lead orchestrator BEFORE any agent began.** Every mutable file has **exactly one**
owning agent at any moment. One deliberate serial ownership transfer is declared below.

`…/` = `verification/expert-hazlenz-successor-boundary-hardening-2026-09-07/`

## The partition

| owner | may CREATE and MODIFY | mode |
|---|---|---|
| **Orchestrator** | `backend/package.json` · `backend/tsconfig.scripts-203.json` · this map · `…/INTEGRATION-REPORT.md` · `…/RUN-SUMMARY.json` · `…/PRESERVATION-VERIFICATION.txt` · `…/SUCCESSOR-SOURCE-MANIFEST.json` (generated, after implementation freeze) | integration; only party that speaks to the product owner |
| **Agent A** — successor version architect | `…/SUCCESSOR-VERSION-ARCHITECTURE.md` · `backend/scripts/lib/expert-203-successor-identity.ts` · `backend/scripts/generate-203-source-manifest.ts` · `backend/scripts/verify-203-source-integrity.ts` · `backend/scripts/verify-203-text-integrity.ts` | design + integrity gates; READ ONLY over all historical evidence and all pinned/runtime code |
| **Agent B** — boundary guard integrator | `backend/scripts/lib/expert-203-successor-projection.ts` · `backend/scripts/lib/expert-203-successor-binding.ts` (until handoff) · `backend/scripts/test-203-boundary-guards.ts` · `…/GUARD-INTEGRATION-REPORT.md` | successor implementation; provider calls = 0 |
| **Agent C** — ABF-5 identity collision engineer | `backend/scripts/lib/expert-203-successor-binding.ts` (**after B completes — declared serial handoff**) · `backend/scripts/lib/expert-203-fact-identity-collision.ts` · `backend/scripts/lib/expert-203-successor-ledger.ts` · `backend/scripts/test-203-identity-collision.ts` · `…/IDENTITY-COLLISION-ARCHITECTURE.md` | successor implementation; provider calls = 0 |
| **Agent D** — schema closure / authority red team | `backend/scripts/test-203-schema-closure-redteam.ts` · `…/SCHEMA-CLOSURE-RED-TEAM.md` | READ ONLY over implementation; writes only its own adversarial suite + report |
| **Agent E** — effective grammar identity engineer | `backend/scripts/lib/expert-203-effective-grammar-identity.ts` · `backend/scripts/test-203-grammar-identity.ts` · `…/EFFECTIVE-GRAMMAR-IDENTITY-203.md` | prospective replacement of §201 identity; §201/§202 modules read-only |
| **Agent F** — systemic authority-boundary auditor | `…/AUTHORITY-BOUNDARY-AUDIT-203.md` | **STRICT READ ONLY** otherwise |

## Sequencing

A ∥ E ∥ F first. B after A. C after B (C receives ownership of
`expert-203-successor-binding.ts` at that moment; B may no longer write it). D after B and C.
Orchestrator generates `…/SUCCESSOR-SOURCE-MANIFEST.json` only after B, C and E freeze, then runs
all gates.

## Rules binding every agent

- **Provider calls = 0. Database operations = 0.** No commit, push, tag, branch, deploy.
- **No §187-pinned file may be modified**: `owed-fact.types.ts`, `owed-fact-ledger.ts`,
  `owed-fact-binding.ts`, `verifier-v3-development-boundary.ts` (pinned by
  `owedFactSourceHashes`), `expert-prompt.ts`, `expert-verifier-contract-v3.ts` — nor any
  `verify-19x-source-integrity` script, nor any other pre-existing file. Agents create NEW §203
  files only.
- **§195–§202 evidence is immutable.** A 2,470-file sha256 baseline (all
  `verification/expert-hazlenz-*` files, all of `backend/src/safescope-v2`, all pre-existing
  `backend/scripts` .ts/.json) was taken before launch and is re-verified after.
- **The governed-binding stage stays `REDACTED`.** The §202 verbatim-evidence mode is NOT
  activated (product-owner Ruling 2). No regex accumulation on `CITATION_SHAPED_PATTERN`.
- **No semantic self-grading.** The 120 product-owner adjudication verdicts remain 0/120 and no
  agent supplies, simulates, or partially fills one. No semantic prompt tuning, no final OwedFact
  representation choice, no final escalation-policy choice, no Expert semantic-quality claim.
- **Raw NUL bytes (0x00) are forbidden** in every §203 source, test, report and generated
  artifact. Use the escaped textual representation. `verify-203-text-integrity.ts` gates this
  binary-safely (not via grep).
- **Verification labels must name their scope**: `SRC_TYPECHECK`,
  `EXPERIMENT_SCOPE_TYPECHECK (§203)`. The `backend/scripts` baseline remains 181 diagnostics.
- **No agent may expand its own authority.** Report `AUTHORIZATION REQUIRED` and stop.
