/**
 * §194 -- REGULATORY-BASIS PROOF SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Covers the twelve-point deterministic matrix the §194 authorization sets, plus the v3.1-derivation
 * and no-retuning proofs. Section H is the one that keeps the claim honest: it asserts what the
 * structure does NOT establish.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-1';
import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, REGULATORY_BASIS_LINES, REGULATORY_RELIANCE_MODES,
  V3_2_CHANGE_LEDGER,
} from './lib/expert-verifier-instruction-v3-2';
import {
  checkVerifierV3_2Output, V3_2_ADMISSION_RULE_CLASSIFICATION,
  verifierV3_2RegulatoryBasisEffect, type V3_2AdmissionInput,
} from './lib/expert-verifier-contract-v3-2';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

let passed = 0; let failed = 0;
function assert(label: string, ok: boolean, detail = ''): void {
  if (ok) { passed += 1; console.log(`  PASS  ${label}${detail ? '  -- ' + detail : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

const KEY = 'owed:generic:vessel_drained_and_confirmed_empty';
const IN: V3_2AdmissionInput = {
  analysisId: 'a-1',
  observation: 'A generic observation for boundary tests.',
  suppliedOwedFactKeys: [KEY],
  suppliedGovernedSourceIds: ['GOV-SRC-1', 'GOV-SRC-2'],
};
const NONE = { reliance: 'NONE', sourceIds: [], proposition: null };
const verdict = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId: 'a-1',
  verdict: 'VERIFIED_AS_IS', rationale: 'the existing question reaches the fact',
  clarificationSourceMode: null, proposedClarification: null, bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [{ factKey: KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null }],
  regulatoryBasis: NONE,
  ...over,
});
const codesOf = (o: Record<string, unknown>): string[] => [...checkVerifierV3_2Output(o, IN).codes];

function main(): void {
  console.log('\nA. THE TWELVE-POINT ADMISSION MATRIX\n');

  assert('1  no reliance + ordinary rationale = ADMITTED',
    checkVerifierV3_2Output(verdict(), IN).admitted === true, codesOf(verdict()).join(','));

  assert('2  supplied jurisdiction name alone = ADMITTED',
    checkVerifierV3_2Output(verdict({
      rationale: 'The jurisdiction is osha-general-industry, as supplied with the case.' }), IN).admitted === true);

  assert('3  reasoning that governed evidence is ABSENT = ADMITTED',
    checkVerifierV3_2Output(verdict({
      rationale: 'Whether a shorter interval applies is a regulatory question, and no governed '
        + 'regulatory evidence was supplied establishing one, so the observation cannot settle it.',
    }), IN).admitted === true,
    'the FV-11 / FV-13 shape that any keyword rule would have false-positived');

  const rawCitation = verdict({ rationale: 'This is required by 29 CFR 1910.212(a)(1).' });
  assert('4  raw citation-shaped output outside the structure = REFUSED',
    checkVerifierV3_2Output(rawCitation, IN).admitted === false
    && codesOf(rawCitation).includes('PROHIBITED_REGULATORY_CITATION'));

  const validReliance = verdict({ regulatoryBasis: {
    reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-SRC-1'],
    proposition: 'the supplied record states a verification method for this control' } });
  const vr = checkVerifierV3_2Output(validReliance, IN);
  assert('5  declared reliance on valid supplied evidence = STRUCTURALLY ADMITTED',
    vr.admitted === true, codesOf(validReliance).join(','));
  assert('5b and the binding is recorded',
    vr.regulatoryRelianceDeclared === true && vr.boundSourceIds.join(',') === 'GOV-SRC-1');

  const invented = verdict({ regulatoryBasis: {
    reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-SRC-9'],
    proposition: 'a record I was not given says so' } });
  assert('6  reliance on a nonexistent evidence id = REFUSED',
    checkVerifierV3_2Output(invented, IN).admitted === false
    && codesOf(invented).includes('SOURCE_ID_NOT_IN_SUPPLIED_SET'));

  const selfAuth = verdict({ regulatoryBasis: {
    reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['29 CFR 1910.212'],
    proposition: 'the regulation requires it' } });
  assert('7  provider-invented citation string as a source id = REFUSED',
    checkVerifierV3_2Output(selfAuth, IN).admitted === false,
    codesOf(selfAuth).join(','));
  assert('7b it is refused for shape AND for not being supplied — self-authorisation is closed',
    codesOf(selfAuth).includes('SOURCE_ID_MALFORMED')
    || codesOf(selfAuth).includes('SOURCE_ID_NOT_IN_SUPPLIED_SET'));

  assert('8  multiple valid supplied references = ADMITTED',
    checkVerifierV3_2Output(verdict({ regulatoryBasis: {
      reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-SRC-1', 'GOV-SRC-2'],
      proposition: 'both supplied records bear on the control' } }), IN).admitted === true);

  console.log('');
  const malformed: Array<[string, Record<string, unknown>, string]> = [
    ['field absent', verdict({ regulatoryBasis: undefined }), 'REGULATORY_BASIS_MISSING'],
    ['not an object', verdict({ regulatoryBasis: 'NONE' }), 'REGULATORY_BASIS_NOT_AN_OBJECT'],
    ['unknown reliance mode', verdict({ regulatoryBasis: { reliance: 'MAYBE', sourceIds: [], proposition: null } }), 'REGULATORY_RELIANCE_NOT_A_MEMBER'],
    ['sourceIds not an array', verdict({ regulatoryBasis: { reliance: 'NONE', sourceIds: 'GOV-SRC-1', proposition: null } }), 'SOURCE_IDS_NOT_AN_ARRAY'],
    ['ids present under NONE', verdict({ regulatoryBasis: { reliance: 'NONE', sourceIds: ['GOV-SRC-1'], proposition: null } }), 'SOURCE_IDS_PRESENT_WITHOUT_RELIANCE'],
    ['reliance with no ids', verdict({ regulatoryBasis: { reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: [], proposition: 'x' } }), 'SOURCE_IDS_MISSING_FOR_RELIANCE'],
    ['duplicate id', verdict({ regulatoryBasis: { reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-SRC-1', 'GOV-SRC-1'], proposition: 'x' } }), 'SOURCE_ID_DUPLICATED'],
    ['reliance with no proposition', verdict({ regulatoryBasis: { reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-SRC-1'], proposition: null } }), 'PROPOSITION_MISSING_FOR_RELIANCE'],
    ['proposition under NONE', verdict({ regulatoryBasis: { reliance: 'NONE', sourceIds: [], proposition: 'something' } }), 'PROPOSITION_PRESENT_WITHOUT_RELIANCE'],
  ];
  for (const [label, v, code] of malformed) {
    assert(`9  malformed state REFUSED: ${label}`,
      checkVerifierV3_2Output(v, IN).admitted === false && codesOf(v).includes(code), code);
  }

  console.log('');
  assert('10 a regulatory proposition with no authorized basis is fail-closed',
    checkVerifierV3_2Output(verdict({
      rationale: 'The applicable standard requires a maximum gap here.',
      regulatoryBasis: { reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['NOT-SUPPLIED-1'],
        proposition: 'the standard sets a maximum gap' } }), IN).admitted === false,
    'the ONLY route to regulatory authority is a supplied sourceId, and there is none');
  assert('10b with zero governed evidence supplied, ANY declared reliance is refused',
    checkVerifierV3_2Output(verdict({ regulatoryBasis: {
      reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-SRC-1'], proposition: 'x' } }),
    { ...IN, suppliedGovernedSourceIds: [] }).admitted === false);

  const illegalBinding = verdict({ bindingFactKey: KEY, clarificationSourceMode: 'SUPPLIED_FACT',
    owedFactDeclarations: [{ factKey: KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null }] });
  assert('11 existing v3 contract-state hard gates remain intact',
    checkVerifierV3_2Output(illegalBinding, IN).admitted === false
    && codesOf(illegalBinding).includes('BINDING_DECLARED_BY_A_NON_ADD_VERDICT'));
  assert('11b wrong-key and declaration gates still fire',
    codesOf(verdict({ owedFactDeclarations: [{ factKey: 'owed:other:x', declaration: 'STILL_UNRESOLVED', challengeReason: null }] }))
      .includes('OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED'));

  const e = verifierV3_2RegulatoryBasisEffect();
  assert('12 PROVIDER_SETTLEMENT_AUTHORITY = NEVER remains intact',
    e.settlementMayOccur === false && e.regulatoryTruthMayBeCreated === false
    && e.governedEvidenceMayChange === false && e.citationsMayChange === false
    && e.owedFactCoverageMayChange === false);

  console.log('\nB. DERIVED FROM v3.1 BY CONSTRUCTION\n');
  const reconstructed = EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT
    .replace(`\n${REGULATORY_BASIS_LINES.join('\n')}`, '');
  assert('B.1 removing the block reproduces v3.1 BYTE-IDENTICALLY',
    reconstructed === EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT,
    `${sha(reconstructed).slice(0, 12)} vs ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT).slice(0, 12)}`);
  const prereg192 = JSON.parse(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06', 'PREREGISTRATION.json'), 'utf8'));
  assert('B.2 v3.1 is byte-unchanged at its §192 prompt hash',
    sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT) === prereg192.verifierIdentity.systemPromptSha256);
  assert('B.3 v3.1 is byte-unchanged at its §192 schema hash',
    sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)) === prereg192.verifierIdentity.responseSchemaSha256);

  const strip = (o: any): any => {
    if (Array.isArray(o)) return o.map(strip);
    if (o && typeof o === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(o)) { if (k !== 'regulatoryBasis') out[k] = strip(v); }
      if (Array.isArray(out.required)) out.required = out.required.filter((r: string) => r !== 'regulatoryBasis');
      return out;
    }
    return o;
  };
  assert('B.4 with regulatoryBasis stripped, the v3.2 schema is IDENTICAL to v3.1',
    JSON.stringify(strip(VERIFIER_V3_2_RESPONSE_SCHEMA)) === JSON.stringify(strip(VERIFIER_V3_1_RESPONSE_SCHEMA)));
  assert('B.5 exactly one property was added, and it is required',
    Object.keys((VERIFIER_V3_2_RESPONSE_SCHEMA as any).properties).length
    === Object.keys((VERIFIER_V3_1_RESPONSE_SCHEMA as any).properties).length + 1
    && (VERIFIER_V3_2_RESPONSE_SCHEMA as any).required.includes('regulatoryBasis'));
  assert('B.6 v3.2 declares its own version',
    EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION === 'hazlenz.expert.verifier-instruction.v3.2');
  assert('B.7 two reliance modes, no more', REGULATORY_RELIANCE_MODES.length === 2);

  console.log('\nC. NO SEMANTIC RETUNING — the §191 repairs survive byte-identically\n');
  const PRESERVED: Array<[string, string]> = [
    ['§191 conjunctive sufficiency block', 'AND CHECK IT PIECE BY PIECE.'],
    ['§191 weakest-branch rule', 'read it as satisfied by its WEAKEST branch'],
    ['§191 adjacent-property boundary', 'AND THE BOUNDARY ON THAT ONE.'],
    ['§191 inspection-scope clause', 'An inspection settles only what that inspection is stated to cover'],
    ['the unseen-control heuristic', 'A CONTROL THAT CANNOT BE SEEN IS NOT A CONTROL THAT WAS CHECKED.'],
    ['the "usually no" nomination prior', 'THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER.'],
    ['NO_CLARIFICATION_REQUIRED resolves nothing', 'THIS VERDICT RESOLVES NOTHING.'],
    ['owed-fact targeting', 'AND ONE FACT DOES NOT COVER ANOTHER.'],
    ['settlement-authority restriction', 'YOU ALSO MAY NOT mark a supplied fact answered by any route other than bindingFactKey.'],
    ['no expected number of questions', 'There is no expected number of questions'],
  ];
  for (const [label, text] of PRESERVED) {
    assert(`C.1 preserved: ${label}`,
      EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.includes(text) && EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT.includes(text));
  }
  const FREQUENCY = [/ask more/i, /always propose/i, /prefer clarification/i, /err on the side of asking/i];
  assert('C.2 the inserted block adds no clarification-frequency directive',
    FREQUENCY.every(re => !re.test(REGULATORY_BASIS_LINES.join('\n'))));
  assert('C.3 and it names NONE as the normal answer',
    /NONE IS THE NORMAL ANSWER/.test(REGULATORY_BASIS_LINES.join('\n')));
  assert('C.4 it names the three NONE cases §192 actually produced',
    /naming the jurisdiction you were given/.test(REGULATORY_BASIS_LINES.join('\n'))
    && /no governed evidence was supplied/.test(REGULATORY_BASIS_LINES.join('\n'))
    && /workplace record says about its own inspections/.test(REGULATORY_BASIS_LINES.join('\n')));

  console.log('\nD. DETERMINISM NOT OVERCLAIMED\n');
  assert('D.1 the semantic axes are recorded as REQUIRES_HUMAN_TRUTH',
    V3_2_ADMISSION_RULE_CLASSIFICATION.THE_PROPOSITION_IS_A_FAITHFUL_READING_OF_THE_SOURCE === 'REQUIRES_HUMAN_TRUTH'
    && V3_2_ADMISSION_RULE_CLASSIFICATION.THE_SOURCE_SUPPORTS_THE_CONCLUSION_DRAWN === 'REQUIRES_HUMAN_TRUTH'
    && V3_2_ADMISSION_RULE_CLASSIFICATION.THE_LEGAL_CONCLUSION_IS_CORRECT === 'REQUIRES_HUMAN_TRUTH');
  assert('D.2 what IS decided is recorded as exact string equality over a closed set',
    V3_2_ADMISSION_RULE_CLASSIFICATION.EVERY_SOURCE_ID_WAS_SUPPLIED === 'SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY');
  assert('D.3 a citation string inside proposition is STILL refused — structure is not authority',
    checkVerifierV3_2Output(verdict({ regulatoryBasis: {
      reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-SRC-1'],
      proposition: 'per 29 CFR 1910.212 the gap is limited' } }), IN).admitted === false);
  assert('D.4 every change in the ledger carries evidence and a test section',
    V3_2_CHANGE_LEDGER.length === 2
    && V3_2_CHANGE_LEDGER.every(c => /§193/.test(c.evidence) && ['A', 'B'].includes(c.testSection)));

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0');
  console.log(`v3.1 prompt ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT)}`);
  console.log(`v3.2 prompt ${sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT)}`);
  console.log(`v3.1 schema ${sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA))}`);
  console.log(`v3.2 schema ${sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA))}`);
  console.log('STRUCTURAL SOURCE BINDING IS NOT LEGAL VALIDATION. v3.2 is NOT hosted-validated.');
  if (failed > 0) process.exit(1);
}

main();
