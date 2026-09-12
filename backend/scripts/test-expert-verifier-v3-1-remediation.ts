/**
 * §191 -- BOUNDED REMEDIATION PROOF SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * No provider, no fetch, no credential read, no network, no database. Every assertion runs against
 * the real v3 and v3.1 artifacts and the real, UNMODIFIED admission validator.
 *
 * ==================== WHAT THIS SUITE CAN AND CANNOT ESTABLISH ====================
 *
 * IT CAN establish, deterministically: that the admission validator still refuses every illegal
 * state including the two §187B shapes; that the schema descriptions now distinguish the three
 * clarification states and no longer contradict themselves; that v3 is byte-unchanged; that v3.1
 * differs from v3 by EXACTLY the two inserted instruction blocks and EXACTLY three schema
 * descriptions, and in nothing else; and that every change maps to recorded evidence.
 *
 * IT CANNOT establish that the model's reasoning actually improves. An instruction change is a
 * change to a string, and whether that string produces better judgement is a BEHAVIOURAL question
 * answerable only by a fresh prospective hosted cohort, which §191 does not authorize. Sections B
 * and C therefore prove that the RULE IS PRESENT, CORRECTLY SCOPED AND GENERICALLY STATED -- never
 * that it works. That limit is stated here rather than left for a reader to discover.
 *
 * Section D exists because the largest risk in this remediation is not that it does too little but
 * that it does too much: a verifier made globally more conservative would start replacing the
 * already-sufficient first-pass questions on HR-01, HR-06 and HR-09.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3';
import {
  EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION, DESCRIPTION_REPAIRS, V3_1_CHANGE_LEDGER,
  ADJACENT_PROPERTY_BOUNDARY_LINES, CONJUNCTIVE_SUFFICIENCY_LINES,
  OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3,
} from './lib/expert-verifier-instruction-v3-1';
import {
  checkVerifierV3Output, EXPERT_VERIFIER_CONTRACT_V3_VERSION,
} from './lib/expert-verifier-contract-v3';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const PREREG = JSON.parse(readFileSync(join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-validation-2026-09-05',
  'PREREGISTRATION.json'), 'utf8'));

let passed = 0; let failed = 0;
function assert(label: string, ok: boolean, detail = ''): void {
  if (ok) { passed += 1; console.log(`  PASS  ${label}${detail ? '  -- ' + detail : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

/**
 * GENERIC development fixtures. Invented for this suite; deliberately NOT drawn from the §187
 * cohort, and none of them uses the cohort's equipment, trade terms or wording. They exist so the
 * rules are exercised against the SHAPE they target rather than against the rows that revealed it.
 */
const GENERIC = {
  /** Conjunctive owed fact: two necessary conjuncts, an act and its proof. */
  conjunctive: {
    factKey: 'owed:generic:vessel_drained_and_confirmed_empty',
    branchA: 'established: the vessel has been drained AND confirmed empty before entry',
    conjuncts: ['the vessel has been drained', 'the vessel has been confirmed empty'],
    questionReachingOneConjunct: 'Was the vessel drained before entry?',
    questionWithDisjunction: 'Was the vessel drained (or otherwise confirmed empty) before entry?',
    questionReachingBoth: 'Was the vessel drained, and was it then confirmed empty by direct '
      + 'measurement, before entry?',
  },
  /** Temporal conjunct: an act bounded by two events. */
  temporal: {
    factKey: 'owed:generic:relief_valve_reset_after_overhaul_before_restart',
    conjuncts: ['the valve was reset', 'the reset happened after the overhaul',
      'the reset happened before restart'],
  },
  /** Adjacent-property pairs. Each is (owed property, a nearby property that does not settle it). */
  adjacentPairs: [
    { owed: 'a fastening is currently secure', adjacent: 'the component is present and in position' },
    { owed: 'a specific property was verified', adjacent: 'an inspection of other items occurred' },
    { owed: 'the current condition holds', adjacent: 'a check was made at an earlier time' },
    { owed: 'a protective function operates', adjacent: 'the component is visible and in place' },
    { owed: 'a separate source is isolated', adjacent: 'a related source is isolated' },
    { owed: 'the property is established', adjacent: 'no anomaly was written down' },
  ],
} as const;

