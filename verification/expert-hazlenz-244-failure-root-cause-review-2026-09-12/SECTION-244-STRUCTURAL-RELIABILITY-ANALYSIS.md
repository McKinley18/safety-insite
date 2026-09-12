# §244 — Structural Reliability and Strict Schema, Family C

Zero provider calls. Every configuration below is read from source, not inferred.

## The four configurations

| Element | Production request builder | §231 executor | §238 executor | §243 executor |
|---|---|---|---|---|
| builder | `buildAnthropicRequestBody` | `execute-231-final-acceptance.ts` | `execute-238-confirmation.ts` | `execute-243-final-acceptance.ts` |
| system prompt | `EXPERT_SYSTEM_PROMPT`, the v15 production prompt | `build226SystemPrompt` | `build237SystemPrompt` | `build239SystemPrompt` |
| wire schema | `buildExpertWireSchema`, v15 canonical | `buildExpert210jWireSchema` | §237 schema | `buildExpert239WireSchema` |
| strict wrapper on the schema | yes | yes | yes | yes |
| tool-level `strict: true` | **yes** | **no** | **no** | **no** |
| tool_choice forced | yes | yes | yes | yes |
| thinking | from config | disabled | disabled | disabled |
| max tokens | config, 8000 | 8000 / 4000 verifier | frozen config | 8000 / 4000 verifier |
| governed records transmitted | `governedStandards` on the input | appended vNext block, `governedStandards` empty | none supplied | appended vNext block, `governedStandards` empty |

In all four the schema itself carries `additionalProperties: false` and full `required` arrays. The
difference is that only the production builder asks the provider to enforce them.

## Where strict mode is configured and why the executor omitted it

It is a literal property on the tool block, set in one place: `buildAnthropicRequestBody`. The
acceptance executors never set it because none of them calls that builder. They assemble the request
body themselves, and §231 and §238 established that shape before §243 existed. §242A directed §243
to reuse the §236 and §238 assembly path so a difference in the result would be attributable to the
candidate rather than to a rebuilt path. §243 complied exactly, and inherited the omission.

## The finding that matters more than the flag

**No file under `src/` imports any of the experiment posture contracts.** Not §210J, not §226, not
§237, not §239, not the vNext first-pass instruction. The production adapter is the only caller of
the production request builder, and it sends the v15 prompt and the v15 schema.

So the question "does production use strict mode on every equivalent first-pass and verifier call"
has no affirmative answer: **production has no equivalent call.** The §239 first-pass contract that
§243 accepted or rejected is exercised only by experiment executors. Strict mode is therefore not a
setting the acceptance run wrongly dropped from the shipping path; the two are different callers of
different contracts, and only one of them was measured.

This also means strict mode is **one caller's configuration and not intended candidate behaviour**,
because the candidate has no production caller to define intended behaviour for it.

## Did the protected candidate identity omit a load-bearing execution configuration

Yes. The successor candidate digest is taken over module digests, prior-section digests, the
protected composite, suite results and evidence integrity. It binds no request configuration. §243's
pre-spend record did capture a per-case system-prompt, user-prompt and wire-schema digest, which is
good practice, but those digests are recorded beside the candidate, not bound into it, and the
tool-level options, the model identifier and the token limits were never hashed anywhere.

The programme already knew the principle. The §138 and §139 record in `expert-prompt.ts` states that
"an experiment that cannot prove its own configuration cannot serve as anyone's baseline", and
responded by hashing the prompt and the schema. The gap §243 exposes is that the hashing stopped at
the prompt and the schema and never reached the request envelope.

## Classification of the fifteen calls

| Class | Count | Calls |
|---|---|---|
| A conformance, plausibly prevented by strict provider enforcement | 5 | G4, G8, C3, C7, M5 |
| B semantic coherence, strict enforcement cannot solve | 8 | G1, G2, C1, C4, C6, C8, M4, M6 |
| C K6 known-contract refusal | 1 | M2 |
| D other | 1 | C2 verifier, additive nomination refused by scope containment |

G1 and G2 each carry a missing-required-field code **and** a semantic-coherence code. They are
classed B because the coherence code alone would still have refused them. Counting them as A would
overstate what strict mode can do.

## Bounded estimate of what strict mode could have achieved

Upper bound, assuming every class-A call would then have produced a semantically coherent posture,
which the eight class-B refusals make unlikely:

| | Observed | Upper bound with strict enforcement |
|---|---|---|
| clean and admitted calls | 15 of 30 | 20 of 30 |
| Q13 | 0.50 | 0.667 |

Q13's threshold is 0.95 and the decision rule's order-2 trigger is 0.90. The upper bound clears
neither. Strict mode also touches none of G, O or Q6: the two HS15 occurrences were on admitted,
coherent postures, the three HS14 occurrences are artifact gaps, and posture accuracy is measured
only over admitted cases.

**Strict schema mode could not have changed the §243 decision.** D HOLD RELEASE stands on four
independent order-2 conditions and strict mode weakens none of them.

## What follows

Strict enforcement is still worth adopting, because five of fifteen structural failures is a real
reliability gain and because two of those five were schema-artifact placeholders with no analysis
content at all. It is a provider request configuration change, it is cheap, and it is testable
offline. It is not a fix for Q13 and must not be presented as one.

The larger item is that the §239 contract has no production caller. Until that is resolved, any
acceptance of this candidate measures a configuration the product does not ship. That is a
product-owner decision and not a remediation slice.
