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
  EXPERT_GROUNDING_STATUSES,
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
  'OUTCOME_INCONSISTENT_WITH_CONTENT',
  // governance leakage -- the anti-citation-laundering contract at the boundary
  'FORBIDDEN_GOVERNANCE_FIELD',
  'CITATION_SHAPED_TEXT_NOT_PERMITTED',
  // hazard candidates
  'CANDIDATE_MALFORMED',
  'GROUNDING_STATUS_INVALID',
  'GROUNDING_CLAIM_UNSUPPORTED',
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
  // §139 cross-collection arbitration. ITEM-scoped by design: the contradicting question is
  // refused, the candidate it contradicted survives and still reaches the reviewer.
  'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE',
  // §141. A declared link naming no emitted candidate. ITEM-scoped and NON-destructive: the link is
  // stripped, the QUESTION survives, and the broken back-reference is recorded rather than honoured.
  'CLARIFICATION_LINK_UNRESOLVED',
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
  // NEITHER §105 grounding code is fatal, and the second one was MEASURED into that position
  // rather than argued into it. `GROUNDING_CLAIM_UNSUPPORTED` was fatal first, by analogy with
  // EVIDENCE_OUT_OF_BOUNDS, and the local probe then measured what that costs: on the two grounding
  // fixtures the model over-claimed, the analysis was condemned whole, and 9 of 10 iterations
  // returned NOTHING AT ALL -- clarifications and insights that were perfectly good destroyed
  // alongside the one candidate that lied. That is §101's suppression failure returning in a new
  // costume, and this file's own header records the same lesson from L3-2i: when every refusal is
  // fatal, correct content dies with the incorrect content.
  //
  // Item-level scoping does NOT weaken the rule. The lying candidate is still discarded -- it does
  // not cross as grounded, and it does not cross at all. What survives is the material that never
  // made a false claim. The authorization for this phase names both options in as many words:
  // such a candidate "must fail closed OR remain non-authoritative".
  //
  // `GROUNDING_STATUS_INVALID` is item-level for a different and simpler reason: a missing or
  // unrecognised enum value is bad FORMATTING, not an unfounded assertion, and this list's own
  // criterion separates those.
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
  /**
   * §147 (P7). THE MODEL'S OWN OFFENDING TEXT, bounded and redacted -- set ONLY where the refused
   * thing IS a string the model wrote, which today means the three evidence-binding codes.
   *
   * §146 measured what its absence costs. One call in 24 was condemned by
   * `EVIDENCE_OUT_OF_BOUNDS -- expertHazardCandidates[2]: [-1,-1) outside observation (len 377)`,
   * and that record says exactly why the analysis was refused and nothing whatever about WHAT was
   * quoted. The run record stores the VALIDATED analysis, so on a rejection it stores nothing, and
   * the raw wire is not persisted: the offending quote for that row is unrecoverable, and no attempt
   * was made to reconstruct it. A whole row -- three candidates, a TRUE-GAP opportunity, a linkage
   * opportunity and a coverage row -- became undiagnosable.
   *
   * FOUR CONSTRAINTS, met by construction rather than by care:
   *   - it cannot contaminate accepted output: `validated` never carries issues, and all three
   *     evidence codes are in `ANALYSIS_FATAL_REASONS`, so a populated field implies `validated`
   *     is null;
   *   - it cannot reconstruct evidence: the text is copied verbatim from what the model sent and is
   *     never bound, resolved, repaired or promoted -- an unbindable quote stays unbindable;
   *   - it cannot leak a credential or provider metadata: the only source is the wire item's own
   *     `quotedText`, never the transport, the headers or the response envelope;
   *   - it cannot smuggle a citation: `CITATION_SHAPED_PATTERN` is applied before the string is
   *     kept, the same redaction the governed-record renderer uses.
   *
   * It is also bounded, so a rejection record can never become a copy of the payload.
   */
  offendingText?: string;
}

/**
 * Long enough to identify what the model quoted, short enough that a diagnostic stays a diagnostic.
 */
const OFFENDING_TEXT_MAX_CHARS = 240;

/**
 * Prepare a string the model wrote for storage on a rejection diagnostic: clip it, say how much was
 * clipped, and redact anything citation-shaped. Returns undefined for anything that is not a
 * non-empty string, so the field is simply absent rather than present-and-meaningless.
 *
 * EXPORTED FOR ITS CONTAINMENT TEST, and the reason is worth stating: in the CURRENT order the
 * redaction is UNREACHABLE. `CITATION_SHAPED_TEXT_NOT_PERMITTED` scans every string in the payload
 * and condemns the analysis before any candidate's evidence is validated, so a citation-shaped quote
 * never gets as far as this function. The redaction is a second line against a future reordering,
 * and a second line nobody can test is a second line nobody can trust -- so it is tested directly
 * rather than asserted in a comment.
 */
