# §211 — FIRST-PASS DEVELOPMENT FREEZE AND TARGETED VERIFIER VALIDATION DESIGN

**Scope executed.** Provider calls 0. Database operations 0. No customer or production activation.
No commit, push, tag or deploy. No hosted verifier call. No first-pass probe. §210H not rerun. G1
not rerun. No pinned file edited. No repin applied.

**Terminal reached.**

```
EXPERT_HAZLENZ_VERIFIER_ARCHITECTURE_REMEDIATION_REQUIRED —
HOSTED_VALIDATION_NOT_YET_AUTHORIZED
```

The freeze is documented as instructed, and the instrument is designed, built and frozen. The second
terminal is the one reached because the verifier inspection found a **material architecture defect**,
and the authorization makes that condition decisive.

---

## 1. FIRST-PASS STATUS, RECORDED

```
DEVELOPMENT_FROZEN_WITH_KNOWN_VERIFIER-CARRIED_RISK
```

Not `ACCEPTED`. Not `PRODUCTION_READY`. Not `G1_FIXED`. Expert HazLenz overall remains
**NOT ACCEPTED FOR PRODUCTION**. Each of those is a typed constant the suite asserts, so a later
edit that wants to soften the status has to change a value rather than a sentence.

**Frozen baseline:** `hazlenz.expert.first-pass-instruction.210g-R4B` plus the additive §210J
declaration-contract successor carrying `decisionWhileUnresolved`.

**KR-1 is carried open.** `isFixed: false`, `isMitigatedByTheSchemaChange: false`. The record states
why the §210J change does not mitigate it: §210J added carriers for the consequence under
uncertainty and for the established settlement branch, and neither reads the property. A declaration
whose property is evidence-shaped is still structurally valid.

KR-1 must be tested with **new cases**, never by replaying G1 as a behavioural score. G1 is the case
the mechanism was named from; scoring the verifier on it would measure the instrument against the
example that defined it.

---

## 2. WHAT THE INSPECTION FOUND

The verifier as built cannot answer the question §211 wants it to answer, and the reason is three
layers deep rather than one missing field. Any one layer would block V1 and V2. All three hold.

### 2.1 Payload — the exact property is not in the request

`V3SuppliedOwedFact` is the only per-fact object the verifier prompt renders. It has seven members
and `missingFact` is not among them. Read from the interface, not asserted.

| Required by §211 | Today |
|---|---|
| exact proposed safety property | **ABSENT** |
| branchA, branchB, decisionIfA, decisionIfB | present |
| `decisionWhileUnresolved` | **ABSENT** |
| evidence gap / `notEstablishedBecause` | present, as `whyUnresolved` |
| acceptable evidence | **ABSENT** |
| bound clarification | **PRESENT BUT UNBOUND** |
| declaration identifier | **ABSENT** |
| target fact identifier | present, as `factKey` |

Four absent outright, one unbound, six present. **Five of eleven do not reach the verifier in usable
form.** Without the property, the verifier would have to reconstruct it from the two branches, which
is the semantic reconstruction the authorization forbids.

The bound-clarification row is worth naming separately. The full flat clarification list is rendered
with id, question and affected decision, and the model-authored
`answersUnresolvedFactDeclarationId` is **not** rendered. Nothing tells the verifier which question
belongs to the fact it is judging. That is the channel §210A measured as the adjacent-drift carrier.

### 2.2 Remit — the verifier is not asked about the property

All four verdicts are clarification-selection verdicts, and the v3 instruction says so in its own
words, quoted from the assembled prompt:

> A nominated fact changes ONE thing and one thing only -- which clarification is asked.

V1 through V4 are outside the contract's stated job.

### 2.3 Vocabulary — a property-collapse finding has nowhere to land

The three owed-fact declarations are `BOUND_BY_CLARIFICATION`, `STILL_UNRESOLVED` and
`CHALLENGE_FACT_VALIDITY`. The challenge has exactly two grounds: the observation already settles
the fact, or both answers lead to the same action. **"The property you named is the evidence for the
property" is neither.**

