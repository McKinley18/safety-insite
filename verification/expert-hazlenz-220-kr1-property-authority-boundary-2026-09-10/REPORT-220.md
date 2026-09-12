# §220 — KR-1 HUMAN PROPERTY-AUTHORITY BOUNDARY, AND INTEGRATED-GATE READINESS

**Provider calls 0 · Database operations 0 · No customer activation · No commit · No push ·
No tag · No deploy.**

Every figure below is computed by `scripts/build-220-record.ts` from the live modules, or printed by
`scripts/test-220-kr1-property-authority.ts` and `scripts/replay-219-under-220-authority.ts`.
Record digest `9bd2762ae2299050…`.

---

## THE ARCHITECTURAL QUESTION, ANSWERED

> Can Safety InSite contain the demonstrated KR-1 provider weakness at the authoritative product
> workflow layer, without another AI semantic verifier, without deterministic semantic inference,
> without globally human-gating all safety analysis, and without weakening fail-closed behaviour?

**YES**, and the reason it is possible is that the boundary does not have to sit where the mistake
is.

| | |
|---|---|
| another AI semantic verifier | **not added** |
| deterministic semantic inference | **not used** — no keyword list, no vocabulary test, no text read for meaning |
| all safety analysis human-gated | **no** — zero analyses are gated; the prerequisite sits at one transition |
| fail-closed behaviour weakened | **no** — one refusal code added, none removed or relaxed |

---

## 1. WHY THE BOUNDARY CANNOT BE POINTED AT THE MISTAKE, PROVED FROM THE EVIDENCE

§219 A1 was the mistake. §219 A3 was the right answer. Their structured signatures are byte
identical:

```json
{"role":"REQUIRED_ACT_ITSELF","validity":"VALID","verdict":"VERIFIED_AS_IS",
 "declaration":"STILL_UNRESOLVED","challengeGround":null,"propertyMismatchKind":null,
 "representationConcern":"NONE","nominatedFactPresent":false,"clarificationSourceMode":null}
```

The replay asserts this equality from the persisted evidence rather than claiming it (`L1`). No
deterministic rule reading verifier output can separate them, and §220 does not pretend it can.
Every candidate trigger the authorization named was evaluated and the reason each was rejected is
held in code as `TRIGGER_SOURCES_EVALUATED_220`:

| signal | used | why not |
|---|---|---|
| `propertySemanticRole` | no | A1 and A3 both returned `REQUIRED_ACT_ITSELF` |
| `propertyValidity` | no | both returned `VALID` |
| challenge / concern structures | no | A1 emitted none; they mark the cases already handled |
| ABSTAIN and deterministic refusal | no | already fail-closed; A2 is the worked example |
| the property text | no | **forbidden** — the keyword classifier refused since §160 |
| `OwedFact.modelAuthored` | **yes** | provenance, not semantics |
| the transition being attempted | **yes** | settlement is the only place the mistake causes harm |

---

## 2. WHAT WAS BUILT

**One new module and one additive edit.** Nothing else in `owed-facts/` was touched, asserted
mechanically by `S41`.

### 2.1 `property-authority.ts` — the boundary

The rule is one line and reads one field:

```ts
export function propertyAuthorityRequirementFor(fact: OwedFact): PropertyAuthorityRequirement {
  return fact.modelAuthored ? 'REQUIRED' : 'NOT_REQUIRED';
}
```

`modelAuthored` is already derived from `source` by rule and already invariant-checked in
`owedFactDefects`. A property identity that came from a deterministic rule, a governed record or a
human is `NOT_REQUIRED`. One that rests on provider analysis alone is `REQUIRED`. This is exactly the
authorization's condition — *"and that distinction has not already been established by authoritative
supplied context"* — expressed as provenance.

Five states, and only two of them permit a settlement:

| state | may settle |
|---|---|
| `NOT_REQUIRED` | yes |
| `CONFIRMED` | yes |
| `REQUIRED_NOT_OBTAINED` | no |
| `CORRECTED` | **no** |
| `DECLINED_KEEP_UNRESOLVED` | no |

