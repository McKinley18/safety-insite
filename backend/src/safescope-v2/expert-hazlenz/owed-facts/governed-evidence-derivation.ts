/**
 * EXPERT HAZLENZ -- acceptableEvidence DERIVED FROM A GOVERNED APPROVED-KNOWLEDGE RECORD. §171.
 * INTEGRATED AND INACTIVE. NO PROVIDER CALL, NO DATABASE ACCESS.
 *
 * ==================== WHY THIS DIRECTION AND NOT THE OTHER ====================
 *
 * §169 found four clarifications that named the right owed fact and accepted evidence -- visibility,
 * a status indicator, physical inspection -- that cannot establish a protective function. The remedy
 * is to tell the verifier what would actually settle the fact. The hazard is that whoever writes
 * that criterion is authoring safety truth.
 *
 * So the criterion is not written here. It is DERIVED from an already-approved governed record that
 * existed for its own purpose long before this layer, and the derivation copies the record's own
 * vocabulary rather than paraphrasing it:
 *
 *      correctiveActionLinks.verificationMethods      ->  examples
 *      correctiveActionLinks.commonWeakActionsToAvoid ->  insufficientExamples
 *      mapping.requiredFacts + authority.citation     ->  requirement, via a fixed template
 *
 * ==================== WHAT MAKES THE TEMPLATE LEGITIMATE ====================
 *
 * `REQUIREMENT_TEMPLATE` contains no hazard, no mechanism, no control and no regulatory assertion.
 * It is a sentence frame; every substituted value comes from the record. Grep this file for a
 * hazard name and there is none, which is the property that keeps hazard-specific semantics out of
 * generic runtime.
 *
 * ==================== FAIL CLOSED, AND null IS THE NORMAL ANSWER ====================
 *
 * A record that is not `approved`, carries a placeholder citation, or names no verification method
 * yields `null` -- not a weaker criterion. Nothing is inferred from a neighbouring hazard, from
 * candidate prose, or from model output. Where governed material does not support a criterion, the
 * owed fact carries none, and the coverage machinery is unaffected because coverage has never
 * depended on evidence criteria.
 */

import type {
  ApprovedKnowledgeRecord,
} from '../../approved-knowledge-registry/approved-knowledge-record.types';
import type { AcceptableEvidence } from './owed-fact.types';

export const GOVERNED_EVIDENCE_DERIVATION_VERSION =
  'hazlenz.expert.governed-evidence-derivation.v1' as const;

/**
 * The one sentence frame. Hazard-agnostic by inspection: it names no hazard, no equipment, no
 * control family and no obligation. It states what the derived criterion IS -- governed
 * verification of a governed required fact -- and nothing about any particular workplace.
 */
export const REQUIREMENT_TEMPLATE: string =
  'Evidence establishing {REQUIRED_FACTS} by a verification method the governed record for '
  + '{CITATION} recognises.';

export const DERIVATION_REFUSAL_REASONS = [
  'NO_GOVERNED_RECORD_LINKED',
  'RECORD_NOT_APPROVED',
  'CITATION_IS_A_PLACEHOLDER',
  'NO_VERIFICATION_METHOD_IN_RECORD',
  'NO_REQUIRED_FACT_IN_RECORD',
] as const;
export type DerivationRefusalReason = (typeof DERIVATION_REFUSAL_REASONS)[number];

/**
 * Citations the registry uses to mark a record whose authority has not been settled. A record in
 * that state is approved for triage, not for stating what settles a safety fact.
 *
 * This is not a hypothetical guard: two records in the live registry carry exactly this marker.
 */
export const PLACEHOLDER_CITATION_MARKERS: readonly string[] = ['placeholder', 'review_required'];

export interface GovernedEvidenceDerivation {
  readonly acceptableEvidence: AcceptableEvidence | null;
  readonly refusedBecause: DerivationRefusalReason | null;
  /** What the criterion was read from, for observability. Never projected to a provider. */
  readonly derivedFrom: {
    readonly recordId: string;
    readonly version: string;
    readonly citation: string;
    readonly agency: string;
    readonly authorityTier: string;
    readonly jurisdiction: string;
    readonly fieldsUsed: readonly string[];
  } | null;
}

