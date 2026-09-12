# §252 — `alongsideControlConsidered`: Contract Consistency Defect

Zero provider calls. Zero database operations. **Not repaired in §252.** The machine-readable record
is `SECTION-252-ALONGSIDE-CONTROL-DEFECT.json`, and every fact below is read out of the frozen §247
modules by `emit-252-refreeze-and-defect.ts` rather than transcribed.

## The two statements, both frozen, in direct conflict

**The provider contract permits null and instructs the model to use it.** On the cessation branch of
the §247 K6 union the field is declared `["string","null"]`, is on the branch's `required` list, and
carries this description:

> REQUIRED ON A CESSATION DRIVER. The control operating alongside the work that you considered, named
> from the observation. Write null only if the observation states no such control at all.

**The deterministic projection refuses null.** `checkRoleJustification247` tests the field with
`nonEmpty`, which is false for `null`, and raises
`CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT`, refusing the whole analysis.

A model that follows the instruction exactly, in the exact case the instruction names, has its
analysis refused.

## Classification

**CONTRACT CONSISTENCY DEFECT.** It is not a §252 defect and not a §251 defect. Both statements were
authored in §247 and neither section touched either one. §251 recorded it and left it; §252 records
it in full and leaves it.

## Is the answer mechanically established by the frozen contract?

**No.** Checked, not assumed:

- the epistemic character table is silent on this field;
- the K6 role/carrier binding is silent on it;
- the A2 rule barring a manufactured fact from a controlling role is silent on it;
- the §247 report records no decision about it;
- no third frozen statement adjudicates between the description and the projection.

Both are §247 artifacts of equal standing. Choosing between them would be a new semantic decision,
not a reading of the contract, so §252 does not choose.

## The two options, for the product owner

**A — null has legitimate semantic meaning.** Some cessation drivers genuinely arise where the
observation states no alongside control at all, and null is the honest way to say so. The projection
would then have to admit null on this field and treat "there was none to consider" as a satisfied
confrontation rather than a missing one. The cost is that the C5 mechanism — forcing a cessation
driver to confront the control the observation names — weakens by exactly one escape route, because
"there was no control" becomes writable without naming the observation's own text.

**B — null has no legitimate semantic meaning here.** A cessation driver asserts that no control
operated alongside the work would suffice, which is a statement about a control, so there is always
something to say. The provider contract would stop inviting null and the field would become a plain
required string. The cost is that a model facing an observation with no stated control must write
prose saying so rather than a null. The incidental benefit is that this removes two of the three
union-typed parameters §251 measured on the compacted representation.

## Disposition

**RETURNED AS ONE BOUNDED FOLLOW-UP ITEM.** Whichever option is chosen, it changes what the model is
asked to write on a safety-critical branch, and that is a product decision rather than an engineering
one.

## What holds in the meantime

The behaviour today is safe and it is not silent. A null is refused fail-closed, the analysis does not
enter canonical state, and the refusal carries its own named code. Nothing is coerced and no posture
is guessed. The defect costs usable outputs; it does not admit unsafe ones.
