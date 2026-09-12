/**
 * §126 -- measure the MAXIMUM composition achievable from every authorized source, to decide
 * whether opening the reserved gauntlet offsets can actually produce a valid 60-row cohort.
 *
 * WHY THIS RUNS BEFORE ANY OPENING. Opening a reserved partition is irreversible and open-once. If
 * a binding composition requirement cannot be met even AFTER opening, then opening would spend
 * irreplaceable evaluation material for a cohort that still could not be frozen. This script
 * establishes that question from LABEL METADATA ONLY, exactly as §124 did: it reads field NAMES and
 * label arrays, and never reads an observation from a RESERVED partition.
 *
 * It authors nothing, selects nothing, and freezes nothing.
 */

import * as fs from 'fs';
import * as path from 'path';
import { EXPERT_INTERACTION_KINDS } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { REQUIRED_CLASS_MINIMUMS, PREFERRED_ROWS } from
  '../src/safescope-v2/expert-hazlenz/expert-cohort-composition';
import { toExpertFamily } from '../src/safescope-v2/expert-hazlenz/expert-deterministic-projection';
import { ACCEPTED_EXPERT_TAXONOMY } from './lib/expert-cohort-supplemental-policy';
import { POPULATION_A, POPULATION_B } from '../src/safescope-v2/tests/hazlenz-decomposition-precision-corpus';
import { AUGMENTATION_ROWS } from '../src/safescope-v2/expert-hazlenz/fixtures/negative-control-augmentation-v1';

const ROOT = path.resolve(__dirname, '..', '..');

/** Which closed interaction kinds a pair of present families can legitimately form. */
function recognisedInteraction(families: string[]): string | null {
  const f = new Set(families);
  const pair = (a: string, b: string) => f.has(a) && f.has(b);
  if (pair('electrical', 'confined_space')) return 'ELECTRICAL_WET_ENVIRONMENT';
  if (pair('confined_space', 'chemical_exposure')) return 'CONFINED_SPACE_ATMOSPHERIC';
  if (pair('lockout_tagout', 'machine_guarding')) return 'LOTO_STORED_ENERGY';
  if (pair('chemical_exposure', 'fall_protection')) return 'CHEMICAL_PPE_VENTILATION';
  if (pair('mobile_equipment', 'fall_protection')) return 'MOBILE_EQUIPMENT_PEDESTRIAN';
  if (pair('fall_protection', 'lockout_tagout')) return 'FALL_EXPOSURE_ANCHORAGE';
  return null;
}

interface Classified {
  scenarioId: string; eligible: boolean; primary: string | null; secondaries: string[];
  forbiddenFromUnacceptable: string[]; severityExpectation?: string;
}

