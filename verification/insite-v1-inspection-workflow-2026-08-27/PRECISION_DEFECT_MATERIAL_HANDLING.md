# CANDIDATE PRECISION DEFECT — contextual phrases become independent hazards

`OBSERVED AND REPRODUCED. NOT REPAIRED. Decomposition-engine change is NOT authorized.`

Recorded 2026-08-27 during the interactive inspection-workflow design session, so the behaviour
and its exact inputs survive for the bounded measurement set that must precede any engine change.

---

## 1. The defect

One recorded condition describing **one** hazard decomposes into **three** findings, because
clauses the inspector wrote as *context for* the hazard are treated as independent hazards.

### Exact observation text (verbatim, reproducible)

```
At the crusher drive the guard over the conveyor tail pulley had been removed and was lying on
the ground beside the frame. The conveyor was running and material was being fed. No barricade
or warning sign was in place, and the walkway passes within about two feet of the exposed pinch
point.
```

Inspection context: site `Crusher Plant`, regulatory context **MSHA**, location
`Crusher drive, conveyor tail pulley`, no photo, no work-activity value.

### What HazLenz produced

| # | domainId | risk | evidence fragment it was derived from | standard |
|---|---|---|---|---|
| 1 | `machine_guarding` | **High** | *"at the crusher drive the guard over the conveyor tail pulley had been removed"* | **30 CFR 56.14107(a)**, `direct`, confidence 0.96 |
| 2 | `material_handling` | Moderate | *"material was being fed"* | **none matched** |
| 3 | `walking_working_surfaces` | Moderate | *"the walkway passes within about two feet of the exposed pinch point"* | **none matched** |

Finding 1 is correct, well-cited and correctly risked. Findings 2 and 3 are derived from the two
clauses the inspector supplied **to establish finding 1** — that the machine was energized, and
that a person could reach the pinch point. Exposure and energy state are *predicates of the
guarding hazard*, not separate hazards.

The perverse incentive this creates: **the more completely an inspector describes a hazard, the
more spurious findings they are given to dispose of.**

Full machine-readable decomposition, including every `supportingSignals` and `standardCandidates`
entry, is preserved at `precision-evidence/decomposition-crusher-guard.json`.

## 2. A second, independent instance of the same class

From the earlier prelaunch architecture phase
(`../insite-v1-prelaunch-architecture-2026-08-27/STATUS.md` §4), root-caused and equally unrepaired:

`multi-hazard-decomposition.service.ts:1267` includes `shield(?:ing)?` in the excavation regex,
intended as a **trench shield**. Measured single-sentence probes:

| observation | emitted | confidence |
|---|---|---|
| "not wearing a **face shield** while using a bench grinder" | `excavation_trenching` | **0.85** |
| "the welder was not using a **welding shield**" | `excavation_trenching` | **0.85** |
| "a **splash shield** was missing from the parts washer" | `excavation_trenching` | **0.85** |
| "had no eye protection while using a bench grinder" | none | — |
| "an unshored **trench** three metres deep had a spoil pile at the edge" | `excavation_trenching` | **0.60** |

A genuine trench scores **lower** than three false positives.

## 3. Why it is not being fixed here

Suppressing a hazard is a recall change, and recall is the property that makes the product safe.
Neither instance may be corrected until a bounded measurement set exists that can show precision
improving **without** recall falling.

## 4. The measurement set required before any engine change

Two populations, both authored before any code moves, both scored by the same unmodified scorer:

**Population A — contextual/incidental phrases that must NOT create an independent hazard.**
Clauses supplying energy state, exposure, proximity, access, PPE-in-use, or material state *in
support of another hazard*. Seeds available now: `"material was being fed"`,
`"the walkway passes within about two feet"`, `"face shield"`, `"welding shield"`,
`"splash shield"`.
Metric: **false-positive candidate rate** — candidates emitted per observation that no qualified
reviewer would confirm.

