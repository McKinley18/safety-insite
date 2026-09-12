# §229 — SOURCE OF TRUTH MAP

One canonical definition per concept. This supersedes the §223 map, which recorded proposed actions;
this one records **what is canonical now**, after §229 measured which of those actions were
behaviour-preserving.

Paths are relative to `backend/`. **"Runtime" means the component library**: Expert HazLenz has no
NestJS consumer, and `backend/scripts/` contributes zero files to the production build.

---

## Canonical definitions

| concept | **canonical source** | status | competitors, and what they are |
|---|---|---|---|
| **first-pass contract and wire schema** | `scripts/lib/expert-210j-first-pass-contract.ts` — `buildExpert210jWireSchema`, pinned `7f1000b8…` | ACTIVE CANONICAL | `src/.../expert-prompt.ts` `buildExpertWireSchema` (v15) is a **SUPERSEDED** older wire schema for the same leg. It is not on the active closure for §227–§228C. |
| **first-pass instruction in force** | `scripts/lib/expert-226-property-selection-capability.ts` — `build226SystemPrompt` | ACTIVE CANONICAL | §210J, §210G, §224 prompts are **HISTORICAL FROZEN** additive ancestors. §226 composes them; deleting one breaks byte-for-byte reconstruction. |
| **declaration projection and RR-7** | `scripts/lib/expert-210j-declaration-projection.ts`, pinned `0f0918b2…` | ACTIVE CANONICAL | `expert-205-declaration-preservation.ts` owns the **preservation record**; the projection owns **admission**. They are two halves, not duplicates. `expert-first-pass-owed-fact-projection.ts` is **SUPERSEDED**. |
| **`STRUCTURALLY_INVALID_DECLARATION`** | `scripts/lib/expert-205-declaration-preservation.ts` — `UnresolvedSafetyFactRecord` | ACTIVE CANONICAL | resolved by §229: preservation owns the record type; projection only supplies the refusal codes. |
| **`decisionWhileUnresolved`** | `scripts/lib/expert-210j-first-pass-contract.ts` — `UNRESOLVED_ACTION_FIELD`, `UNRESOLVED_ACTION_SCHEMA_PROPERTY` | ACTIVE CANONICAL | several harnesses re-spell the field name as a string literal. Import the constant; never retype the name. |
| **OwedFact** | `src/.../expert-hazlenz/owed-facts/owed-fact.types.ts` | ACTIVE CANONICAL | none. The cleanest surface in the programme. |
| **owed-fact ledger and transitions** | `src/.../owed-facts/owed-fact-ledger.ts`, pinned `4fe33190…` | ACTIVE CANONICAL | none. `transition()` is the only way a fact leaves `UNRESOLVED`. |
| **verifier response contract** | `scripts/lib/expert-218-property-review-contract.ts` — `VERIFIER_218_RESPONSE_SCHEMA`, pinned `0769b676…` | ACTIVE CANONICAL | `expert-verifier-contract.ts`, `-v2`, `-v3`, `-v3-2`, `-v3-3` are **HISTORICAL FROZEN** additive bases. They stay: pinned-identity reconstruction depends on them. |
| **verifier instruction** | `scripts/lib/expert-218-property-instruction.ts`, pinned `c253e900…` | ACTIVE CANONICAL | `expert-verifier-instruction-v3.ts` builds the **user prompt** and is also active. Different jobs. |
| **verifier payload (what the verifier is shown)** | `scripts/lib/expert-212-verifier-payload.ts`, pinned `6728aa94…` | ACTIVE CANONICAL | `section-210b-verifier-payload.ts` supplies clarification isolation only. |
| **verifier consistency refusal** | `scripts/lib/expert-218-property-consistency.ts`, pinned `a3d55021…` | ACTIVE CANONICAL | none |
| **scope containment** | `scripts/lib/expert-214-scope-containment.ts`, pinned `244d3581…` | ACTIVE CANONICAL | none |
| **`propertySemanticRole`, `propertyValidity`** | `scripts/lib/expert-218-property-review-contract.ts` | ACTIVE CANONICAL | none |
| **property authority (KR-1 boundary)** | `src/.../owed-facts/property-authority.ts`, pinned `fb10ef70…` | ACTIVE CANONICAL | none. `mintPropertyAuthority` is the only producer of a `HUMAN_CONFIRMED_PROPERTY` authority. |
| **human review packet** | `src/.../owed-facts/property-authority.ts` — `buildPropertyReviewPacket` | ACTIVE CANONICAL | the §221 packet-quality rule restated in `INTEGRATED-PREREGISTRATION-221.json` is **HISTORICAL FROZEN** evidence and must not be edited to deduplicate. |
| **evidence authority** | `src/.../owed-facts/settlement-review.ts`, pinned `7f8b51b5…` | ACTIVE CANONICAL | none. Do not merge with property authority: the separation is invariant 5. |
| **settlement authority and application** | `src/.../owed-facts/settlement-review.ts` — `settleByReviewedEvidence` | ACTIVE CANONICAL | none |
| **governed evidence derivation** | `src/.../owed-facts/governed-evidence-derivation.ts` | ACTIVE CANONICAL | `scripts/lib/expert-202-governed-binding-contract.ts` is **SUPERSEDED** but still reads as authoritative. |
| **governed source binding into the prompt** | `scripts/lib/expert-first-pass-instruction-vnext.ts` — `governedBindingFor` | ACTIVE CANONICAL | `expert-governed-citation-reuse.ts` and `expert-verifier-citation-boundary.ts` each hold a distinct part of the boundary. Three files, three jobs, not duplicates. |
| **the one assembly path** | `scripts/lib/expert-221-assembly.ts`, pinned `8d301bd5…` | ACTIVE CANONICAL | `expert-228b-assembly.ts` and `expert-228c-assembly.ts` are cohort-specific transcriptions of it onto their own cases. |
| **current validation instrument** | `scripts/lib/expert-228a-integrated-instrument.ts` | ACTIVE CANONICAL | `expert-221-integrated-instrument.ts`, pinned `f1603b4f…`, is its **HISTORICAL FROZEN** base. §228A is an additive successor. |
| **validation gate vocabulary** | `scripts/lib/expert-228a-integrated-instrument.ts` — `HARD_REQUIREMENTS_228A`, `APPLICABILITY_RULE_228A` | ACTIVE CANONICAL | `expert-207-gates.ts` uses an older vocabulary (`PASSED`/`FAILED`/`UNDETERMINED`) — **SUPERSEDED**. §228A's vocabulary is `PASS`/`FAIL`/`AMBIGUOUS`/`NOT_EXERCISED` with `COVERAGE_INSUFFICIENT` at requirement level. |
| **current Expert pipeline description** | `docs/hazlenz/current/EXPERT_HAZLENZ_CURRENT_STATE.md` | ACTIVE CANONICAL | `docs/hazlenz/validation/superseded-209/CURRENT-EXPERT-HAZLENZ-STATE.md` is **HISTORICAL FROZEN**, archived in §229. |

