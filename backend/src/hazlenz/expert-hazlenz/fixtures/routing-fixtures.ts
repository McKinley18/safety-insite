/**
 * EXPERT HAZLENZ -- the ROUTING fixture set.
 *
 * Seven observations chosen so that each one makes a different routing failure visible, including
 * TWO NEGATIVE CONTROLS whose whole purpose is to fail if the repair over-corrects.
 *
 * ==================== WHY THE NEGATIVE CONTROLS ARE NOT OPTIONAL ====================
 *
 * The obvious way to "fix" a routing defect is to push the model toward filling every list. That
 * would move the metric and make the product worse: a layer that raises a hazard candidate and a
 * question on a described safe state is noise, and noise on a safety tool is a cost the inspector
 * pays on every observation.
 *
 * R6 is a complete, correctly-handled observation where the right answer is empty lists and a short
 * summary. R7 carries genuine residual ambiguity that CANNOT be phrased as a decision-changing
 * question, so the right answer is an uncertainty statement and no clarification. If the repair
 * cannot leave these alone, it is not a repair.
 *
 * ==================== CONCEPT PROBES ====================
 *
 * Each probe names a concept, the collection it belongs in, and a pattern. `scoreRouting` records an
 * `EXPLANATION_ONLY_LOSS` when the pattern matches the free text but not the target collection --
 * which is the §100 defect, measured rather than described. The patterns are drawn from the
 * vocabulary the model ACTUALLY used in the §100 diagnostic, so they match its own phrasing rather
 * than phrasing invented for this file.
 */

import { EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput } from '../expert-contract.types';
import type { DeterministicAuthorityResult, GovernedAuthorityResult } from '../expert-authority-merge';
import type { ConceptProbe, RoutingExpectations } from '../expert-routing-metrics';

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

export interface RoutingFixture {
  id: string;
  title: string;
  /** What routing behaviour this fixture makes falsifiable. */
  targets: string;
  input: ExpertAnalysisInput;
  deterministic: DeterministicAuthorityResult;
  governed: GovernedAuthorityResult;
  expectations: RoutingExpectations;
  probes: ConceptProbe[];
}

// ------------------------------------------------------------------ R1

const R1_OBS = 'Two employees were working in the vault near the transformer bay.';

// ------------------------------------------------------------------ R2

const R2_OBS = 'An extension cord ran through standing water to a sump pump while a worker reached '
  + 'into the pump housing to clear a blockage.';

// ------------------------------------------------------------------ R3

const R3_OBS = 'A millwright had the conveyor drive guard off and was working on the take-up pulley.';

// ------------------------------------------------------------------ R4

const R4_OBS = 'A worker was bailing residue out of a below-grade sump through a 24-inch opening '
  + 'while a solvent drum sat open on the deck above.';

// ------------------------------------------------------------------ R5

const R5_OBS = 'A forklift was charging beside the battery room door with the aisle wet from a '
  + 'washdown, and pickers walked past the charger while it was connected.';

// ------------------------------------------------------------------ R6 — negative control

const R6_OBS = 'The press was locked out with the supervisor tag applied and stored energy bled down '
  + 'and verified at zero before the guard was removed, and a second worker verified the isolation.';

// ------------------------------------------------------------------ R7 — negative control

const R7_OBS = 'The fixed ladder to the mezzanine was inspected during this walkthrough and its '
  + 'inspection tag was current, with no deficiencies observed at the time of the walkthrough.';

