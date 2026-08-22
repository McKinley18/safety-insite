# TEST_ORACLE_ERROR — corrected transparently (Phase 5 / §22)

## What was wrong
The frozen matrix field `expectedConditionState` was scored against the payload's
**top-level `conditionState`**. Measurement shows that field is near-constant:
`UNKNOWN` on 62 of 66 scenarios, including scenarios where a hazard is unambiguously
present (employee in a 7 ft unshored trench; 18 ft unprotected leading edge; uncapped
rebar). A field that does not vary cannot be the axis a condition-state contract is
measured on.

## The authoritative axis
`multiHazardDecomposition.hazards[].conditionState` (mirrored onto
`additionalHazards[].conditionState`) is the axis that varies (ACTIVE 71 /
HISTORICAL 1 / PLANNED_FUTURE 1 / SAFE_VERIFIED 1) **and** the axis that reaches a
customer surface: `SafeScopeSupportingIntelligenceSection.tsx` renders
`additionalHazards` as "Additional Checks", filtered only by duplicate name — never by
condition state.

Both axes are customer-visible (`guidedFinding.conditionState` carries the top-level
one), so both are measured — but as two different contracts:
* per-hazard ACTIVE on a safe/negated/controlled observation = **false positive**;
* top-level UNKNOWN on an established hazard = **uncertainty calibration**, reported
  separately and never scored as a false positive.

## Verdict before and after the repair
This repair MOVES the verdict, so per §24 its root cause is stated: the original
oracle under-reported false positives on the negative/safe cohorts, because the
near-constant top-level field masked the ACTIVE per-hazard states. The corrected
oracle is strictly harder on HazLenz, not easier. No expected answer was relaxed to
convert a failure into a pass; the matrix text, scenario set and every other
expectation are unchanged at sha256 ef405d60ce4ba073970c1902560c6e8703fa8c297f3cf3cf0c2e6b88ee538111.

---

# HARNESS_ERROR #1 — `ACTIVE` inside an alternation was mis-read
`expects_active` was computed as `re.fullmatch(r'ACTIVE', exp_cs)`, so a scenario whose
frozen expectation *permits* ACTIVE among several acceptable states
(B16 `NO_VIOLATION|UNKNOWN|ACTIVE`, E06 `…|UNKNOWN|ACTIVE`, C09 `UNKNOWN|NO_VIOLATION|ACTIVE`)
was scored as if ACTIVE were forbidden. Fixed: ACTIVE is permitted whenever the frozen
pattern lists it as an alternative. **This correction is in HazLenz's favour** and changes
no frozen expectation — only the scorer's reading of one.

# TEST_ORACLE_ERROR #2 — PPE family pattern too narrow
Scenario B08's frozen pattern `ppe|eye|face|struck_by` cannot match the engine's actual
family name `personal_protective_equipment` (`ppe` is not a substring of it). The intent
of the frozen expectation was "a PPE/eye-face-protection family", which the engine did
emit. Pattern widened to `ppe|personal_protective|eye|face|struck_by`. **Also in
HazLenz's favour.** The scenario's other frozen expectation (a fall/scaffold hazard) is
unchanged and still fails.

---

# Matrix artifact identity

The matrix was hashed **as frozen, before execution**:
`ef405d60ce4ba073970c1902560c6e8703fa8c297f3cf3cf0c2e6b88ee538111`.

Applying `TEST_ORACLE_ERROR #2` re-serialised the JSON, so the committed artifact hashes
`c298f14865fe823d0b8250aff759f9b7cdaf7875a573c3a69fc96ab704149040`. The frozen bytes were not
preserved byte-identically, and that is recorded here rather than glossed.

The delta is exactly:
* scenario **B08**'s PPE family pattern widened `ppe|eye|face|struck_by` →
  `ppe|personal_protective|eye|face|struck_by` — a correction **in HazLenz's favour**;
* the added `oracleCorrections` provenance key;
* JSON re-serialisation (indent/key order).

**Unchanged:** all 66 scenario ids, all scenario text, every other expectation on every scenario
including B08's still-failing fall/scaffold expectation, and `frozenBeforeExecution: true`.
