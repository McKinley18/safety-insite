/**
 * §194 EXPERT HAZLENZ -- VERIFIER ADMISSION v3.2. REGULATORY BASIS, DETERMINISTICALLY BOUND.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS.
 *
 * Composes, never mutates:
 *
 *   checkVerifierV3Output              §166, sha256 475a9577…  pinned by §192's preregistration
 *   checkVerifierCitationContainment   §193, canonical CITATION_SHAPED_PATTERN
 *   + the regulatory-basis rules below
 *
 * ==================== WHAT THIS DECIDES, AND WHAT IT CANNOT ====================
 *
 * DECIDED DETERMINISTICALLY: whether reliance was declared; whether the declaration is internally
 * consistent; whether every referenced sourceId EXISTS in the governed evidence actually supplied
 * with this request, by EXACT STRING EQUALITY against a closed set -- the same discipline v3 applies
 * to `bindingFactKey`, and the same one `expert-normalization.ts` applies to first-pass evidence via
 * `EVIDENCE_SOURCE_UNKNOWN`.
 *
 * NOT DECIDED, AND NEVER CLAIMED: whether the proposition faithfully paraphrases the source, whether
 * the source supports every word, or whether any legal conclusion is correct. Those are
 * `REQUIRES_HUMAN_TRUTH`. **Structural source binding is not legal validation.**
 *
 * ==================== WHY A CITATION STRING IS STILL REFUSED EVERYWHERE ====================
 *
 * Including inside `proposition`. A model-emitted citation is not evidence merely because it sits in
 * a structured field -- that is precisely the self-authorisation the §194 authorization forbids. The
 * ONLY authorised way to invoke regulatory authority is a `sourceId` drawn from the closed set,
 * because that id points at evidence somebody else governed. Prose remains prose.
 */

import {
  checkVerifierV3Output, type V3AdmissionInput, type V3AdmissionResult,
} from './expert-verifier-contract-v3';
import { CITATION_SHAPED_PATTERN } from
  '../expert-contract.types';
import {
  checkVerifierCitationContainment, PROHIBITED_REGULATORY_CITATION,
} from './expert-verifier-citation-boundary';
import { REGULATORY_RELIANCE_MODES } from './expert-verifier-instruction-v3-2';

export const EXPERT_VERIFIER_CONTRACT_V3_2_VERSION = 'hazlenz.expert.verifier.v3.2' as const;

export const V3_2_ADMISSION_CODES = [
  'REGULATORY_BASIS_MISSING',
  'REGULATORY_BASIS_NOT_AN_OBJECT',
  'REGULATORY_RELIANCE_NOT_A_MEMBER',
  'SOURCE_IDS_NOT_AN_ARRAY',
  'SOURCE_IDS_PRESENT_WITHOUT_RELIANCE',
  'SOURCE_IDS_MISSING_FOR_RELIANCE',
  'SOURCE_ID_MALFORMED',
  'SOURCE_ID_DUPLICATED',
  /** The one that stops self-authorisation: an id nobody supplied. */
  'SOURCE_ID_NOT_IN_SUPPLIED_SET',
  'PROPOSITION_MISSING_FOR_RELIANCE',
  'PROPOSITION_PRESENT_WITHOUT_RELIANCE',
] as const;
export type V3_2AdmissionCode = (typeof V3_2_ADMISSION_CODES)[number];

/** Recorded in code, as v3 does, so the boundary of the claim cannot drift into prose. */
export const V3_2_ADMISSION_RULE_CLASSIFICATION = {
  RELIANCE_WAS_DECLARED: 'SAFE_DETERMINISTIC',
  DECLARATION_IS_INTERNALLY_CONSISTENT: 'SAFE_DETERMINISTIC',
  EVERY_SOURCE_ID_WAS_SUPPLIED: 'SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY',
  NO_RAW_CITATION_ANYWHERE_IN_FREE_TEXT: 'SAFE_DETERMINISTIC_CANONICAL_PATTERN',
  THE_PROPOSITION_IS_A_FAITHFUL_READING_OF_THE_SOURCE: 'REQUIRES_HUMAN_TRUTH',
  THE_SOURCE_SUPPORTS_THE_CONCLUSION_DRAWN: 'REQUIRES_HUMAN_TRUTH',
  THE_LEGAL_CONCLUSION_IS_CORRECT: 'REQUIRES_HUMAN_TRUTH',
} as const;

/** Same narrow shape v3 requires of a factKey. Ids are ours, not prose. */
const SOURCE_ID_SHAPE = /^[A-Za-z0-9][A-Za-z0-9_:.\-]{0,127}$/;

export interface V3_2AdmissionInput extends V3AdmissionInput {
  /** The closed set: sourceIds of the governed evidence actually supplied with THIS request. */
  readonly suppliedGovernedSourceIds: readonly string[];
}

export interface V3_2AdmissionResult extends V3AdmissionResult {
  readonly citationViolations: readonly string[];
  readonly regulatoryRelianceDeclared: boolean;
  /** Ids admitted as bound to supplied governed evidence. Empty unless admitted with reliance. */
  readonly boundSourceIds: readonly string[];
}

/**
 * The v3.2 boundary. Refuses the verdict WHOLE on any violation, as v1, v2, v3 and v3.1 do.
 */
