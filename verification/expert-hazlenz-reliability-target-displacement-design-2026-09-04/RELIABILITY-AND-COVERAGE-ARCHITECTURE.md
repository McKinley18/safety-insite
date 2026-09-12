# Expert HazLenz — reliability and target-coverage architecture

**§164, 2026-09-04. DESIGN ONLY. Zero provider calls, $0.00. Nothing here is implemented, and no
`src/` file was touched.**

Commissioned by the §163 terminal. §163 measured two failure classes on human-reviewed truth and
proved that repetition cannot fix either. This document designs the minimum bounded architecture that
addresses both, and is explicit about the parts that cannot be settled by design at all.

---

## 0. The one idea this design turns on

The §163 failures look like they need **semantic matching** — did the question the verifier asked mean
the same thing as the fact it owed? Building that matcher is exactly what retired the keyword scorer,
and doing it with a model is self-certification.

**So don't match meaning. Require a declaration, and check the declaration deterministically.**

If HazLenz constructs the set of unresolved facts *before* the verifier runs, gives each a `factKey`,
and requires the verifier to **bind** every clarification to one of those keys — or to nominate a new
fact explicitly *in addition to*, never instead of — then coverage becomes a **closed-set membership
check over declarations**, which is deterministic. The residual semantic question shrinks from "does
this text mean that fact?" to "was this declaration truthful?", which is a bounded human sampling
question rather than a scorer.

This is the same discipline the first-pass contract already uses for candidate linkage. It is not new
machinery; it is the existing machinery applied one layer up.

**What it would have done to §163:** on HS-A1 the verifier could not have replaced the flame-failure
fact with the auger fact. It would have had to bind to the flame-failure key, or declare that key
not-decision-critical with a two-branch proof, or nominate the auger fact **alongside** it. All three
outcomes are observable. Silent displacement — the actual §163 failure — becomes structurally
impossible.

---

## 1. Semantic outcome taxonomy — `hazlenz.expert.verifier.semantic-outcome.v2`

**PROSPECTIVE ONLY. §163 is not rescored and remains immutable under `semantic-outcome.v1`.**

Defined here as a specification, deliberately **not** as executable code, because this operation is
design-only.

| member | definition | owed-target recall | clarification precision |
|---|---|---|---|
| `TARGET_REACHED` | the owed human-reviewed fact is addressed with an acceptable semantic equivalent | **PASS** | pass |
| `VALID_BUT_TARGET_DISPLACED` | the owed target is not addressed, but the emitted clarification independently appears capable of changing a current safety / regulatory / control decision | **MISS** | **NOT a defect** |
| `INVALID_WRONG_FACT` | the emitted question reaches neither the owed target nor an independently decision-critical, necessary-now fact | **MISS** | **defect** |
| `SETTLED_SILENCE` | no clarification emitted where a human-reviewed owed fact exists | **MISS** | defect |
| `WRONG_AFFECTED_DECISION` | the owed fact is reached but labelled with the wrong decision class | MISS | defect |
| `BOUNDARY_REJECTION` | contract refused the verdict on admission grounds | *not scoreable* | execution |
| `CONTRACT_INVALID` | truncation or malformed output; the verdict could not be admitted | *not scoreable* | execution |
| `DEGENERATE_OUTPUT` | the degenerate detector fired | *not scoreable* | execution |
| `TRANSPORT_FAILURE` | no usable response | *not scoreable* | execution |

**Two rules that must not be collapsed.**

1. `VALID_BUT_TARGET_DISPLACED` is a **recall miss and not a precision defect.** It must never be
   netted against `TARGET_REACHED`, and it must never be reported as a "correct" outcome.
2. **The distinction between `VALID_BUT_TARGET_DISPLACED` and `INVALID_WRONG_FACT` requires human
   authority.** No code in this design assigns it. §163's seven HS-A1 auger outputs are therefore
   **unclassified between those two members** pending
   `HS-A1-DISPLACED-FACT-ADJUDICATION-PACKET.md`.

---

## 2. Reliability is three problems, not one

| | dimension | question | §163 evidence | status |
|---|---|---|---|---|
| **R1** | **execution reliability** | transport, schema, degenerate, contract validity | **20/20 clean** — 0 truncation, 0 degenerate, 0 transport failure, 0 forbidden fields | **not the current problem** |
| **R2** | **decision reliability** | does the verifier *ask* rather than settle incorrectly when a human-reviewed gap exists? | **HS-E1: 8/10 settled silence** | **primary failure** |
| **R3** | **target-coverage reliability** | when several genuine gaps may exist, does the owed fact survive rather than being displaced by another legitimate hazard? | **HS-A1: 7/10 displaced** | **primary failure, pending adjudication of whether the displacing fact is itself valid** |

