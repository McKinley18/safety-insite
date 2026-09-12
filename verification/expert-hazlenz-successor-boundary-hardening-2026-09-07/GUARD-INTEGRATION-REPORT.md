# §203 — boundary guard integration report (Agent B)

**Provider calls = 0 · database operations = 0 · no pre-existing file modified · files created: 3.**
Date 2026-09-07. All five §202 category-A guards are integrated into the SUCCESSOR path only, per
Agent A's binding architecture (`SUCCESSOR-VERSION-ARCHITECTURE.md`). Every guard is IMPORTED from
`expert-202-authority-boundary-guards.ts`, never reimplemented. No historical caller is rewired; no
§187-pinned byte changed.

## 1. Per-guard results — the three facts, each its own counted assertion

Suite: `backend/scripts/test-203-boundary-guards.ts` — **52 passed, 0 failed** (measured, this
run). For each guard the suite additionally proves the FROZEN ancestor still accepts the unsafe
state (`*.today`), so the successor's refusal is demonstrably the new boundary and not an upstream
accident.

| guard | GUARD_EXISTS | GUARD_CALLED | GUARD_REJECTS_ADVERSARIAL_INPUT | successor call site |
|---|---|---|---|---|
| **ABF-1** declaring stage | PASS (same function object) | PASS — `DEVELOPMENT_HUMAN_TRUTH` → `STAGE_REJECTED`, nothing delegated | PASS — arbitrary non-member stage cannot reach frozen code | `projectDeclaredOwedFacts203`, whole-call pre-check |
| **ABF-2** evidence provenance | PASS | PASS — non-member provenance on a bound criterion refuses the declaration with the guard's code | PASS — hostile provenance never reaches a fact; frozen path admits the same input (`ABF-2.today`) | per-declaration pre-screen over every bound governed id |
| **ABF-3** nomination field scan | PASS | PASS — `status`/`settled`/`acceptableEvidence` on the nomination refuse at admission | PASS — each intentionally supplied owned field individually named; frozen ancestor admits the same nomination (`ABF-3.today`) | `checkBindingDeclarations203` NOMINATED_NEW branch |
| **ABF-7** nested governance fields | PASS | PASS — `extra:{citation,approved}` refused with the recursive guard's violations, path `$.extra.citation` named | PASS — depth-4 burial still found; frozen projection admits the same blob with zero codes (`ABF-7.today`) | per-declaration pre-screen, depth-recursive |
| **ABF-8** nomination ceiling | PASS — successor ceiling bound to `FROZEN_NOMINATION_CEILING` | PASS — guard exercised on every call as an edit tripwire; `nominationCeilingViolations(5)` names the widening | PASS — an intentionally supplied fourth argument is structurally inert (no parameter exists, `fn.length === 3`); frozen ancestor admits 2 nominations under `maxNominations=5` (`ABF-8.today`) | `checkBindingDeclarations203`, constant + no widening parameter |

**ABF-2 limit pinned, not papered over** (`ABF-2.membership-only-limit`): the §202 guard enforces
closed-set MEMBERSHIP only. `MODEL_SELF_AUTHORED` is a member — deliberately representable-and-
refusable — and passes this boundary; population admissibility remains
`assertProductionAdmissible`'s question, where PRODUCTION fails closed. This is exactly what §202
documented, now asserted so nobody reads more into ABF-2 than it enforces.

## 2. The B5 post-condition and the TODO-C seam (ABF-5 / Ruling 3)

`applyAdmittedDeclarations203` calls §202's `nominationOutcomeViolations` (G6) on every apply and
**THROWS** on any violation. Measured: with a ledger whose only fact is terminal (`COVERED`), a
colliding nomination is — at B's freeze — still admitted by the seam-state admission (ancestor
verbatim, marked `TODO-C`), and the apply then throws
`ADMITTED_NOMINATION_PRODUCED_NO_FACT` instead of silently no-opping. The frozen path's silent
discard is reproduced alongside (`ABF-5.today`): admitted, applied, ledger unchanged, no signal.

