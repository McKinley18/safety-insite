# §212 — TARGETED VERIFIER ARCHITECTURE REMEDIATION AND PM-1 ASSERTION REPAIR

**Scope executed.** Provider calls 0. Database operations 0. No customer or production activation.
No commit, push, tag or deploy. The frozen §211 instrument was not executed. No transport smoke was
run and none is requested. No pinned file edited. No frozen evidence altered.

**Terminal reached.**

```
EXPERT_HAZLENZ_VERIFIER_ARCHITECTURE_REMEDIATED —
FROZEN_TARGETED_VERIFIER_VALIDATION_EXECUTION_AUTHORIZATION_REQUIRED
```

All thirteen readiness items answer YES, each from the architecture rather than by assertion.

**Stated first: KR-1 remains OPEN.** §212 makes the finding *expressible*. It does not make it
*detected*. No behavioural mitigation is claimed, and the suite asserts that no §212 module claims
one.

---

## 1. R-A — PAYLOAD

**Wiring, not a second representation.** `buildVerifier210jView` is called, not reimplemented; ten
of the eleven required fields come straight out of it, and exactly one field is genuinely new.
`PAYLOAD_FIELD_PROVENANCE` names the single source of every field as data.

| Field | Source |
|---|---|
| `declarationId` | **new in §212** — copied from the declaration |
| owed property | §210J view, via the §210B-1 sidecar, byte-exact |
| branchA, branchB, decisionIfA, decisionIfB | the pinned projection, unchanged |
| `decisionWhileUnresolved` | §210J sidecar, byte-exact |
| `notEstablishedBecause` | the pinned `whyUnresolved`, unchanged |
| acceptableEvidence | the pinned projection, unchanged |
| bound clarification | the model-authored back-reference, resolved |
| target fact key | the computed fact identity |

**Fail closed on the one field with no fallback.** A request whose property is absent is refused,
not completed. Deterministic code may not compose one from the branches, from
`notEstablishedBecause`, from `affectedDecision`, from the span or from any prose, and those five
routes are recorded as refused rather than merely unused.

**One real gap was found while building this.** §210B-1's `explicitOwedProperty` returns null only
for a non-string or a zero-length string, so a whitespace-only property survives it, while §201's
`attachOwedProperty` trims and refuses. The two disagreed. §212 applies the stricter test **at its
own boundary** rather than editing a module whose suite is passing: wiring existing assembly does
not mean inheriting the loosest check in the chain.

**Ancillary context is off by default.** §212's instruction is narrower than §210B-1's own default,
so `ANCILLARY_CONTEXT_DEFAULT` is `EXCLUDED`. A caller that opts in gets §210B-1's explicit-link
rules unchanged, including its deliberate timidity, and that path is exercised: a sibling-bound
clarification is excluded, a target-bound one retained.

The rendered block is additive by construction. Stripping it reproduces the base user prompt byte
for byte.

---

## 2. R-B — REMIT

The successor prompt is v3.2 plus one block at a verified-unique anchor. **Removing the block
reproduces the v3.2 prompt byte for byte**, so §192's, §199's and §208B's evidence stays attached to
the versions that produced it.

**The verdict set is unchanged.** §212 preferred keeping the three verdicts if they remained useful,
and they do: the widened remit changes what a challenge can be *about*, not what the verifier may
*do*. Adding a verdict would have been the larger change and would have broken every consumer.

The block asks the prior question in terms — *is this the right thing to be unresolved about?* — and
forbids reconstructing the property from the branches.

**The anti-overcorrection control is in the same block, deliberately.** A block that teaches a model
to distrust process language will make it reject the cases where performing an act *is* the owed
property. §210G learned that expensively and carried its narrowing inside the gate that created the
risk. This does the same: the act-as-property paragraph is the next paragraph, the test offered is
the perfect-knowledge counterfactual, and the instruction says to decide on **the role the thing
plays in the decision, never on the words used**. No deterministic keyword classifier exists
anywhere in §212.

Both `decisionWhileUnresolved` must-nots are stated to the model: resemblance to `decisionIfB` is
correct where holding is the safe course and is not a defect, and holding is never evidence about
which branch is true.

| | Value |
|---|---:|
| Prompt added | +3,903 chars |
| Prose removed | 0 |

