/**
 * §225 -- THE ONE ASSEMBLY PATH FOR BOTH ARMS. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The discipline §215, §217, §219 and §221 each used: preflight and the executor call this module,
 * so the bytes inspected before the freeze are the bytes transmitted after it.
 *
 * BOTH ARMS ARE BUILT HERE, FROM THE SAME CASE. The observation, supplied context, jurisdiction,
 * hazard families, governed records, user prompt and wire schema are produced once and shared. Only
 * the system prompt differs: §210J for the predecessor arm, §224 for the remediated arm. That is
 * what makes the pairing a controlled comparison rather than two separate runs.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  type VNextGovernedEvidenceRecord, buildExpertVNextUserPrompt, governedBindingFor,
} from './expert-first-pass-instruction-vnext';
import {
  build210jSystemPrompt, buildExpert210jWireSchema, FIRST_PASS_CONTRACT_210J_VERSION,
} from './expert-210j-first-pass-contract';
import {
  build224SystemPrompt, FIRST_PASS_CONTRACT_224_VERSION,
} from './expert-224-declaration-capability';
import { type Arm225, HOSTED_CASES_225 } from './expert-225-hosted-instrument';

export const ASSEMBLY_225_VERSION = 'hazlenz.expert.225.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export const ADAPTER_SUPPLIES_225: readonly string[] = ['analysisId', 'observationSourceId'];

export function analysisIdFor(caseId: string): string {
  return `ANL-225-${caseId}`;
}
export function observationSourceIdFor(caseId: string): string {
  return `OBS-${caseId}`;
}

export interface AssembledCall225 {
  readonly ordinal: number;
  readonly arm: Arm225;
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
 * No governed regulatory record is supplied to any §225 case. The frozen question is about
 * declaration recall and property selection, and supplying a governed record would introduce the
 * grounding boundary as a second variable. Recorded here so the absence is a decision, not an
 * omission.
 */
export const NO_GOVERNED_RECORDS_SUPPLIED = {
  supplied: 0,
  reason: 'the frozen question is first-pass declaration recall and controlling-property selection. '
    + 'A supplied governed record would add the grounding boundary as a second variable and is not '
    + 'needed to answer it.',
} as const;

export function assembleArm225(arm: Arm225): readonly AssembledCall225[] {
  return HOSTED_CASES_225.map((c, i) => {
    const observationSourceId = observationSourceIdFor(c.caseId);
    const analysisId = analysisIdFor(c.caseId);
    const governedRecords: readonly VNextGovernedEvidenceRecord[] = [];

    const input: ExpertAnalysisInput = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId,
      authoritativeSources: [{
        sourceId: observationSourceId,
        sourceType: 'observation',
        text: c.authoredIn225.observation,
      }],
      inspectionContext: {
        location: c.authoredIn225.suppliedContext.location,
        task: c.authoredIn225.suppliedContext.task,
      },
      jurisdiction: c.authoredIn225.jurisdiction,
      allowedHazardFamilies: [...c.authoredIn225.hazardFamilies],
      deterministicFindings: [],
      governedStandards: [],
      answeredClarifications: [],
    };

    const binding = governedBindingFor(governedRecords);
    const wireSchema = buildExpert210jWireSchema(input, binding);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
    const systemPrompt = arm === 'REMEDIATED_224'
      ? build224SystemPrompt(governedRecords.length)
      : build210jSystemPrompt(governedRecords.length);

    return {
      ordinal: i + 1,
      arm,
      contractVersion: arm === 'REMEDIATED_224'
        ? FIRST_PASS_CONTRACT_224_VERSION : FIRST_PASS_CONTRACT_210J_VERSION,
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
