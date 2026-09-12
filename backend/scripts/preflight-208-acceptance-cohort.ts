/**
 * §208 -- OFFLINE PREFLIGHT. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Constructs every request the acceptance run will transmit and checks it WITHOUT sending any of
 * them. A construction defect discovered by spending 24 provider calls is a defect discovered
 * expensively and, worse, one that would have to be repaired inside a started acceptance run --
 * which the §208 authorization forbids. So everything checkable offline is checked offline first.
 */

import { createHash } from 'crypto';
import { join } from 'path';

import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, buildExpertVNextWireSchema,
} from './lib/expert-first-pass-instruction-vnext';
import { buildExpertR2SystemPrompt } from './lib/expert-205-first-pass-instruction-r2';
import { describeGrammarProjection203 } from './lib/expert-203-effective-grammar-identity';
import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';
import { cohortExecutionPermitted } from './lib/expert-207-execution-gate';

const ROOT = join(__dirname, '..', '..');
const AUTHORIZATION_REFERENCE = 'SECTION-208-PRODUCT-OWNER-AUTHORIZATION-2026-09-08';
const AUTHORIZED_IDENTITY = '879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4';

const bytes = (v: unknown): number => Buffer.byteLength(JSON.stringify(v), 'utf8');
const sha16 = (s: string): string =>
  createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);

let failures = 0;
const check = (id: string, ok: boolean, detail: string): void => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
};

const gate = cohortExecutionPermitted({
  repoRoot: ROOT,
  governedTransportSmokePassed: true,
  authorization: {
    productOwnerReviewRecorded: true,
    cohortExecutionAuthorized: true,
    authorizationReference: AUTHORIZATION_REFERENCE,
  },
});

console.log('================ §208 OFFLINE PREFLIGHT');
check('EG.permitted', gate.permitted, `blockers=${gate.blockers.length}`);
check('EG.identity-is-the-authorized-one',
  gate.sourceIdentity === AUTHORIZED_IDENTITY && gate.pin === AUTHORIZED_IDENTITY,
  gate.sourceIdentity);
check('EG.record-verified', gate.verification?.code === 'VERIFIED',
  gate.verification?.code ?? 'not loaded');
check('CASES.twenty-four', FROZEN_TRUTH_CASES.length === 24, `${FROZEN_TRUTH_CASES.length}`);

console.log('\n  case    schemaB  asSentB  bodyB   grammar           promptSha  govIds');
let maxBody = 0;
for (const c of FROZEN_TRUTH_CASES) {
  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `AN-208-${c.caseId}`,
    authoritativeSources: [
      { sourceId: `OBS-${c.caseId}`, sourceType: 'observation', text: c.observation },
    ],
    inspectionContext: { location: c.location, task: c.task },
    jurisdiction: c.jurisdiction,
    allowedHazardFamilies: [...c.allowedHazardFamilies],
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
  };
  const schema = buildExpertVNextWireSchema(input, { governedEvidenceSourceIds: [] });
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema));
  const systemPrompt = buildExpertR2SystemPrompt({ governedEvidenceSourceIds: [] });
  const userPrompt = buildExpertVNextUserPrompt(input, []);
  const body = JSON.stringify({
    model: 'x', max_tokens: 4000, system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [{ name: 't', description: 'd', strict: true, input_schema: asSent }],
    tool_choice: { type: 'tool', name: 't' }, thinking: { type: 'disabled' },
  });
  const bodyBytes = Buffer.byteLength(body, 'utf8');
  maxBody = Math.max(maxBody, bodyBytes);
  const grammar = describeGrammarProjection203(
    schema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION').identity;
  const govInWire = body.includes('governedEvidenceSourceIds');
  console.log(`  ${c.caseId}  ${String(bytes(schema)).padStart(7)}  `
    + `${String(bytes(asSent)).padStart(7)}  ${String(bodyBytes).padStart(6)}  ${grammar}  `
    + `${sha16(systemPrompt)}  ${govInWire ? 'PRESENT!' : 'absent'}`);
  if (govInWire) failures += 1;
}

console.log('');
check('WIRE.no-first-pass-request-carries-a-governed-binding-property', failures === 0,
  'the §206 guard would abort any that did');
check('WIRE.largest-body-is-within-the-199-accepted-envelope', maxBody < 90_000,
  `largest ${maxBody} B; §199 accepted 63,691 B and rejected 67,086 B on GRAMMAR size, not body size`);

console.log(`\n================ ${failures === 0 ? 'PREFLIGHT CLEAN' : `${failures} FAILURES`}`);
console.log('provider calls: 0   database operations: 0');
process.exit(failures === 0 ? 0 : 1);