**No protocol version is claimed.** There is no v3.4 here. §201's rule stands and §211 restated it:
a version number is earned by a preregistered run.

---

## 3. R-C — CHALLENGE VOCABULARY

Five added members across three fields, and three candidates refused.

```
challengeGround        THE_OBSERVATION_ALREADY_ESTABLISHES_IT      (inherited)
                       BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION        (inherited)
                       PROPERTY_IDENTITY_MISMATCH                  (added)

propertyMismatchKind   EVIDENCE_PROXY_FOR_UNDERLYING_STATE         (added)
                       ADJACENT_PROPERTY_SUBSTITUTED               (added)

representationConcern  NONE
                       BRANCHES_DO_NOT_PARTITION_THE_PROPERTY      (added)
                       UNRESOLVED_ACTION_PRESUMES_A_BRANCH         (added)
```

**The discipline that prevents a taxonomy explosion** is that every added member must map to a named
§211 capability *and* a named hard-failure class, recorded as data and asserted by the suite. Three
members were refused on exactly that test, including `CLARIFICATION_CANNOT_SETTLE_THE_PROPERTY` —
which is not a challenge to the fact at all, and adding it would have let a verifier invalidate a
correct fact over a weak question.

**Two kinds of finding, two fields, and that separation is load-bearing.** A challenge says the fact
should not stand. A representation concern says the fact is right and a field is not. §211's frozen
truth requires both: T1 must be challenged, while T9 and T10 must have their property **accepted**
and one field flagged. Collapsing them would force the verifier to challenge a fact it has just
agreed with.

**No replacement-property field was added.** The verifier is not turned into a second unrestricted
first pass; a challenge names the defect and the repair is a first-pass or human act.

A challenge still settles nothing, and the existing `CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT` admission
code still refuses one that claims otherwise.

### Schema cost, reported as four figures rather than one

| | v3.2 | §212 | Δ |
|---|---:|---:|---:|
| Bytes | 4,994 | 6,094 | +1,100 |
| Nodes | | | +3 |
| Enums | | | +3 |
| Enum members | | | +10 |

The provider's stated metric is compiled grammar complexity and the threshold is undocumented, so
byte size alone establishes nothing. Removing the three properties reproduces the v3.2 schema
exactly.

---

## 4. THE §201 C6a CONFLICT

**Decision: adopt C6a's structure with a third ground.** §201 is not rewritten, not rescored and not
corrected — C6a is still `PROTOTYPED` in the live registry and the suite checks that.

What changed is the premise, not the candidate. §201 scored C6a against a verifier whose job was
choosing which clarification to ask, and under that remit two grounds are a complete vocabulary.
R-B widened the remit, and under the wider remit closing the enum at two would make a
property-identity challenge **structurally impossible** rather than merely unnamed — strictly worse
than today's open free-text field.

No inherited member was renamed or removed, so a C6a-shaped verdict remains valid under the
successor vocabulary. C6a's two evidence fields are named as deliberately not adopted here, with
reasons: both are good and both are outside the bounded §212 gap.

---

## 5. THE FROZEN §211 INSTRUMENT

**Unchanged, and now executable through a deterministic adapter.**

One adaptation is needed and it is mechanical. A §211 declaration carries the eleven semantic fields
and no `observationSourceId`, because §211 described a declaration rather than a wire payload. The
adapter supplies exactly that, using the `OBS-<caseId>` convention §210H already used, and touches
nothing else.

| | Result |
|---|---|
| Cases adapting with no refusal | **10 of 10** |
| Provider calls under the adapter | **11** — identical to §211's frozen count |
| Frozen evaluation questions carried | all |
| Semantic fields byte-identical | all eleven, on every declaration |

The adapter is read-only with respect to §211: it modifies no frozen expectation, drops and reorders
no case, and invents no semantic field.

---

## 6. LOCAL ARCHITECTURE FIXTURES

All ten required fixtures pass, inside a suite of **99 / 99**.

