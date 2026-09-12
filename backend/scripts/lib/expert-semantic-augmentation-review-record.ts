/**
 * §129 -- VERIFICATION PHASE MODEL and AUTHORITATIVE REVIEW RECORD for
 * FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1.
 *
 * ==================== THE DEFECT THIS FILE REPAIRS ====================
 *
 * §127 built one validator for one moment: the seal of a PRE-REVIEW candidate corpus. Its count
 * assertions encode `CANDIDATE_TARGETS` -- 26 clarifications and 14 interactions -- which exist to
 * give independent review room to REJECT material without immediately re-blocking the cohort.
 *
 * Independent review then did exactly that. It withdrew five clarifications and three interactions,
 * promoted two interactions, and left two interactions unrecordable against a frozen vocabulary. The
 * reviewed corpus therefore carries 22 OWED rows and 12 recorded interactions, and it CANNOT satisfy
 * an assertion whose entire purpose was to be spent by review. That is a defect in the verification
 * PHASE MODEL, not a failure of the corpus.
 *
 * The repair is a phase distinction, not a relaxation:
 *
 *   PRE_REVIEW_CANDIDATE   enforces the frozen candidate-authoring targets, 26 and 14, unchanged.
 *   POST_HUMAN_REVIEW      enforces the FROZEN COHORT MINIMUMS, 20 and 10, against the countable
 *                          reviewed evaluation material.
 *
 * Nothing here lowers, renames, replaces or reinterprets `CANDIDATE_TARGETS`. A newly authored
 * candidate corpus that misses 26 or 14 still fails, and `test-semantic-augmentation-phase-contract`
 * proves it with a fixture rather than by mutating the reviewed corpus.
 *
 * ==================== PHASE IS EXPLICIT, NEVER INFERRED FROM COUNTS ====================
 *
 * A validator that guessed "these counts look post-review" would be a validator that could be
 * defeated by withdrawing material. The phase comes from an explicit `--phase` argument, or -- when
 * none is given -- from the DECLARED corpus lifecycle state recorded below. Both are auditable and
 * both are printed. Counts never select a phase.
 *
 * ==================== MECHANICAL COUNTS ARE NOT COUNTABLE CASES ====================
 *
 * These are different quantities and the post-review contract needs both.
 *
 *   MECHANICAL SURVIVING ROW COUNT   what the applied fixture literally contains: 22 OWED rows,
 *                                    12 rows carrying a recorded interaction.
 *   COUNTABLE REVIEWED CASE          what the formal cohort may actually draw on: the mechanical
 *                                    count PLUS the independently authorized material measured in
 *                                    §126, which lives in other corpora and is not duplicated here.
 *
 * Two interactions the reviewer holds to be genuinely PRESENT -- SEM-09 and SEM-35 -- are recorded
 * NOWHERE and counted NOWHERE, because the frozen interaction vocabulary has no member that names
 * their mechanism. They are carried below as limitations so that the loss stays visible; they are
 * never added to a counter.
 *
 * ==================== NO PROVIDER, NO RESERVE, NO SPEND ====================
 *
 * This module imports the construction policy and the cohort composition requirements and nothing
 * else. It opens no reserved material, reads no run record, and calls no provider.
 */

import { REQUIRED_CLASS_MINIMUMS } from '../../src/safescope-v2/expert-hazlenz/expert-cohort-composition';
import { CANDIDATE_TARGETS } from './expert-semantic-augmentation-construction-policy';

export const SEMANTIC_AUGMENTATION_PHASE_MODEL_VERSION =
  'EXPERT_SEMANTIC_AUGMENTATION_PHASE_MODEL_V1' as const;

// ---------------------------------------------------------------- the phases

export const VALIDATION_PHASES = ['PRE_REVIEW_CANDIDATE', 'POST_HUMAN_REVIEW'] as const;
export type ValidationPhase = typeof VALIDATION_PHASES[number];

export interface ResolvedPhase {
  phase: ValidationPhase;
  /** Where the phase came from. Never `INFERRED_FROM_COUNTS` -- that source does not exist. */
  source: 'EXPLICIT_ARGUMENT' | 'DECLARED_CORPUS_LIFECYCLE_STATE';
}

