/**
 * EXPERT HAZLENZ -- the ONE canonical construction of `ExpertAnalysisInput`. PRODUCTION-CAPABLE.
 *
 * §121. Before this file, `grep -rn ExpertAnalysisInput src/` returned only consumers and six
 * fixture files: every input Expert had ever been given was hand-built for a probe. §120 recorded
 * that as GAP 5, and named the cost -- a cohort built by an evaluation-only path would measure that
 * path as much as it measured the model.
 *
 * So there is exactly one transformation here, and it is the one production will use. The evaluation
 * harness does not get its own. If Expert is ever wired to a customer request, it calls
 * `buildExpertAnalysisInput` with a source assembled by `toCanonicalExpertInputSource`, which is
 * what the harness calls too.
 *
 * ==================== WHAT THIS FILE IS NOT ====================
 *
 * It is not a caller. It performs no provider call, opens no route, and touches no request path.
 * `runExpertAnalysis` still has zero callers after this file exists, and that is intentional:
 * building the input is not activating the layer.
 *
 * ==================== TWO LAYERS, AND WHY ====================
 *
 *   `CanonicalExpertInputSource`  the normalised source state -- what any caller must supply.
 *   `HazLenzAnalysisState`        the REAL analysis result, read structurally.
 *
 * `toCanonicalExpertInputSource` maps the second onto the first, and `buildExpertAnalysisInput` maps
 * the first onto the contract. The split exists because the second shape belongs to the
 * deterministic engine and will change as that engine changes, while the first is Expert's own
 * requirement. Both are exported so the harness cannot quietly bypass either.
 *
 * The parameters are STRUCTURAL rather than imported engine types, for the same reason
 * `projectDeterministicDispositions` took a structural parameter in §119: it keeps this module free
 * of a dependency on the evidence foundation and the decomposition service, so the Expert core stays
 * a leaf.
 *
 * ==================== THE ANTI-LEAK RULE, MADE STRUCTURAL ====================
 *
 * There is no parameter on any function here that can carry a cohort truth key. Life-criticality is
 * the interesting case: `DeterministicFindingView.isLifeCritical` is set from what PRODUCTION can
 * establish, which today is nothing, so it is `false` unless the analysis state supplies it. The
 * corpus label that says which findings are life-critical reaches the MERGE input -- which the model
 * never sees -- and never this one. `M04_LIFE_CRITICAL_RETENTION` measures the merge, so it loses
 * nothing, and the model cannot preferentially protect a finding it was never told to protect.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION,
  type DeterministicFindingView, type ExpertAnalysisInput, type ExpertAuthoritativeSource,
  type ExpertConditionState, type GovernedStandardView,
} from './expert-contract.types';
import { projectDeterministicDispositions } from './expert-deterministic-projection';

export const CANONICAL_EXPERT_INPUT_BUILDER_VERSION = 'hazlenz.expert.input.builder.v1' as const;

/** The id the observation is always carried under, so an evidence offset is portable across rows. */
export const OBSERVATION_SOURCE_ID = 'observation' as const;

// ---------------------------------------------------------------- condition-state mapping

/**
 * The deterministic engine's condition vocabulary, mapped onto the Expert one.
 *
 * TOTAL AND EXPLICIT, WITH NO DEFAULT BRANCH. A fallback is how an unrecognised state quietly
 * becomes ACTIVE, and the contract's own comment on `EXPERT_CONDITION_STATES` says there is
 * deliberately no member that does that. An unmapped state is a build ERROR, not a guess.
 *
 * Two entries carry interpretive weight and are called out rather than buried, because they are
 * places a product owner might reasonably decide differently:
 *
 *   HISTORICAL     -> CORRECTED   the condition was real and is no longer current. `CORRECTED` is
 *                                 the closest member; it is not exact, because HISTORICAL does not
 *                                 assert that anyone fixed it.
 *   PLANNED_FUTURE -> HYPOTHETICAL a condition that has not occurred yet is not an observed one.
 *
 * The rest are anchored in behaviour this repository already relies on: the controller, the service
 * and `hazlenz-condition-state-invariants-regression` all treat `HISTORICAL`, `SAFE_VERIFIED` and
 * `PLANNED_FUTURE` as not-currently-hazardous, and treat everything else as live.
 */
