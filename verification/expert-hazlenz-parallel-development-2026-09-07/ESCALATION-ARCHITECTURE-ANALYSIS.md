# §201 — priority / escalation architecture analysis

**Agent 4. READ-ONLY. Zero provider calls. Zero database operations. No runtime file modified.**
This document is the only file this agent created or changed.

---

## 0. What this document is, and the two things it is not

It is a **threat model** and an **options analysis** for §196 open contract question #2: every
first-pass projected `OwedFact` enters at `priority = OTHER`, the non-escalating floor, so a
genuinely life-critical first-pass gap does not raise `UNRESOLVED_SAFETY_STATE`.

It is **not a recommendation to adopt any option.** Section 8 recommends an *experiment*, not a
mechanism.

It is **not a semantic judgement about any §199 fact.** Axis R —
`R_PRIORITY_FLOOR_IMPACT`, *"would this fact be materially under-escalated by entering at the
non-escalating OTHER floor?"* — is a per-fact human verdict, and **0 of the 8 R slots are supplied**
(§200: `HUMAN_ADJUDICATION_COMPLETENESS = 0 / 152`, `STATUS = UNMEASURED`). Nothing below decides,
implies, or is contingent on how any particular §199 fact should be graded. Section 7 states plainly
what that costs this analysis.

---

## 1. The mechanism as it actually stands

### 1.1 Who writes `priority`, and by which code path

| population path | who sets `priority` | value | file · line |
|---|---|---|---|
| `FIRST_PASS_MODEL` | HazLenz constant | always `OTHER` | `backend/scripts/lib/expert-first-pass-owed-fact-projection.ts:105` → applied at `:631` |
| `VERIFIER_NOMINATION` (v3 bridge) | HazLenz **caller option** `nominatedPriority`, defaulting to `OTHER` | caller's choice | `backend/scripts/lib/expert-verifier-contract-v3.ts:555, :589` |
| `DETERMINISTIC` / `GOVERNED_EVIDENCE` | the constructing caller | caller's choice | `owed-fact-ledger.ts:90` (`owedFact()` copies it through) |
| any provider, on any wire | **nothing** — there is no wire field | — | `priority` ∈ `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS`, `owed-fact.types.ts:260–263` |

The wire prohibition is enforced twice, structurally: `checkBindingDeclarations` refuses a
declaration carrying a top-level `priority` (`owed-fact-binding.ts:137–142`), and
`projectDeclaredOwedFacts` refuses a declaration carrying it via `DECLARATION_FORBIDDEN_FIELDS`
(`expert-first-pass-owed-fact-projection.ts:153–155, :462–467`). §199 additionally carries a
preregistered **hard fail** — *"provider-authored priority escalated `UNRESOLVED_SAFETY_STATE`"* —
which triggers if any projected fact carries a priority other than `FIRST_PASS_PROJECTED_PRIORITY`
(`backend/scripts/score-199-deterministic-2026-09-07.ts:310`).

### 1.2 What `priority` actually decides — three consumers, and they behave differently

**Consumer 1 — coverage (`evaluateTargetCoverage`, `owed-fact-binding.ts:410–430`).**
It computes **two** verdicts and reports both:

- `TARGET_COVERAGE_WARNING` — true if **any** owed fact is `UNRESOLVED` and unbound. **Priority
  plays no part.**
- `priorityGatedWarning` — true only for uncovered facts whose priority ∈
  `COVERAGE_PRIORITY_GATE = ['LIFE_CRITICAL','REQUIRED_CONTROL']` (`:392–393`).

**Consumer 2 — question budget ranking (`selectQuestionsForBudget`, `structural-questions.ts:195–244`).**
`PRIORITY_RANK` sorts `LIFE_CRITICAL` → `REQUIRED_CONTROL` → `OTHER`, then by admission order. There
is no score and no other tie-break.

**Consumer 3 — the fail-closed state (`structural-questions.ts:226–236`).**

```
unresolvedLifeCritical = unresolvedFacts(ledger)
  .filter(f => UNDROPPABLE_PRIORITIES.includes(f.priority) && !presentedKeys.has(f.factKey))
UNRESOLVED_SAFETY_STATE = unresolvedLifeCritical.length > 0
```

`UNDROPPABLE_PRIORITIES = ['LIFE_CRITICAL']` (`:171`). `REQUIRED_CONTROL` does **not** raise it.

### 1.3 What the floor therefore does and does not cost — stated precisely

The §196 residual limit says a life-critical first-pass gap *"enters at `OTHER` and does not raise
`UNRESOLVED_SAFETY_STATE`"*. That is accurate but narrower than it reads. Concretely, at `OTHER` the
fact **still**:

- is admitted to the ledger, preserved, and never removed (`owed-fact-ledger.ts:159–165, 230–233`);
- appears in `survivingInternally`, unbounded by budget (`structural-questions.ts:203`);
- raises `TARGET_COVERAGE_WARNING` if unbound — the **stricter** of the two coverage rules, which
  `expert-target-coverage.ts:16–25` documents as deliberately chosen over the §164 priority-gated
  form;
- is eligible for a customer-visible question, and gets one whenever wording exists and budget
  allows.