function main(): void {
  const supply: Record<string, number> = {};
  const add = (cls: string, n: number) => { supply[cls] = (supply[cls] ?? 0) + n; };
  const notes: string[] = [];

  // ---------------------------------------------------------------- 1. gauntlet.seed (OPENED §122)
  const classified: Classified[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json'),
  'utf8'));
  const seed = classified.filter(r => r.eligible);
  const seedForbidden = seed.filter(r => {
    const present = [r.primary!, ...r.secondaries];
    return r.forbiddenFromUnacceptable.filter(f => !present.includes(f)).length > 0;
  });
  add('FORBIDDEN_FAMILY_NEGATIVE_CONTROL', seedForbidden.length);
  add('DETERMINISTIC_HAZARD_PRESENT', seed.length);
  add('MULTI_HAZARD', seed.filter(r => r.secondaries.length > 0).length);
  add('LIFE_CRITICAL_PRESENT', seed.filter(r => r.severityExpectation === 'critical').length);
  notes.push(`gauntlet.seed  OPENED  eligible ${seed.length}  forbidden-truth ${seedForbidden.length}`
    + '  gaps 0  interactions 0  (no gap/interaction label exists in this corpus)');

  // ---------------------------------------------------------------- 2. Population A / B (open)
  const popAForbidden = POPULATION_A.filter(r =>
    r.forbiddenDomains.some(d => ACCEPTED_EXPERT_TAXONOMY.includes(toExpertFamily(d) ?? d)));
  const popANoRequired = POPULATION_A.filter(r => r.requiredDomains.length === 0);
  add('FORBIDDEN_FAMILY_NEGATIVE_CONTROL', popAForbidden.length);
  add('CLARIFICATION_NOT_OWED', popANoRequired.length);
  add('NEGATED_OR_SAFE_STATE', popANoRequired.length);

  const popBMulti = POPULATION_B.filter(r => r.required.length >= 2);
  const popBLife = POPULATION_B.filter(r => r.required.some(g => g.lifeCritical));
  const popBInteraction = popBMulti.filter(r => {
    const fams = r.required.flatMap(g => g.domains)
      .map(d => toExpertFamily(d) ?? d)
      .filter(f => ACCEPTED_EXPERT_TAXONOMY.includes(f));
    const kind = recognisedInteraction(fams);
    return kind !== null && (EXPERT_INTERACTION_KINDS as readonly string[]).includes(kind);
  });
  add('MULTI_HAZARD', popBMulti.length);
  add('LIFE_CRITICAL_PRESENT', popBLife.length);
  add('CROSS_HAZARD_INTERACTION', popBInteraction.length);
  add('DETERMINISTIC_HAZARD_PRESENT', POPULATION_B.length);
  notes.push(`Population A  OPEN  rows ${POPULATION_A.length}  forbidden ${popAForbidden.length}`
    + `  zero-required ${popANoRequired.length}  gaps 0`);
  notes.push(`Population B  OPEN  rows ${POPULATION_B.length}  multi ${popBMulti.length}`
    + `  life-critical ${popBLife.length}  recognised-interaction ${popBInteraction.length}  gaps 0`);

  // ---------------------------------------------------------------- 3. augmentation V2 (reviewed)
  const aug = AUGMENTATION_ROWS.map(a => a.row);
  const augForbidden = aug.filter(r => r.truth.forbiddenHazardFamilies.length > 0);
  const augGaps = aug.filter(r => r.truth.decisionCriticalGaps.length > 0);
  const augInter = aug.filter(r => r.truth.recordedInteractions.length > 0);
  add('FORBIDDEN_FAMILY_NEGATIVE_CONTROL', augForbidden.length);
  add('CLARIFICATION_OWED', augGaps.length);
  add('CROSS_HAZARD_INTERACTION', augInter.length);
  add('CLARIFICATION_NOT_OWED', aug.length - augGaps.length);
  add('NEGATED_OR_SAFE_STATE', aug.filter(r => r.truth.negatedOrSafeStateFamilies.length > 0).length);
  add('LIFE_CRITICAL_PRESENT', aug.filter(r => r.truth.lifeCriticalHazardFamilies.length > 0).length);
  add('MULTI_HAZARD', aug.filter(r => r.truth.presentHazardFamilies.length >= 2).length);
  add('DETERMINISTIC_HAZARD_PRESENT', aug.filter(r => r.truth.presentHazardFamilies.length > 0).length);
  notes.push(`augmentation V2  REVIEWED  rows ${aug.length}  forbidden ${augForbidden.length}`
    + `  gaps ${augGaps.length}  interactions ${augInter.length}`);

  // ------------------------------------------- 4. RESERVED offsets 2+3, LABEL METADATA ONLY
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'safescope-data', 'gauntlets',
    'safescope-gauntlet.source.v1.json'), 'utf8')) as Array<Record<string, unknown>>;
  const fieldNames = new Set<string>();
  for (const r of src) for (const k of Object.keys(r)) fieldNames.add(k);
  const hasGapLabel = [...fieldNames].some(k => /gap|missing|clarif/i.test(k));
  const hasInteractionLabel = [...fieldNames].some(k => /interaction/i.test(k));
  const OFFSET_2_3_FORBIDDEN_CAPABILITY = 16;   // §124: 8 + 8, from label metadata only
  notes.push(`gauntlet.source (offsets 2+3)  RESERVED, NOT OPENED  forbidden-capability `
    + `${OFFSET_2_3_FORBIDDEN_CAPABILITY} (metadata)  gap-label ${hasGapLabel}  `
    + `interaction-label ${hasInteractionLabel}`);

  // GOVERNED: the production snapshot supplies records; any row may carry one.
  add('GOVERNED_RECORD_SUPPLIED', PREFERRED_ROWS);   // not the binding constraint once records exist
  add('NO_GOVERNED_RECORD', PREFERRED_ROWS);
  // DISAGREEMENT_OPPORTUNITY is `backingState !== 'APPROVED'`. All 64 records in
  // federal-core-2026-08-28.1 are reviewState=mechanically_validated -> UNAPPROVED_RECORD, so EVERY
  // governed-supplied row is a disagreement opportunity. This is exactly the condition
  // expert-cohort-composition.ts:144 names as what actually exercises M08.
  add('DISAGREEMENT_OPPORTUNITY', PREFERRED_ROWS);
  add('DETERMINISTIC_MISS_RECALL_OPPORTUNITY', seed.length);

  // ---------------------------------------------------------------- report
  const withoutOpening = { ...supply };
  const withOpening = { ...supply };
  withOpening.FORBIDDEN_FAMILY_NEGATIVE_CONTROL =
    (withOpening.FORBIDDEN_FAMILY_NEGATIVE_CONTROL ?? 0) + OFFSET_2_3_FORBIDDEN_CAPABILITY;

  console.log('MAXIMUM ACHIEVABLE COMPOSITION -- no reserved observation was read\n');
  for (const n of notes) console.log('  ' + n);

  console.log(`\n  ${'class'.padEnd(38)} ${'req'.padStart(4)} ${'no-open'.padStart(8)}`
    + ` ${'opened'.padStart(7)}  verdict`);
  let blockers: string[] = [];
  for (const [cls, req] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    const a = withoutOpening[cls] ?? 0;
    const b = withOpening[cls] ?? 0;
    const ok = b >= req.minimum;
    if (!ok) blockers.push(`${cls} ${b} < ${req.minimum} (short ${req.minimum - b})`);
    console.log(`  ${cls.padEnd(38)} ${String(req.minimum).padStart(4)} ${String(a).padStart(8)}`
      + ` ${String(b).padStart(7)}  ${ok ? 'ok' : 'BLOCKED'}`);
  }

  console.log('\n  DOES OPENING OFFSETS 2 AND 3 CLOSE THE DEFICITS?');
  if (blockers.length === 0) {
    console.log('    YES -- every frozen minimum is reachable once the offsets are opened.');
  } else {
    console.log('    NO. These remain SHORT even after opening both offsets:');
    for (const b of blockers) console.log(`      - ${b}`);
    console.log('\n    Opening would therefore SPEND irreplaceable reserved material without');
    console.log('    producing a freezable cohort. Offsets 2 and 3 are LEFT UNOPENED.');
  }
  console.log(`\nRESERVED_MATERIAL_OPENED = FALSE   PROVIDER_INVOCATION_COUNT = 0`);
}

main();
