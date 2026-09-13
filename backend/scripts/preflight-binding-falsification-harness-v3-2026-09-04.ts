/**
 * §166 EXPERT HAZLENZ -- REMEDIATED PRE-SPEND PREFLIGHT FOR THE 12-CALL BINDING FALSIFICATION
 * EXPERIMENT, UNDER VERIFIER PROTOCOL v3.
 *
 * ==================== THIS SCRIPT NEVER CALLS A PROVIDER ====================
 *
 * No `fetch`, no credential read, no HTTP client, no network import. It builds exactly what the
 * experiment WOULD send, hashes it, runs every pre-spend gate against it, and stops. Executing the
 * experiment is a separate authorization and a separate script.
 *
 * ==================== WHAT §165 BLOCKED, AND WHAT v3 CHANGES ====================
 *
 * §165's gate F.4 recorded that the binding-enabled arm was NOT DELIVERABLE: the frozen v2 contract
 * refused an additive verdict, the v2 schema had no binding field, and the v2 instruction had no
 * binding step. v3 supplies all three, and gate F below re-runs the same construction against v3 to
 * show the refusal is gone -- it does not assume it.
 *
 * ==================== THE TWO THINGS THIS PREFLIGHT REFUSES TO PAPER OVER ====================
 *
 *   1. There is NO surviving human-authoritative silence row. All four FORBIDDEN rows were
 *      adjudicated INVALID or AMBIGUOUS in §162. Falsifier D -- does binding manufacture questions
 *      where silence was right -- therefore has no denominator, and gate H records
 *      `FALSIFIER_D_TESTABLE = FALSE` rather than reusing invalid truth to produce a number.
 *   2. The v3 request is LARGER than the v2 request, because the owed facts and their two-branch
 *      structure are now in the prompt. Gate E prices that honestly against the $0.60 cap instead of
 *      quoting the expected cost, which is the exact error §165 found in §164's $0.30 figure.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
  VERIFIER_V3_RESPONSE_SCHEMA, buildVerifierV3UserPrompt, type V3SuppliedOwedFact,
} from './lib/expert-verifier-instruction-v3';
import {
  checkVerifierV3Output, EXPERT_VERIFIER_CONTRACT_V3_VERSION,
} from './lib/expert-verifier-contract-v3';
import { EXPERT_VERIFIER_V2_SYSTEM_PROMPT } from './lib/expert-verifier-instruction-v2';
import {
  classifyInstructionDiff, survivingBlockFailures, CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT,
} from './lib/expert-verifier-v2-v3-diff';
import {
  HUMAN_SEMANTIC_TARGETS, HUMAN_SEMANTIC_TARGETS_VERSION,
  assertTargetsMatchSection162, assertCuesNotSatisfiedByObservation,
} from './lib/expert-human-semantic-targets-2026-09-04';
import {
  HUMAN_AUTHORITY_ONLY_OUTCOMES, SEMANTIC_OUTCOME_V2_PROPERTIES,
  EXPERT_SEMANTIC_OUTCOME_V2_VERSION,
} from './lib/expert-semantic-outcome-v2';
import { MAX_RELIABILITY_DRAWS, ACTIVATION_STATUS } from
  './lib/expert-bounded-reliability-state-machine';
import { FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT } from './lib/expert-reliability-counters';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC163 = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V162 = join(V, 'expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04');
const ROWTRUTH = join(V, 'expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04');
const OUT = join(V, 'expert-hazlenz-verifier-v3-binding-protocol-2026-09-04');

const EXPERIMENT = {
  arm: 'BINDING_ENABLED (verifier protocol v3)',
  baseline: '§163\'s 20 draws under v2, FROZEN — no new baseline is purchased',
  cases: [{ rowId: 'HS-A1', caseId: 'VC-08' }, { rowId: 'HS-E1', caseId: 'VC-04' }],
  drawsPerCase: 6,
  hardProviderRequestCap: 12,
  maxTokensPerCall: 4000,
  hardProspectiveCostCapUsd: 0.60,
  retryBudget: 0,
  replacementBudget: 0,
  firstPassInvocations: 0,
  model: 'claude-sonnet-5',
} as const;

const EXPECTED = {
  packetSha: '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a',
  instructionV2PromptSha: 'ffc63119b5a30ec88e09a078b75ae45e20c15b2efe82e6feef51ceaa0a8e33f4',
  v13PromptModuleSha: '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa',
  v9FixtureSha: '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb',
} as const;

const PRICE_IN_PER_M = 2.00;
const PRICE_OUT_PER_M = 10.00;
/** §163's provider-attested input tokens for the v2 bodies. Used to derive a chars/token ratio. */
const V2_MEASURED_INPUT_TOKENS: Record<string, number> = { 'VC-08': 5234, 'VC-04': 4598 };
/** §163's measured mean cost per call. Expected cost only — never a spend gate. */
const V163_MEAN_COST_USD: Record<string, number> = { 'VC-08': 0.024838, 'VC-04': 0.017214 };
/**
 * A fixed conservative input bound, set above any projection, in the §135 style. A spend gate must
 * use a bound rather than an estimate: an estimate that is 5% low is a cap that can be crossed.
 */