`CORRECTED` is deliberately absent from the permitting set. A reviewer who corrects the property has
said the fact in front of them is not the proposition that decides, so settling *that* fact would
settle the wrong property — the outcome the boundary exists to prevent.

The authority carries a module-private `unique symbol` brand, so it cannot be object-literalled by a
caller who skipped the review: a forged authority is an impossible value at runtime, not merely a
type error.

### 2.2 `settlement-review.ts` — the additive edit

`SettlementClaim` gains two provenance-derived fields, so a claim is born `REQUIRED_NOT_OBTAINED`
wherever the requirement applies. `attachPropertyAuthority` and `recordPropertyAuthorityDeclined`
are added. `settleByReviewedEvidence` gains one refusal code, `PROPERTY_AUTHORITY_NOT_OBTAINED`.

Fail-closed by construction: the consumer sets the state, not the caller, so a call site that forgets
to check does not fail open.

### 2.3 Which transitions are gated, and which are not

| to | authority | gated | why |
|---|---|---|---|
| `COVERED` | `ADMITTED_BINDING` | **no** | binding a clarification asks the question; the hold stands and nothing is released |
| `SETTLED_BY_EVIDENCE` | `ADMISSIBLE_EVIDENCE` | **yes** | this is where a wrong property retires a right question |
| `REJECTED_BY_ARBITRATION` | `RECORDED_ARBITRATION` | n/a | **no runtime producer exists anywhere in this codebase**, recorded rather than gated speculatively |

### 2.4 The human review

Three actions, one fixed question, and the packet copies existing state verbatim:

```
CONFIRM PROPERTY      CORRECT PROPERTY      KEEP UNRESOLVED
```

The reviewer sees the observation span, the proposed property, the HazLenz explanation, both
branches and both decisions, what is done while unresolved, the existing clarification, and the §218
advisory `decisionControllingProperty` where one exists. Nothing is reconstructed and the reviewer is
not asked to rebuild the inspection. Every packet states on its face that confirming the property is
not settling the fact.

---

## 3. THE §219 REPLAY — 32 ASSERTIONS, 0 FAILURES, 0 PROVIDER CALLS

The persisted §219 outputs are read from disk exactly as recorded. The owed facts are rebuilt by
calling the same deterministic projection the §219 assembly called, and every rebuilt fact key is
asserted equal to the key persisted in the raw evidence, so the reconstruction is **proved faithful
rather than assumed** (`E3`).

### A1 — the required result

| | |
|---|---|
| §218 route | `PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED` — admitted, nothing structural to catch |
| property authority | `REQUIRED`, not obtained |
| human approved the **evidence** | yes |
| settlement | **REFUSED — `PROPERTY_AUTHORITY_NOT_OBTAINED`** |
| fact status after | `UNRESOLVED`, ledger transitions: 0 |

The braking-capability question stays open. The hold stands. Nothing was deleted, nothing became
adverse, nothing was released. **The weekly loaded brake run does not become authoritative proof that
the truck has adequate braking capability merely because the verifier classified it as the required
act.**

Then the three reviewer outcomes, each run:

| reviewer decision | state | settlement | fact after |
|---|---|---|---|
| none | `REQUIRED_NOT_OBTAINED` | refused | `UNRESOLVED` |
| `KEEP_UNRESOLVED` | `DECLINED_KEEP_UNRESOLVED` | refused | `UNRESOLVED` |
| `CORRECT_PROPERTY` | `CORRECTED` | refused | `UNRESOLVED` |
| `CONFIRM_PROPERTY` | `CONFIRMED` | **applied** | `SETTLED_BY_EVIDENCE` |

**One honest limit, asserted rather than glossed** (`A1.7`). On A1 the verifier's advisory
`decisionControllingProperty` reads *"whether the weekly loaded brake performance run was actually
carried out"* — the proxy restated. The field that exists to help the reviewer catch this mistake
does not help on this case. It is shown as help that may be wrong, never as an answer.

### A2 — a different containment, and the new gate is not substituted for it

