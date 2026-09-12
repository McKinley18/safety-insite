/**
 * §210J -- COMPATIBILITY AND REPLAY MEASUREMENT. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Reads the §210H hosted evidence READ-ONLY and answers, on real historical output rather than on
 * fixtures, two questions the §210J authorization asks:
 *
 *   do historical raw outputs still project and replay?
 *   are new declarations distinguishable from legacy ones?
 *
 * Writes nothing to the evidence directory.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { projectDeclaredOwedFacts } from './lib/expert-first-pass-owed-fact-projection';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';
import { declarationFormat } from './lib/expert-210j-first-pass-contract';
import { project210jDeclarations, preserve210j } from './lib/expert-210j-declaration-projection';
import { R4_CONFIRMATION_STIMULI } from './lib/section-210h-r4-confirmation-preregistration';

const ROOT = join(__dirname, '..', '..');
const RAW = join(ROOT, 'verification', 'expert-hazlenz-210h-hosted-confirmation-2026-09-09',
  'RAW-FIRST-PASS-210H.jsonl');

const rows = readFileSync(RAW, 'utf8').trim().split('\n').map(l => JSON.parse(l));
const out: Record<string, unknown>[] = [];

for (const row of rows) {
  const stim = R4_CONFIRMATION_STIMULI.find(s => s.caseId === row.caseId)!;
  const sources = [{ sourceId: `OBS-${row.caseId}`, text: stim.observation }];
  const decls = row.parsed?.unresolvedFactDeclarations ?? [];

  const base = projectDeclaredOwedFacts({
    declarations: decls, sources, suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  });
  const basePres = preserveIdentifiedSafetyFacts(base, decls);

  const succ = project210jDeclarations({
    declarations: decls, sources, suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  });
  const succPres = preserve210j(succ, decls);

  out.push({
    caseId: row.caseId,
    declarations: decls.length,
    formats: decls.map((d: unknown) => declarationFormat(d)),
    unchangedBasePath: {
      admitted: base.facts.length,
      refused: base.refusedCount,
      safetyStateComplete: basePres.safetyStateComplete,
      factKeys: base.facts.map(f => f.factKey),
    },
    successor210jPath: {
      admitted: succ.projection.facts.length,
      refused: succ.projection.refusedCount,
      demoted: succ.demotedDeclarationIds,
      legacyFormatCount: succ.legacyFormatCount,
      codes: succ.perDeclaration.map(p => p.codes),
      safetyStateComplete: succPres.safetyStateComplete,
      preservedProperties: succPres.base.preserved.map(p => p.identifiedProperty),
      totalLossOnThisRow: succPres.base.totalLossOnThisRow,
      invented: Object.keys(succ.unresolvedActionByFactKey).length,
    },
  });
}

const summary = {
  version: 'hazlenz.expert.210j.compatibility-measurement.v1',
  source: 'verification/expert-hazlenz-210h-hosted-confirmation-2026-09-09/RAW-FIRST-PASS-210H.jsonl',
  readOnly: true,
  providerCalls: 0,
  databaseOperations: 0,
  perCase: out,
  conclusions: {
    historicalOutputsStillProjectUnderTheUnchangedPath:
      out.every(o => (o.unchangedBasePath as any).admitted === (o.declarations as number)),
    historicalOutputsAreLegacyFormat:
      out.every(o => (o.formats as string[]).every(f => f === 'LEGACY_PRE_210J')),
    historicalOutputsFailClosedUnderTheSuccessorContract:
      out.every(o => (o.successor210jPath as any).safetyStateComplete === false),
    identifiedPropertyPreservedInEveryCase:
      out.every(o => (o.successor210jPath as any).preservedProperties.length
        === (o.declarations as number)),
    nothingInvented:
      out.every(o => (o.successor210jPath as any).invented === 0),
  },
};

writeFileSync(
  join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-210j-epistemic-schema-remediation-2026-09-09',
    'COMPATIBILITY-REPLAY-210J.json'),
  JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary.conclusions, null, 2));
for (const o of out) {
  console.log(`${o.caseId}: base admitted ${(o.unchangedBasePath as any).admitted}/`
    + `${o.declarations}, successor admitted ${(o.successor210jPath as any).admitted}/`
    + `${o.declarations}, preserved `
    + `${(o.successor210jPath as any).preservedProperties.length}, invented `
    + `${(o.successor210jPath as any).invented}`);
}
