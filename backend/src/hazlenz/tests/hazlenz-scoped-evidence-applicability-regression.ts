/**
 * §276 / D-009 — SCOPED-EVIDENCE APPLICABILITY REGRESSION. Zero provider calls, no database.
 *
 * ==================== WHAT THIS PINS ====================
 *
 *   finding-specific evidence + applicable parent-observation facts -> applicability
 *
 * Both halves have to hold at once, and each is the failure mode of over-correcting the
 * other:
 *
 *   evaluate the fragment alone      -> §275's defect: a finding the engine rates SUPPORTED
 *                                       at 0.96 on the whole observation reads
 *                                       "Candidate only; missing: moving or accessible
 *                                       energy", because the energy fact is in the next
 *                                       sentence
 *   evaluate the whole observation   -> the defect finding-scoping was built to prevent: an
 *                                       unrelated clause elsewhere decides another finding's
 *                                       applicability
 *
 * The four cases D-009 names are A, B, C and D below. E is the distinct-unit control -- the
 * hardest case for any lexical co-reference rule, and the one that says whether "explicitly
 * modifies the same hazard" means anything.
 *
 * Run: npm run test:hazlenz-scoped-evidence
 */
import {
  applyFindingScopedStandards, parentSentenceModifiesFinding,
} from '../evidence/evidence-foundation';

let failures = 0;
let checks = 0;

function check(name: string, condition: boolean, detail?: unknown): void {
  checks += 1;
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
}

type Hazard = {
  hazardId: string;
  domainId: string;
  hazardFamily: string;
  observationFragment: string;
  mechanism?: string;
  supportingSignals?: string[];
  standardCandidates?: Array<{
    citation: string; status: string; confidence: number; applicability: string;
    missingPredicates?: string[];
  }>;
};

function evaluateFindings(text: string, hazards: Hazard[]): Hazard[] {
  const result: Record<string, unknown> = {
    multiHazardDecomposition: { hazards: hazards.map((h) => ({ ...h })) },
  };
  applyFindingScopedStandards(result, { text, scopes: ['osha_general_industry'] } as never);
  return (result.multiHazardDecomposition as { hazards: Hazard[] }).hazards;
}

function candidate(hazard: Hazard, citation: string) {
  return (hazard.standardCandidates || []).find((item) => item.citation === citation);
}

const GUARDING = '29 CFR 1910.212(a)(1)';
const LOTO = '29 CFR 1910.147';

// =========================================================================================
// CASE C — A PARENT-LEVEL FACT THAT LEGITIMATELY MODIFIES ONE FRAGMENT.
//
// This is §275's observation, verbatim from `test_insite_validation_275`. Sentences 2 and 4
// are claimed by no finding; sentence 2 carries the energy and exposure facts that make the
// guarding hazard real, and it is explicitly about the same press.
// =========================================================================================
console.log('\n--- C: a parent fact that legitimately modifies the fragment (§275, verbatim) ---');

const SECTION_275_TEXT =
  'The point of operation guard on the 60-ton punch press in the fabrication bay has been '
  + 'removed and is sitting on the floor beside the machine. The press is energized and '
  + "cycling on production parts, and the operator's hands enter the die area between strokes "
  + 'to reposition the blank. There is no light curtain or two-hand control fitted. A '
  + 'maintenance lock and tag were applied to this press last week during a die change but '
  + 'have since been removed and the press returned to service.';

const section275 = evaluateFindings(SECTION_275_TEXT, [
  {
    hazardId: 'haz-1', domainId: 'machine_guarding', hazardFamily: 'machine_guarding',
    observationFragment:
      'the point of operation guard on the 60-ton punch press in the fabrication bay has been removed',
    mechanism: 'required machine-guarding component missing, defeated or out of adjustment',
    supportingSignals: ['guard'],
  },
  {
    hazardId: 'haz-2', domainId: 'machine_guarding', hazardFamily: 'machine_guarding',
    observationFragment: 'there is no light curtain or two-hand control fitted',
    mechanism: 'required machine-guarding component missing, defeated or out of adjustment',
    supportingSignals: ['light curtain'],
  },
]);

const guardingCandidate = candidate(section275[0], GUARDING);
check('C1 the guarding finding carries its standard', Boolean(guardingCandidate),
  section275[0].standardCandidates);
check('C2 SUPPORTED, not a low-confidence candidate', guardingCandidate?.status === 'SUPPORTED',
  guardingCandidate?.status);
check('C3 at the whole-observation confidence of 0.96', guardingCandidate?.confidence === 0.96,
  guardingCandidate?.confidence);
check('C4 with "moving or accessible energy" no longer missing',
  (guardingCandidate?.missingPredicates || []).length === 0,
  guardingCandidate?.missingPredicates);
check('C5 and rendered as a direct applicability', guardingCandidate?.applicability === 'direct',
  guardingCandidate?.applicability);

