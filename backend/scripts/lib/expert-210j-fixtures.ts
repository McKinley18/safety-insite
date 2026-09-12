/**
 * §210J -- ZERO-PROVIDER DESIGN FIXTURES FOR THE EPISTEMIC SCHEMA REMEDIATION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT WIRED TO ANY PATH.
 *
 * Every string below is authored HERE, as design material. None is model output, none is a §210H
 * observation, and nothing here is compared against any hosted result. The fixtures establish that
 * the remediated contract CAN represent each required shape. They establish nothing about model
 * behaviour, and the suite asserts that limit rather than leaving it to be assumed.
 *
 * Three observations, chosen so the shapes they carry are genuinely different rather than the same
 * case reworded: a temporary-works one that carries two independent properties, a low-consequence
 * one where continuing under existing control is the right unresolved action, and a buried-services
 * one where the unresolved action is legitimately word-for-word the adverse-branch action.
 */

import type { Declaration210J } from './expert-210j-first-pass-contract';

export const FIXTURE_SOURCES_210J = [
  {
    sourceId: 'OBS-J1',
    text:
      'A mobile tower has been built inside the workshop so the extract ductwork above the paint '
      + 'booth can be re-hung. The outriggers are fitted on all four corners and the platform gate '
      + 'is self-closing. The floor under the near-side castors is a service duct cover whose load '
      + 'rating nobody present could give, and the duct sections going back up are heavier than the '
      + 'ones that came down. The gang are at the ladder with the first section slung.',
  },
  {
    sourceId: 'OBS-J2',
    text:
      'A storeman is decanting screenwash from a drum into hand bottles at a bench in the yard. He '
      + 'has goggles and gloves on and the bench is under cover. The drum label is legible but the '
      + 'batch sheet for this delivery has not come through, so the exact methanol content is not '
      + 'to hand. The nearest eyewash is on the wall four metres away and is in date.',
  },
  {
    sourceId: 'OBS-J3',
    text:
      'A jointer is about to cut into a buried cable route in a verge. The cable record drawing '
      + 'shows one low-voltage cable and the scan picked up one trace on that line. An older record '
      + 'in the same file shows a high-voltage cable through the same verge and nobody has been '
      + 'able to say whether it was ever diverted. The dig is marked out and the machine is on '
      + 'site.',
  },
] as const;

const decl = (d: Declaration210J): Declaration210J => d;

/** F1. A physical property unresolved, and the correct action now is to hold. */
export const F1_UNRESOLVED_HOLD: Declaration210J = decl({
  declarationId: 'J1-floor',
  missingFact: 'whether the service duct cover under the near-side castors will carry the loaded '
    + 'tower without giving way',
  observationSourceId: 'OBS-J1',
  observationSpan: 'a service duct cover whose load rating nobody present could give',
  notEstablishedBecause: 'the text establishes that nobody present could give the load rating of '
    + 'the cover; it says nothing about what the cover will actually carry',
  affectedDecision: 'HAZARD_EXISTENCE',
  branchA: 'the duct cover carries the loaded tower without giving way',
  decisionIfA: 'the gang go up and re-hang the ductwork from the tower where it stands',
  branchB: 'the duct cover will not carry the loaded tower and could give way under the castors',
  decisionIfB: 'move the tower off the duct cover onto sound floor before anyone goes up',
  decisionWhileUnresolved: 'nobody goes up and no section is lifted while the tower stands on the '
    + 'duct cover, until what the cover will carry is established',
  whyNecessaryNow: 'the gang are at the ladder with the first section already slung',
});

/** F2. Unresolved, and the correct action now is to CONTINUE under the controls already in use. */
export const F2_UNRESOLVED_CONTINUE: Declaration210J = decl({
  declarationId: 'J2-methanol',
  missingFact: 'whether the methanol content of this delivery is above the level the goggles, '
    + 'gloves and open-air bench already handle',
  observationSourceId: 'OBS-J2',
  observationSpan: 'the batch sheet for this delivery has not come through',
  notEstablishedBecause: 'the text establishes that the batch sheet has not arrived and that the '
    + 'content is not to hand; it does not state what the content is',
  affectedDecision: 'REQUIRED_CONTROL',
  branchA: 'the methanol content is within the range the current goggles, gloves, covered bench '
    + 'and in-date eyewash already cover',
  decisionIfA: 'decanting continues exactly as it is',
  branchB: 'the methanol content is above that range',
  decisionIfB: 'stop decanting until closed transfer or better protection is in place',
  decisionWhileUnresolved: 'decanting continues under the goggles, gloves, covered bench and '
    + 'in-date eyewash already in use; no additional restriction is required while this remains '
    + 'open',
  whyNecessaryNow: 'the storeman is decanting now and the drum is open',
});

