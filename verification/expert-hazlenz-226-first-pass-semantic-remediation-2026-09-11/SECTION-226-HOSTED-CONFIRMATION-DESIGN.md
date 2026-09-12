# §226 — FINAL BOUNDED HOSTED CONFIRMATION DESIGN

**DESIGNED, NOT EXECUTED. NOT AUTHORIZED.** Provider calls made by §226: **0**.

This document is the design only. Nothing here may be run without a product-owner authorization, and
the case texts it calls for are not authored here — they are authored, preflighted and frozen in the
authorized slice, before the first call.

---

## The question this answers, and the question it does not

§225 already established causality and directionality on a paired instrument: the instruction is the
only variable that moved, recall went 4/7 to 6/7 and property identity 1/7 to 3/7. **That work does
not need repeating, and this design deliberately does not repeat it.**

**The only open question is:**

> Does the current successor satisfy the required capability?

So this is a **single-arm absolute confirmation**. There is no predecessor leg, no paired
comparison, and no difference measure. Every gate is absolute on the §226 arm.

**What it cannot answer.** A single-arm run cannot attribute a result to the §226 blocks rather than
to the case authoring. That limit is stated here, before any spend, and is not mitigated away. It is
accepted because §225 has already established attribution and the remaining question is capability,
not causality.

---

## Shape

| | |
|---|---|
| cases | **8** |
| arms | **1** — the §226 successor contract only |
| calls | **8**, one per case, plus **2** contingency |
| contingency policy | a contingency call is spent ONLY on a transport or HTTP failure with no usable response. **Never** on a semantically disappointing answer. A rerun for semantic preference is a protocol violation and ends the run. |
| model | `claude-sonnet-5`, the §225 model, unchanged |
| caching | **DISABLED.** No `cache_control` constructed anywhere. |
| instruction | `EXPERT_FIRST_PASS_226_SYSTEM_PROMPT`, identity pinned in the frozen protocol |
| wire schema | the §210J schema, unchanged through §224 and §226, identity pinned per case |
| assembly | `expert-221-assembly.ts`, the one assembly path, so the bytes inspected before the freeze are the bytes transmitted after it |
| database operations | **0** |

### Spend

Measured from the §225 call ledger: the eight remediated-arm calls cost USD 0.67723, a mean of
**USD 0.08465** and a maximum of **USD 0.09161** per call. §226 adds about 114 lines of instruction,
so input tokens rise modestly.

| | |
|---|---|
| projected, 8 calls at USD 0.090 | **USD 0.72** |
| hard ceiling, 10 calls at USD 0.110 | **USD 1.10** |

The ceiling is a stop, not a budget. If it is reached the run stops and reports, and per
`HAZLENZ_INVARIANTS` 29 a collision between a frozen instrument and a spend ceiling is resolved by
the product owner raising the ceiling, never by cutting coverage or changing the semantic request
contract.

---

## Case coverage

Eight cases, one per required shape. **All eight fresh** — no case may be derived from, or a
restatement of, §225 H1–H8, §224 C1–C10, §226 L1–L10, or §221 IG1–IG12.

| # | shape | what it tests | primary gate |
|---|---|---|---|
| K1 | **candidate-state bypass** | an owed property sitting under a candidate the model has every invitation to assert `ACTIVE` or `CONTROLLED` | G1 |
| K2 | **underlying state vs control-state proxy** | a working, audible, visible control standing between the model and the condition | G2 |
| K3 | **underlying state vs verification act** | a condition whose obvious question is whether anyone has checked it | G2 |
| K4 | **legitimate required act** | the act IS the governing requirement; must not be over-corrected into a condition | G5 |
| K5 | **legitimate required artifact** | the existence or currency of a record IS the statutory precondition; must not be undercut to the act it records | G6 |
| K6 | **two independent unresolved properties** | both genuinely open on the supplied facts, neither entailed by the other, and the work activity invites joining them | G3 |
| K7 | **safe or negated restraint** | an established-safe condition that must not be manufactured into a hazard | G4 |
| K8 | **ordinary non-decision-critical restraint** | a real unknown that bears on nothing decided today | G4 |

