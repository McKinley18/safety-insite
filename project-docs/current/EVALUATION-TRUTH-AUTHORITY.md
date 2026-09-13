# Expert HazLenz — Evaluation Truth Authority

Adopted §157, 2026-09-04. A standing policy about **who is permitted to decide that an answer is
correct**. It governs every future acceptance artifact and does not rewrite a single historical
score.

---

## The rule

> **A PROVIDER OR MODEL UNDER EVALUATION MUST NEVER BE TREATED AS THE FINAL AUTHORITY ON WHETHER ITS
> OWN ANSWER IS CORRECT.**

This is not a statement about how well models judge. It is a statement about what an evaluation *is*.
An instrument that supplies both the measurement and the standard it is measured against has no
independent scale, and a number produced that way cannot support a safety claim regardless of how
good it looks.

## What model assistance may do

Model assistance is legitimate, useful, and used throughout this programme. It **may**:

- construct candidate fixtures and draft observation text;
- organise evidence, assemble packets, and cross-reference stored artifacts;
- identify possible issues, contradictions and gaps for a human to consider;
- draft proposed truth for human review.

Each of these produces material a human then accepts, amends or rejects. None of them decides.

## What final load-bearing evaluation truth must derive from

1. **Governed regulatory evidence** — the corpus, with its provenance and retrieval date.
2. **Deterministic facts** — what the deterministic engine emitted, what the observation states, what
   the contract permits.
3. **Contract semantics** — the frozen vocabulary and the rules already written down.
4. **Product-owner or human safety judgment**, wherever semantic adjudication is required — which is
   wherever the answer turns on whether a fact would change what a person does.

## The corollary that does the work

> **MODEL AGREEMENT WITH MODEL-AUTHORED TRUTH IS NOT INDEPENDENT VALIDATION.**

When the truth and the answer come from the same model family, agreement is the expected outcome
whether or not either is right, and disagreement is the only informative result. §156 measured 8 of
10 exact agreement, and under this rule the honest reading is that **the two disagreements are
stronger evidence than the eight agreements**.

## What every future acceptance artifact must identify

| field | meaning |
|---|---|
| `truthAuthor` | Who authored the truth: a named human, or a model with a named human reviewer |
| `evidenceSource` | What the truth derives from — governed corpus, deterministic output, contract, observation |
| `humanReviewStatus` | `REVIEWED_AND_ACCEPTED`, `REVIEWED_WITH_AMENDMENTS`, `NOT_REVIEWED` |
| `evaluatedModelFamilyContributedToTruth` | `true` / `false` — the §156 caveat, made a required field |

A `true` in the last row does not invalidate an artifact. It **caps** what the artifact can support:
it may support a development decision, and it may not, on its own, support an acceptance claim.

---

## §156 truth provenance, classified honestly

    truthAuthor                              Claude (Opus 5), deriving from the frozen hardened v9
                                             authored truth
    evidenceSource                           hardened v9 authored truth (digest 434c127c…a7fe194,
                                             authored §151), plus the stored first-pass output and
                                             the observation text
    humanReviewStatus                        NOT_REVIEWED  (the manifest was frozen and executed
                                             inside one operation; no human adjudicated the fifteen
                                             verdicts before or after spend)
    evaluatedModelFamilyContributedToTruth   TRUE
    classification                           DEVELOPMENT_EVIDENCE — NOT ACCEPTANCE EVIDENCE

**What that costs, precisely.** §156's headline figures — 80% exact, 90% semantic, 7/7 specificity —
are development observations from an instrument whose standard was authored by the model family being
graded. They may guide the next development step. They may not be quoted as accuracy, they may not
appear in a claim, and they may not be carried into acceptance without independent human
adjudication of the fifteen verdicts.

**What survives the caveat unharmed, and why.** Two §156 findings do not depend on the truth manifest
at all:

- **HS-H1 was not repaired in either draw.** VC-13 returned `NO_CLARIFICATION_REQUIRED` and VC-02
  proposed a question about the over-temperature alarm. Neither mentions the load-side thermal state.
  That is a fact about the verifier's output text, readable without any adjudication.
- **Zero questions were manufactured on the seven silence cases.** The verifier returned no
  `ADD_OR_REPLACE_CLARIFICATION` on any of them. Whether *silence was correct* on each is
  adjudication; whether the verifier *stayed silent* is not.

The §156 terminal rests on those two, which is why it stands.

## What this means for §157 and after

§157's local matrices are structural: they test whether a nomination *satisfies the admission rule*,
which is a property of the object, not a judgement about safety. Where §157 asserts a nomination is
*correct*, it inherits the same caveat and must say so.

**The v9 authored truth is not exempt either.** It was authored with model assistance in §151. It was
reviewed and frozen, which is why it is the strongest standard available here — but the review was a
freeze-and-digest, not an independent human adjudication of each row's safety reasoning. Any future
acceptance run needs a standard that clears this bar, and building one is a distinct piece of work
that no operation to date has performed.

---

## Standing consequence

No terminal containing the word `PROVEN`, and no artifact offered as acceptance evidence, may rest on
truth whose `evaluatedModelFamilyContributedToTruth` is `true` and whose `humanReviewStatus` is
`NOT_REVIEWED`. Development terminals may. This document is the reason a future reader can tell the
two apart.

---

## §162 — the policy's first completed cycle, and what it cost

Adopted §157, exercised through §158–§162. The full cycle ran: model-authored truth → human
adjudication packets → product-owner dispositions → re-derivation on human-reviewed truth only.

**Seven rows went to a human. Two survived as authoritative.**

| row | disposition | prospective strict semantic truth |
|---|---|---|
| HS-A1 | `AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS` | **ELIGIBLE** |
| HS-E1 | `AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS` | **ELIGIBLE** |
| HS-H1 | `AUTHORING_AMBIGUOUS` | INELIGIBLE |
| HS-R1 | `AUTHORING_AMBIGUOUS` | INELIGIBLE |
| HS-J1 | `AUTHORING_INVALID` | INELIGIBLE |
| HS-N1 | `AUTHORING_INVALID` | INELIGIBLE |
| HS-P1 | `AUTHORING_INVALID` | INELIGIBLE |

**Five of seven rows of model-authored evaluation truth did not survive independent human review, and
three were outright invalid.** That is the measured cost of the practice this document prohibits, and
it is the strongest available argument for the policy: had the §156/§157 figures been accepted as
acceptance evidence, they would have been computed against a standard that a human later found
invalid on three rows and ambiguous on two more.

### What that did to the figures

**The recall side survived and improved.** On the two authoritative rows every clarification produced
reached the human-reviewed semantic target, with the correct `affectedDecision`.

**The silence side did not survive at all.** All seven legitimate-silence draws came from HS-P1,
HS-R1 and HS-N1 — now invalid, ambiguous and invalid respectively. `LEGITIMATE_SILENCE_SPECIFICITY`
is therefore `INSUFFICIENT_HUMAN_TRUTH`. The former **7/7 may be reported only as
`HISTORICAL_MECHANICAL_SILENCE_BEHAVIOR = 7/7`**, carrying the warning that its semantic truth basis
was subsequently invalidated or made ambiguous. It is not a specificity score and must never again be
quoted as one.

The same downgrade applies to the "zero false nominations across fifteen cases" figure: it rested on
the same FORBIDDEN labels and is now a mechanical containment observation only.

### The asymmetry worth remembering

Human review **removed** far more of the silence-side evidence than the recall side. A silence row
asserts that *nothing* is decision-critical, which is an unbounded claim about everything the
observation does not say; a REQUIRED row asserts one named fact, which is bounded and checkable.
**Expect authored silence truth to be the more fragile of the two, and price it accordingly when
planning how much human review a cohort needs.**

### Prior work is not retroactively corrected

§152–§160 fixture authoring, scoring, REQUIRED/FORBIDDEN labels and terminals remain exactly as
executed. They are **historical development evidence, not retroactively corrected formal truth.** The
dispositions above take effect prospectively only.

---

## §163 — what human-reviewed truth bought, measured

The §162 cycle left two authoritative rows. §163 spent 20 hosted draws against them and the result
justifies the whole apparatus: **4 of 20 draws reached the human-reviewed target.** Under the retired
keyword scorer, several of the 16 misses would have scored differently — the HS-A1 displacement
questions are about a real, stated hazard and share vocabulary with the observation.

**Truth that a human has reviewed is what makes a miss visible.** Without it, a well-formed question
about the wrong fact is indistinguishable from a well-formed question about the right one, and the
measurement would have reported a healthy verifier.

One consequence for future truth authoring: a row's authored truth must be able to distinguish the
owed fact from **other genuine hazards the same observation states.** HS-A1's observation supports at
least two real safety questions; only one is the authored target. That is not a defect in the row — it
is a property of real observations, and evaluation truth has to survive it.

---

## §164 — the boundary this policy implies for architecture, not just for scoring

Designing the owed-fact coverage layer forced the policy to be stated as an *architectural*
constraint rather than only an evaluation one.

**Human-authoritative fixture truth may seed `owedFacts` in DEVELOPMENT instrumentation and must never
seed them in PRODUCTION.** Fixture truth is the standard the system is measured against. If it were
allowed into the production path it would become part of the system being measured, and the evaluation
would lose the independent scale this document exists to protect. Development instrumentation and
production architecture may share the *structure* and must never share the *population step*.

A second consequence, from the same principle: an `owedFact` whose provenance is model output — first-
pass retained uncertainty, or a verifier nomination — carries `modelAuthored: true` and **cannot alone
justify a fail-closed customer-visible safety state.** It can raise a question. It cannot assert a
hazard. Only deterministic HazLenz and governed evidence can do that.

