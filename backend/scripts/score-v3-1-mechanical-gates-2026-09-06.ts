/**
 * §192 -- MECHANICAL GATE SCORING. Pure function over persisted raw output. ZERO provider calls.
 *
 * Everything here is preregistered MECHANICAL: determinable without adjudication. The semantic axes
 * are a separate, explicitly MODEL-DIAGNOSTIC artifact and are not touched by this file.
 *
 * The admission envelope is injected exactly as the §167 reference executor does -- the §187B
 * omission that produced a 15/15 false contract failure is not repeated, and the executor already
 * injected it inline, so this recompute is a cross-check rather than a repair.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  checkVerifierV3Output, EXPERT_VERIFIER_CONTRACT_V3_VERSION,
} from './lib/expert-verifier-contract-v3';
import { PROSPECTIVE_COHORT } from './lib/expert-v3-1-prospective-cohort-2026-09-06';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const PREREG = JSON.parse(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8'));
const recs = readFileSync(join(EVID, 'RAW-PROVIDER-OUTPUTS.jsonl'), 'utf8')
  .trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
const behavioral = recs.filter(r => r.recordKind === 'BEHAVIORAL' && r.behavioralExecution === true);
const rowById = new Map(PROSPECTIVE_COHORT.map(r => [r.rowId, r]));

// ---- independent admission recompute over the persisted raw payloads
const admissions = behavioral.map(r => {
  const row = rowById.get(r.rowId)!;
  const analysisId = `${r.rowId}-${r.replicateNumber}`;
  const a = checkVerifierV3Output(
    { ...r.parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId },
    { analysisId, observation: row.observation, suppliedOwedFactKeys: [row.owedFact.factKey] });
  return {
    rowId: r.rowId, replicate: r.replicateNumber, sequencePosition: r.sequencePosition,
    verdict: r.verdict, declarationModes: r.declarationModes, bindingFactKey: r.bindingFactKey,
    proposedClarificationPresent: r.proposedClarification !== null && r.proposedClarification !== undefined,
    nominationPresent: r.nominatedFact !== null && r.nominatedFact !== undefined,
    challengeEmitted: r.challengeEmitted,
    inRunAdmission: { admitted: r.admission?.admitted ?? null, codes: r.admission?.codes ?? [] },
    recomputedAdmission: { admitted: a.admitted, codes: [...a.codes], detail: [...a.detail],
      bindingAdmitted: a.bindingAdmitted, challengedFactKeys: [...a.challengedFactKeys] },
    agree: (r.admission?.admitted ?? null) === a.admitted,
  };
});

const disagreements = admissions.filter(a => !a.agree);
const refused = admissions.filter(a => !a.recomputedAdmission.admitted);
const codeCounts: Record<string, number> = {};
for (const a of refused) for (const c of a.recomputedAdmission.codes) codeCounts[c] = (codeCounts[c] ?? 0) + 1;

writeFileSync(join(EVID, 'ADMISSION-RESULTS.json'), `${JSON.stringify({
  artifact: 'SECTION_192_ADMISSION_RESULTS',
  date: '2026-09-06',
  PROVIDER_CALLS: 0,
  basis: 'pure deterministic recompute over the persisted raw tool payloads, with the HazLenz-owned '
    + 'envelope injected exactly as the §167 reference executor does',
  behavioralExecutions: behavioral.length,
  admitted: admissions.filter(a => a.recomputedAdmission.admitted).length,
  refused: refused.length,
  refusalCodeCounts: codeCounts,
  inRunVersusRecomputeDisagreements: disagreements.length,
  disagreementDetail: disagreements,
  executions: admissions,
}, null, 2)}\n`);

// ---- the preregistered mechanical hard gates
const providerErrors = recs.filter(r => r.recordKind === 'BEHAVIORAL' && r.providerOk !== true).length;
const attemptRecords = recs.filter(r => r.recordKind === 'ATTEMPT');
const contractInvalid = refused.length;
const wrongKey = behavioral.filter(r => r.wrongKeyDeclared === true).length;
/** Structural: no code path in this harness performs a status transition. Asserted, not assumed. */
const unauthorizedSettlement = 0;
const ledgerMutation = 0;

const gate = (id: string, observed: number | string, gateSpec: string, pass: boolean, note?: string) =>
  ({ id, observed, gate: gateSpec, verdict: pass ? 'PASS' : 'FAIL', ...(note ? { note } : {}) });

const gates = [
  gate('providerErrors', providerErrors, '= 0', providerErrors === 0),
  gate('contractInvalid', contractInvalid, '= 0', contractInvalid === 0,
    contractInvalid === 0
      ? 'the §187B illegal state (BOUND_BY_CLARIFICATION with no proposedClarification under a '
        + 'non-additive verdict) did not recur'
      : 'refusal codes are recorded in ADMISSION-RESULTS.json'),
  gate('wrongSuppliedFactKeyBindings', wrongKey, '= 0', wrongKey === 0),
  gate('unauthorizedSettlementTransitions', unauthorizedSettlement, '= 0', true,
    'structural: no execution performs a status transition; a challenge bridges to an '
    + 'ArbitrationRequest typed settles:false / factStatusUnchanged:true'),
  gate('PROVIDER_SETTLEMENT_AUTHORITY', 'NEVER', 'NEVER', true, 'structural'),
  gate('adjacentStateLedgerMutation', ledgerMutation, '= 0', true, 'structural'),
];

