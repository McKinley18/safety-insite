# `acceptableEvidence` populated from a governed production source

**§171, 2026-09-05. 0 provider calls, $0.00, 0 database operations. One `src/` file created, none
modified. `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED = false`, unchanged.**

---

## 1. Terminal

```
EXPERT_HAZLENZ_ACCEPTABLE_EVIDENCE_GOVERNED_SOURCE_PROVEN —
SILENCE_TRUTH_AND_HUMAN_SEMANTIC_SUFFICIENCY_VALIDATION_REQUIRED
```

31/31 population proofs, 19 protected suites green, `SOURCE_PROJECT_TSC` exit 0.

---

## 2. The governed source, and how it was chosen

### What was searched

`safescope-data/approved-knowledge/registry/` — the live approved-knowledge registry read by
`approved-knowledge-registry-io.service.ts`. **20 approved records**, each carrying
`correctiveActionLinks.verificationMethods` and `commonWeakActionsToAvoid`, plus
`mapping.requiredFacts`.

That structure is a near-exact fit for `acceptableEvidence`, and — decisively — **it was authored
for its own purpose long before verifier-v3 existed.** The record names no `factKey`, no
`acceptableEvidence`, no binding, and no evaluation row. Proof **A.3** asserts that mechanically.

### Selected

| | |
|---|---|
| `SOURCE_RECORD_TYPE` | `ApprovedKnowledgeRecord` (approved-knowledge registry) |
| `SOURCE_RECORD_ID` | **`app-loto-01`** |
| `SOURCE_VERSION` | `1.0.0`, `status: approved` |
| `SOURCE_PROVENANCE` | OSHA **1910.147**, `primary_regulation`, `osha_general_industry` |
| approved by | Safety Manager, 2026-06-01 |
| `TARGET_HAZARD_FAMILY` | `energy` (hazardous-energy control) |
| `TARGET_FACTKEY` | `owed:energy:isolation_state_before_work` |

**Fields used:** `status` · `authority.citation` · `authority.agency` · `authority.authorityTier` ·
`authority.jurisdiction` · `mapping.requiredFacts` ·
`correctiveActionLinks.verificationMethods` · `correctiveActionLinks.commonWeakActionsToAvoid`.

### Why this family and not the one the observed weaknesses point at

The authorization prefers a family related to an observed sufficiency weakness *if the governed
source genuinely supports it*. **It does not**, and that is the operation's most important finding.

The four §169 weaknesses were about **protective function** — flame-failure function (VC-08-1/4/6)
and interlock function (VC-04-1). The governed records for those families are:

| record | family | `verificationMethods` | `evidenceQuestions` |
|---|---|---|---|
| `app-mg-01` | machine guarding, 1910.212 | **`physical_inspection`** | "Is the guard present?", **"Is the guard functional?"** |
| `app-fire-01` | fire, 1910.157 | `physical_inspection` | "Is tag legible?" |

`app-fire-01` is about portable extinguisher tags, not burner flame-failure safeguards — using it
would be manufacturing a criterion to fit history.

`app-mg-01` is worse than unhelpful. Its only verification method is **`physical_inspection`** —
*precisely the evidence class §169 ruled insufficient for a protective-function fact.* Deriving from
it would produce a governed criterion telling the verifier that physical inspection is acceptable
evidence, contradicting the human review.

**`app-loto-01` is the only approved record whose verification method establishes a STATE rather
than an appearance:** `zero_energy_verification`, with `warning_only` named as the weak action. It
supports a sufficiency-bearing criterion honestly. It is also genuinely related to observed
decision-critical material — the HS-A1 auger-isolation gap the owner adjudicated
`DISPLACED_FACT_VALID_DECISION_CRITICAL` is a hazardous-energy isolation fact — but the criterion
was **not** selected or shaped to match it. The record's content is unaltered.

---

## 3. The derivation

`src/safescope-v2/expert-hazlenz/owed-facts/governed-evidence-derivation.ts` (150 lines).

```
correctiveActionLinks.verificationMethods       ->  examples              (COPIED verbatim)
correctiveActionLinks.commonWeakActionsToAvoid  ->  insufficientExamples  (COPIED verbatim)
mapping.requiredFacts + authority.citation      ->  requirement           (fixed template)
                                                ->  provenance = GOVERNED_EVIDENCE
```

**Copied, not paraphrased** — proof **B.2** asserts byte-equality with the governed arrays.
**Structurally projected** for the requirement, through one hazard-agnostic sentence frame:

```
'Evidence establishing {REQUIRED_FACTS} by a verification method the governed record for
 {CITATION} recognises.'
```

