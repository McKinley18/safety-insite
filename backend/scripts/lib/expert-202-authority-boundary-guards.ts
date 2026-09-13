/**
 * §202 EXPERT HAZLENZ -- AUTHORITY-BOUNDARY GUARDS. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== WHY THIS MODULE EXISTS ====================
 *
 * §201 independently identified, from two agents with different mandates, one defect class:
 *
 *      A BOUNDARY DESCRIBED AS THOUGH ENFORCED LOCALLY, BUT IN REALITY HELD ONLY BECAUSE THE
 *      CURRENT CALLER SUPPLIED A SAFE DEFAULT.
 *
 * The product owner ruled this a systemic architectural risk class and stated the design principle:
 *
 *      SAFETY / AUTHORITY INVARIANTS SHOULD BE ENFORCED AT THE NARROWEST TRUST BOUNDARY THAT CAN
 *      ACTUALLY GUARANTEE THEM.
 *
 * ==================== WHY THE GUARDS LIVE HERE AND NOT AT THE BOUNDARY ====================
 *
 * The narrowest boundary for most findings below is inside
 * `backend/src/hazlenz/expert-hazlenz/owed-facts/`. Four of those files --
 * `owed-fact.types.ts`, `owed-fact-ledger.ts`, `owed-fact-binding.ts` and
 * `verifier-v3-development-boundary.ts` -- have their sha256 PINNED by §187's
 * `PREREGISTRATION.json:owedFactSourceHashes` and re-asserted by eleven `verify-19x-source-integrity`
 * scripts. `expert-prompt.ts` is pinned by `firstPassIdentity.promptFileSha256` and
 * `expert-verifier-contract-v3.ts` by §192's `verifierIdentity.admissionValidatorSha256`.
 *
 * Editing any of them under §202's own authority would break a frozen verification contract to
 * obtain a passing result, which is exactly what the repository's operating instructions forbid. So
 * every guard here is a PURE FUNCTION with the exact signature its call site would need, and the
 * one-line insertion each requires is recorded in `CALL_SITE_INSERTIONS` for the product owner to
 * authorize. Until then these guards are detectors, and the suite proves both halves: that the
 * unsafe state is accepted TODAY, and that the guard rejects it.
 *
 * ==================== WHAT IS DELIBERATELY NOT DONE ====================
 *
 * NO DUPLICATED SEMANTIC INFERENCE. Every guard below is one of exactly three shapes:
 *
 *   CLOSED-SET MEMBERSHIP   `X.includes(v)` against a constant this module IMPORTS rather than
 *                           restates, so the guard cannot drift from the contract it enforces
 *   STRUCTURAL PRESENCE     a key exists, a value is blank, an object is nested
 *   POST-CONDITION EQUALITY a state the caller already computed is compared to a state the
 *                           architecture already says must follow
 *
 * There is no regex over prose, no similarity, no threshold and no matcher anywhere in this file. In
 * particular `CITATION_SHAPED_PATTERN`'s known blind spots (§201 MED-4) are REPORTED and NOT
 * repaired here: broadening a citation regex is semantic inference in deterministic code, and a
 * guard that re-derives meaning is worse than the gap it closes.
 */

