# §180 — CLARIFICATION SETTLEMENT ARCHITECTURE REVIEW

**Review and design only. Zero provider calls, zero database operations, zero source-code changes.
Nothing was implemented, v15 was not touched, v16 was not begun, verifier-v3 remains inactive.**

Date 2026-09-05. Companion artifacts: `CURRENT-DATA-FLOW.md`, `PROPOSED-DATA-FLOW.md`,
`ARCHITECTURE-OPTIONS.json`, `RISK-REGISTER.json`, `IMPLEMENTATION-SEQUENCE.json`,
`RECOMMENDATION.json`.

---

## The four findings that shaped everything below

Read from the implementation, not from the documentation. Each is sourced in `CURRENT-DATA-FLOW.md`.

1. **The settlement state already exists and is unreachable.** `SETTLED_BY_EVIDENCE` is a declared
   status requiring an `ADMISSIBLE_EVIDENCE` authority, and no code path anywhere mints that
   authority. The single minting site in the repository produces `ADMITTED_BINDING`. **Today a fact
   can only leave `UNRESOLVED` by being asked about.**
2. **The challenge channel has a producer and no consumer.** `CHALLENGE_FACT_VALIDITY` — described in
   the instruction as *"the observation already settles it"*, which is HR-04's sentence — produces an
   `ArbitrationRequest` that nothing consumes. No `RECORDED_ARBITRATION` transition is ever minted.
3. **The provider is never asked what property its evidence establishes.** It is given the target
   (`acceptableEvidence.requirement`, plus examples and insufficient examples) and returns one of
   three bookkeeping tokens. The comparison §178 tried to teach in prose is the one step the
   structured channel does not represent.
4. **Both §179 failure shapes occurred where the architecture is absent.** HR-04, HR-05 and HR-07 ran
   through the *first-pass* v15 prompt, which has no ledger, no factKey and no binding. The
   architecture that would make a displaced question structurally refusable is built, locally proven
   (§165), exercised hosted once (§167), human-reviewed (§169) — and switched off.

Finding 4 is the one that disciplines this review. **§179 is not evidence against the existing
architecture, because the existing architecture was not running.** Any claim in either direction is
unmeasured, and the review is careful below never to credit the architecture with a fix.

---

## Q1 — Owed fact representation

**Answer: option C — reuse `acceptableEvidence`. Add no new field to `OwedFact`.**

`AcceptableEvidence.requirement` is already documented as *"One sentence naming the capability the
evidence must establish"*. That **is** a settlement target. It is derived from a governed record
through a hazard-agnostic sentence frame, it is projected to the provider, and it is nullable by
design.

| option | assessment |
|---|---|
| **A** `requiredProperty` free-text | Duplicates `requirement` with a name that invites a vocabulary. Two fields that must agree is a defect surface. **Rejected.** |
| **B** `settlementTarget {factKey, requirement, propertyDescription}` | `factKey` is already the owner, `requirement` already exists. `propertyDescription` is the only new content and it is exactly where a closed ontology would grow. **Rejected**, and rejected specifically because constraint 4 says it must not quietly reappear. |
| **C** extend/reuse `acceptableEvidence` | Provenance rules, production-permitted lists, null semantics and the governed derivation all already apply to it. Schema stability is perfect: the projected shape does not change. **Selected.** |
| **D** derive only from existing governed requirement text | This is C without acknowledging that `requirement` is null for most facts today. It is the correct *fallback*, not the design. **Adopted as the null branch of C.** |

Assessed against the required dimensions: **determinism** — the target is deterministic to derive and
byte-stable; **semantic flexibility** — `requirement` is a sentence, so any governed knowledge can
express any property without a schema change; **provenance** — already typed, with production-permitted
and production-forbidden lists; **provider visibility** — already projected, with provenance stripped;
**schema stability** — unchanged; **risk of hard-coding** — lowest of the four, because no enumeration
is introduced; **compatibility with nominated facts** — a nominated fact carries `acceptableEvidence:
null` and behaves as the null branch; **compatibility with null** — preserved as first-class, which is
the normal case today.

**The honest weakness of C:** most facts have no criterion, so most settlement claims will be
unverifiable-by-construction. That is a *reporting* obligation, not a reason to invent criteria — see
Q6 and Q7.

## Q2 — Settlement declaration

**Answer: yes, a per-fact settlement declaration is justified — split across layers, and structurally
distrusted by construction.**

Layer split:

