/**
 * §231 ASSEMBLY. The one assembly path for the frozen §230 acceptance cohort, both legs.
 *
 * It is a transcription of `expert-228b-assembly.ts` onto the §230 cases: the same modules, the
 * same order, the same payload construction. Nothing about the frozen instrument is reinterpreted
 * here — this file only builds the bytes the executor transmits.
 *
 * ZERO semantic authorship. No case, truth, expectation or threshold is read, altered or inferred.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
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
import { ACCEPTANCE_CASES_230, type AcceptanceCase230 }
  from './expert-230-final-acceptance-instrument';

export const ASSEMBLY_231_VERSION = 'hazlenz.expert.231.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

export function analysisIdFor230(caseId: string): string { return `ANL-230-${caseId}`; }
export function observationSourceIdFor230(caseId: string): string { return `OBS-230-${caseId}`; }

export interface AssembledFirstPass231 {
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

export function assembleFirstPass231(): readonly AssembledFirstPass231[] {
  return ACCEPTANCE_CASES_230.map((x, i) => {
    const observationSourceId = observationSourceIdFor230(x.caseId);
    const analysisId = analysisIdFor230(x.caseId);
    const governedRecords: readonly VNextGovernedEvidenceRecord[] =
      x.governedRecords.map(g => ({ sourceId: g.sourceId, text: g.approvedText }));

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
    const systemPrompt = build226SystemPrompt(governedRecords.length);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
    const wireSchema = buildExpert210jWireSchema(input, binding);

    return {
      ordinal: i + 1,
      caseId: x.caseId,
      contractVersion: FIRST_PASS_CONTRACT_226_VERSION,
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

// ---------------------------------------------------------------- verifier leg

export interface AssembledVerifier231 {
  readonly caseId: string;
  readonly declarationId: string;
  readonly factKey: string;
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly toolBlock: { name: string; description: string; input_schema: unknown };
  readonly identities: {
    readonly instruction: string; readonly userPrompt: string; readonly schema: string;
  };
}

export interface VerifierAssemblyResult231 {
  readonly built: readonly AssembledVerifier231[];
  readonly refused: readonly { declarationId: string; reason: string }[];
  readonly projectionCodes: readonly { declarationId: string; codes: readonly string[] }[];
  readonly admittedFacts: readonly unknown[];
}

/**
 * Project the first-pass output and build the verifier request for the FIRST admitted declaration.
 *
 * The §218 contract reviews ONE target per request and §230 books exactly one verifier call per
 * verifier-bearing case, so where a case admits more than one declaration the first is the target
 * and the rest are siblings the verifier must not wander into. That is the frozen design.
 */
export function assembleVerifierFor231(
  caseId: string, firstPassOutput: Record<string, unknown>,
): VerifierAssemblyResult231 {
  const c = ACCEPTANCE_CASES_230.find(x => x.caseId === caseId) as AcceptanceCase230;
  const observationSourceId = observationSourceIdFor230(caseId);

  const rawDeclarations =
    (firstPassOutput.unresolvedFactDeclarations ?? []) as Record<string, unknown>[];
  const rawClarifications =
    (firstPassOutput.decisionCriticalClarifications
      ?? firstPassOutput.clarifications ?? []) as Record<string, unknown>[];

  if (!Array.isArray(rawDeclarations)) {
    return { built: [], refused: [{ declarationId: '(field)', reason: 'DECLARATIONS_NOT_AN_ARRAY' }],
      projectionCodes: [], admittedFacts: [] };
  }

  const adapted = rawDeclarations.map(d => ({ ...d, observationSourceId }));
  const proj = project210jDeclarations({
    declarations: adapted as unknown as readonly unknown[],
    sources: [{ sourceId: observationSourceId, text: c.observation }],
    suppliedGovernedSourceIds: c.governedRecords.map(g => g.sourceId),
    stage: 'FIRST_PASS_MODEL',
  });

  const built: AssembledVerifier231[] = [];
  const refused: { declarationId: string; reason: string }[] = [];
  const projectionCodes: { declarationId: string; codes: readonly string[] }[] = [];
  const admittedFacts: unknown[] = [];
  const rowDeclarationIds = rawDeclarations.map(d => String(d.declarationId ?? ''));

  proj.projection.perDeclaration.forEach((per, idx) => {
    const declarationId = rowDeclarationIds[idx] ?? `(index ${idx})`;
    projectionCodes.push({ declarationId, codes: per.codes });
    if (!per.admitted || per.owedFact === null) {
      refused.push({ declarationId, reason: per.codes.join(',') || 'NOT_ADMITTED' });
      return;
    }
    admittedFacts.push(per.owedFact);
    if (built.length > 0) return; // one target per §218 request

    const decisions = isolateClarifications(
      rawClarifications.map(q => ({
        clarificationId: String(q.clarificationId ?? ''),
        question: String(q.question ?? ''),
        affectedDecision: String(q.affectedDecision ?? ''),
        answersUnresolvedFactDeclarationId: String(q.answersUnresolvedFactDeclarationId ?? ''),
      })),
      declarationId, rowDeclarationIds);
    const retained = decisions.filter(x => x.retained);
    const bound = rawClarifications.find(q =>
      String(q.answersUnresolvedFactDeclarationId ?? '') === declarationId);

    const request = buildVerifier212Request({
      fact: per.owedFact,
      declaration: adapted[idx] as unknown as Record<string, unknown>,
      unresolvedActionByFactKey: proj.unresolvedActionByFactKey,
      boundClarification: bound === undefined ? null : String(bound.question ?? ''),
    });
    if (!request.built || request.payload === null) {
      refused.push({ declarationId, reason: `REQUEST_REFUSED:${request.refusedBecause.join(',')}` });
      return;
    }

    const base = buildVerifierV3UserPrompt({
      caseId: c.caseId,
      observation: c.observation,
      jurisdiction: c.jurisdiction,
      governedEvidence: c.governedRecords.map(g => ({
        sourceId: g.sourceId, citation: g.citation, title: g.title, approvedText: g.approvedText,
      })),
      deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
      firstPass: {
        candidates: [],
        clarifications: retained.map(x => ({
          clarificationId: String(x.item.clarificationId),
          question: String(x.item.question),
          affectedDecision: String(x.item.affectedDecision),
        })),
        uncertainty: [],
        summary: '',
      },
      owedFacts: [{
        factKey: request.payload.targetFactKey,
        affectedDecision: per.owedFact.affectedDecision,
        whyUnresolved: String(request.payload.notEstablishedBecause ?? ''),
        branchA: request.payload.branchA,
        branchB: request.payload.branchB,
        decisionDivergence: { ifA: request.payload.decisionIfA, ifB: request.payload.decisionIfB },
        evidenceSpan: per.owedFact.evidenceSpan,
      }],
    });
    const userPrompt = appendVerifier212Block(base, request.payload);

    built.push({
      caseId: c.caseId,
      declarationId,
      factKey: request.payload.targetFactKey,
      systemPrompt: EXPERT_VERIFIER_218_SYSTEM_PROMPT,
      userPrompt,
      toolBlock: {
        name: VERIFIER_TOOL_NAME,
        description: VERIFIER_TOOL_DESCRIPTION,
        input_schema: VERIFIER_218_RESPONSE_SCHEMA,
      },
      identities: {
        instruction: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
        userPrompt: sha(userPrompt),
        schema: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
      },
    });
  });

  return { built, refused, projectionCodes, admittedFacts };
}