**The suite pins the invariant, not the branch**: a terminal-status collision must never succeed
silently — either refused at admission with `FACT_IDENTITY_COLLISION` (Agent C's widening) or
thrown at apply (B5). The exercised branch is logged (`ADMITTED_THEN_THROWN_AT_APPLY` at this
freeze), so C's widening will flip the branch without editing this suite.
`FACT_IDENTITY_COLLISION` is already a member of `SUCCESSOR_BINDING_ADMISSION_CODES` so the
vocabulary is stable across the handoff.

**Seam location for Agent C** (declared handoff — B is frozen on this file as of this report):
`backend/scripts/lib/expert-203-successor-binding.ts`, the block marked
`TODO-C (Agent C seam)` inside `checkBindingDeclarations203`'s NOMINATED_NEW branch — the
collision test copied verbatim from ancestor `owed-fact-binding.ts:204-208`, which is the
narrowest boundary holding both identities.

## 3. Ruling 5 — the priority channel is gone, measured from both sides

- FROZEN ancestor (`R5.today`): `priority: 'LIFE_CRITICAL'` on a nomination is written straight
  onto `OwedFact.priority`.
- SUCCESSOR: a nomination carrying `priority` is refused (`NOMINATION_CARRIES_PROVIDER_PRIORITY`)
  whether the value is a member or garbage; there is no channel to validate. Actual priority is
  the deterministic constant `SUCCESSOR_NOMINATED_FACT_PRIORITY = 'OTHER'` (the non-escalating
  floor, the same policy `FIRST_PASS_PROJECTED_PRIORITY` states). Model urgency travels only in
  `urgencyNomination` — vocabulary-checked, carried on the admission record, and measured to map
  into NO priority and NO escalation state (`R5.urgency-never-escalates`).
- `NOMINATION_PRIORITY_NOT_A_MEMBER` is not in the successor vocabulary; the field it validated
  does not exist in this contract. ABF-4 is thereby dissolved **for the successor contract only**;
  the historical contradiction stands untouched for the product owner.

## 4. Ruling 4 — schema closure, proven at the boundary

- Both model-facing schema constants (`SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203`,
  `SUCCESSOR_FIRST_PASS_DECLARATION_SCHEMA_203`) set `additionalProperties: false` on **every**
  object node — asserted by a recursive walk over the schema data, not by a comment.
- The runtime parse boundary enforces the same closure: unknown declaration fields (`sourceId`,
  `governedEvidenceSourceIds`, `branchA`, `settled`, `factKeyOverride`) and unknown nomination
  fields (`sourceId`, `governedEvidenceSourceIds`, `affectedDecisionOverride`,
  `coverageDecision`) are all refused (`UNKNOWN_FIELD_AT_CLOSED_BOUNDARY` /
  `PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD`), measured field by field. An unknown field cannot
  acquire authority by surviving parsing, because it does not survive parsing.

## 5. Recorded divergences (all pinned by regression test)

| id | divergence | pin |
|---|---|---|
| D1 (A's declared) | identity computed over boundary survivors; a boundary-refused declaration consumes no frozen anchor ordinal (frozen `…0-34.2` vs successor `…0-34.1`, measured) | `D1.anchor-ordinal-pin` |
| D2 | closed top-level key set at the projection boundary; frozen admits a benign unknown key, successor refuses | `D2.closed-keys-pin` |
| D3 | ABF-2 checks EVERY bound governed id's held criterion, not only the first; fail-closed is not order-dependent | `ABF-2.D3-divergence-pin` |
| B1–B5 | per the module header of `expert-203-successor-binding.ts`, each with ancestor line refs | ABF-3/R5/ABF-8/R4/ABF-5 cases |

Safe-path equivalence holds beside the divergences: byte-identical `ProjectionResult` and
byte-identical resulting ledger on well-formed input (`DIFF.projection`, `DIFF.binding-outcome`).

## 6. One narrow cast, declared

`applyAdmittedDeclarations203` passes its successor-shaped check to §202's
`nominationOutcomeViolations` via `as unknown as BindingCheckResult`. The guard reads only
`bindingMode`, `nomination.factKey` and `declarationId` — all present and truthful on the
successor shape; **no field value is invented** to satisfy the type, and `ABF-5.invariant` proves
the guard fires on successor-shaped input. Flagged here so Agent F's sweep sees it as a declared
TYPE_ONLY seam with an execution proof beside it.

## 7. Files created (nothing else touched)

- `backend/scripts/lib/expert-203-successor-projection.ts` (WRAPS the frozen projection)
- `backend/scripts/lib/expert-203-successor-binding.ts` (COPIES the two named ancestor functions;
  now owned by Agent C per the declared handoff)
- `backend/scripts/test-203-boundary-guards.ts`

## 8. Verification actually executed

| check | result |
|---|---|
| `npx ts-node scripts/test-203-boundary-guards.ts` | **52 passed, 0 failed** |
| `npx tsc --noEmit -p tsconfig.scripts-203.json` | **EXPERIMENT_SCOPE_TYPECHECK (§203): PASS** (exit 0; scope shared with other agents' files — zero diagnostics anywhere in scope at this run) |
| `npx ts-node scripts/verify-203-text-integrity.ts` | **PASS** — 13 files scanned byte-safe, 0 raw NULs |
| `git status --porcelain` | only the three files above, all untracked-new; zero pre-existing files modified |

## AUTHORIZATION REQUIRED

Nothing beyond §203's grant. Design deviations from Agent A: **none** — the urgency-nomination
field, the two-function copy surface, and all guard placements follow A's architecture as written.
