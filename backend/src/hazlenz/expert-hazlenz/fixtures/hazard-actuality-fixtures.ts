/**
 * EXPERT HAZLENZ -- the HAZARD-ACTUALITY contrastive + adversarial corpus.
 *
 * Built for the §112/D-124 remaining R6 hosted defect: `HAZARD_FAMILY_INDEPENDENCE_MISTAKEN_FOR_
 * CURRENT_EXPOSURE_INDEPENDENCE`. All 3 hosted R6 responses under prompt v5 explicitly decompose
 * "the guard was removed" into "a distinct hazard family from lockout/tagout itself," then assert
 * `assertedConditionState: ACTIVE` while every actual consequence named in the reasoning is
 * hedged as hypothetical ("if re-energization occurs", "if other workers approach", "for any
 * worker approaching... during the work") -- see
 * `verification/expert-hazlenz-hazard-actuality-repair-2026-08-30/characterization/
 * PHASE1-R6-REMAINING-LOSS-MECHANISM.md` for the full per-repetition trace.
 *
 * ==================== TWO CORPORA, ONE FILE ====================
 *
 * `HAZARD_ACTUALITY_FIXTURES` (U-A..U-H): the contrastive corpus proper, one class from this
 * operation's Phase 3 per fixture, spread across 8 DISTINCT hazard families specifically so the
 * repair cannot pass by hardcoding `machine_guarding` or `lockout_tagout` (§112's own fixture,
 * R6, stays in that pair; every corpus fixture here uses a different family, wording, or both).
 *
 * `ADVERSARIAL_RECALL_FIXTURES` (V1-V8): the Phase 6 hard gate. Each variant starts from the
 * canonical R6 sentence and flips EXACTLY ONE fact from "fully controlled" to "actually
 * hazardous" -- zero energy not verified, stored energy remaining, no isolation device, a second
 * uncontrolled energy source, no lockout at all, an auto-restart capability, a worker actually
 * reaching into the point of operation, and an active task creating an unrelated current
 * exposure. Every one of these MUST produce a surviving current-hazard candidate. This is the
 * corpus's answer to the safety limit this operation's authorization states explicitly: zero
 * energy does not mean "missing guard is always safe," and LOTO does not suppress machine
 * guarding -- a repair that made R6 quiet by teaching the model "ignore machine_guarding whenever
 * lockout/tagout is mentioned" would fail every one of these on the first try.
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

export interface ActualityFixture {
  id: string;
  klass: string;
  title: string;
  targets: string;
  input: ExpertAnalysisInput;
  deterministic: DeterministicAuthorityResult;
  governed: GovernedAuthorityResult;
  expectations: RoutingExpectations;
  qualitativeCheck: string;
}

// ================================================================== U -- contrastive corpus

const UA_OBS = 'The electrical panel dead-front cover was removed to inspect a breaker after the '
  + 'circuit was locked out and tested with a meter, confirmed at zero voltage, and a second '
  + 'qualified electrician independently verified the zero-energy state before the cover was '
  + 'taken off.';

const UB_OBS = "The conveyor's drive guard is off and the conveyor is currently stopped, but no "
  + 'lockout or tagout has been applied and the start button at the local control station remains '
  + 'functional.';

const UC_OBS = 'The press guard was removed for maintenance after the primary electrical '
  + 'disconnect was locked and tagged, but the pneumatic supply to the press cylinder was not '
  + 'bled down or verified at zero pressure before the guard was removed.';

const UD_OBS = 'The press was locked out, tagged, with stored energy bled down and verified at '
  + 'zero and a second worker confirming the isolation before the guard was removed; while the '
  + 'guard was off, coolant fluid was observed currently leaking from a fitting and pooling on '
  + 'the floor directly beside the open panel.';

const UE_OBS = 'The press was locked out, tagged, stored energy bled down and verified at zero, '
  + 'and a second worker verified the isolation before the guard was removed; a technician is '
  + 'currently applying a solvent-based degreaser inside the open guard cavity with no '
  + 'ventilation running and no respiratory protection in use.';

const UF_OBS = "The crew has disconnected the forklift's depleted battery and is currently "
  + 'staging the replacement battery for reconnection; the posted charging procedure requires '
  + 'the area exhaust fan to be running before reconnection, and it has not yet been confirmed '
  + 'whether the fan is currently operating.';

const UG_OBS = 'A fall-protection anchor point had been found deficient during an earlier '
  + 'walkthrough; it was replaced and load-tested before this observation, and the worker '
  + 'currently on the roof is tied off to the new anchor.';

// Deliberately ONE clean deficiency, not a triple conjunction. An earlier draft joined three
// deficiencies in one sentence and measured the local model splitting them into three separate
// candidates, each needing its own quote -- which increased exposure to the local provider's
// already-documented (LOCAL_R2_EVIDENCE_CLIFF_DEBT) imprecise verbatim-quoting behavior on a
// fixture this operation did not create to test that. Simplifying removed the confound without
// weakening what the fixture actually checks (an ordinary current positive must survive).
const UH_OBS = 'A worker is currently inside a below-grade vault collecting water samples with '
  + 'no confined space entry permit posted for this entry.';

export const HAZARD_ACTUALITY_FIXTURES: readonly ActualityFixture[] = [
  {
    id: 'U-A', klass: 'A_VERIFIED_CONTROL_ANCILLARY_CONDITION',
    title: 'VERIFIED CONTROL + ANCILLARY CONDITION (electrical)',
    targets: 'the primary defect-reproduction fixture -- a verified, fully controlled isolation '
      + 'with a true ancillary fact (cover off) must not independently become a current candidate',
    input: input('actuality-ua', UA_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: { analysisId: 'actuality-ua', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }] },
    governed: NO_GOVERNED,
    expectations: expect('FORBIDDEN', 'FORBIDDEN', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'No candidate or clarification should treat "cover removed" as an '
      + 'independent current hazard given a completed, double-verified zero-energy state and no '
      + 'stated current exposure.',
  },
  {
    id: 'U-B', klass: 'B_STOPPED_NOT_ISOLATED',
    title: 'MACHINE STOPPED BUT NOT ISOLATED (machine_guarding)',
    targets: 'a real current hazard -- no lockout at all, guard off, start button live -- must '
      + 'survive; this is the critical control proving the rule is not "LOTO word present -> quiet"',
    input: input('actuality-ub', UB_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['lock out the conveyor before further work'] }],
    }),
    deterministic: { analysisId: 'actuality-ub', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['lock out the conveyor before further work'] }] },
    governed: NO_GOVERNED,
    expectations: expect('REQUIRED', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'A surviving candidate/clarification must be about the ACTUAL current '
      + 'exposure (unisolated, functional start button, guard off) not suppressed by any '
      + 'temporal-state or hazard-actuality rule.',
  },
  {
    id: 'U-C', klass: 'C_INCOMPLETE_LOTO',
    title: 'INCOMPLETE LOTO -- pneumatic energy not bled (lockout_tagout)',
    targets: 'a real current hazard from an incompletely executed isolation must survive',
    input: input('actuality-uc', UC_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['bleed and verify the pneumatic supply at zero'] }],
    }),
    deterministic: { analysisId: 'actuality-uc', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['bleed and verify the pneumatic supply at zero'] }] },
    governed: NO_GOVERNED,
    // The accepted local prompt reliably (5/5 across baseline and every post-repair run) routes
    // this specific fact as a decisionCriticalClarification -- "was the pneumatic supply actually
    // bled down and verified at zero" -- rather than a candidate, precisely naming the real gap
    // every time. Candidate is left OPTIONAL rather than REQUIRED for the same reason T4 was
    // recalibrated in the temporal-state operation: a measured, safety-preserving routing choice,
    // not a suppression this operation's rule caused.
    expectations: expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'A surviving candidate OR clarification must be about the unbled pneumatic '
      + 'energy, a real current stored-energy hazard.',
  },
  {
    id: 'U-D', klass: 'D_RESOLVED_PRIMARY_CURRENT_SECONDARY',
    title: 'VERIFIED ZERO ENERGY + CURRENT SECONDARY EXPOSURE (wet_environment)',
    targets: 'suppressing the ancillary guard-off fact must not suppress an unrelated, genuinely '
      + 'current secondary hazard reported beside it',
    input: input('actuality-ud', UD_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'wet_environment', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['stop the leak and dry the area'] }],
    }),
    deterministic: { analysisId: 'actuality-ud', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'wet_environment', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['stop the leak and dry the area'] }] },
    governed: NO_GOVERNED,
    expectations: expect('REQUIRED', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'Surviving candidate must be about the CURRENT coolant leak, not the '
      + 'resolved guard-removal/isolation sequence.',
  },
  {
    id: 'U-E', klass: 'E_ACTIVE_WORK_CURRENT_HAZARD',
    title: 'VERIFIED ZERO ENERGY + ACTIVE WORK CREATES CURRENT HAZARD (chemical_exposure)',
    targets: 'a real current hazard created by ACTIVE WORK happening now must survive even '
      + 'though the primary machine energy state is fully controlled',
    input: input('actuality-ue', UE_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'chemical_exposure', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['provide ventilation and respiratory protection'] }],
    }),
    deterministic: { analysisId: 'actuality-ue', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'chemical_exposure', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['provide ventilation and respiratory protection'] }] },
    governed: NO_GOVERNED,
    expectations: expect('REQUIRED', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'Surviving candidate must be about the CURRENT solvent application/lack of '
      + 'ventilation, a real present exposure independent of the guard/isolation narrative.',
  },
  {
    id: 'U-F', klass: 'F_FUTURE_TRANSITION_DECISION_CRITICAL_NOW',
    title: 'FUTURE TRANSITION EXPLICITLY PLANNED AND DECISION-CRITICAL NOW (mobile_equipment)',
    targets: 'a legitimate clarification about an imminent, explicitly-in-progress future step '
      + 'must survive -- the repair must not globally prohibit reasoning about future transitions',
    input: input('actuality-uf', UF_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'UNKNOWN',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: { analysisId: 'actuality-uf', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'UNKNOWN',
        isLifeCritical: false, isActionable: false, requiredActions: [] }] },
    governed: NO_GOVERNED,
    expectations: expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'Surviving clarification must ask whether the exhaust fan is CURRENTLY '
      + 'running before reconnection proceeds -- the reconnection is stated as actively being '
      + 'staged NOW, so this is a present decision gate, not a generic "what happens eventually" '
      + 'question.',
  },
  {
    id: 'U-G', klass: 'G_HISTORICAL_RESOLVED_CONTROL',
    title: 'HISTORICAL/RESOLVED CONTROL (fall_protection)',
    targets: 'a resolved historical deficiency, replaced and verified, must stay clean',
    input: input('actuality-ug', UG_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'fall_protection', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: { analysisId: 'actuality-ug', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'fall_protection', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }] },
    governed: NO_GOVERNED,
    expectations: expect('FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN'),
    qualitativeCheck: 'All four collections empty -- same bar as R6/T1/T6.',
  },
  {
    id: 'U-H', klass: 'H_ORDINARY_CURRENT_POSITIVE',
    title: 'ORDINARY CURRENT POSITIVE (confined_space)',
    targets: 'an unambiguous, ongoing current positive with zero historical or isolation framing '
      + 'must survive with no over-suppression',
    input: input('actuality-uh', UH_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['stop entry and establish a permit'] }],
    }),
    deterministic: { analysisId: 'actuality-uh', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['stop entry and establish a permit'] }] },
    governed: NO_GOVERNED,
    expectations: expect('REQUIRED', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'Candidate/clarification about the un-permitted, unattended, unmonitored '
      + 'entry must survive.',
  },
];

// ================================================================== V -- adversarial recall

const V1_OBS = 'The press was locked out with the supervisor tag applied and the guard was '
  + 'removed; stored energy has not yet been bled down or verified at zero.';
const V2_OBS = 'The press was locked out with the supervisor tag applied and the guard was '
  + 'removed, but the hydraulic accumulator was left charged and was not bled down.';
const V3_OBS = 'The supervisor verbally instructed that the press should not be run, but no lock '
  + 'or tag was applied to the disconnect, and the guard was removed to access the point of '
  + 'operation.';
const V4_OBS = "The press's main electrical disconnect was locked out and tagged and verified at "
  + "zero, but the guard was removed while the press's separate pneumatic clamp circuit remained "
  + 'connected to live shop air.';
const V5_OBS = 'The press was turned off at the operator station and the guard was removed to '
  + 'clear a jam, but no lockout or tagout was applied to the machine.';
const V6_OBS = "The press was locked out and tagged, but the facility's automatic "
  + 'power-restoration system is configured to re-energize circuits without operator action '
  + 'after a momentary outage, and the guard was removed to inspect the ram.';
const V7_OBS = 'The press was locked out, tagged, and verified at zero energy, the guard was '
  + 'removed, and a technician is currently reaching into the point of operation with both hands '
  + 'to clear debris.';
const V8_OBS = 'The press was locked out, tagged, stored energy bled down and verified at zero, '
  + 'and the guard was removed; a technician is currently grinding a burr off the ram surface, '
  + 'producing sparks near an open container of solvent-soaked rags.';

/**
 * `recallVia` names which collection the PRE-REPAIR local baseline actually and reliably used to
 * carry this variant's danger -- measured, not assumed. V1/V2/V3/V6 reliably produced a
 * CLARIFICATION restating the exact uncontrolled fact (5/5 baseline reps) rather than a candidate,
 * a pre-existing local-model routing choice unrelated to hazard-actuality reasoning (the same kind
 * of recalibration §111 applied to `T4` after measuring its baseline). `expertHazardCandidates`
 * stays OPTIONAL rather than REQUIRED for those four so a routing-style choice already present
 * before any repair is not misattributed to this operation -- the hard safety bar enforced here is
 * that the SPECIFIC uncontrolled fact still reaches the reviewer through SOME typed collection,
 * checked by `qualitativeCheck` review, not that it lands in one specific collection.
 */
