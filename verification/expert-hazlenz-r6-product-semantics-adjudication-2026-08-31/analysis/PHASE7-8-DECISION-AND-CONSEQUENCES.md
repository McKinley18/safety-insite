# Phase 7 — Product classification decision, and Phase 8 — consequences

# SELECTED: **POSITION A — CURRENT ORACLE CONFIRMED**

R6 should remain clean. The removed guard is **not** independently candidate-worthy under the
exact verified controlled state.

On the Phase-0 core question, the removed guard under R6's stated facts is answer **B**:

> **A TRUE PHYSICAL CONDITION BUT NOT A CURRENT ACTIONABLE MACHINE-GUARDING HAZARD WHILE THE
> VERIFIED CONTROLLED STATE PERSISTS** — with the restoration obligation correctly located as a
> **future prerequisite** attaching to a re-energization transition this observation does not
> state is occurring.

Positions B and C were both considered seriously and are ruled out on evidence, not preference:

**Position B (oracle revised) is ruled out** because Sonnet's candidate asserts
`assertedConditionState: ACTIVE` — a present-exposure claim — on a machine the observation
states is at independently verified zero energy, with every supporting consequence hedged on a
condition the model supplied itself, and one (v6 rep 3) contradicting a stated fact. Adopting it
would require simultaneously overturning a production deterministic predicate that resolves
1910.212 `NOT_APPLICABLE` at 0.96 on this exact sentence, a protected golden expectation named
"Not Guarding alone", and the deliberate `R6`/`V7` contrast pair. The hosted evidence touches
none of those.

**Position C (third classification required) is ruled out on its own premise.** Position C asks
whether a *missing semantic category* must be defined. It is not missing.
`EXPERT_CONDITION_STATES` already carries `CONTROLLED`, `HYPOTHETICAL`, `INSUFFICIENT_EVIDENCE`
and `UNKNOWN`; `ExpertHazardCandidate` already carries `confidence`,
`relationshipToDeterministic` and `requiresUserConfirmation`. **The Expert contract can already
represent "a true physical condition that is currently controlled."** What cannot represent it is
the *scorer* — see the finding below, which is the one substantive correction this adjudication
makes to the existing record.

---

## Precise product semantics adopted

> A physical condition that a hazard family's standard would ordinarily address is a **current
> hazard candidate** only when the observation states a **live pathway to harm**: hazardous
> motion or energy is available, **or** a person is stated to be within contact range of the
> exposed condition.
>
> Where a stated, verified control forecloses that pathway, the condition is a **contextual
> fact**. Where the only remaining pathway is a **state transition the observation does not state
> is occurring**, the associated obligation is a **future prerequisite**, and belongs to the
> observation that states the transition — not to this one.
>
> This is symmetric. A control that is stated but **not** verified, is incomplete, is bypassable,
> or is absent does not foreclose anything, and the candidate survives at full strength
> (`V1`–`V6`). A verified control does not lower the bar for a **different**, separately stated
> exposure (`V7`, `V8`).

Answers to the specific determinations requested:

- **Is the `machine_guarding` candidate valid?** **No.** Not on these facts, and emphatically not
  at `assertedConditionState: ACTIVE`.
- **Is the reinstatement clarification valid?** **No**, as a current decision-critical
  clarification. Fact **U1** ("is the guard still off?") is the clearest case in the matrix:
  *both* of its answers leave the current classification unchanged (PHASE4 §6), so it changes no
  member of `EXPERT_AFFECTED_DECISIONS`. The same question becomes valid — and `BLOCKING` — in
  `R6-H`, where a re-energization is stated.

---

## The correction this adjudication makes to §110–§114

**§110, §112 and §114 each recorded R6 as "0/3, no movement." That is accurate at the level the
scorer measures and incomplete at the level product semantics live.**

Extracting the candidate fields from all nine frozen hosted transcripts (`evidence/
HOSTED-R6-V4-V5-V6-VERBATIM.md`):

| prompt | reps | `assertedConditionState` |
|---|---|---|
| **v4** (§110) | 1, 2, 3 | **`UNKNOWN`** ×3 |
| **v5** (§112) | 1, 2, 3 | **`ACTIVE`** ×3 |
| **v6** (§114) | 1, 2, 3 | **`ACTIVE`** ×3 |

Under v4 the model raised a hedged, `UNKNOWN`-state, confirmation-flagged advisory framed
explicitly as a restoration prerequisite — v4 rep 3's summary even reads *"a decision-relevant
gap rather than a settled hazard."* Under v5 and v6 it asserts a **present** exposure.

**The repairs made the R6 output semantically worse on the one axis the scorer cannot see.**

`expert-routing-metrics.ts` `verdictFor()` is a pure cardinality test — it receives only
`(expectation, count)` and never sees `assertedConditionState`, `confidence`, or
`requiresUserConfirmation`. A `machine_guarding` candidate at `UNKNOWN`/LOW and one at
`ACTIVE`/MODERATE score identically as `INCORRECT_POPULATED`. §114.2's table ("no movement",
identical rows across three versions) is therefore true *and* concealed a real regression.

A plausible mechanism, offered as a hypothesis rather than a measured finding: v5/v6's sections
make hedged, history-flavoured framing look like the forbidden move, while instruction 1 still
pushes the model to raise the candidate. Denied the hedge and still holding the conviction, the
model reaches for `ACTIVE` to license the candidate. If that is right, the last two prompt
generations did not fail to move the model — **they moved it in the wrong direction**, and the
instrument could not report it. This is a hypothesis; confirming it would need hosted calls and
is not authorized here.

**Do §110–§114 require reinterpretation?** Their measurements stand — every count, cost, control
and grounding result re-read cleanly this phase and none is disturbed. Two conclusions need
qualifying, both recorded in §115 rather than by editing the frozen sections:

