/**
 * §129 -- REGRESSION on the semantic-augmentation VERIFICATION PHASE MODEL.
 *
 * The repair that added `POST_HUMAN_REVIEW` is only honest if `PRE_REVIEW_CANDIDATE` still refuses a
 * candidate corpus that misses the frozen candidate-authoring targets. This file proves exactly that,
 * and it proves it with SYNTHETIC compositions rather than by mutating the reviewed corpus back to
 * candidate form -- the reviewed truth is not touched by any assertion here.
 *
 * It drives the SAME gate functions the validator drives. It does not re-implement the thresholds,
 * so it cannot pass while the validator's real gates say something different.
 *
 * No provider. No reserved material. No cohort spend. No database. Nothing is written.
 */

import {
  CANDIDATE_TARGETS, SEMANTIC_AUGMENTATION_POLICY_VERSION,
} from './lib/expert-semantic-augmentation-construction-policy';
import {
  CORPUS_LIFECYCLE_STATE, FROZEN_COMPOSITION_MINIMUMS, INDEPENDENTLY_AUTHORIZED_COMPOSITION,
  SEAL_STATUS_BY_PHASE, SEMANTIC_AUGMENTATION_PHASE_MODEL_VERSION,
  SEMANTIC_AUGMENTATION_REVIEW_RECORD, VALIDATION_PHASES, compositionGatesForPhase,
  derivedCountableCases, resolveValidationPhase,
  type MechanicalComposition, type SemanticReviewRecord,
} from './lib/expert-semantic-augmentation-review-record';
import { SEMANTIC_ROWS } from '../src/safescope-v2/expert-hazlenz/fixtures/semantic-augmentation-v1';

