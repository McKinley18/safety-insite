/**
 * §188 -- BUILD THE HUMAN ADJUDICATION BALLOT. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY THIS SCRIPT AND NOT A VERDICT ====================
 *
 * The §187A preregistration, written before the first provider call and unchanged since, says of
 * the strict semantic axes:
 *
 *   "NOT COMPUTED BY THIS SCRIPT. Owed-fact preservation, clarification target/sufficiency,
 *    nearby-property substitution, adjacent containment, challenge correctness/relevance/
 *    reviewability are human semantic judgements. Every execution is exported verbatim for
 *    independent adjudication. THIS MODEL DOES NOT DECIDE THEM."
 *
 * So this script assembles the QUESTION, in a form a reviewer can answer, and leaves every verdict
 * slot `null`. It does not preselect, recommend, rank or hint at an answer. Where explanatory
 * context is carried it is either verbatim frozen text or a mechanically-determined fact, and it is
 * labelled as such.
 *
 * Everything below is read from the frozen §187 artifacts and re-hashed from their persisted
 * content, so a ballot built from drifted evidence fails rather than silently mis-attributing a
 * human verdict to text no human read.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { loadFrozenRows } from './probe-balanced-clarification-hosted-2026-09-05';

const ROOT = join(__dirname, '..', '..');
const EVID187 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

const PREREG = readJson(join(EVID187, 'PREREGISTRATION.json'));
const RECOMPUTE = readJson(join(EVID187, 'ADMISSION-RECOMPUTE.json'));
const STIMULI = readJson(join(EVID187, 'FIRST-PASS-STIMULI.json'));

// ---- integrity BEFORE the ballot is built.
const PREREG_SHA = shaFile(join(EVID187, 'PREREGISTRATION.json'));
if (PREREG_SHA !== '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82') {
  throw new Error(`ABORT: §187 preregistration drifted (${PREREG_SHA})`);
}

const rows = new Map(loadFrozenRows().map(r => [r.id, r]));
for (const fr of PREREG.frozenRows) {
  const row = rows.get(fr.id);
  if (!row) throw new Error(`ABORT: frozen row ${fr.id} not found`);
  if (sha(row.text) !== fr.textSha256) throw new Error(`ABORT: row ${fr.id} text drifted`);
}

const executions = readFileSync(join(EVID187, 'RESUMED-VERIFIER-EXECUTIONS.jsonl'), 'utf8')
  .trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
  .filter((r: any) => r.behavioralExecution === true);
if (executions.length !== 15) throw new Error(`ABORT: expected 15 executions, got ${executions.length}`);

/**
 * The six strict semantic axes every execution carries, plus the four a challenge-bearing execution
 * additionally carries. Ten in total, exactly as the §187B review packet states, and named exactly
 * as the preregistration's STRICT_SEMANTIC scoring rule names them.
 */
const BASE_AXES = [
  {
    axis: 'OWED_FACT_PRESERVED',
    question: 'Did this execution leave the exact supplied owed fact unresolved and intact, rather '
      + 'than treating it as answered, unnecessary or covered?',
  },
  {
    axis: 'FACTKEY_BINDING_CORRECT',
    question: 'Where a key was named, did it name the fact the reasoning was actually about? '
      + '(Naming the correct key is necessary, not sufficient: see NO_NEARBY_PROPERTY_SUBSTITUTION.)',
  },
  {
    axis: 'CLARIFICATION_TARGET_CORRECT',
    question: 'Does the clarification this execution relied on -- whether the first pass\'s or one '
      + 'it proposed -- target the exact owed fact rather than an adjacent topic?',
  },
  {
    axis: 'CLARIFICATION_EVIDENCE_SUFFICIENT',
    question: 'Would an answer to that clarification, as written, actually settle the owed fact -- '
      + 'or would it establish something short of it?',
  },
  {
    axis: 'NO_NEARBY_PROPERTY_SUBSTITUTION',
    question: 'Did the reasoning stay on the owed property, or did it substitute a nearby property '
      + 'of the same component (presence for securement, inspection for function, and so on)?',
  },
  {
    axis: 'ADJACENT_FACT_CONTAINED',
    question: 'Where the execution reasoned about an adjacent fact, did it keep that reasoning '
      + 'separate from the owed fact rather than letting it discharge the owed fact?',
  },
] as const;