**These must never be collapsed into one accuracy number.** They have different causes and different
remedies: R2 is a sampling problem that repetition partially addresses; R3 is a *structural* problem
that repetition cannot touch, because every draw resamples a distribution that already prefers the
other fact. §163's 4/20 figure is the sum of two unrelated failures and is not actionable as one.

R1 being clean is itself a finding: **the existing execution-reliability machinery is doing its job,
and adding more of it would address nothing measured.**

---

## 3. Policy C — conditional second draw. Designed, not implemented.

Addresses **R2 only**.

```
verifier draw 1
├─ execution-invalid / degenerate  → EXISTING degenerate policy governs. Not this layer's business.
├─ NO_CLARIFICATION_REQUIRED on a trigger-positive case
│     → issue EXACTLY ONE second draw
│        ├─ draw2 = clarification binding an owed fact  → retain, subject to contract + arbitration
│        ├─ draw2 = NO_CLARIFICATION_REQUIRED           → BOTH silences persisted; NOT consensus
│        └─ draw2 = clarification binding nothing owed  → owed-fact coverage check (§5)
└─ any clarification                                    → owed-fact coverage check (§5)
```

**Hard properties.** At most 2 verifier calls per analysis. No loops. No majority voting. No third
draw. The second draw fires only on silence, so a wrong-fact first draw does **not** trigger it — a
known and deliberate gap, because that case belongs to R3 and is handled by coverage, not repetition.

### Why two NO draws cannot establish correctness

This is the rule most likely to be softened later, so the reason is recorded plainly.

The draws are **not independent tests of a proposition**. They are two samples from one distribution
which §163 measured to be *centred on silence* for HS-E1 — 8 of 10. Two silences is the single most
likely outcome of that distribution (≈64%) **whether or not the silence is correct**. Agreement
between samples from a biased distribution is evidence about the distribution's mode, not about the
truth. Treating it as confirmation would convert a measured bias into a manufactured confidence
signal, which is worse than a single draw because it carries the same error with more authority.

**Therefore:** two silences record `SETTLED_SILENCE` with `drawCount: 2` and leave the first-pass
result standing. They never upgrade to `VERIFIED_AS_IS`, never mark the owed fact `COVERED`, and never
clear a `TARGET_COVERAGE_WARNING`.

**Observability.** Both attempts persist in full — raw wire, response state, contract result, verdict,
timing, cost — under one `analysisId` with `drawIndex` 1 and 2. Neither replaces the other. This is
the §158 lesson: a replaced value destroys the evidence that the first event happened.

---

## 4. `owedFacts[]` — the internal representation

The bounded structure that makes coverage checkable. **Design only; not implemented in `src/`.**

```
owedFact {
  factKey            stable identifier, unique within the analysis
  affectedDecision   HAZARD_EXISTENCE | HAZARD_SEVERITY | EXPOSURE | APPLICABILITY
                     | REQUIRED_CONTROL | REGULATORY_INTERPRETATION
  source             see §4.1 — the provenance that created it
  evidenceSpan       verbatim span of the observation or governed record
  whyUnresolved      why that span leaves the fact open rather than settling it
  branchA / branchB  two plausible answer states
  decisionDivergence what is done today under each; must differ
  priority           LIFE_CRITICAL | REQUIRED_CONTROL | OTHER
  status             UNRESOLVED | COVERED | SETTLED_BY_EVIDENCE | REJECTED_BY_ARBITRATION
}
```

### 4.1 Permitted sources, and the boundary that matters

| source | may create owedFacts in DEVELOPMENT | may create owedFacts in PRODUCTION |
|---|---|---|
| deterministic HazLenz | yes | **yes** — rule-derived, no model involved |
| governed evidence | yes | **yes** — an approved record naming a required condition |
| first-pass retained uncertainty | yes | **yes, as a candidate only** — see below |
| bounded verifier nomination | yes | **yes, additively only** — may add, may never replace |
| human-authoritative fixture truth | **yes** | **NO — DEVELOPMENT ONLY** |

**The boundary, stated so it cannot be eroded.** Human-authored fixture truth is the standard the
system is *measured against*. If it were allowed to seed `owedFacts` in production it would become
part of the system being measured, and the evaluation would lose its independent scale — the exact
failure `docs/EXPERT-EVALUATION-TRUTH-AUTHORITY.md` exists to prevent. **Development instrumentation
and production architecture share the structure and must never share the population step.**

