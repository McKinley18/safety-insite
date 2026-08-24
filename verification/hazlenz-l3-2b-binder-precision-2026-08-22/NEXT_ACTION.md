# L3-2b — remaining blockers and the exact next action

## Is L3-3 eligible?

**Architecturally yes. On quality, still no — but the gap is now small, specific and bounded.**

L3-2 closed with the binder deleting correct findings across three scenarios through one systemic
rule. L3-2b closes with **one** high-consequence deletion and **one** benign non-high-consequence
deletion, both traceable to the same residual pattern: a closed vocabulary list used as a gate.

## The remaining blockers, root-caused, not applied

`ROOT_CAUSE_BEFORE_REMEDIATION`. All three were diagnosed after the holdout was opened and are
therefore **specified but deliberately not implemented** in this phase.

### 1. `H-AM-05` — the hard-gate failure

> The mezzanine gate did not look right to me and the lower hinge pin **is sheared off** with the
> gate hanging on the top hinge alone.

`checkSubjectiveImpression` rescues an ACTIVE claim when an unhedged **factual condition token** is
present. `FACTUAL_CONDITION_TOKENS` has 30 entries and none of them is `sheared`, so the sentence read
as pure impression and a correct high-consequence finding was deleted.

**This is the third time in two phases that a closed vocabulary list has produced a false rejection**
(L3-2: control-in-place; L3-2b development: family relevance; L3-2b holdout: factual condition).
The pattern is now established well enough to stop treating each instance as its own bug.

**Recommended fix — change the polarity of the test, do not extend the list.** Rather than asking
"does a known factual word appear", ask "is the sentence *only* an impression". A sentence that names
a specific component and predicates something of it is factual whether or not the predicate is on a
list. Concretely: treat the claim as factual unless the hedge governs the **entire** predication, and
keep the vocabulary list only as a fast positive path. Fixture: `H-AM-05` must pass while `H-AM-02`
("one of the sling legs **may be** cut") must keep failing — those two sentences are the precision
and recall poles of the same rule.

### 2. `H-FLD-141` — bare `and` does not end negation scope

> …; no LOTO is applied **and** the guard is missing.

`negationScopes()` ends scope at a comma whose following segment carries its own predicate, but
applies no such test to a **conjunction without a comma**. `and` sits in `CLAUSE_STARTERS` only as
`and separately`.

**Recommended fix:** apply the existing `hasPredicate()` test at conjunction boundaries as well as at
comma boundaries — `no guardrail and no toeboard` (no predicate, continuation) versus
`no LOTO is applied and the guard is missing` (predicate, new clause). The machinery already exists;
it is one call site.

### 3. Clarification recall — 1 of 3

`H-AM-03` produced a clarification correctly. `H-AM-01` ("the overhead door track struck me as odd")
produced **no candidate at all**, so there was nothing to carry a question. `H-AM-02` asserted ACTIVE
instead of asking.

Precision is perfect (1/1) and there are **zero** unnecessary clarifications, so the prompt work did
not overshoot — the model simply does not reach for the carrier-candidate pattern often enough.

**Recommended fix:** the carrier-candidate instruction is currently one paragraph among several near
the end of the system prompt. Move the "impression → INSUFFICIENT_EVIDENCE **with** a clarification"
path next to the condition-state ladder, where the decision is actually made, and state it as the
required output shape for that branch rather than as advice. Re-measure precision alongside recall so
this does not swing into over-questioning.

## Holdout status

`holdout-l32b.json`, sha256 `e3a3c7eee64703a27a8ac9c5da732f6919d8a35fb76859bfb30729c44f7f5060`,
**has now been opened and is retired for gate use.** It remains valid as a development set.

An L3-2c acceptance run needs a third sealed set. Its independent portion can be drawn from the same
200-scenario field dataset using a different deterministic stride (this phase used every 5th; 160 of
the 200 remain unused), which keeps that source usable without reusing a single opened scenario.

## Other unresolved limitations, carried forward

* **Production provider selection is still OPEN** — unchanged from L3-2; it needs a credential for at
  least two hosted candidates so the selection procedure's step 2 can run.
* **The holdout's complement was authored by the implementer.** Sources A and B are independent, but
  the 29 scenarios covering negative controls, condition states, ambiguity and clarification are not.
  A set authored by someone not implementing is still owed.
* **The selected model is coding-tuned**, single-host, no SLA. P-10 and P-12 remain unmet.
* **Family accuracy costs two findings** at the shipped tier (61 → 59) through advisory-flagged
  mislabelling. Not a safety defect; worth watching.

## Exact recommended next action

> **Open L3-2c — a narrowly scoped slice that applies the three fixes above and nothing else, re-runs
> the offline suites and the customer-invariance matrix, and is accepted against a NEWLY SEALED
> holdout built with a different deterministic stride over the unused 160 field scenarios plus a
> fresh complement. Do not begin L3-3 until L3-2c closes with zero high-consequence misses and
> clarification recall at or above 2 of 3 through the full shipped pipeline.**

The three fixes are small and independent. If they hold, nothing else measured in L3-2 or L3-2b
stands between the observation-interpretation stage and L3-3.
