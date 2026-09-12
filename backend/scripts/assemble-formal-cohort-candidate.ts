/**
 * §122 -- assemble the CANDIDATE formal cohort from the opened reserve, prove it executes through
 * the real permanent Expert path with the provider DISABLED, and measure every frozen composition
 * requirement against what the authorized sources can actually supply.
 *
 * THIS SCRIPT FREEZES NOTHING. It produces a CANDIDATE and a deficit table. A cohort is frozen only
 * when `evaluateComposition` reports no gaps, and this operation established that it does not.
 *
 * Truth here is mechanical only -- corpus labels and deterministic-engine output, precedence levels
 * 1 and 2. No semantic field is authored by this script, because a field authored to fill a
 * denominator the sources cannot supply would be the fabrication the truth-precedence rules exist to
 * prevent.
 */

import * as fs from 'fs';
import * as path from 'path';
import { toExpertFamily } from '../src/safescope-v2/expert-hazlenz/expert-deterministic-projection';
import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, classifyRow, truthOnlyStrings, validateCohortRow,
  type FormalCohortRow,
} from '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import {
  evaluateComposition, REQUIRED_CLASS_MINIMUMS, MINIMUM_DEFENSIBLE_ROWS, PREFERRED_ROWS,
} from '../src/safescope-v2/expert-hazlenz/expert-cohort-composition';
import { buildExpertUserPrompt, EXPERT_SYSTEM_PROMPT } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { ACCEPTED_EXPERT_TAXONOMY } from './lib/expert-cohort-supplemental-policy';
import { providerInvocationCount, resetProviderInvocationCount, runFormalCohort } from './lib/expert-cohort-harness';

const ROOT = path.resolve(__dirname, '..', '..');
const EVIDENCE = path.join(ROOT, 'verification', 'expert-hazlenz-formal-cohort-assembly-2026-08-31');

interface ClassifiedRow {
  scenarioId: string; eligible: boolean; primary: string | null; secondaries: string[];
  forbiddenFromUnacceptable: string[]; severityExpectation?: string; observation: string;
  engineFamilies: string[];
  engineStates: Array<{ domainId: string; conditionState: string | null; correctionStatus: string | null; evidenceGaps: string[] }>;
}

/** Build one candidate row with MECHANICAL truth only. Provenance is recorded per field. */
function toCandidateRow(r: ClassifiedRow): { row: FormalCohortRow; provenance: Record<string, string> } {
  const present = [r.primary!, ...r.secondaries];
  const forbidden = r.forbiddenFromUnacceptable.filter(f => !present.includes(f));
  const defensible = ACCEPTED_EXPERT_TAXONOMY.filter(f => !present.includes(f) && !forbidden.includes(f));
  const negated = Array.from(new Set(
    r.engineStates
      .filter(s => s.conditionState === 'HISTORICAL' || s.conditionState === 'SAFE_VERIFIED')
      .map(s => toExpertFamily(s.domainId) ?? s.domainId)
      .filter(f => ACCEPTED_EXPERT_TAXONOMY.includes(f))));
  // The PRIMARY family only, and only where the corpus rates the scenario critical. Marking every
  // present family life-critical from one severity label would overstate what the corpus said.
  const lifeCritical = r.severityExpectation === 'critical' ? [r.primary!] : [];

  return {
    row: {
      contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
      source: {
        rowId: r.scenarioId,
        observation: r.observation,
        inspectionContext: { location: null, task: null },
        jurisdiction: 'osha-general-industry',
        allowedHazardFamilies: [...ACCEPTED_EXPERT_TAXONOMY],
        // NO GOVERNED RECORD IS SUPPLIED. There is no authorized file-based source of governed
        // records in this repository, which is one of this operation's two blocking findings.
        governedStandards: [],
        answeredClarifications: [],
        supplementaryContext: [],
      },
      truth: {
        presentHazardFamilies: present,
        defensibleHazardFamilies: defensible,
        forbiddenHazardFamilies: forbidden,
        negatedOrSafeStateFamilies: negated,
        lifeCriticalHazardFamilies: lifeCritical,
        // NOT AUTHORED by this script. Authoring a gap set mechanically would put the deterministic
        // engine's blind spots into the answer key for M09/M10.
        decisionCriticalGaps: [],
        recordedInteractions: [],
        authoringRationale:
          `Mechanical candidate row from the opened reserve. Present and forbidden families are `
          + `corpus labels mapped through the frozen toExpertFamily; defensible is the remainder of `
          + `the accepted taxonomy, meaning the corpus said neither required nor unacceptable; `
          + `negated/safe-state is read from the deterministic engine's own condition states. `
          + `Semantic truth fields are deliberately EMPTY -- this is a candidate, not a frozen key.`,
      },
    },
    provenance: {
      presentHazardFamilies: 'LEVEL_2_CORPUS_LABEL (primaryHazardFamily + secondaryHazardFamilies)',
      forbiddenHazardFamilies: 'LEVEL_2_CORPUS_LABEL (unacceptableStandardFamilies, mapped)',
      defensibleHazardFamilies: 'LEVEL_1_DERIVED (accepted taxonomy minus present minus forbidden)',
      negatedOrSafeStateFamilies: 'LEVEL_1_DETERMINISTIC (engine conditionState)',
      lifeCriticalHazardFamilies: 'LEVEL_2_CORPUS_LABEL_PROXY (severityExpectation === critical)',
      decisionCriticalGaps: 'NOT_AUTHORED -- requires level-3 authoring, deliberately withheld',
      recordedInteractions: 'NOT_AUTHORED -- requires level-3 authoring, deliberately withheld',
      governedStandards: 'UNAVAILABLE -- no authorized file-based governed-record source exists',
    },
  };
}

