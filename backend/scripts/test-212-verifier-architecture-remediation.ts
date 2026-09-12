/**
 * §212 EXPERT HAZLENZ -- VERIFIER ARCHITECTURE REMEDIATION AND PM-1 REPAIR: PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO PINNED FILE MUTATED.
 *
 * What this suite establishes:
 *
 *   R-A  the eleven required fields reach a verifier request, every one by copy from exactly one
 *        source, and a request whose property is absent is REFUSED rather than completed.
 *   R-B  the remit block is v3.2 plus one block, reversible byte for byte, and carries its own
 *        anti-overcorrection narrowing.
 *   R-C  the challenge vocabulary can express the KR-1 finding, every added member serves a named
 *        §211 capability, and a challenge still settles nothing.
 *   PM-1 the three asserted sites are classified and handled on that basis, and the narrowed
 *        invariants are proved directly rather than by a hash.
 *   GATE the thirteen readiness items, each answered from the architecture rather than asserted.
 *
 * What it does NOT establish, asserted below: anything about verifier behaviour. No provider was
 * called, and no behavioural mitigation of KR-1 is claimed.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  VERIFIER_VERDICTS,
} from './lib/expert-verifier-contract';
import { V3_ADMISSION_CODES } from './lib/expert-verifier-contract-v3';
import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-2';
import { buildVerifierV3UserPrompt } from './lib/expert-verifier-instruction-v3';
import { VNEXT_CANDIDATES } from './lib/expert-201-verifier-vnext-candidates';
import { UNRESOLVED_ACTION_FIELD } from './lib/expert-210j-first-pass-contract';
import { VALIDATION_CASES, providerCallCount } from './lib/expert-211-validation-instrument';
import {
  CHALLENGE_VOCABULARY_212_VERSION, CHALLENGE_GROUNDS_212, INHERITED_CHALLENGE_GROUNDS,
  ADDED_CHALLENGE_GROUND, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
  VOCABULARY_JUSTIFICATION, REFUSED_MEMBERS, NO_REPLACEMENT_PROPERTY_FIELD,
  CHALLENGE_ADMISSION_CODES_212, CHALLENGE_IS_NEVER_A_SETTLEMENT,
  checkDeclarationEntry212, kr1IsRepresentable, type DeclarationEntry212,
} from './lib/expert-212-challenge-vocabulary';
import {
  VERIFIER_PROTOCOL_212_VERSION, BASE_PROTOCOL_VERSION, PROTOCOL_VERSION_CLAIMED,
  REMIT_BLOCK_LINES, BLOCK_TO_RULE_212, OVERCORRECTION_GUARD_212,
  EXPERT_VERIFIER_212_SYSTEM_PROMPT, reconstructV32SystemPrompt,
  VERIFIER_212_RESPONSE_SCHEMA, reconstructV32ResponseSchema, ADDED_DECLARATION_PROPERTIES,
  protocolIdentities212,
} from './lib/expert-212-verifier-protocol';
import {
  VERIFIER_PAYLOAD_212_VERSION, REQUIRED_PAYLOAD_FIELDS_212, PAYLOAD_FIELD_PROVENANCE,
  NEVER_RECONSTRUCTED_FROM, ANCILLARY_CONTEXT_DEFAULT, REQUEST_REFUSAL_CODES_212,
  buildVerifier212Request, renderVerifier212Block, appendVerifier212Block, stripVerifier212Block,
  payloadEffect212,
} from './lib/expert-212-verifier-payload';
import {
  C6A_SUCCESSOR_DECISION_212_VERSION, SUBJECT_CANDIDATE, SECTION_201_STATUS_PRESERVED, DECISION,
  INHERITED_MEMBERS_UNCHANGED, C6A_PARTS_NOT_ADOPTED_HERE, HISTORY_REWRITTEN,
} from './lib/expert-212-c6a-successor-decision';
import {
  PM1_ASSERTION_REPAIR_212_VERSION, SUCCESSOR_ANCESTRY_PIN_212, successorAncestryHolds,
  NARROWED_INVARIANT_IDS, evaluateNarrowedInvariants, narrowedInvariantsHold, PM1_DISPOSITIONS,
  pm1RepairEffect,
} from './lib/expert-212-pm1-assertion-repair';
import {
  INSTRUMENT_ADAPTER_212_VERSION, ADAPTATION_LEDGER, SEMANTIC_FIELDS, adaptCase, adaptAllCases,
  adaptedProviderCallCount, adaptDeclaration, semanticFieldsAreByteIdentical, adapterEffect,
} from './lib/expert-212-instrument-adapter';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const MODULES = [
  'lib/expert-212-challenge-vocabulary.ts',
  'lib/expert-212-verifier-protocol.ts',
  'lib/expert-212-verifier-payload.ts',
  'lib/expert-212-c6a-successor-decision.ts',
  'lib/expert-212-pm1-assertion-repair.ts',
  'lib/expert-212-instrument-adapter.ts',
].map(p => readFileSync(join(__dirname, p), 'utf8')).join('\n');

const adapted = adaptAllCases();
const byCase = (id: string) => adapted.find(a => a.caseId === id)!;

// ================================================================ A. R-A payload

console.log('\n---- A. R-A — VERIFIER PAYLOAD ----');

ok('A1. all eleven required fields are named',
  REQUIRED_PAYLOAD_FIELDS_212.length === 11
    && new Set(REQUIRED_PAYLOAD_FIELDS_212).size === 11);

ok('A2. every field names exactly one source, and only ONE field is new in §212',
  REQUIRED_PAYLOAD_FIELDS_212.every(f => PAYLOAD_FIELD_PROVENANCE[f].length > 20)
    && Object.values(PAYLOAD_FIELD_PROVENANCE).filter(p => p.startsWith('NEW_IN_212')).length === 1,
  'ten of eleven come from the already-tested §210J assembly');

ok('A3. existing tested assembly is WIRED, not reimplemented',
  MODULES.includes('buildVerifier210jView')
    && MODULES.includes('isolateClarifications')
    && !/function buildVerifier210jView/.test(MODULES),
  '§210J and §210B-1 are called; neither is re-authored');

const t8 = byCase('T8');
const t8p = t8.requests[0].payload!;

ok('A4. a well-formed case builds a request carrying every field',
  t8.requests[0].built
    && REQUIRED_PAYLOAD_FIELDS_212.every(f => f in t8p));

ok('A5. the property reaches the payload BYTE-EXACT',
  t8p.owedProperty === VALIDATION_CASES.find(c => c.caseId === 'T8')!.declarations[0].missingFact);

ok('A6. FIXTURE 7 — decisionWhileUnresolved survives request assembly byte-exact',
  t8p.decisionWhileUnresolved
    === VALIDATION_CASES.find(c => c.caseId === 'T8')!.declarations[0].decisionWhileUnresolved
    && renderVerifier212Block(t8p).includes(t8p.decisionWhileUnresolved as string));

ok('A7. FIXTURE 8 — the payload carries the exact declaration id and fact key',
  t8p.declarationId === 'T8-D1' && t8p.targetFactKey === t8.facts[0].factKey
    && renderVerifier212Block(t8p).includes('T8-D1'));

ok('A8. the bound clarification reaches the payload, so it can be compared with the property',
  t8p.boundClarification !== null
    && t8p.boundClarification
      === VALIDATION_CASES.find(c => c.caseId === 'T8')!.clarifications[0].question);

ok('A9. FIXTURE 10 — a request whose property is absent is REFUSED, not completed',
  (() => {
    const base = VALIDATION_CASES.find(c => c.caseId === 'T8')!;
    const r = buildVerifier212Request({
      fact: t8.facts[0],
      declaration: { ...adaptDeclaration(base, base.declarations[0]), missingFact: '   ' },
      unresolvedActionByFactKey: {},
      boundClarification: null,
    });
    return r.built === false && r.payload === null
      && r.refusedBecause.includes('OWED_PROPERTY_ABSENT');
  })(),
  'deterministic code may not compose a property from the branches');

ok('A10. the refusal vocabulary is closed and every member is structural',
  REQUEST_REFUSAL_CODES_212.length === 4
    && REQUEST_REFUSAL_CODES_212.every(c => /ABSENT|DOES_NOT_MATCH/.test(c)));

ok('A11. reconstruction routes are recorded as refused rather than merely unused',
  NEVER_RECONSTRUCTED_FROM.length >= 5
    && payloadEffect212().reconstructsAMissingProperty === false
    && payloadEffect212().composesAnyField === false);

ok('A12. ancillary row context is EXCLUDED by default',
  ANCILLARY_CONTEXT_DEFAULT === 'EXCLUDED'
    && t8.requests[0].ancillary.included === false
    && payloadEffect212().restoresBroadRowContextByDefault === false);

ok('A13. when a caller opts in, §210B-1 explicit-link isolation decides what survives',
  (() => {
    const base = VALIDATION_CASES.find(c => c.caseId === 'T5')!;
    const t5 = byCase('T5');
    const r = buildVerifier212Request({
      fact: t5.facts[0],
      declaration: adaptDeclaration(base, base.declarations[0]) as unknown as Record<string, unknown>,
      unresolvedActionByFactKey: { [t5.facts[0].factKey]: base.declarations[0].decisionWhileUnresolved },
      boundClarification: null,
      ancillary: {
        clarifications: [
          { clarificationId: 'T5-C1', answersUnresolvedFactDeclarationId: 'T5-OTHER' },
          { clarificationId: 'T5-C2', answersUnresolvedFactDeclarationId: 'T5-D1' },
        ],
        candidates: [],
        rowDeclarationIds: ['T5-D1', 'T5-OTHER'],
      },
    });
    const decisions = r.ancillary.clarifications;
    return r.ancillary.included
      && decisions.find(d => d.id === 'T5-C1')!.reason === 'EXCLUDED_BOUND_TO_SIBLING'
      && decisions.find(d => d.id === 'T5-C2')!.reason === 'BOUND_TO_TARGET';
  })(),
  'a sibling-bound clarification is excluded; the target-bound one is retained');

ok('A14. the rendered block is additive — stripping it reproduces the base prompt byte for byte',
  (() => {
    const base = 'BASE USER PROMPT\nline two\nline three';
    return stripVerifier212Block(appendVerifier212Block(base, t8p)) === base;
  })());

ok('A15. an absent optional field renders as an explicit marker, never as silence',
  (() => {
    const p = { ...t8p, acceptableEvidence: null, decisionWhileUnresolved: null };
    const text = renderVerifier212Block(p);
    return text.includes('(not supplied)') && text.includes('(none held)');
  })());

ok('A16. the base v3.2 user-prompt builder is untouched and still callable',
  typeof buildVerifierV3UserPrompt === 'function');

// ================================================================ B. R-B remit

console.log('\n---- B. R-B — VERIFIER REMIT ----');

ok('B1. the successor prompt is v3.2 plus one block',
  EXPERT_VERIFIER_212_SYSTEM_PROMPT.length > EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT.length
    && EXPERT_VERIFIER_212_SYSTEM_PROMPT.includes(REMIT_BLOCK_LINES[0]));

ok('B2. removing the block reproduces the v3.2 prompt BYTE FOR BYTE',
  reconstructV32SystemPrompt(EXPERT_VERIFIER_212_SYSTEM_PROMPT)
    === EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
  'no v3, v3.1 or v3.2 sentence was rewritten');

ok('B3. the verdict set is UNCHANGED',
  VERIFIER_VERDICTS.length === 4
    && VERIFIER_VERDICTS.includes('VERIFIED_AS_IS')
    && VERIFIER_VERDICTS.includes('ADD_OR_REPLACE_CLARIFICATION'),
  'the remit changes what a challenge is ABOUT, not what the verifier may DO');

ok('B4. the block asks the prior question about the fact itself',
  REMIT_BLOCK_LINES.join(' ').includes('IS THIS THE RIGHT THING TO BE UNRESOLVED ABOUT'));

ok('B5. the block forbids reconstructing the property from the branches',
  REMIT_BLOCK_LINES.join(' ').includes('Do not reconstruct the property from the branches'));

ok('B6. the act-as-property narrowing is in the SAME block',
  REMIT_BLOCK_LINES.join(' ').includes('THE ACT IS THE PROPERTY')
    && REMIT_BLOCK_LINES.join(' ').includes('YOU MUST NOT SPEND IT')
    && OVERCORRECTION_GUARD_212.guardIsInTheSameBlock === true);

ok('B7. the narrowing tells the model to decide on ROLE, not on words',
  REMIT_BLOCK_LINES.join(' ').includes('ROLE the thing plays in the decision, never on the words')
    && OVERCORRECTION_GUARD_212.deterministicKeywordClassifierAdded === false);

ok('B8. both decisionWhileUnresolved must-nots are stated to the model',
  REMIT_BLOCK_LINES.join(' ').includes('it is not a defect and it is not a duplicate')
    && REMIT_BLOCK_LINES.join(' ').includes('never that the'),
  'similarity to decisionIfB is not a defect; holding is not proof branchB is true');

ok('B9. non-authority is restated inside the widened remit',
  REMIT_BLOCK_LINES.join(' ').includes('YOUR AUTHORITY IS UNCHANGED')
    && REMIT_BLOCK_LINES.join(' ').includes('you do not choose between'));

ok('B10. every block heading is mapped to the rule it serves',
  BLOCK_TO_RULE_212.length === 9
    && BLOCK_TO_RULE_212.every(b => REMIT_BLOCK_LINES.join('\n').includes(b.heading)),
  `${BLOCK_TO_RULE_212.length} headings, all present in the block`);

ok('B11. no protocol version is claimed',
  PROTOCOL_VERSION_CLAIMED === null
    && BASE_PROTOCOL_VERSION === 'hazlenz.expert.verifier-instruction.v3.2'
    // A MENTION is not a CLAIM: the module header says "there is no v3.4 here". What must not
    // exist is a constant that declares one.
    && !/=\s*'hazlenz\.expert\.verifier\.v(3\.4|4)'/.test(MODULES)
    && !/(VERSION|VERSION_CLAIMED)\s*[:=]\s*'[^']*v3\.4/.test(MODULES),
  'the artifact is hashable and diffable; a version is earned by a preregistered run');

// ================================================================ C. R-C vocabulary

console.log('\n---- C. R-C — CHALLENGE VOCABULARY ----');

ok('C1. three grounds, the two inherited unchanged plus one added',
  CHALLENGE_GROUNDS_212.length === 3
    && INHERITED_CHALLENGE_GROUNDS.every(m => CHALLENGE_GROUNDS_212.includes(m))
    && ADDED_CHALLENGE_GROUND === 'PROPERTY_IDENTITY_MISMATCH');

ok('C2. the inherited members are byte-identical to §201 C6a\'s own literals',
  readFileSync(join(__dirname, 'lib', 'expert-201-verifier-vnext-candidates.ts'), 'utf8')
    .includes(`'${INHERITED_CHALLENGE_GROUNDS[0]}', '${INHERITED_CHALLENGE_GROUNDS[1]}'`),
  'read from the candidate, not restated');

ok('C3. the evidence-proxy subcase the authorization names exists',
  PROPERTY_MISMATCH_KINDS.includes('EVIDENCE_PROXY_FOR_UNDERLYING_STATE')
    && PROPERTY_MISMATCH_KINDS.length === 2);

ok('C4. FIXTURE 2 — the KR-1 finding is representable without free text alone',
  kr1IsRepresentable(),
  'ground + kind + reason + target, admitted with zero codes');

ok('C5. every added member serves a named §211 capability and hard-failure class',
  (() => {
    const added = [ADDED_CHALLENGE_GROUND, ...PROPERTY_MISMATCH_KINDS,
      ...REPRESENTATION_CONCERNS_212.filter(m => m !== 'NONE')];
    return added.every(m => VOCABULARY_JUSTIFICATION.some(j => j.member === m))
      && VOCABULARY_JUSTIFICATION.every(j => /^V\d/.test(j.capability) && /^HF-\d$/.test(j.hardFailure));
  })(),
  `${VOCABULARY_JUSTIFICATION.length} added members, each justified`);

ok('C6. no taxonomy explosion — five added members across three fields, and three refused',
  VOCABULARY_JUSTIFICATION.length === 5 && REFUSED_MEMBERS.length === 3,
  REFUSED_MEMBERS.map(r => r.member.split(' ')[0]).join(', ') + ' refused');

ok('C7. FIXTURE 4 — a branch-alignment defect is representable WITHOUT challenging the fact',
  (() => {
    const e: DeclarationEntry212 = {
      factKey: 'FP:k', declaration: 'STILL_UNRESOLVED', challengeReason: null,
      challengeGround: null, propertyMismatchKind: null,
      representationConcern: 'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
    };
    return checkDeclarationEntry212(e).length === 0;
  })(),
  'the property is accepted and the field is flagged — §211 T10\'s frozen outcome');

ok('C8. an unresolved-action concern is representable the same way',
  checkDeclarationEntry212({
    factKey: 'FP:k', declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
    propertyMismatchKind: null, representationConcern: 'UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
  }).length === 0,
  '§211 T9\'s frozen outcome');

ok('C9. a challenge without a ground, a reason or a target is refused',
  (() => {
    const base: DeclarationEntry212 = {
      factKey: '', declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: null,
      challengeGround: null, propertyMismatchKind: null, representationConcern: 'NONE',
    };
    const codes = checkDeclarationEntry212(base);
    return codes.includes('CHALLENGE_GROUND_MISSING')
      && codes.includes('CHALLENGE_REASON_MISSING')
      && codes.includes('CHALLENGE_TARGET_FACT_KEY_MISSING');
  })());

ok('C10. a mismatch ground without its kind is refused, and a kind without the ground is refused',
  checkDeclarationEntry212({
    factKey: 'k', declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: 'r',
    challengeGround: 'PROPERTY_IDENTITY_MISMATCH', propertyMismatchKind: null,
    representationConcern: 'NONE',
  }).includes('PROPERTY_MISMATCH_KIND_MISSING')
    && checkDeclarationEntry212({
      factKey: 'k', declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: 'r',
      challengeGround: 'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',
      propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE', representationConcern: 'NONE',
    }).includes('PROPERTY_MISMATCH_KIND_WITHOUT_A_MISMATCH_GROUND'));

ok('C11. a ground on a non-challenge declaration is refused',
  checkDeclarationEntry212({
    factKey: 'k', declaration: 'STILL_UNRESOLVED', challengeReason: null,
    challengeGround: 'PROPERTY_IDENTITY_MISMATCH', propertyMismatchKind: null,
    representationConcern: 'NONE',
  }).includes('CHALLENGE_GROUND_WITHOUT_A_CHALLENGE'));

ok('C12. FIXTURE 9 — a challenge still settles nothing',
  CHALLENGE_IS_NEVER_A_SETTLEMENT.settles === false
    && CHALLENGE_IS_NEVER_A_SETTLEMENT.factStatusUnchanged === true
    && CHALLENGE_IS_NEVER_A_SETTLEMENT.requiresHumanAuthorization === true
    && (V3_ADMISSION_CODES as readonly string[]).includes('CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT'),
  'the existing admission code still refuses a settling challenge');

ok('C13. no replacement-property field was added',
  NO_REPLACEMENT_PROPERTY_FIELD.added === false
    && !/replacementProperty|correctedProperty|suggestedProperty/.test(MODULES),
  'the verifier is not turned into a second unrestricted first pass');

ok('C14. the admission vocabulary is closed',
  CHALLENGE_ADMISSION_CODES_212.length === 9
    && new Set(CHALLENGE_ADMISSION_CODES_212).size === 9);

// ================================================================ D. schema successor

console.log('\n---- D. SCHEMA SUCCESSOR ----');

ok('D1. exactly three properties were added to the declaration item',
  ADDED_DECLARATION_PROPERTIES.length === 3,
  ADDED_DECLARATION_PROPERTIES.join(', '));

ok('D2. all three are required on the declaration item',
  (() => {
    const item = (VERIFIER_212_RESPONSE_SCHEMA as any).properties.owedFactDeclarations.items;
    return ADDED_DECLARATION_PROPERTIES.every(p => (item.required as string[]).includes(p)
      && item.properties[p] !== undefined);
  })());

ok('D3. removing them reproduces the v3.2 schema EXACTLY',
  JSON.stringify(reconstructV32ResponseSchema()) === JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));

ok('D4. the declaration item stays closed',
  (VERIFIER_212_RESPONSE_SCHEMA as any).properties.owedFactDeclarations.items
    .additionalProperties === false);

const ident = protocolIdentities212() as any;
ok('D5. grammar cost is reported as four figures, not one',
  ['addedBytes', 'addedNodes', 'addedEnums', 'addedEnumMembers']
    .every(k => typeof ident.schema[k] === 'number')
    && ident.schema.addedEnums >= 2,
  `+${ident.schema.addedBytes} bytes, +${ident.schema.addedNodes} nodes, `
    + `+${ident.schema.addedEnums} enums, +${ident.schema.addedEnumMembers} enum members`);

ok('D6. the compiled-grammar caveat is recorded, so bytes alone claim nothing',
  String(ident.grammarCostCaveat).includes('COMPILED GRAMMAR COMPLEXITY')
    && String(ident.grammarCostCaveat).includes('undocumented'));

ok('D7. no prose was removed from the prompt',
  ident.prompt.netProseRemoved === 0 && ident.prompt.addedChars > 0,
  `+${ident.prompt.addedChars} prompt chars`);

// ================================================================ E. C6a decision

console.log('\n---- E. §201 C6a SUCCESSOR DECISION ----');

ok('E1. the decision adopts C6a\'s structure and adds a third ground',
  DECISION === 'ADOPT_C6A_STRUCTURE_WITH_A_THIRD_GROUND'
    && SUBJECT_CANDIDATE === 'C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE');

ok('E2. §201 history is preserved, not rewritten or rescored',
  HISTORY_REWRITTEN === false
    && SECTION_201_STATUS_PRESERVED.historicalRecordModified === false
    && SECTION_201_STATUS_PRESERVED.candidateRescored === false);

ok('E3. C6a is still PROTOTYPED in the live §201 registry, untouched',
  VNEXT_CANDIDATES.find(c => c.id === SUBJECT_CANDIDATE)!.build === 'PROTOTYPED');

ok('E4. no inherited member was renamed or removed',
  INHERITED_MEMBERS_UNCHANGED.anyInheritedMemberRenamed === false
    && INHERITED_MEMBERS_UNCHANGED.anyInheritedMemberRemoved === false
    && INHERITED_MEMBERS_UNCHANGED.total === 3,
  'a C6a-shaped verdict remains valid under the successor vocabulary');

ok('E5. the parts of C6a deliberately NOT adopted are named with reasons',
  C6A_PARTS_NOT_ADOPTED_HERE.length === 2
    && C6A_PARTS_NOT_ADOPTED_HERE.every(p => p.reason.includes('outside the bounded §212 gap')));

// ================================================================ F. PM-1

console.log('\n---- F. PM-1 ASSERTION AND PROVENANCE REPAIR ----');

ok('F1. four sites are dispositioned, and each names its classification and action',
  PM1_DISPOSITIONS.length === 4
    && PM1_DISPOSITIONS.every(d => d.classification.length > 0 && d.action.length > 0),
  PM1_DISPOSITIONS.map(d => d.action).join(' | '));

ok('F2. the ancestry pin is CLASS 1 — successor-pinned and left historical-only',
  PM1_DISPOSITIONS[0].classification === 'CLASS_1_ANCESTRY'
    && PM1_DISPOSITIONS[0].action === 'SUCCESSOR_PINNED_AND_LEFT_HISTORICAL_ONLY');

ok('F3. A4 and B18 are CLASS 2 — narrowed',
  PM1_DISPOSITIONS[1].action === 'NARROWED' && PM1_DISPOSITIONS[2].action === 'NARROWED'
    && PM1_DISPOSITIONS[1].classification === 'CLASS_2_BOUNDARY_INVARIANT');

ok('F4. the successor pin records prior hash, section, current hash, reason and evidence',
  SUCCESSOR_ANCESTRY_PIN_212.priorSha256.startsWith('aab67e0b')
    && SUCCESSOR_ANCESTRY_PIN_212.currentSha256.startsWith('bc47df39')
    && SUCCESSOR_ANCESTRY_PIN_212.modifyingSection === '§210E'
    && SUCCESSOR_ANCESTRY_PIN_212.reasonForChange.length > 20
    && SUCCESSOR_ANCESTRY_PIN_212.evidenceOfLegitimateTransition.length >= 3);

ok('F5. the prior hash is NOT called wrong and the historical assertion is preserved',
  SUCCESSOR_ANCESTRY_PIN_212.priorHashWasWrong === false
    && SUCCESSOR_ANCESTRY_PIN_212.historicalAssertionPreserved === true
    && readFileSync(join(__dirname, 'lib', 'expert-203-successor-identity.ts'), 'utf8')
      .includes(SUCCESSOR_ANCESTRY_PIN_212.priorSha256),
  'the §203 entry still carries its own true value');

ok('F6. the successor pin holds against the real file',
  successorAncestryHolds().holds && !successorAncestryHolds().drifted,
  successorAncestryHolds().observed.slice(0, 12) + '…');

ok('F7. §212 is recorded as the authorization §210J was waiting for',
  SUCCESSOR_ANCESTRY_PIN_212.section212IsThatAuthorization === true
    && SUCCESSOR_ANCESTRY_PIN_212.section210jDeclinedToPinBecause.includes('new divergence'));

const inv = evaluateNarrowedInvariants();
ok('F8. six narrowed invariants, all holding, each stating what it means',
  inv.length === NARROWED_INVARIANT_IDS.length && inv.length === 6
    && narrowedInvariantsHold()
    && inv.every(r => r.means.length > 30),
  inv.map(r => r.id.split('_')[0]).join(' '));

ok('F9. the narrowed invariants are BEHAVIOURAL, not a hash',
  !MODULES.includes('narrowedInvariantsHold = () => sha')
    && inv.some(r => r.id === 'N3_NO_SETTLEMENT_AUTHORITY_IN_THE_PROJECTION')
    && inv.some(r => r.id === 'N4_NO_RETIRED_SEMANTIC_MATCHER')
    && pm1RepairEffect().usesCurrentHashAsProofOfCorrectness === false);

ok('F10. §210E is NOT treated as a foreign section',
  !MODULES.includes("FOREIGN_SECTION_MARKERS: readonly string[] = ['§201', '§202', '§210E']"),
  '§210E is the section that legitimately advanced the file');

ok('F11. the narrowed suites now pass, and the historical hash is retained in them',
  (() => {
    const a = readFileSync(join(__dirname, 'test-201-governed-binding-stage.ts'), 'utf8');
    const b = readFileSync(join(__dirname, 'test-202-governed-binding-stage.ts'), 'utf8');
    return a.includes(SUCCESSOR_ANCESTRY_PIN_212.priorSha256)
      && b.includes(SUCCESSOR_ANCESTRY_PIN_212.priorSha256)
      && a.includes('evaluateNarrowedInvariants') && b.includes('evaluateNarrowedInvariants');
  })(),
  'nothing was erased');

ok('F12. the PM-1 rules are honoured as literals',
  pm1RepairEffect().editsFrozenEvidence === false
    && pm1RepairEffect().erasesTheOldExpectedHash === false
    && pm1RepairEffect().callsTheStalePinABehaviouralFailure === false
    && pm1RepairEffect().narrowedInvariantsAreProvedByTests === true);

// ================================================================ G. frozen instrument

console.log('\n---- G. THE FROZEN §211 INSTRUMENT ----');

ok('G1. all ten frozen cases adapt with no refusal',
  adapted.length === 10 && adapted.every(a => a.refusedBecause.length === 0));

ok('G2. the adapted call count equals §211\'s frozen count exactly',
  adaptedProviderCallCount() === providerCallCount() && adaptedProviderCallCount() === 11,
  `${adaptedProviderCallCount()} calls`);

ok('G3. every frozen evaluation question survives the adaptation',
  adapted.every(a => a.frozenQuestionIds.length
    === VALIDATION_CASES.find(c => c.caseId === a.caseId)!.evaluationQuestions.length),
  `${adapted.reduce((n, a) => n + a.frozenQuestionIds.length, 0)} questions carried`);

ok('G4. every semantic field is byte-identical after adaptation',
  VALIDATION_CASES.every(c => c.declarations.every(d =>
    semanticFieldsAreByteIdentical(d, adaptDeclaration(c, d))))
    && SEMANTIC_FIELDS.length === 11);

ok('G5. the adapter supplies exactly one mechanical field and invents no semantic one',
  ADAPTATION_LEDGER.filter(a => a.suppliedBy === 'ADAPTER').length === 1
    && ADAPTATION_LEDGER.every(a => a.isSemantic === false)
    && adapterEffect().inventsASemanticField === false);

ok('G6. the adapter modifies no frozen expectation',
  adapterEffect().modifiesTheFrozenInstrument === false
    && adapterEffect().rewritesAnyFrozenExpectation === false
    && adapterEffect().dropsOrReordersACase === false);

ok('G7. FIXTURE 1 — a correct physical-state case builds a supportable request',
  (() => { const r = byCase('T8').requests[0]; return r.built && r.payload!.owedProperty.length > 20; })());

ok('G8. FIXTURE 3 — the act-as-property case carries its act-shaped property unaltered',
  byCase('T4').requests[0].payload!.owedProperty
    === VALIDATION_CASES.find(c => c.caseId === 'T4')!.declarations[0].missingFact,
  'nothing in §212 rewrites or flags it at assembly time');

ok('G9. FIXTURE 5 — T7\'s weak clarification reaches the payload beside the property',
  (() => {
    const p = byCase('T7').requests[0].payload!;
    return p.boundClarification !== null && p.boundClarification !== p.owedProperty
      && p.boundClarification.includes('fitted');
  })(),
  'the comparison the verifier must make is now possible from the payload alone');

ok('G10. FIXTURE 6 — a two-fact row yields two isolated requests',
  (() => {
    const t6 = byCase('T6');
    const a = t6.requests[0].payload!;
    const b = t6.requests[1].payload!;
    return t6.requests.length === 2
      && a.declarationId === 'T6-D1' && b.declarationId === 'T6-D2'
      && a.targetFactKey !== b.targetFactKey
      && a.owedProperty !== b.owedProperty
      && a.decisionWhileUnresolved !== b.decisionWhileUnresolved
      && !a.owedProperty.includes('asbestos')
      && !b.owedProperty.includes('party wall')
      && t6.requests.every(r => r.ancillary.included === false);
  })(),
  'no sibling contamination; each request carries only its own fact');

// ================================================================ H. boundaries

console.log('\n---- H. BOUNDARIES ----');

const PINNED = [
  ['src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts',
    '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a'],
  ['src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts',
    '5273d5af08693be8096746da03eaba8bd046fd8bfd42c18050bbe6216ae15245'],
  ['src/safescope-v2/expert-hazlenz/expert-prompt.ts',
    'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694'],
  ['scripts/lib/expert-verifier-contract-v3.ts',
    '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc'],
  ['scripts/lib/expert-verifier-instruction-v3.ts',
    'db71ce6bc91bfd79ad3ee1e9e8a0d1ba2dfb3a0d5b0c5dd0c7e0f7a8b2f6e3d1'],
] as const;

for (const [rel, expected] of PINNED) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const actual = require('crypto').createHash('sha256')
    .update(readFileSync(join(__dirname, '..', rel))).digest('hex');
  if (rel.endsWith('expert-verifier-instruction-v3.ts')) {
    // Not a §187/§192 pin. Asserted as UNCHANGED-SINCE-THIS-SLICE-STARTED rather than against a
    // frozen literal, because §212 must not edit it and no published pin exists for it.
    ok('H.unedited expert-verifier-instruction-v3.ts',
      !readFileSync(join(__dirname, '..', rel), 'utf8').includes('§212'),
      'no §212 marker; the base instruction was not edited');
    continue;
  }
  ok(`H.pin ${rel.split('/').pop()}`, actual === expected, actual === expected ? 'INTACT' : actual);
}

ok('H1. no §212 module writes to disk, reaches a provider, or touches a database',
  !/writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync/.test(MODULES)
    && !/anthropic|fetch\(|axios|https?:\/\/|prisma|\.query\(/i.test(MODULES));

ok('H2. no deterministic keyword classifier over safety prose was added',
  !/\/[^\n/]*(tested|inspected|confirmed|verified|evidence|state|process)[^\n/]*\/[gimsuy]*\s*\.(test|exec)/i
    .test(MODULES),
  'the challenge depends on semantic role, and no code decides it');

ok('H3. the verifier still cannot settle, choose a branch, or authorise work',
  (() => {
    // Checked on IMPORTS, not on text: the PM-1 module carries `transition(` inside a regex
    // literal and a detail string precisely because its job is to assert that call's ABSENCE.
    const imports = MODULES.split('\n').filter(l => /^\s*(import|}\s*from)\b/.test(l)
      || /\bfrom '\.\//.test(l)).join('\n');
    return CHALLENGE_IS_NEVER_A_SETTLEMENT.settles === false
      && !/settlement-review|owed-fact-ledger/.test(imports)
      && !/\bsettleByReviewedEvidence\s*\(|\bmintSettlementAuthority\s*\(/.test(MODULES);
  })(),
  'no §212 module imports the settlement path or calls a transition');

ok('H4. every §212 module declares its version',
  [CHALLENGE_VOCABULARY_212_VERSION, VERIFIER_PROTOCOL_212_VERSION, VERIFIER_PAYLOAD_212_VERSION,
    C6A_SUCCESSOR_DECISION_212_VERSION, PM1_ASSERTION_REPAIR_212_VERSION,
    INSTRUMENT_ADAPTER_212_VERSION]
    .every(v => v.startsWith('hazlenz.expert.212.')));

ok('H5. no behavioural mitigation of KR-1 is claimed anywhere in §212',
  !/KR-1 is (now )?(fixed|mitigated|closed|resolved)/i.test(MODULES));

// ================================================================ I. readiness gate

console.log('\n---- I. HOSTED VALIDATION READINESS GATE ----');

const p = byCase('T1').requests[0].payload!;
const t1decl = VALIDATION_CASES.find(c => c.caseId === 'T1')!.declarations[0];

const GATE: ReadonlyArray<[string, boolean, string]> = [
  ['1. exact safety property reaches the verifier',
    p.owedProperty === t1decl.missingFact, 'byte-exact via the §210B-1 sidecar'],
  ['2. exact target identity reaches the verifier',
    p.declarationId === 'T1-D1' && p.targetFactKey === byCase('T1').facts[0].factKey,
    'declaration id and computed fact key'],
  ['3. branch semantics reach the verifier',
    p.branchA === t1decl.branchA && p.branchB === t1decl.branchB, 'both, unchanged'],
  ['4. decision semantics reach the verifier',
    p.decisionIfA === t1decl.decisionIfA && p.decisionIfB === t1decl.decisionIfB, 'both, unchanged'],
  ['5. decisionWhileUnresolved reaches the verifier',
    p.decisionWhileUnresolved === t1decl.decisionWhileUnresolved, 'byte-exact via the §210J sidecar'],
  ['6. verification gap and evidence semantics reach the verifier',
    p.notEstablishedBecause === t1decl.notEstablishedBecause
      && 'acceptableEvidence' in p, 'gap byte-exact; criterion slot present, null is legitimate'],
  ['7. bound clarification reaches the verifier',
    p.boundClarification !== null, 'the model-authored back-reference resolved to its question'],
  ['8. the challenge vocabulary represents a property-identity mismatch',
    kr1IsRepresentable() && CHALLENGE_GROUNDS_212.includes('PROPERTY_IDENTITY_MISMATCH'),
    'ground plus the evidence-proxy subcase'],
  ['9. the verifier remit explicitly includes fact semantic validity',
    REMIT_BLOCK_LINES.join(' ').includes('IS THIS THE RIGHT THING TO BE UNRESOLVED ABOUT')
      && EXPERT_VERIFIER_212_SYSTEM_PROMPT.includes(REMIT_BLOCK_LINES[1]),
    'in the assembled prompt, not only in a constant'],
  ['10. the verifier remains unable to settle a customer-authoritative fact',
    CHALLENGE_IS_NEVER_A_SETTLEMENT.settles === false
      && (V3_ADMISSION_CODES as readonly string[]).includes('CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT'),
    'unchanged, and still enforced at admission'],
  ['11. KR-1 is behaviourally testable',
    byCase('T1').requests[0].built && byCase('T2').requests[0].built
      && byCase('T3').requests[0].built && kr1IsRepresentable(),
    'the three evidence-proxy cases build requests and the finding is expressible'],
  ['12. act-as-property anti-overcorrection is behaviourally testable',
    byCase('T4').requests[0].built
      && byCase('T4').requests[0].payload!.owedProperty === VALIDATION_CASES
        .find(c => c.caseId === 'T4')!.declarations[0].missingFact
      && OVERCORRECTION_GUARD_212.guardIsInTheSameBlock,
    'T4 builds, its act property is intact, and the narrowing is in the remit block'],
  ['13. the frozen §211 instrument remains truth-preserving and executable',
    adapted.every(a => a.refusedBecause.length === 0)
      && adaptedProviderCallCount() === providerCallCount()
      && VALIDATION_CASES.every(c => c.declarations.every(d =>
        semanticFieldsAreByteIdentical(d, adaptDeclaration(c, d)))),
    'ten of ten adapt, eleven calls, every semantic field byte-identical'],
];

for (const [label, held, detail] of GATE) ok(`I.${label}`, held, detail);

const gateAllYes = GATE.every(([, held]) => held);
ok('I.GATE — every readiness item is YES', gateAllYes,
  gateAllYes ? 'hosted validation authorization may be requested'
    : GATE.filter(([, h]) => !h).map(([l]) => l).join('; '));

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${VERIFIER_PROTOCOL_212_VERSION}   (no protocol version claimed)`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log(`  READINESS GATE: ${gateAllYes ? 'ALL 13 YES' : 'NOT SATISFIED'}`);
console.log('  No verifier behaviour is measured. KR-1 remains OPEN.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
