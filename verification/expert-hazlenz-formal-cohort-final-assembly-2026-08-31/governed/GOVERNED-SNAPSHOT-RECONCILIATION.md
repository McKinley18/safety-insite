# Phase 3 — governed snapshot reconciliation and backing-state resolution

Consumed only the product owner's sanitized read-only snapshot. **No database connection, no
credential, no provider call.** The CSV remains outside the repository at the owner's choice; it was
read in place and only derived, non-secret facts are recorded here.

## 1. Reconciliation — all checks PASS

| check | result |
|---|---|
| snapshot SHA-256 | `a2c5dc324ded4fee8689982785682cec0f21c4ed0ce2b1128afd8f902c4d5cd3` — matches owner report |
| record count | **64**, matching `regulatory_releases.recordCount = 64` |
| physical lines | 65 = 1 header + 64 records — `canonicalText` is single-line, so records and lines correspond 1:1 |
| release membership | all 64 carry `releaseId = federal-core-2026-08-28.1`; **one** distinct value |
| release status | `active`, `activatedAt = 2026-08-29T00:04:00.696759+00`, `parentReleaseId` NULL |
| manifest checksum | `680540d994cedb9384912cb7a3ccd28d798756bd787a84a530c8076ed3a668cb` |
| record checksums | 64 present, **64 distinct**, all 64-hex |
| citations | 64 non-empty, **64 distinct** |
| approved text | present on **64/64** |
| review-state distribution | `mechanically_validated = 64`; zero `unreviewed`, zero `reviewer_approved` |

Proof: `proofs/governed-reconciliation.txt`.

## 2. Backing-state mapping — resolved from production truth, not assumed

Production stores `reviewState`; it never stores `backingState`, which the resolver derives at
request time. The mapping into the production vocabulary (`fallback-contract.ts`
`ALL_BACKING_STATES`) is:

```
reviewer_approved      + text  ->  APPROVED_EXACT
reviewer_approved      + none  ->  APPROVED_NO_TEXT
mechanically_validated         ->  UNAPPROVED_RECORD
unreviewed                     ->  UNAPPROVED_RECORD
```

**All 64 records resolve to `UNAPPROVED_RECORD`.** No `APPROVED_*` state was invented.

`review-state.ts` is explicit that `mechanically_validated` means "passed deterministic
transformation checks from a registered source" and is **not** review, and that the three states are
never silently upgraded into one another. Mapping it to any `APPROVED_*` value would assert a
reviewer decision nobody made — which is KG-3A defect B re-committed.

**Losslessness.** The mapping is many-to-one in general (`unreviewed` and `mechanically_validated`
share a target), and `GovernedStandardView` has no field to carry `reviewState` separately. For
*this* snapshot nothing is lost, because the domain is single-valued: all 64 records share one
review state. Were a future release to mix `unreviewed` with `mechanically_validated`, that
distinction would **not** survive into the Expert-visible view, and that is recorded here rather
than discovered later.

## 3. The frozen contract is NOT defective

The operation asked me to stop and report a contract defect if the frozen contract required a
production state that does not exist. **It does not.** The opposite is true:

> `expert-cohort-composition.ts:144` — *"Rows carrying an **UNAPPROVED** record are where an
> approval flip could occur, so the `DISAGREEMENT_OPPORTUNITY` class is what actually exercises
> this."*

That note governs **M08**. An all-unapproved snapshot is the condition the contract was written
for, not an edge case it fails to represent.

Verified against each measure:

| measure | keys off | effect of all-unapproved |
|---|---|---|
| **M06** | `governedStandards.length > 0` | unaffected — denominator is record presence |
| **M07** | detected regulatory statements on rows with a present layer | unaffected |
| **M08** | `EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD` | **exercised** — unapproved records create the opportunity |
| grounding truth | citation + approvedText supplied verbatim from the release | preserved |
| truth leak | `backingState` is source-side, never truth-side | 0 |

Mechanically confirmed: a governed-supplied row classifies both `GOVERNED_RECORD_SUPPLIED` and
`DISAGREEMENT_OPPORTUNITY`. `governedProvenanceEligible` and `isApproved` both resolve **false**,
which is correct — recording `knowledgeReleaseId` off an unapproved record would be a false
provenance claim.

## 4. Limitation, preserved and not to be implied away

```
REVIEWER_APPROVED_GOVERNED_RECORDS   = 0
APPROVED_RECORD_GROUNDING_EXERCISED  = FALSE
```

No immutable measure requires approved-record coverage: M06/M07 key off record presence, M08 is
exercised *by* unapproved records, and no `REQUIRED_CLASS_MINIMUMS` entry names an approved class.
**This is therefore a reported limitation, not a failed gate.**

It must not be waved through later. One axis of M07 grounding — behaviour when Expert is handed a
*cleanly approved* governed record — **cannot be exercised by this cohort at all**, because
production contains no such record. A green M07 result will say nothing about that axis, and any
report that implies otherwise is wrong.

The cause is structural, not accidental: KG-3A defect B deleted the only writer of
`reviewer_approved` at finalization, and it is never backfilled. Restoring that axis requires a
substantive reviewer-approval pass over the governed corpus — a separate governance act, not
something this evaluation can manufacture.
