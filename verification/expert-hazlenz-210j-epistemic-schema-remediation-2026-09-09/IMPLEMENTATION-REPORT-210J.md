# §210J — BOUNDED EPISTEMIC SCHEMA REMEDIATION: IMPLEMENTATION REPORT

**Scope executed.** Provider calls 0. Database operations 0. No customer or production activation.
No commit, push, tag or deploy. No hosted call. No verifier call. §210H not rerun. G1 not rerun. No
new first-pass probe built. S6 remains `NOT_EXERCISED`.

**Terminal reached.**

```
EXPERT_HAZLENZ_EPISTEMIC_SCHEMA_REMEDIATION_IMPLEMENTED —
PRODUCT_OWNER_FIRST_PASS_FREEZE_DECISION_REQUIRED
```

No conflict requiring semantic redesign was exposed.

**Stated first, because it governs how everything below may be read.** This slice makes **no
behavioural claim about §210H G1**. The product owner has ruled that the previous eleven-field
declaration was capable of expressing the correct G1 semantics, and §210H G2 demonstrated it. A
declaration whose property is evidence-shaped remains structurally valid under the remediated
contract, exactly as it was under the previous one. The suite asserts this limit rather than leaving
it implicit.

---

## 1. WHAT WAS BUILT

Five new modules and one suite, all additive, none wired to any path.

| File | Role |
|---|---|
| `backend/scripts/lib/expert-210j-first-pass-contract.ts` | Gap 1: the declaration contract successor — prompt block, wire schema, field check |
| `backend/scripts/lib/expert-210j-declaration-projection.ts` | Gap 1: projection successor, RR-7 carriage, verifier-facing view |
| `backend/scripts/lib/expert-210j-settlement-successor.ts` | Gap 2: established-branch settlement successor |
| `backend/scripts/lib/expert-210j-ancestry-successor.ts` | The additive §203 provenance record |
| `backend/scripts/lib/expert-210j-fixtures.ts` | The zero-provider design fixtures |
| `backend/scripts/test-210j-epistemic-schema-remediation.ts` | Proof suite, 98 checks |

Two measurement scripts, both read-only with respect to historical evidence:
`analyze-210j-compatibility.ts` and `emit-210j-report-data.ts`. One scoped typecheck configuration,
`tsconfig.scripts-210j.json`, namespaced so no pre-existing file enters its scope.

**No pinned or frozen file was edited.** `owed-fact.types.ts`, `owed-fact-ledger.ts`,
`owed-fact-binding.ts`, `verifier-v3-development-boundary.ts`, `expert-prompt.ts`,
`settlement-review.ts`, `expert-first-pass-instruction-vnext.ts`,
`expert-first-pass-instruction-210g.ts`, `expert-first-pass-owed-fact-projection.ts` and
`expert-205-declaration-preservation.ts` are all untouched. The suite verifies the five §187 hashes
directly and the §201 suite independently confirms the vNext module is byte-unchanged.

---

## 2. GAP 1 — THE UNRESOLVED OPERATIONAL CONSEQUENCE

### 2.1 The field

**`decisionWhileUnresolved`**, one required string on the first-pass declaration.

The name follows the vocabulary already in the block. `decisionIfA` and `decisionIfB` carry "what is
done TODAY", so the third member of that family reads as one. `currentActionWhileUnresolved` says
the same thing in eight more characters and introduces a second noun for a concept the block already
names.

Required rather than optional, because every entry in `unresolvedFactDeclarations` is unresolved by
the collection's own definition. There is no entry for which the field is vacuous, and an optional
field would be omitted exactly on the entries under pressure.

### 2.2 Built by construction, like every successor before it

§210B-2, §210C, §210E and §210G each derive their prompt from the previous one at a unique anchor
and abort on base drift. This does the same, with the anchor **inside** the field list rather than
at the closing line, because a field has to be described where the other fields are described. The
block lands between the two branch decisions and `whyNecessaryNow`. The anchor was verified unique
in both prompt variants.

Removing the block reproduces the §210G prompt **byte for byte in both variants**, which is what
makes "§210J is §210G plus one field" a checkable claim. GATE 2, 3, 8, 9, 10, 11 and 12 all survive
unchanged.