const CONSERVATIVE_INPUT_TOKEN_BOUND = 8_000;

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

interface PacketCase { caseId: string; observation: string; jurisdiction: string;
  governedEvidence: unknown[];
  deterministic: { familiesEmitted: string[]; lifeCriticalFindingKeys: string[] };
  firstPass: { candidates: Array<{ candidateKey: string; hazardFamily: string;
    assertedConditionState: string; evidenceBasis: string; reasoning: string }>;
    clarifications: Array<{ clarificationId: string; question: string; affectedDecision: string }>;
    uncertainty: string[]; summary: string };
  unresolvedFacts: Array<{ ref: string; kind: string; text: string }>; }

console.log('§166 REMEDIATED PRE-SPEND PREFLIGHT — 12-CALL BINDING FALSIFICATION, PROTOCOL v3');
console.log('='.repeat(100));
console.log(`  PROVIDER CALLS THIS SCRIPT: 0   COST: $0.00   ACTIVATION: ${ACTIVATION_STATUS}\n`);

// ---------------------------------------------------------------- A. frozen material

console.log('--- A  FROZEN MATERIAL AND PROTOCOL IDENTITY\n');

const packetPath = join(SRC163, 'VERIFIER-PACKET.json');
gate('A.1 the §156 blinded packet is reused UNCHANGED',
  existsSync(packetPath) && sha256File(packetPath) === EXPECTED.packetSha,
  `${sha256File(packetPath).slice(0, 24)}…`);
gate('A.2 verifier instruction v2 is BYTE-UNCHANGED — v3 is a new protocol, not an edit of v2',
  sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT) === EXPECTED.instructionV2PromptSha,
  `v2 ${EXPECTED.instructionV2PromptSha.slice(0, 24)}…`);
const v3PromptSha = sha256(EXPERT_VERIFIER_V3_SYSTEM_PROMPT);
const v3SchemaSha = sha256(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA));
gate('A.3 verifier instruction v3 is frozen and hashed',
  EXPERT_VERIFIER_INSTRUCTION_V3_VERSION === 'hazlenz.expert.verifier-instruction.v3',
  `${EXPERT_VERIFIER_INSTRUCTION_V3_VERSION}  ${v3PromptSha.slice(0, 32)}…`);
gate('A.4 verifier contract v3 is frozen and hashed',
  EXPERT_VERIFIER_CONTRACT_V3_VERSION === 'hazlenz.expert.verifier.v3',
  `${EXPERT_VERIFIER_CONTRACT_V3_VERSION}  schema ${v3SchemaSha.slice(0, 32)}…`);
