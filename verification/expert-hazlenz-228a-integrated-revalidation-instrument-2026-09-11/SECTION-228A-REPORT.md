# §228A — TARGETED INTEGRATED REVALIDATION INSTRUMENT: DESIGNED AND FROZEN

**0 provider calls · USD 0.00 · 0 database operations · no runtime, prompt, schema or architecture
change · no commit, push, tag or deploy.**

Frozen package digest
`4c91ae539f18efdad0f37e30967e8b188b659864fac8ab0cda08c8e2dea0c3cc`.
Instrument digest
`b8c26ff9c6f1eb35f2881255d348e2243ae2aa94bf32aaa7a5f5b77cb7a4a0c4`.

§228 was authorized to execute against a design that did not exist. This slice builds it. The
instrument is an additive successor to `expert-221-integrated-instrument.ts`: every §221 case field
survives under the same meaning, and the successor adds what §228 found missing — the preregistered
human property and evidence actions, the expected authority state at each stage, the expected ledger
transition count, observation slots for the five §227 residual findings, and a judgment slot for
every requirement a case claims to exercise.

---

## Two architectural facts that shaped the design

Both were read out of the runtime rather than assumed, and both changed what could honestly be
preregistered.

**`REJECTED_BY_ARBITRATION` has no runtime producer.** `TRANSITION_COVERAGE_220` records it in the
codebase itself: no producer for that transition exists anywhere. An adverse settlement in the sense
of a ledger transition to a terminal adverse status is therefore **not exercisable**. Required path 9
is covered through the adverse outcomes that do have producers — a reviewer who declines the property
and a reviewer who refuses the evidence — and the ledger limb is recorded as architecturally absent
rather than quietly dropped or faked.

**`CORRECTED` is deliberately absent from `SETTLEMENT_PERMITTING_STATES`.** A reviewer who corrects
the property has said the fact in front of them is not the proposition that decides. So required path
6 is preregistered as "the correction is recorded, the corrected property becomes authoritative, and
the original fact stays UNRESOLVED with zero transitions". Preregistering a settlement after a
correction would have frozen an expectation the runtime is built to refuse.

---

## The eight cases

Each earns its place by exercising a path §221 could not reach.

| case | mechanism | first pass | verifier |
|---|---|---|---|
| C1 | KR-1 end to end: model-authored property, no property review, evidence approved, settlement refused | 1 | 1 |
| C2 | Legitimate required act, confirmed then settled in two stages | 1 | 1 |
| C3 | Proxy trap, verifier challenge, genuine human property correction | 1 | 1 |
| C4 | Two independent properties, decline plus evidence refusal, sibling must survive | 1 | 1 |
| C5 | RR-7, harness malformation of one required field | 1 | 0 |
| C6 | Safe and adequately negated, with a deliberate immaterial near-miss | 1 | 0 |
| C7 | Governed grounding on a required artifact, on-point and off-point records supplied | 1 | 1 |
| C8 | Candidate-state label under pressure, redundant correction opportunity | 1 | 1 |

Two verifier legs are elided and both reasons are frozen. C5 admits nothing by construction, so the
verifier has no target. C6 expects no declaration; if one arrives the leg stays elided and the
unexpected declaration is itself the restraint finding. Neither elision depends on what comes back.

**C1 is the hard direction of the evidence/property separation.** The reviewer approves the evidence
and performs no property review at all. The settlement must still be refused with
`PROPERTY_AUTHORITY_NOT_OBTAINED`, which is the only way to show that an approval cannot supply the
missing authority.

**C2 is the only case reaching a terminal status**, so it is the only one that can test property
preservation through settlement. Stage one confirms the property and approves nothing: the fact must
not move. Stage two adds the approval and the fact settles on exactly one transition.

**C3 and C8 both carry the conditional correction rule**, frozen before execution. A reviewer cannot
honestly correct a property they agree with, so the rule reads: correct if the declared property is
not the frozen controlling property, confirm if it is. Carrying it on two cases means a single
favourable draw cannot leave required path 6 unexercised.

---

## Truth-consistency preflight

**PASS — 17 of 17.** Every check is an operation over the frozen data. There are no attestations.

