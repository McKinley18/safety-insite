// Protected gate for ACTIONABLE finding coverage.
//
// Third gate in the deterministic HazLenz safety-floor set, after
// `hazlenz-decomposition-precision-regression` (precision) and
// `hazlenz-level1-recall-regression` (recognition).
//
// Recognition and actionability are different properties. Customer
// `inspection_findings` are materialised by
// `InspectionService.reconcileDecompositionFindings()` from ONE surface —
// the analysis snapshot's `multiHazardDecomposition.hazards`. A hazard the
// primary classifier names but decomposition does not emit is recognised in the
// analysis header and is NOT actionable: it has no finding, so it has no
// standard, no risk snapshot, no corrective action, and no line in the report.
//
// This gate asserts, at the decomposition layer (which is DB-free and therefore
// runnable anywhere), the two halves of that property:
//
//   REQUIRED  — hazards that were measured RECOGNIZED_BUT_NOT_ACTIONABLE by the
//               end-to-end workflow measurement must now be emitted, so they
//               materialise as findings;
//   FORBIDDEN — the safe/incidental Population A rows whose PRIMARY
//               CLASSIFICATION names a family the corpus explicitly forbids.
//               These are the measured counter-examples to promoting a
//               classifier detection on classifier confidence alone: the
//               end-to-end measurement showed that promoting every primary
//               classification would have introduced 14 forbidden families
//               across 12 of the 34 Population A rows, several of them at the
//               classifier's own `high` confidence band (A-13 `forklift
//               charging room` scored 40 @0.93, A-24 `the guard was correctly
//               fitted` scored 52 @0.93 — the same band as the legitimate
//               B-05 at 46 @0.93 and B-20 at 65 @0.93). Classifier confidence
//               therefore cannot gate promotion, and this half of the gate is
//               what holds that line.
//
// Observations are quoted verbatim from the frozen corpus so the gate and the
// corpus can never drift apart. Assertions are recorded safety and precision
// requirements, never relaxed to obtain a pass.
//
//   npm run test:hazlenz-actionable-coverage

import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';
import { POPULATION_A, POPULATION_B } from './hazlenz-decomposition-precision-corpus';

const DOMAIN_ALIASES: Record<string, string> = {
  ppe: 'personal_protective_equipment',
  material_handling: 'material_handling_storage',
  hazcom: 'hazard_communication',
  slips_trips_falls: 'slips_trips_falls_housekeeping',
  housekeeping: 'slips_trips_falls_housekeeping',
  cranes_hoists: 'cranes_rigging_hoisting',
  rigging_lifting: 'cranes_rigging_hoisting',
  forklifts: 'powered_industrial_trucks',
  fire_protection: 'fire_explosion',
  atmospheric_hazard: 'ventilation_air_quality',
  welding_cutting: 'hot_work',
};

function canon(domain: string): string {
  return DOMAIN_ALIASES[domain] || domain;
}

/** Required hazard groups measured RECOGNIZED_BUT_NOT_ACTIONABLE end to end. */
const REQUIRED_ACTIONABLE: Array<{ rowId: string; group: string[]; lifeCritical: boolean }> = [
  { rowId: 'B-05', group: ['compressed_gas'], lifeCritical: true },
  { rowId: 'B-16', group: ['machine_guarding'], lifeCritical: false },
  { rowId: 'B-20', group: ['suspended_loads', 'cranes_hoists', 'rigging_lifting'], lifeCritical: true },
];

/**
 * Population A rows whose PRIMARY CLASSIFICATION names a forbidden family.
 * Each entry names only the families the frozen corpus forbids for that row;
 * the row's own text is read from the corpus, never restated here.
 */
