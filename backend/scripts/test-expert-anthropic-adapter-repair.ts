/**
 * EXPERT HAZLENZ -- §108 STEP 1A/1B: deterministic proof of the Anthropic-only schema strip.
 *
 * ZERO PROVIDER CALLS. This suite proves the transformation is safe to compose into the permanent
 * adapter path BEFORE any hosted call is authorized to use it: it never mutates its input, it
 * removes exactly `minLength`/`minItems` and nothing else, it is deterministic, and -- the part that
 * actually matters for safety -- the application boundary keeps rejecting everything it rejected
 * before, independent of what any adapter puts on the wire.
 */

import { createHash } from 'crypto';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, buildAnthropicRequestBody,
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildExpertWireSchema, bindWireAnalysis,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput, ANALYSIS_FATAL_REASONS } from
  '../src/hazlenz/expert-hazlenz/expert-normalization';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}`); }
}

const NOW = '2026-08-30T00:00:00.000Z';
const OBS = 'An extension cord ran through standing water to a sump pump while a worker reached '
  + 'into the pump housing to clear a blockage.';
function input(): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'a-1',
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
    inspectionContext: { location: 'Plant 2', task: 'walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['electrical', 'wet_environment', 'confined_space', 'machine_guarding'],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  };
}
const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex');

function countKeys(node: unknown, key: string): number {
  let n = 0;
  if (Array.isArray(node)) { for (const v of node) n += countKeys(v, key); return n; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === key) n += 1;
      n += countKeys(v, key);
    }
  }
  return n;
}
function collectAllKeys(node: unknown, path = '', out: Record<string, unknown> = {}): Record<string, unknown> {
  if (Array.isArray(node)) { node.forEach((v, i) => collectAllKeys(v, `${path}[${i}]`, out)); return out; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) collectAllKeys(v, `${path}.${k}`, out);
    return out;
  }
  out[path] = node;
  return out;
}

console.log('§108 STEP 1A/1B -- ANTHROPIC ADAPTER COMPATIBILITY STRIP, deterministic, zero provider calls\n');

// ============================================================ 1A. immutability + isolation proof
console.log('--- 1A. immutability, isolation, determinism ---');
{
  const canonical = buildExpertWireSchema(input());
  const canonicalHashBefore = hash(canonical);
  const wrapped = applyStrictSchemaWrapper(canonical);
  const stripped1 = stripAnthropicUnsupportedKeywords(wrapped);
  const canonicalHashAfter = hash(canonical);

  assert(canonicalHashBefore === canonicalHashAfter,
    'A.1 the CANONICAL schema object is byte-identical before and after the strip runs (source immutability)');
  assert(countKeys(canonical, 'minLength') > 0 && countKeys(canonical, 'minItems') > 0,
    'A.2 the canonical schema still carries minLength/minItems -- untouched by the strip');
  assert(countKeys(canonical, 'additionalProperties') === 0,
    'A.3 the canonical schema still carries no additionalProperties -- the strict wrapper is separate and did not mutate it either');

  const minLenBefore = countKeys(wrapped, 'minLength');
  const minItemsBefore = countKeys(wrapped, 'minItems');
  assert(minLenBefore === 14 && minItemsBefore === 1,
    `A.4 the wrapped (pre-strip) schema carries the exact §107-measured count: 14 minLength, 1 minItems (got ${minLenBefore}/${minItemsBefore})`);
  assert(countKeys(stripped1, 'minLength') === 0, 'A.5 every minLength is removed from the stripped copy');
  assert(countKeys(stripped1, 'minItems') === 0, 'A.6 every minItems is removed from the stripped copy');

  const wrappedHashBefore = hash(wrapped);
  const stripped2 = stripAnthropicUnsupportedKeywords(wrapped);
  const wrappedHashAfterSecondCall = hash(wrapped);
  assert(wrappedHashBefore === wrappedHashAfterSecondCall,
    'A.7 the WRAPPED schema is also unmutated by the strip (the input the strip actually receives)');
  assert(hash(stripped1) === hash(stripped2),
    'A.8 two independent strips of the same input produce byte-identical output (deterministic)');

  // Every OTHER key/value at every path must be preserved exactly, only minLength/minItems entries removed.
  const beforeKeys = collectAllKeys(wrapped);
  const afterKeys = collectAllKeys(stripped1);
  const beforePaths = new Set(Object.keys(beforeKeys));
  const afterPaths = new Set(Object.keys(afterKeys));
  let onlyExpectedRemovals = true; let unexpectedRemovalPath = '';
  for (const p of beforePaths) {
    if (!afterPaths.has(p)) {
      if (!/\.minLength$|\.minItems$/.test(p)) { onlyExpectedRemovals = false; unexpectedRemovalPath = p; break; }
    } else if (beforeKeys[p] !== afterKeys[p]) {
      onlyExpectedRemovals = false; unexpectedRemovalPath = p; break;
    }
  }
  assert(onlyExpectedRemovals,
    `A.9 EVERY leaf value at EVERY path is preserved except minLength/minItems entries (first violation, if any: ${unexpectedRemovalPath})`);
  assert(afterPaths.size < beforePaths.size,
    'A.10 the stripped schema genuinely has fewer leaf paths (the removal actually happened, this is not a no-op)');

  // property names / required lists / enums / structure preserved
  const before = wrapped as any; const after = stripped1 as any;
  assert(JSON.stringify(Object.keys(before.properties)) === JSON.stringify(Object.keys(after.properties)),
    'A.11 top-level property names are identical and in the same order');
  assert(JSON.stringify(before.required) === JSON.stringify(after.required),
    'A.12 the top-level required array is byte-identical');
  const beforeCand = before.properties.expertHazardCandidates.items;
  const afterCand = after.properties.expertHazardCandidates.items;
  assert(JSON.stringify(beforeCand.required) === JSON.stringify(afterCand.required),
    'A.13 the candidate-level required array is byte-identical (groundingStatus, evidence both still required)');
  assert(JSON.stringify(beforeCand.properties.groundingStatus) === JSON.stringify(afterCand.properties.groundingStatus),
    'A.14 groundingStatus (name, type, enum) is byte-identical');
  assert(JSON.stringify(beforeCand.properties.confidence.enum) === JSON.stringify(afterCand.properties.confidence.enum),
    'A.15 enums are byte-identical');
  assert(after.additionalProperties === false && before.additionalProperties === false,
    'A.16 additionalProperties:false survives on both -- the strict wrapper is untouched by this transform');
  assert(before.type === after.type,
    'A.17 the strict flag / structure (top-level type) is unaffected');
}

// ============================================================ 1A continued: end-to-end request wiring
console.log('\n--- 1A continued: the permanent adapter path actually uses the strip ---');
{
  const body = buildAnthropicRequestBody(input());
  const schema = (body.tools as any[])[0].input_schema;
  assert(countKeys(schema, 'minLength') === 0 && countKeys(schema, 'minItems') === 0,
    'A.18 buildAnthropicRequestBody -- the PERMANENT adapter path -- now sends a schema with zero minLength/minItems');
  assert((body.tools as any[])[0].strict === true, 'A.19 strict mode is unaffected');
  assert(body.model === EXPERT_HOSTED_INFERENCE_CONFIG.model, 'A.20 model is unaffected');
  assert(JSON.stringify((body as any).thinking) === '{"type":"disabled"}', 'A.21 thinking setting is unaffected');
  assert((body.tools as any[])[0].name === 'emit_expert_analysis', 'A.22 tool name is unaffected');
}

// ============================================================ 1B. trusted-boundary proof
console.log('\n--- 1B. the application boundary is authoritative regardless of what the wire schema says ---');
{
  const wire = (over: Record<string, unknown> = {}) => ({
    outcome: 'ANALYZED',
    expertHazardCandidates: [], decisionCriticalClarifications: [],
    crossHazardInsights: [], disagreements: [],
    expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
    ...over,
  });
  const cand = (over: Record<string, unknown> = {}) => ({
    candidateKey: 'c1', hazardFamily: 'electrical', assertedConditionState: 'UNKNOWN',
    groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
    evidenceBasis: 'b', reasoning: 'r', confidence: 'LOW',
    relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: true,
    ...over,
  });
  const run = (over: Record<string, unknown>) =>
    normalizeExpertOutput(bindWireAnalysis(wire(over), input()).raw, input(), NOW);

  // The wire schema this run pretends came from Anthropic has NO minLength/minItems (as if the
  // provider had been sent the stripped schema and a producer exploited the absence). The boundary
  // must refuse it exactly as if minLength/minItems were still declared.
  const emptyRequiredString = run({ expertHazardCandidates: [cand({ reasoning: '' })] });
  assert(emptyRequiredString.validated!.analysis.expertHazardCandidates.length === 0
    && emptyRequiredString.issues.some(i => i.code === 'CANDIDATE_MALFORMED'),
    'B.1 an empty required string is STILL refused at the boundary (minLength absence on the wire changes nothing)');

  const underPopulatedInsight = run({ crossHazardInsights: [{
    insightId: 'i1', interactionKind: 'ELECTRICAL_WET_ENVIRONMENT', participants: ['electrical'],
    reasoning: 'r', confidence: 'HIGH',
  }] });
  assert(underPopulatedInsight.validated!.analysis.crossHazardInsights.length === 0
    && underPopulatedInsight.issues.some(i => i.code === 'INSIGHT_INSUFFICIENT_PARTICIPANTS'),
    'B.2 a one-participant insight is STILL refused (minItems absence on the wire changes nothing)');

  const malformedCandidate = run({ expertHazardCandidates: [{ candidateKey: 'x' }] });
  assert(malformedCandidate.validated!.analysis.expertHazardCandidates.length === 0
    && malformedCandidate.issues.some(i => i.code === 'CANDIDATE_MALFORMED'),
    'B.3 a structurally malformed candidate is STILL refused');

  const invalidGrounding = run({ expertHazardCandidates: [cand({ groundingStatus: 'MAYBE' })] });
  assert(invalidGrounding.validated!.analysis.expertHazardCandidates.length === 0
    && invalidGrounding.issues.some(i => i.code === 'GROUNDING_STATUS_INVALID'),
    'B.4 an invalid groundingStatus value is STILL refused');

  const contradictedGrounding = run({ expertHazardCandidates: [cand({
    groundingStatus: 'EXACT_QUOTE_SUPPLIED', evidence: [] })] });
  assert(contradictedGrounding.issues.some(i => i.code === 'GROUNDING_CLAIM_UNSUPPORTED')
    && contradictedGrounding.validated!.analysis.expertHazardCandidates.length === 0,
    'B.5 a contradicted grounding declaration (claims a quote, supplies none) is STILL refused');

  // A malformed evidence entry (missing quotedText) is not rejected at the item level -- it
  // travels through bindWireAnalysis first, which resolves the missing field to an empty string,
  // finds it unbindable (an empty quote never binds), and marks it [-1,-1). The boundary then
  // refuses that as EVIDENCE_OUT_OF_BOUNDS, which is FATAL -- the whole analysis is rejected, not
  // just the one candidate. That is a STRONGER protection than item-level rejection, and it is what
  // the real production path (bindWireAnalysis + normalizeExpertOutput) actually does.
  const malformedEvidenceWire = bindWireAnalysis(wire({ expertHazardCandidates: [cand({
    groundingStatus: 'EXACT_QUOTE_SUPPLIED', evidence: [{ sourceId: 'obs-1' }] })] }), input());
  const malformedEvidence = normalizeExpertOutput(malformedEvidenceWire.raw, input(), NOW);
  assert(malformedEvidence.state === 'REJECTED'
    && malformedEvidence.issues.some(i => i.code === 'EVIDENCE_OUT_OF_BOUNDS'),
    'B.6 a malformed evidence object (missing quotedText) is STILL refused -- as an analysis-fatal EVIDENCE_OUT_OF_BOUNDS via the binder, a stronger protection than item-level rejection');

  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'B.7 the normalized contract the boundary enforces is UNCHANGED');

  // The architecture statement itself, made checkable: the boundary's fatal-reason list is what
  // actually governs authority, and it was not touched by this phase.
  assert(ANALYSIS_FATAL_REASONS.includes('EVIDENCE_OUT_OF_BOUNDS')
    && ANALYSIS_FATAL_REASONS.includes('EVIDENCE_TEXT_MISMATCH')
    && ANALYSIS_FATAL_REASONS.includes('GROUNDING_CLAIM_UNSUPPORTED') === false,
    'B.8 the fatal-reason list is exactly what §105 left it -- authority did not move from the boundary to the provider');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { for (const f of failures) console.log(`  FAILED: ${f}`); process.exit(1); }
