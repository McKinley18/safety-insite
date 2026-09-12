# §201 — verifier vNext: six representational defects, ten candidate answers

**Agent 5 — verifier / clarification engineer.**
**Provider calls: 0. Database operations: 0. §195–§200 evidence: read only, unmodified.**
**No existing file was modified. Nothing here is enabled, wired, or reachable from production.**

## Read this first

**No candidate below was derived from a §199 semantic verdict, because there are none.** Zero of the
152 §200 slots are filled and this document fills none. Every argument here is **structural**: it
names a state the current representation can enter, or a distinction it cannot carry, and you can
check it by reading `expert-verifier-instruction-v3*.ts`, `expert-verifier-contract-v3*.ts`,
`owed-fact.types.ts` and `owed-fact-binding.ts`. Where I could not make a structural argument, I say
so instead of filling the gap.

**Nothing here is a protocol version.** None of it is `v3.4`. Naming a version attaches hashes to a
design with no hosted validation, and in this lineage a version number is earned by a preregistered
run. `applyCandidates()` produces an artifact you can hash, diff and cost; promoting one is a
separate authorization.

**Where I need something I do not own, I ask rather than take it.** Three candidates need a file
another agent or the orchestrator owns. Those are listed at the end, not done.

---

## The three cross-cutting facts that shape every candidate

### 1. Additive schema growth is not free, and bytes are the wrong meter

§199 rejected both capability-PRESENT rows before generation:

```
HTTP 400 invalid_request_error
The compiled grammar is too large, which would cause performance issues.
Simplify your tool schemas or reduce the number of strict tools.
```

The first-pass schema was **accepted at ~18,620 sent bytes and rejected at ~19,060**. The provider's
stated metric is **compiled grammar complexity**, not length, and an `enum`-constrained construct
expands far past its serialised size.

Two things follow, and they pull in opposite directions:

- The verifier is a **different request** and is much smaller. Measured: `v3.2` schema **4,998
  bytes / 41 nodes / 25 enum members / 2,488 description bytes**, prompt **12,998 bytes**. It is not
  at the wall the first pass is at, and it is wrong to argue as though it were.
- **Applying all seven prototyped candidates nearly doubles it — 4,998 → 9,765 bytes, 41 → 78 nodes,
  25 → 41 enum members**, plus **+4,623 prompt bytes**. Adopting the whole set is not a small change,
  and the enum column is the one to watch.

So every candidate carries four measured figures, never one, and **no combination may be sent
without an offline request build followed by a single-row transport canary** — the §199 pattern that
worked and cost one call.

| candidate | schema bytes | nodes | **enum members** | description bytes | prompt bytes |
|---|---|---|---|---|---|
| C1a owed-property restatement | +337 | +2 | **0** | +239 | +809 |
| C1b nearest-neighbour discrimination | +602 | +5 | **0** | +309 | +350 |
| C2a settlement test | +873 | +6 | **0** | +439 | +569 |
| C2b accepted-evidence binding | +733 | +5 | **+3** | +374 | +883 |
| C3a second clarification slot | +811 | +8 | **+6** | +263 | +539 |
| C4a temporal scope | +623 | +5 | **+4** | +287 | +687 |
| C6a challenge ground + evidence | +788 | +6 | **+3** | +408 | +786 |
| **all seven** | **+4,767** | **+37** | **+16** | **+2,319** | **+4,623** |

The three highest-ranked candidates (C6a, C1a, C2a) together cost **+1,998 schema bytes and +3 enum
members**. That is the subset I would take to a canary first.

### 2. Adding a prose field silently reopens the citation boundary

`verifierFreeTextStrings` (§193) is a **fixed, hand-written field list**. v3.2 had to scan its one
new prose field (`regulatoryBasis.proposition`) *itself*, because §193 could not know about it. Every
candidate that adds prose therefore **adds an unscanned citation surface** unless it also extends the
scan.

`vnextScannedStrings` does that extension; each candidate declares its `newFreeTextFields`; and the
proof suite fails if a declared field is not actually reachable from the scan (section E, 13
fields, all reachable). The extension uses the **canonical `CITATION_SHAPED_PATTERN`, imported** — a
second, differently-worded pattern for the same job is how two boundaries start disagreeing about
what a citation is.

**This is a real, recurring cost of adding prose to this contract, and it is easy to miss.** It is
the single most likely way a well-intentioned vNext quietly weakens §193.