| | Fixture | Result |
|---|---|---|
| 1 | correct physical-state property builds a supportable request | PASS |
| 2 | property-identity challenge representable for an evidence proxy | PASS |
| 3 | act-as-property carried unaltered, not flagged for process language | PASS |
| 4 | branch-alignment defect representable **without** challenging the fact | PASS |
| 5 | a weak clarification reaches the payload beside the property | PASS |
| 6 | two-fact row yields two isolated requests, no contamination | PASS |
| 7 | `decisionWhileUnresolved` survives assembly byte-exact | PASS |
| 8 | challenge carries the exact declaration id and fact key | PASS |
| 9 | verifier output cannot settle a fact | PASS |
| 10 | a missing property fails closed at request construction | PASS |

---

## 7. PM-1 — CLASSIFIED, THEN HANDLED ON THAT BASIS

Each site was classified by **what it actually meant**, following the product-owner preference for
narrowing over mechanical repinning.

| Site | Class | Action |
|---|---|---|
| §203 ancestry pin | CLASS 1 ancestry | **successor-pinned and left historical-only** |
| governed-binding A4 | CLASS 2 boundary invariant | **narrowed** |
| governed-binding B18 | CLASS 2 boundary invariant | **narrowed** (projection sub-clause only) |
| verify-196/197/198/199 report lines | report-only | **left unchanged, no correction needed** |

### CLASS 1 — the ancestry pin

A whole-file hash is the right instrument for exact ancestry, so it is kept. The historical
assertion and its hash are untouched, and `verify-203-source-integrity` continues to report the
divergence — which is **correct**: it is a historical gate and the file has legitimately moved since.

A successor pin now records prior hash, modifying section, current hash, reason and evidence, and a
new gate `verify-212-projection-ancestry` asserts the current state and passes. Together the two
gates say the whole thing.

§210J declined to write this pin on its own authority, saying a later edit must surface as a new
divergence rather than be absorbed. §212 is the authorization it was waiting for, and that is
recorded.

```
prior     aab67e0b…   §203, historical, PRESERVED
advanced  §210E — the R7 deterministic half
current   bc47df39…   §212 successor pin, holding
```

### CLASS 2 — the narrowed assertions

Neither A4 nor B18 was ever about ancestry. Both meant *my slice changed nothing in the first-pass
protocol*, and a whole-file hash was a blunt instrument for that — blunt in both directions, since it
fails when a different authorized section advances the file and would equally have passed a file
edited and reverted.

Six behavioural invariants replace it, each read out of the real module at call time:

| | Invariant | What it means |
|---|---|---|
| N1 | no §201 or §202 marker in the module | those slices did not edit it — the direct form of the claim |
| N2 | the identity shape is byte-identical | which ids and keys are admissible has not moved |
| N3 | no `transition(` call | the projection still cannot settle a fact |
| N4 | no retired semantic matcher | the §160-retired content-overlap gate has not reappeared |
| N5 | provider-owned fields still refused | 31 forbidden fields, refusal code intact |
| N6 | identity computed, never accepted | no wire route by which a provider could name a fact |

§210E is deliberately **not** in the foreign-marker list: it is the section that legitimately did
advance the file.

The §199-frozen hash is retained inside both narrowed assertions as a documented historical
reference. **Nothing was erased.** No current hash is used as proof that the current code is
correct, and the stale pin is not called a HazLenz behavioural failure anywhere.

### The report-only site

Those four scripts print the projection hash under *protocol identities for this run*. They assert a
byte-level property instead — no `transition(` call — which still holds, and nothing there labels the
hash as drift. No additive correction was needed.

---

## 8. REGRESSION

| Suite | Result |
|---|---|
| `test-196-structured-first-pass-owed-facts` | **92 / 92** |
| `test-201-owed-property-representation` | **59 / 59** |
| `test-201-governed-binding-stage` | **59 / 59** — was 58/59, **A4 repaired** |
| `test-201-verifier-vnext-candidates` | **216** passed, 0 failed |
| `test-201-harness-hardening` | **67 / 67** |
| `test-202-governed-binding-stage` | **54 / 54** — was 53/54, **B18 repaired** |
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
| `test-210i-epistemic-representation` | **58 / 58** |
| `test-210j-epistemic-schema-remediation` | **98 / 98** |
| `test-211-verifier-validation-design` | **74 / 74** |
| `test-212-verifier-architecture-remediation` | **99 / 99** |
| `verify-212-projection-ancestry` | **PASS** |

**Total: 0 failures across every suite.** No provider call occurred anywhere.

