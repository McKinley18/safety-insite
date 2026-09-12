/**
 * §221 -- THE ONE ASSEMBLY PATH. PHASE A AND PHASE B BOTH CALL THIS.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The discipline §215, §217 and §219 each used: the validation suite and the executor call this
 * module, so the bytes inspected before the freeze are the bytes transmitted after it.
 *
 * TWO LEGS, both assembled from components already frozen elsewhere and none of them modified here:
 *
 *   FIRST PASS   §210J instruction and §210J wire schema, over the §210G/vNext base
 *   VERIFIER     §218 instruction and §218 response schema, over the §212 payload
 *
 * The verifier leg cannot be assembled before execution because it consumes the first pass's own
 * declarations. It is therefore built at execution time from the persisted first-pass output, by
 * this same module, and its identities are recorded per call rather than frozen per call. The
 * INSTRUCTION and SCHEMA identities for that leg ARE frozen, and the freeze pins them.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  type VNextGovernedEvidenceRecord, buildExpertVNextUserPrompt, governedBindingFor,
} from './expert-first-pass-instruction-vnext';
import {
  build210jSystemPrompt, buildExpert210jWireSchema,
} from './expert-210j-first-pass-contract';
import { project210jDeclarations } from './expert-210j-declaration-projection';
import { isolateClarifications } from './section-210b-verifier-payload';
import {
  type VerifierRequest212, buildVerifier212Request, appendVerifier212Block,
} from './expert-212-verifier-payload';
import { buildVerifierV3UserPrompt } from './expert-verifier-instruction-v3';
import { VERIFIER_TOOL_NAME, VERIFIER_TOOL_DESCRIPTION } from './expert-208b-verifier-recovery';
import { VERIFIER_218_RESPONSE_SCHEMA } from './expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './expert-218-property-instruction';
import {
  type IntegratedCase221, INTEGRATED_CASES_221, EXECUTION_ORDER_221,
} from './expert-221-integrated-instrument';

export const ASSEMBLY_221_VERSION = 'hazlenz.expert.221.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export const ADAPTER_SUPPLIES_221: readonly string[] = ['analysisId', 'observationSourceId'];

// ---------------------------------------------------------------- first-pass leg

export interface AssembledFirstPass221 {
  readonly ordinal: number;
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

export function analysisIdFor(caseId: string): string {
  return `AN-221-${caseId}`;
}

export function observationSourceIdFor(caseId: string): string {
  return `OBS-${caseId}`;
}

function governedRecordsFor(c: IntegratedCase221): readonly VNextGovernedEvidenceRecord[] {
  return c.governedEvidence.map(g => ({
    sourceId: g.sourceId,
    text: `${g.citation} — ${g.title}: ${g.approvedText}`,
  }));
}

export function assembleFirstPass221(): readonly AssembledFirstPass221[] {
  return EXECUTION_ORDER_221.map((step, i) => {
    const c = INTEGRATED_CASES_221.find(x => x.caseId === step.caseId) as IntegratedCase221;
    const observationSourceId = observationSourceIdFor(c.caseId);
    const analysisId = analysisIdFor(c.caseId);
    const governedRecords = governedRecordsFor(c);

    const input: ExpertAnalysisInput = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId,
      authoritativeSources: [
        { sourceId: observationSourceId, sourceType: 'observation', text: c.observation },
      ],
      inspectionContext: { location: c.suppliedContext.location, task: c.suppliedContext.task },
      jurisdiction: c.jurisdiction,
      allowedHazardFamilies: [...c.hazardFamilies],
      deterministicFindings: [],
      governedStandards: c.governedEvidence.map(g => ({
        citation: g.citation,
        title: g.title,
        approvedText: g.approvedText,
        backingState: g.backingState,
      })),
      answeredClarifications: [],
    };

    const binding = governedBindingFor(governedRecords);
    const wireSchema = buildExpert210jWireSchema(input, binding);
    const systemPrompt = build210jSystemPrompt(governedRecords.length);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);

    return {
      ordinal: i + 1,
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

// ---------------------------------------------------------------- verifier leg

export interface AssembledVerifier221 {
  readonly caseId: string;
  readonly declarationId: string;
  readonly factKey: string;
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly toolBlock: Record<string, unknown>;
  readonly request: VerifierRequest212;
  readonly retainedClarificationIds: readonly string[];
  readonly excludedClarificationIds: readonly string[];
  readonly identities: {
    readonly instruction: string; readonly userPrompt: string; readonly schema: string;
  };
}

export interface VerifierAssemblyResult221 {
  readonly built: readonly AssembledVerifier221[];
  readonly refused: readonly { declarationId: string; reason: string }[];
  /** Every projection code, per declaration, recorded whether or not it was admitted. */
  readonly projectionCodes: readonly { declarationId: string; codes: readonly string[] }[];
}

