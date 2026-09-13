/**
 * §236 ASSEMBLY. The one assembly path for the frozen §236 confirmation cohort.
 *
 * SINGLE ARM. FIRST-PASS LEG ONLY. NO VERIFIER LEG. NO PAIRED ATTRIBUTION ARM.
 *
 * It is `expert-234-assembly.ts` with exactly two substitutions and nothing else:
 *
 *     build233SystemPrompt      ->  build235SystemPrompt
 *     buildExpert233WireSchema  ->  buildExpert235WireSchema
 *
 * That is the §235 wiring the authorization asks for. The user prompt, the input contract and the
 * governed binding are the same modules in the same order, so a difference in the result is
 * attributable to the stabilized contract and not to a rebuilt assembly path.
 *
 * The transmitted schema is CARRIED ON THE ASSEMBLED CALL, because §235 normalization accepts a
 * parse only against the schema that actually went out with that call.
 *
 * ZERO semantic authorship. No case, truth, expectation or threshold is read or inferred here.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, governedBindingFor, type VNextGovernedEvidenceRecord,
} from './expert-first-pass-instruction-vnext';
import {
  FIRST_PASS_CONTRACT_235_VERSION, build235SystemPrompt, buildExpert235WireSchema,
} from './expert-235-posture-contract';
import { CONFIRMATION_CASES_236 } from './expert-236-confirmation-instrument';

export const ASSEMBLY_236_VERSION = 'hazlenz.expert.236.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

export function analysisIdFor236(caseId: string): string { return `ANL-236-${caseId}`; }
export function observationSourceIdFor236(caseId: string): string { return `OBS-236-${caseId}`; }

export interface AssembledFirstPass236 {
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

export function assembleFirstPass236(): readonly AssembledFirstPass236[] {
  return CONFIRMATION_CASES_236.map((x, i) => {
    const observationSourceId = observationSourceIdFor236(x.caseId);
    const analysisId = analysisIdFor236(x.caseId);
    // §236 supplies no governed record on any case, as §234 did not. This cohort measures arrival
    // and posture, and grounding was measured by §231.
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
    const systemPrompt = build235SystemPrompt(governedRecords.length);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
    const wireSchema = buildExpert235WireSchema(input, binding);

    return {
      ordinal: i + 1,
      caseId: x.caseId,
      contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
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

export function assemblyIdentity236(): Record<string, unknown> {
  const a = assembleFirstPass236();
  return {
    assemblyVersion: ASSEMBLY_236_VERSION,
    contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
    arm: 'SINGLE',
    legs: ['FIRST_PASS'],
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
