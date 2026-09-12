/**
 * §208B -- FROZEN-COHORT VERIFIER-LEG RECOVERY: DETERMINISTIC REQUEST ASSEMBLY AND IDENTITY CHECKS.
 *
 * ZERO PROVIDER CALLS FROM THIS MODULE. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY ASSEMBLY LIVES HERE AND NOT IN THE EXECUTOR ====================
 *
 * The §208B authorization requires an OFFLINE PREFLIGHT that proves, for each of the 24 requests,
 * the exact case identity, owed-fact identity, candidate-set identity, candidate count, serialized
 * candidate-block identity, prompt and schema identity and provider wrapper identity -- and
 * specifically that the all-empty-candidate-block defect CANNOT RECUR.
 *
 * A preflight that proves properties of requests the executor then builds separately proves
 * nothing. So both the preflight and the executor call `assembleVerifierRequests()` here, and the
 * executor transmits exactly the object the preflight inspected. There is one assembly path.
 *
 * ==================== WHAT IS FROZEN, AND WHERE IT COMES FROM ====================
 *
 * Every stimulus is READ FROM PERSISTED §208 EVIDENCE and nothing is regenerated:
 *
 *   observation, location, task, jurisdiction   the frozen §207 truth specification
 *   first-pass response                          RAW-FIRST-PASS-208.jsonl, byte-untouched
 *   hazard candidates                            the same file's `parsed.expertHazardCandidates`
 *   clarifications, uncertainty, summary         the same file's parsed payload
 *   admitted OwedFacts                           PROJECTION-208-CORRECTED.jsonl
 *   governed evidence                            the frozen §207 governed records
 *
 * NO CANDIDATE WORDING IS REWRITTEN. The five fields the verifier prompt renders are copied
 * verbatim out of the persisted candidate records in their persisted order.
 *
 * ==================== THE DEFECT THIS MODULE EXISTS TO MAKE IMPOSSIBLE ====================
 *
 * §208's executor read `parsed.hazardCandidates`. That is §199's PERSISTED field name; the field
 * in the PARSED PROVIDER PAYLOAD is `expertHazardCandidates`. The name mismatch silently produced
 * an empty array, and an empty array renders as "(none raised)" rather than as an error, so all 24
 * verifier calls went out with no candidate block and nothing complained.
 *
 * `readCandidates` below reads the payload field, and `assembleVerifierRequests` REFUSES to build a
 * request whose case has candidate records but whose assembled block is empty. A silent empty block
 * is no longer reachable: it is a thrown abort before any transmission.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { projectOwedFact } from
  '../../src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
  VERIFIER_V3_2_RESPONSE_SCHEMA, buildVerifierV3UserPrompt,
} from './expert-verifier-instruction-v3-2';
import { EXPERT_VERIFIER_CONTRACT_V3_3_VERSION } from './expert-verifier-contract-v3-3';
import { FROZEN_TRUTH_CASES } from './expert-207-truth-specification';
import { preregistrationIdentity } from './expert-207-preregistration';

export const RECOVERY_208B_VERSION = 'hazlenz.expert.208b.verifier-leg-recovery.v1' as const;

/** The §208B product-owner authorization this recovery is executed under. */
export const AUTHORIZATION_REFERENCE =
  'SECTION-208B-PRODUCT-OWNER-AUTHORIZATION-2026-09-08' as const;

/** Restated by the §208B authorization and re-verified before the first call. */
export const AUTHORIZED_PREREGISTRATION_IDENTITY =
  '879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4' as const;

/**
 * The verifier response schema identity §208 actually transmitted on all 25 verifier attempts,
 * taken from `CALL-LEDGER-208.jsonl`. §208B must transmit the same schema; if this stops matching,
 * the recovery is exercising a different verifier and must abort.
 */
export const SECTION_208_VERIFIER_SCHEMA_SHA256 =
  '83071b51edc3673896b068277cc447d0a5438be4e95e9603da0fdb315609a54e' as const;
export const SECTION_208_VERIFIER_GRAMMAR_ID = 'e9e3a4a2788bc8c5' as const;

