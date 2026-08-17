// V5-C03 evidence-sufficiency / finalization integration.
//
// See verification/hazlenz-v5-c03-evidence-finalization-2026-08-16/V5_C03_FINALIZATION_CONTRACT.md
// for the full design record. Summary: this is a narrow, one-directional TIGHTENING of the
// protected safescope-v2.service.ts's own resultStage/mayFinalize decision -- it can only turn
// 'final' into 'provisional', never the reverse, and only for the single, empirically-validated
// case where EvidenceSufficiencyService's bottom sufficiency tier ('insufficient') coincides with
// no independently-established primary citation. It never touches unresolvedContradictions
// handling, the protected file's hardcoded safety-decisive-ID allowlist, or PRA-002/finding-review/
// inspection-completion (those remain architecturally unconnected to this field entirely, per the
// Phase 2 pipeline trace -- resultStage/mayFinalize have zero consumers in inspection.service.ts
// or the frontend today).
//
// Does not re-derive anything from raw text -- consumes only the already-computed
// EvidenceSufficiencyOutput and primaryCitation.

export type FinalizationDecision = {
  resultStage: 'final' | 'provisional';
  mayFinalize: boolean;
  blockedBy: 'evidence_sufficiency' | null;
  reason: string | null;
};

export interface MinimalEvidenceSufficiencyOutput {
  sufficiencyLevel: 'sufficient' | 'partially_sufficient' | 'weak' | 'insufficient';
  missingCriticalFacts?: string[];
}

/**
 * Pure, unit-testable decision function. Never loosens the protected gate's own decision --
 * only ever narrows 'final' to 'provisional' when a specific, narrow, evidence-grounded
 * deficiency is present.
 */
export function evaluateFinalizationGate(
  protectedResultStage: 'final' | 'provisional',
  protectedMayFinalize: boolean,
  evidenceSufficiency: MinimalEvidenceSufficiencyOutput | undefined,
  primaryCitation: string | undefined,
): FinalizationDecision {
  if (protectedResultStage === 'provisional' || !protectedMayFinalize) {
    return { resultStage: 'provisional', mayFinalize: false, blockedBy: null, reason: null };
  }

  const hasCitation = Boolean(String(primaryCitation || '').trim());
  const bottomTier = evidenceSufficiency?.sufficiencyLevel === 'insufficient';

  if (bottomTier && !hasCitation) {
    const gaps = (evidenceSufficiency?.missingCriticalFacts || []).slice(0, 4);
    return {
      resultStage: 'provisional',
      mayFinalize: false,
      blockedBy: 'evidence_sufficiency',
      reason: gaps.length
        ? `Evidence is insufficient to identify a specific hazardous condition (unresolved: ${gaps.join(', ')}).`
        : 'Evidence is insufficient to identify a specific hazardous condition.',
    };
  }

  return { resultStage: protectedResultStage, mayFinalize: protectedMayFinalize, blockedBy: null, reason: null };
}

/**
 * Builds one fallback clarification question for the blocked case, in the same shape
 * evidence-foundation.ts's own predicate-derived questions use. Only ever called when the gate
 * fired AND evidence-foundation.ts produced zero questions of its own -- never displaces a real,
 * targeted, predicate-derived question.
 */
export function buildEvidenceSufficiencyClarificationQuestion(reason: string) {
  return {
    id: 'evidence-sufficiency-insufficient',
    question: 'What specific equipment, condition, and worker exposure were observed? The description provided is too general to identify a hazardous condition.',
    reason,
    answerType: 'text' as const,
    requiredFor: 'hazard-classification' as const,
    priority: 'critical' as const,
    impactedDecisions: ['hazard-classification', 'risk', 'standard-applicability', 'corrective-action'],
    expectedEvidenceFields: ['equipment or hazard source', 'worker exposure', 'mechanism of injury'],
  };
}

/**
 * Applied as a controller-level post-process (see safescope-v2.controller.ts), the same pattern
 * evidence-foundation.ts's applyEvidenceFoundation() already uses. Mutates and returns `result`.
 */
export function applyFinalizationGate(result: any): any {
  if (!result || typeof result !== 'object') return result;
  const protectedResultStage = result.resultStage === 'provisional' ? 'provisional' : 'final';
  const protectedMayFinalize = result.mayFinalize !== false;
  const decision = evaluateFinalizationGate(
    protectedResultStage,
    protectedMayFinalize,
    result.evidenceSufficiency,
    result.primaryCitation,
  );

  if (decision.blockedBy === 'evidence_sufficiency') {
    result.resultStage = decision.resultStage;
    result.mayFinalize = decision.mayFinalize;
    result.humanReviewRequired = true;
    result.finalizationGate = { blockedBy: decision.blockedBy, reason: decision.reason };
    if (!Array.isArray(result.clarificationQuestions) || result.clarificationQuestions.length === 0) {
      result.clarificationQuestions = [buildEvidenceSufficiencyClarificationQuestion(decision.reason || '')];
    }
  }

  return result;
}
