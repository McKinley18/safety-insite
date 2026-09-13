/**
 * §165 EXPERT HAZLENZ -- PRE-SPEND PREFLIGHT FOR THE §164 12-CALL BINDING FALSIFICATION EXPERIMENT.
 *
 * ==================== THIS SCRIPT NEVER CALLS A PROVIDER ====================
 *
 * It has no `fetch`, no credential read and no network import. It builds what the experiment WOULD
 * send, hashes it, runs every pre-spend gate against it, and stops. Executing the experiment is a
 * separate authorization and a separate script.
 *
 * ==================== THE GATE THAT DECIDES THE ANSWER ====================
 *
 * Gate F asks a question the other gates cannot: can the FROZEN verifier-v2 contract and response
 * schema actually EXPRESS the manipulation the experiment exists to test? §164's arm requires the
 * verifier to bind every clarification to a supplied `factKey`, or to nominate one ADDITIONALLY --
 * alongside a binding, never instead of it. Falsifier C measures exactly whether the auger fact is
 * carried alongside the flame-failure fact rather than replacing it.
 *
 * Gate F does not assert that this is impossible. It CONSTRUCTS the additive verdict -- a verdict
 * that binds a supplied fact and carries a nomination at the same time -- submits it to the frozen
 * `checkVerifierV2Output`, and reports what the contract does with it.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V2_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
  VERIFIER_V2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v2';
import {
  checkVerifierV2Output, EXPERT_VERIFIER_CONTRACT_V2_VERSION,
} from './lib/expert-verifier-contract-v2';
import { buildVerifierUserPrompt } from './lib/expert-verifier-instruction';
import {
  HUMAN_SEMANTIC_TARGETS, HUMAN_SEMANTIC_TARGETS_VERSION,
  assertTargetsMatchSection162, assertCuesNotSatisfiedByObservation,
} from './lib/expert-human-semantic-targets-2026-09-04';
import {
  SEMANTIC_OUTCOME_V2_PROPERTIES, HUMAN_AUTHORITY_ONLY_OUTCOMES,
  EXPERT_SEMANTIC_OUTCOME_V2_VERSION,
} from './lib/expert-semantic-outcome-v2';
import {
  MAX_RELIABILITY_DRAWS, MAX_PROVIDER_CALLS_PER_ANALYSIS, ACTIVATION_STATUS,
} from './lib/expert-bounded-reliability-state-machine';
import { FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT } from './lib/expert-reliability-counters';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC163 = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V162 = join(V, 'expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04');
const OUT = join(V, 'expert-hazlenz-bounded-reliability-local-integration-2026-09-04');

/** The §164 experiment, exactly as designed. Nothing here is a parameter to be tuned. */
const EXPERIMENT = {
  cases: [{ rowId: 'HS-A1', caseId: 'VC-08' }, { rowId: 'HS-E1', caseId: 'VC-04' }],
  drawsPerCase: 6,
  maxProviderRequests: 12,
  maxTokensPerCall: 4000,
  spendCeilingUsd: 0.30,
  retryBudget: 0,
  rerunBudget: 0,
  baseline: '§163\'s 20 draws, frozen — no new baseline is purchased',
} as const;

const EXPECTED = {
  packetSha: '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a',
  instructionV2PromptSha: 'ffc63119b5a30ec88e09a078b75ae45e20c15b2efe82e6feef51ceaa0a8e33f4',
  v13PromptModuleSha: '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa',
  v9FixtureSha: '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb',
} as const;

/** §163's measured per-call figures, used only to price the worst case. */
const PRICE_IN_PER_M = 2.00;
const PRICE_OUT_PER_M = 10.00;
const OBSERVED_INPUT_TOKENS: Record<string, number> = { 'VC-04': 4598, 'VC-08': 5234 };

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');