### 2.3 The narrowing is carried in the instruction, not only in the code

Without it, the natural reading of a new action field beside two existing ones is that it must say
something different from both. The block therefore tells the model, in terms, that the field may
read much like `decisionIfB` where holding is the safe course, that nothing compares the two, and
that a difference must not be manufactured. It also states that "no additional restriction while
this remains open" is a real answer, so the field does not become a habit of stopping work.

### 2.4 R7 placeholder protection: extended, and why

**Yes, it applies.** §210D's D2 emitted `decisionIfA: "unused"` and `decisionIfB: "placeholder"`, and
the identical failure is available on an action field under uncertainty: a filler value satisfies
every presence check while saying nothing a reviewer can act on.

The protection is **extended, not re-implemented**. The closed `NON_SEMANTIC_FILLER` set is imported
from the frozen projection module and **no member was added**. Whole-field literals only, exactly as
§210E defined it — "hold the lift while the load rating is unknown" is a real action and is not
flagged; a bare "placeholder" is.

### 2.5 Failing closed through the existing architecture, with no new refusal code

The two failures map onto codes that already exist and are already members of
`CONTRACT_INCOMPLETENESS_CODES`:

| §210J failure | Existing code |
|---|---|
| absent or blank | `REQUIRED_FIELD_MISSING` |
| whole-field filler | `NON_SEMANTIC_PLACEHOLDER_VALUE` |

`preserveIdentifiedSafetyFacts` therefore treats a §210J-incomplete declaration exactly as it treats
the §204 SF-05 shape: the identified property is preserved as a `STRUCTURALLY_INVALID_DECLARATION`
that is not admissible, not settleable and cannot close the analysis; `safetyStateComplete` goes
false; nothing is repaired and nothing is invented. **Reusing the codes rather than adding members is
what lets §205 stay untouched.**

`NEW_REFUSAL_CODES_INTRODUCED` is empty, and the suite asserts it against the closed base vocabulary.

One thing §205 cannot know is the **name** of the field that is missing — its `absentRequiredFields`
is computed over the eleven legacy fields. `preserve210j` adds that name beside the §205 record
rather than editing §205 to know about a successor field.

### 2.6 Explicitly not implemented

**No divergence check against `decisionIfB`.** Instructed by the product owner, and correct on the
evidence: a fail-closed action under uncertainty legitimately resembles the adverse-branch action.
Fixture 3 is word-for-word identical between the two and is admitted without a refusal.

---

## 3. GAP 2 — THE ESTABLISHED BRANCH AT SETTLEMENT

### 3.1 Additive, because the alternative breaks a pin

A new `OWED_FACT_STATUSES` member would need a transition authority that does not exist in
`TRANSITION_AUTHORITIES`, and would break `WHY_UNRESOLVED_STATUS_INVARIANT`, which is a
`satisfies Readonly<Record<OwedFactStatus, …>>` and stops compiling the moment the enum grows. The
enum stays at four members. The branch travels on a **successor record beside the ledger**, and the
ledger transition is performed by the existing pinned `settleByReviewedEvidence`.

### 3.2 The provider still cannot settle anything

`mintBranchedSettlement` calls the pinned `mintSettlementAuthority` **first** and refuses whenever it
refuses, carrying its codes through verbatim. A `SettlementAuthority` carries a module-private brand
symbol nothing outside `settlement-review.ts` can construct, so a branch cannot be recorded without
one the human path actually produced. Three independent guards were exercised:

- a non-human `reviewerProvenance` mints nothing, and the pinned refusal `REVIEW_PROVENANCE_NOT_HUMAN`
  is carried through;
- a provider response carrying `establishedBranch` is refused **by name**, so an attempt is visible
  rather than merely ineffective;
- a provider arbitration request asserting `settles: true` is refused by
  `CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE`.

### 3.3 Legacy records are explicit and never reconstructed

A settlement recorded before this successor has no stored branch and is represented as
`UNKNOWN_LEGACY` — a value a check can reject, not an absence a reader may fill in. Nothing reads a
justification, a rationale or any prose to recover an A or a B.

`LEGACY_RECORD_CARRIES_A_BRANCH` exists precisely so a retrospectively inferred branch is **refused**
rather than accepted. That is the guard against the semantic reconstruction the authorization
forbids, and it is exercised.

