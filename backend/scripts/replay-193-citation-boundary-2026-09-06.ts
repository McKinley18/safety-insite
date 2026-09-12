/**
 * §193 -- DETERMINISTIC CITATION-BOUNDARY REPLAY over the persisted §192 outputs.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Diagnostic only. §192's historical admission results are IMMUTABLE and are not rewritten; this
 * computes what the corrected boundary WOULD have done, and reports OLD vs NEW for all 39.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { checkVerifierV3Output, EXPERT_VERIFIER_CONTRACT_V3_VERSION } from
  './lib/expert-verifier-contract-v3';
import {
  checkVerifierV3_1Output, checkVerifierCitationContainment, verifierFreeTextStrings,
  VERIFIER_CITATION_BOUNDARY_VERSION,
} from './lib/expert-verifier-citation-boundary';
import { PROSPECTIVE_COHORT } from './lib/expert-v3-1-prospective-cohort-2026-09-06';

const ROOT = join(__dirname, '..', '..');
const EVID192 = join(ROOT, 'verification',
  'expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');
const EVID193 = join(ROOT, 'verification',
  'expert-hazlenz-verifier-v3-1-integration-readiness-hardening-2026-09-06');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const recs = readFileSync(join(EVID192, 'RAW-PROVIDER-OUTPUTS.jsonl'), 'utf8')
  .trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
  .filter(r => r.recordKind === 'BEHAVIORAL' && r.behavioralExecution === true);
const rowById = new Map(PROSPECTIVE_COHORT.map(r => [r.rowId, r]));

const executions = recs
  .slice().sort((a, b) => a.sequencePosition - b.sequencePosition)
  .map(r => {
    const row = rowById.get(r.rowId)!;
    const analysisId = `${r.rowId}-${r.replicateNumber}`;
    const enveloped = {
      ...r.parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId,
    };
    const input = { analysisId, observation: row.observation,
      suppliedOwedFactKeys: [row.owedFact.factKey] };
    const oldA = checkVerifierV3Output(enveloped, input);
    const newA = checkVerifierV3_1Output(enveloped, input);
    const cit = checkVerifierCitationContainment(enveloped);
    return {
      executionId: analysisId, rowId: r.rowId, replicate: r.replicateNumber,
      sequencePosition: r.sequencePosition,
      freeTextFieldsScanned: verifierFreeTextStrings(enveloped).length,
      OLD_ADMISSION: oldA.admitted ? 'ADMITTED' : 'REFUSED',
      OLD_CODES: [...oldA.codes],
      NEW_ADMISSION: newA.admitted ? 'ADMITTED' : 'REFUSED',
      NEW_CODES: [...newA.codes],
      citationViolations: [...cit.violations],
      changed: oldA.admitted !== newA.admitted,
    };
  });

const changed = executions.filter(e => e.changed);
const fv07 = executions.filter(e => e.rowId === 'FV-07');

const doc = {
  artifact: 'SECTION_193_CITATION_BOUNDARY_REPLAY',
  date: '2026-09-06',
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,
  diagnosticOnly: true,
  historicalImmutability:
    '§192 admission results are NOT rewritten. This is what the corrected boundary WOULD have done.',
  boundaryVersion: VERIFIER_CITATION_BOUNDARY_VERSION,
  canonicalMechanism: {
    name: 'CITATION_SHAPED_PATTERN',
    source: 'backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts',
    pattern: '\\b\\d{2}\\s*CFR\\s*\\d+',
    reused: true,
    invented: false,
    note: 'the product\'s own anti-citation-laundering mechanism, already applied to first-pass free '
      + 'text by expert-normalization.ts. §193 applies it to the verifier path, where nothing '
      + 'enforced the stated prohibition at all.',
  },
  totals: {
    executions: executions.length,
    oldAdmitted: executions.filter(e => e.OLD_ADMISSION === 'ADMITTED').length,
    newAdmitted: executions.filter(e => e.NEW_ADMISSION === 'ADMITTED').length,
    admissionChanged: changed.length,
    executionsWithCitationViolations: executions.filter(e => e.citationViolations.length > 0).length,
  },
  FV07_FINDING: {
    question: 'Does the corrected boundary refuse FV-07 R1 and R3, the outputs that motivated §193?',
    answer: 'NO — and that is the finding, not a bug.',
    fv07: fv07.map(e => ({ executionId: e.executionId, OLD: e.OLD_ADMISSION, NEW: e.NEW_ADMISSION,
      citationViolations: e.citationViolations })),
    why: 'FV-07 R1 and R3 wrote "OSHA general industry requires the work rest ... not exceeding 1/8 '
      + 'inch". There is no CFR-shaped citation string, so the canonical definition does not match. '
      + 'The authorization required refusal IF AND ONLY IF the outputs meet the actual canonical '
      + 'prohibited-citation definition. They do not, so they are not refused.',
    consequence: 'the stated prohibition is broader than any deterministic boundary the current '
      + 'representation supports. That is an architectural mismatch and is escalated rather than '
      + 'closed with a weak matcher.',
  },
  falsePositiveEvidence: {
    note: 'measured over the same 39 outputs, to show why a broader rule was NOT adopted',
    naiveOsha: 'would match 3/39 — all FV-07 — but the user prompt itself contains '
      + '"JURISDICTION: osha-general-industry", so the rule would refuse any verdict that names the '
      + 'jurisdiction it was handed',
    naiveRegulat: 'would match 4 executions across FV-11 and FV-13, where the verifier is reasoning '
      + 'CORRECTLY about the ABSENCE of governed regulatory evidence — the exact behaviour the '
      + 'architecture wants. This is a false-positive on the desired behaviour.',
    conclusion: 'no broader deterministic rule separates the prohibited class from the wanted one '
      + 'without a keyword list, and keyword instruments were retired at §160 FINDING 1.',
  },
  executions,
};
writeFileSync(join(EVID193, 'CITATION-REPLAY.json'), `${JSON.stringify(doc, null, 2)}\n`);

console.log(`replayed ${executions.length} persisted §192 executions — ZERO provider calls`);
console.log(`  OLD admitted ${doc.totals.oldAdmitted}/39   NEW admitted ${doc.totals.newAdmitted}/39   changed ${doc.totals.admissionChanged}`);
console.log(`  executions with canonical citation violations: ${doc.totals.executionsWithCitationViolations}`);
for (const e of fv07) console.log(`  FV-07#${e.replicate}  OLD=${e.OLD_ADMISSION}  NEW=${e.NEW_ADMISSION}  violations=${e.citationViolations.length}`);
console.log(`  replay sha256 ${sha(JSON.stringify(doc))}`);