- **Deterministic projection** supplies `factKey` and the target (or explicit absence). It is already
  built.
- **Provider completion** supplies `evidenceObserved` (verbatim span), `evidenceEstablishes` (free
  text), `settlementAssessment` (small closed set), `unresolvedReason` (free text).
- **Verifier structural checks** admit or refuse the declaration on *form* only.
- **Human review** is the sole authority that may convert a settlement claim into
  `SETTLED_BY_EVIDENCE`.

The field names above are illustrative and should not be treated as decided; the authorization is
right that they are not obviously correct.

**On not trusting `settlementStatus = SETTLED`.** The architecture already contains the exact
precedent, and it should be reused rather than re-invented: a `CHALLENGE_FACT_VALIDITY` is typed
`settles: false, factStatusUnchanged: true`. A settlement claim gets the same treatment. It is a
*request for review*, it leaves the fact `UNRESOLVED`, and it does not suppress a clarification.

The structural checks available without pretending semantics are enumerated in
`PROPOSED-DATA-FLOW.md`: verbatim-span byte equality, exactly-one-declaration-per-supplied-fact,
field presence, the settled-and-bound contradiction, the null-criterion flag, the forbidden-field
echo check, and enum membership. **Every one is a property of form.** Nothing compares
`evidenceEstablishes` to `requirement`, because that comparison is the semantic judgement itself.

## Q3 — Settlement states

**Answer: keep the status set closed at four. Put the vocabulary in a *reason*, not in a status.**

`OWED_FACT_STATUSES` is authority-bearing: each terminal member is bound one-to-one to the authority
that may produce it. Adding `PARTIALLY_ESTABLISHED`, `EVIDENCE_ABSENT`, `EVIDENCE_PROPERTY_MISMATCH`
or `TEMPORAL_SCOPE_UNRESOLVED` as statuses would require inventing an authority for each — and there
is no authority that produces "partially established" without a semantic judgement.

The distinction the authorization proposes is the right one and should be taken literally:

- **status** stays small and closed and authority-bearing: `UNRESOLVED`, `COVERED`,
  `SETTLED_BY_EVIDENCE`, `REJECTED_BY_ARBITRATION`.
- **`settlementAssessment`** is a *declaration* value, not a status — small and closed for enum
  checking, and carrying no authority.
- **reason** stays open text plus, optionally, a small observability-only code set. A code here
  decides nothing, so a wrong code is a labelling error rather than a safety event.

`EVIDENCE_PROPERTY_MISMATCH` and `TEMPORAL_SCOPE_UNRESOLVED` are exactly the two shapes §178 and §176
were written about, and they are valuable **as diagnostic reasons** — they would have made HR-04's
three replicates legible at a glance. As statuses they would be a brittle taxonomy pretending to
authority.

## Q4 — Clarification entitlement

**Answer: the candidate ordering is compatible, and six of its nine steps already exist.** See
`PROPOSED-DATA-FLOW.md` for the annotated sequence.

Compatibility, checked item by item:

- **Current Expert contract** — compatible, but only on the verifier path. The first-pass contract has
  no factKey; putting settlement into the first pass would be a much larger change and is not
  proposed.
- **Verifier-v3 inactive modules** — compatible; the new work is additional admission codes and one
  additional declaration block, both inside the already-gated stage.
- **Additive-not-substitutive nomination** — preserved. `nominateAdditiveFact()` structurally cannot
  express replacement.
- **Multi-gap preservation** — preserved and *improved*: a fact settled by evidence stops competing
  for the budget without being dropped.
- **Target coverage warnings** — unchanged; coverage still reads only the whitelisted five inputs.
- **Compound-question repair** — unchanged; one question still binds exactly one factKey.

One ordering caution: step 5 (semantic settlement assessed) must not be allowed to run *before* step 6
(exact factKey coverage checked). Structural coverage is cheap and deterministic; letting a semantic
claim short-circuit it would make the deterministic half depend on the semantic half.

## Q5 — Precision / displaced-valid-fact control

**Answer: the control already exists in the architecture. It was not running in §179.**

Every clarification declaration must be `BOUND_TO_OWED_FACT` (naming a key in the closed set) or
`NOMINATED_NEW` carrying a full proof burden — verbatim evidence span, two distinct branches, two
diverging decisions, valid `affectedDecision` and `priority`, non-colliding key, at most one
nomination. That is precisely the "bind to `EXISTING_OWED_FACT` or `NEWLY_NOMINATED_OWED_FACT` with
explicit justification" the authorization asks about, and it is implemented with 24 admission codes.