Proof **B.3** asserts the template names no hazard, equipment, control or obligation. Grep the
module for a hazard name and there is none — that is what keeps hazard-specific semantics out of
generic runtime.

**Nothing searches for a record.** The record is passed in by whatever built the owed fact
(deterministic HazLenz, which already knows which governed record backs a finding). Proof **C.3**
confirms the module contains no `.find(`, no hazard-family matching and no registry read — because
inferring which governed record applies to an unresolved fact is a judgement this module has no
standing to make.

### The exact task-state object produced

```json
{
  "requirement": "Evidence establishing energy_isolation_status by a verification method the governed record for 1910.147 recognises.",
  "examples": ["zero_energy_verification"],
  "insufficientExamples": ["warning_only"],
  "provenance": "GOVERNED_EVIDENCE"
}
```

### Fail-closed refusals — one of which the live data required

Five named refusals, all yielding `null` rather than a weaker criterion:
`NO_GOVERNED_RECORD_LINKED` · `RECORD_NOT_APPROVED` · `CITATION_IS_A_PLACEHOLDER` ·
`NO_VERIFICATION_METHOD_IN_RECORD` · `NO_REQUIRED_FACT_IN_RECORD`.

**`CITATION_IS_A_PLACEHOLDER` is not hypothetical.** Two live approved records — `app-mat-01` and
`app-rig-01` — carry `citation: "placeholder_review_required"`. They are approved for triage, not
for stating what settles a safety fact, and proof **C.1** confirms both are refused.

---

## 4. Provider boundary

| | |
|---|---|
| `TASK_STATE_HAS_ACCEPTABLE_EVIDENCE` | **TRUE** |
| `PROVIDER_CAN_AUTHOR_ACCEPTABLE_EVIDENCE` | **FALSE** — a declaration carrying the field is refused whole (**E.2**), and the criterion is byte-unchanged afterwards |
| `PROVENANCE_VISIBLE_TO_PROVIDER` | **FALSE** |
| `PROJECTION_DETERMINISTIC` | **TRUE** |
| `PROJECTION_BYTE_STABLE` | **TRUE** (**B.4**) |

**Provider-visible projection — exactly three fields:**

```json
{
  "requirement": "Evidence establishing energy_isolation_status by a verification method the governed record for 1910.147 recognises.",
  "examples": ["zero_energy_verification"],
  "insufficientExamples": ["warning_only"]
}
```

`provenance`, `recordId` and `version` are stripped (**E.1**, **E.1b**). **The citation does reach
the provider**, inside the requirement sentence — deliberately, so the verifier knows which governed
rule the criterion came from. What is withheld is the provenance *class*, which would let a model
weigh criteria by their source.

---

## 5. Forbidden inputs

All three forbidden provenances **throw** on a PRODUCTION ledger (**F.1**), an arbitrary runtime
literal is not a member and fails closed (**F.3**), and the derivation can emit only
`GOVERNED_EVIDENCE` — one provenance literal in the module (**F.4**).

```
ADJUDICATION_LABEL — still forbidden, still absent from the permitted list, still throws
```

**No evaluation or human disposition was converted into truth.** Proof **B.5** asserts the
derivation module names no evaluation row, disposition, binding label or adjudication. The §167
records and §169 dispositions were read by *no* code in this slice.

---

## 6. Mixed ledger, nomination and multi-gap

A single PRODUCTION ledger carries one governed criterion and one `null` (**D.1**). The criterion
stays on its own `factKey` and does not bleed (**D.2**); projection preserves both (**D.3**).

A nomination **fabricates no criterion** — the nominated fact inherits `null`, because HazLenz holds
no governed criterion for a fact it did not author (**H.1**). Multi-gap preservation is intact: 0
removed, 0 violations, and 2 facts still uncovered **by key** (**H.2**).

**Coverage is unaffected by whether a fact carries a criterion** (**H.3**) — the same fact with and
without one produces identical coverage. Question objects carry no criterion and are not scored
against one (**H.4**).

---

## 7. No semantic scorer was introduced

```
CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED   (unchanged)
```

Proof **G.1** strips comments *and string literals* from the derivation and confirms it contains no
`similarit|embedding|cosine|jaccard|levenshtein|overlap|fuzzy|threshold|score` and **no `question`
identifier at all** — the module never sees a question, so there is no comparison in it to relax.

`DERIVATION_LIMITS` records what a populated criterion is *not*:

> a criterion states what the governed record recognises as verification; it does not state that any
> particular clarification elicits it. The governed vocabulary is coarse and may be weaker than a
> specific owed fact requires — **a criterion is a floor supplied by governance, not a guarantee of
> sufficiency.**

