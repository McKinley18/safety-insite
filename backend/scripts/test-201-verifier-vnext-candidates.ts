/**
 * §201 -- VERIFIER vNEXT CANDIDATE PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO NETWORK. ZERO CREDENTIAL READS.
 *
 * ==================== WHAT THIS SUITE CAN AND CANNOT ESTABLISH ====================
 *
 * IT CAN establish, deterministically: that every candidate is built BY CONSTRUCTION from the
 * v3.2 artifacts and REVERTS to them byte-for-byte; that v3.2 itself is byte-unchanged after every
 * application; that each candidate's boundary admits exactly the legal states and refuses each
 * illegal one; that no candidate adds a prose field the citation scan cannot see; that with no
 * candidate enabled the composed boundary reproduces `checkVerifierV3_2Output` exactly; and what
 * each candidate costs on four separate grammar measures.
 *
 * IT CANNOT establish that any candidate improves a verdict. A representational change is a change
 * to a string and a schema, and whether it produces better judgement is BEHAVIOURAL and answerable
 * only by a preregistered hosted cohort that §201 does not authorize. Every section below proves a
 * property of the ARTIFACT. That limit is stated here rather than left to be discovered.
 *
 * IT ALSO CANNOT, AND MUST NOT, ESTABLISH ANYTHING SEMANTIC. Zero of the 152 §200 verdict slots are
 * filled, this suite fills none, and no fixture here is drawn from any §199 row: every fixture is
 * generic and invented for the shape it exercises.
 */

import { createHash } from 'crypto';

import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-2';
import { checkVerifierV3_2Output } from './lib/expert-verifier-contract-v3-2';
import {
  EXPERT_201_VERIFIER_VNEXT_VERSION, CANDIDATE_STATUS, VNEXT_CLASSES, STRUCTURAL_DEFECTS,
  VNEXT_CANDIDATES, PROTOTYPED_IDS, candidateById, candidateRank, rankedCandidates,
  applyCandidates, revertCandidates, applyPromptPatches, applySchemaPatches,
  grammarCost, costDelta, SECTION_199_GRAMMAR_REFERENCE,
  vnextScannedStrings, checkVnextOutput, renderableAcceptableEvidence,
  sufficiencyReviewPairs, reviewableArbitrationRequests, vnextCandidateEffect,
  VNEXT_ADMISSION_RULE_CLASSIFICATION, OPEN_QUESTIONS_FOR_AUTHORIZATION,
  type VnextAdmissionInput, type VnextCandidate,
} from './lib/expert-201-verifier-vnext-candidates';

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

