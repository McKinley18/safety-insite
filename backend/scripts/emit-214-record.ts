import { createHash } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  VERIFIER_SEMANTIC_REMEDIATION_214_VERSION, SUPERSESSION_LEDGER, OVERCORRECTION_GUARDS_214,
  VOCABULARY_UNCHANGED, sizeAccounting, carriedVerbatimFraction, REMIT_BLOCK_214,
} from './lib/expert-214-verifier-semantic-remediation';
import {
  SCOPE_ADMISSION_CODES_214, SCOPE_DECISION_INPUTS, scopeContainmentEffect,
} from './lib/expert-214-scope-containment';
import {
  PROTECTED_CONTROLS, FIXTURES_214, pairs, blanketVocabularyRuleScore, fixtureEffect214,
  requiredOutcomeIsRepresentable,
} from './lib/expert-214-controls-and-fixtures';
import {
  RECOMMENDED_CASES, recommendedCallCount, costProjection214, SUCCESS_CRITERIA,
  ALREADY_SETTLED_BY_213, RECOMMENDATION_LIMITS, STATUS,
} from './lib/expert-214-hosted-confirmation-recommendation';

const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-214-verifier-semantic-remediation-2026-09-09');
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

const rec = {
  artifact: 'SECTION-214-VERIFIER-SEMANTIC-REMEDIATION-RECORD',
  version: VERIFIER_SEMANTIC_REMEDIATION_214_VERSION,
  providerCalls: 0,
  databaseOperations: 0,
  schemaChanged: false,
  kr1Status: 'OPEN — local fixtures show the behaviour is representable; hosted mitigation is not established',
  supersession: { ledger: SUPERSESSION_LEDGER, carriedVerbatimFraction: carriedVerbatimFraction() },
  size: sizeAccounting(),
  blockLines: REMIT_BLOCK_214.length,
  vocabularyUnchanged: VOCABULARY_UNCHANGED,
  overcorrectionGuards: OVERCORRECTION_GUARDS_214,
  scopeContainment: {
    codes: SCOPE_ADMISSION_CODES_214, decisionInputs: SCOPE_DECISION_INPUTS,
    effect: scopeContainmentEffect(),
  },
  controls: PROTECTED_CONTROLS,
  fixtures: FIXTURES_214.map(f => ({
    id: f.id, pair: f.pair, shape: f.shape, controls: f.controls, noun: f.nounUnderTest,
    role: f.semanticRole, requiredOutcome: f.requiredOutcome, siblingHandling: f.siblingHandling,
    representable: requiredOutcomeIsRepresentable(f), mustNotAssert: f.mustNotAssert,
  })),
  pairs: pairs().map(p => ({ pair: p.pair, members: p.members.map(m => m.id) })),
  blanketRuleNegativeControl: blanketVocabularyRuleScore(),
  fixtureEffect: fixtureEffect214(),
  hostedConfirmationRecommendation: {
    status: STATUS, cases: RECOMMENDED_CASES, calls: recommendedCallCount(),
    cost: costProjection214(), successCriteria: SUCCESS_CRITERIA,
    alreadySettledBy213: ALREADY_SETTLED_BY_213, limits: RECOMMENDATION_LIMITS,
  },
  generatedAt: '2026-09-09',
};
const json = JSON.stringify(rec, null, 2) + '\n';
writeFileSync(join(DIR, 'REMEDIATION-RECORD-214.json'), json);
writeFileSync(join(DIR, 'REMEDIATION-RECORD-214.sha256'),
  `${createHash('sha256').update(json, 'utf8').digest('hex')}  REMEDIATION-RECORD-214.json\n`);

const s = sizeAccounting() as any;
console.log('block   ', s.blockLines212, '->', s.blockLines214, 'lines |', s.blockChars212, '->', s.blockChars214, 'chars');
console.log('prompt  v3.2', s.promptCharsV32, '| 212', s.promptChars212, '| 214', s.promptChars214);
console.log('added   vs v3.2 +' + s.addedCharsVsV32, '(~+' + s.estimatedAddedTokensVsV32 + ' tok) | vs 212 +' + s.addedCharsVs212, '(~+' + s.estimatedAddedTokensVs212 + ' tok)');
console.log('carried verbatim', Math.round(carriedVerbatimFraction()*100) + '%');
console.log('replaced', JSON.stringify(s.sectionsReplaced));
console.log('added   ', JSON.stringify(s.sectionsAdded));
console.log('removed ', JSON.stringify(s.sectionsRemovedOutright));
console.log('blanket rule:', JSON.stringify(blanketVocabularyRuleScore()));
console.log('recommendation:', recommendedCallCount(), 'calls |', JSON.stringify(costProjection214().projectedUsd), '->ceiling', costProjection214().recommendedCeilingUsd);
