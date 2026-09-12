/**
 * §169 EXPERT HAZLENZ -- RECORD THE 12 PRODUCT-OWNER BINDING DISPOSITIONS. ZERO PROVIDER CALLS.
 *
 * The dispositions below were RETURNED BY THE PRODUCT OWNER and are transcribed verbatim. No model
 * assigned any of them, and this script cannot: `assertNoModelAssignment()` refuses to run if any
 * pair is missing an explicitly recorded human verdict.
 *
 * ==================== WHAT THE COUNTS MAY AND MAY NOT BE ====================
 *
 * PHASE 6 permits counts only once every pair carries a disposition. They are labelled
 * `HUMAN_VALIDATED_BOUNDED_DEVELOPMENT_COUNTS` and are EXACT COUNTS over 12 draws on 2 rows. They
 * are not production accuracy rates and may not be converted into any.
 *
 * ==================== THE DISTINCTION THAT DECIDES THE ARCHITECTURE READING ====================
 *
 * Question A -- does the clarification actually ask for the supplied owed fact -- is **Yes on all
 * twelve**. The four `BINDING_PARTIALLY_CORRECT` verdicts sit on question B: whether an answer would
 * RESOLVE the fact.
 *
 * So the closed-set binding mechanism selected the right target 12/12, and zero bindings were
 * incorrect. What the human review found is a different defect class living one level down, in how
 * much the question demands of the answer. Those are separate findings and are counted separately.
 *
 * ==================== AND ONE SEPARATION THE OWNER MADE EXPLICIT ====================
 *
 * VC-08-2 and VC-08-3 are `BINDING_SEMANTICALLY_CORRECT` **and**
 * `COMPOUND_QUESTION_REPRESENTATION = UNACCEPTABLE` at the same time. A semantic binding is not
 * downgraded because the customer-facing packaging is wrong. The two axes are recorded side by side
 * and neither is netted against the other.
 */

import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const OUT = join(V, 'expert-hazlenz-verifier-v3-human-binding-review-2026-09-04');

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

export const ALLOWED_DISPOSITIONS = [
  'BINDING_SEMANTICALLY_CORRECT', 'BINDING_PARTIALLY_CORRECT',
  'BINDING_INCORRECT', 'BINDING_AMBIGUOUS',
] as const;
type Disposition = (typeof ALLOWED_DISPOSITIONS)[number];

interface OwnerDisposition {
  pairId: string;
  rowId: string;
  A_asksOwedFact: string;
  B_answerResolvesIt: string;
  C_affectedDecision: string;
  D_unsupportedAssumption: string;
  E_distortionOrNarrowing: string;
  F_independentlyAnswerableIfCompound: string;
  disposition: Disposition;
}

