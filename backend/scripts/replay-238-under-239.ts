/**
 * §239 — DIAGNOSTIC REPLAY OF THE SPENT §238 OUTPUTS UNDER THE §239 CONTRACT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IN THE §238 PACKAGE IS READ FOR WRITING.
 *
 * >>> THIS IS NOT AN ACCEPTANCE COHORT AND IT IS NOT A RESCORE. The §238 verdict is FAILED and it
 * >>> stays FAILED; this file does not touch SECTION-238-JUDGMENT.json and does not recompute it.
 * >>> §238 is spent evidence. Spent evidence may DIAGNOSE a defect, and that is the whole of what
 * >>> this file does: it asks whether the deterministic rule §239 changed is the rule that refused
 * >>> B1, and whether B2 and C1 still refuse. The local suite, on generalized fixtures, is what
 * >>> PROVES the repair. This is corroboration that the repair is aimed at the demonstrated defect.
 *
 * The transmitted schema is the §237 schema the model actually saw, because the replay must feed
 * the validator exactly the bytes the provider returned against exactly the contract it received.
 * The defective outputs are the instrument here and NOT ONE OF THEM IS REPAIRED.
 */
import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { CONFIRMATION_CASES_238 } from './lib/expert-238-confirmation-instrument';
import { assembleFirstPass238 } from './lib/expert-238-assembly';
import { projectPosture237 } from './lib/expert-237-posture-projection';
import { projectPosture239 } from './lib/expert-239-posture-projection';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-238-final-posture-confirmation-2026-09-11');
const RAW = join(EVID, 'RAW-238-FIRST-PASS.jsonl');
if (!existsSync(RAW)) throw new Error('§239 REPLAY ABORT: no §238 raw provider output on disk');

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const rows = readFileSync(RAW, 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l) as Record<string, any>);
const byCase = new Map(rows.map(r => [r.caseId as string, r]));
const asm = new Map(assembleFirstPass238().map(x => [x.caseId, x]));

const results = CONFIRMATION_CASES_238.map(c => {
  const parsed = (byCase.get(c.caseId)?.parsed ?? null) as unknown;
  const schema = asm.get(c.caseId)!.wireSchema;
  const a = projectPosture237(parsed, schema);
  const b = projectPosture239(parsed, schema);
  return {
    caseId: c.caseId,
    rawOutputModified: false,
    section237: { admitted: a.admitted, codes: [...a.codes] },
    section239: { admitted: b.admitted, codes: [...b.codes] },
    changed: a.admitted !== b.admitted
      || JSON.stringify([...a.codes].sort()) !== JSON.stringify([...b.codes].sort()),
    admittedPostureUnder239: b.posture?.posture ?? null,
    controllingDriversUnder239: b.derivedControllingDrivers.map(d => ({
      ref: d.ref, refKind: d.refKind, role: d.driverRole })),
    cessationDriversUnder239: b.derivedCessationDrivers.length,
  };
});

const expected: Readonly<Record<string, 'ADMITTED' | 'REFUSED'>> = {
  A1: 'ADMITTED', A2: 'ADMITTED', B1: 'ADMITTED', B2: 'REFUSED', C1: 'REFUSED', C2: 'ADMITTED',
};
const mismatches = results.filter(r =>
  (r.section239.admitted ? 'ADMITTED' : 'REFUSED') !== expected[r.caseId]);

const doc = {
  artifact: 'SECTION-239-DIAGNOSTIC-REPLAY-OF-238',
  version: 'hazlenz.expert.239.replay.v1',
  providerCalls: 0, databaseOperations: 0,
  whatThisIs: 'A DIAGNOSTIC ON SPENT EVIDENCE. It asks whether the deterministic rule §239 changed '
    + 'is the rule that refused §238 B1, and whether B2 and C1 still refuse.',
  whatThisIsNot: [
    'NOT an acceptance cohort. §238 is spent and may never serve as the acceptance cohort for the '
      + 'successor it diagnosed.',
    'NOT a rescore. The frozen §238 judgment is FAILED, is untouched by this file, and stays FAILED.',
    'NOT the proof of the repair. The generalized local fixtures in the §239 suite are that proof.',
    'NOT evidence of any semantic behaviour. No provider was called.',
  ],
  section238RawUnmodified: true,
  section238JudgmentUnmodified: true,
  defectiveOutputsRepaired: 0,
  transmittedSchema: 'the §237 schema the provider actually received, unchanged',
  expectedUnderTheRepair: expected,
  mismatches: mismatches.map(m => m.caseId),
  results,
  rawFileDigest: sha(readFileSync(RAW, 'utf8')),
};

const OUT = join(ROOT, 'verification', 'expert-hazlenz-239-contract-binding-closure-2026-09-11');
if (process.argv[2] === '--write') {
  writeFileSync(join(OUT, 'SECTION-239-DIAGNOSTIC-REPLAY-OF-238.json'),
    JSON.stringify(doc, null, 2) + '\n');
}

console.log('§239 DIAGNOSTIC REPLAY OF THE SPENT §238 OUTPUTS — 0 provider calls, 0 db operations');
console.log('THE §238 VERDICT IS FAILED AND IS NOT RESCORED HERE.\n');
for (const r of results) {
  console.log(`  ${r.caseId}  §237 ${r.section237.admitted ? 'ADMITTED' : 'REFUSED '} `
    + `-> §239 ${r.section239.admitted ? 'ADMITTED' : 'REFUSED '}  `
    + `${r.section239.codes.join(',') || '(no codes)'}`);
}
console.log(`\n  mismatches against the repair's expectation: ${mismatches.length}`);
if (mismatches.length > 0) process.exitCode = 1;
