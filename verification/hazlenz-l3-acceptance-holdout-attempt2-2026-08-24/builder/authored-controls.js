/*
 * L3 ACCEPTANCE HOLDOUT, CONSTRUCTION ATTEMPT 2 -- THE 25 AUTHORED CONTROLS
 * Governing: INDEPENDENT_EVIDENCE_PLAN.md base + Amendment 1 (D-D) + Amendment 2 (D-E, D-F)
 * Freeze:    ../HOLDOUT_FREEZE.txt section 8
 *
 * AUTHORING INDEPENDENCE, ATTESTED:
 *   These 25 observations were authored from the FROZEN F1-F8 FAMILY SPECIFICATION ALONE.
 *   No selected acceptance row was read, previewed, or semantically inspected before or during
 *   authoring. No control is derived from, or inspired by, any independent source observation.
 *   No control is taken from Attempt 1, whose materialization Amendment 2 makes a STRUCTURAL
 *   ARTIFACT ONLY, admitted to no holdout.
 *   Every truth label below is fixed by the family specification, not by any observed behaviour --
 *   and no provider behaviour exists in this phase, because no inference occurs.
 *
 *   Allocation is FROZEN: F1 4 | F2 4 | F3 3 | F4 3 | F5 3 | F6 3 | F7 3 | F8 2 = 25.
 *   Truth may not be revised after authoring. Families may not be re-poled or re-allocated.
 *
 *   G4 DENOMINATOR IS 21 (Amendment 2 / D-E), membership unchanged: F1, F2, F3, F4, F5, F6, F8b.
 */
'use strict';

const AUTHORED_BY =
  'authored by the L3 acceptance holdout construction phase under INDEPENDENT_EVIDENCE_PLAN Amendment 1 D-D';

