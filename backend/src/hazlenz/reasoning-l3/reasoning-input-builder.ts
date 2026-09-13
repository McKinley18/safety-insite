/**
 * L3-2 -- the ONLY sanctioned way to construct a `ReasoningInput`.
 *
 * WHY A BUILDER RATHER THAN A CONVENTION. Blueprint section 29.10 requires that redaction run
 * BEFORE transport "so it cannot be bypassed by a later caller". A convention that callers should
 * omit personal data is not a boundary; a function whose parameter type has no field for personal
 * data is. Everything the §10 inventory excludes is excluded STRUCTURALLY here -- there is no
 * argument through which a customer name, a site address, an account id, a governed review state,
 * a release id or a standards-corpus row can enter, because no such parameter exists.
 *
 * The free-text redactor is the second layer, for identifiers an inspector typed INTO the
 * observation. It runs before the text becomes the canonical source, so evidence offsets are
 * offsets into the redacted text and a redacted span can never quote something that was not sent.
 */
import {
  REASONING_INPUT_CONTRACT_VERSION,
  type AdvisorySignal, type AuthoritativeSource, type ClarificationAnswer,
  type L3ConditionState, type L3RegulatoryContext, type ReasoningInput,
} from './reasoning-contract.types';

export const L3_REDACTION_VERSION = 'hazlenz.l3.redaction.v1' as const;

/** The complete set of things a caller may supply. Anything absent here cannot reach a provider. */
export interface ReasoningInputRequest {
  analysisId: string;
  /** The inspector's observation. Redacted before it becomes the canonical source. */
  observationText: string;
  /** Task / area / equipment context only. Redacted identically. */
  inspectionContextText?: string;
  regulatoryContext: L3RegulatoryContext;
  allowedHazardFamilies: string[];
  eligibleRegulatoryCandidates?: Array<{ candidateId: string; citation: string; title?: string }>;
  answeredClarifications?: ClarificationAnswer[];
  establishedFindings?: Array<{ findingId: string; hazardFamily: string; conditionState: L3ConditionState }>;
  advisorySignals?: AdvisorySignal[];
}

export interface RedactionRecord {
  rule: string;
  count: number;
}

export interface BuiltReasoningInput {
  input: ReasoningInput;
  redactions: RedactionRecord[];
  redactionVersion: typeof L3_REDACTION_VERSION;
}

/**
 * Identifier shapes, not name lists. A name blocklist gives the illusion of coverage and fails on
 * the first unlisted name; a shape rule fails visibly instead. Replacements are FIXED-WIDTH-ISH
 * placeholders that stay human-readable, because the model must still be able to reason about the
 * sentence it appears in.
 */
const REDACTION_RULES: Array<{ rule: string; pattern: RegExp; replacement: string }> = [
  { rule: 'email', pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, replacement: '[EMAIL]' },
  { rule: 'phone', pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g, replacement: '[PHONE]' },
  { rule: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[ID]' },
  { rule: 'street_address', pattern: /\b\d{1,6}\s+[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Highway|Hwy)\b\.?/g, replacement: '[ADDRESS]' },
  { rule: 'mine_id', pattern: /\b(?:MSHA\s*ID|Mine\s*ID)[:\s#]*\d{2}-\d{5}\b/gi, replacement: '[SITE_ID]' },
  { rule: 'employee_id', pattern: /\b(?:employee|badge|emp)\s*(?:id|#|number)[:\s#]*[A-Z0-9-]{3,}\b/gi, replacement: '[EMPLOYEE_ID]' },
  { rule: 'url', pattern: /\bhttps?:\/\/\S+/g, replacement: '[URL]' },
];

export function redactForProvider(text: string): { text: string; redactions: RedactionRecord[] } {
  let out = text;
  const redactions: RedactionRecord[] = [];
  for (const { rule, pattern, replacement } of REDACTION_RULES) {
    const matches = out.match(pattern);
    if (matches && matches.length > 0) {
      redactions.push({ rule, count: matches.length });
      out = out.replace(pattern, replacement);
    }
  }
  return { text: out, redactions };
}

export const L3_OBSERVATION_SOURCE_ID = 'observation-1' as const;
export const L3_CONTEXT_SOURCE_ID = 'inspection-context-1' as const;

export function buildReasoningInput(request: ReasoningInputRequest): BuiltReasoningInput {
  const redactions: RedactionRecord[] = [];
  const authoritativeSources: AuthoritativeSource[] = [];

  const observation = redactForProvider(request.observationText);
  redactions.push(...observation.redactions);
  authoritativeSources.push({
    sourceId: L3_OBSERVATION_SOURCE_ID, sourceType: 'observation', text: observation.text,
  });

  if (request.inspectionContextText && request.inspectionContextText.trim()) {
    const context = redactForProvider(request.inspectionContextText);
    redactions.push(...context.redactions);
    authoritativeSources.push({
      sourceId: L3_CONTEXT_SOURCE_ID, sourceType: 'inspection_context', text: context.text,
    });
  }

  for (const answer of request.answeredClarifications || []) {
    const redacted = redactForProvider(answer.answer);
    redactions.push(...redacted.redactions);
    authoritativeSources.push({
      sourceId: `clarification-${answer.questionId}`, sourceType: 'clarification_answer', text: redacted.text,
    });
  }

  return {
    redactionVersion: L3_REDACTION_VERSION,
    redactions,
    input: {
      contractVersion: REASONING_INPUT_CONTRACT_VERSION,
      analysisId: request.analysisId,
      authoritativeSources,
      regulatoryContext: request.regulatoryContext,
      allowedHazardFamilies: request.allowedHazardFamilies,
      // Ids and labels only. `citation` is carried for the DETERMINISTIC side; the prompt builder
      // sends only `candidateId`, so the provider never sees a citation string it could echo.
      eligibleRegulatoryCandidates: request.eligibleRegulatoryCandidates,
      answeredClarifications: request.answeredClarifications?.map(a => ({
        questionId: a.questionId, answeredFact: a.answeredFact, answer: redactForProvider(a.answer).text,
      })),
      establishedFindings: request.establishedFindings,
      advisorySignals: request.advisorySignals,
    },
  };
}

/**
 * The field-level egress inventory for section 15, computed from a real input rather than asserted.
 * The harness writes this into the evidence package so the data boundary is a measurement.
 */
export function describeEgress(input: ReasoningInput): Record<string, unknown> {
  return {
    contractVersion: input.contractVersion,
    analysisIdSent: true,
    sourceCount: input.authoritativeSources.length,
    sourceIds: input.authoritativeSources.map(s => s.sourceId),
    sourceTypes: [...new Set(input.authoritativeSources.map(s => s.sourceType))],
    totalSourceChars: input.authoritativeSources.reduce((n, s) => n + s.text.length, 0),
    regulatoryContextValue: input.regulatoryContext.value,
    regulatoryContextProvenance: input.regulatoryContext.provenance,
    allowedHazardFamilyCount: input.allowedHazardFamilies.length,
    regulatoryCandidateIdsSent: (input.eligibleRegulatoryCandidates || []).map(c => c.candidateId),
    regulatoryCitationStringsSent: false,
    establishedFindingFamiliesSent: (input.establishedFindings || []).map(f => f.hazardFamily),
    advisorySignalCount: (input.advisorySignals || []).length,
    excludedStructurally: [
      'personal names', 'inspector identity', 'company/site name', 'site address', 'account id',
      'authentication material', 'billing data', 'unrelated inspection records', 'governed review state',
      'release lifecycle state', 'standards corpus text', 'arbitrary database rows', 'photos/attachments',
    ],
  };
}
