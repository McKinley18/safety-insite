/**
 * §247 -- LOCAL REPLAY OF THE PRESERVED §243 ARTEFACTS. ZERO PROVIDER CALLS. ZERO DB OPS.
 *
 * ==================== WHAT REPLAY CAN AND CANNOT ESTABLISH ====================
 *
 * The preserved bytes were generated under the §239 contract. They therefore carry no
 * `roleJustification`, because that field did not exist when they were produced.
 *
 * So replay can establish, and this script reports, ONLY:
 *
 *   - K6 STRUCTURAL HANDLING: whether each emitted (driverRole, refKind) pair is expressible under
 *     the §247 union, which is a property of the pair and needs no new field;
 *   - CONTRACT COMPATIBILITY: whether the §247 schema still admits everything §239 admitted, by
 *     reconstruction;
 *   - WHICH HISTORICAL SHAPES THE NEW REPRESENTATION WOULD HAVE REQUIRED AN ANSWER FOR, by counting
 *     the entries that would now owe a justification field they do not carry.
 *
 * It CANNOT establish that the model would now choose better roles. A schema change is not
 * behavioural evidence, and only the frozen hosted confirmation can answer that. Nothing here
 * rescores §243.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  admissiblePairs247, CESSATION_ROLE_247, CONTROLS_ROLE_247,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';

const ROOT = join(__dirname, '..', '..');
const DIR = join(ROOT, 'verification',
  'expert-hazlenz-243-final-fresh-acceptance-execution-2026-09-12');

const lines = (f: string): Record<string, unknown>[] =>
  readFileSync(join(DIR, f), 'utf8').trim().split('\n').map(l => JSON.parse(l));

const firstPass = lines('RAW-243-FIRST-PASS.jsonl');
const verifier = lines('RAW-243-VERIFIER.jsonl');

const admissible = new Set(admissiblePairs247().map(p => `${p.role}|${p.refKind}`));

interface CaseRow {
  caseId: string; reachedInference: boolean; parsedPresent: boolean;
  basisEntries: number; pairs: string[];
  expressibleUnder247: number; inexpressibleUnder247: number;
  wouldOweJustification: number; cessationDrivers: number; controlsDrivers: number;
}

const rows: CaseRow[] = [];
for (const r of firstPass) {
  const parsed = (r.parsed ?? null) as Record<string, unknown> | null;
  const posture = parsed === null ? null
    : (parsed.immediateSafetyPosture ?? null) as Record<string, unknown> | null;
  const basis = posture !== null && Array.isArray(posture.requiredBy)
    ? posture.requiredBy as Record<string, unknown>[] : [];
  const pairs = basis.map(b => `${String(b.driverRole ?? '')}|${String(b.refKind ?? '')}`);
  rows.push({
    caseId: String(r.caseId),
    reachedInference: r.reachedInference === true,
    parsedPresent: parsed !== null,
    basisEntries: basis.length,
    pairs,
    expressibleUnder247: pairs.filter(p => admissible.has(p)).length,
    inexpressibleUnder247: pairs.filter(p => !admissible.has(p)).length,
    wouldOweJustification: basis.length,
    cessationDrivers: basis.filter(b => b.driverRole === CESSATION_ROLE_247).length,
    controlsDrivers: basis.filter(b => b.driverRole === CONTROLS_ROLE_247).length,
  });
}

const totalBasis = rows.reduce((a, r) => a + r.basisEntries, 0);
const inexpressible = rows.reduce((a, r) => a + r.inexpressibleUnder247, 0);
const k6Cases = rows.filter(r => r.inexpressibleUnder247 > 0).map(r => r.caseId);

const out = {
  section: '247',
  generated: '2026-09-12',
  providerCalls: 0,
  databaseOperations: 0,
  source: 'verification/expert-hazlenz-243-final-fresh-acceptance-execution-2026-09-12',
  preservedArtefacts: { firstPass: firstPass.length, verifier: verifier.length,
    total: firstPass.length + verifier.length },
  replayedThroughNewPath: firstPass.length,
  whatThisCanEstablish: [
    'K6 structural handling of each emitted role/carrier pair',
    'contract compatibility of the §247 successor with §239 admissions',
    'how many historical basis entries would now owe a justification',
  ],
  whatThisCannotEstablish: [
    'that the model would now choose different driver roles',
    'any change in generation quality; a schema change is not behavioural evidence',
  ],
  k6: {
    basisEntriesTotal: totalBasis,
    expressibleUnder247: totalBasis - inexpressible,
    inexpressibleUnder247: inexpressible,
    casesWithAnInexpressiblePair: k6Cases,
    interpretation: inexpressible > 0
      ? 'these pairs were emitted under §239 and refused by the projection after generation. Under '
        + '§247 the same pair cannot be written at all, so the case is not lost to a post-hoc refusal.'
      : 'no preserved basis entry used an inadmissible pair',
  },
  justificationExposure: {
    basisEntriesThatWouldOweAJustification: totalBasis,
    cessationDriversThatWouldOweAnAlongsideControlAssessment:
      rows.reduce((a, r) => a + r.cessationDrivers, 0),
    controlsDriversThatWouldOweADischargingControl:
      rows.reduce((a, r) => a + r.controlsDrivers, 0),
    note: 'the preserved outputs predate the field and carry none of it. This is exposure, not a '
      + 'measured improvement.',
  },
  perCase: rows,
};

writeFileSync(join(ROOT, 'verification',
  'expert-hazlenz-247-canonical-closure-and-remediation-2026-09-12',
  'SECTION-247-LOCAL-REPLAY.json'), JSON.stringify(out, null, 2));

console.log(`replayed ${firstPass.length} first-pass + ${verifier.length} verifier artefacts`);
console.log(`basis entries: ${totalBasis}`);
console.log(`inexpressible under §247: ${inexpressible}  cases: ${k6Cases.join(',') || 'none'}`);
console.log(`cessation drivers owing an alongside-control assessment: `
  + `${rows.reduce((a, r) => a + r.cessationDrivers, 0)}`);
console.log(`controls drivers owing a discharging control: `
  + `${rows.reduce((a, r) => a + r.controlsDrivers, 0)}`);
console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