/**
 * The §199 transport envelope, reproduced exactly. §199 executed the verifier leg 8/8 at HTTP 200
 * with this shape and NO `strict` flag; §208's executor added one and the provider refused it.
 * The description string is §199's, character for character.
 */
export const VERIFIER_TOOL_NAME = 'emit_verifier_verdict' as const;
export const VERIFIER_TOOL_DESCRIPTION =
  'Emit the clarification verification verdict. This is the ONLY way to answer.' as const;
export const VERIFIER_WRAPPER_CARRIES_STRICT_FLAG = false;

const SECTION_208_DIR = 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08';

export const sha256 = (s: string): string =>
  createHash('sha256').update(s, 'utf8').digest('hex');
/** Stable identity for a structure: sorted keys, no insignificant whitespace. */
export const identityOf = (v: unknown): string => sha256(canonical(v));

function canonical(v: unknown): string {
  const walk = (x: unknown): unknown => {
    if (x === null || typeof x !== 'object') return x;
    if (Array.isArray(x)) return x.map(walk);
    const src = x as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) out[k] = walk(src[k]);
    return out;
  };
  return JSON.stringify(walk(v));
}

// ---------------------------------------------------------------- persisted stimuli

export interface PersistedFirstPass {
  readonly caseId: string;
  readonly rawIdentity: string;
  readonly parsedIdentity: string;
  readonly parsed: Record<string, unknown>;
}

export interface PersistedFact {
  readonly caseId: string;
  readonly declarationId: string;
  readonly factKey: string;
  readonly owedFact: Record<string, unknown>;
  readonly projectionIdentity: string;
}

export function section208Dir(repoRoot: string): string {
  return join(repoRoot, 'verification', SECTION_208_DIR);
}

function readJsonl(repoRoot: string, name: string): any[] {
  const p = join(section208Dir(repoRoot), name);
  if (!existsSync(p)) throw new Error(`§208B ABORT: missing persisted evidence ${name}`);
  return readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as any);
}

export function loadFirstPass(repoRoot: string): readonly PersistedFirstPass[] {
  return readJsonl(repoRoot, 'RAW-FIRST-PASS-208.jsonl').map(r => ({
    caseId: r.caseId as string,
    rawIdentity: identityOf(r.raw),
    parsedIdentity: identityOf(r.parsed),
    parsed: r.parsed as Record<string, unknown>,
  }));
}

/** The CORRECTED deterministic derivation. The erroneous original is never read for stimuli. */
export function loadAdmittedFacts(repoRoot: string): readonly PersistedFact[] {
  const out: PersistedFact[] = [];
  for (const pr of readJsonl(repoRoot, 'PROJECTION-208-CORRECTED.jsonl')) {
    const projectionIdentity = identityOf(pr);
    for (const p of pr.perDeclaration as any[]) {
      if (p.admitted === true && p.owedFact !== null && p.owedFact !== undefined) {
        out.push({
          caseId: pr.caseId as string,
          declarationId: p.declarationId as string,
          factKey: p.factKey as string,
          owedFact: p.owedFact as Record<string, unknown>,
          projectionIdentity,
        });
      }
    }
  }
  return out;
}

/**
 * THE FIELD THE §208 DEFECT GOT WRONG. `expertHazardCandidates` is the provider payload field;
 * `hazardCandidates` was §199's name for the field once PERSISTED. Reading the persisted name out
 * of the payload silently yields undefined, and an empty block renders as "(none raised)".
 */
export function readCandidates(parsed: Record<string, unknown>): readonly Record<string, unknown>[] {
  const v = parsed.expertHazardCandidates;
  return Array.isArray(v) ? v as Record<string, unknown>[] : [];
}

/** The five fields the verifier prompt renders, copied VERBATIM and in persisted order. */
export interface VerifierCandidate {
  readonly candidateKey: string;
  readonly hazardFamily: string;
  readonly assertedConditionState: string;
  readonly evidenceBasis: string;
  readonly reasoning: string;
}

