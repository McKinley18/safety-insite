/**
 * L3-2c -- builds the FRESH SEALED HOLDOUT.
 *
 * The L3-2b holdout (`e3a3c7ee...`) has been opened and is retired for gate use; it survives only as
 * REGRESSION_EVIDENCE. This is its replacement.
 *
 * PROVENANCE, STATED HONESTLY. Two parts, and the weak one is named:
 *
 *  A. INDEPENDENT -- `safescope-field-validation-dataset.v1.json`, 200 field observations authored by
 *     a much earlier phase and never written for Level-3. L3-2b consumed every 5th by sorted id
 *     (indices 0,5,10,...). This phase takes a DIFFERENT deterministic stride over the 160 that
 *     remain: indices where `i % 5 === 2`. Mechanical, declared before execution, and provably
 *     disjoint from L3-2b's sample -- `i % 5 === 0` and `i % 5 === 2` cannot intersect.
 *
 *  B. AUTHORED COMPLEMENT -- 32 scenarios written by this phase. This is the weak part and is
 *     labelled as such in every report. It exists because source A is entirely positive hazards: it
 *     contains no negative control, no corrected or controlled state, no subjective wording and no
 *     clarification case, so without B the holdout could not test the three defects L3-2c repairs.
 *     Mitigations, unchanged from L3-2b and one addition:
 *       * written and frozen BEFORE the repair code was written, not merely before it was run;
 *       * every expected outcome declared here, never derived from a run;
 *       * no scenario reuses text from the L3-2, L3-2b or development sets (asserted below).
 *
 * The two parts are tagged by `provenanceClass` so results can be reported separately, which the
 * L3-2c entry contract requires.
 *
 * Run: npx ts-node scripts/build-l32c-holdout.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPO = join(__dirname, '..', '..');
const FIELD = join(REPO, 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const EVAL = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval');
const OUT = join(EVAL, 'holdout-l32c.json');

/** Unchanged from L3-2 and L3-2b so the high-consequence gate means the same thing across phases. */
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
  msha: 'msha',
  osha_general_industry: 'osha-general-industry',
  osha_construction: 'osha-construction',
};

interface Scenario {
  id: string; source: string; provenanceClass: 'INDEPENDENT' | 'AUTHORED_COMPLEMENT';
  cohort: string; failureMode: string; regime: string; text: string;
  expect: Record<string, unknown>;
}

const A = (o: Omit<Scenario, 'source' | 'provenanceClass'>): Scenario =>
  ({ ...o, source: 'authored by the L3-2c implementation phase', provenanceClass: 'AUTHORED_COMPLEMENT' });

// ---------------------------------------------------------------- B: authored complement
//
// PAIRING. Every case that a repair is meant to RESCUE sits next to the case that same repair must
// keep REJECTING. A rule widened until the false negative disappears is not a repair; the paired
// counter-case is what makes the difference measurable.

