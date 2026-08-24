/**
 * L3-2b -- builds the FRESH SEALED HOLDOUT.
 *
 * The L3-2 holdout has been opened and is retired for gate use. This is its replacement, and it
 * shares no scenario with it.
 *
 * PROVENANCE, STATED HONESTLY. Three sources, two of them genuinely independent of this phase:
 *
 *  A. `safescope-field-validation-dataset.v1.json` -- 200 field observations with expected hazard
 *     family, jurisdiction, equipment, task and risk band, authored by a much earlier phase and
 *     NEVER run against any Level-3 code. Sampled DETERMINISTICALLY (every 5th by sorted id) so the
 *     selection cannot be cherry-picked toward scenarios the implementation handles well.
 *
 *  B. `diag-mine-routing.json` + `diag-overfit.json` -- 12 diagnostics authored and frozen by the
 *     capability-acceptance phase, also never run against Level-3. They carry paraphrase pairs
 *     (verbatim fixture vs natural rewording) which are the sharpest available generalization probe.
 *
 *  C. A complement authored by THIS phase for the classes A and B do not contain at all: A is
 *     entirely positive hazards (no negative control, no corrected state, no subjective wording,
 *     no clarification case). This is the honest weak point of the set and is recorded as such --
 *     but it is written and frozen BEFORE the first execution, and no model output on any of these
 *     scenarios was inspected while writing them.
 *
 * Expected outcomes for A are the dataset's own; for B they follow the diagnostics' stated intent;
 * for C they are declared here. All are fixed before the run.
 *
 * Run: npx ts-node scripts/build-l32b-holdout.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPO = join(__dirname, '..', '..');
const FIELD = join(REPO, 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const DIAG_MINE = join(REPO, 'verification/hazlenz-capability-acceptance-2026-08-22/contracts/diag-mine-routing.json');
const DIAG_OVERFIT = join(REPO, 'verification/hazlenz-capability-acceptance-2026-08-22/contracts/diag-overfit.json');
const OUT = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval/holdout-l32b.json');

/** Same list L3-2 declared, reused unchanged so the gate means the same thing across phases. */
const HIGH_CONSEQUENCE = [
  'fall', 'trench', 'excavation', 'cave_in', 'loto', 'energy', 'confined',
  'electrical', 'struck_by', 'mobile_equipment', 'scaffold', 'hole', 'opening',
  'impalement', 'rebar', 'explosion', 'ground_control',
];

const NON_ACTIVE = ['CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED', 'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];

/** The field dataset's family vocabulary is older than the Level-3 taxonomy. Fixed alias table. */
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
  id: string; source: string; cohort: string; failureMode: string; regime: string; text: string;
  expect: Record<string, unknown>;
}

// ---------------------------------------------------------------- C: authored complement