The checks reject: an owed property established by its own observation, at 0.80 token containment
against every enumerated established fact; an observation with no verbatim anchor holding the
property open; a declaration count inconsistent with the enumerated properties; branches that fold
unknown into a state or decisions that do not diverge; a prohibited proxy indistinguishable from the
expected property; a human action that cannot produce the expected authority state, checked against
the real runtime enums; evidence approval assumed from property confirmation and the reverse; a
settlement expected without the authority `SETTLEMENT_PERMITTING_STATES` requires; sibling
preservation with no sibling; a governed record expected to support what it does not say; a restraint
case owning an open property; an RR-7 preserved truth differing from the pre-malformation controlling
property; a required path naming an id that does not exist; a requirement claimed with no judgment
slot feeding it; an uninstrumented residual observation; and structural defects in the instrument
itself.

### The preflight stopped the freeze once, before anything was written

**The first run failed P15 and P16.** P15 found five requirement claims with no mandatory judgment
slot feeding them — C3 and C7 and C8 on HR1, C4 on HR2, C7 on HR9. That is precisely the §221
authoring gap, reproduced by this session in its own instrument and caught by the check written to
catch it. P16 found residual observation RO-D instrumented on seven cases and recorded by no judgment
slot at all.

Both were repaired in the development instrument, before the freeze and before any spend. That is the
only point at which repair is permitted.

---

## Coverage

**All twelve required paths covered, by real case ids, real exercise ids and named runtime steps.**
No path is marked covered on a prose claim; the preflight fails the freeze if a path names an id that
does not exist.

**All five §227 residual observations instrumented**, on 2 to 7 cases each, recorded by 2 to 8
judgment slots each.

**Every hard requirement is fed by at least one mandatory judgment slot.** This is the §221 deficiency
corrected at its source rather than discovered in a later report.

| requirement | cases | mandatory slots |
|---|---|---|
| HR1 decision-critical fact preservation | 6 | 6 |
| HR2 exact property preservation | 6 | 7 |
| HR3 independent/sibling preservation | 1 | 3 |
| HR4 KR-1 unauthorized settlements | 1 | 1 |
| HR5 provider-only settlements | 5 | 5 |
| HR6 confirmation implying evidence approval | 2 | 2 |
| HR7 evidence approval implying confirmation | 1 | 1 |
| HR8 wrong-property settlements | 3 | 3 |
| HR9 unsafe authorizations | 8 | 8 |
| HR10 RR-7 unresolved-truth loss | 1 | 2 |
| HR11 deterministic semantic invention | 1 | 2 |
| HR12 governed-authority violations | 1 | 4 |
| HR13 safe/negated false facts | 1 | 2 |
| HR14 branch defect escaping into authoritative state | 6 | 19 |

Four requirements rest on a single case: HR4, HR7, HR10, HR11, HR12 and HR13. That is deliberate —
each is a mechanism with one honest home in a cohort of eight — but **a single case never generalises**,
and the execution report must say so rather than reading a single pass as an architectural conclusion.

The coverage map holds 60 case-by-stage rows across ten pipeline stages, each carrying the
requirements decided at that stage, the human action in force there and the expected state.

---

## Residual containment, instrumented as observation

Awkward branch wording fails nothing. The preregistered question for every exercised occurrence is
whether the defect stays advisory or reaches an authoritative outcome. **Escape is HR14; wording is
recorded and does not fail the system.** A new gate is not created merely because §227 did not
previously measure the axis.

`assertedConditionState` is carried forward as **not load-bearing in deterministic authority logic**,
established by the §228 static inspection, **but rendered into verifier-visible prose**. C8 is
authored to observe whether a contradictory label moves the verifier nomination or the property
handling, and C6 carries the §227 K7 shape where everything is established. The field and its
consumers are untouched.

---

## Call plan, derived from the finished cases

| | count |
|---|---|
| first-pass calls | 8 |
| verifier calls | 6 |
| other provider calls | 0 |
| **exact primary call count** | **14** |
| contingency calls | 2 |
| **maximum authorized calls** | **16** |

**Projected spend: USD 0.9399. Recommended hard ceiling: USD 1.23.**

