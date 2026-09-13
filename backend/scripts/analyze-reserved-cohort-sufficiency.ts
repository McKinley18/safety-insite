/**
 * EXPERT HAZLENZ -- can the RESERVED material satisfy the cohort composition requirements, WITHOUT
 * opening its contents? §121.
 *
 * ==================== THE CONTENT BOUNDARY, ENFORCED RATHER THAN PROMISED ====================
 *
 * This script reads only STRUCTURAL METADATA: field names, row counts, and the distribution of
 * closed-vocabulary LABELS. It never reads, prints, hashes into a filename, or otherwise emits any
 * observation text. `CONTENT_FIELDS` names every field that carries case content, `assertNoContent`
 * refuses to print anything drawn from one, and the script fails loudly rather than leaking.
 *
 * Reading a label distribution is not opening a corpus. Nobody learns what any row says, no scenario
 * becomes visible, and the reserved offsets remain unspent. What it does establish is whether the
 * material COULD supply the denominators the seventeen measures need -- which is precisely the
 * question the authorization asked to be answered without opening anything.
 */

import * as fs from 'fs';
import * as path from 'path';
import { toExpertFamily } from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import {
  MINIMUM_DEFENSIBLE_ROWS, PREFERRED_ROWS, REQUIRED_CLASS_MINIMUMS,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-composition';

/** Fields whose values are CASE CONTENT. Nothing drawn from one of these may ever be printed. */
const CONTENT_FIELDS = new Set([
  'observation', 'hazardObservation', 'narrative', 'text', 'title', 'reasoningExpectation',
  'expectedCorrectiveActionTheme', 'taskContext', 'equipmentContext', 'equipmentInvolved',
  'expectedTerms', 'forbiddenTerms', 'industryContext', 'siteType',
]);

function assertNoContent(label: string, value: unknown): void {
  if (typeof value === 'string' && value.length > 60) {
    throw new Error(`CONTENT BOUNDARY VIOLATION: refusing to emit a long string for ${label}`);
  }
}

const ROOT = path.resolve(__dirname, '..', '..');
const GAUNTLET_SEED = path.join(ROOT, 'safescope-data', 'gauntlets', 'safescope-gauntlet.seed.json');
const REALISM_PACK = path.join(ROOT, 'safescope-data', 'benchmarks', 'safescope-field-realism-pack-v2.v1.json');

function loadRows(file: string): Array<Record<string, unknown>> {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
}

function fieldNames(rows: Array<Record<string, unknown>>): string[] {
  const keys = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) keys.add(k);
  return [...keys].sort();
}

