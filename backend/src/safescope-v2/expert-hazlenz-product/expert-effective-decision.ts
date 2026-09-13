import type { AnalysisState } from './expert-analysis-authority';
import type { HumanClassification, SettledEntry } from './expert-settlement-contract';

/**
 * §264 — THE ONE FUNCTION THAT ANSWERS "WHAT IS AUTHORITATIVE HERE".
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS AS A FUNCTION AND NOT AS A CONVENTION.
 *
 * Downstream features — finding reconciliation, completion readiness, report finalization,
 * notifications — each need to know whether an Expert analysis carries a settled operational
 * conclusion. If each reconstructs that from `analysisState` and `confirmationRequired` on its own,
 * they will eventually disagree, and the disagreement will be a feature treating an unsettled
 * conclusion as settled. That is the single failure §255 and §260 exist to prevent.
 *
 * So there is one derivation, it is total over the state vocabulary, and it has no default branch.
 *
 * ---------------------------------------------------------------------------------------------
 * "NO SETTLED CONCLUSION" IS A FIRST-CLASS ANSWER, NOT AN ABSENCE.
 *
 * Four different situations produce no operational conclusion — awaiting a human, refused, refused
 * with truth preserved, and never obtained — and they mean different things to a user and to an
 * operator. Each carries its own reason, so a consumer that renders them cannot flatten them into
 * "nothing to show", and none of them can be mistaken for "no hazards".
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT DELIBERATELY DOES NOT DO.
 *
 * It creates nothing, enables nothing and reconciles nothing. §264 exposes the derivation so a
 * later authority-guard slice can consume it; it does not activate any consumer. `settledForUse`
 * is a fact about the analysis, not a permission granted to anything.
 */
export const EFFECTIVE_DECISION_VERSION = 'hazlenz.expert.264.effective-decision.v1' as const;

export const EFFECTIVE_DECISION_SOURCES = [
  /** Admitted, the rule found nothing for a human to settle. The Expert conclusion stands. */
  'EXPERT_ADMITTED_NO_CONFIRMATION_REQUIRED',
  /** A human confirmed the classification as HazLenz authored it. */
  'HUMAN_CONFIRMED_AS_AUTHORED',
  /** A human replaced the classification. The human value is authoritative. */
  'HUMAN_REPLACED',
  /** Admitted, and a human has not settled it yet. */
  'NONE_AWAITING_HUMAN_CONFIRMATION',
  /** The provider answered and deterministic admission refused the whole output. */
  'NONE_REFUSED',
  /** Refused, with unresolved truth the model itself supplied preserved. */
  'NONE_UNRESOLVED_TRUTH_PRESERVED',
  /** The Expert layer was not reachable. Not a finding that there are no hazards. */
  'NONE_EXPERT_UNAVAILABLE',
  /** The execution is still in flight. */
  'NONE_RUNNING',
] as const;
export type EffectiveDecisionSource = (typeof EFFECTIVE_DECISION_SOURCES)[number];

export interface EffectiveDecision {
  readonly version: typeof EFFECTIVE_DECISION_VERSION;
  readonly source: EffectiveDecisionSource;
  /**
   * TRUE only where an operational conclusion may be acted on. Every "NONE_" source is false, and
   * a consumer that checks nothing else still cannot act on an unsettled analysis.
   */
  readonly settledForUse: boolean;
  /** TRUE when a human settled it, whether they agreed or not. */
  readonly humanSettled: boolean;
  /** The authoritative classification per entry. Empty where nothing is settled. */
  readonly entries: readonly {
    readonly refKind: string;
    readonly ref: string;
    readonly expertClassification: HumanClassification;
    readonly effectiveClassification: HumanClassification;
    readonly changedByHuman: boolean;
  }[];
  readonly reviewer: { readonly userId: string; readonly at: string } | null;
  /** Plain language, so a consumer never has to interpret the source enum to render honestly. */
  readonly statement: string;
}

export interface EffectiveDecisionInput {
  readonly analysisState: AnalysisState;
  /**
   * The settlement, when one exists. Supplied by the caller from `human_reviews`; this function
   * performs no lookup, so it stays pure and testable without a database.
   */
  readonly settlement: {
    readonly decision: 'classification_confirmed' | 'classification_changed';
    readonly entries: readonly SettledEntry[];
    readonly reviewedByUserId: string;
    readonly createdAt: Date;
  } | null;
}

