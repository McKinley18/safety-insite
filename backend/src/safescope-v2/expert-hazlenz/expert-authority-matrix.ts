/**
 * EXPERT HAZLENZ -- THE PROTECTION MATRIX.
 *
 * This file is the executable form of the sentence blueprint section 98.7 and decision `D-110`
 * state in prose:
 *
 *      DETERMINISTIC HAZLENZ + GOVERNED KNOWLEDGE = PROTECTED SAFETY / REGULATORY AUTHORITY
 *      EXPERT HAZLENZ                             = ADDITIVE REASONING ONLY
 *
 * WHY IT IS DATA AND NOT A DOCUMENT. Section 98.6 froze twelve governance contracts and said the
 * next phase "may add intelligence -- it may NOT silently weaken any of these". A paragraph cannot
 * enforce that. A table a test can iterate can: `expert-authority-merge.ts` asks this matrix what
 * an Expert output is allowed to do to a surface, and the merge suite asserts that no surface
 * anywhere in the matrix permits suppression or mutation. Adding a permissive row therefore breaks
 * a test rather than quietly widening Expert authority.
 *
 * THE TWO TWELVES, and they are different lists on purpose.
 *
 *   - `FROZEN_GOVERNANCE_CONTRACTS` -- the twelve contracts section 98.6 froze. They are governance
 *     facts (release identity, approval reachability, binding, allowlist, kill switch).
 *   - `EXPERT_AUTHORITY_SURFACES` -- the twelve BEHAVIOURAL outputs an Expert layer could try to
 *     influence. Each names the frozen contracts it inherits and the evidence that currently pins
 *     it.
 *
 * Conflating them is the error this file exists to prevent: "the governed corpus is frozen" says
 * nothing about whether Expert may re-decide a condition state, and "Level-1 recognition is
 * protected" says nothing about whether Expert may rebind a release id.
 *
 * EVIDENCE PINS ARE REAL COMMANDS. Every `evidencePin` is a script in `backend/package.json` or a
 * runnable path in this repository, recorded so a future phase can re-run the thing that protects a
 * surface rather than trusting this file's description of it.
 */

// ---------------------------------------------------------------- the frozen governance baseline

/**
 * The twelve contracts frozen by blueprint section 98.6 under `GOVERNANCE_BASELINE_FROZEN = TRUE`.
 * Quoted as identifiers so a surface below can cite them by key instead of restating them.
 */
export const FROZEN_GOVERNANCE_CONTRACTS = [
  'APPROVED_CORPUS_AND_RELEASE_IDENTITY',
  'ACTIVE_RELEASE_POINTER',
  'APPROVED_GOVERNED_MEMBERSHIP',
  'REJECTED_RECORDS_UNREACHABLE',
  'WRITE_ONCE_RELEASE_BINDING',
  'HISTORICAL_NULL_NEVER_BACKFILLED',
  'ALLOWLIST_AUTHORITY_NO_REQUEST_OVERRIDE',
  'NON_ALLOWLISTED_LEGACY_BEHAVIOUR',
  'CANONICAL_KILL_SWITCH_AUTHORITY',
  'ALREADY_BOUND_PROVENANCE_PRESERVATION',
  'DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR',
  'FINDING_LEVEL_AUTHORITY_ANTI_CITATION_LAUNDERING',
] as const;
export type FrozenGovernanceContract = (typeof FROZEN_GOVERNANCE_CONTRACTS)[number];

// ---------------------------------------------------------------- what Expert may do to a surface

/**
 * The four verbs, ordered by increasing force. The default rule from the authorization is that only
 * the first two are ever available, and the matrix below never grants the last two.
 */
export const EXPERT_ACTIONS = ['ADD', 'CHALLENGE', 'SUPPRESS', 'MUTATE'] as const;
export type ExpertAction = (typeof EXPERT_ACTIONS)[number];

/**
 * What must happen when Expert reaches a different conclusion than a protected surface.
 *
 * There is deliberately no member meaning "adopt the Expert view". Disagreement is evidence for the
 * evaluation phase; it is never a write path. `RECORD_DISAGREEMENT_ONLY` is the whole vocabulary
 * plus one escalation variant for surfaces where a human should look.
 */
