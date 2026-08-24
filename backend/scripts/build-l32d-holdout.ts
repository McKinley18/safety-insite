/**
 * L3-2d -- builds the FOURTH FRESH SEALED HOLDOUT.
 *
 * The L3-2c holdout (`33c69b36...`) has been opened and is retired for gate use; it survives only as
 * REGRESSION_EVIDENCE, as do the L3-2 and L3-2b sets.
 *
 * PROVENANCE, STATED HONESTLY. Two parts, and the weak one is named.
 *
 *  A. INDEPENDENT -- `safescope-field-validation-dataset.v1.json`. L3-2b took `i % 5 === 0`, L3-2c
 *     took `i % 5 === 2`; this phase takes `i % 5 === 4`, the rule L3-2c's NEXT_ACTION.md named in
 *     advance. The three strides are disjoint by construction, not by inspection.
 *
 *     COVERAGE LIMITATION, RECORDED RATHER THAN DISCOVERED LATER. This dataset is periodic: sorted
 *     by id, family repeats with period 5, so EVERY stride-of-5 selection yields exactly two hazard
 *     families. `i % 5 === 4` yields electrical (20) and slip_trip_fall (20). That is not a
 *     weakness of this stride in particular -- no single-stride rule over this dataset can do
 *     better -- but it does mean the independent half tests two families, and it is why the authored
 *     complement carries the semantic breadth. Strides 1 and 3 (fall_protection, mobile_equipment)
 *     remain entirely unused and are available to a later phase.
 *
 *  B. AUTHORED COMPLEMENT -- written by this phase. This is the weak part and is labelled as such in
 *     every report. Source A is entirely positive hazards: no negative control, no corrected or
 *     controlled state, no subjective wording, no clarification case and no case where a
 *     clarification must be WITHHELD -- which is the whole subject of L3-2d. Mitigations:
 *       * written and frozen BEFORE the repair code was written, not merely before it was run;
 *       * every expected outcome declared here, never derived from a run;
 *       * no scenario reuses text from the L3-2, L3-2b, L3-2c or development sets (asserted below);
 *       * clarification labels are declared here and may not be redefined after execution.
 *
 * THE LABEL THAT MATTERS FOR THIS PHASE. `clarificationExpected` is a THREE-valued judgement, and
 * L3-2d is measured on all three:
 *    true   a decision-critical fact is missing and the correct conclusion cannot be reached safely
 *    false  the evidence already supports the semantic conclusion; a question here is noise
 * Every `false` scenario whose state is decided is a live test of D1, not filler.
 *
 * Run: npx ts-node scripts/build-l32d-holdout.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPO = join(__dirname, '..', '..');
const FIELD = join(REPO, 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const EVAL = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval');
const OUT = join(EVAL, 'holdout-l32d.json');

/** Unchanged since L3-2 so the high-consequence gate means the same thing across four phases. */
const HIGH_CONSEQUENCE = [
  'fall', 'trench', 'excavation', 'cave_in', 'loto', 'energy', 'confined',
  'electrical', 'struck_by', 'mobile_equipment', 'scaffold', 'hole', 'opening',
  'impalement', 'rebar', 'explosion', 'ground_control',
];

