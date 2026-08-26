/*
 * L3 ACCEPTANCE HOLDOUT, RUN 2 -- THE 25 FRESH AUTHORED CONTROLS
 * Governing: INDEPENDENT_EVIDENCE_PLAN.md base + Amendment 1 (D-D) + Amendment 2 (D-E, D-F)
 *            + Amendment 3 (D-I)
 * Freeze:    ../HOLDOUT_FREEZE.txt section 6   (67e6b47c...)
 *
 * AUTHORING INDEPENDENCE, ATTESTED:
 *   These 25 observations were authored from the FROZEN F1-F8 FAMILY SPECIFICATION ALONE.
 *   No Run-2 selected acceptance row was read, previewed or semantically inspected before or
 *   during authoring -- the positive stride was UNOPENED, because selection code did not yet
 *   exist when this file was written.
 *
 *   D-I COMPLIANCE: NOT ONE of these is a Run-1 authored control, and none is a mechanical
 *   paraphrase, clone, or minimal edit of a Run-1 observation made to evade overlap detection.
 *   Every one names a DIFFERENT subject in a DIFFERENT setting. Run-1's F1 set concerned a
 *   packaging-line chain drive, a floor opening, welding-bay cylinders and a haul-road berm;
 *   this F1 set concerns a distribution panel, a benched excavation, a conveyor tail pulley and
 *   a ladderway. The same deliberate separation holds family by family. Membership in the spent
 *   Run-1 sealed corpus prohibits reuse on its own, and D-D.6 surface 8 enforces it by THROW.
 *
 *   Every truth label below is fixed by the family specification, not by any observed behaviour,
 *   and no provider behaviour exists in this phase because no inference occurs.
 *
 *   Allocation is FROZEN: F1 4 | F2 4 | F3 3 | F4 3 | F5 3 | F6 3 | F7 3 | F8 2 = 25.
 *   Truth may not be revised after authoring. Families may not be re-poled or re-allocated.
 *   G4 DENOMINATOR IS 21 (Amendment 2 / D-E), membership F1, F2, F3, F4, F5, F6, F8b.
 */
'use strict';

const AUTHORED_BY =
  'authored by the L3 RUN-2 acceptance holdout construction phase under INDEPENDENT_EVIDENCE_PLAN Amendment 1 D-D and Amendment 3 D-I';

// family -> frozen truth template (HOLDOUT_FREEZE.txt section 6). Nothing here is inferred.
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

const FROZEN_ALLOCATION = { F1: 4, F2: 4, F3: 3, F4: 3, F5: 3, F6: 3, F7: 3, F8: 2 };

