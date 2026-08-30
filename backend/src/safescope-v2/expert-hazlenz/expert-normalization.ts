/**
 * EXPERT HAZLENZ -- the validation / normalization boundary.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE:
 *
 *      Arbitrary provider JSON never reaches the customer workflow. It crosses here first, or it
 *      does not travel.
 *
 * ==================== TWO SEVERITIES, AND THE REASON THERE ARE TWO ====================
 *
 * L3-2i measured what happens when every refusal is fatal: `C-CS-05` had a correct HYPOTHETICAL
 * candidate discarded along with an unnecessary question the pipeline could simply have declined to
 * ask. The rule it settled on is quoted here because this file inherits it verbatim:
 *
 *      `A SUPERFLUOUS QUESTION IS DROPPED; IT NEVER DESTROYS THE ANALYSIS THAT CARRIED IT`
 *
 *   - `ANALYSIS_FATAL`  -- the provider did something that makes the WHOLE output untrustworthy:
 *     fabricated an evidence span, sent a governance field, smuggled a citation into prose, named a
 *     hazard family outside the closed vocabulary, or filed a disagreement against a surface the
 *     protection matrix does not govern. Nothing survives.
 *   - `ITEM_REJECTED`   -- one collection member is malformed or not decision-critical. That member
 *     is refused and RECORDED with a reason code; the rest of the analysis survives.
 *
 * An `ITEM_REJECTED` member does not "disappear". It fails validation, leaves an issue carrying its
 * collection, index and code, and is absent from the validated output. Those are three observable
 * facts, and the foundation suite asserts all three -- which is the difference between a boundary
 * and a filter.
 *
 * ==================== WHAT IS DELIBERATELY NOT HERE ====================
 *
 * No provider name, no transport, no model identity, no credential, no retry policy. This file
 * receives a plain object and returns a verdict. `expert-provider.ts` owns transport and
 * `expert-runner.ts` owns sequencing; a normalizer that knew about either would be a normalizer
 * that could be argued into trusting one.
 */

import {
  CITATION_SHAPED_PATTERN, EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION,
  EXPERT_CANDIDATE_RELATIONSHIPS, EXPERT_CLARIFICATION_CRITICALITY, EXPERT_CONDITION_STATES,
  EXPERT_CONFIDENCE_LEVELS, EXPERT_DISAGREEMENT_TARGETS, EXPERT_DISAGREEMENT_TYPES,
  EXPERT_INTERACTION_KINDS, EXPERT_OUTCOMES, EXPERT_VALIDATOR_VERSION,
  FORBIDDEN_EXPERT_FIELD_NAMES,
  type CrossHazardInsight, type DecisionCriticalClarification, type EvidenceReference,
  type ExpertAnalysis, type ExpertAnalysisInput, type ExpertDisagreement, type ExpertExplanation,
  type ExpertHazardCandidate, type ValidatedExpertAnalysis,
} from './expert-contract.types';
import { getAuthoritySurface } from './expert-authority-matrix';

// ---------------------------------------------------------------- reason codes

export const EXPERT_NORMALIZATION_REASONS = [
  // root structure
  'SCHEMA_INVALID',
  'CONTRACT_VERSION_MISMATCH',
  'ANALYSIS_ID_MISMATCH',
  'INVALID_OUTCOME',
  'UNAVAILABLE_CANNOT_CARRY_CONTENT',
  // governance leakage -- the anti-citation-laundering contract at the boundary
  'FORBIDDEN_GOVERNANCE_FIELD',
  'CITATION_SHAPED_TEXT_NOT_PERMITTED',
  // hazard candidates
  'CANDIDATE_MALFORMED',
  'UNSUPPORTED_HAZARD_FAMILY',
  'INVALID_CONDITION_STATE',
  'DUPLICATE_CANDIDATE_KEY',
  // evidence
  'EVIDENCE_SOURCE_UNKNOWN',
  'EVIDENCE_OUT_OF_BOUNDS',
  'EVIDENCE_TEXT_MISMATCH',
  // clarifications
  'CLARIFICATION_MALFORMED',
  'CLARIFICATION_NOT_DECISION_CRITICAL',
  'DUPLICATE_CLARIFICATION_ID',
  // cross-hazard insights
  'INSIGHT_MALFORMED',
  'INSIGHT_INSUFFICIENT_PARTICIPANTS',
  // disagreements
  'DISAGREEMENT_MALFORMED',
  'DISAGREEMENT_UNKNOWN_SURFACE',
  'DISAGREEMENT_SURFACE_NOT_CHALLENGEABLE',
  // explanation / uncertainty
  'EXPLANATION_MALFORMED',
  'UNCERTAINTY_MALFORMED',
] as const;
export type ExpertNormalizationReason = (typeof EXPERT_NORMALIZATION_REASONS)[number];

