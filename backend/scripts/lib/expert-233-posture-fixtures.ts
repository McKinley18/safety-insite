/**
 * §233 LOCAL FIXTURES. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * These are SYNTHESIZED analyses, not provider output. They exercise the contract and the
 * projection. They cannot and do not establish whether a model chooses the right posture: that is
 * a hosted question and §233 does not claim it.
 *
 *   >>> FRESHNESS. No subject, industry, equipment or observation from the §231 acceptance cohort
 *   >>> appears here. §231 is spent evidence: it may diagnose, and it may not be tuned against.
 *   >>> The fixtures are also BALANCED ACROSS THE FOUR POSTURES rather than inheriting the §230
 *   >>> skew of twenty-three stop-or-hold to seven continue, because the property under test is
 *   >>> DISCRIMINATION and a skewed set cannot measure it.
 */

import type { ImmediateSafetyPosture233 } from './expert-233-posture-contract';

export const FIXTURES_233_VERSION = 'hazlenz.expert.233.posture-fixtures.v1' as const;

type Cand = { candidateKey: string; assertedConditionState: string };
type Decl = { declarationId: string; decisionWhileUnresolved?: string };
type Clar = { clarificationId: string; criticality: string;
  answersUnresolvedFactDeclarationId?: string };
type Ref = { ref: string; refKind: 'HAZARD_CANDIDATE' | 'UNRESOLVED_DECLARATION' };

export interface Analysis233 {
  expertHazardCandidates: Cand[];
  unresolvedFactDeclarations: Decl[];
  decisionCriticalClarifications: Clar[];
  immediateSafetyPosture?: unknown;
}

export function analysis(a: {
  candidates?: Cand[]; declarations?: Decl[]; clarifications?: Clar[];
  posture?: unknown;
}): Analysis233 {
  const out: Analysis233 = {
    expertHazardCandidates: a.candidates ?? [],
    unresolvedFactDeclarations: a.declarations ?? [],
    decisionCriticalClarifications: a.clarifications ?? [],
  };
  if (a.posture !== undefined) out.immediateSafetyPosture = a.posture;
  return out;
}

export function posture(p: {
  posture: ImmediateSafetyPosture233 | string;
  requiredBy?: Ref[];
  accepted?: (Ref & { reason: string })[];
  controls?: { control: string; timing: string }[];
  resume?: { resolvedByDeclarationIds: string[]; correctionsRequired: string[] };
  whatHappensNow?: string;
}): Record<string, unknown> {
  return {
    posture: p.posture,
    requiredBy: p.requiredBy ?? [],
    acceptedWithoutImmediateAction: p.accepted ?? [],
    requiredControls: p.controls ?? [],
    resumeCondition: p.resume ?? { resolvedByDeclarationIds: [], correctionsRequired: [] },
    whatHappensNow: p.whatHappensNow ?? 'the operational consequence, stated plainly',
  };
}

const c = (k: string, s = 'ACTIVE'): Cand => ({ candidateKey: k, assertedConditionState: s });
const d = (id: string, action = 'the legacy per-declaration action string'): Decl =>
  ({ declarationId: id, decisionWhileUnresolved: action });
const q = (id: string, crit: string, binds?: string): Clar =>
  ({ clarificationId: id, criticality: crit, answersUnresolvedFactDeclarationId: binds });
const hc = (ref: string): Ref => ({ ref, refKind: 'HAZARD_CANDIDATE' });
const ud = (ref: string): Ref => ({ ref, refKind: 'UNRESOLVED_DECLARATION' });

export interface Scenario233 {
  readonly id: string;
  readonly name: string;
  readonly whatItExercises: string;
  readonly analysis: Analysis233;
  readonly expectAdmitted: boolean;
  readonly expectCodes: readonly string[];
}

