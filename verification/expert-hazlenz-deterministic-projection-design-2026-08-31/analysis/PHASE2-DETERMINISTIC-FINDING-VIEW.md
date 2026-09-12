# Phase 2 — `DeterministicFindingView`: verified status, and why it is *not* the extension point

§115 reported that no production projection exists. **Verified directly, and the finding is
stronger than reported: the type is fixture-only in the strict sense — every instance in the
repository is hand-written in a test fixture.**

## Current definition

`expert-contract.types.ts:319-326`:

```ts
export interface DeterministicFindingView {
  findingKey: string;
  hazardFamily: string;
  conditionState: ExpertConditionState;
  isLifeCritical: boolean;
  isActionable: boolean;
  requiredActions: string[];
}
```

## Construction sites — exhaustive

`grep -rn "deterministicFindings" src/ scripts/` returns, besides the type declaration and its use
in `ExpertAnalysisInput`:

| file | kind |
|---|---|
| `fixtures/no-call-scenarios.ts` | fixture (×8) |
| `fixtures/routing-fixtures.ts` | fixture (×8) |
| `fixtures/temporal-state-fixtures.ts` | fixture |
| `fixtures/hazard-actuality-fixtures.ts` | fixture (×10) |

**Zero production construction sites. Zero service, controller or module references.** `grep -rn
"DeterministicFindingView" src/` returns only line 319 (the declaration) and line 350 (its use in
`ExpertAnalysisInput`).

## Consumers

One: `buildExpertUserPrompt` (`expert-prompt.ts:479-488`), which renders family, condition state,
the two boolean flags and the required actions. Nothing else reads the array.

## Serialization

None of its own. It is prompt-rendered, never persisted, never returned to a customer, and never
sent over the Expert wire — the wire schema (`buildExpertWireSchema`) describes only the *response*.

## Tests

`test:expert-contract-foundation` (56) and `test:expert-routing-contract` (58) exercise it only as
fixture input. No test asserts anything about how it is *built*, because nothing builds it.

## Production-active / Expert-only / fixture-only?

**Fixture-only.** `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE` and the whole Expert layer is off the
customer request path; within that, this type has no constructor at all.

## What projecting state would require

Nothing in the customer-authoritative path. The deterministic layer already computes
`applicabilityDecisions` on the customer path today and simply discards them at the Expert boundary
— because there is no Expert boundary yet. A projection would be **purely additive**: a new
read-only derivation from an existing output.

## Why this type is NOT the right extension point

The name is convenient. That is not a reason, and this phase was told not to treat it as one.
Three substantive objections:

**1. It models the wrong thing.** A `DeterministicFindingView` is *a finding* — something the engine
concluded exists. A `NOT_APPLICABLE` determination is the opposite: a statement that a family was
considered and **no** finding arises. Representing "there is no finding here" as an entry in a
findings array is a category error, and it is exactly the sort that reads fine in code and misleads
a reader — human or model — at the prompt.

**2. `ExpertConditionState` has no member that means it.** The vocabulary is `ACTIVE`, `CONTROLLED`,
`CORRECTED`, `REMOVED_FROM_SERVICE`, `NEGATED`, `HYPOTHETICAL`, `INSUFFICIENT_EVIDENCE`, `UNKNOWN`.
The nearest is `NEGATED`, which means *a hazard was asserted and then negated* — not *a family was
evaluated and excluded*. Overloading it would corrupt a vocabulary that
`test-expert-contract-foundation.ts` asserts is byte-identical to the Level-3 one by reading that
file as data. Adding a member would change a frozen shared vocabulary and break that assertion.

**3. It cannot carry the rationale.** The whole content of the R6 determination is
`moving or accessible energy = CONTRADICTED`. `DeterministicFindingView` has no field for a
predicate, a status, or a confidence, and `requiredActions: string[]` is semantically an action
list — smuggling rationale into it would be prose duplication in the one field guaranteed to be
misread as an instruction.

## Alternatives considered

| # | option | verdict |
|---|---|---|
| 1 | Extend `DeterministicFindingView` (add `NOT_APPLICABLE` to `ExpertConditionState`) | **Rejected** — all three objections above; breaks a frozen shared vocabulary. |
| 2 | **New sibling array on `ExpertAnalysisInput`: `deterministicFamilyDispositions[]`** | **SELECTED.** Additive, no existing type changes, models "assessment" distinctly from "finding", carries predicate-level rationale and confidence. |
| 3 | Reuse `governedStandards: GovernedStandardView[]` | **Rejected** — carries `citation`, is the governed-record channel, and would make an ungoverned engine output look governed. Directly contrary to `EXPERT_NON_GOALS`. |
| 4 | Add the assessments as an extra `authoritativeSources` entry | **Rejected and dangerous** — sources are the quote-binding surface. Expert would be able to "quote" the deterministic rationale as if it were observation text, corrupting grounding. |
| 5 | Prompt-only prose, no type | **Rejected** — the authorization requires structured data over prose duplication, and an untyped block cannot be validated or scored. |
| 6 | Encode into `requiredActions` of an existing finding | **Rejected** — semantically false; "required action" is a customer-facing instruction. |

**Option 2 is the prototype built in
`backend/scripts/lib/expert-deterministic-projection.ts` (diagnostic-only).**