Finally, the design records a class of thing that must never be automated at all: a model certifying
its own coverage, a model adjudicating whether its displaced answer was legitimate, automated semantic
equivalence used as a gate, and any automatic broadening of authored truth. Each is a route by which
the evaluated component would re-acquire authority over its own correctness.

---

## §165 — the boundary becomes executable, and one thing the code now refuses

§164 stated the population boundary. §165 implemented it, and the implementation is deliberately
harsher than the prose.

`backend/scripts/lib/expert-owed-facts.ts` carries `DEVELOPMENT_HUMAN_TRUTH` as a first-class
provenance member and omits it from `PRODUCTION_PERMITTED_SOURCES`. Both entry points —
`createOwedFactLedger('PRODUCTION', …)` and `addOwedFact()` — **throw**
`DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION`. They do not filter, and the choice is the point:
a filter would let a caller believe the fact was represented, and an evaluation-truth fact silently
absent from a production owed set is exactly the failure mode that is hardest to notice later.

The same discipline is applied to the semantic outcome taxonomy. §164 recorded that the split between
`VALID_BUT_TARGET_DISPLACED` and `INVALID_WRONG_FACT` requires human authority; §165 makes it
unreachable. `classifyDeterministically()` cannot return that pair, nor `TARGET_REACHED`, nor
`WRONG_AFFECTED_DECISION` — it returns an execution-class member, `SETTLED_SILENCE`, or the recorded
state `UNKNOWN_SEMANTIC_VALIDITY`. The only other door is `assignHumanAdjudicatedOutcome()`, which
refuses any provenance but `HUMAN_ADJUDICATION` and refuses an unnamed adjudicator. A model rationale,
a similarity score, a cue match and a majority of draws are all equally unable to reach it.

**One outcome IS assignable automatically, and the reason matters.** `SETTLED_SILENCE` is decided by
two structural facts — no clarification was emitted, and an owed fact existed — and reads no question
text. That is the line: a claim about what a question *is about* needs human authority; a claim that
*no question was asked* does not.

### The HS-A1 disposition, and why it does not improve any number

The product owner adjudicated the seven displaced auger outputs
`DISPLACED_FACT_VALID_DECISION_CRITICAL`. They are legitimate, decision-critical clarifications and
are **not** a clarification-precision defect. They remain an **owed-target-recall miss**, and §163's
3/10 is not rescored.

Those two statements are easy to collapse into "the verifier did better than we thought", so the code
prevents it: `summariseOutcomes()` returns `recall` and `precision` as separate objects and offers no
combined accuracy field, and `assertRecallAndPrecisionNotNetted()` throws if a displaced outcome has
been counted as a recall success. A disposition that makes a defect count smaller must not be allowed
to make a recall figure larger.

### A row may owe more than one fact

§163's HS-A1 recorded one `decisionCriticalGaps` entry while the observation supported two genuine
decision-critical questions. The disposition names the relationship `SIMULTANEOUS_INDEPENDENT_GAPS`.
Future truth authoring should assume a real observation can owe several facts at once, and should not
treat a single authored gap as an assertion that no other exists — because under the coverage
postcondition an unrepresented second gap is invisible rather than merely unscored.

---

## §166 — the inventory becomes a gate, and one falsifier loses its denominator

§162 adjudicated seven rows and §165 implemented the boundary. §166 was the first operation whose
plan actually *depended* on counting what survived, and the count changes what the next experiment
can claim.

```
human-authoritative REQUIRED   HS-A1, HS-E1        (AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS)
human-authoritative SILENCE    none
ineligible                     HS-H1, HS-R1 (AMBIGUOUS) · HS-J1, HS-N1, HS-P1 (INVALID)
```

**There is no surviving silence truth at all.** That is not a gap to be worked around; it is a
measurement boundary, and §166 records it as one:

```
FALSIFIER_D_TESTABLE = FALSE
```

Falsifier D asks whether making binding available causes the verifier to manufacture questions on
cases where staying silent was right. Answering it requires rows where a human has confirmed that
silence *was* right. Three of the four candidate rows were adjudicated `AUTHORING_INVALID` and the
fourth `AUTHORING_AMBIGUOUS`, so a denominator built from them would produce a precision figure
resting on truth a human rejected — which is worse than reporting no figure, because it would look
like evidence.

**The claim was narrowed rather than the falsifier weakened.** D stands exactly as §164 wrote it and
becomes testable when fresh, independently reviewed silence material exists. The experiment is
scoped to A, B, C, E and a scoped F, and the harness asserts mechanically that none of the four
ineligible rows appears in any request it builds.

### The asymmetry §162 predicted, now costing something concrete

§162 recorded that authored *silence* truth is the more fragile of the two kinds, because a silence
row asserts that nothing is decision-critical — an unbounded claim about everything the observation
does not say — while a REQUIRED row asserts one named, checkable fact. That prediction has now been
paid for: the surviving truth supports the recall half of the design's argument and cannot support
the precision half at all.

**The practical consequence for cohort planning is worth stating plainly.** When a future cohort is
sized, silence controls should be budgeted for *more* human review than REQUIRED rows, not the same
amount, and a design that needs both halves of a precision/recall argument should confirm both
denominators exist before the design is committed to — not after the protocol is built.

### Supplied owed facts are task state, and the distinction is now enforced in a prompt

v3 puts owed facts into the verifier's prompt for the first time. That makes a new leak surface
real: a fact carries a key, two branches and a decision divergence, and any of those could smuggle
in the authored answer. The rule adopted is that a supplied fact is **task state, not grading
truth**, and the harness greps every constructed request for row identity, fixture labels, expected
outcomes, historical performance, pass/fail state, dispositions and scoring vocabulary before any
spend is permitted.

Two exclusions in that grep are stated rather than left implicit, because a silent exclusion is how
a leak check stops meaning anything: `REQUIRED-CONTROL` is a frozen `affectedDecision` member
inherited byte-identically from v2, and `FIRST-PASS ANALYSIS` is a structural header the §156 packet
builder has always emitted. Neither is a fixture label.

---

## §167 — what human-reviewed truth bought, the second time

§163 spent 20 draws against the two authoritative rows and found 4 target hits. §167 spent 12 draws
against the same two rows under verifier protocol v3 and found 12. The comparison is the clearest
demonstration yet of why this document exists, and it cuts in two directions.

**First, the positive one.** The owed facts handed to the verifier were the §162 human-reviewed
targets, expressed as task state — a key, two branches, and the divergence between them. Every one
of the twelve draws bound that key, and every one of the twelve emitted a question the frozen §162
cue instrument matched. On HS-E1 the questions explicitly distinguished the interlock's protective
*function* from its physical closure, which is precisely the boundary §162's authored truth draws
and precisely what eight of ten v2 draws failed to reach by staying silent.

**Second, the caution, which matters more.** *The improvement cannot be attributed to the binding
protocol.* v3 changed three things at once: it added binding, it required a declaration for every
owed fact, and — this is the one that bears on truth authority — **it put a much fuller statement of
the owed fact into the prompt than v2 ever carried.** v2's packet supplied the flame-failure fact as
a candidate reference and an uncertainty sentence. v3 supplied `whyUnresolved`, both branches, and
what is done today under each.

That third change means the experiment partly measures *how well the truth was stated to the model*,
not only how well the model reasons. **That is a good property of a product and a dangerous property
of a measurement.** Recorded as a standing caution for this programme:

> When human-reviewed truth is supplied to the system as task state, the evaluation stops being
> blind to it. Any figure produced under such a design measures the pair — the truth statement and
> the model — and must be reported as measuring the pair. A future arm that varies the richness of
> the fact statement while holding the binding protocol fixed is the only way to separate them, and
> until one is purchased, no claim may attribute the result to binding alone.

### The silence gap is now the binding constraint on this programme

`FALSIFIER_D_TESTABLE = FALSE` cost something concrete for the second operation running. §166 could
not design the precision half of the experiment; §167 could not measure it. Twelve draws of strong
recall evidence sit beside **zero** evidence on whether the same architecture manufactures questions
where silence was right — and because both rows are `REQUIRED`, this run could not even accidentally
inform it.

**The asymmetry §162 predicted has now been paid for twice.** Silence-control material with
independent human review is no longer a nice-to-have for completeness; it is the single missing
input blocking the other half of every claim this architecture wants to make.

---

## §168 — the silence gap acquires a shape, and it is worse than a missing row

Three operations have now been blocked by the same absence. §166 could not design the precision half
of the experiment; §167 could not measure it; §168 tried to *build* the missing material and found a
second problem underneath the first.

Five candidate silence-control rows were drafted across five hazard domains — electrical isolation,
solvent vapour, work at height, noise, and powered-truck segregation. Each states the decision-
critical facts it settles with the verbatim span that settles them, and each lists the plausible
omitted facts a verifier might reach for together with an explicit argument that answering them
either way leaves today's action unchanged. They lint clean.

**And they cannot be used as drafted, for a reason that is a property of the row class rather than
of the drafting.**

```
candidate silence controls   559–592 characters
existing REQUIRED rows       402 and 412 characters
separation                   SEPARABLE_BY_LENGTH
```

A row that settles everything is longer than a row that leaves a gap. Every candidate is longer than
both REQUIRED rows, so **length alone separates the two classes perfectly** — and a verifier does not
need to reason at all to exploit a cue like that. Assembling a cohort from these five controls plus
the two authoritative REQUIRED rows would produce a measurement of nothing.

### The standing requirement this establishes

