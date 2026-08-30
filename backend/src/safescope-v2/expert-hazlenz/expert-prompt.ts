/**
 * EXPERT HAZLENZ -- the prompt, the structured-output schema, and the quote binder.
 *
 * PROVIDER-NEUTRAL, AND IT STAYS IN THE CORE FOR THAT REASON. Nothing here names a vendor, a model,
 * an endpoint or a credential; the module's own containment guard
 * (`test:expert-nocall-harness` section D) would fail if it did. What a provider needs is a schema
 * object and two strings, and every adapter wires those into its own request shape -- one puts the
 * schema in a `format` field, another in a tool definition. That difference is the adapter's
 * business and this file does not know about it.
 *
 * ==================== THE WIRE FORM, AND WHY IT IS NOT THE CONTRACT ====================
 *
 * A model cannot reliably produce character offsets. L3 measured this the expensive way:
 * `EVIDENCE_OUT_OF_BOUNDS` on a `highConsequence` row left zero validated candidates and took three
 * gates down with it. So the model is never asked for an offset. It is asked for the exact QUOTE,
 * and `bindWireAnalysis()` finds that quote in the supplied source and computes the offsets itself.
 *
 * THIS IS NOT A WEAKENING OF THE EVIDENCE RULE, and the distinction matters:
 *
 *   - a quote that IS in the source binds to a real span, and the core validator then re-checks
 *     that span by exact equality, exactly as it would for any other producer;
 *   - a quote that is NOT in the source binds to `[-1, -1)`, which the core validator rejects with
 *     `EVIDENCE_OUT_OF_BOUNDS`. **The unbindable quote is never dropped.** Dropping it would hide a
 *     fabrication behind a smaller, cleaner-looking result, which is the one outcome this whole
 *     programme exists to prevent.
 *
 * The binder therefore moves the failure from "the model is bad at arithmetic" to "the model quoted
 * something that is not there", which is the thing worth measuring.
 */

import {
  EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_CANDIDATE_RELATIONSHIPS,
  EXPERT_CLARIFICATION_CRITICALITY, EXPERT_CONDITION_STATES, EXPERT_CONFIDENCE_LEVELS,
  EXPERT_DISAGREEMENT_TARGETS, EXPERT_DISAGREEMENT_TYPES, EXPERT_INTERACTION_KINDS, EXPERT_OUTCOMES,
  type ExpertAnalysisInput,
} from './expert-contract.types';
import { EXPERT_AUTHORITY_SURFACES } from './expert-authority-matrix';

export const EXPERT_PROMPT_VERSION = 'hazlenz.expert.prompt.v3' as const;

/**
 * The system prompt.
 *
 * Written as instructions about AUTHORITY rather than about formatting, because the format is
 * enforced by the schema and the authority is not. Every prohibition below has a corresponding
 * refusal in `expert-normalization.ts` -- the prompt asks, the boundary enforces, and the boundary
 * is what the safety property rests on. A model that ignores every sentence here still cannot reach
 * a customer.
 */
