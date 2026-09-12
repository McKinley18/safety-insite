/**
 * §167 EXPERT HAZLENZ -- THE FROZEN v3 FALSIFICATION EXPERIMENT CASES. DEVELOPMENT ONLY.
 *
 * Extracted from the §166 preflight so the executing script and the preflight build the SAME BYTES
 * from the SAME source, rather than from two copies that could drift.
 *
 * >>> THE EXTRACTION IS PROVED, NOT ASSUMED. `EXPECTED_FROZEN_REQUEST_SHA256` below carries the two
 * >>> hashes §166 recorded BEFORE this module existed. `assertFrozenRequestHashes()` rebuilds both
 * >>> bodies and refuses to proceed unless they match, so a single changed character anywhere in
 * >>> the supplied facts, the instruction, the schema or the prompt builder stops the run before
 * >>> any money is spent.
 *
 * ==================== THE ALLOCATION IS PREREGISTERED ====================
 *
 * Two cases, six draws each, twelve calls. Fixed here, before spend, and not rebalanceable after
 * outcomes are seen: `DRAW_PLAN` is a literal array and the executor iterates it in order.
 *
 * ==================== WHY HS-A1 IS TOLD ABOUT ONE FACT AND NOT TWO ====================
 *
 * HS-A1 receives ONLY the flame-failure target. The experiment asks whether a verifier that CAN
 * bind the owed target still displaces it, and whether it carries the auger gap additively rather
 * than instead. Supplying the auger fact would answer the question for the model and measure
 * nothing.
 */

import { createHash } from 'crypto';

import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA, buildVerifierV3UserPrompt,
  type V3SuppliedOwedFact,
} from './expert-verifier-instruction-v3';

export const V3_EXPERIMENT_CASES_VERSION =
  'hazlenz.expert.v3-falsification-cases.2026-09-04' as const;

export const V3_EXPERIMENT_MODEL = 'claude-sonnet-5' as const;
export const V3_EXPERIMENT_MAX_TOKENS = 4000 as const;

/** The preregistered allocation. Twelve calls, fixed before spend. */
export const DRAW_PLAN: readonly { rowId: string; caseId: string; draw: number }[] = [
  { rowId: 'HS-A1', caseId: 'VC-08', draw: 1 },
  { rowId: 'HS-A1', caseId: 'VC-08', draw: 2 },
  { rowId: 'HS-A1', caseId: 'VC-08', draw: 3 },
  { rowId: 'HS-A1', caseId: 'VC-08', draw: 4 },
  { rowId: 'HS-A1', caseId: 'VC-08', draw: 5 },
  { rowId: 'HS-A1', caseId: 'VC-08', draw: 6 },
  { rowId: 'HS-E1', caseId: 'VC-04', draw: 1 },
  { rowId: 'HS-E1', caseId: 'VC-04', draw: 2 },
  { rowId: 'HS-E1', caseId: 'VC-04', draw: 3 },
  { rowId: 'HS-E1', caseId: 'VC-04', draw: 4 },
  { rowId: 'HS-E1', caseId: 'VC-04', draw: 5 },
  { rowId: 'HS-E1', caseId: 'VC-04', draw: 6 },
];

/** The owed facts supplied to each case. Byte-frozen; the hash assertion below proves it. */
export const SUPPLIED_OWED_FACTS: Readonly<Record<string, V3SuppliedOwedFact[]>> = {
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

/** The owed key each case is scored against. The frozen human-authoritative target. */
export const OWED_TARGET_KEY: Readonly<Record<string, string>> = {
  'VC-08': 'owed:hs-a1:flame_failure_safeguard_functional_status',
  'VC-04': 'owed:hs-e1:rotor_guard_interlock_function_verified',
};

export interface ExperimentPacketCase {
  caseId: string; observation: string; jurisdiction: string; governedEvidence: unknown[];
  deterministic: { familiesEmitted: string[]; lifeCriticalFindingKeys: string[] };
  firstPass: {
    candidates: Array<{ candidateKey: string; hazardFamily: string; assertedConditionState: string;
      evidenceBasis: string; reasoning: string }>;
    clarifications: Array<{ clarificationId: string; question: string; affectedDecision: string }>;
    uncertainty: string[]; summary: string;
  };
}

/** The request body. One per case; reused byte-identically for all six of its draws. */
export function buildV3RequestBody(c: ExperimentPacketCase): Record<string, unknown> {
  return {
    model: V3_EXPERIMENT_MODEL,
    max_tokens: V3_EXPERIMENT_MAX_TOKENS,
    system: EXPERT_VERIFIER_V3_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildVerifierV3UserPrompt({
      caseId: c.caseId,
      observation: c.observation,
      jurisdiction: c.jurisdiction,
      governedEvidence: c.governedEvidence,
      deterministic: c.deterministic,
      firstPass: c.firstPass,
      owedFacts: SUPPLIED_OWED_FACTS[c.caseId],
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

/**
 * The hashes §166's preflight recorded BEFORE this module existed. They are the extraction proof:
 * if this module drifted from the preflight by one character, these would not match.
 */
export const EXPECTED_FROZEN_REQUEST_SHA256: Readonly<Record<string, string>> = {
  'VC-08': 'c1e5407a121c60b7e395e6e7b4f9b1ebc866b79a40911f2397bea534e5c02bb6',
  'VC-04': '94b47273776d37942cbd8b0588c28ac26ad8573b052dda27fc4ba15ff2474ab3',
};

export const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

/** Refuse to proceed unless both rebuilt bodies hash to §166's recorded values. */
export function assertFrozenRequestHashes(
  cases: readonly ExperimentPacketCase[],
): Record<string, string> {
  const actual: Record<string, string> = {};
  const problems: string[] = [];
  for (const c of cases) {
    const h = sha256(JSON.stringify(buildV3RequestBody(c)));
    actual[c.caseId] = h;
    if (h !== EXPECTED_FROZEN_REQUEST_SHA256[c.caseId]) {
      problems.push(`${c.caseId}: expected ${EXPECTED_FROZEN_REQUEST_SHA256[c.caseId]}, got ${h}`);
    }
  }
  if (problems.length > 0) {
    throw new Error('FROZEN_REQUEST_HASH_MISMATCH — the experiment payload has drifted from the '
      + `§166 preflight and MUST NOT be spent against: ${problems.join(' | ')}`);
  }
  return actual;
}