> A silence-control cohort must be checked for **class-separable surface features** before it is
> used, length first among them. The check belongs at assembly, not at authoring, because no single
> row can have the property — it is a property of the set. A control set whose rows can be sorted
> from the required rows without reading them is not a control set.

Two remedies exist and both cost something. Shortening the controls risks under-settling the very
facts that make them controls. Adding REQUIRED rows in the same length band means authoring new
evaluation truth, which needs its own independent review — and the two existing REQUIRED rows are
frozen §156 material that cannot be adjusted to close the gap.

### Why this is recorded here rather than as an engineering note

§162 predicted that authored silence truth would be the more fragile of the two kinds, because a
silence row asserts that *nothing* is decision-critical — an unbounded claim about everything the
observation does not say. That prediction has now been paid for a third time, and in a new currency:
not only is silence truth harder to author validly, **the act of authoring it validly makes it
recognisable.** Settling every relevant fact is what makes a row a control and is also what makes it
look like one.

Any future silence-control authorization should budget for the assembly problem, not only the
authoring problem.

---

## §169 — the sampling obligation pays for itself

§164 classified the truthfulness of a binding `REQUIRES_HUMAN_TRUTH` and required **human sampling
of bound pairs** rather than an automated judge. §169 is the first time that obligation was
discharged, and it found something no instrument in this repository could have found.

The §167 cue instrument scored **12/12 `TARGET_REACHED`**. Human review of the same twelve returned
**8 fully correct, 4 partially correct, 0 incorrect**. Both are right about different things:

```
the §162 cue instrument measures TOPIC REACH, not RESOLUTION SUFFICIENCY
```

The two agree completely on question A — every clarification asks about the owed fact, 12/12. On
question B, whether an answer would *resolve* it, the instrument is silent **by construction**: a cue
match cannot tell whether the evidence a question would accept is capable of settling the fact.

**§167 is not rescored.** Its figure stands as what it measured, and this is recorded as
`HUMAN_POSTHOC_ADJUDICATION` beside it. What changes is the *reading*: 12/12 topic reach with 8/12
human-confirmed resolution sufficiency.

### The defect the sampling found, stated as a standing authoring rule

Three HS-A1 questions offered "visually … verified", "control-panel status indicator" or "physical
inspection" as acceptable evidence alongside a functional test. Each of those is consistent with a
safeguard that is **present and non-functional**, so an answer citing one settles nothing. One HS-E1
question asked whether the interlock was tested "following this morning's return to service" when
the owed fact is verification *before* return to service.

> **A clarification bound to a protective-function fact must ask for evidence capable of
> establishing the function — a functional test, or an authoritative record of one. Physical
> presence, visibility, configuration and status indicators do not settle it, and a question that
> would accept them has not resolved the fact however precisely it names it.**

This belongs here rather than in an engineering note because it is a property of *what evaluation
truth demands*, not of how a model happens to phrase things. It also generalises the boundary §162
already drew on HS-E1 — that physical presence of the interlock switch does not establish protective
function — from the truth statement to the question that pursues it.

### Where the remedy should live

Prefer stating the acceptable evidence class **on the owed fact as HazLenz-owned task state** rather
than adding prose to the model instruction. The verifier is then *told* what would settle the fact
instead of being trusted to infer it, frozen semantic material is untouched, and a lesson learned on
one hazard family is not promoted into a global prior. Note what cannot be done: "does this question
demand function-establishing evidence?" is a semantic judgement, so no deterministic admission gate
can enforce it — that would be the matcher §160 retired. Residual sufficiency stays a human-sampling
obligation, permanently.

### And the axis that was deliberately not collapsed

Two draws were ruled `BINDING_SEMANTICALLY_CORRECT` **and**
`COMPOUND_QUESTION_REPRESENTATION = UNACCEPTABLE` at once. A semantic binding is not downgraded
because the customer-facing packaging is wrong. Record both; net neither.


---

## §170 — the boundary becomes a runtime type, and one new way truth could leak

The owed-fact architecture is now integrated into `src/`, inactive. Two things in that integration
bear on this document rather than on engineering.

### `acceptableEvidence` is a new surface through which truth could enter the measured system

§169's remedy was to tell the verifier what would actually settle an owed fact, rather than hope it
inferred the right evidence class. That is a genuine improvement and it creates a genuine hazard:
the criterion is *supplied to the thing being measured*, so an illegitimately authored criterion
would be evaluation truth leaking into the system under evaluation by a new route.

The provenance policy is therefore part of truth authority, not configuration:

```
may populate in PRODUCTION      DETERMINISTIC_RULE_METADATA · GOVERNED_EVIDENCE
                                AUTHORED_HAZLENZ_SAFETY_CONTRACT
                                VALIDATED_DOMAIN_CONTROL_DEFINITION

may NEVER populate production   DEVELOPMENT_HUMAN_TRUTH · ADJUDICATION_LABEL · MODEL_SELF_AUTHORED
```

All three forbidden provenances **throw** rather than being filtered.

**`ADJUDICATION_LABEL` is listed separately from development truth, and the distinction is the
interesting one.** A §169-style disposition is a judgement *about the system's output*. Feeding it
back in as task state would close the loop the evaluation depends on being open: the system would be
told what a human concluded about its previous answers, and every subsequent measurement would be
partly a measurement of that feedback. It is the same failure as fixture truth seeding owed facts,
arriving one level up.

> **A judgement about the system's output may never become an input to the system.** Development
> fixture truth, adjudication dispositions and model self-authored criteria are all barred from
> production task state, and where no legitimate source exists the correct value is null.

**Null is the expected value at first, and must stay comfortable.** A programme that finds nulls
embarrassing will fill them, and the only material available to fill them with is exactly the
material the policy forbids.

### The human-sampling obligation is now an architecture requirement

```
BOUND_BINDING_TOPIC_REACH  !=  RESOLUTION_SUFFICIENCY
```

Recorded in the integration itself: any future activation evaluation must independently sample both
whether a question addresses the bound fact **and** whether it asks for evidence sufficient to
resolve it. The §162 cue instrument answers only the first and may not be substituted for the
second. `HUMAN_REVIEWED_RESOLUTION_SUFFICIENCY` is maintained as its own metric, and its current
value — 8 of 12 — is an exact count on twelve draws over two rows that may not be published as a
rate.


---

## §171 — governed truth can now reach the verifier, and it is thinner than the question needs

`acceptableEvidence` is populated for the first time from a real approved-knowledge record: OSHA
1910.147, `app-loto-01`, approved by a Safety Manager in June, carrying
`verificationMethods: ['zero_energy_verification']` and
`commonWeakActionsToAvoid: ['warning_only']`. The derivation copies that vocabulary rather than
paraphrasing it, and the requirement sentence is a hazard-agnostic frame with governed values
substituted. **No evaluation material, disposition or adjudication label is an input.**

### The family had to be chosen against the grain, and that is the finding

The instruction preferred a family related to an observed sufficiency weakness. **The governed
source does not support one.** The §169 weaknesses were about protective *function* — flame-failure
and interlock — and:

- `app-fire-01` (1910.157) is about portable extinguisher tags, not burner safeguards. Using it
  would have been manufacturing a criterion to fit history.
- `app-mg-01` (1910.212) is worse: its only verification method is **`physical_inspection`**, the
  exact evidence class §169 ruled insufficient. Deriving from it would have produced a *governed*
  criterion contradicting the *human* review.

So the family was chosen on what the governed source can honestly support, not on what would have
made the slice look responsive to history.

### The vocabulary gap, stated as a truth-authority problem

Across all twenty approved records the distinct verification methods are:

```
audit · design_review · gas_detection · inspection · observation
physical_inspection · visual_inspection · walkthrough · zero_energy_verification
```

**Seven of nine are looking-based.** Only `zero_energy_verification`, and arguably `gas_detection`,
establish a *state* rather than an appearance.

The sharpest instance sits inside one record. `app-mg-01` asks, in its own `evidenceQuestions`,
both *"Is the guard present?"* and *"Is the guard functional?"* — and offers a single verification
method, `physical_inspection`, which answers only the first. **The record's own evidence question
outruns its own verification method.**

> A governed record can be perfectly valid for the purpose it was approved for and still be too
> coarse to settle a fact the evaluation cares about. Deriving evaluation-facing criteria from
> governed material does not inherit the governance's authority for questions the governance never
> asked, and the derivation must fail closed to null rather than stretch the record.

That is why `null` is not a defect and must stay comfortable: for most families today, the honest
governed answer is that no criterion exists yet.

### What this does not license

A populated criterion states what verification the governed record recognises. It does not state
that a particular clarification elicits it. Nothing compares a question to a criterion, and adding
such a comparison would be the matcher §160 retired. **Resolution sufficiency remains human
sampling, permanently, whatever `acceptableEvidence` carries.**


---

## §172 — the control class keeps announcing itself

§168 found the silence controls separable from the REQUIRED rows by length. §171 reauthored them
into a matched band. §172 measured the repaired set against six further confounds and found **two
more separators, both material**:

```
VOCABULARY        twelve verification words appear ONLY in controls:
                  checked, deployed, initialled, locked, padlocked, records,
                  sheet, shut, survey, surveyed, tag, tested
                  The REQUIRED rows contain one of them, and there it is not a verification.

DECISION CATEGORY no control shares a hazard domain with either REQUIRED row.
                  Class is perfectly predictable from hazard family.
```

Either alone lets a model sort the classes without applying clarification semantics. A one-token
rule — *if the text says "tested", stay silent* — would score perfectly on this corpus.

### The property this is the second instance of