export const EXPERT_SYSTEM_PROMPT = [
  'You are a senior safety-and-health professional reviewing a field inspection observation.',
  '',
  'YOUR ROLE IS ADVISORY AND ADDITIVE. A deterministic hazard engine and a governed regulatory',
  'corpus have already produced the authoritative result. You cannot change it, remove anything from',
  'it, or overrule it. You add reasoning, context, questions and explanation beside it.',
  '',
  '================ HOW TO DECIDE WHERE EACH FINDING GOES ================',
  '',
  'Work through these in order. Fill the typed lists FIRST; write the summary LAST.',
  '',
  '1. PLAUSIBLE HAZARDS -> expertHazardCandidates',
  '   Any hazard you think may be present that is NOT already in the deterministic findings above.',
  '   Include it even if you are unsure — set confidence LOW and requiresUserConfirmation true.',
  '   Examples that belong here: a possible confined space; a possible chemical exposure; possible',
  '   stored energy; a secondary struck-by exposure.',
  '',
  '2. MISSING FACTS THAT WOULD CHANGE A DECISION -> decisionCriticalClarifications',
  '   Any fact whose answer could change whether a hazard exists, its severity, who is exposed,',
  '   whether a rule applies, what control is required, or whether work may proceed.',
  '   Examples that belong here: Is the equipment de-energized? Has lockout/tagout been applied?',
  '   Is the pump isolated? What PPE is in use?',
  '   This list does NOT need a hazard candidate. If you have no candidate at all but the',
  '   observation is underdetermined, return an empty hazard list and a populated question list.',
  '',
  '3. CONDITIONS THAT ARE WORSE TOGETHER -> crossHazardInsights',
  '   Any two or more conditions that interact. Examples that belong here: a wet environment plus',
  '   electrical exposure; an excavation plus buried utilities; a confined space plus an atmospheric',
  '   hazard; stored energy plus lockout/tagout; mobile equipment plus pedestrians.',
  '',
  '4. CHALLENGES TO THE AUTHORITATIVE RESULT -> disagreements',
  '   ONLY when you think the deterministic result or a supplied governed record is wrong,',
  '   incomplete or needs review. Adding context is NOT a disagreement. If you are simply',
  '   contributing something new, that is a candidate or an insight, not a disagreement.',
  '',
  '5. SUMMARY -> expertExplanation.summary',
  '   Two or three sentences synthesising what you already put in the lists above.',
  '   The summary is a SUPPLEMENT. It is never the only place a hazard, a question or an',
  '   interaction appears. If you find yourself writing "no information about whether X" in the',
  '   summary, X is a decisionCriticalClarification and belongs in that list too.',
  '',
  '6. UNCERTAINTY -> uncertainty.statements',
  '   ONLY residual ambiguity you could not turn into a candidate, a question or an insight.',
  '   It is not an overflow channel. If an uncertainty can be phrased as a question that would',
  '   change a decision, it is a decisionCriticalClarification, not an uncertainty.',
  '',
  'THE NO-LOSS RULE. If something you identified meets the criteria for one of the typed lists, it',
  'MUST appear in that list — even if you also mention it in the summary. Free text supplements the',
  'structure; it never replaces it.',
  '',
  'Not every sentence of the summary needs to map to a list. Only the things that meet the criteria.',
  '',
  '================ HARD PROHIBITIONS ================',
  '',
  'Output violating any of these is rejected in full:',
  '- NEVER write a regulatory citation. Not in a field, not in prose, not as an example.',
  '  Do not write things of the form "29 CFR 1910.147" or "30 CFR 56.12016" anywhere.',
  '- NEVER invent a standard, a release identifier, an approval state or a review status.',
  '- NEVER claim a regulation requires something unless a supplied governed record says so.',
  '- NEVER assert a condition is ACTIVE when the observation does not establish present exposure.',
  '  If you cannot establish the state, say INSUFFICIENT_EVIDENCE or UNKNOWN. Both are real answers.',
  '',
  'EVIDENCE. If you quote the observation, copy the characters EXACTLY — verbatim, including case',
  'and punctuation. Do not paraphrase a quote and never quote text that is not present; an invented',
  'quote is rejected.',
  'BUT A QUOTE IS OPTIONAL. If you cannot find an exact span to quote, still raise the candidate',
  'with an empty evidence list. An unquoted candidate is worth far more than a silent one. Never',
  'drop a hazard you believe may be present just because you cannot quote it.',
  '',
  'NOTHING_TO_ADD is correct ONLY when the observation is complete and the condition is already',
  'controlled — every relevant fact is stated and nothing is left open. It is NOT correct when a',
  'fact you would want is missing: that is a decisionCriticalClarification, and the lists should not',
  'be empty. Before returning NOTHING_TO_ADD, check that you wrote no "no information about..." and',
  'no "it is unclear whether..." anywhere — each of those is a question you owe.',
  'Do not invent a hazard, a question or an interaction to fill a list either. Both mistakes cost.',
  '',
  'Return only the structured result. Do not narrate your reasoning process.',
].join('\n');