const NON_ACTIVE = ['CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED', 'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];

const FAMILY_ALIAS: Record<string, string> = {
  machine_guarding: 'machine_guarding',
  electrical: 'electrical',
  fall_protection: 'falls|scaffolds|walking_working_surfaces',
  hazcom: 'hazard_communication|chemical_storage',
  mobile_equipment: 'mobile_equipment',
  slip_trip_fall: 'walking_working_surfaces|falls',
};

const REGIME: Record<string, string> = {
  msha: 'msha', osha_general_industry: 'osha-general-industry', osha_construction: 'osha-construction',
};

interface Scenario {
  id: string; source: string; provenanceClass: 'INDEPENDENT' | 'AUTHORED_COMPLEMENT';
  cohort: string; failureMode: string; regime: string; text: string;
  expect: Record<string, unknown>;
}

const A = (o: Omit<Scenario, 'source' | 'provenanceClass'>): Scenario =>
  ({ ...o, source: 'authored by the L3-2d implementation phase', provenanceClass: 'AUTHORED_COMPLEMENT' });

// ---------------------------------------------------------------- B: authored complement

const COMPLEMENT: Scenario[] = [
  // ================= D2 CLASS: negation in one clause, a hard fact in another.
  // H-NG-02's SHAPE on entirely new text. If D2 were repaired by a lexical exception rather than by
  // the ladder, these would fail.
  A({ id: 'D-NG-01', cohort: 'negation_then_fact', failureMode: 'negated clause then hard electrical fact', regime: 'osha-general-industry',
    text: 'There was no water on the floor of the wash bay, and the supply cord to the pressure washer has its jacket cut back to bare copper where it leaves the plug.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical', highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-NG-02', cohort: 'negation_then_fact', failureMode: 'negated clause then hard fall fact', regime: 'osha-construction',
    text: 'No debris was found on the scaffold platform, and the guardrail along the open side has been taken off and left leaning against the frame.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|scaffolds|walking_working_surfaces', highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-NG-03', cohort: 'negation_then_fact', failureMode: 'contrastive however after a negation', regime: 'osha-general-industry',
    text: 'The conveyor showed no signs of belt slip, however the nip guard at the drive drum has been unbolted and is sitting on the walkway.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-NG-04', cohort: 'negation_then_fact', failureMode: 'negated clause then confined-space fact', regime: 'osha-general-industry',
    text: 'No flammable atmosphere was detected at the manway, and the fitter went inside the vessel with the agitator still on line and nobody at the opening.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'confined_space|machine_guarding|loto_stored_energy', highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-NG-05', cohort: 'negation_then_fact', failureMode: 'negated list then a hard fact', regime: 'osha-construction',
    text: 'The trench had no spoil at the edge and no water in the bottom, and the man inside was working at seven feet in sandy ground with no shoring or shield of any kind.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'trenching_shoring|excavation|ground_control', highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-NG-06', cohort: 'negation_then_fact', failureMode: 'negated HAZARD only -- must stay non-active', regime: 'osha-general-industry',
    text: 'The electrical survey of the packing hall found no damaged cords, no open enclosures and no bonding defects on any circuit tested.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true } }),

  // ================= D1 CLASS: the decision is made; a question here is noise.
  A({ id: 'D-CQ-01', cohort: 'decided_no_question', failureMode: 'ACTIVE on a hard fact, detail could be refined', regime: 'osha-general-industry',
    text: 'An operator was flame cutting inside the bund with no mechanical ventilation running in the space.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'ventilation|confined_space|chemical_storage|hazard_communication', clarificationExpected: false, decisionIsMade: true,
      whyNoQuestion: 'the missing control is stated; the gas mix or duration would refine risk, not change the semantic conclusion' } }),
  A({ id: 'D-CQ-02', cohort: 'decided_no_question', failureMode: 'ACTIVE, cause of the defect unknown but irrelevant', regime: 'osha-general-industry',
    text: 'The emergency stop mushroom on the wrapping line stays depressed and no longer latches out; nobody could say when it started.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, decisionIsMade: true,
      whyNoQuestion: 'when it started changes neither the hazard, the state, the family nor the consequence' } }),
  A({ id: 'D-CQ-03', cohort: 'decided_no_question', failureMode: 'HYPOTHETICAL, decided by its own wording', regime: 'osha-general-industry',
    text: 'Were the interlock on the mixer lid to be defeated during a jam clearance, an operator could reach the ribbon while it is turning.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, decisionIsMade: true,
      whyNoQuestion: 'the sentence is explicitly contingent; asking whether it happened invents a second observation' } }),
  A({ id: 'D-CQ-04', cohort: 'decided_no_question', failureMode: 'CONTROLLED, decided', regime: 'osha-general-industry',
    text: 'The acid transfer line is fitted with a double block and bleed and the bleed was witnessed open and clear before the hose was cracked.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, decisionIsMade: true,
      whyNoQuestion: 'the control is described as in place and verified' } }),
  A({ id: 'D-CQ-05', cohort: 'decided_no_question', failureMode: 'CORRECTED, decided', regime: 'osha-general-industry',
    text: 'The split hydraulic hose on the baler was found leaking and the fitter swapped it for a new assembly and pressure tested it before the line restarted.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, decisionIsMade: true,
      whyNoQuestion: 'the correction is stated and complete' } }),
  A({ id: 'D-CQ-06', cohort: 'decided_no_question', failureMode: 'impression beside a hard fact -- ACTIVE, no question', regime: 'osha-construction',
    text: 'The edge protection on level three did not sit right with me and the mid rail is missing along the whole of the north bay.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|scaffolds', highConsequence: true, clarificationExpected: false, decisionIsMade: true,
      whyNoQuestion: 'the fact decides it; the impression adds nothing to resolve' } }),
  A({ id: 'D-CQ-07', cohort: 'decided_no_question', failureMode: 'ACTIVE, quantity unstated but immaterial', regime: 'msha',
    text: 'Float coal dust has accumulated on the beltline structure along the tailpiece and the rock dust survey tag there is six weeks out of date.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'housekeeping|explosion|fire|chemical_storage|ventilation', highConsequence: true, clarificationExpected: false, decisionIsMade: true,
      whyNoQuestion: 'the depth of accumulation would refine risk, not change the conclusion' } }),
  A({ id: 'D-CQ-08', cohort: 'decided_no_question', failureMode: 'NEGATED, decided', regime: 'osha-general-industry',
    text: 'The guard survey of the saw bench recorded no exposed blade below the table and no gap at the riving knife.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true,
      whyNoQuestion: 'the hazard itself is reported absent' } }),

  // ================= REQUIRED CLARIFICATION: a decision-critical fact is genuinely missing.
  A({ id: 'D-CR-01', cohort: 'required_clarification', failureMode: 'pure impression, no fact', regime: 'osha-general-industry',
    text: 'Something about the way the gas bottles were stood in the cage bothered me as I went past.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, decisionIsMade: false,
      whyQuestion: 'no physical condition is stated at all; whether a hazard exists cannot be decided' } }),
  A({ id: 'D-CR-02', cohort: 'required_clarification', failureMode: 'hedge governs the only predication', regime: 'osha-general-industry',
    text: 'The earth strap on the tank filling point might be broken where it meets the clamp.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, decisionIsMade: false,
      whyQuestion: 'the only fact is hedged; the condition state turns entirely on whether it is broken' } }),
  A({ id: 'D-CR-03', cohort: 'required_clarification', failureMode: 'unidentified substance changes family and consequence', regime: 'unknown',
    text: 'A dark liquid was running from under the compressor skid and I could not identify it or find where it was coming from.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, decisionIsMade: false,
      whyQuestion: 'the identity of the liquid decides the hazard family and whether it is high-consequence' } }),
  A({ id: 'D-CR-04', cohort: 'required_clarification', failureMode: 'ambiguous whether a control exists at all', regime: 'osha-construction',
    text: 'Two men were on the roof near the edge; I was too far away to see whether they were tied off to anything.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, decisionIsMade: false,
      whyQuestion: 'whether fall protection was in use decides both the hazard and the condition state' } }),
  A({ id: 'D-CR-05', cohort: 'required_clarification', failureMode: 'reported second hand, unverified', regime: 'osha-general-industry',
    text: 'The shift supervisor mentioned that one of the racking uprights in the cold store may have been hit by a truck, but we did not get to that aisle.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, decisionIsMade: false,
      whyQuestion: 'nothing was observed; whether damage exists decides whether a hazard exists' } }),
  A({ id: 'D-CR-06', cohort: 'required_clarification', failureMode: 'state genuinely undecidable between two branches', regime: 'osha-general-industry',
    text: 'The lockout box on the press had a lock hanging on it but I could not tell whether the disconnect behind it was actually open.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, decisionIsMade: false,
      whyQuestion: 'the condition state is CONTROLLED or ACTIVE depending on one unobserved fact' } }),

  // ================= EXPLICIT NEGATIVE CONTROLS
  A({ id: 'D-NC-01', cohort: 'negative_control', failureMode: 'fully compliant electrical', regime: 'osha-general-industry',
    text: 'Every panel in the switch room was closed and latched, the covers were fitted on all the junction boxes and the arc flash labels were current.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true } }),
  A({ id: 'D-NC-02', cohort: 'negative_control', failureMode: 'clean walking surfaces', regime: 'osha-general-industry',
    text: 'The despatch aisles were swept, dry and clear to the marked lines, and the floor joint covers were all seated flush.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true } }),
  A({ id: 'D-NC-03', cohort: 'negative_control', failureMode: 'administrative activity only', regime: 'osha-general-industry',
    text: 'The lifting equipment register was reconciled against the kit in the store and the next thorough examination dates were entered in the planner.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true } }),
  A({ id: 'D-NC-04', cohort: 'negative_control', failureMode: 'hazard vocabulary in a safe statement', regime: 'osha-construction',
    text: 'The fall arrest harnesses were returned from inspection with new tags and were hung back on the rack in the site office.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true } }),
  A({ id: 'D-NC-05', cohort: 'negative_control', failureMode: 'positive impression beside a control-in-place fact', regime: 'osha-general-industry',
    text: 'The press shop looked well run to me and the light curtains were function tested at start of shift with the results recorded.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true } }),
  A({ id: 'D-NC-06', cohort: 'negative_control', failureMode: 'planned future action only', regime: 'osha-general-industry',
    text: 'We are going to fit a second isolator on the granulator feed during the Christmas shutdown.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, decisionIsMade: true } }),

  // ================= CONDITION STATE
  A({ id: 'D-CS-01', cohort: 'condition_state', failureMode: 'energy isolation in place', regime: 'osha-general-industry',
    text: 'The dryer fan was stopped at the local isolator, two personal locks were fitted and the shaft was proved dead before the inspection hatch came off.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-CS-02', cohort: 'condition_state', failureMode: 'removed from service', regime: 'osha-general-industry',
    text: 'The pallet truck with the seized brake was labelled do not use and wheeled into the workshop pending repair.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-CS-03', cohort: 'condition_state', failureMode: 'historical, already closed', regime: 'osha-general-industry',
    text: 'The stair nosing on the plant room steps came loose in the spring and was refitted with new fixings; it was checked again today and is solid.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-CS-04', cohort: 'condition_state', failureMode: 'controlled, hazard genuinely present', regime: 'osha-construction',
    text: 'The riser opening on level two is closed with a bolted steel plate stencilled HOLE and rated for the load, and all four bolts were in place.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, decisionIsMade: true } }),

  // ================= MULTI-HAZARD
  A({ id: 'D-MH-01', cohort: 'multi_hazard', failureMode: 'two independent hazards, one sentence', regime: 'osha-general-industry',
    text: 'The bench grinder tool rest is set a half inch off the wheel and the flexible lead feeding it has a taped repair midway along its length.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|electrical', minCandidates: 2, maxCandidates: 3, highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-MH-02', cohort: 'multi_hazard', failureMode: 'three cues, field shorthand', regime: 'msha',
    text: 'crusher deck: handrail off the east stair, spill built up under the screen, light out over the walkway',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls|housekeeping', minCandidates: 2, maxCandidates: 4, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-MH-03', cohort: 'multi_hazard', failureMode: 'PPE plus a struck-by hazard', regime: 'osha-construction',
    text: 'A banksman was standing inside the swing radius of the excavator counterweight with no high visibility vest on.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'mobile_equipment|personal_protective_equipment|struck_by', minCandidates: 1, maxCandidates: 3, highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-MH-04', cohort: 'multi_hazard', failureMode: 'safe statement adjacent to two real hazards', regime: 'osha-general-industry',
    text: 'The eyewash was flushed and tagged this week, the caustic drum next to it is open at the bung and the drip tray under it is full to the brim.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'chemical_storage|hazard_communication', minCandidates: 1, maxCandidates: 3, clarificationExpected: false, decisionIsMade: true } }),

  // ================= HIGH CONSEQUENCE, PLAIN WORDING
  A({ id: 'D-HC-01', cohort: 'high_consequence', failureMode: 'live electrical work', regime: 'osha-general-industry',
    text: 'An electrician was landing conductors in an energised four hundred and eighty volt panel wearing ordinary cotton coveralls and no face shield.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical|personal_protective_equipment', highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-HC-02', cohort: 'high_consequence', failureMode: 'unprotected leading edge', regime: 'osha-construction',
    text: 'A roofer was carrying sheets along an unprotected leading edge at twenty two feet with his lanyard clipped to his own harness ring.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
  A({ id: 'D-HC-03', cohort: 'high_consequence', failureMode: 'stored energy', regime: 'osha-general-industry',
    text: 'A fitter was breaking the flange on the accumulator line with the system still showing two hundred bar on the gauge.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'loto_stored_energy|machine_guarding', highConsequence: true, clarificationExpected: false, decisionIsMade: true } }),
];

// ---------------------------------------------------------------- build

function main(): void {
  const fieldRaw = readFileSync(FIELD, 'utf8');
  const field = (JSON.parse(fieldRaw) as any[])
    .filter(s => s && typeof s.observationText === 'string')
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  // The third deterministic stride. i%5===0 (L3-2b), i%5===2 (L3-2c) and i%5===4 (here) are
  // pairwise disjoint by construction.
  const sampled = field.filter((_, i) => i % 5 === 4);

  const scenarios: Scenario[] = [];
  for (const s of sampled) {
    const pattern = FAMILY_ALIAS[s.expectedHazardFamily] ?? s.expectedHazardFamily;
    scenarios.push({
      id: `D-FLD-${String(s.id).replace('FIELD-', '')}`,
      source: 'safescope-field-validation-dataset.v1.json (independent, never run against Level-3)',
      provenanceClass: 'INDEPENDENT',
      cohort: 'field_positive',
      failureMode: `${s.expectedHazardFamily} / ${s.expectedScenarioFamily ?? 'n/a'}`,
      regime: REGIME[s.jurisdiction] ?? 'unknown',
      text: s.observationText,
      expect: {
        hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: pattern,
        highConsequence: HIGH_CONSEQUENCE.some(k => pattern.includes(k)),
        clarificationExpected: false, decisionIsMade: true,
        sourceRiskBand: s.expectedRiskBand ?? null,
      },
    });
  }
  scenarios.push(...COMPLEMENT);

  // ---- freshness, enforced rather than claimed.
  const priorTexts = new Set<string>(); const priorIds = new Set<string>();
  for (const f of ['holdout-l32.json', 'holdout-l32b.json', 'holdout-l32c.json', 'development-l32.json']) {
    const prior = JSON.parse(readFileSync(join(EVAL, f), 'utf8')) as { scenarios: Array<{ id: string; text: string }> };
    for (const s of prior.scenarios) { priorTexts.add(s.text.trim()); priorIds.add(s.id); }
  }
  const textClash = scenarios.filter(s => priorTexts.has(s.text.trim())).map(s => s.id);
  const idClash = scenarios.filter(s => priorIds.has(s.id)).map(s => s.id);
  if (textClash.length || idClash.length) {
    throw new Error(`holdout is not fresh -- text ${JSON.stringify(textClash)} id ${JSON.stringify(idClash)}`);
  }
  const selfDup = scenarios.map(s => s.text.trim()).filter((t, i, a) => a.indexOf(t) !== i);
  if (selfDup.length) throw new Error(`duplicate text within the set: ${JSON.stringify(selfDup)}`);

  const counts = scenarios.reduce<Record<string, number>>((a, s) => { a[s.cohort] = (a[s.cohort] || 0) + 1; return a; }, {});
  const byProvenance = scenarios.reduce<Record<string, number>>((a, s) => { a[s.provenanceClass] = (a[s.provenanceClass] || 0) + 1; return a; }, {});
  const familyMix = sampled.reduce<Record<string, number>>((a, s) => { a[s.expectedHazardFamily] = (a[s.expectedHazardFamily] || 0) + 1; return a; }, {});

  const holdout = {
    setId: 'l3-2d-sealed-holdout-2026-08-22',
    role: 'FINAL_SEALED_HOLDOUT',
    visibleDuringTuning: false,
    frozenBeforeFirstExecution: true,
    frozenBeforeRepairCodeWritten: true,
    supersedes: 'l3-2c-sealed-holdout-2026-08-22 (33c69b36a7efd9ed4e2e79d2f1b1b29472e7bc6a85dd4feefc5bcef5608f56e2) -- opened, now REGRESSION_EVIDENCE only',
    sharesNoScenarioWith: ['holdout-l32.json', 'holdout-l32b.json', 'holdout-l32c.json', 'development-l32.json'],
    overlapCheck: { textClashes: 0, idClashes: 0, internalDuplicates: 0, method: 'exact trimmed text and id comparison against all four prior sets, asserted at build time with a throw' },
    provenance: {
      A_independent: {
        artifact: 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json',
        sha256: createHash('sha256').update(fieldRaw).digest('hex'),
        authoredBy: 'an earlier programme phase; never executed against any Level-3 code',
        selection: 'deterministic -- indices where i % 5 === 4 over the id-sorted dataset',
        disjointFromPriorStrides: 'L3-2b used i % 5 === 0 and L3-2c used i % 5 === 2; the three strides are pairwise disjoint by construction',
        count: sampled.length,
        familyMix,
        coverageLimitation: 'this dataset is periodic with period 5, so EVERY stride-of-5 selection yields exactly two hazard families. No single-stride rule over this source can do better. Strides 1 and 3 (fall_protection, mobile_equipment) remain entirely unused.',
      },
      B_authoredComplement: {
        authoredBy: 'the L3-2d implementation phase',
        count: COMPLEMENT.length,
        why: 'source A is entirely positive hazards and contains no negative control, corrected or controlled state, subjective wording, clarification case, or case where a clarification must be WITHHELD -- which is the whole subject of L3-2d',
        limitation: 'authored by the implementer -- the weakest provenance in this set, and the third phase running to carry it. Mitigated: written and frozen BEFORE the repair code was written, expectations and clarification labels declared here rather than derived from a run, and no text reused from any prior set.',
      },
    },
    clarificationLabelContract: {
      declaredBefore: 'first candidate execution',
      mayNotBeRedefinedAfterExecution: true,
      true_means: 'a decision-critical fact is missing and the correct semantic conclusion cannot be reached safely without it',
      false_means: 'the evidence already supports the semantic conclusion; a question would only add optional detail and is noise',
      decisionIsMade: 'recorded per scenario so D1 can be measured directly: a scenario with decisionIsMade true must carry NO clarification',
    },
    highConsequenceFamilies: HIGH_CONSEQUENCE,
    composition: {
      total: scenarios.length,
      byProvenance,
      byCohort: counts,
      positives: scenarios.filter(s => s.expect.hazardEstablished === true).length,
      negativesOrNonActive: scenarios.filter(s => s.expect.hazardEstablished !== true).length,
      explicitNegativeControls: scenarios.filter(s => s.expect.negativeControl === true).length,
      clarificationExpected: scenarios.filter(s => s.expect.clarificationExpected === true).length,
      clarificationMustBeWithheld: scenarios.filter(s => s.expect.clarificationExpected === false).length,
      highConsequence: scenarios.filter(s => s.expect.highConsequence === true).length,
    },
    scenarios,
  };

  const body = JSON.stringify(holdout, null, 2) + '\n';
  writeFileSync(OUT, body);
  console.log(JSON.stringify({
    out: OUT, sha256: createHash('sha256').update(body).digest('hex'),
    composition: holdout.composition, overlapCheck: holdout.overlapCheck, familyMix,
  }, null, 2));
}

main();