> **Authoring a valid silence control tends to make it recognisable as one.** A control settles its
> facts, and settling a fact usually requires saying it was verified. A REQUIRED row leaves a fact
> open and has no reason to say so. The surface features therefore attach to the row *class* rather
> than to the individual row — and they will keep reappearing on new axes until the corpus is
> designed as a matched set rather than as two independently authored piles.

Length was the first instance. Vocabulary and hazard domain are the second and third. The lesson is
not "check length", it is **check for class-separable surface features as a set, and expect to find
new ones each time a previous one is fixed.**

### The repair is more expensive than it looks, and the cost falls on the REQUIRED side

The controls cannot simply drop verification vocabulary — they need it to settle facts. The balance
has to come from the other side: **new REQUIRED rows that contain verification language and still
leave one decision-critical fact open** — a guard function-tested last month whose interlock switch
was replaced this morning and not retested. Those are new authored evaluation truth and need their
own independent review, at the same standard as the controls. The two frozen REQUIRED rows cannot be
edited to help, and padding them is forbidden.

**So the silence-side blocker is not one authoring task but two**, and a corpus adequate for a
precision measurement requires balanced authoring on both sides before any adjudication is spent.

### And a procedural rule, restated because it now bites

Adjudication attaches to the exact wording reviewed. Because the confound repair will change the
control text, adjudicating the current five rows would be void work — which is why §172 returns an
unfilled instrument rather than a set of verdicts. Author the final wording first; adjudicate that.


---

## §173 — building the instrument as pairs, so the confounds cannot come back

§168 lost on length. §172 lost on vocabulary and hazard family. The pattern was that the two classes
were authored as two independent piles, and every time one surface feature was equalised another
turned out to separate them.

§173 changes the construction rather than the wording. **Each case is authored as a matched pair:
one hazard family, one target decision, one target factKey, the same operational scene, and exactly
one fact whose settlement state differs.** Both sides say that surrounding facts were checked,
tested, signed, recorded or witnessed; the REQUIRED side does not become vague, it leaves one named
fact open while verifying the rest.

That makes two confounds *structurally impossible* rather than merely absent:

```
hazard family      both classes contain every family, because every family is a pair
target decision    both classes contain every decision, for the same reason
```

They cannot silently return when the set grows, because growing it means adding pairs.

### The negation trap, which is worth recording

The first draft was perfectly separable on negation count: SILENCE 0–1, REQUIRED 1–2, every REQUIRED
row carrying exactly one more than its partner. **Saying that a fact is unsettled naturally recruits
a negation.** The fix was to give the SILENCE rows negations about non-target facts, so the ranges
became identical and the per-pair difference changes sign.

This is the third surface feature to behave this way, after length and verification vocabulary, and
the generalisation is now firm enough to state as a standing rule:

> **The properties that make a row a valid negative control are properties a classifier can learn.**
> Expect every equalised surface feature to be replaced by another, and re-run the full confound
> scan on every expansion of a control corpus. A corpus is only as good as its most recent scan, and
> "we fixed that last time" is not a finding about the current set.

### Authoring intent is not truth, and the file names say so

The rows are `INTENDED_SILENCE_CANDIDATE` and `INTENDED_REQUIRED_CANDIDATE`. Nothing in this
programme may treat an authoring intent as a verdict, and the pair map that records those intents is
withheld from the reviewer until every verdict is returned — otherwise the review would be scored
against the author's expectation rather than against the text.

`TARGET_DECISION` and `TARGET_FACTKEY` are reviewer-completed for the same reason: paired rows share
both, so prefilling them would disclose the pairing and, with it, that exactly one member of each
pair was authored as the unresolved case.

`HUMAN_AUTHORITATIVE_SILENCE_ROWS` remains 0. It moves only when a human returns verdicts on the
exact frozen wording.


---

## §174 — the first authoritative rows, and the asterisk they carry

`HUMAN_AUTHORITATIVE_SILENCE_ROWS` has moved off zero for the first time in this programme: five
SILENCE rows and five REQUIRED rows, all HIGH confidence, on wording frozen and hashed before a
single verdict was recorded. The ordering was enforced mechanically — hashes verified, verdicts
recorded, record frozen and hashed, preregistered scan run, and only then `PAIR-MAP.json` opened,
with the record's hash re-checked at the moment of unblinding.

**It is not AI-free truth, and the file says so in three places.** The product owner reviewed a
GPT-5.6 Sol assessment of the same ten rows before finalising and agreed with all ten. The owner
disclosed this unprompted. The disclosure is recorded structurally in
`HUMAN-ADJUDICATION-RECORD.json`, not as a footnote, and it must travel with every figure derived
from the set.

### Why 5/5 concordance is worth less than it looks

The rows were authored by this model. The verdicts were finalised by a human who had just read a
second model's answer. So the concordance measures agreement between two AI systems and a human who
saw one of them. Two models sharing a blind spot produce exactly this number, and nothing in the
result distinguishes that case from genuine agreement.

There is also a **provenance confound no scan can find**: the corpus is Claude-authored, the labels
are AI-assisted, and Expert HazLenz is Claude-based. A high score against this set may reflect
shared authorship rather than safety correctness. It is not a surface feature, so the preregistered
sweep — which is the right tool for length, vocabulary, domain and negation leakage — is structurally
incapable of detecting it. That is why it is written down instead.

The standing consequence: this set is `PRODUCT_OWNER_REVIEWED_DEVELOPMENT_TRUTH`. It can support
bounded development validation. It cannot support a customer-facing precision or recall claim, and
it cannot be upgraded into truth that can — that would require a corpus authored and adjudicated with
no AI on either side, which is a different and more expensive instrument.

### A fourth surface feature turned up, as predicted

The preregistered sweep found no perfect classifier over 303 candidate rules, which is mildly better
than chance (1.2 perfect rules would be expected by luck alone at this corpus size). But
`contains "it"` scored 9/10 — present in four of five REQUIRED rows and none of the SILENCE rows.

Below threshold, and unremarkable statistically. **The mechanism is what matters:** the REQUIRED
construction *"a document exists; it records X but not Y"* needs an anaphoric pronoun, and the
SILENCE rows, asserting verification directly, do not. Chance does not produce interpretable
mechanisms.

This is the fourth surface feature to track the row class, after length, vocabulary and negation
count, and it was found only because the scan swept function words rather than the list of already
known defects. It confirms the rule rather than closing it: expect a fifth.


---

## §175 — the truth set turned out to be one bit per row, and one bit is not enough to score against

The §174 adjudication established something real: ten frozen rows, five REQUIRED and five SILENCE,
product-owner reviewed. What it did **not** establish is *what* each REQUIRED row is missing. The
owner supplied the binary verdict and HIGH confidence; `MATERIAL_UNRESOLVED_FACTS`,
`EVIDENCE_SUFFICIENCY_CONCERN`, `TEMPORAL_SCOPE_CONCERN`, `COUNTERFACTUAL_DECISION_CHANGE` and
`HUMAN_RATIONALE` came back null on all ten rows, and §174 recorded them as null rather than
inferring them.

That gap only became load-bearing when the scoring rule arrived. §175 scores a REQUIRED row correct
**only if Expert emits a clarification that addresses the material unresolved fact represented by
that row** — so the score needs a per-row statement of that fact, and the only one in existence is
the authoring-side `INTENDED_SEMANTIC_DIFFERENCE` this model wrote in §173.

**Scoring a model against a target the same model authored is the loop refused since §162**, and
§169 is the concrete reason it matters: when a human actually reviewed whether clarifications
addressed the owed fact, 4 of 12 came back only partially correct. No model-authored target produces
that distinction, because the target and the answer share an author.

### The lesson for how truth sets are commissioned

A binary verdict is enough to *classify* rows. It is not enough to *score against* them whenever the
scoring rule asks whether an output addressed the right thing. Those are different quantities of
truth, and the difference is invisible until the scoring rule is written.

> **Commission the truth at the granularity the eventual scoring rule needs, and write the scoring
> rule before the adjudication rather than after.** Here the review form did carry a
> `MATERIAL_UNRESOLVED_FACTS` field; it simply was not filled, and nothing at adjudication time
> flagged that as blocking, because the scoring rule did not yet exist to make it so.

### What was deliberately not done

The harness gate `A.2 every row is structurally scoreable` runs `validateCohortRow`, whose totality
rule demands a full present/defensible/forbidden partition of a model-visible hazard vocabulary per
row. Passing it would have meant authoring four classes of unadjudicated evaluation truth; passing a
placeholder to it would have meant bypassing a protected gate. Neither was done, and no provider call
was made.


---

## §175 — the harness destroyed the evidence it was built to collect

Ten hosted calls executed cleanly. All ten returned `ok`, with 788–1563 output tokens each and
`stop_reason = tool_use`, so the model plainly produced structured content. The probe recorded zero
clarifications and zero hazard candidates on all ten rows.

That uniform zero was the harness, not the model. `ExpertProviderSuccess` carries `raw: unknown` and
nothing else — raw output must pass through `normalizeExpertOutput` before it becomes a validated
analysis, and the collections are named `expertHazardCandidates` and
`decisionCriticalClarifications`. The probe read `res.analysis.clarifications`, which is `undefined`
on every response, so every count defaulted to zero.

### The figure that would have been most tempting to report

`SILENCE_PRECISION = 5/5`, exact and mechanical by its own preregistered definition. It is worthless.
**A harness that reads zero clarifications everywhere scores every SILENCE row correct for free**,
and it would have scored 5/5 against a model that asked a question on every single row. A metric
being mechanically exact says nothing about whether its input was real.