---

## 8. The blocker found in the governed-source architecture

**The governed verification vocabulary is coarser than protective-function facts require.**

Across all 20 approved records the distinct verification methods are:

```
audit · design_review · gas_detection · inspection · observation
physical_inspection · visual_inspection · walkthrough · zero_energy_verification
```

**Seven of the nine are looking-based.** Only `zero_energy_verification` and arguably
`gas_detection` establish a *state*. So for most families the derivable criterion would endorse
exactly the evidence class §169 found insufficient.

`app-mg-01` shows the gap inside a single record: its `evidenceQuestions` ask **"Is the guard
present?" and "Is the guard functional?"** — two different questions — while its
`verificationMethods` offers one entry, `physical_inspection`, which answers only the first. **The
record's own evidence question outruns its own verification method.**

This is a governed-knowledge finding, not a verifier finding, and it is not this operation's to fix.
Recorded because it bounds what `acceptableEvidence` can currently do: populating it broadly today
would mostly propagate a vocabulary too coarse to carry the distinction §169 identified.

---

## 9. Boundary, re-proven

`EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED === false`; the boundary reads no configuration; the stage
attaches nothing (**I.2**). The 3-argument merge is JSON-identical to the 4-argument call with
`undefined` and carries no `owedFactCoverage` key (**I.1**) —
`FEATURE_OFF_CURRENT_PATH_INVARIANT = TRUE`. The derivation has no transport and no persistence
primitive (**I.3**).

**Provider invocations: 0. Provider cost: $0.00. Database operations: 0.**

---

## 10. Regression — 19 suites, 0 failures

`SOURCE_PROJECT_TSC` exit 0 · governed-acceptable-evidence **31/31** · v3-development-integration
40/40 · verifier-v3-protocol 49/49 · bounded-reliability 44/44 · **nocall-harness 141** (42 files
scanned, 0 offenders) · contract-foundation 56 · reliability-architecture 69 · verifier-v2-contract
46 · routing-contract 67 · measurement-layer 66 · fixture-hardening 76 · clarification-settlement
148 · affected-decision-arbitration 41 · unsupported-settlement 129 · retention-bridge 123 ·
level1-recall PASS · actionable-coverage PASS · guarding-applicability 16/16 ·
governed-kill-switch-authority 115.

No pre-existing source debt was modified; no frontend build was run.

---

## 11. `SILENCE_CONTROL_REAUTHORING_DRAFT_ONLY`

`SILENCE-CONTROL-REAUTHORING-DRAFT.json` — five rows, **5/5 inside the 380–440 band**, straddling
both frozen REQUIRED rows (402 and 412), against the §168 draft's 559–592.

**No filler was added.** Length came down by removing clauses that settled no fact for the row's own
question family. A first compression pass **overshot to 346–365** — below both REQUIRED rows, which
would have recreated the confound in the opposite direction — and clauses carrying genuine settled
facts were restored. Those restorations improved the rows: **SC-3 had lost a settled fact outright**
when its cordon clause was cut.

```
AUTHORITY_STATUS = DRAFT_NOT_AUTHORITATIVE_NOT_ADJUDICATED
```

**Reaching the band does not make them valid.** The length confound is an *instrument* defect;
removing it establishes nothing about whether the semantic silence truth is correct. Each row still
requires human adjudication of its **exact final wording**. Nothing was executed: no hosted call, no
local semantic evaluation, no scoring, no denominator formed. The §168 counterfactuals were not
re-authored and must be re-checked against the compressed wording during adjudication.

---

## 12. Remaining semantic validation requirements

1. **Human adjudication of the five compressed silence controls**, exact wording — the single
   blocker on every precision, specificity and over-questioning claim, and on customer activation.
2. **Human sampling of resolution sufficiency** on any future bound pairs.
   `BOUND_BINDING_TOPIC_REACH != RESOLUTION_SUFFICIENCY` stands; the §162 cue instrument answers
   only the first.
3. **Governed verification-vocabulary review** (§8) — whether a protective-function verification
   class should exist in the approved-knowledge schema. Governance work, not verifier work.

## 13. Recommended next authorization

**Adjudicate the five silence controls.** It is zero-cost, it is the only item blocking the
precision half of every claim, and it has now blocked four consecutive operations. The
`acceptableEvidence` path is proven and can wait; silence truth cannot be worked around.

Policy C, the degenerate reissue and the primary coverage-warning failure path all remain
`UNEXERCISED_HOSTED`. Customer activation remains unauthorized.