gate('A.5 the v13 first-pass prompt module is byte-identical — no v14, no v15',
  sha256File(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'))
    === EXPECTED.v13PromptModuleSha, 'unchanged');
gate('A.6 the hardened v9 fixture is byte-identical',
  sha256File(join(ROOT,
    'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))
    === EXPECTED.v9FixtureSha, 'unchanged');

const packet = JSON.parse(readFileSync(packetPath, 'utf8')) as { cases: PacketCase[] };
const cases = EXPERIMENT.cases.map(c => ({ ...c, pc: packet.cases.find(x => x.caseId === c.caseId)! }));
gate('A.7 both authoritative cases are present and are the only two',
  cases.every(c => !!c.pc) && cases.length === 2,
  cases.map(c => `${c.rowId}/${c.caseId}`).join(', '));

// ---------------------------------------------------------------- B. semantic preservation

console.log('\n--- B  SEMANTIC PRESERVATION OF THE v2 INSTRUCTION\n');

const diff = classifyInstructionDiff(EXPERT_VERIFIER_V2_SYSTEM_PROMPT,
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT);
gate('B.1 every changed instruction line is classified and no classification is stale',
  diff.unclassifiedChanges.length === 0 && diff.staleClassifications.length === 0,
  `${diff.addedCount} added, ${diff.removedCount} removed; 0 unclassified, 0 stale`);
gate('B.2 SUBSTANTIVE_SEMANTIC_CHANGE_COUNT = 0 for the instruction',
  diff.SUBSTANTIVE_SEMANTIC_CHANGE_COUNT === 0
    && diff.V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL,
  `binding-protocol ${diff.byClassification.BINDING_PROTOCOL_REQUIRED}, schema-alignment `
  + `${diff.byClassification.SCHEMA_ALIGNMENT_REQUIRED}`);
gate('B.3 SUBSTANTIVE_SEMANTIC_CHANGE_COUNT = 0 for the contract',
  CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT === 0, 'field-level diff carries no substantive change');
gate('B.4 the "usually NO" prior and every other load-bearing v2 block survive byte-identical',
  survivingBlockFailures(EXPERT_VERIFIER_V3_SYSTEM_PROMPT).length === 0
    && EXPERT_VERIFIER_V3_SYSTEM_PROMPT.includes(
      'THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER'),
  '12 blocks checked positively');

// ---------------------------------------------------------------- C. supplied owed facts

console.log('\n--- C  SUPPLIED OWED FACTS — TASK STATE, NOT GRADING TRUTH\n');

/**
 * The owed facts supplied to each arm.
 *
 * HS-A1 receives ONLY the flame-failure target. That is the manipulation: the experiment asks
 * whether a verifier that CAN bind the owed target still displaces it, and whether it carries the
 * auger gap additively rather than instead. Supplying the auger fact too would answer the question
 * for the model and measure nothing.
 */
const SUPPLIED: Record<string, V3SuppliedOwedFact[]> = {
  'VC-08': [{
    factKey: 'owed:hs-a1:flame_failure_safeguard_functional_status',
    affectedDecision: 'REQUIRED_CONTROL',
    whyUnresolved: 'the observation states the safeguard cannot be seen from the walkway and '
      + 'states nothing about its functional status',
    branchA: 'the safeguard is functional',
    branchB: 'the safeguard is bypassed, failed or otherwise nonfunctional',
    decisionDivergence: {
      ifA: 'drying continues under the existing controls',
      ifB: 'the burner is shut down and the safeguard restored before drying continues',
    },
    evidenceSpan: 'the flame-failure device and its wiring are behind that shroud and cannot be seen',
  }],
  'VC-04': [{
    factKey: 'owed:hs-e1:rotor_guard_interlock_function_verified',
    affectedDecision: 'REQUIRED_CONTROL',
    whyUnresolved: 'the observation states the machine was returned to service and states nothing '
      + 'about whether the guard interlock protective function was verified after reassembly',
    branchA: 'the interlock protective function was verified before return to service',
    branchB: 'the interlock protective function was not verified before return to service',
    decisionDivergence: {
      ifA: 'the debarker continues to run as observed',
      ifB: 'the protective function is verified before the debarker continues to run',
    },
    evidenceSpan: 'The machine was returned to service this morning after a rotor tooth change '
      + 'carried out overnight by the maintenance fitter, who has gone off shift.',
  }],
};

function buildBody(c: PacketCase): Record<string, unknown> {
  return {
    model: EXPERIMENT.model,
    max_tokens: EXPERIMENT.maxTokensPerCall,
    system: EXPERT_VERIFIER_V3_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildVerifierV3UserPrompt({
      caseId: c.caseId,
      observation: c.observation,
      jurisdiction: c.jurisdiction,
      governedEvidence: c.governedEvidence,
      deterministic: c.deterministic,
      firstPass: c.firstPass,
      owedFacts: SUPPLIED[c.caseId],
    }) }],
    tools: [{
      name: 'emit_verifier_verdict',
      description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
      input_schema: VERIFIER_V3_RESPONSE_SCHEMA,
    }],
    tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
    thinking: { type: 'adaptive' },
  };
}
const bodies = cases.map(c => ({ ...c, body: buildBody(c.pc) }));

/**
 * Leak checks are SCOPED, exactly as §163's were, and for the same reason.
 *
 * The whole body is checked for evaluation-truth artefacts. The FIXTURE-LABEL and SCORING-STATE
 * checks are applied to the USER MESSAGE only, because the contract's own vocabulary appears in the
 * system prompt and the response schema BY DESIGN -- the verifier cannot choose a verdict it has not
 * been shown, and `REQUIRED_CONTROL` is a frozen `affectedDecision` member, not a fixture label.
 *
 * Two further exclusions are deliberate and are stated rather than encoded silently:
 *   - `REQUIRED-CONTROL` appears in v2's step 4 and is inherited byte-identically by v3;
 *   - `FIRST-PASS ANALYSIS` is a structural header the §156 packet builder has always emitted.
 * Both are matched by a naive `\bPASS\b` or `\bREQUIRED\b` and neither is grading truth, so the
 * patterns exclude hyphen- and underscore-adjacent forms instead of the checks being dropped.
 */
const WHOLE_BODY_LEAKS: Array<[string, RegExp]> = [
  ['row id', /HS-[A-Z]\d/],
  ['disposition', /AUTHORING_(VALID|AMBIGUOUS|INVALID)|DISPLACED_FACT_/],
  ['expected outcome', /TARGET_REACHED|VALID_BUT_TARGET_DISPLACED|INVALID_WRONG_FACT/],
  ['historical result', /\b(3\/10|1\/10|7\/10|8\/10|4\/20)\b/],
  ['scoring vocabulary', /acceptableSelectors|denominator|semanticSuccess|selectorAccuracy/],
  ['human semantic target', /flame-failure safeguard|rotor-guard interlock protective/],
  ['human review vocabulary', /human-reviewed|ELIGIBLE|INELIGIBLE|dispositionedBy/],
  ['section ref', /§1\d\d/],
];
const USER_MESSAGE_LEAKS: Array<[string, RegExp]> = [
  ['fixture label', /(?<![-\w])(REQUIRED|FORBIDDEN)(?![-_\w])/],
  ['scoring state', /(?<![-\w])(PASS|FAIL)(?![-_\w])|SEMANTIC_SUCCESS|scoredAs/],
  ['historical verdict', /VERIFIED_AS_IS|NO_CLARIFICATION_REQUIRED|ADD_OR_REPLACE/],
  ['draw label', /\bR[123]\b|drawIndex/],
];
for (const b of bodies) {
  const whole = JSON.stringify(b.body);
  const userMsg = String((b.body.messages as Array<Record<string, string>>)[0].content);
  const h1 = WHOLE_BODY_LEAKS.filter(([, re]) => re.test(whole)).map(([n]) => n);
  const h2 = USER_MESSAGE_LEAKS.filter(([, re]) => re.test(userMsg)).map(([n]) => n);
  gate(`C.${b.caseId} no evaluation-truth artefact anywhere in the request`,
    h1.length === 0,
    h1.length ? `LEAKS: ${h1.join(', ')}` : `${WHOLE_BODY_LEAKS.length} patterns, 0 matches`);
  gate(`C.${b.caseId} no fixture label, scoring state or historical verdict in the case payload`,
    h2.length === 0,
    h2.length ? `LEAKS: ${h2.join(', ')}` : `${USER_MESSAGE_LEAKS.length} patterns, 0 matches`);
}
gate('C.0 the contract vocabulary in the system prompt and schema is BY DESIGN, not a leak',
  /NO_CLARIFICATION_REQUIRED/.test(EXPERT_VERIFIER_V3_SYSTEM_PROMPT)
    && !/NO_CLARIFICATION_REQUIRED/.test(
      String((bodies[0].body.messages as Array<Record<string, string>>)[0].content)),
  'the verdict enum is in the instruction, never in the case payload');
gate('C.3 the supplied facts carry only the fields needed to understand and bind to them',
  Object.values(SUPPLIED).flat().every(f => {
    const keys = Object.keys(f).sort().join(',');
    return keys === 'affectedDecision,branchA,branchB,decisionDivergence,evidenceSpan,factKey,'
      + 'whyUnresolved';
  }),
  'factKey, affectedDecision, whyUnresolved, branchA, branchB, decisionDivergence, evidenceSpan');
gate('C.4 exactly one owed fact is supplied per case, and HS-A1 is NOT told about the auger gap',
  Object.values(SUPPLIED).every(v => v.length === 1)
    && !JSON.stringify(SUPPLIED['VC-08']).toLowerCase().includes('auger'),
  'supplying the auger fact would answer the displacement question instead of measuring it');

const frozenRequests = bodies.map(b => ({
  rowId: b.rowId, caseId: b.caseId,
  semanticRequestSha256: sha256(JSON.stringify(b.body)),
  requestBytes: JSON.stringify(b.body).length,
}));
gate('C.5 each case has ONE frozen semantic request hash, reused for all six of its draws',
  new Set(frozenRequests.map(f => f.semanticRequestSha256)).size === 2,
  frozenRequests.map(f => `${f.caseId} ${f.semanticRequestSha256.slice(0, 16)}…`).join('  '));
gate('C.6 no sampling or determinism control is introduced',
  bodies.every(b => !('temperature' in b.body) && !('top_p' in b.body)
    && !('top_k' in b.body) && !('seed' in b.body)), 'none present');

// ---------------------------------------------------------------- D. frozen human truth

console.log('\n--- D  FROZEN HUMAN TRUTH\n');

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
gate('D.1 frozen human targets match §162 and their cues are not satisfied by the observations',
  truthOk, truthDetail);
gate('D.2 truth is not broadened — the two authoritative rows and no others',
  Object.keys(HUMAN_SEMANTIC_TARGETS).length === 2, Object.keys(HUMAN_SEMANTIC_TARGETS).join(', '));

// ---------------------------------------------------------------- E. cost and call caps

console.log('\n--- E  CALL CAP AND PROSPECTIVE COST\n');

/**
 * Two independent input-token bounds, both reported.
 *
 * `projected` applies the chars-per-token ratio the provider itself attested on the v2 bodies to
 * the actual v3 bodies. `conservative` is a fixed ceiling set above that projection. A spend gate
 * uses the CONSERVATIVE one, because an estimate that is 5% low is a cap that can be crossed.
 */
const perCase = frozenRequests.map(f => {
  const ratio = JSON.stringify(bodies.find(b => b.caseId === f.caseId)!.body).length
    / f.requestBytes;                                    // 1 by construction; kept for clarity
  void ratio;
  const v2Chars = f.requestBytes;                        // v3 body bytes
  const projectedTokens = Math.ceil(
    v2Chars / (v2CharsPerTokenFor(f.caseId)));
  const projectedUsd = (projectedTokens * PRICE_IN_PER_M
    + EXPERIMENT.maxTokensPerCall * PRICE_OUT_PER_M) / 1e6;
  const conservativeUsd = (CONSERVATIVE_INPUT_TOKEN_BOUND * PRICE_IN_PER_M
    + EXPERIMENT.maxTokensPerCall * PRICE_OUT_PER_M) / 1e6;
  return { ...f, projectedTokens, projectedUsd, conservativeUsd };
});
function v2CharsPerTokenFor(caseId: string): number {
  // The ratio the provider attested on the v2 body for this same case.
  const v2Bytes: Record<string, number> = { 'VC-08': 12745, 'VC-04': 10885 };
  return v2Bytes[caseId] / V2_MEASURED_INPUT_TOKENS[caseId];
}

const projectedTotal = perCase.reduce((t, c) => t + EXPERIMENT.drawsPerCase * c.projectedUsd, 0);
const conservativeTotal = perCase.reduce((t, c) => t + EXPERIMENT.drawsPerCase * c.conservativeUsd, 0);
const expectedTotal = cases.reduce(
  (t, c) => t + EXPERIMENT.drawsPerCase * V163_MEAN_COST_USD[c.caseId], 0);
const worstPerCall = Math.max(...perCase.map(c => c.conservativeUsd));
const callsUnderCap = Math.floor(EXPERIMENT.hardProspectiveCostCapUsd / worstPerCall);

gate('E.1 12 requests, zero retries, zero replacements, zero first-pass invocations',
  EXPERIMENT.hardProviderRequestCap === EXPERIMENT.cases.length * EXPERIMENT.drawsPerCase
    && EXPERIMENT.retryBudget === 0 && EXPERIMENT.replacementBudget === 0
    && EXPERIMENT.firstPassInvocations === 0,
  '2 cases × 6 draws; no retry path is designed');
gate('E.2 the output ceiling is 4000, as the product owner directed, and was not lowered to fit a cap',
  EXPERIMENT.maxTokensPerCall === 4000, '4000 — unchanged from §158/§163');
gate('E.3 the runtime spend guard checks the WORST CASE before each call, never the expected cost',
  typeof mayIssueCall === 'function'
    && mayIssueCall(0, 0).allowed
    && !mayIssueCall(EXPERIMENT.hardProspectiveCostCapUsd - 0.001, 0).allowed,
  `each call is gated on spent + $${worstPerCall.toFixed(5)} <= `
  + `$${EXPERIMENT.hardProspectiveCostCapUsd.toFixed(2)}`);
gate('E.4 the full 12-call design fits inside the $0.60 prospective cap',
  conservativeTotal <= EXPERIMENT.hardProspectiveCostCapUsd,
  `conservative worst case $${conservativeTotal.toFixed(5)} (bound `
  + `${CONSERVATIVE_INPUT_TOKEN_BOUND} input tokens/call) · projection-based worst case `
  + `$${projectedTotal.toFixed(5)} · §163-measured expected cost $${expectedTotal.toFixed(5)}. `
  + `Under strict prospective checking the cap admits ${callsUnderCap} of 12 calls.`);

const storePath = join(OUT, 'BINDING-EXPERIMENT-RUN-RECORDS.jsonl');
gate('E.5 the raw-preservation store is empty or absent',
  !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');
gate('E.6 the frozen formal invocation count is intact',
  FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195, '195, immutable');
gate('E.7 the runtime draw cap is unchanged by the protocol revision',
  MAX_RELIABILITY_DRAWS === 2, '2 draws per analysis');

const selfSrc = readFileSync(__filename, 'utf8');
const NETWORK_TOKENS = ['fet' + 'ch(', 'ANTHROPIC_' + 'API_KEY', 'dot' + 'env', 'axi' + 'os'];
gate('E.8 this preflight cannot issue a request',
  NETWORK_TOKENS.every(t => !selfSrc.includes(t)),
  'no network call, no credential read, no HTTP client');

/** The spend guard the executing script must use. Defined here so the gate can exercise it. */
function mayIssueCall(spentUsd: number, callsIssued: number):
{ allowed: boolean; reason: string } {
  if (callsIssued + 1 > EXPERIMENT.hardProviderRequestCap) {
    return { allowed: false, reason: `REQUEST_CAP_REACHED:${callsIssued}` };
  }
  if (spentUsd + worstPerCall > EXPERIMENT.hardProspectiveCostCapUsd) {
    return { allowed: false,
      reason: `PROSPECTIVE_COST_CAP_WOULD_BE_CROSSED: $${spentUsd.toFixed(5)} + `
        + `$${worstPerCall.toFixed(5)} > $${EXPERIMENT.hardProspectiveCostCapUsd.toFixed(2)}` };
  }
  return { allowed: true, reason: '' };
}

// ---------------------------------------------------------------- F. expressibility, re-tested

console.log('\n--- F  IS THE MANIPULATION NOW EXPRESSIBLE? (§165 GATE F, RE-RUN AGAINST v3)\n');

const a1Key = SUPPLIED['VC-08'][0].factKey;
const a1Observation = cases.find(c => c.caseId === 'VC-08')!.pc.observation;
/** The exact additive verdict the frozen v2 contract refused in §165. */
const additiveVerdict = {
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
  analysisId: 'PREFLIGHT-VC-08',
  verdict: 'ADD_OR_REPLACE_CLARIFICATION',
  rationale: 'both facts are unresolved and both change what is done today',
  clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
  proposedClarification: {
    question: 'Has the burner flame-failure safeguard been function-tested?',
    whyItMatters: 'a safeguard that cannot be seen is not a safeguard that was checked',
    affectedDecision: 'REQUIRED_CONTROL',
    evidenceGap: 'the observation does not state the safeguard\'s functional status',
  },
  bindingFactKey: a1Key,
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
  owedFactDeclarations: [
    { factKey: a1Key, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
  ],
};
const additiveAdmission = checkVerifierV3Output(additiveVerdict, {
  analysisId: 'PREFLIGHT-VC-08', observation: a1Observation, suppliedOwedFactKeys: [a1Key],
});
gate('F.1 v3 ADMITS the additive verdict that v2 refused — the §165 blocker is closed',
  additiveAdmission.admitted && additiveAdmission.bindingAdmitted
    && additiveAdmission.nominationAdmitted,
  additiveAdmission.admitted
    ? 'binding and nomination both admitted in one response'
    : `still refused: [${additiveAdmission.codes.join(', ')}]`);

const schemaProps = Object.keys(
  (VERIFIER_V3_RESPONSE_SCHEMA as { properties: Record<string, unknown> }).properties);
gate('F.2 the v3 schema carries a field in which to declare a binding',
  schemaProps.includes('bindingFactKey') && schemaProps.includes('owedFactDeclarations'),
  `schema fields: ${schemaProps.join(', ')}`);

const BINDING_TOKENS = ['factKey', 'bindingFactKey', 'BOUND_BY_CLARIFICATION', 'STILL_UNRESOLVED',
  'CHALLENGE_FACT_VALIDITY'];
const present = BINDING_TOKENS.filter(t => EXPERT_VERIFIER_V3_SYSTEM_PROMPT.includes(t));
gate('F.3 the v3 instruction contains the binding step the experiment needs',
  present.length === BINDING_TOKENS.length, `${present.length}/${BINDING_TOKENS.length} present`);

const badKey = checkVerifierV3Output(
  { ...additiveVerdict, bindingFactKey: `${a1Key}X`,
    owedFactDeclarations: [{ factKey: a1Key, declaration: 'STILL_UNRESOLVED',
      challengeReason: null }] },
  { analysisId: 'PREFLIGHT-VC-08', observation: a1Observation, suppliedOwedFactKeys: [a1Key] });
gate('F.4 a binding key outside the closed set is still refused — the door opened, not widened',
  !badKey.admitted && badKey.codes.includes('BINDING_KEY_NOT_IN_SUPPLIED_SET'),
  'one character off is refused; there is no fuzzy match');

// ---------------------------------------------------------------- G. self-validation

console.log('\n--- G  NO SELF-VALIDATION, AND OUTCOME SEPARATION\n');

const PRIOR_OUTPUT_TOKENS = ['VERIFIED_AS_IS', 'NO_CLARIFICATION_REQUIRED',
  'ADD_OR_REPLACE_CLARIFICATION', 'SUPPLIED_FACT', 'drawIndex', 'semanticRequestSha256'];
const priorOutputInPayload = bodies.flatMap(b => {
  const msg = String((b.body.messages as Array<Record<string, string>>)[0].content);
  return PRIOR_OUTPUT_TOKENS.filter(t => msg.includes(t)).map(t => `${b.caseId}:${t}`);
});
gate('G.1 no draw is shown another draw\'s output to judge',
  priorOutputInPayload.length === 0,
  priorOutputInPayload.length === 0
    ? `${PRIOR_OUTPUT_TOKENS.length} verdict/output tokens, 0 present in either case payload`
    : `PRESENT: ${priorOutputInPayload.join(', ')}`);
gate('G.2 the displaced/invalid split remains unassignable by code',
  HUMAN_AUTHORITY_ONLY_OUTCOMES.includes('VALID_BUT_TARGET_DISPLACED')
    && HUMAN_AUTHORITY_ONLY_OUTCOMES.includes('INVALID_WRONG_FACT'),
  EXPERT_SEMANTIC_OUTCOME_V2_VERSION);
gate('G.3 owed-target recall stays independent of clarification validity',
  SEMANTIC_OUTCOME_V2_PROPERTIES.VALID_BUT_TARGET_DISPLACED.owedTargetRecall === 'MISS'
    && SEMANTIC_OUTCOME_V2_PROPERTIES.VALID_BUT_TARGET_DISPLACED.clarificationPrecision
      === 'NOT_A_DEFECT',
  'a displaced outcome is a recall MISS and not a precision defect');

// ---------------------------------------------------------------- H. truth-authority inventory

console.log('\n--- H  HUMAN-TRUTH AUTHORITY INVENTORY AND FALSIFIER TESTABILITY\n');

interface RowDisposition { rowId: string; authoredClass: string; disposition: string;
  prospectiveStrictSemanticTruthEligibility: string }
const rowTruth = JSON.parse(readFileSync(join(ROWTRUTH, 'ROW-TRUTH-DISPOSITIONS.json'), 'utf8')) as
{ rows: RowDisposition[] };
const eligible = rowTruth.rows.filter(r => r.prospectiveStrictSemanticTruthEligibility === 'ELIGIBLE');
const requiredEligible = eligible.filter(r => r.authoredClass === 'REQUIRED');
const silenceEligible = eligible.filter(r => r.authoredClass === 'FORBIDDEN');
const ineligible = rowTruth.rows.filter(
  r => r.prospectiveStrictSemanticTruthEligibility !== 'ELIGIBLE');

gate('H.1 the human-truth inventory is complete — every row carries a disposition',
  rowTruth.rows.every(r => !!r.disposition),
  `${rowTruth.rows.length} rows: ${requiredEligible.length} REQUIRED eligible, `
  + `${silenceEligible.length} silence eligible, ${ineligible.length} ineligible`);
gate('H.2 both experiment cases are human-authoritative',
  EXPERIMENT.cases.every(c => requiredEligible.some(r => r.rowId === c.rowId)),
  requiredEligible.map(r => `${r.rowId} ${r.disposition}`).join(' · '));

const FALSIFIER_D_TESTABLE = silenceEligible.length > 0;
gate('H.3 FALSIFIER_D_TESTABLE is recorded honestly rather than manufactured',
  FALSIFIER_D_TESTABLE === false,
  `FALSIFIER_D_TESTABLE = ${String(FALSIFIER_D_TESTABLE)} — 0 human-valid silence rows survive. `
  + `HS-J1, HS-N1, HS-P1 (AUTHORING_INVALID) and HS-R1 (AUTHORING_AMBIGUOUS) are NOT reused.`);
gate('H.4 no invalid row is used as a silence control anywhere in the experiment',
  !bodies.some(b => ['HS-J1', 'HS-N1', 'HS-P1', 'HS-R1']
    .some(r => JSON.stringify(b.body).includes(r))),
  'the four ineligible rows appear in no request');

const FALSIFIER_TESTABILITY = {
  A_settledSilenceRecovery: { testable: true,
    basis: 'HS-E1 is a human-authoritative REQUIRED row; A measures recovery of an owed target, '
      + 'not the correctness of a silence control' },
  B_owedTargetPreservation: { testable: true,
    basis: 'HS-A1 is human-authoritative and binding is now available; this is the core claim' },
  C_validButDisplacedRetention: { testable: true,
    basis: 'the additive shape is admitted by v3 and refused by v2; retention is directly observable' },
  D_falseQuestionManufacture: { testable: false,
    basis: 'NO human-valid silence row survives §162. Manufacturing a denominator from '
      + 'AUTHORING_INVALID or AUTHORING_AMBIGUOUS rows would produce a precision figure resting on '
      + 'truth a human rejected.' },
  E_drawInstability: { testable: true,
    basis: '6 draws per case give 15 within-case pairs, comparable to §163\'s 45' },
  F_questionBurden: { testable: true, scoped: true,
    basis: 'measurable on these two rows only; it is NOT a production burden estimate and may not '
      + 'be quoted as one' },
};
gate('H.5 the falsifier testability matrix is explicit and scoped',
  Object.values(FALSIFIER_TESTABILITY).filter(f => f.testable).length === 5
    && FALSIFIER_TESTABILITY.D_falseQuestionManufacture.testable === false,
  '5 of 6 testable; D is not, and F is testable but scoped to two rows');
gate('H.6 the experiment claim is narrowed rather than the falsifier weakened',
  FALSIFIER_TESTABILITY.D_falseQuestionManufacture.basis.includes('human-valid silence row'),
  'no false-question-precision claim may be drawn from this experiment');

// ---------------------------------------------------------------- I. baseline integrity

console.log('\n--- I  BASELINE AND HISTORICAL INTEGRITY\n');

const drawRecords = join(V, 'expert-hazlenz-verifier-draw-reliability-2026-09-04',
  'DRAW-RUN-RECORDS.jsonl');
gate('I.1 the §163 baseline records are present and are read only',
  existsSync(drawRecords)
    && readFileSync(drawRecords, 'utf8').trim().split('\n').length === 20,
  '20 draw records, untouched; no new baseline is purchased');
gate('I.2 the comparison is ACROSS the manipulation and the byte-identity claim is not overstated',
  frozenRequests.every(f => f.semanticRequestSha256
    !== 'd9ba1dc6fb7e45590e747111d855a3d0d4bd0190b7c227e3256bb51fb7351809'),
  'the v3 request necessarily differs from §163\'s v2 request — that difference IS the '
  + 'manipulation, and §163 remains the frozen no-binding baseline');

// ---------------------------------------------------------------- verdict

const blockers = gates.filter(g => !g.ok);
const READY = blockers.length === 0;

console.log('\n' + '='.repeat(100));
console.log(`  PRE-SPEND GATE: ${passed}/${passed + failed} PASS · ${failed} FAIL`);
console.log(`  FALSIFICATION_HARNESS_READY = ${READY ? 'TRUE' : 'FALSE'}`);
console.log(`  FALSIFIER_D_TESTABLE = ${String(FALSIFIER_D_TESTABLE)}`);
console.log('  PROVIDER CALLS: 0   COST: $0.00   NOTHING WAS SPENT');
console.log('='.repeat(100));
if (!READY) {
  console.log('\nBLOCKERS:');
  for (const b of blockers) console.log(`  ${b.id}\n      ${b.detail}`);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'FALSIFICATION-HARNESS-PREFLIGHT-V3.json'), JSON.stringify({
  operation: '§166 remediated pre-spend preflight — 12-call binding falsification under protocol v3',
  ranAt: new Date().toISOString(),
  providerCalls: 0,
  costUsd: 0.0,
  FALSIFICATION_HARNESS_READY: READY,
  FALSIFIER_D_TESTABLE,
  experiment: EXPERIMENT,
  protocolHashes: {
    verifierInstructionV3Sha256: v3PromptSha,
    verifierV3ResponseSchemaSha256: v3SchemaSha,
    verifierInstructionV2Sha256: sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT),
  },
  semanticPreservation: {
    addedLines: diff.addedCount,
    removedLines: diff.removedCount,
    byClassification: diff.byClassification,
    SUBSTANTIVE_SEMANTIC_CHANGE_COUNT: diff.SUBSTANTIVE_SEMANTIC_CHANGE_COUNT,
    contractSubstantiveSemanticChangeCount: CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT,
    V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL:
      diff.V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL,
  },
  suppliedOwedFacts: SUPPLIED,
  frozenRequests,
  cost: {
    priceInPerMillionUsd: PRICE_IN_PER_M,
    priceOutPerMillionUsd: PRICE_OUT_PER_M,
    maxTokensPerCall: EXPERIMENT.maxTokensPerCall,
    conservativeInputTokenBound: CONSERVATIVE_INPUT_TOKEN_BOUND,
    projectedInputTokensPerCase: Object.fromEntries(
      perCase.map(c => [c.caseId, c.projectedTokens])),
    worstCasePerCallUsd: Number(worstPerCall.toFixed(6)),
    prospectiveWorstCase12CallsUsd_conservative: Number(conservativeTotal.toFixed(5)),
    prospectiveWorstCase12CallsUsd_projectionBased: Number(projectedTotal.toFixed(5)),
    expectedCostUsd_atSection163MeasuredMeans: Number(expectedTotal.toFixed(5)),
    hardProspectiveCostCapUsd: EXPERIMENT.hardProspectiveCostCapUsd,
    callsAdmittedUnderTheCap: callsUnderCap,
    spendGateFormula:
      'BEFORE each call: spentUsd + worstCasePerCallUsd <= hardProspectiveCostCapUsd',
    finding: conservativeTotal <= EXPERIMENT.hardProspectiveCostCapUsd ? null
      : 'The $0.60 cap was set against §165\'s figure, which priced the v2 request. The v3 request '
        + 'is necessarily larger — the owed facts and their two-branch structure are now in the '
        + 'prompt — so the same 12 calls at the same 4000-token output ceiling cost more. Under '
        + 'strict prospective checking the cap admits '
        + `${callsUnderCap} of 12 calls, and the run would stop short rather than overspend. `
        + 'The output ceiling was NOT lowered to fit, per the product owner\'s direction.',
    minimumCapThatAdmitsAll12Usd: {
      conservativeBound: Number((Math.ceil(conservativeTotal * 100) / 100).toFixed(2)),
      projectionBased: Number((Math.ceil(projectedTotal * 100) / 100).toFixed(2)),
      recommendation: 'set the cap from the CONSERVATIVE bound, because a projection that is 5% '
        + 'low is a cap that can be crossed',
    },
  },
  falsifierTestability: FALSIFIER_TESTABILITY,
  humanTruthInventory: {
    totalRows: rowTruth.rows.length,
    requiredEligible: requiredEligible.map(r => ({ rowId: r.rowId, disposition: r.disposition })),
    silenceEligible: silenceEligible.map(r => ({ rowId: r.rowId, disposition: r.disposition })),
    ineligible: ineligible.map(r => ({ rowId: r.rowId, authoredClass: r.authoredClass,
      disposition: r.disposition })),
    silenceControlNote: 'HS-J1, HS-N1 and HS-P1 are AUTHORING_INVALID; HS-R1 is '
      + 'AUTHORING_AMBIGUOUS. None may be reused as authoritative silence truth, and none appears '
      + 'in any request built by this harness.',
  },
  gates: gates.map(g => ({ id: g.id, pass: g.ok, detail: g.detail })),
  blockers: blockers.map(b => ({ id: b.id, detail: b.detail })),
}, null, 2) + '\n');
console.log(`\nwrote ${join(OUT, 'FALSIFICATION-HARNESS-PREFLIGHT-V3.json')}`);

// A blocked preflight is a RESULT, not a crash: it spent nothing and it answered the question.
process.exit(0);