### 3.4 The lawful state table

| Record | Status | Branch | Verdict |
|---|---|---|---|
| Successor | `SETTLED_BY_EVIDENCE` | A or B | lawful |
| Successor | `SETTLED_BY_EVIDENCE` | null | `SUCCESSOR_RECORD_WITHOUT_A_BRANCH` |
| Successor | `SETTLED_BY_EVIDENCE` | `UNKNOWN_LEGACY` | `UNKNOWN_LEGACY_ON_A_SUCCESSOR_RECORD` |
| Any | `UNRESOLVED` | non-null | `BRANCH_ON_AN_UNRESOLVED_FACT` |
| Legacy | `SETTLED_BY_EVIDENCE` | `UNKNOWN_LEGACY` | lawful |
| Legacy | `SETTLED_BY_EVIDENCE` | A or B | `LEGACY_RECORD_CARRIES_A_BRANCH` |

The §210I discrimination that was impossible is now a value comparison: two settled records carry the
**same** status and **different** branches.

---

## 4. VERIFIER-FACING CONTRACT

The view distinguishes all seven required things without semantic inference. Every slot is filled
from exactly one source, by copy.

| # | Slot | Source |
|---|---|---|
| 1 | exact owed safety property | `declaration.missingFact` — §210B-1 sidecar, byte-exact |
| 2 | branch A truth condition | pinned `projectOwedFact`, unchanged |
| 3 | branch B truth condition | pinned `projectOwedFact`, unchanged |
| 4 | action if A | pinned `decisionDivergence.ifA`, unchanged |
| 5 | action if B | pinned `decisionDivergence.ifB`, unchanged |
| 6 | action while unresolved | `declaration.decisionWhileUnresolved` — §210J sidecar, byte-exact |
| 7 | evidence/clarification needed | the bound clarification, plus `acceptableEvidence` |

The carriage for slot 6 is the §210B-1 O4-equivalent sidecar: the pinned projection is called
unchanged and **accompanied by**, never rewritten with, the added string. A fact with no §210J
declaration behind it carries **null**, never a stand-in.

No verifier call was made. This is preparation, not verifier validation.

---

## 5. FIXTURES — ALL TEN

`test-210j-epistemic-schema-remediation.ts` — **98 / 98 PASS, 0 FAIL.** Provider calls 0, database
operations 0.

| # | Fixture | Result |
|---|---|---|
| 1 | unresolved + hold, neither branch asserted | PASS |
| 2 | unresolved + continue under existing control | PASS |
| 3 | unresolved action word-for-word equals `decisionIfB` | PASS — admitted, no false divergence failure |
| 4 | settle to A | PASS |
| 5 | settle to B | PASS |
| 6 | legacy settlement, replayable without inventing a branch | PASS |
| 7 | provider cannot settle (three separate guards) | PASS |
| 8 | malformed new field fails closed, RR-7 preserves | PASS |
| 9 | exact unresolved action survives projection | PASS |
| 10 | two facts, separate actions, separate outcomes | PASS |

Fixture 2 is worth naming separately: the unresolved action there is *"decanting continues under the
goggles, gloves, covered bench and in-date eyewash already in use; no additional restriction is
required while this remains open"*. An unresolved action is not required to be a stop, and the
fixture set proves the contract does not make it one.

---

## 6. REGRESSION — EXACT TOTALS

Every suite run after the slice. Zero provider calls throughout.