1. **"No movement across v4/v5/v6" is a statement about collection cardinality only.** There was
   movement, and it was adverse.
2. **§114.6's "the local instrument is non-predictive for this defect class" is correct but not
   the whole account.** The *hosted* instrument is also partially blind here: it scores the
   collection but not the claim. §113's 350/350 local result and §114's 0/3 hosted result were
   both computed by the same cardinality-only scorer.

---

# Phase 8 — Consequences: the next engineering operation

The authorization directs that, given three hosted prompt failures, another prompt iteration must
not be the automatic recommendation. It is not recommended.

### Option 1 — another prompt repair. **NOT RECOMMENDED.**
Three generations, two dedicated repair phases, nine measured local iterations, ~$0.72 of hosted
confirmation, and the defect is now stated *more* explicitly in the repair's own vocabulary
(§114.2) — and, per the finding above, the state claim got worse. There is no evidence a fourth
wording succeeds and some that wording pressure is what produced the `UNKNOWN`→`ACTIVE` shift.

### Option 2 — deterministic boundary enforcement in `expert-normalization.ts`. **NOT RECOMMENDED AS THE NEXT STEP.**
§114.8 is right that the boundary is where refusals actually bind, and right to be wary. A rule
that silently drops a `machine_guarding` candidate is the highest-risk change shape in this
programme: `V1`–`V8` exist precisely because a suppression rule that looks correct on R6 can
destroy recall on a genuinely uncontrolled machine. It should not be reached for while a
lower-risk, additive mechanism addressing a *demonstrated* root cause is untried.

### Option 3 — accept the current state as the product position. **NOT RECOMMENDED YET, and not needed.**
Defensible on the current evidence (advisory layer, `requiresUserConfirmation: true`, every
recall control passing, zero routing misses, perfect grounding) — but premature while the
`ACTIVE` state claim stands unaddressed. `ACTIVE` on a verified zero-energy machine is a false
present-tense statement, not merely noise, and it would sit beside a correct deterministic
finding that says the opposite. Acceptance remains available as a fallback if Option 4 fails.

### **Option 4 — RECOMMENDED: complete the deterministic→Expert input projection, then re-measure.**

Root cause established this phase, not previously identified: **Expert is asked to adjudicate a
question the deterministic layer has already answered, while being denied the answer.**

- The real engine resolves `29 CFR 1910.212(a)(1)` → `NOT_APPLICABLE` at 0.96 on this exact
  sentence (measured, PHASE2).
- R6's `deterministicFindings` carries **only** `lockout_tagout`/`CONTROLLED`. The
  machine-guarding determination is absent.
- `governedStandards` is `[]`.
- Prompt instruction 1 tells the model to raise hazards **"NOT already in the deterministic
  findings above."** `machine_guarding` genuinely is not there.
- `grep -rn "DeterministicFindingView" src/` returns only the type declaration and its use in
  `ExpertAnalysisInput` — **no production projection exists yet.** This is an open design
  decision, not a regression to repair.

Three prompt generations have tried to *instruct* the model out of filling a gap that the input
genuinely presents. Supplying the missing determination is additive, drops nothing, silently
suppresses nothing, is testable at $0.00 locally, and is falsifiable: if the model still raises
`machine_guarding`/`ACTIVE` after being shown a `NOT_APPLICABLE` machine-guarding decision, the
input hypothesis is wrong and Option 2 or 3 is next on much better evidence.

**Sequenced, none authorized here:**

1. **Zero-cost design + local diagnostic.** Decide whether `DeterministicFindingView` (or a
   sibling projection) should carry negated / `NOT_APPLICABLE` / `CONTROLLED` determinations, and
   measure locally against the existing corpus. Requires a contract decision, since
   `DeterministicFindingView.conditionState` is an `ExpertConditionState` with no member meaning
   "this family was evaluated and excluded" — `NEGATED` is the closest and its semantics need
   adjudicating before use.
2. **Zero-cost scorer instrumentation (do this regardless of 1).** Record
   `assertedConditionState`, `confidence` and `requiresUserConfirmation` alongside the cardinality
   verdict, so the `UNKNOWN`→`ACTIVE` class of change is visible to the next measurement.
   Recommended as **recording only, not scoring** — changing what `verdictFor()` scores would
   alter a frozen protected metric and needs its own authorization.
3. **Zero-cost corpus extension.** Add `R6-H` (guard off, re-energization stated as imminent →
   `BLOCKING` clarification) and `R6-I` (returned to operation, guard absent → `machine_guarding`
   / `ACTIVE` required). These are the matrix's only two variants with no fixture, and they are
   the two that would falsify an over-broad suppression. Without them the corpus cannot
   distinguish a correct rule from "guard-off under LOTO is never anything."
4. **Only then**, a bounded hosted re-measurement of `R6`×3 plus `R6-H`, `R6-I` and the `V7`/`U-B`
   recall gates.

**Fixture changes deliberately NOT made here**, per this operation's terms: the R6 fixture,
prompt v6, normalization, the wire contract and the routing scorer are all byte-unchanged.

### One corpus note carried forward, not acted on

The R6 fixture's inline claim that *"everything is stated"* is very slightly overstated:
*"locked out with **the supervisor tag** applied"* leaves personal-device ownership genuinely
undetermined (fact **U5**, PHASE3). This is a real `lockout_tagout` question, it was raised by
exactly one of nine hosted reps, and it does nothing to support a `machine_guarding` candidate.
Recorded so a future phase adjudicating the fixture's `FORBIDDEN`-on-all-four encoding has it,
and explicitly **not** treated as grounds to revise the oracle.