export const DETERMINISTIC_TO_EXPERT_CONDITION_STATE: Readonly<Record<string, ExpertConditionState>> = {
  ACTIVE: 'ACTIVE',
  INTERMITTENT: 'ACTIVE',
  SAFE_VERIFIED: 'CONTROLLED',
  HISTORICAL: 'CORRECTED',
  PLANNED_FUTURE: 'HYPOTHETICAL',
  CONTRADICTORY: 'INSUFFICIENT_EVIDENCE',
  UNKNOWN: 'UNKNOWN',
};

/** The two mappings above that are interpretive rather than mechanical. Exported so they are visible. */
export const INTERPRETIVE_CONDITION_MAPPINGS: ReadonlyArray<{ from: string; to: ExpertConditionState; note: string }> = [
  {
    from: 'HISTORICAL', to: 'CORRECTED',
    note: 'HISTORICAL says the condition is not current; CORRECTED additionally implies it was '
      + 'remedied. No closer member exists in the frozen vocabulary.',
  },
  {
    from: 'PLANNED_FUTURE', to: 'HYPOTHETICAL',
    note: 'A condition that has not happened is not observed. HYPOTHETICAL is exact in kind but '
      + 'loses the fact that it is scheduled.',
  },
];

export function toExpertConditionState(deterministicState: string | undefined): ExpertConditionState {
  if (deterministicState === undefined || deterministicState === null || deterministicState === '') {
    // The engine's field is optional. Absent means the engine did not establish a state, and the
    // contract has an exact member for that. This is a mapping, not a fallback.
    return 'UNKNOWN';
  }
  const mapped = DETERMINISTIC_TO_EXPERT_CONDITION_STATE[deterministicState];
  if (mapped === undefined) {
    throw new Error(
      `unmapped deterministic condition state "${deterministicState}" -- add it to `
      + 'DETERMINISTIC_TO_EXPERT_CONDITION_STATE deliberately rather than defaulting it');
  }
  return mapped;
}

// ---------------------------------------------------------------- the canonical source

/** One applicability decision, structurally. Matches what the evidence foundation produces. */
export interface CanonicalApplicabilityDecision {
  family: string;
  status: string;
  confidence: number;
  requiredPredicates: ReadonlyArray<{ name: string; status: string }>;
}

/** One deterministic finding, structurally, as the upstream layer produced it. */
export interface CanonicalDeterministicFinding {
  findingKey: string;
  hazardFamily: string;
  /** The ENGINE's vocabulary. Mapped, never copied. */
  conditionState?: string;
  /**
   * Only what production can establish. Absent today across the whole system -- no engine emits it
   * -- so it is optional and defaults to `false`. It must NEVER be filled from a corpus label.
   */
  isLifeCritical?: boolean;
  isActionable?: boolean;
  requiredActions?: string[];
}

export interface CanonicalExpertInputSource {
  analysisId: string;
  jurisdiction: string;
  allowedHazardFamilies: string[];
  inspectionContext: { location: string | null; task: string | null };
  observationText: string;
  supplementaryContext: Array<{
    sourceId: string;
    sourceType: 'inspection_context' | 'clarification_answer';
    text: string;
  }>;
  deterministicFindings: CanonicalDeterministicFinding[];
  /**
   * The GENUINE output of the deterministic layer. `undefined` and `[]` are different and both are
   * preserved by §119: undefined means the caller has no family evaluation to offer, `[]` means one
   * ran and produced nothing projectable. Neither renders a section, and synthesising a disposition
   * for either would fabricate a determination the engine never made.
   */
  applicabilityDecisions?: CanonicalApplicabilityDecision[];
  /** Verbatim observation spans that established the controlling facts, keyed by Expert family. */
  evidenceQuotesByFamily: Record<string, string[]>;
  governedStandards: GovernedStandardView[];
  answeredClarifications: Array<{ clarificationId: string; answer: string }>;
}