HR-05 and HR-07 did not defeat this control; they never met it. On the first-pass path a
clarification binds to nothing.

**Does explicit settlement state add anything here?** Modestly, and worth having: today a nomination
must prove itself, but nothing records that the *owed* fact was settled at the moment the adjacent
fact was nominated. With settlement declared, "fact A settled, fact B nominated in the same response"
becomes a visible, countable pattern rather than an inference from prose. That is the §179 HR-05/HR-07
shape made observable.

**The guard against over-suppression, stated plainly:** a newly nominated fact must pass the
*structural* sequence, never a test of whether it is important enough. The system must keep the
property that a genuinely new hazard can always be raised as a candidate, and the review explicitly
rejects any rule of the form "a settled owed fact suppresses adjacent nominations."

## Q6 — `acceptableEvidence` interaction

**Answer: its role is unchanged, and the change is that it becomes the thing a declaration is
compared against *by a human*, not by code.**

It should guide what would settle the fact (`requirement`), what evidence classes would suffice
(`examples`) and what looks sufficient and is not (`insufficientExamples` — the half §169 exists for).
Final semantic sufficiency stays unresolved until model or human judgement.

**When `acceptableEvidence` is null** — the target is projected as explicitly absent; a settlement
claim is recorded and flagged `SETTLEMENT_CLAIMED_WITHOUT_GOVERNED_CRITERION`; the fact stays
`UNRESOLVED` and cannot reach `SETTLED_BY_EVIDENCE`. Behaviour is otherwise identical to today.

**When the governed criterion is weak or coarse** — it is projected unchanged. §171 established the
concrete shape of this problem: seven of nine distinct verification methods across the twenty
approved records are looking-based (`physical_inspection`, `observation`, `visual_inspection`,
`walkthrough`), which is the exact class §169 ruled insufficient for a protective-function fact. The
architecture must not paraphrase, strengthen or supplement it. A settlement claim resting on a coarse
criterion should be *visibly* resting on one.

## Q7 — Governed-knowledge gap

**Answer: `EVIDENCE_QUESTION_TO_VERIFICATION_METHOD_ALIGNMENT` is a PARALLEL remediation, not a
prerequisite — but its audit half should run early.**

Not a prerequisite, because the architecture is required to fail transparently on null and coarse
criteria regardless. If it needed a clean registry to be safe, it would be the wrong architecture.
Making it a prerequisite would also block a bounded, testable change behind a knowledge-governance
programme of unknown size.

Not merely a later quality improvement either, because the misalignment is already documented and
concrete: `app-mg-01` asks both whether a guard is present *and* whether it is functional, while its
verification methods may establish only physical inspection and presence. That is HR-04's exact
confusion sitting in the governed record.

**Recommended split:** the *audit* — enumerate approved records where an `evidenceQuestion` demands
property P while `verificationMethods` establish only property Q — is cheap, zero-call, and tells you
how often settlement claims will be unverifiable-by-construction. It should be authorized alongside
stage A. The *remediation* of those records is a separate governed-knowledge authorization and is not
proposed here. **No governed record was modified in §180.**

## Q8 — Customer question budget

**Answer: settlement state helps the budget, and the help is of the right kind — it removes questions
that were never owed rather than dropping questions that are.**

`CUSTOMER_QUESTION_BUDGET` remains `REQUIRES_REMEDIATION` and is unaffected by this review. Within
that, explicit settlement supports:

- **fewer questions without suppression** — a fact settled by evidence stops competing for budget by
  ceasing to be owed, which is categorically different from being deferred;
- **prioritisation** — `LIFE_CRITICAL` is already undroppable and `PRIORITY_RANK` already exists;
- **preservation** — the budget already defers rather than drops, with `DEFERRED` and
  `SUPPRESSED_BY_BUDGET` presentation statuses and recorded deferrals;
- **warnings over silent loss** — already the behaviour, and a fact with no non-invented wording stays
  `UNRESOLVED` with `NO_WORDING_AVAILABLE` rather than disappearing.

On "one question settling multiple compatible owed facts": `mayCombine()` exists, but §168 recorded
that the combination rule does not reach the verifier's returned string, and §169 adjudicated two
draws `COMPOUND_QUESTION_REPRESENTATION = UNACCEPTABLE`. **Settlement state must not be used to
justify combining more facts into one string.** One question, one fact, unchanged.

