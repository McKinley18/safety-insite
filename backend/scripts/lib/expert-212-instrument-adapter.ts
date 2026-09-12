/**
 * §212 -- DETERMINISTIC EXECUTION ADAPTER FOR THE FROZEN §211 INSTRUMENT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. THE §211 INSTRUMENT IS NOT MODIFIED.
 *
 * ==================== WHY AN ADAPTER AND NOT AN EDIT ====================
 *
 * §212 was told to preserve the frozen §211 instrument unchanged, not to alter its truth because
 * the architecture changed, and -- if a transport or schema-version adaptation turned out to be
 * needed -- to build a DETERMINISTIC EXECUTION ADAPTER that preserves every frozen truth question.
 *
 * One adaptation is needed, and it is mechanical rather than semantic. A §211 `SuppliedDeclaration`
 * carries the eleven semantic fields and no `observationSourceId`, because §211 was describing a
 * declaration rather than replaying a wire payload. The §210J projection needs one, so that the
 * verbatim-span check has a named source to check against.
 *
 * The adapter supplies exactly that, using the `OBS-<caseId>` convention §210H already used, and
 * changes NOTHING ELSE. `ADAPTATION_LEDGER` names every field it touches, and
 * `semanticFieldsAreByteIdentical` proves the eleven semantic strings survive unchanged. A field the
 * adapter cannot supply mechanically is not invented: the adapter refuses instead.
 *
 * ==================== WHAT IT DOES NOT DO ====================
 *
 * It does not rewrite an observation, a property, a branch, a decision, a clarification, a frozen
 * expectation, a required outcome or an evaluation question. It does not drop a case and it does not
 * reorder one. It is read-only with respect to §211.
 */

import type { OwedFact } from '../../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import { project210jDeclarations } from './expert-210j-declaration-projection';
import type { ProjectionResult } from './expert-first-pass-owed-fact-projection';
import {
  type SuppliedDeclaration, type ValidationCase, VALIDATION_CASES,
} from './expert-211-validation-instrument';
import {
  type VerifierRequest212, buildVerifier212Request,
} from './expert-212-verifier-payload';

export const INSTRUMENT_ADAPTER_212_VERSION =
  'hazlenz.expert.212.instrument-adapter.v1' as const;

/** Exactly what the adapter supplies, and on whose authority. Nothing else is touched. */
export const ADAPTATION_LEDGER = [
  {
    field: 'observationSourceId',
    suppliedBy: 'ADAPTER',
    rule: 'the literal `OBS-` followed by the case id, which is the convention §210H used for the '
      + 'same purpose',
    isSemantic: false,
    why: 'the §210J projection checks the span against a NAMED source. §211 described a declaration '
      + 'rather than a wire payload, so it carried no source selector.',
  },
  {
    field: 'governedEvidenceSourceIds',
    suppliedBy: 'NOT_SUPPLIED',
    rule: 'omitted. Every §211 case is capability-ABSENT, so the property does not exist on the '
      + 'wire at all and an empty array would be a different request.',
    isSemantic: false,
    why: '§198 capability omission: a field that is absent cannot be populated by a compliant '
      + 'producer.',
  },
] as const;

/** The eleven semantic strings that must survive byte-identical. */
export const SEMANTIC_FIELDS: readonly (keyof SuppliedDeclaration)[] = [
  'declarationId', 'missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
  'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'decisionWhileUnresolved', 'whyNecessaryNow',
];

export const ADAPTER_REFUSAL_CODES = [
  'CASE_NOT_FOUND',
  'SPAN_NOT_VERBATIM_IN_THE_CASE_OBSERVATION',
  'PROJECTION_ADMITTED_NOTHING',
  'ADMITTED_FACT_COUNT_DISAGREES_WITH_THE_CASE',
] as const;
export type AdapterRefusalCode = (typeof ADAPTER_REFUSAL_CODES)[number];

/** One adapted declaration: the frozen eleven, plus the one mechanical field. */
export interface AdaptedDeclaration extends SuppliedDeclaration {
  readonly observationSourceId: string;
}

export function adaptDeclaration(c: ValidationCase, d: SuppliedDeclaration): AdaptedDeclaration {
  return { ...d, observationSourceId: `OBS-${c.caseId}` };
}