const CHALLENGE_AXES = [
  {
    axis: 'CHALLENGE_CORRECTNESS',
    question: 'Is the challenge substantively right that this fact should not have been raised?',
  },
  {
    axis: 'CHALLENGE_EVIDENCE_RELEVANCE',
    question: 'Does the evidence the challenge cites bear on the property the owed fact is about?',
  },
  {
    axis: 'CHALLENGE_TARGET_RELEVANCE',
    question: 'Does the challenge address the owed fact as stated, or a different reading of it?',
  },
  {
    axis: 'CHALLENGE_REVIEWABILITY',
    question: 'Can a reviewer determine the asserted evidence-to-fact relationship without '
      + 'reconstructing a missing material premise? Disagreeing with the conclusion does not make '
      + 'the reason unreviewable; a representation failure is when the reviewer must infer what '
      + 'property the cited evidence supposedly establishes.',
    allowedOutcomes: ['REVIEWABLE', 'REPRESENTATION_FAILURE'],
  },
] as const;

/**
 * The four HR-04 categories, copied VERBATIM from the §188 product-owner authorization. They are
 * carried rather than paraphrased because the authorization says: "Use the exact frozen §187
 * adjudication definitions. Do not invent replacement categories."
 */
const HR04_CATEGORIES = [
  { category: 'A', text: 'correctly established that the owed fact was already resolved' },
  { category: 'B', text: 'correctly preserved the owed fact unresolved despite declining a clarification' },
  { category: 'C', text: 'relied on adjacent evidence / a different property and therefore falsely treated the exact owed fact as unnecessary or resolved' },
  { category: 'D', text: 'produced another semantically distinct outcome defined by the frozen instrument' },
] as const;

const recomputeByKey = new Map<string, any>(
  RECOMPUTE.executions.map((e: any) => [`${e.rowId}#${e.replicate}`, e]));
const stimByRow = new Map<string, any>(STIMULI.stimuli.map((s: any) => [s.rowId, s]));

