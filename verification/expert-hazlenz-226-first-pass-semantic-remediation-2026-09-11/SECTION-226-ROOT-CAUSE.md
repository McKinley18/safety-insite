# §226 — ROOT CAUSE

**Provider calls 0 · Database operations 0.** Diagnosis from the §225 scored results and frozen
protocol, the composed §224 instruction, and the §210J gates §224 builds on. No speculation is
offered where evidence is absent.

---

## The short version

**One mechanism explains all three remaining §225 failures.**

Every §224 rule is keyed on an enumeration the model must first place itself into. A model that does
not place itself inside the enumeration never evaluates the rule. The rule is not overridden; it is
never reached.

- The declaration trigger enumerates **candidate states the model assigned itself**. Assert a
  different state and the enumerated set is empty.
- GATE 13 is written as a rule **about controls**, and its test opens "take your own branchA — the
  control working exactly as intended". Reaching it requires having already classified your own
  property as control-shaped.
- The required-artifact carve-out §224 relies on **does not exist**. GATE 8 and GATE 12 each carve
  out the required *act*, in two places, and the required *artifact* in none.

§225 also settles what the cause is **not**. Output shape was 8/8 clean on both arms, no response
truncated, and §223 established the structured representation is already sufficient. Transport,
token pressure and representation capacity are excluded by evidence, not by assumption.

---

## RC5 — the declaration trigger is keyed on the model's own candidate-state label

§224's `THE DECLARATION TRIGGER` builds its input set out of self-reported labels:

> Read back your own candidate list and your own uncertainty statements. **Take every candidate you
> yourself put at UNKNOWN or INSUFFICIENT_EVIDENCE, every candidate you marked
> requiresUserConfirmation true, and every unknown you named in an uncertainty statement.**

Every member of that set is something the model decided. On §225 H5 the remediated arm asserted
every concern `ACTIVE` at `HIGH` confidence with `requiresUserConfirmation: false` and wrote no
uncertainty statement — including a candidate whose own reasoning reads that the soil classification

> cannot be relied upon to judge whether the unsupported sides will hold.

The enumerated set was empty. The trigger never fired. Zero declarations were emitted against two
owed properties, and G1 and G3 both failed on that one case.

**The circularity is exact.**

```
MODEL SELECTS STATE
  -> STATE CONTROLS WHETHER MODEL MUST DECLARE UNCERTAINTY
  -> AN INCORRECT STATE SUPPRESSES DECLARATION OF THE FACT NEEDED TO JUSTIFY THAT STATE
```

`assertedConditionState` is an **output conclusion**. §224 used it as an **input predicate**. A
conclusion cannot be the evidence for itself.

Two details keep the diagnosis honest. The predecessor arm marked the same concern
`INSUFFICIENT_EVIDENCE` with `requiresUserConfirmation: true` and **also declared nothing**, so the
label shift is not what caused H5 to fail and §225 did not claim it did. And whether the §224
instruction caused the shift to `ACTIVE` cannot be established from one paired case. What *is*
established is the contract property: a trigger keyed on a self-reported state is bypassed by
self-reporting a different state, and nothing in the contract cross-checks the asserted state
against the reasoning printed beside it.

---

## RC6 — the property gate is reachable only by self-classification

GATE 13 forbids the H2 and H3 substitutions **in terms**. It names control state as the wrong
property, lists the shapes, and closes the `REQUIRED_CONTROL` licence. Both §225 failures are
control states:

| case | declared property | frozen controlling property |
|---|---|---|
| H2 | whether the supply circuit has functioning residual current protection | whether the appliance is in a condition safe for use in a wet location |
| H3 | whether the extraction system is moving sufficient air | whether the booth atmosphere is safe to occupy without respiratory protection |