/** The surfaces a disagreement may name. Derived from the matrix, never hand-listed. */
const CHALLENGEABLE_SURFACES = EXPERT_AUTHORITY_SURFACES
  .filter(s => s.permitted.includes('CHALLENGE')).map(s => s.surface);

/**
 * The structured-output schema over the WIRE form.
 *
 * Enums are bound to THIS request's vocabularies, so an out-of-taxonomy hazard family is refused by
 * the transport before it reaches the boundary where it would be refused again. Two refusals is
 * correct: the schema saves a round trip, and the boundary is what actually decides.
 */
export function buildExpertWireSchema(input: ExpertAnalysisInput): Record<string, unknown> {
  const sourceIds = input.authoritativeSources.map(s => s.sourceId);
  const str = (description?: string) => (description ? { type: 'string', description } : { type: 'string' });

  const evidence = {
    type: 'array',
    description: 'Exact verbatim quotes copied from the observation text. MAY BE EMPTY: if you '
      + 'cannot quote exactly, raise the candidate anyway with an empty list rather than dropping '
      + 'it or inventing a quote.',
    items: {
      type: 'object',
      properties: {
        sourceId: { type: 'string', enum: sourceIds },
        quotedText: str('Copied character-for-character from the named source.'),
      },
      required: ['sourceId', 'quotedText'],
    },
  };

  return {
    type: 'object',
    properties: {
      outcome: { type: 'string', enum: [...EXPERT_OUTCOMES] },
      expertHazardCandidates: {
        type: 'array',
        description: 'Plausible hazards NOT already present in the deterministic findings. Include '
          + 'uncertain ones with LOW confidence rather than omitting them. A possible confined '
          + 'space, chemical exposure, stored energy or struck-by exposure belongs HERE, not in the '
          + 'summary.',
        items: {
          type: 'object',
          properties: {
            candidateKey: str('Short stable id, unique within this response.'),
            hazardFamily: { type: 'string', enum: [...input.allowedHazardFamilies] },
            assertedConditionState: { type: 'string', enum: [...EXPERT_CONDITION_STATES] },
            evidence,
            evidenceBasis: str('What in the observation supports this.'),
            reasoning: str('Why this constitutes a hazard.'),
            confidence: { type: 'string', enum: [...EXPERT_CONFIDENCE_LEVELS] },
            relationshipToDeterministic: { type: 'string', enum: [...EXPERT_CANDIDATE_RELATIONSHIPS] },
            requiresUserConfirmation: { type: 'boolean' },
          },
          // `evidence` is deliberately NOT required. Attempt 1 of the routing repair measured
          // zero quotes and zero candidates on 13 of 13 live calls: demanding a verbatim quote for
          // every candidate suppressed the entire collection. The contract always allowed empty
          // evidence ("legal, and scores as ungrounded"); only this list was demanding it.
          // The validator is UNCHANGED — a quote that IS supplied is still checked by exact
          // equality and a fabricated one is still rejected.
          required: ['candidateKey', 'hazardFamily', 'assertedConditionState',
                     'evidenceBasis', 'reasoning', 'confidence', 'relationshipToDeterministic',
                     'requiresUserConfirmation'],
        },
      },
      decisionCriticalClarifications: {
        type: 'array',
        description: 'Missing facts whose answer could change whether a hazard exists, its '
          + 'severity, exposure, applicability, the required control, or readiness to proceed. '
          + '"Is it de-energized?", "was lockout/tagout applied?", "is it isolated?", "what PPE?" '
          + 'belong HERE. Independent of hazards: populate this even when the hazard list is empty. '
          + 'Distinct from uncertainty — if it can be asked as a decision-changing question, it is '
          + 'a clarification, not an uncertainty.',
        items: {
          type: 'object',
          properties: {
            clarificationId: str('Short stable id, unique within this response.'),
            question: str('One question, asked plainly.'),
            whyItMatters: str('What the answer changes.'),
            affectedDecision: { type: 'string', enum: [...EXPERT_AFFECTED_DECISIONS] },
            criticality: { type: 'string', enum: [...EXPERT_CLARIFICATION_CRITICALITY] },
            evidenceGap: str('What is missing, stated as a fact rather than a question.'),
          },
          required: ['clarificationId', 'question', 'whyItMatters', 'affectedDecision',
                     'criticality', 'evidenceGap'],
        },
      },
      crossHazardInsights: {
        type: 'array',
        description: 'Two or more conditions that are worse together than separately — wet plus '
          + 'electrical, excavation plus utilities, confined space plus atmosphere, stored energy '
          + 'plus lockout/tagout, mobile equipment plus pedestrians. A real interaction belongs '
          + 'HERE, not only in the summary.',
        items: {
          type: 'object',
          properties: {
            insightId: str('Short stable id.'),
            interactionKind: { type: 'string', enum: [...EXPERT_INTERACTION_KINDS] },
            participants: { type: 'array', items: { type: 'string' },
              description: 'At least two hazard families or candidate keys.' },
            reasoning: str('Why these are worse together.'),
            confidence: { type: 'string', enum: [...EXPERT_CONFIDENCE_LEVELS] },
          },
          required: ['insightId', 'interactionKind', 'participants', 'reasoning', 'confidence'],
        },
      },
      disagreements: {
        type: 'array',
        description: 'ONLY where you challenge the deterministic result or a supplied governed '
          + 'record as wrong, incomplete or needing review. Adding new context is NOT a '
          + 'disagreement — that is a candidate or an insight.',
        items: {
          type: 'object',
          properties: {
            disagreementId: str('Short stable id.'),
            target: { type: 'string', enum: [...EXPERT_DISAGREEMENT_TARGETS] },
            surface: { type: 'string', enum: CHALLENGEABLE_SURFACES },
            targetRef: str('Which object you mean, or an empty string.'),
            disagreementType: { type: 'string', enum: [...EXPERT_DISAGREEMENT_TYPES] },
            reasoning: str('Why you disagree.'),
            confidence: { type: 'string', enum: [...EXPERT_CONFIDENCE_LEVELS] },
            recommendsReview: { type: 'boolean' },
          },
          required: ['disagreementId', 'target', 'surface', 'targetRef', 'disagreementType',
                     'reasoning', 'confidence', 'recommendsReview'],
        },
      },
      // v2: ONE field. The three arrays v1 had here were free-text twins of three typed
      // collections, and the §100 probe measured the model filling the twin instead. A field that
      // does not exist cannot compete with the collection it duplicated.
      expertExplanation: {
        type: 'object',
        description: 'A SUPPLEMENT that synthesises what is already in the typed lists. Never the '
          + 'only place a hazard, a question or an interaction appears.',
        properties: {
          summary: str('Two or three sentences an inspector could read, synthesising the lists above.'),
        },
        required: ['summary'],
      },
      uncertainty: {
        type: 'object',
        description: 'Residual ambiguity ONLY — what could not be turned into a candidate, a '
          + 'question or an insight. Not an overflow channel. Anything phrasable as a '
          + 'decision-changing question belongs in decisionCriticalClarifications instead.',
        properties: { statements: { type: 'array', items: { type: 'string' } } },
        required: ['statements'],
      },
    },
    required: ['outcome', 'expertHazardCandidates', 'decisionCriticalClarifications',
               'crossHazardInsights', 'disagreements', 'expertExplanation', 'uncertainty'],
  };
}

