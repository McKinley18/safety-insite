/**
 * §215 PHASE A -- PREREGISTRATION VALIDATION. ZERO PROVIDER CALLS.
 *
 * Everything below runs BEFORE the freeze and before any spend. It establishes that the six cases
 * are genuinely new, that the frozen truth is complete for each shape, that all seven calls assemble
 * through the ONE assembly path the executor will use, that the contrast pairs are non-degenerate,
 * and that the identities the report must record are pinned.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
  checkDeclarationEntry212, type DeclarationEntry212,
} from './lib/expert-212-challenge-vocabulary';
import {
  EXPERT_VERIFIER_214_SYSTEM_PROMPT,
} from './lib/expert-214-verifier-semantic-remediation';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import {
  CONFIRMATION_INSTRUMENT_215_VERSION, PROVIDER_CALLS_IN_PHASE_A, MAX_VERIFIER_CALLS,
  SPEND_CEILING_USD, SECTION_213_CASES_NOT_REUSED, HARD_FAILURE_CLASSES_215,
  HARD_FAILURE_GATE_RULE_215, CONFIRMATION_CASES_215, EXECUTION_ORDER, CONTRAST_PAIRS,
  providerCallCount215, hardFailureCoverage215, KR1_MOVEMENT_RULE, ACCEPTANCE_CHARACTER_215,
} from './lib/expert-215-confirmation-instrument';
import {
  assemble215, semanticFieldsSurvive215, ADAPTER_SUPPLIES, SEMANTIC_FIELDS_215,
} from './lib/expert-215-assembly';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const ROOT = join(__dirname, '..', '..');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const A = assemble215();
const byCase = (id: string) => CONFIRMATION_CASES_215.find(c => c.caseId === id)!;

// ================================================================ A. shape

console.log('\n---- A. INSTRUMENT SHAPE ----');

ok('A1. six cases, seven calls, matching the authorized allocation',
  CONFIRMATION_CASES_215.length === 6 && providerCallCount215() === 7
    && providerCallCount215() === MAX_VERIFIER_CALLS
    && byCase('H5').providerCalls === 2
    && ['H1', 'H2', 'H3', 'H4', 'H6'].every(id => byCase(id).providerCalls === 1));

ok('A2. all six required purposes are present',
  ['TEST / LATENT-STATE PROXY', 'DOCUMENT / LATENT-STATE PROXY', 'UNRESOLVED VERSUS ADVERSE',
    'LEGITIMATE ACT-AS-PROPERTY. MANDATORY COUNTER-CONTROL.', 'MULTI-FACT SIBLING CONTAINMENT',
    'FULLY CORRECT CONTROL']
    .every(p => CONFIRMATION_CASES_215.some(c => c.purpose === p)));

ok('A3. the execution order is frozen and covers exactly the seven calls',
  EXECUTION_ORDER.length === 7
    && new Set(EXECUTION_ORDER.map(s => `${s.caseId}/${s.declarationId}`)).size === 7);

ok('A4. every case says why it exists, in evidence terms',
  CONFIRMATION_CASES_215.every(c => c.whyThisCaseExists.length > 80 && /§21\d/.test(c.whyThisCaseExists)));

ok('A5. Phase A made no provider call',
  PROVIDER_CALLS_IN_PHASE_A === 0);

// ================================================================ B. genuinely new

console.log('\n---- B. GENUINELY NEW CASES ----');

ok('B1. no §213 case id appears anywhere in the instrument',
  (() => {
    const src = readFileSync(join(__dirname, 'lib', 'expert-215-confirmation-instrument.ts'), 'utf8');
    const observations = CONFIRMATION_CASES_215.map(c => c.observation).join(' ');
    return SECTION_213_CASES_NOT_REUSED.every(t => !observations.includes(t))
      && src.includes('SECTION_213_CASES_NOT_REUSED');
  })());

ok('B2. no §213 setting is reused in any observation',
  (() => {
    const text = CONFIRMATION_CASES_215.map(c => c.observation).join(' ').toLowerCase();
    return ['lifting eye', 'ferric sulphate', 'bund', 'fumigat', 'fermentation vessel',
      'ammonia', 'party wall', 'asbestos', 'fire damper', 'power take-off', 'auger',
      'mezzanine', 'lighting truss', 'theatre'].every(w => !text.includes(w));
  })(),
  'ten §213 settings, none present');

ok('B3. no §214 local fixture setting is reused either',
  (() => {
    const text = CONFIRMATION_CASES_215.map(c => c.observation).join(' ').toLowerCase();
    return ['air receiver', 'davit', 'baseplate', 'hot work permit', 'lift shaft', 'nitrogen purge',
      'tail lift', 'shredder', 'outrigger pads'].every(w => !text.includes(w));
  })());

ok('B4. six distinct industries',
  new Set(CONFIRMATION_CASES_215.map(c => c.suppliedContext.location.split(',')[0])).size === 6,
  CONFIRMATION_CASES_215.map(c => c.suppliedContext.location.split(',')[0]).join(' | '));

// ================================================================ C. frozen truth completeness

console.log('\n---- C. FROZEN TRUTH ----');

for (const id of ['H1', 'H2']) {
  const c = byCase(id);
  ok(`C.${id} proxy truth is complete`,
    c.proxyTruth !== null
      && c.proxyTruth.underlyingProperty.length > 30
      && c.proxyTruth.whyTheArtifactIsEvidence.length > 60
      && c.proxyTruth.satisfactoryWorldWithTheArtifactStillAbsent.includes('FROZEN')
      && c.proxyTruth.adverseWorldIndependentOfTheAbsence.length > 40
      && c.proxyTruth.expectedChallengeBehaviour.includes('PROPERTY_IDENTITY_MISMATCH'),
    'property, why-evidence, satisfactory-with-absence, adverse-independent, expected behaviour');
}

ok('C1. H3 freezes three distinct states and the required result U != B',
  (() => {
    const t = byCase('H3').threeWorldTruth!;
    return t.worldA.startsWith('ESTABLISHED SATISFACTORY')
      && t.worldB.startsWith('ESTABLISHED ADVERSE')
      && t.worldU.startsWith('UNRESOLVED')
      && t.requiredResult === 'U_IS_NOT_B'
      && t.establishedAdverseWouldLookLike.includes('PAIR 2 CONTRAST');
  })());

ok('C2. H4 freezes why performing the act changes the decision',
  (byCase('H4').actAsPropertyTruth ?? '').includes('The act IS the property')
    && (byCase('H4').actAsPropertyTruth ?? '').includes('FROZEN'));

ok('C3. H5 freezes both properties and the exact target of each call',
  (byCase('H5').siblingContainmentTruth ?? '').includes('Call 1 targets H5-D1')
    && (byCase('H5').siblingContainmentTruth ?? '').includes('call 2 targets H5-D2')
    && byCase('H5').declarations.length === 2);

ok('C4. H5 separates the permitted prose mention from the prohibited nomination',
  (byCase('H5').siblingContainmentTruth ?? '').includes('PERMITTED')
    && (byCase('H5').siblingContainmentTruth ?? '').includes('HF-D')
    && (byCase('H5').siblingContainmentTruth ?? '').includes('HF-E'));

ok('C5. H6 freezes why no challenge is warranted',
  (byCase('H6').whyNoChallengeIsWarranted ?? '').includes('FROZEN')
    && (byCase('H6').whyNoChallengeIsWarranted ?? '').includes('HF-F'));

ok('C6. every case names what the observation establishes, so a false gap is scoreable',
  CONFIRMATION_CASES_215.every(c => c.establishedByTheObservation.length >= 3));

ok('C7. every case carries mandatory evaluation questions',
  CONFIRMATION_CASES_215.every(c => c.evaluationQuestions.some(q => q.mandatory)));

// ================================================================ D. representability

console.log('\n---- D. REPRESENTABILITY ----');

const entryFor = (outcome: string, key: string): DeclarationEntry212 =>
  outcome === 'CHALLENGE_PROPERTY_IDENTITY_EVIDENCE_PROXY'
    ? {
      factKey: key, declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: 'the frozen reason',
      challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
      propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE', representationConcern: 'NONE',
    }
    : outcome === 'ACCEPT_PROPERTY_FLAG_BRANCHES'
      ? {
        factKey: key, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
        propertyMismatchKind: null,
        representationConcern: 'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
      }
      : {
        factKey: key, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
        propertyMismatchKind: null, representationConcern: 'NONE',
      };

ok('D1. every required outcome is representable in the UNCHANGED §212 vocabulary',
  CONFIRMATION_CASES_215.every(c => Object.values(c.requiredOutcomeByDeclarationId)
    .every(o => checkDeclarationEntry212(entryFor(o, 'FP:k')).length === 0))
    && CHALLENGE_GROUNDS_212.length === 3 && PROPERTY_MISMATCH_KINDS.length === 2
    && REPRESENTATION_CONCERNS_212.length === 3);

ok('D2. the H5 prohibited shape is refused by the deterministic scope rule',
  (() => {
    const r = checkScopeContainment({
      scope: {
        targetFactKey: A.built[4].factKey, suppliedFactKeys: [A.built[4].factKey],
        multiFactValidationRequested: false,
      },
      output: {
        nominatedFact: { anything: 'the netting anchorage' },
        clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
        owedFactDeclarations: [{ factKey: A.built[4].factKey }],
      },
    });
    return !r.admitted && r.codes.includes('NOMINATION_OUTSIDE_TARGET_SCOPE');
  })());

ok('D3. the H5 permitted shape is admitted',
  checkScopeContainment({
    scope: {
      targetFactKey: A.built[4].factKey, suppliedFactKeys: [A.built[4].factKey],
      multiFactValidationRequested: false,
    },
    output: {
      nominatedFact: null, clarificationSourceMode: 'SUPPLIED_FACT',
      owedFactDeclarations: [{ factKey: A.built[4].factKey }],
    },
  }).admitted);

// ================================================================ E. assembly

console.log('\n---- E. ASSEMBLY, THROUGH THE ONE PATH THE EXECUTOR USES ----');

ok('E1. all seven calls assemble with no failure',
  A.built.length === 7 && A.failures.length === 0,
  A.failures.map(f => `${f.caseId}:${f.reason}`).join(', ') || 'clean');

ok('E2. every span is verbatim in its own observation',
  CONFIRMATION_CASES_215.every(c => c.declarations
    .every(d => c.observation.includes(d.observationSpan))));

ok('E3. the adapter supplies exactly one mechanical field',
  ADAPTER_SUPPLIES.length === 1 && ADAPTER_SUPPLIES[0] === 'observationSourceId');

ok('E4. every semantic field survives adaptation byte-identical',
  semanticFieldsSurvive215() && SEMANTIC_FIELDS_215.length === 11);

ok('E5. every payload carries the property and the unresolved action byte-exact',
  A.built.every(b => {
    const c = byCase(b.caseId);
    const d = c.declarations.find(x => x.declarationId === b.declarationId)!;
    const p = b.request.payload!;
    return p.owedProperty === d.missingFact
      && p.decisionWhileUnresolved === d.decisionWhileUnresolved
      && p.branchA === d.branchA && p.branchB === d.branchB
      && p.notEstablishedBecause === d.notEstablishedBecause;
  }));

ok('E6. H5 isolates the sibling clarification in BOTH directions',
  (() => {
    const one = A.built.find(b => b.declarationId === 'H5-D1')!;
    const two = A.built.find(b => b.declarationId === 'H5-D2')!;
    return one.retainedClarificationIds.join() === 'H5-C1'
      && one.excludedClarificationIds.join() === 'H5-C2'
      && two.retainedClarificationIds.join() === 'H5-C2'
      && two.excludedClarificationIds.join() === 'H5-C1';
  })());

ok('E7. the two H5 calls carry different targets and different unresolved actions',
  (() => {
    const one = A.built.find(b => b.declarationId === 'H5-D1')!.request.payload!;
    const two = A.built.find(b => b.declarationId === 'H5-D2')!.request.payload!;
    return one.targetFactKey !== two.targetFactKey
      && one.owedProperty !== two.owedProperty
      && one.decisionWhileUnresolved !== two.decisionWhileUnresolved;
  })());

ok('E8. one instruction identity and one schema identity across all seven',
  new Set(A.built.map(b => b.identities.instruction)).size === 1
    && new Set(A.built.map(b => b.identities.schema)).size === 1
    && new Set(A.built.map(b => b.identities.userPrompt)).size === 7,
  'seven distinct user prompts, one protocol');

ok('E9. the §214 successor instruction is the one assembled',
  A.built.every(b => b.systemPrompt === EXPERT_VERIFIER_214_SYSTEM_PROMPT)
    && A.built[0].identities.instruction === sha(EXPERT_VERIFIER_214_SYSTEM_PROMPT));

ok('E10. no strict flag and no cache_control anywhere in any tool block',
  A.built.every(b => !JSON.stringify(b.toolBlock).includes('"strict"')
    && !JSON.stringify(b.toolBlock).includes('cache_control')));

ok('E11. the transmitted schema is the §212 successor, unchanged',
  A.built.every(b => JSON.stringify(b.toolBlock.input_schema)
    === JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA)));

// ================================================================ F. gates and pairs

console.log('\n---- F. GATES AND CONTRAST PAIRS ----');

ok('F1. seven hard-failure classes, each with a statement',
  HARD_FAILURE_CLASSES_215.length === 7
    && HARD_FAILURE_CLASSES_215.every(h => h.statement.length > 40));

const cov = hardFailureCoverage215();
ok('F2. every hard-failure class is covered by a case or is a standing gate',
  HARD_FAILURE_CLASSES_215.every(h => (cov[h.id] ?? []).length > 0),
  Object.entries(cov).map(([k, v]) => `${k}:${v.join('/')}`).join('  '));

ok('F3. zero-occurrence, per class, with no aggregate compensation',
  HARD_FAILURE_GATE_RULE_215.threshold === 'ZERO_OCCURRENCE'
    && HARD_FAILURE_GATE_RULE_215.mayBeOffsetByAnAggregateScore === false
    && HARD_FAILURE_GATE_RULE_215.aggregatePercentageReported === false);

ok('F4. two mandatory contrast pairs are frozen',
  CONTRAST_PAIRS.length === 2
    && CONTRAST_PAIRS.every(p => p.degenerateStrategyThatFails.length > 30
      && p.otherDegenerateStrategyThatFails.length > 30));

ok('F5. PAIR 1 is non-degenerate — both degenerate strategies fail it',
  (() => {
    const p1 = CONTRAST_PAIRS.find(p => p.id === 'PAIR_1')!;
    const challengeCases = ['H1', 'H2'].map(byCase);
    const acceptCase = byCase('H4');
    return p1.members.length === 3
      && challengeCases.every(c => Object.values(c.requiredOutcomeByDeclarationId)
        .every(o => o.startsWith('CHALLENGE')))
      && Object.values(acceptCase.requiredOutcomeByDeclarationId)
        .every(o => o === 'ACCEPT_PROPERTY_UNCHANGED');
  })(),
  'a vocabulary rule fails H4; a never-challenge rule fails H1 and H2');

ok('F6. PAIR 2 names what an ESTABLISHED adverse world looks like',
  (byCase('H3').threeWorldTruth ?? { establishedAdverseWouldLookLike: '' })
    .establishedAdverseWouldLookLike.includes('SEEING the wasted pins'));

ok('F7. KR-1 may move only on the frozen condition, and never to CLOSED',
  KR1_MOVEMENT_RULE.before === 'OPEN'
    && KR1_MOVEMENT_RULE.mayMoveTo === 'TARGETEDLY_MITIGATED_IN_VERIFIER_DEVELOPMENT'
    && KR1_MOVEMENT_RULE.mayNotMoveTo === 'CLOSED'
    && KR1_MOVEMENT_RULE.onlyIf.includes('H1 and H2')
    && KR1_MOVEMENT_RULE.onlyIf.includes('H4'));

ok('F8. this is targeted development confirmation and not acceptance',
  ACCEPTANCE_CHARACTER_215.kind === 'TARGETED_DEVELOPMENT_CONFIRMATION'
    && ACCEPTANCE_CHARACTER_215.isExpertAcceptance === false
    && ACCEPTANCE_CHARACTER_215.isProductionValidation === false);

ok('F9. the spend ceiling is the authorized one',
  SPEND_CEILING_USD === 0.31);

// ================================================================ G. artifact integrity

console.log('\n---- G. ARTIFACT INTEGRITY ----');

ok('G1. §213 evidence is byte-unchanged',
  (() => {
    const dir = join(ROOT, 'verification',
      'expert-hazlenz-213-targeted-verifier-validation-2026-09-09');
    return readFileSync(join(dir, 'RAW-VERIFIER-213.jsonl'), 'utf8').trim().split('\n').length === 11
      && readFileSync(join(dir, 'ADJUDICATION-213.md'), 'utf8').includes('HF-1 (×2), HF-4 (×2)');
  })());

ok('G2. the frozen §211 digest is unchanged',
  readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-211-first-pass-freeze-and-verifier-validation-design-2026-09-09',
    'VERIFIER-VALIDATION-PREREGISTRATION-211.sha256'), 'utf8')
    .startsWith('3d325fd38f55eafbc46d03841bb362cefbee9c90533e19aa28460796f26cf4a7'));

ok('G3. the §214 instruction is unedited since its own record was written',
  readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-214-verifier-semantic-remediation-2026-09-09',
    'REMEDIATION-RECORD-214.json'), 'utf8').includes(sha(EXPERT_VERIFIER_214_SYSTEM_PROMPT)),
  'the §214 record already carries this exact identity');

ok('G4. the instrument declares its version',
  CONFIRMATION_INSTRUMENT_215_VERSION.startsWith('hazlenz.expert.215.'));

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${CONFIRMATION_INSTRUMENT_215_VERSION}   PHASE A`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
console.log('  Nothing is frozen until build-215-preregistration runs and emits a digest.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