**Population B — genuine multi-hazard observations where secondary hazards MUST still split.**
Observations describing two or more materially distinct mechanisms that require separate findings,
separate standards and separate corrective actions (e.g. a guarding defect *and*, separately, a
damaged ladder; an excavation *and* an energized panel).
Metric: **dangerous-omission rate** — genuine hazards that stop being emitted. This is the metric
with veto power.

**Acceptance shape (proposed, not agreed):** a change is admissible only when Population A's
false-positive rate falls and Population B's dangerous-omission rate is **zero** against the
pre-change baseline, with HazLenz Level-1 31/31 still passing unrelaxed and no scorer, threshold or
gold-set expectation modified.

**A newly available signal.** The candidate-confirmation step (implemented 2026-08-27) records
every proposal the customer declined, as a `human_reviews` row with `decision = 'dismissed'`
against a retained finding row carrying its evidence fragment and standard candidates. That is a
real-world, customer-labelled precision corpus accumulating from ordinary use, and it should feed
Population A rather than being authored entirely by hand.

## 5. Status

```
DEFECT_CLASS              = CONTEXTUAL_PHRASE_BECOMES_INDEPENDENT_HAZARD
INSTANCES_RECORDED        = 2  (material_handling / walking_working_surfaces; shield -> excavation)
REPRODUCTION_PRESERVED    = TRUE
ENGINE_CHANGE_AUTHORIZED  = FALSE
MEASUREMENT_SET_BUILT     = FALSE
RECALL_IMPACT_MEASURED    = FALSE
MITIGATED_IN_UX           = TRUE (candidate confirmation; the customer never reviews a candidate
                            merely to remove it, and rejections are recorded rather than discarded)
```

---

## 6. Deferred capability: `EXPERT_ASSIST_USER_AUTHORED_FINDING`

`RECORDED AS A FUTURE EXPERT HAZLENZ CAPABILITY. NOT IMPLEMENTED. NOT AUTHORIZED.`

Decided 2026-08-27 during the interactive workflow session, when the inspector-authored finding
path was built.

**The question that raised it.** A user-authored finding reaches Risk & fix with no suggested
corrective action, because HazLenz did not identify the hazard and therefore produced no
assessment for it. Re-querying today's engine with an inspector-named hazard was considered and
**rejected for v1.0**: its corrective-action intelligence is keyed on hazard families it already
understands, so an unfamiliar hazard title would return nothing, generic advice, or advice derived
from an incorrect family mapping — and attaching any of those to a hazard the engine never assessed
would be pseudo-HazLenz content.

**Target behaviour, later:**

```
inspector identifies hazard
  -> provenance remains user_authored, permanently
  -> Expert HazLenz may analyse the supplied hazard + the existing observation
  -> may suggest standards, risk, corrective actions, clarification questions
  -> EVERY AI contribution is separately attributed
  -> the original discovery provenance never changes
```

**Invariants it must satisfy, carried forward from the v1.0 implementation:**

* `inspection_findings.source` stays `'user_authored'` for the life of the finding. Assistance
  changes the assessment, never the discovery.
* An Expert-supplied standard is attributed to Expert HazLenz and is distinguishable from one the
  deterministic engine produced; a user-authored finding still never acquires a citation merely
  because a customer named a hazard.
* Expert confidence is never presented as Level-1 deterministic confidence.
* Failure is silent and harmless: no suggestion is the normal case, not an error state.

**What v1.0 ships instead:** the corrective action stays human-authored, presented as a usable
three-field editor (`Add corrective action`) with neutral placeholders that describe the shape of
the answer and never supply one, plus a small secondary provenance note. No extra burden is imposed
because `source = 'user_authored'`.

**Evaluation input this capability will need**, already accumulating from ordinary use: the
`finding_user_authored` audit signal (`hazlenzProposed: false`, `signal: 'candidate_false_negative'`)
records exactly which hazards the engine missed and an inspector added.
