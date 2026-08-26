/*
 * L3 ACCEPTANCE HOLDOUT -- THE 25 AUTHORED CONTROLS  (Amendment 1, D-D; HOLDOUT_FREEZE.txt s.8)
 *
 * AUTHORING INDEPENDENCE, ATTESTED:
 *   These 25 observations were authored from the FROZEN F1-F8 FAMILY SPECIFICATION ALONE.
 *   No selected acceptance row was read, previewed, or semantically inspected before or during
 *   authoring. No control is derived from, or inspired by, any independent source observation.
 *   Every truth label below is fixed by the family specification, not by any observed behaviour --
 *   and no provider behaviour exists in this phase, because no inference occurs.
 *
 *   Allocation is FROZEN: F1 4 | F2 4 | F3 3 | F4 3 | F5 3 | F6 3 | F7 3 | F8 2 = 25.
 *   Truth may not be revised after authoring. Families may not be re-poled or re-allocated.
 */
'use strict';

const AUTHORED_BY =
  'authored by the L3 acceptance holdout construction phase under INDEPENDENT_EVIDENCE_PLAN Amendment 1 D-D';

// family -> frozen truth template (HOLDOUT_FREEZE.txt section 8)
const FAMILY = {
  F1: { conditionState: 'NEGATED',               acceptableStates: ['NEGATED'],
        hazardEstablished: false, activeProhibited: true,  clarificationExpected: false,
        pole: 'CLARIFICATION_MUST_NOT_ASK', inG3: false, inG4: true,  inG7: true  },
  F2: { conditionState: 'CORRECTED',             acceptableStates: ['CORRECTED', 'REMOVED_FROM_SERVICE'],
        hazardEstablished: false, activeProhibited: true,  clarificationExpected: false,
        pole: 'CLARIFICATION_MUST_NOT_ASK', inG3: false, inG4: true,  inG7: true  },
  F3: { conditionState: 'INSUFFICIENT_EVIDENCE', acceptableStates: ['INSUFFICIENT_EVIDENCE'],
        hazardEstablished: true,  activeProhibited: true,  clarificationExpected: true,
        pole: 'CLARIFICATION_REQUIRED',     inG3: true,  inG4: true,  inG7: false },
  F4: { conditionState: 'UNKNOWN',               acceptableStates: ['UNKNOWN', 'INSUFFICIENT_EVIDENCE'],
        hazardEstablished: false, activeProhibited: true,  clarificationExpected: false,
        pole: 'DECIDED_NON_ACTIVE',         inG3: false, inG4: true,  inG7: false },
  F5: { conditionState: 'HYPOTHETICAL',          acceptableStates: ['HYPOTHETICAL'],
        hazardEstablished: false, activeProhibited: true,  clarificationExpected: false,
        pole: 'DECIDED_NON_ACTIVE',         inG3: false, inG4: true,  inG7: false },
  F6: { conditionState: 'INSUFFICIENT_EVIDENCE', acceptableStates: ['INSUFFICIENT_EVIDENCE'],
        hazardEstablished: true,  activeProhibited: true,  clarificationExpected: true,
        pole: 'CLARIFICATION_REQUIRED',     inG3: true,  inG4: true,  inG7: false },
  F7: { conditionState: 'ACTIVE',                acceptableStates: ['ACTIVE'],
        hazardEstablished: true,  activeProhibited: false, clarificationExpected: false,
        pole: 'CLARIFICATION_MUST_NOT_ASK', inG3: false, inG4: false, inG7: true  },
  F8a:{ conditionState: 'ACTIVE',                acceptableStates: ['ACTIVE'],
        hazardEstablished: true,  activeProhibited: false, clarificationExpected: false,
        pole: 'REGRESSION_ACTIVE',          inG3: false, inG4: false, inG7: false },
  F8b:{ conditionState: 'NEGATED',               acceptableStates: ['NEGATED'],
        hazardEstablished: false, activeProhibited: true,  clarificationExpected: false,
        pole: 'NEGATIVE_CONTROL',           inG3: false, inG4: true,  inG7: false },
};

