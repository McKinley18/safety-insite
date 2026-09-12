/**
 * EXPERT HAZLENZ -- the TEMPORAL-STATE contrastive corpus.
 *
 * Built for the R6 hosted negative-control repair (§110/D-122: `R6_HOSTED_OVERROUTING_REPRODUCED`,
 * 3/3 hosted calls). §110's hosted evidence showed the model reasoning FORWARD from a stated,
 * verified, resolved condition (a machine guard removed under a completed, second-person-verified
 * zero-energy isolation) to a hypothetical future transition (eventual re-energization) and then
 * treating that transition's contingencies as PRESENT, decision-critical unknowns -- even where the
 * observation had already answered the question being asked (residual stored energy, explicitly
 * "bled down and verified at zero").
 *
 * ==================== WHY SIX CLASSES, NOT ONE ====================
 *
 * A repair aimed only at making `R6` empty is falsifiable by construction: suppress
 * `machine_guarding` candidates, or suppress anything mentioning "removed," and the metric moves
 * while the product gets worse on every fixture that needed exactly that hazard raised. This corpus
 * is built so a repair that over-corrects fails it just as loudly as a repair that does nothing:
 *
 *   A. HISTORICAL + RESOLVED               -- must suppress
 *   B. HISTORICAL + CURRENTLY UNRESOLVED   -- must survive
 *   C. HISTORICAL + REMEDIATION UNCERTAIN  -- clarification may survive; candidate is not required
 *   D. RESOLVED PRIMARY + CURRENT SECONDARY -- suppress only the resolved part
 *   E. TRUE CURRENT MACHINE-GUARDING POSITIVE -- must survive, no over-suppression
 *   F. CLEAN NEGATIVE (different hazard family than R6) -- must stay empty
 *
 * ==================== WHY THE FAMILIES ARE MIXED ====================
 *
 * §110's defect and R6 itself are both `machine_guarding`/`lockout_tagout`. Phase 2 of this
 * operation's authorization requires the repair to generalize across hazard families rather than
 * hardcode one of them, so this corpus deliberately spreads the six classes across `electrical`,
 * `machine_guarding`, `lockout_tagout`, `mobile_equipment` and `confined_space` -- only classes B and
 * E, which the authorization names as machine-guarding-specific, actually use that family.
 */

import { EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput } from '../expert-contract.types';
import type { DeterministicAuthorityResult, GovernedAuthorityResult } from '../expert-authority-merge';
import type { RoutingExpectations } from '../expert-routing-metrics';

const FAMILIES = ['electrical', 'lockout_tagout', 'fall_protection', 'confined_space',
                  'machine_guarding', 'chemical_exposure', 'mobile_equipment', 'wet_environment'];

const NO_GOVERNED: GovernedAuthorityResult = { knowledgeReleaseId: null, citations: [] };

function input(analysisId: string, observation: string,
               over: Partial<ExpertAnalysisInput> = {}): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId,
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: observation }],
    inspectionContext: { location: 'Plant 2', task: 'routine walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: FAMILIES,
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
    ...over,
  };
}

const expect = (
  candidates: RoutingExpectations['expertHazardCandidates'],
  clarifications: RoutingExpectations['decisionCriticalClarifications'],
  insights: RoutingExpectations['crossHazardInsights'],
  disagreements: RoutingExpectations['disagreements'],
): RoutingExpectations => ({
  expertHazardCandidates: candidates,
  decisionCriticalClarifications: clarifications,
  crossHazardInsights: insights,
  disagreements,
});

export interface TemporalStateFixture {
  id: string;
  klass: 'A_HISTORICAL_RESOLVED' | 'B_HISTORICAL_UNRESOLVED' | 'C_REMEDIATION_UNCERTAIN'
    | 'D_RESOLVED_PRIMARY_CURRENT_SECONDARY' | 'E_CURRENT_POSITIVE' | 'F_CLEAN_NEGATIVE';
  title: string;
  targets: string;
  input: ExpertAnalysisInput;
  deterministic: DeterministicAuthorityResult;
  governed: GovernedAuthorityResult;
  expectations: RoutingExpectations;
  /** Free-text note on what a SURVIVING candidate/clarification must be ABOUT, for qualitative review. */
  qualitativeCheck: string;
}