### 3. "No matcher over generated English" — where each candidate stands

`owed-fact-binding.ts` sets `CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED` and
says why: *"a deterministic gate over question prose would be exactly the instrument retired for
being satisfiable by the observation itself."* `structural-questions.ts` refuses to split a compound
string on a conjunction. §166 dropped v2's 0.8 content-overlap rule because *"a content-overlap score
IS a free-text semantic gate."*

**Not one candidate here reads a question and judges it.** Every deterministic rule proposed is one
of exactly four kinds, all of them already in the file:

| kind | precedent in the repo |
|---|---|
| closed-set membership by exact string equality | `bindingFactKey`, `regulatoryBasis.sourceIds` |
| substring containment against the observation | `nominatedFact.observationSpan` |
| byte inequality between two declared strings | `BRANCHES_IDENTICAL`, `DECISIONS_DO_NOT_DIVERGE` |
| a declaration checked for agreement with the payload | `clarificationSourceMode` |

The model **declares** a structure; the structure is checked for internal consistency and against
closed sets supplied with the request. The residual — whether the declaration is truthful about the
prose beside it — stays `REQUIRES_HUMAN_TRUTH` on every candidate, and each one names its own.

---

## Class 1 — exact owed-target representation

### The structural defect

A `bindingFactKey` is an **opaque identifier**. The admission rule proves the verifier *named* a
member of the supplied set. Nothing carries what the verifier took that member to be *about*, so **a
verdict aimed at the owed property and one aimed at a neighbouring property are the same artifact**.

The asymmetry is visible in the code, not inferred:

- `V3SuppliedOwedFact` renders `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`,
  `decisionDivergence` and optionally `evidenceSpan`.
- The first-pass declaration's `missingFact` reaches **neither the projected `OwedFact` nor the
  verifier prompt**. (§200 tracks this as axis **Q**; Agent 3 owns the `OwedFact` side. My side is
  self-contained and does not wait on it.)
- `V3_ADMISSION_RULE_CLASSIFICATION` already concedes
  `THE_BOUND_QUESTION_ACTUALLY_ANSWERS_THE_BOUND_FACT: 'REQUIRES_HUMAN_TRUTH'` — and a human
  reviewing that today must reconstruct the verifier's target from rationale prose, because no field
  states it.

This is exactly §200's **TOPIC REACH ≠ EXACT BINDING** distinction, and the contract carries no
representation of the second half.

### C1a — owed-property restatement · rank 10.0 · (4 × 5) / 2

One required sentence per declaration that **binds or challenges**: *"the property I take this fact
to be about is X"*; `null` on `STILL_UNRESOLVED` so output stays bounded by work actually done.

**Nothing checks X for correctness, and that is the point.** It converts axis-L review from inference
over prose into comparison of two named properties. It also restores, on the verifier side only, what
the projection drops.

- Deterministic: present and non-blank exactly where owed; null elsewhere.
- Human truth: whether the restated property is the owed one; whether it describes the question
  written or merely re-reads the fact.
- Prompt block placed **directly after "ONE FACT DOES NOT COVER ANOTHER"** in step 6 — the existing
  statement of the exact-target rule. Placing it in the question-quality paragraph would make it read
  as a wording exercise.
- Risk: it invites post-hoc rationalisation of a target already chosen. The block counter-instructs
  explicitly (*"write it from the fact as you were given it, before you look at any question"*),
  which is mitigation and not proof.
- **Hosted validation:** a prospective cohort measuring only legal population **and** whether a human
  can adjudicate exact-target binding *from the structured output alone*. The reviewability claim is
  the claim; no behavioural improvement is claimed or measurable here.

### C1b — nearest-neighbour discrimination · rank 6.0 · (3 × 4) / 2

Drift is drift **to a neighbour**, and a neighbour is by definition another member of the supplied
set — so the discrimination is expressible in the closed-set discipline the contract already uses.
Name a second supplied key; it must be supplied and must not be the bound one. Only the key is
checked. Inapplicable, and refused, when one fact was supplied.

- Risk: a conditional-required field is the shape that produced the v3 `clarificationSourceMode`
  self-contradiction §188 found. The description must state the condition once.
- **Hosted validation:** restricted to rows supplying ≥ 2 facts — **the denominator is the executions
  where the behaviour was available**, never all rows.

---