const COMPLEMENT: Scenario[] = [
  // --- explicit negative controls (6)
  A({ id: 'C-NC-01', cohort: 'negative_control', failureMode: 'compliant fall protection', regime: 'osha-construction',
    text: 'The roof edge on the east elevation is protected by a compliant guardrail with top rail, mid rail and toeboard, and the anchor points were proof loaded last month.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'C-NC-02', cohort: 'negative_control', failureMode: 'hazard itself negated', regime: 'osha-general-industry',
    text: 'A full survey of the packaging hall found no unguarded nip points, no exposed drive shafts and no defeated interlocks on any of the six lines.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'C-NC-03', cohort: 'negative_control', failureMode: 'paperwork only', regime: 'osha-general-industry',
    text: 'The respirator fit test records for the paint crew were scanned into the system and the medical clearance dates were confirmed with occupational health.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'C-NC-04', cohort: 'negative_control', failureMode: 'hazard vocabulary in a safe statement', regime: 'osha-construction',
    text: 'The trench box inventory was counted and the shoring calculations for the sanitary main were signed by the engineer before the dig starts next month.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  // THE LOOSENING TRAP. A positive impression sits beside a genuine control-in-place fact. If R1's
  // gate is widened by simply admitting any factual predication, this becomes a false ACTIVE.
  A({ id: 'C-NC-05', cohort: 'negative_control', failureMode: 'positive impression plus control-in-place fact', regime: 'osha-general-industry',
    text: 'The whole grinding bay looked right to me and the wheel guards are all fitted with the tool rests set within an eighth of an inch.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'C-NC-06', cohort: 'negative_control', failureMode: 'negated hazard across a bare conjunction', regime: 'osha-general-industry',
    text: 'The battery room was checked and no acid spillage was present and the eyewash discharged clear within the first second.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),

  // --- condition state (6)
  A({ id: 'C-CS-01', cohort: 'condition_state', failureMode: 'energy isolation in place', regime: 'osha-general-industry',
    text: 'The bagging line was shut down at the main disconnect, three personal locks were hung on the hasp and the residual air was bled down and verified at zero before the guard came off.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'C-CS-02', cohort: 'condition_state', failureMode: 'corrected on the spot, uncommon verb', regime: 'osha-general-industry',
    text: 'The frayed pendant cable on the jib crane was found during the walk and the millwright swapped it for a new one before the next lift.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'C-CS-03', cohort: 'condition_state', failureMode: 'removed from service', regime: 'osha-general-industry',
    text: 'The chain hoist with the stretched hook throat was tagged out and taken out of use pending replacement of the load chain.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'C-CS-04', cohort: 'condition_state', failureMode: 'historical and closed', regime: 'osha-general-industry',
    text: 'The mezzanine handrail was struck by a forklift last spring and was rebuilt to the original detail; this inspection found it sound and correctly fixed at every post.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'C-CS-05', cohort: 'condition_state', failureMode: 'hypothetical', regime: 'osha-general-industry',
    text: 'If the level probe on the caustic tank were to fail closed during a transfer, the vent could pressurise and lift the manway gasket.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'C-CS-06', cohort: 'condition_state', failureMode: 'controlled, hazard genuinely present', regime: 'osha-construction',
    text: 'The floor opening at grid C4 is covered with a secured plate marked HOLE and rated for the load, and the cover was screwed down at all four corners.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),

  // --- ambiguity and clarification (7): 3 expect a question, 4 must not be burdened with one
  A({ id: 'C-AM-01', cohort: 'ambiguity', failureMode: 'pure impression, perception predicate', regime: 'osha-general-industry',
    text: 'The way the pallet racking in aisle six was loaded did not sit right with me.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } }),
  A({ id: 'C-AM-02', cohort: 'ambiguity', failureMode: 'hedge governs the only fact', regime: 'osha-general-industry',
    text: 'The flexible conduit into the mixer junction box might be damaged where it passes the frame.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } }),
  A({ id: 'C-AM-03', cohort: 'ambiguity', failureMode: 'unidentified condition, decision-critical', regime: 'unknown',
    text: 'There is a smell of something sharp near the plating tanks and I could not work out which tank it was coming from.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } }),
  // R1's RECALL pole: impression alongside a hard fact whose predicate word is NOT in any list.
  A({ id: 'C-AM-04', cohort: 'ambiguity', failureMode: 'impression plus a hard fact, unlisted predicate', regime: 'osha-general-industry',
    text: 'The ladder cage on the silo did not look right to me and the third hoop has parted from the stringer with the fixings pulled clean through.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|ladders', highConsequence: true, clarificationExpected: false } }),
  A({ id: 'C-AM-05', cohort: 'ambiguity', failureMode: 'impression plus a hard fact, second unlisted predicate', regime: 'osha-construction',
    text: 'I was uneasy about the scaffold on the north face and the two lower braces have been unpinned and are swinging free of the standards.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'scaffolds|falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false } }),
  A({ id: 'C-AM-06', cohort: 'ambiguity', failureMode: 'uncertainty that changes no decision', regime: 'osha-general-industry',
    text: 'The tongue guard on the bench grinder is gone; I could not say whether maintenance removed it or it broke off.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false } }),
  A({ id: 'C-AM-07', cohort: 'ambiguity', failureMode: 'nothing said at all', regime: 'unknown',
    text: 'Walked the north yard before lunch.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),

  // --- negation and conjunction structure (7)
  // R2's RECALL pole: bare `and`, following segment carries its own finite verb -> new clause.
  A({ id: 'C-NG-01', cohort: 'negation', failureMode: 'bare and, following clause has a finite verb', regime: 'osha-general-industry',
    text: 'Crew was changing the knives on the granulator; no lockout is applied and the infeed guard is missing from the hopper throat.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|loto_stored_energy', minCandidates: 2, maxCandidates: 3, highConsequence: true, clarificationExpected: false } }),
  // R2's PRECISION pole: bare `and` continuing a negated list -- scope MUST cross it.
  A({ id: 'C-NG-02', cohort: 'negation', failureMode: 'negated list across a bare and', regime: 'osha-construction',
    text: 'A roofer was working four feet from the unprotected edge at thirty feet with no guardrail and no personal fall arrest and no warning line.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false } }),
  A({ id: 'C-NG-03', cohort: 'negation', failureMode: 'negated list across commas (RC-08 shape)', regime: 'osha-construction',
    text: 'Steel erectors were connecting at the second tier with no guardrail, safety net or personal fall arrest system in use.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|scaffolds', highConsequence: true, clarificationExpected: false } }),
  A({ id: 'C-NG-04', cohort: 'negation', failureMode: 'negation in clause one, hazard in clause two', regime: 'osha-general-industry',
    text: 'There was no oil on the walkway anywhere in the pump house, and the grating panel over the sump has lifted at one corner and rocks underfoot.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls', clarificationExpected: false } }),
  A({ id: 'C-NG-05', cohort: 'negation', failureMode: 'contrastive after a negation', regime: 'osha-general-industry',
    text: 'The extension ladder showed no split rails, however the shoes are worn smooth and it was set at close to eighty degrees on a painted floor.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|ladders', clarificationExpected: false } }),
  A({ id: 'C-NG-06', cohort: 'negation', failureMode: 'bare while after a negation (B08 shape)', regime: 'osha-construction',
    text: 'A fitter was grinding overhead without a face shield while an oxygen cylinder stood unsecured against the column behind him.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'personal_protective_equipment|compressed_gas_cylinders|chemical_storage', minCandidates: 2, maxCandidates: 3, clarificationExpected: false } }),
  A({ id: 'C-NG-07', cohort: 'negation', failureMode: 'negated hazard, not a negated control', regime: 'osha-general-industry',
    text: 'The annual survey of the finishing department recorded no exposure above the action level and no employee reported any symptoms.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),

  // --- evidence shape (6)
  A({ id: 'C-EV-01', cohort: 'evidence', failureMode: 'single sentence is the only evidence', regime: 'osha-general-industry',
    text: 'The interlock on the blender access door has been taped over so the paddle keeps turning with the door open.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false } }),
  A({ id: 'C-EV-02', cohort: 'evidence', failureMode: 'safe statement adjacent to a real hazard', regime: 'osha-general-industry',
    text: 'The spill kit beside the decanter was fully stocked and sealed, and the sight glass on the solvent day tank is cracked and weeping onto the bund floor.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'chemical_storage|hazard_communication', clarificationExpected: false } }),
  A({ id: 'C-EV-03', cohort: 'evidence', failureMode: 'multi hazard in one sentence', regime: 'osha-construction',
    text: 'A labourer was in a five foot trench in wet clay with no shoring, the spoil pile was heaped against the lip, and the only way out was a ladder lying flat on the bottom.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'trenching_shoring|excavation|ground_control', minCandidates: 2, maxCandidates: 4, highConsequence: true, clarificationExpected: false } }),
  A({ id: 'C-EV-04', cohort: 'evidence', failureMode: 'field shorthand, multi hazard', regime: 'msha',
    text: 'conveyor 7 walkway, guard off the tail pulley, handrail missing north side, lot of spill under the belt',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|walking_working_surfaces|falls', minCandidates: 2, maxCandidates: 4, clarificationExpected: false } }),
  A({ id: 'C-EV-05', cohort: 'evidence', failureMode: 'planned action only', regime: 'osha-general-industry',
    text: 'We plan to install a second emergency stop on the palletiser during the August shutdown.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'C-EV-06', cohort: 'evidence', failureMode: 'high consequence, confined space', regime: 'osha-general-industry',
    text: 'A cleaner climbed into the flour silo through the top hatch with the sweep auger still energised and nobody stationed at the opening.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'confined_space|machine_guarding|loto_stored_energy', highConsequence: true, clarificationExpected: false } }),
];

// ---------------------------------------------------------------- build

function main(): void {
  const fieldRaw = readFileSync(FIELD, 'utf8');
  const field = (JSON.parse(fieldRaw) as any[])
    .filter(s => s && typeof s.observationText === 'string')
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  // DIFFERENT deterministic stride over the 160 L3-2b left unused. `i % 5 === 0` (L3-2b) and
  // `i % 5 === 2` (here) are disjoint by construction, not by inspection.
  const sampled = field.filter((_, i) => i % 5 === 2);

  const scenarios: Scenario[] = [];
  for (const s of sampled) {
    const pattern = FAMILY_ALIAS[s.expectedHazardFamily] ?? s.expectedHazardFamily;
    scenarios.push({
      id: `C-FLD-${String(s.id).replace('FIELD-', '')}`,
      source: 'safescope-field-validation-dataset.v1.json (independent, never run against Level-3)',
      provenanceClass: 'INDEPENDENT',
      cohort: 'field_positive',
      failureMode: `${s.expectedHazardFamily} / ${s.expectedScenarioFamily ?? 'n/a'}`,
      regime: REGIME[s.jurisdiction] ?? 'unknown',
      text: s.observationText,
      expect: {
        hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: pattern,
        highConsequence: HIGH_CONSEQUENCE.some(k => pattern.includes(k)),
        clarificationExpected: false, sourceRiskBand: s.expectedRiskBand ?? null,
      },
    });
  }
  scenarios.push(...COMPLEMENT);

  // ---- overlap assertions. A holdout presented as fresh must be provably fresh.
  const priorTexts = new Set<string>();
  const priorIds = new Set<string>();
  for (const f of ['holdout-l32.json', 'holdout-l32b.json', 'development-l32.json']) {
    const prior = JSON.parse(readFileSync(join(EVAL, f), 'utf8')) as { scenarios: Array<{ id: string; text: string }> };
    for (const s of prior.scenarios) { priorTexts.add(s.text.trim()); priorIds.add(s.id); }
  }
  const textClash = scenarios.filter(s => priorTexts.has(s.text.trim())).map(s => s.id);
  const idClash = scenarios.filter(s => priorIds.has(s.id)).map(s => s.id);
  if (textClash.length || idClash.length) {
    throw new Error(`holdout is not fresh -- text clashes ${JSON.stringify(textClash)} id clashes ${JSON.stringify(idClash)}`);
  }

  const counts = scenarios.reduce<Record<string, number>>((a, s) => { a[s.cohort] = (a[s.cohort] || 0) + 1; return a; }, {});
  const byProvenance = scenarios.reduce<Record<string, number>>((a, s) => { a[s.provenanceClass] = (a[s.provenanceClass] || 0) + 1; return a; }, {});

  const holdout = {
    setId: 'l3-2c-sealed-holdout-2026-08-22',
    role: 'FINAL_SEALED_HOLDOUT',
    visibleDuringTuning: false,
    frozenBeforeFirstExecution: true,
    frozenBeforeRepairCodeWritten: true,
    supersedes: 'l3-2b-sealed-holdout-2026-08-22 (e3a3c7eee64703a27a8ac9c5da732f6919d8a35fb76859bfb30729c44f7f5060) -- opened, now REGRESSION_EVIDENCE only',
    sharesNoScenarioWith: ['holdout-l32.json', 'holdout-l32b.json', 'development-l32.json'],
    overlapCheck: { textClashes: 0, idClashes: 0, method: 'exact trimmed text and id comparison against all three prior sets, asserted at build time' },
    provenance: {
      A_independent: {
        artifact: 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json',
        sha256: createHash('sha256').update(fieldRaw).digest('hex'),
        authoredBy: 'an earlier programme phase; never executed against any Level-3 code',
        selection: 'deterministic -- indices where i % 5 === 2 over the id-sorted dataset',
        disjointFromL32b: 'L3-2b used i % 5 === 0; the two strides cannot intersect',
        count: sampled.length,
      },
      B_authoredComplement: {
        authoredBy: 'the L3-2c implementation phase',
        count: COMPLEMENT.length,
        why: 'source A is entirely positive hazards and contains no negative control, corrected or controlled state, subjective wording or clarification case',
        limitation: 'authored by the implementer -- the weakest provenance in this set. Mitigated: written and frozen BEFORE the repair code was written, expectations declared here rather than derived from a run, and no text reused from any prior set.',
      },
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
    },
    scenarios,
  };

  const body = JSON.stringify(holdout, null, 2) + '\n';
  writeFileSync(OUT, body);
  console.log(JSON.stringify({
    out: OUT, sha256: createHash('sha256').update(body).digest('hex'),
    composition: holdout.composition, overlapCheck: holdout.overlapCheck,
  }, null, 2));
}

main();
