# §193 — Citation enforcement analysis

## The mismatch, stated exactly

The verifier instruction (v1 → v3.1, unchanged text) says:

> "YOU MAY NOT: … **cite or quote a regulation** … If you return any of the above, **the whole
> verdict is discarded.**"

That is a fail-closed claim. Until §193, **nothing enforced it on the verifier path at all.**
`checkVerifierV3Output` has no citation check of any kind — proof suite A.3 and B.2 demonstrate that
a verdict containing `29 CFR 1910.212(a)(1)` was **ADMITTED** by the unchanged v3 boundary.

## The canonical mechanism already exists — and it was reused, not reinvented

The authorization required inspecting for existing canonical logic before implementing anything.
There is some, and it is well established:

```
CITATION_SHAPED_PATTERN = /\b\d{2}\s*CFR\s*\d+/i
backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts:701
"Used to refuse a citation smuggled into prose — the anti-citation-laundering contract
 applied to free text, not only to field names."
```

It is used across the **first-pass** path: `expert-normalization.ts` refuses a smuggled citation
(`:322`) and redacts citation-shaped spans (`:186`); `expert-measure-scorers.ts` and
`expert-prompt.ts` both reference it. So the product already decided what a prohibited citation
*is*. §193 applies that same decision to the verifier path. Nothing new was invented.

## What that closes

`checkVerifierV3_1Output` composes the **unchanged** v3 admission with the canonical boundary over
every free-text field a verdict can carry — rationale, all four `proposedClarification` fields, all
nine `nominatedFact` fields, and every `challengeReason`. Refuses **whole**, as v1/v2/v3 do, adding
one code: `PROHIBITED_REGULATORY_CITATION`. The citation-**laundering** class is now genuinely
fail-closed on the verifier path.

## What it does not close — and this is the finding

**FV-07 R1 and R3 are not refused by it.** They wrote:

> "OSHA general industry requires the work rest on a pedestal grinder be maintained with a gap not
> exceeding 1/8 inch (0.125 in)"

No CFR-shaped string. `CITATION_SHAPED_PATTERN` does not match. The authorization required refusal
**if and only if** the outputs meet the actual canonical definition; they do not, so they are not
refused. The replay confirms it across the whole cohort: **0/39 canonical violations, 39/39 admitted
before and after.**

The class FV-07 actually fell into is **a regulatory requirement asserted in prose, with a numeric
threshold, and no citation string.**

## Why no broader deterministic rule was adopted

Measured over the same 39 persisted outputs:

| candidate rule | matches | verdict |
|---|---|---|
| canonical `\b\d{2}\s*CFR\s*\d+` | **0/39** | correct, but does not reach FV-07 |
| `\bOSHA\b` | 3/39 (all FV-07) | **unusable** — see below |
| `\bregulat` | 4 executions across **FV-11 and FV-13** | **unusable — false-positives on wanted behaviour** |

**`\bOSHA\b` is unusable** because the verifier's own user prompt contains
`JURISDICTION: osha-general-industry` (verified directly). A rule matching "OSHA" would refuse any
verdict that names the jurisdiction it was handed.

**`\bregulat` is worse.** Its four matches are FV-11 and FV-13, where the verifier is reasoning
**correctly** about the *absence* of governed regulatory evidence — *"absent any governed regulatory
evidence establishing a shorter mandated interval"*. That is precisely the behaviour the architecture
wants: declining to assert a requirement that was not supplied. A rule that refuses it would punish
the desired conduct.

And any such rule is a **keyword list**, which this programme retired at §160 FINDING 1 and again
when `B_selectorAccuracy`'s keyword scorer was retired prospectively — because on three of four
REQUIRED cases the authored keyword set was already satisfied by the observation text itself.

## Conclusion — architectural mismatch, escalated not papered over

`REGULATORY_REQUIREMENT_ASSERTED_IN_PROSE` is recorded in code as
`NOT_DETERMINISTICALLY_DECIDABLE`, alongside
`QUOTED_REGULATORY_LANGUAGE_WITHOUT_A_CITATION_STRING`. The instruction's blanket claim — *cite or
quote a regulation ⇒ whole verdict discarded* — **overstates what the architecture can deliver**, and
that remains true after §193 for the prose class.

The contract was **not silently weakened**: the prompt text is untouched, and the enforceable half is
now genuinely enforced.

## Recommended representation options — for a separate authorization

Not implemented here; each alters the protocol and needs its own authorization.

1. **Structured citation declaration.** Add an optional `regulatoryBasis` field the verifier must use
   if it wants to invoke a requirement, with free-text regulatory assertion then refusable because a
   legitimate route exists. Strongest, largest change — a v3.2 protocol.
2. **Reword the fail-closed claim** to what is actually enforced: prohibit *citing or quoting* a
   regulation (citation-shaped strings and quoted standard text) and separately instruct the verifier
   to reason only from supplied evidence, without claiming a discard consequence for prose assertion.
   Smallest honest change; also a v3.2.
3. **Accept the residual and record it** as a known, bounded, non-fail-closed instruction, with the
   verifier's prose regulatory assertions surfaced for human review rather than refused.

My reading is that option 2 is the smallest change that removes the dishonesty, and option 1 is the
one that actually closes the gap — but this is a product-contract decision, not an engineering one,
and §193 does not make it.