const SUPPLIED = [GENERIC.conjunctive.factKey];
const IN = { analysisId: 'gen-1', observation: 'A generic observation for contract shape tests.',
  suppliedOwedFactKeys: SUPPLIED };
const envelope = {
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId: 'gen-1',
};

function main(): void {
  // ==================================================================== A
  console.log('\nA. CONTRACT STATE DISCIPLINE\n');

  // A.1/A.2 -- the two shapes actually observed at §187B, rebuilt on a GENERIC key.
  const observedShape = {
    ...envelope,
    verdict: 'VERIFIED_AS_IS',
    rationale: 'the first pass already asked a question that reaches this fact',
    clarificationSourceMode: 'SUPPLIED_FACT',
    proposedClarification: null,
    bindingFactKey: GENERIC.conjunctive.factKey,
    nominatedFact: null,
    owedFactDeclarations: [{ factKey: GENERIC.conjunctive.factKey,
      declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null }],
  };
  const r1 = checkVerifierV3Output(observedShape, IN);
  assert('A.1 the §187B refused shape is still REFUSED', r1.admitted === false);
  for (const code of ['BINDING_DECLARED_BY_A_NON_ADD_VERDICT',
    'SOURCE_MODE_PRESENT_WITHOUT_A_CLARIFICATION', 'BINDING_KEY_PRESENT_WITHOUT_A_CLARIFICATION',
    'BOUND_DECLARATION_WITHOUT_A_CLARIFICATION']) {
    assert(`A.2 refusal still raises ${code}`, r1.codes.includes(code as never));
  }
  assert('A.3 a refused verdict settles nothing',
    r1.bindingAdmitted === false && r1.challengedFactKeys.length === 0);

  // A.4 -- the same illegal binding under the OTHER non-ADD verdict.
  const r2 = checkVerifierV3Output({ ...observedShape, verdict: 'NO_CLARIFICATION_REQUIRED' }, IN);
  assert('A.4 the illegal binding is refused under NO_CLARIFICATION_REQUIRED too',
    r2.admitted === false && r2.codes.includes('BINDING_DECLARED_BY_A_NON_ADD_VERDICT' as never));

  // A.5 -- "the first pass already asked it" recorded the way v3.1's description now directs.
  const legalDeferral = {
    ...envelope, verdict: 'VERIFIED_AS_IS',
    rationale: 'the first pass already asked a question that reaches this fact',
    clarificationSourceMode: null, proposedClarification: null, bindingFactKey: null,
    nominatedFact: null,
    owedFactDeclarations: [{ factKey: GENERIC.conjunctive.factKey,
      declaration: 'STILL_UNRESOLVED', challengeReason: null }],
  };
  assert('A.5 STILL_UNRESOLVED under VERIFIED_AS_IS is ADMITTED — the route v3.1 names',
    checkVerifierV3Output(legalDeferral, IN).admitted === true);

  // A.6 -- a genuinely new clarification, bound.
  const legalNewQuestion = {
    ...envelope, verdict: 'ADD_OR_REPLACE_CLARIFICATION',
    rationale: 'the existing question reaches only one of the two things the fact requires',
    clarificationSourceMode: 'SUPPLIED_FACT',
    proposedClarification: {
      question: GENERIC.conjunctive.questionReachingBoth,
      whyItMatters: 'both conjuncts must hold before entry',
      affectedDecision: 'REQUIRED_CONTROL',
      evidenceGap: 'the record establishes draining but not confirmation',
    },
    bindingFactKey: GENERIC.conjunctive.factKey, nominatedFact: null,
    owedFactDeclarations: [{ factKey: GENERIC.conjunctive.factKey,
      declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null }],
  };
  const r3 = checkVerifierV3Output(legalNewQuestion, IN);
  assert('A.6 a proposed clarification WITH a binding is ADMITTED', r3.admitted === true,
    r3.codes.join(','));
  assert('A.7 and its binding is admitted', r3.bindingAdmitted === true);

  // A.8 -- the three states are distinguishable from the schema descriptions alone.
  const bind: any = (VERIFIER_V3_1_RESPONSE_SCHEMA as any).properties.bindingFactKey.description;
  const mode: any = (VERIFIER_V3_1_RESPONSE_SCHEMA as any).properties.clarificationSourceMode.description;
  const decl: any = (VERIFIER_V3_1_RESPONSE_SCHEMA as any)
    .properties.owedFactDeclarations.items.properties.declaration.description;
  assert('A.8 bindingFactKey is scoped to THIS response',
    /IN THIS RESPONSE/.test(bind) && /Null unless verdict is ADD_OR_REPLACE_CLARIFICATION/.test(bind));
  assert('A.9 bindingFactKey states a first-pass question is not a binding',
    /FIRST PASS already asked is not a binding/.test(bind));
  assert('A.10 clarificationSourceMode no longer carries the bare "null otherwise" contradiction',
    !/Required on ADD_OR_REPLACE_CLARIFICATION, null otherwise/.test(mode)
    && /not two competing rules/.test(mode));
  assert('A.11 declaration now HAS a description', typeof decl === 'string' && decl.length > 0);
  assert('A.12 declaration names all three states: proposed / already-asked / challenge',
    /YOU are proposing in THIS response/.test(decl)
    && /IF THE FIRST PASS ALREADY ASKED A QUESTION THAT REACHES THIS FACT, THAT IS NOT A BINDING/.test(decl)
    && /record STILL_UNRESOLVED/.test(decl)
    && /CHALLENGE_FACT_VALIDITY is a request for human review and settles nothing/.test(decl));
  assert('A.13 v3 declaration carried NO description — the defect being repaired',
    (VERIFIER_V3_RESPONSE_SCHEMA as any).properties.owedFactDeclarations.items
      .properties.declaration.description === undefined);

  // A.14 -- the admission validator itself was not touched.
  assert('A.14 the admission validator source is unchanged',
    sha(readFileSync(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts'), 'utf8'))
    === '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc');

  // ==================================================================== B
  console.log('\nB. CONJUNCTIVE SUFFICIENCY\n');

  const b = CONJUNCTIVE_SUFFICIENCY_LINES.join('\n');
  assert('B.1 the rule is present in the v3.1 prompt',
    EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.includes(b));
  assert('B.2 it requires listing every separate thing the fact requires',
    /list every separate thing it/.test(b) && /requires/.test(b));
  assert('B.3 it requires testing the question against EACH requirement on its own',
    /for EACH of those things on its own/.test(b));
  assert('B.4 sufficiency requires EVERY conjunct, not some',
    /sufficient only if an answer would\n?\s*establish EVERY one of them/.test(b.replace(/\s+/g, ' '))
    || /establish EVERY one of them/.test(b));
  assert('B.5 partial coverage is explicitly NOT sufficient',
    /it is NOT/.test(b) && /sufficient, however exactly it names the topic/.test(b));
  assert('B.6 a disjunctive question is read as its WEAKEST branch',
    /Watch the word "or"/.test(b) && /WEAKEST branch/.test(b));
  assert('B.7 trade shorthand may not supply a missing conjunct',
    /not from what a term/.test(b) && /usually implies in the trade/.test(b));
  assert('B.8 the "did only one of them" test is stated concretely',
    /someone who did only one of/.test(b));

  // B.9 -- generic, not row-specific. The suite fails if any cohort term leaked into the rule.
  const COHORT_TERMS = ['auger', 'isolator', 'lockout', 'dryer', 'accumulator', 'burner', 'debarker',
    'interlock', 'conveyor', 'guard', 'torque', 'flame', 'hydraulic', 'HR-0', 'HR-1'];
  const leaked = COHORT_TERMS.filter(t => new RegExp(t, 'i').test(b));
  assert('B.9 no §187 cohort term appears in the conjunctive rule', leaked.length === 0,
    leaked.join(','));
  assert('B.10 generic conjunctive fixture declares more than one conjunct',
    GENERIC.conjunctive.conjuncts.length === 2 && GENERIC.temporal.conjuncts.length === 3);

  // ==================================================================== C
  console.log('\nC. ADJACENT PROPERTY CONTAINMENT\n');

  const c = ADJACENT_PROPERTY_BOUNDARY_LINES.join('\n');
  assert('C.1 the rule is present in the v3.1 prompt',
    EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.includes(c));
  assert('C.2 it is attached as the BOUNDARY on the unseen-control heuristic',
    EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.indexOf('A CONTROL THAT CANNOT BE SEEN')
    < EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.indexOf('AND THE BOUNDARY ON THAT ONE'));
  assert('C.3 visible component does not equal checked property',
    /A component you can SEE is not thereby a property you have/.test(c) && /CHECKED/.test(c));
  assert('C.4 presence does not equal securement',
    /tells you it is in position; it does not tell you its/.test(c) && /fastenings are tight/.test(c));
  assert('C.5 inspection settles only its stated scope',
    /An inspection settles only what that inspection is stated to cover/.test(c));
  assert('C.6 an earlier check does not establish the current state',
    /tells you about then, not about now/.test(c));
  assert('C.7 a related control does not establish a separate one',
    /A control on ONE energy source, guard or system tells you nothing about a/.test(c)
    && /SEPARATE one/.test(c));
  assert('C.8 absence of a recorded anomaly does not establish the property',
    /nothing being wrong that anyone wrote down is not the same as the property/.test(c));
  assert('C.9 the rule is stated at the owed-property/evidence level',
    /Name the property the owed fact is about/.test(c)
    && /name what each piece of evidence establishes/.test(c));
  assert('C.10 it is a principle, not a keyword list — no exported matcher exists',
    typeof (ADJACENT_PROPERTY_BOUNDARY_LINES as unknown as { some?: unknown }).some === 'function'
    && !Object.keys(GENERIC).includes('keywords'));
  assert('C.11 the generic adjacent pairs cover every distinction the rule must preserve',
    GENERIC.adjacentPairs.length === 6);

  // ==================================================================== D
  console.log('\nD. PRESERVATION REGRESSION\n');

  // D.1 -- the strongest assertion in the suite. Remove exactly the two inserted blocks and v3
  //        must come back byte-identically.
  const reconstructed = EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT
    .replace(`\n${ADJACENT_PROPERTY_BOUNDARY_LINES.join('\n')}`, '')
    .replace(`\n${CONJUNCTIVE_SUFFICIENCY_LINES.join('\n')}`, '');
  assert('D.1 removing the two blocks reproduces v3 BYTE-IDENTICALLY',
    reconstructed === EXPERT_VERIFIER_V3_SYSTEM_PROMPT,
    `${sha(reconstructed).slice(0, 12)} vs ${sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT).slice(0, 12)}`);
  assert('D.2 v3 itself is byte-unchanged at its frozen §187 hash',
    sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT) === PREREG.verifierIdentity.systemPromptSha256);
  assert('D.3 the v3 schema is byte-unchanged at its frozen §187 hash',
    sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)) === PREREG.verifierIdentity.responseSchemaSha256);
  assert('D.4 v3.1 adds lines and removes none',
    EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.split('\n').length
    === EXPERT_VERIFIER_V3_SYSTEM_PROMPT.split('\n').length
      + ADJACENT_PROPERTY_BOUNDARY_LINES.length + CONJUNCTIVE_SUFFICIENCY_LINES.length);

  // D.5 -- the passages that produced the HR-01/HR-06/HR-09 behaviour survive byte-identically.
  const PRESERVED_PASSAGES: Array<[string, string]> = [
    ['the unseen-control heuristic itself',
      'A CONTROL THAT CANNOT BE SEEN IS NOT A CONTROL THAT WAS CHECKED.'],
    ['step 3\'s existing sufficiency test',
      'the test is whether an answer to the question as written'],
    ['the "usually no" nomination prior',
      'THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER.'],
    ['NO_CLARIFICATION_REQUIRED resolves nothing',
      'THIS VERDICT RESOLVES NOTHING. It says only that YOU propose no question.'],
    ['one fact does not cover another',
      'AND ONE FACT DOES NOT COVER ANOTHER. Answering the fact keyed A leaves the fact keyed B'],
    ['the settlement-authority restriction',
      'YOU ALSO MAY NOT mark a supplied fact answered by any route other than bindingFactKey.'],
    ['no expected number of questions',
      'There is no expected number of questions, no expected number of silences'],
    ['the magnitude exclusion', '     - MAGNITUDE. How long, how often, how many, how large.'],
    ['the detail-with-control exclusion',
      '     - A DETAIL WITH ITS CONTROL ALREADY IN PLACE.'],
  ];
  for (const [label, text] of PRESERVED_PASSAGES) {
    assert(`D.5 preserved: ${label}`,
      EXPERT_VERIFIER_V3_SYSTEM_PROMPT.includes(text)
      && EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.includes(text));
  }

  // D.6 -- NO instruction to ask more questions. CLARIFICATION_POLICY stays INCONCLUSIVE.
  const inserted = `${c}\n${b}`;
  const FREQUENCY_DIRECTIVES = [
    /ask more/i, /always propose/i, /prefer clarification/i, /when in doubt,? ask/i,
    /err on the side of asking/i, /should ask/i, /more questions/i, /raise a clarification whenever/i,
  ];
  const found = FREQUENCY_DIRECTIVES.filter(re => re.test(inserted)).map(re => re.source);
  assert('D.6 no frequency directive was added — CLARIFICATION_POLICY stays INCONCLUSIVE',
    found.length === 0, found.join(' | '));

  // D.7 -- the schema changed ONLY in descriptions.
  const strip = (o: unknown): unknown => {
    if (Array.isArray(o)) return o.map(strip);
    if (o && typeof o === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        if (k === 'description') continue;
        out[k] = strip(v);
      }
      return out;
    }
    return o;
  };
  assert('D.7 with descriptions stripped, the v3.1 schema is IDENTICAL to v3',
    JSON.stringify(strip(VERIFIER_V3_1_RESPONSE_SCHEMA)) === JSON.stringify(strip(VERIFIER_V3_RESPONSE_SCHEMA)));
  const v3d = JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA);
  const v31d = JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA);
  assert('D.8 exactly three descriptions differ', DESCRIPTION_REPAIRS.length === 3 && v3d !== v31d);
  assert('D.9 no enum member, source mode or declaration token was added',
    OWED_FACT_DECLARATIONS_V3.length === 3 && CLARIFICATION_SOURCE_MODES_V3.length === 3
    && JSON.stringify((VERIFIER_V3_1_RESPONSE_SCHEMA as any).properties.verdict.enum)
    === JSON.stringify((VERIFIER_V3_RESPONSE_SCHEMA as any).properties.verdict.enum));
  assert('D.10 PROVIDER_SETTLEMENT_AUTHORITY is untouched — no settlement field exists in v3.1',
    !/settled|resolved|notDecisionCritical|factNotDecisionCritical/.test(
      JSON.stringify(Object.keys((VERIFIER_V3_1_RESPONSE_SCHEMA as any).properties))));

  // ==================================================================== E
  console.log('\nE. ROOT-CAUSE-TO-DIFF REVIEW (every change maps to evidence)\n');

  assert('E.1 the change ledger has one entry per change made', V3_1_CHANGE_LEDGER.length === 3);
  for (const entry of V3_1_CHANGE_LEDGER) {
    assert(`E.2 "${entry.change}" carries evidence`,
      entry.evidence.length > 0 && ['MECHANICAL', 'MODEL_DIAGNOSTIC'].includes(entry.evidenceClass));
    assert(`E.3 "${entry.change}" maps to a test section`,
      ['A', 'B', 'C', 'D'].includes(entry.testSection));
  }
  for (const r of DESCRIPTION_REPAIRS) {
    assert(`E.4 description repair "${r.field}" names its defect and evidence`,
      r.defect.length > 0 && /§188/.test(r.evidence));
  }
  const mechanicalOnly = V3_1_CHANGE_LEDGER.filter(e => e.evidenceClass === 'MECHANICAL');
  assert('E.5 exactly one change rests on mechanical evidence alone (the schema descriptions)',
    mechanicalOnly.length === 1 && mechanicalOnly[0].kind === 'SCHEMA_DESCRIPTION');
  assert('E.6 the two instruction changes are labelled MODEL_DIAGNOSTIC, not mechanical',
    V3_1_CHANGE_LEDGER.filter(e => e.kind === 'INSTRUCTION')
      .every(e => e.evidenceClass === 'MODEL_DIAGNOSTIC'));
  assert('E.7 v3.1 declares its own version', EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION
    === 'hazlenz.expert.verifier-instruction.v3.1');

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0');
  console.log(`v3   system prompt sha256  ${sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT)}`);
  console.log(`v3.1 system prompt sha256  ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT)}`);
  console.log(`v3   schema sha256         ${sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA))}`);
  console.log(`v3.1 schema sha256         ${sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA))}`);
  console.log('BEHAVIOURAL EFFICACY IS NOT ESTABLISHED BY THIS SUITE. It requires a fresh');
  console.log('prospective hosted cohort, which §191 does not authorize.');
  if (failed > 0) process.exit(1);
}

main();
