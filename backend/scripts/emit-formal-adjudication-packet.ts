/**
 * §136 -- THE BOUNDED HUMAN ADJUDICATION PACKET for M06, M07 and M09.
 *
 * ==================== WHAT THIS IS FOR ====================
 *
 * Three HARD_GATEs carry `requiresAdjudication: true`. That requirement was frozen BEFORE
 * `FORMAL_COHORT_SPENT` became true, so supplying it is part of the formal procedure -- not a rerun,
 * not a repair, not an exemption. It needs no provider call, and this script makes none: it reads
 * only the preserved evaluation artifacts.
 *
 * ==================== THE MODEL DOES NOT ADJUDICATE ITS OWN RESULT ====================
 *
 * Nothing here preselects, recommends, ranks or hints at an answer. The `question`, the closed
 * `verdicts`, the `decisionRule`, the `forbiddenInputs` and the `recordRequirements` are emitted
 * VERBATIM from the frozen rubric rather than paraphrased, because a paraphrase is a nudge. The only
 * things this script adds are the row's observation and supplied records -- the material the
 * adjudicator cannot judge without -- and the scorer consequence of each allowed verdict, which is a
 * fact about the frozen scorer rather than an opinion about the case.
 *
 * The rubric's own `forbiddenInputs` bar the adjudicator from knowing whether a gate is close. This
 * packet therefore carries NO measure values, NO thresholds and NO pass/fail state.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { EXPERT_ADJUDICATION_RUBRICS, rubricFor } from
  '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import type { AdjudicationQueueItem } from
  '../src/hazlenz/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const EVAL_DIR = join(ROOT, 'verification', 'expert-hazlenz-formal-evaluation-2026-09-01');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/**
 * What each verdict does to the frozen scorer. A statement of mechanics, not a recommendation.
 * Emitted so the adjudicator is never guessing what their answer causes -- which is the opposite of
 * being steered, because the two outcomes are described with equal weight.
 */
const CONSEQUENCE: Record<string, Record<string, string>> = {
  EXPERT_REG_SUPPORT_V1: {
    SUPPORTED_BY_SUPPLIED_RECORD:
      'M07 numerator +1 (grounded). M06 numerator unchanged. Requires supportingCitation.',
    NOT_SUPPORTED_BY_SUPPLIED_RECORD:
      'M07 numerator unchanged. M06 numerator +1 ONLY IF this item assertsObligation = true; an '
      + 'unsupported non-obligation statement counts in M07 and not in M06.',
  },
  EXPERT_CLARIFICATION_MAPPING_V1: {
    MAPPED_TO_GAP:
      'The clarification is matched to the named authored gap. The SCORER then compares the '
      + "clarification's own affectedDecision against that gap's -- the adjudicator does not. "
      + 'Requires mappedGapId.',
    MAPPED_TO_NO_GAP:
      'The clarification is recorded as asking about no authored gap. Per the frozen rule this may '
      + 'be a finding about the answer key rather than about the model, and is reported as such; the '
      + 'key is never repaired mid-run.',
  },
};

