/**
 * §227 PHASE A -- PRE-SPEND INTEGRITY AND FREEZE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Nothing may be transmitted until this writes SECTION-227-FROZEN-PROTOCOL.json and its digest.
 * It runs the §226 truth-consistency preflight over the §227 cases AND the seventeen §227 pre-spend
 * integrity checks. If any check fails, nothing is written and nothing is spent.
 */
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

{
  const envPath = join(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  }
}

import { EXPERT_HOSTED_INFERENCE_CONFIG } from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  INSTRUMENT_227_VERSION, HOSTED_CASES_227, PRIMARY_GATES_227, GATE_RULE_227,
  MAX_PROVIDER_CALLS_227, PLANNED_CALLS_227, CONTINGENCY_CALLS_227, SPEND_CEILING_USD_227,
  PROJECTED_SPEND_USD_227, ARM_227, SINGLE_ARM_BY_DESIGN, CONTINGENCY_POLICY_227,
  AUTHORING_LIMITATION_227, DATABASE_OPERATIONS_227,
  SEMANTIC_PREFERENCE_RETRIES_AUTHORIZED_227, MEASURES_227, preflight227,
} from './lib/expert-227-hosted-instrument';
import { assemble227, NO_GOVERNED_RECORDS_SUPPLIED_227 } from './lib/expert-227-assembly';
import {
  FIRST_PASS_CONTRACT_226_VERSION, instructionIdentity226,
} from './lib/expert-226-property-selection-capability';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-227-hosted-semantic-capability-confirmation-2026-09-11');
const D225 = join(ROOT, 'verification',
  'expert-hazlenz-225-hosted-declaration-confirmation-2026-09-11');