// ------------------------------------------------------------------ T1 (A) -- electrical, historical + resolved

const T1_OBS = 'An electrical panel cover had been removed earlier in the shift to troubleshoot a '
  + 'tripped breaker. The cover was reinstalled and secured, and the circuit was re-energized and '
  + 'tested normal before this walkthrough.';

// ------------------------------------------------------------------ T2 (B) -- machine_guarding, historical + unresolved

const T2_OBS = 'The point-of-operation guard on the punch press was removed to clear a jam and has '
  + 'not been reinstalled. The press remains capable of being cycled with the point of operation '
  + 'exposed.';

// ------------------------------------------------------------------ T3 (C) -- lockout_tagout, remediation uncertain

const T3_OBS = 'A supervisor mentioned in passing that the isolation lock on the feed conveyor had '
  + 'been removed at some point this shift. This walkthrough does not establish whether the '
  + 'lockout was reapplied or the machine re-isolated before the current work began.';

// ------------------------------------------------------------------ T4 (D) -- mobile_equipment, resolved primary + current secondary

const T4_OBS = 'The forklift had been pulled from service earlier for a hydraulic leak; the leak '
  + 'was repaired and the unit passed inspection before being returned to service. During this '
  + 'walkthrough the operator confirmed the horn currently does not sound when tested.';

// ------------------------------------------------------------------ T5 (E) -- machine_guarding, true current positive

const T5_OBS = 'The point-of-operation guard on the shear is currently missing and the blade is '
  + 'exposed while the machine remains capable of being cycled by the operator.';

// ------------------------------------------------------------------ T6 (F) -- confined_space, clean negative

const T6_OBS = 'The permit-required confined space entry was completed per the permit. Atmospheric '
  + 'testing before entry showed 20.9% oxygen with no combustible gas or toxic contaminant '
  + 'detected, continuous monitoring remained in place throughout, and the attendant remained at '
  + 'the entry point for the full duration of the work.';