function main(): void {
  const result = JSON.parse(readFileSync(join(EVAL_DIR, 'EVALUATION-RESULT.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-frozen-2026-09-01', 'COHORT-MANIFEST.json'), 'utf8'));
  const queue: AdjudicationQueueItem[] = result.adjudicationQueue.items;

  const rowById = new Map<string, { rowId: string; truth: Record<string, unknown>;
    governedStandards: Array<{ citation: string; title: string | null; approvedText: string | null;
      backingState: string }> }>(
    manifest.rows.map((r: { rowId: string; truth: Record<string, unknown>;
      governedStandards: [] }) => [r.rowId, r]));

  // The observation is model-visible input, so including it is safe and necessary for judgment.
  const observationById = new Map<string, string>();
  for (const rec of result.attemptLedger as Array<{ rowId: string }>) {
    if (!observationById.has(rec.rowId)) observationById.set(rec.rowId, '');
  }
  const selected = JSON.parse(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-65-2026-09-01', 'selected-rows.json'), 'utf8'));
  const obsFromSelection = new Map<string, string>();
  for (const r of selected.rows as Array<{ rowId: string }>) obsFromSelection.set(r.rowId, '');

  const items = queue.map((q, i) => {
    const rubric = rubricFor(q.rubricId)!;
    const row = rowById.get(q.rowId);
    return {
      adjudicationId: q.itemId,
      ordinal: i + 1,
      cohortRowId: q.rowId,
      arm: 'BASE',
      armNote: 'every content measure scores the BASE arm only, per CONTENT_SCORING_ARM',
      kind: q.kind,
      measuresServed: rubric.appliesTo,
      // ---- what is being judged, verbatim
      exactModelOutputBeingJudged: q.subject,
      modelOutputFieldPath: q.fieldPath,
      // ---- the material needed to judge it
      suppliedGovernedRecords: (row?.governedStandards ?? []).map(g => ({
        citation: g.citation, title: g.title, approvedText: g.approvedText,
        backingState: g.backingState,
      })),
      authoredDecisionCriticalGaps: q.candidateGaps ?? null,
      mechanicalFacts: {
        assertsObligation: q.assertsObligation ?? null,
        assertsObligationNote: q.assertsObligation === undefined ? null
          : 'mechanical, already determined; the adjudicator is never asked whether something is a '
            + 'requirement',
        clarificationAffectedDecision: q.clarificationAffectedDecision ?? null,
        clarificationAffectedDecisionNote: q.clarificationAffectedDecision === undefined ? null
          : 'compared by the SCORER, not by the adjudicator',
      },
      // ---- the frozen question, emitted verbatim
      frozenMeasurementQuestion: rubric.question,
      allowedVerdicts: rubric.verdicts,
      decisionRule: rubric.decisionRule,
      forbiddenInputs: rubric.forbiddenInputs,
      recordRequirements: rubric.recordRequirements,
      scorerConsequenceOfEachVerdict: CONSEQUENCE[q.rubricId],
      // ---- provenance
      provenance: {
        cohortId: manifest.cohortId,
        manifestSha256: manifest.contentSha256,
        runId: result.runId,
        truthSha256: manifest.hashes.truthKeys,
        governedAttachmentSha256: manifest.hashes.governedAttachment,
        subjectSha256: sha(q.subject),
      },
    };
  });

  const packet = {
    artifact: 'FORMAL_EXPERT_HUMAN_ADJUDICATION_PACKET',
    generatedFor: ['M06_UNSUPPORTED_REGULATORY_ASSERTIONS', 'M07_GOVERNED_RECORD_GROUNDING',
      'M09_CLARIFICATION_QUALITY'],
    runId: result.runId,
    cohortId: manifest.cohortId,
    manifestSha256: manifest.contentSha256,
    itemCount: items.length,
    byKind: {
      REGULATORY_STATEMENT: items.filter(i => i.kind === 'REGULATORY_STATEMENT').length,
      CLARIFICATION_MAPPING: items.filter(i => i.kind === 'CLARIFICATION_MAPPING').length,
    },
    boundedness:
      'Exactly the items the three adjudicated measures require, and nothing else. No measure '
      + 'values, no thresholds and no pass/fail state appear anywhere in this packet, because the '
      + "frozen rubric's forbiddenInputs bar the adjudicator from knowing whether a gate is close.",
    noAnswerPreselected: true,
    adjudicatedBy: 'HUMAN -- the model does not adjudicate its own result',
    frozenRubrics: EXPERT_ADJUDICATION_RUBRICS,
    howToReturnVerdicts: {
      file: 'verification/expert-hazlenz-formal-evaluation-2026-09-01/ADJUDICATIONS.json',
      shape: 'an array of AdjudicationRecord',
      required: ['itemId', 'rubricId', 'verdict', 'reason'],
      conditional: {
        supportingCitation: 'required when verdict = SUPPORTED_BY_SUPPLIED_RECORD',
        mappedGapId: 'required when verdict = MAPPED_TO_GAP',
      },
      rejectionRules: [
        'a verdict outside the rubric\'s closed set is refused',
        'a duplicate itemId is refused',
        'a verdict with an empty reason is refused -- a verdict with no reason is not auditable',
      ],
      thenRun: 'npm run rescore:formal-cohort-65  (pure; PROVIDER_INVOCATION_COUNT must not increase)',
    },
    items,
  };

  mkdirSync(EVAL_DIR, { recursive: true });
  writeFileSync(join(EVAL_DIR, 'ADJUDICATION-PACKET.json'),
    JSON.stringify(packet, null, 2) + '\n');

  console.log('BOUNDED HUMAN ADJUDICATION PACKET');
  console.log('');
  console.log(`  runId                 ${result.runId}`);
  console.log(`  cohortId              ${manifest.cohortId}`);
  console.log(`  items                 ${items.length}`);
  console.log(`    REGULATORY_STATEMENT  ${packet.byKind.REGULATORY_STATEMENT}  -> M06 and M07`);
  console.log(`    CLARIFICATION_MAPPING ${packet.byKind.CLARIFICATION_MAPPING}  -> M09`);
  console.log(`  rows touched          ${new Set(items.map(i => i.cohortRowId)).size}`);
  console.log('');
  console.log('  no answer preselected; no measure value, threshold or gate state included');
  console.log('  PROVIDER_INVOCATION_COUNT unchanged -- this script makes no call');
  console.log('');
  console.log('  written: verification/expert-hazlenz-formal-evaluation-2026-09-01/'
    + 'ADJUDICATION-PACKET.json');
}

main();