let passed = 0;
let failed = 0;
const gates: Array<{ id: string; ok: boolean; detail: string }> = [];
function gate(id: string, condition: boolean, detail = ''): void {
  gates.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

interface PacketCase {
  caseId: string; observation: string; jurisdiction: string; governedEvidence: unknown[];
  deterministic: { familiesEmitted: string[]; lifeCriticalFindingKeys: string[] };
  firstPass: {
    candidates: Array<{ candidateKey: string; hazardFamily: string; assertedConditionState: string;
      evidenceBasis: string; reasoning: string }>;
    clarifications: Array<{ clarificationId: string; question: string; affectedDecision: string }>;
    uncertainty: string[]; summary: string;
  };
  unresolvedFacts: Array<{ ref: string; kind: string; text: string }>;
  triggerConditions: string[];
}

console.log('§165 PRE-SPEND PREFLIGHT — §164 12-CALL BINDING FALSIFICATION EXPERIMENT');
console.log('='.repeat(100));
console.log(`  PROVIDER CALLS THIS SCRIPT: 0   COST: $0.00   ACTIVATION: ${ACTIVATION_STATUS}\n`);

// ---------------------------------------------------------------- A. frozen material

console.log('--- A  FROZEN MATERIAL\n');

const packetPath = join(SRC163, 'VERIFIER-PACKET.json');
gate('A.1 the §156 blinded packet is reused UNCHANGED',
  existsSync(packetPath) && sha256File(packetPath) === EXPECTED.packetSha,
  `${sha256File(packetPath).slice(0, 24)}…`);

const instructionSha = sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT);
gate('A.2 verifier instruction v2 is BYTE-IDENTICAL — no prompt experiment, no v3',
  instructionSha === EXPECTED.instructionV2PromptSha,
  `${EXPERT_VERIFIER_INSTRUCTION_V2_VERSION} ${instructionSha.slice(0, 24)}…`);

gate('A.3 verifier contract v2 is the one under test',
  EXPERT_VERIFIER_CONTRACT_V2_VERSION === 'hazlenz.expert.verifier.v2',
  EXPERT_VERIFIER_CONTRACT_V2_VERSION);

