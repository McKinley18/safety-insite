# Expert HazLenz readiness contract

`ARCHITECTURE ONLY. NO PROVIDER CALL WAS IMPLEMENTED IN THIS PHASE.`

```
EXPERT_HAZLENZ_IMPLEMENTED        = FALSE
PROVIDER_CALL_IMPLEMENTED         = FALSE
LEVEL_1_AUTHORITY                 = DETERMINISTIC, UNCHANGED
AUTHORIZATION_REQUIRED_TO_PROCEED = TRUE
```

## 1. The invariant

**Level-1 deterministic authority is the safety floor.** Expert HazLenz is
additive. It sits above the deterministic engine and may only add, never
subtract.

Expert HazLenz **may**:

* synthesise context across clauses, findings and site history;
* explain reasoning in language an inspector can defend;
* rank alternatives among candidates the deterministic engine already produced;
* ask higher-value clarification questions than the generic evidence-gap set;
* assist a `user_authored` finding by proposing standards, risk and corrective
  actions for a hazard the inspector named;
* interpret ambiguous or paraphrased language;
* improve narrative and corrective-action quality.

Expert HazLenz **must not**:

* silently remove a Level-1 hazard, citation or risk outcome. Removal requires a
  separately governed authority rule that does not exist and is not authorised;
* downgrade a Level-1 risk outcome;
* present Expert confidence as Level-1 deterministic confidence;
* convert a `user_authored` finding into an engine-discovered one;
* become a prerequisite for producing a report.

**Provider failure falls back to Level-1**, silently and harmlessly. No
suggestion is the normal case, not an error state. A provider timeout, refusal,
malformed response or outage must produce exactly the deterministic output the
customer would have received with Expert HazLenz disabled.

## 2. Why this phase was a precondition

Layering a language model over a deterministic engine that promotes contextual
clauses into hazards would have compounded the defect: the model would have been
asked to write standards, risk and corrective actions for `material_handling`
findings derived from "material was being fed", and every such artefact would
have looked authoritative. Measuring and repairing the deterministic floor first
means Expert HazLenz reasons over findings that are already defensible.

The frozen corpus built here also becomes the regression harness for Expert
HazLenz: whatever the provider returns, the deterministic families emitted for
those 56 rows must not change.

## 3. Attribution requirements

Every Expert contribution is separately attributed and distinguishable at the
data layer, not merely in presentation:

* an Expert-supplied standard is marked as Expert-sourced and is distinguishable
  from a deterministically matched citation;
* `inspection_findings.source` stays `'user_authored'` for the life of a
  user-authored finding — assistance changes the assessment, never the
  discovery;
* a user-authored finding never acquires a deterministic citation merely because
  a customer named a hazard;
* Expert confidence is carried on its own field with its own scale.

## 4. Readiness blockers before implementation may begin

These are the exact conditions that must be resolved. None is resolved today.

1. **Provider authority governance.** There is no rule defining when, if ever,
   an Expert output may override, reorder or suppress a Level-1 output. Until
   one is written and governed, Expert output is strictly additive and
   advisory. *(Blocker: policy decision, belongs to the account owner.)*
2. **Attribution schema.** The persistence columns and DTO fields that carry
   Expert provenance, Expert confidence and Expert-sourced standards do not yet
   exist. *(Blocker: schema + migration, not yet designed.)*
3. **Fallback proof.** There is no test demonstrating that a provider timeout,
   refusal or malformed response yields byte-identical Level-1 output. This must
   exist before the first provider call ships.
4. **Level-1 invariance harness.** The precision corpus gate
   (`npm run test:hazlenz-precision`) must be extended to assert that Expert
   HazLenz being enabled does not change the deterministic families emitted for
   any of the 56 corpus rows.
5. **Cost, latency and offline behaviour.** InSite ships offline field
   readiness. The behaviour of Expert HazLenz when the device is offline, and
   the cost ceiling per classify, are undecided. *(Blocker: product decision.)*
6. **Credentials and provider selection.** No provider is configured and no key
   is present. *(Blocker: external authorisation, belongs to the account owner.)*
7. **The deterministic recall gaps recorded in `STATUS.md` §7.** Eleven required
   hazard groups, seven of them life-critical, are missed by the decomposition
   layer on Population B — including B-15, which emits nothing at all for an MCC
   bucket opened with the disconnect closed and no lock applied. Expert HazLenz
   must not be allowed to become the reason those gaps stay open, and it must
   not be positioned as the fix for them: a safety floor that depends on a
   remote provider is not a floor. Whether these are closed deterministically
   before Expert HazLenz begins is a decision for the account owner.
