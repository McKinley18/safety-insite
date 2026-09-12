/**
 * §219 -- THE FROZEN SCORER. AUTHORED AND FROZEN BEFORE ANY PROVIDER CALL.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHAT THIS MODULE MAY AND MAY NOT DECIDE ====================
 *
 * It compares MODEL-AUTHORED closed-set values against FROZEN expectations by exact equality, runs
 * the existing §212, §214 and §218 checkers, and counts hard-gate occurrences from those results.
 *
 * It does NOT read `decisionControllingProperty`, `propertyReviewReason` or `rationale` for meaning.
 * The two axes that require reading prose against frozen truth -- HG6 (is the named controlling
 * proposition the right one) and HG9 (was unresolved evidence converted into established adverse
 * truth) -- are returned as PENDING_HUMAN_ADJUDICATION and are never machine-decided. That is the
 * same line §212, §214, §216 and §218 each held, and §219 does not move it to make scoring easier.
 *
 * ==================== STRUCTURAL IS NOT SEMANTIC ====================
 *
 * A call that did not reach inference, was truncated, or produced no parseable tool block is scored
 * NOT_EXERCISED on every semantic axis. It is never scored CORRECT and never scored INCORRECT, and
 * it never produces an occurrence of HG1-HG6.
 */

import {
  type DeclarationEntry212, checkDeclarationEntry212,
} from './expert-212-challenge-vocabulary';
import { checkScopeContainment } from './expert-214-scope-containment';
import { checkPropertyReview218 } from './expert-218-property-consistency';
import {
  type ConfirmationCase219, type HardGateId219, CONFIRMATION_CASES_219, HG9_EXERCISED_ON,
} from './expert-219-structured-confirmation-instrument';

export const SCORING_219_VERSION = 'hazlenz.expert.219.scoring.v1' as const;

/** Fields a declaration may never carry. Copied from the v3 contract, not reinvented. */
export const SETTLEMENT_FIELDS_219: readonly string[] = [
  'settled', 'resolved', 'covered', 'rejected', 'notDecisionCritical', 'factNotDecisionCritical',
];

/** Top-level fields the verifier may never return. Copied from the v1 boundary, not reinvented. */
export const FORBIDDEN_TOP_LEVEL_FIELDS_219: readonly string[] = [
  'expertHazardCandidates', 'candidates', 'hazardCandidates',
  'citations', 'governedCitations', 'regulatoryCitations',
  'deterministicFindings', 'authoritativeFindings',
  'crossHazardInsights', 'disagreements', 'explanation',
  'releaseId', 'authoritySource', 'source',
];

export type AxisResult219 = 'CORRECT' | 'INCORRECT' | 'NOT_EXERCISED'
  | 'PENDING_HUMAN_ADJUDICATION';

export interface CallForScoring219 {
  readonly caseId: string;
  readonly declarationId: string;
  readonly targetFactKey: string;
  readonly reachedInference: boolean;
  readonly failureClass: string;
  /** The tool input exactly as the provider returned it. Never modified, never repaired. */
  readonly parsed: Record<string, unknown> | null;
}

export interface CaseScore219 {
  readonly caseId: string;
  readonly structural: {
    readonly reachedInference: boolean;
    readonly failureClass: string;
    readonly parseable: boolean;
  };
  readonly observed: {
    readonly propertySemanticRole: string | null;
    readonly propertyValidity: string | null;
    readonly targetDeclarationId: string | null;
    readonly decisionControllingProperty: string | null;
    readonly propertyReviewReason: string | null;
    readonly verdict: string | null;
    readonly declaration: string | null;
    readonly challengeGround: string | null;
    readonly propertyMismatchKind: string | null;
    readonly representationConcern: string | null;
    readonly declaredFactKeys: readonly string[];
    readonly nominatedFactPresent: boolean;
    readonly clarificationSourceMode: string | null;
    readonly proposedClarificationPresent: boolean;
  };
  readonly expected: {
    readonly propertySemanticRole: string;
    readonly propertyValidity: string;
    readonly requiredDisposition: string;
  };
  readonly axes: {
    readonly roleCorrect: AxisResult219;
    readonly validityCorrect: AxisResult219;
    readonly dispositionCorrect: AxisResult219;
    readonly decisionControllingPropertyCorrect: AxisResult219;
    readonly adverseTruthAvoided: AxisResult219;
  };
  readonly deterministic: {
    readonly vocabularyCodes: readonly string[];
    readonly scopeCodes: readonly string[];
    readonly propertyReviewCodes: readonly string[];
    readonly propertyRoute: string;
    readonly admitted: boolean;
    readonly targetRemainsUnresolved: boolean;
  };
  readonly gateOccurrences: readonly {
    readonly gate: HardGateId219; readonly why: string; readonly containedByDeterministicLayer: boolean;
  }[];
  readonly pendingHumanAdjudication: readonly HardGateId219[];
  /** CORRECT only when every machine-decidable axis is correct AND nothing is pending. */
  readonly machineVerdict: 'CORRECT' | 'INCORRECT' | 'NOT_EXERCISED' | 'PENDING';
}

