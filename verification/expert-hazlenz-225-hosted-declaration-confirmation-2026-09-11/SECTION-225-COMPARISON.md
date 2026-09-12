# §225 — PAIRED-ARM COMPARISON

Eight cases, two arms, sixteen calls. Both arms received byte-identical observations, supplied
context, wire schema, model and parameters. **The system prompt was the only variable.**

Frozen protocol `4ebc81b73a6df5c7a60d2a6051abb5bd2450ebf49ad49e428c77293920e3572e`.

---

## 1. Did a declaration get emitted at all?

| case | owed | §210J predecessor | §224 remediated |
|---|---|---|---|
| H1 mezzanine edge, drop unmeasured | 1 | **0** | 1 |
| H2 submersible pump, wet area | 1 | 1 | 1 |
| H3 spray booth, no airflow indication | 1 | **0** | 1 |
| H4 scaffold after the storm | 1 | 1 | 1 |
| H5 trench and cable | 2 | **0** | **0** |
| H6 lift shaft second isolation | 1 | 1 | 1 |
| H7 boiler examination | 1 | 1 | 1 |
| H8 fume cupboard (restraint) | 0 | 0 | 0 |

**The recall improvement is real.** On H1 and H3 the predecessor arm emitted zero declarations and
zero clarifications on observations where the frozen truth owes a property. The remediated arm
emitted one on each. Those are the IG1 and IG8 failure shapes, reproduced on fresh facts and then
closed by the instruction change alone.

**H5 was not closed by either arm.**

## 2. Per measure

| measure | §210J predecessor | §224 remediated |
|---|---|---|
| declaration recall | 4 / 7 | **6 / 7** |
| controlling-property identity | 1 / 7 | **3 / 7** |
| independence | 0 / 1 | 0 / 1 |
| restraint | 1 / 1 | 1 / 1 |

No aggregate is computed from these and none may offset a gate.

## 3. Where the property moved, and where it did not

**H4 moved, and it is the clearest single result in the run.** Same observation, both arms.

> **§210J:** "Whether the scaffold's structural condition (ties, bracing, standards, boards) **has
> been assessed by a competent person** following Sunday night's storm"
>
> **§224:** "Whether the scaffold's structural components (ties, boards, couplers, standards) **are
> currently sound** following Sunday night's storm"

The predecessor named a verification act. The remediated arm named the condition. That is GATE 13
doing exactly what it was written to do.

**H3 did not move far enough, and H3 is the case that exists to test this.**

> **§224:** "Whether the booth **extraction system** is currently moving sufficient air through the
> booth to control overspray and vapour concentration during spraying"

The frozen property is whether the booth atmosphere is safe to occupy **without respiratory
protection**. The subject of the declared proposition is the control, and branchA reads "the fan and
ductwork are functioning". Granting it does not settle the frozen question — two-pack primer requires
respiratory protection irrespective of extraction performance. This is the IG10 substitution
surviving the remediation on a fresh case.

**H2 did not move at all.** Both arms declared whether the supply circuit has residual current
protection. The frozen property is whether the pump is in a condition safe for use in a wet
location. Granting branchA — the circuit has RCD protection — does not settle whether an untested
pump run submerged while the operator stands in the water is fit for use.

**H7 did not move, in the other direction.** Both arms declared whether the examination "was actually
carried out", where the frozen property is whether a current examination **report** exists, the
artifact itself being the statutory precondition. Both arms went one step deeper than the artifact.
Not introduced by the remediation, but the gate is absolute on the remediated arm.

## 4. H5, and the mechanism the remediation misses

H5 is the most important negative result in the run, because it shows how the §224 trigger can be
routed around.

The §224 declaration trigger is keyed on the model's **own candidate states**: candidates at
`UNKNOWN` or `INSUFFICIENT_EVIDENCE`, or marked `requiresUserConfirmation`. On H5 the remediated arm
asserted **every** concern as `ACTIVE` at `HIGH` confidence, including one whose own reasoning reads:

> "the actual soil classification and stability **cannot be relied upon to judge whether the
> unsupported sides will hold**"

marked `assertedConditionState: ACTIVE`, `confidence: HIGH`.

The predecessor arm, on the same observation, marked that same concern `INSUFFICIENT_EVIDENCE` with
`requiresUserConfirmation: true` — and still declared nothing.

So the remediated arm expressed an unresolved judgement in prose while labelling the candidate
resolved, and the trigger never fired. A trigger keyed on a self-reported state can be bypassed by
self-reporting a different state, and nothing in the contract cross-checks the state against the
reasoning that accompanies it.

Whether the remediation *caused* the shift from `INSUFFICIENT_EVIDENCE` to `ACTIVE` cannot be
established from one paired case, and is not claimed.

## 5. Restraint held

H8 is the only case where the frozen truth owes nothing. Both arms declared nothing. The remediated
arm additionally recorded a witnessed negative:

> "No fact in the observation indicates the ventilation certificate, alarm test, sash position, PPE
> use, or container closure practice have failed or lapsed since being stated, so no current gap in
> these controls is established."

The witnessed-negative requirement fired and did not push the model into declaring. The remediation
raised recall without visible cost to restraint on the one case that tested it — one case, which
does not generalise.

## 6. Output-shape reliability

| | |
|---|---|
| calls executed | 16 |
| transport failures | 0 |
| truncation at `max_tokens` | 0 |
| unparseable output | 0 |
| stringified structured fields | 0 |
| malformed output silently erasing a decision-critical fact | 0 |

Both arms, eight of eight. The §221 Class B structured-output failures did not recur here. The
§224 instruction adds 5,435 bytes to the system prompt and transported without incident.

## 7. A defect in the §225 case authoring, recorded not repaired

H5's frozen truth lists two owed properties, the second being "whether the cable is protected from
damage". The §225 observation states plainly that "The cable is not ducted, covered or slung."
That property is therefore **established by the observation, not open**, and treating it as an owed
unresolved fact was an authoring error on my part.

Both arms correctly treated the cable as an active known hazard rather than an open question. The
H5 recall and independence gates still fail on the first property — the soil classification, which
is genuinely unknown and determines which support system is required — so the gate outcome does not
turn on this error. The frozen protocol is **not revised**; the error is recorded here, on the same
footing as the §224 instrument-authoring defect.