K1 and K2 additionally exercise G2 and G1 respectively wherever the output gives them a genuine
opportunity to fail. **Every measure a case genuinely exercises must carry a judgment slot.** That is
the §221 D1 gate-coverage defect and the §224 expectation-table defect, and it is closed in the
instrument, not in a later report.

### Case authoring discipline

Each case is authored with the same enumeration the §226 local instrument uses, and the enumeration
is frozen with it:

- **established facts** — what the supplied observation actually states;
- **genuinely unresolved properties** — each with the reason it is open on the supplied facts;
- **non-facts** — real unknowns that bear on nothing decided today;
- **prohibited adjacent and proxy properties**, each annotated with its kind;
- **expected declaration count**;
- **the exact controlling property or properties**;
- **whether required-act or required-artifact semantics apply**;
- **the decision under analysis**, in one sentence.

---

## Truth-consistency preflight, before the freeze

The same machine-checkable preflight the §226 local instrument passed, applied to the hosted cases.
**Every case must pass before the protocol is frozen, and the protocol is frozen before the first
call.** A failure repairs the case, not the check.

| check | what it refuses |
|---|---|
| P1 | an owed property that is simultaneously stated as established by its own observation — the §225 H5-P2 error |
| P1b | an owed property with no stated reason it is genuinely open |
| P2 | an expected declaration count that disagrees with the enumerated unresolved properties |
| P2b | expected controlling-property keys that disagree with the owed set |
| P3 | any scored axis left unpreregistered on any case |
| P4 / P4b | the same property appearing twice under different wording, or a near neighbour that is the owed property reworded |
| P5 | a restraint case that owes something, or an owing case that also claims a restraint basis |
| P6 | a kind outside the closed owed and prohibited sets |
| P7 | required-act or required-artifact flags that disagree with the owed kinds |
| P8 | a non-fact that is also an established fact or an owed property |
| P9 | a case whose declared coverage disagrees with its own enumeration |
| P11 | an owed proposition that does not classify as itself against its own near neighbours |
| P13 | a missing legitimate-act or legitimate-artifact over-correction guard |
| P14 | duplicate case identifiers |

Plus the protocol checks §225 ran and that remain necessary here: instruction and schema identities
pinned, one assembly path, caching disabled, no pre-existing evidence file, API key resolved, call
count within ceiling, and **the single-arm design recorded explicitly** so no reader mistakes it for
a paired run.

---

## Hard gates

**Absolute, on the §226 arm. Pass/fail at the stated occurrence.**

| gate | requirement |
|---|---|
| G1 | decision-critical declaration recall **100%** |
| G2 | exact controlling-property identity **100%** |
| G3 | independent property preservation **100%** |
| G4 | false decision-critical declarations on a restraint case **0** |
| G5 | required-act over-corrections **0** |
| G6 | required-artifact over-corrections **0** |
| G7 | candidate-state bypasses **0** |

**NO AGGREGATE COMPENSATION.** No headline accuracy figure is computed. No gate may be offset by
another gate, by an aggregate score, or by the size of the improvement over §224 or §225
(`HAZLENZ_INVARIANTS` 22). A gate with no genuine opportunity to fail on any case is recorded
`NOT_EXERCISED`, which is never `CORRECT` and never a pass (invariant 23). An `AMBIGUOUS` judgment on
a hard gate means the gate cannot pass from that judgment and may not be resolved after the fact
(invariant 24).

Judgments that are close are marked **BORDERLINE** in the scored results and flagged for
re-adjudication, as §225 did with H1 and H6. A borderline judgment does not change a gate outcome by
itself.

A structural, contract or tooling failure is recorded as such and is **never** converted into a
semantic verdict about the model (invariant 25).

---

## What happens after

**If every gate passes:** report, and return to the product owner. Integrated revalidation remains
unauthorized, and a passing confirmation is not an authorization to run one.

**If any gate materially fails on exact property selection or declaration recall:** the §226 stop
rule applies and is not discretionary.

> DO NOT start §227-style prompt tuning.

Report instead that the current provider plus first-pass prompting approach has reached a
demonstrated capability limit, and return to the product owner for a decision among materially
different approaches. Three consecutive bounded instruction slices — §224 authored, §225 measured,
§226 authored — will have acted on three separately diagnosed mechanisms, and a fourth would be
evidence about the method rather than about the contract.