---

## Where to look, by task

The pinned semantic contracts live under `backend/scripts/lib/` **deliberately**, because that
directory is outside the production build. Do not go looking for them under `src/`.

| if you are changing… | read |
|---|---|
| the first pass | `expert-210j-first-pass-contract.ts`, `expert-226-property-selection-capability.ts`, `expert-210j-declaration-projection.ts` |
| the verifier | `expert-218-property-review-contract.ts`, `expert-218-property-instruction.ts`, `expert-218-property-consistency.ts`, `expert-212-verifier-payload.ts` |
| authority or settlement | `src/.../owed-facts/property-authority.ts`, `settlement-review.ts`, `owed-fact-ledger.ts`, `owed-fact.types.ts` |
| governed grounding | `src/.../owed-facts/governed-evidence-derivation.ts`, `expert-first-pass-instruction-vnext.ts` |
| an instrument or a cohort | `expert-228a-integrated-instrument.ts`, `expert-221-assembly.ts` |

---

## Unresolved ambiguities

**Before §229: 6. After §229: 2.**

Resolved here by naming a canonical owner: the wire-schema competition between §210J and
`expert-prompt.ts` v15; the `STRUCTURALLY_INVALID_DECLARATION` ownership question across three
modules; the gate-vocabulary competition between §207 and §228A; and the current-state document
competition between `docs/expert-hazlenz/` and `docs/hazlenz/current/`.

**Still open, and both need a code change rather than a document:**

1. **Two prompt version namespaces for one leg.** `src/.../expert-prompt.ts` declares
   `EXPERT_PROMPT_VERSION = 'hazlenz.expert.prompt.v15'` while the contract in force declares
   `hazlenz.expert.first-pass-contract.226-decision-keyed-semantics`. Nothing reads the wrong one
   today, because the assembly path imports the §226 builder directly. It remains the most likely
   source of a future wrong-prompt incident.
2. **Two deterministic-projection modules.** `scripts/lib/expert-deterministic-projection.ts` is a
   §116 prototype; `src/.../expert-hazlenz/expert-deterministic-projection.ts` is its §119 promotion.
   Both headers document the relationship. The prototype is still on a live harness closure, so it
   was not archived.

Neither can be resolved without editing a module, and §229 authorized no behaviour change.

---

## The rule

When two definitions of one concept exist and neither is provably dead, make one canonical and have
the other import it. Do not delete the loser and do not leave both unmarked. **Where the duplicate is
an additive ancestor whose bytes compose the current contract, it stays**, because deleting it breaks
byte-for-byte reconstruction of a pinned identity.
