/** §227 -- readable raw results, derived from RAW-227.jsonl without altering it. */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-227-hosted-semantic-capability-confirmation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const raw = readFileSync(join(EVID, 'RAW-227.jsonl'), 'utf8');
const rows = raw.split('\n').filter(Boolean).map(l => JSON.parse(l));

const doc = {
  artifact: 'SECTION-227-RAW-RESULTS',
  derivedFrom: 'RAW-227.jsonl',
  rawLedgerSha256: sha(raw),
  note: 'Provider output is recorded exactly. No malformed field was repaired and no stringified '
    + 'structured field was parsed. This file is a readable projection of the raw ledger and is '
    + 'never a substitute for it.',
  frozenProtocolDigest: rows[0]?.frozenDigest ?? null,
  callsExecuted: rows.length,
  spendUsd: Number(rows[rows.length - 1]?.cumulativeSpendUsd ?? 0),
  calls: rows.map((r: Record<string, any>) => ({
    callIndex: r.callIndex, arm: r.arm, callKind: r.callKind,
    contingencyReason: r.contingencyReason, caseId: r.caseId,
    contractVersion: r.contractVersion,
    instructionIdentity: r.instructionIdentity,
    userPromptIdentity: r.userPromptIdentity,
    wireSchemaIdentity: r.wireSchemaIdentity,
    requestedModel: r.requestedModel, respondedModel: r.respondedModel,
    httpStatus: r.httpStatus, stopReason: r.stopReason, failureClass: r.failureClass,
    inputTokens: r.inputTokens, outputTokens: r.outputTokens, costUsd: r.costUsd,
    outputShape: r.outputShape,
    declaredProperties: Array.isArray(r.parsed?.unresolvedFactDeclarations)
      ? r.parsed.unresolvedFactDeclarations.map((d: Record<string, unknown>) => ({
        declarationId: d.declarationId, missingFact: d.missingFact,
        observationSpan: d.observationSpan, notEstablishedBecause: d.notEstablishedBecause,
        affectedDecision: d.affectedDecision, branchA: d.branchA, branchB: d.branchB,
        decisionIfA: d.decisionIfA, decisionIfB: d.decisionIfB,
        decisionWhileUnresolved: d.decisionWhileUnresolved,
      }))
      : r.parsed?.unresolvedFactDeclarations ?? null,
    candidateStates: Array.isArray(r.parsed?.expertHazardCandidates)
      ? r.parsed.expertHazardCandidates.map((c: Record<string, unknown>) => ({
        candidateKey: c.candidateKey, assertedConditionState: c.assertedConditionState,
        confidence: c.confidence, requiresUserConfirmation: c.requiresUserConfirmation,
        reasoning: c.reasoning,
      }))
      : null,
    uncertaintyStatements: (r.parsed?.uncertainty as Record<string, unknown> | undefined)
      ?.statements ?? null,
    summary: (r.parsed?.expertExplanation as Record<string, unknown> | undefined)?.summary ?? null,
  })),
};
writeFileSync(join(EVID, 'SECTION-227-RAW-RESULTS.json'), `${JSON.stringify(doc, null, 2)}\n`);
console.log('calls', doc.callsExecuted, 'spend', doc.spendUsd);