§218 refused the whole A2 output with `INVALID_PROPERTY_ROUTED_TO_CLARIFICATION`, route
`FAIL_CLOSED`, `review === null`. A refused output yields no admitted declaration, so nothing reaches
the ledger and no settlement claim can exist. The §220 boundary is never invoked and is not needed.

| | A1 | A2 |
|---|---|---|
| provider semantics | **wrong** | **correct** |
| output structure | consistent | **inconsistent** |
| §218 deterministic layer | admits | **refuses whole** |
| contained at | the **authority** layer (§220) | the **structural** layer (§218) |
| fact after | `UNRESOLVED` | `UNRESOLVED` |

Both are safe, by different mechanisms, and the report does not merge them.

### A3, A4, A5 — the controls are not globally blocked

All three were admitted by every layer with the property intact, roles `REQUIRED_ACT_ITSELF`,
`REQUIRED_ARTIFACT_ITSELF` and `UNDERLYING_SAFETY_STATE` respectively. **No analysis was blocked,
interrupted or routed to a human by §220** (`C.1`). Each settles normally on one recorded human
property confirmation (`C.2`), and each is refused without one exactly as A1 is (`C.3`) — the rule is
uniform by provenance, so nothing is singled out by what its property says.

---

## 4. THE HONEST LIMITATION

The authorization asked for this to be reported rather than engineered around, and it is, in code as
`SCOPING_LIMITATION_220`:

- **The architecture cannot identify which facts are KR-1-risky.** A1 and A3 are indistinguishable
  to it. The requirement therefore applies to every model-authored property at settlement, not to a
  semantically selected subset.
- **What that costs.** One additional recorded human confirmation on the settlement of a
  model-authored fact. Settlement already required a human, so no analysis becomes manual and no
  property is blocked for its vocabulary. On the §219 set: 5 of 5 facts would require the
  confirmation at settlement, and 0 of 5 analyses were gated.
- **What it does not do.** It does not make the reviewer right. It converts an autonomous provider
  property decision into a human-authorized one, and a reviewer who confirms a wrong property has
  exercised real authority to do so.

---

## 5. LOCAL VERIFICATION — 29 SUITES, 2,209 ASSERTIONS

| suite | result | | suite | result |
|---|---|---|---|---|
| §201 governed binding stage | 59 / 59 | | §215 preregistration | 45 / 45 |
| §201 owed-property representation | 59 / 59 | | §216 disposition remediation | 70 / 70 |
| §201 verifier vNext candidates | 216 / 216 | | §217 preregistration | 43 / 43 |
| §201 harness hardening | 67 / 67 | | §218 structured property verifier | 113 / 113 |
| §202 authority boundary guards | 83 / 83 | | §219 preregistration and scorer | 78 / 78 |
| §203 boundary guards | 52 / 52 | | **§220 property-authority boundary** | **43 / 43** |
| §203 grammar identity | 45 / 45 | | **§220 §219 replay** | **32 / 32** |
| §203 identity collision | 63 / 63 | | verifier v3 binding protocol | 49 / 49 |
| §203 schema-closure red team | 107 / 107 | | verifier v3.1 remediation | 69 / 69 |
| §210E final remediation (RR-7) | 103 / 103 | | v3 development integration | 40 / 40 |
| §210I epistemic representation | 58 / 58 | | unsupported settlement | 129 / 129 |
| §210J epistemic schema remediation | 99 / 99 | | clarification settlement | 148 / 148 |
| §211 verifier validation design | 74 / 74 | | authority merge | 51 / 51 |
| §212 verifier architecture remediation | 99 / 99 | | §182 settlement review integration | **47 / 48** |
| §214 verifier semantic remediation | 68 / 68 | | | |

Full-project `tsc --noEmit`: clean. Scoped experiment typecheck: clean.

### Two suites changed, and exactly why

