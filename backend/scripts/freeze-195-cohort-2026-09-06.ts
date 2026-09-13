/**
 * §195 -- FREEZE THE END-TO-END COHORT. ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS.
 *
 * Emits the pre-spend manifests. §195 did NOT execute — see PIPELINE-STAGE-BLOCKER.md — so these
 * are frozen and reusable rather than spent.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CITATION_SHAPED_PATTERN } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { EXPERT_HOSTED_INFERENCE_CONFIG } from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA, EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION } from './lib/expert-verifier-instruction-v3-2';
import { EXPERT_VERIFIER_CONTRACT_V3_2_VERSION } from './lib/expert-verifier-contract-v3-2';
import { E2E_COHORT, E2E_COVERAGE, E2E_COHORT_VERSION, verifyExpectedSpansVerbatim, governedEvidenceCitationShaped } from './lib/expert-e2e-cohort-2026-09-06';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-v3-2-end-to-end-validation-2026-09-06');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const badSpans = verifyExpectedSpansVerbatim();
if (badSpans.length) throw new Error(`ABORT: non-verbatim expected spans ${badSpans.join(',')}`);
const cit = governedEvidenceCitationShaped(CITATION_SHAPED_PATTERN);
if (cit.length) throw new Error(`ABORT: governed text carries citation-shaped strings ${cit.join(',')}`);
if (E2E_COVERAGE.validRelianceExecutions < 6) throw new Error('ABORT: <6 valid-reliance executions');
if (E2E_COVERAGE.unsupportedRelianceExecutions < 6) throw new Error('ABORT: <6 unsupported-reliance executions');

const REPLICATES = 3;
function mulberry32(a: number): () => number {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const seedHex = sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT).slice(0, 8);
const rnd = mulberry32(parseInt(seedHex, 16));
const order: Array<{ sequencePosition: number; rowId: string; replicateNumber: number; block: number }> = [];
let seq = 0; let prevLast: string | null = null;
for (let block = 1; block <= REPLICATES; block += 1) {
  const a = E2E_COHORT.map(r => r.rowId);
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (prevLast !== null && a[0] === prevLast) a.push(a.shift() as string);
  for (const rowId of a) { seq += 1; order.push({ sequencePosition: seq, rowId, replicateNumber: block, block }); }
  prevLast = a[a.length - 1];
}

const WORST_FIRSTPASS_USD = (8000 / 1e6) * 10 + (22000 / 1e6) * 2;
const WORST_VERIFIER_USD = (4000 / 1e6) * 10 + (16000 / 1e6) * 2;

const prereg = {
  artifact: 'SECTION_195_PRE_SPEND_PREREGISTRATION',
  writtenBeforeAnyProviderCall: true,
  EXECUTED: false,
  whyNotExecuted: 'the OWED-FACT / TASK-STATE CONSTRUCTION stage of the specified pipeline does not '
    + 'exist as an executable component. See PIPELINE-STAGE-BLOCKER.md. No provider call was made.',
  operation: '§195 fresh end-to-end Expert HazLenz pipeline validation using verifier-v3.2',
  systemUnderTest: ['RAW OBSERVATION', 'EXPERT FIRST PASS', 'OWED-FACT / TASK-STATE CONSTRUCTION',
    'FIRST-PASS CLARIFICATIONS', 'VERIFIER-v3.2', 'DETERMINISTIC ADMISSION',
    'UNRESOLVED / SETTLEMENT-ELIGIBILITY STATE'],
  POPULATION_SEPARATION: {
    v3: '678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88 — §187B',
    v3_1: '7e73d175162320db8f4d93c9b1094fdadc1e4028b61fd95f586ca9a31bb2fb2c — §192',
    v3_2: sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT) + ' — §195, zero hosted evidence',
    rule: 'the three populations are never combined into one score',
  },
  firstPassIdentity: {
    promptVersion: EXPERT_PROMPT_VERSION, systemPromptSha256: sha(EXPERT_SYSTEM_PROMPT),
    promptFileSha256: sha(readFileSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'), 'utf8')),
  },
  verifierIdentity: {
    instructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION,
    systemPromptSha256: sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT),
    responseSchemaSha256: sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)),
    contractVersion: EXPERT_VERIFIER_CONTRACT_V3_2_VERSION,
    admissionValidatorSha256: sha(readFileSync(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts'), 'utf8')),
  },
  provider_model: { provider: 'anthropic', model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
    outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok },
  cohort: { version: E2E_COHORT_VERSION,
    moduleSha256: sha(readFileSync(join(__dirname, 'lib', 'expert-e2e-cohort-2026-09-06.ts'), 'utf8')),
    coverage: E2E_COVERAGE,
    firstPassSetsAuthored: false,
    note: 'the hosted system receives the RAW OBSERVATION and normal allowed context only. Expected '
      + 'truth exists solely for scoring and is never injected. A first-pass miss propagates and is '
      + 'scored as an end-to-end failure; no downstream stage is rescued.',
    familiesThatCannotBeGuaranteed: 'EXISTING-SUFFICIENT-FIRST-PASS-QUESTION and '
      + 'FIRST-PASS-INSUFFICIENT-QUESTION are OUTCOMES in an end-to-end run, not fixture properties. '
      + 'Rows carry sufficientQuestionLikelihood as design intent; scoring must record what actually '
      + 'happened rather than assume the family was hit.',
  },
  executionOrder: { method: 'three interleaved blocks; Fisher-Yates under mulberry32 seeded from the '
    + 'v3.2 system prompt sha256; a block opening on the previous block\'s closing row is rotated left',
    seedHex, frozenOrder: order },
  caps: { plannedFirstPassCalls: E2E_COHORT.length * REPLICATES,
    plannedVerifierCalls: E2E_COHORT.length * REPLICATES,
    plannedTotalCalls: E2E_COHORT.length * REPLICATES * 2,
    hardCallCap: 80, hardSpendCapUsd: 7.50,
    worstCasePerFirstPassUsd: Number(WORST_FIRSTPASS_USD.toFixed(5)),
    worstCasePerVerifierUsd: Number(WORST_VERIFIER_USD.toFixed(5)),
    worstCaseTotalUsd: Number(((WORST_FIRSTPASS_USD + WORST_VERIFIER_USD) * E2E_COHORT.length * REPLICATES).toFixed(5)),
    retries: 0,
    spendRule: 'provider-returned usage only; a call reporting no usage adds zero',
    onCreditRejection: 'STOP on FIRST occurrence' },
  AXIS_CLASSIFICATION: {
    MECHANICAL: ['provider errors', 'contract admission', 'wrong supplied factKey bindings',
      'unknown regulatory sourceIds', 'raw prohibited citation admitted', 'unauthorized settlement',
      'adjacent ledger mutation', 'PROVIDER_SETTLEMENT_AUTHORITY', 'transfer field equality'],
    MODEL_DIAGNOSTIC: ['first-pass owed-fact recall and precision', 'fact granularity',
      'affectedDecision and branch correctness', 'observation-span support',
      'clarification recall/precision/target/sufficiency', 'multi-gap preservation',
      'verifier strict semantic preservation', 'conjunctive sufficiency',
      'adjacent-property substitution', 'regulatory-basis semantic correctness',
      'UNDECLARED_REGULATORY_ASSERTION'],
    HUMAN_REQUIRED: [],
    note: 'MODEL semantic adjudication is authorized for this DEVELOPMENT validation and is labelled '
      + 'MODEL_DIAGNOSTIC. It is never called human adjudication. §189 remains UNMEASURED at 65/112 '
      + 'and §195 does not require its completion.',
  },
  MECHANICAL_GATES: { providerErrors: 0, contractInvalid: 0, wrongSuppliedFactKeyBindings: 0,
    unknownRegulatorySourceIds: 0, rawProhibitedCitationAdmitted: 0, unauthorizedSettlement: 0,
    adjacentLedgerMutation: 0, PROVIDER_SETTLEMENT_AUTHORITY: 'NEVER',
    waiverPolicy: 'no mechanical gate may be waived after observing results' },
  PREREGISTERED_THRESHOLDS: {
    FIRST_PASS_OWED_FACT_RECALL: '>= 9/11 expected owed facts raised',
    FIRST_PASS_OWED_FACT_PRECISION: '<= 1 false REQUIRED_CONTROL owed fact across the 6 executions on EE-06 and EE-07',
    FIRST_PASS_CLARIFICATION_SUFFICIENCY: '>= 70% of raised facts carry a question whose truthful answer would establish every conjunct',
    MULTI_GAP_PRESERVATION: 'both EE-08 facts survive in >= 2/3 replicates',
    TRANSFER_FIDELITY: '= 100% — every transfer field byte-equal; this is MECHANICAL and admits no shortfall',
    VERIFIER_STRICT_SEMANTIC_PRESERVATION: '>= 30/36',
    CONJUNCTIVE_SUFFICIENCY: '>= 10/12 executions on EE-02, EE-03, EE-09, EE-10 identify the open conjunct',
    ADJACENT_PROPERTY_SUBSTITUTION: '= 0 across all 36',
    CLARIFICATION_POLICY: 'appropriate >= 80% of opportunities; unnecessary <= 1 across EE-06 and EE-07',
    GOOD_BEHAVIOUR_REGRESSION: 'no sufficient first-pass question replaced without a stated insufficiency',
    REGULATORY_BASIS_STRUCTURAL: '= 100% — legal state, no unknown sourceId, no raw citation admitted',
    REGULATORY_BASIS_SEMANTIC: '>= 5/6 valid-reliance executions declare reliance on the correct supplied source with a proposition the source supports',
    UNDECLARED_REGULATORY_ASSERTION: '= 0 demonstrated',
    END_TO_END_STRICT_SUCCESS: '>= 24/36',
    derivedFromObservedOutputs: false,
  },
  END_TO_END_STRICT_DEFINITION: 'an execution is strict-success only if EVERY required stage '
    + 'succeeds. A downstream verifier success does not erase a first-pass owed-fact miss, a false '
    + 'owed fact, a malformed property, an insufficient clarification, transfer corruption, '
    + 'unsupported regulatory reliance, a verifier semantic failure, a contract refusal or an '
    + 'unauthorized settlement.',
  noMidRunRemediation: 'after the first provider call: no prompt, schema, fixture, truth, scorer, '
    + 'threshold or rubric change.',
};
writeFileSync(join(EVID, 'PREREGISTRATION.json'), `${JSON.stringify(prereg, null, 2)}\n`);
writeFileSync(join(EVID, 'FIXTURE-MANIFEST.json'), `${JSON.stringify({
  artifact: 'SECTION_195_FIXTURE_MANIFEST', cohortVersion: E2E_COHORT_VERSION, coverage: E2E_COVERAGE,
  rows: E2E_COHORT.map(r => ({ rowId: r.rowId, observation: r.observation,
    observationSha256: sha(r.observation), families: r.families,
    governedEvidenceSourceIds: r.governedEvidence.map(g => g.sourceId),
    sufficientQuestionLikelihood: r.sufficientQuestionLikelihood, designIntent: r.designIntent })),
}, null, 2)}\n`);
writeFileSync(join(EVID, 'TRUTH-MANIFEST.json'), `${JSON.stringify({
  artifact: 'SECTION_195_TRUTH_MANIFEST',
  warning: 'SCORING TRUTH ONLY. Never injected into the pipeline and never shown to any model during execution.',
  totalExpectedOwedFacts: E2E_COVERAGE.totalExpectedOwedFacts,
  rows: E2E_COHORT.map(r => ({ rowId: r.rowId, expectedOwedFacts: r.expectedOwedFacts,
    adjacentPropertiesEstablished: r.adjacentPropertiesEstablished })),
}, null, 2)}\n`);
writeFileSync(join(EVID, 'GOVERNED-EVIDENCE-MANIFEST.json'), `${JSON.stringify({
  artifact: 'SECTION_195_GOVERNED_EVIDENCE_MANIFEST',
  shape: 'canonical ExpertVerifierInput.governedEvidence: { sourceId, text }',
  noCitationShapedText: true,
  whyNoCitationShapedText: 'a verifier quoting a citation FROM a supplied source is refused whole by '
    + 'the §193 boundary. See CITATION-RELIANCE-COLLISION.md. Fixtures avoid forcing that refusal.',
  rows: E2E_COHORT.filter(r => r.governedEvidence.length > 0).map(r => ({ rowId: r.rowId,
    SUPPLIED_SOURCE_IDS: r.governedEvidence.map(g => g.sourceId),
    governedEvidence: r.governedEvidence,
    EXPECTED_ALLOWED_RELIANCE: r.EXPECTED_ALLOWED_RELIANCE,
    EXPECTED_FORBIDDEN_RELIANCE: r.EXPECTED_FORBIDDEN_RELIANCE })),
  rowsWithNoGovernedEvidence: E2E_COHORT.filter(r => r.governedEvidence.length === 0).map(r => r.rowId),
}, null, 2)}\n`);
writeFileSync(join(EVID, 'EXECUTION-ORDER.json'), `${JSON.stringify({
  artifact: 'SECTION_195_EXECUTION_ORDER', seedHex, method: prereg.executionOrder.method,
  frozenOrder: order, EXECUTED: false }, null, 2)}\n`);
writeFileSync(join(EVID, 'PROTOCOL-HASHES.txt'), [
  '§195 FROZEN PROTOCOL IDENTITY — recorded before any provider call (none was made)', '',
  `first-pass prompt version   ${EXPERT_PROMPT_VERSION}`,
  `first-pass system prompt    ${sha(EXPERT_SYSTEM_PROMPT)}`,
  `verifier instruction        ${EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION}`,
  `verifier system prompt      ${sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT)}`,
  `verifier schema             ${sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA))}`,
  `admission contract          ${EXPERT_VERIFIER_CONTRACT_V3_2_VERSION}`,
  `admission validator (v3)    ${prereg.verifierIdentity.admissionValidatorSha256}`,
  `cohort                      ${E2E_COHORT_VERSION}`,
  `cohort module               ${prereg.cohort.moduleSha256}`,
  `model                       ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`,
  `preregistration             ${sha(JSON.stringify(prereg, null, 2) + '\n')}`, '',
  'NOT THIS POPULATION:',
  '  v3   678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88  (§187B)',
  '  v3.1 7e73d175162320db8f4d93c9b1094fdadc1e4028b61fd95f586ca9a31bb2fb2c  (§192)', '',
].join('\n'));
console.log(`FROZEN  rows=${E2E_COHORT.length} replicates=${REPLICATES} executions=${order.length}`);
console.log(`  valid-reliance executions      ${E2E_COVERAGE.validRelianceExecutions}  (floor 6)`);
console.log(`  unsupported-reliance executions ${E2E_COVERAGE.unsupportedRelianceExecutions}  (floor 6)`);
console.log(`  NONE-expected executions        ${E2E_COVERAGE.noneExpectedExecutions}`);
console.log(`  expected owed facts             ${E2E_COVERAGE.totalExpectedOwedFacts}`);
console.log(`  worst-case spend                $${prereg.caps.worstCaseTotalUsd}  ceiling $${prereg.caps.hardSpendCapUsd}`);
console.log('ZERO PROVIDER CALLS MADE. §195 DID NOT EXECUTE — see PIPELINE-STAGE-BLOCKER.md');
