/**
 * §239 LOCAL FIXTURES. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * SYNTHESIZED analyses. They prove the broadened binding behaves; they cannot establish what a
 * model will choose.
 *
 *   >>> THE §238 OBSERVATIONS ARE NOT USED AS TESTS. The §239 authorization requires the repair
 *   >>> proven on GENERALIZED fixtures rather than on the three §238 outputs, so no subject, fact
 *   >>> pattern or candidate key from §238 appears here: no saw blade, no vehicle lift, no medical
 *   >>> oxygen reserve bank, no powder-spray hopper. §234, §236 and §237 subjects are likewise
 *   >>> absent. What is reused is the SHAPE of each failure, which is the thing a successor has to
 *   >>> answer.
 *
 * The schema-conformant candidate, declaration and clarification builders and the posture and
 * analysis assemblers are IMPORTED from the §237 fixtures unchanged, because §239 changes neither
 * the posture object nor the basis entry.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput, type ExpertConditionState,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { governedBindingFor } from './expert-first-pass-instruction-vnext';
import { buildExpert239WireSchema, type PostureDriverRole239 }
  from './expert-239-posture-contract';
import {
  candidate, declaration, clarification, posture237, analysis237,
} from './expert-237-posture-fixtures';

export { candidate, declaration, clarification, posture237, analysis237 };

export const FIXTURES_239_VERSION = 'hazlenz.expert.239.posture-fixtures.v1' as const;

export const FIXTURE_INPUT_239: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'ANL-239-FIXTURE',
  authoritativeSources: [{
    sourceId: 'OBS-239-FIXTURE', sourceType: 'observation',
    text: 'A fixture observation. The scenarios below carry their own facts.',
  }],
  inspectionContext: { location: 'fixture', task: 'fixture' },
  jurisdiction: 'US', allowedHazardFamilies: ['machinery'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
};

export function fixtureSchema239(): Record<string, unknown> {
  return buildExpert239WireSchema(FIXTURE_INPUT_239, governedBindingFor([]));
}

type Driver = { ref: string; refKind: string; driverRole?: string };

/** A basis entry on a declaration. */
export const dec = (ref: string, role: PostureDriverRole239): Driver =>
  ({ ref, refKind: 'UNRESOLVED_DECLARATION', driverRole: role });
/** A basis entry on a hazard candidate. The carrier §239 adds for the controlling role. */
export const can = (ref: string, role: PostureDriverRole239): Driver =>
  ({ ref, refKind: 'HAZARD_CANDIDATE', driverRole: role });
/** A basis entry with a deliberately wrong or absent role, for the shape scenarios. */
export const raw = (ref: string, refKind: string, driverRole?: string): Driver =>
  driverRole === undefined ? { ref, refKind } : { ref, refKind, driverRole };

/** A candidate whose governed state is absent altogether. Fail-closed input, never a repair target. */
export function candidateWithoutState(candidateKey: string): Record<string, unknown> {
  const c = { ...candidate(candidateKey) };
  delete (c as Record<string, unknown>).assertedConditionState;
  return c;
}

// ================================================================ the scenarios

export interface Scenario239 {
  readonly id: string;
  readonly family: 'B1_ADMITTED' | 'B2_REFUSED' | 'C1_REFUSED' | 'CESSATION_UNCHANGED'
    | 'HOLD_UNCHANGED' | 'RESPONSE_UNCERTAINTY' | 'RESTRAINT';
  /** The numbered local-proof obligations in the §239 authorization this scenario discharges. */
  readonly proves: readonly number[];
  readonly name: string;
  readonly whatItExercises: string;
  readonly payload: unknown;
  readonly expectAdmitted: boolean;
  readonly expectCodes: readonly string[];
  readonly expectDerivedCessationCount?: number;
  readonly expectDerivedControllingCount?: number;
}

// fresh subjects, used nowhere in §234, §236, §237 or §238
const DRYER = 'grain-dryer-plenum-temperature-not-established';
const DOSING = 'chlorine-dosing-skid-residual-pressure-not-established';
const ANCHOR = 'rope-access-anchor-load-path-not-established';
const FUME = 'fume-cupboard-face-velocity-not-established';
const COUPLING = 'mixer-coupling-guard-absent';
const SPRINKLER = 'sprinkler-control-valve-found-shut';
const CONVEYOR = 'conveyor-nip-point-guarded-and-interlocked';

const ANY_STATE = (k: string, s: ExpertConditionState) => candidate(k, s);