A production `owedFact` sourced from *model* output (first-pass uncertainty, verifier nomination)
carries `modelAuthored: true` and **cannot alone justify a fail-closed customer-visible state.** It
can raise a question; it cannot assert a hazard.

---

## 5. Owed-fact coverage check — deterministic by construction

**The verifier must bind.** Every emitted clarification declares `coversFactKey` — a member of the
supplied `owedFacts[]` closed set — or declares `NOMINATED_NEW` with the full nomination proof the v2
contract already requires.

### 5.1 What is deterministic

- is `coversFactKey` a member of the supplied set? *(closed-set membership)*
- is the bound fact still `UNRESOLVED`? *(state read)*
- does the bound fact's `evidenceSpan` appear verbatim in the observation? *(byte equality — the check
  the v2 contract already performs on nominations)*
- is every `LIFE_CRITICAL` and `REQUIRED_CONTROL` owedFact either bound-covered, or explicitly
  declared not-decision-critical **with a two-branch divergence proof**? *(structural completeness)*
- is a nomination **additive** rather than replacing an unresolved owed fact? *(set comparison)*
- did any owedFact transition `UNRESOLVED → COVERED` without a binding? *(state-machine invariant)*

### 5.2 What is NOT deterministic, and is not pretended to be

- **whether the bound question actually answers the fact it bound to.** A false binding is possible
  and this design does not claim to catch it automatically.
- whether a nominated new fact is genuinely decision-critical.
- whether two differently-worded owed facts are the same fact (deduplication — §6).

### 5.3 The semantic-matching boundary

Any future matcher **must not**:

- be satisfiable by the observation text itself *(the §160 FINDING 1 defect that retired the keyword
  scorer)*;
- rely on keyword or lexical overlap as the decision;
- match labels without meaning;
- accept the model's own certification that it covered the fact.

**Binding sidesteps all four**, because it never asks a matcher what text means. False bindings are
addressed by **human sampling of bound pairs**, not by an automated judge — a measurement obligation,
not a runtime component.

---

## 6. Multi-gap preservation

**The current contract implicitly asks the verifier to find the *best* question.** One nomination,
one proposal, one verdict. On a row with two genuine hazards that is a forced choice, and §163 shows
which way it goes: the more salient hazard displaces the owed one, silently.

What HazLenz needs instead: **ensure every independently decision-critical unresolved fact survives
internally, subject to a bounded customer question budget.**

**The preservation rule.**

1. **Preserve first, rank second.** Every `LIFE_CRITICAL` and `REQUIRED_CONTROL` owedFact survives
   internally regardless of budget. Ranking happens *after* preservation, never as a way of achieving
   it.
2. **Deduplicate only on identity, never on similarity.** Two facts merge only when they bind to the
   same `factKey`. Similar-sounding facts stay separate — merging them is how a gap disappears.
3. **A gap leaves `UNRESOLVED` only by evidence or arbitration**, never by another gap being more
   interesting. `SETTLED_BY_EVIDENCE` requires a span; `REJECTED_BY_ARBITRATION` requires a recorded
   reason.
4. **Salience is not authority.** No path exists by which one valid gap erases an unrelated valid gap.

Internal recall and customer question count are **decoupled**: preservation is internal and unbounded
by budget; the budget applies only at the customer surface (§7).

---

## 7. Question budget — reconciling high internal recall with low customer burden

The product principle is unchanged: **few questions, only decision-critical questions.** A design that
raises internal recall by asking users more things has solved nothing.

**Selection policy, in order:**

1. **Rank** surviving gaps: `LIFE_CRITICAL` → `REQUIRED_CONTROL` → others.
2. **Combine only under a strict test** — same `affectedDecision`, same equipment or task, and both
   independently answerable in one reply without ambiguity. If combining could produce a single answer
   that resolves one fact and leaves the other unclear, **do not combine.**
3. **Defer** a lower-priority gap only when its answer cannot change what must be done before the next
   interaction. Deferral is recorded, not discarded.
4. **Never drop a `LIFE_CRITICAL` gap to fit the budget.** If one cannot fit, that is not a
   presentation problem — see 5.
5. **Fail closed.** If a `LIFE_CRITICAL` fact cannot be presented within the budget, the analysis
   surfaces an **unresolved safety state** rather than a tidy list. The deterministic HazLenz findings
   still stand and are still shown.

