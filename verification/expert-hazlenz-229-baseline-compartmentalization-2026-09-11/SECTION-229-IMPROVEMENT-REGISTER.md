# §229 — EXPERT HAZLENZ IMPROVEMENT REGISTER

Everything observed and deliberately not remediated, carried forward from §223 through §228C.
**Nothing here was fixed in §229.** Listing an item is not a decision to act on it.

Classifications: **BEFORE BETA REQUIRED** · **BETA PRIORITY** · **POST-BETA ENHANCEMENT** · **OBSERVE**

---

## 1. C7 weak adverse and immediate-decision language — **BETA PRIORITY**

**Origin:** §228B, case C7. Recurrence of the §227 K5 defect.

For a steam boiler established to be running with no written scheme of examination in force,
`decisionIfB` said continued operation "should be reviewed pending that assessment", and
`decisionWhileUnresolved` arranged a competent person without stopping or restricting operation.
Operating an installed pressure system without a scheme in force is the thing the regulation
prohibits.

**Contained.** The fact remained `UNRESOLVED`, the ledger held zero transitions, no evidence
authority was minted, and the property authority carries `impliesWorkRelease: false`. No
authoritative outcome moved because of it.

**Why it is not BEFORE BETA REQUIRED.** The architecture's answer to a weak counterfactual is a
competent human reading the review packet, and that boundary held. The defect is in prose quality,
not in authority.

**Why it is not merely OBSERVE.** The prose reaches the human reviewer. A reviewer who reads
"continued operation should be reviewed" is being given a weaker steer than the situation warrants.
The §228B slot C7-J10 was scored a **borderline PASS** and the product owner recorded that a
reasonable adjudicator could score it FAIL.

**What would resolve it:** measurement first. Counterfactual quality has never been gated by any
instrument in this programme. The final acceptance cohort should carry an immediate-decision axis so
the frequency is known before anything is changed in the prompt.

## 2. Residual counterfactual and branch quality — **BETA PRIORITY**

**Origin:** §227 K2, K4, K5; §228B RO-A, RO-B, RO-D.

Three recurring shapes, all contained, none uncontained across §228B's ten observed occurrences:

- **unknown folded into a branch.** §228B C4: "confirms, **or fails to rule out**, that the wall
  contains asbestos", and "the conduit **remains unconfirmed** or is found to be live". The branches
  divide known from unknown rather than dividing the property.
- **adverse branch routes to a secondary action.** §228B C3 and C7.
- **branch or decision distorts the controlling property.** §228B C3 declared a control-state
  description whose branches divided management responses.

**Contained in every case**, and C3's distortion was contained by the mechanism built for it: the
human property correction, after which the settlement was refused.

**What would resolve it:** the same measurement axis as item 1. These are one family.

## 3. `assertedConditionState` semantic inconsistency — **OBSERVE**

**Origin:** §227 K7; §228B RO-E on C2, C4, C7 and C8.

Four candidates were asserted `ACTIVE` while their own reasoning said the condition was unresolved.
One was asserted `UNKNOWN` where everything was established.

**Established and unchanged since §228:** the field is **not load-bearing in deterministic authority
logic**. Zero occurrences in declaration projection, the verifier payload, the owed-fact ledger,
owed-fact binding, property authority, settlement review or governed-evidence derivation. It **is**
rendered into the verifier's user prompt as prose.

**Measured in §228B and §228C:** on every case with a verifier call, the nomination tracked the open
property and not the asserted label. §228B C8 was authored specifically to test this and the label
did not move the nomination. **`assertedConditionState` affected verifier behaviour: NO.**

**Why OBSERVE and not higher.** The architecture does not depend on the label being right — that is
its design. The risk is that a future change makes something downstream read it. The register entry
exists so that change is noticed.

## 4. No runtime producer for `REJECTED_BY_ARBITRATION` — **POST-BETA ENHANCEMENT**

**Origin:** read out of `TRANSITION_COVERAGE_220` during §228A authoring.

The owed-fact type system defines `REJECTED_BY_ARBITRATION` with authority `RECORDED_ARBITRATION`,
and the codebase records in `property-authority.ts` that **no runtime producer exists anywhere**. An
adverse settlement, in the sense of a ledger transition to a terminal adverse status, is therefore
not exercisable.

**This is not a defect.** It is an honest architectural absence, recorded in code rather than
assumed, and §228B covered required path 9 through the adverse outcomes that do have producers: a
reviewer declining the property and a reviewer refusing the evidence.

**If a producer is ever written**, `TRANSITION_COVERAGE_220` states its obligation: it must apply
`mayBeSettledUnderPropertyAuthority` before transitioning. That note is the whole reason the constant
exists.

## 5. Silent non-declaration, Class A — **BEFORE BETA REQUIRED**