/**
 * The corpus lifecycle state, DECLARED. This is the auditable fact that makes a bare validator run
 * unambiguous: with no `--phase` argument the validator evaluates the phase this state names.
 *
 * It advances only when a real lifecycle event happens. It advanced to POST_HUMAN_REVIEW when the
 * independent product-owner review of all 35 rows completed and every recorded adjudication was
 * applied in one controlled pass (`review/OWNER-CALL-APPLICATION-PASS.md`).
 */
export const CORPUS_LIFECYCLE_STATE = {
  identifier: 'FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE',
  governingPhase: 'POST_HUMAN_REVIEW' as ValidationPhase,
  humanReviewComplete: true,
  adjudicationsApplied: true,
  resealedAfterReview: true,
  formalEvaluationSpent: false,
  reviewArtifacts: [
    'verification/expert-hazlenz-semantic-augmentation-2026-08-31/review/HUMAN-REVIEW-VERDICTS-BATCH-1.md',
    'verification/expert-hazlenz-semantic-augmentation-2026-08-31/review/HUMAN-REVIEW-VERDICTS-BATCH-2.md',
    'verification/expert-hazlenz-semantic-augmentation-2026-08-31/review/HUMAN-REVIEW-VERDICTS-BATCH-3.md',
    'verification/expert-hazlenz-semantic-augmentation-2026-08-31/review/HUMAN-REVIEW-VERDICTS-BATCH-4.md',
    'verification/expert-hazlenz-semantic-augmentation-2026-08-31/review/OWNER-CALL-OPEN-ITEM-7B.md',
    'verification/expert-hazlenz-semantic-augmentation-2026-08-31/review/OWNER-CALL-SEM-27.md',
    'verification/expert-hazlenz-semantic-augmentation-2026-08-31/review/OWNER-CALL-APPLICATION-PASS.md',
  ],
  note: 'The sealed IDENTIFIER still ends in _CANDIDATE. That string is the frozen name of the '
    + 'corpus and renaming it would break every artifact that references the seal, so it is left '
    + 'alone. Lifecycle phase is carried by this field, not by the identifier.',
} as const;

/**
 * Resolve the validation phase. Explicit argument wins; otherwise the DECLARED lifecycle state
 * governs. An unrecognised phase is a hard error -- it is never silently defaulted, because a typo
 * that quietly selected the weaker contract would be exactly the failure this model exists to stop.
 */
export function resolveValidationPhase(argv: readonly string[]): ResolvedPhase {
  let raw: string | null = null;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--phase=')) { raw = a.slice('--phase='.length); break; }
    if (a === '--phase') { raw = argv[i + 1] ?? ''; break; }
  }
  if (raw === null) {
    return { phase: CORPUS_LIFECYCLE_STATE.governingPhase, source: 'DECLARED_CORPUS_LIFECYCLE_STATE' };
  }
  const upper = raw.trim().toUpperCase();
  if (!(VALIDATION_PHASES as readonly string[]).includes(upper)) {
    throw new Error(
      `unrecognised validation phase "${raw}". Valid phases: ${VALIDATION_PHASES.join(', ')}.`);
  }
  return { phase: upper as ValidationPhase, source: 'EXPLICIT_ARGUMENT' };
}

/**
 * Seal status text, one per phase. A vocabulary rather than a free string, so the descriptive status
 * cannot drift away from the phase actually validated.
 */
export const SEAL_STATUS_BY_PHASE: Readonly<Record<ValidationPhase, string>> = {
  PRE_REVIEW_CANDIDATE: 'CANDIDATE -- SEALED, AWAITING INDEPENDENT PRODUCT-OWNER SAFETY REVIEW',
  POST_HUMAN_REVIEW: 'REVIEWED -- HUMAN ADJUDICATION COMPLETE, SEALED, FORMAL EVALUATION UNSPENT',
};

/** What the REVIEWED status does NOT mean. Emitted with the seal so it cannot be read as more. */
export const SEAL_STATUS_DOES_NOT_IMPLY: readonly string[] = [
  'The formal evaluation cohort has NOT been assembled, run, scored or passed.',
  'No provider has validated this material; PROVIDER_INVOCATION_COUNT is 0.',
  'No customer activation is authorized.',
  'No production authorization is granted or implied.',
  'P4_PRESPEND_AUTHORIZATION remains unmet.',
];

