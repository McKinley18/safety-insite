# DECISION PACKAGE — 14 QUESTIONS, ANSWERED

`L3_G9_GOVERNANCE_AND_REMEDIATION_PLAN_COMPLETE — IMPLEMENTATION_AUTHORIZATION_REQUIRED`
provider calls **0** · API cost **`$0.00`** · no corpus opened · G9 **not amended** · nothing implemented

---

**1. What should G9 protect?**
**The safety decision a customer could act on, plus the decision to ask them a question.** Concretely:
whether a hazard is recognised, whether it is asserted `ACTIVE`, and whether a clarification is raised.
It should **not** protect wording, evidence spans or corrective-action phrasing — **and it already
does not**: G9 compares three fields and no representational one.

**2. Is current G9 too strict, correctly strict, or unresolved?**
**Correctly strict on the evidence, with one narrow unresolved sub-question.** The "too strict"
premise is **refuted by measurement**: `G9-S3` is **empty by construction**, and removing the
provably redundant `hasCandidate` field changes **zero** rows. The single open question is whether
`G9-S2` — surfacing a non-active candidate versus surfacing nothing — is customer-material. **That is
a product-specification question, and the specification does not currently exist.**

**3. How many of the 14 divergences are safety-material?**
**Seven `G9-S1`** (a customer could receive a materially different safety conclusion) · **seven
`G9-S2`** (same safety conclusion, different traceability) · **zero `G9-S3`**.

**4. Can `claude-sonnet-5` satisfy the recommended requirement through the current architecture?**
**No — `ANTHROPIC_CURRENT_PATH_REQUIRES_ARCHITECTURAL_CONTROL`.** Four rows differ on the pure safety
conclusion, and `temperature`/`seed` are unavailable on this path. The current architecture lets a
**single generative call decide the condition state**, so sampling variance lands directly on the
safety decision. This is architectural, not absolute.

**5. Minimum remediation for `RC-1`?**
A **development-only** clarification-calibration experiment on a purpose-built corpus (ambiguity with
and without candidates, `F6`-like undecided states, **negative controls**, high-consequence guards),
**persisting raw provider proposal bodies**, measuring precision, recall on both denominators,
high-consequence recall and false `ACTIVE` **simultaneously**, with **hard vetoes** on any
high-consequence or false-`ACTIVE` regression. Success criteria pre-declared. **No reserved tranche.**

**6. Minimum remediation for `RC-2`?**
A three-arm development experiment testing the invariant **"`ACTIVE` requires affirmative
decision-sufficient evidence; absence of deciding evidence must never become `ACTIVE`"** — control vs
deterministic post-provider state constraint vs clarification-first. **Most likely home: the semantic
binder**, which already owns this judgement (`SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` fired 11 times
across Run 2 but not on these four rows). **Caveat that must be designed around: a binder-only fix is
invisible to `G1`–`G4`**, because the scored tier is the validated tier — proven at 93/93 vs 86/93.
Which tier the contract reads is a **governance** question, named here and left open.

**7. Does `RC-3` require a provider change, or can architecture contain it?**
**Architecture can plausibly contain most of it, and that should be tried first — at `$0`.**
`assertedState` differs on **12 of 14** divergences, so a deterministic state resolver after
generative extraction targets the largest share at **no extra cost or latency**, and is **fully
testable by Tier-2 replay against Run-2's recorded output**. A provider change is the fallback, not
the first move. **Consensus/multi-call is not recommended**: 2–3× cost, cannot reach 100%, hardest to
defend in a safety product.

**8. What evidence is needed before touching `RC-4`?**
A **rate over ≥ 500 development calls** with a confidence interval; whether occurrences **cluster**;
whether they are **provider-specific**; and critically whether the offsets are **systematically** or
**randomly** wrong. **If random, `RC-4` is a facet of `RC-3` and must not be fixed separately.** One
occurrence is not a mandate to redesign the binder.

**9. What testing can now remain `$0`?**
**Tiers 0–2 — and Tier 2 is being under-used.** Run 2's 186 recorded provider evaluations across two
isolated processes make **every downstream change replayable at `$0`**. `RC-2` arm **B** is entirely
testable there before a single new call is bought.

**10. Exact condition for another paid provider cohort?**
A specific remediation implemented; Tiers 0–2 passed including a replay showing the intended movement
and no unintended movement; success criteria and vetoes written **before** the run; **development
corpus only, no reserved tranche.** Bounded at **≤ `$3`** (Tier 3) / **≤ `$15`** (Tier 4).

**11. Exact condition for Run 3?**
All four together: (a) demonstrated material `RC-1` **and** `RC-2` remediation with no veto tripped;
(b) the `RC-3` question **resolved** — architecture measured, or a determinism-capable provider, or a
recorded product-grounds G9 decision; (c) a fresh authored set on an unspent tranche under
`D-I`/`D-D.6`; (d) explicit user authorization naming both identities. **(b) is currently unmet and
is the binding constraint** — without it Run 3 fails G9 on arrival.

**12. Shortest path to production testing?**
`KG5C-DISC-01` → `KG4E-DISC-03` → confirm the log pipeline → name the Stage-1 account and set the four
locks → decide the six governed migrations under authorization → enable **production shadow** with
`customerDefaultMode = LEGACY` unchanged. **Level 3 appears nowhere in that path.**

**13. Is Level 3 currently blocking app completion?**
> ### **NO. It never has been.**
> Level 3 has never been customer-authoritative, `customerDefaultMode` is `LEGACY`, and no customer
> has ever received Level-3 output. **The Run-2 failure is a research result about a candidate
> provider, not a product defect.** It should be explicitly scoped **out** of launch so it cannot
> become an open-ended blocker.

**14. What should be done NEXT?**
> **Declare Level 3 out of launch scope and non-authoritative, then work the Level-1 launch path —
> starting with `KG5C-DISC-01`.**

L3 work, when resumed, in this order and no other: **(i)** write the **G9 product specification** —
what the customer actually sees — because it is the cheapest artifact and it unblocks question 2;
**(ii)** build `RC-2` arm **B** and replay it at **Tier 2, `$0`**, against Run-2's recorded output;
**(iii)** only then consider a bounded Tier-3 development cohort. **Run 3 is not on the near path and
must not be treated as one.**

---

## What this phase did NOT do

G9 was **not amended**. No gate, threshold or denominator changed. Nothing was implemented, tuned or
remediated. `RC-1`–`RC-4` are **not marked repaired**. No provider was called, no credential read, no
corpus opened, no tranche spent. **Run 2 stands verbatim:
`L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9`, `MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL`** —
and no counterfactual in this package alters it.