/** Byte identity of every semantic field. The claim, checkable. */
export function semanticFieldsAreByteIdentical(
  original: SuppliedDeclaration, adapted: AdaptedDeclaration,
): boolean {
  return SEMANTIC_FIELDS.every(f => original[f] === adapted[f]);
}

export interface AdaptedCase {
  readonly caseId: string;
  readonly refusedBecause: readonly AdapterRefusalCode[];
  readonly adaptedDeclarations: readonly AdaptedDeclaration[];
  readonly projection: ProjectionResult | null;
  readonly facts: readonly OwedFact[];
  /** One request per admitted fact, in declaration order. */
  readonly requests: readonly VerifierRequest212[];
  /** Every frozen evaluation question id, carried through unchanged. */
  readonly frozenQuestionIds: readonly string[];
}

/**
 * Adapt one frozen case into §212 verifier requests. Deterministic and total: the same case yields
 * the same requests every time, and a case it cannot adapt is REFUSED rather than approximated.
 */
export function adaptCase(caseId: string): AdaptedCase {
  const c = VALIDATION_CASES.find(x => x.caseId === caseId);
  if (c === undefined) {
    return {
      caseId, refusedBecause: ['CASE_NOT_FOUND'], adaptedDeclarations: [], projection: null,
      facts: [], requests: [], frozenQuestionIds: [],
    };
  }
  const frozenQuestionIds = c.evaluationQuestions.map(q => q.id);
  const refused: AdapterRefusalCode[] = [];
  const adapted = c.declarations.map(d => adaptDeclaration(c, d));

  for (const d of adapted) {
    if (!c.observation.includes(d.observationSpan)) {
      refused.push('SPAN_NOT_VERBATIM_IN_THE_CASE_OBSERVATION');
    }
  }
  if (refused.length > 0) {
    return {
      caseId, refusedBecause: refused, adaptedDeclarations: adapted, projection: null, facts: [],
      requests: [], frozenQuestionIds,
    };
  }

  const result = project210jDeclarations({
    declarations: adapted as unknown as readonly unknown[],
    sources: [{ sourceId: `OBS-${c.caseId}`, text: c.observation }],
    suppliedGovernedSourceIds: [],
    stage: 'FIRST_PASS_MODEL',
  });

  if (result.projection.facts.length === 0) refused.push('PROJECTION_ADMITTED_NOTHING');
  if (result.projection.facts.length !== c.declarations.length) {
    refused.push('ADMITTED_FACT_COUNT_DISAGREES_WITH_THE_CASE');
  }

  const requests: VerifierRequest212[] = [];
  if (refused.length === 0) {
    result.projection.perDeclaration.forEach((per, i) => {
      if (!per.admitted || per.owedFact === null) return;
      const bound = c.clarifications
        .find(q => q.boundToDeclarationId === adapted[i].declarationId);
      requests.push(buildVerifier212Request({
        fact: per.owedFact,
        declaration: adapted[i] as unknown as Record<string, unknown>,
        unresolvedActionByFactKey: result.unresolvedActionByFactKey,
        boundClarification: bound === undefined ? null : bound.question,
      }));
    });
  }

  return {
    caseId,
    refusedBecause: refused,
    adaptedDeclarations: adapted,
    projection: result.projection,
    facts: result.projection.facts,
    requests,
    frozenQuestionIds,
  };
}

export function adaptAllCases(): readonly AdaptedCase[] {
  return VALIDATION_CASES.map(c => adaptCase(c.caseId));
}

/** Provider calls the adapted instrument WOULD make. Must equal §211's frozen count. */
export function adaptedProviderCallCount(): number {
  return adaptAllCases().reduce((n, a) => n + a.requests.length, 0);
}

/** Asserted as literals: the adapter is read-only with respect to §211. */
export function adapterEffect(): {
  providerCalls: 0; databaseOperations: 0;
  modifiesTheFrozenInstrument: false; rewritesAnyFrozenExpectation: false;
  dropsOrReordersACase: false; inventsASemanticField: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    modifiesTheFrozenInstrument: false,
    rewritesAnyFrozenExpectation: false,
    dropsOrReordersACase: false,
    inventsASemanticField: false,
  };
}
