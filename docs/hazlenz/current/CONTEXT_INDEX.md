# CONTEXT INDEX — WHAT TO READ

Read the smallest set that answers the engineering question in front of you. Loading the validation
archive into an ordinary development prompt is the single largest avoidable token cost in this
repository.

---

## ALWAYS READ

- `docs/hazlenz/current/EXPERT_HAZLENZ_CURRENT_STATE.md`
- `docs/hazlenz/current/HAZLENZ_INVARIANTS.md`

Together about 2,600 words. That is the whole default context.

---

## WHEN MODIFYING THE FIRST PASS

- `backend/scripts/lib/expert-210j-first-pass-contract.ts` — the pinned contract and wire schema
- `backend/scripts/lib/expert-210j-declaration-projection.ts` — validate / project / refuse
- `backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts` — input contract types
- focused regressions only: §205 declaration preservation, §210E, §210J projection

Do not read the ancestor instruction modules (`210b2`, `210c`, `210e`, `210g`, `vnext`) unless you
are changing the additive chain itself. §210J composes them; reading the composed output is enough.

## WHEN MODIFYING THE VERIFIER

- `backend/scripts/lib/expert-218-property-review-contract.ts` — response schema
- `backend/scripts/lib/expert-218-property-instruction.ts` — verifier instruction
- `backend/scripts/lib/expert-218-property-consistency.ts` — whole-output refusal on inconsistency
- `backend/scripts/lib/expert-212-verifier-payload.ts` — what the verifier is shown
- `backend/src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts`
- focused regressions only: §218 structured verifier, §214 sibling containment

## WHEN MODIFYING AUTHORITY OR SETTLEMENT

- `backend/src/safescope-v2/expert-hazlenz/owed-facts/property-authority.ts`
- `backend/src/safescope-v2/expert-hazlenz/owed-facts/settlement-review.ts`
- `backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger.ts`
- `backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts`
- focused regressions only: §220 property-authority boundary, the human settlement and review state
  machines

## WHEN MODIFYING REGULATORY GROUNDING

- `backend/src/safescope-v2/expert-hazlenz/owed-facts/governed-evidence-derivation.ts`
- `backend/scripts/lib/expert-first-pass-instruction-vnext.ts` — governed binding construction
- `backend/scripts/lib/expert-governed-citation-reuse.ts`
- `backend/scripts/lib/expert-verifier-citation-boundary.ts`
- focused regressions only: governed-binding and grounding suites

## WHEN MODIFYING THE OWED-FACT LEDGER OR RR-7

- `owed-facts/owed-fact-ledger.ts`, `owed-fact-binding.ts`, `owed-fact.types.ts`
- `backend/scripts/lib/expert-205-declaration-preservation.ts`
- focused regressions only: §205 preservation, RR-7

## WHEN ASSEMBLING OR RUNNING AN EXPERIMENT

- `backend/scripts/lib/expert-221-assembly.ts` — the one assembly path, both legs
- `backend/scripts/lib/expert-228a-integrated-instrument.ts` — the current instrument: cases, hard
  requirements, applicability, coverage map, machine-checked truth preflight
- `backend/scripts/lib/expert-221-integrated-instrument.ts` — its frozen base
- `docs/hazlenz/governance/VALIDATION_EFFICIENCY_PLAN.md` — pick the lowest ladder level that
  answers the question

## WHEN VERIFYING THE BASELINE

- `backend/scripts/verify-229-protected-identities.ts` — recomputes all 29 protected module digests,
  prompt identities, schema identities and assembled call identities, and prints one composite
- `backend/scripts/run-229-protected-ladder.ts` — runs the 17 protected suites, local only

Both are zero provider calls and zero database operations. Run them before and after any structural
change; the composite identity and the 17/17 result must be identical.

---

## READ HISTORICAL VALIDATION EVIDENCE ONLY WHEN

- investigating provenance of a pinned identity or digest;
- reproducing a historical defect;
- auditing a frozen decision;
- changing an invariant that a specific piece of evidence established.

**Start at the archive index**, not at a directory listing:
`verification/expert-hazlenz-229-baseline-compartmentalization-2026-09-11/SECTION-229-HISTORICAL-ARCHIVE-INDEX.md`.
It carries all 142 Expert HazLenz evidence directories with purpose, result, terminal, manifest and
supersession, and separates the 33-section auditable spine from the exploratory remainder.

Never load a raw `*.jsonl` provider leg, a `RAW-*` file, or a frozen preregistration into a
development prompt. Query it with a script and read the answer.

---

## DO NOT READ BY DEFAULT

- `docs/INSITE_ENGINEERING_BLUEPRINT.md` — about 308,000 words. Grep it; never load it.
- `docs/hazlenz/validation/superseded-209/*` — the pre-§209 state package, archived in §229. The old
  path `docs/expert-hazlenz/` now holds only a redirect.
- Any `verification/**` directory, unless one of the four reasons above applies.
- Superseded prompt variants under `backend/scripts/lib/` other than those named above.

---

## GOVERNANCE AND PLANNING DOCUMENTS

Read when doing the work they describe, not otherwise.

- `verification/expert-hazlenz-229-baseline-compartmentalization-2026-09-11/SECTION-229-SOURCE-OF-TRUTH-MAP.md`
  — **the current map. Supersedes the §223 one below.**
- `verification/expert-hazlenz-229-baseline-compartmentalization-2026-09-11/SECTION-229-IMPROVEMENT-REGISTER.md`
- `docs/hazlenz/governance/REPOSITORY_COMPARTMENTALIZATION_PLAN.md` — §223 proposals. §229 measured
  them and refused most of the moves; read the §229 cleanup log for which and why.
- `docs/hazlenz/governance/SOURCE_OF_TRUTH_MAP.md` — superseded by the §229 map above.
- `docs/hazlenz/governance/PROMPT_CONTEXT_OPTIMIZATION.md`
- `docs/hazlenz/governance/VALIDATION_EFFICIENCY_PLAN.md`