**Anti-goals, explicit:** no question the user cannot answer standing at the workplace; no two
questions that resolve to the same fact; no silent drop of a competing hazard.

---

## 8. Target-coverage postcondition

```
TARGET_COVERAGE_WARNING = TRUE
  when any owedFact with priority LIFE_CRITICAL or REQUIRED_CONTROL
  remains UNRESOLVED and no accepted clarification binds to its factKey
```

**This is computed deterministically** — it is a set difference over declarations, not a semantic
judgement. Permitted responses, in bounded order:

1. **one** bounded verifier re-check naming the uncovered `factKey`s explicitly *(this is not a
   general retry; it is a targeted, single, non-repeating escalation)*;
2. arbitration, which may mark the fact `REJECTED_BY_ARBITRATION` with a recorded reason;
3. **fail closed** — surface the unresolved safety state.

The warning **never** silently clears, and it is persisted whether or not it was resolved.

---

## 9. Integrated state machine

| # | transition | deterministic? | max provider calls | fail-closed state | persisted | customer-visible |
|---|---|---|---|---|---|---|
| 1 | first pass | model | 1 (existing) | deterministic HazLenz alone | raw wire, tokens, cost | none directly |
| 2 | response-state classification | **deterministic** | 0 | `TRANSPORT_FAILURE` | state + signals | none |
| 3 | degenerate policy | **deterministic** | ≤1 reissue *(existing, unchanged)* | deterministic HazLenz | both attempts | none |
| 4 | owedFacts construction | **deterministic** | 0 | empty set → no coverage claim | full set + provenance | none |
| 5 | selective-verification trigger | **deterministic** | 0 | no verification, first pass stands | trigger conditions | none |
| 6 | verifier draw 1 | model | 1 | first pass stands | raw wire, verdict, binding | none |
| 7 | conditional draw 2 (silence only) | **deterministic gate**, model call | 1 | first pass stands | both draws, never replaced | none |
| 8 | contract admission | **deterministic** | 0 | verdict refused whole | codes + detail | none |
| 9 | owed-fact coverage | **deterministic** | 0 | `TARGET_COVERAGE_WARNING` | per-fact status | none |
| 10 | bounded coverage re-check | **deterministic gate**, model call | 1 | fail closed | attempt + outcome | none |
| 11 | arbitration | **deterministic** | 0 | fact stays `UNRESOLVED` | decision + reason | none |
| 12 | question-budget selection | **deterministic** | 0 | unresolved safety state | selected + deferred | **questions shown** |
| 13 | expert augmentation | **deterministic** | 0 | advisory dropped | merged result | advisory findings |
| 14 | deterministic HazLenz union | **deterministic** | 0 | **always present** | final record | findings always shown |

**Maximum provider calls per analysis: 1 first pass + 1 degenerate reissue + 2 verifier draws + 1
coverage re-check = 5, hard-capped.** No unbounded loop exists on any path. **Ten of fourteen
transitions are fully deterministic**, and every model-dependent transition is gated by a
deterministic predicate.

**The invariant under every failure mode:** deterministic HazLenz findings are produced and shown.
The advisory layer can degrade to nothing without the customer losing the deterministic result.

---

## 10. Cost and latency

Measured in §163: **$0.0210 per verifier call, 15,175 ms median.** First-pass median 15.7 s and
$0.05006 from §155/§156.

**Scenario ranges, not production rates.** The trigger fired 15/44 in development; that is one
observation on fixtures, not a rate. Ranges below span a trigger frequency of 20–50%.

| architecture | verifier calls per **triggered** analysis | per 100 analyses at 20% trigger | at 50% trigger | added latency |
|---|---|---|---|---|
| 1. current single draw | 1.00 | $0.42 | $1.05 | +15.2 s on triggered |
| 2. + conditional second draw | 1.0–1.8 *(silence-rate dependent)* | $0.42–$0.76 | $1.05–$1.89 | +15.2 s when it fires |
| 3. + owed-fact re-check | 1.0–2.8 | $0.42–$1.18 | $1.05–$2.94 | +30.4 s worst |
| 4. worst-case bounded path | **2.8 verifier + 1 first pass + 1 reissue** | — | — | ~76 s worst case |

Against a first-pass cost of $0.05006, the full bounded path adds **at most ~$0.059 per triggered
analysis**. Cost is not the constraint; **latency is** — a worst-case path near 76 s is a product
decision, not an engineering one, and argues for parallelising draws 1 and 2 where the design permits.

---

## 11. What can be proven, and where