// ---------------------------------------------------------------- the frozen minimums

/**
 * The frozen post-review minimums. Sourced from `REQUIRED_CLASS_MINIMUMS` in the cohort composition
 * requirements -- the single frozen definition -- rather than re-typed here, so this file cannot
 * drift away from the contract it claims to enforce.
 */
export const FROZEN_COMPOSITION_MINIMUMS = {
  clarificationOwed: REQUIRED_CLASS_MINIMUMS.CLARIFICATION_OWED.minimum,
  crossHazardInteraction: REQUIRED_CLASS_MINIMUMS.CROSS_HAZARD_INTERACTION.minimum,
} as const;

/**
 * Composition available from INDEPENDENTLY AUTHORIZED material that is not part of this corpus,
 * measured in §126 and unchanged by anything here. Proof:
 * `verification/expert-hazlenz-formal-cohort-final-assembly-2026-08-31/proofs/max-achievable-composition.txt`.
 *
 *   clarificationOwed        3   augmentation V2 only
 *   crossHazardInteraction   5   augmentation V2 (3) + Population B recognised (2)
 */
export const INDEPENDENTLY_AUTHORIZED_COMPOSITION = {
  clarificationOwed: 3,
  crossHazardInteraction: 5,
  provenance: 'verification/expert-hazlenz-formal-cohort-final-assembly-2026-08-31/proofs/'
    + 'max-achievable-composition.txt',
} as const;

// ---------------------------------------------------------------- the review record

export interface SemanticReviewRecord {
  reviewedRowCount: number;

  clarification: {
    authoredOwed: number;
    withdrawnRowIds: readonly string[];
    survivingOwedRowIds: readonly string[];
    independentlyAuthorized: number;
    /** The owner's own stated total. Cross-checked against the derivation, never trusted alone. */
    declaredCountableCases: number;
  };

  interaction: {
    authoredPresent: number;
    withdrawnRowIds: readonly string[];
    promotedRowIds: readonly string[];
    /** Authored as PRESENT, then removed because no frozen kind names the mechanism. */
    authoredThenVocabularyBlockedRowIds: readonly string[];
    /** Never mechanically authored; the reviewer holds a real interaction exists and it cannot be recorded. */
    neverAuthoredVocabularyBlockedRowIds: readonly string[];
    mechanicallyRecordedRowIds: readonly string[];
    independentlyAuthorized: number;
    declaredCountableCases: number;
  };

  /** Limitations carried forward unrepaired. None of these is counted anywhere. */
  frozenVocabularyLimitations: readonly {
    rowId: string; vocabulary: string; missing: string; consequence: string;
  }[];

  /** Row-contract consequences of applying an adjudication, recorded rather than applied silently. */
  contractConsequentialEffects: readonly { rowId: string; effect: string; forcedBy: string }[];
}

/**
 * THE AUTHORITATIVE REVIEWED ACCOUNTING.
 *
 * Transcribed from the recorded verdicts and the application pass. Every row set below is
 * mechanically reconciled against the applied fixture by `postHumanReviewGates`, so a transcription
 * error here fails validation instead of passing quietly.
 *
 * Clarification ledger:  27 authored OWED - 5 withdrawn = 22 surviving; + 3 authorized = 25 countable.
 * Interaction ledger:    14 authored PRESENT - 3 withdrawn - 1 vocabulary-blocked + 2 promoted
 *                        = 12 mechanically recorded; + 5 authorized = 17 countable.
 */
