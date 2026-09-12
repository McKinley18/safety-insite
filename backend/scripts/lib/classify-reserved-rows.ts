/**
 * §122 -- mechanical eligibility classification of the opened reserve, plus a deterministic-engine
 * pass over every candidate row.
 *
 * Emits a working file for truth-key authoring. Nothing here selects a row on anything but the
 * frozen policy's own rule, and nothing here touches a provider.
 */

import * as fs from 'fs';
import * as path from 'path';
import { MultiHazardDecompositionService } from '../../src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service';
import { toExpertFamily } from '../../src/safescope-v2/expert-hazlenz/expert-deterministic-projection';
import {
  ACCEPTED_EXPERT_TAXONOMY, reservedRowEligible, type ReservedRowMetadata,
} from './expert-cohort-supplemental-policy';

const ROOT = path.resolve(__dirname, '..', '..', '..');
const SEED = path.join(ROOT, 'safescope-data', 'gauntlets', 'safescope-gauntlet.seed.json');

interface SeedRow extends ReservedRowMetadata {
  observation: string;
  expectedStandardFamily?: string;
}

const decomposer = new MultiHazardDecompositionService();

function main(): void {
  // The accepted taxonomy is ASSERTED against the projection map's value set, never trusted.
  const projected = new Set<string>();
  for (const label of ['machine guarding', 'hazardous energy control', 'live electrical parts',
    'confined space', 'fall protection', 'hazard communication', 'powered industrial truck']) {
    const f = toExpertFamily(label);
    if (f) projected.add(f);
  }
  const declared = new Set(ACCEPTED_EXPERT_TAXONOMY);
  const equal = projected.size === declared.size && [...projected].every(f => declared.has(f));
  if (!equal) {
    throw new Error(`ACCEPTED_EXPERT_TAXONOMY does not equal the projection value set: `
      + `${[...projected].sort().join(',')} vs ${[...declared].sort().join(',')}`);
  }

  const rows: SeedRow[] = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  const out: Array<Record<string, unknown>> = [];
  const stateTally: Record<string, number> = {};
  let eligible = 0;

  for (const row of rows) {
    const verdict = reservedRowEligible(row, toExpertFamily);
    const decomposition = decomposer.decompose(row.observation, {});
    for (const h of decomposition.hazards) {
      const s = String(h.conditionState ?? 'UNSET');
      stateTally[s] = (stateTally[s] ?? 0) + 1;
    }
    const enginesFamilies = Array.from(new Set(decomposition.hazards.map(h => h.domainId)));
    const forbiddenCandidates = Array.from(new Set(
      (row.unacceptableStandardFamilies ?? []).map(toExpertFamily).filter((f): f is string => !!f)));

    if (verdict.eligible) eligible += 1;
    out.push({
      scenarioId: row.scenarioId,
      eligible: verdict.eligible,
      reason: verdict.reason,
      primary: verdict.primary,
      secondaries: verdict.secondaries,
      forbiddenFromUnacceptable: forbiddenCandidates,
      severityExpectation: row.severityExpectation,
      agency: row.agency,
      engineFamilies: enginesFamilies,
      engineStates: decomposition.hazards.map(h => ({
        domainId: h.domainId, conditionState: h.conditionState ?? null,
        correctionStatus: h.correctionStatus ?? null,
        evidenceGaps: h.evidenceGaps ?? [],
      })),
      observation: row.observation,
    });
  }

  const outPath = path.join(__dirname, '..', '..', '..', 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');

  console.log('ACCEPTED_EXPERT_TAXONOMY equals the §119 projection value set: PROVEN');
  console.log(`reserve rows: ${rows.length}   eligible under the frozen policy: ${eligible}`);
  console.log('\nDETERMINISTIC ENGINE condition-state incidence across ALL 100 rows:');
  for (const [state, n] of Object.entries(stateTally).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${state.padEnd(16)} ${n}`);
  }
  const eligibleRows = out.filter(r => r.eligible);
  const plannedInEligible = eligibleRows.filter(r =>
    (r.engineStates as Array<{ conditionState: string | null }>).some(s => s.conditionState === 'PLANNED_FUTURE')).length;
  const historicalInEligible = eligibleRows.filter(r =>
    (r.engineStates as Array<{ conditionState: string | null }>).some(s => s.conditionState === 'HISTORICAL')).length;
  console.log(`\nAMONG THE ${eligibleRows.length} ELIGIBLE ROWS:`);
  console.log(`  rows producing a PLANNED_FUTURE finding : ${plannedInEligible}  <-- exercises the UNRESOLVED mapping`);
  console.log(`  rows producing a HISTORICAL finding     : ${historicalInEligible}  <-- exercises the RESOLVED mapping`);
  console.log(`\nwritten: ${path.relative(ROOT, outPath)}`);
}

main();