export function offendingTextFor(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  const clipped = value.length > OFFENDING_TEXT_MAX_CHARS
    ? `${value.slice(0, OFFENDING_TEXT_MAX_CHARS)}…[+${value.length - OFFENDING_TEXT_MAX_CHARS} chars]`
    : value;
  return clipped.replace(
    new RegExp(CITATION_SHAPED_PATTERN.source + '[\\d.()\\-a-z]*', 'gi'), '[CITATION REDACTED]');
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
      issues.push({
        code: 'EVIDENCE_SOURCE_UNKNOWN', detail: `${where}: unknown source ${item.sourceId}`,
        offendingText: offendingTextFor(item.quotedText),
      });
      return null;
    }
    const { startOffset, endOffset } = item;
    if (!Number.isInteger(startOffset) || !Number.isInteger(endOffset)
        || startOffset < 0 || endOffset > source.text.length || startOffset >= endOffset) {
      issues.push({
        code: 'EVIDENCE_OUT_OF_BOUNDS',
        detail: `${where}: [${startOffset},${endOffset}) outside ${source.sourceId} (len ${source.text.length})`,
        offendingText: offendingTextFor(item.quotedText),
      });
      return null;
    }
    if (source.text.slice(startOffset, endOffset) !== item.quotedText) {
      issues.push({
        code: 'EVIDENCE_TEXT_MISMATCH', detail: `${where}: quoted text is not the span`,
        offendingText: offendingTextFor(item.quotedText),
      });
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

  // A producer that says NOTHING_TO_ADD while shipping content has answered a question it had not
  // done the work for. §104 measured this on 27 of 27 local calls -- `NOTHING_TO_ADD` returned
  // alongside three populated collections -- because `outcome` was the FIRST property in the wire
  // schema and structured decoding therefore emitted it before any list existed. §105 moved it last.
  //
  // This is RECORDED, NOT REJECTED, and the distinction is deliberate. `outcome` is consumed
  // downstream only for `EXPERT_UNAVAILABLE`; `NOTHING_TO_ADD` gates nothing, so a rejection here
  // would discard a well-formed, useful analysis over a label. Nor is the label quietly rewritten to
  // match the content: this module resolves and refuses, it does not correct a producer's output.
  // So the inconsistency becomes a visible, countable issue that a probe can measure the repair by.
  if (outcome === 'NOTHING_TO_ADD') {
    const contentCount = (raw.expertHazardCandidates as unknown[]).length
      + (raw.decisionCriticalClarifications as unknown[]).length
      + (raw.crossHazardInsights as unknown[]).length
      + (raw.disagreements as unknown[]).length;
    if (contentCount > 0) {
      issues.push({
        code: 'OUTCOME_INCONSISTENT_WITH_CONTENT',
        detail: `outcome NOTHING_TO_ADD with ${contentCount} typed item(s) present`,
      });
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
    // --- GROUNDING DECLARATION. The producer said which case it is in; the boundary holds it to
    // --- that. This is the §105 repair, and it is enforced HERE rather than in the adapter because
    // --- the boundary is what the safety property rests on -- a provider that ignores the schema
    // --- still cannot get an unsupported grounding claim past this point.
    if (!inSet(EXPERT_GROUNDING_STATUSES, item.groundingStatus)) {
      issues.push({
        code: 'GROUNDING_STATUS_INVALID', collection: 'expertHazardCandidates', index,
        detail: `${where}: ${String(item.groundingStatus)}`,
      });
      return;
    }
    const evidence = validateEvidence(item.evidence, input, where, issues);
    if (evidence === null) return;
    // FAIL CLOSED, in both directions, because the claim and the evidence must agree. A candidate
    // claiming a quote it did not supply is discarded rather than silently demoted to ungrounded:
    // demotion would let "I have evidence" become a free assertion, which is the whole thing the
    // grounding rule exists to prevent. The reverse -- declaring no quote and then supplying one --
    // is equally a false declaration and is refused the same way. Note the ORDER: `validateEvidence`
    // has already run, so a supplied quote that does not bind exactly was already refused as
    // EVIDENCE_OUT_OF_BOUNDS or EVIDENCE_TEXT_MISMATCH. Reaching this line means every quote bound.
    const claimsQuote = item.groundingStatus === 'EXACT_QUOTE_SUPPLIED';
    if (claimsQuote !== (evidence.length > 0)) {
      issues.push({
        code: 'GROUNDING_CLAIM_UNSUPPORTED', collection: 'expertHazardCandidates', index,
        detail: `${where}: declared ${item.groundingStatus} with ${evidence.length} bound quote(s)`,
      });
      return;
    }
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
      // §139. Optional and never required. An absent, blank or non-string value normalises to null,
      // which arbitration reads as "the producer declared no link" and abstains on.
      relatesToCandidateKey: isNonEmptyString(item.relatesToCandidateKey)
        ? item.relatesToCandidateKey : null,
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

  // --- G. CROSS-COLLECTION ARBITRATION. §139.
  //
  // Every stage above validates ONE collection against the contract. Nothing until now compared two
  // collections against each other, and §137 identified that absence as the architectural cause of
  // the internal-incoherence gate: candidates, clarifications and insights are generated
  // independently and were accepted independently.
  //
  // WHY THIS DROPS THE QUESTION AND NEVER THE CANDIDATE. Two rules already settled in this file
  // decide the direction. `A SUPERFLUOUS QUESTION IS DROPPED; IT NEVER DESTROYS THE ANALYSIS THAT
  // CARRIED IT`, and the §101/§105 lesson that suppressing a hazard to tidy an output is the one
  // failure this programme exists to prevent. So the ACTIVE candidate survives untouched and
  // reaches the reviewer; the question that contradicts it does not.
  //
  // WHY IT REQUIRES A DECLARED LINK. `relatesToCandidateKey` must name the candidate. §138 measured
  // what guessing costs: on the formal cohort, 6 of the 11 rows the frozen row-level gate flagged
  // fired on a question that was not an existence question at all, or concerned a different hazard
  // family than the one raised. Row-level coupling would therefore delete real questions to fix an
  // artefact. With no declared link this stage ABSTAINS -- it records nothing and drops nothing.
  // §141. LINK RESOLUTION RUNS FIRST, and it is what makes the rest of this stage honest.
  //
  // A declared key is only meaningful if it names a candidate this analysis actually emitted. v7
  // never checked: an invented key simply failed to match `activeCandidateKeys` and the stage
  // abstained, which is the RIGHT outcome reached for the WRONG reason -- an invented key and a
  // deliberate non-link were indistinguishable in the validated output and in the issue list.
  //
  // The resolution is NON-DESTRUCTIVE, and the direction follows the rule this file already
  // settled. A broken back-reference is a defect in the QUESTION'S METADATA, not evidence that the
  // question is wrong, so the question survives with `relatesToCandidateKey` normalised to `null`
  // and the break recorded against its index. Dropping the clarification would delete a possibly
  // sound question over a bad name; honouring the key would let a hallucinated identifier reach
  // arbitration, which is exactly the guessing §138 measured the cost of.
  const allCandidateKeys = new Set(candidates.map(c => c.candidateKey));
  const linkResolved: DecisionCriticalClarification[] = clarifications.map((c, index) => {
    const declared = c.relatesToCandidateKey;
    if (typeof declared !== 'string' || allCandidateKeys.has(declared)) return c;
    issues.push({
      code: 'CLARIFICATION_LINK_UNRESOLVED',
      collection: 'decisionCriticalClarifications', index,
      detail: `decisionCriticalClarifications[${index}]: relatesToCandidateKey `
        + `${JSON.stringify(declared)} names no candidate emitted in this analysis; the link is `
        + `stripped and the question is kept`,
    });
    return { ...c, relatesToCandidateKey: null };
  });

  // ARBITRATION FIRES ON `HAZARD_EXISTENCE` AND ON NOTHING ELSE, and that narrowness is deliberate.
  //
  // The system prompt's own hard prohibition names exactly this pair: never assert a candidate
  // ACTIVE and in the same response ask whether that hazard exists. `REQUIRED_CONTROL` against an
  // ACTIVE candidate is NOT a contradiction -- "the hazard is live, was the control applied?" is
  // coherent and useful, and §140's DP-B2 is precisely that shape, correctly linked and correctly
  // retained. Extending the trigger to `EXPOSURE` was considered and REFUSED: no evidence supports
  // it, and a wider trigger would suppress real questions to make a metric look better, which is
  // the failure this programme exists to prevent.
  const activeCandidateKeys = new Set(
    candidates.filter(c => c.assertedConditionState === 'ACTIVE').map(c => c.candidateKey));
  const arbitrated: DecisionCriticalClarification[] = [];
  linkResolved.forEach((c, index) => {
    if (c.affectedDecision === 'HAZARD_EXISTENCE'
        && typeof c.relatesToCandidateKey === 'string'
        && activeCandidateKeys.has(c.relatesToCandidateKey)) {
      issues.push({
        code: 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE',
        collection: 'decisionCriticalClarifications', index,
        detail: `decisionCriticalClarifications[${index}]: asks whether the hazard exists while `
          + `candidate ${c.relatesToCandidateKey} is asserted ACTIVE`,
      });
      return;
    }
    arbitrated.push(c);
  });

  if (disagreementFatal || issues.some(i => isFatal(i.code))) return reject();

  const analysis: ExpertAnalysis = {
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    analysisId: input.analysisId,
    outcome,
    expertHazardCandidates: candidates,
    decisionCriticalClarifications: arbitrated,
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