export const SEMANTIC_AUGMENTATION_REVIEW_RECORD: SemanticReviewRecord = {
  reviewedRowCount: 35,

  clarification: {
    authoredOwed: 27,
    withdrawnRowIds: ['SEM-06', 'SEM-20', 'SEM-22', 'SEM-23', 'SEM-28'],
    survivingOwedRowIds: [
      'SEM-01', 'SEM-02', 'SEM-03', 'SEM-04', 'SEM-05', 'SEM-07', 'SEM-08', 'SEM-09', 'SEM-10',
      'SEM-15', 'SEM-16', 'SEM-17', 'SEM-18', 'SEM-19', 'SEM-21', 'SEM-24', 'SEM-25', 'SEM-26',
      'SEM-27', 'SEM-29', 'SEM-30', 'SEM-35',
    ],
    independentlyAuthorized: INDEPENDENTLY_AUTHORIZED_COMPOSITION.clarificationOwed,
    declaredCountableCases: 25,
  },

  interaction: {
    authoredPresent: 14,
    withdrawnRowIds: ['SEM-06', 'SEM-08', 'SEM-14'],
    promotedRowIds: ['SEM-18', 'SEM-24'],
    authoredThenVocabularyBlockedRowIds: ['SEM-35'],
    neverAuthoredVocabularyBlockedRowIds: ['SEM-09'],
    mechanicallyRecordedRowIds: [
      'SEM-01', 'SEM-02', 'SEM-03', 'SEM-04', 'SEM-05', 'SEM-07', 'SEM-10', 'SEM-11', 'SEM-12',
      'SEM-13', 'SEM-18', 'SEM-24',
    ],
    independentlyAuthorized: INDEPENDENTLY_AUTHORIZED_COMPOSITION.crossHazardInteraction,
    declaredCountableCases: 17,
  },

  frozenVocabularyLimitations: [
    {
      rowId: 'SEM-09',
      vocabulary: 'ACCEPTED_INTERACTION_TAXONOMY',
      missing: 'a kind naming ignition of a flammable solvent atmosphere by a competent electrical '
        + 'ignition source with ventilation locked out',
      consequence: 'A real interaction is left UNRECORDED and UNCOUNTED. OTHER is unusable: the '
        + 'token occurs in EXPERT_SYSTEM_PROMPT as ordinary English and trips the substring '
        + 'truth-leak guard. Not repaired.',
    },
    {
      rowId: 'SEM-27',
      vocabulary: 'ACCEPTED_EXPERT_TAXONOMY',
      missing: 'a thermal / hot-process hazard family covering radiant heat and hot-material ejection',
      consequence: 'The row intentionally carries ZERO present families and keeps its OWED '
        + 'clarification. No family was created, widened or substituted; toExpertFamily untouched.',
    },
    {
      rowId: 'SEM-35',
      vocabulary: 'ACCEPTED_INTERACTION_TAXONOMY',
      missing: 'a kind naming vehicle movement / platform-position dependency / drive-away effects '
        + 'on fall protection',
      consequence: 'The authored interaction was REMOVED rather than forced into a distorting kind. '
        + 'The corpus has now lost two interaction counts to one vocabulary defect, and the second '
        + 'loss was the repair attempt for the first. Not repaired.',
    },
  ],

  contractConsequentialEffects: [
    {
      rowId: 'SEM-08',
      effect: 'chemical_exposure removed from lifeCriticalHazardFamilies, leaving '
        + "['confined_space']. This is a consequence of the reviewed partition correction "
        + 'PRESENT -> DEFENSIBLE, not an independent new semantic verdict.',
      forcedBy: 'validateCohortRow raises LIFE_CRITICAL_NOT_PRESENT for any life-critical family '
        + 'that is not PRESENT. Retaining it would have made the row internally invalid.',
    },
  ],
};

// ---------------------------------------------------------------- gate evaluation

export interface MechanicalComposition {
  rowIds: readonly string[];
  owedRowIds: readonly string[];
  notOwedRowIds: readonly string[];
  interactionRowIds: readonly string[];
  interactionNegativeControlRowIds: readonly string[];
}

export interface GateOutcome {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every(x => sb.has(x));
}

function diff(a: readonly string[], b: readonly string[]): string {
  const sb = new Set(b), sa = new Set(a);
  const only = [...a.filter(x => !sb.has(x)).map(x => `+${x}`), ...b.filter(x => !sa.has(x)).map(x => `-${x}`)];
  return only.join(',');
}

/**
 * COUNTABLE REVIEWED EVALUATION MATERIAL. Derived from what the fixture MEASURABLY contains plus the
 * independently authorized material measured elsewhere -- never from the record's own declared
 * totals, which are cross-checked against this derivation instead.
 */