The `REQUIRED_RECALL_LOOSE = 0/5` beside it is what exposed the defect — a model silent on all ten
rows is possible, but zero *hazard candidates* on all ten while burning 1,500 output tokens is not.
**The cross-check that caught this was a quantity the scoring rule did not use.**

### The worse half: the output was not kept

The probe persisted derived counts and discarded `raw`. When the extraction proved wrong, the ten
responses were unrecoverable — $0.47 of model output destroyed by the instrument measuring it, and a
re-run needed for information that had already been bought.

> **Persist the raw provider payload before deriving anything from it.** Derived counts are a
> hypothesis about the response; the response is the evidence. A harness that keeps only its own
> conclusions cannot be audited and cannot survive its own bugs.

Both faults are now repaired in the probe, and the repair was proven with **zero further calls** by
passing a payload carrying one clarification through the real normalizer and confirming the
extraction reads it. No runtime, prompt, schema, normalizer or scorer was touched.


---

## §175 attempt 2 — the first real reading, and the half of it that is still a human's to make

The repaired probe produced interpretable evidence: ten calls, all ten normalizing VALID, zero
contract failures, zero provider errors, zero retries, raw payload persisted for every row before any
figure was derived from it.

**`SILENCE_PRECISION = 4/5` is exact.** It needs no target statement, because the frozen truth owes
nothing on a SILENCE row and any clarification there is unnecessary by construction. HR-05 asked a
question and therefore fails.

**`REQUIRED_RECALL` is not a single number.** Four of five REQUIRED rows emitted a clarification, so
the loose figure is 4/5 — an upper bound. Whether each question addresses the material unresolved
fact is the determination the §174 record cannot support: `MATERIAL_UNRESOLVED_FACTS` is null on all
ten rows, and the only per-row statement of the owed fact is the pair map this model family wrote in
§173. The preregistration reserved that call for a human before any money was spent, and it was
honoured rather than revised once the questions turned out to look plausible.

That restraint is the point. **A preregistration that is followed only when the results are
disappointing is not a preregistration.** The questions Expert emitted read as though they track the
owed facts closely; that impression is exactly what a shared-authorship corpus would produce whether
or not it is true, and it is not mine to convert into a score.

So balanced accuracy and row-level accuracy are reported as the range **0.40–0.80**, and a point
estimate is refused.

### One failure worth flagging without acting on it

HR-05 is a SILENCE row where the observation settles the auger isolation by an attempted start that
did not turn it. Expert asked instead whether the *running drying fans* could introduce energy at the
blockage point — a different fact from the one the row settles.

Under the frozen truth that is a precision failure, and it is scored as one. But §169 established
that a clarification which misses the owed target while remaining independently decision-critical is
a recall miss rather than a precision defect, and this row has that shape. **Truth was not
redefined**, no remediation was performed, and the observation is recorded for the owner to weigh.
Noticing a pattern is not authority to change the answer key.


---

## §175 closure — 8/10, and the one variable that explains the miss

The four strict adjudications came back TRUE at HIGH confidence, and the metrics reproduce exactly
from the run records rather than from the expectation: `REQUIRED_RECALL_STRICT = 0.80`,
`SILENCE_PRECISION = 0.80`, `BALANCED_ACCURACY = 0.80`, `ROW_LEVEL_ACCURACY = 0.80`.

**The strict verdicts are themselves AI-assisted.** GPT-5.6 Sol reviewed the four emitted questions
before the owner finalised. So the labels were AI-assisted in §174 and the adjudication of the
answers is AI-assisted here — the assistance now sits on *both* sides of the comparison, which is a
stronger limitation than either alone, and `AI_ASSISTED_STRICT_ADJUDICATION = TRUE` travels with
every figure.

### The failure mechanism replicates a known one

Four of five REQUIRED rows were recovered. Every one of those four states an absence outright — *"does
not record"*, *"carries no interlock test result"*, *"shows no entry against it"*, *"unread since"*.
HR-04, the only miss, contains no such marker: it states a **positive** fact, that the fastenings
were last torque-checked at the annual service, and the gap has to be inferred from that date being
stale against this morning's pre-start check.

That is not a mechanism invented to explain one row. It is the discriminating variable the §147
fixture set already documented — advertised gaps are recovered, unmarked gaps are missed — observed
again on independent material. The temporal-scope reading is the same row, not a second defect: the
model recovered temporal gaps elsewhere (HR-06 *"before restart"*, HR-09 *"since"*) where the text
marked them. **The variable is the marking, not the temporality.**

### What did not recur

The §169 evidence-sufficiency defect. All four recovered clarifications demanded
function-establishing evidence — a flame test, a functional interlock test, a verified de-energised
isolator, a gauge reading — rather than settling for a document, an indicator or a presence. That was
the named remediation target after §169, and on this instrument it did not reappear.

### The precision failure is left standing

HR-05 asked whether the running drying fans could introduce energy at the blockage point, on a row
whose auger isolation is settled by an attempted start that did not turn. Independently sensible;
still a precision failure under the frozen truth, and scored as one. Within the same PAIR-4 scene the
model asked correctly about the auger's own isolator on the REQUIRED side — so it can find the owed
fact and still over-ask beside it.

**No truth label was altered and no remediation was performed.**


---

## §176 — the miss was compliance, not disobedience

The most useful thing about the §175 HR-04 failure is that the model was not ignoring the prompt. It
was obeying it. `CURRENT STATE, NOT HISTORICAL STATE` tells Expert not to re-litigate a stated
verified fact — *"re-litigating a stated, verified fact ... is disregarding evidence you were
given"* — and HR-04 stated one: the guard fastenings had been torque-checked. Staying silent was the
instructed behaviour.

What the prompt never said is that **a verification speaks for a time**, and that the decision may
depend on a different one. So the repair goes at the boundary of the rule that produced the silence,
in the list that already defines what fails to establish a fact, rather than being bolted on as a new
section that would have to win an argument against the old one.

> **When a model follows a rule into a wrong answer, fix the rule's boundary, not the model's
> disposition.** Adding "think harder about timing" beside an instruction that says "do not
> re-litigate this" produces a contradiction the model resolves unpredictably. Naming the exception
> inside the original rule produces a decision procedure.

### Why the brakes are the larger half of the change

Twenty-two of the twenty-eight added lines are constraints. The rule is stated once and then fenced:
it is about the decision and never about age; no schedule or due date makes evidence stale; a
verification performed long ago is **fully established** where the decision does not depend on a
later moment; one performed minutes ago settles nothing about a state that changed after it; and
three specific inflation triggers — a record being old, an interval having elapsed, re-checking being
good practice — are named and forbidden.

That ratio is deliberate. A recall repair that is not fenced becomes "ask more questions", and the
§175 evidence already shows the model over-asking about an adjacent unsettled source. A third
insertion addresses that directly: once the owed fact is settled, an adjacent concern **does not
inherit its urgency** — it goes to the hazard-candidate list, and becomes a question only by passing
the full five-part test on its own decision.

### What these proofs do not establish

Thirty static proofs and 632 regression assertions pass. All of them read text. **None of them shows
the model behaves differently**, and none may be cited as evidence of improvement. The §175 figures
stand unchanged and unre-measured.

The baseline to beat is **both** numbers at once: 4/5 strict recall **and** 4/5 silence precision. A
post-remediation 5/5 recall bought at 3/5 precision is a regression that would look like progress if
only one number were reported.


---

## §177 — the repair did not fire, and the one number that improved cannot be trusted yet

HR-04 is unchanged. The §176 temporal rule was written for exactly this row and the row behaved
exactly as before: no clarification, `uncertainty.statements` empty.

The raw output explains why, and the explanation is more useful than the failure. Expert raised the
conveyor nip point as a candidate in state `CONTROLLED`, reasoning that *"the observation confirms
the guard is currently in place"*. **It settled the present state on the guard being physically in
position**, so the staleness of the torque check never became a live question at all.

The temporal instruction was placed in the list of things that do not establish a fact. It is never
consulted, because the model does not arrive at a temporal question — it arrives at a presence
question and answers it. **This is the §169 evidence-sufficiency failure standing in front of the
temporal one:** presence is not securement, and until that is settled the timing of the torque check
is downstream of a question the model believes it has already closed.

A rule only fires where the reasoning actually passes through it. Placing a correct rule in a
location the failing path does not reach produces exactly this result: 30/30 static proofs, and no
behavioural change on the row the proofs were written for.

### The improvement that is not yet an improvement

`SILENCE_PRECISION` read 5/5 against a 4/5 baseline, because HR-05 stayed silent this time. That is
the desired direction and it is the row the precision brake was aimed at.

**It is one row differing between two single-sample runs.** Nine of ten rows were identical. Both
§175 attempt 2 and §177 phase B are one execution per row against a stochastic model, and nothing in
this design separates "the brake worked" from ordinary sampling variance. Reporting 5/5 as evidence
the repair improved precision would be reading a coin flip as a trend.

> **A single-sample A/B on ten rows cannot attribute a one-row difference to a prompt change.** The
> programme already owns the instrument that could — the §152–§154 baseline/replicate2/replicate3
> triplet. Any future claim that a prompt edit changed behaviour needs replicates at the same
> identity, not one run either side.

### Phase A, recorded separately

`EXPERT_PROMPT_VERSION` v13 → v14 with `SYSTEM_PROMPT_SHA256` **byte-identical** — the version string
does not appear in the prompt text, so the required equivalence proof is available in its strongest
form. 17 suites, ~1,475 assertions, 0 failures.

