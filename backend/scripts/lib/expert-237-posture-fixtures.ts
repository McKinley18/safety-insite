/**
 * §237 LOCAL FIXTURES. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * SYNTHESIZED analyses. They prove the closure behaves; they cannot establish what a model will
 * choose, which is the question the six-call confirmation is designed to ask.
 *
 *   >>> §234 AND §236 ARE SPENT. No observation, subject or fact pattern from either appears here,
 *   >>> and the §235 paper-guillotine trap is not reused. The response-uncertainty trap is built on
 *   >>> a different subject on purpose: the §237 authorization requires the C2 family repaired
 *   >>> generically, not the climbing-centre case patched.
 *
 * The schema-conformant candidate, declaration and clarification builders are IMPORTED from the
 * §235 fixtures unchanged. They describe the §210J base contract, which §237 does not touch.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import { governedBindingFor } from './expert-first-pass-instruction-vnext';
import { buildExpert237WireSchema, type PostureDriverRole237 }
  from './expert-237-posture-contract';
import { candidate, declaration, clarification } from './expert-235-posture-fixtures';

export { candidate, declaration, clarification };

export const FIXTURES_237_VERSION = 'hazlenz.expert.237.posture-fixtures.v1' as const;

export const FIXTURE_INPUT_237: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'ANL-237-FIXTURE',
  authoritativeSources: [{
    sourceId: 'OBS-237-FIXTURE', sourceType: 'observation',
    text: 'A fixture observation. The scenarios below carry their own facts.',
  }],
  inspectionContext: { location: 'fixture', task: 'fixture' },
  jurisdiction: 'US', allowedHazardFamilies: ['machinery'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
};

export function fixtureSchema237(): Record<string, unknown> {
  return buildExpert237WireSchema(FIXTURE_INPUT_237, governedBindingFor([]));
}

type Driver = { ref: string; refKind: string; driverRole?: string };

/** A basis entry with its role. The role is the whole of the §237 addition. */
export const drv = (ref: string, role: PostureDriverRole237): Driver =>
  ({ ref, refKind: role.startsWith('ESTABLISHED_') ? 'HAZARD_CANDIDATE' : 'UNRESOLVED_DECLARATION',
    driverRole: role });
/** A basis entry with a deliberately wrong or absent role, for the shape scenarios. */
export const drvRaw = (ref: string, refKind: string, driverRole?: string): Driver =>
  driverRole === undefined ? { ref, refKind } : { ref, refKind, driverRole };

export function posture237(p: {
  posture: string;
  requiredBy?: Driver[];
  accepted?: { ref: string; refKind: string; reason: string }[];
  controls?: { control: string; timing: string }[];
  resume?: { resolvedByDeclarationIds: string[]; correctionsRequired: string[] };
  whatHappensNow?: string;
  /** The retired §235 field, present only where a scenario proves it now carries no authority. */
  legacyCessationList?: unknown;
}): Record<string, unknown> {
  const o: Record<string, unknown> = {
    posture: p.posture,
    requiredBy: p.requiredBy ?? [],
    acceptedWithoutImmediateAction: p.accepted ?? [],
    requiredControls: p.controls ?? [],
    resumeCondition: p.resume ?? { resolvedByDeclarationIds: [], correctionsRequired: [] },
    whatHappensNow: p.whatHappensNow ?? 'the operational consequence, stated plainly',
  };
  if (p.legacyCessationList !== undefined) {
    o.establishedConditionsRequiringCessation = p.legacyCessationList;
  }
  return o;
}

export function analysis237(a: {
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
    crossHazardInsights: [], disagreements: [],
    uncertainty: { statements: [] },
    outcome: 'ANALYSIS_COMPLETE',
    expertExplanation: { summary: 'the explanation summary' },
  };
  if (a.omitPosture !== true) out.immediateSafetyPosture = a.posture ?? posture237({ posture: 'CONTINUE' });
  return out;
}

// ================================================================ the scenarios