export function derivedCountableCases(
  m: MechanicalComposition, r: SemanticReviewRecord,
): { clarification: number; crossHazardInteraction: number } {
  return {
    clarification: r.clarification.independentlyAuthorized + m.owedRowIds.length,
    crossHazardInteraction: r.interaction.independentlyAuthorized + m.interactionRowIds.length,
  };
}

/** Gates that apply in EVERY phase. */
export function sharedCompositionGates(m: MechanicalComposition): GateOutcome[] {
  return [
    {
      id: 'F.3',
      label: `CLARIFICATION_NOT_OWED controls present: ${m.notOwedRowIds.length}`,
      passed: m.notOwedRowIds.length > 0,
      detail: '',
    },
    {
      id: 'F.4',
      label: 'interaction-negative controls (2+ present families, NO interaction): '
        + `${m.interactionNegativeControlRowIds.length}`,
      passed: m.interactionNegativeControlRowIds.length > 0,
      detail: '',
    },
    {
      id: 'F.5',
      label: 'the construction policy\'s stated frozen minimums equal REQUIRED_CLASS_MINIMUMS '
        + `(${FROZEN_COMPOSITION_MINIMUMS.clarificationOwed} / `
        + `${FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction})`,
      passed: CANDIDATE_TARGETS.frozenMinimumClarificationOwed
          === FROZEN_COMPOSITION_MINIMUMS.clarificationOwed
        && CANDIDATE_TARGETS.frozenMinimumCrossHazardInteraction
          === FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction,
      detail: `policy ${CANDIDATE_TARGETS.frozenMinimumClarificationOwed}/`
        + `${CANDIDATE_TARGETS.frozenMinimumCrossHazardInteraction}`,
    },
  ];
}

/**
 * PRE_REVIEW_CANDIDATE construction targets. These are the frozen candidate-authoring targets and
 * they are read straight from the frozen policy. They are not lowered, and they are not applied in
 * any other phase because they measure a property of the AUTHORING exercise -- did the author leave
 * enough margin for review to reject material -- which stops being measurable once review has spent
 * that margin.
 */
export function preReviewCandidateGates(m: MechanicalComposition): GateOutcome[] {
  return [
    {
      id: 'F.1',
      label: `CLARIFICATION_OWED candidates ${m.owedRowIds.length} >= target `
        + `${CANDIDATE_TARGETS.clarificationOwed}`,
      passed: m.owedRowIds.length >= CANDIDATE_TARGETS.clarificationOwed,
      detail: '',
    },
    {
      id: 'F.2',
      label: `CROSS_HAZARD_INTERACTION candidates ${m.interactionRowIds.length} >= target `
        + `${CANDIDATE_TARGETS.crossHazardInteraction}`,
      passed: m.interactionRowIds.length >= CANDIDATE_TARGETS.crossHazardInteraction,
      detail: '',
    },
  ];
}

/**
 * POST_HUMAN_REVIEW gates. The reviewed corpus is measured against the FROZEN COHORT MINIMUMS, and
 * the review metadata is reconciled row-by-row against the applied fixture so the accounting cannot
 * assert material the corpus does not contain.
 */