Unit costs come from recent actual evidence, not from the §221 constants. The first-pass leg uses the
eight §227 calls on the current contract, mean USD 0.0857 and maximum USD 0.0971. The verifier leg
uses the three §221 verifier-leg calls, mean USD 0.0423 and maximum USD 0.0432, which are the only
verifier-leg cost records in the archive and share the §218 payload shape.

The ceiling prices every primary call at the highest unit cost ever observed for its leg and both
contingency calls at the dearer leg, then rounds up to the cent. The headroom above worst case is
smaller than the cost of one further first-pass call, so it gives execution variance without room for
an extra semantic draw.

**A contingency call is spendable only for a preregistered execution failure** — transport, HTTP, or
a response that never reached inference. It may never be used to obtain a different semantic answer,
and every use is recorded with its failure class.

---

## Identity pinned

Prompt and schema identity are pinned per case through the same assembly path §227 used: the §226
system prompt, the vNext user prompt and the §210J wire schema over a real analysis input. C7 carries
the governed-binding prompt and a schema whose sourceId enum is the supplied set, and its digests
differ from the other seven as they should. An executor can refuse to transmit anything that does not
match.

First pass: `hazlenz.expert.first-pass-contract.226-decision-keyed-semantics`.
Verifier: `hazlenz.expert.218.property-review-contract.v1`.

---

## Final report

**Cases:** **8** — the preferred size. All twelve paths are exercised honestly without overloading a
case with unrelated truths or unrelated human actions.

**Truth-preflight checks:** **17 / 17 passed.** One failing run before the freeze, repaired in the
development instrument.

**Required integrated paths:** **12 / 12 covered**, with one limb recorded as not exercisable: the
adverse ledger transition to `REJECTED_BY_ARBITRATION`, because the runtime has no producer for it.

**Residual §227 observations instrumented:** **5 / 5.**

**Human actions preregistered:** **YES.** Nine exercises — three with no property review, three
CONFIRM_PROPERTY, two under the frozen conditional-correction rule, one KEEP_UNRESOLVED; three
evidence approvals, one evidence rejection, five with no evidence decision. None is chosen after
seeing output.

**Primary provider calls:** **14.**
**Maximum authorized calls:** **16.**
**Projected spend:** **USD 0.9399.**
**Recommended hard ceiling:** **USD 1.23.**

**Hard requirements:** **14**, pass/fail at their own thresholds, no aggregate computed, no
compensation permitted.

**Applicability and denominators frozen:** **YES.** The denominator is the enumerated per-case
opportunities and nothing else. `NOT_EXERCISED` is never a pass, a requirement with zero exercised
opportunities is `COVERAGE_INSUFFICIENT`, and `AMBIGUOUS` on a hard-requirement judgment means that
judgment cannot carry the requirement.

**Prompt identity pinned:** **YES.** **Schema identity pinned:** **YES.**

**Runtime changed:** **NO.** **Provider calls:** **0.** **Database operations:** **0.**
**Historical evidence changed:** **NO.** **Commit / push / tag / deploy:** **NONE.**

**Authoring-independence limitation:** The remediation under test was authored by the §226 session,
not this one. What is **not** independent is that this session authored both the cases and the scoring
rules for them, so a case could be written to suit what the pipeline happens to do. **This is a
targeted engineering revalidation, not final fresh acceptance.** A pass here must not be reported as
acceptance. Final fresh acceptance must address case authorship independent of the development
session, a fresh unseen cohort, and a denominator not chosen by the party being measured.

---

## Context

**Context sources loaded:** 12 — the context index and the two always-read documents; the §227
report; the §221 integrated instrument and its state-derivation driver; and the runtime modules whose
real enums and refusal codes the frozen expectations are written against: owed-fact types,
property-authority, settlement-review, the owed-fact ledger, the §218 property-review contract, the
§205 preservation module and the §227 and §221 call ledgers for cost evidence. The 308,000-word
development blueprint was not loaded.

**Approximate context size:** about 21,000 words.

---

**TERMINAL:
`EXPERT_HAZLENZ_TARGETED_INTEGRATED_REVALIDATION_INSTRUMENT_FROZEN —
PRODUCT_OWNER_EXECUTION_AUTHORIZATION_REQUIRED`**

Do not execute §228. §228A stops here.