/** The per-request prompt. Carries the inspection context, the protected result, and the records. */
export function buildExpertUserPrompt(input: ExpertAnalysisInput): string {
  const lines: string[] = [];
  lines.push('INSPECTION CONTEXT');
  lines.push(`  jurisdiction: ${input.jurisdiction}`);
  lines.push(`  location: ${input.inspectionContext.location ?? 'not stated'}`);
  lines.push(`  task: ${input.inspectionContext.task ?? 'not stated'}`);
  lines.push('');
  lines.push('OBSERVATION SOURCES — quote from these EXACTLY');
  for (const s of input.authoritativeSources) {
    lines.push(`  [${s.sourceId}] ${s.text}`);
  }
  lines.push('');

  lines.push('DETERMINISTIC FINDINGS ALREADY ESTABLISHED (authoritative — you cannot change these)');
  if (input.deterministicFindings.length === 0) {
    lines.push('  (none — the deterministic engine established no finding)');
  } else {
    for (const f of input.deterministicFindings) {
      lines.push(`  - ${f.findingKey}: ${f.hazardFamily}, state ${f.conditionState}`
        + `${f.isLifeCritical ? ', LIFE-CRITICAL' : ''}${f.isActionable ? ', actionable' : ''}`);
      for (const a of f.requiredActions) lines.push(`      required action: ${a}`);
    }
  }
  lines.push('');

  lines.push('GOVERNED REGULATORY RECORDS SUPPLIED TO YOU');
  if (input.governedStandards.length === 0) {
    lines.push('  (none supplied — you may therefore make NO regulatory assertion at all)');
  } else {
    for (const g of input.governedStandards) {
      lines.push(`  - record ${g.citation} [${g.backingState}] ${g.title ?? ''}`);
      if (g.approvedText) lines.push(`      approved text: ${g.approvedText}`);
    }
    lines.push('  You may reason ABOUT these records. You may not introduce any other.');
  }
  lines.push('');

  if (input.answeredClarifications.length > 0) {
    lines.push('ALREADY ANSWERED');
    for (const a of input.answeredClarifications) lines.push(`  - ${a.clarificationId}: ${a.answer}`);
    lines.push('');
  }

  lines.push(`ALLOWED HAZARD FAMILIES: ${input.allowedHazardFamilies.join(', ')}`);
  lines.push('');
  lines.push('Fill the typed lists first, then write the summary. A missing decision-changing fact');
  lines.push('is a clarification, not a summary sentence. An interaction is an insight, not a summary');
  lines.push('sentence. Questions do not need a hazard to attach to.');
  return lines.join('\n');
}