// family -> frozen truth template (HOLDOUT_FREEZE.txt section 8). Nothing here is inferred.
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
   'The chain drive on the packaging line was enclosed by a bolted sheet-metal guard that covered the full run of the chain from the drive sprocket to the driven sprocket, and no nip point was reachable from the operator position.'],
  ['AC-F1-02', 'F1', 'osha-construction',
   'The floor opening on the second level was covered with a secured plate marked HOLE, and the cover was fastened to the deck at four points so that it could not be displaced by foot traffic.'],
  ['AC-F1-03', 'F1', 'osha-general-industry',
   'Every acetylene and oxygen cylinder in the welding bay was stored upright in its rack with the valve cap fitted and a rated chain across the mid-body, and the fuel and oxidiser groups were separated by a rated partition.'],
  ['AC-F1-04', 'F1', 'msha',
   'The berm along the outer edge of the haul road was continuous for the full length of the grade and stood at mid-axle height of the largest vehicle using the road.'],

  // ---- F2  corrected / remediated condition  (n = 4) ----
  ['AC-F2-01', 'F2', 'osha-general-industry',
   'The eyewash station in the plating area was found with its outlet caps missing and the bowl fouled; the unit was flushed, fitted with new caps and returned to a working condition before the observation was closed.'],
  ['AC-F2-02', 'F2', 'osha-construction',
   'A rebar cage on the deck had uncapped vertical bars at working height; protective caps rated for impalement were fitted to every exposed bar during the walk and were verified in place at the close of the observation.'],
  ['AC-F2-03', 'F2', 'osha-general-industry',
   'A pallet jack with a leaking hydraulic cylinder was in use in the shipping aisle; it was tagged, taken out of service and moved to the maintenance bay before the observation ended.'],
  ['AC-F2-04', 'F2', 'msha',
   'The guard over the tail pulley of the stacker conveyor was found displaced at the start of the shift; it was refitted and secured with its original fasteners, and the fit was confirmed before the observation closed.'],

  // ---- F3  insufficient evidence -- deciding fact EXPLICITLY not observable  (n = 3) ----
  ['AC-F3-01', 'F3', 'osha-general-industry',
   'A vertical boring mill was running behind a fixed screen. The interlock switch on the access door sat on the far side of the column and was not visible from any position on the floor, so whether the interlock was engaged could not be established during the observation.'],
  ['AC-F3-02', 'F3', 'osha-construction',
   'A personal fall arrest harness was worn by a worker on the leading edge. The lanyard ran behind a stack of decking and its anchorage end could not be seen from any accessible vantage point, so the anchorage it was connected to could not be established on site.'],
  ['AC-F3-03', 'F3', 'msha',
   'A portable gas detector was clipped to the belt of a miner entering the decline. The calibration due date was printed on the reverse of the instrument face and was obscured by the belt clip, so whether the instrument was within its calibration interval could not be established.'],

  // ---- F4  subjective / non-factual observation  (n = 3) ----
  ['AC-F4-01', 'F4', 'osha-general-industry',
   'The tone in the fabrication shop seemed careless, and the crew gave the impression of not taking the walk-through especially seriously.'],
  ['AC-F4-02', 'F4', 'osha-construction',
   'The site came across as poorly run compared with other projects of similar size, and the general atmosphere was uninspiring.'],
  ['AC-F4-03', 'F4', 'msha',
   'The surface plant looked tired and somewhat neglected, and the overall impression was of an operation that had seen better years.'],

  // ---- F5  conditional / hypothetical language  (n = 3) ----
  ['AC-F5-01', 'F5', 'osha-general-industry',
   'If the fixed ladder cage on the silo were ever removed, a climber would be exposed to the full thirty-two foot fall to the concrete pad below.'],
  ['AC-F5-02', 'F5', 'osha-construction',
   'Had the trench box been omitted from this excavation, the vertical face of sandy soil would have been left unsupported at a depth beyond the limit the plan allows.'],
  ['AC-F5-03', 'F5', 'msha',
   'Were the ventilation curtain in the crosscut to be taken down, methane would be expected to build up at the working face over the course of a shift.'],

  // ---- F6  absent decision-critical fact -- absence BY OMISSION  (n = 3) ----
  ['AC-F6-01', 'F6', 'osha-general-industry',
   'A maintenance technician was replacing the drive belt on the exhaust blower in the finishing room.'],
  ['AC-F6-02', 'F6', 'osha-construction',
   'A suspended scaffold was hanging from the parapet on the west face of the building.'],
  ['AC-F6-03', 'F6', 'msha',
   'A miner was positioned beneath the raised bed of a haul truck in the shop bay.'],

  // ---- F7  sufficient evidence -- clarification MUST NOT be asked  (n = 3) ----
  ['AC-F7-01', 'F7', 'osha-construction',
   'A worker stood on the top rail of an unsecured extension ladder eleven feet above a concrete slab, reaching sideways beyond the ladder rails to set a conduit hanger. No fall protection of any kind was worn, no anchorage was present, the ladder feet were on loose gravel, and no second worker was holding the ladder.'],
  ['AC-F7-02', 'F7', 'osha-general-industry',
   'An operator reached into the die space of a running press brake to reposition a workpiece while the ram was cycling on a continuous stroke. The die opening measured four inches, the light curtain had been physically removed and lay on the floor beside the machine, and both hands of the operator entered the opening on each of the six strokes observed.'],
  ['AC-F7-03', 'F7', 'msha',
   'Two miners were working directly beneath a highwall that had an overhanging brow of loose rock approximately fifteen feet above them. No scaling had been done, the area was not barricaded, no spotter was posted, and the miners remained under the brow for the entire twenty-five minutes of the observation.'],

  // ---- F8  paired positive / negative state distinction  (n = 2) ----
  ['AC-F8-01', 'F8a', 'osha-general-industry',
   'The machine-mounted disconnect for the mixer was left unlocked during the blade change, and the mixer remained connected to its energy source while a mechanic worked inside the bowl.'],
  ['AC-F8-02', 'F8b', 'osha-general-industry',
   'The machine-mounted disconnect for the mixer was not left unlocked during the blade change; it was opened, locked and tagged by the mechanic, and the stored energy was verified at zero while a mechanic worked inside the bowl.'],
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

module.exports = {
  buildAuthoredControls,
  FAMILY,
  AUTHORED_BY,
  FROZEN_ALLOCATION: { F1: 4, F2: 4, F3: 3, F4: 3, F5: 3, F6: 3, F7: 3, F8: 2 },
};
