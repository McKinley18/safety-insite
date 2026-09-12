# §180 — CURRENT DATA FLOW, READ FROM THE IMPLEMENTATION

Zero provider calls. Every claim below was read from source rather than from documentation, and the
file and line are named so a reader can check it.

---

## 1. The path §179 actually measured

```
observation
   -> MultiHazardDecompositionService.decompose()          deterministic findings
   -> buildExpertAnalysisInputFromAnalysis()               expert-input-constructor.ts
   -> EXPERT_SYSTEM_PROMPT (v15) + wire schema             expert-prompt.ts
   -> provider
   -> normalizeExpertOutput()                              expert-normalization.ts
   -> analysis.decisionCriticalClarifications[]            free-form, per-analysis
```

**No owed-fact ledger participates in this path.** There is no `factKey`, no settlement target, no
per-fact declaration and no binding. A clarification is a free-standing object with a question,
`whyItMatters`, `evidenceGap`, `affectedDecision` and `criticality`.

Everything that decides whether a fact is settled — *is the guard's securement established?* —
happens inside the model's prose and leaves **no structured trace at all**. §179's HR-04 replicate 3
is the proof: the settlement decision appears only in `expertExplanation.summary`, as English.

## 2. The path that exists and is switched off

```
owed facts (closed set)                                    owed-fact-ledger.ts
   + acceptableEvidence (may be null)                      owed-fact.types.ts
   -> projectOwedFact()                                    verifier-v3-development-boundary.ts:161
   -> verifier request  [NEVER SENT — gate is a literal false]
   -> provider returns: bindingFactKey, question,
      declarations[{factKey, declaration, challengeReason}]
   -> checkBindingDeclarations() / parseOwedFactDeclarations()   owed-fact-binding.ts
   -> applyAdmittedDeclarations()  -> transition(authority: 'ADMITTED_BINDING')
   -> evaluateTargetCoverage()     -> coverage warning
   -> projectStructuralQuestions() -> one question, one factKey    structural-questions.ts
   -> selectQuestions()            -> budget, deferral, no silent drops   expert-question-budget.ts
```

`EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: false = false` — a literal type, reading no configuration
(`verifier-v3-development-boundary.ts:41`). The deterministic machinery is pure and directly
callable; what the gate governs is the *stage*.

## 3. What the ledger can represent today

`OWED_FACT_STATUSES = ['UNRESOLVED', 'COVERED', 'SETTLED_BY_EVIDENCE', 'REJECTED_BY_ARBITRATION']`
and each terminal status names the one authority that may produce it
(`owed-fact.types.ts:178`):

| status | required authority | producer in code |
|---|---|---|
| `COVERED` | `ADMITTED_BINDING` | `owed-fact-binding.ts:355` |
| `SETTLED_BY_EVIDENCE` | `ADMISSIBLE_EVIDENCE` | **none** |
| `REJECTED_BY_ARBITRATION` | `RECORDED_ARBITRATION` | **none** |

> **Finding 1. The settlement state already exists and is unreachable.** A repository-wide search
> for a minted transition authority returns exactly one site, and it mints `ADMITTED_BINDING`.
> Nothing anywhere constructs `ADMISSIBLE_EVIDENCE` or `RECORDED_ARBITRATION`.

The consequence is precise: **today the only way a fact leaves `UNRESOLVED` is by a clarification
binding to it.** The ledger can record "we asked about this" and cannot record "the evidence in the
observation settled this, so nothing is owed." That second sentence is exactly what Expert concluded
about HR-04 on three consecutive replicates.

## 4. The challenge channel has a producer and no consumer

`CHALLENGE_FACT_VALIDITY` is one of three permitted per-fact declarations, and the instruction text
describes it in the HR-04 words almost exactly — *"the observation already settles it"*
(`expert-verifier-instruction-v3.ts:166`).