let passed = 0; let failed = 0;
function assert(label: string, ok: boolean, detail = ''): void {
  if (ok) { passed += 1; console.log(`  PASS  ${label}${detail ? '  -- ' + detail : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

// ==================================================================== generic fixtures
//
// Invented for this suite. No §199 row id, no §187/§192 cohort wording, no trade vocabulary from
// any frozen instrument. They exercise SHAPES, not scenarios.

const OBSERVATION =
  'The line was stopped at 09:40. A retaining collar is fitted on the drive shaft and is visible '
  + 'from the walkway. The maintenance sheet records a check of the collar carried out during the '
  + 'previous shift. A green lamp above the panel was lit throughout. Nobody stated whether the '
  + 'collar was re-torqued after the shaft was refitted.';

const KEY_A = 'owed:generic:collar_retorqued_after_refit';
const KEY_B = 'owed:generic:lamp_reflects_the_protective_circuit';

const SUPPLIED_FACTS = [
  {
    factKey: KEY_A,
    acceptableEvidence: {
      requirement: 'evidence that the collar was tightened to its specified value after the shaft '
        + 'was refitted',
      examples: ['A_TORQUE_VALUE_RECORDED_AFTER_THE_REFIT', 'A_WITNESSED_RE_TORQUE_OF_THE_COLLAR'],
      insufficientExamples: ['THE_COLLAR_IS_VISIBLE_AND_IN_POSITION', 'A_STATUS_LAMP_IS_LIT'],
      provenance: 'AUTHORED_HAZLENZ_SAFETY_CONTRACT',
    },
  },
  {
    factKey: KEY_B,
    acceptableEvidence: null,
  },
];

const INPUT: VnextAdmissionInput = {
  analysisId: 'analysis-generic-201',
  observation: OBSERVATION,
  suppliedOwedFactKeys: [KEY_A, KEY_B],
  suppliedGovernedSourceIds: [],
  suppliedFacts: SUPPLIED_FACTS,
};

const ONE_FACT_INPUT: VnextAdmissionInput = {
  ...INPUT, suppliedOwedFactKeys: [KEY_A], suppliedFacts: [SUPPLIED_FACTS[0]],
};

/** A v3.2-admitted VERIFIED_AS_IS verdict, with nothing from any candidate on it. */
function baseVerified(): any {
  return {
    verifierContractVersion: 'hazlenz.expert.verifier.v3',
    analysisId: INPUT.analysisId,
    verdict: 'VERIFIED_AS_IS',
    rationale: 'The first pass already asks what is missing here.',
    clarificationSourceMode: null,
    proposedClarification: null,
    bindingFactKey: null,
    nominatedFact: null,
    owedFactDeclarations: [
      { factKey: KEY_A, declaration: 'STILL_UNRESOLVED', challengeReason: null },
      { factKey: KEY_B, declaration: 'STILL_UNRESOLVED', challengeReason: null },
    ],
    regulatoryBasis: { reliance: 'NONE', sourceIds: [], proposition: null },
  };
}

/** A v3.2-admitted ADD_OR_REPLACE_CLARIFICATION bound to KEY_A. */
function baseAdd(): any {
  return {
    verifierContractVersion: 'hazlenz.expert.verifier.v3',
    analysisId: INPUT.analysisId,
    verdict: 'ADD_OR_REPLACE_CLARIFICATION',
    rationale: 'The re-torque after the refit is not established by anything supplied.',
    clarificationSourceMode: 'SUPPLIED_FACT',
    proposedClarification: {
      question: 'What torque value was applied to the retaining collar after the shaft was '
        + 'refitted, and who recorded it?',
      whyItMatters: 'An untightened collar and a tightened one lead to different action now.',
      affectedDecision: 'REQUIRED_CONTROL',
      evidenceGap: 'No supplied record covers the period after the refit.',
    },
    bindingFactKey: KEY_A,
    nominatedFact: null,
    owedFactDeclarations: [
      { factKey: KEY_A, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
      { factKey: KEY_B, declaration: 'STILL_UNRESOLVED', challengeReason: null },
    ],
    regulatoryBasis: { reliance: 'NONE', sourceIds: [], proposition: null },
  };
}

/** A v3.2-admitted verdict carrying a challenge, with no candidate fields. */
function baseChallenge(): any {
  const o = baseVerified();
  o.verdict = 'NO_CLARIFICATION_REQUIRED';
  o.owedFactDeclarations[1] = {
    factKey: KEY_B, declaration: 'CHALLENGE_FACT_VALIDITY',
    challengeReason: 'The lamp state is stated and the same action follows either way.',
  };
  return o;
}

// convenience mutators for candidate fields
const withRestatements = (o: any, m: Record<string, string | null>): any => {
  for (const d of o.owedFactDeclarations) d.owedPropertyAsUnderstood = m[d.factKey] ?? null;
  return o;
};

function codesOf(r: { codes: readonly unknown[]; vnextCodes: readonly string[] }): string[] {
  return [...(r.codes as string[]), ...r.vnextCodes];
}

function main(): void {
  console.log('§201 VERIFIER vNEXT CANDIDATE PROOF SUITE');
  console.log(`module ${EXPERT_201_VERIFIER_VNEXT_VERSION}`);
  console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   §200 VERDICT SLOTS FILLED: 0\n');

  const BASE_PROMPT_SHA = sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);
  const BASE_SCHEMA_SHA = sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));

  // ==================================================================== A
  console.log('A. REGISTRY INTEGRITY — every class argued, every candidate accounted for\n');

  for (const k of VNEXT_CLASSES) {
    assert(`A.1 ${k} carries a structural defect statement`,
      typeof STRUCTURAL_DEFECTS[k] === 'string' && STRUCTURAL_DEFECTS[k].length > 200);
    assert(`A.2 ${k} has at least one candidate`,
      VNEXT_CANDIDATES.some(c => c.klass === k));
  }
  assert('A.3 all six defect classes are covered and none is invented',
    new Set(VNEXT_CANDIDATES.map(c => c.klass)).size === VNEXT_CLASSES.length);
  assert('A.4 candidate ids are unique',
    new Set(VNEXT_CANDIDATES.map(c => c.id)).size === VNEXT_CANDIDATES.length);

  for (const c of VNEXT_CANDIDATES) {
    assert(`A.5 ${c.id} names what it does NOT decide`,
      c.build === 'RECORDED_ONLY' || c.requiresHumanTruth.length > 0);
    assert(`A.6 ${c.id} justifies all three scores`,
      c.score.valueWhy.length > 40 && c.score.feasibilityWhy.length > 40
      && c.score.riskWhy.length > 40);
    assert(`A.7 ${c.id} states its hosted validation`,
      c.build === 'RECORDED_ONLY' ? c.hostedValidation.length > 0 : c.hostedValidation.length > 40);
    assert(`A.8 ${c.id} declares its prose fields`,
      Array.isArray(c.newFreeTextFields));
    assert(`A.9 ${c.id} PROTOTYPED iff it carries patches`,
      (c.build === 'PROTOTYPED')
      === (c.promptPatches.length > 0 || c.schemaPatches.length > 0));
    for (const d of c.dependsOn) {
      assert(`A.10 ${c.id} dependency ${d} exists`, !!candidateById(d));
    }
  }
  assert('A.11 the two deliberately-unbuilt candidates carry no patches and say why',
    ['C3b_UNBOUNDED_CLARIFICATION_ARRAY', 'C5b_AUTHORED_SUFFICIENCY_MATRIX'].every(id => {
      const c = candidateById(id);
      return c.build === 'RECORDED_ONLY' && c.promptPatches.length === 0
        && c.schemaPatches.length === 0 && c.summary.length > 300;
    }));
  assert('A.12 the module declares it is not a protocol version and grades nothing',
    CANDIDATE_STATUS.IS_A_PROTOCOL_VERSION === false
    && CANDIDATE_STATUS.REACHABLE_FROM_PRODUCTION === false
    && CANDIDATE_STATUS.SECTION_200_VERDICT_SLOTS_FILLED_BY_THIS_MODULE === 0
    && CANDIDATE_STATUS.DERIVED_FROM_ANY_SECTION_199_SEMANTIC_VERDICT === false);
  assert('A.13 no §200 semantic verdict vocabulary appears anywhere in the registry',
    !/\b(PARTIALLY_CORRECT|TRUTH_SPECIFICATION_DEFECT)\b/
      .test(JSON.stringify(VNEXT_CANDIDATES) + JSON.stringify(STRUCTURAL_DEFECTS)));
  assert('A.14 no §199 row identifier appears anywhere in the registry',
    !/\bSF-\d{2}\b|\bSG-\d{2}\b|\bHR-\d{2}\b|\bFV-\d{2}\b/
      .test(JSON.stringify(VNEXT_CANDIDATES) + JSON.stringify(STRUCTURAL_DEFECTS)));
  assert('A.15 the ranking is COMPUTED from the scores, not written down',
    rankedCandidates().every((c, i, a) =>
      i === 0 || candidateRank(a[i - 1]) >= candidateRank(c)));
  assert('A.16 every open question is recorded rather than resolved silently',
    OPEN_QUESTIONS_FOR_AUTHORIZATION.length >= 4);
  assert('A.17 the rule classification names at least as many human-truth conditions as '
    + 'deterministic ones are claimed for',
    Object.values(VNEXT_ADMISSION_RULE_CLASSIFICATION)
      .filter(v => v === 'REQUIRES_HUMAN_TRUTH').length >= 5);
  assert('A.18 no candidate may settle a fact, create a citation or move a priority',
    (() => {
      const e = vnextCandidateEffect();
      return e.settlementMayOccur === false && e.challengeMaySettleAFact === false
        && e.citationsMayChange === false && e.priorityMayChange === false
        && e.candidatesMayChange === false && e.regulatoryTruthMayBeCreated === false;
    })());

  console.log('\n  ranking, computed as (value x feasibility) / risk:');
  for (const c of rankedCandidates()) {
    console.log(`    ${candidateRank(c).toFixed(2).padStart(6)}  ${c.build.padEnd(19)} ${c.id}`);
  }

  // ==================================================================== B
  console.log('\nB. CONSTRUCTION AND REVERSIBILITY — every candidate reverts to v3.2 exactly\n');

  for (const id of PROTOTYPED_IDS) {
    const a = applyCandidates([id]);
    const r = revertCandidates(a);
    assert(`B.1 ${id} prompt reverts byte-identically`, r.prompt === EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);
    assert(`B.2 ${id} schema reverts byte-identically`,
      JSON.stringify(r.schema) === JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));
    const c = candidateById(id);
    if (c.promptPatches.length > 0) {
      assert(`B.3 ${id} actually changed the prompt`,
        a.prompt !== EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT
        && c.promptPatches.every(p => a.prompt.includes(p.lines.join('\n'))));
    }
    if (c.schemaPatches.length > 0) {
      assert(`B.4 ${id} actually changed the schema`,
        JSON.stringify(a.schema) !== JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));
    }
  }

  const ALL = applyCandidates(PROTOTYPED_IDS);
  const ALL_REVERTED = revertCandidates(ALL);
  assert('B.5 ALL candidates applied together revert to the v3.2 prompt byte-identically',
    ALL_REVERTED.prompt === EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);
  assert('B.6 ALL candidates applied together revert to the v3.2 schema byte-identically',
    JSON.stringify(ALL_REVERTED.schema) === JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));

  const REVERSED = applyCandidates([...PROTOTYPED_IDS].reverse());
  assert('B.7 reverting is order-independent — a reversed application also reverts exactly',
    revertCandidates(REVERSED).prompt === EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT
    && JSON.stringify(revertCandidates(REVERSED).schema)
      === JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));

  assert('B.8 applying against a drifted base ABORTS rather than guessing',
    (() => {
      try {
        applyPromptPatches('a prompt containing none of the anchors', ['C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE']);
        return false;
      } catch (e) { return /ABORT/.test(String(e)); }
    })());
  assert('B.9 applying the same schema patch twice ABORTS',
    (() => {
      try {
        applySchemaPatches(applySchemaPatches(VERIFIER_V3_2_RESPONSE_SCHEMA, ['C2a_SETTLEMENT_TEST']),
          ['C2a_SETTLEMENT_TEST']);
        return false;
      } catch (e) { return /ABORT/.test(String(e)); }
    })());
  assert('B.10 every prompt patch records WHY it is placed where it is',
    VNEXT_CANDIDATES.every(c => c.promptPatches.every(p => p.placementRationale.length > 80)));

  assert('B.11 v3.2 is BYTE-UNCHANGED after every application and revert above',
    sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT) === BASE_PROMPT_SHA
    && sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)) === BASE_SCHEMA_SHA);

  // ==================================================================== C
  console.log('\nC. GRAMMAR COST — additive growth is measured, never assumed free\n');

  const base = grammarCost(VERIFIER_V3_2_RESPONSE_SCHEMA);
  console.log(`  v3.2 base: ${base.bytes} bytes, ${base.nodes} nodes, ${base.enumMembers} enum `
    + `members, ${base.descriptionBytes} description bytes, ${base.requiredEntries} required\n`);
  console.log('  candidate                                             bytes  nodes  enums  desc');
  for (const id of PROTOTYPED_IDS) {
    const d = costDelta(base, grammarCost(applyCandidates([id]).schema));
    console.log(`    ${id.padEnd(50)} ${String(d.bytes).padStart(5)} `
      + `${String(d.nodes).padStart(6)} ${String(d.enumMembers).padStart(6)} `
      + `${String(d.descriptionBytes).padStart(5)}`);
    assert(`C.1 ${id} cost is non-negative on every measure`,
      d.bytes >= 0 && d.nodes >= 0 && d.enumMembers >= 0 && d.descriptionBytes >= 0);
  }
  const allCost = grammarCost(ALL.schema);
  const allDelta = costDelta(base, allCost);
  console.log(`\n  ALL prototyped: +${allDelta.bytes} bytes, +${allDelta.nodes} nodes, `
    + `+${allDelta.enumMembers} enum members, +${allDelta.descriptionBytes} description bytes`);
  console.log(`  resulting verifier schema: ${allCost.bytes} bytes, ${allCost.nodes} nodes, `
    + `${allCost.enumMembers} enum members`);
  console.log(`  §199 FIRST-PASS reference: ${SECTION_199_GRAMMAR_REFERENCE
    .firstPassCapabilityAbsentBytes} accepted / `
    + `${SECTION_199_GRAMMAR_REFERENCE.firstPassCapabilityPresentBytes} REJECTED — a DIFFERENT `
    + 'request, bounding nothing here.');

  assert('C.2 the cost of applying everything is strictly positive — growth is not free',
    allDelta.bytes > 0 && allDelta.nodes > 0);
  assert('C.3 the §199 reference records that the provider metric is grammar, not bytes',
    SECTION_199_GRAMMAR_REFERENCE.providerMetric === 'COMPILED_GRAMMAR_COMPLEXITY_NOT_BYTES'
    && SECTION_199_GRAMMAR_REFERENCE.thresholdIsDocumented === false
    && SECTION_199_GRAMMAR_REFERENCE.appliesToTheVerifierRequest === false);
  {
    const enumDelta = (id: string): number =>
      costDelta(base, grammarCost(applyCandidates([id]).schema)).enumMembers;
    const adders = PROTOTYPED_IDS.filter(id => enumDelta(id) > 0);
    assert('C.4 four prototyped candidates add enum members, and enum alternation is the construct '
      + '§200 names as expanding worst — so this is the figure to watch, not bytes',
      adders.length === 4, adders.map(id => `${id}+${enumDelta(id)}`).join(', '));
    assert('C.4b the most expensive on that measure is C3a, which repeats the entire '
      + 'affectedDecision alternation for its second slot',
      enumDelta('C3a_SECOND_CLARIFICATION_SLOT') === 6
      && adders.every(id => enumDelta(id) <= enumDelta('C3a_SECOND_CLARIFICATION_SLOT')));
    assert('C.4c the highest-ranked candidate is NOT the most expensive one — C6a adds 3',
      enumDelta('C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE') === 3);
  }
  assert('C.5 a transport canary is required before anything is sent',
    SECTION_199_GRAMMAR_REFERENCE.requiredValidation
      === 'OFFLINE_REQUEST_BUILD_THEN_SINGLE_ROW_TRANSPORT_CANARY');

  // ==================================================================== D
  console.log('\nD. BOUNDARY PROPERTIES — each candidate admits the legal state and refuses each '
    + 'illegal one\n');

  // ---- D.0 non-interference
  assert('D.0a with NO candidate enabled, a v3.2-admitted verdict is still admitted',
    checkVnextOutput(baseVerified(), INPUT, []).admitted
    && checkVerifierV3_2Output(baseVerified(), INPUT).admitted);
  assert('D.0b with NO candidate enabled, the codes are exactly v3.2\'s',
    JSON.stringify(checkVnextOutput(baseAdd(), INPUT, []).codes)
    === JSON.stringify(checkVerifierV3_2Output(baseAdd(), INPUT).codes));
  assert('D.0c a v3.2 refusal is never rescued by enabling candidates',
    (() => {
      const bad = baseAdd(); bad.bindingFactKey = 'owed:generic:not_supplied';
      const r = checkVnextOutput(bad, INPUT, PROTOTYPED_IDS);
      return !r.admitted && codesOf(r).includes('BINDING_KEY_NOT_IN_SUPPLIED_SET');
    })());

  // ---- D.1 C1a restatement
  {
    const ID = 'C1a_OWED_PROPERTY_RESTATEMENT';
    const ok = withRestatements(baseAdd(), { [KEY_A]: 'whether the collar was tightened after the '
      + 'shaft went back on', [KEY_B]: null });
    assert('D.1a a bound fact naming its property is admitted',
      checkVnextOutput(ok, INPUT, [ID]).admitted);
    const missing = withRestatements(baseAdd(), { [KEY_A]: null, [KEY_B]: null });
    assert('D.1b a bound fact naming no property is REFUSED',
      codesOf(checkVnextOutput(missing, INPUT, [ID]))
        .includes('OWED_PROPERTY_RESTATEMENT_MISSING'));
    const stray = withRestatements(baseAdd(), { [KEY_A]: 'the collar torque', [KEY_B]: 'something' });
    assert('D.1c a STILL_UNRESOLVED fact carrying a property is REFUSED',
      codesOf(checkVnextOutput(stray, INPUT, [ID]))
        .includes('OWED_PROPERTY_RESTATEMENT_WITHOUT_A_BINDING_OR_CHALLENGE'));
    const chal = withRestatements(baseChallenge(), { [KEY_A]: null, [KEY_B]: null });
    assert('D.1d a CHALLENGED fact naming no property is REFUSED too',
      codesOf(checkVnextOutput(chal, INPUT, [ID]))
        .includes('OWED_PROPERTY_RESTATEMENT_MISSING'));
    assert('D.1e nothing checks the restatement for correctness — an absurd property is admitted',
      checkVnextOutput(withRestatements(baseAdd(),
        { [KEY_A]: 'the colour of the walkway', [KEY_B]: null }), INPUT, [ID]).admitted);
  }

  // ---- D.2 C1b discrimination
  {
    const ID = 'C1b_NEAREST_NEIGHBOUR_DISCRIMINATION';
    const ok = baseAdd();
    ok.targetDiscrimination = { nearestOtherFactKey: KEY_B,
      whyNotThatOne: 'that one is about the lamp circuit, not the fastening.' };
    assert('D.2a a binding discriminating from another supplied key is admitted',
      checkVnextOutput(ok, INPUT, [ID]).admitted);
    assert('D.2b a binding with two facts supplied and no discrimination is REFUSED',
      codesOf(checkVnextOutput(baseAdd(), INPUT, [ID])).includes('TARGET_DISCRIMINATION_MISSING'));
    const self = baseAdd();
    self.targetDiscrimination = { nearestOtherFactKey: KEY_A, whyNotThatOne: 'x' };
    assert('D.2c naming the BOUND key as its own neighbour is REFUSED',
      codesOf(checkVnextOutput(self, INPUT, [ID]))
        .includes('TARGET_DISCRIMINATION_KEY_EQUALS_THE_BINDING_KEY'));
    const invented = baseAdd();
    invented.targetDiscrimination = { nearestOtherFactKey: 'owed:generic:invented',
      whyNotThatOne: 'x' };
    assert('D.2d an INVENTED neighbour key is REFUSED — closed-set membership, exact equality',
      codesOf(checkVnextOutput(invented, INPUT, [ID]))
        .includes('TARGET_DISCRIMINATION_KEY_NOT_IN_SUPPLIED_SET'));
    const single = baseAdd();
    single.owedFactDeclarations = [single.owedFactDeclarations[0]];
    assert('D.2e with ONE fact supplied the field is not owed and its absence is admitted',
      checkVnextOutput(single, ONE_FACT_INPUT, [ID]).admitted);
    const singleWith = { ...single,
      targetDiscrimination: { nearestOtherFactKey: KEY_B, whyNotThatOne: 'x' } };
    assert('D.2f with ONE fact supplied a discrimination is REFUSED — there is no neighbour',
      codesOf(checkVnextOutput(singleWith, ONE_FACT_INPUT, [ID]))
        .includes('TARGET_DISCRIMINATION_PRESENT_WITHOUT_A_BINDING'));
  }

  // ---- D.3 C2a settlement test
  {
    const ID = 'C2a_SETTLEMENT_TEST';
    const mk = (t: any): any => { const o = baseAdd(); o.proposedClarification.settlementTest = t; return o; };
    const good = {
      answerEstablishing: 'It was torqued to 60 Nm after the refit and signed for.',
      answerRefuting: 'It was never re-torqued after the refit.',
      decisionIfEstablishing: 'The line runs.',
      decisionIfRefuting: 'The line stays stopped until the collar is torqued and checked.',
    };
    assert('D.3a a proposal carrying a diverging settlement test is admitted',
      checkVnextOutput(mk(good), INPUT, [ID]).admitted);
    assert('D.3b a proposal with NO settlement test is REFUSED',
      codesOf(checkVnextOutput(baseAdd(), INPUT, [ID])).includes('SETTLEMENT_TEST_MISSING'));
    assert('D.3c identical answers are REFUSED',
      codesOf(checkVnextOutput(mk({ ...good, answerRefuting: good.answerEstablishing }), INPUT,
        [ID])).includes('SETTLEMENT_ANSWERS_IDENTICAL'));
    assert('D.3d non-diverging decisions are REFUSED — the same rule the nomination path runs',
      codesOf(checkVnextOutput(mk({ ...good, decisionIfRefuting: good.decisionIfEstablishing }),
        INPUT, [ID])).includes('SETTLEMENT_DECISIONS_DO_NOT_DIVERGE'));
    assert('D.3e an empty field is REFUSED',
      codesOf(checkVnextOutput(mk({ ...good, decisionIfRefuting: '   ' }), INPUT, [ID]))
        .includes('SETTLEMENT_TEST_FIELD_MISSING'));
    assert('D.3f the check is BYTE inequality only — two answers differing by one word are '
      + 'admitted, and this is why the condition is necessary and never sufficient',
      checkVnextOutput(mk({ ...good, answerRefuting: 'It was torqued to 61 Nm after the refit and '
        + 'signed for.' }), INPUT, [ID]).admitted);
    const nonAdd = baseVerified();
    nonAdd.proposedClarification = { settlementTest: good };
    assert('D.3g a settlement test without a proposed question is REFUSED by v3.2 or by C2a',
      !checkVnextOutput(nonAdd, INPUT, [ID]).admitted);
  }

  // ---- D.4 C2b accepted evidence, property-relative
  {
    const ID = 'C2b_ACCEPTED_EVIDENCE_BOUND_TO_SUPPLIED_CRITERION';
    const mk = (ae: any): any => { const o = baseAdd(); o.acceptedEvidence = ae; return o; };
    assert('D.4a a class copied from the fact\'s own acceptable examples is admitted',
      checkVnextOutput(mk({ evidenceClass: 'A_TORQUE_VALUE_RECORDED_AFTER_THE_REFIT',
        boundTo: 'SUPPLIED_ACCEPTABLE_EXAMPLE' }), INPUT, [ID]).admitted);
    assert('D.4b a class on THIS fact\'s insufficient list is REFUSED — property-relative',
      codesOf(checkVnextOutput(mk({ evidenceClass: 'A_STATUS_LAMP_IS_LIT',
        boundTo: 'SUPPLIED_INSUFFICIENT_EXAMPLE' }), INPUT, [ID]))
        .includes('CLARIFICATION_ACCEPTS_EVIDENCE_DECLARED_INSUFFICIENT_FOR_THIS_FACT'));
    assert('D.4c the SAME class is admitted for a fact whose criterion does not name it — the '
      + 'rule is never a blanket statement about an evidence class',
      (() => {
        const o = baseAdd();
        o.bindingFactKey = KEY_B;
        o.owedFactDeclarations = [
          { factKey: KEY_A, declaration: 'STILL_UNRESOLVED', challengeReason: null },
          { factKey: KEY_B, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
        ];
        o.acceptedEvidence = { evidenceClass: 'A_STATUS_LAMP_IS_LIT',
          boundTo: 'NOT_AMONG_THOSE_SUPPLIED' };
        return checkVnextOutput(o, INPUT, [ID]).admitted;
      })());
    assert('D.4d a declared list that disagrees with where the string actually appears is REFUSED',
      codesOf(checkVnextOutput(mk({ evidenceClass: 'A_TORQUE_VALUE_RECORDED_AFTER_THE_REFIT',
        boundTo: 'NOT_AMONG_THOSE_SUPPLIED' }), INPUT, [ID]))
        .includes('ACCEPTED_EVIDENCE_BINDING_DISAGREES_WITH_THE_SUPPLIED_LISTS'));
    assert('D.4e a non-member boundTo is REFUSED',
      codesOf(checkVnextOutput(mk({ evidenceClass: 'x', boundTo: 'PROBABLY_FINE' }), INPUT, [ID]))
        .includes('ACCEPTED_EVIDENCE_BINDING_NOT_A_MEMBER'));
    assert('D.4f a bound clarification with no acceptedEvidence is REFUSED',
      codesOf(checkVnextOutput(baseAdd(), INPUT, [ID])).includes('ACCEPTED_EVIDENCE_MISSING'));
    assert('D.4g acceptedEvidence on a verdict with no bound clarification is REFUSED',
      (() => { const o = baseVerified(); o.acceptedEvidence = { evidenceClass: 'x',
        boundTo: 'NOT_AMONG_THOSE_SUPPLIED' };
        return codesOf(checkVnextOutput(o, INPUT, [ID]))
          .includes('ACCEPTED_EVIDENCE_PRESENT_WITHOUT_A_BOUND_CLARIFICATION'); })());

    // the provenance gate — the leak surface
    assert('D.4h a DEVELOPMENT_HUMAN_TRUTH criterion is NOT renderable — grading truth never '
      + 'reaches a prompt',
      renderableAcceptableEvidence({ factKey: KEY_A, acceptableEvidence: {
        ...SUPPLIED_FACTS[0].acceptableEvidence!, provenance: 'DEVELOPMENT_HUMAN_TRUTH' } }) === null);
    assert('D.4i an ADJUDICATION_LABEL criterion is NOT renderable',
      renderableAcceptableEvidence({ factKey: KEY_A, acceptableEvidence: {
        ...SUPPLIED_FACTS[0].acceptableEvidence!, provenance: 'ADJUDICATION_LABEL' } }) === null);
    assert('D.4j a MODEL_SELF_AUTHORED criterion is NOT renderable',
      renderableAcceptableEvidence({ factKey: KEY_A, acceptableEvidence: {
        ...SUPPLIED_FACTS[0].acceptableEvidence!, provenance: 'MODEL_SELF_AUTHORED' } }) === null);
    assert('D.4k a null criterion is renderable-as-null and refuses nothing',
      renderableAcceptableEvidence({ factKey: KEY_B, acceptableEvidence: null }) === null);
    assert('D.4l with a NON-PERMITTED provenance the gate does not fire — the same class that '
      + 'was refused at D.4b is admitted, because nothing authorised the criterion',
      (() => {
        const leaked: VnextAdmissionInput = { ...INPUT, suppliedFacts: [
          { factKey: KEY_A, acceptableEvidence: {
            ...SUPPLIED_FACTS[0].acceptableEvidence!, provenance: 'DEVELOPMENT_HUMAN_TRUTH' } },
          SUPPLIED_FACTS[1],
        ] };
        return checkVnextOutput(mk({ evidenceClass: 'A_STATUS_LAMP_IS_LIT',
          boundTo: 'NOT_AMONG_THOSE_SUPPLIED' }), leaked, [ID]).admitted;
      })());
  }

  // ---- D.5 C3a second slot
  {
    const ID = 'C3a_SECOND_CLARIFICATION_SLOT';
    const two = (): any => {
      const o = baseAdd();
      o.additionalProposedClarification = {
        question: 'Does the green lamp above the panel report the protective circuit, or only '
          + 'that control power is on?',
        whyItMatters: 'The two readings lead to different action now.',
        affectedDecision: 'REQUIRED_CONTROL',
        evidenceGap: 'Nothing supplied states what the lamp reports.',
        bindingFactKey: KEY_B,
      };
      o.owedFactDeclarations[1].declaration = 'BOUND_BY_CLARIFICATION';
      return o;
    };
    assert('D.5a v3.2 ALONE refuses a legal two-binding verdict — the representation forces '
      + 'compounding, which is the structural argument for this class',
      (() => {
        const r = checkVerifierV3_2Output(two(), INPUT);
        return !r.admitted
          && (r.codes as string[]).includes('MORE_THAN_ONE_FACT_DECLARED_BOUND');
      })());
    const r = checkVnextOutput(two(), INPUT, [ID]);
    assert('D.5b with C3a enabled the two frozen refusals are WITHDRAWN and the verdict admitted',
      r.admitted && r.secondSlotWithdrawalApplied
      && !(r.codes as string[]).includes('MORE_THAN_ONE_FACT_DECLARED_BOUND'));
    assert('D.5c the withdrawal removes the two detail strings too, not just the codes',
      !r.detail.some(d => /declared bound but bindingFactKey/.test(d)));
    assert('D.5d a second slot binding the SAME fact is REFUSED',
      (() => { const o = two(); o.additionalProposedClarification.bindingFactKey = KEY_A;
        return !checkVnextOutput(o, INPUT, [ID]).admitted; })());
    assert('D.5e a second slot binding an INVENTED key is REFUSED',
      (() => { const o = two(); o.additionalProposedClarification.bindingFactKey = 'owed:nope';
        return codesOf(checkVnextOutput(o, INPUT, [ID]))
          .includes('SECOND_CLARIFICATION_KEY_NOT_IN_SUPPLIED_SET'); })());
    assert('D.5f a second slot with no first is REFUSED',
      (() => { const o = two(); o.proposedClarification = null; o.bindingFactKey = null;
        o.clarificationSourceMode = null;
        return !checkVnextOutput(o, INPUT, [ID]).admitted; })());
    assert('D.5g a second slot under a non-ADD verdict is REFUSED',
      (() => { const o = baseVerified();
        o.additionalProposedClarification = two().additionalProposedClarification;
        return codesOf(checkVnextOutput(o, INPUT, [ID]))
          .includes('SECOND_CLARIFICATION_UNDER_A_NON_ADD_VERDICT'); })());
    assert('D.5h a second slot whose fact is not declared BOUND is REFUSED',
      (() => { const o = two(); o.owedFactDeclarations[1].declaration = 'STILL_UNRESOLVED';
        return !checkVnextOutput(o, INPUT, [ID]).admitted; })());
    assert('D.5i WITHOUT C3a enabled the same verdict stays REFUSED — the withdrawal is not '
      + 'ambient',
      !checkVnextOutput(two(), INPUT, []).admitted);
    assert('D.5j the withdrawal does NOT fire when another objection is also standing',
      (() => { const o = two(); o.rationale = '';
        const rr = checkVnextOutput(o, INPUT, [ID]);
        return !rr.admitted && !rr.secondSlotWithdrawalApplied
          && (rr.codes as string[]).includes('MORE_THAN_ONE_FACT_DECLARED_BOUND'); })());
  }

  // ---- D.6 C4a temporal scope
  {
    const ID = 'C4a_TEMPORAL_SCOPE_DECLARATION';
    const mk = (ts: any): any => { const o = baseAdd(); o.proposedClarification.temporalScope = ts; return o; };
    assert('D.6a a named-event scope carrying its moment is admitted',
      checkVnextOutput(mk({ scope: 'AT_OR_BEFORE_A_NAMED_EVENT',
        moment: 'before the shaft was refitted' }), INPUT, [ID]).admitted);
    assert('D.6b NOT_TIME_DEPENDENT with a null moment is admitted',
      checkVnextOutput(mk({ scope: 'NOT_TIME_DEPENDENT', moment: null }), INPUT, [ID]).admitted);
    assert('D.6c a named-event scope with no moment is REFUSED',
      codesOf(checkVnextOutput(mk({ scope: 'BETWEEN_TWO_NAMED_EVENTS', moment: null }), INPUT,
        [ID])).includes('TEMPORAL_MOMENT_MISSING_FOR_AN_EVENT_SCOPE'));
    assert('D.6d a moment on a non-event scope is REFUSED',
      codesOf(checkVnextOutput(mk({ scope: 'STATE_AT_THE_TIME_OF_ANSWER', moment: 'now' }), INPUT,
        [ID])).includes('TEMPORAL_MOMENT_PRESENT_WITHOUT_AN_EVENT_SCOPE'));
    assert('D.6e an invented scope member is REFUSED',
      codesOf(checkVnextOutput(mk({ scope: 'WITHIN_THE_LAST_SIX_MONTHS', moment: null }), INPUT,
        [ID])).includes('TEMPORAL_SCOPE_NOT_A_MEMBER'));
    assert('D.6f a proposal with no temporal scope is REFUSED',
      codesOf(checkVnextOutput(baseAdd(), INPUT, [ID])).includes('TEMPORAL_SCOPE_MISSING'));
    {
      // The MEMBERS, not the surrounding prose: the brake text deliberately uses the words
      // "interval", "schedule" and "age" to DENY them, and scanning the description would fail
      // the check for saying the right thing.
      const node = (applyCandidates([ID]).schema as any).properties.proposedClarification
        .properties.temporalScope;
      const members: string[] = node.properties.scope.enum;
      assert('D.6g no vocabulary MEMBER is an interval, an age or a schedule — §176 spent a whole '
        + 'remediation denying that reading and the enum must not smuggle it back',
        members.length === 4
        && members.every(mm =>
          !/MONTH|YEAR|DAY|WEEK|HOUR|INTERVAL|OVERDUE|EXPIR|SCHEDULE|RECENT|STALE|AGE|DUE/i
            .test(mm)),
        members.join(', '));
      assert('D.6h and the description states the denial explicitly rather than leaving it implied',
        /never about age/i.test(String(node.description)));
    }
  }

  // ---- D.7 C6a challenge reviewability
  {
    const ID = 'C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE';
    const established = (): any => {
      const o = baseChallenge();
      o.owedFactDeclarations[1] = { factKey: KEY_B, declaration: 'CHALLENGE_FACT_VALIDITY',
        challengeReason: 'The observation states the lamp condition throughout.',
        challengeGround: 'THE_OBSERVATION_ALREADY_ESTABLISHES_IT',
        challengeObservationSpan: 'A green lamp above the panel was lit throughout.',
        commonActionUnderBothBranches: null };
      o.owedFactDeclarations[0].challengeGround = null;
      o.owedFactDeclarations[0].challengeObservationSpan = null;
      o.owedFactDeclarations[0].commonActionUnderBothBranches = null;
      return o;
    };
    const sameAction = (): any => {
      const o = established();
      o.owedFactDeclarations[1] = { ...o.owedFactDeclarations[1],
        challengeGround: 'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',
        challengeObservationSpan: null,
        commonActionUnderBothBranches: 'The line stays stopped until the collar is checked '
          + 'either way.' };
      return o;
    };
    assert('D.7a a challenge on the ESTABLISHES ground with a verbatim span is admitted',
      checkVnextOutput(established(), INPUT, [ID]).admitted);
    assert('D.7b a challenge on the SAME_ACTION ground with its common action is admitted',
      checkVnextOutput(sameAction(), INPUT, [ID]).admitted);
    assert('D.7c a challenge with NO ground is REFUSED',
      (() => { const o = established(); o.owedFactDeclarations[1].challengeGround = null;
        return codesOf(checkVnextOutput(o, INPUT, [ID])).includes('CHALLENGE_GROUND_MISSING'); })());
    assert('D.7d an ESTABLISHES challenge with no span is REFUSED — the asymmetry with the '
      + 'nomination rule is closed',
      (() => { const o = established(); o.owedFactDeclarations[1].challengeObservationSpan = null;
        return codesOf(checkVnextOutput(o, INPUT, [ID]))
          .includes('CHALLENGE_SPAN_MISSING_FOR_THE_ESTABLISHES_GROUND'); })());
    assert('D.7e a PARAPHRASED span is REFUSED — containment, the exact nomination check',
      (() => { const o = established();
        o.owedFactDeclarations[1].challengeObservationSpan = 'A green lamp was on the whole time.';
        return codesOf(checkVnextOutput(o, INPUT, [ID])).includes('CHALLENGE_SPAN_NOT_VERBATIM'); })());
    assert('D.7f a SAME_ACTION challenge with no common action is REFUSED',
      (() => { const o = sameAction();
        o.owedFactDeclarations[1].commonActionUnderBothBranches = null;
        return codesOf(checkVnextOutput(o, INPUT, [ID]))
          .includes('COMMON_ACTION_MISSING_FOR_THE_SAME_ACTION_GROUND'); })());
    assert('D.7g evidence for the WRONG ground is REFUSED in both directions',
      (() => { const a = established();
        a.owedFactDeclarations[1].commonActionUnderBothBranches = 'nothing changes';
        const b = sameAction();
        b.owedFactDeclarations[1].challengeObservationSpan = 'A green lamp above the panel was lit '
          + 'throughout.';
        return codesOf(checkVnextOutput(a, INPUT, [ID]))
          .includes('COMMON_ACTION_PRESENT_ON_THE_WRONG_GROUND')
          && codesOf(checkVnextOutput(b, INPUT, [ID]))
            .includes('CHALLENGE_SPAN_PRESENT_ON_THE_WRONG_GROUND'); })());
    assert('D.7h a NON-challenged fact carrying a ground is REFUSED',
      (() => { const o = established();
        o.owedFactDeclarations[0].challengeGround = 'THE_OBSERVATION_ALREADY_ESTABLISHES_IT';
        return codesOf(checkVnextOutput(o, INPUT, [ID]))
          .includes('CHALLENGE_GROUND_WITHOUT_A_CHALLENGE'); })());
    assert('D.7i an invented ground is REFUSED',
      (() => { const o = established();
        o.owedFactDeclarations[1].challengeGround = 'IT_IS_NOT_DECISION_CRITICAL';
        return codesOf(checkVnextOutput(o, INPUT, [ID]))
          .includes('CHALLENGE_GROUND_NOT_A_MEMBER'); })());

    // the projection
    const pk = reviewableArbitrationRequests(established(), INPUT,
      checkVnextOutput(established(), INPUT, [ID]));
    assert('D.7j the arbitration packet carries the ground, the span and its verification',
      pk.length === 1 && pk[0].ground === 'THE_OBSERVATION_ALREADY_ESTABLISHES_IT'
      && pk[0].spanVerbatimVerified === true && pk[0].factKey === KEY_B);
    assert('D.7k the packet still SETTLES NOTHING and leaves the fact status unchanged',
      pk[0].settles === false && pk[0].factStatusUnchanged === true);
    assert('D.7l a REFUSED verdict produces no packet at all — refused evidence is never '
      + 'presented to a reviewer as though it had been accepted',
      (() => {
        const bad = established();
        bad.owedFactDeclarations[1].challengeObservationSpan = 'a span nobody wrote';
        const rr = checkVnextOutput(bad, INPUT, [ID]);
        return !rr.admitted && reviewableArbitrationRequests(bad, INPUT, rr).length === 0;
      })());
    {
      // The property NAMES, not the serialised blob: STILL_UNRESOLVED contains "resolved", so a
      // substring scan over the JSON would fail on the base contract's own vocabulary.
      const names = Object.keys((applyCandidates([ID]).schema as any).properties
        .owedFactDeclarations.items.properties);
      assert('D.7m no field name on a declaration could carry a settlement',
        !names.some(n =>
          /^(settled|resolved|covered|rejected|granted|notDecisionCritical|factNotDecisionCritical)$/
            .test(n)), names.join(', '));
    }
    assert('D.7n candidate fields are refused at the TRANSPORT by additionalProperties:false, '
      + 'which is the only thing that refuses an unknown property — the admission layer refuses '
      + 'named forbidden fields, not unnamed ones',
      (applyCandidates([ID]).schema as any).properties.owedFactDeclarations.items
        .additionalProperties === false
      && (VERIFIER_V3_2_RESPONSE_SCHEMA as any).additionalProperties === false);
  }

  // ---- D.8 C5a review pair
  {
    const IDS = ['C1a_OWED_PROPERTY_RESTATEMENT',
      'C2b_ACCEPTED_EVIDENCE_BOUND_TO_SUPPLIED_CRITERION'];
    const o = withRestatements(baseAdd(),
      { [KEY_A]: 'whether the collar was tightened after the refit', [KEY_B]: null });
    o.acceptedEvidence = { evidenceClass: 'A_TORQUE_VALUE_RECORDED_AFTER_THE_REFIT',
      boundTo: 'SUPPLIED_ACCEPTABLE_EXAMPLE' };
    const res = checkVnextOutput(o, INPUT, IDS);
    const pairs = sufficiencyReviewPairs(o, INPUT, res);
    assert('D.8a the review pair is assembled from an admitted verdict',
      res.admitted && pairs.length === 1
      && pairs[0].owedPropertyAsUnderstood.length > 0
      && pairs[0].acceptedEvidenceClass === 'A_TORQUE_VALUE_RECORDED_AFTER_THE_REFIT');
    assert('D.8b it carries the governed requirement beside the pair',
      pairs[0].governedRequirement !== null);
    assert('D.8c the relation is REQUIRES_HUMAN_TRUTH and the projection settles nothing',
      pairs[0].relation === 'REQUIRES_HUMAN_TRUTH' && pairs[0].settles === false);
    assert('D.8d a REFUSED verdict produces no pair — refused fields are not presented as accepted',
      (() => {
        const bad = JSON.parse(JSON.stringify(o));
        bad.acceptedEvidence = { evidenceClass: 'A_STATUS_LAMP_IS_LIT',
          boundTo: 'SUPPLIED_INSUFFICIENT_EXAMPLE' };
        const rr = checkVnextOutput(bad, INPUT, IDS);
        return !rr.admitted && sufficiencyReviewPairs(bad, INPUT, rr).length === 0;
      })());
    assert('D.8e C5a adds no field and costs no grammar',
      JSON.stringify(applyCandidates(['C5a_SUFFICIENCY_REVIEW_PAIR']).schema)
      === JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));
  }

  // ---- D.9 all candidates together
  {
    const o = withRestatements(baseAdd(),
      { [KEY_A]: 'whether the collar was tightened after the refit', [KEY_B]: null });
    o.targetDiscrimination = { nearestOtherFactKey: KEY_B,
      whyNotThatOne: 'that one is about what the lamp reports.' };
    o.proposedClarification.settlementTest = {
      answerEstablishing: 'It was torqued to 60 Nm after the refit and signed for.',
      answerRefuting: 'It was never re-torqued after the refit.',
      decisionIfEstablishing: 'The line runs.',
      decisionIfRefuting: 'The line stays stopped until the collar is torqued.',
    };
    o.proposedClarification.temporalScope = { scope: 'AT_OR_BEFORE_A_NAMED_EVENT',
      moment: 'before the line is restarted' };
    o.acceptedEvidence = { evidenceClass: 'A_TORQUE_VALUE_RECORDED_AFTER_THE_REFIT',
      boundTo: 'SUPPLIED_ACCEPTABLE_EXAMPLE' };
    o.additionalProposedClarification = null;
    for (const d of o.owedFactDeclarations) {
      d.challengeGround = null; d.challengeObservationSpan = null;
      d.commonActionUnderBothBranches = null;
    }
    const r = checkVnextOutput(o, INPUT, PROTOTYPED_IDS);
    assert('D.9a a verdict satisfying every candidate at once is admitted',
      r.admitted, r.admitted ? '' : codesOf(r).join(', '));
    assert('D.9b the result records which candidates were enabled',
      r.enabledCandidates.length === PROTOTYPED_IDS.length);
  }

  // ==================================================================== E
  console.log('\nE. THE UNSCANNED-PROSE HAZARD — every added prose field joins the citation scan\n');

  {
    const full = (): any => {
      const o = withRestatements(baseAdd(), { [KEY_A]: 'P', [KEY_B]: null });
      o.targetDiscrimination = { nearestOtherFactKey: KEY_B, whyNotThatOne: 'W' };
      o.proposedClarification.settlementTest = { answerEstablishing: 'AE', answerRefuting: 'AR',
        decisionIfEstablishing: 'DE', decisionIfRefuting: 'DR' };
      o.proposedClarification.temporalScope = { scope: 'AT_OR_BEFORE_A_NAMED_EVENT', moment: 'M' };
      o.acceptedEvidence = { evidenceClass: 'EC', boundTo: 'NOT_AMONG_THOSE_SUPPLIED' };
      o.additionalProposedClarification = { question: 'Q2', whyItMatters: 'W2',
        affectedDecision: 'REQUIRED_CONTROL', evidenceGap: 'G2', bindingFactKey: KEY_B };
      o.owedFactDeclarations[1] = { factKey: KEY_B, declaration: 'CHALLENGE_FACT_VALIDITY',
        challengeReason: 'R', owedPropertyAsUnderstood: 'P2',
        challengeGround: 'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',
        challengeObservationSpan: null, commonActionUnderBothBranches: 'CA' };
      return o;
    };
    const scanned = new Set(vnextScannedStrings(full(), PROTOTYPED_IDS));
    const markers: Array<[string, string]> = [
      ['C1a owedPropertyAsUnderstood', 'P'],
      ['C1b whyNotThatOne', 'W'],
      ['C2a answerEstablishing', 'AE'],
      ['C2a answerRefuting', 'AR'],
      ['C2a decisionIfEstablishing', 'DE'],
      ['C2a decisionIfRefuting', 'DR'],
      ['C2b evidenceClass', 'EC'],
      ['C3a question', 'Q2'],
      ['C3a whyItMatters', 'W2'],
      ['C3a evidenceGap', 'G2'],
      ['C4a moment', 'M'],
      ['C6a commonActionUnderBothBranches', 'CA'],
    ];
    for (const [label, marker] of markers) {
      assert(`E.1 ${label} is reachable from the citation scan`, scanned.has(marker));
    }
    assert('E.2 every declared newFreeTextFields entry corresponds to a scanned marker',
      VNEXT_CANDIDATES.filter(c => c.build === 'PROTOTYPED')
        .flatMap(c => c.newFreeTextFields).length === markers.length + 1,
      'the +1 is C6a challengeObservationSpan, exercised at E.4');
    assert('E.3 a candidate field is NOT scanned when its candidate is not enabled — the scan '
      + 'tracks what is actually on the wire',
      !new Set(vnextScannedStrings(full(), [])).has('P'));
    assert('E.4 a citation written into a NEW prose field is REFUSED',
      (() => { const o = full();
        o.owedFactDeclarations[0].owedPropertyAsUnderstood = 'as required by 29 CFR 1910';
        return codesOf(checkVnextOutput(o, INPUT, PROTOTYPED_IDS))
          .includes('VNEXT_CITATION_IN_A_NEW_PROSE_FIELD'); })());
    assert('E.5 a citation in a §193-scanned field is still refused by v3.2, unchanged',
      (() => { const o = baseAdd(); o.rationale = 'per 29 CFR 1910 this is required';
        return (checkVnextOutput(o, INPUT, []).codes as string[])
          .includes('PROHIBITED_REGULATORY_CITATION'); })());
    assert('E.6 the scan uses the CANONICAL §193 pattern rather than a second one',
      (() => { const o = full();
        o.owedFactDeclarations[0].owedPropertyAsUnderstood = 'section 1910.147(c)(4) applies';
        // Not citation-shaped under the canonical pattern; a second, wider pattern here would
        // make two boundaries disagree about what a citation is.
        return !codesOf(checkVnextOutput(o, INPUT, PROTOTYPED_IDS))
          .includes('VNEXT_CITATION_IN_A_NEW_PROSE_FIELD'); })());
  }

  // ==================================================================== F
  console.log('\nF. IDENTITY AND WHAT IS NOT CLAIMED\n');

  assert('F.1 the v3.2 prompt is byte-unchanged by this entire suite',
    sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT) === BASE_PROMPT_SHA);
  assert('F.2 the v3.2 schema is byte-unchanged by this entire suite',
    sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)) === BASE_SCHEMA_SHA);
  assert('F.3 no candidate is named as a protocol version',
    !VNEXT_CANDIDATES.some(c => /v3\.4|v4\b/.test(c.id + c.title)));
  assert('F.4 every prototyped candidate names at least one REQUIRES_HUMAN_TRUTH condition',
    VNEXT_CANDIDATES.filter(c => c.build === 'PROTOTYPED')
      .every(c => c.requiresHumanTruth.length >= 1));

  console.log('');
  console.log(`  v3.2 prompt sha256               ${BASE_PROMPT_SHA}`);
  console.log(`  v3.2 schema sha256               ${BASE_SCHEMA_SHA}`);
  console.log(`  ALL-candidates prompt sha256     ${sha(ALL.prompt)}`);
  console.log(`  ALL-candidates schema sha256     ${sha(JSON.stringify(ALL.schema))}`);
  for (const id of PROTOTYPED_IDS) {
    const a = applyCandidates([id]);
    console.log(`  ${id.padEnd(50)} prompt ${sha(a.prompt).slice(0, 12)}  `
      + `schema ${sha(JSON.stringify(a.schema)).slice(0, 12)}`);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0');
  console.log('SECTION_200_SEMANTIC_VERDICTS_SUPPLIED = 0');
  console.log('BEHAVIOURAL EFFICACY IS NOT ESTABLISHED BY THIS SUITE, AND NOTHING HERE IS ENABLED.');
  console.log('Every candidate needs its own preregistration, its own hashes, an offline request');
  console.log('build and a single-row transport canary before any hosted run.');
  if (failed > 0) process.exit(1);
}

main();

/** Unused re-export guard: keeps the type import honest without widening the module surface. */
export type { VnextCandidate };
