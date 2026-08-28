// Deterministic scorer for the frozen secondary-hazard decomposition corpus.
//
// Metrics are predeclared here BEFORE any engine change (Phase 3 of the
// HazLenz deterministic precision measurement). The scorer is evidence
// infrastructure: it is never relaxed, and its thresholds are never tuned to
// obtain a pass. It reads the frozen corpus, runs the unmodified production
// decomposition service over every row, and emits a machine-readable result.
//
//   npx ts-node src/safescope-v2/tests/hazlenz-decomposition-precision-scorer.ts \
//       --label=baseline --out=<path>.json
//
// Exit code is 0 whenever measurement completed. Pass/fail adjudication against
// a baseline is done by the comparison runner, not by this scorer, so that a
// baseline run is never "failing" merely for recording the defect it exists to
// measure.

import * as fs from 'fs';
import * as path from 'path';
import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';
import { POPULATION_A, POPULATION_B } from './hazlenz-decomposition-precision-corpus';

// ---------------------------------------------------------------------------
// Taxonomy / alias adjudication
// ---------------------------------------------------------------------------
// The decomposition layer emits ids drawn from two vocabularies: the taxonomy
// coverage map (safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json,
// e.g. `ppe`, `material_handling`, `noise`) and the engine's own canonical
// family ids (e.g. `personal_protective_equipment`, `material_handling_storage`,
// `noise_exposure`). The repository's canonical contract
// (src/safescope-v2/taxonomy/canonical-taxonomy-aliases.ts) already declares
// several of these pairs to be the same family.
//
// Both the engine's output and the corpus's authored labels are mapped through
// the same table before scoring, so this is an adjudication of vocabulary, not
// a relaxation: aliasing widens the FORBIDDEN sets exactly as much as it widens
// the required/allowed sets, and the identical table is applied to the baseline
// and to every candidate run.
//
// Only unambiguous synonyms are merged. Families that are genuinely distinct
// hazards (machine_guarding vs lockout_tagout; suspended_loads vs
// cranes_rigging_hoisting; silica vs combustible dust) are deliberately NOT
// merged.
const DOMAIN_ALIASES: Record<string, string> = {
  ppe: 'personal_protective_equipment',
  material_handling: 'material_handling_storage',
  noise: 'noise_exposure',
  hazcom: 'hazard_communication',
  sds_labeling: 'hazard_communication',
  slips_trips_falls: 'slips_trips_falls_housekeeping',
  housekeeping: 'slips_trips_falls_housekeeping',
  environmental_spill: 'environmental_release',
  chemical_release: 'environmental_release',
  cranes_hoists: 'cranes_rigging_hoisting',
  rigging_lifting: 'cranes_rigging_hoisting',
  forklifts: 'powered_industrial_trucks',
  chemical_exposure: 'chemical_inhalation_contact',
  ergonomics: 'ergonomic_strain',
  first_aid_medical: 'emergency_equipment',
  fire_protection: 'fire_explosion',
  atmospheric_hazard: 'ventilation_air_quality',
};

function canon(domain: string): string {
  return DOMAIN_ALIASES[domain] || domain;
}

function canonSet(domains: string[]): string[] {
  return Array.from(new Set(domains.map(canon)));
}

interface ARowResult {
  id: string;
  category: string;
  emitted: string[];
  forbiddenEmitted: string[];
  unexpectedEmitted: string[];
  missingRequired: string[];
  aliasConflicts: string[];
  clean: boolean;
}

interface BRowResult {
  id: string;
  category: string;
  emitted: string[];
  satisfiedGroups: string[];
  missedGroups: string[];
  missedLifeCriticalGroups: string[];
  fullRecall: boolean;
}

export interface PrecisionScoreReport {
  label: string;
  corpus: {
    populationASize: number;
    populationBSize: number;
    populationBRequiredGroups: number;
    populationBLifeCriticalGroups: number;
  };
  populationA: {
    forbiddenFamilyCount: number;
    rowsWithForbidden: number;
    falseSecondaryPromotionRate: number;
    unexpectedFamilyCount: number;
    caseLevelPrecision: number;
    requiredOmissionCount: number;
    rows: ARowResult[];
  };
  populationB: {
    requiredGroupsSatisfied: number;
    requiredSecondaryHazardRecall: number;
    dangerousOmissionCount: number;
    dangerousOmissionRate: number;
    lifeCriticalOmissionCount: number;
    caseLevelFullHazardRecall: number;
    rows: BRowResult[];
  };
  combined: {
    // Population A required hazards are genuine hazards too: suppressing one to
    // buy precision is a dangerous omission and is counted here alongside
    // Population B's misses.
    totalDangerousOmissions: number;
    totalLifeCriticalOmissions: number;
  };
}