/**
 * Codes that condemn the whole analysis. Every one of them means the provider asserted something it
 * had no basis for, rather than merely formatting something badly.
 */
export const ANALYSIS_FATAL_REASONS: readonly ExpertNormalizationReason[] = [
  'SCHEMA_INVALID', 'CONTRACT_VERSION_MISMATCH', 'ANALYSIS_ID_MISMATCH', 'INVALID_OUTCOME',
  'UNAVAILABLE_CANNOT_CARRY_CONTENT',
  'FORBIDDEN_GOVERNANCE_FIELD', 'CITATION_SHAPED_TEXT_NOT_PERMITTED',
  'UNSUPPORTED_HAZARD_FAMILY', 'INVALID_CONDITION_STATE',
  'EVIDENCE_SOURCE_UNKNOWN', 'EVIDENCE_OUT_OF_BOUNDS', 'EVIDENCE_TEXT_MISMATCH',
  'DISAGREEMENT_UNKNOWN_SURFACE', 'DISAGREEMENT_SURFACE_NOT_CHALLENGEABLE',
];

export interface ExpertNormalizationIssue {
  code: ExpertNormalizationReason;
  /** Which collection the issue belongs to, when item-scoped. */
  collection?: 'expertHazardCandidates' | 'decisionCriticalClarifications'
    | 'crossHazardInsights' | 'disagreements' | 'expertExplanation' | 'uncertainty';
  /** Index within that collection, so a rejected member is locatable rather than merely counted. */
  index?: number;
  detail: string;
}

export type ExpertNormalizationState = 'VALID' | 'REJECTED';

export interface ExpertNormalizationOutcome {
  state: ExpertNormalizationState;
  /** Present only when `state === 'VALID'`. */
  validated: ValidatedExpertAnalysis | null;
  /** Every issue, fatal and item-level alike. Item-level issues appear on a VALID outcome too. */
  issues: ExpertNormalizationIssue[];
}

export function isFatal(code: ExpertNormalizationReason): boolean {
  return ANALYSIS_FATAL_REASONS.includes(code);
}

// ---------------------------------------------------------------- small helpers

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(x => typeof x === 'string');
const inSet = <T extends readonly string[]>(set: T, v: unknown): v is T[number] =>
  typeof v === 'string' && (set as readonly string[]).includes(v);

/**
 * Walks every nested key looking for a forbidden governance field name. Deep rather than shallow
 * because a provider that wants to send `citation` will happily send `{extra: {citation: ...}}`,
 * and a top-level check would pass it.
 */
function findForbiddenFields(value: unknown, path: string, out: string[], depth = 0): void {
  if (depth > 8 || value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => findForbiddenFields(v, `${path}[${i}]`, out, depth + 1));
    return;
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_EXPERT_FIELD_NAMES.includes(k)) out.push(`${path}.${k}`);
    findForbiddenFields(v, `${path}.${k}`, out, depth + 1);
  }
}

/** Every free-text string in the payload, so a citation cannot hide in prose. */
function collectStrings(value: unknown, out: string[], depth = 0): void {
  if (depth > 8) return;
  if (typeof value === 'string') { out.push(value); return; }
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach(v => collectStrings(v, out, depth + 1)); return; }
  for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out, depth + 1);
}

// ---------------------------------------------------------------- evidence

/**
 * The same equality check L3 proved against fabricated spans: resolve the source, bound the offsets,
 * and compare the quoted text to the exact substring. A provider that guessed is caught here.
 */
