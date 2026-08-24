/**
 * L3-2f -- DEVELOPMENT SET. TUNING EVIDENCE ONLY, never advancement evidence.
 *
 * The L3-2e development set (which already carries `B08`, `B10`, `C11`, `H-AM-05`, `H-FLD-141`,
 * `H-NG-02` and `RC-08` from opened sets) plus the five fixtures the L3-2f entry contract names by
 * id from opened holdouts -- `D-FLD-175`, `D-NG-04`, `D-CR-04`, `E-OA-07`, `E-FLD-147` -- plus the
 * F1..F6 paired fixtures this phase needs.
 *
 * EVERY SOURCE HERE IS AN ALREADY-OPENED SET. Nothing in this file may be reported as fresh
 * evidence, and the builder throws if any scenario collides with the SEALED L3-2f holdout.
 *
 * Run: npx ts-node scripts/build-l32f-devset.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const EVAL = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval');
const OUT = join(EVAL, 'development-l32f.json');
const NON_ACTIVE = ['CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED', 'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];

interface Scenario {
  id: string; source: string; provenanceClass: string; cohort: string;
  failureMode: string; regime: string; text: string; expect: Record<string, unknown>;
}
const D = (o: Omit<Scenario, 'source' | 'provenanceClass'>): Scenario =>
  ({ ...o, source: 'authored by the L3-2f implementation phase', provenanceClass: 'DEVELOPMENT' });

/** The five the entry contract names by id, lifted verbatim from the sets that opened them. */
const CARRY_FORWARD_IDS: Record<string, string> = {
  'D-FLD-175': 'holdout-l32d.json',
  'D-NG-04': 'holdout-l32d.json',
  'D-CR-04': 'holdout-l32d.json',
  'E-OA-07': 'holdout-l32e.json',
  'E-FLD-147': 'holdout-l32e.json',
};

