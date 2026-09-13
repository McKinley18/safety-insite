/**
 * §262 — RECOMPUTE THE §259 CANDIDATE IDENTITY FROM LIVE SOURCES. READ-ONLY.
 *
 * ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS, AND ZERO WRITES OF ANY KIND. It reads the frozen
 * §259 artifact, recomputes every one of its twenty-two elements from the sources that are on disk
 * right now, and compares. It writes nothing: several verification scripts in this repository
 * rewrite the evidence they check, which makes "the artifact matches" unfalsifiable, so this one
 * opens no file for writing at all.
 *
 * IT ALSO CHECKS THE PRODUCTION CONSTANT. `EXPERT_CANDIDATE_IDENTITY_259` is a literal compiled into
 * the server because a deployed process cannot digest TypeScript sources. That literal is only
 * trustworthy if something outside the process proves it, which is this script's second job.
 */
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  build259SystemPrompt, buildExpert259WireSchema, contractIdentities259,
  FIRST_PASS_CONTRACT_259_VERSION,
} from '../src/hazlenz/expert-hazlenz/contract/expert-259-control-identity-contract';
import {
  governedBindingFor,
} from '../src/hazlenz/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import {
  EXPERT_CANDIDATE_IDENTITY_259, EXPERT_259_SYSTEM_PROMPT_SHA,
} from '../src/hazlenz/expert-hazlenz-product/expert-candidate-provenance';
// The frozen §252 matrix input. The recorded wire-schema element was computed over THIS input, so
// the recomputation imports it rather than restating it -- a restated fixture is a fixture that can
// drift into agreement.
import { INPUT as MATRIX_INPUT } from './verify-252-admission-matrix';

const REPO = join(__dirname, '..', '..');
const BACKEND = join(__dirname, '..');
const ARTIFACT = join(REPO, 'verification',
  'expert-hazlenz-259-carrier-coherence-2026-09-12', 'SECTION-259-SUCCESSOR-IDENTITY.json');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const fileSha = (relative: string): string => sha(readFileSync(join(BACKEND, relative), 'utf8'));

/**
 * Element -> how it is derived. Nineteen source digests and three contract derivations, in the
 * order the frozen artifact lists them, because the composite is a digest over the ORDERED lines.
 */
export const DERIVATIONS: Readonly<Record<string, () => string>> = {
  contractVersion: () => FIRST_PASS_CONTRACT_259_VERSION,
  systemPrompt: () => sha(build259SystemPrompt(0)),
  wireSchema: () => sha(JSON.stringify(
    buildExpert259WireSchema(MATRIX_INPUT as any, governedBindingFor([])))),
  contractIdentities259: () => sha(JSON.stringify(contractIdentities259())),
  entryPoint: () => fileSha('src/hazlenz/expert-hazlenz/expert-hazlenz-analysis.ts'),
  adapter: () => fileSha('src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider.ts'),
  envelope: () => fileSha('src/hazlenz/expert-hazlenz-adapters/expert-request-envelope.ts'),
  controlIdentityContract: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-259-control-identity-contract.ts'),
  postureContract253: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-253-posture-contract.ts'),
  postureProjection233: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-233-posture-projection.ts'),
  postureProjection239: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-239-posture-projection.ts'),
  roleJustificationProjection: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-247-role-justification-projection.ts'),
  structuralAdmission252: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-252-structural-admission.ts'),
  normalizer235: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-235-wire-normalization.ts'),
  declarationProjection210j: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-210j-declaration-projection.ts'),
  owedFactLedger: () => fileSha('src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger.ts'),
  owedFactBinding: () => fileSha('src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts'),
  propertyAuthority: () =>
    fileSha('src/hazlenz/expert-hazlenz/owed-facts/property-authority.ts'),
  settlementReview: () =>
    fileSha('src/hazlenz/expert-hazlenz/owed-facts/settlement-review.ts'),
  verifierInstruction218: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-218-property-instruction.ts'),
  verifierSchema218: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-218-property-review-contract.ts'),
  verifierPayload212: () =>
    fileSha('src/hazlenz/expert-hazlenz/contract/expert-212-verifier-payload.ts'),
};

function main(): void {
  const recorded = JSON.parse(readFileSync(ARTIFACT, 'utf8')) as {
    elements: { element: string; value: string }[];
    successorCandidateIdentity259: string;
  };

  let drift = 0;
  const lines: string[] = [];
  for (const element of recorded.elements) {
    const derive = DERIVATIONS[element.element];
    if (!derive) {
      drift += 1;
      console.log(`DRIFT ${element.element.padEnd(30)} no derivation is registered for this element`);
      continue;
    }
    const value = derive();
    lines.push(`${element.element}=${value}`);
    if (value === element.value) {
      console.log(`ok    ${element.element.padEnd(30)} ${value.slice(0, 24)}`);
    } else {
      drift += 1;
      console.log(`DRIFT ${element.element.padEnd(30)} recomputed ${value} recorded ${element.value}`);
    }
  }

  // The registered derivations must COVER the artifact. A missing element would silently shorten
  // the digest input and produce a different composite that happened to be computed the same way.
  const unregistered = Object.keys(DERIVATIONS)
    .filter(k => !recorded.elements.some(e => e.element === k));
  for (const extra of unregistered) {
    drift += 1;
    console.log(`DRIFT ${extra.padEnd(30)} derived but not present in the frozen artifact`);
  }

  const recomputed = sha(lines.join('\n'));
  console.log(`\nelements ${recorded.elements.length}, drift ${drift}`);
  console.log(`recomputed successor identity: ${recomputed}`);
  console.log(`recorded   successor identity: ${recorded.successorCandidateIdentity259}`);
  console.log(`production constant          : ${EXPERT_CANDIDATE_IDENTITY_259}`);

  const identityMatches = drift === 0
    && recomputed === recorded.successorCandidateIdentity259
    && EXPERT_CANDIDATE_IDENTITY_259 === recorded.successorCandidateIdentity259;

  // The execution-time binding the server performs must be checking the value this artifact
  // records, or the check would pass while proving nothing.
  const promptElement = recorded.elements.find(e => e.element === 'systemPrompt')?.value ?? null;
  const promptConstantMatches = EXPERT_259_SYSTEM_PROMPT_SHA === promptElement;
  console.log(`transmitted-prompt constant  : ${EXPERT_259_SYSTEM_PROMPT_SHA} `
    + `(${promptConstantMatches ? 'equals' : 'DOES NOT EQUAL'} frozen element 2)`);

  console.log(JSON.stringify({
    providerCalls: 0, databaseOperations: 0, filesWritten: 0,
    elementsChecked: recorded.elements.length, elementDrift: drift,
    identityMatch: identityMatches, productionConstantMatch: promptConstantMatches,
  }));

  if (!identityMatches || !promptConstantMatches) {
    console.log('IDENTITY MISMATCH');
    process.exit(1);
  }
  console.log('IDENTITY MATCH');
}

if (require.main === module) main();
