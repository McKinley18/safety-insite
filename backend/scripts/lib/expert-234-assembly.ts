/**
 * §234 ASSEMBLY. The one assembly path for the frozen §234 posture-discrimination cohort.
 *
 * SINGLE ARM. FIRST-PASS LEG ONLY. NO VERIFIER LEG.
 *
 * This is `expert-231-assembly.ts` with exactly two substitutions, and nothing else:
 *
 *     build226SystemPrompt      ->  build233SystemPrompt
 *     buildExpert210jWireSchema ->  buildExpert233WireSchema
 *
 * That is the whole of the §233 wiring the hosted authorization asks for (§233 limitation L3). The
 * user prompt, the input contract, the governed binding and the payload construction are the same
 * modules in the same order, so a posture difference in the result is attributable to the posture
 * contract and not to a rebuilt assembly path.
 *
 * ZERO semantic authorship. No case, truth, expectation or threshold is read, altered or inferred
 * here. This file only builds the bytes the executor transmits.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, governedBindingFor, type VNextGovernedEvidenceRecord,
} from './expert-first-pass-instruction-vnext';
import {
  FIRST_PASS_CONTRACT_233_VERSION, build233SystemPrompt, buildExpert233WireSchema,
} from './expert-233-posture-contract';
import { POSTURE_CASES_234 } from './expert-234-posture-discrimination-instrument';

export const ASSEMBLY_234_VERSION = 'hazlenz.expert.234.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

export function analysisIdFor234(caseId: string): string { return `ANL-234-${caseId}`; }
export function observationSourceIdFor234(caseId: string): string { return `OBS-234-${caseId}`; }

export interface AssembledFirstPass234 {
  readonly ordinal: number;
  readonly caseId: string;
  readonly contractVersion: string;
  readonly analysisId: string;
  readonly observationSourceId: string;
  readonly input: ExpertAnalysisInput;
  readonly governedRecords: readonly VNextGovernedEvidenceRecord[];
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly wireSchema: Record<string, unknown>;
  readonly identities: {
    readonly systemPrompt: string; readonly userPrompt: string; readonly wireSchema: string;
  };
}

export function assembleFirstPass234(): readonly AssembledFirstPass234[] {
  return POSTURE_CASES_234.map((x, i) => {
    const observationSourceId = observationSourceIdFor234(x.caseId);
    const analysisId = analysisIdFor234(x.caseId);
    // §234 supplies no governed record on any case. Frozen before execution: this cohort measures
    // posture degree, and grounding was measured by §231. An empty binding is the §230 G1 shape.
    const governedRecords: readonly VNextGovernedEvidenceRecord[] = [];

    const input: ExpertAnalysisInput = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId,
      authoritativeSources: [{
        sourceId: observationSourceId, sourceType: 'observation', text: x.observation,
      }],
      inspectionContext: { location: x.suppliedContext.location, task: x.suppliedContext.task },
      jurisdiction: x.jurisdiction,
      allowedHazardFamilies: [...x.hazardFamilies],
      deterministicFindings: [],
      governedStandards: [],
      answeredClarifications: [],
    };

    const binding = governedBindingFor(governedRecords);
    const systemPrompt = build233SystemPrompt(governedRecords.length);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
    const wireSchema = buildExpert233WireSchema(input, binding);

    return {
      ordinal: i + 1,
      caseId: x.caseId,
      contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
      analysisId,
      observationSourceId,
      input,
      governedRecords,
      systemPrompt,
      userPrompt,
      wireSchema,
      identities: {
        systemPrompt: sha(systemPrompt),
        userPrompt: sha(userPrompt),
        wireSchema: sha(JSON.stringify(wireSchema)),
      },
    };
  });
}

/** Assembly identity for the pre-spend freeze. */
export function assemblyIdentity234(): Record<string, unknown> {
  const a = assembleFirstPass234();
  return {
    assemblyVersion: ASSEMBLY_234_VERSION,
    contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
    arm: 'SINGLE',
    legs: ['FIRST_PASS'],
    verifierLeg: 'NOT_ASSEMBLED_AND_NOT_AUTHORIZED',
    caseCount: a.length,
    perCase: a.map(x => ({
      caseId: x.caseId, ordinal: x.ordinal, analysisId: x.analysisId,
      observationSourceId: x.observationSourceId,
      systemPromptDigest: x.identities.systemPrompt,
      userPromptDigest: x.identities.userPrompt,
      wireSchemaDigest: x.identities.wireSchema,
      governedRecordCount: x.governedRecords.length,
    })),
    // Every case transmits the same system prompt and the same schema; only the observation differs.
    systemPromptUniform: new Set(a.map(x => x.identities.systemPrompt)).size === 1,
    wireSchemaUniform: new Set(a.map(x => x.identities.wireSchema)).size === 1,
  };
}
