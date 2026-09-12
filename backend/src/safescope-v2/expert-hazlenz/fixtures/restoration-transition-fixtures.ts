/**
 * EXPERT HAZLENZ -- RESTORATION-TRANSITION fixtures (`R6-H`, `R6-I`). §116.
 *
 * ==================== WHY THESE TWO, AND WHY ONLY THESE TWO ====================
 *
 * §115/D-127 adjudicated `R6` and built the `R6-A`..`R6-I` counterfactual matrix. Six of the nine
 * variants already existed as frozen fixtures -- `R6-B`->`V5`, `R6-C`->`V4`/`U-C`, `R6-D`->`V2`,
 * `R6-E`->`V1`, `R6-F`->`V6`, `R6-G`->`V7`/`V8`. Exactly two had none, and they are not an
 * arbitrary remainder: EVERY existing counterfactual flips a fact about ENERGY CONTROL, and not one
 * flips a fact about the RESTORATION TRANSITION.
 *
 * That is the precise distinction three prompt generations have been fighting over. §115 confirmed
 * the `R6` oracle by classifying guard reinstatement as a FUTURE PREREQUISITE attaching to a
 * transition the observation never states is occurring. A rule that reached that answer by learning
 * "guard-off under LOTO is never anything" would pass every fixture in the corpus and still be
 * wrong. These two fixtures are what make that rule falsifiable.
 *
 * The corpus now separates three states that the single word "reinstatement" collapses:
 *
 *      R6    FUTURE PREREQUISITE   controlled state persists, no transition stated  -> nothing
 *      R6-H  CURRENT TRANSITION    re-energization is stated as happening NOW       -> clarification
 *      R6-I  CURRENT ACTIVE        the machine is running with the guard absent     -> candidate
 *
 * ==================== THE ORIGINAL R6 FIXTURE IS NOT TOUCHED ====================
 *
 * `routing-fixtures.ts` is byte-unchanged. These live in their own file, the same pattern §111 used
 * for `temporal-state-fixtures.ts` and §113 for `hazard-actuality-fixtures.ts`. `R6` remains the
 * negative control it has always been.
 *
 * ==================== WHY R6-H IS A CLARIFICATION AND NOT A CANDIDATE ====================
 *
 * This is the subtle one and it is deliberate. In `R6-H` the physical state is IDENTICAL to `R6`:
 * the guard is off and the energy is still isolated, so no hazardous motion is possible YET. What
 * changed is that the observation now states the transition is imminent, which makes the
 * restoration prerequisite DUE NOW. The correct output is therefore the question that was NOT
 * decision-critical in `R6` -- asked at the one moment its answer changes an outcome -- and not an
 * `ACTIVE` candidate, because asserting a present exposure on a machine still at verified zero
 * energy would be the same false state claim §115 rejected in the hosted `R6` responses.
 *
 * A candidate is OPTIONAL rather than FORBIDDEN here: proposing one at `HYPOTHETICAL`/`UNKNOWN` is
 * defensible, and scoring a defensible answer as an over-route would corrupt the metric (the same
 * reasoning `R1` records for its own OPTIONAL candidates).
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

export interface RestorationTransitionFixture {
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

// ---------------------------------------------------------------- R6-H — CURRENT TRANSITION

/**
 * Holds every `R6` control constant -- locked out, tagged, bled down, verified at zero,
 * second-person verified, guard removed -- and adds ONE fact: the transition is happening now.
 */
const R6H_OBS = 'The press was locked out with the supervisor tag applied and stored energy bled '
  + 'down and verified at zero before the guard was removed, and a second worker verified the '
  + 'isolation; the operator is now removing the lock and tag to restart the press for production, '
  + 'and the guard has not been reinstalled.';

// ---------------------------------------------------------------- R6-I — CURRENT ACTIVE EXPOSURE

/**
 * The plain guarding case with no lockout left standing: motion is available and the guard is off.
 * Both halves of the deterministic 1910.212 predicate now point the other way (`guardPresent` false
 * AND `energySafe` false), so this is the variant where the deterministic engine itself should
 * SUPPORT the machine-guarding family rather than exclude it.
 */
const R6I_OBS = 'The press had been locked out earlier for servicing and the guard was removed; the '
  + 'lock and tag have since been removed and the press is now running production parts with the '
  + 'guard still off and the point of operation exposed.';

export const RESTORATION_TRANSITION_FIXTURES: readonly RestorationTransitionFixture[] = [
  {
    id: 'R6-H',
    klass: 'CURRENT_TRANSITION',
    title: 'Verified controlled state, but re-energization is happening NOW with the guard absent',
    targets: 'the restoration obligation becomes decision-critical exactly when the transition is '
      + 'stated; the same question that is NOT decision-critical in R6 must survive here',
    input: input('restoration-r6h', R6H_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout',
        conditionState: 'CONTROLLED', isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'restoration-r6h', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'CONTROLLED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    // A clarification is REQUIRED: the restart is stated, so "has the guard been reinstalled before
    // this restart?" now changes a decision. A candidate is OPTIONAL, not FORBIDDEN -- see header.
    expectations: expect('OPTIONAL', 'REQUIRED', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'A clarification or candidate must engage the STATED restart with the guard '
      + 'still off. Silence is a failure. An ACTIVE machine_guarding assertion is NOT required and '
      + 'is not the target behaviour, because motion is still not possible at the instant described '
      + '-- what is required is that the imminent transition is not ignored.',
  },
  {
    id: 'R6-I',
    klass: 'CURRENT_ACTIVE_EXPOSURE',
    title: 'Machine returned to production with the guard still absent',
    targets: 'the plain current machine-guarding hazard, to prove no rule suppressed the family '
      + 'outright rather than conditioning it on a verified control',
    input: input('restoration-r6i', R6I_OBS, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout',
        conditionState: 'CORRECTED', isLifeCritical: false, isActionable: false, requiredActions: [] }],
    }),
    deterministic: {
      analysisId: 'restoration-r6i', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'lockout_tagout', conditionState: 'CORRECTED',
        isLifeCritical: false, isActionable: false, requiredActions: [] }],
    },
    governed: NO_GOVERNED,
    // HARD RECALL GATE. A machine running with its point of operation exposed is the textbook
    // current guarding hazard. Silence here would be a dangerous regression, and this fixture is
    // the one that fails loudest if any future rule over-suppresses machine_guarding.
    expectations: expect('REQUIRED', 'OPTIONAL', 'OPTIONAL', 'OPTIONAL'),
    qualitativeCheck: 'A machine_guarding candidate reflecting the RUNNING, unguarded point of '
      + 'operation MUST be present. This is a hard gate: silence here is a dangerous regression.',
  },
];
