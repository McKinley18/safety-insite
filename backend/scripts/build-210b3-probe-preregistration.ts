/**
 * §210B-3A -- EMIT AND FREEZE THE PROBE PREREGISTRATION. ZERO PROVIDER CALLS. ZERO DATABASE OPS.
 *
 * Writes the preregistration artifact and its sha256 into a new directory. It reads the §209 and
 * §210B evidence only to pin identities; it writes nothing outside its own output directory and has
 * no provider or database code path.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  PASS_RULE, PROBE_AXES, PROBE_STIMULI, PROBE_VERSION, TOKEN_PLAN, projectCost,
} from './lib/section-210b3-probe-preregistration';
import { instructionIdentities } from './lib/expert-first-pass-instruction-210b2';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-210b3-probe-preregistration-2026-09-08');
const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

const ids = instructionIdentities() as any;

// ---- refuse to freeze a probe that cannot answer the question it was built for
const problems: string[] = [];
if (PROBE_STIMULI.length !== 8) problems.push(`${PROBE_STIMULI.length} stimuli, expected 8`);
if (new Set(PROBE_STIMULI.map(s => s.caseId)).size !== 8) problems.push('duplicate case ids');
for (const s of PROBE_STIMULI) {
  const banned = /decision-critical|independent|conjunctive|irrelevant/i;
  if (banned.test(s.observation)) problems.push(`${s.caseId}: observation labels the answer`);
  if (s.observation.length < 400) problems.push(`${s.caseId}: observation too thin`);
  if (s.expectedDeclarationCount > 0 && s.requiredOwedProperties.length === 0) {
    problems.push(`${s.caseId}: expects declarations but names no required property`);
  }
  if (s.expectedDeclarationCount === 0 && s.requiredOwedProperties.length > 0) {
    problems.push(`${s.caseId}: expects none but names a required property`);
  }
  if (s.evaluationQuestions.length === 0) problems.push(`${s.caseId}: no evaluation questions`);
  if (/AC-\d\d/.test(s.observation)) problems.push(`${s.caseId}: replays a §209 case id`);
}
const exercised = (axis: string): string[] =>
  PROBE_STIMULI.map(s => s.caseId)
    .filter(c => !(PROBE_AXES.find(a => a.id === axis)?.notApplicableFrozenFor ?? []).includes(c));
for (const a of PROBE_AXES) {
  if (exercised(a.id).length === 0) problems.push(`axis ${a.id} is exercised by no case`);
}
if (problems.length > 0) {
  console.error('§210B-3A REFUSED: the probe would not discriminate.');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const noCache = projectCost(false);
const cached = projectCost(true);

const record = {
  artifact: 'SECTION_210B3A_HOSTED_PROBE_PREREGISTRATION',
  probeVersion: PROBE_VERSION,
  writtenBeforeAnyProviderCall: true,
  providerCalls: 0,
  databaseOperations: 0,
  isAcceptanceEvidence: false,
  note: 'DEVELOPMENT evidence only. Frozen before execution. Once presented for product-owner '
    + 'review this file is not edited; a truth defect found later is recorded as a '
    + 'PREREGISTRATION_DEFECT beside the frozen text, never silently repaired.',

  instruction: {
    oldVersion: ids.oldVersion,
    newVersion: ids.newVersion,
    oldIdentity: ids.withoutGovernedBinding.oldIdentity,
    newIdentity: ids.withoutGovernedBinding.newIdentity,
    newIdentityGovernedVariant: ids.withGovernedBinding.newIdentity,
    staticAddedChars: ids.withoutGovernedBinding.addedChars,
    staticAddedTokensEstimated: ids.withoutGovernedBinding.estimatedAddedTokens,
  },

  executionPlan: {
    calls: 8,
    leg: 'FIRST_PASS',
    callsPerStimulus: 1,
    verifierCalls: 0,
    governedStageCalls: 0,
    governedEvidenceSuppliedInFirstPass: ['PB-02'],
    semanticRetries: 0,
    postOutputTruthEdits: 0,
    providerModelConfiguration: 'unchanged from §208 except prompt caching, see cacheDecision',
  },

  cacheDecision: {
    finding: 'AT 8 CALLS WITHOUT CACHING THE PROBE EXCEEDS ITS OWN HARD CEILING.',
    projectionWithoutCaching: noCache,
    projectionWithCaching: cached,
    consequence: 'prompt caching on the stable prefix is not an optimization for this probe, it is '
      + 'what brings it inside the $0.50 ceiling. Enabling it is a transport change from the '
      + '§208/§208B configuration and is flagged here for explicit authorization rather than made '
      + 'silently.',
    targetNotAchievable: 'the $0.20 target is not reachable at 8 calls with realistic output '
      + 'length: output alone is ~18,592 tokens ~= $0.186. Reported rather than engineered around, '
      + 'because capping output to hit a budget risks truncated structured output.',
    recommendation: 'authorize caching and accept a projected $0.35, within the $0.50 ceiling and '
      + 'above the $0.20 target; or reduce coverage, which costs discrimination.',
  },

  tokenPlan: TOKEN_PLAN,
  passRule: PASS_RULE,
  axes: PROBE_AXES.map(a => ({
    ...a, exercisedOn: exercised(a.id), notApplicableOn: a.notApplicableFrozenFor,
  })),
  stimuli: PROBE_STIMULI,
  totals: {
    stimuli: PROBE_STIMULI.length,
    expectedDeclarationsAcrossProbe:
      PROBE_STIMULI.reduce((n, s) => n + s.expectedDeclarationCount, 0),
    evaluationQuestions: PROBE_STIMULI.reduce((n, s) => n + s.evaluationQuestions.length, 0),
    zeroDeclarationControls: PROBE_STIMULI.filter(s => s.expectedDeclarationCount === 0)
      .map(s => s.caseId),
    twoDeclarationCases: PROBE_STIMULI.filter(s => s.expectedDeclarationCount === 2)
      .map(s => s.caseId),
  },
  frozenAt: '2026-09-08T00:00:00.000Z',
};

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const body = `${JSON.stringify(record, null, 2)}\n`;
const path = join(OUT, 'PROBE-PREREGISTRATION-210B3A.json');
writeFileSync(path, body);
const identity = sha256(body);
writeFileSync(join(OUT, 'PROBE-PREREGISTRATION-210B3A.sha256'),
  `${identity}  PROBE-PREREGISTRATION-210B3A.json\n`);

console.log('================ §210B-3A PROBE PREREGISTERED');
console.log(`  stimuli                : ${record.totals.stimuli}`);
console.log(`  expected declarations  : ${record.totals.expectedDeclarationsAcrossProbe}`);
console.log(`  evaluation questions   : ${record.totals.evaluationQuestions}`);
console.log(`  axes                   : ${PROBE_AXES.length}`);
console.log(`  projected cost, cached : $${cached.costUsd}  (ceiling $${TOKEN_PLAN.hardCeilingUsd})`);
console.log(`  projected, no cache    : $${noCache.costUsd}  EXCEEDS CEILING`);
console.log(`  artifact               : ${path}`);
console.log(`  sha256                 : ${identity}`);
console.log('  provider calls: 0   database operations: 0');