// ---------------------------------------------------------------- the one transformation

/**
 * Build the Expert input. Pure, total, and the only place the shape is decided.
 *
 * The §119 projection semantics are preserved exactly: `projectDeterministicDispositions` is called
 * with the caller's real decisions and its result is passed through untouched, including the
 * distinction between `undefined` (no evaluation offered) and `[]` (an evaluation that projected
 * nothing). Nothing here re-derives applicability, and nothing here manufactures a disposition.
 */
export function buildExpertAnalysisInput(source: CanonicalExpertInputSource): ExpertAnalysisInput {
  const authoritativeSources: ExpertAuthoritativeSource[] = [
    { sourceId: OBSERVATION_SOURCE_ID, sourceType: 'observation', text: source.observationText },
    ...source.supplementaryContext.map(c => ({
      sourceId: c.sourceId, sourceType: c.sourceType, text: c.text,
    })),
  ];

  const deterministicFindings: DeterministicFindingView[] = source.deterministicFindings.map(f => ({
    findingKey: f.findingKey,
    hazardFamily: f.hazardFamily,
    conditionState: toExpertConditionState(f.conditionState),
    // Production-available only. See the header: the corpus label lives on the merge side.
    isLifeCritical: f.isLifeCritical === true,
    isActionable: f.isActionable === true,
    requiredActions: [...(f.requiredActions ?? [])],
  }));

  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: source.analysisId,
    authoritativeSources,
    inspectionContext: {
      location: source.inspectionContext.location,
      task: source.inspectionContext.task,
    },
    jurisdiction: source.jurisdiction,
    allowedHazardFamilies: [...source.allowedHazardFamilies],
    deterministicFindings,
    governedStandards: source.governedStandards.map(g => ({ ...g })),
    answeredClarifications: source.answeredClarifications.map(a => ({ ...a })),
  };

  // ABSENT STAYS ABSENT. Assigning `[]` where the caller offered nothing would erase the §119
  // distinction the equivalence gate exists to protect, so the field is only set when decisions
  // were actually supplied.
  if (source.applicabilityDecisions !== undefined) {
    input.deterministicFamilyDispositions = projectDeterministicDispositions(
      source.applicabilityDecisions, source.evidenceQuotesByFamily,
    );
  }

  return input;
}

// ---------------------------------------------------------------- the production adapter

/**
 * The real analysis state, read structurally. Every field named here exists on the object the
 * deterministic pipeline already produces; nothing is invented for evaluation.
 */
export interface HazLenzAnalysisState {
  analysisId: string;
  observation: string;
  inspectionContext?: { location?: string | null; task?: string | null };
  /** `result.regulatoryContext.value`, or the request's jurisdiction. Supplied as a fact. */
  jurisdiction: string;
  allowedHazardFamilies: string[];
  /** The decomposed hazards. `HazardDecomposition[]` satisfies this shape. */
  hazards: ReadonlyArray<{
    hazardId?: string;
    domainId?: string;
    hazardFamily?: string;
    conditionState?: string;
    observationFragment?: string;
  }>;
  /** `result.applicabilityDecisions` from the evidence foundation. Undefined when none ran. */
  applicabilityDecisions?: ReadonlyArray<CanonicalApplicabilityDecision>;
  governedStandards?: GovernedStandardView[];
  answeredClarifications?: Array<{ clarificationId: string; answer: string }>;
  supplementaryContext?: Array<{
    sourceId: string;
    sourceType: 'inspection_context' | 'clarification_answer';
    text: string;
  }>;
  /** Production-supplied life-criticality and actions, when a future engine emits them. */
  findingMetadataByKey?: Record<string, { isLifeCritical?: boolean; isActionable?: boolean; requiredActions?: string[] }>;
}