export interface Scenario237 {
  readonly id: string;
  readonly family: 'DERIVED_FLOOR' | 'LEGACY_FIELD_HAS_NO_AUTHORITY' | 'RESPONSE_UNCERTAINTY'
    | 'RESTRAINT' | 'DRIVER_SHAPE' | 'RETAINED_FROM_235';
  readonly validationItems: readonly number[];
  readonly name: string;
  readonly whatItExercises: string;
  readonly payload: unknown;
  readonly expectAdmitted: boolean;
  readonly expectCodes: readonly string[];
  readonly expectDerivedCessationCount?: number;
}

const KILN = 'tunnel-kiln-car-derailed-against-wall';
const SEPARATE = 'kiln-exhaust-damper-position-unknown';
const RESPONSE = 'who-was-asked-to-order-the-replacement-seal';

export const SCENARIOS_237: readonly Scenario237[] = [

  // ============================================================ the derived floor
  {
    id: 'F1', family: 'DERIVED_FLOOR', validationItems: [1, 2],
    name: 'a cessation driver forces STOP, and the set is derived from the basis',
    whatItExercises: 'the §235 safety invariant, preserved. The posture floor now comes from a role '
      + 'on a reference the analysis already carries, and no second list exists anywhere.',
    payload: analysis237({
      candidates: [candidate(KILN)],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [drv(KILN, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['re-rail the car under a '
          + 'lifting plan before anyone enters the kiln aisle'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 1,
  },
  {
    id: 'F2', family: 'DERIVED_FLOOR', validationItems: [1],
    name: 'a cessation driver under HOLD is refused',
    whatItExercises: 'the §234 autoclave defect, still closed. The model cannot name an established '
      + 'condition already requiring cessation and then report anything less protective.',
    payload: analysis237({
      candidates: [candidate(KILN)],
      declarations: [declaration('decl-manufactured')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [drv(KILN, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION'),
          drv('decl-manufactured', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: ['decl-manufactured'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE'],
  },
  {
    id: 'F3', family: 'DERIVED_FLOOR', validationItems: [4, 9],
    name: 'established STOP with a genuinely separate unresolved property, and with none',
    whatItExercises: 'a stop that also declares a real separate open property stays a stop, and a '
      + 'stop needs no declaration at all to carry it.',
    payload: analysis237({
      candidates: [candidate(KILN), candidate(SEPARATE, 'INSUFFICIENT_EVIDENCE')],
      declarations: [declaration('decl-damper')],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [drv(KILN, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION'),
          drv('decl-damper', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        accepted: [{ ref: SEPARATE, refKind: 'HAZARD_CANDIDATE',
          reason: 'the damper question changes nothing today because the kiln aisle is closed '
            + 'either way' }],
        resume: { resolvedByDeclarationIds: ['decl-damper'],
          correctionsRequired: ['re-rail the car under a lifting plan'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 1,
  },
  {
    id: 'F4', family: 'DERIVED_FLOOR', validationItems: [9],
    name: 'STOP with zero declarations',
    whatItExercises: 'no manufactured declaration is required to carry a posture. This is the §233 '
      + 'restraint property, unchanged by the closure.',
    payload: analysis237({
      candidates: [candidate(KILN)],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [drv(KILN, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['re-rail the car'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 1,
  },

  // ============================================================ the retired field has no authority
  {
    id: 'L1', family: 'LEGACY_FIELD_HAS_NO_AUTHORITY', validationItems: [2],
    name: 'the retired §235 cessation field, absent, cannot remove the STOP floor',
    whatItExercises: 'THE §236 FAILURE MODE, STRUCTURALLY IMPOSSIBLE. Three §236 outputs were '
      + 'refused for omitting that field. There is now nothing to omit and the floor is unaffected.',
    payload: analysis237({
      candidates: [candidate(KILN)],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [drv(KILN, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['re-rail the car'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 1,
  },
  {
    id: 'L2', family: 'LEGACY_FIELD_HAS_NO_AUTHORITY', validationItems: [3],
    name: 'a stray legacy cessation list, malformed, changes nothing',
    whatItExercises: 'THE §236 C3 FAILURE MODE, STRUCTURALLY IMPOSSIBLE. A model that still emits '
      + 'the old field, in the exact wrong shape §236 observed, is neither refused for it nor '
      + 'helped by it: duplicate provider authority no longer exists.',
    payload: analysis237({
      candidates: [candidate(KILN)],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [drv(KILN, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['re-rail the car'] },
        legacyCessationList: [KILN],
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 1,
  },
  {
    id: 'L3', family: 'LEGACY_FIELD_HAS_NO_AUTHORITY', validationItems: [3],
    name: 'a stray legacy cessation list cannot manufacture a floor the roles do not give',
    whatItExercises: 'the other direction, and it is the one that matters for safety authority. A '
      + 'populated legacy field beside roles that require only controls does NOT force STOP, '
      + 'because the retired field has no authority at all.',
    payload: analysis237({
      candidates: [candidate('exposure-below-limit-and-rising')],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [drv('exposure-below-limit-and-rising',
          'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')],
        controls: [{ control: 'a withdrawal threshold below the limit',
          timing: 'DURING_CONTINUED_WORK' }],
        legacyCessationList: [{ ref: 'exposure-below-limit-and-rising',
          refKind: 'HAZARD_CANDIDATE' }],
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 0,
  },

  // ============================================================ response uncertainty, the C2 repair
  {
    id: 'R1', family: 'RESPONSE_UNCERTAINTY', validationItems: [6],
    name: 'THE C2 TRAP. A hold whose only reason is uncertainty about the response',
    whatItExercises: 'the §236 C2 DEFECT, generalized onto a different subject: a bakery proofer '
      + 'seal is weeping and nobody can say who was asked to order the replacement. The analysis '
      + 'holds on that. D4 refuses, because resolving it changes only what is done about the seal '
      + 'and never whether the work is acceptable now.',
    payload: analysis237({
      candidates: [candidate('proofer-seal-weeping', 'ACTIVE')],
      declarations: [declaration(RESPONSE)],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [drv('proofer-seal-weeping', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
          drv(RESPONSE, 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')],
        resume: { resolvedByDeclarationIds: [RESPONSE], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'],
  },
  {
    id: 'R2', family: 'RESPONSE_UNCERTAINTY', validationItems: [6],
    name: 'the same facts reported as CONTINUE_WITH_CONTROLS',
    whatItExercises: 'the posture the facts require is admitted with the response question still '
      + 'declared and still carried. The repair removes an escalation, not a declaration.',
    payload: analysis237({
      candidates: [candidate('proofer-seal-weeping', 'ACTIVE')],
      declarations: [declaration(RESPONSE)],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [drv('proofer-seal-weeping', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
          drv(RESPONSE, 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')],
        controls: [{ control: 'tray and bund the weep and check it each shift until the seal is '
          + 'replaced', timing: 'DURING_CONTINUED_WORK' }],
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'R3', family: 'RESPONSE_UNCERTAINTY', validationItems: [7],
    name: 'CONTINUE with an administrative uncertainty declared and accepted',
    whatItExercises: 'a documentation question is real, is declared, is covered, and does not touch '
      + 'the posture. This is the §237 authorization list of administrative handling, follow-up and '
      + 'confirmation method, in the permissive case.',
    payload: analysis237({
      candidates: [candidate('proofer-seal-weeping', 'CONTROLLED')],
      declarations: [declaration('decl-which-form-records-the-check')],
      posture: posture237({
        posture: 'CONTINUE',
        requiredBy: [drv('proofer-seal-weeping',
          'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION')],
        accepted: [{ ref: 'decl-which-form-records-the-check', refKind: 'UNRESOLVED_DECLARATION',
          reason: 'which form the check is recorded on changes nothing about today' }],
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'R4', family: 'RESPONSE_UNCERTAINTY', validationItems: [8],
    name: 'a genuine decision-controlling uncertainty still elevates to HOLD',
    whatItExercises: 'THE ANTI-OVERCORRECTION CASE. Whether the proofer steam line is isolated is a '
      + 'property of the hazard, not of the response, and it still requires verification before '
      + 'anyone works on the seal.',
    payload: analysis237({
      candidates: [candidate('steam-line-isolation-unverified', 'INSUFFICIENT_EVIDENCE')],
      declarations: [declaration('decl-isolation-unverified')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [drv('decl-isolation-unverified',
          'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        accepted: [{ ref: 'steam-line-isolation-unverified', refKind: 'HAZARD_CANDIDATE',
          reason: 'the isolation question is the thing being resolved, not a separate exposure' }],
        resume: { resolvedByDeclarationIds: ['decl-isolation-unverified'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'R5', family: 'RESPONSE_UNCERTAINTY', validationItems: [6, 8],
    name: 'a hold driven by BOTH a controlling property and a response question',
    whatItExercises: 'D4 asks for AT LEAST ONE decision-controlling driver, not for every driver to '
      + 'be one. A legitimate hold that also declares a follow-up question is admitted.',
    payload: analysis237({
      candidates: [candidate('steam-line-isolation-unverified', 'INSUFFICIENT_EVIDENCE')],
      declarations: [declaration('decl-isolation-unverified'), declaration(RESPONSE)],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [drv('decl-isolation-unverified',
          'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
        drv(RESPONSE, 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')],
        accepted: [{ ref: 'steam-line-isolation-unverified', refKind: 'HAZARD_CANDIDATE',
          reason: 'the isolation question is the thing being resolved' }],
        resume: { resolvedByDeclarationIds: ['decl-isolation-unverified'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },

  // ============================================================ restraint
  {
    id: 'T1', family: 'RESTRAINT', validationItems: [10],
    name: 'an ACTIVE, serious, properly controlled hazard under CONTINUE',
    whatItExercises: 'NO FALSE STOP INFLATION. An active hazard operated inside a proven regime '
      + 'takes the permissive role and CONTINUE is admitted. The rule is not "established hazard '
      + 'means STOP".',
    payload: analysis237({
      candidates: [candidate('molten-metal-bath-thermal', 'ACTIVE')],
      posture: posture237({
        posture: 'CONTINUE',
        requiredBy: [drv('molten-metal-bath-thermal',
          'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION')],
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 0,
  },
  {
    id: 'T2', family: 'RESTRAINT', validationItems: [10],
    name: 'an ACTIVE hazard accepted without action, with an empty basis',
    whatItExercises: 'the §233 acceptance path is untouched by the closure.',
    payload: analysis237({
      candidates: [candidate('molten-metal-bath-thermal', 'ACTIVE')],
      posture: posture237({
        posture: 'CONTINUE',
        accepted: [{ ref: 'molten-metal-bath-thermal', refKind: 'HAZARD_CANDIDATE',
          reason: 'real, present and active, and every control that makes it acceptable is already '
            + 'in effect and evidenced' }],
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 0,
  },
  {
    id: 'T3', family: 'RESTRAINT', validationItems: [10],
    name: 'CONTINUE_WITH_CONTROLS driven by an established condition requiring controls',
    whatItExercises: 'the middle posture is untouched and needs no decision-controlling driver.',
    payload: analysis237({
      candidates: [candidate('exposure-below-limit-and-rising', 'ACTIVE')],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [drv('exposure-below-limit-and-rising',
          'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')],
        controls: [{ control: 'a withdrawal threshold below the limit',
          timing: 'DURING_CONTINUED_WORK' }],
      }),
    }),
    expectAdmitted: true, expectCodes: [], expectDerivedCessationCount: 0,
  },

  // ============================================================ driver-role shape
  {
    id: 'D1', family: 'DRIVER_SHAPE', validationItems: [1],
    name: 'a basis entry with no driver role',
    whatItExercises: 'the role is required, so a driver can never be silent about what it drives. '
      + 'An absent role refuses the analysis rather than reading as an empty cessation set.',
    payload: analysis237({
      candidates: [candidate('cand-shape-1')],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [drvRaw('cand-shape-1', 'HAZARD_CANDIDATE')],
        controls: [{ control: 'a control', timing: 'DURING_CONTINUED_WORK' }],
      }),
    }),
    expectAdmitted: false, expectCodes: ['POSTURE_DRIVER_ROLE_MISSING'],
  },
  {
    id: 'D2', family: 'DRIVER_SHAPE', validationItems: [1],
    name: 'a driver role outside the vocabulary',
    whatItExercises: 'membership, not interpretation.',
    payload: analysis237({
      candidates: [candidate('cand-shape-2')],
      posture: posture237({
        posture: 'CONTINUE',
        requiredBy: [drvRaw('cand-shape-2', 'HAZARD_CANDIDATE', 'SEEMS_QUITE_BAD')],
      }),
    }),
    expectAdmitted: false, expectCodes: ['POSTURE_DRIVER_ROLE_INVALID'],
  },
  {
    id: 'D3', family: 'DRIVER_SHAPE', validationItems: [1],
    name: 'a declaration labelled with an established-condition role',
    whatItExercises: 'an unresolved fact is by definition not established, and the role vocabulary '
      + 'says so structurally. This is the §235 CESSATION_REF_NOT_A_CANDIDATE rule, preserved '
      + 'without a second list to enforce it on.',
    payload: analysis237({
      candidates: [candidate('cand-shape-3')],
      declarations: [declaration('decl-shape-3')],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [drv('cand-shape-3', 'ESTABLISHED_CONDITION_REQUIRING_CESSATION'),
          drvRaw('decl-shape-3', 'UNRESOLVED_DECLARATION',
            'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        resume: { resolvedByDeclarationIds: ['decl-shape-3'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'],
  },
  {
    id: 'D4', family: 'DRIVER_SHAPE', validationItems: [1],
    name: 'a STOP whose only drivers require controls',
    whatItExercises: 'the floor from the other side. An analysis that says every reason is '
      + 'controllable and then reports STOP contradicts itself and is refused fail-closed.',
    payload: analysis237({
      candidates: [candidate('cand-shape-4')],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [drv('cand-shape-4', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'],
  },

  // ============================================================ retained from §235
  {
    id: 'K1', family: 'RETAINED_FROM_235', validationItems: [11],
    name: 'a resume condition under a posture that permits work',
    whatItExercises: 'P8, retained. Work that may continue is not waiting to resume.',
    payload: analysis237({
      candidates: [candidate('cand-resume')],
      declarations: [declaration('decl-resume')],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [drv('cand-resume', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
          drv('decl-resume', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')],
        controls: [{ control: 'a control', timing: 'DURING_CONTINUED_WORK' }],
        resume: { resolvedByDeclarationIds: ['decl-resume'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['RESUME_CONDITION_UNDER_PERMITTING_POSTURE'],
  },
  {
    id: 'K2', family: 'RETAINED_FROM_235', validationItems: [11],
    name: 'the posture object transported as a malformed JSON string',
    whatItExercises: 'P9, retained. Malformed safety state stays fail-closed and is never repaired.',
    payload: (() => {
      const a = analysis237({
        candidates: [candidate('cand-malformed')],
        posture: posture237({
          posture: 'STOP',
          requiredBy: [drv('cand-malformed', 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
          resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] },
        }),
      });
      a.immediateSafetyPosture = `${JSON.stringify(a.immediateSafetyPosture)}}`;
      return a;
    })(),
    expectAdmitted: false,
    expectCodes: ['POSTURE_NOT_AN_OBJECT', 'WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT'],
  },
  {
    id: 'K3', family: 'RETAINED_FROM_235', validationItems: [11],
    name: 'the posture object transported as a JSON string that parses and conforms',
    whatItExercises: 'safe normalization, retained and still working against the §237 schema.',
    payload: (() => {
      const a = analysis237({
        candidates: [candidate('cand-string', 'CONTROLLED')],
        posture: posture237({
          posture: 'CONTINUE',
          requiredBy: [drv('cand-string', 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION')],
        }),
      });
      a.immediateSafetyPosture = JSON.stringify(a.immediateSafetyPosture);
      return a;
    })(),
    expectAdmitted: true, expectCodes: [],
  },
];