const NEW_FIXTURES: Scenario[] = [
  // ---- F1 predicate scope, paired.
  D({ id: 'X-PS-01', cohort: 'f1_predicate_scope', failureMode: 'irregular finite verb ends the scope', regime: 'osha-general-industry',
    text: 'No gas test was recorded for the sump, and the pump fitter climbed down the chamber with the discharge valve still cracked open.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'confined_space', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-PS-02', cohort: 'f1_predicate_scope', failureMode: 'PAIR: negated list must cross its commas', regime: 'osha-construction',
    text: 'The steel fixers were working off the top mat with no guardrail, catch net or running line rigged along the span.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-PS-03', cohort: 'f1_predicate_scope', failureMode: 'irregular finite verb after a bare conjunction', regime: 'osha-general-industry',
    text: 'No permit was raised for the guarding work and the setter drew the interlock key from the gate to keep the press cycling.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|loto_stored_energy', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-PS-04', cohort: 'f1_predicate_scope', failureMode: 'PAIR: irregular verb form used as a NOUN inside the negated phrase', regime: 'msha',
    text: 'The inspection of the development heading recorded no fall of ground anywhere along the rib line.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),

  // ---- F2 noun-phrase terminators, paired.
  D({ id: 'X-NT-01', cohort: 'f2_np_terminator', failureMode: 'negated hazard head before an unlisted preposition', regime: 'osha-general-industry',
    text: 'The store audit recorded no deficiencies against the flammables standard and no actions carried over.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  D({ id: 'X-NT-02', cohort: 'f2_np_terminator', failureMode: 'PAIR: a negated CONTROL before the same preposition is ACTIVE', regime: 'osha-construction',
    text: 'There was no barrier against the open lift shaft on the fourth floor landing.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false } }),

  // ---- F3 token boundary, paired.
  D({ id: 'X-TB-01', cohort: 'f3_token_boundary', failureMode: 'issue inside issued', regime: 'osha-general-industry',
    text: 'The two operators ran the swage hammers all shift with no hearing protection issued to either of them.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'noise_exposure|personal_protective_equipment', clarificationExpected: false } }),
  D({ id: 'X-TB-02', cohort: 'f3_token_boundary', failureMode: 'PAIR: the same stem as a real negated hazard head', regime: 'osha-general-industry',
    text: 'The pre-start check of the swage bay recorded no issue with any of the hammers.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),

  // ---- F4 nominal corrections, with both guards.
  D({ id: 'X-NC-01', cohort: 'f4_nominal_control', failureMode: 'nominal correction as the object of an action verb', regime: 'osha-general-industry',
    text: 'The split extension lead was taken off the bench at the start of the shift and the electrician fetched a replacement from the stores.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, expectedStateHint: 'CORRECTED', clarificationExpected: false } }),
  D({ id: 'X-NC-02', cohort: 'f4_nominal_control', failureMode: 'GUARD: negated nominal correction', regime: 'osha-general-industry',
    text: 'The split extension lead is still plugged in at the bench and no replacement has been fetched from the stores.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-NC-03', cohort: 'f4_nominal_control', failureMode: 'GUARD: mention of a procedure corrects nothing', regime: 'osha-general-industry',
    text: 'The chargehand went over the lead replacement procedure with the crew and the split extension lead stayed plugged in at the bench.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical', highConsequence: true, clarificationExpected: false } }),

  // ---- F5/F6 control adequacy, from both ends, with effective-control counter-fixtures.
  D({ id: 'X-WC-01', cohort: 'f6_control_adequacy', failureMode: 'warning tape offered as the control', regime: 'osha-construction',
    text: 'The lift-shaft opening on the second floor has warning tape run across it and nothing else fitted over the opening.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-WC-02', cohort: 'f6_control_adequacy', failureMode: 'signage offered as the control', regime: 'osha-general-industry',
    text: 'A DANGER DEEP PIT notice is wired to the rail beside the open drainage sump in the packing hall gangway.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-WC-03', cohort: 'f6_control_adequacy', failureMode: 'briefing offered as the control', regime: 'osha-general-industry',
    text: 'The open drainage sump in the packing hall was mentioned at the shift handover and the packers were told to walk around it.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-WC-04', cohort: 'f6_control_adequacy', failureMode: 'COUNTER: genuinely effective engineering control', regime: 'osha-construction',
    text: 'The lift-shaft opening on the second floor is closed with a bolted steel plate rated for the slab loading.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  D({ id: 'X-WC-05', cohort: 'f6_control_adequacy', failureMode: 'COUNTER: effective control WITH a warning as well', regime: 'osha-general-industry',
    text: 'The drainage sump in the packing hall is covered by a secured chequer plate and warning tape is run around the cover as well.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  D({ id: 'X-WC-06', cohort: 'f5_morphological_absence', failureMode: 'absent control written with a negative prefix, reassuring clause first', regime: 'msha',
    text: 'The ventilation readings were all in limits at the face, and the miner was barring down from beneath an unsupported section of back.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'ground_control', highConsequence: true, clarificationExpected: false } }),
  D({ id: 'X-WC-07', cohort: 'f5_morphological_absence', failureMode: 'second morphological absence, reassuring clause first', regime: 'osha-general-industry',
    text: 'The machine guarding audit was signed off last month, and the operator was feeding stock past an unguarded saw blade with no push stick.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false } }),

  // ---- clarification, both poles, so the axis is watched while the prompt changes.
  D({ id: 'X-CL-01', cohort: 'required_clarification', failureMode: 'deciding fact could not be observed', regime: 'osha-construction',
    text: 'Two men were on the tower crane gantry and I could not see from the ground whether either of them was clipped on.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } }),
  D({ id: 'X-CL-02', cohort: 'd1_must_not_ask', failureMode: 'decided ACTIVE, no question owed', regime: 'osha-construction',
    text: 'Two men were on the tower crane gantry with their lanyards hanging loose and no anchor point rigged on the gantry rail.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls', highConsequence: true, clarificationExpected: false } }),
];

function main(): void {
  const prev = JSON.parse(readFileSync(join(EVAL, 'development-l32e.json'), 'utf8')) as { scenarios: Scenario[] };
  const scenarios: Scenario[] = [...prev.scenarios];

  // Carry forward the five named ids, verbatim, from the sets that opened them.
  for (const [id, file] of Object.entries(CARRY_FORWARD_IDS)) {
    const src = JSON.parse(readFileSync(join(EVAL, file), 'utf8')) as { scenarios: Scenario[] };
    const found = src.scenarios.find(s => s.id === id);
    if (!found) throw new Error(`carry-forward fixture ${id} not found in ${file}`);
    if (scenarios.some(s => s.id === id)) continue;
    scenarios.push({ ...found, source: `${file} (opened; DEVELOPMENT use only)`, provenanceClass: 'DEVELOPMENT' });
  }
  scenarios.push(...NEW_FIXTURES);

  // The development set may NEVER intersect the sealed set.
  const sealed = JSON.parse(readFileSync(join(EVAL, 'holdout-l32f.json'), 'utf8')) as { scenarios: Scenario[] };
  const sealedIds = new Set(sealed.scenarios.map(s => s.id));
  const sealedTexts = new Set(sealed.scenarios.map(s => s.text.trim()));
  const clash = scenarios.filter(s => sealedIds.has(s.id) || sealedTexts.has(s.text.trim())).map(s => s.id);
  const dupId = scenarios.map(s => s.id).filter((t, i, a) => a.indexOf(t) !== i);
  if (clash.length || dupId.length) {
    throw new Error(`development set collides with the SEALED L3-2f holdout -- ${JSON.stringify(clash)} dupId ${JSON.stringify(dupId)}`);
  }

  const body = JSON.stringify({
    setId: 'l3-2f-development-2026-08-23',
    role: 'DEVELOPMENT',
    note: 'TUNING ARTIFACT ONLY. L3-2e development set, plus the five fixtures the L3-2f entry contract names by id from OPENED holdouts, plus the F1..F6 paired fixtures. Never advancement evidence.',
    everySourceIsAnOpenedSet: true,
    disjointFromSealedL32fHoldout: { idClashes: 0, textClashes: 0, assertedWith: 'a throw at build time' },
    composition: {
      total: scenarios.length,
      carriedForward: Object.keys(CARRY_FORWARD_IDS),
      newFixtures: NEW_FIXTURES.length,
      clarificationExpected: scenarios.filter(s => s.expect.clarificationExpected === true).length,
      clarificationMustBeWithheld: scenarios.filter(s => s.expect.clarificationExpected === false).length,
    },
    scenarios,
  }, null, 2) + '\n';
  writeFileSync(OUT, body);
  console.log(JSON.stringify({
    out: OUT, sha256: createHash('sha256').update(body).digest('hex'),
    total: scenarios.length, newFixtures: NEW_FIXTURES.length,
    carriedForward: Object.keys(CARRY_FORWARD_IDS),
  }, null, 2));
}
main();