export function checkVerifierV3_2Output(
  raw: unknown, input: V3_2AdmissionInput,
): V3_2AdmissionResult {
  const base = checkVerifierV3Output(raw, input);
  const codes: string[] = [...base.codes];
  const detail: string[] = [...base.detail];
  const fail = (c: V3_2AdmissionCode, why: string): void => { codes.push(c); detail.push(why); };

  // ---- the §193 boundary over the v3 free-text fields, PLUS `proposition`.
  //
  // `verifierFreeTextStrings` was written at §193, before `regulatoryBasis` existed, so it does not
  // know about the proposition. It is NOT edited here -- §193 is closed evidence -- so v3.2 scans the
  // one new prose field itself, with the same canonical pattern. Without this a model could write a
  // citation into `proposition` and self-authorise inside the structure, which is exactly what the
  // §194 authorization forbids: "a model-emitted citation is not evidence merely because it is
  // structured." Caught by the §194 proof suite, D.3.
  const citation = checkVerifierCitationContainment(raw);
  const citationViolations = [...citation.violations];
  const prop0 = (raw as Record<string, any> | null)?.regulatoryBasis?.proposition;
  if (typeof prop0 === 'string') {
    const m = CITATION_SHAPED_PATTERN.exec(prop0);
    if (m) {
      citationViolations.push(
        `citation-shaped span ${JSON.stringify(m[0])} in regulatoryBasis.proposition `
        + `${JSON.stringify(prop0.slice(0, 60))}`);
    }
  }
  if (citationViolations.length > 0) {
    codes.push(PROHIBITED_REGULATORY_CITATION);
    detail.push(...citationViolations);
  }

  let declared = false;
  const bound: string[] = [];

  if (typeof raw !== 'object' || raw === null) {
    fail('REGULATORY_BASIS_MISSING', 'no output object to read a regulatory basis from');
  } else {
    const rb = (raw as Record<string, unknown>).regulatoryBasis;
    if (rb === undefined || rb === null) {
      fail('REGULATORY_BASIS_MISSING',
        'every v3.2 verdict must declare a regulatory basis, even when it is NONE');
    } else if (typeof rb !== 'object' || Array.isArray(rb)) {
      fail('REGULATORY_BASIS_NOT_AN_OBJECT', `regulatoryBasis is ${typeof rb}`);
    } else {
      const b = rb as Record<string, unknown>;
      const reliance = b.reliance;
      const ids = b.sourceIds;
      const prop = b.proposition;

      const relianceOk = typeof reliance === 'string'
        && (REGULATORY_RELIANCE_MODES as readonly string[]).includes(reliance);
      if (!relianceOk) fail('REGULATORY_RELIANCE_NOT_A_MEMBER', String(reliance));
      declared = reliance === 'SUPPLIED_GOVERNED_EVIDENCE';

      if (!Array.isArray(ids)) {
        fail('SOURCE_IDS_NOT_AN_ARRAY', `sourceIds is ${typeof ids}`);
      } else if (relianceOk) {
        if (!declared && ids.length > 0) {
          fail('SOURCE_IDS_PRESENT_WITHOUT_RELIANCE',
            `reliance NONE but ${ids.length} sourceId(s) named`);
        }
        if (declared && ids.length === 0) {
          fail('SOURCE_IDS_MISSING_FOR_RELIANCE',
            'SUPPLIED_GOVERNED_EVIDENCE must name at least one supplied sourceId');
        }
        const supplied = new Set(input.suppliedGovernedSourceIds);
        const seen = new Set<string>();
        for (const id of ids) {
          if (typeof id !== 'string' || !SOURCE_ID_SHAPE.test(id)) {
            fail('SOURCE_ID_MALFORMED', `${JSON.stringify(String(id).slice(0, 48))} is not an id`);
            continue;
          }
          if (seen.has(id)) { fail('SOURCE_ID_DUPLICATED', id); continue; }
          seen.add(id);
          // The whole point. No fuzzy match, no normalisation, no nearest neighbour.
          if (!supplied.has(id)) {
            fail('SOURCE_ID_NOT_IN_SUPPLIED_SET',
              `${JSON.stringify(id)} is not one of the ${supplied.size} supplied governed sourceIds`);
          } else {
            bound.push(id);
          }
        }
      }

      if (relianceOk) {
        const hasProp = typeof prop === 'string' && prop.trim().length > 0;
        if (declared && !hasProp) {
          fail('PROPOSITION_MISSING_FOR_RELIANCE',
            'declared reliance must say what the sources are taken to establish');
        }
        if (!declared && prop !== null && prop !== undefined) {
          fail('PROPOSITION_PRESENT_WITHOUT_RELIANCE',
            'a proposition is meaningless without declared reliance');
        }
      }
    }
  }

  const admitted = codes.length === 0;
  return {
    admitted,
    codes: codes as never[],
    detail,
    bindingAdmitted: admitted && base.bindingAdmitted,
    nominationAdmitted: admitted && base.nominationAdmitted,
    challengedFactKeys: admitted ? base.challengedFactKeys : [],
    citationViolations,
    regulatoryRelianceDeclared: admitted && declared,
    boundSourceIds: admitted && declared ? bound : [],
  };
}

/**
 * What an accepted v3.2 verdict may affect. Identical to v3's answer, restated so the new field
 * cannot quietly acquire reach: a regulatory basis is a DECLARATION ABOUT THE VERDICT'S OWN
 * REASONING. It creates no finding, cites nothing into the record, changes no owed fact, and
 * confers no authority the supplied evidence did not already carry.
 */
export function verifierV3_2RegulatoryBasisEffect(): {
  clarificationsMayChange: false; owedFactCoverageMayChange: false;
  governedEvidenceMayChange: false; citationsMayChange: false;
  regulatoryTruthMayBeCreated: false; settlementMayOccur: false;
} {
  return {
    clarificationsMayChange: false, owedFactCoverageMayChange: false,
    governedEvidenceMayChange: false, citationsMayChange: false,
    regulatoryTruthMayBeCreated: false, settlementMayOccur: false,
  };
}
