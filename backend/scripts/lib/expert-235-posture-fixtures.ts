/**
 * §235 LOCAL FIXTURES. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * SYNTHESIZED analyses, not provider output. They exercise the normalization, the aligned contract
 * and the two new invariants. They cannot establish what a model will choose: that is the hosted
 * question §235 designs and does not execute.
 *
 *   >>> THE §234 CASES ARE SPENT. No §234 observation, subject or fact pattern appears here. The
 *   >>> manufactured-uncertainty trap is built on a DIFFERENT subject on purpose: the authorization
 *   >>> forbids patching the autoclave case and requires the general rule to be what is tested.
 *
 * Every wire-shape fixture reproduces a SHAPE observed in §234 -- an envelope, a stringified
 * object, a malformed string, an absent root field -- carrying content that has nothing to do with
 * the §234 case it came from.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { governedBindingFor } from './expert-first-pass-instruction-vnext';
import { buildExpert235WireSchema, CESSATION_FIELD } from './expert-235-posture-contract';

export const FIXTURES_235_VERSION = 'hazlenz.expert.235.posture-fixtures.v1' as const;

// ================================================================ the transmitted schema

export const FIXTURE_INPUT_235: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'ANL-235-FIXTURE',
  authoritativeSources: [{
    sourceId: 'OBS-235-FIXTURE', sourceType: 'observation',
    text: 'A fixture observation. The scenarios below carry their own facts.',
  }],
  inspectionContext: { location: 'fixture', task: 'fixture' },
  jurisdiction: 'US',
  allowedHazardFamilies: ['machinery'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
};

export function fixtureSchema235(): Record<string, unknown> {
  return buildExpert235WireSchema(FIXTURE_INPUT_235, governedBindingFor([]));
}

// ================================================================ schema-conformant builders
//
// Conformant on purpose. Normalization accepts a parsed value only when it EXACTLY satisfies the
// transmitted schema, so a fixture that cuts corners would prove nothing about the real path.

export function candidate(
  candidateKey: string, assertedConditionState = 'ACTIVE',
): Record<string, unknown> {
  return {
    candidateKey,
    hazardFamily: 'machinery',
    assertedConditionState,
    groundingStatus: 'EXACT_QUOTE_SUPPLIED',
    evidence: [{ sourceId: 'OBS-235-FIXTURE', quotedText: 'a quoted span from the observation' }],
    evidenceBasis: 'the quoted span and the context supplied with it',
    reasoning: 'why this candidate stands in the state asserted',
    confidence: 'HIGH',
    relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
    requiresUserConfirmation: false,
  };
}

export function declaration(declarationId: string): Record<string, unknown> {
  return {
    declarationId,
    missingFact: 'the fact that is not established',
    observationSourceId: 'OBS-235-FIXTURE',
    observationSpan: 'a quoted span from the observation',
    notEstablishedBecause: 'the observation does not settle it either way',
    affectedDecision: 'the decision this bears on',
    branchA: 'the property holds',
    decisionIfA: 'one course of action',
    branchB: 'the property does not hold',
    decisionIfB: 'a materially different course of action',
    decisionWhileUnresolved: 'the legacy per-declaration action string, advisory only',
    whyNecessaryNow: 'why this must be resolved before the decision is made',
  };
}

export function clarification(
  clarificationId: string, criticality = 'BLOCKING', binds?: string,
): Record<string, unknown> {
  const q: Record<string, unknown> = {
    clarificationId,
    question: 'the question put to the duty holder',
    whyItMatters: 'why the answer changes what happens',
    affectedDecision: 'the decision this bears on',
    criticality,
    evidenceGap: 'what the record does not contain',
  };
  if (binds !== undefined) q.answersUnresolvedFactDeclarationId = binds;
  return q;
}

type Ref = { ref: string; refKind: 'HAZARD_CANDIDATE' | 'UNRESOLVED_DECLARATION' };
export const hc = (ref: string): Ref => ({ ref, refKind: 'HAZARD_CANDIDATE' });
export const ud = (ref: string): Ref => ({ ref, refKind: 'UNRESOLVED_DECLARATION' });

export function posture235(p: {
  posture: string;
  requiredBy?: Ref[];
  accepted?: (Ref & { reason: string })[];
  controls?: { control: string; timing: string }[];
  resume?: { resolvedByDeclarationIds: string[]; correctionsRequired: string[] };
  whatHappensNow?: string;
  cessation?: Ref[];
  omitCessation?: boolean;
}): Record<string, unknown> {
  const o: Record<string, unknown> = {
    posture: p.posture,
    requiredBy: p.requiredBy ?? [],
    acceptedWithoutImmediateAction: p.accepted ?? [],
    requiredControls: p.controls ?? [],
    resumeCondition: p.resume ?? { resolvedByDeclarationIds: [], correctionsRequired: [] },
    whatHappensNow: p.whatHappensNow ?? 'the operational consequence, stated plainly',
  };
  if (p.omitCessation !== true) o[CESSATION_FIELD] = p.cessation ?? [];
  return o;
}

/** A root payload that satisfies every required root field the transmitted schema declares. */
export function analysis235(a: {
  candidates?: Record<string, unknown>[];
  declarations?: Record<string, unknown>[];
  clarifications?: Record<string, unknown>[];
  posture?: unknown;
  omitPosture?: boolean;
}): Record<string, unknown> {
  const out: Record<string, unknown> = {
    expertHazardCandidates: a.candidates ?? [],
    unresolvedFactDeclarations: a.declarations ?? [],
    decisionCriticalClarifications: a.clarifications ?? [],
    crossHazardInsights: [],
    disagreements: [],
    uncertainty: { statements: [] },
    outcome: 'ANALYSIS_COMPLETE',
    expertExplanation: { summary: 'the explanation summary' },
  };
  if (a.omitPosture !== true) out.immediateSafetyPosture = a.posture ?? posture235({ posture: 'CONTINUE' });
  return out;
}