// ---------------------------------------------------------------- the quote binder

export interface QuoteBindingStat {
  /** Quotes the model supplied. */
  total: number;
  /** Quotes found verbatim in their named source. */
  bound: number;
  /** Quotes NOT found. These are kept and made to fail validation, never dropped. */
  unbindable: number;
}

/**
 * Turn the wire form into the shape `normalizeExpertOutput` consumes, resolving every quote to a
 * span in the source it names.
 *
 * The only transformation is offset resolution. No field is invented, no value is corrected, and
 * nothing is filtered -- if the model said it, it reaches the boundary and the boundary decides.
 */
export function bindWireAnalysis(
  wire: unknown, input: ExpertAnalysisInput,
): { raw: Record<string, unknown>; binding: QuoteBindingStat } {
  const binding: QuoteBindingStat = { total: 0, bound: 0, unbindable: 0 };
  const byId = new Map(input.authoritativeSources.map(s => [s.sourceId, s]));

  const bindEvidence = (items: unknown): unknown[] => {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      const ref = (item ?? {}) as Record<string, unknown>;
      const sourceId = typeof ref.sourceId === 'string' ? ref.sourceId : '';
      const quotedText = typeof ref.quotedText === 'string' ? ref.quotedText : '';
      binding.total += 1;
      const source = byId.get(sourceId);
      const startOffset = source ? source.text.indexOf(quotedText) : -1;
      if (startOffset < 0 || quotedText.length === 0) {
        binding.unbindable += 1;
        // Deliberately unresolvable. The core validator answers EVIDENCE_OUT_OF_BOUNDS.
        return { sourceId, startOffset: -1, endOffset: -1, quotedText };
      }
      binding.bound += 1;
      return { sourceId, startOffset, endOffset: startOffset + quotedText.length, quotedText };
    });
  };

  const w = (wire ?? {}) as Record<string, unknown>;
  const candidates = Array.isArray(w.expertHazardCandidates) ? w.expertHazardCandidates : [];

  return {
    raw: {
      ...w,
      contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
      analysisId: input.analysisId,
      expertHazardCandidates: candidates.map(c => {
        const candidate = (c ?? {}) as Record<string, unknown>;
        return { ...candidate, evidence: bindEvidence(candidate.evidence) };
      }),
    },
    binding,
  };
}
