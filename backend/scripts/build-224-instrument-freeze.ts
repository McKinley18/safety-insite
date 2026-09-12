/**
 * §224 -- FREEZE THE LOCAL CAPABILITY INSTRUMENT. RUN BEFORE ANY REMEDIATION IS WRITTEN.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  INSTRUMENT_224_VERSION, MEASURES_224, AGGREGATE_SCORE_PERMITTED, CASES_224, CONTRACT_RULES,
} from './lib/expert-224-capability-instrument';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-224-first-pass-declaration-capability-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const instrumentModule = join(__dirname, 'lib', 'expert-224-capability-instrument.ts');

const doc = {
  artifact: 'SECTION-224-LOCAL-CAPABILITY-INSTRUMENT',
  instrumentVersion: INSTRUMENT_224_VERSION,
  frozenBeforeAnyRemediation: true,
  providerCalls: 0,
  databaseOperations: 0,
  whatThisEstablishes: 'CONTRACT_DISCRIMINATION — whether the contract\'s own stated rule reaches '
    + 'the right verdict about a first-pass output. It is a local instrument with no provider '
    + 'call and therefore establishes NOTHING about how a model will behave. Per HAZLENZ_INVARIANTS, '
    + 'a contract change is never evidence that a behavioural defect is repaired.',
  whatThisDoesNotEstablish: [
    'that the remediated first pass will declare the owed property',
    'that the remediated first pass will select the controlling property',
    'any semantic capability claim whatsoever',
  ],
  measures: MEASURES_224,
  aggregateScorePermitted: AGGREGATE_SCORE_PERMITTED,
  hardRequirements: {
    decisionCriticalDeclarationRecall: '100% under REMEDIATED_224',
    exactControllingPropertyIdentity: '100% under REMEDIATED_224',
    independentFactPreservation: '100% under REMEDIATED_224',
    safeNegatedFalseDeclarations: 0,
    ordinaryNonDecisionCriticalFalseDeclarations: 0,
    deterministicSemanticInvention: 0,
    mayAnyOfTheseBeOffsetByAnAggregate: false,
  },
  contractsUnderTest: CONTRACT_RULES,
  caseCount: CASES_224.length,
  cases: CASES_224.map(c => ({
    caseId: c.caseId,
    family: c.family,
    observation: c.observation,
    outputProvenance: c.outputProvenance,
    owedProperties: c.owedProperties,
    restraintBasis: c.restraintBasis,
    declarationsInOutput: c.output.declarations.length,
    clarificationsInOutput: c.output.clarificationCount,
    selfDeclaredUnresolvedCandidates: c.output.candidates
      .filter(k => k.assertedConditionState === 'UNKNOWN'
        || k.assertedConditionState === 'INSUFFICIENT_EVIDENCE')
      .map(k => k.candidateKey),
    expected: c.expected,
  })),
  instrumentModuleSha256: sha(readFileSync(instrumentModule, 'utf8')),
  frozenAt: '2026-09-11',
};

const json = `${JSON.stringify(doc, null, 2)}\n`;
writeFileSync(join(OUT, 'SECTION-224-LOCAL-INSTRUMENT.json'), json);
writeFileSync(join(OUT, 'SECTION-224-LOCAL-INSTRUMENT.sha256'),
  `${sha(json)}  SECTION-224-LOCAL-INSTRUMENT.json\n`);
console.log('cases', CASES_224.length);
console.log('instrumentModuleSha256', doc.instrumentModuleSha256);
console.log('frozenDigest', sha(json));