function validateEvidence(
  raw: unknown, input: ExpertAnalysisInput, where: string, issues: ExpertNormalizationIssue[],
): EvidenceReference[] | null {
  if (!Array.isArray(raw)) {
    issues.push({ code: 'CANDIDATE_MALFORMED', detail: `${where}: evidence is not an array` });
    return null;
  }
  const refs: EvidenceReference[] = [];
  for (const item of raw) {
    if (!isObject(item) || !isNonEmptyString(item.sourceId)
        || typeof item.startOffset !== 'number' || typeof item.endOffset !== 'number'
        || typeof item.quotedText !== 'string') {
      issues.push({ code: 'CANDIDATE_MALFORMED', detail: `${where}: malformed evidence reference` });
      return null;
    }
    const source = input.authoritativeSources.find(s => s.sourceId === item.sourceId);
    if (!source) {
      issues.push({ code: 'EVIDENCE_SOURCE_UNKNOWN', detail: `${where}: unknown source ${item.sourceId}` });
      return null;
    }
    const { startOffset, endOffset } = item;
    if (!Number.isInteger(startOffset) || !Number.isInteger(endOffset)
        || startOffset < 0 || endOffset > source.text.length || startOffset >= endOffset) {
      issues.push({
        code: 'EVIDENCE_OUT_OF_BOUNDS',
        detail: `${where}: [${startOffset},${endOffset}) outside ${source.sourceId} (len ${source.text.length})`,
      });
      return null;
    }
    if (source.text.slice(startOffset, endOffset) !== item.quotedText) {
      issues.push({ code: 'EVIDENCE_TEXT_MISMATCH', detail: `${where}: quoted text is not the span` });
      return null;
    }
    refs.push({
      sourceId: item.sourceId, sourceType: source.sourceType,
      startOffset, endOffset, quotedText: item.quotedText,
    });
  }
  return refs;
}

// ---------------------------------------------------------------- the boundary

/**
 * Turn raw provider output into a `ValidatedExpertAnalysis`, or refuse it with reasons.
 *
 * `nowIso` is injected so the validator is a pure function of its inputs -- a validated object is
 * reproducible byte-for-byte in a replay, which is what lets the no-call harness compare runs.
 */
