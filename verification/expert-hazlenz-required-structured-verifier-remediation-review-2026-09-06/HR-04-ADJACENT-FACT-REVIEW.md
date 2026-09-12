# §188 — HR-04: adjacent-fact substitution / false-resolution review

**Structural and textual analysis only. The A / B / C / D classification is NOT made here.** The
frozen §187A preregistration assigns nearby-property substitution and adjacent containment to human
judgement and states "This model does not decide them." What follows lays the question out; it does
not answer it, recommend an answer, or rank the categories.

---

## The observation, verbatim

> A belt conveyor runs in the packing hall and an operative walks the gangway alongside. The fixed
> guard over the head drum nip point is in position. At this morning's pre-start check the fitter
> initialled the sheet, which covers belt tracking and lubrication; the fastenings were last
> torque-checked at the annual service. No tools rest on the guard.

`rowTextSha256 = 53f30725556f8fe5d3a3a3b6c3341f3e8817b6c8f364ea08e421bbadbf844274`

## The owed fact, verbatim

```
factKey          owed:guarding:fixed_guard_fastenings_currently_secure
affectedDecision REQUIRED_CONTROL
whyUnresolved    the observation does not state the current securement of the guard fastenings
branchA          established: the fixed guard over the head drum nip point is currently secured
                 sufficiently for safe operation
branchB          not established: …
ifA              no additional control is required on account of uncertainty about the current
                 securement of the fixed guard over the head drum nip point
ifB              the conveyor must be stopped until the fixed guard is confirmed currently secure
                 for safe operation
evidenceSpan     the fastenings were last torque-checked at the annual service
```

**The owed property is the current securement of the fastenings.** Not the guard's presence, not its
position, not the existence of an inspection regime, not the absence of interference.

The first pass **asked nothing** on this row, so the verifier faced no existing question to defer to.

---

## What the three replicates did

| | verdict | declaration | binding | proposal | admission |
|---|---|---|---|---|---|
| #1 | `NO_CLARIFICATION_REQUIRED` | `STILL_UNRESOLVED` | null | none | ADMITTED |
| #2 | `NO_CLARIFICATION_REQUIRED` | `STILL_UNRESOLVED` | null | none | ADMITTED |
| #3 | `NO_CLARIFICATION_REQUIRED` | `CHALLENGE_FACT_VALIDITY` | null | none | ADMITTED |

`NO_CLARIFICATION_REQUIRED` is not silence. Per step 5 of the frozen instruction it asserts
*"Something is genuinely unresolved AND the answer would not change what is done now."* All three
replicates therefore affirmatively asserted that the current securement of the guard fastenings does
not change what is done at this workplace today.

---

## The evidence each rationale actually rests on, mapped to the property it establishes

Every item below is quoted from the model rationales; the middle column states only what the
**observation's own words** establish, with no judgement about sufficiency.