let passed = 0, failed = 0;
function assert(cond: boolean, label: string, detail = ''): void {
  if (cond) { passed += 1; console.log(`  PASS  ${label}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

/** Build a synthetic composition of the requested shape. Row ids are Z-prefixed and touch nothing. */
function synthetic(owed: number, inter: number, notOwed = 5, negControls = 5): MechanicalComposition {
  const id = (p: string, n: number) => Array.from({ length: n }, (_, i) => `Z-${p}-${i + 1}`);
  return {
    rowIds: id('ROW', owed + notOwed),
    owedRowIds: id('OWED', owed),
    notOwedRowIds: id('NOTOWED', notOwed),
    interactionRowIds: id('INTER', inter),
    interactionNegativeControlRowIds: id('NEG', negControls),
  };
}

function gate(phase: typeof VALIDATION_PHASES[number], m: MechanicalComposition,
  r: SemanticReviewRecord, id: string): boolean {
  const g = compositionGatesForPhase(phase, m, r).find(x => x.id === id);
  if (!g) throw new Error(`gate ${id} does not exist in phase ${phase}`);
  return g.passed;
}

function has(phase: typeof VALIDATION_PHASES[number], id: string): boolean {
  return compositionGatesForPhase(phase, synthetic(30, 20), SEMANTIC_AUGMENTATION_REVIEW_RECORD)
    .some(g => g.id === id);
}

function main(): void {
  console.log('SEMANTIC AUGMENTATION PHASE CONTRACT REGRESSION');
  console.log(`policy ${SEMANTIC_AUGMENTATION_POLICY_VERSION}`);
  console.log(`phase model ${SEMANTIC_AUGMENTATION_PHASE_MODEL_VERSION}\n`);

  const R = SEMANTIC_AUGMENTATION_REVIEW_RECORD;

  console.log('P. THE FROZEN CANDIDATE-AUTHORING TARGETS ARE UNCHANGED\n');
  assert(CANDIDATE_TARGETS.clarificationOwed === 26,
    'P.1 CANDIDATE_TARGETS.clarificationOwed is still 26',
    String(CANDIDATE_TARGETS.clarificationOwed));
  assert(CANDIDATE_TARGETS.crossHazardInteraction === 14,
    'P.2 CANDIDATE_TARGETS.crossHazardInteraction is still 14',
    String(CANDIDATE_TARGETS.crossHazardInteraction));
  assert(CANDIDATE_TARGETS.clarificationOwed > CANDIDATE_TARGETS.frozenMinimumClarificationOwed
    && CANDIDATE_TARGETS.crossHazardInteraction
      > CANDIDATE_TARGETS.frozenMinimumCrossHazardInteraction,
  'P.3 the candidate targets still sit ABOVE the frozen minimums -- the rejection margin exists');

  console.log('\nQ. PRE_REVIEW_CANDIDATE STILL ENFORCES 26 AND 14\n');
  assert(gate('PRE_REVIEW_CANDIDATE', synthetic(26, 14), R, 'F.1')
    && gate('PRE_REVIEW_CANDIDATE', synthetic(26, 14), R, 'F.2'),
  'Q.1 a candidate corpus at exactly 26 / 14 PASSES F.1 and F.2');
  assert(!gate('PRE_REVIEW_CANDIDATE', synthetic(25, 14), R, 'F.1'),
    'Q.2 a candidate corpus at 25 clarifications FAILS F.1 -- the target was not lowered');
  assert(!gate('PRE_REVIEW_CANDIDATE', synthetic(26, 13), R, 'F.2'),
    'Q.3 a candidate corpus at 13 interactions FAILS F.2 -- the target was not lowered');
  assert(!gate('PRE_REVIEW_CANDIDATE', synthetic(22, 12), R, 'F.1')
    && !gate('PRE_REVIEW_CANDIDATE', synthetic(22, 12), R, 'F.2'),
  'Q.4 the POST-REVIEW shape (22 / 12) still FAILS the candidate contract, as it must');
  assert(!gate('PRE_REVIEW_CANDIDATE', synthetic(20, 10), R, 'F.1')
    && !gate('PRE_REVIEW_CANDIDATE', synthetic(20, 10), R, 'F.2'),
  'Q.5 merely meeting the frozen MINIMUMS does not satisfy the candidate TARGETS');

  console.log('\nR. THE PHASES DIFFER ONLY IN THE CONSTRUCTION TARGETS\n');
  assert(has('PRE_REVIEW_CANDIDATE', 'F.1') && has('PRE_REVIEW_CANDIDATE', 'F.2'),
    'R.1 F.1 and F.2 exist ONLY in PRE_REVIEW_CANDIDATE');
  assert(!has('POST_HUMAN_REVIEW', 'F.1') && !has('POST_HUMAN_REVIEW', 'F.2'),
    'R.2 POST_HUMAN_REVIEW does not evaluate the pre-review authoring targets');
  assert(!has('PRE_REVIEW_CANDIDATE', 'F.1R') && !has('PRE_REVIEW_CANDIDATE', 'F.2R'),
    'R.3 the reviewed-count gates exist ONLY in POST_HUMAN_REVIEW');
  for (const shared of ['F.3', 'F.4', 'F.5']) {
    assert(has('PRE_REVIEW_CANDIDATE', shared) && has('POST_HUMAN_REVIEW', shared),
      `R.4 ${shared} is enforced in BOTH phases -- POST_HUMAN_REVIEW is not a weaker validator`);
  }
  const preIds = compositionGatesForPhase('PRE_REVIEW_CANDIDATE', synthetic(30, 20), R).map(g => g.id);
  const postIds = compositionGatesForPhase('POST_HUMAN_REVIEW', synthetic(30, 20), R).map(g => g.id);
  assert(postIds.length > preIds.length,
    `R.5 POST_HUMAN_REVIEW runs MORE composition gates than PRE_REVIEW_CANDIDATE `
    + `(${postIds.length} vs ${preIds.length})`);

  console.log('\nS. POST_HUMAN_REVIEW ENFORCES THE FROZEN MINIMUMS, NOT A LOWER NUMBER\n');
  assert(FROZEN_COMPOSITION_MINIMUMS.clarificationOwed === 20
    && FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction === 10,
  'S.1 the frozen minimums are 20 and 10, read from REQUIRED_CLASS_MINIMUMS');
  const auth = INDEPENDENTLY_AUTHORIZED_COMPOSITION;
  // Countable = authorized + surviving. 20 - 3 = 17 surviving is the floor; 16 must fail.
  assert(gate('POST_HUMAN_REVIEW', synthetic(20 - auth.clarificationOwed, 12), R, 'F.1R'),
    'S.2 countable clarification exactly at the frozen minimum PASSES F.1R');
  assert(!gate('POST_HUMAN_REVIEW', synthetic(20 - auth.clarificationOwed - 1, 12), R, 'F.1R'),
    'S.3 one countable clarification BELOW the frozen minimum FAILS F.1R');
  assert(gate('POST_HUMAN_REVIEW', synthetic(22, 10 - auth.crossHazardInteraction), R, 'F.2R'),
    'S.4 countable interactions exactly at the frozen minimum PASSES F.2R');
  assert(!gate('POST_HUMAN_REVIEW', synthetic(22, 10 - auth.crossHazardInteraction - 1), R, 'F.2R'),
    'S.5 one countable interaction BELOW the frozen minimum FAILS F.2R');

  console.log('\nT. REVIEW METADATA CANNOT ASSERT MATERIAL THE CORPUS DOES NOT CONTAIN\n');
  const rows = SEMANTIC_ROWS.map(r => r.row);
  const real: MechanicalComposition = {
    rowIds: rows.map(r => r.source.rowId),
    owedRowIds: rows.filter(r => r.truth.decisionCriticalGaps.length > 0).map(r => r.source.rowId),
    notOwedRowIds: rows.filter(r => r.truth.decisionCriticalGaps.length === 0).map(r => r.source.rowId),
    interactionRowIds: rows.filter(r => r.truth.recordedInteractions.length > 0)
      .map(r => r.source.rowId),
    interactionNegativeControlRowIds: rows.filter(r =>
      r.truth.recordedInteractions.length === 0 && r.truth.presentHazardFamilies.length >= 2)
      .map(r => r.source.rowId),
  };
  assert(gate('POST_HUMAN_REVIEW', real, R, 'F.6') && gate('POST_HUMAN_REVIEW', real, R, 'F.7'),
    'T.1 the real reviewed corpus reconciles row-for-row with the review record');
  const inflated: SemanticReviewRecord = {
    ...R,
    clarification: {
      ...R.clarification,
      survivingOwedRowIds: [...R.clarification.survivingOwedRowIds, 'SEM-20'],
    },
  };
  assert(!gate('POST_HUMAN_REVIEW', real, inflated, 'F.6'),
    'T.2 a review record claiming one MORE surviving OWED row than the fixture holds FAILS F.6');
  const inflatedInter: SemanticReviewRecord = {
    ...R,
    interaction: {
      ...R.interaction,
      mechanicallyRecordedRowIds: [...R.interaction.mechanicallyRecordedRowIds, 'SEM-09'],
    },
  };
  assert(!gate('POST_HUMAN_REVIEW', real, inflatedInter, 'F.7'),
    'T.3 counting a vocabulary-blocked row as a recorded interaction FAILS F.7');
  assert(!gate('POST_HUMAN_REVIEW', real, inflatedInter, 'F.10'),
    'T.4 the same fabrication also FAILS F.10 -- blocked rows are counted nowhere');
  const brokenLedger: SemanticReviewRecord = {
    ...R, clarification: { ...R.clarification, authoredOwed: 30 },
  };
  assert(!gate('POST_HUMAN_REVIEW', real, brokenLedger, 'F.8'),
    'T.5 a clarification ledger that does not close FAILS F.8');
  const driftedTotal: SemanticReviewRecord = {
    ...R, interaction: { ...R.interaction, declaredCountableCases: 19 },
  };
  assert(!gate('POST_HUMAN_REVIEW', real, driftedTotal, 'F.12'),
    'T.6 a declared countable total that does not equal the derived total FAILS F.12');

  console.log('\nU. PHASE IS EXPLICIT AND AUDITABLE, NEVER INFERRED FROM COUNTS\n');
  assert(resolveValidationPhase(['--phase=PRE_REVIEW_CANDIDATE']).phase === 'PRE_REVIEW_CANDIDATE'
    && resolveValidationPhase(['--phase=PRE_REVIEW_CANDIDATE']).source === 'EXPLICIT_ARGUMENT',
  'U.1 an explicit --phase argument selects the phase and is reported as EXPLICIT_ARGUMENT');
  assert(resolveValidationPhase(['--phase', 'POST_HUMAN_REVIEW']).phase === 'POST_HUMAN_REVIEW',
    'U.2 the two-token --phase form is accepted');
  const bare = resolveValidationPhase([]);
  assert(bare.phase === CORPUS_LIFECYCLE_STATE.governingPhase
    && bare.source === 'DECLARED_CORPUS_LIFECYCLE_STATE',
  'U.3 with no argument the DECLARED corpus lifecycle state governs, and says so');
  let threw = false;
  try { resolveValidationPhase(['--phase=WHATEVER']); } catch { threw = true; }
  assert(threw, 'U.4 an unrecognised phase is a hard error, never a silent default');
  assert(CORPUS_LIFECYCLE_STATE.governingPhase === 'POST_HUMAN_REVIEW'
    && CORPUS_LIFECYCLE_STATE.humanReviewComplete && CORPUS_LIFECYCLE_STATE.adjudicationsApplied,
  'U.5 the declared lifecycle state records a completed, applied human review');
  assert(CORPUS_LIFECYCLE_STATE.formalEvaluationSpent === false,
    'U.6 the declared lifecycle state records the formal evaluation as UNSPENT');

  console.log('\nV. SEAL STATUS TRACKS THE PHASE AND CLAIMS NOTHING MORE\n');
  assert(SEAL_STATUS_BY_PHASE.PRE_REVIEW_CANDIDATE.startsWith('CANDIDATE'),
    'V.1 the pre-review status still reads CANDIDATE -- AWAITING ... REVIEW');
  assert(SEAL_STATUS_BY_PHASE.POST_HUMAN_REVIEW
    === 'REVIEWED -- HUMAN ADJUDICATION COMPLETE, SEALED, FORMAL EVALUATION UNSPENT',
  'V.2 the post-review status states review completion and an UNSPENT formal evaluation');
  const post = SEAL_STATUS_BY_PHASE.POST_HUMAN_REVIEW.toLowerCase();
  assert(!/authoriz|production|customer|passed|validated|approved for/.test(post),
    'V.3 the post-review status implies no authorization, activation or passing evaluation');

  console.log('\nW. LIMITATIONS ARE CARRIED, NOT REPAIRED\n');
  for (const id of ['SEM-09', 'SEM-27', 'SEM-35']) {
    assert(R.frozenVocabularyLimitations.some(l => l.rowId === id),
      `W.1 ${id} is carried as an unrepaired frozen-vocabulary limitation`);
  }
  assert(R.frozenVocabularyLimitations.length === 3,
    'W.2 exactly three limitations are carried -- none invented, none dropped',
    String(R.frozenVocabularyLimitations.length));
  assert(R.contractConsequentialEffects.some(e => e.rowId === 'SEM-08'),
    'W.3 the SEM-08 life-critical overlay adjustment is recorded as contract-consequential');

  const c = derivedCountableCases(real, R);
  console.log(`\nCOUNTABLE REVIEWED CASES  clarification ${c.clarification} `
    + `(min ${FROZEN_COMPOSITION_MINIMUMS.clarificationOwed}), interaction `
    + `${c.crossHazardInteraction} (min ${FROZEN_COMPOSITION_MINIMUMS.crossHazardInteraction})`);
  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('PROVIDER_INVOCATION_COUNT = 0   RESERVED_MATERIAL_OPENED = FALSE   '
    + 'FORMAL_COHORT_SPENT = FALSE   P4_PRESPEND_AUTHORIZATION = FALSE');
  if (failed > 0) process.exit(1);
}

main();