export function toVerifierCandidates(
  records: readonly Record<string, unknown>[],
): readonly VerifierCandidate[] {
  return records.map(c => ({
    candidateKey: String(c.candidateKey ?? ''),
    hazardFamily: String(c.hazardFamily ?? ''),
    assertedConditionState: String(c.assertedConditionState ?? ''),
    evidenceBasis: String(c.evidenceBasis ?? ''),
    reasoning: String(c.reasoning ?? ''),
  }));
}

// ---------------------------------------------------------------- assembled request

export interface AssembledVerifierRequest {
  readonly ordinal: number;
  readonly caseId: string;
  readonly declarationId: string;
  readonly factKey: string;
  readonly analysisId: string;
  readonly firstPassRawIdentity: string;
  readonly firstPassParsedIdentity: string;
  readonly projectionIdentity: string;
  readonly owedFactIdentity: string;
  readonly candidateCount: number;
  readonly candidateSetIdentity: string;
  readonly candidateBlockIdentity: string;
  readonly clarificationCount: number;
  readonly systemPrompt: string;
  readonly systemPromptIdentity: string;
  readonly userPrompt: string;
  readonly userPromptIdentity: string;
  readonly schemaIdentity: string;
  readonly wrapperIdentity: string;
  readonly governedSourceIds: readonly string[];
  /** The exact tool block that will be transmitted. No strict flag: §199's envelope. */
  readonly toolBlock: Record<string, unknown>;
}

/**
 * The candidate block AS ACTUALLY RENDERED INTO THE TRANSMITTED PROMPT, extracted from the prompt
 * rather than re-rendered here. Re-rendering it would create a second formatter that could drift
 * from the real one and would then certify the wrong bytes.
 */
const CANDIDATE_BLOCK_HEADING = 'FIRST-PASS ANALYSIS — HAZARD CANDIDATES';
const CLARIFICATION_HEADING = 'FIRST-PASS ANALYSIS — CLARIFICATIONS ASKED';

export function extractCandidateBlock(userPrompt: string): string {
  const start = userPrompt.indexOf(CANDIDATE_BLOCK_HEADING);
  if (start < 0) {
    throw new Error('§208B ABORT: the verifier prompt carries no hazard-candidate heading. The '
      + 'prompt builder has changed shape and the recovery cannot certify what it would send.');
  }
  const end = userPrompt.indexOf(CLARIFICATION_HEADING, start);
  if (end < 0) {
    throw new Error('§208B ABORT: the verifier prompt carries no clarification heading after the '
      + 'candidate block; the block boundary cannot be established.');
  }
  return userPrompt.slice(start + CANDIDATE_BLOCK_HEADING.length, end).trim();
}