## Class 2 — resolution-sufficiency representation

### The structural defect

`proposedClarification` carries `question`, `whyItMatters`, `affectedDecision`, `evidenceGap` — four
prose fields, **none of which states what an answer would have to consist of**.

A *nomination*, by contrast, is required to state two answer states and two diverging decisions, and
is refused with `BRANCHES_IDENTICAL` / `DECISIONS_DO_NOT_DIVERGE` if it does not. **The verifier is
held to a higher representational standard for a fact it invents than for a question it proposes.**

### C2a — settlement test · rank 10.0 · (4 × 5) / 2

Apply the nomination's own structure to the proposed question: the answer that would establish the
property, the answer that would refute it, and what is done today under each. Checked by the two byte
comparisons already in the file.

**Does this fall foul of the no-matcher rule? No, and here is the exact reason.** Nothing reads the
question text. Nothing compares the question to the fact. Nothing scores similarity. The verifier
*declares* a structure and the structure is checked for internal consistency — the same shape as
`clarificationSourceMode` agreeing with the payload. What it establishes is a **necessary** condition
(a question whose two admitted answers lead to the same action cannot settle anything) and **never a
sufficient one**. The proof suite makes that limit concrete: D.3f shows two answers differing by one
character are admitted.

- Human truth: whether the question as written admits only those two answers; whether either would
  establish the property; whether the decisions would really follow.
- Placement: end of the question-quality paragraph. Step 3 tests whether the *first pass's* question
  is sufficient; this tests the same thing about the verifier's own, and belongs where the verifier's
  own question is specified.
- Cost note: four prose fields on every proposal — **the largest prose addition of any candidate**.
- **Hosted validation:** legal population, plus a **human sample** of whether the declared answers
  are answers the written question would actually receive. The second is the whole risk and cannot be
  measured mechanically.

### C2b — accepted evidence bound to the fact's own governed criterion · rank 5.0 · (5 × 3) / 3

**The finding behind this candidate is the most consequential thing in this report.**

`OwedFact.acceptableEvidence` **already exists**. It already carries `requirement`, `examples`,
`insufficientExamples` and a `provenance` vocabulary that restricts who may author it, with
`PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES` and `PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES` recorded
in code. Its own header says it exists because §169 found four questions that named the right fact
while accepting evidence that could not settle it.

**`V3SuppliedOwedFact` does not carry it.** The component whose declared job includes judging whether
a question would settle a fact is **never shown the architecture's own statement of what would settle
it**, and emits no field naming what its question would accept. That is a wiring gap, not a design
gap, and it is checkable in twenty seconds by comparing two interfaces.

The candidate closes both halves:

1. **Input side:** render `requirement`, `examples`, `insufficientExamples` per fact — **only** where
   `provenance` is production-permitted. `renderableAcceptableEvidence` is the gate and **fails
   closed to null**.
2. **Output side:** the verifier names the evidence class its question would accept, **copied by
   exact string equality** from one of the supplied lists, plus which list it came from — checked for
   agreement with where the string actually appears.

**The one refusal it adds is property-relative and never blanket.** A question is refused only when
the verifier's own declared class is exact-string-equal to a member of **this fact's own**
`insufficientExamples`, under a permitted provenance. No evidence class is declared weak anywhere.
D.4c proves the point: the *same* class is admitted for the fact next door, whose criterion does not
name it. D.4l proves the gate is provenance-bound: with a non-permitted provenance the refusal does
not fire, because nothing authorised the criterion.

**The leak surface, stated plainly.** `buildVerifierV3UserPrompt`'s header asserts that no human
disposition, no expected selector and no scoring vocabulary reaches the model. An `acceptableEvidence`
authored under `DEVELOPMENT_HUMAN_TRUTH` or `ADJUDICATION_LABEL` is **grading truth**, and rendering
it would breach that assertion; `MODEL_SELF_AUTHORED` would hand the model its own output back as
authority. All three return null (D.4h–j).

- Feasibility is 3, not 5, for an honest reason: **`acceptableEvidence` is null on the projected
  facts today**, so the refusal would be live on an empty population until someone with authority
  authors criteria from a trustworthy production source. That is not an engineering decision.
- **Hosted validation:** two arms. (1) rows whose facts carry a permitted non-null criterion — the
  only population where the refusal is live. (2) a **precision** arm on rows where the criterion is
  null or non-permitted, proving the field degrades to an ungated declaration and refuses nothing.

