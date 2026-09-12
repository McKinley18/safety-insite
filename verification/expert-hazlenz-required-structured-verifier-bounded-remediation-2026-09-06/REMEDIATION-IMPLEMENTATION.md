# §191 — Bounded REQUIRED verifier remediation

**2026-09-06 · development slice · implementation and deterministic verification only**

```
PROVIDER_CALLS                 = 0
DATABASE_OPERATIONS            = 0
PRODUCTION/CUSTOMER ACTIVATION = NONE
HOSTED EXECUTION               = NONE
COMMIT / PUSH / TAG / DEPLOY   = NOT PERFORMED
DETERMINISTIC PROOF SUITE      = 69 / 69 PASS
SOURCE INTEGRITY GATE          = PASS 21 / 21
PROVIDER_SETTLEMENT_AUTHORITY  = NEVER (unchanged)
VERIFIER_V3_VALIDATED          = FALSE
```

## Terminal

```
EXPERT_HAZLENZ_REQUIRED_STRUCTURED_VERIFIER_BOUNDED_REMEDIATION_COMPLETE —
FRESH_PROSPECTIVE_VALIDATION_AUTHORIZATION_REQUIRED
```

The three authorized repairs are implemented, every one maps to recorded evidence, and the whole
proof suite passes. **This does not validate verifier-v3 or v3.1.** No hosted execution was
performed and none is authorized; behavioural efficacy is unestablished.

---

## The one structural decision, and why it went this way

The authorization says to change "verifier-v3". **The changes ship as v3.1, a new prospective
protocol, and v3 is left byte-unchanged.**

Editing v3 in place would have detached the fifteen §187B behavioural executions from the protocol
that produced them. They are attached to v3 at system-prompt sha256 `678160c9…` and schema sha256
`1bddc1a5…`; the §187A preregistration pins both, and the §188 and §190 source-integrity gates assert
them and currently record PASS. An in-place edit would have falsified two evidence packages and
broken the link between fifteen results and their protocol — which the authorization separately
forbids under "do not modify frozen §187–§190 evidence".

It is also the repository's own convention, stated in v3's header: *"v1 and v2 are left
BYTE-UNCHANGED. They are the instructions §156, §157, §158 and §163 were executed under, and those
results stay attached to the exact protocol that produced them."* v3 now joins them.

**Consequence to carry forward: v3 and v3.1 results are not one population and must never be
combined into one score.** The terminal calls for fresh prospective validation precisely because
v3.1 has no behavioural evidence of its own.

## Built by construction, not retyped

v3.1's prompt is **v3's own line array** with two blocks inserted at named anchors, and its schema is
a **structural clone** of v3's with exactly three descriptions replaced. The module refuses to load
if an anchor is missing or ambiguous, or if a description's recorded "before" text does not match
what v3 actually says.

So every unchanged line and every unchanged field is byte-identical to v3 **as a property of the
code**, not as a claim about it. The proof suite's strongest assertion follows directly: removing the
two inserted blocks from v3.1 reproduces v3 byte-identically — `678160c95bc7` on both sides.

---

## The three repairs

| # | repair | evidence class | evidence | tests |
|---|---|---|---|---|
| 1 | three schema field descriptions | **MECHANICAL** | §188 — the schema permits the refused state and its own descriptions license it | A |
| 2 | conjunctive sufficiency block, step 3 | **MODEL_DIAGNOSTIC** | §190 — HR-08 ×3 sufficiency FAIL on a conjunctive owed fact | B |
| 3 | adjacent-property boundary block, step 2 | **MODEL_DIAGNOSTIC** | §190 — HR-04 ×3 category C, substitution = 3 against a gate of 0 | C |

Details in `CONTRACT-DESCRIPTION-REPAIR.md`, `CONJUNCTIVE-SUFFICIENCY-REPAIR.md` and
`ADJACENT-PROPERTY-BOUNDARY.md`. Exact text in `SOURCE-DIFF.md`.

**The evidence classes are kept apart deliberately.** Repair 1 rests on mechanical evidence and
stands on its own. Repairs 2 and 3 rest on **model** adjudication of a 15-execution cohort — the
frozen human semantic gate is still `UNMEASURED` at 65/112. If that instrument is later completed
and disagrees, the basis for repairs 2 and 3 changes with it. The change ledger records the class
per change, and the proof suite asserts it (E.5, E.6).

## What was deliberately not done

