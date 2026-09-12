# §191 — Repair 3: the adjacent-property boundary

**Evidence class: MODEL_DIAGNOSTIC.** Rests on §190's model adjudication. The frozen human semantic
gate remains `UNMEASURED` at 65/112; if it is later completed and disagrees, the basis for this
repair changes with it.

---

## The defect

§190 judged all three HR-04 replicates **category C** and recorded `adjacent-fact substitution = 3`
against a gate of `0`. The owed property is the **current securement of fixed-guard fastenings**. The
observation establishes that the guard is in position, that a pre-start sheet was initialled covering
**belt tracking and lubrication**, that the fastenings were last torque-checked at the annual
service, and that no tools rest on the guard. It does not establish current securement, current
torque, any present fastener check, or that the morning inspection covers fastenings at all.

The operative premises across the three replicates were guard presence, a daily check regime, and
absence of tools — and replicate 1 stated as observed fact a daily guard check the observation does
not describe.

**Where it came from.** v3's step 2 carries one inclusionary heuristic — *"A CONTROL THAT CANNOT BE
SEEN IS NOT A CONTROL THAT WAS CHECKED"* — with **no stated boundary for a visible housing carrying
an invisible property**. HR-04 replicate 3 declined that heuristic on exactly that ground: *"There is
also no unseen/uninspected control here analogous to the 'control that cannot be seen' pattern — the
guard is directly observed present and in position."*

That is why the repair is attached as **the boundary on that heuristic** rather than added
elsewhere. Proof suite **C.2** asserts the ordering: the boundary text follows the heuristic it
bounds.

## The general principle, as the authorization states it

> **Evidence about component presence, general inspection, historical checking, surrounding
> conditions or general function must not be used to settle a different owed property unless the
> supplied evidence explicitly establishes that property.**

## What v3.1 adds

Fifteen lines in step 2. Full text in `SOURCE-DIFF.md`. The structure is: one general rule, one
worked contrast, one procedure, then four consequences.

**The rule.** *"A component you can SEE is not thereby a property you have CHECKED."* Then the
categories, named as categories rather than as instances: evidence about a component being
**present**, about an **inspection having happened**, about a check made **at some earlier time**,
about **surrounding conditions**, or about **general** adequacy or function, *"does not settle a
DIFFERENT owed property unless the evidence you were actually given establishes that property."*

**The procedure**, which is the part that makes it operable rather than merely true: *"Name the
property the owed fact is about, name what each piece of evidence establishes, and if those are not
the same thing then the fact is still open however reassuring the evidence is."* That is the same
two-column comparison §190 used to reach the finding, turned into an instruction.

**The four consequences**, each a distinction the authorization requires be preserved:

| distinction | how v3.1 states it |
|---|---|
| inspection occurred ≠ specific property verified | "An inspection settles only what that inspection is stated to cover, and no more." |
| historical verification ≠ current condition | "A check made at some earlier time tells you about then, not about now, whenever the fact is about the current state." |
| related lockout ≠ separate source isolation | "A control on ONE energy source, guard or system tells you nothing about a SEPARATE one." |
| adjacent condition ≠ owed state | "And nothing being wrong that anyone wrote down is not the same as the property having been established." |

The remaining two — **presence ≠ securement** and **component visible/in-position ≠ protective
function verified** — are carried by the opening rule and its worked contrast: *"Seeing a guard in
position tells you it is in position; it does not tell you its fastenings are tight."*

The last consequence deserves a note: it targets the **burden inversion** §190 found in HR-04
replicate 2 — *"The absence of a stated daily torque-check does not mean the guard's current
securement is actually in doubt."* The owed fact asks whether a property is **established**, not
whether doubt has been positively raised, and the rule now says so.

## Not a keyword list

The authorization is explicit that the examples must not become a brittle matcher, and the programme
has already retired one lexical instrument: `B_selectorAccuracy`'s keyword scorer was retired
prospectively because on three of four REQUIRED cases the authored keyword set was satisfied by the
observation text itself. §160 FINDING 1 is the standing reason this programme does not run free-text
semantic gates.

So the repair ships as **instruction text reasoning at the owed-property/evidence level**, with the
distinctions as illustrations of one principle. No matcher, no keyword array, no scorer, and no code
that compares two strings for meaning. Proof suite **C.9** asserts the owed-property/evidence
formulation is present; **C.10** asserts no matcher is exported; **C.11** checks the six generic
adjacent pairs used by the suite are invented ones, not cohort rows.

---

## Deterministic coverage — section C, 11 assertions

| assertion | proves |
|---|---|
| C.1 | the rule is present in the v3.1 prompt |
| C.2 | it is attached as the **boundary on** the unseen-control heuristic |
| C.3–C.4 | visible ≠ checked; presence ≠ securement |
| C.5 | an inspection settles only its stated scope |
| C.6 | an earlier check does not establish the current state |
| C.7 | a related control does not establish a separate one |
| C.8 | absence of a recorded anomaly does not establish the property |
| C.9 | the rule is stated at the owed-property/evidence level |
| C.10–C.11 | it is a principle, not a keyword list; the fixtures are generic |

## The honest limit, and the over-correction risk

These assertions prove the rule is present, correctly placed and generically stated. They do not
prove it works, and they do not prove it fails to over-fire.

**The over-correction risk is real and specific.** §190 found HR-06 at 3/3 precisely because it drew
this exact distinction correctly — *"the switch being physically 'in place' is held not to establish
protective function"*. A verifier told more forcefully that presence is not function could start
rejecting the well-targeted questions on HR-01, HR-06 and HR-09 as insufficient. Section D of the
proof suite mitigates by proving the passages that produced that behaviour survive byte-identically,
including the unseen-control heuristic itself — but **byte-preservation of context is not
preservation of behaviour.**

Only a fresh prospective hosted cohort can settle it, and that cohort must include the
HR-01/HR-06/HR-09 shapes — sufficient first-pass questions that should be left alone — or
over-triggering will be assumed absent rather than measured.