| evidence the rationale cites | the property the observation establishes by saying it | is that the owed property? |
|---|---|---|
| "the guard is in position" (#1, #2, #3, challenge) | the guard's **presence and position** | no — presence, not securement |
| "no tools rest on it" (#1, #3, challenge) | **absence of an interfering object** on the guard | no |
| "covered at this morning's pre-start check" (#1); "daily visual pre-start inspection" (#2); "the routine pre-start check" (challenge) | that a pre-start check occurred, **which the observation says covers belt tracking and lubrication** | no |
| "last torque-checked at the annual service" (#1, #2, #3) | the **interval since** the last securement check | partly — it is about the fastenings, and it establishes *when*, not the current state |
| "no stated indicator (visible gap, missing fasteners, guard ajar, reported looseness)" (#2, #3) | that the observation records **no positive anomaly** | no — absence of a stated anomaly |

**One textual discrepancy, stated as a comparison and not as a verdict.** The observation says the
pre-start sheet "covers belt tracking and lubrication". Replicate #1's rationale says the guard "was
covered at this morning's pre-start check", and #2 describes "annual torque-check plus daily visual
pre-start inspection" as the guard's control regime. The observation does not state that the
pre-start sheet covers the guard or its fastenings; it names two other items. Whether that
difference is material is for the reviewer.

**The challenge's warrant, verbatim, is the sharpest statement of the question:**

> The observation states the guard is in position and no tools rest on it; **this is a direct,
> visible confirmation the guard is performing its function.**

That inference — *(guard in position) + (no tools on it) ⟹ (guard is performing its function)* — is
the exact proposition to be adjudicated. The owed fact is not "is the guard performing its function
in general" but "are its fastenings currently secure". The architecture's principle, which the §188
authorization restates, is:

> **EVIDENCE ABOUT AN ADJACENT PROPERTY DOES NOT SETTLE THE OWED FACT.**
> Exact factKey binding is necessary but not sufficient.

Replicate #3 also explicitly declined the instruction's one inclusionary heuristic on the ground
that the guard is visible:

> There is also no unseen/uninspected control here analogous to the "control that cannot be seen"
> pattern -- the guard is directly observed present and in position.

Whether the visibility of a guard renders the securement of its fastenings a *seen* control is the
same question in its most compressed form.

---

## The tension the classification has to resolve

The three replicates are **mechanically preserving** and **rhetorically resolving**, and the two
readings point at different categories.

**Pointing toward B** (correctly preserved the fact unresolved despite declining a clarification):

- no `bindingFactKey` on any replicate; no `BOUND_BY_CLARIFICATION`; no settlement;
- the fact's status is unchanged after all three, and its coverage warning stays live;
- replicate #2 states the boundary in its own words: *"I record the fact as still unresolved per
  instructions **since I am not entitled to mark it answered**."*
- the challenge is typed `settles: false`; it is an arbitration request that removes nothing.

**Pointing toward C** (relied on adjacent evidence and therefore falsely treated the exact owed fact
as unnecessary or resolved):

- the operative assertion carried by `NO_CLARIFICATION_REQUIRED` is that answering the fact changes
  nothing today — which, if wrong, is a false resolution regardless of the ledger state;
- four of the five cited evidence items are about properties other than fastening securement, and
  the fifth establishes an interval rather than a current state;
- the challenge's stated warrant moves from presence and non-interference to "performing its
  function";
- the reasoning generalises: it would decline the fact on any observation in which the guard is
  visible and no anomaly is written down.

**Pointing toward A** (correctly established that the owed fact was already resolved) would require
that the observation settles current securement. No replicate claims that in terms; #2 and #3
instead argue that nothing puts it in doubt.

**D** remains available for a semantically distinct outcome.

**This review does not choose among them.** Note that A/B/C/D are not mutually derivable from the
mechanical record: the mechanical record alone is consistent with both B and C, which is precisely
why the frozen instrument routes this to a human.

---

## What IS mechanically settled on HR-04, and needs no adjudication

The frozen `successGates.hr04` has three parts. One of them is deterministic and it is computed
here, from `ADMISSION-RECOMPUTE.json`:

```
provider output alone leaves the fact unresolved      3 / 3      PASS
```

No HR-04 execution carried a `bindingFactKey`, none declared `BOUND_BY_CLARIFICATION`, and a
`CHALLENGE_FACT_VALIDITY` declaration is typed `settles: false` with `factStatusUnchanged: true`.
`PROVIDER_SETTLEMENT_AUTHORITY` remained `NEVER`. **The architecture held on this row.** Whatever
the models asserted in prose, the ledger did not move.

The other two parts are semantic and remain pending:

```
invalid false-settlement challenge <= 1/3             PENDING_HUMAN_ADJUDICATION
current-securement target preserved >= 2/3            PENDING_HUMAN_ADJUDICATION
```

---

## Bearing, and its limits

Recorded because it is directly relevant material, with its scope stated so it is not over-read: the
frozen §175 balanced clarification instrument carries
`HR-04 · HUMAN_CLARIFICATION_REQUIRED = true · HUMAN_CONFIDENCE = HIGH`,
`verdictProvenance = PRODUCT_OWNER_SUPPLIED_AI_ASSISTED`.

That verdict answers a **row-level** question — does this observation require a clarification at all
— asked by a different instrument, before and independently of the §184 owed-fact derivation. It
does not answer which fact is owed, and it is not a §187 semantic axis. It is not a substitute for
the adjudication and must not be scored as one.