/** Transcribed verbatim from the product owner's returned table, 2026-09-04. */
const OWNER_DISPOSITIONS: readonly OwnerDisposition[] = [
  { pairId: 'VC-08-1', rowId: 'HS-A1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Partially',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'Yes, minor',
    E_distortionOrNarrowing: 'Yes, minor', F_independentlyAnswerableIfCompound: 'N/A',
    disposition: 'BINDING_PARTIALLY_CORRECT' },
  { pairId: 'VC-08-2', rowId: 'HS-A1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No material assumption',
    E_distortionOrNarrowing: 'No material distortion', F_independentlyAnswerableIfCompound: 'Yes',
    disposition: 'BINDING_SEMANTICALLY_CORRECT' },
  { pairId: 'VC-08-3', rowId: 'HS-A1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No',
    E_distortionOrNarrowing: 'No', F_independentlyAnswerableIfCompound: 'Yes',
    disposition: 'BINDING_SEMANTICALLY_CORRECT' },
  { pairId: 'VC-08-4', rowId: 'HS-A1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Partially',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'Yes, minor',
    E_distortionOrNarrowing: 'Yes, minor', F_independentlyAnswerableIfCompound: 'N/A',
    disposition: 'BINDING_PARTIALLY_CORRECT' },
  { pairId: 'VC-08-5', rowId: 'HS-A1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No material assumption',
    E_distortionOrNarrowing: 'No material distortion', F_independentlyAnswerableIfCompound: 'N/A',
    disposition: 'BINDING_SEMANTICALLY_CORRECT' },
  { pairId: 'VC-08-6', rowId: 'HS-A1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Partially',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'Yes, minor',
    E_distortionOrNarrowing: 'Yes, minor', F_independentlyAnswerableIfCompound: 'N/A',
    disposition: 'BINDING_PARTIALLY_CORRECT' },
  { pairId: 'VC-04-1', rowId: 'HS-E1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Partially',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No',
    E_distortionOrNarrowing: 'Yes — temporal ambiguity',
    F_independentlyAnswerableIfCompound: 'N/A', disposition: 'BINDING_PARTIALLY_CORRECT' },
  { pairId: 'VC-04-2', rowId: 'HS-E1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No', E_distortionOrNarrowing: 'No',
    F_independentlyAnswerableIfCompound: 'N/A', disposition: 'BINDING_SEMANTICALLY_CORRECT' },
  { pairId: 'VC-04-3', rowId: 'HS-E1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No', E_distortionOrNarrowing: 'No',
    F_independentlyAnswerableIfCompound: 'N/A', disposition: 'BINDING_SEMANTICALLY_CORRECT' },
  { pairId: 'VC-04-4', rowId: 'HS-E1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No', E_distortionOrNarrowing: 'No',
    F_independentlyAnswerableIfCompound: 'N/A', disposition: 'BINDING_SEMANTICALLY_CORRECT' },
  { pairId: 'VC-04-5', rowId: 'HS-E1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No', E_distortionOrNarrowing: 'No',
    F_independentlyAnswerableIfCompound: 'N/A', disposition: 'BINDING_SEMANTICALLY_CORRECT' },
  { pairId: 'VC-04-6', rowId: 'HS-E1', A_asksOwedFact: 'Yes', B_answerResolvesIt: 'Yes',
    C_affectedDecision: 'Correct', D_unsupportedAssumption: 'No', E_distortionOrNarrowing: 'No',
    F_independentlyAnswerableIfCompound: 'N/A', disposition: 'BINDING_SEMANTICALLY_CORRECT' },
];

/** The two named weakness classes the owner recorded alongside the dispositions. */
const EVIDENCE_SUFFICIENCY_WEAKNESSES = ['VC-08-1', 'VC-08-4', 'VC-08-6'];
const TEMPORAL_SCOPE_WEAKNESSES = ['VC-04-1'];
/** Recorded on the representation axis. It does NOT alter the semantic disposition. */
const COMPOUND_UNACCEPTABLE = ['VC-08-2', 'VC-08-3'];

/**
 * Refuses to compute anything unless every pair carries an explicitly recorded human verdict from
 * the returned table. There is no default, no inference and no "unreviewed means fine".
 */
function assertNoModelAssignment(pairIds: readonly string[]): void {
  const missing = pairIds.filter(id => !OWNER_DISPOSITIONS.some(d => d.pairId === id));
  if (missing.length > 0) {
    throw new Error(`HUMAN_DISPOSITION_MISSING — ${missing.join(', ')}. No count may be computed `
      + 'while any pair is unadjudicated, and no model may supply the missing verdict.');
  }
  for (const d of OWNER_DISPOSITIONS) {
    if (!(ALLOWED_DISPOSITIONS as readonly string[]).includes(d.disposition)) {
      throw new Error(`DISPOSITION_NOT_A_MEMBER — ${d.pairId}: ${d.disposition}`);
    }
  }
}

const form = JSON.parse(readFileSync(join(OUT, 'BINDING-ADJUDICATION-FORM.json'), 'utf8')) as
{ pairs: Array<Record<string, unknown>>; [k: string]: unknown };
const pairIds = form.pairs.map(p => String(p.pairId));
assertNoModelAssignment(pairIds);

// ---------------------------------------------------------------- fill the form