// [ sourceId, familyKey, regime, observation text ]
const CONTROLS = [
  // ---- F1  explicit safe / negated condition  (n = 4)
  //      Plain declarative negation. No hedging, no partial evidence, nothing outstanding.
  ['AC2-F1-01', 'F1', 'osha-general-industry',
   'The dead front cover was fitted and secured on the distribution panel in the compressor room, every unused knockout carried a blanking plug, and no energised part was reachable with the enclosure closed.'],
  ['AC2-F1-02', 'F1', 'osha-construction',
   'The excavation at the north footing was benched back to a stable slope for its full depth, the spoil was set back more than a metre from the crest, and no one entered the cut at any point during the observation.'],
  ['AC2-F1-03', 'F1', 'osha-general-industry',
   'The tail pulley of the aggregate conveyor was fully enclosed by a fixed guard that required a spanner to remove, and the enclosure extended past the in-running nip on both sides of the belt.'],
  ['AC2-F1-04', 'F1', 'msha',
   'The ladderway between the second and third levels had a continuous handrail on both sides for its whole run, and a fitted landing platform at every intermediate level.'],

  // ---- F2  corrected / remediated condition  (n = 4)
  //      Remediation explicitly stated as COMPLETED before the observation closed.
  ['AC2-F2-01', 'F2', 'osha-general-industry',
   'The emergency stop pull cord along the picking belt was found slack over its last two spans; it was retensioned and function tested against the drive before the walk moved on.'],
  ['AC2-F2-02', 'F2', 'osha-general-industry',
   'A wooden wedge was holding the stairwell fire door open; the wedge was taken away and the door was watched through a full closing cycle to confirm it latched on its own.'],
  ['AC2-F2-03', 'F2', 'osha-construction',
   'The extension lead feeding the site office had a split in its outer sheath at the plug end; it was cut off, tagged out of service and swapped for a tested lead before the inspection closed.'],
  ['AC2-F2-04', 'F2', 'msha',
   'A decanted container of degreaser at the wash bay carried no identification; it was labelled with the product name and hazard pictograms from the parent drum and returned to the store before the observation ended.'],

  // ---- F3  insufficient evidence  (n = 3)
  //      A hazard-bearing condition is named and the decision-critical fact is EXPLICITLY not
  //      observable. Resolvable only by a question, never by asserting an unobserved fact.
  ['AC2-F3-01', 'F3', 'osha-general-industry',
   'The bandsaw in the fabrication bay was photographed from the operator side only, and that view does not show whether the lower blade enclosure below the table is fitted.'],
  ['AC2-F3-02', 'F3', 'osha-construction',
   'A single anchor point was in use for the roof work, but its rating plate could not be read from ground level and no anchor register was available on site at the time of the visit.'],
  ['AC2-F3-03', 'F3', 'osha-general-industry',
   'The isolator serving the mixer was screened by stacked pallets throughout the walk, so whether a lock and tag had been applied to it could not be seen from any accessible position.'],

  // ---- F4  subjective / non-factual observation  (n = 3)
  //      An evaluative impression with NO verifiable predicate. No specific missing fact exists.
  ['AC2-F4-01', 'F4', 'osha-general-industry',
   'The despatch yard came across as chaotic to me on the day of the visit.'],
  ['AC2-F4-02', 'F4', 'osha-construction',
   'My impression was that the crew on the second lift seemed rushed.'],
  ['AC2-F4-03', 'F4', 'msha',
   'The maintenance workshop gave a generally untidy impression during the tour.'],

  // ---- F5  conditional / hypothetical language  (n = 3)
  //      Contingent or counterfactual framing. NOTHING is asserted as realised.
  ['AC2-F5-01', 'F5', 'osha-general-industry',
   'If the mezzanine pallet gate were ever left standing open, the loading edge behind it would be exposed to anyone working on that level.'],
  ['AC2-F5-02', 'F5', 'osha-general-industry',
   'Should the extraction fan serving the paint booth be switched off while spraying continued, solvent vapour could build up inside the booth.'],
  ['AC2-F5-03', 'F5', 'msha',
   'Were the stillages in the parts store stacked one tier higher than they are, the load would go beyond the rating marked on the racking.'],

  // ---- F6  absent decision-critical fact  (n = 3)
  //      The hazard IS established, but a fact that DECIDES the state -- exposure, energisation,
  //      occupancy -- is simply NOT PRESENT in the text. Absence by omission, not by statement.
  ['AC2-F6-01', 'F6', 'osha-general-industry',
   'The interlocked guard over the dough mixer bowl had been lifted off its mounting and was lying on the bench beside the machine.'],
  ['AC2-F6-02', 'F6', 'osha-construction',
   'The edge protection around the open lift shaft on the second floor had been taken down.'],
  ['AC2-F6-03', 'F6', 'msha',
   'Several boards had been lifted out of the working platform on the third lift of the shaft scaffold.'],

  // ---- F7  sufficient evidence -- clarification MUST NOT be asked  (n = 3)
  //      Hazard established AND every decision-critical fact explicitly present. A complete,
  //      decidable ACTIVE finding with no boundary.
  ['AC2-F7-01', 'F7', 'osha-general-industry',
   'An operator was feeding sheet by hand into the in-running nip of the laminating rollers with the guard removed and the line running at production speed, with his fingers within a hand-width of the nip.'],
  ['AC2-F7-02', 'F7', 'osha-construction',
   'A pipefitter was working at the base of a two-metre-deep trench in soft wet clay with vertical walls, no shoring or trench box in place, and the spoil heaped at the crest directly above him.'],
  ['AC2-F7-03', 'F7', 'osha-general-industry',
   'A technician had the door of the live 480-volt switchboard open and was working between exposed busbars with no lockout applied and no arc-rated protective clothing on.'],

  // ---- F8  paired positive / negative state distinction  (n = 2)
  //      ONE MATCHED PAIR, minimally different, sharing the same lexical head. F8a asserts the
  //      condition realised; F8b negates that same condition. Tests STATE SEPARATION, not
  //      lexical presence.
  ['AC2-F8-01', 'F8a', 'osha-general-industry',
   'The pressure relief valve on the air receiver was isolated behind a closed block valve while the compressor continued to run on load.'],
  ['AC2-F8-02', 'F8b', 'osha-general-industry',
   'The pressure relief valve on the air receiver was not isolated: the block valve beneath it was locked open while the compressor continued to run on load.'],
];

function buildAuthoredControlsRun2() {
  return CONTROLS.map(([sourceId, famKey, regime, text]) => {
    const t = FAMILY[famKey];
    if (!t) throw new Error(`unknown authored family key: ${famKey}`);
    const family = famKey.replace(/[ab]$/, '');   // F8a / F8b -> F8
    return {
      sourceId,
      provenanceClass: 'AUTHORED_CONTROL',
      source: AUTHORED_BY,
      selectionRule: `fresh authored control, frozen family ${famKey} (RUN-2 HOLDOUT_FREEZE.txt s.6)`,
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
    };
  });
}

module.exports = { buildAuthoredControlsRun2, FROZEN_ALLOCATION, FAMILY, AUTHORED_BY };
