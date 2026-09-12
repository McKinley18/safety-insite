# §210E — FINAL RESIDUAL FIRST-PASS REMEDIATION

**`EXPERT_HAZLENZ_FINAL_RESIDUAL_FIRST_PASS_REMEDIATION_IMPLEMENTED — MINIMAL_HOSTED_CONFIRMATION_REQUIRED`**

Provider calls: **0**. Database operations: **0**. No customer or production activation. No commit,
push, tag or deploy. D1–D5 not rerun. §210D evidence and the frozen §210D preregistration
(`55510f9c…`) untouched. Pinned v15 source still `bfe564c2…`.

---

## 1. The instruction change

One appended block on top of §210C, built the way §210C was built on §210B-2: inserted before the
same unique closing anchor, reversible byte for byte. **Neither `expert-first-pass-instruction-210b2.ts`
nor `expert-first-pass-instruction-210c.ts` is edited**, so their identities and suites are untouched.

| | |
|---|---|
| Module | `backend/scripts/lib/expert-first-pass-instruction-210e.ts` |
| Version | `hazlenz.expert.first-pass-instruction.210e-R4-R7` |
| Base | `hazlenz.expert.first-pass-instruction.210c-R1-R3` (`b243c323…`, the exact prompt §210D tested) |
| Plain identity | **`874d26d4d036ca419dd0ffaee2a43f89ecec26f6b6bfba93e7a423a10658d831`** |
| Governed identity | **`e6794aaf894df3dbc186ce38d0c16b2fc69e6a0fa758c1a110ac1e640d7e7c2f`** |
| Prose removed | none |

Four gates, numbered **GATE 8–11**, continuing §210C's GATE 1–3 without collision in either variant.

**GATE 8 (R4) — the property is the state, not the process that would establish it.** Names the
process vocabulary — checked, inspected, tested, measured, verified, confirmed, documented, recorded,
available, seen earlier — and says in terms that joining one to the state with "and" does not make it
the state, which is exactly what D1 did. The rule is a counterfactual, not a word list: *picture the
state exactly as it should be, with nobody having measured or written it down; is your property still
unsatisfied there?* Evidence and history are explicitly left where they belong, in
`notEstablishedBecause` and the copied span.

**GATE 9 (R5) — a BLOCKING question must name the entry it settles.** Requires the id written into
`answersUnresolvedFactDeclarationId`, authored by the model, with the two permitted resolutions:
write the missing entry, or stop marking the question BLOCKING. Nothing infers the binding
deterministically.

**GATE 10 (R6) — a positive decision clears its own fact, not the work.** Conditioned on a sibling
entry actually being open. Offers semantic alternatives rather than a form of words, because the
authorization requires semantic containment and not exact wording.

**GATE 11 (R7) — every branch and every decision must say something.** Names the filler vocabulary
and states that filler is worse than an obvious gap because it looks complete. Fails closed without
discarding the uncertainty.

No §210D vocabulary appears: the suite asserts the absence of press, light curtain, ladle, drilling,
heading, vent duct and the rest, and asserts the rules are stated over the contract's own field names.

### The two narrowings, which are the point

Both fixes could have become the next defect, so both are narrowed on the record and asserted:

- **R4** would be wrong as an absolute ban, because sometimes performing an act *is* the owed
  property. The same counterfactual separates the two cases, which a word list cannot: where the act
  itself is owed, the property is genuinely still unsatisfied in the pictured world.
- **R6** would over-restrain as an absolute, because where a declaration is the only thing in the way,
  authorizing the work is the correct answer. The containment is owed to an open sibling, not to
  caution in general.

## 2. The contract change (R7's deterministic half)

D2's `decisionIfA: "unused"`, `branchB: "placeholder"`, `decisionIfB: "placeholder"` passed **every**
existing structural check: the four fields were non-blank, and neither the branches nor the decisions
were identical *to each other*. That is a contract defect, not only an instruction gap.

Added: refusal code **`NON_SEMANTIC_PLACEHOLDER_VALUE`** in
`expert-first-pass-owed-fact-projection.ts`, and the same code added to
`CONTRACT_INCOMPLETENESS_CODES` so RR-7 **preserves** the identified property rather than discarding
it with the empty shape.