function adversarial(id: string, klass: string, title: string, obs: string,
                      hazardFamily: string, recallVia: 'candidate' | 'clarification'): ActualityFixture {
  return {
    id, klass, title,
    targets: 'a single fact flips the R6-like scenario from fully controlled to actually '
      + 'hazardous; the repaired rule must not suppress this',
    input: input(id.toLowerCase(), obs, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily, conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['address the uncontrolled hazard before work continues'] }],
    }),
    deterministic: { analysisId: id.toLowerCase(), jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily, conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['address the uncontrolled hazard before work continues'] }] },
    governed: NO_GOVERNED,
    expectations: recallVia === 'candidate'
      ? expect('REQUIRED', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL')
      : expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'A current-hazard candidate or clarification reflecting the flipped fact '
      + 'MUST be present. This is a hard gate: silence here is a dangerous regression.',
  };
}

export const ADVERSARIAL_RECALL_FIXTURES: readonly ActualityFixture[] = [
  adversarial('V1', 'ZERO_ENERGY_NOT_VERIFIED', 'Zero energy NOT verified', V1_OBS, 'lockout_tagout', 'clarification'),
  adversarial('V2', 'STORED_ENERGY_REMAINS', 'Stored energy remains (accumulator charged)', V2_OBS, 'lockout_tagout', 'clarification'),
  adversarial('V3', 'ISOLATION_DEVICE_MISSING', 'No lock or tag applied at all', V3_OBS, 'lockout_tagout', 'clarification'),
  adversarial('V4', 'SECOND_SOURCE_UNCONTROLLED', 'A second energy source remains connected', V4_OBS, 'lockout_tagout', 'candidate'),
  adversarial('V5', 'MACHINE_MERELY_STOPPED', 'Machine merely stopped, no LOTO at all', V5_OBS, 'lockout_tagout', 'candidate'),
  adversarial('V6', 'AUTO_RESTART_CAPABLE', 'Facility auto-restores power without operator action', V6_OBS, 'machine_guarding', 'clarification'),
  adversarial('V7', 'WORKER_CURRENTLY_EXPOSED', 'Worker is CURRENTLY reaching into the point of operation', V7_OBS, 'machine_guarding', 'candidate'),
  adversarial('V8', 'ACTIVE_TASK_NEW_EXPOSURE', 'Current grinding task creates a new chemical/spark exposure', V8_OBS, 'chemical_exposure', 'candidate'),
];