const none = (
  source: EffectiveDecisionSource, statement: string,
): EffectiveDecision => ({
  version: EFFECTIVE_DECISION_VERSION,
  source,
  settledForUse: false,
  humanSettled: false,
  entries: [],
  reviewer: null,
  statement,
});

/**
 * TOTAL OVER THE STATE VOCABULARY, WITH NO DEFAULT BRANCH.
 *
 * An unrecognised state throws rather than resolving to something benign. A state this function
 * cannot classify is a defect in the layer above, and the one answer that must never be produced by
 * accident is "settled".
 */
export function deriveEffectiveDecision(input: EffectiveDecisionInput): EffectiveDecision {
  switch (input.analysisState) {
    case 'ANALYSIS_RUNNING':
      return none('NONE_RUNNING', 'An Expert analysis is in progress. No conclusion exists yet.');

    case 'ANALYSIS_FAILED':
      return none('NONE_EXPERT_UNAVAILABLE',
        'The Expert layer could not be reached, so it produced no conclusion. This is not a '
        + 'finding that there are no hazards.');

    case 'ANALYSIS_REFUSED':
      return none('NONE_REFUSED',
        'The Expert layer answered and the answer was refused in full. No conclusion is offered.');

    case 'ANALYSIS_UNRESOLVED':
      return none('NONE_UNRESOLVED_TRUTH_PRESERVED',
        'The Expert output was refused and the unresolved facts it stated for itself are '
        + 'preserved. No operational conclusion is offered.');

    case 'ANALYSIS_AWAITING_CONFIRMATION':
      // SILENCE IS NEVER CONFIRMATION. The absence of a decision renders as awaiting, and never as
      // either answer — §260 section 11, stated as a product rule.
      return none('NONE_AWAITING_HUMAN_CONFIRMATION',
        'This analysis requires a person to settle its operational conclusion, and no one has. '
        + 'It is not confirmed and it is not rejected.');

    case 'ANALYSIS_AVAILABLE':
      // Admitted with nothing for a human to settle. The Expert conclusion is the conclusion, under
      // the same authority rules that already govern an advisory analysis.
      return {
        version: EFFECTIVE_DECISION_VERSION,
        source: 'EXPERT_ADMITTED_NO_CONFIRMATION_REQUIRED',
        settledForUse: true,
        humanSettled: false,
        entries: [],
        reviewer: null,
        statement: 'This Expert analysis was admitted and required no human confirmation.',
      };

    case 'ANALYSIS_CONFIRMED':
    case 'ANALYSIS_OVERRIDDEN': {
      const settlement = input.settlement;
      if (settlement === null) {
        // A settled STATE with no settlement RECORD is an inconsistency, not a conclusion. The
        // database constraint makes it unreachable through the product path; if it is ever seen,
        // refusing to produce a conclusion is the only safe answer.
        throw new Error('EFFECTIVE_DECISION_264_ABORT: '
          + `${input.analysisState} carries no settlement record; an authoritative human decision `
          + 'cannot be derived from a state name alone');
      }
      const changed = settlement.decision === 'classification_changed';
      return {
        version: EFFECTIVE_DECISION_VERSION,
        source: changed ? 'HUMAN_REPLACED' : 'HUMAN_CONFIRMED_AS_AUTHORED',
        settledForUse: true,
        humanSettled: true,
        entries: settlement.entries.map(entry => ({
          refKind: entry.refKind,
          ref: entry.ref,
          expertClassification: entry.expertClassification,
          effectiveClassification: entry.humanClassification,
          changedByHuman: entry.changed,
        })),
        reviewer: {
          userId: settlement.reviewedByUserId,
          at: settlement.createdAt.toISOString(),
        },
        statement: changed
          ? 'A person reviewed this Expert analysis and replaced its operational classification. '
            + 'The human decision is authoritative.'
          : 'A person reviewed this Expert analysis and confirmed its operational classification '
            + 'as authored.',
      };
    }

    default: {
      const unreachable: never = input.analysisState;
      throw new Error('EFFECTIVE_DECISION_264_ABORT: no effective decision is derivable for '
        + `analysis state ${String(unreachable)}, and no benign default is permitted`);
    }
  }
}
