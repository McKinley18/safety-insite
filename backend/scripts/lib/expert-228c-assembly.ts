/**
 * §228C ASSEMBLY. The single KR-1 case, both legs, through the same modules §228B used.
 * Nothing about the contract, the prompt or the schema differs.
 */
import { createHash } from 'crypto';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, governedBindingFor, type VNextGovernedEvidenceRecord,
} from './expert-first-pass-instruction-vnext';
import { buildExpert210jWireSchema } from './expert-210j-first-pass-contract';
import {
  FIRST_PASS_CONTRACT_226_VERSION, build226SystemPrompt,
} from './expert-226-property-selection-capability';
import { project210jDeclarations } from './expert-210j-declaration-projection';
import { isolateClarifications } from './section-210b-verifier-payload';
import { buildVerifier212Request, appendVerifier212Block } from './expert-212-verifier-payload';
import { buildVerifierV3UserPrompt } from './expert-verifier-instruction-v3';
import { VERIFIER_TOOL_NAME, VERIFIER_TOOL_DESCRIPTION } from './expert-208b-verifier-recovery';
import { VERIFIER_218_RESPONSE_SCHEMA } from './expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './expert-218-property-instruction';
import { KR1_CASE_228C } from './expert-228c-kr1-instrument';

export const ASSEMBLY_228C_VERSION = 'hazlenz.expert.228c.assembly.v1' as const;
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

export const ANALYSIS_ID_228C = `ANL-228C-${KR1_CASE_228C.caseId}`;
export const OBSERVATION_SOURCE_ID_228C = `OBS-228C-${KR1_CASE_228C.caseId}`;

export function assembleFirstPass228C(): {
  caseId: string; contractVersion: string; analysisId: string; observationSourceId: string;
  input: ExpertAnalysisInput; systemPrompt: string; userPrompt: string;
  wireSchema: Record<string, unknown>;
  identities: { systemPrompt: string; userPrompt: string; wireSchema: string };
} {
  const governedRecords: readonly VNextGovernedEvidenceRecord[] = [];
  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: ANALYSIS_ID_228C,
    authoritativeSources: [{
      sourceId: OBSERVATION_SOURCE_ID_228C, sourceType: 'observation',
      text: KR1_CASE_228C.observation,
    }],
    inspectionContext: {
      location: KR1_CASE_228C.suppliedContext.location,
      task: KR1_CASE_228C.suppliedContext.task,
    },
    jurisdiction: KR1_CASE_228C.jurisdiction,
    allowedHazardFamilies: [...KR1_CASE_228C.hazardFamilies],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  };
  const binding = governedBindingFor(governedRecords);
  const systemPrompt = build226SystemPrompt(0);
  const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
  const wireSchema = buildExpert210jWireSchema(input, binding);
  return {
    caseId: KR1_CASE_228C.caseId, contractVersion: FIRST_PASS_CONTRACT_226_VERSION,
    analysisId: ANALYSIS_ID_228C, observationSourceId: OBSERVATION_SOURCE_ID_228C,
    input, systemPrompt, userPrompt, wireSchema,
    identities: {
      systemPrompt: sha(systemPrompt), userPrompt: sha(userPrompt),
      wireSchema: sha(JSON.stringify(wireSchema)),
    },
  };
}

