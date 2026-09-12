/**
 * §210B-3 -- THE EIGHT FROZEN PROBE REQUESTS, BUILT ONCE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The cache preflight and the §210B-3B executor must build byte-identical requests, or the
 * preflight's finding would not be about the requests that were actually sent. Both import from
 * here so there is one construction path and no opportunity for them to drift apart.
 *
 * ==================== WHY PB-02 CARRIES GOVERNED EVIDENCE IN THE FIRST PASS ====================
 *
 * §208's first pass is capability-ABSENT on every case: the governed relation crosses on its own
 * later call. §210B-3A deliberately differs, and says so in `executionPlan`:
 * `governedEvidenceSuppliedInFirstPass: ["PB-02"]`. PB-02 targets S6 -- A REQUIREMENT IS NOT AN
 * OBSERVATION -- which cannot be exercised at all unless the first pass can see a governed record
 * whose requirement it might mistake for a description of this machine. The §208 guard that refuses
 * any first-pass request containing `governedEvidenceSourceIds` is therefore NOT carried forward
 * unchanged; it is replaced by an exact-set guard below, which is stricter for the other seven
 * cases and correct for PB-02.
 */

import {
  EXPERT_TOOL_NAME, applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, buildExpertVNextWireSchema, governedBindingFor,
} from './expert-first-pass-instruction-vnext';
import { build210b2SystemPrompt } from './expert-first-pass-instruction-210b2';
import { PROBE_STIMULI } from './section-210b3-probe-preregistration';

export interface ProbeGovernedRecord { sourceId: string; text: string }

export interface ProbeCase {
  caseId: string;
  input: ExpertAnalysisInput;
  governedRecords: readonly ProbeGovernedRecord[];
  systemPrompt: string;
  userPrompt: string;
  canonicalSchema: Record<string, unknown>;
  schemaAsSent: unknown;
  expectedDeclarationCount: number;
}

export function buildProbeCase(s: (typeof PROBE_STIMULI)[number]): ProbeCase {
  const governedRecords = s.governedEvidence.map(r => ({ sourceId: r.sourceId, text: r.text }));
  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `AN-210B3A-${s.caseId}`,
    authoritativeSources: [
      { sourceId: `OBS-${s.caseId}`, sourceType: 'observation', text: s.observation },
    ],
    inspectionContext: { location: s.suppliedContext.location, task: s.suppliedContext.task },
    jurisdiction: s.jurisdiction,
    allowedHazardFamilies: [...s.hazardFamilies],
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
  };
  const binding = governedBindingFor(governedRecords);
  const canonicalSchema = buildExpertVNextWireSchema(input, binding);
  return {
    caseId: s.caseId,
    input,
    governedRecords,
    systemPrompt: build210b2SystemPrompt(governedRecords.length),
    userPrompt: buildExpertVNextUserPrompt(input, governedRecords),
    canonicalSchema,
    schemaAsSent: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(canonicalSchema)),
    expectedDeclarationCount: s.expectedDeclarationCount,
  };
}

export const PROBE_CASES: readonly ProbeCase[] = PROBE_STIMULI.map(buildProbeCase);

/** The tool block exactly as it is transmitted. No `cache_control` is ever added to it. */
export function toolBlockFor(c: ProbeCase): Record<string, unknown> {
  return {
    name: EXPERT_TOOL_NAME,
    description: 'Emit the structured result. This is the ONLY way to answer.',
    strict: true,
    input_schema: c.schemaAsSent,
  };
}

/**
 * The frozen governed-evidence set, by case. Anything else in a request body is a construction
 * defect, and the executor refuses to transmit rather than discovering it in the output.
 */
export const FROZEN_GOVERNED_SOURCE_IDS: Readonly<Record<string, readonly string[]>> = {
  'PB-01': [], 'PB-02': ['GOV-SE-11'], 'PB-03': [], 'PB-04': [],
  'PB-05': [], 'PB-06': [], 'PB-07': [], 'PB-08': [],
};