### 2.4 The finding that is easiest to walk straight past

§201's `C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE` is the highest-ranked candidate in the registry and a
genuine improvement to challenge reviewability. It also makes `challengeGround` a **closed two-member
enum**, verified against the candidate's own schema patch.

Adopting C6a as designed would make a property-identity challenge **structurally unrepresentable
rather than merely unnamed**, moving V2 and V4 backwards. The remediation is **C6a plus a third
ground**, not C6a.

### 2.5 The useful half — three remediations are already built and not wired

| Module | Provides | On the request path? |
|---|---|---|
| §210B-1 payload | `explicitOwedProperty` — the byte-exact property sidecar | no |
| §210B-1 payload | `isolateClarifications` / `isolateCandidates` | no |
| §210J projection | `buildVerifier210jView` — **seven of the eleven slots, already assembled** | no |

Verified against the real assembly module: `assembleVerifierRequests` imports neither. So the payload
half of the remediation is a **wiring task over modules that already pass**, not new design.

---

## 3. CAPABILITY READINESS — V1 TO V10

| | Capability | Readiness | §201 candidates |
|---|---|---|---|
| V1 | exact property identity | blocked: payload, remit | C1a (reviewability aid, checks nothing) |
| V2 | state versus evidence | blocked: payload, remit, vocabulary | **none** |
| V3 | act-as-property narrowing | blocked: remit | **none** |
| V4 | branch alignment | blocked: payload, remit | **none** |
| V5 | unresolved-state containment | blocked: remit | C5a (report only) |
| V6 | clarification sufficiency | partial | C2a, C2b |
| V7 | `decisionWhileUnresolved` | blocked: payload | none needed |
| V8 | adjacent-fact drift | blocked: payload; partial | C1b |
| V9 | multi-fact isolation | blocked: payload | **none** |
| V10 | challenge reviewability | partial | C6a |

**No capability is exercisable today.** Four of the ten have no candidate in the registry at all,
and V2, V3 and V4 are among them.

---

## 4. THE REQUIRED REMEDIATION — SPECIFIED, NOT BUILT

Three parts. None implemented here: §211 authorizes inspection and design, and a protocol change is
its own authorization. No protocol version is claimed — §201's rule stands that a version number is
earned by a preregistered run, not by a good idea.

**R-A PAYLOAD.** Render the eleven required fields and apply the §210B-1 isolation to the ancillary
blocks. Blocks V1, V4, V7, V8, V9. Mostly wiring: `buildVerifier210jView` already assembles seven
slots and `explicitOwedProperty` carries the property byte-exact. Still to build: the wiring itself,
`declarationId` carriage, and C2b's provenance gate — `DEVELOPMENT_HUMAN_TRUTH` and
`ADJUDICATION_LABEL` must never be rendered to the model, and that gate must fail closed.

**R-B VOCABULARY.** Adopt C6a **and add a third challenge ground for property identity**, with the
evidence that ground requires. Blocks V2, V4, V10. Without it a property-collapse finding has
nowhere to land.

**R-C REMIT.** The verifier instruction must ask the property question, and must carry the
act-as-property narrowing as a mandatory counter-control **in the same block**. Blocks V1, V2, V3,
V4, V5. Nothing exists for this; the registry has no candidate for the remit. Adding V2 without V3
is the §210G overcorrection risk arriving at a new layer.

None touches a pinned file.

---

## 5. THE FROZEN INSTRUMENT

**Ten new cases, eleven verifier calls.** Preregistration frozen before any provider call.

```
identity  3d325fd38f55eafbc46d03841bb362cefbee9c90533e19aa28460796f26cf4a7
```