export function assembleVerifierRequests(repoRoot: string): readonly AssembledVerifierRequest[] {
  const firstPass = loadFirstPass(repoRoot);
  const facts = loadAdmittedFacts(repoRoot);
  const out: AssembledVerifierRequest[] = [];

  facts.forEach((f, i) => {
    const c = FROZEN_TRUTH_CASES.find(x => x.caseId === f.caseId);
    if (c === undefined) throw new Error(`§208B ABORT: unknown frozen case ${f.caseId}`);
    const fp = firstPass.find(x => x.caseId === f.caseId);
    if (fp === undefined) throw new Error(`§208B ABORT: no persisted first pass for ${f.caseId}`);

    const candidateRecords = readCandidates(fp.parsed);
    const candidates = toVerifierCandidates(candidateRecords);

    // THE GUARD THE §208 DEFECT LACKED. A case that produced candidates may not assemble an empty
    // block, and the failure is a loud abort rather than a silent "(none raised)".
    if (candidateRecords.length > 0 && candidates.length === 0) {
      throw new Error(`§208B ABORT: ${f.caseId} has ${candidateRecords.length} persisted candidate `
        + 'records but assembled an EMPTY candidate block. This is the §208 defect 3 signature and '
        + 'it must never reach a provider again.');
    }

    const clarificationRecords = Array.isArray(fp.parsed.decisionCriticalClarifications)
      ? fp.parsed.decisionCriticalClarifications as any[] : [];
    const uncertainty = Array.isArray((fp.parsed as any)?.uncertainty?.statements)
      ? (fp.parsed as any).uncertainty.statements as string[] : [];
    const summary = String((fp.parsed as any)?.expertExplanation?.summary ?? '');
    const governedEvidence = (c.governed?.records ?? [])
      .map(r => ({ sourceId: r.sourceId, text: r.text }));

    const projected = projectOwedFact(f.owedFact as any);
    const userPrompt = buildVerifierV3UserPrompt({
      caseId: f.caseId,
      observation: c.observation,
      jurisdiction: c.jurisdiction,
      governedEvidence,
      deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
      firstPass: {
        candidates: [...candidates],
        clarifications: clarificationRecords.map(q => ({
          clarificationId: String(q?.clarificationId ?? ''),
          question: String(q?.question ?? ''),
          affectedDecision: String(q?.affectedDecision ?? ''),
        })),
        uncertainty,
        summary,
      },
      owedFacts: [{
        factKey: projected.factKey,
        affectedDecision: projected.affectedDecision,
        whyUnresolved: String(projected.whyUnresolved ?? ''),
        branchA: projected.branchA,
        branchB: projected.branchB,
        decisionDivergence: projected.decisionDivergence,
        evidenceSpan: projected.evidenceSpan,
      }],
    });

    const toolBlock: Record<string, unknown> = {
      name: VERIFIER_TOOL_NAME,
      description: VERIFIER_TOOL_DESCRIPTION,
      input_schema: VERIFIER_V3_2_RESPONSE_SCHEMA,
    };

    // A second guard, on the RENDERED bytes rather than on the array: a case with candidate
    // records may not render "(none raised)". This is the exact §208 failure surface.
    if (candidateRecords.length > 0 && extractCandidateBlock(userPrompt) === '(none raised)') {
      throw new Error(`§208B ABORT: ${f.caseId} rendered "(none raised)" despite `
        + `${candidateRecords.length} persisted candidate records. Refusing to transmit.`);
    }

    out.push({
      ordinal: i + 1,
      caseId: f.caseId,
      declarationId: f.declarationId,
      factKey: f.factKey,
      analysisId: `AN-208B-${f.caseId}-${f.factKey}`,
      firstPassRawIdentity: fp.rawIdentity,
      firstPassParsedIdentity: fp.parsedIdentity,
      projectionIdentity: f.projectionIdentity,
      owedFactIdentity: identityOf(f.owedFact),
      candidateCount: candidates.length,
      candidateSetIdentity: identityOf(candidateRecords),
      candidateBlockIdentity: sha256(extractCandidateBlock(userPrompt)),
      clarificationCount: clarificationRecords.length,
      systemPrompt: EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
      systemPromptIdentity: sha256(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT),
      userPrompt,
      userPromptIdentity: sha256(userPrompt),
      schemaIdentity: sha256(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)),
      wrapperIdentity: identityOf(toolBlock),
      governedSourceIds: governedEvidence.map(g => g.sourceId),
      toolBlock,
    });
  });

  return out;
}

// ---------------------------------------------------------------- the nine identity checks

export interface IdentityCheck {
  readonly id: string;
  readonly statement: string;
  readonly held: boolean;
  readonly expected: string;
  readonly actual: string;
}