What the floor costs is exactly three things: it does **not** raise `priorityGatedWarning`; it sorts
**last** in the budget ranking, so it is the first thing suppressed under budget pressure; and if
suppressed it does **not** raise `UNRESOLVED_SAFETY_STATE`.

---

## 2. Seven findings that change the shape of the problem

These are established from repository code, not inferred from the framing of the question.

### F1 — The floor does not make a gap invisible. It makes it *out-rank-able*.

Per §1.3. The coverage surface already fires on every uncovered `OTHER` fact. The live failure
therefore requires a **second condition** — budget pressure or absent wording — before the gap is
silently dropped. Any option's benefit is bounded by how often that second condition holds, and that
quantity is currently unmeasured: `presentationThresholds` are explicitly not finalised
(`structural-questions.ts:192–194`), so no production budget value exists to reason from.

### F2 — `LIFE_CRITICAL` does not itself fail closed. An **unpresentable** `LIFE_CRITICAL` does.

Read `:226–236` again: the filter is `!presentedKeys.has(f.factKey)`. A `LIFE_CRITICAL` fact that
*is* presented within budget raises nothing. So escalation's first-order effect is **displacement in
the ranking**, and the fail-closed state is a second-order effect of escalation *plus* scarcity.
This materially reduces the "false escalation immediately blocks work" fear and materially raises a
different one — see T4.

### F3 — `priority` is part of fact **identity**. Post-hoc escalation cannot mutate it in place.

```
if (a.evidenceSpan !== b.evidenceSpan || a.affectedDecision !== b.affectedDecision
    || a.source !== b.source || a.priority !== b.priority) {
  v.push(`FACT_IDENTITY_MUTATED:${b.factKey}`);
}
```
`owed-fact-ledger.ts:255–258`

Changing an admitted fact's priority is a **preservation violation**, on the same footing as deleting
a fact. `transition()` (`:189–226`) moves `status` and nothing else, and there is no priority
equivalent of `TRANSITION_AUTHORITIES`. **Consequence:** any option that escalates *after* projection
(a second-stage classifier, a human confirmation, a verifier nomination confirming a first-pass fact)
cannot express itself as a priority edit. It must either (a) run **before** admission, or (b) be
represented as a **separate additive record or overlay** that the budget and gate consult alongside
priority. This is the single largest architectural constraint on the option space, and it is not
mentioned in the §196 provenance argument.

### F4 — There is a **second, independent** gate on fail-closed states, and model-authored facts already fail it.

```
export function modelAuthoredOnlyFailClosedKeys(l, reliedOnKeys) {
  if (l.population !== 'PRODUCTION') return [];
  ...
  return relied.every(f => f.modelAuthored) ? relied.map(f => f.factKey) : [];
}
```
`owed-fact-ledger.ts:291–298`, implementing the contract stated at `owed-fact.types.ts:186–190`:
*"Such a fact may raise a question; it may not alone justify a fail-closed customer-visible state."*

Every first-pass projected fact carries `modelAuthored: true` (derived from `source`, `:98`, and a
mismatch is a defect at `:79–81`). **So escalating a first-pass fact to `LIFE_CRITICAL` would not, on
its own, entitle it to a fail-closed customer state in a `PRODUCTION` ledger.** The two rules are not
currently wired to each other — `selectQuestionsForBudget` does not call
`modelAuthoredOnlyFailClosedKeys` — but both are live contracts, and an escalation design that
satisfies one while contradicting the other is not a solution. This is a genuine architectural
tension that §196 did not surface, and any option must state which of the two it changes.

### F5 — An escalation seam already exists, and it is pinned by a **caller default**, not by the boundary.

`NominationPayload` carries a `priority` field (`owed-fact-binding.ts:61–71`). The binding boundary
validates it only for **membership** (`NOMINATION_PRIORITY_NOT_A_MEMBER`, `:201–203`) and
`applyAdmittedDeclarations` copies it verbatim into the ledger (`:345`). The top-level
forbidden-field scan (`:137–142`) inspects the declaration object, **not** `d.nomination`.

What actually keeps a provider-chosen priority out today is that `bridgeV3OutputToLedgerInputs`
does not read one from the model — it takes `nominatedPriority` from the **caller** and defaults it
to `OTHER` (`expert-verifier-contract-v3.ts:589`). Development runs have already exercised a
non-floor value: `nominatedPriority: 'REQUIRED_CONTROL'` in
`execute-verifier-v3-scoped-falsification-2026-09-04.ts:452` and
`test-expert-verifier-v3-binding-protocol.ts:210`.

Two consequences. First, **a HazLenz-side priority parameter is an existing architectural pattern**,
not something an option would have to invent. Second, the containment is one line of caller
discipline deep on the nomination path — a hardening opportunity independent of which escalation
option is eventually chosen, and one that should be recorded whether or not escalation proceeds.

### F6 — A `LIFE_CRITICAL` fact with **no wording** raises the gate unconditionally.

```
if (q.question === null) { suppressed.push({...q, presentationStatus: 'NO_WORDING_AVAILABLE'}); continue; }
```
`structural-questions.ts:216–219` — the wording check runs **before** the budget check. A suppressed
`LIFE_CRITICAL` is never in `presentedKeys`, so it raises `UNRESOLVED_SAFETY_STATE` regardless of
budget. First-pass facts obtain wording only through a clarification that back-references the
declaration (`resolveClarificationLinks`,
`expert-first-pass-owed-fact-projection.ts:667–686`); a projected fact whose clarification did not
link has `question: null`. **Any option that escalates first-pass facts inherits a fail-closed path
that is triggered by a linkage failure rather than by a safety condition.** No option below is safe
to adopt without measuring clarification-linkage yield first.