const COMPLEMENT: Scenario[] = [
  // --- explicit negative controls
  { id: 'H-NC-01', source: 'authored', cohort: 'negative_control', failureMode: 'fully compliant guarding', regime: 'osha-general-industry',
    text: 'Every point of operation on the punch press line is enclosed by a fixed barrier guard, the interlocks were function tested at the start of shift, and the test log was signed.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-NC-02', source: 'authored', cohort: 'negative_control', failureMode: 'clean housekeeping', regime: 'osha-general-industry',
    text: 'All travel aisles on the mezzanine were clear, striped and free of stored stock, and the floor was dry throughout.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-NC-03', source: 'authored', cohort: 'negative_control', failureMode: 'administrative activity only', regime: 'osha-general-industry',
    text: 'The contractor orientation records for the shutdown crew were filed and the emergency contact board was updated with the new numbers.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-NC-04', source: 'authored', cohort: 'negative_control', failureMode: 'hazard explicitly absent', regime: 'osha-construction',
    text: 'The excavation was inspected before entry and the competent person recorded no spoil within two feet of the edge and no water accumulation in the bottom.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-NC-05', source: 'authored', cohort: 'negative_control', failureMode: 'unrelated nearby hazard language', regime: 'osha-general-industry',
    text: 'The fall protection rescue plan and the confined space permit templates were both reprinted and placed in the supervisor binder.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },

  // --- controlled / corrected / removed / historical
  { id: 'H-CS-01', source: 'authored', cohort: 'condition_state', failureMode: 'energy isolation in place', regime: 'osha-general-industry',
    text: 'The chipper infeed was de-energized at the disconnect, both millwrights hung personal locks, and the stored spring tension was released and verified before the housing came off.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-CS-02', source: 'authored', cohort: 'condition_state', failureMode: 'corrected during the walk', regime: 'osha-general-industry',
    text: 'A shop-made extension lead with a taped joint was found at the weld bay and the electrician cut it out of service and issued a factory assembled lead before we left the area.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-CS-03', source: 'authored', cohort: 'condition_state', failureMode: 'removed from service', regime: 'osha-general-industry',
    text: 'The scissor lift was red tagged and taken out of service after the pothole protection failed to deploy during the function check.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-CS-04', source: 'authored', cohort: 'condition_state', failureMode: 'historical, already closed', regime: 'osha-general-industry',
    text: 'Two winters ago the dust collector ducting cracked and was rebuilt; the current inspection found the ducting sound and the joints tight.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-CS-05', source: 'authored', cohort: 'condition_state', failureMode: 'hypothetical', regime: 'osha-general-industry',
    text: 'If the interlock on the mixer lid were bypassed during a jam clearance, an operator could reach the ribbon while it is turning.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-CS-06', source: 'authored', cohort: 'condition_state', failureMode: 'controlled with a residual', regime: 'osha-construction',
    text: 'The leading edge is protected by a cabled guardrail on all four sides and the crew is tied off to an engineered anchor while they work inside it.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },

  // --- subjective ambiguity and clarification
  { id: 'H-AM-01', source: 'authored', cohort: 'ambiguity', failureMode: 'subjective impression only', regime: 'osha-general-industry',
    text: 'The overhead door track struck me as odd when I walked underneath it.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } },
  { id: 'H-AM-02', source: 'authored', cohort: 'ambiguity', failureMode: 'hedged fact', regime: 'osha-general-industry',
    text: 'One of the sling legs on the spreader bar may be cut.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } },
  { id: 'H-AM-03', source: 'authored', cohort: 'ambiguity', failureMode: 'unidentified substance', regime: 'unknown',
    text: 'There was a puddle of something under the parts washer and I could not tell what it was or where it came from.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } },
  { id: 'H-AM-04', source: 'authored', cohort: 'ambiguity', failureMode: 'too little said', regime: 'unknown',
    text: 'Walked the yard.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-AM-05', source: 'authored', cohort: 'ambiguity', failureMode: 'impression plus a hard fact', regime: 'osha-general-industry',
    text: 'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls|machine_guarding', highConsequence: true, clarificationExpected: false } },
  { id: 'H-AM-06', source: 'authored', cohort: 'ambiguity', failureMode: 'uncertainty that changes no decision', regime: 'osha-general-industry',
    text: 'The guard on the drill press is missing; I am not certain whether it was taken off this morning or last week.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false } },

  // --- negation and clause structure
  { id: 'H-NG-01', source: 'authored', cohort: 'negation', failureMode: 'negated list across commas', regime: 'osha-construction',
    text: 'Two carpenters were framing the parapet at twenty six feet with no guardrail, no personal fall arrest and no safety monitor assigned.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|scaffolds', highConsequence: true, clarificationExpected: false } },
  { id: 'H-NG-02', source: 'authored', cohort: 'negation', failureMode: 'negation in one clause, hazard in another', regime: 'osha-general-industry',
    text: 'There was no standing water anywhere on the shop floor, and the flexible cord feeding the pedestal fan has its outer jacket worn through to the conductors.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical', highConsequence: true, clarificationExpected: false } },
  { id: 'H-NG-03', source: 'authored', cohort: 'negation', failureMode: 'contrastive clause', regime: 'osha-general-industry',
    text: 'The rack uprights showed no impact damage, however the top beam clip on bay nine has popped out of its slot and the beam is resting on one connector.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'material_handling|walking_working_surfaces', clarificationExpected: false } },
  { id: 'H-NG-04', source: 'authored', cohort: 'negation', failureMode: 'negated hazard, not negated control', regime: 'osha-general-industry',
    text: 'The guarding survey of the wrapping line found no exposed nip points and no reachable rotating shafts anywhere on the machine.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-NG-05', source: 'authored', cohort: 'negation', failureMode: 'subordinate clause after negation', regime: 'osha-general-industry',
    text: 'The mixer was running without its lid clamp engaged while a second operator leaned across the opening to scrape the wall of the bowl.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', highConsequence: true, clarificationExpected: false } },

  // --- evidence shape
  { id: 'H-EV-01', source: 'authored', cohort: 'evidence', failureMode: 'action language only', regime: 'osha-general-industry',
    text: 'We are going to add a second eyewash station near the plating line during the next shutdown.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } },
  { id: 'H-EV-02', source: 'authored', cohort: 'evidence', failureMode: 'whole sentence is the only evidence', regime: 'osha-general-industry',
    text: 'The bottom guard on the compound mitre saw does not return over the blade when the arm is raised.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false } },
  { id: 'H-EV-03', source: 'authored', cohort: 'evidence', failureMode: 'contamination by an adjacent safe statement', regime: 'osha-general-industry',
    text: 'The eyewash station was flushed and tagged this week, and the sulphuric acid carboy beside it is stored uncapped on an open shelf above head height.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'chemical_storage|hazard_communication', clarificationExpected: false } },
  { id: 'H-EV-04', source: 'authored', cohort: 'evidence', failureMode: 'multi hazard, one sentence', regime: 'osha-construction',
    text: 'A labourer was cutting rebar at the slab edge with no eye protection, the uncapped rebar behind him was at waist height, and the edge itself had no guardrail at a twelve foot drop.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'personal_protective_equipment|falls|walking_working_surfaces', minCandidates: 2, maxCandidates: 4, highConsequence: true, clarificationExpected: false } },
  { id: 'H-EV-05', source: 'authored', cohort: 'evidence', failureMode: 'field shorthand, multi hazard', regime: 'msha',
    text: 'plant 2 walkway, handrail off on the north run, cable tray sagging into head height, housekeeping bad around the crusher deck',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls', minCandidates: 2, maxCandidates: 4, clarificationExpected: false } },
  { id: 'H-EV-06', source: 'authored', cohort: 'evidence', failureMode: 'high consequence, plain wording', regime: 'osha-construction',
    text: 'An employee was working at the bottom of a nine foot vertical trench in run of bank sand with no shoring, no shield and no sloping cut back.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'trenching_shoring|ground_control', highConsequence: true, clarificationExpected: false } },
  { id: 'H-EV-07', source: 'authored', cohort: 'evidence', failureMode: 'high consequence, confined space', regime: 'osha-general-industry',
    text: 'A worker entered the digester through the side manway to hose it out with no atmospheric test taken and no attendant posted at the opening.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'confined_space', highConsequence: true, clarificationExpected: false } },
];

// ---------------------------------------------------------------- build

function main(): void {
  const fieldRaw = readFileSync(FIELD, 'utf8');
  const mineRaw = readFileSync(DIAG_MINE, 'utf8');
  const overfitRaw = readFileSync(DIAG_OVERFIT, 'utf8');

  const field = Object.values(JSON.parse(fieldRaw) as Record<string, any>)
    .filter(s => s && typeof s.observationText === 'string')
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  // Deterministic every-5th sample. Mechanical selection, so it cannot be steered.
  const sampled = field.filter((_, i) => i % 5 === 0);

  const scenarios: Scenario[] = [];

  for (const s of sampled) {
    const pattern = FAMILY_ALIAS[s.expectedHazardFamily] ?? s.expectedHazardFamily;
    scenarios.push({
      id: `H-FLD-${String(s.id).replace('FIELD-', '')}`,
      source: 'safescope-field-validation-dataset.v1.json (independent, never run against Level-3)',
      cohort: 'field_positive',
      failureMode: `${s.expectedHazardFamily} / ${s.expectedScenarioFamily ?? 'n/a'}`,
      regime: REGIME[s.jurisdiction] ?? 'unknown',
      text: s.observationText,
      expect: {
        hazardEstablished: true,
        conditionState: 'ACTIVE',
        familyPattern: pattern,
        highConsequence: HIGH_CONSEQUENCE.some(k => pattern.includes(k)),
        clarificationExpected: false,
        sourceRiskBand: s.expectedRiskBand ?? null,
      },
    });
  }

  const diagPositive = new Set(['DX1', 'DX2', 'DX3', 'DX4', 'DX5', 'OF1', 'OF2', 'OF3', 'OF4', 'OF5']);
  for (const [raw, label] of [[mineRaw, 'diag-mine-routing.json'], [overfitRaw, 'diag-overfit.json']] as const) {
    for (const s of (JSON.parse(raw) as any).scenarios) {
      const positive = diagPositive.has(s.id);
      const pattern = /conveyor|pulley|guard/i.test(s.text) ? 'machine_guarding'
        : /press|energy|lock/i.test(s.text) ? 'loto_stored_energy'
        : 'mobile_equipment';
      scenarios.push({
        id: `H-${s.id}`,
        source: `${label} (independent, never run against Level-3)`,
        cohort: positive ? 'diagnostic_positive' : 'diagnostic_safe',
        failureMode: s.title.trim(),
        regime: s.regime,
        text: s.text,
        expect: positive
          ? { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: pattern,
              highConsequence: HIGH_CONSEQUENCE.some(k => pattern.includes(k)), clarificationExpected: false }
          : { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false },
      });
    }
  }

  scenarios.push(...COMPLEMENT);

  const counts = scenarios.reduce<Record<string, number>>((acc, s) => {
    acc[s.cohort] = (acc[s.cohort] || 0) + 1; return acc;
  }, {});
  const positives = scenarios.filter(s => s.expect.hazardEstablished === true).length;
  const clarifications = scenarios.filter(s => s.expect.clarificationExpected === true).length;

  const holdout = {
    setId: 'l3-2b-sealed-holdout-2026-08-22',
    role: 'FINAL_SEALED_HOLDOUT',
    visibleDuringTuning: false,
    frozenBeforeFirstExecution: true,
    supersedes: 'l3-2-holdout-2026-08-22 (sha256 41ae3c22…) — opened during L3-2, retired for gate use',
    sharesNoScenarioWith: 'hazlenz-acceptance-matrix.json (the L3-2 holdout source)',
    provenance: {
      A_fieldDataset: {
        artifact: 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json',
        sha256: createHash('sha256').update(fieldRaw).digest('hex'),
        authoredBy: 'an earlier programme phase; never executed against any Level-3 code',
        selection: 'deterministic — every 5th scenario by sorted id',
        count: sampled.length,
      },
      B_diagnostics: {
        artifacts: ['diag-mine-routing.json', 'diag-overfit.json'],
        sha256: {
          'diag-mine-routing.json': createHash('sha256').update(mineRaw).digest('hex'),
          'diag-overfit.json': createHash('sha256').update(overfitRaw).digest('hex'),
        },
        authoredBy: 'the capability-acceptance phase; frozen before that phase executed; never run against Level-3',
        count: 12,
      },
      C_complement: {
        authoredBy: 'the L3-2b implementation phase',
        count: COMPLEMENT.length,
        why: 'sources A and B contain no negative control, no corrected or controlled state, no subjective wording '
          + 'and no clarification case; without C the holdout could not test the very defects this phase repaired',
        limitation: 'authored by the implementer. Mitigations: written and frozen BEFORE the first execution, '
          + 'no model output on these scenarios was inspected while writing them, and every expected outcome is '
          + 'declared in this generator rather than derived from a run.',
      },
    },
    highConsequenceFamilies: HIGH_CONSEQUENCE,
    composition: { total: scenarios.length, byCohort: counts, positives, negativesOrNonActive: scenarios.length - positives, clarificationExpected: clarifications },
    scenarios,
  };

  const serialized = JSON.stringify(holdout, null, 2) + '\n';
  writeFileSync(OUT, serialized);
  process.stdout.write(`scenarios            : ${scenarios.length}\n`);
  process.stdout.write(`composition          : ${JSON.stringify(counts)}\n`);
  process.stdout.write(`positive / non-active: ${positives} / ${scenarios.length - positives}\n`);
  process.stdout.write(`clarification cases  : ${clarifications}\n`);
  process.stdout.write(`holdout sha256       : ${createHash('sha256').update(serialized).digest('hex')}\n`);
}

main();
