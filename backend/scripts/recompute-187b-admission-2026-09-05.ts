/**
 * §187B — ADMISSION RECOMPUTE over PERSISTED RAW OUTPUT. Zero provider calls.
 *
 * The §187B run called `checkVerifierV3Output` on the model's tool payload directly. That payload
 * cannot carry `verifierContractVersion` or `analysisId`: VERIFIER_V3_RESPONSE_SCHEMA deliberately
 * does not ask for them, because they are HazLenz-owned envelope fields rather than model claims.
 * The §167 reference executor injects them before admission
 * (execute-verifier-v3-scoped-falsification-2026-09-04.ts:405-409); the §187B harness did not.
 *
 * So CONTRACT_VERSION_MISMATCH and ANALYSIS_ID_MISMATCH on all fifteen are artifacts of the SCORING
 * CALL, not contract violations by the model. Admission is a pure deterministic function over the
 * persisted raw, so the correct result is recoverable without re-spending.
 *
 * Both computations are reported. The original is not overwritten.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  checkVerifierV3Output, EXPERT_VERIFIER_CONTRACT_V3_VERSION,
} from './lib/expert-verifier-contract-v3';
import { loadFrozenRows } from './probe-balanced-clarification-hosted-2026-09-05';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-required-structured-verifier-validation-2026-09-05');

const recs = readFileSync(join(EVID, 'RESUMED-VERIFIER-EXECUTIONS.jsonl'), 'utf8')
  .trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
  .filter((r: any) => r.behavioralExecution === true);

const rows = new Map(loadFrozenRows().map(r => [r.id, r]));

const out = recs.map((r: any) => {
  const analysisId = `${r.rowId}-${r.replicateNumber}`;
  const corrected = checkVerifierV3Output(
    { ...r.parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId },
    { analysisId, observation: rows.get(r.rowId)!.text, suppliedOwedFactKeys: [r.suppliedOwedFact.factKey] },
  );
  return {
    rowId: r.rowId,
    replicate: r.replicateNumber,
    sequencePosition: r.sequencePosition,
    verdict: r.verdict,
    declarationModes: r.declarationModes,
    declaredKeys: r.declaredKeys,
    bindingFactKey: r.bindingFactKey,
    proposedClarificationPresent: r.proposedClarification !== null,
    originalAdmission: { admitted: r.admission.admitted, codes: r.admission.codes },
    correctedAdmission: {
      admitted: corrected.admitted,
      codes: [...corrected.codes],
      detail: [...corrected.detail],
      bindingAdmitted: corrected.bindingAdmitted,
      challengedFactKeys: [...corrected.challengedFactKeys],
    },
  };
});

const admitted = out.filter(o => o.correctedAdmission.admitted);
const refused = out.filter(o => !o.correctedAdmission.admitted);
const codeCounts: Record<string, number> = {};
for (const o of refused) for (const c of o.correctedAdmission.codes) codeCounts[c] = (codeCounts[c] ?? 0) + 1;

const doc = {
  artifact: 'SECTION_187B_ADMISSION_RECOMPUTE',
  date: '2026-09-05',
  PROVIDER_CALLS: 0,
  basis: 'the persisted raw tool payloads from RESUMED-VERIFIER-EXECUTIONS.jsonl. No re-spend, no stimulus change.',
  defect: {
    id: 'HARNESS_ADMISSION_ENVELOPE_OMISSION',
    what: 'the §187B harness passed the model tool payload straight to checkVerifierV3Output without the HazLenz-owned envelope fields verifierContractVersion and analysisId',
    why: 'VERIFIER_V3_RESPONSE_SCHEMA does not ask the model for those fields, so they can never be present in a tool payload. The §167 reference executor injects them before admission.',
    consequence: 'CONTRACT_VERSION_MISMATCH and ANALYSIS_ID_MISMATCH were raised on all fifteen executions',
    classification: 'VERIFICATION_INFRASTRUCTURE_DEFECT — not a model contract violation and not a behavioural result',
    originalNotOverwritten: true,
  },
  originalComputation: { admitted: 0, refused: 15 },
  correctedComputation: {
    admitted: admitted.length,
    refused: refused.length,
    refusalCodeCounts: codeCounts,
  },
  executions: out,
};
writeFileSync(join(EVID, 'ADMISSION-RECOMPUTE.json'), `${JSON.stringify(doc, null, 2)}\n`);

console.log(`corrected admitted: ${admitted.length}/15   refused: ${refused.length}/15`);
console.log('refusal codes:', JSON.stringify(codeCounts));
for (const o of refused) {
  console.log(`  REFUSED ${o.rowId}#${o.replicate}  verdict=${o.verdict}  decl=${o.declarationModes.join('/')}  bind=${o.bindingFactKey}  clar=${o.proposedClarificationPresent}`);
  console.log(`      codes: ${o.correctedAdmission.codes.join(', ')}`);
}
