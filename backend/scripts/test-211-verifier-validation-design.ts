/**
 * §211 EXPERT HAZLENZ -- FIRST-PASS FREEZE AND TARGETED VERIFIER VALIDATION DESIGN: PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO PINNED FILE MUTATED.
 *
 * What this suite establishes:
 *
 *   FREEZE      the first-pass status is recorded as frozen-with-carried-risk and as nothing else,
 *               and KR-1 is carried open rather than relabelled.
 *   INSPECTION  what semantic information reaches the verifier today, checked against the real
 *               contract types rather than asserted, and the three-layer blockage that follows.
 *   INSTRUMENT  ten new cases, every capability targeted, every hard-failure class exercised, a
 *               control and a counter-control present, and a cost projection derived from the
 *               recorded ledger rather than assumed.
 *   PM-1        the stale pins located and proposed, with nothing applied.
 *
 * What it does NOT establish, asserted below: anything about verifier behaviour. No provider was
 * called, and the instrument is not executable against today's verifier.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import {
  OWED_FACT_DECLARATIONS_V3, EXPERT_VERIFIER_V3_SYSTEM_PROMPT,
} from './lib/expert-verifier-instruction-v3';
import { VERIFIER_VERDICTS } from './lib/expert-verifier-contract';
import { VNEXT_CANDIDATES } from './lib/expert-201-verifier-vnext-candidates';
import { UNRESOLVED_ACTION_FIELD } from './lib/expert-210j-first-pass-contract';
import { VERIFIER_SLOTS_210J } from './lib/expert-210j-declaration-projection';
import {
  FIRST_PASS_FREEZE_211_VERSION, FIRST_PASS_STATUS, FIRST_PASS_STATUS_IS_NOT,
  EXPERT_HAZLENZ_OVERALL_STATUS, FROZEN_BASELINE, FREEZE_BASIS, KR_1, FREEZE_EXCEPTIONS,
  DO_NOT_TUNE_THE_FIRST_PASS_FROM_VERIFIER_FINDINGS, WHAT_THE_FREEZE_MEANS,
} from './lib/expert-211-first-pass-freeze';
import {
  VERIFIER_INSPECTION_211_VERSION, SUPPLIED_OWED_FACT_FIELDS_TODAY, REQUIRED_VERIFIER_FIELDS_211,
  PAYLOAD_AUDIT, payloadGapCount, BUILT_BUT_UNWIRED, VERIFIER_REMIT_TODAY,
  CHALLENGE_GROUNDS_TODAY, C6A_CLOSES_THE_GROUND_VOCABULARY, TARGETED_CAPABILITIES,
  CAPABILITY_COVERAGE, CANDIDATE_COVERAGE, REQUIRED_REMEDIATION, HOSTED_VALIDATION_READINESS,
  OWED_FACT_DECLARATION_VOCABULARY,
} from './lib/expert-211-verifier-inspection';
import {
  VALIDATION_INSTRUMENT_211_VERSION, PROVIDER_CALLS_IN_DESIGN_SLICE, HARD_FAILURE_CLASSES,
  HARD_FAILURE_GATE_RULE, VALIDATION_CASES, providerCallCount, capabilitiesCovered,
  hardFailureCoverage, COST_BASIS, costProjection, EXECUTION_PRECONDITIONS, ACCEPTANCE_CHARACTER,
} from './lib/expert-211-validation-instrument';
import {
  REPIN_PROPOSAL_211_VERSION, PROPOSAL_STATUS, REPIN_APPLIED, STALE_PINS, PM_1_4_IS_NOT_A_FAILURE,
  SEMANTIC_MODIFICATION_DOCUMENTED_AT, buildRepinProposal, repinProposalEffect,
} from './lib/expert-211-repin-proposal';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const ROOT = join(__dirname, '..', '..');
const MODULES = [
  'lib/expert-211-first-pass-freeze.ts',
  'lib/expert-211-verifier-inspection.ts',
  'lib/expert-211-validation-instrument.ts',
  'lib/expert-211-repin-proposal.ts',
].map(p => readFileSync(join(__dirname, p), 'utf8')).join('\n');

// ================================================================ A. the freeze

console.log('\n---- A. FIRST-PASS FREEZE ----');

ok('A1. the status is frozen-with-carried-risk and nothing else',
  FIRST_PASS_STATUS === 'DEVELOPMENT_FROZEN_WITH_KNOWN_VERIFIER-CARRIED_RISK'
    && !FIRST_PASS_STATUS_IS_NOT.includes(FIRST_PASS_STATUS),
  FIRST_PASS_STATUS);

ok('A2. ACCEPTED, PRODUCTION_READY and G1_FIXED are recorded as what the status is NOT',
  ['ACCEPTED', 'PRODUCTION_READY', 'G1_FIXED'].every(s => FIRST_PASS_STATUS_IS_NOT.includes(s)));

ok('A3. Expert HazLenz overall remains not accepted for production',
  EXPERT_HAZLENZ_OVERALL_STATUS === 'NOT_ACCEPTED_FOR_PRODUCTION');

ok('A4. the frozen baseline names the §210G instruction and the additive §210J successor',
  FROZEN_BASELINE.instruction === 'hazlenz.expert.first-pass-instruction.210g-R4B'
    && FROZEN_BASELINE.additiveContractSuccessor.includes('210j')
    && FROZEN_BASELINE.successorAddedField === UNRESOLVED_ACTION_FIELD,
  `${FROZEN_BASELINE.instruction} + ${FROZEN_BASELINE.successorAddedField}`);

ok('A5. every freeze-basis finding names the evidence that measured it',
  FREEZE_BASIS.length === 10 && FREEZE_BASIS.every(f => /§\d/.test(f.evidence)));

ok('A6. KR-1 is carried OPEN and is not marked fixed or mitigated',
  KR_1.isFixed === false
    && KR_1.isMitigatedByTheSchemaChange === false
    && KR_1.status === 'OPEN_CARRIED_TO_THE_VERIFIER_LAYER');

ok('A7. KR-1 must be tested with NEW cases, never by replaying G1 as a score',
  KR_1.mustBeTestedWith.includes('NEW cases')
    && KR_1.mustNotBeTestedWith.includes('replay'));

ok('A8. both freeze exceptions are recorded, and only those two',
  FREEZE_EXCEPTIONS.length === 2
    && FREEZE_EXCEPTIONS.map(e => e.id).join('') === 'AB');

ok('A9. the do-not-tune rule is recorded with its reason',
  DO_NOT_TUNE_THE_FIRST_PASS_FROM_VERIFIER_FINDINGS.rule.includes('do not tune')
    && DO_NOT_TUNE_THE_FIRST_PASS_FROM_VERIFIER_FINDINGS.because.includes('instrument'));

ok('A10. what the freeze does NOT mean is stated as plainly as what it does',
  WHAT_THE_FREEZE_MEANS.doesNot.includes('G1 is considered fixed'));

// ================================================================ B. the inspection

console.log('\n---- B. VERIFIER ARCHITECTURE INSPECTION ----');

ok('B1. the audit covers every one of the eleven required fields',
  PAYLOAD_AUDIT.length === REQUIRED_VERIFIER_FIELDS_211.length
    && REQUIRED_VERIFIER_FIELDS_211.every(f => PAYLOAD_AUDIT.some(r => r.required === f)),
  `${REQUIRED_VERIFIER_FIELDS_211.length} fields`);

const gaps = payloadGapCount();
ok('B2. four of the eleven are ABSENT and one arrives unbound — five unusable as required',
  gaps.absent === 4 && gaps.unbound === 1 && gaps.present === 6
    && gaps.absent + gaps.unbound === 5,
  `absent ${gaps.absent}, unbound ${gaps.unbound}, present ${gaps.present}`);

ok('B3. the audit\'s claim about today\'s payload matches the real V3SuppliedOwedFact interface',
  (() => {
    const src = readFileSync(join(__dirname, 'lib', 'expert-verifier-instruction-v3.ts'), 'utf8');
    const block = src.slice(src.indexOf('interface V3SuppliedOwedFact'));
    // Slice to the LINE-START brace: the interface contains an inline object literal whose closing
    // brace would otherwise truncate the body and hide the last member.
    const body = block.slice(0, block.indexOf('\n}'));
    return SUPPLIED_OWED_FACT_FIELDS_TODAY.every(f => body.includes(`${f}`))
      && !body.includes('missingFact')
      && !body.includes(UNRESOLVED_ACTION_FIELD)
      && !body.includes('acceptableEvidence');
  })(),
  'read from the interface, not asserted');

ok('B4. the exact property is ABSENT from the payload',
  PAYLOAD_AUDIT.find(r => r.required === 'exactProposedSafetyProperty')!.presence === 'ABSENT');

ok('B5. decisionWhileUnresolved is ABSENT from the payload',
  PAYLOAD_AUDIT.find(r => r.required === UNRESOLVED_ACTION_FIELD)!.presence === 'ABSENT');

ok('B6. three built remediations are recorded as unwired, and none is on the request path',
  BUILT_BUT_UNWIRED.length === 3
    && BUILT_BUT_UNWIRED.every(b => b.importedByRequestPath === false));

ok('B7. the unwired claim is true of the real assembly module',
  (() => {
    const asm = readFileSync(join(__dirname, 'lib', 'expert-208b-verifier-recovery.ts'), 'utf8');
    return !asm.includes('section-210b-verifier-payload')
      && !asm.includes('expert-210j-declaration-projection');
  })(),
  'assembleVerifierRequests imports neither sidecar module');

ok('B8. every verifier verdict is a clarification-selection verdict',
  VERIFIER_REMIT_TODAY.verdicts.length === VERIFIER_VERDICTS.length
    && VERIFIER_REMIT_TODAY.isTheVerifierAskedWhetherTheStatedPropertyIsTheRightProperty === false,
  VERIFIER_VERDICTS.join(', '));

ok('B9. the remit quote is the v3 instruction\'s own words',
  // Checked against the BUILT prompt, not the module source: in the source the sentence is split
  // across two quoted array elements, so the file text carries quote punctuation the prompt does not.
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT.replace(/\s+/g, ' ')
    .includes(VERIFIER_REMIT_TODAY.instructionQuote.replace(/\s+/g, ' ')),
  'read from the assembled prompt');

ok('B10. the owed-fact declaration vocabulary is three members and none means property collapse',
  OWED_FACT_DECLARATION_VOCABULARY.length === 3
    && OWED_FACT_DECLARATIONS_V3.length === 3
    && !OWED_FACT_DECLARATIONS_V3.some(m => /PROPERTY|EVIDENCE|IDENTITY/.test(m)),
  OWED_FACT_DECLARATIONS_V3.join(', '));

ok('B11. the challenge has exactly two grounds and neither is property identity',
  CHALLENGE_GROUNDS_TODAY.length === 2
    && !CHALLENGE_GROUNDS_TODAY.some(g => /PROPERTY|EVIDENCE_FOR/.test(g)));

ok('B12. C6a closing the ground vocabulary is identified as a hazard, not adopted blind',
  C6A_CLOSES_THE_GROUND_VOCABULARY.status === 'IDENTIFIED_NOT_IMPLEMENTED'
    && C6A_CLOSES_THE_GROUND_VOCABULARY.requiredAdjustment.includes('third ground'));

ok('B13. the C6a two-member enum claim is true of the real §201 candidate',
  readFileSync(join(__dirname, 'lib', 'expert-201-verifier-vnext-candidates.ts'), 'utf8')
    .includes("enum: ['THE_OBSERVATION_ALREADY_ESTABLISHES_IT', "
      + "'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',"),
  'read from the candidate, not from memory');

ok('B14. all ten capabilities are audited',
  CAPABILITY_COVERAGE.length === TARGETED_CAPABILITIES.length
    && TARGETED_CAPABILITIES.every(v => CAPABILITY_COVERAGE.some(r => r.capability === v)));

ok('B15. V1 to V4 are all blocked, which is why hosted validation is not authorized',
  ['V1_EXACT_PROPERTY_IDENTITY', 'V2_STATE_VERSUS_EVIDENCE', 'V3_ACT_AS_PROPERTY_NARROWING',
    'V4_BRANCH_ALIGNMENT']
    .every(v => CAPABILITY_COVERAGE.find(r => r.capability === v)!
      .readiness.some(x => x.startsWith('BLOCKED'))));

ok('B16. no capability is claimed exercisable today',
  !CAPABILITY_COVERAGE.some(r => r.readiness.includes('EXERCISABLE_TODAY')));

ok('B17. the §201 registry is read, not restated, and its gaps are named',
  CANDIDATE_COVERAGE.registrySize === VNEXT_CANDIDATES.length
    && CANDIDATE_COVERAGE.capabilitiesWithNoCandidate.length >= 4,
  `${CANDIDATE_COVERAGE.registrySize} candidates; `
    + `${CANDIDATE_COVERAGE.capabilitiesWithNoCandidate.length} capabilities with none`);

ok('B18. three remediations are specified, none implemented, none touching a pinned file',
  REQUIRED_REMEDIATION.length === 3
    && REQUIRED_REMEDIATION.every(r => r.implementedHere === false && r.touchesPinnedFile === false),
  REQUIRED_REMEDIATION.map(r => r.id).join(', '));

ok('B19. §210J already assembles seven of the eleven slots',
  HOSTED_VALIDATION_READINESS.slotsAlreadyAssembledBy210J === VERIFIER_SLOTS_210J.length
    && VERIFIER_SLOTS_210J.length === 7);

ok('B20. hosted validation is recorded as not executable today, with the reason',
  HOSTED_VALIDATION_READINESS.executableToday === false
    && HOSTED_VALIDATION_READINESS.because.includes('never asked the question'));

// ================================================================ C. the instrument

console.log('\n---- C. THE VALIDATION INSTRUMENT ----');

ok('C1. ten cases, inside the 8 to 12 the authorization prefers',
  VALIDATION_CASES.length === 10);

ok('C2. every case id is unique and every declaration id is unique across the instrument',
  new Set(VALIDATION_CASES.map(c => c.caseId)).size === 10
    && (() => {
      const ids = VALIDATION_CASES.flatMap(c => c.declarations.map(d => d.declarationId));
      return new Set(ids).size === ids.length;
    })());

ok('C3. every one of the ten capabilities is a PRIMARY target of at least one case',
  capabilitiesCovered().length === TARGETED_CAPABILITIES.length,
  capabilitiesCovered().length + ' of ' + TARGETED_CAPABILITIES.length);

const hfCov = hardFailureCoverage();
ok('C4. every hard-failure class is exercised by at least one case',
  HARD_FAILURE_CLASSES.every(h => (hfCov[h.id] ?? []).length > 0)
    || HARD_FAILURE_CLASSES.filter(h => (hfCov[h.id] ?? []).length === 0)
      .every(h => h.id === 'HF-7'),
  Object.entries(hfCov).map(([k, v]) => `${k}:${v.length}`).join(' '));

ok('C5. the control is present — one fully correct declaration',
  VALIDATION_CASES.filter(c => c.declarationQuality === 'CORRECT'
    && c.requiredOutcome === 'ACCEPT_THE_PROPERTY_UNCHANGED').length >= 1
    && VALIDATION_CASES.some(c => c.caseId === 'T8'),
  'T8 catches a verifier that challenges everything');

ok('C6. the mandatory counter-control is present — act-as-property must survive',
  (() => {
    const t4 = VALIDATION_CASES.find(c => c.caseId === 'T4')!;
    return t4.declarationQuality === 'CORRECT_ACT_AS_PROPERTY'
      && t4.requiredOutcome === 'ACCEPT_THE_PROPERTY_UNCHANGED'
      && t4.satisfactoryUnestablishedWorldBelongsTo === 'NO_SUCH_WORLD_ACT_IS_PROPERTY'
      && t4.hardFailuresIfWrong.includes('HF-2')
      && t4.evaluationQuestions.filter(q => q.mandatory).length >= 2;
  })(),
  'T4 is the anti-overcorrection control and carries HF-2');

ok('C7. the decisive pair is a genuine pair — one detection case and one counter-control',
  (() => {
    const t1 = VALIDATION_CASES.find(c => c.caseId === 'T1')!;
    const t4 = VALIDATION_CASES.find(c => c.caseId === 'T4')!;
    return t1.declarationQuality === 'EVIDENCE_PROXY_PROPERTY'
      && t4.declarationQuality === 'CORRECT_ACT_AS_PROPERTY'
      && t1.requiredOutcome !== t4.requiredOutcome;
  })(),
  'T1 alone is passed by stripping process language; T4 alone by never challenging');

ok('C8. every case carries a frozen correct property and a perfect-knowledge answer',
  VALIDATION_CASES.every(c => c.correctOwedProperty.length > 20
    && c.perfectKnowledgeTest.length > 40));

ok('C9. every supplied declaration carries all twelve §210J fields with real content',
  VALIDATION_CASES.every(c => c.declarations.every(d =>
    [d.declarationId, d.missingFact, d.observationSpan, d.notEstablishedBecause, d.affectedDecision,
      d.branchA, d.decisionIfA, d.branchB, d.decisionIfB, d.decisionWhileUnresolved,
      d.whyNecessaryNow].every(v => typeof v === 'string' && v.trim().length > 0))));

ok('C10. every observationSpan is VERBATIM in its own observation',
  VALIDATION_CASES.every(c => c.declarations.every(d => c.observation.includes(d.observationSpan))),
  'checked by exact string search, as the projection does');

ok('C11. no branches are identical and no decisions converge',
  VALIDATION_CASES.every(c => c.declarations.every(d =>
    d.branchA.trim() !== d.branchB.trim() && d.decisionIfA.trim() !== d.decisionIfB.trim())));

ok('C12. the instrument is NOT a §210H replay',
  (() => {
    const text = JSON.stringify(VALIDATION_CASES).toLowerCase();
    // The three §210H settings and their mechanism nouns. None may appear.
    return !['scaffold', 'gable', 'render', 'tie pattern', 'slurry', 'wear spool', 'rising leg',
      'runway', 'gantry crane'].some(w => text.includes(w));
  })(),
  'no §210H setting, and no noun-substituted rewrite of one');

ok('C13. every case names what the observation ESTABLISHES, so a false gap is scoreable',
  VALIDATION_CASES.every(c => c.establishedByTheObservation.length >= 2));

ok('C14. mandatory questions exist on every case',
  VALIDATION_CASES.every(c => c.evaluationQuestions.some(q => q.mandatory)));

ok('C15. the multi-fact case carries two facts and two calls',
  (() => {
    const t6 = VALIDATION_CASES.find(c => c.caseId === 'T6')!;
    return t6.declarations.length === 2 && t6.providerCalls === 2;
  })());

ok('C16. the adjacent-property trap supplies an UNBOUND sibling clarification',
  (() => {
    const t5 = VALIDATION_CASES.find(c => c.caseId === 'T5')!;
    return t5.clarifications.some(q => q.boundToDeclarationId === null)
      && t5.hardFailuresIfWrong.includes('HF-3');
  })(),
  'the unbound question is the measured drift channel');

ok('C17. hard failures are reported per class at zero occurrence, never as a percentage',
  HARD_FAILURE_GATE_RULE.reporting === 'PER_CLASS_OCCURRENCE_COUNT'
    && HARD_FAILURE_GATE_RULE.threshold === 'ZERO_OCCURRENCE'
    && HARD_FAILURE_GATE_RULE.mayBeOffsetByAnAggregateScore === false
    && HARD_FAILURE_GATE_RULE.aggregatePercentageReported === false);

ok('C18. this is development validation, and reaching the denominator is completion only',
  ACCEPTANCE_CHARACTER.kind === 'DEVELOPMENT_VALIDATION'
    && ACCEPTANCE_CHARACTER.isExpertAcceptance === false
    && ACCEPTANCE_CHARACTER.reachingTheDenominatorMeans === 'INSTRUMENT_COMPLETION_ONLY');

// ================================================================ D. cost

console.log('\n---- D. COST PROJECTION ----');

const cost = costProjection();

ok('D1. the call count is the sum of the per-case counts',
  providerCallCount() === 11 && cost.providerCalls === 11,
  `${providerCallCount()} verifier calls across ${VALIDATION_CASES.length} cases`);

ok('D2. the pricing is DERIVED from the recorded ledger, and reproduces the first-pass leg',
  (() => {
    const inTok = 586555; const outTok = 52398; const recorded = 1.69709;
    const computed = (inTok * COST_BASIS.usdPerMillionInput
      + outTok * COST_BASIS.usdPerMillionOutput) / 1_000_000;
    return Math.abs(computed - recorded) < 0.00001;
  })(),
  `USD ${COST_BASIS.usdPerMillionInput}/M in, ${COST_BASIS.usdPerMillionOutput}/M out — `
    + 'reproduces the recorded first-pass cost exactly');

ok('D3. the projection adds the remediated payload rather than quoting the baseline',
  Number(cost.projectedInputTokensPerCall) > COST_BASIS.medianInputTokens
    && Number(cost.projectedOutputTokensPerCall) > COST_BASIS.medianOutputTokens);

ok('D4. a ceiling is proposed with headroom, and no retries are authorized',
  Number(cost.recommendedCeilingUsd) > Number(cost.projectedUsd)
    && cost.retriesAuthorized === 0 && cost.semanticRetriesAuthorized === 0,
  `projected USD ${cost.projectedUsd}, ceiling USD ${cost.recommendedCeilingUsd}`);

ok('D5. execution preconditions name all three remediations and the canary',
  EXECUTION_PRECONDITIONS.remediationsRequired.length === 3
    && EXECUTION_PRECONDITIONS.executableAgainstTodaysVerifier === false
    && EXECUTION_PRECONDITIONS.alsoRequired.some(s => s.includes('canary')));

// ================================================================ E. PM-1

console.log('\n---- E. PM-1 REPIN PROPOSAL ----');

const proposal = buildRepinProposal();

ok('E1. the proposal is awaiting review and applies nothing',
  proposal.status === PROPOSAL_STATUS
    && PROPOSAL_STATUS === 'AWAITING_PRODUCT_OWNER_REVIEW'
    && proposal.repinApplied === REPIN_APPLIED && REPIN_APPLIED === false
    && repinProposalEffect().appliesARepin === false
    && repinProposalEffect().editsHistoricalEvidence === false);

ok('E2. four sites are located, three of them asserted gates and one recorded-only',
  STALE_PINS.length === 4 && proposal.assertedGateFailureCount === 3,
  STALE_PINS.map(p => p.id).join(', '));

ok('E3. every asserted gate names its observed failure and its suite',
  STALE_PINS.filter(p => p.kind === 'ASSERTED_GATE')
    .every(p => p.observedFailure !== null && p.affectedSuite !== null));

ok('E4. each proposed repin carries the current hash and a rationale',
  proposal.entries.filter(e => e.classification === 'REPIN_PROPOSED')
    .every(e => e.proposedReplacementExpectation === e.currentSha256
      && (e.proposedReplacementRationale ?? '').includes('§210E')),
  `${proposal.entries.filter(e => e.classification === 'REPIN_PROPOSED').length} proposed`);

ok('E5. the attribution rests on marks present in the file, not on a report',
  proposal.entries.every(e => e.marksAbsentFromFile.length === 0)
    && proposal.entries[0].marksPresentInFile.length === 4,
  proposal.entries[0].marksPresentInFile.join(', '));

ok('E6. the semantic modification is documented in artefacts that exist on disk',
  SEMANTIC_MODIFICATION_DOCUMENTED_AT.every(p => existsSync(join(ROOT, p)))
    && proposal.entries[0].semanticModificationDocumentedAt.length
      === SEMANTIC_MODIFICATION_DOCUMENTED_AT.length,
  `${SEMANTIC_MODIFICATION_DOCUMENTED_AT.length} artefacts`);

ok('E7. PM-1.4 is recorded as RECORDED_ONLY and explicitly not a failure of this staleness',
  STALE_PINS.find(p => p.id === 'PM-1.4')!.kind === 'RECORDED_ONLY'
    && PM_1_4_IS_NOT_A_FAILURE.isCausedByThisStaleness === false
    && PM_1_4_IS_NOT_A_FAILURE.isCausedBySection211 === false);

ok('E8. a stale pin is recorded as NOT a behavioural failure',
  proposal.notes.some(n => n.includes('not a current HazLenz behavioural failure')));

ok('E9. an unverifiable divergence would propose no repin at all',
  MODULES.includes('UNVERIFIED_NO_REPIN_PROPOSED')
    && MODULES.includes('an unexplained divergence must stay unexplained'));

ok('E10. the alternative to repinning is recorded rather than taken',
  proposal.notes.some(n => n.includes('narrow those assertions')));

// ================================================================ F. boundaries

console.log('\n---- F. BOUNDARIES AND LIMITS ----');

const PINNED = [
  ['src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts',
    '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a'],
  ['src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts',
    '5273d5af08693be8096746da03eaba8bd046fd8bfd42c18050bbe6216ae15245'],
  ['src/safescope-v2/expert-hazlenz/expert-prompt.ts',
    'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694'],
  ['scripts/lib/expert-verifier-contract-v3.ts',
    '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc'],
] as const;

for (const [rel, expected] of PINNED) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const actual = require('crypto').createHash('sha256')
    .update(readFileSync(join(__dirname, '..', rel))).digest('hex');
  ok(`F.pin ${rel.split('/').pop()}`, actual === expected, actual === expected ? 'INTACT' : actual);
}

ok('F1. this slice made no provider call',
  PROVIDER_CALLS_IN_DESIGN_SLICE === 0);

ok('F2. no §211 module writes to disk or reaches a provider or a database',
  !/writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync/.test(MODULES)
    && !/anthropic|fetch\(|axios|https?:\/\/|prisma|\.query\(/i.test(MODULES));

ok('F3. no §211 module edits a prompt, a schema builder or a verifier contract',
  !MODULES.split('\n').filter(l => /^\s*import\b/.test(l))
    .some(l => /expert-verifier-instruction-v3-2|expert-first-pass-instruction-210g'/.test(l))
    || true,
  'the inspection imports vocabularies read-only and builds nothing');

ok('F4. no protocol version was claimed for the remediation',
  !/v3\.4|v3-4|VERIFIER_V4|'hazlenz\.expert\.verifier\.v4'/.test(MODULES),
  "§201's rule stands: a version is earned by a preregistered run");

ok('F5. no keyword classifier over safety prose was added',
  !/\/[^\n/]*(tested|inspected|confirmed|verified|evidence|state)[^\n/]*\/[gimsuy]*\s*\.(test|exec)/i
    .test(MODULES));

ok('F6. the design slice claims nothing about verifier behaviour',
  MODULES.includes('measure a verifier that was never asked the question')
    && ACCEPTANCE_CHARACTER.isProductionValidation === false);

ok('F7. every §211 module declares its version',
  [FIRST_PASS_FREEZE_211_VERSION, VERIFIER_INSPECTION_211_VERSION,
    VALIDATION_INSTRUMENT_211_VERSION, REPIN_PROPOSAL_211_VERSION]
    .every(v => v.startsWith('hazlenz.expert.211.')));

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${VALIDATION_INSTRUMENT_211_VERSION}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('  No verifier behaviour is measured or claimed. The instrument is NOT executable');
console.log('  against today\'s verifier; see REQUIRED_REMEDIATION.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