/**
 * §117 MUST SURVIVE THIS. Sentence 4 records a lockout that was applied and then WITHDRAWN.
 * Forwarding it is correct -- it is explicitly about the same press -- and the engine must
 * still reach SUPPORTED rather than excluding the family on a withdrawn isolation fact. That
 * is the §117 repair, now exercised through the finding-scoped path as well as the
 * whole-observation one.
 */
check('C6 §117: a WITHDRAWN lockout in a forwarded sentence does not exclude guarding',
  guardingCandidate?.status === 'SUPPORTED', guardingCandidate?.status);

// =========================================================================================
// CASE D — AN UNRELATED PARENT CLAUSE MUST NOT MODIFY THE OTHER FRAGMENT.
// =========================================================================================
console.log('\n--- D: an unrelated parent clause must not modify another fragment ---');

const UNRELATED_TEXT =
  'The point of operation guard on the punch press has been removed. The press is energized '
  + 'and cycling and the operator reaches into the die area. A first-aid cabinet in the break '
  + 'room is missing its eyewash bottle.';

const unrelated = evaluateFindings(UNRELATED_TEXT, [
  {
    hazardId: 'haz-1', domainId: 'machine_guarding', hazardFamily: 'machine_guarding',
    observationFragment: 'the point of operation guard on the punch press has been removed',
    mechanism: 'required machine-guarding component missing, defeated or out of adjustment',
    supportingSignals: ['guard'],
  },
]);

check('D1 the related energy sentence still reaches the finding',
  candidate(unrelated[0], GUARDING)?.status === 'SUPPORTED',
  candidate(unrelated[0], GUARDING)?.status);
check('D2 the unrelated first-aid clause contributes no standard of its own',
  !(unrelated[0].standardCandidates || []).some((item) => /1910\.15[01]|eyewash/i.test(item.citation)),
  unrelated[0].standardCandidates?.map((item) => item.citation));
check('D3 an unrelated sentence is not judged to modify the hazard',
  parentSentenceModifiesFinding(
    'A first-aid cabinet in the break room is missing its eyewash bottle.',
    'the point of operation guard on the punch press has been removed',
  ) === false);

// =========================================================================================
// CASE A — TWO INDEPENDENT HAZARDS IN ONE OBSERVATION.
//
// Each finding keeps its own standard and neither acquires the other's. This is the property
// finding-scoping was built for, and a scoped-evidence rule that breaks it has over-corrected.
// =========================================================================================
console.log('\n--- A: two independent hazards in one observation ---');

const TWO_HAZARD_TEXT =
  'The point of operation guard on the punch press has been removed while the press is '
  + 'energized and cycling. Separately, the guardrail along the north mezzanine walkway is '
  + 'missing and employees work within a metre of a four-metre drop.';

const twoHazards = evaluateFindings(TWO_HAZARD_TEXT, [
  {
    hazardId: 'haz-1', domainId: 'machine_guarding', hazardFamily: 'machine_guarding',
    observationFragment: 'the point of operation guard on the punch press has been removed',
    mechanism: 'required machine-guarding component missing, defeated or out of adjustment',
    supportingSignals: ['guard'],
  },
  {
    hazardId: 'haz-2', domainId: 'fall_protection', hazardFamily: 'fall_protection',
    observationFragment: 'the guardrail along the north mezzanine walkway is missing',
    mechanism: 'unprotected elevated edge',
    supportingSignals: ['guardrail'],
  },
]);

check('A1 the guarding finding carries a guarding standard',
  Boolean(candidate(twoHazards[0], GUARDING)),
  twoHazards[0].standardCandidates?.map((item) => item.citation));
check('A2 the fall finding does NOT carry the guarding standard',
  !candidate(twoHazards[1], GUARDING),
  twoHazards[1].standardCandidates?.map((item) => item.citation));
check('A3 the guarding finding does NOT carry a fall-protection standard',
  !(twoHazards[0].standardCandidates || []).some((item) => /1910\.2[89]|1926\.50[12]/.test(item.citation)),
  twoHazards[0].standardCandidates?.map((item) => item.citation));

// =========================================================================================
// CASE B — A NEGATED CONDITION ADJACENT TO A REAL HAZARD.
//
// The negation is about a DIFFERENT subject and sits next to the real hazard. It must not
// travel: adjacency is not co-reference.
// =========================================================================================
console.log('\n--- B: a negated condition adjacent to a real hazard ---');

const NEGATED_TEXT =
  'The point of operation guard on the punch press has been removed and the press is '
  + 'energized and cycling with the operator reaching into the die area. The emergency stop '
  + 'on the adjacent conveyor was tested this morning and works correctly.';

const negated = evaluateFindings(NEGATED_TEXT, [
  {
    hazardId: 'haz-1', domainId: 'machine_guarding', hazardFamily: 'machine_guarding',
    observationFragment: 'the point of operation guard on the punch press has been removed',
    mechanism: 'required machine-guarding component missing, defeated or out of adjustment',
    supportingSignals: ['guard'],
  },
]);