export function postHumanReviewGates(
  m: MechanicalComposition, r: SemanticReviewRecord,
): GateOutcome[] {
  const countable = derivedCountableCases(m, r);
  const c = r.clarification, i = r.interaction;
  const vocabularyBlocked = [
    ...i.authoredThenVocabularyBlockedRowIds, ...i.neverAuthoredVocabularyBlockedRowIds];
  const interactionLedger = i.authoredPresent - i.withdrawnRowIds.length
    - i.authoredThenVocabularyBlockedRowIds.length + i.promotedRowIds.length;

  return [
    {
      id: 'F.1R',
      label: `COUNTABLE CLARIFICATION cases ${countable.clarification} >= frozen minimum `
        + `${FROZEN_COMPOSITION_MINIMUMS.clarificationOwed} `
        + `(margin +${countable.clarification - FROZEN_COMPOSITION_MINIMUMS.clarificationOwed})`,
      passed: countable.clarification >= FROZEN_COMPOSITION_MINIMUMS.clarificationOwed,
      detail: `${c.independentlyAuthorized} authorized + ${m.owedRowIds.length} surviving OWED`,
    },
    {
      id: 'F.2R',
      label: `COUNTABLE CROSS_HAZARD_INTERACTION cases ${countable.crossHazardInteraction} >= frozen `
        + `minimum ${FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction} (margin +`
        + `${countable.crossHazardInteraction - FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction})`,
      passed: countable.crossHazardInteraction >= FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction,
      detail: `${i.independentlyAuthorized} authorized + ${m.interactionRowIds.length} recorded`,
    },
    {
      id: 'F.6',
      label: 'the reviewed surviving-OWED row set matches the applied fixture EXACTLY',
      passed: sameSet(c.survivingOwedRowIds, m.owedRowIds),
      detail: diff(c.survivingOwedRowIds, m.owedRowIds),
    },
    {
      id: 'F.7',
      label: 'the reviewed recorded-interaction row set matches the applied fixture EXACTLY',
      passed: sameSet(i.mechanicallyRecordedRowIds, m.interactionRowIds),
      detail: diff(i.mechanicallyRecordedRowIds, m.interactionRowIds),
    },
    {
      id: 'F.8',
      label: `clarification ledger closes: ${c.authoredOwed} authored - ${c.withdrawnRowIds.length} `
        + `withdrawn = ${c.survivingOwedRowIds.length} surviving`,
      passed: c.authoredOwed - c.withdrawnRowIds.length === c.survivingOwedRowIds.length,
      detail: '',
    },
    {
      id: 'F.9',
      label: `interaction ledger closes: ${i.authoredPresent} authored - ${i.withdrawnRowIds.length} `
        + `withdrawn - ${i.authoredThenVocabularyBlockedRowIds.length} vocabulary-blocked + `
        + `${i.promotedRowIds.length} promoted = ${i.mechanicallyRecordedRowIds.length} recorded`,
      passed: interactionLedger === i.mechanicallyRecordedRowIds.length,
      detail: `ledger ${interactionLedger}`,
    },
    {
      id: 'F.10',
      label: `vocabulary-blocked rows (${vocabularyBlocked.join(', ')}) record NO interaction and `
        + 'are counted NOWHERE',
      passed: vocabularyBlocked.every(id => !m.interactionRowIds.includes(id))
        && vocabularyBlocked.every(id => !i.mechanicallyRecordedRowIds.includes(id))
        && vocabularyBlocked.every(id =>
          r.frozenVocabularyLimitations.some(l => l.rowId === id)),
      detail: '',
    },
    {
      id: 'F.11',
      label: `withdrawn material is genuinely absent from the applied fixture `
        + `(${c.withdrawnRowIds.length} clarifications, ${i.withdrawnRowIds.length} interactions)`,
      passed: c.withdrawnRowIds.every(id => !m.owedRowIds.includes(id))
        && i.withdrawnRowIds.every(id => !m.interactionRowIds.includes(id)),
      detail: '',
    },
    {
      id: 'F.12',
      label: `the owner's declared countable totals (${c.declaredCountableCases} / `
        + `${i.declaredCountableCases}) equal the derived totals (${countable.clarification} / `
        + `${countable.crossHazardInteraction})`,
      passed: c.declaredCountableCases === countable.clarification
        && i.declaredCountableCases === countable.crossHazardInteraction,
      detail: '',
    },
    {
      id: 'F.13',
      label: `every reviewed row is present: ${r.reviewedRowCount} reviewed, ${m.rowIds.length} in corpus`,
      passed: r.reviewedRowCount === m.rowIds.length,
      detail: '',
    },
  ];
}

/** The composition gates that govern a given phase. */
export function compositionGatesForPhase(
  phase: ValidationPhase, m: MechanicalComposition, r: SemanticReviewRecord,
): GateOutcome[] {
  const shared = sharedCompositionGates(m);
  return phase === 'PRE_REVIEW_CANDIDATE'
    ? [...preReviewCandidateGates(m), ...shared]
    : [...postHumanReviewGates(m, r), ...shared];
}