// [ sourceId, familyKey, regime, observation text ]
const CONTROLS = [
  // ---- F1  explicit safe / negated condition  (n = 4) ----
  ['AC-F1-01', 'F1', 'osha-general-industry',
   'The fixed guard over the bench grinder wheel was in place and secured with both mounting bolts, and the work rest was adjusted to one-eighth of an inch from the wheel face.'],
  ['AC-F1-02', 'F1', 'osha-construction',
   'The excavation on the south side was benched back to the angle shown on the shoring plan, and no employee was working below an unsupported face.'],
  ['AC-F1-03', 'F1', 'osha-general-industry',
   'The dead-front cover of the motor control cabinet was closed and latched, and no energized conductor was exposed at any point along the run.'],
  ['AC-F1-04', 'F1', 'msha',
   'The travelway alongside the crusher deck had standard handrail on both sides for its full length, and the toeboard was continuous.'],

  // ---- F2  corrected / remediated condition  (n = 4) ----
  ['AC-F2-01', 'F2', 'osha-general-industry',
   'The belt guard on the shop air compressor was found lying beside the unit at the start of the walk; maintenance refitted and bolted it before the inspection closed.'],
  ['AC-F2-02', 'F2', 'osha-construction',
   'An extension cord with a split outer jacket was in use at the cut station; it was removed from service and replaced with an undamaged cord during the observation.'],
  ['AC-F2-03', 'F2', 'osha-general-industry',
   'Stock pallets were stacked across the rear exit route when the observation began; the aisle was cleared to its full marked width before the observation ended.'],
  ['AC-F2-04', 'F2', 'msha',
   'Two oxygen cylinders were standing unsecured in the shop bay; both were chained upright to the rack and capped while the inspector was present.'],

  // ---- F3  insufficient evidence -- deciding fact EXPLICITLY not observable  (n = 3) ----
  ['AC-F3-01', 'F3', 'osha-general-industry',
   'A hydraulic press was cycling behind a mesh screen. The status indicator for the light curtain faced away from every accessible vantage point, so whether the curtain was active could not be established from the floor.'],
  ['AC-F3-02', 'F3', 'osha-construction',
   'A fiberglass stepladder was in use at the riser. Its duty-rating label had worn away to the point of being unreadable, so the rated load of the ladder could not be established on site.'],
  ['AC-F3-03', 'F3', 'osha-general-industry',
   'A worker in the paint booth wore a half-face respirator. The cartridge change-out date was written on the underside of the cartridge and was covered by the head strap, so the service life remaining could not be established.'],

  // ---- F4  subjective / non-factual observation  (n = 3) ----
  ['AC-F4-01', 'F4', 'osha-general-industry',
   'The maintenance bay felt disorganised and gave a general impression of weak housekeeping discipline.'],
  ['AC-F4-02', 'F4', 'msha',
   'Morale among the wash plant crew appeared low, and the shift supervisor came across as inattentive during the walk.'],
  ['AC-F4-03', 'F4', 'osha-construction',
   'The overall condition of the laydown yard struck the observer as below the standard usually seen at comparable projects.'],

  // ---- F5  conditional / hypothetical language  (n = 3) ----
  ['AC-F5-01', 'F5', 'osha-general-industry',
   'If the perimeter barrier at the loading dock were taken away, the forty-eight inch drop to the apron would become exposed to foot traffic.'],
  ['AC-F5-02', 'F5', 'osha-general-industry',
   'Were the exhaust fan in the mixing room taken out of service, solvent vapour would be expected to accumulate above the working platform.'],
  ['AC-F5-03', 'F5', 'msha',
   'Should the interlock on the screen deck access door ever be bypassed, a person could reach the rotating shaft while it was turning.'],

  // ---- F6  absent decision-critical fact -- absence BY OMISSION  (n = 3) ----
  ['AC-F6-01', 'F6', 'osha-general-industry',
   'A junction box on the conduit run in the pump house was missing its cover plate.'],
  ['AC-F6-02', 'F6', 'osha-construction',
   'Scaffold planking was spanning two frames along the north elevation of the building.'],
  ['AC-F6-03', 'F6', 'osha-general-industry',
   'An employee was working inside the sludge tank, having entered through the side manway.'],

  // ---- F7  sufficient evidence -- clarification MUST NOT be asked  (n = 3) ----
  ['AC-F7-01', 'F7', 'osha-general-industry',
   'An employee stood on the top cap of a six-foot stepladder to change a light fitting, with both feet four feet nine inches above a wet tiled floor. The ladder was not secured, no guardrail or personal fall arrest system was in use, and no other worker was steadying it.'],
  ['AC-F7-02', 'F7', 'osha-general-industry',
   'The point of operation of a mechanical power press was unguarded while an operator hand-fed blanks into the die and cycled the press with a foot pedal. The die opening measured three inches, and the operator placed both hands inside that opening on every stroke observed.'],
  ['AC-F7-03', 'F7', 'osha-construction',
   'A worker cut concrete with a gasoline-powered saw for the full twenty minutes of the observation, inside a closed basement room with no mechanical ventilation, no openings to outside air, and no respiratory protection of any kind in use.'],

  // ---- F8  paired positive / negative state distinction  (n = 2) ----
  ['AC-F8-01', 'F8a', 'osha-general-industry',
   'The emergency stop button at the conveyor control panel was disabled, and the conveyor ran while employees worked along its length.'],
  ['AC-F8-02', 'F8b', 'osha-general-industry',
   'The emergency stop button at the conveyor control panel was not disabled; it was tested and it stopped the belt, while the conveyor ran and employees worked along its length.'],
];

function buildAuthoredControls() {
  return CONTROLS.map(([sourceId, famKey, regime, text]) => {
    const t = FAMILY[famKey];
    if (!t) throw new Error(`unknown authored family key: ${famKey}`);
    const family = famKey.replace(/[ab]$/, '');   // F8a / F8b -> F8
    return {
      sourceId,
      provenanceClass: 'AUTHORED_CONTROL',
      source: AUTHORED_BY,
      selectionRule: `authored control, frozen family ${famKey} (HOLDOUT_FREEZE.txt s.8)`,
      family,
      familyVariant: famKey,
      pole: t.pole,
      regime,
      text,
      expect: {
        hazardEstablished: t.hazardEstablished,
        conditionState: t.conditionState,
        acceptableStates: t.acceptableStates.slice(),
        activeProhibited: t.activeProhibited,
        clarificationExpected: t.clarificationExpected,
        highConsequence: false,
        inG3Denominator: t.inG3,
        inG4Denominator: t.inG4,
        inG7Pole: t.inG7,
      },
      sourceMeta: null,
    };
  });
}

module.exports = { buildAuthoredControls, FAMILY, AUTHORED_BY, FROZEN_ALLOCATION: { F1: 4, F2: 4, F3: 3, F4: 3, F5: 3, F6: 3, F7: 3, F8: 2 } };
