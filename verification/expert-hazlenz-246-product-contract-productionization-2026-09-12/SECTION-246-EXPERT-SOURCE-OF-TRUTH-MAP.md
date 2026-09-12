# §246 — Phase 1, Expert Source-of-Truth Map

Zero provider calls. Zero database operations. The map was produced before any code moved.

## Method

The closure was computed mechanically from the acceptance assembly root
(`scripts/lib/expert-243-assembly.ts`), then extended to every module the production pipeline must
reach — request building **and** response validation, both legs. §245 counted the assembly closure
at 42 modules. The production closure is not the same set: it adds four modules the assembly never
imports because the *executor* and the *derivation* call them, and it drops seven the assembly
reaches only through a validation harness.

| | Modules | Lines |
|---|---|---|
| §245 assembly closure | 42 | 17,898 |
| added: reached by executor/derivation, not assembly | +4 | +1,219 |
| removed: validation-only instrumentation | −7 | −6,504 |
| **production semantic set** | **39** | **13,035** |
| **retained under `scripts/`** | **7** | **6,504** |

The four added are `expert-233-posture-projection`, `expert-235-wire-normalization`,
`expert-239-posture-projection` and `expert-218-property-consistency`. Three are the deterministic
projections that validate what the provider returns; the fourth is the property-review consistency
check `derive-243-authoritative-state.ts` calls. A map built only from the assembly would have
promoted the request builders and left the validators behind.

## Classification

| Class | Meaning | Count | Disposition |
|---|---|---|---|
| A | semantic Expert core | 12 | promoted |
| B | deterministic safety contract | 11 | promoted |
| C | provider/request adapter | 0 | none existed; created in Phase 7 |
| D | authority/settlement | 0 in closure | already in `src/`, untouched |
| E | governed evidence | 2 | promoted |
| F | review artifact | 14 | promoted |
| G | validation-only instrumentation | 7 | retained under `scripts/` |
| H | fixture/test-only | 0 | — |
| I | obsolete/duplicate | 0 | — |

Per-module rows, with original path, current path, protected status, pre-move and post-move digests,
are in `SECTION-246-MODULE-MIGRATION-MAP.json`.

## The boundary that mattered

The authorization warned against moving validation-only fixtures into production merely because they
share a closure. One edge accounted for almost all of that risk.

`scripts/lib/expert-208b-verifier-recovery.ts` is a §208 **recovery harness**: it loads persisted
first-pass output from disk, assembles verifier requests for one frozen section, and runs
pre-run identity checks. It imports `FROZEN_TRUTH_CASES` from the 3,836-line truth specification and
`preregistrationIdentity` from §207. Through it the closure inherits the acceptance cohort, the
gates, the protocols and the preregistration — **5,757 lines of acceptance instrument**.

The acceptance assembly imports exactly two things from that module: `VERIFIER_TOOL_NAME` and
`VERIFIER_TOOL_DESCRIPTION`. Two string constants. Promoting the harness to carry them would have
moved the frozen truth of the acceptance cohort into the shipped product.

The tool identity is therefore restated in the production entry point, byte-identical, and the
harness stays under `scripts/`. This single decision is the difference between promoting 13,035
lines and promoting 18,792.

## Leakage check

After the classification, every one of the 39 promoted modules was scanned for an import of any of
the 7 retained modules. **There were none.** The boundary is clean, which is why the promotion could
be a relocation rather than a refactor: no promoted module needed a harness dependency severed,
stubbed or injected.

## The base-contract finding

One module in the promoted set imports from the pre-existing `src/` Expert:

    expert-first-pass-instruction-vnext.ts
      imports EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, buildExpertWireSchema,
              buildExpertUserPrompt, redactCitationTokens
      from src/safescope-v2/expert-hazlenz/expert-prompt.ts

This changes the reading §245 gave. `expert-prompt.ts` is not a competing implementation sitting
beside the validated contract. **It is the base layer the validated contract extends.** The chain is

    expert-prompt.ts → vNext → 210b2/c/e/g → §210J → §233 → §235 → §237 → §239

and each layer reconstructs its base byte for byte, with suites asserting the reconstruction.
§245 was right that the module contains no `driverRole`, `immediateSafetyPosture`, `requiredBy` or
`unresolvedFactDeclarations`; it was wrong to infer from that a rival product. The successor layers
are where those fields are added.

The consequence for Phase 5 is in `SECTION-246-PRODUCTIONIZATION-ARCHITECTURE.md`: the base module
is retained as part of the canonical chain, and what needed disposing of was never the module but
the ability to *run the base alone* as if it were the product.