It produces an `ArbitrationRequest` typed `settles: false` and `factStatusUnchanged: true`
(`owed-fact-binding.ts:283`). That object is returned and **nothing consumes it**: no arbitration
recorder exists, so no `RECORDED_ARBITRATION` transition is ever minted.

> **Finding 2. A model that correctly says "this fact is already settled" has nowhere to put that,
> and no reviewer ever sees it.** The claim is collected into a queue that is never drained.

## 5. What the provider is asked to declare, and what it is not

Per supplied fact the provider returns exactly one of three tokens plus an optional challenge reason
(`expert-verifier-instruction-v3.ts:155-170`). The instruction is explicit that this is *"bookkeeping,
not a second judgement."*

The provider is **never asked what property the supplied evidence establishes.** It is told what is
unresolved and what would settle it — `acceptableEvidence.requirement`, `examples`,
`insufficientExamples` are projected in (`verifier-v3-development-boundary.ts:145`, provenance
deliberately dropped) — and it answers with one of three words.

> **Finding 3. The comparison §178 tried to teach in prose is the one thing the structured channel
> does not ask for.** The model is given the target and asked for a verdict, with no representation
> for the step in between.

## 6. The boundaries that are already load-bearing

These are not aspirations; they are enforced in code and must survive any change.

- **`COVERAGE_DECISION_INPUTS`** (`owed-fact-binding.ts:50`) whitelists the five fields a coverage
  decision may read. `declaration.question` is explicitly excluded and annotated *"NEVER read by a
  coverage decision."* No coverage logic touches prose.
- **`CLARIFICATION_EVIDENCE_SUFFICIENCY = 'SEMANTIC_JUDGMENT_REQUIRED'`** (`:47`) exists as a named
  constant *"so it cannot quietly acquire an implementation."*
- **`PROVIDER_FORBIDDEN_OWED_FACT_FIELDS`** (`owed-fact.types.ts:219`) refuses any response echoing
  `acceptableEvidence`, `status`, `priority`, `source`, `modelAuthored`, `settled`, `resolved`,
  `covered`, `rejected`. A response carrying one is refused whole.
- **Nomination proof burden** — a `NOMINATED_NEW` declaration must supply a verbatim evidence span,
  two distinct branches, two diverging decisions, a valid `affectedDecision` and `priority`, a
  non-colliding key, and there may be at most one (`BINDING_ADMISSION_CODES`, `:83`).
- **Additive-only** — `nominateAdditiveFact()` *"cannot express replacement: it takes no key to
  remove"* (`owed-fact-ledger.ts:163`).
- **One question, one fact** — `StructuralQuestion.bindingFactKey` is a single string and *"there is
  no array of keys anywhere in this interface"* (`structural-questions.ts:44`).
- **`acceptableEvidence: null` is valid**, and a governed record that is unapproved, placeholder-cited
  or names no verification method yields `null` rather than a weaker criterion
  (`governed-evidence-derivation.ts:53`, `NULL_ACCEPTABLE_EVIDENCE_IS_VALID`).

## 7. Where the two §179 failure shapes actually live

**A — FALSE SETTLEMENT (HR-04).** In the first-pass path, with no ledger, no target and no
declaration. The settlement happened in prose. Neither the §176 temporal rule nor the §178 property
rule fired, and replicate 3 shows the model reasoning *through* the historical torque verification
before closing the fact.

**B — DISPLACED VALID FACT (HR-05, HR-07).** Also in the first-pass path. A clarification there binds
to nothing, so there is no structural sense in which the emitted question is or is not "about the
owed fact" — the concept does not exist on that path.

> **Finding 4. Both §179 failure shapes occurred on the path where the owed-fact architecture is
> absent, not on the path where it is present and failing.** The architecture that would make a
> displaced question structurally refusable is built, proven locally, exercised hosted once at §167,
> human-reviewed at §169 — and switched off.

This does not mean the architecture would have prevented them. It means **§179 is not evidence
against it**, and any claim in either direction is currently unmeasured.