const items = executions
  .slice()
  .sort((a: any, b: any) => a.sequencePosition - b.sequencePosition)
  .map((r: any) => {
    const key = `${r.rowId}#${r.replicateNumber}`;
    const rec = recomputeByKey.get(key);
    if (!rec) throw new Error(`ABORT: no admission recompute for ${key}`);
    const stim = stimByRow.get(r.rowId);
    const supplied = PREREG.suppliedOwedFacts[r.rowId];
    if (sha(JSON.stringify(supplied.payload)) !== supplied.sha256) {
      throw new Error(`ABORT: supplied owed fact for ${r.rowId} drifted`);
    }
    const challengeBearing = (r.declarationModes ?? []).includes('CHALLENGE_FACT_VALIDITY');

    return {
      adjudicationId: `188-${r.rowId}-R${r.replicateNumber}`,
      rowId: r.rowId,
      replicate: r.replicateNumber,
      sequencePosition: r.sequencePosition,
      block: r.block,

      // ---------------- what the reviewer needs in order to judge
      observation: rows.get(r.rowId)!.text,
      observationSha256: sha(rows.get(r.rowId)!.text),
      suppliedOwedFact: supplied.payload,
      suppliedOwedFactSha256: supplied.sha256,
      firstPassClarificationsAsked: stim.firstPass.clarifications
        .map((q: any) => ({ affectedDecision: q.affectedDecision, question: q.question })),
      firstPassAskedNothing: stim.firstPass.clarifications.length === 0,
      firstPassStimulusSha256: stim.firstPassSha256,

      // ---------------- the exact model output being judged, verbatim
      providerOutput: {
        verdict: r.verdict,
        clarificationSourceMode: r.parsed?.clarificationSourceMode ?? null,
        bindingFactKey: r.bindingFactKey,
        proposedClarification: r.proposedClarification,
        nominatedFact: r.nominatedFact ?? null,
        owedFactDeclarations: r.owedFactDeclarations,
        rationale: r.rationale,
        challengeReasons: r.challengeReasons ?? [],
      },

      // ---------------- mechanically determined, stated so it is not re-derived per reviewer
      mechanical: {
        correctedAdmission: rec.correctedAdmission.admitted ? 'ADMITTED' : 'REFUSED',
        correctedAdmissionCodes: rec.correctedAdmission.codes,
        wrongKeyDeclared: r.wrongKeyDeclared === true,
        settlementPerformed: false,
        settlementBasis: 'structural: no execution performs a status transition; a challenge is an '
          + 'arbitration request typed settles:false',
        note: rec.correctedAdmission.admitted
          ? null
          : 'This output was REFUSED WHOLE for shape. No owed fact was settled or removed. The '
            + 'refusal is a contract-validity fact and is recorded separately from every semantic '
            + 'axis below; TARGET_SELECTION_WRONG = FALSE for this observation.',
      },

      // ---------------- the ballot itself. Every slot null.
      adjudication: {
        status: 'PENDING_HUMAN_ADJUDICATION',
        axes: Object.fromEntries([
          ...BASE_AXES.map(a => [a.axis, {
            question: a.question,
            allowedOutcomes: ['PASS', 'FAIL', 'NOT_APPLICABLE'],
            finding: null,
            reviewerNote: null,
          }]),
          ...(challengeBearing ? CHALLENGE_AXES.map(a => [a.axis, {
            question: a.question,
            allowedOutcomes: (a as any).allowedOutcomes ?? ['PASS', 'FAIL', 'NOT_APPLICABLE'],
            finding: null,
            reviewerNote: null,
          }]) : []),
        ]),
        STRICT_SEMANTIC_VERDICT: {
          question: 'Taking the axes together: does this execution count toward strict owed-fact '
            + 'preservation in the preregistered ">= 12/15" numerator?',
          allowedOutcomes: ['PRESERVED', 'NOT_PRESERVED'],
          outcomeVocabularyProvenance: 'derived from the preregistered gate\'s own wording, ">= '
            + '12/15 strict owed-fact preservation". No new category is introduced.',
          scorerConsequence: {
            PRESERVED: 'counts 1 toward the 15-execution numerator and toward this row\'s >= 2/3 floor',
            NOT_PRESERVED: 'counts 0 toward both',
          },
          verdict: null,
          reviewerNote: null,
        },
        ...(r.rowId === 'HR-04' ? {
          HR04_CATEGORY: {
            question: 'Classify this replicate under the preregistered categories.',
            categories: HR04_CATEGORIES,
            categoryProvenance: 'copied verbatim from the §188 product-owner authorization',
            verdict: null,
            reviewerNote: null,
          },
        } : {}),
      },

      provenance: {
        preregistrationSha256: PREREG_SHA,
        verifierInstructionVersion: r.verifierInstructionVersion,
        verifierInstructionSha256: r.verifierInstructionSha256,
        verifierSchemaSha256: r.verifierSchemaSha256,
        firstPassPromptVersion: r.firstPassPromptVersion,
        userPromptSha256: r.userPromptSha256,
        model: r.respondedModel ?? r.model,
      },
    };
  });

