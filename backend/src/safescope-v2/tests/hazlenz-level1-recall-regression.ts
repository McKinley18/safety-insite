// Protected gate for deterministic Level-1 hazard RECALL.
//
// Companion to `hazlenz-decomposition-precision-regression.ts`, which protects
// precision. This gate protects the safety floor in the other direction: every
// required hazard group that the complete deterministic Level-1 authority was
// measured to omit in Phase 2 must be emitted by the decomposition layer, and
// the hazardous-energy probe family must keep exposure distinguishable from a
// genuinely isolated safe state.
//
// Assertions here are recorded safety requirements, not tuned targets. They are
// never relaxed to obtain a pass. A failure means either a genuine recall
// regression or a genuine precision regression on a safe-state probe.
//
//   npm run test:hazlenz-level1-recall

import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';
import {
  HAZARDOUS_ENERGY_PROBES,
  LEVEL1_OMISSION_REPROS,
} from './hazlenz-level1-recall-probe-corpus';

// Same alias adjudication as the precision scorer: applied identically to the
// expectation and to the emission, so it can neither hide a miss nor invent a
// hit.
const DOMAIN_ALIASES: Record<string, string> = {
  ppe: 'personal_protective_equipment',
  hazcom: 'hazard_communication',
  atmospheric_hazard: 'ventilation_air_quality',
  welding_cutting: 'hot_work',
};

function canon(domain: string): string {
  return DOMAIN_ALIASES[domain] || domain;
}

function emitted(service: MultiHazardDecompositionService, text: string): string[] {
  return Array.from(
    new Set(service.decompose(text).hazards.map(h => canon(String(h.domainId)))),
  ).sort();
}

function main(): void {
  const service = new MultiHazardDecompositionService();
  const failures: string[] = [];
  let checks = 0;

  console.log('-- Level-1 required-hazard omission repros (Phase 2 measurement) --');
  for (const repro of LEVEL1_OMISSION_REPROS) {
    const domains = emitted(service, repro.observation);
    const wanted = repro.requiredGroup.map(canon);
    const satisfied = wanted.some(d => domains.includes(d));
    checks += 1;
    console.log(
      `  [${satisfied ? 'PASS' : 'FAIL'}] ${repro.corpusRowId} ` +
        `${repro.lifeCritical ? '(life-critical) ' : ''}need one of [${repro.requiredGroup.join(', ')}] ` +
        `emitted=[${domains.join(', ')}]`,
    );
    if (!satisfied) {
      failures.push(
        `RECALL: ${repro.corpusRowId}${repro.lifeCritical ? ' (LIFE-CRITICAL)' : ''} ` +
          `emitted [${domains.join(', ')}] and represents none of [${repro.requiredGroup.join(', ')}]`,
      );
    }
  }

  console.log('\n-- Hazardous-energy / MCC probe family --');
  for (const probe of HAZARDOUS_ENERGY_PROBES) {
    const domains = emitted(service, probe.observation);
    const missing = probe.requiredGroups
      .filter(group => !group.map(canon).some(d => domains.includes(d)))
      .map(group => group.join('|'));
    const forbidden = probe.forbiddenDomains.map(canon).filter(d => domains.includes(d));
    checks += 1;
    const ok = missing.length === 0 && forbidden.length === 0;
    console.log(
      `  [${ok ? 'PASS' : 'FAIL'}] ${probe.id} ${probe.intent}\n` +
        `          emitted=[${domains.join(', ')}]` +
        (missing.length ? ` MISSING=[${missing.join(' ; ')}]` : '') +
        (forbidden.length ? ` FORBIDDEN=[${forbidden.join(', ')}]` : ''),
    );
    if (missing.length) failures.push(`PROBE RECALL: ${probe.id} missing [${missing.join(' ; ')}]`);
    if (forbidden.length) {
      failures.push(`PROBE PRECISION: ${probe.id} emitted forbidden [${forbidden.join(', ')}]`);
    }
  }

  console.log('');
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    console.error(`\n${failures.length} failure(s) across ${checks} checks`);
    process.exit(1);
  }
  console.log(`PASS HazLenz Level-1 recall gate (${checks} checks)`);
}

main();
