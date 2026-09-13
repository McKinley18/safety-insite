/**
 * EXPERT HAZLENZ -- the EVIDENCE-GROUNDING fixture set (H7, H8).
 *
 * ==================== THE QUESTION THESE TWO FIXTURES EXIST TO ANSWER ====================
 *
 * Across §100 and §101 the local model produced `quotes = 0/0` on all fourteen calls. Not one
 * evidence quote, ever. The routing repair unblocked hazard candidates by making the quote
 * OPTIONAL — it did not make the model able to quote — so **every Expert candidate produced so far
 * is ungrounded**, and `M07_GOVERNED_RECORD_GROUNDING` will eventually have to measure that.
 *
 * A hosted model may behave differently, and these fixtures are how we find out without guessing.
 * Each one puts a SHORT, EXACT, UNMISTAKABLE phrase in the observation that legitimately supports a
 * hazard candidate. If a production-class model cannot copy a quote when the fixture hands it one,
 * that is a capability finding. If it produces a quote that does not appear in the source, that is a
 * fabrication finding, and it must fail closed rather than be tidied away.
 *
 * ==================== WHY BOTH TARGET A CANDIDATE ====================
 *
 * `evidence` exists on exactly one collection: `expertHazardCandidates`. `bindWireAnalysis` binds
 * candidate evidence and nothing else. So a grounding fixture whose groundable object is a
 * clarification or an insight would measure nothing — the quote would have nowhere to live. Both
 * fixtures therefore make an ADDITIONAL HAZARD CANDIDATE the thing the anchor phrase supports.
 *
 * ==================== WHY TWO AND NOT ONE ====================
 *
 * One successful quote is an anecdote. The probe requires `EVIDENCE_QUOTES_EXACTLY_BOUND >= 2`
 * across DISTINCT fixtures precisely so that a single lucky copy cannot be reported as a
 * capability. The two anchors are deliberately different in shape: H7's is a quoted maintenance-log
 * line, H8's is a quoted contractor-brief line, and the surrounding hazard families do not overlap.
 */

import { EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput } from '../expert-contract.types';
import type { DeterministicAuthorityResult, GovernedAuthorityResult } from '../expert-authority-merge';
import type { ConceptProbe, RoutingExpectations } from '../expert-routing-metrics';

const FAMILIES = ['electrical', 'lockout_tagout', 'fall_protection', 'confined_space',
                  'machine_guarding', 'chemical_exposure', 'mobile_equipment', 'wet_environment'];

const NO_GOVERNED: GovernedAuthorityResult = { knowledgeReleaseId: null, citations: [] };

function input(analysisId: string, observation: string): ExpertAnalysisInput {
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
  };
}

export interface GroundingFixture {
  id: string;
  title: string;
  targets: string;
  input: ExpertAnalysisInput;
  deterministic: DeterministicAuthorityResult;
  governed: GovernedAuthorityResult;
  expectations: RoutingExpectations;
  probes: ConceptProbe[];
  /**
   * The exact substring a correct quote would copy. Present VERBATIM in the observation — asserted
   * by the probe before any call, so a typo here cannot be misread as a model failure.
   *
   * This is the ANSWER KEY, not an instruction: it is never sent to the provider, and the model is
   * free to quote a different exact span. It exists so the probe can tell "quoted the supporting
   * text" apart from "quoted something exact but irrelevant".
   */
  anchor: string;
}

// ------------------------------------------------------------------ H7

const H7_OBS = 'A technician was staging tools at the roof access hatch for a rooftop unit repair. '
  + 'The maintenance log entry for the hatch reads: anchor point recertification is overdue by 14 '
  + 'months. No harness or lanyard was visible at the staging point.';

const H7_ANCHOR = 'anchor point recertification is overdue by 14 months';

// ------------------------------------------------------------------ H8

const H8_OBS = 'Two workers were preparing to apply epoxy coating inside the empty reactor vessel, '
  + 'entering through the 20-inch side manway. The contractor daily brief states: the ventilation '
  + 'blower will be offline for the entire shift.';

const H8_ANCHOR = 'the ventilation blower will be offline for the entire shift';

export const GROUNDING_FIXTURES: readonly GroundingFixture[] = [
  {
    id: 'H7',
    title: 'EXACT EVIDENCE GROUNDING — overdue fall-protection anchor',
    targets: 'a hazard candidate the observation supports with a short, exactly quotable phrase',
    input: input('ground-h7', H7_OBS),
    deterministic: { analysisId: 'ground-h7', jurisdiction: 'osha-general-industry', findings: [] },
    governed: NO_GOVERNED,
    // The candidate is REQUIRED because the observation states an overdue recertification and a
    // missing harness at a roof edge. Clarifications stay OPTIONAL: a question here is defensible
    // and scoring a defensible answer as a miss would corrupt the metric, exactly as in §101.
    expectations: {
      expertHazardCandidates: 'REQUIRED',
      decisionCriticalClarifications: 'OPTIONAL',
      crossHazardInsights: 'OPTIONAL',
      disagreements: 'OPTIONAL',
    },
    probes: [
      { label: 'fall protection at the roof hatch', collection: 'expertHazardCandidates',
        pattern: /fall|harness|lanyard|anchor|roof|edge|tie-?off/i },
    ],
    anchor: H7_ANCHOR,
  },
  {
    id: 'H8',
    title: 'SECOND GROUNDING CONTROL — ventilation offline during vessel entry',
    targets: 'a second, differently-shaped anchor, so one lucky quote cannot read as a capability',
    input: input('ground-h8', H8_OBS),
    deterministic: { analysisId: 'ground-h8', jurisdiction: 'osha-general-industry', findings: [] },
    governed: NO_GOVERNED,
    expectations: {
      expertHazardCandidates: 'REQUIRED',
      decisionCriticalClarifications: 'OPTIONAL',
      crossHazardInsights: 'OPTIONAL',
      disagreements: 'OPTIONAL',
    },
    probes: [
      { label: 'confined space / solvent vapour with ventilation offline',
        collection: 'expertHazardCandidates',
        pattern: /confined|vessel|manway|ventilat|vapou?r|solvent|atmospher|oxygen|epoxy/i },
    ],
    anchor: H8_ANCHOR,
  },
];
