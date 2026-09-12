# §185 — Settled owed-fact fixture compatibility correction

**2026-09-05. Local development correction. Zero provider calls, zero database operations.**

The five product-owner-reviewed SILENCE rows recorded at §184 could not be represented in the
runtime at all. This slice makes them representable without writing a false sentence anywhere.

---

## Root cause, established from the source

`owedFactDefects()` required `whyUnresolved` to be non-blank **regardless of status** — one
unconditional line, with no branch on `status`:

```ts
if (blank(f.whyUnresolved)) d.push('WHY_UNRESOLVED_MISSING');
```

`projectOwedFact()` then places that field in the payload a verifier request would carry. So for a
settled fact the type demanded a sentence, every truthful sentence was unavailable, and any
manufactured one would have been shown to the model on exactly the rows that exist as settled
controls. That is not a type inconvenience; it corrupts the control.

This is a **representation and validation defect**. It is not evidence that the settlement semantics
are wrong, and nothing about settlement semantics was changed.

## The correction

Three files, in the smallest form that makes the invariant true by construction.

**`owed-fact.types.ts`** — `whyUnresolved` becomes `string | null`, and the binding is published as a
constant so a later edit that breaks it contradicts something explicit:

```ts
WHY_UNRESOLVED_STATUS_INVARIANT = {
  UNRESOLVED: 'REQUIRED_NON_BLANK',
  COVERED: 'MUST_BE_NULL',
  SETTLED_BY_EVIDENCE: 'MUST_BE_NULL',
  REJECTED_BY_ARBITRATION: 'MUST_BE_NULL',
}
```

**`owed-fact-ledger.ts`** — validation becomes status-sensitive and stays strict in both directions.
`UNRESOLVED` still owes a non-blank sentence; every other status requires `null`, and the empty
string is refused rather than treated as absent.

**`verifier-v3-development-boundary.ts`** — `ProjectedOwedFact.whyUnresolved` becomes `string | null`.
Null is projected explicitly rather than the key being omitted, matching the existing convention
already used for `acceptableEvidence`.

**Nullable is not optional.** The four required refusals all hold: `UNRESOLVED` with null, and
`UNRESOLVED` with a blank string, are both refused; any non-`UNRESOLVED` status carrying any string
at all, including `''`, is refused. No synthetic stand-in exists anywhere — not "already resolved",
"not unresolved", "settled" or "no uncertainty".

### The status vocabulary is the repository's, not the authorization's

The authorization named `SETTLED_BY_OBSERVATION` and `NOT_APPLICABLE`. **Neither exists here.** The
four actual statuses are `UNRESOLVED`, `COVERED`, `SETTLED_BY_EVIDENCE` and
`REJECTED_BY_ARBITRATION`. Per the instruction to use the exact existing four and add none, proofs 5
and 6 run against `COVERED` and `REJECTED_BY_ARBITRATION`. No status was added.

### One behavioural change, and why it was unavoidable

`transition()` previously carried `whyUnresolved` unchanged out of `UNRESOLVED`, which under the new
invariant would have produced precisely the state the validator now refuses — the system emitting
values its own validator rejects. So the transition nulls the field.

Nulling it alone would have destroyed the record that the fact was ever unresolved and why. The
sentence is therefore **preserved verbatim on the transition record** as `whyUnresolvedAtTransition`
before being cleared. The ledger is append-only precisely so that a value which goes away leaves a
record behind. This is the only place where §185 goes beyond pure representation, and it is called
out here rather than left to be discovered.

## Proofs — 21 / 21 pass

All 18 required proofs, plus a table-completeness check and the two transition-preservation proofs.
Full detail in `SETTLED-FIXTURE-COMPATIBILITY-PROOFS.json`.