Two things worth keeping. §176 reported "two protected gates pin the literal"; there were **twelve**
live pins, and that undercount was an error of reading only the head of a grep. And the
projection-equivalence pin — written as a regex with escaped dots — caught a bulk literal replace
that updated its message while leaving the regex on v13. Its own comment records the same pin being
missed in §143 and again later. That makes three. It is not a nuisance; it is the only thing that
noticed.


---

## §177 closure — 9/10, and the property the model never asked about

The four §177 emissions are adjudicated. HR-01, HR-06, HR-08 and HR-09 all address the fact their
row owed, at HIGH confidence, so `REQUIRED_RECALL_STRICT` is **4/5** — the strict figure lands
exactly on its upper bound and is unchanged from the §175 baseline. With `SILENCE_PRECISION` at 5/5,
balanced accuracy is **0.90** and row-level accuracy **9/10**. Every value was recomputed from the
run records; the expected figures in the authorization were compared afterwards, never used as
inputs.

The provenance is unchanged and still limiting. `AI_ASSISTED_STRICT_ADJUDICATION = TRUE`: GPT-5.6
Sol reviewed the exact emitted clarifications before the product owner finalised, and the product
owner agrees with all four. `FULLY_INDEPENDENT_HUMAN_ADJUDICATION = FALSE`. The corpus is
Claude-authored and the evaluated model is Claude-family. **This is development truth twice over —
in how the labels were made and in how the verdicts were made — and it must never be reported as
AI-free human adjudication.**

What makes the adjudication attachable at all is that the wording did not move. The five observations
in the strict packet hash to the frozen §174 row texts, and the four questions in the packet are
byte-identical to the ones the run actually returned. **The product owner adjudicated the exact
artifact that was executed** — the condition §174's freeze rule exists to guarantee, verified rather
than assumed.

### The number moved; the cause did not become knowable

`SILENCE_PRECISION` reads 5/5 against 4/5, and that is recorded as an observation.
`PRECISION_IMPROVEMENT_CAUSALLY_ESTABLISHED = FALSE` is recorded beside it. One row of ten differed
between two runs that each drew one sample per row from a stochastic model. Reporting the observation
is honest; reporting it as the repair working is not, and the two records are kept apart deliberately
so that a later reader cannot collapse them.

### What HR-04 actually shows

The §176 rule was written for a temporal question the model never reached. Expert closed the guarding
fact on **presence** — *"the observation confirms the guard is currently in place"* — and concluded
*"No decision-critical facts are missing."* The staleness of the annual-service torque check was
downstream of a question the model believed it had already answered.

That yields a distinction worth carrying into any future truth authoring:

> **`CONTROL_PRESENCE` is not `CONTROL_PROPERTY_SUFFICIENCY`.** A control can be present and
> unsecured, present and non-functional, present and misconfigured. Evidence that establishes one
> property of a control does not automatically establish another property the decision requires.

The generalisation stops there. Presence evidence fully establishes a presence fact, and this is not
a finding that physical or visual evidence is weak — §169 already showed how easily that overreach
happens, and the correction to it is that the rule must name **which property** the decision needs
and **which property** the evidence speaks to. Classified
`CONTROL_PROPERTY_CONFLATION_REMEDIATION_HYPOTHESIS`: more specific than §169, consistent with it,
and not established — one row, two single-sample runs, one model.


---

## §178 — the repair goes where the fact gets closed

§176 taught the programme something the §178 repair is built around: **a correct rule placed where
the failing path does not run is indistinguishable from no rule at all.** Thirty static proofs
passed, the target row did not move, and the raw output showed the model closing the fact on
presence before any temporal question could arise.

So §178 puts the property comparison at the moment of establishment — the head of `WHAT COUNTS AS
ESTABLISHED` — and again at the earlier surface that can close a fact on its own, the
already-answered rule inside `CURRENT STATE, NOT HISTORICAL STATE`. The second placement is the part
that carries the hypothesis. Everything else is wording.

### What the rule says, and what it refuses to say

A fact is never established in the abstract; it is established **for a property**. Evidence about one
property is *silent* about another — neither establishing it nor ruling it out — so a statement can
be true, stated, directly relevant, and still leave the decision unresolved. Five steps: name the
owed decision, name the property it depends on, name the property the evidence establishes, compare,
and only then let timing arise.

The refusals matter more than the rule for anyone authoring truth against this prompt:

> Presence evidence **fully** establishes a presence fact, and asking further is re-litigating a
> stated fact. A functional test **fully** establishes function — and is silent about a
> configuration, a scope or a securement the decision may separately need. The rule cuts in every
> direction and calls no evidence class insufficient, weak or stale.

And a mismatch does not manufacture a question: it is "a reason a fact is not yet settled. It is not
permission to ask." The property must be one the decision actually turns on, and the five-part
counterfactual test still gates every question independently.

### The property vocabulary is examples, deliberately

Existence, presence, securement, functional operation, effectiveness, configuration, protective
response and verified state appear as **examples of what a property can be, never a list to choose
from**, with the model told to name the decisive property in its own words when nothing listed fits.
No enum, union or constant array was added anywhere in code, and a proof asserts that. A closed
taxonomy would have turned a semantic rule into a checklist and reintroduced exactly the
coverage-habit failure the prompt spends several paragraphs suppressing.

### What this section does not establish

Nothing about behaviour. Fifty-nine static proofs and 2,160 regression assertions read text and
data structures; they show the rule is present, ordered, placed on the failing path, braked and free
of any wording drawn from the frozen rows. §176 is the standing proof that this is not the same as
the model behaving differently.

The §175 and §177 figures are unchanged and unre-measured, and the next validation may not be
another one-shot run. **The instrument has now been spent twice at one execution per row**; a third
would produce a third uninterpretable number. What comes next is a preregistered replicate design at
one frozen identity, with the replicate count fixed before any output is seen and both recall and
precision required to survive.


---

## §179 — replicates change what the instrument can say, including about its own past readings

Three executions per row, one frozen identity, interleaved order fixed before spend. The headline is
a failure — HR-04 emitted nothing on 3 of 3, and silence precision came in at 12/15 against a 13/15
floor — but the design earned its cost twice over, and both lessons are about truth rather than about
the model.

### A row can be stable in the wrong direction, and that is worth knowing

HR-04 is not noisy. It is consistently silent: zero clarifications on every replicate, matching its
single draws under v13 and v14. Eight of the ten rows behaved identically across all three
executions. **Two did not**, and those two are the ones that had been carrying interpretation.

### The §177 5/5 rested on one unstable row, and now that is measured

`SILENCE_PRECISION = 5/5` at §177 was a single draw in which HR-05 happened to stay silent. Under
§179, HR-05 emits on **2 of 3** executions at a fixed identity. The §177 record already refused to
call that 5/5 an improvement, and this is the evidence that the refusal was right rather than merely
cautious.

The limit still binds in the other direction. HR-05's rate here is a **v15** rate. It says nothing
about HR-05's rate under v14, which was never replicated, so this is not evidence that v15 made
precision worse either. A rate compared against a single draw is not a controlled comparison, and
`CAUSAL_EFFECT_SIZE_V14_TO_V15` remains unavailable in both directions.

HR-07 is the new instability: silent in §175 and §177, emitting on 1 of 3 here, with a severity
question about dust extent on a row whose flame test was performed, recorded and certified.

### What replicates do NOT fix

They do not touch provenance. The corpus is still Claude-authored, the evaluated model is still
Claude-family, and the truth is still `PRODUCT_OWNER_REVIEWED_DEVELOPMENT_TRUTH` with
`AI_ASSISTED_HUMAN_VERDICT_GENERATION = TRUE`. Three replicates give a rate, not a confidence
interval, and ten rows are still ten rows. A provenance-independent challenge remains required and
is not closer than it was.

### Strict recall is still the human's, and the terminal did not wait for it

Twelve REQUIRED executions emitted and are in the packet verbatim, **adjudicated per execution**
rather than per row, because replicates of the same row produced textually different questions. No
verdict was supplied by the model.

The terminal was determinable anyway: criteria 1, 3 and 4 fail on mechanical evidence, so
adjudication can refine the strict figure but cannot make the run a confirmation. Worth recording as
a pattern — when the mechanical half of an instrument already decides the outcome, say so and hand
over the packet, rather than holding the whole result hostage to a verdict that cannot change it.

### The observation the remediation review needs

One HR-04 replicate did not fail by never reaching the question. It reached it: *"fastenings last
verified at the annual torque check, so the machine_guarding hazard … appears currently controlled by
a physical guard rather than unguarded."* The model named the historical verification and treated it
as establishing the present controlled state — the exact step §176 and §178 were both written for.

§178's diagnosis was placement: §176 failed because the reasoning never passed through its location.
That diagnosis is now harder to sustain in its simple form, because here the reasoning did pass
through and the fact was closed anyway. This does not show the property distinction is the wrong
hypothesis, and it identifies no cause. It sharpens the open question: whether this closure is
reachable by prompt instruction at all.


---

## §179 closure — 0.80 three times over, and why that number should be ignored

The twelve emitting REQUIRED executions are adjudicated: all TRUE at HIGH confidence, one verdict per
execution rather than per row, because replicates of the same row produced textually different
questions and a verdict copied across them would be a verdict nobody made. HR-04's three are
mechanical failures rather than adjudicated ones — nothing was emitted, so nothing could address the
owed fact.

`REQUIRED_STRICT_PASS = 12/15`. `SILENCE_PASS = 12/15`. `OVERALL_EXECUTION_ACCURACY = 24/30`. Three
figures, all 0.80, all recomputed from the run records and the verdicts rather than copied.