const doc = {
  artifact: 'SECTION_188_HUMAN_ADJUDICATION_LEDGER',
  date: '2026-09-06',
  status: 'PENDING_HUMAN_ADJUDICATION',
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,

  whyEveryVerdictIsNull:
    'The §187A preregistration, frozen before the first provider call, assigns every strict '
    + 'semantic axis to human judgement and states "This model does not decide them." The §187B '
    + 'review packet repeats it: "This model did not supply a verdict on any of the ten axes and '
    + 'must not." This ledger is therefore the question, not the answer. Absence of adjudication '
    + 'is not adjudication, and a null verdict is neither a pass nor a failure.',

  howToComplete:
    'Fill each axis `finding`, each `STRICT_SEMANTIC_VERDICT.verdict`, and the three HR-04 '
    + '`HR04_CATEGORY.verdict` slots. Set `verdictProvenance` and, if an AI assistant helped form '
    + 'any verdict, set aiAssistance.AI_ASSISTED_STRICT_ADJUDICATION = true and '
    + 'FULLY_INDEPENDENT_HUMAN_ADJUDICATION = false, naming the assistant. Then run '
    + 'backend/scripts/score-188-strict-semantic-gate-2026-09-06.ts, which refuses to emit a gate '
    + 'result while any slot is null.',

  verdictProvenance: null,
  aiAssistance: {
    AI_ASSISTED_STRICT_ADJUDICATION: null,
    FULLY_INDEPENDENT_HUMAN_ADJUDICATION: null,
    assistantIdentity: null,
    note: 'The §187B packet records that these flags apply if GPT-5.6 Sol assists the product '
      + 'owner. The disclosure must travel with every figure derived from these verdicts.',
  },

  frozenGate: {
    semantic: PREREG.successGates.semantic,
    perRowFloor: PREREG.successGates.perRowFloor,
    hr04: PREREG.successGates.hr04,
    reviewability: PREREG.successGates.reviewability,
    refusedRowTreatment: {
      preregistrationText: PREREG.scoringRules.REJECTED_IS_NOT_SILENCE,
      readingApplied:
        'The preregistration does NOT say a refused observation leaves the semantic denominator. '
        + 'It says a refused observation "is recorded as CONTRACT_FAILURE and never scored as '
        + 'behaviour" -- a rule about the NUMERATOR, not the denominator. The gate\'s denominator '
        + 'is written literally as 15. HR-08#2 and HR-01#3 therefore REMAIN in the denominator and '
        + 'cannot be credited to the numerator on the strength of behaviour that was refused.',
      consequence:
        'The maximum attainable strict semantic score is 13/15 against a >= 12/15 threshold, and '
        + 'HR-01 and HR-08 each have at most 2/3 against a >= 2/3 floor. The gate is still '
        + 'attainable; it has no slack on those two rows.',
    },
  },

  axisSeparation:
    'TOPIC / FACTKEY TARGETING, EVIDENCE SUFFICIENCY, STATE / CONTRACT VALIDITY and SETTLEMENT '
    + 'AUTHORITY are four separate questions and must not be collapsed. Both refused executions '
    + 'named the CORRECT supplied key, so TARGET_SELECTION_WRONG = FALSE while '
    + 'VERIFIER_RESPONSE_CONTRACT_VALID = FALSE. Correct factKey naming does not excuse reasoning '
    + 'about a different property of that fact.',

  executionCount: items.length,
  adjudicatedCount: 0,
  items,
};

writeFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), `${JSON.stringify(doc, null, 2)}\n`);
console.log(`ballot written: ${items.length} executions, ${items.filter(i => i.rowId === 'HR-04').length} carrying an HR-04 category slot`);
console.log(`challenge-bearing: ${items.filter(i => 'CHALLENGE_REVIEWABILITY' in i.adjudication.axes).length}`);
console.log(`refused (corrected admission): ${items.filter(i => i.mechanical.correctedAdmission === 'REFUSED').map(i => i.adjudicationId).join(', ')}`);
console.log('every verdict slot is null. PROVIDER_CALLS = 0  DATABASE_OPERATIONS = 0');