import {
  type AcceptableEvidence, type OwedFact,
  ACCEPTABLE_EVIDENCE_PROVENANCES, OWED_FACT_PRIORITIES,
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  type OwedFactLedger, factOf,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import type {
  BindingCheckResult, ClarificationDeclaration,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding';
import type {
  StructuralQuestion,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/structural-questions';
import {
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  FORBIDDEN_EXPERT_FIELD_NAMES,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import { DECLARING_STAGES } from './expert-first-pass-owed-fact-projection';

export const AUTHORITY_BOUNDARY_GUARDS_VERSION =
  'hazlenz.expert.202-authority-boundary-guards.v1' as const;

// ================================================================ the vocabulary

/**
 * Every code a guard in this module may emit. Closed, so a suite counts members rather than
 * trusting a list, and so a new guard cannot invent a code nobody registered.
 */
export const AUTHORITY_BOUNDARY_VIOLATION_CODES = [
  'DECLARING_STAGE_NOT_A_MEMBER',
  'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER',
  'ACCEPTABLE_EVIDENCE_REQUIREMENT_BLANK',
  'NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD',
  'ADMITTED_NOMINATION_PRODUCED_NO_FACT',
  'OWED_FACT_COVERAGE_ATTACHED_WHILE_GATE_IS_OFF',
  'NESTED_FORBIDDEN_GOVERNANCE_FIELD',
  'NOMINATION_CEILING_WIDENED_BY_CALLER',
  'QUESTION_PRIORITY_NOT_LEDGER_DERIVED',
] as const;
export type AuthorityBoundaryViolationCode = (typeof AUTHORITY_BOUNDARY_VIOLATION_CODES)[number];

export interface AuthorityBoundaryViolation {
  readonly code: AuthorityBoundaryViolationCode;
  readonly detail: string;
}

const V = (code: AuthorityBoundaryViolationCode, detail: string): AuthorityBoundaryViolation =>
  ({ code, detail });

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

// ================================================================ G1. the declaring stage

/**
 * G1. `projectDeclaredOwedFacts` writes `source: input.stage as OwedFactSource`
 * (`expert-first-pass-owed-fact-projection.ts:625`). `OWED_FACT_FIELD_PROVENANCE`'s row for `source`
 * states the validation is "member of DECLARING_STAGES" (`:253`) and NO CODE PERFORMS IT.
 *
 * What holds it shut today, measured rather than assumed: `STAGE_KEY_PREFIX` (`:81-84`) has no entry
 * for a non-member, so `computeFactKey`'s `join('.')` renders `undefined` as the empty string, the
 * composed key acquires a leading `.`, and `FACT_KEY_SHAPE` refuses it as
 * `COMPUTED_FACT_KEY_MALFORMED` (`:584-587`). The declaration is refused -- by a KEY-SHAPE accident,
 * under a code that names the wrong fault, and only for as long as the prefix table stays partial.
 *
 * `DEVELOPMENT_HUMAN_TRUTH` is the value that matters: it is a legitimate `OwedFactSource` and a
 * PRODUCTION-forbidden one, so a stage argument carrying it would label model output as fixture
 * truth -- the ruler becoming part of the thing measured.
 */
export function declaringStageViolations(stage: unknown): AuthorityBoundaryViolation[] {
  if ((DECLARING_STAGES as readonly string[]).includes(stage as string)) return [];
  return [V('DECLARING_STAGE_NOT_A_MEMBER',
    `${JSON.stringify(String(stage))} is not one of ${DECLARING_STAGES.join(', ')}; the stage `
    + 'decides OwedFact.source and modelAuthored, and no wire field supplies it')];
}

// ================================================================ G2. evidence-criterion provenance

/**
 * G2. `projectDeclaredOwedFacts` copies a caller-supplied criterion wholesale --
 * `acceptableEvidence = c` (`expert-first-pass-owed-fact-projection.ts:609`) -- and the only check
 * before it is `blank(c.requirement)` (`:602`), emitted under the code
 * `ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ`, which names a provenance check it does
 * not perform. `owedFactDefects` (`owed-fact-ledger.ts:83-85`) checks `requirement` and nothing else,
 * so a criterion whose `provenance` is not a member of the closed set survives into a DEVELOPMENT
 * ledger unremarked.
 *
 * This guard enforces MEMBERSHIP ONLY. Whether a given member may exist in a given population is
 * `assertProductionAdmissible`'s question (`owed-fact-ledger.ts:130-144`) and it needs a population
 * argument the projection does not have; that is reported, not decided here.
 */
export function acceptableEvidenceProvenanceViolations(
  e: AcceptableEvidence | null | undefined, where: string,
): AuthorityBoundaryViolation[] {
  if (e === null || e === undefined) return [];
  const out: AuthorityBoundaryViolation[] = [];
  if (!(ACCEPTABLE_EVIDENCE_PROVENANCES as readonly string[]).includes(e.provenance)) {
    out.push(V('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER',
      `${where}: ${JSON.stringify(String(e.provenance))} is not a member of `
      + 'ACCEPTABLE_EVIDENCE_PROVENANCES'));
  }
  if (blank(e.requirement)) {
    out.push(V('ACCEPTABLE_EVIDENCE_REQUIREMENT_BLANK', `${where}: requirement is empty`));
  }
  return out;
}

/** The same membership check over the whole criterion map a projection caller supplies. */
export function suppliedCriteriaViolations(
  byId: Readonly<Record<string, AcceptableEvidence>> | undefined,
): AuthorityBoundaryViolation[] {
  if (byId === undefined) return [];
  return Object.entries(byId)
    .flatMap(([id, e]) => acceptableEvidenceProvenanceViolations(e, `acceptableEvidence[${id}]`));
}

/** The same membership check over a constructed fact, for a caller that did not go through G2. */
export function owedFactCriterionViolations(f: OwedFact): AuthorityBoundaryViolation[] {
  return acceptableEvidenceProvenanceViolations(f.acceptableEvidence, `owedFact ${f.factKey}`);
}

// ================================================================ G3. nested HazLenz-owned fields

/**
 * G3. `checkBindingDeclarations` scans the DECLARATION for HazLenz-owned fields --
 * `for (const forbidden of PROVIDER_FORBIDDEN_OWED_FACT_FIELDS) if (forbidden in d)`
 * (`owed-fact-binding.ts:137-142`) -- and does not scan `d.nomination`, which is the object a
 * provider actually populates. `applyAdmittedDeclarations` then reads named fields off that
 * nomination (`:334-347`).
 *
 * Four of the forbidden names are inert once past the scan, because `owedFact()` re-derives
 * `status`, `source`, `modelAuthored` and `acceptableEvidence`. `priority` is NOT inert: `:345`
 * writes `priority: n.priority` straight from the provider payload.
 *
 * `priority` is reported SEPARATELY, as `PROVIDER_AUTHORED_NOMINATION_PRIORITY`, and is NOT a
 * violation code. `NominationPayload.priority` is a REQUIRED field of the nomination contract
 * (`owed-fact-binding.ts:70`) validated for membership at `:201-203`, while
 * `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` (`owed-fact.types.ts:260-263`) forbids the same name. Two
 * published contracts in the same directory disagree. Deciding which wins is a product-owner
 * decision, not a guard's.
 */
export const PROVIDER_AUTHORED_NOMINATION_PRIORITY =
  'PROVIDER_AUTHORED_NOMINATION_PRIORITY' as const;

export interface NominationScanResult {
  readonly violations: readonly AuthorityBoundaryViolation[];
  /** Present when the nomination carried a priority. Advisory: see the contract contradiction above. */
  readonly providerAuthoredPriority: string | null;
}

export function nominationHazLenzOwnedFieldScan(
  d: ClarificationDeclaration | Record<string, unknown>,
): NominationScanResult {
  const n = (d as { nomination?: unknown }).nomination;
  if (n === null || n === undefined || typeof n !== 'object' || Array.isArray(n)) {
    return { violations: [], providerAuthoredPriority: null };
  }
  const nom = n as Record<string, unknown>;
  const violations: AuthorityBoundaryViolation[] = [];
  for (const forbidden of PROVIDER_FORBIDDEN_OWED_FACT_FIELDS) {
    // `priority` is excluded from the violation set and surfaced separately, because the nomination
    // contract REQUIRES it. Reporting it as a violation would refuse every well-formed nomination.
    if (forbidden === 'priority') continue;
    if (forbidden in nom) {
      violations.push(V('NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD',
        `nomination carried '${forbidden}', which only HazLenz may set; the declaration-level scan `
        + 'at owed-fact-binding.ts:137-142 does not reach it'));
    }
  }
  const p = nom.priority;
  return {
    violations,
    providerAuthoredPriority:
      typeof p === 'string' && (OWED_FACT_PRIORITIES as readonly string[]).includes(p) ? p : null,
  };
}

// ================================================================ G4. nested governance fields

/**
 * G4. The canonical first-pass boundary walks EVERY nested key looking for a governance field name --
 * `findForbiddenFields` recurses to depth 8 (`expert-normalization.ts:218-228`) with the stated
 * reason that "a provider that wants to send `citation` will happily send `{extra: {citation: ...}}`,
 * and a top-level check would pass it".
 *
 * `projectDeclaredOwedFacts` performs the SHALLOW version of the same check --
 * `for (const forbidden of DECLARATION_FORBIDDEN_FIELDS) if (forbidden in d)` (`:462-467`) -- and its
 * free-text citation scan is limited to `DECLARATION_FREE_TEXT_FIELDS` (`:552-560`). A declaration
 * carrying `extra: { citation: '…', approved: true }` is therefore admitted with zero codes.
 *
 * What holds it shut today is the TRANSPORT: `applyStrictSchemaWrapper` injects
 * `additionalProperties: false` (`anthropic-expert-provider.ts:129-136`), which is a keyword the
 * PROVIDER honours, not a check HazLenz performs. `expert-first-pass-instruction-vnext.ts:326-328`
 * names both layers as the defence; only one of them is a HazLenz boundary.
 *
 * This guard is the SAME walk over the SAME imported constant. It adds no vocabulary.
 */
export function nestedForbiddenGovernanceFields(
  value: unknown, path = '$', depth = 0,
): AuthorityBoundaryViolation[] {
  if (depth > 8 || value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => nestedForbiddenGovernanceFields(v, `${path}[${i}]`, depth + 1));
  }
  const out: AuthorityBoundaryViolation[] = [];
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    // Depth 0 is the declaration itself, which owed-fact-binding and the projection already scan.
    // Reporting it again would duplicate an existing refusal rather than close a gap.
    if (depth > 0 && FORBIDDEN_EXPERT_FIELD_NAMES.includes(k)) {
      out.push(V('NESTED_FORBIDDEN_GOVERNANCE_FIELD',
        `${path}.${k} -- a governance field name nested below the top level, where the `
        + 'declaration-level scan does not look'));
    }
    out.push(...nestedForbiddenGovernanceFields(v, `${path}.${k}`, depth + 1));
  }
  return out;
}

// ================================================================ G5. the nomination ceiling

/**
 * G5. `checkBindingDeclarations(..., maxNominations = 1)` (`owed-fact-binding.ts:122`). The frozen v2
 * ceiling exists as a DEFAULT PARAMETER VALUE and as nothing else -- there is no named constant
 * anywhere in `backend` (`grep -rn 'MAX_NOMINATION\|NOMINATION_CEILING'` returns no definition), so
 * a caller passing 5 admits 5 nominations, measured.
 *
 * The ceiling is nonetheless real on the v3 path, and by a different mechanism: `ExpertVerifierV3Output`
 * carries `nominatedFact` as a SINGLE OBJECT, not a list, so no v3 verdict can produce two. That is a
 * structural guarantee upstream of this parameter. The parameter is defence in depth whose depth is
 * one caller's default.
 */
export const FROZEN_NOMINATION_CEILING = 1 as const;

export function nominationCeilingViolations(maxNominations: number): AuthorityBoundaryViolation[] {
  if (maxNominations === FROZEN_NOMINATION_CEILING) return [];
  return [V('NOMINATION_CEILING_WIDENED_BY_CALLER',
    `a caller supplied maxNominations=${String(maxNominations)}; the frozen ceiling is `
    + `${FROZEN_NOMINATION_CEILING} and it is expressed only as a default parameter value`)];
}

// ================================================================ G6. nomination outcome

/**
 * G6. A POST-CONDITION, and the one finding in this file whose effect is a lost safety fact.
 *
 * `checkBindingDeclarations` refuses a nomination whose key collides with an existing fact ONLY when
 * that fact is still `UNRESOLVED` (`owed-fact-binding.ts:204-208`). When the colliding fact is
 * `COVERED`, `SETTLED_BY_EVIDENCE` or `REJECTED_BY_ARBITRATION`, the nomination is ADMITTED, counted
 * in `nominationCount`, and projected as a `StructuralQuestion` -- and then `addOwedFact` sees the
 * key already present and returns the ledger unchanged (`owed-fact-ledger.ts:163`). The nominated
 * fact, with its own span, its own branches and its own divergence, is silently discarded and the
 * pre-existing terminal fact stands in for it.
 *
 * `preservationViolations` and `bindingSideEffects` both report nothing, because neither asks
 * whether an admitted nomination PRODUCED anything. This guard asks exactly that, and asks nothing
 * else: it compares keys the caller already has against a ledger the caller already built.
 */
export function nominationOutcomeViolations(
  before: OwedFactLedger, after: OwedFactLedger, check: BindingCheckResult,
): AuthorityBoundaryViolation[] {
  const out: AuthorityBoundaryViolation[] = [];
  for (const d of check.admitted) {
    if (d.bindingMode !== 'NOMINATED_NEW') continue;
    const key = d.nomination?.factKey;
    if (typeof key !== 'string' || key.length === 0) continue;
    const existedBefore = factOf(before, key) !== undefined;
    const existsAfter = factOf(after, key) !== undefined;
    if (existedBefore || !existsAfter) {
      out.push(V('ADMITTED_NOMINATION_PRODUCED_NO_FACT',
        `declaration ${d.declarationId} was admitted as NOMINATED_NEW for ${key}, but that key `
        + `${existedBefore ? 'already named a fact in the ledger, so addOwedFact returned unchanged'
          : 'is absent from the resulting ledger'}; the nominated fact was discarded silently`));
    }
  }
  return out;
}

// ================================================================ G7. the merge carrier

/**
 * G7. `MergedIntelligence.owedFactCoverage` is documented as "Present ONLY when the verifier-v3
 * development stage attached one, which requires `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED`"
 * (`expert-authority-merge.ts:146-149`). The code enforces none of it: the parameter is
 * `owedFactCoverage?: unknown` (`:176`) and it is spread unconditionally (`:221`). `MERGE_INVARIANTS`
 * (`:227-239`) has no member covering the field and `verifyMergeInvariants` (`:254-335`) never reads
 * it, so a blob attached by any future caller is neither gated nor audited.
 *
 * Measured: `mergeExpertIntelligence(det, gov, expert, { citation: '29 CFR 1910.147', approved: true })`
 * returns that object verbatim on a merged result and `verifyMergeInvariants` returns zero
 * violations. The anti-citation-laundering predicates never see it, because the fourth argument does
 * not pass through `normalizeExpertOutput` at all.
 *
 * This guard reads the SAME gate constant the comment names. It is a detector: wiring it INTO the
 * merge would give `expert-authority-merge.ts` a dependency on the owed-fact module that its header
 * (`:151-153`) deliberately refuses, so the placement is a product-owner decision.
 */
export function mergeOwedFactCoverageViolations(
  merged: { owedFactCoverage?: unknown },
): AuthorityBoundaryViolation[] {
  const present = Object.prototype.hasOwnProperty.call(merged, 'owedFactCoverage');
  if (!present) return [];
  if (EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED) return [];
  return [V('OWED_FACT_COVERAGE_ATTACHED_WHILE_GATE_IS_OFF',
    'a merged result carries owedFactCoverage while EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED is '
    + 'false; the field is documented as attachable only by the gated stage, and nothing in '
    + 'mergeExpertIntelligence reads the gate')];
}

// ================================================================ G8. question priority

/**
 * G8. `projectStructuralQuestions` sets a nominated question's priority to
 * `fact?.priority ?? d.nomination?.priority ?? 'OTHER'` (`structural-questions.ts:138`). When the
 * nomination has not yet been applied to the ledger -- which is the state on the very call that
 * projects it -- `fact` is undefined and the PROVIDER'S priority is used.
 *
 * `selectQuestionsForBudget` ranks by `q.priority` (`:205-211`), so a provider that calls its own
 * nomination `LIFE_CRITICAL` sorts itself ahead of a deterministic gap under a scarce budget. This
 * is the escalation `expert-verifier-contract-v3.ts:548-550` and
 * `FIRST_PASS_PROJECTED_PRIORITY` (`expert-first-pass-owed-fact-projection.ts:105`) both exist to
 * prevent, arriving through the question surface instead of through the fact.
 *
 * `UNRESOLVED_SAFETY_STATE` is NOT affected: it is computed from ledger facts (`:226-228`), not from
 * question priorities. The effect is ordering and suppression, not a fabricated safety state.
 *
 * The guard reports the divergence. It does not choose the replacement value -- `'OTHER'` versus a
 * refusal is a policy question §202 is not authorized to settle.
 */
export function structuralQuestionPriorityViolations(
  questions: readonly StructuralQuestion[], ledger: OwedFactLedger,
): AuthorityBoundaryViolation[] {
  const out: AuthorityBoundaryViolation[] = [];
  for (const q of questions) {
    const f = factOf(ledger, q.bindingFactKey);
    if (f === undefined && q.priority !== 'OTHER') {
      out.push(V('QUESTION_PRIORITY_NOT_LEDGER_DERIVED',
        `${q.clarificationKey} carries priority ${q.priority} while ${q.bindingFactKey} is not in `
        + 'the ledger; the value can only have come from the provider nomination'));
    } else if (f !== undefined && q.priority !== f.priority) {
      out.push(V('QUESTION_PRIORITY_NOT_LEDGER_DERIVED',
        `${q.clarificationKey} carries priority ${q.priority} but the ledger fact `
        + `${q.bindingFactKey} carries ${f.priority}`));
    }
  }
  return out;
}

// ================================================================ the findings, as data

export const FINDING_CATEGORIES = [
  'A_PURE_DETERMINISTIC_ENFORCEMENT_DEFECT',
  'B_ARCHITECTURE_OR_POLICY_DECISION_REQUIRED',
  'C_SEMANTICALLY_DEPENDENT_ON_202_ADJUDICATION',
  'D_FALSE_POSITIVE_OR_DOCUMENTATION_MISMATCH',
] as const;
export type FindingCategory = (typeof FINDING_CATEGORIES)[number];

export interface AuthorityBoundaryFinding {
  readonly id: string;
  /** The invariant as CLAIMED, and where the claim is made. */
  readonly claimedAt: string;
  /** What actually enforces it today, established by reading or by execution. */
  readonly actuallyEnforcedBy: string;
  /** The narrowest boundary that COULD enforce it deterministically. */
  readonly narrowestBoundary: string;
  /** Whether that boundary already holds the information the check needs. */
  readonly boundaryHasTheInformation: boolean;
  /** A concrete reachable path by which an unsafe state could enter if a caller changed. */
  readonly reachablePath: string;
  readonly category: FindingCategory;
  /** True only where a §202 test in this repository actually executed the unsafe state. */
  readonly demonstratedByExecution: boolean;
  readonly guard: string | null;
  /** Non-empty whenever acting on the finding needs authority §202 does not hold. */
  readonly authorizationRequired: string | null;
}

/**
 * THE INVENTORY, in code so the suite can count it and the markdown cannot drift from it.
 *
 * `demonstratedByExecution` is asserted case-by-case by `test-202-authority-boundary-guards.ts`
 * against the real production functions; nothing here is marked demonstrated on the strength of
 * reading alone.
 */
export const AUTHORITY_BOUNDARY_FINDINGS: readonly AuthorityBoundaryFinding[] = [
  {
    id: 'ABF-1',
    claimedAt: 'expert-first-pass-owed-fact-projection.ts:250-254 -- OWED_FACT_FIELD_PROVENANCE '
      + 'row for `source`: "member of DECLARING_STAGES; there is no wire field for it"',
    actuallyEnforcedBy: 'nothing checks membership. A non-member stage is refused only because '
      + 'STAGE_KEY_PREFIX (:81-84) has no entry for it, join(".") renders undefined as "", the '
      + 'composed key acquires a leading dot and FACT_KEY_SHAPE (:160) refuses it under '
      + 'COMPUTED_FACT_KEY_MALFORMED (:584-587)',
    narrowestBoundary: 'projectDeclaredOwedFacts, at entry (expert-first-pass-owed-fact-projection.ts:427)',
    boundaryHasTheInformation: true,
    reachablePath: 'a caller passing stage: "DEVELOPMENT_HUMAN_TRUTH" -- a legitimate OwedFactSource '
      + 'and a PRODUCTION-forbidden one. Today the key-shape accident refuses it; adding a third '
      + 'member to STAGE_KEY_PREFIX, or giving the lookup a default, removes the accident and leaves '
      + 'source unchecked, labelling model output as fixture truth with modelAuthored false',
    category: 'A_PURE_DETERMINISTIC_ENFORCEMENT_DEFECT',
    demonstratedByExecution: true,
    guard: 'declaringStageViolations',
    authorizationRequired: 'the call site is in a non-pinned scripts/lib file; the insertion is '
      + 'recorded in CALL_SITE_INSERTIONS and was not applied, because scripts/lib/'
      + 'expert-first-pass-owed-fact-projection.ts is not an Agent C owned file under the §202 map',
  },
  {
    id: 'ABF-2',
    claimedAt: 'expert-first-pass-owed-fact-projection.ts:129 and :603 -- the refusal code '
      + 'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ, and :300-307 -- the provenance row '
      + 'stating acceptableEvidence is HAZLENZ_TASK_STATE "never accepted from the provider"',
    actuallyEnforcedBy: 'blank(c.requirement) at :602. The criterion is then copied whole at :609, '
      + 'provenance included. owedFactDefects (owed-fact-ledger.ts:83-85) checks the requirement and '
      + 'nothing else. The only provenance boundary is assertProductionAdmissible '
      + '(owed-fact-ledger.ts:130-144), which returns immediately unless population === PRODUCTION',
    narrowestBoundary: 'projectDeclaredOwedFacts at :598-612 for closed-set membership; '
      + 'createOwedFactLedger for the population question',
    boundaryHasTheInformation: true,
    reachablePath: 'the projection\'s acceptableEvidenceBySourceId parameter is optional and NO '
      + 'wired caller supplies it -- neither execute-197 (:660-664) nor execute-199 (:781-785). A '
      + 'future caller supplying criteria from any source at all injects MODEL_SELF_AUTHORED, '
      + 'ADJUDICATION_LABEL or a non-member string straight into OwedFact.acceptableEvidence, which '
      + 'projectOwedFact then puts in front of the verifier',
    category: 'A_PURE_DETERMINISTIC_ENFORCEMENT_DEFECT',
    demonstratedByExecution: true,
    guard: 'suppliedCriteriaViolations',
    authorizationRequired: 'membership enforcement is category A. Refusing a PRODUCTION-forbidden '
      + 'provenance additionally needs a population argument the projection does not take, which is '
      + 'a signature change and therefore a product-owner decision',
  },
  {
    id: 'ABF-3',
    claimedAt: 'owed-fact.types.ts:255-263 -- PROVIDER_FORBIDDEN_OWED_FACT_FIELDS, "Fields a '
      + 'provider may never return"; and owed-fact-binding.ts:136 -- "A provider may not return '
      + 'HazLenz-owned task state, acceptableEvidence above all"',
    actuallyEnforcedBy: 'owed-fact-binding.ts:137-142, which tests `forbidden in d` -- the '
      + 'DECLARATION -- and never inspects d.nomination, the object the provider populates',
    narrowestBoundary: 'checkBindingDeclarations, in the NOMINATED_NEW branch at '
      + 'owed-fact-binding.ts:179-209 where the nomination is already in hand',
    boundaryHasTheInformation: true,
    reachablePath: 'a nomination carrying acceptableEvidence, status, source and modelAuthored is '
      + 'admitted with zero codes. Four are inert because owedFact() re-derives them; priority is '
      + 'not, and :345 writes priority: n.priority into the ledger fact',
    category: 'A_PURE_DETERMINISTIC_ENFORCEMENT_DEFECT',
    demonstratedByExecution: true,
    guard: 'nominationHazLenzOwnedFieldScan',
    authorizationRequired: 'owed-fact-binding.ts sha256 is pinned by §187 owedFactSourceHashes and '
      + 're-asserted by eleven verify-19x scripts; any edit needs an explicit re-pin authorization',
  },
  {
    id: 'ABF-4',
    claimedAt: 'owed-fact.types.ts:12-13 -- "Every field on OwedFact that decides anything is '
      + 'populated by HazLenz"; and expert-verifier-contract-v3.ts:548-550 -- "a model-chosen '
      + 'priority would let the provider promote its own nomination past a deterministic '
      + 'life-critical gap"',
    actuallyEnforcedBy: 'bridgeV3OutputToLedgerInputs, a CALLER, which writes '
      + 'opts.nominatedPriority ?? "OTHER" (expert-verifier-contract-v3.ts:589). The binding '
      + 'boundary validates membership only (owed-fact-binding.ts:201-203) and LIFE_CRITICAL is a '
      + 'member',
    narrowestBoundary: 'checkBindingDeclarations / applyAdmittedDeclarations',
    boundaryHasTheInformation: true,
    reachablePath: 'any producer of a ClarificationDeclaration other than the v3 bridge. The '
      + 'nomination priority reaches COVERAGE_PRIORITY_GATE (owed-fact-binding.ts:392-393), '
      + 'PRIORITY_RANK and UNDROPPABLE_PRIORITIES (structural-questions.ts:168-171) and '
      + 'UNRESOLVED_SAFETY_STATE (structural-questions.ts:236)',
    category: 'B_ARCHITECTURE_OR_POLICY_DECISION_REQUIRED',
    demonstratedByExecution: true,
    guard: 'nominationHazLenzOwnedFieldScan (reports it as PROVIDER_AUTHORED_NOMINATION_PRIORITY, '
      + 'not as a violation)',
    authorizationRequired: 'NominationPayload.priority is a REQUIRED field of the nomination '
      + 'contract (owed-fact-binding.ts:70) and simultaneously a member of '
      + 'PROVIDER_FORBIDDEN_OWED_FACT_FIELDS. Two published contracts in one directory disagree; '
      + 'which wins, and whether the remedy is refusal or a forced floor, is the product owner\'s',
  },
  {
    id: 'ABF-5',
    claimedAt: 'owed-fact-ledger.ts:7-17 -- the ledger exists so a displaced fact cannot disappear '
      + 'invisibly; owed-fact-binding.ts:320-328 -- "a nomination ADDS its fact"',
    actuallyEnforcedBy: 'nothing. The collision refusal at owed-fact-binding.ts:204-208 fires only '
      + 'when the colliding fact is still UNRESOLVED. On any terminal status the nomination is '
      + 'ADMITTED, and addOwedFact returns the ledger unchanged (owed-fact-ledger.ts:163)',
    narrowestBoundary: 'checkBindingDeclarations (widen the collision test) or a post-condition on '
      + 'applyAdmittedDeclarations',
    boundaryHasTheInformation: true,
    reachablePath: 'a verifier nominates a genuinely new unresolved fact whose computed key equals '
      + 'a fact already COVERED, SETTLED_BY_EVIDENCE or REJECTED_BY_ARBITRATION. The nomination is '
      + 'counted in nominationCount, projected as a StructuralQuestion against that key, and its '
      + 'span, branches and divergence are discarded. preservationViolations and bindingSideEffects '
      + 'both report nothing',
    category: 'B_ARCHITECTURE_OR_POLICY_DECISION_REQUIRED',
    demonstratedByExecution: true,
    guard: 'nominationOutcomeViolations',
    authorizationRequired: 'the two candidate repairs contradict published design. Widening the '
      + 'collision test changes a stated rule about UNRESOLVED keys; making addOwedFact throw '
      + 'contradicts owed-fact-ledger.ts:152-158, which states the no-op IS the deduplication '
      + 'policy. The post-condition guard here adds detection without choosing between them',
  },
  {
    id: 'ABF-6',
    claimedAt: 'expert-authority-merge.ts:146-149 -- owedFactCoverage is "Present ONLY when the '
      + 'verifier-v3 development stage attached one, which requires '
      + 'EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED -- a literal false"',
    actuallyEnforcedBy: 'no caller passes a fourth argument. The parameter is unknown (:176), the '
      + 'function reads no gate, and the value is spread unconditionally (:221). MERGE_INVARIANTS '
      + '(:227-239) has no member for it and verifyMergeInvariants (:254-335) never reads it',
    narrowestBoundary: 'mergeExpertIntelligence itself, or an unforgeable attachment brand of the '
      + 'kind settlement-review.ts:230 already uses for SettlementAuthority',
    reachablePath: 'any future caller. Measured: a fourth argument of '
      + '{ citation: "29 CFR 1910.147", approved: true } is returned verbatim on the merged result '
      + 'and verifyMergeInvariants returns zero violations -- the anti-citation-laundering '
      + 'predicates never run on it, because the fourth argument does not pass through '
      + 'normalizeExpertOutput',
    boundaryHasTheInformation: false,
    category: 'B_ARCHITECTURE_OR_POLICY_DECISION_REQUIRED',
    demonstratedByExecution: true,
    guard: 'mergeOwedFactCoverageViolations',
    authorizationRequired: 'the merge cannot read the gate without importing '
      + 'verifier-v3-development-boundary.ts, which transitively imports the owed-fact module -- '
      + 'exactly the dependency expert-authority-merge.ts:151-153 refuses. Choosing between a gate '
      + 'import, a brand token and a typed attachment is an architecture decision. Adding a member '
      + 'to MERGE_INVARIANTS is additionally a change to a published closed set',
  },
  {
    id: 'ABF-7',
    claimedAt: 'expert-first-pass-instruction-vnext.ts:326-328 -- a non-compliant producer "is '
      + 'refused by additionalProperties: false at the transport and by DECLARATION_FORBIDDEN_FIELDS '
      + 'at the boundary"; and expert-normalization.ts:214-217, which states a top-level check '
      + 'would pass a nested governance field',
    actuallyEnforcedBy: 'for the boundary half, a TOP-LEVEL scan only '
      + '(expert-first-pass-owed-fact-projection.ts:462-467), plus a citation scan limited to '
      + 'DECLARATION_FREE_TEXT_FIELDS (:552-560). The deep walk exists at '
      + 'expert-normalization.ts:218-228 and the projection does not use it',
    narrowestBoundary: 'projectDeclaredOwedFacts at :462-467',
    boundaryHasTheInformation: true,
    reachablePath: 'a declaration carrying extra: { citation: "29 CFR 1910.147", approved: true } is '
      + 'admitted with zero codes. Today the only thing refusing it is additionalProperties: false, '
      + 'which is a keyword the PROVIDER honours rather than a check HazLenz performs, and which is '
      + 'absent entirely from any non-transport caller of the projection',
    category: 'A_PURE_DETERMINISTIC_ENFORCEMENT_DEFECT',
    demonstratedByExecution: true,
    guard: 'nestedForbiddenGovernanceFields',
    authorizationRequired: null,
  },
  {
    id: 'ABF-8',
    claimedAt: 'expert-owed-fact-binding.ts:134 -- "maxNominations is 1 by default -- the frozen v2 '
      + 'ceiling -- and is a parameter only so the proof suite can exercise the refusal path"',
    actuallyEnforcedBy: 'the default parameter value (owed-fact-binding.ts:122). There is no named '
      + 'ceiling constant in backend. The real guarantee on the v3 path is upstream and structural: '
      + 'ExpertVerifierV3Output.nominatedFact is a single object, not a list',
    narrowestBoundary: 'checkBindingDeclarations, against a named constant rather than a default',
    boundaryHasTheInformation: true,
    reachablePath: 'a caller passing maxNominations: 5 admits five nominations; measured. No caller '
      + 'does today -- every call site in backend/scripts omits the argument',
    category: 'A_PURE_DETERMINISTIC_ENFORCEMENT_DEFECT',
    demonstratedByExecution: true,
    guard: 'nominationCeilingViolations',
    authorizationRequired: 'owed-fact-binding.ts is §187-pinned; naming the constant there needs a '
      + 're-pin authorization. The guard names it here instead',
  },
  {
    id: 'ABF-9',
    claimedAt: 'expert-first-pass-owed-fact-projection.ts:88-104 -- "the wire has no priority field '
      + 'and a provider cannot escalate itself"',
    actuallyEnforcedBy: 'on the FACT path, FIRST_PASS_PROJECTED_PRIORITY (:105) and the v3 bridge '
      + 'default. On the QUESTION path, nothing: structural-questions.ts:138 falls back to '
      + 'd.nomination?.priority whenever the nominated fact is not yet in the ledger, which is the '
      + 'state on the very call that projects it',
    narrowestBoundary: 'projectStructuralQuestions at structural-questions.ts:126-141',
    boundaryHasTheInformation: true,
    reachablePath: 'a provider-chosen LIFE_CRITICAL reaches StructuralQuestion.priority and '
      + 'selectQuestionsForBudget ranks by it (:205-211), so the nomination sorts ahead of a '
      + 'deterministic gap under a scarce budget. UNRESOLVED_SAFETY_STATE is unaffected: it is '
      + 'computed from ledger facts at :226-228',
    category: 'B_ARCHITECTURE_OR_POLICY_DECISION_REQUIRED',
    demonstratedByExecution: true,
    guard: 'structuralQuestionPriorityViolations',
    authorizationRequired: 'removing d.nomination?.priority from the fallback chain changes what a '
      + 'not-yet-applied nomination ranks as. Whether that is a repair or a loss of intended '
      + 'function is a product decision, and structural-questions.ts is not an Agent C owned file',
  },
  {
    id: 'ABF-10',
    claimedAt: 'expert-contract.types.ts:696-700 -- CITATION_SHAPED_PATTERN is "the '
      + 'anti-citation-laundering contract applied to free text"',
    actuallyEnforcedBy: '/\\b\\d{2}\\s*CFR\\s*\\d+/i, which requires the literal token CFR after '
      + 'exactly two digits, and an exact case-sensitive Array.includes over '
      + 'FORBIDDEN_EXPERT_FIELD_NAMES',
    narrowestBoundary: 'the same four consumers it already has',
    boundaryHasTheInformation: false,
    reachablePath: 'measured against the §196 projection: "29 C.F.R. 1910.147", "1910.147", '
      + '"§ 1910.147" and "1926.501(b)(1)" are all ADMITTED; only "29 CFR 1910.147" is refused',
    category: 'B_ARCHITECTURE_OR_POLICY_DECISION_REQUIRED',
    demonstratedByExecution: true,
    guard: null,
    authorizationRequired: 'DELIBERATELY NOT REPAIRED HERE. Broadening a citation regex is semantic '
      + 'inference in deterministic code -- deciding what counts as a citation -- and a guard that '
      + 're-derives meaning is worse than the gap it closes. Escalated as a representation question',
  },
  {
    id: 'ABF-11',
    claimedAt: 'expert-runner.ts:186-189 -- "A provider that answers as a model other than the one '
      + 'it was qualified as has invalidated the qualification"',
    actuallyEnforcedBy: 'expert-runner.ts:190-191, which runs only when '
      + 'provider.qualifiedModelIdentity !== null',
    narrowestBoundary: 'the runner, if identity were mandatory',
    boundaryHasTheInformation: true,
    reachablePath: 'a provider declaring qualifiedModelIdentity: null skips the check entirely',
    category: 'D_FALSE_POSITIVE_OR_DOCUMENTATION_MISMATCH',
    demonstratedByExecution: false,
    guard: null,
    authorizationRequired: null,
  },
] as const;

/**
 * The exact insertion each category-A guard needs, recorded so the orchestrator can apply it under
 * an explicit authorization rather than reconstructing it. NOT APPLIED by §202 Agent C: every target
 * file below is owned by another party under the §202 file-ownership map, and three of the six are
 * additionally §187 sha256-pinned.
 */
export const CALL_SITE_INSERTIONS: readonly {
  readonly findingId: string;
  readonly file: string;
  readonly afterLine: string;
  readonly insertion: string;
  readonly pinned: boolean;
}[] = [
  {
    findingId: 'ABF-1',
    file: 'backend/scripts/lib/expert-first-pass-owed-fact-projection.ts',
    afterLine: '427  export function projectDeclaredOwedFacts(input: ProjectionInput): ProjectionResult {',
    insertion: 'if (!(DECLARING_STAGES as readonly string[]).includes(input.stage)) {\n'
      + '  throw new Error(`DECLARING_STAGE_NOT_A_MEMBER -- ${String(input.stage)}`);\n}',
    pinned: false,
  },
  {
    findingId: 'ABF-2',
    file: 'backend/scripts/lib/expert-first-pass-owed-fact-projection.ts',
    afterLine: '601  if (c === undefined) continue;',
    insertion: 'if (!(ACCEPTABLE_EVIDENCE_PROVENANCES as readonly string[]).includes(c.provenance)) {\n'
      + "  fail('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ',\n"
      + '    `the criterion HazLenz holds for ${gid} carries provenance ${String(c.provenance)}`);\n'
      + '  continue;\n}',
    pinned: false,
  },
  {
    findingId: 'ABF-3',
    file: 'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts',
    afterLine: '182  } else {   (the NOMINATED_NEW branch, once `n` is known to be an object)',
    insertion: 'for (const forbidden of PROVIDER_FORBIDDEN_OWED_FACT_FIELDS) {\n'
      + "  if (forbidden === 'priority') continue;   // see ABF-4: the contracts disagree\n"
      + '  if (forbidden in (n as unknown as Record<string, unknown>)) {\n'
      + "    fail('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',\n"
      + "      `nomination carried '${forbidden}', which only HazLenz may set`);\n  }\n}",
    pinned: true,
  },
  {
    findingId: 'ABF-7',
    file: 'backend/scripts/lib/expert-first-pass-owed-fact-projection.ts',
    afterLine: '467  }   (immediately after the DECLARATION_FORBIDDEN_FIELDS loop)',
    insertion: 'for (const p of nestedForbiddenGovernanceFields(d)) {\n'
      + "  fail('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD', p.detail);\n}",
    pinned: false,
  },
  {
    findingId: 'ABF-8',
    file: 'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts',
    afterLine: '122  maxNominations = 1,',
    insertion: 'export const FROZEN_NOMINATION_CEILING = 1 as const;   // and default to it',
    pinned: true,
  },
] as const;

/** Asserted by the suite: this module decides nothing and reaches nothing. */
export function authorityBoundaryGuardEffect(): {
  providerCalls: 0; databaseOperations: 0; mutatesAnyLedger: false; supplies202SemanticVerdict: false;
  modifiesAnyExistingFile: false; containsAnySemanticMatcher: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, mutatesAnyLedger: false,
    supplies202SemanticVerdict: false, modifiesAnyExistingFile: false,
    containsAnySemanticMatcher: false,
  };
}
