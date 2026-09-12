# §210I — SAFETY-TRUTH / VERIFICATION-STATE SEPARATION: ARCHITECTURE REVIEW

**Scope executed.** Provider calls 0. Database operations 0. No customer or production activation.
No commit, push, tag or deploy. No prompt edited. No pinned contract mutated. No hosted test run.
No verifier call. S6 remains `NOT_EXERCISED`.

**Terminal reached.**

```
EXPERT_HAZLENZ_EPISTEMIC_REPRESENTATION_GAP_CONFIRMED —
BOUNDED_SCHEMA_REMEDIATION_REQUIRED
```

**With one correction to the authorization's framing, stated before anything else, because it
changes what the terminal means.** The authorization offered two terminals on the assumption that
the representation either caused G1 or is demonstrably sufficient. Neither is true, and reporting
either alone would misreport the finding. The two halves must be read together:

- **The representation CAN express the correct G1 entry, and §210H proves it on its own evidence.**
  G2 met the same shape — a present physical state, an absent check, a fail-closed current action —
  using the same eleven fields, and put the epistemic content in `notEstablishedBecause` ("only that
  its condition is unconfirmed") while both branches stayed on the state. G3 did the same for an
  act-shaped property. **Any claim that the schema forced G1's collapse is falsified by G2, and this
  review does not make it.**
- **There is nonetheless a real representational gap, and it is established by reading the types
  alone.** It does not rest on G1, on any single case, or on any model behaviour. Of the concepts
  the §210I core invariant requires be kept distinct, **two have no first-class carrier anywhere in
  the contract**, and a third is carried only on the declaration and is dropped before the verifier
  sees it.

The gap and the G1 defect are therefore **related but not identical**, and the rest of this report
keeps them apart. Closing the gap is justified on architectural grounds — the core invariant, and
the verifier consequence the authorization names. **Whether closing it also moves R4 is an open
empirical question that a zero-provider slice cannot answer, and no claim is made about it.**

---

## 1. CURRENT REPRESENTATIONAL ROOT CAUSE

### 1.1 The carrier audit

Read out of the actual types, not from prose. Sources are named so every row is checkable.

| Concept | First-pass declaration | OwedFact runtime | Verifier-facing |
|---|---|---|---|
| **A. Exact safety property** | `missingFact` — FIRST_CLASS | **ABSENT** | **SIDECAR ONLY** (§210B-1 O4) |
| **B. Substantive truth branches** | `branchA` / `branchB` / `decisionIfA` / `decisionIfB` — FIRST_CLASS | `branchA` / `branchB` / `decisionDivergence` — FIRST_CLASS | FIRST_CLASS |
| **C. Evidence sufficiency / verification state** | `notEstablishedBecause` — PROSE ONLY; the collection itself — CONSTANT BY CONSTRUCTION | `status` — FIRST_CLASS; `acceptableEvidence` — PRESENT BUT CLOSED TO THE MODEL | PROSE ONLY (`status` is in `PROJECTION_FORBIDDEN_FIELDS`) |
| **D. Operational consequence while unresolved** | **ABSENT** | **ABSENT** | **ABSENT** |
| **E. Which branch was established at settlement** | n/a | `OwedFactTransition.justification` — PROSE ONLY | **ABSENT** |

The audit is executable: `conceptsWithNoFirstClassCarrier()` returns exactly **D** and **E**.

### 1.2 The primary gap — D

`decisionIfA` and `decisionIfB` are both conditioned on a branch **being true**. The schema
description says so in as many words: *"What is done TODAY if branchA holds."* Nothing in the
contract carries what is done **while neither holds**.

This is the third member of the authorization's own core invariant, and it is the one member of the
critical three-state example the current contract cannot represent. Checked explicitly:

| Three-state example element | Representable today? |
|---|---|
| SAFETY PROPERTY: the fixing has sufficient holding capacity | Yes — on the declaration only |
| ACTUAL WORLD: it may in fact have sufficient capacity | Yes — `branchA` |
| VERIFICATION STATE: evidence insufficient | Yes — `status: UNRESOLVED` plus `whyUnresolved` |
| Must NOT assert the adverse property | Yes — `UNRESOLVED` asserts neither branch |
| **OPERATIONAL CONSEQUENCE: hold the work now** | **No. No carrier exists.** |

### 1.3 The mechanism, recorded as consistent-with-the-evidence and not as proven cause

The absence has a direction. An entry whose correct current action is a hold must reach that hold
through one of the two truth-conditioned slots, because they are the only slots that carry an action
at all. GATE 12 forbids routing the unresolved world into `branchB`. It does not supply anywhere
else to route it.

G1's own text shows both moves being made at once:

> `branchB`: "The first tie in each pattern was not tested, or was tested and did not achieve the
> required resistance, so the restraint the ties provide is **unconfirmed or inadequate**"

A literal union of an epistemic state and a safety state in one field.

> `decisionIfA`: "**Once this is confirmed** (by any means, e.g. locating the sheet…), no further
> tie-related action is needed…"

A decision conditioned on confirmation rather than on truth.

A second observation from the same output, which bears on allocation rather than capability: **the
correct property was reached and lodged elsewhere.** G1's `render_depth_substrate_uncertainty`
candidate reasons that "a tie fixing could be seated mostly in render rather than blockwork,
reducing effective holding power", and the cross-hazard insight repeats it. The property was
available to the model. What entered `unresolvedFactDeclarations` was the evidence-shaped entry.

**G2 shows the same pressure resolved correctly.** The pressure is therefore not sufficient to
produce the defect, and this section claims no more than consistency.

### 1.4 The secondary gap — E, surfaced by the authorization's own fixture list

Fixtures 1, 2 and 6 all require distinguishing *settled, and the satisfactory branch was
established* from *settled, and the adverse branch was established*. `OWED_FACT_STATUSES` cannot.
`SETTLED_BY_EVIDENCE` records that admissible evidence arrived and an authority was minted. It does
not record which branch the evidence established; that outcome survives only inside
`OwedFactTransition.justification`, as prose.

**At the type level, a settled-satisfactory fact and a settled-adverse fact are the same value.**
That is fixture 6 stated as a defect rather than as a test, and it is demonstrated in the suite
(`settledBranchDiscrimination()`), not asserted.

---

## 2. EXACT FIELDS AND TYPES INVOLVED

| Artefact | Path | Role |
|---|---|---|
| First-pass declaration schema | `backend/scripts/lib/expert-first-pass-instruction-vnext.ts` → `unresolvedFactDeclarationItemSchema` | 11 required fields, 12th (`governedEvidenceSourceIds`) conditional on capability |
| Declaration instruction prose | same file, `DECLARATION_BLOCK_HEAD` | per-field guidance the model reads |
| Declaration → OwedFact projection | `backend/scripts/lib/expert-first-pass-owed-fact-projection.ts` | copies, refuses, never repairs; drops `missingFact` |
| OwedFact runtime type | `backend/src/…/owed-facts/owed-fact.types.ts` | `status`, `whyUnresolved`, branches, `decisionDivergence`, `acceptableEvidence` |
| Ledger and transitions | `backend/src/…/owed-facts/owed-fact-ledger.ts` | `OwedFactTransition` carries authority and justification |
| Settlement review | `backend/src/…/owed-facts/settlement-review.ts` | `SettlementAuthority`, minted only from `HUMAN_REVIEW` |
| Verifier projection | `backend/src/…/owed-facts/verifier-v3-development-boundary.ts` | `ProjectedOwedFact`; `status` forbidden |
| Owed-property sidecar | `backend/scripts/lib/section-210b-verifier-payload.ts` | §210B-1 O4, byte-exact `missingFact` |
| Prior options analysis | `backend/scripts/lib/expert-201-owed-property-representation.ts` | O1–O5, recommendation `NOT_MADE` |

Field-by-field, against the authorization's list:

- `missingFact` — the property. Model-authored, required, **not projected to `OwedFact`**.
- `branchA` / `branchB` — the two substantive truth states. Intact at every layer.
- `decisionIfA` / `decisionIfB` → `decisionDivergence` — truth-conditioned actions. Intact.
- `evidenceSpan` — verbatim observation span. Not an epistemic carrier; it is provenance.
- `acceptableEvidence` — the structurally correct home for *what evidence is required*. Already
  projected to the verifier, already null-valid. **Closed to the model**: it is in
  `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS`, and `MODEL_SELF_AUTHORED` is in
  `PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES`. On a capability-absent first pass it is null every
  time.
- `notEstablishedBecause` → `whyUnresolved` — why the fact is not established. Prose, backward-
  looking, strictly bound to `status === UNRESOLVED`, and §196 forbids composing anything into it.
- `clarification` — the bound BLOCKING question is, in practice, a second carrier for *what evidence
  is required*, in customer-facing form.
- verification state — `OwedFact.status`, and nowhere else.
- `OwedFact` — carries what HazLenz decides; carries no property and no unresolved action.
- verifier payload — `ProjectedOwedFact` plus the §210B-1 sidecar.

---

## 3. CAN AN EXISTING FIELD SAFELY CARRY VERIFICATION STATE?

**Yes for the state itself, and it already does.** `OwedFact.status` is the verification state, and
it is a stronger guarantee than a new field would be: it moves only through a recorded transition
carrying a named authority from `TRANSITION_AUTHORITIES`, and there is deliberately no member for a
model explanation.

**No new first-pass `verificationState` enum should be added, and this review refuses one.** At the
first pass the value would be a **constant**: `unresolvedFactDeclarations` is defined as one entry
per unresolved fact, so every entry would carry the same member. That is a duplicate field restating
existing semantics, which the authorization forbids. It would additionally be a settlement-adjacent
claim authored by a model, against `PROVIDER_SETTLEMENT_AUTHORITY = 'NEVER'`.

**No existing field can carry the two gaps.** Checked one by one:

| Candidate | Verdict |
|---|---|
| `status` | Cannot carry gap D (it is a state, not an action) and cannot carry gap E without a new enum member — which would need a transition authority that does not exist and would break `WHY_UNRESOLVED_STATUS_INVARIANT`, a `satisfies Readonly<Record<OwedFactStatus, …>>` that stops compiling on a new member |
| `whyUnresolved` / `notEstablishedBecause` | Backward-looking by definition; §196 forbids composition; null on every settled fact by strict invariant |
| `acceptableEvidence` | Correct home for the evidence requirement, but closed to the model by two separate recorded decisions. Opening it is a **product-owner decision**, not an engineering one, and this review does not take it |
| `whyNecessaryNow` | Answers why the fact must be settled now, not what is done meanwhile. Overloading it is the semantic overloading the authorization forbids |
| `branchA` / `branchB` | Must not carry it. This **is** the defect |
| `decisionIfA` / `decisionIfB` | Must not carry it. Truth-conditioned by construction |

---

## 4. IS A NEW FIELD OR TYPE REQUIRED?

**Yes, for two concepts. No, for the other three.**

Required: gap **D** (operational consequence while unresolved) and gap **E** (which branch was
established at settlement).

Not required and explicitly refused: a first-pass verification-state enum, a third truth branch, any
widening of `branchB`, and any new status member.

**Not decided here: concept A.** Getting `missingFact` onto `OwedFact` is §201's question. It has
five options already prototyped, an explicit `OWED_PROPERTY_RECOMMENDATION` of `NOT_MADE`, and a
recorded reason for withholding — §200 axis Q is unadjudicated. §210B-1 then adopted O4 as a
verifier-facing sidecar on its own path. Folding that decision into §210I would settle a question
another slice deliberately left open. It is flagged, not answered.

---

## 5. SMALLEST RECOMMENDED SCHEMA CHANGE

**Two fields, at two layers. Field names below are placeholders; the authorization does not
authorize names and none is claimed.**

### C1 — one required string on the first-pass declaration

*What must happen NOW, given that neither branch is established.*

- **Required, not optional.** Every entry in the collection is unresolved, so there is no entry for
  which the field is vacuous — and an optional field would be omitted exactly on the entries under
  pressure.
- **Not a third branch.** It makes no truth claim. It is not `decisionIfC`; it answers a different
  question.
- **Edits no pinned file.** `unresolvedFactDeclarationItemSchema` is a development-side builder and
  is not among the §187 pins.
- **Deterministic code may check**: presence, non-blankness, and membership of the *existing* closed
  `NON_SEMANTIC_FILLER` set. Nothing else.
- **No divergence rule against `decisionIfB`.** A fail-closed current action legitimately *resembles*
  the adverse-branch action — both hold the work, in G1's frozen truth and in G3's alike. Demanding
  a difference would demand an invention, which is precisely what §210E R7 exists to refuse. What
  distinguishes them is the **condition**, which is semantic and model-authored.

### C2 — an additive successor carrying the established branch at settlement

`establishedBranch: 'A' | 'B' | null`, non-null exactly when the fact reached a settled status.

- **Edits no pinned file.** `owed-fact.types.ts` is sha256-pinned by §187 and re-asserted by the
  `verify-188..199` source-integrity scripts, so the **O5 additive-successor discipline** applies:
  a separate module widens the type.
- **Authored by the human reviewer** who already mints the `SettlementAuthority`. No provider gains
  settlement authority, and no deterministic code decides which branch the evidence established.
- **Deterministic code may check**: closed-set membership, and the pairing rule (a branch on an
  unresolved fact is refused; a settled fact with no branch is refused).

### What was deliberately not built

No semantic matcher. Deciding whether a phrase names a state or its evidence requires reading it as
safety semantics. §210G recorded that refusal for R4B and this slice does not reverse it. The suite
asserts this file contains no keyword rule over safety prose.

---

## 6. FIRST-PASS IMPACT

One added required property on the declaration item schema, one added paragraph in the declaration
block, and one added string per emitted declaration. The four existing branch and decision fields,
their divergence checks, the span rules, the governed-binding capability omission and the
clarification back-reference are all unchanged.

The instruction chain (§210B-2 → §210C → §210E → §210G) is **not edited**. A field addition changes
the wire schema and would change `grammarIdentity`; it does not require touching any appended gate
block, and GATE 12 in particular is preserved byte for byte.

---

## 7. OwedFact IMPACT

**None to the pinned type.** C1 adds a declaration field that the existing projection would carry
into an additive successor rather than into `OwedFact`; C2 is an additive successor on the
settlement side. `OWED_FACT_STATUSES` is unchanged at four members, and
`WHY_UNRESOLVED_STATUS_INVARIANT` still covers exactly those four — asserted in the suite.

`NON_PROJECTING_DECLARATION_FIELDS` would gain one entry, or the new field would join the projected
set on the successor. That choice belongs to the implementation slice.

---

## 8. VERIFIER IMPACT

Under the proposal the verifier receives, **separately and explicitly**, each of the five things the
authorization names: the exact owed property, its two substantive truth conditions, whether the
truth is currently established, what evidence remains necessary, and the clarification capable of
settling it — plus the action that holds meanwhile. Every one arrives by copy;
`buildVerifierView` composes nothing and returns null for an absent property rather than a stand-in.

**One caveat, stated rather than smoothed over.** The *exact owed property* reaching the verifier
still depends on concept A, which §210I does not decide. Today it arrives only through the §210B-1
sidecar and only on the §210B path. A verifier handed a bare `ProjectedOwedFact` still cannot see
the property. **The authorization's verifier requirement is not fully met until §201's question is
answered.**

No verifier call was made. Nothing here is verifier validation.

---

## 9. COMPATIBILITY IMPLICATIONS

- **Additive at every point.** Nothing is renamed, narrowed or removed.
- **No pinned file changes.** All six §187/§192 pins verified byte-identical before and after this
  slice (§13 below).
- **Wire schema identity changes.** A new declaration property changes the canonical schema hash and
  therefore `grammarIdentity`. Runs before and after are not grammar-comparable, and any economics
  comparison across the boundary must say so.
- **A required field is a hard break for any replay harness** that constructs declarations from
  historical JSON. Those harnesses read recorded output, which will not carry the field. The
  implementation slice must decide whether the successor treats it as absent-and-recorded or refuses
  — this review does not decide it.

---

## 10. MIGRATION IMPLICATIONS

- **First pass:** none beyond the schema and instruction edit. No stored data.
- **OwedFact:** none. The pinned type is not touched, so no existing `OwedFact` literal — including
  the §184 human-truth fixtures and the settled control rows — stops compiling. This is the O2
  cost §201 identified, and the O5 discipline avoids it.
- **Historical evidence:** unchanged and still on disk. See §13.
- **Production:** none. Nothing in the customer path reaches the Expert layer, and the verifier-v3
  stage stays gated behind a compile-time literal `false`.

---

## 11. TOKEN IMPACT

**Estimate, not a tokenizer result.** Basis is the repository's own
`OBSERVED_BYTES_PER_TOKEN = 69968 / 24512 = 2.854`, derived from the frozen §208 first-pass leg.

| | Estimated |
|---|---:|
| Instruction paragraph + schema description | ~1,310 bytes |
| Added input tokens per call | **~459** |
| As a fraction of §210H median input (27,167) | ~1.7% |
| Added output tokens per emitted declaration | **~39** |
| As a fraction of §210H median output (2,329) | ~1.7% |

At §210H's observed cost of roughly USD 0.079 per observation, the input-side addition is on the
order of USD 0.0014 per call. No production economics claim is made; three development cases do not
establish production token economics.

---

## 12. IS HISTORICAL EVIDENCE STILL REPLAYABLE?

**Yes, and one stale record was found and is reported rather than repaired.**

All six §187/§192 pinned sources verified byte-identical to their recorded hashes, before and after
this slice:

```
102d059b…  owed-fact.types.ts                      INTACT
4fe33190…  owed-fact-ledger.ts                     INTACT
e25f1fa8…  owed-fact-binding.ts                    INTACT
5273d5af…  verifier-v3-development-boundary.ts     INTACT
bfe564c2…  expert-prompt.ts                        INTACT
475a9577…  expert-verifier-contract-v3.ts          INTACT
```

**Finding — a stale ancestry record.** `ANCESTOR_PINS` in
`backend/scripts/lib/expert-203-successor-identity.ts` records
`expert-first-pass-owed-fact-projection.ts` at `aab67e0b…`. The working file is `bc47df39…`. The
divergence is **explained and legitimate**: §210E's R7 deterministic half added the
`NON_SEMANTIC_PLACEHOLDER_VALUE` refusal to that file, which is an accepted slice. But no §210x
record supersedes the §203 entry, and `aab67e0b…` is also what
`verification/expert-hazlenz-checkpoint-consolidation-2026-09-07/POST-CONSOLIDATION-MANIFEST.sha256`
carries.

This is a **structural bookkeeping matter, not a semantic defect**, and it is recorded here rather
than fixed, because updating a frozen ancestry record is not authorized by §210I. It is separately
notable that the file is **untracked in git**, so there is no commit history behind the change.

§210G and §210H evidence is untouched. Nothing in `verification/` was written except this directory.

---

## 13. LOCAL FIXTURE RESULTS

`backend/scripts/test-210i-epistemic-representation.ts` — **58 / 58 PASS, 0 FAIL.** Provider calls 0,
database operations 0.

All eight required shapes are expressible under the proposed representation:

| Fixture | Structural checks | Result |
|---|---:|---|
| F1 safe state + sufficient evidence | 10 | PASS |
| F2 adverse state + sufficient evidence | 10 | PASS |
| F3 potentially satisfactory + insufficient evidence | 11 | PASS |
| F4 test result as evidence | 11 | PASS |
| F5 required act as property | 11 | PASS |
| F6 evidence contradicts assumed state | 10 | PASS |
| F7 multiple independent properties | 20 | PASS |
| F8 verifier-facing projection | 11 | PASS |

Decisive results within that set:

- **F3** represents insufficient evidence **without** asserting the adverse property. The hold is
  carried by a field that makes no truth claim; `establishedBranch` is null; `branchB` is not
  asserted. This is the critical three-state example, expressible end to end.
- **F1 against F2** carry the **same** `status` today and differ only under the proposal — the
  secondary gap, demonstrated.
- **F5** keeps an act-shaped property with act-shaped branches. Nothing in the proposal pushes an
  act property toward a physical state, so the G3/E4 distinction is preserved.
- **F7** carries two properties with independent verification states, one settled and one
  unresolved, with no cross-binding.
- The truth × verification matrix backs three legal cells with fixtures and **leaves the two
  contradictory cells empty rather than inventing them** — a truth known while the evidence is
  insufficient is not a state this architecture has.

Boundary assertions that also passed: a blank property yields null and is never composed from a
sibling field; the added field is refused when absent, blank or filler and is never repaired; a
branch recorded on an unresolved fact is refused; a settled fact with no branch is refused; no
regex over safety vocabulary exists in the module; no prompt module is imported.

**What the fixtures do not establish**, asserted in the suite itself: nothing about model behaviour,
nothing about whether the change would move R4, nothing about G1's cause, and — stated explicitly —
**the proposed representation does not detect the G1 defect and is not built to.** A declaration
whose property is evidence-shaped would remain structurally valid under it, exactly as it is today.

---

## 14. PROTECTED REGRESSION RESULTS

Run after the slice, zero provider calls throughout.

| Suite | Result |
|---|---|
| `test-210g-alignment-remediation` | 87 passed, 0 failed |
| `test-210c-residual-remediation` | 92 passed, 0 failed |
| `test-201-owed-property-representation` | 59 / 59 PASS, §187 pin INTACT |
| `test-196-structured-first-pass-owed-facts` | 92 / 92 PASS |
| `test-203-boundary-guards` | 52 passed, 0 failed |

R5, R6 and R7 remain closed on §210F/§210H evidence and were not touched. GATE 12 is preserved
unchanged and reclassified as **USEFUL BUT INSUFFICIENT FOR LATENT-STATE / EVIDENCE-SEPARATION
CASES**. **No Gate 13 was added**, because the review did not prove that no representational change
is needed, which is the authorization's precondition for adding one.

---

## FILES ADDED BY THIS SLICE

Two, both new, both untracked, neither wired to any path:

```
backend/scripts/lib/expert-210i-epistemic-representation.ts   design prototype
backend/scripts/test-210i-epistemic-representation.ts         proof suite
```

## RECOMMENDED NEXT STEP

A **separately authorized implementation slice** for C1 and C2. It should not be combined with a
hosted probe: whether C1 moves R4 is a behavioural question, and answering it means preregistering
the expectation before the field exists, not after seeing whether the field helped.

**§201's concept-A question should be settled first or in parallel**, because the verifier
consequence this review was asked to improve is not fully delivered without it.