export function assembleVerifier228C(firstPassOutput: Record<string, unknown>): {
  built: { declarationId: string; factKey: string; systemPrompt: string; userPrompt: string;
    toolBlock: { name: string; description: string; input_schema: unknown };
    identities: { instruction: string; userPrompt: string; schema: string } } | null;
  refused: readonly { declarationId: string; reason: string }[];
  projectionCodes: readonly { declarationId: string; codes: readonly string[] }[];
  admittedCount: number;
} {
  const raw = firstPassOutput.unresolvedFactDeclarations;
  if (!Array.isArray(raw)) {
    return { built: null, admittedCount: 0, projectionCodes: [],
      refused: [{ declarationId: '(field)', reason: `DECLARATIONS_SHAPE_${raw === undefined
        || raw === null ? 'ABSENT' : typeof raw === 'string' ? 'STRING' : 'OTHER'}` }] };
  }
  const decls = raw as Record<string, unknown>[];
  const clars = (firstPassOutput.decisionCriticalClarifications
    ?? firstPassOutput.clarifications ?? []) as Record<string, unknown>[];
  const adapted = decls.map(d => ({ ...d, observationSourceId: OBSERVATION_SOURCE_ID_228C }));
  const proj = project210jDeclarations({
    declarations: adapted as unknown as readonly unknown[],
    sources: [{ sourceId: OBSERVATION_SOURCE_ID_228C, text: KR1_CASE_228C.observation }],
    suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  });
  const ids = decls.map(d => String(d.declarationId ?? ''));
  const projectionCodes: { declarationId: string; codes: readonly string[] }[] = [];
  const refused: { declarationId: string; reason: string }[] = [];
  let built: ReturnType<typeof assembleVerifier228C>['built'] = null;
  let admittedCount = 0;

  proj.projection.perDeclaration.forEach((per, i) => {
    const declarationId = ids[i] ?? `(index ${i})`;
    projectionCodes.push({ declarationId, codes: per.codes });
    if (!per.admitted || per.owedFact === null) {
      refused.push({ declarationId, reason: per.codes.join(',') || 'NOT_ADMITTED' });
      return;
    }
    admittedCount += 1;
    if (built !== null) return;
    const decisions = isolateClarifications(clars.map(q => ({
      clarificationId: String(q.clarificationId ?? ''), question: String(q.question ?? ''),
      affectedDecision: String(q.affectedDecision ?? ''),
      answersUnresolvedFactDeclarationId: String(q.answersUnresolvedFactDeclarationId ?? ''),
    })), declarationId, ids);
    const retained = decisions.filter(x => x.retained);
    const bound = clars.find(q =>
      String(q.answersUnresolvedFactDeclarationId ?? '') === declarationId);
    const request = buildVerifier212Request({
      fact: per.owedFact, declaration: adapted[i] as unknown as Record<string, unknown>,
      unresolvedActionByFactKey: proj.unresolvedActionByFactKey,
      boundClarification: bound === undefined ? null : String(bound.question ?? ''),
    });
    if (!request.built || request.payload === null) {
      refused.push({ declarationId, reason: `REQUEST_REFUSED:${request.refusedBecause.join(',')}` });
      return;
    }
    const base = buildVerifierV3UserPrompt({
      caseId: KR1_CASE_228C.caseId, observation: KR1_CASE_228C.observation,
      jurisdiction: KR1_CASE_228C.jurisdiction, governedEvidence: [],
      deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
      firstPass: {
        candidates: [],
        clarifications: retained.map(x => ({
          clarificationId: String(x.item.clarificationId), question: String(x.item.question),
          affectedDecision: String(x.item.affectedDecision),
        })),
        uncertainty: [], summary: '',
      },
      owedFacts: [{
        factKey: request.payload.targetFactKey,
        affectedDecision: per.owedFact.affectedDecision,
        whyUnresolved: String(request.payload.notEstablishedBecause ?? ''),
        branchA: request.payload.branchA, branchB: request.payload.branchB,
        decisionDivergence: { ifA: request.payload.decisionIfA, ifB: request.payload.decisionIfB },
        evidenceSpan: per.owedFact.evidenceSpan,
      }],
    });
    const userPrompt = appendVerifier212Block(base, request.payload);
    built = {
      declarationId, factKey: request.payload.targetFactKey,
      systemPrompt: EXPERT_VERIFIER_218_SYSTEM_PROMPT, userPrompt,
      toolBlock: { name: VERIFIER_TOOL_NAME, description: VERIFIER_TOOL_DESCRIPTION,
        input_schema: VERIFIER_218_RESPONSE_SCHEMA },
      identities: {
        instruction: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT), userPrompt: sha(userPrompt),
        schema: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
      },
    };
  });
  return { built, refused, projectionCodes, admittedCount };
}