/**
 * F3. The unresolved action is WORD FOR WORD the adverse-branch action, and that is correct.
 * Nothing compares them, and this fixture exists to prove no check was quietly added.
 */
export const F3_UNRESOLVED_ACTION_EQUALS_DECISION_IF_B: Declaration210J = decl({
  declarationId: 'J3-hv',
  missingFact: 'whether the older high-voltage cable is still in the verge on the marked line',
  observationSourceId: 'OBS-J3',
  observationSpan: 'nobody has been able to say whether it was ever diverted',
  notEstablishedBecause: 'the text establishes that an older record shows the cable and that '
    + 'nobody could say whether it was diverted; it does not state where the cable is now',
  affectedDecision: 'HAZARD_EXISTENCE',
  branchA: 'the high-voltage cable was diverted and is not under the marked line',
  decisionIfA: 'the dig proceeds on the marked line under the low-voltage permit',
  branchB: 'the high-voltage cable is still in the verge under the marked line',
  decisionIfB: 'no machine digging on this line until the high-voltage cable is located and made '
    + 'safe',
  decisionWhileUnresolved: 'no machine digging on this line until the high-voltage cable is '
    + 'located and made safe',
  whyNecessaryNow: 'the dig is marked out and the machine is on site',
});

/** F10 second fact. Independent of F1, on the same observation, with its own unresolved action. */
export const F10_SECOND_FACT: Declaration210J = decl({
  declarationId: 'J1-sections',
  missingFact: 'whether the heavier duct sections going back up are within the safe working load '
    + 'of this tower platform',
  observationSourceId: 'OBS-J1',
  observationSpan: 'the duct sections going back up are heavier than the ones that came down',
  notEstablishedBecause: 'the text establishes that the new sections are heavier than the old ones '
    + 'and gives neither their weight nor the platform rating',
  affectedDecision: 'HAZARD_SEVERITY',
  branchA: 'the heavier sections are within the platform safe working load with the gang on it',
  decisionIfA: 'the sections go up on the tower as planned',
  branchB: 'the heavier sections take the platform over its safe working load',
  decisionIfB: 'the sections go up by another means and not on this tower platform',
  decisionWhileUnresolved: 'no section is taken onto the platform until the section weight and the '
    + 'platform rating are both established',
  whyNecessaryNow: 'the first section is already slung and the gang are at the ladder',
});

/** F8a. The added field is absent entirely. */
export const F8A_ACTION_ABSENT: Record<string, unknown> = (() => {
  const { decisionWhileUnresolved, ...rest } = F1_UNRESOLVED_HOLD;
  void decisionWhileUnresolved;
  return { ...rest, declarationId: 'J8a-absent' };
})();

/** F8b. The added field is present and is whole-field filler. */
export const F8B_ACTION_PLACEHOLDER: Record<string, unknown> = {
  ...F1_UNRESOLVED_HOLD,
  declarationId: 'J8b-filler',
  decisionWhileUnresolved: 'placeholder',
};

/** A legacy declaration: valid under the pre-§210J contract, carrying no successor field. */
export const LEGACY_DECLARATION: Record<string, unknown> = (() => {
  const { decisionWhileUnresolved, ...rest } = F2_UNRESOLVED_CONTINUE;
  void decisionWhileUnresolved;
  return { ...rest, declarationId: 'J-legacy' };
})();

/** A provider response that tried to author a settlement outcome. Refused by name. */
export const PROVIDER_RESPONSE_CLAIMING_A_BRANCH: Record<string, unknown> = {
  factKey: 'FP:whatever',
  reason: 'the reading I was given shows the cover is rated well above the tower',
  establishedBranch: 'A',
  settles: true,
};