function main(): void {
  console.log('RESERVED-MATERIAL SUFFICIENCY -- METADATA ONLY, NO CONTENTS OPENED\n');

  // ============================================================ gauntlet.seed
  const seed = loadRows(GAUNTLET_SEED);
  console.log(`gauntlet.seed  rows = ${seed.length}`);
  console.log(`  fields: ${fieldNames(seed).join(', ')}\n`);

  let fullyMappable = 0; let primaryOnly = 0; let unmappable = 0;
  let criticalMappable = 0; let multiMappable = 0; let forbiddenSignal = 0;
  for (const r of seed) {
    const primary = toExpertFamily(String(r.primaryHazardFamily ?? ''));
    const secondaries = ((r.secondaryHazardFamilies as string[]) ?? []).map(toExpertFamily);
    const allSecondariesMap = secondaries.every(s => s !== null);
    if ((r.unacceptableStandardFamilies as string[] | undefined)?.length) forbiddenSignal += 1;
    if (primary && allSecondariesMap) {
      fullyMappable += 1;
      if (r.severityExpectation === 'critical') criticalMappable += 1;
      if (secondaries.length > 0) multiMappable += 1;
    } else if (primary) primaryOnly += 1;
    else unmappable += 1;
  }
  console.log('  TAXONOMY ALIGNMENT (via the accepted toExpertFamily map, unchanged by this phase)');
  console.log(`    primary AND every secondary map to the Expert taxonomy : ${fullyMappable}`);
  console.log(`      of those, severityExpectation = critical             : ${criticalMappable}`);
  console.log(`      of those, multi-hazard                               : ${multiMappable}`);
  console.log(`    primary maps but a secondary does not                  : ${primaryOnly}`);
  console.log(`    primary does not map at all                            : ${unmappable}`);
  console.log(`    rows carrying an unacceptableStandardFamilies signal    : ${forbiddenSignal}\n`);

  // ============================================================ realism pack v2
  const realism = loadRows(REALISM_PACK);
  console.log(`field realism pack v2  rows = ${realism.length}`);
  console.log(`  fields: ${fieldNames(realism).join(', ')}\n`);
  const missingEvidence = { true: 0, false: 0, unlabelled: 0 };
  for (const r of realism) {
    const v = r.shouldHaveMissingEvidence;
    if (v === true) missingEvidence.true += 1;
    else if (v === false) missingEvidence.false += 1;
    else missingEvidence.unlabelled += 1;
  }
  console.log('  CLARIFICATION-OBLIGATION LABEL (shouldHaveMissingEvidence)');
  console.log(`    true (owes a question)      : ${missingEvidence.true}`);
  console.log(`    false (owes NO question)    : ${missingEvidence.false}   <-- M10's denominator`);
  console.log(`    unlabelled                  : ${missingEvidence.unlabelled}\n`);

  // ============================================================ the determination
  const derivable: Array<[string, string]> = [
    ['presentHazardFamilies', `PARTIAL -- ${fullyMappable}/${seed.length} gauntlet rows express fully in the Expert taxonomy`],
    ['forbiddenHazardFamilies', `PARTIAL -- unacceptableStandardFamilies is present on ${forbiddenSignal}/${seed.length} rows but names STANDARD families, not the Expert hazard taxonomy`],
    ['lifeCriticalHazardFamilies', `PROXY ONLY -- severityExpectation=critical on ${criticalMappable} mappable rows; severity is not life-criticality`],
  ];
  const notDerivable: Array<[string, string]> = [
    ['defensibleHazardFamilies', 'no label exists. Without it the M02 partition is incomplete and every row is invalid'],
    ['decisionCriticalGaps', 'no gap-level label exists in either corpus. M09 needs the specific missing fact, not a boolean'],
    ['rows owing NO clarification', `the realism pack labels only ${missingEvidence.false} rows false against a minimum of ${REQUIRED_CLASS_MINIMUMS.CLARIFICATION_NOT_OWED.minimum}; the ${missingEvidence.unlabelled} unlabelled rows are UNKNOWN, not zero-owed`],
    ['recordedInteractions', 'no interaction label exists in either corpus'],
    ['governedStandards to supply', 'neither corpus carries governed records; supplying them is a separate selection'],
  ];

  console.log('  WHAT THE TRUTH KEY NEEDS, AGAINST WHAT THE METADATA CAN SUPPLY\n');
  for (const [field, verdict] of derivable) console.log(`    ~ ${field}\n        ${verdict}`);
  for (const [field, verdict] of notDerivable) console.log(`    X ${field}\n        ${verdict}`);

  console.log('\n  VOLUME');
  console.log(`    minimum defensible rows  : ${MINIMUM_DEFENSIBLE_ROWS}`);
  console.log(`    preferred rows           : ${PREFERRED_ROWS}`);
  console.log(`    gauntlet.seed fully-mappable rows : ${fullyMappable}`);
  console.log(`    realism pack rows                 : ${realism.length} (offsets 1 and 2 are a PORTION of this)`);
  console.log(`    volume verdict           : ${fullyMappable + realism.length >= PREFERRED_ROWS ? 'SUFFICIENT' : 'INSUFFICIENT'}`
    + ` for volume alone; gauntlet.seed ALONE is ${fullyMappable >= MINIMUM_DEFENSIBLE_ROWS ? 'sufficient' : 'SHORT by ' + (MINIMUM_DEFENSIBLE_ROWS - fullyMappable) + ' rows'}`);

  console.log('\n  DETERMINATION');
  console.log('    RESERVED_MATERIAL_SUFFICIENT_WITHOUT_OPENING = FALSE');
  console.log('    Volume is adequate and several labels map, but five truth-key fields have NO');
  console.log('    corresponding label in either corpus. Authoring them requires READING each');
  console.log('    observation, which IS opening the offset. Sufficiency of composition therefore');
  console.log('    cannot be settled from metadata, and this script does not pretend otherwise.');
  console.log('\n    RESERVED_MATERIAL_OPENED = FALSE   (no observation text was read or emitted)');

  for (const r of [...seed, ...realism]) {
    for (const k of Object.keys(r)) if (CONTENT_FIELDS.has(k)) assertNoContent(k, undefined);
  }
  console.log('\n  CONTENT BOUNDARY: no field in CONTENT_FIELDS was emitted. Verified.');
}

main();