const D226 = join(ROOT, 'verification',
  'expert-hazlenz-226-first-pass-semantic-remediation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));

const checks: { check: string; ok: boolean; detail: string }[] = [];
const pf = (check: string, ok: boolean, detail: string): void => {
  checks.push({ check, ok, detail });
  console.log(`${ok ? 'ok   ' : 'FAIL '} ${check} -- ${detail}`);
};

console.log('§227 PRE-SPEND INTEGRITY. NOTHING IS TRANSMITTED UNTIL EVERY CHECK PASSES.\n');

const calls = assemble227();

// ---- 1. exactly 8 fresh primary cases exist
pf('C1. exactly 8 fresh primary cases exist',
  HOSTED_CASES_227.length === 8 && calls.length === 8
  && HOSTED_CASES_227.every(c => c.derivedFromPriorCase === null),
  `${HOSTED_CASES_227.length} cases, ${calls.length} assembled, all attest no prior-cohort `
  + 'derivation');

// ---- 2. all cases passed the §226 truth-consistency preflight
const pre = preflight227();
console.log('\n  -- §226 truth-consistency preflight, applied to the §227 cases --');
for (const k of pre.checks) {
  console.log(`  ${k.passed ? 'ok  ' : 'FAIL'}  ${k.id}. ${k.what}`);
  if (!k.passed) console.log(`          ${k.detail}`);
}
console.log('');
pf('C2. all cases pass the §226 truth-consistency preflight',
  pre.passed, `${pre.checks.filter(k => k.passed).length}/${pre.checks.length} checks`);

// ---- 3-6. the enumerations are explicit
pf('C3. every expected unresolved property is explicitly enumerated',
  HOSTED_CASES_227.every(c => c.owedProperties.every(
    p => p.key.length > 0 && p.proposition.length > 10 && p.whyGenuinelyOpen.length > 40)),
  `${HOSTED_CASES_227.reduce((a, c) => a + c.owedProperties.length, 0)} owed properties, each with `
  + 'a proposition and a stated reason it is open');

pf('C4. every established fact is explicitly enumerated',
  HOSTED_CASES_227.every(c => c.establishedFacts.length > 0),
  `${HOSTED_CASES_227.reduce((a, c) => a + c.establishedFacts.length, 0)} established facts across `
  + `${HOSTED_CASES_227.length} cases`);

pf('C5. every non-fact is explicitly enumerated',
  HOSTED_CASES_227.every(c => c.nonFacts.length > 0),
  `${HOSTED_CASES_227.reduce((a, c) => a + c.nonFacts.length, 0)} non-facts across `
  + `${HOSTED_CASES_227.length} cases`);

pf('C6. every prohibited proxy / adjacent property is explicit where applicable',
  HOSTED_CASES_227.every(c => c.owedProperties.every(p => p.prohibited.length >= 2)),
  `${HOSTED_CASES_227.reduce((a, c) => a + c.owedProperties
    .reduce((b, p) => b + p.prohibited.length, 0), 0)} annotated near neighbours`);

// ---- 7-9. the frozen expectations
pf('C7. expected declaration count is frozen and matches the enumeration',
  HOSTED_CASES_227.every(c => c.expectedDeclarationCount === c.owedProperties.length),
  HOSTED_CASES_227.map(c => `${c.caseId}:${c.expectedDeclarationCount}`).join(' '));

pf('C8. the exact controlling property or properties are frozen',
  HOSTED_CASES_227.every(c => [...c.expectedControllingPropertyKeys].sort().join(',')
    === c.owedProperties.map(p => p.key).sort().join(',')),
  HOSTED_CASES_227.flatMap(c => c.expectedControllingPropertyKeys).join(' '));

pf('C9. required-act and required-artifact semantics are frozen where applicable',
  HOSTED_CASES_227.some(c => c.requiredActSemanticsApply)
  && HOSTED_CASES_227.some(c => c.requiredArtifactSemanticsApply)
  && HOSTED_CASES_227.every(c => c.requiredActSemanticsApply
    === c.owedProperties.some(p => p.kind === 'REQUIRED_ACT'))
  && HOSTED_CASES_227.every(c => c.requiredArtifactSemanticsApply
    === c.owedProperties.some(p => p.kind === 'REQUIRED_ARTIFACT')),
  `act: ${HOSTED_CASES_227.filter(c => c.requiredActSemanticsApply).map(c => c.caseId).join(',')} · `
  + `artifact: ${HOSTED_CASES_227.filter(c => c.requiredArtifactSemanticsApply)
    .map(c => c.caseId).join(',')}`);

// ---- 10-11. truth consistency
const restraint = HOSTED_CASES_227.filter(c => c.restraintBasis !== null);
pf('C10. restraint cases contain zero decision-critical unresolved properties',
  restraint.length === 2 && restraint.every(c => c.owedProperties.length === 0
    && c.expectedDeclarationCount === 0 && (c.restraintBasis ?? '').length > 40),
  `${restraint.map(c => c.caseId).join(', ')} owe nothing and each states why`);

const collisions = pre.checks.find(k => k.id === 'P1');
pf('C11. no expected unresolved property is simultaneously established',
  collisions?.passed === true, collisions?.detail ?? 'check missing');

// ---- 12. all scored axes preregistered
pf('C12. all scored axes are preregistered, and every gate names its cases',
  HOSTED_CASES_227.every(c => c.scoredMeasures.length > 0)
  && PRIMARY_GATES_227.every(g => g.appliesToCases.length > 0)
  && PRIMARY_GATES_227.every(g => g.appliesToCases.every(
    id => HOSTED_CASES_227.find(c => c.caseId === id)?.scoredMeasures.includes(g.measure))),
  `${HOSTED_CASES_227.reduce((a, c) => a + c.scoredMeasures.length, 0)} judgment slots across `
  + `${PRIMARY_GATES_227.length} gates`);

// ---- 13-15. identities pinned
const id226 = instructionIdentity226();
pf('C13. the current prompt identity is pinned and is the §226 successor',
  calls.every(x => x.contractVersion === FIRST_PASS_CONTRACT_226_VERSION)
  && calls.every(x => x.identities.instruction === id226.plain)
  && id226.plain.length === 64,
  `${FIRST_PASS_CONTRACT_226_VERSION} @ ${id226.plain.slice(0, 16)}…`);

const schemaIds = new Set(calls.map(x => x.identities.schema));
pf('C14. the wire schema identity is pinned per case',
  calls.every(x => x.identities.schema.length === 64),
  `${schemaIds.size} distinct schema identities across ${calls.length} cases (per-case by design)`);

pf('C15. the execution configuration and model identity are pinned',
  typeof EXPERT_HOSTED_INFERENCE_CONFIG.model === 'string'
  && EXPERT_HOSTED_INFERENCE_CONFIG.model.length > 0,
  `${EXPERT_HOSTED_INFERENCE_CONFIG.model}, api ${EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion}, `
  + 'caching DISABLED');

// ---- 16-17. prior evidence unchanged
const manifest226 = readFileSync(join(D226, 'REPORT-226.sha256'), 'utf8')
  .split('\n').filter(Boolean).map(l => {
    const [d, p] = l.split(/\s+/); return { digest: d, path: p };
  });
const drift226 = manifest226.filter(m => shaFile(join(ROOT, m.path)) !== m.digest);
pf('C16. the §226 frozen instrument, results and report remain unchanged',
  drift226.length === 0,
  `${manifest226.length} manifest entries re-verified, ${drift226.length} drifted`);

const manifest225 = readFileSync(join(D225, 'REPORT-225.sha256'), 'utf8')
  .split('\n').filter(Boolean).map(l => {
    const [d, p] = l.split(/\s+/); return { digest: d, path: p };
  });
const drift225 = manifest225.filter(m => shaFile(join(ROOT, m.path)) !== m.digest);
pf('C17. the §225 evidence remains unchanged',
  drift225.length === 0,
  `${manifest225.length} manifest entries re-verified, ${drift225.length} drifted`);

// ---- additional protocol checks, same posture as §225
pf('C18. single arm by design, and it is recorded as such',
  SINGLE_ARM_BY_DESIGN === true && ARM_227 === 'REMEDIATED_226'
  && calls.every(x => x.arm === 'REMEDIATED_226'),
  'no predecessor leg; every gate is absolute on the §226 arm');

pf('C19. call plan is within the authorized ceiling',
  PLANNED_CALLS_227 === 8 && CONTINGENCY_CALLS_227 === 2 && MAX_PROVIDER_CALLS_227 === 10
  && calls.length === PLANNED_CALLS_227,
  `${PLANNED_CALLS_227} planned + ${CONTINGENCY_CALLS_227} contingency, ceiling `
  + `${MAX_PROVIDER_CALLS_227}, projected USD ${PROJECTED_SPEND_USD_227}, hard ceiling USD `
  + `${SPEND_CEILING_USD_227}`);

pf('C20. no cache_control is constructed anywhere in an assembled call',
  calls.every(x => !JSON.stringify(x.wireSchema).includes('cache_control')
    && !x.systemPrompt.includes('cache_control')),
  'caching DISABLED');

pf('C21. no evidence file pre-exists for this section',
  !existsSync(join(OUT, 'RAW-227.jsonl')) && !existsSync(join(OUT, 'CALL-LEDGER-227.jsonl')),
  'no RAW-227.jsonl and no CALL-LEDGER-227.jsonl');

pf('C22. the API key resolves',
  typeof process.env.ANTHROPIC_API_KEY === 'string'
  && (process.env.ANTHROPIC_API_KEY as string).length > 20,
  'ANTHROPIC_API_KEY present');

pf('C23. no governed record is supplied, and that is recorded as a decision',
  calls.every(x => x.governedRecords.length === 0)
  && NO_GOVERNED_RECORDS_SUPPLIED_227.supplied === 0,
  NO_GOVERNED_RECORDS_SUPPLIED_227.reason.slice(0, 60) + '…');

pf('C24. zero database operations and zero semantic-preference retries are authorized',
  DATABASE_OPERATIONS_227 === 0 && SEMANTIC_PREFERENCE_RETRIES_AUTHORIZED_227 === 0,
  'both 0');

pf('C25. the authoring limitation is recorded before any spend and is not mitigated',
  AUTHORING_LIMITATION_227.singleArm === true
  && AUTHORING_LIMITATION_227.statedBeforeSpend === true
  && AUTHORING_LIMITATION_227.notMitigated === true,
  'a pass cannot separate contract capability from case-authoring effects');

const allOk = checks.every(k => k.ok);
console.log(`\nPRE-SPEND INTEGRITY: ${checks.filter(k => k.ok).length}/${checks.length} passed`);

if (!allOk) {
  console.error('\nSTOP. One or more pre-spend integrity checks failed. The protocol is NOT frozen '
    + 'and NOTHING is transmitted. Repair before execution begins; repair after execution begins is '
    + 'not permitted.');
  process.exit(1);
}

const frozen = {
  artifact: 'SECTION-227-FROZEN-PROTOCOL',
  instrumentVersion: INSTRUMENT_227_VERSION,
  frozenBeforeAnyProviderCall: true,
  authorization: {
    section: '§227',
    purpose: 'final bounded hosted first-pass semantic capability confirmation',
    isNotADevelopmentOrTuningSection: true,
    executesTheExactFrozenSection226Design: true,
  },
  preSpendIntegrity: { passed: allOk, checks },
  truthConsistencyPreflight: { passed: pre.passed, checks: pre.checks },
  arm: { single: SINGLE_ARM_BY_DESIGN, arm: ARM_227 },
  authoringLimitation: AUTHORING_LIMITATION_227,
  contract: {
    version: FIRST_PASS_CONTRACT_226_VERSION,
    instructionIdentity: id226,
  },
  model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
  apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
  cachingPosture: 'DISABLED — no cache_control constructed anywhere',
  governedRecords: NO_GOVERNED_RECORDS_SUPPLIED_227,
  callPlan: {
    planned: PLANNED_CALLS_227,
    contingency: CONTINGENCY_CALLS_227,
    ceiling: MAX_PROVIDER_CALLS_227,
    oneCallPerCase: true,
    contingencyPolicy: CONTINGENCY_POLICY_227,
  },
  spend: {
    projectedUsd: PROJECTED_SPEND_USD_227,
    hardCeilingUsd: SPEND_CEILING_USD_227,
    basis: 'the §225 remediated-arm ledger: 8 calls, USD 0.67723, mean USD 0.08465, max USD '
      + '0.09161. §226 adds about 114 lines of instruction so input tokens rise modestly.',
  },
  databaseOperations: DATABASE_OPERATIONS_227,
  semanticPreferenceRetriesAuthorized: SEMANTIC_PREFERENCE_RETRIES_AUTHORIZED_227,
  measures: MEASURES_227,
  primaryGates: PRIMARY_GATES_227,
  gateRule: GATE_RULE_227,
  perCaseIdentities: calls.map(x => ({
    caseId: x.caseId, ordinal: x.ordinal, analysisId: x.analysisId,
    observationSourceId: x.observationSourceId,
    instructionSha256: x.identities.instruction,
    userPromptSha256: x.identities.userPrompt,
    wireSchemaSha256: x.identities.schema,
  })),
  priorEvidenceVerified: {
    section226: { manifestEntries: manifest226.length, drifted: drift226.length },
    section225: { manifestEntries: manifest225.length, drifted: drift225.length },
  },
  cases: HOSTED_CASES_227,
  frozenAt: new Date().toISOString(),
};

mkdirSync(OUT, { recursive: true });
const path = join(OUT, 'SECTION-227-FROZEN-PROTOCOL.json');
if (existsSync(path)) {
  console.error(`\nABORT: ${path} already exists. A frozen protocol is not overwritten.`);
  process.exit(1);
}
const body = `${JSON.stringify(frozen, null, 2)}\n`;
writeFileSync(path, body);
const digest = sha(body);
writeFileSync(join(OUT, 'SECTION-227-FROZEN-PROTOCOL.sha256'),
  `${digest}  SECTION-227-FROZEN-PROTOCOL.json\n`);

console.log(`\nFROZEN. 8 cases, 1 arm, ${PLANNED_CALLS_227} planned calls, ceiling `
  + `${MAX_PROVIDER_CALLS_227}, hard spend ceiling USD ${SPEND_CEILING_USD_227}.`);
console.log(`FROZEN EXECUTION PACKAGE DIGEST  ${digest}`);
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0');