| Case | Mechanism | Declaration | Required outcome |
|---|---|---|---|
| T1 | latent state, highly salient required test | evidence-proxy property | challenge: property is its own evidence |
| T2 | latent state, missing document | evidence-proxy property | challenge: property is its own evidence |
| T3 | process completed, hazardous state may remain | process substituted for state | challenge: already-established process |
| T4 | **required act IS the property** | correct, act-shaped | **accept unchanged** |
| T5 | adjacent-property trap | correct | accept unchanged |
| T6 | two independent unresolved facts | correct, two facts | accept unchanged, 2 calls |
| T7 | clarification gathers evidence, cannot settle | correct property, weak question | accept property, replace question |
| T8 | **fully correct declaration** | correct | **accept unchanged** |
| T9 | unresolved action presumes branch A | correct property, incoherent action | accept property, flag the action |
| T10 | adverse branch absorbs "unproven" | correct property, absorbed branch | accept property, flag the branch |

Ten industries, none shared with §210H. Asserted mechanically: no §210H setting or mechanism noun
appears anywhere in the instrument, so it is not a noun-substituted rewrite.

**The control and the counter-control.** T8 is a fully correct declaration and is the only thing that
catches a verifier that challenges everything. T4 is act-as-property, where perfect sight of the
workplace would not settle the decision, and rejecting it is HF-2. T1 and T4 are the decisive pair:
T1 alone is passed by a system that strips process language everywhere, T4 alone by one that never
challenges anything.

Every supplied declaration carries all twelve §210J fields with real content, every
`observationSpan` is verbatim in its own observation by exact string search, no branches are
identical and no decisions converge. Each case names what the observation **establishes**, so a
false gap is scoreable.

### Hard-failure classes

Reported as **per-class occurrence counts at zero occurrence**, never as an aggregate percentage.

| | Class | Cases |
|---|---|---|
| HF-1 | evidence proxy accepted as the property | T1, T2, T3 |
| HF-2 | legitimate act-as-property rejected | T4, T8 |
| HF-3 | bound to the wrong adjacent or sibling fact | T5, T6 |
| HF-4 | insufficient evidence became adverse truth | T1, T9, T10 |
| HF-5 | insufficient clarification approved | T7 |
| HF-6 | `decisionWhileUnresolved` lost | T9 |
| HF-7 | provider settlement-authority breach | every call, as a standing gate |

---

## 6. COST PROJECTION

Rates are **derived from the recorded ledger, not looked up.** §210A's baseline records the §208B
authoritative verifier leg at 24 calls, 217,911 input and 17,625 output tokens, USD 0.612072.
Solving gives USD 2.00 per million input and USD 10.00 per million output, and those same rates
reproduce the first-pass leg's recorded USD 1.69709 exactly. That reproduction is the check that
they are right.

| | Value |
|---|---:|
| Verifier calls | 11 |
| Projected input tokens per call | 9,936 |
| Projected output tokens per call | 852 |
| Projected total | USD 0.3123 |
| **Recommended ceiling** | **USD 0.43** |
| Retries authorized | 0 |

The projection **adds** the remediated payload and instruction rather than quoting the baseline:
about +830 input tokens per call for the eleven-field payload, the R-C instruction block and the
R-B schema, and about +120 output for the property restatement and the challenge ground. All
estimates. No production cost claim is made.

### Execution preconditions

The instrument is **not executable against today's verifier**, and this is the reason the second
terminal was reached. A clean result from a verifier that was never asked the question would mean
nothing. Before one call: R-A, R-B and R-C must exist; the preregistration must be frozen by sha256;
a single-row transport canary must run first, the §199 pattern that worked and cost one call; and
the product owner must authorize execution naming the ceiling.

---

## 7. PM-1 — STALE PROJECTION-MODULE PINS

**Status: `AWAITING_PRODUCT_OWNER_REVIEW`. No repin applied. No historical evidence altered.**

Four sites record the §199-frozen hash of `expert-first-pass-owed-fact-projection.ts`. Three are
asserted gates and all three currently fail.

| | Site | Kind | Observed |
|---|---|---|---|
| PM-1.1 | `expert-203-successor-identity.ts` ANCESTOR_PINS | asserted | `verify-203-source-integrity` FAIL |
| PM-1.2 | `test-201-governed-binding-stage.ts` A4 | asserted | 58/59 |
| PM-1.3 | `test-202-governed-binding-stage.ts` B18 | asserted | 53/54 |
| PM-1.4 | `verify-196/197/198/199` report lines | recorded only | not a failure |