export const SCENARIOS_239: readonly Scenario239[] = [

  // ============================================================ B1: the authorized repair
  {
    id: 'U1', family: 'B1_ADMITTED', proves: [1],
    name: 'an UNKNOWN candidate serves as the unresolved continuation-controlling driver',
    whatItExercises: 'the §237 binding admitted this role only on a declaration. UNKNOWN is a '
      + 'governed member of the candidate-state vocabulary and it means the analysis could not '
      + 'place the condition, which is exactly an unresolved property.',
    payload: analysis237({
      candidates: [ANY_STATE(ANCHOR, 'UNKNOWN')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [can(ANCHOR, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['establish the anchor load path before anyone loads the line'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 1,
  },
  {
    id: 'U2', family: 'B1_ADMITTED', proves: [2],
    name: 'an INSUFFICIENT_EVIDENCE candidate serves as the unresolved controlling driver',
    whatItExercises: 'the other governed unresolved member, on a different subject. The §238 B1 '
      + 'output used this state and the contract had no member for it.',
    payload: analysis237({
      candidates: [ANY_STATE(DOSING, 'INSUFFICIENT_EVIDENCE')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [can(DOSING, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['establish whether the skid is still under residual pressure'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 1,
  },
  {
    id: 'U3', family: 'B1_ADMITTED', proves: [3],
    name: 'an unresolved declaration remains a valid controlling driver',
    whatItExercises: 'the §237 carrier, unchanged. A widening that broke the original binding '
      + 'would be a rewrite, not a widening.',
    payload: analysis237({
      declarations: [declaration('decl-dryer-plenum')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [dec('decl-dryer-plenum', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: ['decl-dryer-plenum'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 1,
  },
  {
    id: 'U4', family: 'B1_ADMITTED', proves: [1, 2, 3, 10],
    name: 'THE GENERALIZED B1 SHAPE: the same role on a declaration AND on its undecided candidate',
    whatItExercises: 'the exact structure §238 B1 produced, rebuilt on a subject §238 never saw. '
      + 'One property, stated twice because both statements are true, and the contract now has a '
      + 'member for each. Neither statement repairs or contradicts the other.',
    payload: analysis237({
      candidates: [ANY_STATE(DRYER, 'INSUFFICIENT_EVIDENCE'), ANY_STATE(FUME, 'UNKNOWN')],
      declarations: [declaration('decl-plenum-temperature')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [
          can(DRYER, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
          can(FUME, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
          dec('decl-plenum-temperature', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
        ],
        resume: { resolvedByDeclarationIds: ['decl-plenum-temperature'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 3,
  },
  {
    id: 'U5', family: 'B1_ADMITTED', proves: [1, 2],
    name: 'the broadened carrier reaches STOP as well as HOLD',
    whatItExercises: 'D4 asks for a decision-controlling driver under ANY posture that does not '
      + 'permit work. The new carrier satisfies it at the STOP end too, and does so without '
      + 'touching the cessation role or the floor.',
    payload: analysis237({
      candidates: [ANY_STATE(ANCHOR, 'UNKNOWN')],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [can(ANCHOR, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['prove the anchor load path before the system is re-rigged'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 1,
  },

  // ============================================================ B2: the preserved refusal
  {
    id: 'X1', family: 'B2_REFUSED', proves: [4],
    name: 'an ACTIVE candidate carrying the unresolved controlling role is refused',
    whatItExercises: 'THE §238 B2 INVARIANT. ACTIVE means the analysis placed the condition: '
      + 'established and present. It cannot also be the unresolved property that decides whether '
      + 'work continues. The two labels are both the model\'s own and they disagree.',
    payload: analysis237({
      candidates: [candidate(SPRINKLER)],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [can(SPRINKLER, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['establish the valve position'] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE',
      'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'],
  },
  {
    id: 'X2', family: 'B2_REFUSED', proves: [4, 11],
    name: 'THE GENERALIZED B2 SHAPE: any settled state, not only ACTIVE',
    whatItExercises: 'CONTROLLED is as settled as ACTIVE. The rule is a membership test against the '
      + 'two governed unresolved members, so it generalizes across the whole vocabulary rather '
      + 'than patching the one state §238 happened to produce.',
    payload: analysis237({
      candidates: [ANY_STATE(COUPLING, 'CONTROLLED'), ANY_STATE(ANCHOR, 'UNKNOWN')],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [
          can(COUPLING, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
          can(ANCHOR, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
        ],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'],
  },
  {
    id: 'X3', family: 'B2_REFUSED', proves: [4],
    name: 'a candidate carrying the controlling role with no governed state at all is refused',
    whatItExercises: 'fail-closed on absence. A missing state is not read as permission, and the '
      + 'validator does not supply one.',
    payload: analysis237({
      candidates: [candidateWithoutState(FUME)],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [can(FUME, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE',
      'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'],
  },
  {
    id: 'X4', family: 'B2_REFUSED', proves: [4],
    name: 'a declaration carrying an established-condition role is still refused',
    whatItExercises: 'the binding is widened in ONE direction only. An unresolved fact is not an '
      + 'established condition and the three ESTABLISHED roles remain candidate-only.',
    payload: analysis237({
      candidates: [candidate(COUPLING)],
      declarations: [declaration('decl-guard-history')],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [
          can(COUPLING, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION'),
          raw('decl-guard-history', 'UNRESOLVED_DECLARATION',
            'ESTABLISHED_CONDITION_REQUIRING_CESSATION'),
        ],
        resume: { resolvedByDeclarationIds: ['decl-guard-history'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'],
  },

  // ============================================================ C1: the preserved refusal
  {
    id: 'P1', family: 'C1_REFUSED', proves: [9, 12],
    name: 'a corrective action as a resume prerequisite under CONTINUE_WITH_CONTROLS is refused',
    whatItExercises: 'THE §238 C1 INVARIANT, on a subject §238 never saw. A posture that permits '
      + 'work states no resumption dependency, because nothing has been suspended.',
    payload: analysis237({
      candidates: [candidate(CONVEYOR)],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [can(CONVEYOR, 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')],
        controls: [{ control: 'keep the interlock proven before each shift',
          timing: 'DURING_CONTINUED_WORK' }],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['keep the interlock proven before each shift'] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['RESUME_CONDITION_UNDER_PERMITTING_POSTURE'],
  },
  {
    id: 'P2', family: 'C1_REFUSED', proves: [9, 12],
    name: 'THE GENERALIZED C1 SHAPE: a declaration as a resume prerequisite under CONTINUE',
    whatItExercises: 'the same invariant through the other resume list and the other permitting '
      + 'posture, so the rule is not a patch on the one field §238 exercised.',
    payload: analysis237({
      declarations: [declaration('decl-who-logged-the-check')],
      posture: posture237({
        posture: 'CONTINUE',
        requiredBy: [dec('decl-who-logged-the-check', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')],
        resume: { resolvedByDeclarationIds: ['decl-who-logged-the-check'],
          correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false, expectCodes: ['RESUME_CONDITION_UNDER_PERMITTING_POSTURE'],
  },

  // ============================================================ cessation, unchanged
  {
    id: 'S1', family: 'CESSATION_UNCHANGED', proves: [5],
    name: 'an established cessation candidate under STOP is admitted and derives the floor',
    whatItExercises: 'the §235 safety invariant carried through §237 and untouched by §239. The '
      + 'derived set is still requiredBy filtered on one enum member.',
    payload: analysis237({
      candidates: [candidate(SPRINKLER)],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [can(SPRINKLER, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['restore and lock the control valve open before hot work resumes'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 1, expectDerivedControllingCount: 1,
  },
  {
    id: 'S2', family: 'CESSATION_UNCHANGED', proves: [6],
    name: 'a cessation driver under a posture less protective than STOP is refused',
    whatItExercises: 'THE STOP FLOOR. §239 broadens where an UNRESOLVED role may be written and '
      + 'touches neither the floor nor the role that sets it.',
    payload: analysis237({
      candidates: [candidate(SPRINKLER), candidate(CONVEYOR)],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [can(SPRINKLER, 'ESTABLISHED_CONDITION_REQUIRING_CESSATION'),
          can(CONVEYOR, 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')],
        controls: [{ control: 'a control', timing: 'DURING_CONTINUED_WORK' }],
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE'],
  },
  {
    id: 'S3', family: 'CESSATION_UNCHANGED', proves: [6],
    name: 'a STOP whose only drivers require controls is refused',
    whatItExercises: 'the floor from the other side, unchanged. An undecided candidate would have '
      + 'satisfied D4 here; a controls-requiring one does not, and §239 did not weaken that.',
    payload: analysis237({
      candidates: [candidate(CONVEYOR)],
      posture: posture237({
        posture: 'STOP',
        requiredBy: [can(CONVEYOR, 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'],
  },

  // ============================================================ legitimate hold, unchanged
  {
    id: 'H1', family: 'HOLD_UNCHANGED', proves: [7],
    name: 'a legitimate hold carrying a real hazard, a controlling unknown and a follow-up question',
    whatItExercises: 'the mixed basis. An active hazard under controls, an undecided candidate that '
      + 'decides, and a declaration that only decides the response, all in one admitted analysis.',
    payload: analysis237({
      candidates: [candidate(COUPLING), ANY_STATE(DOSING, 'INSUFFICIENT_EVIDENCE')],
      declarations: [declaration('decl-who-orders-the-guard')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [
          can(COUPLING, 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
          can(DOSING, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
          dec('decl-who-orders-the-guard', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP'),
        ],
        controls: [{ control: 'isolate the skid before anyone breaks a joint',
          timing: 'BEFORE_WORK_RESUMES' }],
        resume: { resolvedByDeclarationIds: [],
          correctionsRequired: ['establish the residual pressure'] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 1,
  },

  // ============================================================ response uncertainty
  {
    id: 'R1', family: 'RESPONSE_UNCERTAINTY', proves: [8],
    name: 'a hold whose only unresolved driver is a follow-up question is refused',
    whatItExercises: 'response uncertainty cannot make a posture non-permitting. The role, not the '
      + 'carrier, is what decides, and §239 changed carriers only.',
    payload: analysis237({
      candidates: [candidate(CONVEYOR)],
      declarations: [declaration('decl-who-logged-it')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [
          can(CONVEYOR, 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
          dec('decl-who-logged-it', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP'),
        ],
        resume: { resolvedByDeclarationIds: ['decl-who-logged-it'], correctionsRequired: [] },
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'],
  },
  {
    id: 'R2', family: 'RESPONSE_UNCERTAINTY', proves: [8],
    name: 'the response role on an undecided candidate is still refused',
    whatItExercises: 'THE DECLARED RESIDUAL NARROWNESS, made visible as a test rather than left as '
      + 'a footnote. The §239 authorization broadens the CONTROLLING driver and nothing else, so '
      + 'this shape refuses and the refusal is disclosed rather than discovered later.',
    payload: analysis237({
      candidates: [ANY_STATE(FUME, 'UNKNOWN')],
      posture: posture237({
        posture: 'CONTINUE',
        requiredBy: [can(FUME, 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')],
      }),
    }),
    expectAdmitted: false, expectCodes: ['DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'],
  },
  {
    id: 'R3', family: 'RESPONSE_UNCERTAINTY', proves: [8],
    name: 'a controlling role assigned to a declaration cannot be refuted deterministically',
    whatItExercises: 'THE LIMIT, stated as a fixture so it is not mistaken for a guarantee. This '
      + 'declaration is a follow-up question in substance and the model labelled it controlling. '
      + 'The analysis is ADMITTED, because refuting the label would mean reading the prose. §239 '
      + 'does not close this and does not claim to.',
    payload: analysis237({
      declarations: [declaration('decl-who-was-asked-to-order-it')],
      posture: posture237({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [dec('decl-who-was-asked-to-order-it',
          'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: ['decl-who-was-asked-to-order-it'],
          correctionsRequired: [] },
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 1,
  },

  // ============================================================ restraint
  {
    id: 'T1', family: 'RESTRAINT', proves: [8],
    name: 'an undecided candidate accepted without immediate action under CONTINUE',
    whatItExercises: 'NO FALSE ESCALATION. An unresolved candidate in the analysis does not force a '
      + 'hold, is not required to appear in requiredBy at all, and has an admissible home under a '
      + 'posture that permits work.',
    payload: analysis237({
      candidates: [ANY_STATE(FUME, 'UNKNOWN')],
      posture: posture237({
        posture: 'CONTINUE',
        accepted: [{ ref: FUME, refKind: 'HAZARD_CANDIDATE',
          reason: 'nobody is working at the cupboard today and nothing turns on the face velocity' }],
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 0,
  },
  {
    id: 'T2', family: 'RESTRAINT', proves: [8],
    name: 'an undecided candidate carrying the controlling role under a permitting posture',
    whatItExercises: 'the broadening adds a CARRIER, not an escalation. §239 introduces no rule '
      + 'that forces a controlling driver to change the posture, exactly as §237 introduced none '
      + 'for a controlling declaration.',
    payload: analysis237({
      candidates: [ANY_STATE(DOSING, 'INSUFFICIENT_EVIDENCE'), candidate(CONVEYOR)],
      posture: posture237({
        posture: 'CONTINUE_WITH_CONTROLS',
        requiredBy: [
          can(DOSING, 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
          can(CONVEYOR, 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
        ],
        controls: [{ control: 'keep the joint closed until the residual is established',
          timing: 'DURING_CONTINUED_WORK' }],
      }),
    }),
    expectAdmitted: true, expectCodes: [],
    expectDerivedCessationCount: 0, expectDerivedControllingCount: 1,
  },
];