check('B1 the real hazard is still SUPPORTED',
  candidate(negated[0], GUARDING)?.status === 'SUPPORTED',
  candidate(negated[0], GUARDING)?.status);
check('B2 an adjacent negation about a different subject does not modify it',
  parentSentenceModifiesFinding(
    'The emergency stop on the adjacent conveyor was tested this morning and works correctly.',
    'the point of operation guard on the punch press has been removed',
  ) === false);

/**
 * The other direction: a negation that IS about the same subject must travel, because
 * discarding it would make the product state a hazard that the observation says is
 * controlled. D-009 forbids discarding parent context that explicitly modifies the hazard,
 * and it does not carve out the context that happens to be exculpatory.
 */
check('B3 a negation about the SAME subject is judged to modify the hazard',
  parentSentenceModifiesFinding(
    'The punch press has been locked out and tagged, verified by a second person, and is not energized.',
    'the point of operation guard on the punch press has been removed',
  ) === true);

// =========================================================================================
// CASE E — A DIFFERENT UNIT THAT SHARES A NOUN.
//
// The hardest case for any lexical rule, and the reason the unit-discriminator condition
// exists: "press 7" is not "press 4", and a sentence about one must not decide the other.
// =========================================================================================
console.log('\n--- E: a different unit sharing a noun ---');

check('E1 a sentence naming a different unit does not modify this finding',
  parentSentenceModifiesFinding(
    'The guard on press 7 is fitted and interlocked and was verified this morning.',
    'the point of operation guard on press 4 has been removed',
  ) === false);
check('E2 a sentence naming the SAME unit does modify it',
  parentSentenceModifiesFinding(
    'Press 4 is energized and cycling on production parts.',
    'the point of operation guard on press 4 has been removed',
  ) === true);
check('E3 an unnumbered reference to the subject still modifies it',
  parentSentenceModifiesFinding(
    'The press is energized and cycling on production parts.',
    'the point of operation guard on the 60-ton punch press has been removed',
  ) === true);

// =========================================================================================
// CROSS-FAMILY CONTAINMENT. A forwarded sentence supplies FACTS about the finding's hazard;
// it must not hand the finding another family's standard. Sentence 4 of the §275 observation
// is about lockout, and the guarding finding must not come back carrying 1910.147.
// =========================================================================================
console.log('\n--- containment: forwarded context does not import another family ---');

check('F1 the guarding finding does not acquire the LOTO standard from a forwarded sentence',
  !candidate(section275[0], LOTO),
  section275[0].standardCandidates?.map((item) => item.citation));

// =========================================================================================
// A CLAIMED SENTENCE IS NEVER FORWARDED. The anti-contamination invariant, asserted directly:
// sentence 3 belongs to the second finding, so it is not part of the first finding's evidence
// no matter how much vocabulary the two share.
// =========================================================================================
console.log('\n--- claimed sentences stay with their owner ---');

const CLAIMED_TEXT =
  'The point of operation guard on the punch press has been removed. The press is energized '
  + 'and cycling. The lockout on the punch press was removed and the press returned to service.';

const claimed = evaluateFindings(CLAIMED_TEXT, [
  {
    hazardId: 'haz-1', domainId: 'machine_guarding', hazardFamily: 'machine_guarding',
    observationFragment: 'the point of operation guard on the punch press has been removed',
    mechanism: 'required machine-guarding component missing, defeated or out of adjustment',
    supportingSignals: ['guard'],
  },
  {
    hazardId: 'haz-2', domainId: 'lockout_tagout', hazardFamily: 'lockout_tagout',
    observationFragment: 'the lockout on the punch press was removed and the press returned to service',
    mechanism: 'energy isolation withdrawn',
    supportingSignals: ['lockout'],
  },
]);

check('G1 the guarding finding still reaches SUPPORTED from its own unclaimed context',
  candidate(claimed[0], GUARDING)?.status === 'SUPPORTED',
  candidate(claimed[0], GUARDING)?.status);
check('G2 the guarding finding does not acquire the LOTO finding\'s standard',
  !candidate(claimed[0], LOTO),
  claimed[0].standardCandidates?.map((item) => item.citation));
check('G3 the LOTO finding does not acquire the guarding standard',
  !candidate(claimed[1], GUARDING),
  claimed[1].standardCandidates?.map((item) => item.citation));

console.log('\n' + '='.repeat(70));
console.log(`checks: ${checks}   failures: ${failures}`);
if (failures > 0) {
  console.error(
    'HazLenz scoped-evidence applicability regression FAILED. D-009: a finding is evaluated '
    + 'against its own evidence PLUS the parent facts that explicitly modify it -- never the '
    + 'fragment alone, and never the whole observation.',
  );
  process.exit(1);
}
console.log('HazLenz scoped-evidence applicability regression: all invariants passed, 0 failed');
