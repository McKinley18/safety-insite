/**
 * §196 EXPERT HAZLENZ -- VERIFIER ADMISSION v3.3. SUPPLIED-SOURCE CITATION REUSE.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS.
 *
 * Composes, never mutates:
 *
 *   checkVerifierV3Output      §166, sha256 475a9577…  pinned by §192's preregistration
 *   checkVerifierV3_2Output    §194, regulatory basis + the §193 citation boundary
 *   + the supplied-source reuse rule below
 *
 * ==================== THE PROMPT IS NOT CHANGED, AND THAT IS THE DESIGN ====================
 *
 * v3 -> v3.1 -> v3.2 each changed the INSTRUCTION and so each earned a new prompt hash. v3.3 does
 * NOT: `EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT` and `VERIFIER_V3_2_RESPONSE_SCHEMA` are byte-unchanged
 * and no v3.3 instruction exists. This is an ADMISSION change only, exactly as §193's citation
 * boundary was.
 *
 * That leaves the instruction STRICTER THAN THE BOUNDARY -- the verifier is still told that a
 * citation-shaped string anywhere in its free text discards the verdict -- and the asymmetry is
 * deliberate in that direction. The goal §195 named is that FAITHFUL REUSE SHOULD NOT BE DESTROYED,
 * not that quoting should be encouraged. Referring to governed evidence by `sourceId` remains the
 * one authorised route and the prompt keeps saying so. A prompt change would invite the behaviour
 * rather than merely stop punishing it, and would cost a fourth protocol version and a fourth set of
 * hashes for no gain.
 *
 * ==================== HOW A REFUSAL IS WITHDRAWN, AND WHEN IT IS NOT ====================
 *
 * Reuse is evaluated ONLY when `PROHIBITED_REGULATORY_CITATION` is the sole thing standing against
 * the verdict. If v3.2 raised any other code -- a malformed id, an id nobody supplied, a missing
 * proposition, a broken binding -- the verdict is refused on that code and reuse is never assessed,
 * so an invalid reliance declaration can never become the authority for its own citation.
 *
 * When reuse IS assessed, EVERY citation token in EVERY scanned field must be present verbatim in
 * the text of a governed record the verdict validly relied on. v3.2's own violation list is not
 * reused for this: `checkVerifierCitationContainment` reports only the FIRST match per field, so a
 * field carrying one legitimate quotation and one invented citation would look clean after the
 * legitimate one was cleared. v3.3 re-scans every field itself and judges every token.
 *
 * ==================== WHAT IS STILL NOT CLAIMED ====================
 *
 * That the proposition is a faithful reading of the source, that the source supports the conclusion,
 * or that any legal conclusion is correct. Those were `REQUIRES_HUMAN_TRUTH` at v3.2 and are
 * unchanged: a verdict may now quote an identifier the source really contains and still be wrong
 * about what the source says. Structural reuse is not semantic validation.
 */

import { checkVerifierV3Output } from './expert-verifier-contract-v3';
import {
  checkVerifierV3_2Output, type V3_2AdmissionInput, type V3_2AdmissionResult,
} from './expert-verifier-contract-v3-2';
import { PROHIBITED_REGULATORY_CITATION, verifierFreeTextStrings } from
  './expert-verifier-citation-boundary';
import {
  decideCitationReuse, type CitationReuseVerdict, GOVERNED_CITATION_REUSE_VERSION,
} from './expert-governed-citation-reuse';

export const EXPERT_VERIFIER_CONTRACT_V3_3_VERSION = 'hazlenz.expert.verifier.v3.3' as const;

/** The one code v3.3 adds. Raised when a token is not reproduction of an authorised source. */
export const UNAUTHORISED_REGULATORY_CITATION = 'UNAUTHORISED_REGULATORY_CITATION' as const;

export const V3_3_ADMISSION_RULE_CLASSIFICATION = {
  EVERY_CITATION_TOKEN_APPEARS_IN_AN_AUTHORISED_SUPPLIED_SOURCE:
    'SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY_AFTER_CASE_AND_WHITESPACE_NORMALISATION',
  RELIANCE_WAS_VALIDLY_DECLARED_BEFORE_REUSE_IS_CONSIDERED: 'SAFE_DETERMINISTIC',
  THE_QUOTED_IDENTIFIER_MEANS_WHAT_THE_VERDICT_SAYS_IT_MEANS: 'REQUIRES_HUMAN_TRUTH',
  THE_SOURCE_SUPPORTS_THE_CONCLUSION_DRAWN: 'REQUIRES_HUMAN_TRUTH',
} as const;

export interface V3_3SuppliedGovernedEvidence {
  readonly sourceId: string;
  /** The governed record's text, exactly as supplied to the verifier. Never re-fetched. */
  readonly text: string;
}

export interface V3_3AdmissionInput extends V3_2AdmissionInput {
  /**
   * The governed evidence actually supplied with THIS request, with its text.
   *
   * v3.2 needed only the ids. Deciding reuse needs the text, which is the "small contract change"
   * §195 named as the cost of its preferred option.
   */
  readonly suppliedGovernedEvidence: readonly V3_3SuppliedGovernedEvidence[];
}

export interface V3_3AdmissionResult extends V3_2AdmissionResult {
  /** Set when the v3.2 citation refusal was withdrawn as authorised supplied-source reuse. */
  readonly citationReuseAdmitted: boolean;
  readonly citationReuse: CitationReuseVerdict | null;
  /** Tokens refused as provider-originated. Empty when the verdict was admitted. */
  readonly unauthorisedCitations: readonly string[];
}