So the contract was not permissive. It was **unreached**. GATE 13 is framed as a rule about controls
throughout — its title (`THE PROPERTY IS THE CONDITION, NOT THE CONTROL`), its worked list ("whether
the fan is running, whether the interlock is closed, whether the extraction is on"), and above all
its test:

> THE TEST, ONE ENTRY AT A TIME: take your own branchA — **the control working exactly as intended**
> — and grant it.

A model that has not already decided its property is a control does not recognise the test as
addressed to it. Enumerating forbidden kinds cannot help when applying the rule depends on
recognising the kind first.

**This generalises beyond controls, and that is the point.** A deny-list can only refuse what
somebody listed. §225's near-neighbour annotations were authored per case; a real observation can
produce a substitution nobody anticipated, and such a substitution passes a deny-list rule without
being examined at all.

H1 is a live example on the pass side. §225 marked its property identity PASS but **BORDERLINE**,
recording that the declaration names the dimension (the drop height) rather than the requirement it
determines, and that a product owner could score it FAIL. A rule that tested sufficiency rather than
membership would have decided H1 on the merits instead of on which list it fell outside.

---

## RC7 — the required-artifact carve-out was asserted by §224 and never existed in the base

§224 GATE 13 says:

> Not what observation, test, control, document or act would help answer it — unless that act or
> that artifact is itself the governing requirement, **which GATE 8 already carves out and this gate
> does not take back**.

**GATE 8 does not carve that out.** Its carve-out covers the act alone:

> One case is different, and it is not rare: where performing **the act** is itself what changes
> today's action, **the act IS the state** and naming it is right.

and it closes by sending records the other way:

> **A missing record** or an old reading belongs in `notEstablishedBecause` and in the span you
> copied, **and stays there.**

GATE 12's choosing test terminates on the act for the same reason:

> If seeing it would leave the decision still turning on **whether the required act was carried
> out**, then **the act IS your property**.

So the base contract carves out the required act in two places and the required artifact in none,
while listing "documented, recorded, available" among the things to move past, and while GATE 12's
visibility heuristic points a model that cannot settle a question by looking at the workplace
straight at the act.

**Observed on §225 H7.** A bakery boiler in service; the written scheme requires examination every
fourteen months; the newest report held is nineteen months old; the manager believes an examination
happened in spring but cannot produce a report. Frozen controlling property: whether a current
examination report exists. Both arms declared

> whether an examination was actually carried out and passed

one level **beneath** the artifact that is itself the statutory precondition. **Both arms did it**,
so this is inherited from the base and was not introduced by §224.

The materiality is concrete: an entry that names the act can be closed by somebody asserting the act
happened, while the requirement the scheme actually imposes is still unmet and the plant is still
running.

### Which of the three candidate causes it is

The §226 authorization asked this to be separated out. On the evidence:

| candidate cause | verdict |
|---|---|
| the same property-abstraction mechanism as RC6 | **No.** H7 moved in the opposite direction, toward the act, not toward an adjacent state. |
| an over-broad "move deeper" instruction | **Contributing, not sufficient.** GATE 12's "if you could simply see the workplace" test does push past a record, but it pushes to the act because the act is the only terminus the base names. |
| confusion between evidence-record and requirement-record | **Yes, and it is the operative one.** The base never draws that distinction. GATE 8 addresses only "a missing record or an old reading", which is the evidence sense. |
| another demonstrated cause | none found. |

**The smallest correction is therefore to state the artifact carve-out that the base holds for the
act, and to give the test that separates the two kinds of record.** Nothing else in GATE 8 or GATE
12 needs to move, and neither is rewritten.

---

## Root causes not found

Recorded so the absence is on the record rather than implied.

- **Output shape, transport or token pressure.** §225 recorded 8/8 clean on both arms, zero
  transport failures, zero truncation, zero unparseable responses, zero stringified fields. Not a
  cause of any of the three.
- **Representation or schema capacity.** §223 established the structured representation is
  sufficient, and §225 changed nothing about it. Every result the frozen truth requires is
  expressible on the existing schema. No field is added here.
- **Restraint damage from §224.** H8 declared nothing where nothing was owed and additionally
  recorded a witnessed negative naming the controls it had checked. The §224 witnessed-negative
  requirement fired without pushing the model into declaring. One case does not generalise, and it
  is not evidence of a problem either.
- **The predecessor being closer to correct.** It was not. The predecessor arm was worse on recall
  (4/7 against 6/7) and on property identity (1/7 against 3/7), and failed the artifact case
  identically.

---

## What this means for the remediation

Three causes, one mechanism. The correction in each case is the same move: **replace a rule keyed on
an enumeration with a test applied unconditionally, and run it from the decision rather than from
the label or the shape of the property.**

None of the three requires a new layer, a second verifier, a schema field, deterministic semantic
inference, or a rewrite of §224. Both §226 blocks qualify §224's own text in place — the same move
§224 made on §210J's subordination sentence — and removing them reproduces §224, and then §210J,
byte for byte.

## Deliberately not acted on

**The H4 branch-drift defect.** §225 recorded that on H4 the remediated `missingFact` names the
condition while `branchA` and `branchB` still divide inspected from not-inspected. GATE 12 already
forbids exactly that. It is material and it is not gated, and it is outside the bounded
authorization for the demonstrated remaining mechanism. It is reported here and not fixed.

**The §225 H5-P2 authoring error.** H5's second owed property was stated as established by its own
observation. §225 recorded the error and did not revise the frozen protocol, and neither does this
section. The §226 instrument is authored fresh and its preflight check P1 exists to catch exactly
that class of error before a freeze.