**Reporting those three numbers alone would misrepresent this instrument entirely.** The rows do not
average; they fall into three classes that behave differently and need different responses:

> **Stable and correct** — HR-01, HR-02, HR-03, HR-06, HR-08, HR-09, HR-10 (7 rows, 3/3 each).
> **Stable and wrong** — HR-04 (0/3).
> **Unstable** — HR-05 (1/3) and HR-07 (2/3), varying at a single frozen identity.

A defect with a stable signature, a set of rows that are simply fine, and two rows whose behaviour is
a coin weighted somewhere between. One pooled percentage erases all three distinctions, and the
policy recorded here is that it is not to be quoted without them.

### What the adjudication changed, and what it did not

It moved strict recall from PENDING to 12/15 — which **passes** its preregistered floor, exactly, with
no margin. It also confirmed that no previously recovered row regressed: HR-01, HR-06, HR-08 and
HR-09 are 3/3 each. Both facts matter, because the §178 repair could have bought HR-04 by damaging
them and did not.

It changed nothing about the outcome. Criteria 1, 3 and 4 had already failed mechanically, and they
still fail. The pattern is worth keeping: when the mechanical half of an instrument already decides
the terminal, say so, hand over the packet, and let the adjudication refine the figures it can
actually refine.

### HR-04 stops being a miss and becomes a defect

Three replicates at one identity, all silent, consistent with two prior single draws under two
earlier prompt identities. That is no longer an isolated stochastic miss; it is a replicated
development defect on this instrument.

And it is not a failure of attention. Replicate 3 reasoned through the guard being in position, the
morning pre-start context, **and** the historical fastener torque verification, then concluded the
guard was presently controlled. v15 had already taught property-relative sufficiency, temporal
sufficiency, and placement ahead of premature settlement. The model walked through the material the
rules were written about and settled the fact anyway.

`PROMPT_ONLY_CONTROL_PROPERTY_REPAIR_CONFIRMED_EFFECTIVE = FALSE`. The recorded classification is
`PROMPT_ONLY_SETTLEMENT_CONTROL_RELIABILITY = NOT_ESTABLISHED` — **not** that prompt engineering can
never reach this, which is a stronger claim than three prompt identities can support and is barred.

The open question moves to architecture: whether *what fact is owed*, *what property must be
established*, and *what evidence actually settles it* belong in structured state and verifier
reasoning rather than in free-form prompt semantics. That review is owed before any v16 wording.

### The carrier leak, on two unrelated domains

HR-05 emitted twice, both times raising adjacent plausible hazards after the auger energy fact was
already settled — the `DISPLACED_VALID_FACT` shape, strengthened rather than newly found. HR-07
emitted once, pivoting from a settled flame-failure fact to dust housekeeping and severity.

Different hazard domains, same shape: the owed fact is settled and the model reaches for something
adjacent anyway. Plausible safety relevance is not decision-critical clarification entitlement, and
the frozen SILENCE truth is not reinterpreted to accommodate a good question asked at the wrong time.
Recorded as evidence that adjacent-hazard generation can leak into the clarification carrier —
explicitly not as a dust-specific or auger-specific defect, which one and two executions could not
support.


---

## §180 — the architecture already believed in settlement; it just had no way to record one

A design review, zero calls. Its most useful output is not the recommendation but four facts read out
of the implementation, because three of them were not in any document.

**The ledger already declares a settlement state that nothing can reach.**
`SETTLED_BY_EVIDENCE` requires an `ADMISSIBLE_EVIDENCE` authority, and a repository-wide search for a
minted authority returns exactly one site, producing `ADMITTED_BINDING`. So today a fact leaves
`UNRESOLVED` only by being asked about. There is no representation for *the evidence settled this, so
nothing is owed* — which is precisely the sentence Expert wrote about HR-04 three times running.

**The channel for that sentence exists and drains nowhere.** `CHALLENGE_FACT_VALIDITY` is instructed
in almost the exact words — "the observation already settles it" — and produces an arbitration
request typed `settles: false`. Nothing consumes it. A model that correctly identifies a settled fact
has its claim collected into a queue no one reads.

**And the model is never asked the question §178 spent forty lines teaching.** It is given the target
and returns one of three bookkeeping tokens. *What property does this evidence establish* has no
field.

### The finding that disciplines the whole review

HR-04, HR-05 and HR-07 all failed on the **first-pass** path, which has no ledger, no factKey and no
binding at all. The architecture that would make a displaced question structurally refusable — bind
to a key in the closed set, or nominate with a full proof burden — is built, locally proven, exercised
hosted once, human-reviewed, and switched off.

So **§179 is not evidence against that architecture.** It is also not evidence for it. The honest
position is that the question is unmeasured in both directions, and the review's first recommended act
is therefore not to build anything: it is to run what already exists against the frozen rows and find
out.

That matters for how this programme reads its own results. It is easy to look at a failure and
conclude the system needs something new, when the system already contains something unexercised. The
§179 failure was measured on the simplest path available, and the conclusion drawn from it must be
scoped to that path.

### What the proposal does and does not do to truth

It does not move any boundary this document exists to protect. `acceptableEvidence` stays guidance and
never becomes a validator; nothing compares a declared property to a required one in code, because
that comparison *is* `CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED`; the status set
stays closed at four because statuses carry authority and there is no authority that produces
"partially established"; and a provider claim of settlement is typed so that it cannot move the ledger
at all.

What it adds is a place for the judgement to land. On HR-04 today the decision exists only as English
in a summary. Under the proposal it becomes a row — owed requirement beside claimed property, evidence
span verbatim, criterion present or explicitly absent — that a human can read in one line and
disagree with.

**A diagnosis surface is not a fix**, and the review says so in its own claim boundary. But three
prompt identities have now failed on this row, each costing a replicated hosted validation to
evaluate, and none of them could say why. That is the argument.


---

## §181 — the architecture could already hold the distinction, and the registry cannot express the property

Stage A0 was built into §180 as the cheapest thing that could overturn §180's own recommendation. It
partly did, and the mechanism is worth keeping: a review that names in advance the experiment that
could refute it, and then runs it before building anything.

### What A0 established

Handed explicit owed facts, the **existing** architecture holds the HR-04 distinction with no new
field. Presence and securement are two `factKey`s; settling presence leaves securement `UNRESOLVED`;
the ledger is append-only and reports no preservation violation. The property §180 hoped a new
representation would buy is already there.

The displaced-fact controls also hold, replayed with the **actual** §179 content. The drying-fan
question became its own fact beside the settled one; the dust question, offered as a binding to a
settled fact, was refused. Substitution is unrepresentable rather than merely forbidden.

And a correction to §180 worth carrying: `SETTLED_BY_EVIDENCE` is **not unreachable**. The transition
accepts its authority, refuses every other, and is already exercised in development suites. What is
missing is a runtime caller. That is a different problem with a different fix, and calling it
"unreachable" would have pointed the next stage at a redesign it does not need.

### What that changed about the plan

The claim a model would make — *"the observation already settles it"* — **can already be expressed**,
through `CHALLENGE_FACT_VALIDITY` with a free-text reason, and a reviewer could already read that
reason against `acceptableEvidence.requirement`. Nothing consumes it.

So the binding constraint was never expressibility. §180 wanted to build the structured declaration
first; A0's evidence says build the consumer first and design the declaration from real challenge
reasons. The declaration is still justified — its priority moved, not its merit.

### The finding that constrains everything downstream

The alignment audit is read-only, 20 approved records, 28 evidence questions, every classification an
engineering judgement recorded by name rather than computed by a scorer. Twenty-one align. Four
demand more than their method delivers. Two are ambiguous.

> **No functional-test verification method exists anywhere in the registry.** Nine distinct methods,
> five of them observational, and not one that establishes that a safeguard *works*.

This is the sharpest statement yet of the §169 problem. The governed vocabulary cannot express the
property that HR-04, HS-A1's flame-failure rows, and the interlock rows all turn on. A settlement
architecture wired perfectly would hand a reviewer, for a securement fact, a criterion whose example
of sufficient evidence is `physical_inspection`.

The correct behaviour then is to leave the fact unresolved — which the architecture does. But it means
**settlement by governed evidence is not available for protective-function facts at all**, and any
future claim that a fact was "settled by evidence" needs to say which property was settled and by
what method.

### Two things kept apart on purpose

Architecture adequate-but-unintegrated. Knowledge weak on the property that matters. **Neither
excuses the other**, and the authorization was right to insist they be reported separately: HR-04 did
not fail because of the registry — it failed on a path where no governed criterion was ever consulted
— and equally, integrating the architecture will not conjure a criterion that does not exist.

Recorded provenance for the audit itself: `AI_PERFORMED_DEVELOPMENT_AUDIT = true`,
`HUMAN_ADJUDICATED = false`. Twenty-eight engineering judgements are twenty-eight things a human may
disagree with, and the table exists so they can be disagreed with one at a time.


---

## §182 — a settlement can now be recorded, and only a human can record one

The two absences §181 named are closed. A provider claim that a fact is already settled now lands
somewhere a person can read it, and a fact can now leave `UNRESOLVED` by evidence rather than only by
being asked about. Both were structurally impossible yesterday.

What matters for truth authority is the shape of the new authority, not the fact that it exists.

### The provider gained nothing

`PROVIDER_SETTLEMENT_AUTHORITY = NEVER`, and it is structural rather than promised. The authority
object carries a **real module-private symbol** as its brand, so an object satisfying the interface
cannot be constructed anywhere outside the producer. A forged authority is not a type error someone
could cast away — it is a value that cannot be built.