### F7 — The authority matrix already contains the exact shape a nomination-style option would need.

`expert-authority-matrix.ts:142–156`, surface `DANGEROUS_AND_LIFE_CRITICAL_RETENTION`:

```
permitted: ['CHALLENGE'],            // no ADD — the surface is an invariant, not a list
onDisagreement: 'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW',
onExpertUnavailable: 'SURFACE_UNCHANGED',
```

with the rationale *"Expert saying nothing about a life-critical hazard must be indistinguishable,
at the merged output, from Expert never having run."* `EXPERT_ACTIONS` are ordered `ADD · CHALLENGE ·
SUPPRESS · MUTATE` and the matrix grants the last two **nowhere** (`:60–64`). A model-side
escalation *nomination* that HazLenz confirms is, in this vocabulary, a `CHALLENGE` with
`RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW` — an existing governed pattern, not a new authority
class. An escalation that a model's output *causes* would be `MUTATE` on a life-critical surface,
which the matrix grants nowhere.

---

## 3. Threat model

### 3.1 Assets

| asset | why it matters |
|---|---|
| `UNRESOLVED_SAFETY_STATE` | the only fail-closed customer-visible state in this layer |
| the question-budget ranking | decides which gaps a human actually sees |
| `priorityGatedWarning` | the §164 coverage reading |
| the fact ledger's identity invariants | the anti-displacement guarantee the whole layer exists for |
| the evaluation's independence | a model that can influence its own gate corrupts every measure taken over it |

### 3.2 Adversary and error models

**A1 — Adversarial provider (prompt-injected via the observation, or a compromised/substituted
model).** The observation text is customer-supplied and reaches the model. An adversary who can
influence priority can (i) manufacture fail-closed states on arbitrary rows, (ii) starve genuine
gaps out of the budget by flooding the top of the ranking, or (iii) — the inverse and more dangerous
— learn which phrasings *avoid* escalation and suppress a real gap into the floor. Note that any
mechanism keyed on *model-authored text* is reachable by A1, including a deterministic classifier
that reads that text (see T5).

**A2 — Miscalibrated provider (the realistic case).** No adversary; the model is simply
systematically over- or under-calibrated on severity, and its errors are **correlated** across rows
rather than independent. Correlation is what makes miscalibration worse than noise: a 10% false-
escalation rate spread evenly is a nuisance; a 10% concentrated on one hazard family or one phrasing
is a systematic blind spot or a systematic alarm.

**A3 — Miscalibrated deterministic rule.** A closed rule is auditable but is wrong in the *same
direction every time*. §196 rejected the `affectedDecision` lookup for exactly this
(*"a safety judgement wearing a lookup table, and it would be wrong on both sides"*). A mechanical
illustration, carrying **no** claim about any fact's actual criticality: across the eight §199
projected facts the `affectedDecision` values are 6 × `REQUIRED_CONTROL`, 1 × `EXPOSURE`,
1 × `HAZARD_SEVERITY`. A rule of the form "`REQUIRED_CONTROL` ⇒ `LIFE_CRITICAL`" would escalate
6 of 8; "any of the three ⇒ `LIFE_CRITICAL`" would escalate 8 of 8 and is the floor's mirror image,
not a fix. Whether either is right is axis R and is unadjudicated.

**A4 — Human escalator.** Slow, expensive, inconsistent between reviewers, and — decisively —
**not available at analysis time** for a customer-facing pipeline.

**A5 — The programme itself.** The mechanism is chosen by people who have seen the §199 outputs.
Fitting a rule to eight observed facts and then reporting its agreement with those same eight
verdicts is not evidence; it is the rule's own training set. This is a threat to the *decision
procedure*, not to the runtime, and Section 8 is designed against it.

### 3.3 Cost of a **false escalation**

1. **Ranking displacement (immediate, per F2).** A falsely escalated fact sorts above every genuine
   `REQUIRED_CONTROL` and `OTHER` gap. Under a tight budget it takes a real question's slot. This is
   the *first* cost and it lands before any fail-closed state does.
2. **Fail-closed state (second-order).** Only when the escalated fact cannot be presented — budget
   exhausted, or wording absent per F6. A false escalation on a fact whose clarification failed to
   link produces a fail-closed state with **no** customer-visible question attached to it: the worst
   possible presentation, since the customer is blocked and not told what to answer.
3. **Alert fatigue.** Real, and **currently unmeasurable in this repository.** The customer surface
   is not designed and `presentationThresholds` are deliberately unset (`structural-questions.ts:192–194`).
   Any option evaluation that quantifies fatigue today is inventing the number.
4. **Erosion of the state's meaning.** `UNRESOLVED_SAFETY_STATE` is a binary with no severity
   gradation. Once it fires routinely it stops being read, and there is no mechanism to recover its
   meaning short of a contract change.

### 3.4 Cost of a **missed escalation**

1. A genuinely life-critical gap sorts last and is the first suppressed under budget pressure.
2. No fail-closed state; `priorityGatedWarning` stays false.
3. **But** `TARGET_COVERAGE_WARNING` fires and `survivingInternally` retains the fact (F1). The
   miss is a *presentation and gating* miss, not an erasure. The programme's founding failure —
   §163 displacement, a fact *disappearing* — is prevented by a different mechanism (the append-only
   ledger) that the floor does not touch.
4. The genuine irreversible cost is downstream and outside this repository's measurement: a customer
   proceeds without being asked a question that would have changed what they did today.

### 3.5 The asymmetry, stated honestly

The two costs are not symmetric, and neither is uniformly worse. A false escalation is **visible,
recoverable, and bounded** — it produces a state someone can inspect and a contract someone can
revert. A missed escalation is **invisible by construction** — the absence of a question leaves no
artefact, which is precisely why measuring miss rate requires human adjudication and cannot be
inferred from run outputs. **This asymmetry is an argument for measuring, not for escalating.** The
non-escalating floor is the choice that keeps the failure legible; it is not the choice that makes
the failure small.

### 3.6 What would have to be true for **any** mechanism to be trustworthy

Six conditions. They are the evaluation criteria in Section 4 and are stated once here.

- **C1 — Authority.** The value that gates a fail-closed state is written by a party whose authority
  is recorded and auditable, and is never a function whose only input is model output. Restating
  `TRANSITION_AUTHORITIES` at `owed-fact.types.ts:196–201`: *"There is deliberately no member for a
  model explanation."*
- **C2 — Determinism and replay.** Given the same inputs, the same escalation, byte for byte, and
  reproducible offline from persisted evidence with zero provider calls.
- **C3 — Non-semantic inputs, or a declared semantic authority.** Either the mechanism reads only
  closed vocabularies and externally-anchored identifiers, or it reads meaning and says so and names
  who supplied it. A substring or keyword matcher over model prose is neither, and is the instrument
  §160 retired (`owed-fact-binding.ts:20–28`).
- **C4 — Preservation-compatible.** No mechanism may produce `FACT_IDENTITY_MUTATED` (F3), and none
  may settle, remove, or reorder a fact.
- **C5 — Falsifiable in both directions.** Over-escalation and under-escalation must each be
  countable against an **opportunity denominator**, not against total executions.
- **C6 — Reversible.** The mechanism can be switched off and the resulting ledger and gate state are
  identical to today's, with prior evidence still attached to the module hashes that produced it.

---

## 4. The six options against the threat model

### Option A — Deterministic escalation from closed structural conditions

**Mechanism.** At projection time, derive `priority` from a stated closed rule over fields that are
already closed-vocabulary or externally anchored — `affectedDecision`, declaring stage, presence and
identity of `governedEvidenceSourceIds`, whether HazLenz holds an `acceptableEvidence` criterion for
the bound governed id, number of declarations on the row, the deterministic HazLenz findings already
present for that observation. Never the model's prose.

**Authority.** HazLenz, in the projection module. Same location as today's constant; the constant
becomes a function of closed inputs. Satisfies **C1**.

**What the provider gains.** On the narrow reading, nothing that decides: no wire field is added and
`PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` is untouched. On the honest reading, **something**: the model
chooses `affectedDecision` and chooses which governed ids to name, so it selects the rule's inputs
even though it does not set its output. The gate becomes *indirectly* reachable from model output.
That is materially weaker than today, and A's proponents must own it.

**Failure modes.** *False:* systematic and correlated (A3) — a rule keyed on `affectedDecision`
escalates a whole category regardless of content, and the §199 distribution shows a category rule
lands on 6/8 or 8/8 of the observed facts. Combined with F6, category-wide escalation would convert
every clarification-linkage failure in that category into a fail-closed state. *Missed:* equally
systematic — an out-of-category life-critical gap is never escalated, and the rule's shape tells the
model exactly which category to avoid.

**Deterministic testability.** Excellent — the strongest of the six. Pure function of validated
fields, replayable offline against `PROJECTION-PROVENANCE.jsonl` with zero provider calls; a table
of (inputs → priority) is directly assertable.

**Evidence needed before adopting.** (i) Axis-R verdicts, so an escalate/do-not-escalate truth
exists at all. (ii) A **preregistered** rule, stated and hashed *before* those verdicts are read
(A5). (iii) That rule's agreement with the verdicts, reported as x/n on the opportunity denominator
in both directions. (iv) An out-of-sample cohort, since eight facts cannot both propose and test a
rule.

**Reversibility.** High if the rule is one exported constant plus one pure function; changing it
changes admission-time values, so previously projected facts are unaffected (F3 forbids retro-edits
anyway).

**Interaction with the gate and budget.** Direct: writes the field both consume. Does **not**
address F4 — an A-escalated first-pass fact is still `modelAuthored: true` and still fails
`modelAuthoredOnlyFailClosedKeys` in a `PRODUCTION` ledger. A must state whether it changes that
contract or accepts that its escalation is budget-ranking-only in production.

**Standing objection.** §196 already rejected the `affectedDecision` form of this as *"a safety
judgement wearing a lookup table."* A survives only if it uses richer closed inputs than
`affectedDecision` alone, and the burden is on demonstrating that the richer rule is not the same
objection with more columns.

---

### Option B — A separate deterministic risk classifier

**Mechanism.** A dedicated module classifies the fact's risk independently of the projection, and
its output supplies (or gates) `priority`.

**Authority.** Whoever authors the classifier and its knowledge base — which is the crux. **If the
classifier reads the model's prose, the authority has not moved; only the indirection has.**

**A concrete precedent, and a warning.** `SafeScopeEvidenceGapIntelligenceService`
(`backend/src/safescope-v2/brain/evidence-gap-intelligence/`) already exists and looks like a fit: a
116-line registry of gap records each carrying `severity: low|medium|high|critical` and a
`recommendedDisposition` including `hold_for_critical_evidence`. It must not be used for this
without a change, because its matcher is:

```
function hits(text, terms) { return terms.filter(term => text.includes(normalized(term))); }
```
`evidence-gap-intelligence.service.ts:13–15`

That is `String.includes` over concatenated free text. Pointed at an owed fact it would be a
**substring matcher over model-authored prose deciding a fail-closed state** — precisely the
instrument class §160 retired and `CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED`
exists to prevent (`owed-fact-binding.ts:20–28, :47`). Its own contract also declares
`advisoryOnly: true, canBypassHumanReview: false`, so using it as a gate authority would contradict
its published boundary. Violates **C3**.

**A legitimate B variant.** Classify from the **observation and deterministic HazLenz findings**
only — inputs the model did not author — and never from the declaration's prose. This is
architecturally sound and is a genuinely different option from A: it moves authority to a module
with its own evidence pins, and it makes the escalation input **model-independent**, which A cannot
claim. It is also the most expensive option to build and validate, because a risk classifier is a
safety product in its own right and would need its own cohort, its own scorer, and its own accuracy
claim before it could gate anything.

**What the provider gains.** In the legitimate variant: **nothing at all**, since no model output is
an input. This is the only option with that property besides C and F.

**Failure modes.** *False:* the classifier's own error rate becomes a fail-closed rate, and it is
opaque to the reviewer of any single row. *Missed:* the classifier's coverage gaps are the system's
escalation gaps, and a knowledge-base-shaped blind spot is invisible until adjudicated.

**Deterministic testability.** High, and separately scorable against its own truth — a real
advantage. But it needs *two* validated things (classifier accuracy, then escalation policy) where
A needs one.

**Evidence needed.** Axis R, plus an independent accuracy claim for the classifier on a cohort it
was not built from, plus a demonstration that its inputs exclude model-authored text by
construction and not by convention.

**Reversibility.** High — it is a separate module behind a flag.

**Interaction.** Same as A at the gate. Additionally worth noting: because its input is the
observation rather than the declaration, a B-escalation is **not** `modelAuthored` in origin, which
is the cleanest available answer to F4 — the escalation authority is non-model even where the fact
is.

---

### Option C — Human escalation only

**Mechanism.** No automatic escalation. A human reviewer may raise a fact's priority; nothing else
can.

**Authority.** A named human. Strongest possible on **C1**.

**What the provider gains.** Nothing.

**Failure modes.** *False:* rare and attributable. *Missed:* **structural and total** in the
customer path. There is no human in the loop at analysis time. C therefore does not answer the §196
question as posed — it converts a runtime gating question into an offline review workflow. It is a
legitimate answer for a *review* product and a non-answer for an *analysis* product, and which
InSite is here is a product decision, not an engineering one.

**Deterministic testability.** The escalation act is auditable; the human's judgement is not
testable and is not meant to be.

**Structural blocker (F3).** A human escalating an already-admitted fact mutates `priority` on a
ledger fact and produces `FACT_IDENTITY_MUTATED`. C is **not implementable as a priority edit**. It
would need either a pre-admission human step (impossible at analysis time) or an additive
escalation record — at which point C is a special case of E's overlay.

**Evidence needed.** Whether any human-in-the-loop point exists in the intended product flow before
the customer sees questions. This is answerable from the product design, not from a measurement.

**Reversibility.** Total.

**Interaction.** None automatic. Under C the floor stays exactly as it is at analysis time, so C and
F have the same runtime behaviour and differ only in what happens afterwards.

---

### Option D — Model nomination + deterministic or human confirmation

**Mechanism.** The model may **nominate** a fact for escalation on a bounded structured wire —
never a `priority` value, and ideally never the vocabulary member itself. HazLenz confirms or
declines by a rule (deterministic confirmation) or a person does (human confirmation). Only the
confirmation writes anything.

**Authority.** The confirmer. The nomination is a **request**, exactly as `ArbitrationRequest` is a
request with `settles: false` typed as a literal (`owed-fact.types.ts:243–253`). F7 shows the
authority matrix already carries this pattern for the life-critical surface: `permitted:
['CHALLENGE']`, `onDisagreement: 'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW'`.

**What the provider gains.** The ability to **raise** the question of escalation, and nothing more —
provided the confirmer is not a rubber stamp. This is the whole risk of D: a deterministic confirmer
that confirms almost everything is Option A with an extra hop and a false sense of containment. The
confirmation rule's **decline rate on nominations** is the metric that decides whether D is D or is
A wearing D's clothes, and it must be preregistered as such.

**Failure modes.** *False:* a persuasive nomination plus a permissive confirmer. §167's draws are
the standing precedent — *"every one of them would have been persuasive to a rule that accepted
explanation as authority"* (`owed-fact.types.ts:196–201`). *Missed:* the model does not nominate,
and a nomination-only architecture has no other path; D's recall ceiling is the model's nomination
recall, which is itself unmeasured.

**Deterministic testability.** Good and unusually well-shaped: nomination and confirmation are
**separately** measurable. Nomination recall/precision is a model behaviour scored against human
truth; confirmation behaviour is a pure function replayable offline. Two clean denominators.

**Structural note (F3).** Confirmation must happen **before** the fact is admitted to the ledger, or
be represented additively. Since a first-pass nomination arrives in the same response as the
declaration, pre-admission confirmation is achievable for D-at-first-pass and is **not** achievable
for a verifier-stage confirmation of an already-admitted first-pass fact — that variant needs E's
overlay.

**Evidence needed.** (i) Axis R. (ii) A measured nomination rate and its precision/recall against
human truth, on a **balanced matched-pair** cohort — escalation-warranting and non-warranting rows
matched on every surface feature — never a pile of critical rows. (iii) The confirmer's decline rate
on real nominations. (iv) A negative control: nominations authored to be persuasive-but-unwarranted,
to prove the confirmer declines them.

**Reversibility.** Moderate. The wire field is a treatment change — schema descriptions are
load-bearing prompt engineering here (§199 records that §104/§105/§138 each measured behaviour
changes from description wording), so adding a nomination field is itself a treatment that
invalidates prior first-pass evidence and needs its own validation. **And there is a hard current
constraint:** §199 established that the vNext first-pass schema already sits at this provider's
grammar-size limit — the capability-present rows were rejected with *"The compiled grammar is too
large"* at ~19,060 bytes against ~18,620 accepted. **Any wire addition today competes for budget with
the governed-binding capability that is already blocked.** D is not currently transportable without
resolving that first.

**Interaction.** Writes the same field; same F4 problem as A unless the confirmer is non-model.

---

### Option E — A bounded two-stage architecture

**Mechanism.** Facts enter at the floor, exactly as today. A **separate, additive** escalation
record — not a mutation — may later attach to a fact, and the budget/gate consult
`priority` **plus** admitted escalation records. Concretely: an append-only `escalations[]` beside
`transitions[]`, each entry carrying a `factKey`, an **authority** drawn from a closed set (the
direct analogue of `TRANSITION_AUTHORITIES`), and a justification; and
`UNDROPPABLE_PRIORITIES`/`PRIORITY_RANK` read the effective priority rather than the stored one.

**Authority.** Whoever the escalation record's authority names — which is the point: E is a
**container** for A, B, C or D rather than a rival to them, and it is the only option that makes the
escalating authority a first-class recorded value rather than an implicit property of where the code
sits.

**What the provider gains.** Nothing structurally. `escalations` would join
`PROVIDER_FORBIDDEN_OWED_FACT_FIELDS`, and the closed authority set would have no member for a model
explanation, by the same construction as `TRANSITION_AUTHORITIES`.

**Failure modes.** *False:* whatever the chosen inner authority's false rate is — E does not reduce
it, it only records it. *Missed:* same. E's real failure mode is **complexity**: a second gating
input means two places to read before knowing whether a fact escalates, and every consumer must be
updated together or the two disagree.

**Deterministic testability.** Highest of the six. An append-only escalation ledger is testable with
the machinery that already exists for transitions: `preservationViolations`,
`factsRemoved`, authority-mismatch throws, and a "no escalation without a recorded authority"
invariant that mirrors `bindingSideEffects` (`owed-fact-binding.ts:364–377`).

**The property no other option has.** E is the only option that **satisfies F3 without moving
escalation to admission time**. It is therefore the only option under which post-hoc escalation —
by a verifier nomination, a later deterministic pass, or a human — is representable at all.

**Evidence needed.** Axis R, plus everything the chosen inner authority needs, plus a demonstration
that every consumer of `priority` reads the effective value (a grep-complete list: `owed-fact-binding.ts:417`,
`structural-questions.ts:108, :138, :206–207, :227`, `verifier-v3-development-boundary.ts:121`,
`expert-target-coverage.ts:104–108`, `owed-fact-ledger.ts:256`).

**Reversibility.** Good in behaviour — with zero escalation records the system is byte-identical to
today. **Poor in contract terms:** it changes `OwedFact`/ledger shape, and `owed-fact.types.ts` has a
pinned sha256 (`102d059bc477270d…`) asserted by every integrity gate since §187. This is the *same*
blocker §196 recorded for the `missingFact` field, and the two questions should be decided together
under one protocol version rather than serially — that is a coordination finding, not a
recommendation.

**Interaction.** Requires touching both the gate and the budget, and is the natural place to
reconcile F4: an escalation record could carry the corroborating non-model authority that
`modelAuthoredOnlyFailClosedKeys` demands, making the two contracts consistent instead of merely
coexistent.

---

### Option F — Status quo

**Mechanism.** `FIRST_PASS_PROJECTED_PRIORITY = 'OTHER'`, unchanged. The cost stays recorded in
`PROJECTION_RESIDUAL_LIMITS` and asserted by §196 case S2.

**Authority.** HazLenz, by constant. Maximum on **C1**.

**What the provider gains.** Nothing, on any path, by construction.

**Failure modes.** *False:* **zero**, by construction — no first-pass fact can manufacture a
fail-closed state. *Missed:* every genuinely life-critical first-pass gap, in the sense of §1.3 —
last in ranking, first suppressed, no gate. Bounded by F1: the coverage warning still fires and the
fact still survives internally.

**Deterministic testability.** Complete and already tested.

**Evidence needed.** None to continue. Axis R to know what it costs.

**Reversibility.** N/A.

**Interaction.** Consistent with F4 today: a model-authored fact is barred from alone justifying a
fail-closed state, and F is the only option that never puts it in a position to try.

**The honest case for F.** It is the only option currently supported by evidence, because the
evidence needed to prefer any other option does not exist (Section 7). It is also the only option
that is not a treatment change, and therefore the only one that does not invalidate §198's 89/89 or
§199's execution evidence. **The honest case against F** is that "no evidence yet" is a reason to
measure, not a reason to conclude — and that F's miss cost is the one cost that leaves no artefact.

---

## 5. Comparison against C1–C6

| | A rule | B classifier | C human | D nominate+confirm | E two-stage | F status quo |
|---|---|---|---|---|---|---|
| **C1** authority not model-derived | partial — model picks the inputs | **yes** (observation-only variant) | **yes** | depends entirely on the confirmer | inherits inner option's | **yes** |
| **C2** deterministic replay | **yes** | **yes** | audit only | nomination no / confirmation yes | **yes** | **yes** |
| **C3** non-semantic inputs | **yes** | **yes** in the legitimate variant; **no** if it matches prose | declared human | nomination is semantic and declared as such | inherits | **yes** |
| **C4** preservation-compatible | **yes** (admission-time) | **yes** (admission-time) | **no** as an edit | yes at first pass; **no** post-admission | **yes** — the only post-hoc-safe option | **yes** |
| **C5** falsifiable both ways | **yes** | **yes**, twice over | miss rate not measurable | **yes**, two clean denominators | **yes** | miss rate needs axis R |
| **C6** reversible | high | high | total | **blocked today** by the §199 grammar limit | behaviour yes / contract no (pinned hash) | n/a |
| resolves **F4** | no | **yes** | n/a | no | **yes**, if designed to | n/a (consistent already) |

Two options are eliminated on structure rather than on evidence: **C as a priority edit** and
**D as a post-admission confirmation** both violate F3 and are only expressible inside E.

---

## 6. Findings that hold whichever option is eventually chosen

These are not contingent on axis R and could be acted on independently under separate authorization.

1. **F5's seam.** `NominationPayload.priority` is copied to the ledger and the forbidden-field scan
   does not reach it. Containment is a caller default. Worth hardening regardless.
2. **F4's inconsistency.** `selectQuestionsForBudget` and `modelAuthoredOnlyFailClosedKeys` state
   two rules about model-authored facts and fail-closed states and do not consult each other.
3. **F6's linkage dependency.** Clarification-linkage yield is a prerequisite measurement for every
   escalating option and is not currently reported per run.
4. **The transport ceiling.** Any wire addition — an escalation nomination included — competes with
   the governed-binding capability that §199 found already over the provider's grammar budget.
5. **The pinned-hash coupling.** E and §196's `missingFact` question both require mutating
   `owed-fact.types.ts`. They are one protocol-version decision, not two.

---

## 7. The evidence that does not exist — stated rather than worked around

**Axis R has 0 of 8 verdicts supplied.** The §199 adjudication packet defines
`R_PRIORITY_FLOOR_IMPACT` per fact, over the 8 projected facts, with the explicit note
*"MEASUREMENT ONLY. Does not authorise changing the gate."* §200 built the session and supplied
nothing: `verdictsSupplied: 0`, `HUMAN_ADJUDICATION_COMPLETENESS: "0 / 152"`, `STATUS: UNMEASURED`.

**Therefore:**

- **No option can be ranked on how often the floor actually under-escalates.** That quantity is
  exactly what axis R measures and it has not been measured once.
- Nothing in Sections 4–6 uses a §199 fact's content as an argument. Where §199 data appears
  (the `affectedDecision` distribution in A3) it is a mechanical count used to show what a rule
  would *do*, carrying no claim about whether doing it would be right.
- **Even when supplied, 8 verdicts will not settle this.** The denominator is the 8 executed
  projected facts — the executions where the behaviour was genuinely available — and per this
  programme's small-n rule an axis below n=5 is not meaningfully estimable as a rate while n=8 must
  be reported as x/8 literally, never as a percentage. Eight facts, from ten rows, on one provider,
  under one treatment, cannot support an option choice. They can support a **decision to run the
  experiment in Section 8**, or a decision that the observed impact does not warrant one.
- The §199 truth manifest is AI-authored and product-owner-unreviewed
  (`FULLY_INDEPENDENT_HUMAN_AUTHORING: false`, `neverDescribeAs: "independent human truth"`), and
  §200 records `TRUTH_SPECIFICATION_DEFECT` as a first-class outcome. An R verdict divergence is
  equally consistent with a defective floor and a defective expectation.
- If R verdicts are formed after reading §199's deterministic results, that disclosure must be
  recorded structurally alongside them and must travel with every figure derived from them
  (§199 `disclosureRequirement`).

---

## 8. Recommended future experiment

**This recommends measuring, not adopting.** No option is endorsed below.

The leading candidates on the analysis above are **A**, **B (observation-only variant)**, **D**, and
**F**, with **E** as the container any post-hoc variant would need. What separates them is not one
quantity but three, and the experiment is built to measure those three and nothing else.

### Phase 0 — prerequisite, not an experiment (zero cost, zero provider calls)

The product owner supplies the 8 axis-R verdicts in
`verification/expert-hazlenz-successor-structured-e2e-2026-09-07/ADJUDICATION-PACKET.json` /
`…semantic-adjudication-2026-09-07/ADJUDICATION-WORKSHEET.json`, with the AI-assistance disclosure
recorded structurally. **Report as x/8, never as a rate.**

**Decision gate D0, preregistered before the verdicts are read:** if 0 of 8 are `INCORRECT`
(materially under-escalated), the experiment is **not** run and the finding is recorded as
*"no observed under-escalation on the only cohort executed; n=8; not evidence of absence."* If ≥1 is
`INCORRECT`, proceed. This gate must be fixed in writing before any verdict is supplied, or it is
not a gate.

### Phase 1 — measure the three discriminating quantities

**Q1 — Under-escalation base rate.** Axis R over a purpose-built cohort. Decides whether any
mechanism is warranted at all.

**Q2 — Structural separability (decides A, and B's feasibility).** Can a **preregistered** closed
rule over non-prose fields reproduce the human R verdicts? Preregister the exact rule, its inputs,
and its hash **before** any R verdict on the new cohort is read. Score offline from
`PROJECTION-PROVENANCE.jsonl` with **zero provider calls**. A rule proposed after seeing the verdicts
is fitted and is not evidence (A5).

**Q3 — Nomination reliability (decides D).** On a wire carrying a bounded escalation *nomination*
and no priority value: nomination recall, nomination precision, and the confirmer's decline rate on
nominations — three separate figures, never collapsed.

**Not measured, and declared so:** alert-fatigue cost. The customer surface is undesigned and
`presentationThresholds` are unset. Any fatigue number produced today would be invented.

### Cohort

Reuse this programme's existing composition contract rather than inventing one.

- **Class `LIFE_CRITICAL_PRESENT`: minimum 10, preferred 15** rows
  (`expert-cohort-composition.ts:251`).
- **Balanced matched pairs.** Each escalation-warranting row paired with a non-warranting row
  matched on hazard family, observation length, governed-capability presence, declaration count and
  phrasing register. Never a separate pile of critical rows, and never padded to a target.
- **Supply before authoring.** Spend reserved negative-control supply first — check
  `verification/expert-hazlenz-d86-reserved-open-2026-09-01/` and the §197 cohort
  (`backend/scripts/lib/expert-197-cohort-2026-09-07.ts`) — before authoring new truth.
- **Truth authored independently of the escalation rule's author**, and the rule preregistered and
  hashed before the truth is read.
- **Prerequisite measurement:** clarification-linkage yield per row (F6), reported alongside, since
  an escalating option's fail-closed rate is a function of it.

### Preregistered gates

Fixed before execution; denominators are **opportunity**, never total executions.

| gate | statement |
|---|---|
| **G1** | R adjudicated on every executed fact; unadjudicated ⇒ the whole experiment is `UNMEASURED`, never "no defects observed". |
| **G2** | Under-escalation rate reported as x/n on facts where escalation was *available*. n<5 ⇒ `NOT_MEANINGFULLY_ESTIMABLE`; n<10 ⇒ literal x/n, no percentage. |
| **G3** | Q2 scored **only** against the rule hash registered pre-verdict. A post-hoc rule is reported separately and labelled `FITTED_NOT_VALIDATED`. |
| **G4** | Q3 reports nomination recall, nomination precision and confirmer decline rate as three figures. A confirmer decline rate of 0 on ≥5 nominations ⇒ D is reported as `INDISTINGUISHABLE_FROM_OPTION_A`. |
| **G5** | Hard fail: any provider-authored priority value reaching a ledger (carrying §199's existing hard-fail forward). |
| **G6** | Hard fail: any `FACT_IDENTITY_MUTATED` or `preservationViolations` non-empty result under any prototype. |
| **G7** | Every prototype is an **additive successor module** (v-next discipline). §195–§200 evidence stays attached to the hashes that produced it. |
| **G8** | Any numeric movement is an **OBSERVED NUMERIC RESULT**, not a causal claim, absent a replicate design. |
| **G9** | Zero production activation, zero customer activation, zero database operations. |

### What the experiment cannot settle

Which cost the product should prefer. Once Q1–Q3 exist, the choice between "escalate more and accept
false fail-closed states" and "escalate less and accept invisible misses" is a **product-owner
judgement about acceptable risk**, not an engineering conclusion. The experiment can say how often
each occurs; it cannot say which is worse.

---

## 9. What this document does not decide

- It supplies **no** axis-R verdict and grades **no** §199 fact.
- It **recommends no option** — the recommendation is Phase 0, then the Section 8 experiment.
- It authorizes **no** change to `UNDROPPABLE_PRIORITIES`, `COVERAGE_PRIORITY_GATE`,
  `FIRST_PASS_PROJECTED_PRIORITY`, `owed-fact.types.ts`, or any wire.
- It modified **no** runtime file. Sole deliverable: this document.