**Origin:** §223 limitation 1. Not closed by §227.

The first pass can return a well-formed, complete response with an empty declarations array while
naming the concern in prose or in a candidate. Nothing downstream can act on a fact that was never
declared, so **no containment mechanism applies**. §227 measured recall at 7/7 on eight fresh cases
and §228B and §228C added seven more admitted declarations, but recall has never been measured on a
population.

**Why BEFORE BETA REQUIRED.** This is the one failure mode with no architectural containment. The
final fresh acceptance cohort must measure it at population scale, and that is precisely what final
acceptance is for. **Nothing needs remediating first** — it needs measuring.

## 6. Wrong-property selection, Class A — **BEFORE BETA REQUIRED**

**Origin:** §223 limitation 2. Partially answered.

**Newly evidenced in §228B:** the defect occurred live on C3, and **the containment held**. The human
property correction replaced the property, the authority outcome was `CORRECTED`, and the settlement
was refused with `PROPERTY_AUTHORITY_NOT_OBTAINED` even with an approved evidence authority in hand.

**What remains unmeasured:** how often it happens, and whether a human reviewer would notice. §228B's
reviewer was preregistered, not real. The containment is proven; the **rate** is not.

## 7. Verifier accepted a non-controlling property as `VALID` — **BETA PRIORITY**

**Origin:** §228B C3. New in §228B.

The verifier routed a control-state description as `UNDERLYING_SAFETY_STATE` / `VALID`. §218
consistency admitted it with zero codes, because disposition and property did not disagree — they
agreed on the wrong thing.

**Contained.** The verifier is advisory: it cannot admit a fact, cannot settle, cannot mint authority.
The human correction overrode it.

**Why it matters anyway.** The verifier exists to catch exactly this. One case is not a rate, and the
final cohort should carry a verifier-accuracy axis.

## 8. Structured-output reliability, Class B — **BETA PRIORITY**

**Origin:** §223 limitation 3; recurred in §228B C1.

C1 truncated at `max_tokens` with the required declarations field absent, which cost §228B its KR-1
coverage and forced §228C. Across §221, §227, §228B and §228C: three truncations, one 45-token
degenerate response, and required fields returned as JSON strings.

**Contained every time.** Refused fail-closed, named in the end state, nothing settled or authorised.

**The qualification worth carrying:** on C1 the model's own `outcome` field read `ANALYZED` while the
result was structurally unusable. The unusability signal came from the deterministic layer. There is
no production activation, so how a user-facing surface would present that was never exercised.

## 9. Two prompt version namespaces for one leg — **BETA PRIORITY**

**Origin:** §223 source-of-truth map; still open after §229.

`src/.../expert-prompt.ts` declares `EXPERT_PROMPT_VERSION = 'hazlenz.expert.prompt.v15'`. The
contract in force declares `hazlenz.expert.first-pass-contract.226-decision-keyed-semantics`. Nothing
reads the wrong one today. It is the most likely source of a future wrong-prompt incident, and it
cannot be resolved without editing a module.

## 10. Validation code inside the production build — **POST-BETA ENHANCEMENT**

**Origin:** §223 risk 3; measured and refused in §229.

67 benchmark and golden test files, 10 maintenance verifiers and 18 expert fixtures compile into the
production build. §229 refused to move them: 62 harnesses import the fixtures, 33 scripts and
`package.json` entries reference the tests, and moving the fixtures would silently narrow what the
no-call harness scans.

**Not urgent.** No runtime module imports any of them, so nothing reaches them at runtime. The cost is
build size and tidiness.

## 11. KR-1 human-gated v1.0 limitation — **OBSERVE, by product decision**

Not a defect. The system cannot itself decide whether a model-nominated property is the real
underlying safety property or a proxy, and the v1.0 containment for that is a human. **§228C exercised
that containment end to end for the first time.** It remains `OPEN — HUMAN-GATED V1.0 LIMITATION` by
product decision, not by omission.

---

## Summary

| classification | items |
|---|---|
| **BEFORE BETA REQUIRED** | 5 silent non-declaration · 6 wrong-property rate — **both are measurement obligations for final acceptance, not remediation** |
| **BETA PRIORITY** | 1 C7 language · 2 branch quality · 7 verifier accuracy · 8 output reliability · 9 prompt version namespaces |
| **POST-BETA ENHANCEMENT** | 4 arbitration producer · 10 validation code in the build |
| **OBSERVE** | 3 `assertedConditionState` · 11 KR-1 |

**No item is a blocker to running final fresh acceptance.** The two BEFORE BETA REQUIRED items are
things final acceptance must *measure*; they are not things that must be fixed before it runs.
Remediating either before measurement would repeat the §224–§227 pattern of tuning before the rate is
known.