const filled = {
  ...form,
  reviewer: 'PRODUCT_OWNER',
  reviewedAt: '2026-09-04',
  provenance: 'returned by the product owner and transcribed verbatim; no model assigned, inferred '
    + 'or adjusted any verdict',
  pairs: form.pairs.map(p => {
    const d = OWNER_DISPOSITIONS.find(x => x.pairId === p.pairId)!;
    return {
      ...p,
      disposition: d.disposition,
      answers: {
        A: d.A_asksOwedFact, B: d.B_answerResolvesIt, C: d.C_affectedDecision,
        D: d.D_unsupportedAssumption, E: d.E_distortionOrNarrowing,
        F: d.F_independentlyAnswerableIfCompound,
      },
      compoundRepresentation: COMPOUND_UNACCEPTABLE.includes(d.pairId)
        ? 'COMPOUND_QUESTION_REPRESENTATION = UNACCEPTABLE (separate axis; does NOT downgrade the '
          + 'semantic disposition)'
        : null,
      weaknessClass: EVIDENCE_SUFFICIENCY_WEAKNESSES.includes(d.pairId) ? 'EVIDENCE_SUFFICIENCY'
        : TEMPORAL_SCOPE_WEAKNESSES.includes(d.pairId) ? 'TEMPORAL_SCOPE' : null,
    };
  }),
};
writeFileSync(join(OUT, 'BINDING-ADJUDICATION-FORM.json'), JSON.stringify(filled, null, 2) + '\n');

// ---------------------------------------------------------------- PHASE 6 counts

const by = (d: Disposition) => OWNER_DISPOSITIONS.filter(x => x.disposition === d);
const counts = {
  label: 'HUMAN_VALIDATED_BOUNDED_DEVELOPMENT_COUNTS',
  warning: 'EXACT COUNTS over 12 draws on 2 human-authoritative rows. NOT production accuracy '
    + 'rates and not convertible into any.',
  adjudicatedBy: 'PRODUCT_OWNER',
  adjudicatedAt: '2026-09-04',
  totalPairs: OWNER_DISPOSITIONS.length,
  semanticallyCorrect: by('BINDING_SEMANTICALLY_CORRECT').length,
  partiallyCorrect: by('BINDING_PARTIALLY_CORRECT').length,
  incorrect: by('BINDING_INCORRECT').length,
  ambiguous: by('BINDING_AMBIGUOUS').length,
  affectedDecisionCorrect:
    `${OWNER_DISPOSITIONS.filter(d => d.C_affectedDecision === 'Correct').length}/12`,
  materiallyUnsupportedHazardAssumptions: 0,
  evidenceSufficiencyWeaknesses: {
    count: EVIDENCE_SUFFICIENCY_WEAKNESSES.length,
    rowId: 'HS-A1',
    pairs: EVIDENCE_SUFFICIENCY_WEAKNESSES,
  },
  temporalScopeWeaknesses: {
    count: TEMPORAL_SCOPE_WEAKNESSES.length,
    rowId: 'HS-E1',
    pairs: TEMPORAL_SCOPE_WEAKNESSES,
  },
  compound: {
    acceptable: 0,
    acceptableWithFormatRepair: 0,
    unacceptable: COMPOUND_UNACCEPTABLE.length,
    pairs: COMPOUND_UNACCEPTABLE,
    separationRule: 'these two are BINDING_SEMANTICALLY_CORRECT AND '
      + 'COMPOUND_QUESTION_REPRESENTATION = UNACCEPTABLE simultaneously. A semantic binding is NOT '
      + 'downgraded because the customer-facing packaging is wrong.',
  },
  questionA_asksTheOwedFact: `${OWNER_DISPOSITIONS.filter(d => d.A_asksOwedFact === 'Yes').length}/12`,
  questionB_answerResolvesIt: {
    yes: OWNER_DISPOSITIONS.filter(d => d.B_answerResolvesIt === 'Yes').length,
    partially: OWNER_DISPOSITIONS.filter(d => d.B_answerResolvesIt === 'Partially').length,
    no: 0,
  },
  owedTargetPreservation: { 'HS-A1': '6/6', 'HS-E1': '6/6' },
  additiveGapNominationOnHsA1: {
    observed: '5/6',
    status: 'ADDITIVE_GAP_DISCOVERY_RECALL = NOT_CURRENTLY_A_REQUIRED_AXIS',
    prohibition: 'must NOT be converted into a required recall threshold — the denominator is one '
      + 'confirmed gap on one row',
  },
  theDistinctionThatMatters:
    'Question A is Yes on ALL TWELVE: the closed-set binding mechanism selected the right target '
    + 'every time and ZERO bindings were incorrect. The four partials sit on question B — whether '
    + 'an answer would RESOLVE the fact. The defect class is therefore not target selection but '
    + 'EVIDENCE SUFFICIENCY in how much the question demands of the answer.',
  perPair: OWNER_DISPOSITIONS,
};
writeFileSync(join(OUT, 'HUMAN-VALIDATED-COUNTS.json'), JSON.stringify(counts, null, 2) + '\n');