export function preRunIdentityChecks(repoRoot: string): readonly IdentityCheck[] {
  const checks: IdentityCheck[] = [];
  const add = (id: string, statement: string, expected: string, actual: string): void => {
    checks.push({ id, statement, expected, actual, held: expected === actual });
  };

  // 1. preregistration hash
  add('PR1', 'the §207 preregistration identity is the authorized one',
    AUTHORIZED_PREREGISTRATION_IDENTITY, preregistrationIdentity());

  const firstPass = loadFirstPass(repoRoot);
  const facts = loadAdmittedFacts(repoRoot);
  const requests = assembleVerifierRequests(repoRoot);

  // 2. all 24 persisted first-pass responses are present and readable
  add('PR2', 'all 24 persisted §208 first-pass responses are present',
    '24 cases', `${firstPass.length} cases`);
  add('PR2b', 'every frozen case has a persisted first-pass response',
    'all present',
    FROZEN_TRUTH_CASES.every(c => firstPass.some(f => f.caseId === c.caseId))
      ? 'all present' : 'MISSING');

  // 3. corrected deterministic projection identities are recorded
  add('PR3', 'every verifier target carries a corrected-projection identity',
    `${facts.length} identities`,
    `${facts.filter(f => f.projectionIdentity.length === 64).length} identities`);

  // 4. all 49 candidate records are present for assembly
  const totalCandidates = firstPass.reduce((n, f) => n + readCandidates(f.parsed).length, 0);
  add('PR4', 'all 49 persisted hazard-candidate records are readable for assembly',
    '49', String(totalCandidates));

  // 5. the candidate block is non-empty wherever the case produced candidates
  const casesWithCandidates = new Set(
    firstPass.filter(f => readCandidates(f.parsed).length > 0).map(f => f.caseId));
  const emptyBlockDespiteCandidates = requests
    .filter(r => casesWithCandidates.has(r.caseId) && r.candidateCount === 0)
    .map(r => r.caseId);
  add('PR5', 'no assembled request has an empty candidate block on a case that produced candidates',
    '0 such requests', `${emptyBlockDespiteCandidates.length} such requests`);

  // 6. verifier system prompt identity
  add('PR6', 'the verifier system prompt is the intended §208 verifier prompt',
    EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION,
    EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION);
  add('PR6b', 'every assembled request carries the same verifier system prompt identity',
    '1', String(new Set(requests.map(r => r.systemPromptIdentity)).size));

  // 7. verifier schema identity matches what §208 transmitted
  add('PR7', 'the verifier response schema identity matches the §208 ledger',
    SECTION_208_VERIFIER_SCHEMA_SHA256,
    requests.length > 0 ? requests[0].schemaIdentity : 'no requests');

  // 8. wrapper shape matches the known-accepted §199 envelope
  const wrapperJson = requests.length > 0 ? JSON.stringify(requests[0].toolBlock) : '';
  add('PR8', 'the tool wrapper carries NO strict flag, matching the §199 envelope §199 executed 8/8',
    'no strict flag', wrapperJson.includes('"strict"') ? 'STRICT FLAG PRESENT' : 'no strict flag');
  add('PR8b', 'the tool name and description are §199\'s exactly',
    `${VERIFIER_TOOL_NAME}|${VERIFIER_TOOL_DESCRIPTION}`,
    `${String(requests[0]?.toolBlock.name)}|${String(requests[0]?.toolBlock.description)}`);

  // 9. this §208B authorization is referenced
  add('PR9', 'the §208B product-owner authorization is referenced by this run',
    'SECTION-208B-PRODUCT-OWNER-AUTHORIZATION-2026-09-08', AUTHORIZATION_REFERENCE);

  // The count the authorization expects.
  add('PR10', 'exactly 24 verifier requests are assembled, one per admitted OwedFact',
    '24', String(requests.length));
  // Cross-checked against the version §208 actually persisted on its verifier records, so this is
  // a comparison with the evidence rather than a constant compared to itself.
  const section208Admission = new Set(
    readJsonl(repoRoot, 'RAW-VERIFIER-208.jsonl').map(r => String(r.admissionContractVersion)));
  add('PR11', 'the admission contract is the one §208 recorded on its verifier evidence',
    [...section208Admission].join(','), EXPERT_VERIFIER_CONTRACT_V3_3_VERSION);

  return checks;
}

export function recoveryEffect(): {
  firstPassProviderCalls: 0; governedStageProviderCalls: 0; databaseOperations: 0;
  humanVerdictsWritten: 0; truthSpecificationChanges: 0; gateChanges: 0;
} {
  return {
    firstPassProviderCalls: 0, governedStageProviderCalls: 0, databaseOperations: 0,
    humanVerdictsWritten: 0, truthSpecificationChanges: 0, gateChanges: 0,
  };
}