- **No fourth declaration member.** §188 identified a missing vocabulary token for *"the first pass's
  question already reaches this fact"* and considered adding one. Not done — it needs its own
  authorization and is one careless step from a token the model could use to say a fact is covered.
  The smaller repair is repair 1c: the `declaration` description now names the **existing** token
  that records that conclusion (`STILL_UNRESOLVED`).
- **No JSON-Schema conditionals.** Provider enforcement of `if`/`then` is unverified in this
  repository and verifying it costs provider calls.
- **No change to the admission validator.** It stays the hard, fail-closed deterministic guard. It
  worked at §187B: both illegal outputs were refused whole and no fact moved.
- **No normalization of the illegal state**, which would destroy the evidence that a binding was
  asserted. No partial admission.
- **No settlement-authority change.** `PROVIDER_SETTLEMENT_AUTHORITY = NEVER`, unchanged.
- **No clarification-frequency instruction.** `CLARIFICATION_POLICY` is `INCONCLUSIVE` on the §187
  evidence — only three unconditional proposal opportunities existed, all on one row. Nothing in
  v3.1 tells the verifier to ask more, to prefer clarification, or to ask when unsure. Test D.6
  asserts this against eight frequency-directive patterns. The repairs change **when a question
  counts as sufficient** and **whether evidence establishes the owed property**; any frequency
  effect is a consequence of judging those correctly, never an instruction to produce one.
- **No first-pass prompt change.** §190 found the insufficient HR-08 question was authored by the
  first pass, not the verifier. That is a separate remediation target and is out of scope here.

## Preservation

§190 found HR-01, HR-06 and HR-09 at 3/3 preserved. The risk in this remediation was never that it
does too little — it is that a globally more conservative verifier starts replacing
already-sufficient first-pass questions on exactly those rows.

Section D of the proof suite is aimed at that. Nine named passages that carried the good behaviour
are asserted byte-identical in both versions, including HR-06's decisive one — the unseen-control
heuristic — plus step 3's existing sufficiency test, the "usually no" nomination prior, the
"no expected number of questions" closing, both magnitude exclusions, and the settlement-authority
restriction.

**What this does not prove.** That v3.1 actually behaves better, or that it does not over-trigger on
the three good rows. An instruction change is a change to a string; whether that string produces
better judgement is a behavioural question and only a fresh prospective hosted cohort can answer it.
The proof suite says so in its own output.

---

## Files changed

```
NEW  backend/scripts/lib/expert-verifier-instruction-v3-1.ts        the remediated protocol
NEW  backend/scripts/test-expert-verifier-v3-1-remediation.ts       69 assertions, sections A–E
NEW  backend/scripts/verify-191-source-integrity-2026-09-06.ts      the §191 gate
```

**No existing runtime file was modified.** v3, the admission validator, the owed-fact ledger, the
first-pass prompt, the formal scorers and every §187–§190 evidence artifact are byte-unchanged, and
`SOURCE-INTEGRITY.txt` records the recomputed hashes proving it.

## Identity

```
v3    prompt 678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88   UNCHANGED
v3    schema 1bddc1a51fb2d1cad43a7444a45728a6ca10296d448183fd2d3af60f02ca662a   UNCHANGED
v3.1  prompt 7e73d175162320db8f4d93c9b1094fdadc1e4028b61fd95f586ca9a31bb2fb2c   NEW
v3.1  schema d39c86bc2755451fd27bdba34cba82c2bfee5b090134a40d1622e25d199bde65   NEW
v3.1  version hazlenz.expert.verifier-instruction.v3.1
```

## Evidence state, unchanged by §191

```
MECHANICAL CONTRACT GATE     FAILED       (§187B — 2 contract-invalid executions)
FROZEN HUMAN SEMANTIC GATE   UNMEASURED   (§189 — 65/112, not completed by a human)
MODEL SEMANTIC ADJUDICATION  9/15 FAIL    (§190 — diagnostic only)
```

Historical terminals are immutable and were not rewritten.

## What is required next

A **fresh prospective hosted validation** of v3.1 against a cohort, under its own authorization and
its own preregistration. Until then v3.1 is a development protocol with no behavioural evidence.

Two things that authorization should settle, because §191 could not: whether the cohort creates
enough unconditional clarification-proposal opportunities to move `CLARIFICATION_POLICY` off
`INCONCLUSIVE`, and whether it includes the HR-01/HR-06/HR-09 shapes so over-triggering would be
detected rather than assumed absent.
