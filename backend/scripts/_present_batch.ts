import { readFileSync } from 'fs';
import { join } from 'path';
import { buildPool, select } from './lib/expert-cohort-65-selection';
import { COHORT_SIZE_POLICY_V2 } from './lib/expert-cohort-size-policy';
const ROOT = join(__dirname, '..', '..');
const P = JSON.parse(readFileSync(join(ROOT, 'verification',
  'expert-hazlenz-formal-evaluation-2026-09-01', 'ADJUDICATION-PACKET.json'), 'utf8'));
const sel = select(buildPool(), COHORT_SIZE_POLICY_V2.targetRows);
const obs = new Map<string, string>(sel.selected.map(p => [p.row.source.rowId, p.row.source.observation]));
const reg = (P.items as any[]).filter(i => i.kind === 'REGULATORY_STATEMENT');
console.log('REGULATORY ITEMS: ' + reg.length);
for (const it of reg) {
  console.log('\n================================================================');
  console.log('ID         ' + it.adjudicationId);
  console.log('row        ' + it.cohortRowId + '  | arm ' + it.arm + ' | packet ordinal ' + it.ordinal);
  console.log('fieldPath  ' + it.modelOutputFieldPath);
  console.log('assertsObligation (mechanical): ' + it.mechanicalFacts.assertsObligation);
  console.log('--- OBSERVATION (model-visible input) ---');
  console.log(obs.get(it.cohortRowId));
  console.log('--- EXACT MODEL OUTPUT BEING JUDGED ---');
  console.log(it.exactModelOutputBeingJudged);
  console.log('--- SUPPLIED GOVERNED RECORDS: ' + it.suppliedGovernedRecords.length + ' ---');
  for (const g of it.suppliedGovernedRecords) {
    console.log('  citation: ' + g.citation + '   backing: ' + g.backingState);
    console.log('  title   : ' + g.title);
    console.log('  approvedText: ' + g.approvedText);
  }
}