/** Every string v3.2 scans: §193's field list plus the proposition §194 added. */
export function v3_3ScannedStrings(raw: unknown): string[] {
  const out = verifierFreeTextStrings(raw);
  const prop = (raw as Record<string, any> | null)?.regulatoryBasis?.proposition;
  if (typeof prop === 'string' && prop.length > 0) out.push(prop);
  return out;
}

const inert = (base: V3_2AdmissionResult): V3_3AdmissionResult => ({
  ...base, citationReuseAdmitted: false, citationReuse: null, unauthorisedCitations: [],
});

/**
 * The v3.3 boundary. Refuses the verdict WHOLE on any violation, as v1, v2, v3, v3.1 and v3.2 do.
 */
export function checkVerifierV3_3Output(
  raw: unknown, input: V3_3AdmissionInput,
): V3_3AdmissionResult {
  const base = checkVerifierV3_2Output(raw, {
    ...input,
    suppliedGovernedSourceIds: input.suppliedGovernedEvidence.map(g => g.sourceId),
  });
  if (base.admitted) return inert(base);

  // Reuse is considered ONLY when the citation refusal is the sole objection.
  // `codes` is typed to the v3 vocabulary and v3.2 widens with a cast, so the comparison is made
  // against the string rather than the union. The value compared is still the exact code constant.
  const otherCodes = base.codes.filter(c => (c as string) !== PROHIBITED_REGULATORY_CITATION);
  if (otherCodes.length > 0 || base.citationViolations.length === 0) return inert(base);

  // Every code has been cleared except the citation one, so the reliance declaration is known
  // valid: reliance is a member, every named sourceId was supplied, and the proposition rules hold.
  const rb = (raw as Record<string, any> | null)?.regulatoryBasis;
  const declaredIds: string[] = Array.isArray(rb?.sourceIds)
    ? rb.sourceIds.filter((id: unknown): id is string => typeof id === 'string') : [];
  const byId = new Map(input.suppliedGovernedEvidence.map(g => [g.sourceId, g.text]));
  const authorisedTexts = declaredIds
    .map(id => byId.get(id))
    .filter((t): t is string => typeof t === 'string');

  const reuse = decideCitationReuse(v3_3ScannedStrings(raw), authorisedTexts);
  if (!reuse.allReuse) {
    return {
      ...base,
      codes: [...base.codes, UNAUTHORISED_REGULATORY_CITATION as never],
      detail: [...base.detail,
        `${reuse.refused.length} citation token(s) appear in no authorised supplied source: `
        + `${[...new Set(reuse.refused)].join(', ')}`],
      citationReuseAdmitted: false,
      citationReuse: reuse,
      unauthorisedCitations: [...new Set(reuse.refused)],
    };
  }

  // Withdraw exactly the citation refusal, and nothing else.
  //
  // v3.2 pushes each violation string into BOTH `codes` (as one code) and `detail` (verbatim), so
  // both are removed by identity against `base.citationViolations`. This branch is only reachable
  // when every token is an authorised reuse, so every citation violation is withdrawn together and
  // no partial state can arise.
  const withdrawn = new Set(base.citationViolations);
  const codes = base.codes.filter(c => (c as string) !== PROHIBITED_REGULATORY_CITATION);
  const detail = base.detail.filter(d => !withdrawn.has(d));
  if (codes.length > 0) {
    // Defensive: `otherCodes` was empty, so this is unreachable. If it ever fires, the composition
    // has drifted and refusing is the correct answer.
    return { ...base, citationReuseAdmitted: false, citationReuse: reuse, unauthorisedCitations: [] };
  }

  // Recovered from the v3 layer rather than carried from a refused result. `checkVerifierV3_2Output`
  // gates `bindingAdmitted`, `nominationAdmitted` and `challengedFactKeys` on its own `admitted`, so
  // a verdict refused for the citation alone reports them false and empty even though the v3 layer
  // accepted them. Re-running v3 is pure and cheap, and restores exactly what the withdrawn refusal
  // had suppressed instead of trusting values the refusing path had already zeroed.
  const v3 = checkVerifierV3Output(raw, input);
  return {
    admitted: true,
    codes: codes as never[],
    detail,
    bindingAdmitted: v3.bindingAdmitted,
    nominationAdmitted: v3.nominationAdmitted,
    challengedFactKeys: v3.challengedFactKeys,
    citationViolations: [],
    regulatoryRelianceDeclared: rb?.reliance === 'SUPPLIED_GOVERNED_EVIDENCE',
    boundSourceIds: declaredIds,
    citationReuseAdmitted: true,
    citationReuse: reuse,
    unauthorisedCitations: [],
  };
}

/**
 * What an accepted v3.3 verdict may affect. Identical to v3.2's answer: reproducing an identifier
 * the system itself supplied creates no finding, cites nothing new into the record, changes no owed
 * fact, and confers no authority the supplied evidence did not already carry.
 */
export function verifierV3_3CitationReuseEffect(): {
  regulatoryTruthMayBeCreated: false; citationsMayBeCreated: false; owedFactCoverageMayChange: false;
  settlementMayOccur: false; quotationLengthPermissionCreated: false;
} {
  return {
    regulatoryTruthMayBeCreated: false, citationsMayBeCreated: false,
    owedFactCoverageMayChange: false, settlementMayOccur: false,
    quotationLengthPermissionCreated: false,
  };
}

export { GOVERNED_CITATION_REUSE_VERSION };