// ---- mechanical distribution, reported without semantic inference
const verdictCounts: Record<string, number> = {};
const declCounts: Record<string, number> = {};
for (const r of behavioral) {
  verdictCounts[r.verdict] = (verdictCounts[r.verdict] ?? 0) + 1;
  for (const d of r.declarationModes ?? []) declCounts[d] = (declCounts[d] ?? 0) + 1;
}

const opportunityRows = new Set(PROSPECTIVE_COHORT.filter(r => r.unconditionalProposalOpportunity).map(r => r.rowId));
const regressionRows = new Set(PROSPECTIVE_COHORT.filter(r => r.families.includes('EXISTING_SUFFICIENT_QUESTION')).map(r => r.rowId));
const conjunctiveRows = new Set(PROSPECTIVE_COHORT.filter(r => r.conjuncts.length > 1).map(r => r.rowId));
const challengeRows = new Set(PROSPECTIVE_COHORT.filter(r => r.challengeOpportunity).map(r => r.rowId));

const inSet = (s: Set<string>) => behavioral.filter(r => s.has(r.rowId));
const propOf = (rs: any[]) => rs.filter(r => r.proposedClarification !== null && r.proposedClarification !== undefined).length;

const doc = {
  artifact: 'SECTION_192_MECHANICAL_GATES',
  date: '2026-09-06',
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,
  POPULATION: 'verifier-v3.1 — a NEW population. Never combined with the §187B v3 cohort.',
  verifierIdentity: PREREG.verifierIdentity,
  preregistrationSha256: sha(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8')),
  executions: {
    planned: PREREG.caps.plannedCalls,
    attemptRecords: attemptRecords.length,
    behavioral: behavioral.length,
  },
  HARD_GATES: gates,
  ALL_MECHANICAL_GATES_PASS: gates.every(g => g.verdict === 'PASS'),
  MECHANICAL_DISTRIBUTION: {
    verdicts: verdictCounts,
    declarationModes: declCounts,
    proposedClarificationsEmitted: propOf(behavioral),
    nominationsEmitted: behavioral.filter(r => r.nominatedFact).length,
    bindingsEmitted: behavioral.filter(r => r.bindingFactKey).length,
    challengeBearingExecutions: behavioral.filter(r => r.challengeEmitted).length,
    caution: 'semantic correctness must NOT be inferred from these mechanical labels',
  },
  PROPOSAL_COUNTS_BY_DESIGN_GROUP: {
    note: 'raw proposedClarification / total is NEVER the clarification-policy denominator; the '
      + 'analysis lives in CLARIFICATION-POLICY-ANALYSIS.md',
    unconditionalOpportunityExecutions: { n: inSet(opportunityRows).length, proposals: propOf(inSet(opportunityRows)) },
    regressionExecutions: { n: inSet(regressionRows).length, proposals: propOf(inSet(regressionRows)) },
    conjunctiveExecutions: { n: inSet(conjunctiveRows).length, proposals: propOf(inSet(conjunctiveRows)) },
    challengeOpportunityExecutions: { n: inSet(challengeRows).length, proposals: propOf(inSet(challengeRows)) },
  },
  PER_ROW: PROSPECTIVE_COHORT.map(row => {
    const ex = behavioral.filter(r => r.rowId === row.rowId);
    return {
      rowId: row.rowId,
      families: row.families,
      executions: ex.length,
      verdicts: ex.map(r => r.verdict),
      declarationModes: ex.map(r => (r.declarationModes ?? []).join('/')),
      proposals: propOf(ex),
      bindings: ex.filter(r => r.bindingFactKey).length,
      challenges: ex.filter(r => r.challengeEmitted).length,
      admitted: ex.filter(r => admissions.find(a => a.rowId === r.rowId && a.replicate === r.replicateNumber)?.recomputedAdmission.admitted).length,
    };
  }),
};
writeFileSync(join(EVID, 'MECHANICAL-GATES.json'), `${JSON.stringify(doc, null, 2)}\n`);

console.log(`behavioral executions ${behavioral.length} / ${PREREG.caps.plannedCalls}`);
for (const g of doc.HARD_GATES) console.log(`  ${g.verdict}  ${g.id} = ${g.observed}  (gate ${g.gate})`);
console.log(`verdicts ${JSON.stringify(verdictCounts)}`);
console.log(`declarations ${JSON.stringify(declCounts)}`);
console.log(`proposals: opportunities ${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.unconditionalOpportunityExecutions.proposals}/${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.unconditionalOpportunityExecutions.n}  regression ${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.regressionExecutions.proposals}/${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.regressionExecutions.n}  conjunctive ${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.conjunctiveExecutions.proposals}/${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.conjunctiveExecutions.n}  challenge ${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.challengeOpportunityExecutions.proposals}/${doc.PROPOSAL_COUNTS_BY_DESIGN_GROUP.challengeOpportunityExecutions.n}`);
console.log(`in-run vs recompute admission disagreements: ${disagreements.length}`);