```
original expected  aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c
current            bc47df39ea9d507b404f0b0ebe283c003e3220f097c6b3ea2139739989f0f11e
advanced by        §210E, the R7 deterministic half
```

The attribution is **not accepted because a report says so**. It is accepted only because four marks
the modifying section would have left are present in the file itself, checked at call time:
`NON_SEMANTIC_PLACEHOLDER_VALUE`, `isNonSemanticFiller`, `SEMANTIC_BRANCH_FIELDS`, `§210E R7`. Where
marks are missing the entry would be `UNVERIFIED_NO_REPIN_PROPOSED` and no replacement would be
offered — an unexplained divergence must stay unexplained rather than acquire a plausible story.

The semantic modification is already documented in four artefacts, all verified present on disk,
including the §210E remediation report and the §210J additive ancestry successor.

**A stale historical pin is not a current HazLenz behavioural failure.** The three failing assertions
must not be reported as regressions. §210J's additive ancestry record documents the transition; it
cannot make an asserted gate pass, which is why PM-1.1 still fails.

**PM-1.4 is not a fourth failure.** Those four scripts assert a byte-level property of the file — no
`transition(` call — which still holds, and merely print the hash into a report. They do exit
non-zero, for an unrelated pre-existing audit-sweep finding on
`backend/scripts/execute-208-acceptance-cohort.ts`. Attributing that to PM-1 would be the misreading
this item exists to prevent.

**An alternative is recorded, not taken.** PM-1.2 and PM-1.3 could instead be narrowed to what they
actually mean — "§201 / §202 changed nothing" — by comparing against a baseline captured at suite
start rather than a literal. That is a product-owner choice.

---

## 8. REGRESSION — EXACT TOTALS

| Suite | Result |
|---|---|
| `test-196-structured-first-pass-owed-facts` | **92 / 92** |
| `test-201-owed-property-representation` | **59 / 59** |
| `test-201-governed-binding-stage` | **58 / 59** — PM-1.2 |
| `test-201-verifier-vnext-candidates` | **216** passed, 0 failed |
| `test-201-harness-hardening` | **67 / 67** |
| `test-202-governed-binding-stage` | **53 / 54** — PM-1.3 |
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

Both failures are PM-1 and neither is caused by §211, which created only new files. Scoped
typecheck `tsc --noEmit -p tsconfig.scripts-211.json` clean; report it as
`EXPERIMENT_SCOPE_TYPECHECK (§211)`, never as `tsc clean`.

Four §187/§192 pins verified byte-identical inside the suite. Historical frozen execution evidence
unchanged; nothing under `verification/` was written except this directory.

---

## 9. WHAT THIS SLICE DOES NOT ESTABLISH

- Nothing about verifier behaviour. No provider was called and the instrument has not run.
- Nothing about §210H G1. It is carried open as KR-1 and is not fixed.
- No claim that the remediation would make the verifier detect KR-1. That is what the instrument
  exists to measure, and measuring it needs the remediation first.
- No production economics. The projection is an estimate from a development ledger.
- No protocol version for the remediation.

---

## FILES ADDED

```
backend/scripts/lib/expert-211-first-pass-freeze.ts
backend/scripts/lib/expert-211-verifier-inspection.ts
backend/scripts/lib/expert-211-validation-instrument.ts
backend/scripts/lib/expert-211-repin-proposal.ts
backend/scripts/test-211-verifier-validation-design.ts
backend/scripts/emit-211-preregistration.ts
backend/tsconfig.scripts-211.json
```

## THE TWO DECISIONS THIS REPORT PUTS TO THE PRODUCT OWNER

1. **Authorize the bounded verifier remediation R-A, R-B and R-C**, as a separate slice, before any
   hosted verifier validation. The instrument is frozen and waiting; it is not executable until the
   verifier can see the property, is asked about it, and has somewhere to put the answer.
2. **Decide PM-1**: repin the three asserted gates to the current hash with §210E recorded as the
   advancing section, or narrow those two suite assertions to what they actually mean.