**§210J (99/99).** Its branched-settlement harness settles `factA`, which is `FIRST_PASS_MODEL` and
therefore model-authored. Under the new boundary that settlement is precisely what must not happen
without a human property confirmation, so the harness now walks the same authorized path the product
does. **No assertion was weakened or removed** — C3, C4, C5 and C6 all still run and still pass — and
one assertion was **added**, `C0`, which asserts the prerequisite is genuinely in front of the path
and was exercised rather than bypassed. This is a stale expectation superseded by an authorized
product decision, not a production defect.

**§182 (47/48), pre-existing and NOT caused by §220.** `P20c` pins the sha256 of
`owed-fact.types.ts` and `owed-fact-binding.ts`. `owed-fact-binding.ts` still matches its pin
exactly. `owed-fact.types.ts` does not, and **§220 never edited either file** — the assertion reads
only those two paths, so it cannot have been broken by this work. The drift is the later
`whyUnresolved` nullability change, documented in the types file itself, made after §182 and never
reflected in §182's pin. It is reported here rather than edited to green, because changing a frozen
expectation to match production is the thing this programme does not do.

---

## 6. HISTORICAL EVIDENCE — UNCHANGED

Every `.sha256` in the §213, §215, §217, §218 and §219 evidence directories verifies with
`shasum -c`. Twenty-one artifacts, all OK, including the §219 preregistration
`491bf18a…`, the §219 raw verifier output and the §219 adjudication.

No §213, §215, §217 or §219 result is reclassified, rescored or upgraded.

---

## 7. STATUS

| | |
|---|---|
| FIRST PASS | **DEVELOPMENT FROZEN** |
| VERIFIER | **STANDALONE DEVELOPMENT COMPLETE WITH KNOWN SEMANTIC CAPABILITY LIMIT** |
| KR-1 | **OPEN — HUMAN-GATED V1.0 LIMITATION** |
| EXPERT HAZLENZ | **NOT YET ACCEPTED** |
| NEXT VALIDATION LEVEL | **INTEGRATED SYSTEM** |

Recorded in code as literals: `KR1_PROVIDER_CAPABILITY_REMEDIATED = false`,
`AUTONOMOUS_PROPERTY_IDENTIFICATION_VALIDATED = false`, `PROVIDER_PROPERTY_AUTHORITY = 'NEVER'`.
KR-1 is not fixed, not closed, and not remediated.

---

## 8. PROPOSED INTEGRATED EXPERT PIPELINE VALIDATION — DESIGNED, NOT AUTHORIZED

**10 cases · 12 families · 12 hard gates · 75 human judgments · 22 provider calls · 0 executed.**

On the §218 precedent: the observations are **not authored here**, nothing is frozen by sha256 for
execution, and authoring, freezing and digesting them is the next slice under its own authorization.

| case | families | mechanism | first pass | verifier |
|---|---|---|---|---|
| IG1 | 1 | ordinary recognizable hazard | 1 | 1 |
| IG2 | 2, 12 | two independent gaps, one settles **adverse** | 1 | 2 |
| IG3 | 3 | KR-1 evidence proxy for a latent state | 1 | 1 |
| IG4 | 4, 11 | legitimate required act → **satisfactory** settlement | 1 | 1 |
| IG5 | 5 | legitimate required artifact beside a mere record | 1 | 1 |
| IG6 | 6 | insufficient evidence, fail-closed unresolved | 1 | 1 |
| IG7 | 7 | neighbouring / adjacent property temptation | 1 | 1 |
| IG8 | 8 | governed OSHA/MSHA grounding, plus a gap the registry lacks | 1 | 1 |
| IG9 | 9 | negated, actually-safe condition | 1 | 1 |
| IG10 | 10 | malformed declaration, RR-7 preservation | 1 | **0** |

Two families are combined into cases that exercise them naturally: an adverse settlement needs a
two-gap case to also prove the sibling is not taken with it, and a satisfactory settlement needs a
property that legitimately *can* settle. IG10 makes no verifier call because RR-7 refuses the
declaration before that stage — recorded as a design decision, not an omission.