/** The fourteen scenarios the §233 authorization enumerates, in its order. */
export const SCENARIOS_233: readonly Scenario233[] = [
  {
    id: 'S1', name: 'established hazard requiring STOP with zero unresolved declarations',
    whatItExercises: 'a glass annealing lehr with an open drive guard. THE CENTRAL §232 FINDING: '
      + 'the posture is driven by an established hazard that owes no declaration, and under §210J '
      + 'there was no field in which to say it. G1, G4 and C1 fired on exactly this shape.',
    analysis: analysis({
      candidates: [c('lehr-drive-open-guard'), c('lehr-operator-proximity')],
      posture: posture({
        posture: 'STOP', requiredBy: [hc('lehr-drive-open-guard'), hc('lehr-operator-proximity')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['refit and secure the drive guard'] },
        whatHappensNow: 'stop the lehr drive and keep people clear until the guard is refitted',
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S2', name: 'established hazard, immediate controls, work continues',
    whatItExercises: 'CONTINUE_WITH_CONTROLS is not a softened STOP and not a dressed-up CONTINUE',
    analysis: analysis({
      candidates: [c('lehr-radiant-heat')],
      posture: posture({
        posture: 'CONTINUE_WITH_CONTROLS', requiredBy: [hc('lehr-radiant-heat')],
        controls: [{ control: 'screen the radiant face', timing: 'BEFORE_WORK_RESUMES' },
          { control: 'rotate the operator hourly', timing: 'DURING_CONTINUED_WORK' }],
        whatHappensNow: 'work continues behind the screen with rotation in place',
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S3', name: 'unresolved decision-critical property requiring HOLD',
    whatItExercises: 'a hold waits on a result and must name what must become true',
    analysis: analysis({
      candidates: [c('hoist-wire-condition', 'INSUFFICIENT_EVIDENCE')],
      declarations: [d('UF-hoist-rope')],
      clarifications: [q('CQ1', 'BLOCKING', 'UF-hoist-rope')],
      posture: posture({
        posture: 'HOLD_PENDING_VERIFICATION', requiredBy: [ud('UF-hoist-rope')],
        resume: { resolvedByDeclarationIds: ['UF-hoist-rope'], correctionsRequired: [] },
        whatHappensNow: 'no lift until the rope examination result is available',
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S4', name: 'unresolved property compatible with continued work',
    whatItExercises: 'THE RESTRAINT DIRECTION. An unresolved fact does not imply a stop, and the '
      + 'contract must not make one. §231 M5 and G8 are real cases of exactly this.',
    analysis: analysis({
      candidates: [c('lehr-stack-emission', 'INSUFFICIENT_EVIDENCE')],
      declarations: [d('UF-stack-rate')],
      clarifications: [q('CQ1', 'IMPORTANT', 'UF-stack-rate')],
      posture: posture({
        posture: 'CONTINUE', requiredBy: [], accepted: [{ ...ud('UF-stack-rate'),
          reason: 'the rate bears on the annual return, not on anything happening on the floor today' }],
        whatHappensNow: 'production continues unchanged',
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S5', name: 'genuinely safe or negated condition',
    whatItExercises: 'no ACTIVE candidate, no declaration, nothing forced',
    analysis: analysis({
      candidates: [c('travel-hoist-slings', 'CONTROLLED')],
      posture: posture({ posture: 'CONTINUE', whatHappensNow: 'the lift proceeds as planned' }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S6', name: 'multiple unresolved facts that could imply contradictory postures',
    whatItExercises: 'THE M9 SHAPE. Under §210J each declaration carried its own action string and '
      + 'the two contradicted. There is now exactly one posture and both declarations answer to it.',
    analysis: analysis({
      candidates: [c('winder-nip'), c('winder-extraction', 'INSUFFICIENT_EVIDENCE')],
      declarations: [
        d('UF-nip-guard', 'restrict access to the nip'),
        d('UF-extract-rate', 'continue running with heightened caution'),
      ],
      clarifications: [q('CQ1', 'BLOCKING', 'UF-nip-guard'), q('CQ2', 'BLOCKING', 'UF-extract-rate')],
      posture: posture({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [hc('winder-nip'), ud('UF-nip-guard'), ud('UF-extract-rate')],
        accepted: [{ ...hc('winder-extraction'), reason: 'covered by the same hold' }],
        resume: { resolvedByDeclarationIds: ['UF-nip-guard', 'UF-extract-rate'], correctionsRequired: [] },
        whatHappensNow: 'the winder is held until both results are in',
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S7', name: 'established hazard plus separate unresolved property',
    whatItExercises: 'THE C1 SHAPE. §231 handled the declared fact correctly and said nothing about '
      + 'the established one. Both must now be covered by the single posture.',
    analysis: analysis({
      candidates: [c('debarker-unguarded-infeed')],
      declarations: [d('UF-deck-capacity')],
      clarifications: [q('CQ1', 'BLOCKING', 'UF-deck-capacity')],
      posture: posture({
        posture: 'STOP',
        requiredBy: [hc('debarker-unguarded-infeed'), ud('UF-deck-capacity')],
        resume: { resolvedByDeclarationIds: ['UF-deck-capacity'],
          correctionsRequired: ['refit the infeed guard'] },
        whatHappensNow: 'stop the infeed, guard it, and keep the deck clear pending the capacity result',
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S8', name: 'recommendation silence',
    whatItExercises: 'THE GATE-DECIDING DEFECT. §231 C8 passed only because its explanation prose '
      + 'happened to contain an instruction. Silence is now a refusal, not a coin toss.',
    analysis: analysis({ candidates: [c('batching-plant-access')] }),
    expectAdmitted: false, expectCodes: ['POSTURE_MISSING'],
  },
  {
    id: 'S9', name: 'action sequencing',
    whatItExercises: 'THE G10 SHAPE. A control placed alongside continued exposure under a posture '
      + 'that does not permit continued work is unsafe ORDER, not unsafe content.',
    analysis: analysis({
      candidates: [c('ladle-preheat-flame')],
      declarations: [d('UF-refractory-state')],
      posture: posture({
        posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [hc('ladle-preheat-flame'), ud('UF-refractory-state')],
        controls: [{ control: 'thermal survey of the shell', timing: 'DURING_CONTINUED_WORK' }],
        resume: { resolvedByDeclarationIds: ['UF-refractory-state'], correctionsRequired: [] },
        whatHappensNow: 'survey the shell while pouring continues',
      }),
    }),
    expectAdmitted: false,
    expectCodes: ['CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE'],
  },
  {
    id: 'S10', name: 'manufactured-declaration / restraint trap',
    whatItExercises: 'THE M4 SHAPE, INVERTED. In §231 a case passed the safety gate only by '
      + 'inventing an unresolved fact to carry the instruction. STOP must be fully expressible with '
      + 'zero declarations, so the incentive disappears rather than being policed.',
    analysis: analysis({
      candidates: [c('stunning-pen-gate-latch'), c('stunning-pen-operator-position')],
      posture: posture({
        posture: 'STOP',
        requiredBy: [hc('stunning-pen-gate-latch'), hc('stunning-pen-operator-position')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['replace the latch mechanism'] },
        whatHappensNow: 'the pen is taken out of use until the latch is replaced',
      }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
  {
    id: 'S11', name: 'malformed posture',
    whatItExercises: 'R7 extended to the posture narrative, EXTENDED NOT REIMPLEMENTED',
    analysis: analysis({
      candidates: [c('mast-anchor-corrosion')],
      posture: posture({
        posture: 'STOP', requiredBy: [hc('mast-anchor-corrosion')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['replace the anchor'] },
        whatHappensNow: 'N/A',
      }),
    }),
    expectAdmitted: false, expectCodes: ['POSTURE_NARRATIVE_PLACEHOLDER'],
  },
  {
    id: 'S12', name: 'missing required posture value',
    whatItExercises: 'a posture object that is present but names no posture',
    analysis: analysis({
      candidates: [c('kiln-car-transfer-pinch')],
      posture: posture({
        posture: 'PROBABLY_FINE', requiredBy: [hc('kiln-car-transfer-pinch')],
        whatHappensNow: 'something happens',
      }),
    }),
    expectAdmitted: false, expectCodes: ['POSTURE_VALUE_INVALID'],
  },
  {
    id: 'S13', name: 'missing required basis',
    whatItExercises: 'an ACTIVE candidate the posture neither acts on nor consciously accepts',
    analysis: analysis({
      candidates: [c('poultry-house-fan-failure'), c('poultry-house-standby-generator')],
      posture: posture({
        posture: 'CONTINUE_WITH_CONTROLS', requiredBy: [hc('poultry-house-fan-failure')],
        controls: [{ control: 'manual ventilation watch', timing: 'DURING_CONTINUED_WORK' }],
        whatHappensNow: 'the watch continues',
      }),
    }),
    expectAdmitted: false, expectCodes: ['ACTIVE_CANDIDATE_NOT_COVERED'],
  },
  {
    id: 'S14', name: 'no unnecessary posture or basis generation',
    whatItExercises: 'THE OVER-CORRECTION GUARD. Where nothing is active and nothing is owed, the '
      + 'contract forces no basis, no control and no restriction. CONTINUE with an empty basis is a '
      + 'correct and admissible answer.',
    analysis: analysis({
      candidates: [c('dough-brake-interlock', 'CONTROLLED'), c('dough-brake-training', 'NEGATED')],
      posture: posture({ posture: 'CONTINUE', whatHappensNow: 'the line runs as set up' }),
    }),
    expectAdmitted: true, expectCodes: [],
  },
];