const FORBIDDEN_FROM_CLASSIFIER: Array<{ rowId: string; domains: string[]; classifierSaid: string }> = [
  { rowId: 'A-13', domains: ['mobile_equipment', 'powered_industrial_trucks', 'forklifts'], classifierSaid: 'Mobile Equipment / Traffic @0.93 high' },
  { rowId: 'A-14', domains: ['mobile_equipment', 'powered_industrial_trucks', 'compressed_gas'], classifierSaid: 'Mobile Equipment / Traffic @0.93 high' },
  { rowId: 'A-15', domains: ['mobile_equipment', 'forklifts', 'powered_industrial_trucks'], classifierSaid: 'Mobile Equipment / Traffic @0.93 high' },
  { rowId: 'A-19', domains: ['hydraulic_pneumatic_energy', 'compressed_gas', 'excavation_trenching'], classifierSaid: 'Compressed Air / Hose Safety @0.25 low' },
  { rowId: 'A-21', domains: ['hot_work', 'fire_explosion', 'welding_cutting'], classifierSaid: 'Welding / Cutting / Hot Work @0.70 medium' },
  { rowId: 'A-23', domains: ['hot_work', 'welding_cutting'], classifierSaid: 'Welding / Cutting / Hot Work @0.52 low' },
  { rowId: 'A-24', domains: ['machine_guarding', 'ppe', 'hot_work'], classifierSaid: 'Machine Guarding @0.93 high' },
  { rowId: 'A-25', domains: ['hot_work', 'fire_explosion'], classifierSaid: 'First Aid / Eyewash @0.52 low' },
  { rowId: 'A-26', domains: ['excavation_trenching', 'fall_protection'], classifierSaid: 'Trenching & Shoring @0.82 high' },
  { rowId: 'A-27', domains: ['fall_protection', 'walking_working_surfaces'], classifierSaid: 'Fall Protection @0.93 high' },
  { rowId: 'A-29', domains: ['fall_protection', 'walking_working_surfaces'], classifierSaid: 'Walking/Working Surfaces @0.70 medium' },
  { rowId: 'A-31', domains: ['walking_working_surfaces', 'material_handling', 'material_handling_storage'], classifierSaid: 'Walking/Working Surfaces @0.93 high' },
  { rowId: 'A-34', domains: ['material_handling', 'material_handling_storage', 'suspended_loads'], classifierSaid: 'Material Handling @0.70 medium' },
  { rowId: 'A-12', domains: ['walking_working_surfaces', 'mobile_equipment', 'traffic_control', 'excavation_trenching'], classifierSaid: 'Unclassified @0.25 low' },
];

function observationOf(rowId: string): string {
  const a = POPULATION_A.find(row => row.id === rowId);
  if (a) return a.observation;
  const b = POPULATION_B.find(row => row.id === rowId);
  if (b) return b.observation;
  throw new Error(`Corpus row ${rowId} not found — the gate and the frozen corpus have drifted.`);
}

function emitted(service: MultiHazardDecompositionService, text: string): string[] {
  return Array.from(new Set(service.decompose(text).hazards.map(h => canon(String(h.domainId))))).sort();
}

function main(): void {
  const service = new MultiHazardDecompositionService();
  const failures: string[] = [];
  let checks = 0;

  console.log('-- required actionable coverage (hazard must reach a finding) --');
  for (const entry of REQUIRED_ACTIONABLE) {
    const domains = emitted(service, observationOf(entry.rowId));
    const wanted = entry.group.map(canon);
    const satisfied = wanted.some(d => domains.includes(d));
    checks += 1;
    console.log(
      `  [${satisfied ? 'PASS' : 'FAIL'}] ${entry.rowId}${entry.lifeCritical ? ' (life-critical)' : ''} ` +
        `need one of [${entry.group.join(', ')}] emitted=[${domains.join(', ')}]`,
    );
    if (!satisfied) {
      failures.push(
        `ACTIONABLE: ${entry.rowId}${entry.lifeCritical ? ' (LIFE-CRITICAL)' : ''} emitted [${domains.join(', ')}] ` +
          `and materialises no finding for [${entry.group.join(', ')}]`,
      );
    }
  }

  console.log('\n-- classifier-only families that must NOT become findings --');
  for (const entry of FORBIDDEN_FROM_CLASSIFIER) {
    const domains = emitted(service, observationOf(entry.rowId));
    const violated = entry.domains.map(canon).filter(d => domains.includes(d));
    checks += 1;
    console.log(
      `  [${violated.length ? 'FAIL' : 'PASS'}] ${entry.rowId} classifier said ${entry.classifierSaid}; ` +
        `emitted=[${domains.join(', ')}]` + (violated.length ? ` FORBIDDEN=[${violated.join(', ')}]` : ''),
    );
    if (violated.length) {
      failures.push(`PRECISION: ${entry.rowId} materialises forbidden finding(s) [${violated.join(', ')}]`);
    }
  }

  console.log('');
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    console.error(`\n${failures.length} failure(s) across ${checks} checks`);
    process.exit(1);
  }
  console.log(`PASS HazLenz actionable-coverage gate (${checks} checks)`);
}

main();