| Suite | Result |
|---|---|
| `test-196-structured-first-pass-owed-facts` | **92 / 92** PASS |
| `test-201-owed-property-representation` | **59 / 59** PASS, §187 pin INTACT |
| `test-201-governed-binding-stage` | **58 / 59** — one failure, see below |
| `test-201-verifier-vnext-candidates` | **216** passed, 0 failed |
| `test-201-harness-hardening` | **67 / 67** PASS |
| `test-203-boundary-guards` | **52** passed, 0 failed |
| `test-203-grammar-identity` | **45** passed, 0 failed |
| `test-203-identity-collision` | **63** passed, 0 failed |
| `test-203-schema-closure-redteam` | **107** passed, 0 failed |
| `test-205-remediation` | **92** passed, 0 failed |
| `test-205-acceptance-design` | **35** passed, 0 failed |
| `test-207-preregistration` | **144** passed, 0 failed |
| `test-209-batch-recorder` | **116** passed, 0 failed |
| `test-210b1-structural-remediation` | **55** passed, 0 failed |
| `test-210b2-semantic-remediation` | **36** passed, 0 failed |
| `test-210c-residual-remediation` | **92** passed, 0 failed |
| `test-210e-final-remediation` | **103** passed, 0 failed |
| `test-210g-alignment-remediation` | **87** passed, 0 failed |
| `test-210i-epistemic-representation` | **58 / 58** PASS |
| `test-210j-epistemic-schema-remediation` | **98 / 98** PASS |

Scoped typecheck: `tsc --noEmit -p tsconfig.scripts-210j.json` clean. Report it as
`EXPERIMENT_SCOPE_TYPECHECK (§210J)`, never as `tsc clean` — the repository-wide `scripts/**` scope
carries pre-existing diagnostics in unrelated legacy files.

### The one failure, and why it is not a §210J conflict

`test-201-governed-binding-stage` **A4: "§201 changes nothing in the projection module"**. The check
pins `expert-first-pass-owed-fact-projection.ts` to the §199 frozen hash, and §210E's R7 half
advanced that file.

**This is the §203 staleness §210I reported, surfacing in a second place. It predates §210J and is
not caused by it**, and that is demonstrable rather than assumed:

- the file hashed `bc47df39…` when §210I recorded it, before §210J began, and hashes `bc47df39…`
  now;
- §210J edits no existing file, and A3 in the same suite — "§201 imports the vNext module and
  changes nothing in it" — **passes**, confirming the successor was built rather than the base
  edited.

It is reported, not repaired. Repairing it means re-pinning a §199-frozen expectation, which §210J is
not authorized to do.

**Historical frozen execution evidence is unchanged.** Nothing under `verification/` was written
except this directory.

---

## 7. §203 ANCESTRY — REPAIRED ADDITIVELY

`ANCESTOR_PINS` in `expert-203-successor-identity.ts` records the projection module at
`aab67e0b…`. The file is now `bc47df39…`.

**The old record is not edited.** `aab67e0b…` is the true hash of what §203 pinned, and it is also
what the §204 successor source manifest and both checkpoint-consolidation manifests carry. Rewriting
it would make the record claim §203 pinned something it did not, and would silently disagree with
three recorded artefacts that cannot be rewritten with it.

The successor record states:

| Field | Value |
|---|---|
| Historical pin | `aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c` |
| Current hash | `bc47df39ea9d507b404f0b0ebe283c003e3220f097c6b3ea2139739989f0f11e` |
| Classification | `ADVANCED_BY_A_LATER_AUTHORIZED_SECTION` |
| Modifying section | §210E, R7 deterministic half |
| Reason | added `NON_SEMANTIC_PLACEHOLDER_VALUE`, the `NON_SEMANTIC_FILLER` closed set, `isNonSemanticFiller` and the `SEMANTIC_BRANCH_FIELDS` check |

**It verifies rather than asserts.** The hash is computed from the real file at call time, and the
attribution is accepted only when four expected marks are present in the file itself. Where they are
not, the record says `UNVERIFIED_DIVERGENCE` and explains what is missing rather than attributing
the change. The §210E report's own wording is quoted and checked against the report on disk.

**No new frozen expectation was introduced.** Hard-coding today's hash would make a second later edit
invisible in exactly the way the §203 record's staleness was.

---

## 8. TOKEN AND COMPATIBILITY REPORT

**Estimate, not a tokenizer result, and not a production cost claim.** Basis is the repository's own
`OBSERVED_BYTES_PER_TOKEN = 69968 / 24512 = 2.8544`, from the frozen §208 first-pass leg.

### Added first-pass tokens

| | Measured | Estimated tokens |
|---|---:|---:|
| Instruction block | +1,461 chars | **+512** |
| Wire schema, capability absent | +527 bytes | **+185** |
| Wire schema, capability present | +527 bytes | +185 |
| **Request total** | | **+697** |

