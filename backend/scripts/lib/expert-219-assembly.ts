/**
 * §219 -- THE ONE ASSEMBLY PATH. PHASE A AND PHASE B BOTH CALL THIS.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Identical in discipline to §215's and §217's: the validation suite and the executor call this
 * module, so the bytes inspected before the freeze are the bytes transmitted after it. The only
 * mechanical adaptation is `observationSourceId`, supplied as `OBS-<caseId>`.
 *
 * TWO THINGS DIFFER FROM §217, AND ONLY TWO:
 *
 *   the instruction   §216 -> §218 (the §216 prompt plus the property-review block, additive)
 *   the tool schema   §212 -> §218 (the §212 schema plus one required top-level object, additive)
 *
 * The payload assembler, the §210J projection, the §210B-1 clarification isolation and the §214
 * sibling-scope rule are UNCHANGED. Nothing in §219 modifies a §212, §214, §216 or §218 module.
 */

import { createHash } from 'crypto';

import { buildVerifierV3UserPrompt } from './expert-verifier-instruction-v3';
import { isolateClarifications } from './section-210b-verifier-payload';
import { project210jDeclarations } from './expert-210j-declaration-projection';
import {
  type VerifierRequest212, buildVerifier212Request, appendVerifier212Block,
} from './expert-212-verifier-payload';
import { VERIFIER_TOOL_NAME, VERIFIER_TOOL_DESCRIPTION } from './expert-208b-verifier-recovery';
import { VERIFIER_218_RESPONSE_SCHEMA } from './expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './expert-218-property-instruction';
import {
  type ConfirmationCase219, type SuppliedDeclaration219,
  CONFIRMATION_CASES_219, EXECUTION_ORDER_219,
} from './expert-219-structured-confirmation-instrument';

export const ASSEMBLY_219_VERSION = 'hazlenz.expert.219.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export const ADAPTER_SUPPLIES_219: readonly string[] = ['observationSourceId'];

export const SEMANTIC_FIELDS_219: readonly (keyof SuppliedDeclaration219)[] = [
  'declarationId', 'missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
  'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'decisionWhileUnresolved', 'whyNecessaryNow',
];

export interface Assembled219 {
  readonly ordinal: number;
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

export interface AssemblyResult219 {
  readonly built: readonly Assembled219[];
  readonly failures: readonly { ordinal: number; caseId: string; reason: string }[];
}

export function assemble219(): AssemblyResult219 {
  const built: Assembled219[] = [];
  const failures: { ordinal: number; caseId: string; reason: string }[] = [];

  EXECUTION_ORDER_219.forEach((step, i) => {
    const ordinal = i + 1;
    const c = CONFIRMATION_CASES_219
      .find(x => x.caseId === step.caseId) as ConfirmationCase219;
    const idx = c.declarations.findIndex(dec => dec.declarationId === step.declarationId);
    if (idx === -1) {
      failures.push({ ordinal, caseId: step.caseId, reason: 'DECLARATION_NOT_IN_CASE' });
      return;
    }
    const dec = c.declarations[idx];
    for (const dd of c.declarations) {
      if (!c.observation.includes(dd.observationSpan)) {
        failures.push({
          ordinal, caseId: step.caseId, reason: `SPAN_NOT_VERBATIM:${dd.declarationId}`,
        });
        return;
      }
    }

    const adapted = c.declarations.map(dd => ({ ...dd, observationSourceId: `OBS-${c.caseId}` }));
    const proj = project210jDeclarations({
      declarations: adapted as unknown as readonly unknown[],
      sources: [{ sourceId: `OBS-${c.caseId}`, text: c.observation }],
      suppliedGovernedSourceIds: [],
      stage: 'FIRST_PASS_MODEL',
    });
    const per = proj.projection.perDeclaration[idx];
    if (!per.admitted || per.owedFact === null) {
      failures.push({
        ordinal, caseId: step.caseId, reason: `PROJECTION_REFUSED:${per.codes.join(',')}`,
      });
      return;
    }

    const rowDeclarationIds = c.declarations.map(x => x.declarationId);
    const decisions = isolateClarifications(
      c.clarifications.map(q => ({
        clarificationId: q.clarificationId, question: q.question,
        affectedDecision: q.affectedDecision,
        answersUnresolvedFactDeclarationId: q.boundToDeclarationId ?? '',
      })),
      dec.declarationId, rowDeclarationIds);
    const retained = decisions.filter(x => x.retained);
    const bound = c.clarifications.find(q => q.boundToDeclarationId === dec.declarationId);

    const request = buildVerifier212Request({
      fact: per.owedFact,
      declaration: adapted[idx] as unknown as Record<string, unknown>,
      unresolvedActionByFactKey: proj.unresolvedActionByFactKey,
      boundClarification: bound === undefined ? null : bound.question,
    });
    if (!request.built || request.payload === null) {
      failures.push({
        ordinal, caseId: step.caseId, reason: `REQUEST_REFUSED:${request.refusedBecause.join(',')}`,
      });
      return;
    }

    const base = buildVerifierV3UserPrompt({
      caseId: c.caseId,
      observation: c.observation,
      jurisdiction: c.jurisdiction,
      governedEvidence: [],
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
      ordinal,
      caseId: c.caseId,
      declarationId: dec.declarationId,
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

  return { built, failures };
}

export function semanticFieldsSurvive219(): boolean {
  return CONFIRMATION_CASES_219.every(c => c.declarations.every(dec => {
    const adapted = { ...dec, observationSourceId: `OBS-${c.caseId}` };
    return SEMANTIC_FIELDS_219.every(k => adapted[k] === dec[k]);
  }));
}

export { sha as sha256Of };