/**
 * Build the verifier leg from ONE first-pass output, exactly as the product would.
 *
 * The provider's declarations are passed through the REAL §210J projection. A declaration the
 * projection refuses does not get a verifier call and is recorded as refused -- it is not repaired,
 * and the identified property stays with the preservation path where RR-7 put it.
 */
export function assembleVerifierFor221(
  caseId: string,
  firstPassOutput: Record<string, unknown>,
): VerifierAssemblyResult221 {
  const c = INTEGRATED_CASES_221.find(x => x.caseId === caseId) as IntegratedCase221;
  const observationSourceId = observationSourceIdFor(caseId);

  const rawDeclarations =
    (firstPassOutput.unresolvedFactDeclarations ?? []) as Record<string, unknown>[];
  const rawClarifications =
    (firstPassOutput.clarifications ?? []) as Record<string, unknown>[];

  const adapted = rawDeclarations.map(d => ({ ...d, observationSourceId }));
  const proj = project210jDeclarations({
    declarations: adapted as unknown as readonly unknown[],
    sources: [{ sourceId: observationSourceId, text: c.observation }],
    suppliedGovernedSourceIds: c.governedEvidence.map(g => g.sourceId),
    stage: 'FIRST_PASS_MODEL',
  });

  const built: AssembledVerifier221[] = [];
  const refused: { declarationId: string; reason: string }[] = [];
  const projectionCodes: { declarationId: string; codes: readonly string[] }[] = [];

  const rowDeclarationIds = rawDeclarations.map(d => String(d.declarationId ?? ''));

  proj.projection.perDeclaration.forEach((per, idx) => {
    const declarationId = rowDeclarationIds[idx] ?? `(index ${idx})`;
    projectionCodes.push({ declarationId, codes: per.codes });
    if (!per.admitted || per.owedFact === null) {
      refused.push({ declarationId, reason: per.codes.join(',') || 'NOT_ADMITTED' });
      return;
    }

    const decisions = isolateClarifications(
      rawClarifications.map(q => ({
        clarificationId: String(q.clarificationId ?? ''),
        question: String(q.question ?? ''),
        affectedDecision: String(q.affectedDecision ?? ''),
        answersUnresolvedFactDeclarationId:
          String(q.answersUnresolvedFactDeclarationId ?? ''),
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
      governedEvidence: c.governedEvidence.map(g => ({
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
      request,
      retainedClarificationIds: retained.map(x => x.id),
      excludedClarificationIds: decisions.filter(x => !x.retained).map(x => x.id),
      identities: {
        instruction: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
        userPrompt: sha(userPrompt),
        schema: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
      },
    });
  });

  return { built, refused, projectionCodes };
}

/** The identities frozen for the verifier leg, which do not depend on any provider output. */
export function verifierLegIdentities221(): { instruction: string; schema: string } {
  return {
    instruction: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
    schema: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
  };
}

export { sha as sha256Of };