Both prompt variants moved by identical byte counts, so the capability split cannot drift. No prose
was removed and no earlier sentence rewritten.

### Request-token impact

+697 input tokens, **≈2.57%** of §210H's median input of 27,167.

### Output-token impact

Measured on the four §210J design fixtures, **not on model output**: mean 148 bytes per declaration
including JSON key overhead, ≈**+52 output tokens per emitted declaration**, ≈2.23% of §210H's
median output of 2,329.

### Verifier-payload impact

One added string per fact, byte-identical to the declaration's own. Nothing is duplicated inside the
pinned `ProjectedOwedFact`; the sidecar carries the string once.

### Compatibility adapter

**None was built, and that is a decision rather than an omission.** An adapter could only do one of
two things: synthesize the missing field for a legacy declaration, which is invention and is
forbidden; or admit a legacy declaration without it, which defeats the requirement that a valid
unresolved fact cannot omit it. The correct handling is the one implemented — legacy declarations
fail closed and RR-7 preserves the identified property.

### Do historical raw outputs still project and replay?

Measured on the real §210H hosted output, read-only.

| Case | Base path admitted | §210J path admitted | Property preserved | Invented |
|---|---:|---:|---:|---:|
| G1 | 1 / 1 | 0 / 1 | 1 | 0 |
| G2 | 1 / 1 | 0 / 1 | 1 | 0 |
| G3 | 1 / 1 | 0 / 1 | 1 | 0 |

- **Through the unchanged base path: yes, identically.** The frozen projection is untouched, so every
  historical output projects exactly as it did. Historical evidence remains fully replayable.
- **Through the §210J successor contract: they fail closed, by design.** All three are legacy-format,
  all three are refused for `REQUIRED_FIELD_MISSING`, all three have their identified property
  preserved by RR-7, `safetyStateComplete` is false on every row, and **nothing was invented on any
  of them**.

### Are new declarations distinguishable from legacy ones?

Yes, two independent ways: the wire grammar identity moved (`33b028f9…` → `6e672aac…`), so no
historical freeze silently accepts a new-format request; and `declarationFormat` reads key presence
directly, never a guess.

### Migration requirement

One, stated plainly. **A first pass run under the pre-§210J instruction cannot satisfy the §210J
contract.** Any harness that replays historical declarations through the successor projection will
see them fail closed rather than admit. That is the intended behaviour of a required field, and it is
the price of the guarantee the authorization asked for. Harnesses that need historical replay should
continue to call the unchanged base projection, which is exactly what they do today.

---

## 9. §201 BOUNDARY

The exact-safety-property representational question remains owned by §201 and its status is
unchanged: `OWED_PROPERTY_RECOMMENDATION = 'NOT_MADE'`, withheld pending §200 axis Q. §210J does not
touch it, and the suite asserts that no §210J module references the §201 option set.

**Stated explicitly, as the authorization requires: §210J improves the epistemic and action
representation. It does NOT prove the property field itself is semantically correct.** The verifier
now receives the owed property explicitly through the §210B-1 sidecar, but whether the model selected
the right property remains exactly as open as it was before this slice.

---

## 10. WHAT THIS SLICE DOES NOT ESTABLISH

- Nothing about model behaviour. No provider was called.
- Nothing about §210H G1. The product owner ruled the previous schema did not cause that behaviour,
  and a schema change is not evidence that it is repaired. A declaration whose property is
  evidence-shaped is still structurally valid.
- Nothing about the verifier, G6 or S6.
- No production economics. Static estimates from four design fixtures are not production cost.

---

## RECOMMENDED NEXT STEP

The product-owner decision the terminal names:

**A.** the §210H G1 residual requires one final behavioural confirmation under the improved
representation; or

**B.** first-pass development is frozen and the remaining behavioural risk is carried into targeted
verifier and integration validation.

§210J deliberately supplies no evidence favouring either, because supplying it would have required
the hosted calls this slice was forbidden to make.

One matter is worth carrying into that decision regardless of which way it goes: **the §203 /
§199 projection-module pin is stale in at least two places** (`expert-203-successor-identity.ts` and
`test-201-governed-binding-stage.ts` A4). §210J documents the transition additively but cannot
re-pin a frozen expectation. That needs its own authorization.