---

## Class 3 — compound-question representation

### The structural defect

The contract admits **at most one** `proposedClarification` and **at most one** `bindingFactKey`, and
refuses a second bound declaration with `MORE_THAN_ONE_FACT_DECLARED_BOUND`. A verifier facing two
supplied facts that each need a question has **no legal way to supply two**.

**The compound string is not a lapse the representation permits; it is the only shape the
representation leaves.** The proof suite demonstrates this directly at **D.5a**: a well-formed
two-question, two-binding verdict is refused by the unmodified v3.2 boundary.

And the two layers currently disagree with each other. `structural-questions.ts` states the
invariant — *"the architecture now refuses to equate one string with one decision-critical fact"* —
and enforces it at assembly, while the verifier contract enforces the opposite at emission. When a
provider returns one string covering two facts, only the explicitly bound fact is projected and the
other stays `UNRESOLVED` with the coverage warning live. That is safe. It is also a fact that the
customer never gets asked about, arriving inside a string that looks like it covered both.

### C3a — one additional clarification slot · rank 3.0 · (4 × 3) / 4

A fixed second slot binding a **different** supplied key. Fixed rather than an array: the grammar
cost is one object clone rather than unbounded repetition, and reverting is a property deletion.

**It collides with a frozen rule, and is handled the way §196 handled the same problem.** Two legal
bindings trip `MORE_THAN_ONE_FACT_DECLARED_BOUND` and `BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY`
in the unmodified v3 layer. Rather than edit v3 — which would detach §187–§199 from the hashes that
produced them — the composed checker **withdraws exactly those two refusals**, and only when they are
the **sole** objections, the offending key is exactly the second slot's binding, and both detail
strings **reconstruct exactly** from the raw output. That is the v3.3 citation-reuse pattern applied
unchanged, including its defensive branch. D.5i proves the withdrawal is not ambient; D.5j proves it
does not fire while any other objection stands.

