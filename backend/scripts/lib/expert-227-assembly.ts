/**
 * §227 -- THE ONE ASSEMBLY PATH. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The discipline §215, §217, §219, §221 and §225 each used: the preflight, the freeze and the
 * executor all call this module, so the bytes inspected before the freeze are the bytes transmitted
 * after it.
 *
 * SINGLE ARM. §227 is a capability confirmation, not a comparison. There is one system prompt --
 * the §226 successor -- and no predecessor leg. §225 already established causality on a paired
 * instrument; re-purchasing it here would spend eight calls to answer a question that is already
 * answered.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  type VNextGovernedEvidenceRecord, buildExpertVNextUserPrompt, governedBindingFor,
} from './expert-first-pass-instruction-vnext';
import { buildExpert210jWireSchema } from './expert-210j-first-pass-contract';
import {
  build226SystemPrompt, FIRST_PASS_CONTRACT_226_VERSION,
} from './expert-226-property-selection-capability';
import { type Arm227, ARM_227, HOSTED_CASES_227 } from './expert-227-hosted-instrument';

export const ASSEMBLY_227_VERSION = 'hazlenz.expert.227.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export const ADAPTER_SUPPLIES_227: readonly string[] = ['analysisId', 'observationSourceId'];

export function analysisIdFor227(caseId: string): string {
  return `ANL-227-${caseId}`;
}
export function observationSourceIdFor227(caseId: string): string {
  return `OBS-227-${caseId}`;
}

export interface AssembledCall227 {
  readonly ordinal: number;
  readonly arm: Arm227;
  readonly contractVersion: string;
  readonly caseId: string;
  readonly analysisId: string;
  readonly observationSourceId: string;
  readonly input: ExpertAnalysisInput;
  readonly governedRecords: readonly VNextGovernedEvidenceRecord[];
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly wireSchema: Record<string, unknown>;
  readonly identities: {
    readonly instruction: string; readonly userPrompt: string; readonly schema: string;
  };
}

/**
 * No governed regulatory record is supplied to any §227 case, exactly as in §225. The frozen
 * question is first-pass declaration recall and controlling-property selection; supplying a
 * governed record would introduce the grounding boundary as a second variable. Recorded here so the
 * absence is a decision, not an omission.
 */
export const NO_GOVERNED_RECORDS_SUPPLIED_227 = {
  supplied: 0,
  reason: 'the frozen question is first-pass declaration recall and controlling-property selection. '
    + 'A supplied governed record would add the grounding boundary as a second variable and is not '
    + 'needed to answer it. §225 made the same decision, so the two runs are comparable in posture.',
} as const;

export function assemble227(): readonly AssembledCall227[] {
  return HOSTED_CASES_227.map((c, i) => {
    const observationSourceId = observationSourceIdFor227(c.caseId);
    const analysisId = analysisIdFor227(c.caseId);
    const governedRecords: readonly VNextGovernedEvidenceRecord[] = [];

    const input: ExpertAnalysisInput = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId,
      authoritativeSources: [{
        sourceId: observationSourceId,
        sourceType: 'observation',
        text: c.authoredIn227.observation,
      }],
      inspectionContext: {
        location: c.authoredIn227.suppliedContext.location,
        task: c.authoredIn227.suppliedContext.task,
      },
      jurisdiction: c.authoredIn227.jurisdiction,
      allowedHazardFamilies: [...c.authoredIn227.hazardFamilies],
      deterministicFindings: [],
      governedStandards: [],
      answeredClarifications: [],
    };

    const binding = governedBindingFor(governedRecords);
    const wireSchema = buildExpert210jWireSchema(input, binding);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
    const systemPrompt = build226SystemPrompt(governedRecords.length);

    return {
      ordinal: i + 1,
      arm: ARM_227,
      contractVersion: FIRST_PASS_CONTRACT_226_VERSION,
      caseId: c.caseId,
      analysisId,
      observationSourceId,
      input,
      governedRecords,
      systemPrompt,
      userPrompt,
      wireSchema,
      identities: {
        instruction: sha(systemPrompt),
        userPrompt: sha(userPrompt),
        schema: sha(JSON.stringify(wireSchema)),
      },
    };
  });
}