This **refuses**; it never repairs. Nothing composes a replacement value or guesses what the model
meant. The detector is deliberately conservative: it matches a field whose **entire** content is
filler after trimming surrounding punctuation, never a substring. "The valve is in an unknown
position" is a real branch and is not flagged; a bare "unknown" is.

End to end, against the exact shape D2 produced: the declaration is refused, the three filler fields
are named in the refusal detail, the row fails closed, and the identified property survives as a
record that is inadmissible, may never be settled and may never close the analysis. A complete
declaration is still admitted, so the check is not a new reason to withhold.

## 3. Static-token delta — measured

| | Plain | Governed |
|---|---:|---:|
| Characters before | 49,130 | 50,467 |
| Characters after | 52,409 | 53,746 |
| **Added characters** | **+3,279** | **+3,279** |
| **Estimated added tokens** | **~+1,149** | **~+1,149** |

Estimated from the §208 ratio of 69,968 body bytes to 24,512 input tokens. A derived estimate from
real cohort data, **not a tokenizer result**.

For scale: §210B-2 added 3,482 characters, §210C added 2,858. The §210E block was drafted at 3,903
and **tightened to 3,279** to honour the smallest-amendment constraint, without dropping either
narrowing. Cumulative first-pass prompt is now 52,443 bytes, roughly 18,361 tokens estimated.

Projected effect on a future run: about **+1,149 input tokens per call**, roughly **+0.0023 USD per
call**, or **+0.009 USD across four calls**.

## 4. Local fixture results

Nine fixtures in `backend/scripts/lib/section-210e-final-fixtures.ts`, covering the nine required
distinctions. **Four are overcorrection counter-controls**, which is what stops this slice becoming
the next defect.

| Fixture | Targets | Intent | Gate |
|---|---|---|---|
| `FX-R4-A-STATE-TRUE-BUT-UNMEASURED` | R4 | prevent defect | GATE 8 |
| `FX-R4-B-PROCESS-ITSELF-IS-THE-PROPERTY` | R4 | **counter-control** | GATE 8 |
| `FX-R5-A-BLOCKING-QUESTION-CORRECTLY-BOUND` | R5 | **counter-control** | GATE 9 |
| `FX-R5-B-BLOCKING-QUESTION-WITHOUT-DECLARATION` | R5 | prevent defect | GATE 9 |
| `FX-R6-A-TWO-FACTS-POSITIVE-A-STAYS-LOCAL` | R6 | prevent defect | GATE 10 |
| `FX-R6-B-SINGLE-FACT-POSITIVE-A-MAY-AUTHORIZE` | R6 | **counter-control** | GATE 10 |
| `FX-R7-A-PLACEHOLDER-BRANCH` | R7 | prevent defect | GATE 11 |
| `FX-R7-B-PLACEHOLDER-DECISION` | R7 | prevent defect | GATE 11 |
| `FX-R7-C-COMPLETE-BRANCHES-AND-DECISIONS` | R7 | **counter-control** | GATE 11 |

None replays D1–D5 and none uses their vocabulary; the fixture lib refuses any scenario that does, or
that labels its own answer.

**`test-210e-final-remediation.ts` — 103 passed, 0 failed.**

These are frozen expectations, not results. No fixture here can pass or fail on model behaviour.
R7's deterministic half is exercised against hand-written declaration objects, which tests the
**check**, not the model. **A semantic PASS may only be claimed from a hosted run.**

## 5. Protected regression — exact counts

| Suite | Result |
|---|---|
| §205 remediation | **92 passed, 0 failed** |
| §207 preregistration | **144 passed, 0 failed** |
| §209 batch recorder | **116 passed, 0 failed** |
| §210B-1 structural | **55 passed, 0 failed** |
| §210B-2 semantic | **36 passed, 0 failed** |
| §210C residual | **92 passed, 0 failed** |
| §210E final (new) | **103 passed, 0 failed** |
| **Total** | **638 passed, 0 failed** |

§205 is included deliberately: it owns the RR-7 preservation contract that the R7 refusal code was
added to, so it is the suite most exposed to that change.