- **The dominant risk is question inflation.** Raising a ceiling is an invitation to fill it, and
  this programme has repeatedly refused to buy recall by asking more. The §165 question budget
  governs *assembly* and does not reach the verifier. The prompt block says so explicitly (*"a second
  slot you fill because it is there is a question you should not have asked"*), which is mitigation,
  not evidence.
- Every downstream consumer — the ledger bridge `bridgeV3OutputToLedgerInputs`, the budget, the
  structural-question projection — currently assumes at most one proposal.
- **Hosted validation:** the heaviest of any candidate. Measure **inflation first**, with
  single-fact rows as the control (the slot must stay null there). Nothing may be concluded before
  the inflation arm reads out.

### C3b — unbounded clarification array · rank 1.6 · recorded, deliberately not built

The general and honest form: N facts, N questions. Not built, for three structural reasons.
(1) An array of objects with an inner enum is precisely the construct the §199 grammar failure names.
(2) `MORE_THAN_ONE_PROPOSED_CLARIFICATION` is a v1 invariant carried unchanged through v2 and v3;
withdrawing it is a rewrite of the layer every frozen evidence package is attached to, not a
composition over it. (3) It removes any ceiling on questions at exactly the layer that has no budget,
so the budget would have to move first. **C3a is the same idea bounded at two, which is where it can
be validated cheaply.**

---

## Class 4 — temporal-scope handling

### The structural defect

Nothing in the proposal expresses the **moment** an answer must speak for. *"Was the interlock
verified?"* and *"was the interlock verified after the overhaul and before restart?"* are
indistinguishable to every deterministic rule in the contract and to any reviewer reading structured
output rather than prose.

The asymmetry with the first pass is the argument. §176 (v14) added an explicit verification-time
rule, and §178 (v15) added a five-step property determination whose step (v) hands off to it —
*"only once (iv) matches does timing arise"*. Both are **reasoning rules in the first-pass prompt**.
The verifier's v3.1 conjunctive-sufficiency block names *"a thing done AFTER one event and BEFORE
another"* as a conjunct to test. **No field anywhere records the answer.** The determination is made
and then discarded.

### C4a — temporal scope declaration · rank 4.0 · (3 × 4) / 3

Four closed members — `NOT_TIME_DEPENDENT`, `STATE_AT_THE_TIME_OF_ANSWER`,
`AT_OR_BEFORE_A_NAMED_EVENT`, `BETWEEN_TWO_NAMED_EVENTS` — plus a `moment` string required for exactly
the two event-bounded members and null for the other two.

**The vocabulary is about the shape of a moment, never about intervals, ages or schedules.** §176
spent an entire remediation denying the interval reading (*"THIS IS ABOUT THE DECISION, NEVER ABOUT
AGE"*), and an enum is exactly how that reading gets smuggled back. D.6g scans the members — not the
description, which uses those words to *deny* them — and confirms no member is interval-shaped.

- **The honest risk, and I do not think it is small:** a closed vocabulary invites force-fitting, and
  a member chosen because it was nearest distorts the record rather than enriching it. This
  programme's own discipline is to pick a frozen member only when it represents the actual mechanism
  and never to force a near-member. I deliberately did **not** add a `NOT_REPRESENTABLE` escape
  member — it becomes a dump — which means the fit risk is carried, not designed away.
- **Hosted validation:** measure **vocabulary fit before anything else** — the count landing on each
  member, and a human sample of whether the chosen member represents the actual moment or was
  force-fitted. A vocabulary that collects most of its traffic on one member is not carrying the
  distinction.

---

## Class 5 — function versus appearance

### The structural defect

Same root as class 2 and worth separating because the failure shape is distinct: an admitted binding
proves the question *names* the fact; **nothing represents what an answer would consist of**, so a
question answerable by a status indicator and one requiring a demonstrated protective response are
the same artifact.

`owed-fact.types.ts` records the history in its own header — §169 found four questions that named the
right fact and accepted *physical presence, visibility, a status indicator*. v3.1's adjacent-property
block and v15's property determination are both **prompt priors**. `acceptableEvidence` is the
**task-state** answer the architecture built for it, and, as class 2 established, **the verifier is
never shown it**.

### C5a — sufficiency review pair · rank 9.0 · derived report, zero grammar cost

Given C1a's restated property and C2b's declared evidence class, the pair *(property, accepted
class)* is exactly the comparison a reviewer must make; today it has to be assembled by hand from
three artifacts. The projection assembles it, attaches the governed `requirement` beside it, and
**classifies the relation as `REQUIRES_HUMAN_TRUTH` in a literal type**. It does not answer it. Built
only from an admitted verdict — D.8d proves a refused verdict yields no pair, because refused fields
must never be presented to a reviewer as though they had been accepted.

Adds no field, costs no grammar (D.8e). Feasibility is 3 only because it cannot exist until C1a and
C2b do.

### C5b — an authored property × evidence sufficiency matrix · rank 0.8 · recorded, deliberately not built

The obvious next step, and I am declining it on a settled repository position rather than on taste. A
matrix saying *"a status indicator never establishes a protective function"* is a **blanket
evidence-class insufficiency rule**, and the standing rule here is that remediation stays
property-relative and evidence-relative: the same status indicator is exactly the right evidence for
a fact about whether the indicator itself annunciates. It also freezes a semantic judgement into code
where a **governed, per-fact criterion carrying a provenance already exists**. C2b uses that
criterion instead — which is precisely why C2b is property-relative and this is not.

---

## Class 6 — challenge-fact-validity reviewability

### The structural defect

A challenge is one enum token plus one free-text `challengeReason`. The bridge turns it into
`ArbitrationRequest { factKey, requestedBy, reason, settles: false }`.

**A challenge is a request for arbitration and is the one output here whose entire purpose is to be
reviewed. It currently arrives without the evidence its own stated ground requires.**

Three things a reviewer needs and does not get:

1. **Which ground.** The prompt names two — *the observation already settles it* **or** *answering it
   either way leads to the same thing being done today*. They need **different evidence** and
   **different arbitration**: the first is checkable against the observation; the second is a
   decision-divergence claim about the branches the reviewer already holds. One prose field collapses
   them, so a reviewer cannot know what to check without reading prose, and cannot triage a queue at
   all.
2. **The span, for ground one.** This is the sharpest asymmetry in the whole contract: a
   **nomination** asserting *the observation leaves this fact open* **must** quote a verbatim span,
   checked by containment (`OBSERVATION_SPAN_NOT_VERBATIM`). A **challenge** asserting the exact
   opposite — *the observation settles this fact* — **need not point anywhere at all.** The contract
   demands proof for the claim that creates work and accepts bare assertion for the claim that
   removes it.
3. **The common action, for ground two.** The verifier was *given* `decisionDivergence.ifA` and
   `ifB`. The challenge claims they do not actually diverge. That claim has a content — one action —
   and there is nowhere to put it.

### C6a — challenge ground and its evidence · rank 25.0 · (5 × 5) / 1 · **highest ranked**

`challengeGround` (two members), `challengeObservationSpan` (verbatim, required for the ESTABLISHES
ground and refused on the other), `commonActionUnderBothBranches` (required for the SAME_ACTION
ground and refused on the other). All three null and refused on any declaration that is not a
challenge.

The span check is `input.observation.includes(span.trim())` — **the nomination rule, applied to the
claim that runs the other way**. `reviewableArbitrationRequests` projects the packet with
`spanVerbatimVerified` recorded, and `settles: false` / `factStatusUnchanged: true` remain literal
types. D.7m confirms no field name on a declaration could carry a settlement.

Why this ranks first on every axis:

- **Value 5** — it fixes an asymmetry visible in the file, on the one output that exists to be
  reviewed by a person.
- **Feasibility 5** — three nullable fields on an existing array item, one two-member enum, one
  containment check copied verbatim from an adjacent rule. No withdrawal, no input-side change, no
  interaction with any existing code path.
- **Risk 1** — the fields are inert on every declaration that is not a challenge, so the blast radius
  is confined to a state that must already be reviewed by a person.

**The one real risk, and how it must be measured:** requiring a span may suppress challenges a
reviewer would have wanted to see. That is a **count**, and the cohort must report it.

**On base rate, stated carefully.** §199 produced `CHALLENGE_FACT_VALIDITY` on **1 of 8** admitted
verifier calls. That is **one observation and it is not a rate.** Any cohort must be **sized to
obtain challenges** rather than assumed to contain them; if challenges stay rare the honest readout
is a literal *x/n* and `NOT_MEANINGFULLY_ESTIMABLE`, never a percentage. Nothing about whether that
one challenge was right appears anywhere in this document, and nothing here was designed against it.

---

## Ranking — (value × feasibility) / risk, computed, not asserted

The suite proves the ordering is **computed from the recorded scores** (A.15); no rank is written
down as a literal anywhere.

| rank | candidate | class | build | V | F | R | score |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | **C6a** challenge ground + its evidence | C6 | prototyped | 5 | 5 | 1 | **25.00** |
| 2= | **C1a** owed-property restatement | C1 | prototyped | 4 | 5 | 2 | **10.00** |
| 2= | **C2a** settlement test | C2 | prototyped | 4 | 5 | 2 | **10.00** |
| 4 | **C5a** sufficiency review pair | C5 | derived report | 3 | 3 | 1 | **9.00** |
| 5 | **C1b** nearest-neighbour discrimination | C1 | prototyped | 3 | 4 | 2 | **6.00** |
| 6 | **C2b** accepted-evidence binding | C2 | prototyped | 5 | 3 | 3 | **5.00** |
| 7 | **C4a** temporal scope | C4 | prototyped | 3 | 4 | 3 | **4.00** |
| 8 | **C3a** second clarification slot | C3 | prototyped | 4 | 3 | 4 | **3.00** |
| 9 | **C3b** unbounded array | C3 | recorded only | 4 | 2 | 5 | **1.60** |
| 10 | **C5b** authored sufficiency matrix | C5 | recorded only | 2 | 2 | 5 | **0.80** |

**Two cautions about reading this table.**

- C2b sits sixth on a **feasibility** discount, not a value one. Its value is the highest awarded
  here (5) and it is the only candidate that makes sufficiency checkable against an authority outside
  the model. It ranks low because `acceptableEvidence` is unpopulated today. **If that authoring
  happens, C2b's feasibility rises and it moves near the top.** Do not read rank 6 as "less
  important".
- The scoring is my engineering judgement about artifacts, recorded with a justification for each of
  the three numbers so it can be argued with. It is not a measurement.

**Suggested sequencing, if any of this is taken forward.** C6a alone first — highest value, lowest
risk, +788 schema bytes, and it can be canaried by itself. Then C1a + C2a together (+1,210 bytes,
0 enum members). C2b when its criteria exist. C4a and C3a only against their own dedicated arms
(vocabulary fit; question inflation), because both can make things worse in a way the others cannot.

---

## What was built, and what the proof suite establishes

**Module** — `backend/scripts/lib/expert-201-verifier-vnext-candidates.ts`
**Suite** — `backend/scripts/test-201-verifier-vnext-candidates.ts` → **216 passed, 0 failed**

Run: `cd backend && npx ts-node scripts/test-201-verifier-vnext-candidates.ts`

Following the repository's additive-successor discipline: every candidate is built **by construction**
from `EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT` and `VERIFIER_V3_2_RESPONSE_SCHEMA`, applying prompt blocks
at **named anchors that must appear exactly once** and schema patches at named sites; application
against a drifted base **aborts** rather than guessing (B.8, B.9).

| section | what it proves |
|---|---|
| **A** registry | all six classes argued structurally; every candidate names what it does **not** decide, justifies all three scores, states its hosted validation; ranking computed; no §200 verdict vocabulary and no §199 row identifier anywhere |
| **B** construction | every candidate, individually and all together, **reverts to v3.2 byte-for-byte** — prompt and schema; revert is order-independent; v3.2 byte-unchanged throughout |
| **C** grammar cost | four measures per candidate; the §199 reference recorded with its metric and its non-applicability to the verifier request; transport canary required |
| **D** boundary | 60+ assertions: each legal state admitted, each illegal state refused; the C3a withdrawal is not ambient and does not fire alongside another objection; the C2b provenance gate fails closed; projections are gated on `admitted` |
| **E** prose hazard | all 13 new prose fields reachable from the citation scan; a citation in a new field is refused; the **canonical** §193 pattern is used, not a second one |
| **F** identity | v3.2 byte-unchanged; no candidate named as a protocol version; every prototyped candidate names a human-truth condition |

### What the suite cannot establish

**That any candidate improves a verdict.** A representational change is a change to a string and a
schema; whether it produces better judgement is **behavioural** and answerable only by a preregistered
hosted cohort that §201 does not authorize. Every section proves a property of the **artifact**.

It also establishes nothing semantic, and must not: zero §200 slots are filled and every fixture is
generic and invented for the shape it exercises — no §199 row, no cohort wording, no trade vocabulary
from any frozen instrument.

---

## What I need and did not take

Recorded in code as `OPEN_QUESTIONS_FOR_AUTHORIZATION`, and repeated here because it is the part that
blocks.

1. **`backend/package.json`** — orchestrator-owned. Requested entry:
   `"test:201-verifier-vnext": "ts-node scripts/test-201-verifier-vnext-candidates.ts"`.
   No tsconfig change is needed; the suite runs under the existing `npx ts-node` invocation used by
   every other `scripts/test-*.ts`.
2. **`expert-verifier-instruction-v3-2.ts` / the user-prompt builder** — C2b's input-side render needs
   a successor to `buildVerifierV3UserPrompt`. I may not modify that file and did not. Whoever owns
   it must add the render, and it **must** be gated by `renderableAcceptableEvidence`.
3. **Populating `OwedFact.acceptableEvidence`** from a production-permitted provenance. C2b is live on
   an empty population until then. **Who authors safety-settlement criteria is a product and safety
   decision, not an engineering one**, and I am not making it.
4. **Promoting any candidate to `v3.4`** — its own preregistration, its own hashes, an offline request
   build and a single-row transport canary. Nothing here is a version and nothing here is enabled.

## Residual uncertainty I want on the record

- **The verifier schema's real headroom is unknown.** 4,998 bytes is far below the first pass's
  ~19,060, but the threshold is undocumented, the metric is compiled grammar, and the verifier
  request's *total* grammar depends on how it is sent — which I did not measure, because measuring it
  properly means building the actual request and I have no authority to send one.
- **C4a's vocabulary may not fit the domain.** I chose four members and no escape hatch, on the
  reasoning that an escape member becomes a dump. That is a judgement, and the fit arm of its
  validation exists to falsify it.
- **C3a's withdrawal path is the most delicate construct here.** It is precedented at v3.3 and
  proved at D.5b/i/j, but it is one wrong precondition away from admitting a genuinely double-bound
  verdict. If any of this ships, that path deserves an independent read.
- **Class 5 has no candidate of its own that is both cheap and property-relative.** C5a is a report
  over two dependencies; C5b I declined on principle. If the settlement criteria in (3) never get
  authored, this class has no structural answer in this document — and I would rather say that than
  pad it.
