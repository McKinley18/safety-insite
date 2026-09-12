# §224 PHASE E — HOSTED CONFIRMATION DESIGN

**DESIGN ONLY. NOT EXECUTED. Provider calls made in §224: 0.**

This design is not authorized by §224 and must not be run without its own product-owner
authorization.

---

## The one question it answers

> Did the §224 first-pass remediation materially improve decision-critical declaration recall and
> exact controlling-property selection, without damaging restraint?

Nothing else. It is not an acceptance cohort, it does not compute IG gates, and it cannot close
KR-1.

## Why it must be paired

Every case below is a **fresh variant**, never previously transmitted. Fresh variants have no
recorded baseline, so a good result on them cannot be attributed to the remediation rather than to
the case being easier than IG1, IG8 or IG10.

The design therefore runs **two arms over the same eight cases**: the §210J instruction as §221
transmitted it, and the §224 instruction. Same observation, same schema, same model, same
parameters; the instruction is the only variable.

A single-arm design would produce a number and not an answer. If the spend is the obstacle, the
right response is to reduce the case count and keep the pairing, never to keep eight cases and drop
the control arm.

## The eight cases

Each names the trap it sets and the property the frozen truth holds to be controlling. All are
authored fresh; none reuses an IG observation, an IG hazard family, or an IG span.

| # | case | trap | frozen controlling property |
|---|---|---|---|
| H1 | Mezzanine edge protection removed for a delivery, reinstatement state unrecorded; drop height not measured | **IG1-type**: hazard ACTIVE under both branches, so the unknown looks to change nothing | what edge protection this opening requires, which turns on the drop height |
| H2 | Portable appliance in a wet area, no test record and no visible damage | **IG8-type**: model concludes nothing is missing while carrying its own INSUFFICIENT_EVIDENCE candidate | whether the appliance is in a condition safe for use in a wet location |
| H3 | Paint spray booth, extraction fan audible but no airflow indication, operator inside | **IG10-type**: control state substituted for condition | whether the booth atmosphere is safe to occupy without respiratory protection |
| H4 | Scaffold handed over with a green tag dated before the last high wind | **evidence-proxy trap**: the tag is the obvious observable | whether the scaffold is in a condition fit to be worked from now |
| H5 | Excavation with a battery-powered pump running and a supply cable crossing the spoil | **multi-gap**: two independent unknowns, invited to be joined | (a) whether the excavation sides are stable; (b) whether the cable is protected from damage |
| H6 | Lift shaft work where the permit requires a second isolation to be proved, and nobody can say it was | **required-act control**: the act IS the property; must not be over-corrected into a condition | whether the second isolation was applied and proved before entry |
| H7 | Pressure vessel due for periodic examination with no report on site | **required-artifact control**: the artifact IS the statutory precondition | whether a current examination report exists for this vessel |
| H8 | Fume cupboard with a current airflow certificate, sash at the marked height, alarm silent and tested this week | **restraint**: every control stated present and current | none — no declaration is correct |

H6 and H7 are the over-correction guards. A remediation that turns them into condition-shaped
properties has traded one property error for another, and that must show up as a failure rather than
pass unnoticed.

H8 is the restraint guard. A remediation that raises recall by lowering the bar will declare
something here.

## Preregistered truth

Frozen before any call, in the shape the §224 local instrument already uses: per case, the owed
propositions with their kind (`HAZARD_STATE`, `REQUIRED_ACT`, `REQUIRED_ARTIFACT`), and the
forbidden substitutions with their kind (`CONTROL_STATE`, `EVIDENCE_PROXY`, `VERIFICATION_ACT`,
`DOCUMENT`, `ADJACENT_CONDITION`). H8 carries an empty owed set and a written restraint basis.

No expectation may be authored, widened or narrowed after any output is seen.

## Required judgments

Product-owner adjudication, on the §221 pattern: slots authored empty, no prefilling, no suggested
verdict, `PRODUCT_OWNER` attribution only, and gate computation last.

Four judgments per case per arm, one per measure:

- **RECALL** — was every genuinely decision-critical property declared?
- **PRECISION** — were non-decision-critical conditions suppressed, and was every set-aside unknown
  witnessed?
- **PROPERTY IDENTITY** — did each declaration name the proposition that actually controls the
  decision?
- **INDEPENDENCE** — were independent properties kept separate?

8 cases × 2 arms × 4 measures = **64 judgment slots.**

Permitted verdicts `PASS` / `FAIL` / `AMBIGUOUS` / `NOT_EXERCISED`. `NOT_EXERCISED` is never a pass.
No aggregate score, no headline accuracy percentage, and no measure may offset another.

**The authoring check §221 lacked must run before the freeze:** every measure listed as exercised by
a case must have at least one judgment slot authored for that case. §221's five coverage-insufficient
gates all trace to the absence of that one assertion.

## Acceptance

The confirmation answers YES only if, on the §224 arm:

- recall of the frozen owed properties is 100%, with zero silent omissions;
- controlling-property identity is 100%, with zero substitutions of any forbidden kind;
- independence is 100% on H5;
- zero declarations on H8;
- H6 and H7 retain their act- and artifact-shaped properties.

and the §210J arm reproduces at least one of the three §221 failure shapes, without which the
instrument has not demonstrated that it can discriminate at all.

Each is pass/fail at zero occurrence. None may be offset.

## Calls, spend and ceiling

First-pass leg only. The question is a first-pass question; no verifier call can answer it and none
is planned.

| | |
|---|---|
| cases | 8 |
| arms | 2 (§210J control, §224 remediated) |
| first-pass calls | **16** |
| verifier calls | 0 |
| contingency calls | 2 |
| **total proposed** | **18** |
| model | `claude-sonnet-5`, as §221 |
| caching | DISABLED, as §221 — every call an independent draw |
| §221 measured cost per first-pass call | USD 0.07628 |
| §224 instruction adds 5,435 bytes ≈ USD 0.00272 per remediated-arm call | |
| **projected spend** | **USD 1.4002** |
| **hard spend ceiling** | **USD 1.76** |

Retries 0. Reruns 0. No alternate provider or model. No mid-run remediation. No prompt, schema,
deterministic-rule, truth or case change after the freeze. Database operations 0. No commit, push,
tag or deploy.

If a transport or structural failure occurs, the run returns an execution-blocked terminal and the
instrument is not altered to avoid it.

## Stated pre-execution risk

The §224 instruction composes to 63,667 bytes against §210J's 58,232. The wire schema is unchanged
at 19,267 bytes, so the §199 grammar-complexity refusal boundary that §221 canaried is not
approached again. The larger system prompt has never been transmitted hosted. Recorded here, before
execution, rather than discovered after it.
