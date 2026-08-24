# L3-2c — the two remaining blockers and the exact next action

## Is L3-3 eligible?

**No.** Two advancement gates fail, and both are the same trade made in the same place: recall bought
with precision by the R3 prompt change. Everything else L3-2c set out to prove is proven.

L3-2 closed with a binder that deleted correct findings through one systemic rule. L3-2b closed with
one high-consequence deletion from a closed vocabulary. **L3-2c closes with the binder deleting
nothing on the L3-2b set and zero high-consequence misses on a fresh sealed holdout — the gate has
moved off the binder entirely and onto the prompt.**

## The two blockers, root-caused, not applied

`ROOT_CAUSE_BEFORE_REMEDIATION`. Both were diagnosed **after** the sealed holdout was opened and are
therefore specified and deliberately **not implemented** in this phase. This is the same refusal
L3-2b made for `H-AM-05`, and it is the only reason the numbers in `STATUS.md` mean anything.

### 1. Four unnecessary clarifications — the R3 prompt overshot

`C-FLD-138`, `C-CS-05`, `C-AM-04`, `C-AM-06`. Recall went 1/3 → 3/3 and precision went 1/1 → 3/7.

The change moved the "impression → INSUFFICIENT_EVIDENCE **with** a clarification" path into the
condition-state ladder and stated it as a **required output shape** for that rung. That is what
lifted recall, and it is also what generalised too far: the model now attaches a question to
candidates it has already classified, including ones that are `ACTIVE` on a hard fact (`C-AM-04`) and
one whose own scenario label is *uncertainty that changes no decision* (`C-AM-06`).

**Recommended fix — bound the requirement to the branch, not to the answer.** The required shape
should fire only where the ladder actually lands on `INSUFFICIENT_EVIDENCE`; a candidate that reaches
`ACTIVE`, `CONTROLLED`, `CORRECTED`, `NEGATED`, `HYPOTHETICAL` or `REMOVED_FROM_SERVICE` has by
definition had its decision made and must carry `clarification: null`. State that as a prohibition
next to the required shape, where the model is already reading. Then consider enforcing it
deterministically: a clarification on a candidate whose state is not `INSUFFICIENT_EVIDENCE` or
`UNKNOWN` is structurally noise and the binder can drop it without touching the hazard — a strictly
smaller change than editing prose and re-measuring. Fixtures: `C-AM-04` must stay `ACTIVE` **without**
a question while `C-AM-02` must stay `INSUFFICIENT_EVIDENCE` **with** one.

### 2. `H-NG-02` — a new high-consequence regression, provider stage

> There was **no** standing water anywhere on the shop floor, **and** the flexible cord feeding the
> pedestal fan has its outer jacket worn through to the conductors.

L3-2b's model returned `electrical / ACTIVE` with a correct span. Under the L3-2c prompt it returns
`NO_HAZARD_ESTABLISHED` with **zero candidates** — reproducible across three runs, and the same shape
appears on the fresh holdout as `C-NG-05` (contrastive `however` after a negation) and contributed to
`C-AM-06`.

The lengthened `INSUFFICIENT_EVIDENCE` rung sits directly above `ACTIVE`'s and now carries the
longest block of text in the ladder. **A prompt is a ranking, and this phase raised one rung without
re-measuring the one below it.**

**Recommended fix:** keep the required output shape but move its body **out** of the ordered ladder
into a short paragraph the ladder points at, so the `ACTIVE` rung regains its position, and re-assert
the existing "Do NOT retreat to INSUFFICIENT_EVIDENCE when the observation plainly describes a
missing control" immediately after it. Fixtures: `H-NG-02`, `H-NG-03`, `C-NG-05` must all return an
`ACTIVE` candidate while `H-AM-01` must still return a carrier candidate with a clarification.

Note that fixes 1 and 2 pull in the same direction — both reduce the `INSUFFICIENT_EVIDENCE` rung's
pull — so they should be made and measured **together**, and recall re-measured alongside, or the
swing simply reverses.

## Defects found but out of scope, carried forward

| id | defect | status |
|---|---|---|
| `L3-2C-DISC-03` | `HAZARD_NEGATION_OBJECTS` matches `hazard` inside "without **hazard** warning labels", where it is a modifier and `warning labels` is the head. Cost **4 correct HazCom findings** on the fresh holdout | root-caused, unfixed — found after the holdout was opened |
| `L3-2C-DISC-04` | `CORRECTION_TOKENS` contains `applied`, so "**no** LOTO **is applied**" reads as a correction | root-caused, unfixed |
| `L3-2C-DISC-02` | **no check owns** "ACTIVE contradicted by control-in-place evidence". The retired gate refused it by the accident of an absent factual word | root-caused, unfixed — a fourth remediation area |

`DISC-03` and `DISC-04` are the **fifth and sixth instances** of the pattern this programme has now
named four times: a closed vocabulary consulted without regard to the **syntactic role** of the
match. R1 fixed the polarity of one gate; it did not fix the other gates that share the shape. A
future slice should apply the same structural treatment to `checkContradiction` and
`checkStateSupported` rather than pruning three more word lists.

## Holdout status

`holdout-l32c.json`, sha256
`33c69b36a7efd9ed4e2e79d2f1b1b29472e7bc6a85dd4feefc5bcef5608f56e2`, **has now been opened and is
retired for gate use.** It remains valid as a development set.

An L3-2d acceptance run needs a fourth sealed set. Its independent portion can be drawn from the same
200-scenario field dataset using a third deterministic stride — L3-2b used `i % 5 === 0`, L3-2c used
`i % 5 === 2`, and **120 of the 200 remain unused**, so `i % 5 === 4` keeps that source usable
without reusing a single opened scenario. The authored complement is still owed from someone not
implementing.

## Other unresolved limitations, carried forward

* **Production provider selection is still OPEN** — unchanged from L3-2 and L3-2b; it needs a
  credential for at least two hosted candidates so the selection procedure's step 2 can run.
* **The complement is still authored by the implementer.** Both independent sources remain entirely
  positive hazards: they contain no negative control, no corrected state, no subjective wording and
  no clarification case, so **every precision number in L3-2b and L3-2c rests on scenarios the
  implementer wrote.** Two phases have now carried this forward unclosed.
* **The selected model is coding-tuned**, single-host, no SLA. P-10 and P-12 remain unmet.
* **Family accuracy costs findings at the shipped tier** (49 → 45 on the fresh holdout), driven by
  the four `DISC-03` deletions rather than by mislabelling.

## Exact recommended next action

> **Open L3-2d — a prompt-precision slice that applies the two fixes above together and nothing else,
> re-runs the offline suites, the regression suites and the customer-invariance matrix, and is
> accepted against a NEWLY SEALED holdout built with a third deterministic stride (`i % 5 === 4`)
> over the unused 120 field scenarios plus a fresh complement. Do not begin L3-3 until L3-2d closes
> with zero unnecessary clarifications, clarification recall at or above 2 of 3, zero
> high-consequence misses on the fresh set, and `H-NG-02` recovered on the L3-2b regression set.**

Both fixes are in one file and neither touches the binder, the validator or the negation and
impression scope engines, all of which this phase measured green. If they hold, nothing measured in
L3-2, L3-2b or L3-2c stands between the observation-interpretation stage and L3-3 except the three
recorded `DISC` defects, none of which is high-consequence.
