/**
 * §238 ASSEMBLY. The one assembly path for the frozen §238 final confirmation cohort.
 *
 * SINGLE ARM. FIRST-PASS LEG ONLY. NO VERIFIER LEG. NO PAIRED ATTRIBUTION ARM.
 *
 * It is `expert-236-assembly.ts` with exactly two substitutions and nothing else:
 *
 *     build235SystemPrompt      ->  build237SystemPrompt
 *     buildExpert235WireSchema  ->  buildExpert237WireSchema
 *
 * The user prompt, the input contract and the governed binding are the same modules in the same
 * order, so a difference in the result is attributable to the closed contract and not to a rebuilt
 * assembly path. The transmitted schema is carried on the assembled call, because §235 normalization
 * accepts a parse only against the schema that actually went out with that call.
 *
 * ZERO semantic authorship. No case, truth, expectation or threshold is read or inferred here.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, governedBindingFor, type VNextGovernedEvidenceRecord,
} from './expert-first-pass-instruction-vnext';
import {
  FIRST_PASS_CONTRACT_237_VERSION, build237SystemPrompt, buildExpert237WireSchema,
} from './expert-237-posture-contract';
import { CONFIRMATION_CASES_238 } from './expert-238-confirmation-instrument';

export const ASSEMBLY_238_VERSION = 'hazlenz.expert.238.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

export function analysisIdFor238(caseId: string): string { return `ANL-238-${caseId}`; }
export function observationSourceIdFor238(caseId: string): string { return `OBS-238-${caseId}`; }

export interface AssembledFirstPass238 {
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

export function assembleFirstPass238(): readonly AssembledFirstPass238[] {
  return CONFIRMATION_CASES_238.map((x, i) => {
    const observationSourceId = observationSourceIdFor238(x.caseId);
    const analysisId = analysisIdFor238(x.caseId);
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
    const systemPrompt = build237SystemPrompt(governedRecords.length);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
    const wireSchema = buildExpert237WireSchema(input, binding);

    return {
      ordinal: i + 1, caseId: x.caseId,
      contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
      analysisId, observationSourceId, input, governedRecords,
      systemPrompt, userPrompt, wireSchema,
      identities: {
        systemPrompt: sha(systemPrompt),
        userPrompt: sha(userPrompt),
        wireSchema: sha(JSON.stringify(wireSchema)),
      },
    };
  });
}

export function assemblyIdentity238(): Record<string, unknown> {
  const a = assembleFirstPass238();
  return {
    assemblyVersion: ASSEMBLY_238_VERSION,
    contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
    arm: 'SINGLE', legs: ['FIRST_PASS'],
    verifierLeg: 'NOT_ASSEMBLED_AND_NOT_AUTHORIZED',
    pairedAttributionArm: 'NOT_ASSEMBLED_AND_NOT_AUTHORIZED',
    caseCount: a.length,
    perCase: a.map(x => ({
      caseId: x.caseId, ordinal: x.ordinal, analysisId: x.analysisId,
      observationSourceId: x.observationSourceId,
      systemPromptDigest: x.identities.systemPrompt,
      userPromptDigest: x.identities.userPrompt,
      wireSchemaDigest: x.identities.wireSchema,
      governedRecordCount: x.governedRecords.length,
    })),
    systemPromptUniform: new Set(a.map(x => x.identities.systemPrompt)).size === 1,
  };
}
