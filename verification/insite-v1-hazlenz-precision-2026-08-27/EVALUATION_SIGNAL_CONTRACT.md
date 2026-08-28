# Customer-labelled decomposition signals — evaluation contract

`INSPECTED AND DOCUMENTED 2026-08-27. NOTHING WAS TRAINED, TUNED OR ALTERED FROM THESE SIGNALS.`

```
SIGNAL_CLASS                 = EVALUATION_SIGNAL
SIGNAL_CLASS                != GROUND_TRUTH
ENGINE_TUNED_FROM_SIGNALS    = FALSE
CUSTOMER_FINDINGS_ALTERED    = FALSE
OFFLINE_DATASET_BUILT        = FALSE
```

## 1. The two signals now being recorded

Both were implemented during the accepted inspection-lifecycle phase and are
accumulating from ordinary customer use. They are the two halves of one
question: *where does deterministic decomposition disagree with a qualified
inspector?*

### 1.1 Precision signal — HazLenz proposed, the inspector dismissed

The candidate-confirmation step records a declined proposal as a `human_reviews`
row with `decision = 'dismissed'`
(`backend/src/inspection/inspection.service.ts`, `addReview`, where
`review.decision === 'dismissed'` sets the finding status to `dismissed`). The
finding row is **retained**, not deleted, so the record keeps:

* `observationFragment` — the exact clause decomposition derived the candidate from;
* `standardCandidates` — the citations it would have carried;
* `domainId` / `hazardFamily` and the routing confidence;
* the observation, site, jurisdiction and location context.

That is exactly the shape of a Population A row. A dismissed candidate whose
fragment is a contextual clause ("material was being fed") is the same defect
class this phase measured and repaired.

### 1.2 Recall signal — HazLenz did not propose, the inspector added it

`inspection.service.ts` writes an audit row on every inspector-authored finding:

```
action        : 'finding_user_authored'
resourceType  : 'inspection_finding'
metadata      : { inspectionId, observationId, findingId, hazardKey, hazardTitle,
                  hazlenzProposed: false,
                  signal: 'candidate_false_negative' }
```

That is the shape of a Population B row: a hazard a qualified person judged
independently actionable that decomposition did not emit. The seven
life-critical Population B omissions recorded in `STATUS.md` §7 are precisely
what this signal would surface from the field.

## 2. Why these are evaluation signals and not ground truth

An inspector dismissal is one qualified person's judgement in one context, made
under time pressure, and it is not adjudicated. Treating it as ground truth
would import three failure modes directly into the safety floor:

1. **A dismissal is not always a false positive.** An inspector may dismiss a
   correct candidate because it duplicates a finding they already wrote, because
   it is out of scope for this inspection, or because they intend to raise it
   elsewhere. Suppressing that family would be a recall loss learned from a
   bookkeeping action.
2. **Dismissal pressure is asymmetric.** Every spurious candidate costs the
   inspector time, so there is a standing incentive to dismiss. Nothing creates
   an equal and opposite pressure to add a missed hazard. A system that learns
   from dismissals alone drifts monotonically toward silence — the one direction
   the safety floor must never move.
3. **A user-authored finding is not proof of an engine miss.** The inspector may
   have named a hazard outside the taxonomy, or split one hazard into two, or
   recorded an observation that is not a regulated condition at all.

Ground truth for this engine is a frozen, hand-authored corpus scored by an
unmodified scorer — the mechanism built in this phase. Field signals *nominate
candidate rows for that corpus*; they never enter it unadjudicated.

## 3. How these signals may later feed an offline evaluation dataset

None of this is implemented, and none of it may run inside the live path.

1. **Export, offline and read-only.** A batch job reads dismissed findings and
   `finding_user_authored` audit rows out of the operational database into an
   evaluation store. It never writes back, and it never runs as part of
   classify.
2. **De-identify and de-duplicate.** Strip organisation, user, site and free-text
   identifiers not needed to reproduce the decomposition. Cluster by
   `(domainId, normalised observationFragment)` so one recurring phrasing does
   not dominate by volume.
3. **Adjudicate before admission.** Each cluster is reviewed by a qualified
   safety person against the same standard the corpus uses: *would a qualified
   reviewer confirm this candidate?* Only adjudicated clusters become corpus
   rows. An unadjudicated cluster is a research queue item, never an expectation.
4. **Admit into the frozen populations.** An adjudicated false positive becomes
   a Population A row with its forbidden families named. An adjudicated miss
   becomes a Population B row with its required groups and life-criticality
   named. Rows are appended; existing rows are never rewritten to match engine
   behaviour.
5. **Re-baseline explicitly.** Adding rows changes the denominators, so the
   baseline is re-measured and re-frozen as a new, separately versioned
   measurement file. The recall veto is then evaluated against that new baseline.
   A precision gain is never accepted against a stale baseline.
6. **The veto never moves.** Whatever the corpus grows into, no change is
   admissible that raises the dangerous-omission rate or introduces a new
   life-critical omission.

## 4. Prohibited uses, restated

* No automatic tuning, weighting, threshold adjustment or rule generation from
  accumulated signals.
* No alteration of a customer's findings, risk outcomes or citations because of
  what other customers dismissed.
* No suppression of a hazard family because it is dismissed often.
* No use of confirmation behaviour as a substitute for engine correctness — a
  customer confirming a candidate does not make it right, and the UX mitigation
  is not a repair.