**Newly repaired PM-1 conditions:** A4 and B18, both by narrowing.

**Expected historical-only assertion:** `verify-203-source-integrity` continues to exit non-zero on
the projection-hash line. That is the CLASS 1 disposition working as designed, not a regression, and
it must not be reported as a behavioural failure.

Scoped typecheck `tsc --noEmit -p tsconfig.scripts-212.json` clean; report it as
`EXPERIMENT_SCOPE_TYPECHECK (§212)`, never as `tsc clean`.

---

## 9. HOSTED VALIDATION READINESS GATE

| | Item | |
|---|---|---|
| 1 | exact safety property reaches the verifier | **YES** |
| 2 | exact target identity reaches the verifier | **YES** |
| 3 | branch semantics reach the verifier | **YES** |
| 4 | decision semantics reach the verifier | **YES** |
| 5 | `decisionWhileUnresolved` reaches the verifier | **YES** |
| 6 | verification gap and evidence semantics reach the verifier | **YES** |
| 7 | bound clarification reaches the verifier | **YES** |
| 8 | challenge vocabulary represents property-identity mismatch | **YES** |
| 9 | verifier remit explicitly includes fact semantic validity | **YES** |
| 10 | verifier remains unable to settle a customer-authoritative fact | **YES** |
| 11 | KR-1 is behaviourally testable | **YES** |
| 12 | act-as-property anti-overcorrection is behaviourally testable | **YES** |
| 13 | frozen §211 instrument remains truth-preserving and executable | **YES** |

Every item is answered from the architecture: item 1 by byte comparison against the frozen T1
declaration, item 9 against the assembled prompt rather than a constant, item 13 by adapting all ten
frozen cases and checking the call count matches.

---

## 10. NO TRANSPORT SMOKE IS REQUESTED

Request shape changed, and §212 was told not to run a smoke merely because of that. Local
serialization and request-shape tests were used instead and all pass: the schema is a structural
clone of one the provider has already accepted, reversible to it exactly, and the added constructs
are three nullable-or-enum properties on an existing array item.

The one genuine uncertainty is **compiled grammar complexity**, which cannot be established locally
because the provider's threshold is undocumented. It is not being escalated now: the verifier schema
is a different and much smaller request than the first pass that was refused at §199, it grows from
4,994 to 6,094 bytes, and the §199 pattern that worked was a single-row canary as the first call of
an authorized run. **The right place for that canary is the first call of the §211 execution, not a
separate authorization now.**

---

## 11. WHAT THIS SLICE DOES NOT ESTABLISH

- Nothing about verifier behaviour. No provider was called.
- **KR-1 remains OPEN.** The architecture can now carry the finding and express it. Whether the
  verifier makes it is what the frozen §211 instrument exists to measure.
- No protocol version, and no claim that the successor schema will compile within the provider's
  grammar limit.
- No production readiness. Expert HazLenz remains **NOT ACCEPTED FOR PRODUCTION**, and first-pass
  status remains `DEVELOPMENT_FROZEN_WITH_KNOWN_VERIFIER-CARRIED_RISK`.

---

## FILES

Added:

```
backend/scripts/lib/expert-212-challenge-vocabulary.ts
backend/scripts/lib/expert-212-verifier-protocol.ts
backend/scripts/lib/expert-212-verifier-payload.ts
backend/scripts/lib/expert-212-c6a-successor-decision.ts
backend/scripts/lib/expert-212-pm1-assertion-repair.ts
backend/scripts/lib/expert-212-instrument-adapter.ts
backend/scripts/test-212-verifier-architecture-remediation.ts
backend/scripts/verify-212-projection-ancestry.ts
backend/scripts/emit-212-record.ts
backend/tsconfig.scripts-212.json
```

Modified, both PM-1 CLASS 2 narrowings, nothing erased:

```
backend/scripts/test-201-governed-binding-stage.ts    A4
backend/scripts/test-202-governed-binding-stage.ts    B18
```

## THE DECISION THIS PUTS TO THE PRODUCT OWNER

Authorize execution of the frozen §211 instrument against the remediated architecture: 11 verifier
calls, projected USD 0.31 against the §211 ceiling of USD 0.43, with a single-row transport canary
as the first call.