**IG3 is the instrument.** Whatever the provider does, the underlying condition must not be released:
if the verifier classifies correctly the fact is challenged and stays open; if it repeats the A1
mistake, §220 refuses the settlement and a human must confirm or correct the property first. That is
the first test of the containment claim against a **live** provider mistake rather than a replayed
one.

### Hard gates — customer/system outcomes, zero tolerance

Decision-critical unresolved fact lost · autonomous customer-authoritative settlement by provider ·
provider mistake resulting in unsafe work authorization · wrong property authoritatively settled ·
KR-1 proxy treated as authoritative underlying truth without human property confirmation ·
deterministic code inventing semantic safety meaning · malformed decision-critical state
disappearing instead of failing closed · governed regulatory authority invented or misrepresented ·
unresolved state converted to adverse truth because evidence is absent · human correction ignored by
authoritative state · exact target binding lost in a way that survives containment · safety-critical
sibling fact silently lost.

All twelve are exercised by at least one case, computed rather than claimed. **No headline accuracy
percentage is produced and no gate may be offset by another.**

### System-success principle, frozen before any case is authored

A provider-stage error the architecture contains is not a system failure. §219 A2 is the worked
example of containment; §219 A1 is the worked example of what uncontained would have meant. The gate
scores the **customer-authoritative outcome**.

### Spend, projected from measured figures only

| | |
|---|---|
| first pass | 10 calls × 27,167 in / 2,329 out (§210H measured median) |
| verifier | 10 calls × 14,162 in / 980 out (§219 measured median) |
| contingency | 2 first-pass-sized calls, budgeted before execution rather than drawn on demand |
| **total calls** | **22** |
| **projected spend** | **USD 1.3127** |
| **hard ceiling** | **USD 1.78** (35% headroom, the basis §211, §213, §215, §217 and §219 all used) |

**Which calls resolve genuinely new uncertainty.** The first-pass leg has never been measured end to
end against the owed-fact ledger and the verifier in one run. IG3 and IG7 are the only place the
containment claim meets a live provider mistake. IG4, IG5 and IG8 are the first verifier results
taken downstream of a **real** first pass rather than hand-authored declarations. IG1, IG2 and IG6
are path plumbing and are recorded as such.

### Human judgment budget

75 substantive judgments across 10 cases, 5 to 11 per case, inside the 50–90 target. §207's 177-slot
instrument is explicitly not recreated: a judgment exists only where a human reading the frozen truth
could disagree with the system and that disagreement would change a gate.

---

## 9. REMAINING KNOWN RISKS

1. **A reviewer can confirm a wrong property.** The boundary makes the decision human and recorded;
   it does not make it correct. This is the largest residual and it is the direct consequence of the
   product-owner containment choice.
2. **The §218 advisory field does not help on the case that most needs it.** Demonstrated on A1.
3. **The requirement is broad by provenance.** Every model-authored fact needs one confirmation at
   settlement, because the architecture cannot tell which ones are risky. If the reviewer load
   proves material in the integrated gate, the narrowing must come from a new authoritative
   *provenance* signal, never from reading the property.
4. **`transition()` remains directly callable in-process with `ADMISSIBLE_EVIDENCE`.** Pre-existing,
   recorded as §182 residual R1, unchanged by §220, and unreachable from any provider input.
5. **`REJECTED_BY_ARBITRATION` has no runtime producer.** If one is ever added it must consult
   `mayBeSettledUnderPropertyAuthority`; the requirement is recorded in `TRANSITION_COVERAGE_220`
   rather than left to be rediscovered.
6. **§182 `P20c` is stale.** Pre-existing, unrelated to §220, and left failing rather than edited.
7. **Nothing here is customer-reachable.** No route in `safescope-v2.service.ts` touches the
   producer, asserted by `S39`.

---

**TERMINAL:
`EXPERT_HAZLENZ_KR1_PRODUCT_AUTHORITY_BOUNDARY_IMPLEMENTED —
INTEGRATED_EXPERT_PIPELINE_VALIDATION_AUTHORIZATION_REQUIRED`**

**KR-1 = OPEN — HUMAN-GATED V1.0 LIMITATION**