async function main(): Promise<void> {
  resetProviderInvocationCount();
  const classified: ClassifiedRow[] = JSON.parse(
    fs.readFileSync(path.join(EVIDENCE, 'opening', 'reserved-classification.json'), 'utf8'));
  const eligible = classified.filter(r => r.eligible)
    .sort((a, b) => a.scenarioId.localeCompare(b.scenarioId));   // frozen order: scenarioId ASC

  const built = eligible.map(toCandidateRow);
  const rows = built.map(b => b.row);

  console.log(`CANDIDATE COHORT: ${rows.length} rows from the opened reserve, scenarioId ASCENDING\n`);

  // ---- row validity
  const problems = rows.flatMap(validateCohortRow);
  console.log(`ROW VALIDITY: ${problems.length} problem(s) across ${rows.length} rows`);
  for (const p of problems.slice(0, 8)) console.log(`   ${p.rowId} ${p.code}: ${p.detail}`);
  if (problems.length > 8) console.log(`   ... and ${problems.length - 8} more`);

  // ---- truth leak, on the REAL constructed requests
  const disabled = await runFormalCohort(rows, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0,
    arms: ['BASE', 'PERMUTED', 'CROSS_PROCESS'], processId: 'proc-assembly',
    nowIso: '2026-08-31T00:00:00.000Z',
  });
  let leaks = 0;
  for (const built1 of disabled.requestsBuilt) {
    const row = rows.find(r => r.source.rowId === built1.rowId)!;
    const rendered = `${EXPERT_SYSTEM_PROMPT}\n${buildExpertUserPrompt(built1.input)}\n${JSON.stringify(built1.input)}`;
    for (const secret of truthOnlyStrings(row)) if (rendered.includes(secret)) leaks += 1;
  }

  console.log(`\nDISABLED DRY RUN THROUGH THE REAL PERMANENT PATH`);
  console.log(`  stopReason                : ${disabled.stopReason}`);
  console.log(`  requests CONSTRUCTED      : ${disabled.requestsBuilt.length} (${rows.length} rows x 3 arms)`);
  console.log(`  requests SENT             : 0`);
  console.log(`  PROVIDER_INVOCATION_COUNT : ${providerInvocationCount()}`);
  console.log(`  TRUTH_LEAK                : ${leaks}`);
  const sizes = disabled.requestsBuilt.map(b => JSON.stringify(b.input).length);
  const promptSizes = disabled.requestsBuilt.map(b => buildExpertUserPrompt(b.input).length);
  const mean = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  console.log(`  serialized input bytes    : min ${Math.min(...sizes)} mean ${mean(sizes)} max ${Math.max(...sizes)}`);
  console.log(`  user prompt chars         : min ${Math.min(...promptSizes)} mean ${mean(promptSizes)} max ${Math.max(...promptSizes)}`);

  // ---- composition against the FROZEN requirements
  const engineDerived = {
    DETERMINISTIC_MISS_RECALL_OPPORTUNITY: eligible.filter(r => {
      const present = [r.primary!, ...r.secondaries];
      const emitted = new Set(r.engineFamilies);
      return present.some(p => !emitted.has(p));
    }).length,
  };
  const comp = evaluateComposition(rows, engineDerived, 'minimum');
  console.log(`\nCOMPOSITION AGAINST THE FROZEN CONTRACT (level: minimum)`);
  console.log(`  rows ${comp.rowCount} / target ${MINIMUM_DEFENSIBLE_ROWS} minimum, ${PREFERRED_ROWS} preferred`);
  console.log(`  FORMAL_COHORT_COMPOSITION_VALID = ${comp.gaps.length === 0 && comp.rowCountSufficient}`);
  console.log(`\n  class                                  required  present  shortfall`);
  for (const [cls, req] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    const gap = comp.gaps.find(g => g.caseClass === cls);
    const present = gap ? gap.present : req.minimum;
    const mark = gap ? 'SHORT' : 'ok';
    console.log(`  ${cls.padEnd(38)} ${String(req.minimum).padStart(5)} ${String(present).padStart(8)} ${String(gap?.shortfall ?? 0).padStart(10)}  ${mark}`);
  }

  fs.writeFileSync(path.join(EVIDENCE, 'manifest', 'candidate-rows.json'),
    JSON.stringify({
      artifact: 'FORMAL_EXPERT_COHORT_CANDIDATE_NOT_FROZEN',
      note: 'CANDIDATE ONLY. Not frozen, not named, not authorized. Semantic truth fields are '
        + 'deliberately empty and governed records are absent -- see the operation report.',
      rowCount: rows.length,
      order: 'scenarioId ASCENDING',
      rows: built.map(b => ({ rowId: b.row.source.rowId, truth: b.row.truth, provenance: b.provenance, classes: classifyRow(b.row) })),
    }, null, 2) + '\n');

  console.log(`\nPROVIDER_INVOCATION_COUNT = ${providerInvocationCount()}   FORMAL_COHORT_SPENT = FALSE`);
  console.log('candidate written to manifest/candidate-rows.json (NOT FROZEN)');
}

main().catch(e => { console.error(e); process.exit(1); });