| | Proof | Result |
|---|---|---|
| 1 | `UNRESOLVED_NULL_WHY_REFUSED` | TRUE — defect raised and ledger admission throws |
| 2 | `UNRESOLVED_BLANK_WHY_REFUSED` | TRUE — empty and whitespace-only both refused |
| 3 | `UNRESOLVED_NONBLANK_WHY_ACCEPTED` | TRUE |
| 4 | `SETTLED_BY_EVIDENCE_NULL_WHY_ACCEPTED` | TRUE |
| 5 | `COVERED_NULL_WHY_ACCEPTED` | TRUE — stands in for `SETTLED_BY_OBSERVATION` |
| 6 | `REJECTED_BY_ARBITRATION_NULL_WHY_ACCEPTED` | TRUE — stands in for `NOT_APPLICABLE` |
| 7 | `NON_UNRESOLVED_NONBLANK_WHY_REFUSED` | TRUE on all three terminal statuses |
| 8 | `TEN_ROW_FIXTURE_STRUCTURALLY_REPRESENTABLE` | **10 / 10** |
| 9 | `SETTLED_FIXTURE_TYPE_MISMATCH` | **FALSE** |
| 10 | `FALSE_UNCERTAINTY_TEXT_MANUFACTURED` | **0** |
| 11 | `PAIR_SHARED_FACT_SEMANTICS_IDENTICAL` | **5 / 5** |
| 12 | `§184_PRODUCT_OWNER_TRUTH_BYTE_IDENTICAL` | TRUE — 5 / 5 artifacts |
| 13 | `PROVIDER_PROJECTION_WITHHELD_EVALUATION_FIELDS` | **10 / 10 clean** |
| 14 | `HR04_PROVIDER_PAYLOAD_CONTAINS_NO_EVALUATION_RATIONALE` | TRUE |
| 15 | `SETTLED_ROWS_PROVIDER_PAYLOAD_CONTAINS_NO_FALSE_WHY_UNRESOLVED` | **5 / 5 project null** |
| 16 | `UNRESOLVED_ROWS_RETAIN_APPROVED_WHY_UNRESOLVED` | **5 / 5 byte-identical to §184** |
| 17 | `PROVIDER_SETTLEMENT_AUTHORITY` | **NEVER** — no model authority member; a forged one throws |
| 18 | `FEATURE_OFF_CURRENT_PATH_INVARIANT` | TRUE — gate is the literal `false`, stage attaches nothing |

### The ten-row replay is ten ledgers, not one

Both members of a pair share a `factKey` by §184 design, and a ledger deduplicates on exact
`factKey` identity. The ten rows are therefore **ten independent analyses of the same five facts
under different observations**, and each admits to its own `DEVELOPMENT` ledger. A single ten-fact
ledger is not merely inconvenient — it is structurally wrong, and the ledger correctly refused it.

## Provider projection — observed, not redesigned

No projection field was added, removed or renamed. Measured against all ten fixtures:

- **Projected fields, identical for unresolved and settled rows:** `factKey`, `affectedDecision`,
  `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`.
  The existing eight, unchanged.
- **`factStatement` is NOT projected. `targetDecision` is NOT projected.** The §184 open question is
  now answered by measurement rather than inference. Their firewall classification is still absent
  and §185 deliberately did not change it.
- **All twelve withheld evaluation fields absent from all ten payloads**, including the HR-04
  evaluation rationale §183 identified as the answer key.
- **Settled rows project `whyUnresolved: null`.** No sentence, false or otherwise.

### The finding that matters for §183

`projectOwedFactsForVerifier` filters to `unresolvedFacts()`. A settled row's ledger therefore
projects **zero** facts, and an unresolved row's projects one.

The five settled controls are now fully representable — and through the standard projection function
they are **invisible to a provider**. Anything §183 intends to measure as containment on those rows
would be satisfied by the projection filter rather than by model behaviour. That is a design
question about the planned hosted validation, and it should be settled before the ten-row run is
authorized, not after the cohort is spent.

## Regression

TypeScript compilation clean. `test:expert-v3-development-integration` 40/40,
`test:expert-verifier-v3-protocol` 49/49, `test:expert-bounded-reliability` 44/44,
`test:expert-contract-foundation`, `test:expert-routing-contract`, `a0-settlement-replay` and
`test:governed-acceptable-evidence` all pass. Zero provider calls and zero database operations
throughout.

### One failure, deliberately left failing

`test-settlement-review-integration-2026-09-05.ts` **P20c** fails:

> `P20c no existing owed-facts module was modified — §182 is one NEW file; nothing existing changed`

It pins `owed-fact.types.ts` to `f77c7feb…`, which §185 was explicitly authorized to change. The
assertion is **correct and correctly failing**: it is a §182-scoped immutability statement detecting
a real, authorized, later change it predates. Its `owed-fact-binding.ts` half still passes, because
that file was not modified.

It was not touched. Updating the pinned hash would be relaxing a protected gate to obtain a pass;
adding a §185 phase to the test would modify §182 evidence, which this authorization forbids. The
stale-scope assertion is reported for product-owner direction instead. Four evidence artifacts also
carry the old hash — the §183, §184 and §170-integration records — and none was altered, because
each remains a true statement about its own slice.

## Claim boundary

**Established.** The existing inactive owed-fact architecture can now represent both
product-owner-reviewed unresolved and settled facts without manufacturing false `whyUnresolved`
text. The full ten-row §184 development truth cohort is structurally representable for future
inactive settlement behaviour validation.

**Not established.** §183 passed; HazLenz behaviour improved; HR-04 fixed; settlement claim quality
validated; human reviewability validated; governed evidence sufficient; automated semantic
settlement; customer readiness; production readiness; formal acceptance. Nothing here measures
behaviour — no provider ran.