// ---------------------------------------------------------------- instrument finding

/**
 * The §167 cue instrument scored all 12 TARGET_REACHED. Human review scored 8 fully correct and 4
 * partial. That is not a contradiction and §167 is NOT rescored — it is a measured statement of
 * what the instrument can and cannot see.
 */
const instrumentFinding = {
  statement: 'The §162 cue instrument measures TOPIC REACH, not RESOLUTION SUFFICIENCY.',
  section167ScoredTargetReached: '12/12',
  humanFullyCorrect: '8/12',
  humanPartiallyCorrect: '4/12',
  humanIncorrect: '0/12',
  agreementOnQuestionA: '12/12 — the instrument and the human agree that every clarification asks '
    + 'about the owed fact',
  divergence: 'on question B the instrument is silent by construction: a cue match cannot tell '
    + 'whether the evidence a question demands would actually settle the fact.',
  section167Rescored: false,
  classification: 'HUMAN_POSTHOC_ADJUDICATION — recorded separately, §167 remains immutable',
  consequence: 'no claim may read §167\'s 12/12 as "12 fully correct bindings". The supported '
    + 'reading is 12/12 topic reach with 8/12 human-confirmed resolution sufficiency.',
  vindicatesSection164Obligation: 'this is exactly why §164 classified binding truthfulness '
    + 'REQUIRES_HUMAN_TRUTH and required human sampling of bound pairs rather than an automated '
    + 'judge. The sampling found something the instrument could not.',
};
writeFileSync(join(OUT, 'INSTRUMENT-VS-HUMAN-FINDING.json'),
  JSON.stringify(instrumentFinding, null, 2) + '\n');

mkdirSync(OUT, { recursive: true });
console.log('§169 product-owner binding dispositions recorded');
console.log(`  pairs adjudicated: ${OWNER_DISPOSITIONS.length}/12 by PRODUCT_OWNER`);
console.log(`  dispositions assigned by any model: 0`);
console.log(`  ${counts.semanticallyCorrect} semantically correct · `
  + `${counts.partiallyCorrect} partially correct · ${counts.incorrect} incorrect · `
  + `${counts.ambiguous} ambiguous`);
console.log(`  affectedDecision correct: ${counts.affectedDecisionCorrect}`);
console.log(`  question A (asks the owed fact): ${counts.questionA_asksTheOwedFact}`);
console.log(`  question B: ${counts.questionB_answerResolvesIt.yes} yes, `
  + `${counts.questionB_answerResolvesIt.partially} partially, `
  + `${counts.questionB_answerResolvesIt.no} no`);
console.log(`  evidence-sufficiency weaknesses: ${counts.evidenceSufficiencyWeaknesses.count} `
  + `(${EVIDENCE_SUFFICIENCY_WEAKNESSES.join(', ')})`);
console.log(`  temporal-scope weaknesses: ${counts.temporalScopeWeaknesses.count} `
  + `(${TEMPORAL_SCOPE_WEAKNESSES.join(', ')})`);
console.log(`  compound unacceptable: ${counts.compound.unacceptable} `
  + `(${COMPOUND_UNACCEPTABLE.join(', ')}) — semantic dispositions NOT downgraded`);
for (const f of ['BINDING-ADJUDICATION-FORM.json', 'HUMAN-VALIDATED-COUNTS.json',
  'INSTRUMENT-VS-HUMAN-FINDING.json']) {
  console.log(`    ${f}  ${sha256(readFileSync(join(OUT, f), 'utf8')).slice(0, 24)}…`);
}
console.log('\nPROVIDER CALLS: 0   COST: $0.00');