**No production threshold is defined here**, per the authorization.

## Q9 — Observability

**Answer: development-only, and it must record the comparison, not just the verdict.**

At minimum, per fact per execution: `factKey`; the settlement target and whether it was absent;
`acceptableEvidence` provenance class; `evidenceObserved`; `evidenceEstablishes`;
`settlementAssessment`; `unresolvedReason`; admission codes; final ledger status and the authority
that produced it; clarification binding and nomination origin; target-coverage state; and the
`SETTLEMENT_CLAIMED_WITHOUT_GOVERNED_CRITERION` flag.

The value is diagnostic: on HR-04 this turns three unreadable prose summaries into three rows showing
"owed: current securement / establishes: physically fitted / claim: SETTLED" — the failure legible in
one line rather than recoverable by reading raw output.

**Two prohibitions carry forward unchanged.** No adjudication label is ever exposed to provider
input — `ADJUDICATION_LABEL` is already in `PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES` precisely
because a judgement *about* the system's output fed back in closes the loop the evaluation depends on
being open. And the projection must continue to omit human dispositions, pass/fail status, historical
success rates and expected questions, as the existing proof suite asserts.

## Q10 — Inactive development integration path

**Answer: the staged path is right, with one stage inserted before it.** Full detail in
`IMPLEMENTATION-SEQUENCE.json`.

The insertion matters. Because of Finding 4, the first bounded step is **not** to add fields. It is to
run the *existing* owed-fact architecture against the §179 rows and find out whether the failure
survives it. That is stage A0, it is zero-call and local, and it is the cheapest thing in the whole
sequence that could change the recommendation.

If HR-04 survives A0 — the model receives an explicit owed fact with a governed target and still
declares it handled — the case for the settlement declaration is made on direct evidence rather than
on inference. If HR-04 does not survive A0, the settlement declaration may be unnecessary, and the
programme would have avoided building it.

---

## Options compared

Full comparison in `ARCHITECTURE-OPTIONS.json`. In brief:

- **A — Prompt-only continuation.** Cheapest, no new surface, and the only option with direct
  evidence *against* it: three prompt identities, HR-04 at 0/3, and a replicate that reasoned through
  the exact material and still settled the fact. Not refuted as a category — v15 was one wording at
  one placement — but it has no measurement surface, which is its deeper problem.
- **B — Structured model declaration.** Provider declares settlement reasoning; verifier checks form.
  Buys the diagnosis surface and the safety brake. Does not depend on governed knowledge, so it
  degrades gracefully where criteria are null.
- **C — Governed settlement target plus structured declaration.** B, plus the target the declaration
  is compared against. Strictly better *where a governed criterion exists*, and identical to B where
  it does not.
- **D — Deterministic semantic settlement gate.** Listed only to be refused. It violates constraint 2
  outright and is the matcher §160 retired.

**B and C are not alternatives.** C is B plus a target that is already implemented and usually null.
The recommendation treats them as one option delivered in that order.

---

## Recommendation

**`STRUCTURED_SETTLEMENT_REPRESENTATION_JUSTIFIED`** — option B/C, staged, beginning with A0.

Justification, evidence-based:

1. The ledger already declares a settlement state that nothing can reach, and the challenge channel
   already collects "the observation settles it" claims that nothing consumes. The proposal completes
   two structures the architecture already committed to.
2. §179 showed the settlement decision being made in prose with no structured trace. That is a
   diagnosis problem before it is a correctness problem, and prompt-only continuation cannot fix a
   diagnosis problem.
3. The determinism and semantic boundaries survive: every new check is a property of form, the
   semantic judgement stays human, `acceptableEvidence` stays guidance, the status set stays closed,
   and no closed property ontology is introduced.
4. It degrades gracefully. Where governed criteria are null — most facts today — the behaviour is
   identical to today, with the gap *reported* rather than filled by invention.

**Explicitly not claimed:** that this fixes HR-04, that it fixes displaced-valid-fact leakage, that it
is customer- or production-ready, that it is validated, or that semantic sufficiency becomes
deterministic. Those require implementation and later hosted evidence, and the sequence is built so
that A0 can still overturn the recommendation before any new field is written.

**Terminal:** `EXPERT_HAZLENZ_CLARIFICATION_SETTLEMENT_ARCHITECTURE_REVIEW_COMPLETE —
BOUNDED_INACTIVE_SETTLEMENT_INTEGRATION_AUTHORIZATION_REQUIRED`.