Two independent construction checks confirm nothing frozen moved. The §210D preregistration builder
still reproduces **`55510f9c…`** exactly, and the §210B-3 preflight still reports all eight stimuli
byte-identical with instruction identities `55d10ae6…` and `994b378e…`.

## 6. Executor defect

**EXECUTOR_DEFECT_1** is preserved additively in
`../expert-hazlenz-210d-hosted-confirmation-2026-09-09/EXECUTOR-DEFECT-REGISTER-210D.md`, with both
the original and corrected derived views kept.

Corrected in code: `execute-210d-confirmation.ts` **and** `execute-210b3b-uncached-probe.ts`, which
carried the same defect, now read the back-reference through
`CLARIFICATION_DECLARATION_BACKREF_FIELD` imported from the contract module rather than a retyped
literal, so a rename cannot silently reintroduce it.

**Regression test added.** The §210E suite asserts that no executor's *code* contains the wrong name
— it survives only in comments recording the defect — that both use the contract constant, that the
canonical field really is `answersUnresolvedFactDeclarationId`, and that the re-projector preserves
the original and refuses to run without it.

No historical raw provider evidence was rewritten. **The §210B-3B adjudication did not probe this
binding, so no §210B-3B verdict depends on it and none changes.**

## 7. Expected effect on R4–R7, and what would falsify it

Stated as expectations. Nothing here has been tested against a model.

**R4 — expected to fix D1's conjoined proxy.** The risk is the counter-control case: a model that
now refuses to name an act even where performing it is what is owed. `FX-R4-B` is the local guard,
and case A of the hosted confirmation is the real one.

**R5 — expected to fix D2's unbound BLOCKING question.** The risk is evasion rather than compliance:
a model that stops marking anything BLOCKING to avoid owing a binding. That is why `FX-R5-A` exists
and why the confirmation must check that BLOCKING is still used where it belongs.

**R6 — expected to fix D4's unqualified continuation.** The risk is hedging everything, including
single-fact cases where authorizing the work is correct. `FX-R6-B` guards it locally.

**R7 — expected to make D2's shape impossible to admit.** The instruction half discourages it and the
contract half refuses it. The risk is over-refusal of real content, which is why the detector matches
whole fields only and why `FX-R7-C` exists.

**The interaction to watch.** §210C's GATE 2 pushes toward emitting and GATE 3 toward deleting; §210E
adds GATE 8 pushing toward narrower properties and GATE 11 toward withholding incomplete entries.
Four opposed pressures now act on the same entry. The §210D result showed the first pair balanced
correctly, and nothing here rebalances it — but that is an expectation, not a measurement.

## 8. Recommended minimal hosted confirmation

Four cases, not another cohort. D1–D5 are spent and must not be rerun.

| Case | Target | Shape |
|---|---|---|
| **E1** | R4 property purity | one owed property with a tempting evidence/history framing available, where the state and the record clearly come apart |
| **E2** | R5 binding + R7 branch semantics | a fact that naturally invites a BLOCKING question, adjudicated on both the authored binding and whether all four branch/decision fields carry real content |
| **E3** | R6 fact-local containment | two independent current-action facts, adjudicated on whether each positive decision stays local |
| **E4** | protected control | one case where performing an act IS the owed property AND it is the only open fact, so a correct answer must both name the act and authorize the work unqualified |

**E4 is the load-bearing one.** It is the single case that fails if either narrowing was lost: a
model that over-applies R4 will not name the act, and one that over-applies R6 will hedge a decision
that needs no hedge. Axes should be A, B, C, D, plus property-reasoning consistency, binding, and
fact-local containment. No governed evidence, no verifier call.

Preregister and freeze before execution, as §210D was. Projected cost from §210D's measured
economics plus the §210E delta: about **26,150 input and 2,500 output tokens per call**, roughly
**0.077 USD per call** and **0.31 USD for four**, uncached per TBR-20. A ceiling of **0.45 USD**
leaves headroom for all four at the full output allowance.

## STOP

Local implementation, tests, the executor fix and the confirmation recommendation are complete. No
provider call was made. No case was rerun. Nothing was remediated beyond the three named §210D
mechanisms and the one contract defect. No verifier testing was started.

**S6 remains NOT_EXERCISED.** Nothing in §210D or §210E bears on it, and governed evidence stays in
the separate governed stage.