export const DISAGREEMENT_BEHAVIOURS = [
  'RECORD_DISAGREEMENT_ONLY',
  'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW',
] as const;
export type DisagreementBehaviour = (typeof DISAGREEMENT_BEHAVIOURS)[number];

/**
 * What must happen when Expert cannot answer at all.
 *
 * `SURFACE_UNCHANGED` is the only member, and that is the point: no surface degrades, substitutes,
 * or waits when the Expert layer is missing. Expert failure is invisible to protected authority.
 */
export const UNAVAILABLE_BEHAVIOURS = ['SURFACE_UNCHANGED'] as const;
export type UnavailableBehaviour = (typeof UNAVAILABLE_BEHAVIOURS)[number];

export interface ExpertAuthoritySurface {
  /** Stable key. Referenced by merge decisions and by the merge suite. */
  surface: string;
  /** One sentence: what the surface decides. */
  decides: string;
  /** Where the authoritative answer is produced today. A real path in this repository. */
  authoritySource: string;
  /** A runnable command or path that currently protects the surface. */
  evidencePin: string;
  /** Which of the twelve frozen contracts this surface inherits. May be empty for pure Level-1. */
  frozenContracts: FrozenGovernanceContract[];
  /** Exactly the actions Expert is permitted to take. Never contains SUPPRESS or MUTATE. */
  permitted: ExpertAction[];
  onDisagreement: DisagreementBehaviour;
  onExpertUnavailable: UnavailableBehaviour;
  /** Why the permissions are what they are. Not decoration -- it is the reviewable part. */
  rationale: string;
}

/**
 * THE MATRIX. Twelve behavioural surfaces, in the order the authorization named them.
 *
 * Read the `permitted` column first. Every row is `['ADD', 'CHALLENGE']` or `['CHALLENGE']`, and
 * the difference is the interesting part: a surface gets `ADD` when an additional advisory item
 * cannot weaken it, and `CHALLENGE` only when anything Expert could contribute would be a claim
 * about a governed or fail-closed fact it is not allowed to make.
 */