function emittedDomains(service: MultiHazardDecompositionService, text: string): string[] {
  const result = service.decompose(text);
  return Array.from(new Set(result.hazards.map(h => h.domainId))).sort();
}

export function score(label: string): PrecisionScoreReport {
  const service = new MultiHazardDecompositionService();

  const aRows: ARowResult[] = POPULATION_A.map(row => {
    const emitted = canonSet(emittedDomains(service, row.observation)).sort();
    const permitted = new Set(canonSet([...row.requiredDomains, ...row.allowedDomains]));
    // Where alias closure pulls a canonical id into BOTH the permitted and the
    // forbidden set for one row (the row named two ordinary-language labels
    // that the taxonomy treats as one family), the row's explicit permission
    // wins and the collision is reported rather than silently decided. The
    // rule is identical for baseline and candidate runs, so it cannot
    // manufacture an improvement.
    const aliasConflicts = canonSet(row.forbiddenDomains).filter(d => permitted.has(d));
    const forbidden = new Set(canonSet(row.forbiddenDomains).filter(d => !permitted.has(d)));
    const forbiddenEmitted = emitted.filter(d => forbidden.has(d));
    const unexpectedEmitted = emitted.filter(d => !permitted.has(d) && !forbidden.has(d));
    const missingRequired = canonSet(row.requiredDomains).filter(d => !emitted.includes(d));
    return {
      id: row.id,
      category: row.category,
      emitted,
      forbiddenEmitted,
      unexpectedEmitted,
      missingRequired,
      aliasConflicts,
      clean: forbiddenEmitted.length === 0,
    };
  });

  const bRows: BRowResult[] = POPULATION_B.map(row => {
    const emitted = canonSet(emittedDomains(service, row.observation)).sort();
    // A required group is satisfied only by an emitted family that is not
    // already spending itself on another group: two independently actionable
    // hazards require two distinct findings, so one emission must never be
    // counted as recall for both. Groups are matched most-constrained-first,
    // which is optimal for the small, near-disjoint groups this corpus uses.
    const order = row.required
      .map((group, index) => ({ group, index }))
      .sort((a, b) => a.group.domains.length - b.group.domains.length);
    const consumed = new Set<string>();
    const satisfiedByIndex = new Array<boolean>(row.required.length).fill(false);
    for (const { group, index } of order) {
      const hit = canonSet(group.domains).find(d => emitted.includes(d) && !consumed.has(d));
      if (hit) {
        consumed.add(hit);
        satisfiedByIndex[index] = true;
      }
    }

    const satisfiedGroups: string[] = [];
    const missedGroups: string[] = [];
    const missedLifeCriticalGroups: string[] = [];
    row.required.forEach((group, index) => {
      const key = group.domains.join('|');
      if (satisfiedByIndex[index]) {
        satisfiedGroups.push(key);
      } else {
        missedGroups.push(key);
        if (group.lifeCritical) missedLifeCriticalGroups.push(key);
      }
    });
    return {
      id: row.id,
      category: row.category,
      emitted,
      satisfiedGroups,
      missedGroups,
      missedLifeCriticalGroups,
      fullRecall: missedGroups.length === 0,
    };
  });

  const aForbiddenCount = aRows.reduce((n, r) => n + r.forbiddenEmitted.length, 0);
  const aRowsWithForbidden = aRows.filter(r => r.forbiddenEmitted.length > 0).length;
  const aUnexpectedCount = aRows.reduce((n, r) => n + r.unexpectedEmitted.length, 0);
  const aRequiredOmissions = aRows.reduce((n, r) => n + r.missingRequired.length, 0);

  const bTotalGroups = POPULATION_B.reduce((n, r) => n + r.required.length, 0);
  const bLifeCriticalGroups = POPULATION_B.reduce(
    (n, r) => n + r.required.filter(g => g.lifeCritical).length,
    0,
  );
  const bSatisfied = bRows.reduce((n, r) => n + r.satisfiedGroups.length, 0);
  const bMissed = bRows.reduce((n, r) => n + r.missedGroups.length, 0);
  const bLifeCriticalMissed = bRows.reduce((n, r) => n + r.missedLifeCriticalGroups.length, 0);
  const bFullRecallRows = bRows.filter(r => r.fullRecall).length;

  return {
    label,
    corpus: {
      populationASize: POPULATION_A.length,
      populationBSize: POPULATION_B.length,
      populationBRequiredGroups: bTotalGroups,
      populationBLifeCriticalGroups: bLifeCriticalGroups,
    },
    populationA: {
      forbiddenFamilyCount: aForbiddenCount,
      rowsWithForbidden: aRowsWithForbidden,
      falseSecondaryPromotionRate: aRowsWithForbidden / POPULATION_A.length,
      unexpectedFamilyCount: aUnexpectedCount,
      caseLevelPrecision: (POPULATION_A.length - aRowsWithForbidden) / POPULATION_A.length,
      requiredOmissionCount: aRequiredOmissions,
      rows: aRows,
    },
    populationB: {
      requiredGroupsSatisfied: bSatisfied,
      requiredSecondaryHazardRecall: bSatisfied / bTotalGroups,
      dangerousOmissionCount: bMissed,
      dangerousOmissionRate: bMissed / bTotalGroups,
      lifeCriticalOmissionCount: bLifeCriticalMissed,
      caseLevelFullHazardRecall: bFullRecallRows / POPULATION_B.length,
      rows: bRows,
    },
    combined: {
      totalDangerousOmissions: bMissed + aRequiredOmissions,
      totalLifeCriticalOmissions: bLifeCriticalMissed,
    },
  };
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function printReport(report: PrecisionScoreReport): void {
  console.log('==================================================');
  console.log(`HazLenz secondary-hazard decomposition precision/recall — ${report.label}`);
  console.log('==================================================');
  console.log(
    `Corpus: Population A = ${report.corpus.populationASize} rows, ` +
      `Population B = ${report.corpus.populationBSize} rows / ` +
      `${report.corpus.populationBRequiredGroups} required hazard groups ` +
      `(${report.corpus.populationBLifeCriticalGroups} life-critical)\n`,
  );

  console.log('-- Population A (contextual language must not create a hazard) --');
  console.log(`  forbidden-family count          : ${report.populationA.forbiddenFamilyCount}`);
  console.log(`  rows with a forbidden family    : ${report.populationA.rowsWithForbidden}`);
  console.log(
    `  false secondary-promotion rate  : ${pct(report.populationA.falseSecondaryPromotionRate)}`,
  );
  console.log(`  case-level precision            : ${pct(report.populationA.caseLevelPrecision)}`);
  console.log(`  unexpected (non-forbidden) count: ${report.populationA.unexpectedFamilyCount}`);
  console.log(`  required-hazard omissions in A  : ${report.populationA.requiredOmissionCount}`);
  const conflicted = report.populationA.rows.filter(r => r.aliasConflicts.length);
  if (conflicted.length) {
    console.log(
      `  alias collisions (permission won): ${conflicted
        .map(r => `${r.id}:${r.aliasConflicts.join('/')}`)
        .join(', ')}`,
    );
  }
  for (const row of report.populationA.rows) {
    if (row.forbiddenEmitted.length || row.missingRequired.length) {
      console.log(
        `    [${row.id}] emitted=[${row.emitted.join(', ')}]` +
          (row.forbiddenEmitted.length ? ` FORBIDDEN=[${row.forbiddenEmitted.join(', ')}]` : '') +
          (row.missingRequired.length ? ` MISSING=[${row.missingRequired.join(', ')}]` : ''),
      );
    }
  }

  console.log('\n-- Population B (genuine multi-hazard must still split) --');
  console.log(
    `  required secondary-hazard recall: ${pct(report.populationB.requiredSecondaryHazardRecall)} ` +
      `(${report.populationB.requiredGroupsSatisfied}/${report.corpus.populationBRequiredGroups})`,
  );
  console.log(
    `  dangerous-omission rate         : ${pct(report.populationB.dangerousOmissionRate)} ` +
      `(${report.populationB.dangerousOmissionCount})`,
  );
  console.log(`  life-critical omission count    : ${report.populationB.lifeCriticalOmissionCount}`);
  console.log(
    `  case-level full-hazard recall   : ${pct(report.populationB.caseLevelFullHazardRecall)}`,
  );
  for (const row of report.populationB.rows) {
    if (row.missedGroups.length) {
      console.log(
        `    [${row.id}] emitted=[${row.emitted.join(', ')}] MISSED=[${row.missedGroups.join(' ; ')}]` +
          (row.missedLifeCriticalGroups.length ? ' (LIFE-CRITICAL)' : ''),
      );
    }
  }

  console.log('\n-- Combined safety tally --');
  console.log(`  total dangerous omissions (A+B) : ${report.combined.totalDangerousOmissions}`);
  console.log(`  total life-critical omissions   : ${report.combined.totalLifeCriticalOmissions}`);
  console.log('==================================================\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const label = (args.find(a => a.startsWith('--label=')) || '--label=unlabelled').split('=')[1];
  const outArg = args.find(a => a.startsWith('--out='));
  const report = score(label);
  printReport(report);
  if (outArg) {
    const outPath = path.resolve(outArg.split('=').slice(1).join('='));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`Wrote ${outPath}`);
  }
}
