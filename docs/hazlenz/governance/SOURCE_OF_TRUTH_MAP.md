# SOURCE OF TRUTH MAP

One authoritative definition per concept, wherever technically practical. This table records where
each important Expert HazLenz concept is actually defined today, who consumes it, what competes with
it, and what should happen. **Nothing in this table was executed in §223.**

Paths are relative to `backend/`. "Runtime consumer" means a module under `src/`; note that Expert
HazLenz currently has no NestJS consumer at all, so runtime here means the component library rather
than a live production path.

---

| concept | canonical source | runtime consumer | test consumer | duplicates / competitors | action |
|---|---|---|---|---|---|
| **HazLenz first-pass schema** | `scripts/lib/expert-210j-first-pass-contract.ts` — `buildExpert210jWireSchema`, pinned `7f1000b8…` | none | `expert-221-assembly.ts`, §210J and §221 suites | `expert-prompt.ts` `buildExpertWireSchema` (v15) in `src/` is a separate, older wire schema for the same leg | **MOVE** the §210J contract to `src/.../expert-hazlenz/contracts/` once a production-build boundary exists; then **RESOLVE** which of the two schemas is the contract and archive the other |
| **OwedFact** | `src/.../expert-hazlenz/owed-facts/owed-fact.types.ts` | `owed-fact-ledger.ts`, `owed-fact-binding.ts`, `structural-questions.ts`, `settlement-review.ts`, `property-authority.ts` | §205, §210J, §214, §220 suites | none | **KEEP AS IS.** This is the cleanest surface in the programme. |
| **decisionWhileUnresolved** | `scripts/lib/expert-210j-first-pass-contract.ts` — `UNRESOLVED_ACTION_FIELD` and `UNRESOLVED_ACTION_SCHEMA_PROPERTY` | none | 6+ harnesses reference the field by name | the field name appears as a string literal in several harnesses rather than importing the constant | **MERGE** — import the exported constant everywhere; never re-spell the field name |
| **Verifier schema** | `scripts/lib/expert-218-property-review-contract.ts` — `VERIFIER_218_RESPONSE_SCHEMA`, pinned `0769b676…` | none | `expert-221-assembly.ts`, §218 suite | `expert-verifier-contract.ts`, `-v2`, `-v3`, `-v3-2`, `-v3-3` — five ancestor contracts, all on the §221 closure as the additive base | **KEEP** the chain (identity reconstruction depends on it); **RENAME** ancestors with an `archive-`/`base-` marker so currency is visible |
| **propertyReview** | `src/.../expert-hazlenz/owed-facts/property-authority.ts` | `settlement-review.ts` | §218, §219, §220, §221 harnesses | none | **KEEP AS IS** |
| **propertySemanticRole** | `src/.../expert-hazlenz/owed-facts/property-authority.ts` | `property-authority.ts` internals | §218, §219, §220 harnesses | none | **KEEP AS IS** |
| **Property authority** | `src/.../expert-hazlenz/owed-facts/property-authority.ts`, pinned `fb10ef70…` | `settlement-review.ts` | §220 suite (43 assertions), §221 | none | **KEEP AS IS** |
| **Evidence authority** | `src/.../expert-hazlenz/owed-facts/settlement-review.ts`, pinned `7f8b51b5…` | `owed-fact-ledger.ts` | §220, §221 | none | **KEEP AS IS.** The separation from property authority is an invariant; do not merge the two modules. |
| **Settlement authority** | `src/.../expert-hazlenz/owed-facts/settlement-review.ts` | `owed-fact-ledger.ts` | §219, §220, §221 | none | **KEEP AS IS** |
| **Governed evidence** | `src/.../expert-hazlenz/owed-facts/governed-evidence-derivation.ts` | none | grounding suites | `scripts/lib/expert-202-governed-binding-contract.ts` (1,326 lines) is off the §221 closure but still reads as authoritative | **ARCHIVE** the §202 contract |
| **Regulatory source binding** | `scripts/lib/expert-first-pass-instruction-vnext.ts` — `governedBindingFor`, `VNextGovernedEvidenceRecord` | none | §221 assembly, grounding suites | `expert-governed-citation-reuse.ts` and `expert-verifier-citation-boundary.ts` each hold part of the boundary | **MERGE** the three into one governed-evidence module under `src/` after the build boundary exists |
| **RR-7 preservation** | `scripts/lib/expert-210j-declaration-projection.ts`, pinned `0f0918b2…` | none | §205 preservation (92 assertions), §210E (103), §210J (99) | `expert-205-declaration-preservation.ts` and `expert-first-pass-owed-fact-projection.ts` both carry preservation logic | **MOVE** the projection to `src/.../contracts/`; **RESOLVE** which of the three owns `STRUCTURALLY_INVALID_DECLARATION` |
| **Human review packet** | `src/.../expert-hazlenz/owed-facts/property-authority.ts` | `settlement-review.ts` | §220, §221 (packet-quality slots) | the §221 packet-quality rule is restated in `INTEGRATED-PREREGISTRATION-221.json` | **KEEP AS IS.** The preregistration restatement is frozen evidence and must not be edited to deduplicate. |
| **Prompt versions** | `scripts/lib/expert-210j-first-pass-contract.ts` and `expert-218-property-instruction.ts` | none | §221 assembly | `src/.../expert-prompt.ts` declares `EXPERT_PROMPT_VERSION = 'hazlenz.expert.prompt.v15'`, a fourth independent version line | **RESOLVE.** Two version namespaces for one leg is the most likely source of a future wrong-prompt incident. |
| **Validation gates** | `scripts/lib/expert-221-integrated-instrument.ts` — `INTEGRATED_HARD_GATES_221`, `HARD_GATE_RULE_221`, `gateCoverage221()`, pinned `f1603b4f…` | none | `compute-222-gates.ts`, §221 preregistration suite (53 assertions) | `expert-207-gates.ts` defines an older gate vocabulary (`PASSED`/`FAILED`/`UNDETERMINED`/`COVERAGE_INSUFFICIENT`/`NOT_APPLICABLE`) still on the §221 import closure | **RESOLVE.** Two gate-status vocabularies is a real misreading risk; §221 and §207 use different words for the same outcomes. |

---

## Cross-cutting duplicates

**Digest helpers.** 95 local `const sha = (...)` definitions across `backend/scripts/`, 28 of them
in `scripts/lib/`. **MERGE** into one shared utility. No behaviour change: all compute
`sha256` hex.

**Deterministic projection.** `scripts/lib/expert-deterministic-projection.ts` is a §116
diagnostic prototype; `src/.../expert-hazlenz/expert-deterministic-projection.ts` is its §119
production promotion. Both headers document the relationship. **ARCHIVE** the prototype once no live
harness imports it.

---

## Rule

When two definitions of one concept exist and neither is provably dead, the resolution is to make one
canonical and have the other import it — not to delete the loser and not to leave both. Where the
duplicate is an additive ancestor whose bytes compose the current contract, it stays and is renamed
to show it is a base, because deleting it would break byte-for-byte reconstruction of a pinned
identity.