export const ROUTING_FIXTURES: readonly RoutingFixture[] = [
  {
    id: 'R1',
    title: 'ZERO-CANDIDATE CLARIFICATION',
    targets: 'a decision-critical question must survive with no hazard candidate beside it',
    input: input('route-r1', R1_OBS),
    deterministic: { analysisId: 'route-r1', jurisdiction: 'osha-general-industry', findings: [] },
    governed: NO_GOVERNED,
    // Candidates are OPTIONAL, not FORBIDDEN: proposing an electrical candidate here would be
    // defensible, and scoring a defensible answer as a miss would corrupt the metric.
    expectations: expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    probes: [
      { label: 'energization state of the bay', collection: 'decisionCriticalClarifications',
        pattern: /de-?energi|energiz|isolat|live|voltage/i },
    ],
  },
  {
    id: 'R2',
    title: 'WET + ELECTRICAL',
    targets: 'a real interaction must land in crossHazardInsights, not only in the summary',
    input: input('route-r2', R2_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['de-energize and remove the cord from the water'] }],
    }),
    deterministic: {
      analysisId: 'route-r2', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['de-energize and remove the cord from the water'] }],
    },
    governed: NO_GOVERNED,
    expectations: expect('OPTIONAL', 'REQUIRED', 'REQUIRED', 'OPTIONAL'),
    probes: [
      // The exact phrasing the §100 diagnostic produced, in the field it produced it in.
      { label: 'water + electrical interaction', collection: 'crossHazardInsights',
        pattern: /(water|wet)[\s\S]{0,80}(electric|electrocut)|(electric|electrocut)[\s\S]{0,80}(water|wet)/i },
      { label: 'de-energization / isolation unknown', collection: 'decisionCriticalClarifications',
        pattern: /de-?energi|isolat|lock\s?out|lockout|tagout|LOTO/i },
      { label: 'PPE unknown', collection: 'decisionCriticalClarifications', pattern: /\bPPE\b|personal protective/i },
    ],
  },
  {
    id: 'R3',
    title: 'LOTO / STORED ENERGY',
    targets: 'a missing isolation fact must become a clarification',
    input: input('route-r3', R3_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['restore the drive guard'] }],
    }),
    deterministic: {
      analysisId: 'route-r3', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['restore the drive guard'] }],
    },
    governed: NO_GOVERNED,
    expectations: expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    probes: [
      { label: 'isolation / LOTO / stored energy unknown', collection: 'decisionCriticalClarifications',
        pattern: /lock\s?out|lockout|tagout|LOTO|isolat|de-?energi|stored energy|zero energy/i },
    ],
  },
  {
    id: 'R4',
    title: 'EXTRA PLAUSIBLE HAZARD',
    targets: 'a plausible hazard outside the deterministic set must become a candidate',
    input: input('route-r4', R4_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'chemical_exposure', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['close and label the solvent drum'] }],
    }),
    deterministic: {
      analysisId: 'route-r4', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'chemical_exposure', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['close and label the solvent drum'] }],
    },
    governed: NO_GOVERNED,
    // The below-grade sump entered through a 24-inch opening is a confined space the deterministic
    // set did not name. That is a CANDIDATE, and in §100 the model put exactly this kind of
    // observation into `whatMatters` instead.
    expectations: expect('REQUIRED', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    probes: [
      { label: 'confined space / entry hazard', collection: 'expertHazardCandidates',
        pattern: /confined space|permit.required|entrapment|asphyxiat|oxygen deficien/i },
    ],
  },
  {
    id: 'R5',
    title: 'MULTI-COLLECTION',
    targets: 'three collections must populate independently in one response',
    input: input('route-r5', R5_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['separate pedestrians from the charging bay'] }],
    }),
    deterministic: {
      analysisId: 'route-r5', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['separate pedestrians from the charging bay'] }],
    },
    governed: NO_GOVERNED,
    expectations: expect('REQUIRED', 'REQUIRED', 'REQUIRED', 'OPTIONAL'),
    probes: [
      { label: 'wet floor + electrical charging', collection: 'crossHazardInsights',
        pattern: /(wet|water|washdown)[\s\S]{0,80}(charg|electric)|(charg|electric)[\s\S]{0,80}(wet|water|washdown)/i },
      { label: 'battery / hydrogen / chemical hazard', collection: 'expertHazardCandidates',
        pattern: /batter|hydrogen|acid|ventilat/i },
    ],
  },
  {
    id: 'R6',
    title: 'EXPLANATION-ONLY NEGATIVE CONTROL',
    targets: 'a complete, correctly-handled safe state must NOT produce typed emissions',
    input: input('route-r6', R6_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'route-r6', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    // Everything is stated: locked out, tagged, bled down, verified at zero, second-person verified.
    // A candidate or a question here is invention, and that is what this fixture catches.
    expectations: expect('FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN'),
    probes: [],
  },
  {
    id: 'R7',
    title: 'UNCERTAINTY NEGATIVE CONTROL',
    targets: 'residual ambiguity with no formulable decision-changing question stays an uncertainty',
    input: input('route-r7', R7_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'fall_protection', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'route-r7', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'fall_protection', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    // The ladder was inspected, tagged current, nothing observed. What remains unknown -- whether a
    // condition develops after the walkthrough -- is real, and no question asked today changes any
    // decision today. Forcing it into a clarification is exactly the over-correction to avoid.
    expectations: expect('FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN', 'FORBIDDEN'),
    probes: [],
  },
];