The five refused provenances are enumerated rather than left as "anything that isn't human", and two
of them are this programme's own scars: `HISTORICAL_EVALUATION_LABEL` is the §162/§169 disposition
that must never re-enter the loop it judges, and `AUTOMATED_MATCHER` is the keyword scorer §160 and
§161 retired. Naming them turns an accidental promotion into a refusal with a code instead of an
omission nobody notices.

### The decision vocabulary refuses to express a degree

`APPROVE_SETTLEMENT`, `REJECT_SETTLEMENT`, `LEAVE_UNRESOLVED`. There is no percentage, no confidence,
no partial match — the authorization forbade them and the design agrees with the prohibition for its
own reason: a reviewer who is unsure returns `LEAVE_UNRESOLVED`, which produces exactly the same
outcome as doing nothing.

That is the right default here more often than it might sound. §181 established the governed registry
contains **no functional-test verification method at all**, so for any protective-function fact the
criterion shown to a reviewer will be incapable of settling the property in front of them. The
architecture's job is to make refusing easy and its grounds visible, and a confidence slider would
have made refusing feel like a failure to decide.

### The reviewer is told what the criterion is not

Every claim carries the governed criterion **verbatim** — `physical_inspection` appears as the example
even for a securement fact, because that is what the record says — plus an explicit absence flag when
there is no criterion, plus a fixed caveat naming the §181 finding. Nothing in code upgrades,
paraphrases or supplements the guidance, and nothing compares the provider's reason to it.

So a reviewer looking at the HR-04 claim sees a securement fact, a criterion whose only example is
looking at the thing, and a sentence saying the registry has no functional-test method. That is
enough to refuse on informed grounds, which is the whole point.

### The approval branch is not a recommendation

The proof suite exercises a human approving settlement on the HR-04 securement fact and reaching
`SETTLED_BY_EVIDENCE`. **That is a state-machine proof and must not be read as a judgement.** The
frozen product-owner truth for HR-04 remains REQUIRED, and on the evidence §181 assembled a reviewer
should refuse. The branch exists to show the state is reachable through the authorized path — nothing
more.

Worth stating plainly because this is exactly the kind of artifact that gets misread later: an
architecture that *can* settle a fact is not an architecture that *should*.

### What is still not established

No model ran. Nothing here shows a provider will write a challenge reason worth reviewing, that a
reviewer will read it carefully, or that HR-04, HR-05 or HR-07 behave differently. The next gate
tests whether real challenge reasons are good enough to decide on — and the honest risk to watch is
not the code but the review surface, because a queue that is tedious gets rubber-stamped, and a
rubber-stamped review reopens every safety property this slice just made structural.


---

## §183 — the instrument cannot state what it is testing

Stopped before the first provider call. $0.00. The reason belongs in this document rather than only in
the engineering log, because it is a fact about truth authority rather than about code.

### The gap that has now blocked four sections

The frozen §174 truth answers one question per row: **is a clarification required?** It answers it at
HIGH confidence, product-owner supplied, and it has held under hash verification through §175, §177,
§179 and §182.

It does not answer, and has never answered, **what fact is owed**. `MATERIAL_UNRESOLVED_FACTS` is null
on 10 of 10 rows, each annotated *"not supplied by the product owner; not inferred"* — an honest null,
deliberately left rather than filled in by a model.

That null was correct when it was written and it remains correct. But it means the instrument is
authoritative for a **verdict** and silent on a **subject**, and every experiment that needs the
subject has stalled on it. §175 named the wall. §177 and §179 inherited it as
`REQUIRED_RECALL_STRICT = PENDING`. §183 is where it becomes fatal rather than inconvenient, because
the settlement architecture takes owed facts as its input rather than producing questions as its
output.

### Why authoring the gap shut would have been the wrong kind of help

For HR-04 the owed fact must say what is unresolved. Any wording that does the job says some version
of *presence is stated; current securement is not*. That is the discrimination the experiment exists
to test whether the model can make — written into the stimulus the model is handed.

The alternative is to take the framing from the governed record, which for machine guarding gives
`guarding_status` and `physical_inspection`. That wording cannot express securement at all, so nothing
is measured. §181's `GOVERNED_FUNCTIONAL_TEST_METHOD_PRESENT = FALSE` turns out to bind at
construction time as well as at review time: **the registry cannot frame the fact, and the only party
who can frame it correctly would be giving away the answer by doing so.**

There is no third wording. Specific enough to adjudicate a challenge against means naming the
property; naming it is the answer.

### The precedent that settles it

This is not a fresh scruple. §167 supplied authored owed facts to a hosted verifier, saw 12/12 binding
against 3/10, and the claims register records why the number could not be banked: the manipulation
bundled *"a substantially richer statement of the owed fact that v2 did not carry"*, and the design
could not attribute the movement. §183 would repeat that confound with the specific discrimination
under test sitting inside the enrichment.

A model authoring the stimulus that decides whether that same model family passes is the closed loop
this document has refused since §162. It does not become acceptable because the scoring downstream is
human.

### What is actually needed

Ten sentences from the product owner: for each frozen row, what fact is materially unresolved, why,
the two branches, and what differs in what is done today. Authored blind to the §179 results, frozen
before any run, and never revised to fit an outcome — the same discipline the row texts themselves got
at §173/§174.

That is a real cost and it is the owner's labour. It is also reusable: every settlement experiment on
this instrument needs the same content, and four sections have now stopped for want of it.

Two rows already have it. HS-A1 and HS-E1 carry human-authoritative targets from §162, reviewed at
§169 — enough for a six-call experiment that would answer whether challenge reasons are reviewable,
which is the question that decides whether a new declaration field is justified. It would not touch
HR-04, and there are still **zero** human-authoritative rows carrying a *settled* owed fact, so
containment remains untestable on authoritative material.

### What §183 establishes

Nothing about behaviour. No provider ran, no reviewability was measured, and §182's structural
findings are neither confirmed nor disturbed. The one established fact is about the instrument: **it
cannot state the subject of the test it is being asked to run.**

---

## §184 — the ten sentences arrived

This document has recorded since §162 that a model authoring the stimulus which decides whether that same model family passes is a closed loop, and §183 stopped on the sharper form of it: the instrument could not state the subject of its own test, because naming the property specifically enough to adjudicate HR-04 *is* the answer.

**Recorded 2026-09-05: the product owner supplied the missing content.** All ten frozen rows now carry owed-fact truth of class `PRODUCT_OWNER_REVIEWED_DEVELOPMENT_OWED_FACT_TRUTH` — the fact materially at stake, why it is unresolved or what settles it, the two branches, and what differs in what is done today. Every row was returned `EDIT`.

**The loop is narrowed, not closed, and the provenance says so.** Claude prepared the candidate statements, spans, rationales and mechanical checks; GPT-5.6 Sol assisted the owner during semantic review; the owner edited and approved. `AI_ASSISTED_OWED_FACT_AUTHORING = TRUE` and `FULLY_INDEPENDENT_HUMAN_AUTHORING = FALSE` are permanent properties of this truth. It must never be described as independent human truth, AI-free authoring, validated safety truth, production truth or formal acceptance truth. The §162 standard — ten sentences authored blind to results and frozen before any run — is met on the freezing and the blinding, and is **not** met on independence.

**On HR-04 specifically.** The separation §183 asked for holds in the recorded text. Layer A names the property and the absence — "whether the fixed guard over the head drum nip point is currently secured sufficiently for safe operation", "the observation does not state the current securement of the guard fastenings" — and never argues that presence fails to prove securement. That argument sits in `evaluationRationale`, which is withheld. The identical layer-A sentence serves HR-10, where the fastenings were torque-checked and recorded tight, which is the evidence that it does not encode the adjudication. One residual is recorded rather than waved off: HR-04's `evidenceSpan` is a verbatim quote that selects the annual-service sentence, and verbatim spans are required by the instrument's own check 9.

**What is still missing.** Zero human-authoritative rows carried a *settled* owed fact before this recording; five do now, but they are product-owner-reviewed development truth, not the independent human-authoritative class HS-A1 and HS-E1 carry from §162. Containment remains untested on independently authored material. And the five settled rows cannot yet be run at all: the runtime `OwedFact` type requires a non-blank `whyUnresolved` regardless of status, so expressing them today would mean projecting a false sentence to the provider on exactly the rows that exist as controls. The owner's direction — null when not unresolved — is recorded and not implemented.

---

## §185 — the truth is now structurally representable

§184 recorded ten rows of product-owner-reviewed development owed-fact truth, and five of them could not be expressed in the runtime at all: the type demanded a non-blank `whyUnresolved` from a fact that was settled, and every sentence satisfying it would have been false. As of 2026-09-05 that is corrected. All ten rows admit to a development ledger, the five settled rows carry `whyUnresolved: null`, and the five unresolved rows project the product-owner-approved sentence byte-identically. `FALSE_UNCERTAINTY_TEXT_MANUFACTURED = 0`.

**This is a representation result and nothing more.** No provider ran, no behaviour was measured, and the §184 provenance is untouched: `AI_ASSISTED_OWED_FACT_AUTHORING = TRUE` and `FULLY_INDEPENDENT_HUMAN_AUTHORING = FALSE` remain permanent properties of this truth. Being representable is not being validated, and it does not narrow the independence gap this document has tracked since §162.

One measured finding bears directly on what a hosted run could establish. The projection function supplies unresolved facts only, so the five settled controls never reach a provider through it. Containment measured that way would be a property of the filter, not of the model — which is the same class of confound §167 recorded and §183 stopped on, and it should be resolved in the design before a cohort is spent rather than explained afterwards.
