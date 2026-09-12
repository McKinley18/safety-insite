# §194 — FV-07 under the v3.2 representation

**Historical diagnostic only. §192 is not rewritten, and no §192 figure changes.** FV-07's three
executions remain ADMITTED in the §192 record, G7 remains 15/18, and the cohort is untouched.

The question asked here is prospective and general: *under v3.2, how would an output making that kind
of independent regulatory proposition be required to represent its basis?*

## What FV-07 actually did

On a row where **no governed evidence was supplied** (`governedEvidence: []` on every §192 row), two
of three replicates wrote:

> "OSHA general industry requires the work rest on a pedestal grinder be maintained with a gap not
> exceeding 1/8 inch (0.125 in)"

and embedded that figure in the proposed question. No citation string, so §193's canonical boundary
does not match — the finding that produced §194.

## Under v3.2, three routes and only three

**Route 1 — declare `NONE` and reason from the observation.** Available, admitted, and the route the
prompt names as normal. The owed fact is *the current work-rest gap*; the observation establishes
only when it was last set. A question asking for the current measured gap needs no regulation at all.
Note that the §192 outputs already did this well — all three replicates asked for the **current
measured gap** — so the regulatory assertion was decoration on an otherwise sound question, not its
load-bearing part.

**Route 2 — declare reliance on supplied governed evidence.** Requires
`reliance: SUPPLIED_GOVERNED_EVIDENCE` plus at least one `sourceId` drawn from the closed set.
**On a row with no governed evidence supplied, this route is closed** — proof-suite 10b: with an
empty supplied set, any declared reliance is refused whole. The architecture prevents the proposition
from being relied upon as regulatory authority, which is exactly what the authorization asked for.

**Route 3 — write the citation anyway.** Refused whole by §193's canonical boundary, in the rationale,
in the proposed question, in a challenge reason, and now inside `proposition` too.

## The honest residual

**A v3.2 verifier could still write FV-07's exact sentence and declare `NONE`, and be admitted.** No
deterministic rule catches a regulatory-sounding sentence that names no citation — that is the §193
finding and §194 does not overturn it.

What changes is real but bounded:

- the verifier now has a **legitimate route** it declined to use, so the omission is a choice
  recorded in structured output rather than an absence with nothing to compare against;
- **claimed** authority is fail-closed: it cannot be asserted without a supplied source;
- an undeclared prose assertion is now a **semantic review item against a `NONE` declaration**, not a
  contract hole.

## No special case

Nothing in v3.2 mentions work rests, grinders, `1/8 inch`, OSHA, or any FV-07 term. Proof-suite C.4
checks the inserted block names only the three general `NONE` categories, and the §193 suite's B.9
cohort-term scan remains in force on the §191 blocks. The representation is generic by construction.

## For the end-to-end cohort

This row is the reason the next cohort must include all three shapes the authorization names:
ordinary reasoning with no reliance; legitimate reliance with governed evidence **actually supplied**;
and a case where a regulatory question arises with **no adequate governed evidence**, to verify the
abstention path. FV-07 is an instance of the third, and §192 had no instance of the second at all —
`governedEvidence` was empty on all thirteen rows.
