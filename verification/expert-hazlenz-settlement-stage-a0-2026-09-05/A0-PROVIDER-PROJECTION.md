# §181 — PROVIDER PROJECTION REVIEW

Exactly what a provider sees per owed fact, read from `projectOwedFact()` and the v3 instruction, and
verified by projecting the real HR-04 fixture fact.

---

## The projected shape, verified

`projectOwedFact(HR04_FACT)` yields exactly eight keys (check F3.a):

```
factKey · affectedDecision · whyUnresolved · branchA · branchB ·
decisionDivergence · evidenceSpan · acceptableEvidence
```

| field | visible to provider | note |
|---|---|---|
| `factKey` | **yes** | the unit of binding and deduplication |
| `affectedDecision` | yes | one of six |
| `whyUnresolved` | yes | HazLenz's statement of the gap |
| `branchA` / `branchB` / `decisionDivergence` | yes | the counterfactual, supplied rather than requested |
| `evidenceSpan` | yes | verbatim span of the observation or governed record |
| `acceptableEvidence.requirement` | **yes** | **the settlement target** |
| `acceptableEvidence.examples` | yes | the governed record's own verification vocabulary, copied not paraphrased |
| `acceptableEvidence.insufficientExamples` | yes | the §169 half — what looks like settlement and is not |
| `acceptableEvidence.provenance` | **NO** | deliberately dropped: telling a model a criterion is governed invites it to weigh criteria by source |
| `status` · `priority` · `source` · `modelAuthored` | **NO** | HazLenz-owned; also refusable on return |

Asserted absent by the existing proof suite and re-checked here: human dispositions, pass/fail status,
historical success rates, expected questions, fixture labels.

## The settlement target wording, as the provider would receive it

For the HR-04 fixture fact, derived from `app-mg-01`:

> **requirement** — *"Evidence establishing guarding_status by a verification method the governed
> record for 1910.212 recognises."*
> **examples** — `physical_inspection`
> **insufficientExamples** — `training_only`

This is worth reading twice. The target the provider would be handed for a **securement** fact names
`guarding_status` and offers **`physical_inspection`** as the example of sufficient evidence — the
exact evidence class §169 ruled insufficient for a protective-function fact.

## Declaration fields available today

Per supplied fact, the provider returns one of three tokens, plus a reason on the third:

```
BOUND_BY_CLARIFICATION      the supplied question answers THIS fact
STILL_UNRESOLVED            not answering it; "the right one whenever you are unsure"
CHALLENGE_FACT_VALIDITY     "the observation already settles it" + challengeReason (free text)
```

Plus, per clarification: `declarationId`, `bindingMode`, `coversFactKey`, `nomination` (nine fields
when nominating), `question`, `affectedDecision`.

## The answer to the review question

> Is there currently any structured field requiring the provider to distinguish **EVIDENCE PRESENT**
> from **WHAT THAT EVIDENCE ESTABLISHES**?

**`STRUCTURED_EVIDENCE_PROPERTY_DECLARATION = ABSENT`** (check F3.b).

Nothing in the projection or the response schema asks it. The nearest surfaces, and why each falls
short:

- **`evidenceGap`** (first-pass contract) — *"what is missing from the evidence"*. It states an
  **absence**, never what present evidence establishes, and it exists **only when a clarification is
  emitted**. On HR-04 nothing was emitted, so no field of any kind carried the settlement reasoning.
  This is the sharpest form of the §179 diagnosis problem: the failure case has no field at all.
- **`challengeReason`** (v3 path) — free text attached to a settlement claim. It is the closest thing
  the architecture has to an evidence-to-target statement, and it is *unstructured and unconsumed*.

## The consequence for what to build next

The declaration is absent, and adding it is a real improvement. But `challengeReason` means the claim
**can already be made and already carries a reason**, so a reviewer could compare it against
`acceptableEvidence.requirement` today without any schema change.

That reorders the work: the binding constraint is that nothing **reads** the claim, not that the claim
cannot be **expressed**. Building the consumer first also produces the evidence needed to design the
declaration well — real challenge reasons, written by the model, against real targets, are a far
better specification than a field shape guessed in advance.