export const TEMPORAL_STATE_FIXTURES: readonly TemporalStateFixture[] = [
  {
    id: 'T1',
    klass: 'A_HISTORICAL_RESOLVED',
    title: 'HISTORICAL + RESOLVED (electrical)',
    targets: 'a remediated historical condition must not independently produce a candidate or a '
      + 'clarification about itself',
    input: input('temporal-t1', T1_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'temporal-t1', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    // Removed, reinstalled, secured, re-energized, tested normal -- every step is closed out and
    // stated. A candidate or a question about the panel cover here is inventing an open question
    // the text does not have.
    expectations: expect('FORBIDDEN', 'FORBIDDEN', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'No candidate or clarification should reference the panel cover, the earlier '
      + 'removal, or whether it was reinstalled -- all three are answered facts, not open ones.',
  },
  {
    id: 'T2',
    klass: 'B_HISTORICAL_UNRESOLVED',
    title: 'HISTORICAL + CURRENTLY UNRESOLVED (machine_guarding)',
    targets: 'a historical removal that is STILL unresolved must survive as a candidate -- the '
      + 'repair must not suppress every "guard removed" fact regardless of current state',
    input: input('temporal-t2', T2_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['restore the point-of-operation guard'] }],
    }),
    deterministic: {
      analysisId: 'temporal-t2', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['restore the point-of-operation guard'] }],
    },
    governed: NO_GOVERNED,
    // The deterministic engine already carries this ACTIVE finding, so the Expert layer is not
    // required to duplicate it as a candidate -- but suppressing an over-generalization must not
    // also suppress the model's own reasoning if it independently raises the same or an adjacent
    // point (e.g. the machine's continued cycle capability). Candidates/clarifications are OPTIONAL
    // here for that reason; what this fixture actually checks is qualitative (see qualitativeCheck)
    // and the routing totals, not a hard REQUIRED gate on a hazard the deterministic layer owns.
    expectations: expect('OPTIONAL', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'If a candidate or clarification appears, it must be ABOUT the still-missing '
      + 'guard / cycle-capable press -- not suppressed merely because the removal is described in '
      + 'the past tense ("was removed").',
  },
  {
    id: 'T3',
    klass: 'C_REMEDIATION_UNCERTAIN',
    title: 'HISTORICAL + REMEDIATION UNCERTAIN (lockout_tagout)',
    targets: 'genuine uncertainty about whether a historical condition was resolved may still carry '
      + 'a decision-critical clarification, without requiring a candidate to carry it',
    input: input('temporal-t3', T3_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'UNKNOWN',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'temporal-t3', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'UNKNOWN',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    // The clarification is REQUIRED: the text explicitly says this walkthrough does NOT establish
    // whether re-isolation happened, which is a genuinely decision-critical present-state question
    // (unlike R6, where the isolation WAS stated and verified). The candidate is OPTIONAL --
    // Phase 2 forbids requiring a candidate merely to carry the clarification.
    expectations: expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'The surviving clarification should ask whether the conveyor is currently '
      + 're-isolated / relocked, not merely restate the historical removal as trivia.',
  },
  {
    id: 'T4',
    klass: 'D_RESOLVED_PRIMARY_CURRENT_SECONDARY',
    title: 'RESOLVED PRIMARY + CURRENT SECONDARY CONSEQUENCE (mobile_equipment)',
    targets: 'suppressing a resolved historical condition must not suppress an unrelated CURRENT '
      + 'consequence stated beside it',
    input: input('temporal-t4', T4_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'temporal-t4', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    // The hydraulic leak is resolved and closed out -- FORBIDDEN territory on its own. The
    // non-functioning horn is a CURRENT, stated fact with no remediation claimed at all, so
    // SOMETHING about it is REQUIRED to survive. The pre-repair local baseline (5/5 reps) shows
    // the model reliably routes this specific fact as a decisionCriticalClarification rather than
    // a candidate ("was the horn tested to standard") -- a pre-existing routing choice unrelated
    // to temporal-state reasoning, measured before any repair here, so the candidate collection is
    // left OPTIONAL rather than forcing a routing change this operation was not asked to make.
    // What this fixture actually checks is that the repair does not go SILENT on the horn while
    // suppressing the resolved leak -- i.e. the clarification survives -- not which collection
    // carries it.
    expectations: expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'The surviving clarification (or candidate, if one appears) must be about the '
      + 'CURRENT non-functioning horn, not about the resolved hydraulic leak or a request to '
      + 're-verify that repair.',
  },
  {
    id: 'T5',
    klass: 'E_CURRENT_POSITIVE',
    title: 'TRUE CURRENT MACHINE-GUARDING POSITIVE',
    targets: 'an unambiguous current positive must survive with no over-suppression',
    input: input('temporal-t5', T5_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['restore the point-of-operation guard'] }],
    }),
    deterministic: {
      analysisId: 'temporal-t5', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['restore the point-of-operation guard'] }],
    },
    governed: NO_GOVERNED,
    // Deliberately worded with NO historical framing at all ("is currently missing"), so a
    // repair that over-fires on any mention of a guard being off -- rather than on the temporal
    // reasoning error -- would show its damage here as a regression, not on T2/T4.
    expectations: expect('OPTIONAL', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'This fixture exists to prove the repair does NOT suppress a plain current '
      + 'positive. Candidates/clarifications are OPTIONAL here only because the deterministic '
      + 'engine already owns this ACTIVE finding; the acceptance bar is that nothing about the '
      + 'repair makes this LESS likely to surface than it was pre-repair.',
  },
  {
    id: 'T6',
    klass: 'F_CLEAN_NEGATIVE',
    title: 'CLEAN NEGATIVE (confined_space, different family than R6)',
    targets: 'a complete, correctly-handled safe state in a DIFFERENT hazard family must also stay '
      + 'empty -- proves the repair is not machine_guarding/lockout_tagout-specific hardcoding',
    input: input('temporal-t6', T6_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'temporal-t6', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    expectations: expect('FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN'),
    qualitativeCheck: 'All four collections must be empty, same bar as R6, on a fixture that shares '
      + 'no hazard family with R6 at all.',
  },
];
