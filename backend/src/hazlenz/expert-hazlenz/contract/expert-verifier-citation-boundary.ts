/**
 * §193 -- VERIFIER CITATION CONTAINMENT BOUNDARY. DEVELOPMENT ONLY. ZERO PROVIDER CALLS.
 *
 * ==================== THE GAP THIS CLOSES, AND THE ONE IT DOES NOT ====================
 *
 * The verifier instruction says, in the v1/v2/v3/v3.1 prohibition block:
 *
 *     "YOU MAY NOT: ... cite or quote a regulation ... If you return any of the above, the whole
 *      verdict is discarded."
 *
 * That is a fail-closed claim. Until §193 NOTHING enforced it on the verifier path. The first-pass
 * path has had `CITATION_SHAPED_PATTERN` applied to free text since §105 -- `expert-normalization.ts`
 * refuses a smuggled citation and redacts citation-shaped spans -- but `checkVerifierV3Output` has
 * no citation check of any kind. A verifier could put "29 CFR 1910.212(a)(1)" in a proposed
 * clarification and be admitted. This module closes THAT hole, on the verifier path, by reusing the
 * product's own canonical mechanism rather than inventing a second one.
 *
 * ==================== WHAT IT DELIBERATELY DOES NOT CLOSE ====================
 *
 * §192 FV-07 R1 and R3 wrote "OSHA general industry requires the work rest ... not exceeding 1/8
 * inch" -- a regulatory REQUIREMENT ASSERTED IN PROSE with no citation string. That does not match
 * `CITATION_SHAPED_PATTERN` and this module does not refuse it. That is not an oversight; it is the
 * finding. See CITATION-ENFORCEMENT-ANALYSIS.md. The prose-assertion class is not deterministically
 * separable from legitimate reasoning about the ABSENCE of governed evidence without a keyword list,
 * and this programme retired keyword instruments at §160 FINDING 1.
 *
 * So: this boundary makes the ENFORCEABLE half genuinely fail-closed, and the residual gap is
 * escalated as a representation question rather than papered over with a weak matcher.
 *
 * ==================== VERSIONING ====================
 *
 * `expert-verifier-contract-v3.ts` is NOT modified. §192's preregistration pins its sha256
 * (475a9577...), and mutating it would detach the thirty-nine §192 executions from the admission
 * logic that produced them. This module composes with it instead, exactly as §191's v3.1 composed
 * with v3's prompt. The v3.1 PROMPT AND SCHEMA ARE UNCHANGED -- this is shared admission/runtime
 * logic, not a protocol change, so no v3.2 is created and §192 stays attached to its hashes.
 */

import { CITATION_SHAPED_PATTERN } from
  '../expert-contract.types';
import { checkVerifierV3Output, type V3AdmissionInput, type V3AdmissionResult } from
  './expert-verifier-contract-v3';

export const VERIFIER_CITATION_BOUNDARY_VERSION =
  'hazlenz.expert.verifier.citation-boundary.v1' as const;

/** The one code this boundary adds. Named for the class it actually decides. */
export const PROHIBITED_REGULATORY_CITATION = 'PROHIBITED_REGULATORY_CITATION' as const;

/**
 * Why the canonical pattern and not something broader, recorded in code so a later reader does not
 * "improve" it into a keyword list.
 */
export const CITATION_BOUNDARY_RULE_CLASSIFICATION = {
  CITATION_SHAPED_STRING_IN_FREE_TEXT: 'SAFE_DETERMINISTIC_CANONICAL_PATTERN',
  REGULATORY_REQUIREMENT_ASSERTED_IN_PROSE: 'NOT_DETERMINISTICALLY_DECIDABLE',
  QUOTED_REGULATORY_LANGUAGE_WITHOUT_A_CITATION_STRING: 'NOT_DETERMINISTICALLY_DECIDABLE',
} as const;

/** Every free-text field a verifier verdict can carry. Field names come from the v3/v3.1 schema. */
export function verifierFreeTextStrings(raw: unknown): string[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const o = raw as Record<string, any>;
  const out: string[] = [];
  const push = (v: unknown): void => { if (typeof v === 'string' && v.length > 0) out.push(v); };

  push(o.rationale);
  const p = o.proposedClarification;
  if (p && typeof p === 'object') {
    push(p.question); push(p.whyItMatters); push(p.evidenceGap); push(p.affectedDecision);
  }
  const n = o.nominatedFact;
  if (n && typeof n === 'object') {
    for (const k of ['missingFact', 'observationSpan', 'notEstablishedBecause', 'branchA',
      'decisionIfA', 'branchB', 'decisionIfB', 'whyNecessaryNow']) push(n[k]);
  }
  const decls = o.owedFactDeclarations;
  if (Array.isArray(decls)) for (const d of decls) if (d && typeof d === 'object') push(d.challengeReason);
  return out;
}

export interface CitationBoundaryResult {
  readonly clean: boolean;
  /** The offending strings, truncated for reporting. Never the whole verdict. */
  readonly violations: readonly string[];
}

/**
 * Apply the canonical boundary to a verifier verdict's free text.
 *
 * `CITATION_SHAPED_PATTERN` carries no /g flag, so `.test` is stateless here and cannot exhibit the
 * lastIndex bug a global regex would. Asserted by the §193 proof suite rather than assumed.
 */
export function checkVerifierCitationContainment(raw: unknown): CitationBoundaryResult {
  const violations: string[] = [];
  for (const s of verifierFreeTextStrings(raw)) {
    const m = CITATION_SHAPED_PATTERN.exec(s);
    if (m) violations.push(`citation-shaped span ${JSON.stringify(m[0])} in ${JSON.stringify(s.slice(0, 60))}`);
  }
  return { clean: violations.length === 0, violations };
}

/**
 * The v3.1 admission boundary: the UNCHANGED v3 contract, plus citation containment.
 *
 * Refuses WHOLE on any violation, as v1, v2 and v3 do. A partly-valid verdict is not a partly
 * correct one, and refusing it leaves every owed fact where it was.
 */
export function checkVerifierV3_1Output(
  raw: unknown, input: V3AdmissionInput,
): V3AdmissionResult & { citationViolations: readonly string[] } {
  const base = checkVerifierV3Output(raw, input);
  const citation = checkVerifierCitationContainment(raw);
  if (citation.clean) return { ...base, citationViolations: [] };
  return {
    admitted: false,
    codes: [...base.codes, PROHIBITED_REGULATORY_CITATION as never],
    detail: [...base.detail, ...citation.violations],
    bindingAdmitted: false,
    nominationAdmitted: false,
    challengedFactKeys: [],
    citationViolations: citation.violations,
  };
}