| component | classification |
|---|---|
| state-machine call cap; no-loop property | `PROVABLE_LOCAL` |
| preservation of every raw attempt | `PROVABLE_LOCAL` |
| closed-set binding membership; owedFact state transitions | `PROVABLE_LOCAL` |
| `evidenceSpan` verbatim check | `PROVABLE_LOCAL` |
| `TARGET_COVERAGE_WARNING` computation | `PROVABLE_LOCAL` |
| question-budget selection and deferral rules | `PROVABLE_LOCAL` |
| fail-closed behaviour on every branch | `PROVABLE_LOCAL` |
| composition with the degenerate policy | `PROVABLE_LOCAL` |
| **truthfulness of a binding** | `REQUIRES_HUMAN_TRUTH` |
| **`VALID_BUT_TARGET_DISPLACED` vs `INVALID_WRONG_FACT`** | `REQUIRES_HUMAN_TRUTH` |
| whether a question is *useful* to a safety professional | `REQUIRES_HUMAN_TRUTH` |
| owedFact deduplication on similarity | `REQUIRES_HUMAN_TRUTH` |
| does binding reduce displacement in practice | `REQUIRES_HOSTED_VALIDATION` |
| does conditional draw 2 improve silence recovery | `REQUIRES_HOSTED_VALIDATION` |
| provider draw-variance reduction | `REQUIRES_HOSTED_VALIDATION` |
| **a model certifying its own coverage** | `DO_NOT_AUTOMATE` |
| **a model adjudicating displaced-vs-invalid** | `DO_NOT_AUTOMATE` |
| **automated semantic equivalence as a gate** | `DO_NOT_AUTOMATE` |
| **any automatic broadening of authored truth** | `DO_NOT_AUTOMATE` |

---

## 12. The smallest experiment that could falsify this design

**Not designed to confirm it. Designed to break it.** Not the old 90-call nomination-prior run, which
tested a different hypothesis with a denominator that no longer exists.

**Design.** One arm, binding-enabled: the same two authoritative cases, `owedFacts` supplied with
`factKey`s, binding required, conditional second draw enabled. **6 draws per case × 2 cases = 12
calls**, ≈$0.30 at measured cost. Compared against §163's 20 draws as the frozen no-binding baseline —
**no new baseline is purchased**, because §163 already measured it under identical conditions.

Sample size is justified by the falsifiers, **not** by any pretence that two rows estimate production
rates. Six draws per case detects a shift from the measured 7/10 displacement to ≤1/6 with a clear
margin; it cannot and does not claim a rate.

| # | measures | falsifier — the design is WRONG if… |
|---|---|---|
| **A** | settled-silence recovery | HS-E1 silence stays ≥8/10 with the conditional second draw enabled — repetition adds nothing even where R2 predicts it should |
| **B** | owed-target preservation | binding is available and the verifier still fails to bind or declare on the flame-failure key in ≥2 of 6 draws — **the core claim fails** |
| **C** | valid-but-displaced retention | additive nomination is available and the auger fact is *lost* rather than carried alongside — preservation does not preserve |
| **D** | false question manufacture | binding causes the verifier to bind spuriously to owed facts it would previously have stayed silent on, raising questions on cases where silence was right |
| **E** | draw instability | pairwise agreement does not improve above §163's 53–62% — binding constrains output without stabilising it |
| **F** | question burden | mean surviving customer-visible questions per case exceeds 2, or any case exceeds 3 — internal recall bought at the user's expense |

**B and D are the decisive pair.** B failing means binding does not solve displacement. D failing means
it solves displacement by manufacturing questions, which is the over-questioning failure the whole
verifier exists to avoid. **Either one falsifies the design and neither is detectable from the other.**

---

## 13. Composition with the degenerate-output policy

`DEGENERATE_OUTPUT_POLICY_STATUS = PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION` — **unchanged, not
reopened, semantics untouched.**

The two layers act on different objects and never overlap:

- the **degenerate policy** acts on **response state** — is this output usable at all? First degenerate
  output preserves the attempt and permits at most one bounded reissue; a second preserves that
  attempt and fails closed to deterministic HazLenz. No loops.
- the **reliability layer** acts on **semantic outcome among already-usable responses**.

**Ordering: transport → degenerate policy → contract admission → owed-fact coverage → reliability
policy.** The reliability layer never reissues a degenerate response — that remains the degenerate
policy's single bounded retry — and the degenerate policy never inspects semantics. Their retry
budgets are separate and additive, which is why the hard cap in §9 counts them separately.