const REFUSED = (reason: DerivationRefusalReason): GovernedEvidenceDerivation =>
  ({ acceptableEvidence: null, refusedBecause: reason, derivedFrom: null });

/**
 * Derive one criterion from one governed record.
 *
 * DETERMINISTIC AND TOTAL. The same record yields the same bytes every time, and every failure
 * yields `null` with a named reason rather than a partial criterion.
 *
 * The record is passed in by whatever built the owed fact -- deterministic HazLenz, which already
 * knows which governed record backs a finding. **Nothing here searches for a record**, because a
 * search would be an inference, and inferring which governed record applies to an unresolved fact
 * is a judgement this module has no standing to make.
 */
export function deriveAcceptableEvidence(
  record: ApprovedKnowledgeRecord | null,
): GovernedEvidenceDerivation {
  if (record === null || record === undefined) return REFUSED('NO_GOVERNED_RECORD_LINKED');
  if (record.status !== 'approved') return REFUSED('RECORD_NOT_APPROVED');

  const citation = record.authority?.citation ?? '';
  const lower = citation.toLowerCase();
  if (citation.trim().length === 0
      || PLACEHOLDER_CITATION_MARKERS.some(m => lower.includes(m))) {
    return REFUSED('CITATION_IS_A_PLACEHOLDER');
  }

  const methods = (record.correctiveActionLinks?.verificationMethods ?? [])
    .filter(m => typeof m === 'string' && m.trim().length > 0);
  if (methods.length === 0) return REFUSED('NO_VERIFICATION_METHOD_IN_RECORD');

  const requiredFacts = (record.mapping?.requiredFacts ?? [])
    .filter(f => typeof f === 'string' && f.trim().length > 0);
  if (requiredFacts.length === 0) return REFUSED('NO_REQUIRED_FACT_IN_RECORD');

  const weak = (record.correctiveActionLinks?.commonWeakActionsToAvoid ?? [])
    .filter(w => typeof w === 'string' && w.trim().length > 0);

  return {
    acceptableEvidence: {
      requirement: REQUIREMENT_TEMPLATE
        .replace('{REQUIRED_FACTS}', requiredFacts.join(', '))
        .replace('{CITATION}', citation),
      // Copied, not paraphrased. The governed vocabulary reaches the verifier unaltered.
      examples: [...methods],
      insufficientExamples: [...weak],
      provenance: 'GOVERNED_EVIDENCE',
    },
    refusedBecause: null,
    derivedFrom: {
      recordId: record.recordId,
      version: record.version,
      citation,
      agency: record.authority.agency,
      authorityTier: record.authority.authorityTier,
      jurisdiction: record.authority.jurisdiction,
      fieldsUsed: [
        'status', 'authority.citation', 'authority.agency', 'authority.authorityTier',
        'authority.jurisdiction', 'mapping.requiredFacts',
        'correctiveActionLinks.verificationMethods',
        'correctiveActionLinks.commonWeakActionsToAvoid',
      ],
    },
  };
}

/**
 * WHAT THIS DERIVATION DOES NOT AND CANNOT DO, recorded so a later reader does not mistake a
 * populated criterion for more than it is.
 *
 * A governed record states how a control is verified. It does not state whether a particular
 * question asked of a particular workplace would elicit that verification. That remains
 * `CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED`, and nothing here compares a
 * question to a criterion -- there is no comparison in this file at all.
 */
export const DERIVATION_LIMITS: readonly string[] = [
  'a populated criterion states what the governed record recognises as verification; it does not '
    + 'state that any particular clarification elicits it',
  'the governed verification vocabulary is coarse and may be weaker than a specific owed fact '
    + 'requires; a criterion is a floor supplied by governance, not a guarantee of sufficiency',
  'nothing in this module compares a question to a criterion, and adding such a comparison would '
    + 'be the semantic matcher the programme has repeatedly refused to build',
];
