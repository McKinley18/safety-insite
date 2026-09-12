/**
 * §208 -- RE-DERIVE THE FIRST-PASS PROJECTION FROM PERSISTED RAW OUTPUT. ZERO PROVIDER CALLS.
 *
 * ==================== WHY THIS EXISTS ====================
 *
 * A DEFECT IN THE §208 EXECUTOR, NOT IN THE MODEL, THE CONTRACT OR THE TRANSPORT.
 *
 * `execute-208-acceptance-cohort.ts` called `projectDeclaredOwedFacts` with
 * `suppliedGovernedSourceIds` set to the case's governed record ids. The projection treats a
 * non-empty supplied set as CAPABILITY PRESENT and then requires every declaration to carry a
 * `governedEvidenceSourceIds` array. But the first pass on every §208 case is CAPABILITY-ABSENT by
 * the frozen architecture: its wire schema has no such property, and the pre-transmission guard
 * refuses to transmit a first-pass request that mentions one. So on a governed case the projection
 * demanded a field the model was structurally forbidden to produce.
 *
 * On AC-22 that refused the row's only declaration with `GOVERNED_SOURCE_IDS_NOT_AN_ARRAY`
 * ("governedEvidenceSourceIds is undefined") even though the declaration carried all eleven
 * required fields correctly. AC-23 and AC-24 produced no declarations, so nothing was refused
 * there, and the twenty-one non-governed cases already passed an empty supplied set and are
 * unaffected.
 *
 * ==================== WHY RE-DERIVING IS NOT MID-RUN REMEDIATION ====================
 *
 * Nothing here re-runs anything, changes any prompt, schema, contract, boundary, truth item, gate,
 * denominator or representation. The MODEL OUTPUT IS FIXED AND PRESERVED; this reads that persisted
 * output and re-runs a DETERMINISTIC function with the parameterisation the frozen architecture
 * requires. The original `PROJECTION-208.jsonl` is left byte-untouched and the corrected derivation
 * is written to a SEPARATE file, so both are in the evidence and neither replaces the other.
 *
 * Leaving it uncorrected would have converted a harness defect into an apparent contract failure
 * against the model, which the §204 rule -- a structural, contract or tooling failure is never
 * converted into a semantic verdict -- forbids in the other direction too. §206's
 * LOCAL_SMOKE_EXECUTOR_GUARD_DEFECT is the precedent: an executor defect is classified as one,
 * corrected to its actual meaning, and reported rather than absorbed.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { projectDeclaredOwedFacts } from './lib/expert-first-pass-owed-fact-projection';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';
import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const RAW = join(EVID, 'RAW-FIRST-PASS-208.jsonl');
const ORIGINAL = join(EVID, 'PROJECTION-208.jsonl');
const CORRECTED = join(EVID, 'PROJECTION-208-CORRECTED.jsonl');

if (existsSync(CORRECTED)) {
  throw new Error('§208 ABORT: PROJECTION-208-CORRECTED.jsonl already exists. Refusing to '
    + 'overwrite persisted evidence.');
}

const raws = readFileSync(RAW, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as any);
const originals = readFileSync(ORIGINAL, 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l) as any);

const lines: string[] = [];
const changed: string[] = [];

for (const c of FROZEN_TRUTH_CASES) {
  const r = raws.find(x => x.caseId === c.caseId);
  if (r === undefined) throw new Error(`§208: no raw first-pass record for ${c.caseId}`);
  const declarations = Array.isArray(r.parsed?.unresolvedFactDeclarations)
    ? r.parsed.unresolvedFactDeclarations as unknown[]
    : [];

  // THE CORRECTION, and the whole of it: the first pass is capability-ABSENT on every case, so the
  // supplied governed set at FIRST-PASS PROJECTION TIME is empty on every case. The governed
  // binding is applied later, by the separate §202 stage, against the facts this projection admits.
  const projection = projectDeclaredOwedFacts({
    declarations,
    sources: [{ sourceId: `OBS-${c.caseId}`, text: c.observation }],
    suppliedGovernedSourceIds: [],
    stage: 'FIRST_PASS_MODEL',
  });
  const preservation = preserveIdentifiedSafetyFacts(projection, declarations);

  const record = {
    caseId: c.caseId,
    derivation: 'CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION',
    supersedes: 'the corresponding line of PROJECTION-208.jsonl, which is preserved untouched',
    projectionVersion: projection.version,
    rawDeclarationCount: declarations.length,
    admittedCount: projection.facts.length,
    refusedCount: projection.refusedCount,
    perDeclaration: projection.perDeclaration.map(p => ({
      declarationId: p.declarationId,
      admitted: p.admitted,
      codes: p.codes,
      detail: p.detail,
      factKey: p.factKey,
      owedFact: p.owedFact,
    })),
    declarationIdToFactKey: projection.declarationIdToFactKey,
    rr7: {
      preservedCount: preservation.preserved.length,
      preserved: preservation.preserved,
      dispositions: preservation.dispositions,
      safetyStateComplete: preservation.safetyStateComplete,
      totalLossOnThisRow: preservation.totalLossOnThisRow,
    },
    governedIdsNamedByDeclarations: declarations
      .map((d: any) => (Array.isArray(d?.governedEvidenceSourceIds)
        ? d.governedEvidenceSourceIds as string[] : []))
      .flat(),
    timestamp: new Date().toISOString(),
  };
  lines.push(JSON.stringify(record));

  const before = originals.find(x => x.caseId === c.caseId);
  const same = before !== undefined
    && before.admittedCount === record.admittedCount
    && before.refusedCount === record.refusedCount
    && JSON.stringify(before.perDeclaration.map((p: any) => p.codes))
      === JSON.stringify(record.perDeclaration.map(p => p.codes));
  if (!same) {
    changed.push(c.caseId);
    console.log(`  CHANGED ${c.caseId}: admitted ${String(before?.admittedCount)} -> `
      + `${record.admittedCount}, refused ${String(before?.refusedCount)} -> ${record.refusedCount}`);
  }
}

writeFileSync(CORRECTED, `${lines.join('\n')}\n`);

console.log('\n================ §208 PROJECTION RE-DERIVATION');
console.log(`  cases re-derived      : ${lines.length}`);
console.log(`  cases whose outcome changed: ${changed.length} (${changed.join(', ') || 'none'})`);
console.log('  original PROJECTION-208.jsonl: PRESERVED, byte-untouched');
console.log('  provider calls: 0   database operations: 0');