export function normalizeExpertOutput(
  raw: unknown, input: ExpertAnalysisInput, nowIso: string,
): ExpertNormalizationOutcome {
  const issues: ExpertNormalizationIssue[] = [];
  const reject = (): ExpertNormalizationOutcome => ({ state: 'REJECTED', validated: null, issues });

  if (!isObject(raw)) {
    issues.push({ code: 'SCHEMA_INVALID', detail: 'provider output is not an object' });
    return reject();
  }

  // --- governance leakage first. A payload carrying a release id is refused before anything in it
  // --- is read, so no part of it can be partially adopted on the way to the refusal.
  const forbidden: string[] = [];
  findForbiddenFields(raw, '$', forbidden);
  if (forbidden.length > 0) {
    issues.push({ code: 'FORBIDDEN_GOVERNANCE_FIELD', detail: `forbidden field(s): ${forbidden.join(', ')}` });
    return reject();
  }
  const strings: string[] = [];
  collectStrings(raw, strings);
  const smuggled = strings.find(s => CITATION_SHAPED_PATTERN.test(s));
  if (smuggled !== undefined) {
    issues.push({
      code: 'CITATION_SHAPED_TEXT_NOT_PERMITTED',
      detail: `citation-shaped text in Expert prose: ${JSON.stringify(smuggled.slice(0, 80))}`,
    });
    return reject();
  }

  // --- root identity
  if (raw.contractVersion !== EXPERT_ANALYSIS_CONTRACT_VERSION) {
    issues.push({ code: 'CONTRACT_VERSION_MISMATCH', detail: String(raw.contractVersion) });
    return reject();
  }
  if (raw.analysisId !== input.analysisId) {
    issues.push({ code: 'ANALYSIS_ID_MISMATCH', detail: String(raw.analysisId) });
    return reject();
  }
  if (!inSet(EXPERT_OUTCOMES, raw.outcome)) {
    issues.push({ code: 'INVALID_OUTCOME', detail: String(raw.outcome) });
    return reject();
  }
  const outcome = raw.outcome;

  for (const key of ['expertHazardCandidates', 'decisionCriticalClarifications',
                     'crossHazardInsights', 'disagreements'] as const) {
    if (!Array.isArray(raw[key])) {
      issues.push({ code: 'SCHEMA_INVALID', detail: `${key} must be an array (may be empty)` });
      return reject();
    }
  }

  // A provider that says it is unavailable does not simultaneously get to send content. Otherwise
  // "unavailable" becomes a way to deliver an unscored analysis.
  if (outcome === 'EXPERT_UNAVAILABLE') {
    const anyContent = (raw.expertHazardCandidates as unknown[]).length
      + (raw.decisionCriticalClarifications as unknown[]).length
      + (raw.crossHazardInsights as unknown[]).length
      + (raw.disagreements as unknown[]).length;
    if (anyContent > 0) {
      issues.push({ code: 'UNAVAILABLE_CANNOT_CARRY_CONTENT', detail: `${anyContent} item(s) present` });
      return reject();
    }
  }

  // --- A. hazard candidates
  const candidates: ExpertHazardCandidate[] = [];
  const seenCandidateKeys = new Set<string>();
  (raw.expertHazardCandidates as unknown[]).forEach((item, index) => {
    const where = `expertHazardCandidates[${index}]`;
    if (!isObject(item) || !isNonEmptyString(item.candidateKey)
        || !isNonEmptyString(item.evidenceBasis) || !isNonEmptyString(item.reasoning)
        || !inSet(EXPERT_CONFIDENCE_LEVELS, item.confidence)
        || !inSet(EXPERT_CANDIDATE_RELATIONSHIPS, item.relationshipToDeterministic)
        || typeof item.requiresUserConfirmation !== 'boolean') {
      issues.push({ code: 'CANDIDATE_MALFORMED', collection: 'expertHazardCandidates', index, detail: where });
      return;
    }
    if (!isNonEmptyString(item.hazardFamily) || !input.allowedHazardFamilies.includes(item.hazardFamily)) {
      issues.push({
        code: 'UNSUPPORTED_HAZARD_FAMILY', collection: 'expertHazardCandidates', index,
        detail: `${where}: ${String(item.hazardFamily)}`,
      });
      return;
    }
    if (!inSet(EXPERT_CONDITION_STATES, item.assertedConditionState)) {
      issues.push({
        code: 'INVALID_CONDITION_STATE', collection: 'expertHazardCandidates', index,
        detail: `${where}: ${String(item.assertedConditionState)}`,
      });
      return;
    }
    if (seenCandidateKeys.has(item.candidateKey)) {
      issues.push({
        code: 'DUPLICATE_CANDIDATE_KEY', collection: 'expertHazardCandidates', index,
        detail: `${where}: ${item.candidateKey}`,
      });
      return;
    }
    const evidence = validateEvidence(item.evidence, input, where, issues);
    if (evidence === null) return;
    seenCandidateKeys.add(item.candidateKey);
    candidates.push({
      candidateKey: item.candidateKey,
      hazardFamily: item.hazardFamily,
      assertedConditionState: item.assertedConditionState,
      evidence,
      evidenceBasis: item.evidenceBasis,
      reasoning: item.reasoning,
      confidence: item.confidence,
      relationshipToDeterministic: item.relationshipToDeterministic,
      requiresUserConfirmation: item.requiresUserConfirmation,
    });
  });

  // --- B. clarifications. INDEPENDENT: nothing above is consulted, and an empty candidate list
  // --- has no effect on what survives here. That independence is the whole point of the shape.
  const clarifications: DecisionCriticalClarification[] = [];
  const seenClarificationIds = new Set<string>();
  (raw.decisionCriticalClarifications as unknown[]).forEach((item, index) => {
    const where = `decisionCriticalClarifications[${index}]`;
    if (!isObject(item) || !isNonEmptyString(item.clarificationId) || !isNonEmptyString(item.question)
        || !isNonEmptyString(item.whyItMatters) || !isNonEmptyString(item.evidenceGap)
        || !inSet(EXPERT_CLARIFICATION_CRITICALITY, item.criticality)) {
      issues.push({
        code: 'CLARIFICATION_MALFORMED', collection: 'decisionCriticalClarifications', index, detail: where,
      });
      return;
    }
    // L3-INV-06, restated: a question that changes no decision is not decision-critical.
    if (!inSet(EXPERT_AFFECTED_DECISIONS, item.affectedDecision)) {
      issues.push({
        code: 'CLARIFICATION_NOT_DECISION_CRITICAL', collection: 'decisionCriticalClarifications', index,
        detail: `${where}: ${String(item.affectedDecision)}`,
      });
      return;
    }
    if (seenClarificationIds.has(item.clarificationId)) {
      issues.push({
        code: 'DUPLICATE_CLARIFICATION_ID', collection: 'decisionCriticalClarifications', index,
        detail: `${where}: ${item.clarificationId}`,
      });
      return;
    }
    seenClarificationIds.add(item.clarificationId);
    clarifications.push({
      clarificationId: item.clarificationId,
      question: item.question,
      whyItMatters: item.whyItMatters,
      affectedDecision: item.affectedDecision,
      criticality: item.criticality,
      evidenceGap: item.evidenceGap,
    });
  });

  // --- C. cross-hazard insights
  const insights: CrossHazardInsight[] = [];
  (raw.crossHazardInsights as unknown[]).forEach((item, index) => {
    const where = `crossHazardInsights[${index}]`;
    if (!isObject(item) || !isNonEmptyString(item.insightId) || !isNonEmptyString(item.reasoning)
        || !inSet(EXPERT_INTERACTION_KINDS, item.interactionKind)
        || !inSet(EXPERT_CONFIDENCE_LEVELS, item.confidence)
        || !isStringArray(item.participants)) {
      issues.push({ code: 'INSIGHT_MALFORMED', collection: 'crossHazardInsights', index, detail: where });
      return;
    }
    if (item.participants.length < 2) {
      issues.push({
        code: 'INSIGHT_INSUFFICIENT_PARTICIPANTS', collection: 'crossHazardInsights', index,
        detail: `${where}: ${item.participants.length}`,
      });
      return;
    }
    insights.push({
      insightId: item.insightId,
      interactionKind: item.interactionKind,
      participants: [...item.participants],
      reasoning: item.reasoning,
      confidence: item.confidence,
    });
  });

  // --- D. disagreements. The surface must exist in the protection matrix AND must permit
  // --- CHALLENGE; every row does today, and checking rather than assuming means a future row that
  // --- does not will be refused instead of silently honoured.
  const disagreements: ExpertDisagreement[] = [];
  let disagreementFatal = false;
  (raw.disagreements as unknown[]).forEach((item, index) => {
    const where = `disagreements[${index}]`;
    if (!isObject(item) || !isNonEmptyString(item.disagreementId) || !isNonEmptyString(item.reasoning)
        || !inSet(EXPERT_DISAGREEMENT_TARGETS, item.target)
        || !inSet(EXPERT_DISAGREEMENT_TYPES, item.disagreementType)
        || !inSet(EXPERT_CONFIDENCE_LEVELS, item.confidence)
        || typeof item.recommendsReview !== 'boolean') {
      issues.push({ code: 'DISAGREEMENT_MALFORMED', collection: 'disagreements', index, detail: where });
      return;
    }
    const row = isNonEmptyString(item.surface) ? getAuthoritySurface(item.surface) : null;
    if (!row) {
      issues.push({
        code: 'DISAGREEMENT_UNKNOWN_SURFACE', collection: 'disagreements', index,
        detail: `${where}: ${String(item.surface)}`,
      });
      disagreementFatal = true;
      return;
    }
    if (!row.permitted.includes('CHALLENGE')) {
      issues.push({
        code: 'DISAGREEMENT_SURFACE_NOT_CHALLENGEABLE', collection: 'disagreements', index,
        detail: `${where}: ${row.surface}`,
      });
      disagreementFatal = true;
      return;
    }
    disagreements.push({
      disagreementId: item.disagreementId,
      target: item.target,
      surface: row.surface,
      targetRef: isNonEmptyString(item.targetRef) ? item.targetRef : null,
      disagreementType: item.disagreementType,
      reasoning: item.reasoning,
      confidence: item.confidence,
      recommendsReview: item.recommendsReview,
    });
  });

  // --- E. explanation
  // v2: SYNTHESIS ONLY. The three free-text arrays v1 carried here were twins of three typed
  // collections and the §100 probe measured the model filing its reasoning in the twin. Anything a
  // provider still sends under those names is DROPPED at this line rather than carried, because a
  // field that no longer exists in the contract must not survive by accident.
  let explanation: ExpertExplanation | null = null;
  if (raw.expertExplanation !== null && raw.expertExplanation !== undefined) {
    const e = raw.expertExplanation;
    if (!isObject(e) || !isNonEmptyString(e.summary)) {
      issues.push({ code: 'EXPLANATION_MALFORMED', collection: 'expertExplanation', detail: 'expertExplanation' });
    } else {
      explanation = { summary: e.summary };
    }
  }

  // --- F. uncertainty. Always an array on the way out, so "absent" is never a state a consumer
  // --- has to handle separately from "nothing unsettled".
  let uncertaintyStatements: string[] = [];
  if (raw.uncertainty !== null && raw.uncertainty !== undefined) {
    const u = raw.uncertainty;
    if (!isObject(u) || !isStringArray(u.statements)) {
      issues.push({ code: 'UNCERTAINTY_MALFORMED', collection: 'uncertainty', detail: 'uncertainty' });
    } else {
      uncertaintyStatements = [...u.statements];
    }
  }

  if (disagreementFatal || issues.some(i => isFatal(i.code))) return reject();

  const analysis: ExpertAnalysis = {
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    analysisId: input.analysisId,
    outcome,
    expertHazardCandidates: candidates,
    decisionCriticalClarifications: clarifications,
    crossHazardInsights: insights,
    disagreements,
    expertExplanation: explanation,
    uncertainty: { statements: uncertaintyStatements },
  };

  return {
    state: 'VALID',
    validated: {
      analysis,
      validator: {
        inputContractVersion: input.contractVersion,
        analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
        validatorVersion: EXPERT_VALIDATOR_VERSION,
        validatedAt: nowIso,
      },
    },
    issues,
  };
}