/**
 * Map the real analysis state onto the canonical source.
 *
 * The evidence quotes are taken from the decomposition's own `observationFragment`, which is a
 * verbatim span of the observation the engine selected -- so the quote Expert is shown is the
 * engine's own evidence, not a re-derivation. A fragment that is not literally present in the
 * observation is DROPPED rather than repaired: a quote that does not bind is worse than no quote,
 * and the §105 grounding contract exists because of exactly that.
 */
export function toCanonicalExpertInputSource(state: HazLenzAnalysisState): CanonicalExpertInputSource {
  const findings: CanonicalDeterministicFinding[] = state.hazards.map((h, i) => {
    const key = h.hazardId ?? `finding-${i + 1}`;
    const meta = state.findingMetadataByKey?.[key];
    return {
      findingKey: key,
      hazardFamily: h.hazardFamily ?? h.domainId ?? 'unknown',
      conditionState: h.conditionState,
      isLifeCritical: meta?.isLifeCritical === true,
      isActionable: meta?.isActionable === true,
      requiredActions: [...(meta?.requiredActions ?? [])],
    };
  });

  const evidenceQuotesByFamily: Record<string, string[]> = {};
  for (const h of state.hazards) {
    const family = h.hazardFamily ?? h.domainId;
    const fragment = h.observationFragment;
    if (!family || !fragment) continue;
    if (!state.observation.includes(fragment)) continue;
    (evidenceQuotesByFamily[family] ??= []).push(fragment);
  }

  return {
    analysisId: state.analysisId,
    jurisdiction: state.jurisdiction,
    allowedHazardFamilies: [...state.allowedHazardFamilies],
    inspectionContext: {
      location: state.inspectionContext?.location ?? null,
      task: state.inspectionContext?.task ?? null,
    },
    observationText: state.observation,
    supplementaryContext: [...(state.supplementaryContext ?? [])],
    deterministicFindings: findings,
    applicabilityDecisions: state.applicabilityDecisions
      ? state.applicabilityDecisions.map(d => ({ ...d }))
      : undefined,
    evidenceQuotesByFamily,
    governedStandards: [...(state.governedStandards ?? [])],
    answeredClarifications: [...(state.answeredClarifications ?? [])],
  };
}

/** The single call both the harness and a future production caller make. */
export function buildExpertAnalysisInputFromAnalysis(state: HazLenzAnalysisState): ExpertAnalysisInput {
  return buildExpertAnalysisInput(toCanonicalExpertInputSource(state));
}

// ---------------------------------------------------------------- the frozen permutation

/**
 * The permutation M14 uses. Frozen here rather than randomised, so the measurement is reproducible
 * and two runs permute identically.
 *
 * REVERSAL, not a shuffle. A shuffle needs a seed, a seed is a parameter, and a parameter is
 * something a later run could change to get a better number. Reversal is the one permutation with
 * no parameter at all, and it is a maximal reordering rather than a token one.
 *
 * Only ORDER changes. Every member, every field and every string is identical, which is what makes
 * a difference in the output attributable to order.
 */
export function permuteForOrderSensitivity(input: ExpertAnalysisInput): ExpertAnalysisInput {
  const permuted: ExpertAnalysisInput = {
    ...input,
    // The observation must stay first: evidence offsets are validated against the source the
    // producer names, and reordering the sources it quotes from is not an order-sensitivity test,
    // it is a different input.
    authoritativeSources: [
      input.authoritativeSources[0],
      ...input.authoritativeSources.slice(1).reverse(),
    ].filter(Boolean),
    deterministicFindings: [...input.deterministicFindings].reverse(),
    governedStandards: [...input.governedStandards].reverse(),
    allowedHazardFamilies: [...input.allowedHazardFamilies].reverse(),
  };
  if (input.deterministicFamilyDispositions !== undefined) {
    permuted.deterministicFamilyDispositions = [...input.deterministicFamilyDispositions].reverse();
  }
  return permuted;
}
