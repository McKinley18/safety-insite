# §253 — Adjudication of `alongsideControlConsidered`

Zero provider calls. Zero database operations. Every claim below is checked mechanically by
`test-253-alongside-control-closure.ts` and recorded in `SECTION-253-LOCAL-PROOF.json`.

## The contradiction, exactly

**The transmitted contract permits null and instructs the model to use it.** On the cessation branch
of the §247 K6 union, `alongsideControlConsidered` is declared `["string","null"]`, appears on the
branch's `required` list, and carries this sentence:

> Write null only if the observation states no such control at all.

**The deterministic projection refuses null.** `checkRoleJustification247` tests the field with
`nonEmpty`, which is false for `null`, and raises
`CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT`, refusing the analysis.

A model that follows the instruction exactly, in the exact case the instruction names, is refused.

## §252 said this was not mechanically established. It is.

§252 examined the schema module and the projection, found two frozen artifacts of equal standing in
direct conflict, and correctly declined to choose. It did not consult three other frozen §247
artifacts. All three say the same thing, and they settle it.

**The §247 acceptance fixture.** `test-247-driver-role-and-k6.ts` builds a cessation driver whose
justification carries `alongsideControlConsidered: null` and `whyAlongsideControlInsufficient: null`,
names that fixture *"a cessation driver that never confronts the alongside control"*, and requires
the refusal. The frozen suite therefore reads a null pair as a confrontation that **did not happen**,
not as a finding that no control exists.

**The §247 design record.** `SECTION-247-DRIVER-ROLE-IMPLEMENTATION.md`: *"A cessation driver must
name `alongsideControlConsidered` and `whyAlongsideControlInsufficient`."* The same document
enumerates the four minimum justification fields and marks exactly one of them nullable —
`unresolvedElement` (*"the one open thing, or null"*). Neither cessation field is so marked.

**The §247 report.** *"C5 — EXPOSED, not prevented. A cessation driver must now name the alongside
control it considered and say why it is insufficient."*

Four frozen artifacts — fixture, design record, report and projection — agree. One sentence inside
one schema description disagrees. That sentence is the outlier.

## The answer, and why it is also the safe one

**1. Is null a legitimate semantic state? No.**

This is not settled by counting artifacts or by preferring the older one. Admitting null would make
the C5 mechanism bypassable.

The obligation the field creates is a **confrontation**: before a model may say work must cease, it
must state what control it weighed and why that control does not make continued exposure acceptable.
If null were admissible, a model could discharge that obligation with two nulls, and deterministic
code could never separate *"the observation genuinely names no control"* from *"I did not look"* —
because separating them requires reading the observation for meaning, which deterministic code may
never do. That is precisely the escape route §247 was built to close, reopened.

**2. What non-null representation expresses the intended state?**

A required string in which the model states its finding: either the control it considered, named from
the observation, or that the observation names no control operating alongside the work.

**3. Why does that preserve the original semantic distinction?**

Because the distinction was never machine-readable and nothing downstream consumed it as a flag. The
only deterministic consumer of the field is the `nonEmpty` presence test. What the contract actually
wants is an assertion the model is accountable for and a human reviewer can check against the
observation, and text carries that where null does not. "There was no control alongside the work" is
a finding, and a finding is exactly what the field was created to demand.

Requiring text costs the model nothing it does not already owe. It removes one thing only: the
ability to discharge a safety obligation by writing nothing.

## The repair

On the cessation branch, and nowhere else:

| Field | Before | After |
|---|---|---|
| `alongsideControlConsidered` | `["string","null"]`, "Write null only if the observation states no such control at all." | `"string"`, "If the observation names no control operating alongside the work, say so here in those words. This field is never empty…" |
| `whyAlongsideControlInsufficient` | `["string","null"]` | `"string"`, extended to cover the no-control case in words |

The deterministic projection is **untouched**. It was already correct; §253 repairs the side that was
wrong.

## What was examined and deliberately left alone

**`unresolvedElement` keeps its null.** The §247 design record blesses it explicitly, no deterministic
rule reads the field, and the schema and the projection do not disagree about it. There is nothing to
close.

**`dischargingControlRef` keeps its null, knowingly.** Its schema admits null and the projection
refuses it, but its description never invites null. That is a different and lesser shape than the
contradiction §253 was authorized to resolve, so it is reported for a separate decision rather than
swept in. Repairing it would also have been the convenient thing to do, which is why it is named here
instead.

## The effective contract is unchanged

Not one previously admissible output becomes inadmissible, and not one previously inadmissible output
becomes admissible. The only expressible value removed is one the deterministic layer has refused
since §247. The §252 admission matrix and the §243 historical replay both produce **byte-identical**
evidence files after the repair, which is the strongest available form of that claim.
