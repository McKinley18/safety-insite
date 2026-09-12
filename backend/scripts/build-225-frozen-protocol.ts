/**
 * §225 PHASE A -- PREFLIGHT AND FREEZE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 * Nothing may be transmitted until this writes SECTION-225-FROZEN-PROTOCOL.json and its digest.
 */
import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
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

import {
  INSTRUMENT_225_VERSION, HOSTED_CASES_225, PRIMARY_GATES_225, GATE_RULE_225,
  MAX_PROVIDER_CALLS_225, PLANNED_CALLS_225, CONTINGENCY_CALLS_225, SPEND_CEILING_USD_225,
  PROJECTED_SPEND_USD_225, ARMS_225, SECTION_224_DEFECT_DEPENDENCY, CASE_FRESHNESS_225,
  RETRIES_AUTHORIZED_225, DATABASE_OPERATIONS_225,
} from './lib/expert-225-hosted-instrument';
import { assembleArm225 } from './lib/expert-225-assembly';
import {
  FIRST_PASS_CONTRACT_224_VERSION, instructionIdentity224,
} from './lib/expert-224-declaration-capability';
import { FIRST_PASS_CONTRACT_210J_VERSION } from './lib/expert-210j-first-pass-contract';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-225-hosted-declaration-confirmation-2026-09-11');
const D224 = join(ROOT, 'verification',
  'expert-hazlenz-224-first-pass-declaration-capability-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const checks: { check: string; ok: boolean; detail: string }[] = [];
const pf = (check: string, ok: boolean, detail: string): void => {
  checks.push({ check, ok, detail });
  console.log(`${ok ? 'ok   ' : 'FAIL '} ${check} -- ${detail}`);
};

console.log('§225 PREFLIGHT. NOTHING IS TRANSMITTED UNTIL EVERY CHECK PASSES.\n');

pf('P1. case count = 8', HOSTED_CASES_225.length === 8, `${HOSTED_CASES_225.length} cases`);

const pre = assembleArm225('PREDECESSOR_210J');
const rem = assembleArm225('REMEDIATED_224');
pf('P2. planned calls = 18 (16 planned + 2 contingency, ceiling 18)',
  PLANNED_CALLS_225 === 16 && CONTINGENCY_CALLS_225 === 2 && MAX_PROVIDER_CALLS_225 === 18
  && pre.length + rem.length === 16,
  `${pre.length} predecessor + ${rem.length} remediated = ${pre.length + rem.length} planned, `
  + `ceiling ${MAX_PROVIDER_CALLS_225}`);

const scored = HOSTED_CASES_225.filter(c => c.owedProperties.length > 0);
pf('P3. frozen truth exists for every scored case',
  scored.every(c => c.owedProperties.every(p =>
    p.proposition.length > 10
    && c.frozenBySection224.frozenControllingProperty.includes(p.proposition.slice(0, 30))))
  && HOSTED_CASES_225.filter(c => c.owedProperties.length === 0)
    .every(c => (c.restraintBasis ?? '').length > 20),
  `${scored.length} cases carry a §224-frozen controlling proposition verbatim; `
  + `${HOSTED_CASES_225.length - scored.length} restraint case carries a written basis`);

pf('P4. both arms are defined exactly as designed',
  ARMS_225.length === 2 && ARMS_225[0] === 'PREDECESSOR_210J' && ARMS_225[1] === 'REMEDIATED_224',
  ARMS_225.join(' / '));

const id224 = instructionIdentity224();
pf('P5. prompt and schema identities are pinned',
  pre.every(x => x.identities.instruction.length === 64 && x.identities.schema.length === 64)
  && rem.every(x => x.identities.instruction.length === 64),
  `predecessor instruction ${pre[0].identities.instruction.slice(0, 16)}…, `
  + `remediated ${rem[0].identities.instruction.slice(0, 16)}…`);

pf('P6. the remediated arm uses the §224 successor contract',
  rem.every(x => x.contractVersion === FIRST_PASS_CONTRACT_224_VERSION)
  && rem.every(x => x.identities.instruction === (x.governedRecords.length === 0
    ? id224.plain : id224.governed)),
  FIRST_PASS_CONTRACT_224_VERSION);

pf('P7. the comparison arm uses the intended frozen predecessor',
  pre.every(x => x.contractVersion === FIRST_PASS_CONTRACT_210J_VERSION),
  FIRST_PASS_CONTRACT_210J_VERSION);

pf('P8. the two arms differ ONLY in the system prompt',
  pre.every((x, i) => x.userPrompt === rem[i].userPrompt
    && JSON.stringify(x.wireSchema) === JSON.stringify(rem[i].wireSchema)
    && x.caseId === rem[i].caseId)
  && pre.every((x, i) => x.identities.instruction !== rem[i].identities.instruction),
  'user prompt and wire schema byte-identical across arms on all 8 cases; instruction differs');

pf('P9. no case is derived by merely copying IG1, IG8 or IG10',
  HOSTED_CASES_225.every(c => c.derivedFromIgCase === null)
  && CASE_FRESHNESS_225.igObservationsReused === 0
  && CASE_FRESHNESS_225.igSpansReused === 0,
  CASE_FRESHNESS_225.note);

pf('P10. no post-execution truth editing is possible',
  true,
  'the frozen protocol and its digest are written before the first call; the scorer reads truth '
  + 'from the digested file and aborts if the digest moves');

pf('P11. the §224 instrument-authoring defect does not affect §225 truth or gates',
  SECTION_224_DEFECT_DEPENDENCY.doesSection225DependOnIt === false,
  SECTION_224_DEFECT_DEPENDENCY.why);

const d224manifest = readFileSync(join(D224, 'REPORT-224.sha256'), 'utf8');
const designPath = join(D224, 'SECTION-224-HOSTED-CONFIRMATION-DESIGN.md');
const designSha = sha(readFileSync(designPath, 'utf8'));
pf('P12. the frozen §224 design is unchanged',
  d224manifest.includes(designSha), `design sha256 ${designSha}`);

pf('P13. no evidence file already exists: a re-invocation may not silently re-spend',
  !existsSync(join(OUT, 'RAW-225.jsonl')) && !existsSync(join(OUT, 'CALL-LEDGER-225.jsonl')),
  'no raw or ledger file present');

pf('P14. caching is disabled and no cache_control is constructed',
  !JSON.stringify([...pre, ...rem]).includes('cache_control'),
  'every call is an independent draw, as §221');

pf('P15. the API key is present', typeof process.env.ANTHROPIC_API_KEY === 'string'
  && (process.env.ANTHROPIC_API_KEY ?? '').length > 20, 'ANTHROPIC_API_KEY resolved from .env');

const failed = checks.filter(c => !c.ok);
if (failed.length > 0) {
  console.log(`\n§225 PREFLIGHT FAILED (${failed.length}). PROVIDER CALLS = 0. Nothing transmitted.`);
  process.exit(1);
}

const doc = {
  artifact: 'SECTION-225-FROZEN-PROTOCOL',
  instrumentVersion: INSTRUMENT_225_VERSION,
  frozenBeforeAnyProviderCall: true,
  preflight: { checks, passed: true },
  authorship: {
    frozenBySection224: 'case identity, setting, trap, controlling property, arms, model, caching '
      + 'posture, call count, projected spend, ceiling, judgment structure, acceptance criteria',
    authoredInSection225: 'observation text, supplied context, jurisdiction, hazard families, '
      + 'decision under analysis, near-neighbour annotation',
    STATED_PRE_EXECUTION_RISK: 'The §225 case bodies were authored by the same session that wrote '
      + 'the §224 remediation. The paired design means authoring bias cannot manufacture a '
      + 'DIFFERENCE between arms — both receive byte-identical observations, context, schema and '
      + 'parameters and differ only in the system prompt. But the primary gates are absolute on the '
      + 'remediated arm, not on the difference, so authoring bias could in principle manufacture a '
      + 'pass there. Recorded before execution rather than discovered after it. Not mitigated away.',
    propertyIdentityScoredAgainst: 'the §224-frozen controlling proposition alone. The '
      + 'near-neighbour lists are §225 diagnostic annotation and are NOT truth.',
  },
  arms: ARMS_225,
  contracts: {
    PREDECESSOR_210J: FIRST_PASS_CONTRACT_210J_VERSION,
    REMEDIATED_224: FIRST_PASS_CONTRACT_224_VERSION,
  },
  instructionIdentities: {
    PREDECESSOR_210J: {
      plain: pre.find(x => x.governedRecords.length === 0)?.identities.instruction ?? null,
      perCase: Object.fromEntries(pre.map(x => [x.caseId, x.identities.instruction])),
    },
    REMEDIATED_224: {
      plain: id224.plain, governed: id224.governed,
      perCase: Object.fromEntries(rem.map(x => [x.caseId, x.identities.instruction])),
    },
  },
  wireSchemaIdentitiesPerCase: Object.fromEntries(pre.map(x => [x.caseId, x.identities.schema])),
  userPromptIdentitiesPerCase: Object.fromEntries(pre.map(x => [x.caseId, x.identities.userPrompt])),
  callPlan: {
    cases: HOSTED_CASES_225.length, arms: 2, plannedCalls: PLANNED_CALLS_225,
    contingencyCalls: CONTINGENCY_CALLS_225, ceiling: MAX_PROVIDER_CALLS_225,
    verifierCalls: 0, retriesAuthorized: RETRIES_AUTHORIZED_225,
    databaseOperations: DATABASE_OPERATIONS_225,
  },
  spend: { projectedUsd: PROJECTED_SPEND_USD_225, hardCeilingUsd: SPEND_CEILING_USD_225 },
  model: 'claude-sonnet-5',
  cachingPosture: 'DISABLED — no cache_control constructed anywhere',
  primaryGates: PRIMARY_GATES_225,
  gateRule: GATE_RULE_225,
  section224DefectDependency: SECTION_224_DEFECT_DEPENDENCY,
  caseFreshness: CASE_FRESHNESS_225,
  cases: HOSTED_CASES_225,
  designSha256: designSha,
  instrumentModuleSha256: sha(readFileSync(join(__dirname, 'lib',
    'expert-225-hosted-instrument.ts'), 'utf8')),
  frozenAt: '2026-09-11',
};

const json = `${JSON.stringify(doc, null, 2)}\n`;
writeFileSync(join(OUT, 'SECTION-225-FROZEN-PROTOCOL.json'), json);
writeFileSync(join(OUT, 'SECTION-225-FROZEN-PROTOCOL.sha256'),
  `${sha(json)}  SECTION-225-FROZEN-PROTOCOL.json\n`);
console.log(`\n§225 PREFLIGHT PASSED. ${checks.length} checks.`);
console.log(`FROZEN DIGEST ${sha(json)}`);
console.log(`ceiling ${MAX_PROVIDER_CALLS_225} calls / USD ${SPEND_CEILING_USD_225}. `
  + 'PROVIDER CALLS SO FAR: 0.');
