import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  DISPOSITION_REMEDIATION_216_VERSION, SUPERSESSION_LEDGER_216, OVERCORRECTION_GUARDS_216,
  VOCABULARY_UNCHANGED_216, PROCESS_STOPPING_RULE, REMIT_BLOCK_216, sizeAccounting216,
  carriedVerbatimFraction216,
} from './lib/expert-216-disposition-remediation';
import {
  DISPOSITION_INVARIANT, closureMatrix, dispositionRoutingIsClosed, CLOSURE_RESIDUAL,
  REFUSED_RULES, VERDICT_FOR_A_PROPERTY_CHALLENGE, closureEffect216,
} from './lib/expert-216-disposition-closure';
import {
  FIXTURES_216, requiredDispositionIsRepresentable, clarificationFirstScore, minimalContrasts,
  fixtureEffect216,
} from './lib/expert-216-fixtures';
import {
  RECOMMENDED_CASES_216, recommendedCallCount216, costProjection216, FIFTH_CASE_ANALYSIS,
  FUTURE_HARD_GATES, ALREADY_SETTLED, localFixtureBacking, RECOMMENDATION_LIMITS_216, STATUS,
} from './lib/expert-216-hosted-recommendation';

const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-216-disposition-and-property-remediation-2026-09-09');
const rec = {
  artifact: 'SECTION-216-DISPOSITION-AND-PROPERTY-REMEDIATION-RECORD',
  version: DISPOSITION_REMEDIATION_216_VERSION,
  providerCalls: 0, databaseOperations: 0, schemaChanged: false,
  kr1Status: 'OPEN — local fixtures show the disposition is representable; no hosted mitigation',
  processStoppingRule: PROCESS_STOPPING_RULE,
  supersession: {
    ledger: SUPERSESSION_LEDGER_216, carriedVerbatimFraction: carriedVerbatimFraction216(),
    blockLines: REMIT_BLOCK_216.length,
  },
  size: sizeAccounting216(),
  vocabularyUnchanged: VOCABULARY_UNCHANGED_216,
  overcorrectionGuards: OVERCORRECTION_GUARDS_216,
  rv4: {
    invariant: DISPOSITION_INVARIANT,
    verdictForAPropertyChallenge: VERDICT_FOR_A_PROPERTY_CHALLENGE,
    closureMatrix: closureMatrix(),
    routingIsClosed: dispositionRoutingIsClosed(),
    closureResidual: CLOSURE_RESIDUAL,
    refusedRules: REFUSED_RULES,
    effect: closureEffect216(),
  },
  fixtures: FIXTURES_216.map(f => ({
    id: f.id, shape: f.shape, propertyIsCorrect: f.propertyIsCorrect,
    clarificationSettles: f.clarificationSettlesTheControllingProperty,
    requiredDisposition: f.requiredDisposition, ladderStep: f.decidedAtLadderStep,
    representable: requiredDispositionIsRepresentable(f), mustNotAssert: f.mustNotAssert,
  })),
  minimalContrasts: minimalContrasts(),
  clarificationFirstNegativeControl: clarificationFirstScore(),
  fixtureEffect: fixtureEffect216(),
  hostedRecommendation: {
    status: STATUS, cases: RECOMMENDED_CASES_216, calls: recommendedCallCount216(),
    cost: costProjection216(), fifthCaseAnalysis: FIFTH_CASE_ANALYSIS,
    futureHardGates: FUTURE_HARD_GATES, alreadySettled: ALREADY_SETTLED,
    localFixtureBacking: localFixtureBacking(), limits: RECOMMENDATION_LIMITS_216,
  },
  generatedAt: '2026-09-09',
};
const json = JSON.stringify(rec, null, 2) + '\n';
writeFileSync(join(DIR, 'REMEDIATION-RECORD-216.json'), json);
writeFileSync(join(DIR, 'REMEDIATION-RECORD-216.sha256'),
  `${createHash('sha256').update(json, 'utf8').digest('hex')}  REMEDIATION-RECORD-216.json\n`);
const s = sizeAccounting216() as any;
console.log('removed', s.removedCharacters, '| added', s.addedCharacters, '| net vs 214', s.netCharactersVs214, '(~' + s.estimatedNetTokensVs214 + ' tok)');
console.log('prompt', s.promptChars214, '->', s.promptChars216, '| block', s.blockLines214, '->', s.blockLines216, 'lines');
console.log('carried verbatim', Math.round(carriedVerbatimFraction216()*100) + '%');
console.log('closure closed:', dispositionRoutingIsClosed());
console.log('negative control:', JSON.stringify(clarificationFirstScore()));
console.log('recommendation:', recommendedCallCount216(), 'calls |', JSON.stringify(costProjection216().projectedUsd), '-> ceiling', costProjection216().recommendedCeilingUsd);