export const EXPERT_AUTHORITY_SURFACES: readonly ExpertAuthoritySurface[] = [
  {
    surface: 'HAZARD_RECOGNITION',
    decides: 'which hazards are recognized from an observation',
    authoritySource: 'src/safescope-v2/engine/deterministic-classifier.ts',
    evidencePin: 'npm run test:hazlenz-level1-recall',
    frozenContracts: ['DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR'],
    permitted: ['ADD', 'CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_ONLY',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'An additional advisory candidate cannot reduce recall, so ADD is safe. Removing one could, '
      + 'so it is not available at any confidence.',
  },
  {
    surface: 'HAZARD_DECOMPOSITION',
    decides: 'how a multi-hazard observation is split into independent findings',
    authoritySource: 'src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts',
    evidencePin: 'npm run test:hazlenz-precision',
    frozenContracts: ['DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR'],
    permitted: ['ADD', 'CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_ONLY',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'Merging two deterministic findings into one is suppression wearing a different word. Expert '
      + 'may propose an additional decomposition and may say the split looks wrong; it may not '
      + 'perform the merge.',
  },
  {
    surface: 'DANGEROUS_AND_LIFE_CRITICAL_RETENTION',
    decides: 'that a recognized life-critical hazard survives to the customer',
    authoritySource: 'src/safescope-v2/tests/hazlenz-actionable-coverage-scorer.ts (scored floor)',
    evidencePin: 'npm run test:hazlenz-precision  (life-critical omissions = 0)',
    frozenContracts: ['DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR'],
    permitted: ['CHALLENGE'],
    // No ADD: the surface is not a list of hazards, it is the INVARIANT that the list does not
    // shrink. There is nothing additive to contribute to an invariant.
    onDisagreement: 'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'The one surface where a silent Expert omission would be lethal rather than merely wrong. '
      + 'Expert saying nothing about a life-critical hazard must be indistinguishable, at the '
      + 'merged output, from Expert never having run.',
  },
  {
    surface: 'CONDITION_STATE_INTERPRETATION',
    decides: 'whether an observed condition is active, controlled, corrected or removed',
    authoritySource: 'src/safescope-v2/inspection-intelligence/inspection-condition-assessment.service.ts',
    evidencePin: 'npx ts-node src/safescope-v2/tests/hazlenz-condition-state-invariants-regression.ts',
    frozenContracts: ['DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR'],
    permitted: ['CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'Measured, not assumed: L3 Run-2 recorded four rows where the provider asserted ACTIVE against '
      + 'a frozen INSUFFICIENT_EVIDENCE truth with activeProhibited=true, and the validator and '
      + 'binder both passed it through. Expert may say the state looks wrong. It may not set one.',
  },
  {
    surface: 'NEGATION_AND_SAFE_STATE',
    decides: 'that a described safe state does not become a finding',
    authoritySource: 'src/safescope-v2/reasoning-orchestrator/negation-context.util.ts',
    evidencePin: 'npx ts-node src/safescope-v2/tests/hazlenz-energy-isolation-negation-regression.ts',
    frozenContracts: ['DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR'],
    permitted: ['CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_ONLY',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'ADD is withheld here specifically because an Expert candidate on a negated observation is the '
      + 'false-positive shape this surface exists to prevent. An Expert candidate is still '
      + 'expressible -- it simply lands as EXPERT_ADVISORY beside an unchanged deterministic '
      + 'no-finding, and the evaluation plan scores it as a false positive.',
  },
  {
    surface: 'ACTIONABLE_CLASSIFICATION',
    decides: 'whether a recognized hazard becomes an actionable customer finding',
    authoritySource: 'src/safescope-v2/tests/hazlenz-actionable-coverage-scorer.ts',
    evidencePin: 'npm run test:hazlenz-actionable-coverage',
    frozenContracts: ['DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR'],
    permitted: ['ADD', 'CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_ONLY',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'recognizedButNotActionable is empty at HEAD and must stay empty. Expert may explain why a '
      + 'finding matters; the classification itself stays deterministic.',
  },
  {
    surface: 'RISK_BEHAVIOUR',
    decides: 'severity, exposure and risk ranking',
    authoritySource: 'src/safescope-v2/risk/',
    evidencePin: 'npm run test:risk-policy',
    frozenContracts: [],
    permitted: ['ADD', 'CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_ONLY',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'Expert risk context is genuinely additive -- interactions and aggravating conditions the '
      + 'deterministic policy does not model. It is advisory context, never a new risk score on the '
      + 'authoritative object.',
  },
  {
    surface: 'JURISDICTION_HANDLING',
    decides: 'which regulatory regime governs the inspection',
    authoritySource: 'src/safescope-v2/safescope-v2.controller.ts applyInspectionRegulatoryContext',
    evidencePin: 'npm run test:hazlenz-standards-jurisdiction',
    frozenContracts: ['FINDING_LEVEL_AUTHORITY_ANTI_CITATION_LAUNDERING'],
    permitted: ['CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'The inspection is the authority for the regulatory fact every one of its findings inherits, '
      + 'and the L3 contract already refused USER_CONFIRMED provenance from a proposal. Expert '
      + 'inherits that refusal: it can never mark a jurisdiction confirmed.',
  },
  {
    surface: 'GOVERNED_REGULATORY_CITATION',
    decides: 'which citation is shown and whether approved text backs it',
    authoritySource: 'src/standards/cutover/fallback-contract.ts, src/standards/display/standards-backing-contract.ts',
    evidencePin: 'npm run test:finding-governed-authority',
    frozenContracts: [
      'APPROVED_CORPUS_AND_RELEASE_IDENTITY',
      'APPROVED_GOVERNED_MEMBERSHIP',
      'REJECTED_RECORDS_UNREACHABLE',
      'FINDING_LEVEL_AUTHORITY_ANTI_CITATION_LAUNDERING',
    ],
    permitted: ['CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'The anti-citation-laundering contract. Expert may reason ABOUT a governed record it was '
      + 'handed; a citation string that reaches the customer must have come from the governed '
      + 'resolver. This is the surface where ADD would be indistinguishable from fabrication.',
  },
  {
    surface: 'KNOWLEDGE_RELEASE_PROVENANCE',
    decides: 'the knowledgeReleaseId recorded on an analysis and its findings',
    authoritySource: 'src/standards/cutover/governed-provenance.ts',
    evidencePin: 'npm run test:knowledge-release-provenance',
    frozenContracts: [
      'ACTIVE_RELEASE_POINTER',
      'WRITE_ONCE_RELEASE_BINDING',
      'HISTORICAL_NULL_NEVER_BACKFILLED',
      'ALREADY_BOUND_PROVENANCE_PRESERVATION',
    ],
    permitted: ['CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_ONLY',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'Binding is resolved once, at the controller, before analysis. Expert runs after that point '
      + 'and therefore cannot participate in it even accidentally. The prohibition is restated here '
      + 'because a merge layer is exactly where an id could be copied by mistake.',
  },
  {
    surface: 'CORRECTIVE_ACTION_AND_WORKFLOW',
    decides: 'the corrective actions and workflow the customer is given',
    authoritySource: 'src/safescope-v2/corrective-actions/',
    evidencePin: 'npm run test:canonical-workflow',
    frozenContracts: ['DETERMINISTIC_LEVEL1_RECOGNITION_ACTIONABILITY_FLOOR'],
    permitted: ['ADD', 'CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_ONLY',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'A required action may never be removed. Additional advisory context around one is the '
      + 'clearest case of additive value in the whole matrix.',
  },
  {
    surface: 'FAIL_CLOSED_AND_FALLBACK',
    decides: 'kill-switch, cutover-mode and fallback behaviour',
    authoritySource: 'src/standards/cutover/cutover-kill-switch.ts, src/standards/cutover/cutover-mode.ts',
    evidencePin: 'npm run test:governed-kill-switch-authority',
    frozenContracts: [
      'CANONICAL_KILL_SWITCH_AUTHORITY',
      'ALLOWLIST_AUTHORITY_NO_REQUEST_OVERRIDE',
      'NON_ALLOWLISTED_LEGACY_BEHAVIOUR',
    ],
    permitted: ['CHALLENGE'],
    onDisagreement: 'RECORD_DISAGREEMENT_AND_RECOMMEND_REVIEW',
    onExpertUnavailable: 'SURFACE_UNCHANGED',
    rationale:
      'Expert is downstream of every one of these decisions. If an Expert output could influence a '
      + 'kill switch, the kill switch would no longer be a brake -- it would be a suggestion.',
  },
];

// ---------------------------------------------------------------- executable rules

const BY_SURFACE = new Map(EXPERT_AUTHORITY_SURFACES.map(s => [s.surface, s]));

export function getAuthoritySurface(surface: string): ExpertAuthoritySurface | null {
  return BY_SURFACE.get(surface) ?? null;
}

/**
 * The single question the merge layer asks. An unknown surface answers `false` -- fail closed, so a
 * surface added to the product without a matrix row cannot be influenced by Expert by default.
 */
export function isExpertActionPermitted(surface: string, action: ExpertAction): boolean {
  const row = BY_SURFACE.get(surface);
  if (!row) return false;
  return row.permitted.includes(action);
}

/**
 * THE DEFAULT RULE, as a function rather than a sentence:
 *
 *      Expert may NEVER silently remove a protected deterministic hazard, governed citation,
 *      provenance association, or required customer action.
 *
 * True for every row, asserted by the merge suite across the whole matrix rather than sampled.
 */
export function matrixForbidsRemovalEverywhere(): boolean {
  return EXPERT_AUTHORITY_SURFACES.every(
    s => !s.permitted.includes('SUPPRESS') && !s.permitted.includes('MUTATE'),
  );
}

/** Every surface must degrade to "unchanged" when Expert is missing. Checked, not assumed. */
export function matrixIsUnavailabilitySafe(): boolean {
  return EXPERT_AUTHORITY_SURFACES.every(s => s.onExpertUnavailable === 'SURFACE_UNCHANGED');
}