gate('A.4 the v13 first-pass prompt module is byte-identical — no v14, no v15',
  sha256File(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'))
    === EXPECTED.v13PromptModuleSha, 'unchanged');

gate('A.5 the hardened v9 fixture is byte-identical',
  sha256File(join(ROOT,
    'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))
    === EXPECTED.v9FixtureSha, 'unchanged');

const packet = JSON.parse(readFileSync(packetPath, 'utf8')) as { cases: PacketCase[] };
const cases = EXPERIMENT.cases.map(c => ({ ...c, pc: packet.cases.find(x => x.caseId === c.caseId)! }));
gate('A.6 both authoritative cases are present and are the only two',
  cases.every(c => !!c.pc) && cases.length === 2,
  cases.map(c => `${c.rowId}/${c.caseId}`).join(', '));

// ---------------------------------------------------------------- B. human truth

console.log('\n--- B  FROZEN HUMAN TRUTH\n');

let truthOk = true;
let truthDetail = '';
try {
  const s162 = JSON.parse(readFileSync(join(V162, 'HUMAN-SEMANTIC-REDERIVATION.json'), 'utf8'))
    .humanSemanticTargets;
  assertTargetsMatchSection162(s162);
  assertCuesNotSatisfiedByObservation(
    Object.fromEntries(cases.map(c => [c.rowId, c.pc.observation])));
  truthDetail = `${HUMAN_SEMANTIC_TARGETS_VERSION}; deep-equal to §162; cues not satisfied by `
    + 'either observation';
} catch (e) { truthOk = false; truthDetail = (e as Error).message; }
gate('B.1 frozen human targets match §162 and their cues are not satisfied by the observations',
  truthOk, truthDetail);

gate('B.2 truth is not broadened — the two authoritative rows and no others',
  Object.keys(HUMAN_SEMANTIC_TARGETS).length === 2
    && EXPERIMENT.cases.every(c => c.rowId in HUMAN_SEMANTIC_TARGETS),
  Object.keys(HUMAN_SEMANTIC_TARGETS).join(', '));

// ---------------------------------------------------------------- C. no self-validation

console.log('\n--- C  NO SELF-VALIDATION, AND SEMANTIC-OUTCOME SEPARATION\n');

/**
 * NO SELF-VALIDATION means two concrete things, and both are checked rather than asserted: the
 * provider is never shown another draw's output to judge, and the classification of an outcome is
 * never made by a model. The first is a property of the request; the second is a property of the
 * taxonomy, and is C.2.
 */
const PRIOR_OUTPUT_TOKENS = ['VERIFIED_AS_IS', 'NO_CLARIFICATION_REQUIRED',
  'ADD_OR_REPLACE_CLARIFICATION', 'NOMINATED_FACT', 'SUPPLIED_FACT', 'nominatedFact',
  'semanticSuccess', 'drawIndex'];
const priorOutputInPayload = cases.flatMap(c => {
  const userMessage = buildVerifierUserPrompt(c.pc);
  return PRIOR_OUTPUT_TOKENS.filter(t => userMessage.includes(t)).map(t => `${c.caseId}:${t}`);
});
gate('C.1 no draw is shown another draw\'s output to judge',
  priorOutputInPayload.length === 0,
  priorOutputInPayload.length === 0
    ? `${PRIOR_OUTPUT_TOKENS.length} verdict/output tokens, 0 present in either case payload`
    : `PRESENT: ${priorOutputInPayload.join(', ')}`);

gate('C.2 the displaced/invalid split is unassignable by code',
  HUMAN_AUTHORITY_ONLY_OUTCOMES.includes('VALID_BUT_TARGET_DISPLACED')
    && HUMAN_AUTHORITY_ONLY_OUTCOMES.includes('INVALID_WRONG_FACT'),
  `${EXPERT_SEMANTIC_OUTCOME_V2_VERSION}; `
  + `${HUMAN_AUTHORITY_ONLY_OUTCOMES.length} members require human authority`);

gate('C.3 owed-target recall is independent of clarification validity',
  SEMANTIC_OUTCOME_V2_PROPERTIES.VALID_BUT_TARGET_DISPLACED.owedTargetRecall === 'MISS'
    && SEMANTIC_OUTCOME_V2_PROPERTIES.VALID_BUT_TARGET_DISPLACED.clarificationPrecision
      === 'NOT_A_DEFECT'
    && SEMANTIC_OUTCOME_V2_PROPERTIES.TARGET_REACHED.owedTargetRecall === 'PASS',
  'VALID_BUT_TARGET_DISPLACED is a recall MISS and not a precision defect');

// ---------------------------------------------------------------- D. blinding

console.log('\n--- D  NO TRUTH LEAKAGE INTO THE REQUEST\n');

function buildBody(c: PacketCase): Record<string, unknown> {
  return {
    model: 'claude-sonnet-5',
    max_tokens: EXPERIMENT.maxTokensPerCall,
    system: EXPERT_VERIFIER_V2_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildVerifierUserPrompt(c) }],
    tools: [{
      name: 'emit_verifier_verdict',
      description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
      input_schema: VERIFIER_V2_RESPONSE_SCHEMA,
    }],
    tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
    thinking: { type: 'adaptive' },
  };
}
const bodies = cases.map(c => ({ ...c, body: buildBody(c.pc) }));

const wholeBodyLeaks: Array<[string, RegExp]> = [
  ['row id', /HS-[A-Z]\d/], ['disposition', /AUTHORING_(VALID|AMBIGUOUS|INVALID)/],
  ['displaced-fact disposition', /DISPLACED_FACT_/], ['section ref', /§1\d\d/],
  ['authored selector list', /acceptableSelectors/],
  ['human semantic target', /flame-failure safeguard|rotor-guard interlock protective/],
  ['authored counterfactual', /answerA|answerB|outcomeA|outcomeB/],
  ['human review vocabulary', /human-reviewed|AUTHORING_|ELIGIBLE|INELIGIBLE/],
  ['owed-fact vocabulary', /owedFact|factKey|coversFactKey|TARGET_COVERAGE_WARNING/],
];
for (const b of bodies) {
  const whole = JSON.stringify(b.body);
  const hits = wholeBodyLeaks.filter(([, re]) => re.test(whole)).map(([n]) => n);
  gate(`D.${b.caseId} no evaluation-truth artefact anywhere in the request`,
    hits.length === 0,
    hits.length ? `LEAKS: ${hits.join(', ')}` : `${wholeBodyLeaks.length} patterns, 0 matches`);
}

const frozenRequests = bodies.map(b => ({
  rowId: b.rowId, caseId: b.caseId, semanticRequestSha256: sha256(JSON.stringify(b.body)),
}));
gate('D.3 each case has ONE frozen semantic request hash, reused for all six of its draws',
  new Set(frozenRequests.map(f => f.semanticRequestSha256)).size === 2,
  frozenRequests.map(f => `${f.caseId} ${f.semanticRequestSha256.slice(0, 16)}…`).join('  '));

gate('D.4 no sampling or determinism control is introduced',
  bodies.every(b => !('temperature' in b.body) && !('top_p' in b.body)
    && !('top_k' in b.body) && !('seed' in b.body)), 'none present');

// ---------------------------------------------------------------- E. budget and containment

console.log('\n--- E  CALL CAP, COST CAP, RAW PRESERVATION\n');

gate('E.1 12 requests, zero retries, zero reruns',
  EXPERIMENT.maxProviderRequests === EXPERIMENT.cases.length * EXPERIMENT.drawsPerCase
    && EXPERIMENT.maxProviderRequests === 12
    && EXPERIMENT.retryBudget === 0 && EXPERIMENT.rerunBudget === 0,
  '2 cases × 6 draws; no retry path is designed');

/**
 * TWO FIGURES, BECAUSE §164 PUBLISHED ONE AND MEANT THE OTHER.
 *
 * §164's "≈$0.30 at measured cost" is an EXPECTED cost: 12 calls at §163's measured mean. The
 * PROSPECTIVE gate every other operation on this programme uses is different -- spend is checked
 * before each request against the worst case that request could cost, because final token usage is
 * unknowable until the response returns. At the 4000-token ceiling the worst case is roughly double
 * the expected cost, and a ceiling checked against expected spend can always be overshot.
 *
 * This gate therefore uses the worst case, and reports both numbers so the gap is visible rather
 * than resolved by whichever figure happens to pass.
 */
const worstCase = cases.reduce((t, c) => t + EXPERIMENT.drawsPerCase
  * ((OBSERVED_INPUT_TOKENS[c.caseId] * PRICE_IN_PER_M)
    + (EXPERIMENT.maxTokensPerCall * PRICE_OUT_PER_M)) / 1e6, 0);
const MEASURED_MEAN_COST_USD: Record<string, number> = { 'VC-08': 0.024838, 'VC-04': 0.017214 };
const expectedCase = cases.reduce(
  (t, c) => t + EXPERIMENT.drawsPerCase * MEASURED_MEAN_COST_USD[c.caseId], 0);
gate('E.2 the PROSPECTIVE worst case is inside the design\'s $0.30 cap',
  worstCase <= EXPERIMENT.spendCeilingUsd,
  `worst case $${worstCase.toFixed(5)} vs cap $${EXPERIMENT.spendCeilingUsd.toFixed(2)}; `
  + `§163-measured expected cost $${expectedCase.toFixed(5)}. §164's $0.30 is the EXPECTED figure, `
  + 'not a prospective worst-case bound');

gate('E.3 the output ceiling is adequate and unchanged from §158/§163',
  EXPERIMENT.maxTokensPerCall === 4000,
  '4000; the largest completed verifier-v2 output observed is 1525 tokens');

gate('E.4 the runtime call cap this experiment exercises is the bounded one',
  MAX_RELIABILITY_DRAWS === 2 && MAX_PROVIDER_CALLS_PER_ANALYSIS === 5,
  `${MAX_RELIABILITY_DRAWS} draws per analysis inside a ${MAX_PROVIDER_CALLS_PER_ANALYSIS}-call `
  + 'bounded path');

const storePath = join(OUT, 'BINDING-EXPERIMENT-RUN-RECORDS.jsonl');
gate('E.5 the raw-preservation store is empty or absent',
  !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');

gate('E.6 the frozen formal invocation count is intact',
  FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195, '195, immutable');

const selfSrc = readFileSync(__filename, 'utf8');
const NETWORK_TOKENS = ['fet' + 'ch(', 'ANTHROPIC_' + 'API_KEY', 'dot' + 'env', 'axi' + 'os'];
gate('E.7 this preflight cannot issue a request',
  NETWORK_TOKENS.every(t => !selfSrc.includes(t)),
  'no network call, no credential read, no HTTP client');

// ---------------------------------------------------------------- F. expressibility

console.log('\n--- F  CAN THE FROZEN CONTRACT EXPRESS THE MANIPULATION UNDER TEST?\n');

const a1 = cases.find(c => c.caseId === 'VC-08')!;
const suppliedRef = a1.pc.unresolvedFacts[0].ref;

/**
 * The additive verdict falsifier C requires: bind the supplied flame-failure fact AND carry the
 * auger fact alongside it. Constructed here in full, with every proof field the contract demands.
 */
const additiveVerdict = {
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V2_VERSION,
  analysisId: 'PREFLIGHT-VC-08',
  verdict: 'ADD_OR_REPLACE_CLARIFICATION',
  rationale: 'both facts are unresolved and both change what is done today',
  aboutUnresolvedFactRef: suppliedRef,
  clarificationSourceMode: 'SUPPLIED_FACT',
  proposedClarification: {
    question: 'Has the burner flame-failure safeguard been function-tested?',
    whyItMatters: 'a safeguard that cannot be seen is not a safeguard that was checked',
    affectedDecision: 'REQUIRED_CONTROL',
    evidenceGap: 'the observation does not state the safeguard\'s functional status',
    replacesClarificationId: null,
  },
  nominatedFact: {
    missingFact: 'whether the discharge auger drive was isolated before the blockage was cleared',
    observationSpan:
      'An operative is clearing a blockage at the discharge auger with the dryer running.',
    notEstablishedBecause: 'the span states the dryer is running and states nothing about the '
      + 'energy state of the auger drive either way',
    affectedDecision: 'REQUIRED_CONTROL',
    branchA: 'the auger drive was isolated before the operative began',
    decisionIfA: 'clearing the blockage may continue as observed',
    branchB: 'the auger drive remains capable of powered motion',
    decisionIfB: 'whether clearing may safely continue is not established',
    whyNecessaryNow: 'the operative is at the discharge point now',
  },
};
const additiveAdmission = checkVerifierV2Output(additiveVerdict, {
  analysisId: 'PREFLIGHT-VC-08',
  observation: a1.pc.observation,
  suppliedFacts: a1.pc.unresolvedFacts.map(f => ({ ref: f.ref, text: f.text })),
});

gate('F.1 the frozen v2 contract REFUSES an additive verdict (bind + nominate together)',
  additiveAdmission.admitted === false,
  additiveAdmission.admitted
    ? 'unexpectedly admitted'
    : `refused with [${additiveAdmission.codes.join(', ')}]`);

const schemaProps = Object.keys(
  (VERIFIER_V2_RESPONSE_SCHEMA as { properties: Record<string, unknown> }).properties);
gate('F.2 the frozen v2 response schema has no field in which to declare a binding',
  !schemaProps.includes('coversFactKey') && !schemaProps.includes('bindings')
    && !schemaProps.includes('owedFacts'),
  `schema fields: ${schemaProps.join(', ')}`);

const BINDING_INSTRUCTION_TOKENS = ['factKey', 'coversFactKey', 'bind to', 'owed fact',
  'closed set', 'additionally nominate', 'in addition to'];
const instructionBindingHits = BINDING_INSTRUCTION_TOKENS
  .filter(t => EXPERT_VERIFIER_V2_SYSTEM_PROMPT.toLowerCase().includes(t.toLowerCase()));
gate('F.3 the frozen v2 instruction contains no binding step to execute',
  instructionBindingHits.length === 0,
  instructionBindingHits.length === 0
    ? `${BINDING_INSTRUCTION_TOKENS.length} binding tokens, 0 present`
    : `present: ${instructionBindingHits.join(', ')}`);

/**
 * The consequence, stated as a gate rather than as prose. F.1–F.3 establish that the binding-enabled
 * arm cannot be delivered to the provider without NEW instruction and schema material, and §165
 * Phase 13 forbids creating any. So this gate is EXPECTED to fail, and its failure is the finding.
 */
const manipulationDeliverable = additiveAdmission.admitted
  && schemaProps.includes('coversFactKey') && instructionBindingHits.length > 0;
gate('F.4 the binding-enabled arm is deliverable under frozen material',
  manipulationDeliverable,
  manipulationDeliverable
    ? 'deliverable'
    : 'NOT DELIVERABLE — the manipulation requires a schema field and an instruction step that do '
      + 'not exist in frozen v2, and Phase 13 forbids creating them in this operation');

// ---------------------------------------------------------------- verdict

const blockers = gates.filter(g => !g.ok);
const READY = blockers.length === 0;

console.log('\n' + '='.repeat(100));
console.log(`  PRE-SPEND GATE: ${passed}/${passed + failed} PASS · ${failed} FAIL`);
console.log(`  FALSIFICATION_HARNESS_READY = ${READY ? 'TRUE' : 'FALSE'}`);
console.log('  PROVIDER CALLS: 0   COST: $0.00   NOTHING WAS SPENT');
console.log('='.repeat(100));
if (!READY) {
  console.log('\nBLOCKERS:');
  for (const b of blockers) console.log(`  ${b.id}\n      ${b.detail}`);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'FALSIFICATION-HARNESS-PREFLIGHT.json'), JSON.stringify({
  operation: '§165 pre-spend preflight for the §164 12-call binding falsification experiment',
  ranAt: new Date().toISOString(),
  providerCalls: 0,
  costUsd: 0.0,
  FALSIFICATION_HARNESS_READY: READY,
  experiment: EXPERIMENT,
  frozenRequests,
  worstCaseSpendUsd: Number(worstCase.toFixed(5)),
  expectedSpendUsdAtSection163MeasuredMean: Number(expectedCase.toFixed(5)),
  costCapFinding: worstCase <= EXPERIMENT.spendCeilingUsd ? null
    : 'The §164 design states ≈$0.30 for 12 calls, which is the EXPECTED cost at §163\'s measured '
      + `mean ($${expectedCase.toFixed(5)}). The prospective worst case at the 4000-token output `
      + `ceiling is $${worstCase.toFixed(5)}. Every spend gate on this programme is evaluated `
      + 'BEFORE a request against the worst case that request could cost, so the published cap is '
      + 'not a usable prospective ceiling. Raising it to at least $0.60, or lowering the output '
      + 'ceiling, is a product-owner decision and is not taken here.',
  gates: gates.map(g => ({ id: g.id, pass: g.ok, detail: g.detail })),
  blockers: blockers.map(b => ({ id: b.id, detail: b.detail })),
  expressibilityFinding: {
    additiveVerdictAdmitted: additiveAdmission.admitted,
    additiveVerdictRefusalCodes: additiveAdmission.codes,
    additiveVerdictRefusalDetail: additiveAdmission.detail,
    schemaFields: schemaProps,
    instructionBindingTokensPresent: instructionBindingHits,
    conclusion: additiveAdmission.admitted
      ? 'the frozen contract admits an additive verdict'
      : 'the frozen v2 contract and schema cannot express a clarification that binds a supplied '
        + 'owed fact AND carries an additional nomination. Falsifier C — additive nomination '
        + 'retention — is therefore not measurable under frozen material, and neither is the '
        + '"binding required" manipulation falsifier B depends on.',
    remediationRequired: 'an authorized revision of the verifier instruction and response schema '
      + 'that adds a binding declaration and permits an additive nomination. §165 Phase 13 '
      + 'explicitly forbids changing verifier instruction v2 or creating a v3 in this operation, '
      + 'so the remediation is the next authorization rather than a step this operation may take.',
  },
}, null, 2) + '\n');
console.log(`\nwrote ${join(OUT, 'FALSIFICATION-HARNESS-PREFLIGHT.json')}`);

// A blocked preflight is a RESULT, not a crash: it spent nothing and it answered the question.
process.exit(0);
