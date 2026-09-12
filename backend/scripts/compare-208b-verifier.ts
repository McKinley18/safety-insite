/**
 * §208B -- DIAGNOSTIC COMPARISON OF THE ORIGINAL AND RECOVERED VERIFIER OUTPUTS.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO HUMAN VERDICTS.
 *
 * ==================== THIS COMPARISON DECIDES NOTHING ====================
 *
 * The §208B replacement rule is UNIFORM: the recovered outputs are the acceptance verifier evidence
 * for every one of the 24 facts, and the §208 outputs are `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE` for
 * every one of them. That rule was fixed by the authorization BEFORE this comparison existed, and
 * nothing here can change it.
 *
 * So this file exists to make the size and shape of the defect visible, and for no other purpose.
 * It must NOT be read as evidence that the recovery was or was not necessary: agreement on a
 * verdict does not retrospectively make a degraded input adequate, and disagreement does not make
 * the recovered answer "better". The authorization is explicit -- do not choose between the two
 * sets based on which grades better -- and there is no code path here that selects between them.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const RECOVERY = join(ROOT, 'verification', 'expert-hazlenz-verifier-recovery-208b-2026-09-08');

const readJsonl = (p: string): any[] => {
  if (!existsSync(p)) throw new Error(`§208B: missing ${p}`);
  return readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as any);
};

const original = readJsonl(join(EVID, 'RAW-VERIFIER-208.jsonl'));
const recovered = readJsonl(join(RECOVERY, 'RAW-VERIFIER-208B.jsonl'))
  .filter(r => r.recordKind === 'ACCEPTANCE_VERIFIER_EVIDENCE');

const key = (r: any): string => `${String(r.caseId)}|${String(r.factKey)}`;
const byKeyOriginal = new Map(original.map(r => [key(r), r]));

const rows = recovered.map(n => {
  const o = byKeyOriginal.get(key(n));
  const vo = (o?.parsed as any)?.verdict ?? null;
  const vn = (n.parsed as any)?.verdict ?? null;
  const ao = (o?.admission as any)?.admitted ?? null;
  const an = (n.admission as any)?.admitted ?? null;
  return {
    caseId: n.caseId as string,
    factKey: n.factKey as string,
    candidateCountOriginal: 0,
    candidateCountRecovered: n.candidateCount as number,
    verdictOriginal: vo,
    verdictRecovered: vn,
    verdictIdentical: vo === vn,
    admissionOriginal: ao,
    admissionRecovered: an,
    admissionCodesOriginal: (o?.admission as any)?.codes ?? null,
    admissionCodesRecovered: (n.admission as any)?.codes ?? null,
    bindingFactKeyOriginal: (o?.parsed as any)?.bindingFactKey ?? null,
    bindingFactKeyRecovered: (n.parsed as any)?.bindingFactKey ?? null,
  };
});

const identical = rows.filter(r => r.verdictIdentical).length;
const differing = rows.filter(r => !r.verdictIdentical);
const admissionChanged = rows.filter(r => r.admissionOriginal !== r.admissionRecovered);

const out = {
  artifact: 'SECTION_208B_VERIFIER_COMPARISON',
  status: 'DIAGNOSTIC ONLY — DECIDES NOTHING',
  replacementRule:
    'UNIFORM. The §208B recovered outputs are ACCEPTANCE_VERIFIER_EVIDENCE for all 24 facts; the '
    + '§208 outputs are DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE for all 24. The rule was fixed by the '
    + '§208B authorization before this comparison existed and no result here can alter it.',
  whatAgreementDoesNotMean:
    'agreement on a verdict does NOT retrospectively make the degraded input adequate. The §208 '
    + 'calls were made with an empty hazard-candidate block on every one of the 24; that is a '
    + 'property of the measurement, not of the answer it happened to produce.',
  whatDisagreementDoesNotMean:
    'disagreement does NOT mean the recovered answer is better. Neither set is scored here, and no '
    + 'selection between them is possible.',
  providerCalls: 0,
  databaseOperations: 0,
  humanVerdictsWritten: 0,
  totals: {
    facts: rows.length,
    verdictIdentical: identical,
    verdictDiffering: differing.length,
    admissionOutcomeChanged: admissionChanged.length,
  },
  differingVerdicts: differing,
  admissionChanges: admissionChanged.map(r => ({
    caseId: r.caseId,
    factKey: r.factKey,
    admissionOriginal: r.admissionOriginal,
    admissionRecovered: r.admissionRecovered,
    codesOriginal: r.admissionCodesOriginal,
    codesRecovered: r.admissionCodesRecovered,
  })),
  rows,
  generatedAt: new Date().toISOString(),
};

writeFileSync(join(RECOVERY, 'VERIFIER-COMPARISON-208B.json'), `${JSON.stringify(out, null, 2)}\n`);

console.log('================ §208B VERIFIER COMPARISON — DIAGNOSTIC ONLY');
console.log(`  facts compared          : ${rows.length}`);
console.log(`  verdict identical       : ${identical}`);
console.log(`  verdict differing       : ${differing.length}`);
console.log(`  admission outcome changed: ${admissionChanged.length}`);
console.log('');
for (const r of differing) {
  console.log(`  DIFFERS ${r.caseId} ${r.factKey.slice(0, 40)}`);
  console.log(`          original(defective input): ${String(r.verdictOriginal)}`);
  console.log(`          recovered(acceptance)    : ${String(r.verdictRecovered)}`);
}
for (const r of admissionChanged) {
  console.log(`  ADMISSION ${r.caseId} ${String(r.admissionOriginal)} -> ${String(r.admissionRecovered)}`);
  console.log(`            codes recovered: ${JSON.stringify(r.admissionCodesRecovered)}`);
}
console.log('\n  wrote VERIFIER-COMPARISON-208B.json');
console.log('  provider calls: 0   database operations: 0   human verdicts written: 0');