const str = (v: unknown): string | null =>
  typeof v === 'string' && v.length > 0 ? v : null;

/** Verdicts that let a target survive as an ordinary accepted fact. */
const ACCEPTING_VERDICTS: readonly string[] = ['VERIFIED_AS_IS', 'NO_CLARIFICATION_REQUIRED'];

export function scoreCall219(call: CallForScoring219): CaseScore219 {
  const c = CONFIRMATION_CASES_219.find(x => x.caseId === call.caseId) as ConfirmationCase219;
  const parsed = call.parsed;
  const parseable = parsed !== null && typeof parsed === 'object';

  const review = (parsed?.propertyReview ?? null) as Record<string, unknown> | null;
  const entries = (parsed?.owedFactDeclarations ?? []) as Record<string, unknown>[];
  const target = entries.find(e => String(e?.factKey ?? '') === call.targetFactKey) ?? null;

  const observed = {
    propertySemanticRole: str(review?.propertySemanticRole),
    propertyValidity: str(review?.propertyValidity),
    targetDeclarationId: str(review?.targetDeclarationId),
    decisionControllingProperty: str(review?.decisionControllingProperty),
    propertyReviewReason: str(review?.propertyReviewReason),
    verdict: str(parsed?.verdict),
    declaration: str(target?.declaration),
    challengeGround: str(target?.challengeGround),
    propertyMismatchKind: str(target?.propertyMismatchKind),
    representationConcern: str(target?.representationConcern),
    declaredFactKeys: entries.map(e => String(e?.factKey ?? '')),
    nominatedFactPresent: (parsed?.nominatedFact ?? null) !== null
      && (parsed?.nominatedFact ?? undefined) !== undefined,
    clarificationSourceMode: str(parsed?.clarificationSourceMode),
    proposedClarificationPresent: (parsed?.proposedClarification ?? null) !== null,
  };

  // ---------------- the existing deterministic layers, run unchanged
  const vocabularyCodes = parseable
    ? entries.flatMap(e => checkDeclarationEntry212({
      factKey: String(e?.factKey ?? ''),
      declaration: String(e?.declaration ?? ''),
      challengeReason: (e?.challengeReason ?? null) as string | null,
      challengeGround: (e?.challengeGround ?? null) as DeclarationEntry212['challengeGround'],
      propertyMismatchKind:
        (e?.propertyMismatchKind ?? null) as DeclarationEntry212['propertyMismatchKind'],
      representationConcern:
        (e?.representationConcern ?? 'NONE') as DeclarationEntry212['representationConcern'],
    }))
    : [];

  const scope = parseable
    ? checkScopeContainment({
      scope: {
        targetFactKey: call.targetFactKey,
        suppliedFactKeys: [call.targetFactKey],
        multiFactValidationRequested: false,
      },
      output: {
        nominatedFact: parsed?.nominatedFact ?? null,
        clarificationSourceMode: parsed?.clarificationSourceMode ?? null,
        owedFactDeclarations: entries as { factKey?: unknown }[],
      },
    })
    : { admitted: false, codes: [] as readonly string[], detail: [], multiFactRequested: false };

  const property = parseable
    ? checkPropertyReview218({
      scope: {
        targetDeclarationId: call.declarationId,
        targetFactKey: call.targetFactKey,
      },
      output: {
        propertyReview: parsed?.propertyReview,
        verdict: parsed?.verdict,
        owedFactDeclarations: entries,
      },
    })
    : {
      admitted: false, codes: [] as readonly string[], detail: [], route: 'FAIL_CLOSED',
      review: null, representationReviewMayProceed: false,
    };

  const admitted = parseable && vocabularyCodes.length === 0 && scope.admitted && property.admitted;

  // ---------------- semantic axes, against the frozen truth only
  const exercised = call.reachedInference && parseable;
  const NE: AxisResult219 = 'NOT_EXERCISED';

  const roleCorrect: AxisResult219 = !exercised ? NE
    : observed.propertySemanticRole === c.expectedRole ? 'CORRECT' : 'INCORRECT';
  const validityCorrect: AxisResult219 = !exercised ? NE
    : observed.propertyValidity === c.expectedValidity ? 'CORRECT' : 'INCORRECT';

  const challengedOnIdentity = observed.declaration === 'CHALLENGE_FACT_VALIDITY'
    && observed.challengeGround === 'PROPERTY_IDENTITY_MISMATCH';

  const dispositionCorrect: AxisResult219 = !exercised ? NE
    : c.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY'
      ? (challengedOnIdentity
        && observed.propertyMismatchKind === 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE'
        && !ACCEPTING_VERDICTS.includes(observed.verdict ?? '')
        && observed.verdict !== 'ADD_OR_REPLACE_CLARIFICATION'
        ? 'CORRECT' : 'INCORRECT')
      : (!challengedOnIdentity ? 'CORRECT' : 'INCORRECT');

  // ---------------- hard gates
  const gates: { gate: HardGateId219; why: string; containedByDeterministicLayer: boolean }[] = [];
  const contained = !admitted;
  const add = (gate: HardGateId219, why: string): void => {
    gates.push({ gate, why, containedByDeterministicLayer: contained });
  };

  if (exercised) {
    // HG1 -- evidence proxy misclassified as a valid target property.
    if (c.expectedRole === 'EVIDENCE_FOR_ANOTHER_PROPERTY'
      && (observed.propertySemanticRole !== 'EVIDENCE_FOR_ANOTHER_PROPERTY'
        || observed.propertyValidity !== 'INVALID')) {
      add('HG1', `frozen role EVIDENCE_FOR_ANOTHER_PROPERTY / INVALID; observed `
        + `${observed.propertySemanticRole} / ${observed.propertyValidity}`);
    }
    // HG2 -- a property that IS invalid survived as accepted or as a clarification-only correction.
    if (c.expectedValidity === 'INVALID'
      && (ACCEPTING_VERDICTS.includes(observed.verdict ?? '')
        || observed.verdict === 'ADD_OR_REPLACE_CLARIFICATION')) {
      add('HG2', `frozen validity INVALID; the output routed the target through `
        + `${observed.verdict}`);
    }
    // HG3 / HG4 / HG5 -- the three legitimate properties, wrongly invalidated or challenged.
    const wronglyMoved = observed.propertyValidity !== 'VALID' || challengedOnIdentity;
    if (c.expectedRole === 'REQUIRED_ACT_ITSELF' && c.expectedValidity === 'VALID' && wronglyMoved) {
      add('HG3', `a legitimate required act was declared ${observed.propertyValidity}`
        + `${challengedOnIdentity ? ' and challenged on property identity' : ''}`);
    }
    if (c.expectedRole === 'REQUIRED_ARTIFACT_ITSELF' && c.expectedValidity === 'VALID'
      && wronglyMoved) {
      add('HG4', `a legitimate required artifact was declared ${observed.propertyValidity}`
        + `${challengedOnIdentity ? ' and challenged on property identity' : ''}`);
    }
    if (c.expectedRole === 'UNDERLYING_SAFETY_STATE' && c.expectedValidity === 'VALID'
      && wronglyMoved) {
      add('HG5', `a correct underlying safety state was declared ${observed.propertyValidity}`
        + `${challengedOnIdentity ? ' and challenged on property identity' : ''}`);
    }
    // HG7 -- exact target identity.
    if (observed.targetDeclarationId !== null
      && observed.targetDeclarationId !== call.declarationId) {
      add('HG7', `propertyReview named ${observed.targetDeclarationId}, the request supplied `
        + `${call.declarationId}`);
    }
    for (const k of observed.declaredFactKeys) {
      if (k !== call.targetFactKey) add('HG7', `declared foreign key ${k.slice(0, 48)}`);
    }
    if (!observed.declaredFactKeys.includes(call.targetFactKey)) {
      add('HG7', 'the supplied target carried no declaration');
    }
    // HG8 -- structured sibling escape.
    if (scope.codes.includes('NOMINATION_OUTSIDE_TARGET_SCOPE')
      || scope.codes.includes('SOURCE_MODE_CLAIMS_A_NOMINATION_OUTSIDE_SCOPE')) {
      add('HG8', `scope refused: ${scope.codes.join(', ')}`);
    }
    // HG10 -- settlement authority.
    for (const f of FORBIDDEN_TOP_LEVEL_FIELDS_219) {
      if (parsed !== null && f in parsed) add('HG10', `forbidden top-level field ${f}`);
    }
    for (const e of entries) {
      for (const f of SETTLEMENT_FIELDS_219) {
        if (f in e) add('HG10', `declaration carried '${f}'`);
      }
    }
  }

  // ---------------- what may never be machine-decided
  const pending: HardGateId219[] = [];
  if (exercised && observed.propertyValidity === 'INVALID') pending.push('HG6');
  if (exercised && HG9_EXERCISED_ON.includes(c.caseId)) pending.push('HG9');

  const dcpAxis: AxisResult219 = !exercised ? NE
    : c.expectedValidity === 'INVALID' ? 'PENDING_HUMAN_ADJUDICATION' : NE;
  const adverseAxis: AxisResult219 = !exercised ? NE
    : c.mustNotAssert === null ? NE : 'PENDING_HUMAN_ADJUDICATION';

  const machineAxes = [roleCorrect, validityCorrect, dispositionCorrect];
  const machineVerdict: CaseScore219['machineVerdict'] = !exercised ? 'NOT_EXERCISED'
    : machineAxes.some(a => a === 'INCORRECT') ? 'INCORRECT'
      : pending.length > 0 ? 'PENDING' : 'CORRECT';

  return {
    caseId: c.caseId,
    structural: {
      reachedInference: call.reachedInference,
      failureClass: call.failureClass,
      parseable,
    },
    observed,
    expected: {
      propertySemanticRole: c.expectedRole,
      propertyValidity: c.expectedValidity,
      requiredDisposition: c.requiredDisposition,
    },
    axes: {
      roleCorrect,
      validityCorrect,
      dispositionCorrect,
      decisionControllingPropertyCorrect: dcpAxis,
      adverseTruthAvoided: adverseAxis,
    },
    deterministic: {
      vocabularyCodes,
      scopeCodes: scope.codes,
      propertyReviewCodes: property.codes as readonly string[],
      propertyRoute: property.route,
      admitted,
      targetRemainsUnresolved: !admitted,
    },
    gateOccurrences: gates,
    pendingHumanAdjudication: pending,
    machineVerdict,
  };
}

/** Per-gate occurrence counts. No aggregate score is produced anywhere in this module. */
export function gateOccurrenceCounts219(
  scores: readonly CaseScore219[],
): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const s of scores) for (const g of s.gateOccurrences) out[g.gate] = (out[g.gate] ?? 0) + 1;
  return out;
}

/**
 * §219 never reports an aggregate percentage and never offsets one gate with another. Held as a
 * literal so the suite asserts it rather than trusting a sentence.
 */
export function scoringEffect219(): {
  producesAnAggregatePercentage: false;
  offsetsOneGateWithAnother: false;
  readsDecisionControllingPropertyForMeaning: false;
  readsRationaleForMeaning: false;
  repairsAModelClassification: false;
  scoresAStructuralFailureAsSemantic: false;
  modifiesTheParsedOutput: false;
} {
  return {
    producesAnAggregatePercentage: false,
    offsetsOneGateWithAnother: false,
    readsDecisionControllingPropertyForMeaning: false,
    readsRationaleForMeaning: false,
    repairsAModelClassification: false,
    scoresAStructuralFailureAsSemantic: false,
    modifiesTheParsedOutput: false,
  };
}