// ================================================================ the scenarios

export interface Scenario235 {
  readonly id: string;
  readonly family: 'NORMALIZATION' | 'MANUFACTURED_UNCERTAINTY' | 'RESTRAINT'
    | 'RESUME_COHERENCE' | 'CESSATION_SHAPE';
  readonly name: string;
  readonly whatItExercises: string;
  readonly payload: unknown;
  readonly expectAdmitted: boolean;
  /** Codes that MUST be present. Not an exhaustive list unless `exactCodes` is set. */
  readonly expectCodes: readonly string[];
  readonly expectFailsClosed?: boolean;
  readonly expectNormalizationAction?: string;
}

/** The controlling-property fixture used by the manufactured-uncertainty family. */
const GUILLOTINE = 'paper-guillotine-two-hand-control-bypassed';
const SEPARATE = 'stock-weight-unknown-for-clamp-setting';

export const SCENARIOS_235: readonly Scenario235[] = [

  // ============================================================ normalization
  {
    id: 'N1', family: 'NORMALIZATION',
    name: 'inert "parameters" envelope around an otherwise valid analysis',
    whatItExercises: 'the §234 F4 SHAPE on unrelated content. The outer object has one key, that '
      + 'key is a known inert wrapper, the outer object carries no root field and the inner object '
      + 'does. The intended root is unambiguous, so the wrapper comes off.',
    payload: { parameters: analysis235({
      candidates: [candidate('cand-clean', 'CONTROLLED')],
      posture: posture235({ posture: 'CONTINUE' }),
    }) },
    expectAdmitted: true, expectCodes: [],
    expectNormalizationAction: 'UNWRAPPED_INERT_ENVELOPE',
  },
  {
    id: 'N2', family: 'NORMALIZATION',
    name: 'inert "parameter name" envelope',
    whatItExercises: 'the §234 S4 SHAPE. A different wrapper spelling, same closed set, same result.',
    payload: { 'parameter name': analysis235({
      candidates: [candidate('cand-clean-2', 'CONTROLLED')],
      posture: posture235({ posture: 'CONTINUE' }),
    }) },
    expectAdmitted: true, expectCodes: [],
    expectNormalizationAction: 'UNWRAPPED_INERT_ENVELOPE',
  },
  {
    id: 'N3', family: 'NORMALIZATION',
    name: 'a single root key that is NOT a known inert wrapper',
    whatItExercises: 'THE LIMIT OF THE CLOSED SET. "It looks like a wrapper" is a reading. An '
      + 'unrecognised key is left alone and the analysis fails closed.',
    payload: { payload: analysis235({ posture: posture235({ posture: 'CONTINUE' }) }) },
    expectAdmitted: false, expectCodes: ['POSTURE_MISSING'], expectFailsClosed: true,
    expectNormalizationAction: 'REFUSED_AMBIGUOUS_ENVELOPE',
  },
  {
    id: 'N4', family: 'NORMALIZATION',
    name: 'a known wrapper key whose value is not an object',
    whatItExercises: 'the wrapper is recognised and the intended root is still not unambiguous, so '
      + 'nothing is unwrapped.',
    payload: { parameters: 'the whole analysis, apparently' },
    expectAdmitted: false, expectCodes: ['POSTURE_MISSING'], expectFailsClosed: true,
    expectNormalizationAction: 'REFUSED_AMBIGUOUS_ENVELOPE',
  },
  {
    id: 'N5', family: 'NORMALIZATION',
    name: 'the posture object transported as a JSON string that parses and conforms exactly',
    whatItExercises: 'the §234 E3/F1 SHAPE, in the recoverable form. The container is re-typed and '
      + 'no value is altered.',
    payload: (() => {
      const a = analysis235({
        candidates: [candidate('cand-string-posture', 'CONTROLLED')],
        posture: posture235({ posture: 'CONTINUE' }),
      });
      a.immediateSafetyPosture = JSON.stringify(a.immediateSafetyPosture);
      return a;
    })(),
    expectAdmitted: true, expectCodes: [],
    expectNormalizationAction: 'PARSED_JSON_STRING_FIELD',
  },
  {
    id: 'N6', family: 'NORMALIZATION',
    name: 'the posture object transported as a MALFORMED JSON string',
    whatItExercises: 'THE EXACT §234 E3/F1 MALFORMATION: a trailing brace. It is not repaired, not '
      + 'guessed at and not partially read. Malformed safety state stays fail-closed.',
    payload: (() => {
      const a = analysis235({
        candidates: [candidate('cand-malformed', 'CONTROLLED')],
        posture: posture235({ posture: 'STOP' }),
      });
      a.immediateSafetyPosture = `${JSON.stringify(a.immediateSafetyPosture)}}`;
      return a;
    })(),
    expectAdmitted: false, expectCodes: ['POSTURE_NOT_AN_OBJECT'], expectFailsClosed: true,
    expectNormalizationAction: 'REFUSED_MALFORMED_JSON_STRING',
  },
  {
    id: 'N7', family: 'NORMALIZATION',
    name: 'a posture string that PARSES but does not satisfy the transmitted schema',
    whatItExercises: 'THE PROOF THAT NOTHING IS INVENTED. The parse succeeds and a required '
      + 'sub-field is missing. Normalization does not supply it, so the value is left as received '
      + 'and the analysis fails closed.',
    payload: (() => {
      const a = analysis235({ candidates: [candidate('cand-partial', 'CONTROLLED')] });
      a.immediateSafetyPosture = JSON.stringify({ posture: 'CONTINUE' });
      return a;
    })(),
    expectAdmitted: false, expectCodes: ['POSTURE_NOT_AN_OBJECT'], expectFailsClosed: true,
    expectNormalizationAction: 'REFUSED_PARSED_VALUE_DOES_NOT_SATISFY_TRANSMITTED_SCHEMA',
  },
  {
    id: 'N8', family: 'NORMALIZATION',
    name: 'the hazard candidate array transported as a JSON string that conforms exactly',
    whatItExercises: 'the §234 F3 SHAPE. In §234 this cost the case twice over: the candidates were '
      + 'unreadable, so every posture reference was unresolvable and P2 refused an analysis whose '
      + 'references were in fact sound.',
    payload: (() => {
      const a = analysis235({
        candidates: [candidate('cand-string-array')],
        posture: posture235({ posture: 'STOP', requiredBy: [hc('cand-string-array')],
          cessation: [hc('cand-string-array')],
          resume: { resolvedByDeclarationIds: [], correctionsRequired: ['restore the guard'] } }),
      });
      a.expertHazardCandidates = JSON.stringify(a.expertHazardCandidates);
      return a;
    })(),
    expectAdmitted: true, expectCodes: [],
    expectNormalizationAction: 'PARSED_JSON_STRING_FIELD',
  },
  {
    id: 'N9', family: 'NORMALIZATION',
    name: 'a required root field simply absent',
    whatItExercises: 'the §234 E1 SHAPE. Normalization records the absence and supplies nothing.',
    payload: analysis235({ candidates: [candidate('cand-absent', 'CONTROLLED')], omitPosture: true }),
    expectAdmitted: false, expectCodes: ['POSTURE_MISSING'], expectFailsClosed: true,
  },
  {
    id: 'N10', family: 'NORMALIZATION',
    name: 'a clean, well-formed analysis',
    whatItExercises: 'normalization is inert on a good output. No anomaly, no action, no change.',
    payload: analysis235({
      candidates: [candidate('cand-ok', 'CONTROLLED')],
      posture: posture235({ posture: 'CONTINUE' }),
    }),
    expectAdmitted: true, expectCodes: [],
  },

  {
    id: 'N11', family: 'NORMALIZATION',
    name: 'a field transported as a JSON string holding an object keyed by the field\'s own name',
    whatItExercises: 'the §234 F3 SHAPE, exactly. The wrapper key IS the field name, so there is no '
      + 'second candidate for the intended value. In §234 this cost the case twice: the candidates '
      + 'were unreadable, so every posture reference was unresolvable and P2 refused an analysis '
      + 'whose references were in fact sound.',
    payload: (() => {
      const a = analysis235({
        candidates: [candidate('cand-self-named')],
        posture: posture235({ posture: 'STOP', requiredBy: [hc('cand-self-named')],
          cessation: [hc('cand-self-named')],
          resume: { resolvedByDeclarationIds: [], correctionsRequired: ['restore the interlock'] } }),
      });
      a.expertHazardCandidates =
        JSON.stringify({ expertHazardCandidates: a.expertHazardCandidates });
      return a;
    })(),
    expectAdmitted: true, expectCodes: [],
    expectNormalizationAction: 'UNWRAPPED_SELF_NAMED_FIELD_WRAPPER',
  },
  {
    id: 'N12', family: 'NORMALIZATION',
    name: 'a self-named wrapper whose inner value does NOT satisfy the transmitted schema',
    whatItExercises: 'unwrapping earns no exemption. The inner value is checked exactly like any '
      + 'other, and a candidate missing a required member is left as received.',
    payload: (() => {
      const a = analysis235({ posture: posture235({ posture: 'CONTINUE' }) });
      a.expertHazardCandidates =
        JSON.stringify({ expertHazardCandidates: [{ candidateKey: 'cand-thin' }] });
      return a;
    })(),
    expectAdmitted: false, expectCodes: ['WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT'],
    expectFailsClosed: true,
    expectNormalizationAction: 'REFUSED_PARSED_VALUE_DOES_NOT_SATISFY_TRANSMITTED_SCHEMA',
  },

  // ============================================================ manufactured uncertainty
  {
    id: 'M1', family: 'MANUFACTURED_UNCERTAINTY',
    name: 'THE TRAP. An established cessation condition, downgraded to a hold by an invented unknown',
    whatItExercises: 'the §234 S2 DEFECT, generalized onto a different subject: a paper guillotine '
      + 'whose two-hand control has been found bypassed. The model names the bypass as a condition '
      + 'already requiring cessation, then declares "is the operator keeping both hands clear '
      + 'anyway" as an unresolved fact and holds on it. P7 refuses. This is the whole point of §235.',
    payload: analysis235({
      candidates: [candidate(GUILLOTINE)],
      declarations: [declaration('decl-manufactured')],
      posture: posture235({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [hc(GUILLOTINE), ud('decl-manufactured')],
        cessation: [hc(GUILLOTINE)],
        resume: { resolvedByDeclarationIds: ['decl-manufactured'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE'],
  },
  {
    id: 'M2', family: 'MANUFACTURED_UNCERTAINTY',
    name: 'the same established condition, reported as STOP',
    whatItExercises: 'the posture the facts require is admitted unchanged. P7 does not make STOP '
      + 'harder to reach; it makes not reaching it harder to justify.',
    payload: analysis235({
      candidates: [candidate(GUILLOTINE)],
      posture: posture235({
        posture: 'STOP', requiredBy: [hc(GUILLOTINE)], cessation: [hc(GUILLOTINE)],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['restore and prove the two-hand control before any further cutting'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'M3', family: 'MANUFACTURED_UNCERTAINTY',
    name: 'an established STOP alongside a GENUINELY SEPARATE unresolved property',
    whatItExercises: 'THE ANTI-OVERCORRECTION CASE the authorization names. The bypassed control '
      + 'requires cessation AND the stock weight for the clamp setting is genuinely unknown. Both '
      + 'are declared, the separate property is covered, and the STOP stands. Nothing here punishes '
      + 'a legitimate unresolved fact.',
    payload: analysis235({
      candidates: [candidate(GUILLOTINE), candidate(SEPARATE, 'INSUFFICIENT_EVIDENCE')],
      declarations: [declaration('decl-separate-clamp')],
      posture: posture235({
        posture: 'STOP',
        requiredBy: [hc(GUILLOTINE), ud('decl-separate-clamp')],
        accepted: [{ ...hc(SEPARATE), reason: 'the clamp question changes nothing today because the '
          + 'machine is stopped either way' }],
        cessation: [hc(GUILLOTINE)],
        resume: { resolvedByDeclarationIds: ['decl-separate-clamp'],
          correctionsRequired: ['restore and prove the two-hand control'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'M4', family: 'RESTRAINT',
    name: 'a legitimate HOLD with the cessation list empty',
    whatItExercises: 'the posture whose controlling property is genuinely unresolved is admitted '
      + 'exactly as before. P7 constrains only an analysis that has NAMED an established cessation '
      + 'condition.',
    payload: analysis235({
      candidates: [candidate('interlock-proof-test-overdue', 'INSUFFICIENT_EVIDENCE')],
      declarations: [declaration('decl-trip-unproved')],
      posture: posture235({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [ud('decl-trip-unproved')],
        accepted: [{ ...hc('interlock-proof-test-overdue'),
          reason: 'the overdue test is the thing being resolved, not a separate exposure' }],
        cessation: [],
        resume: { resolvedByDeclarationIds: ['decl-trip-unproved'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'M5', family: 'RESTRAINT',
    name: 'an ACTIVE, serious, properly controlled hazard accepted without action under CONTINUE',
    whatItExercises: 'THE RULE IS NOT "ESTABLISHED HAZARD MEANS STOP". An active hazard operated '
      + 'inside a proven regime leaves the cessation list empty and CONTINUE is admitted.',
    payload: analysis235({
      candidates: [candidate('molten-metal-bath-thermal')],
      posture: posture235({
        posture: 'CONTINUE',
        accepted: [{ ...hc('molten-metal-bath-thermal'),
          reason: 'real, present and active, and every control that makes it acceptable is already '
            + 'in effect and evidenced' }],
        cessation: [],
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'M6', family: 'RESTRAINT',
    name: 'CONTINUE_WITH_CONTROLS with the cessation list empty',
    whatItExercises: 'the middle posture is untouched by §235.',
    payload: analysis235({
      candidates: [candidate('exposure-rising-below-limit')],
      posture: posture235({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [hc('exposure-rising-below-limit')],
        controls: [{ control: 'a withdrawal threshold below the limit', timing: 'DURING_CONTINUED_WORK' }],
        cessation: [],
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },

  // ============================================================ cessation-list shape
  {
    id: 'C1', family: 'CESSATION_SHAPE',
    name: 'a declaration listed as an established cessation condition',
    whatItExercises: 'an unresolved fact is by definition not established. Listing one here is the '
      + 'manufactured-uncertainty move in its most direct form and it is refused on shape alone.',
    payload: analysis235({
      candidates: [candidate('cand-shape-1')],
      declarations: [declaration('decl-shape-1')],
      posture: posture235({
        posture: 'STOP',
        requiredBy: [hc('cand-shape-1'), ud('decl-shape-1')],
        cessation: [ud('decl-shape-1')],
        resume: { resolvedByDeclarationIds: ['decl-shape-1'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['CESSATION_REF_NOT_A_CANDIDATE'],
  },
  {
    id: 'C2', family: 'CESSATION_SHAPE',
    name: 'a cessation reference that resolves to nothing',
    whatItExercises: 'P2 referential integrity, extended to the new list.',
    payload: analysis235({
      candidates: [candidate('cand-shape-2')],
      posture: posture235({
        posture: 'STOP', requiredBy: [hc('cand-shape-2')], cessation: [hc('cand-does-not-exist')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['CESSATION_REF_UNRESOLVED'],
  },
  {
    id: 'C3', family: 'CESSATION_SHAPE',
    name: 'a cessation condition that is not also a reason for the posture',
    whatItExercises: 'an established condition requiring cessation is, by definition, a reason for '
      + 'the posture. An analysis that says otherwise contradicts itself.',
    payload: analysis235({
      candidates: [candidate('cand-shape-3a'), candidate('cand-shape-3b')],
      posture: posture235({
        posture: 'STOP', requiredBy: [hc('cand-shape-3a')],
        accepted: [{ ...hc('cand-shape-3b'), reason: 'accepted without action' }],
        cessation: [hc('cand-shape-3b')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['CESSATION_CONDITION_NOT_IN_BASIS'],
  },
  {
    id: 'C4', family: 'CESSATION_SHAPE',
    name: 'the cessation list absent from an otherwise valid posture',
    whatItExercises: 'the field is required on the wire, so it cannot silently disappear. This is '
      + 'the §233 P1 discipline applied to the new field.',
    payload: analysis235({
      candidates: [candidate('cand-shape-4', 'CONTROLLED')],
      posture: posture235({ posture: 'CONTINUE', omitCessation: true }),
    }),
    expectAdmitted: false, expectCodes: ['CESSATION_LIST_MISSING'],
  },

  // ============================================================ resume coherence
  {
    id: 'R1', family: 'RESUME_COHERENCE',
    name: 'a resume condition under CONTINUE_WITH_CONTROLS',
    whatItExercises: 'the §234 E2 finding. The SCHEMA already told the model to leave both lists '
      + 'empty when work may continue and nothing enforced it. Recorded separately: this was not a '
      + '§234 failure driver.',
    payload: analysis235({
      candidates: [candidate('cand-resume-1')],
      declarations: [declaration('decl-resume-1')],
      posture: posture235({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [hc('cand-resume-1'), ud('decl-resume-1')],
        controls: [{ control: 'a control', timing: 'DURING_CONTINUED_WORK' }],
        cessation: [],
        resume: { resolvedByDeclarationIds: ['decl-resume-1'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['RESUME_CONDITION_UNDER_PERMITTING_POSTURE'],
  },
  {
    id: 'R2', family: 'RESUME_COHERENCE',
    name: 'the same analysis with the resume lists empty',
    whatItExercises: 'the coherent form is admitted, and the declaration is still covered and still '
      + 'carried.',
    payload: analysis235({
      candidates: [candidate('cand-resume-2')],
      declarations: [declaration('decl-resume-2')],
      posture: posture235({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [hc('cand-resume-2'), ud('decl-resume-2')],
        controls: [{ control: 'a control', timing: 'DURING_CONTINUED_WORK' }],
        cessation: [],
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
];
