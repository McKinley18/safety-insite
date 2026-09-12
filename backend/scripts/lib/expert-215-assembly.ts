/**
 * §215 -- THE ONE ASSEMBLY PATH. PHASE A AND PHASE B BOTH CALL THIS.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §208B's lesson: when a preflight inspects one object and an executor transmits another, the
 * inspection certifies the wrong bytes. So the validation suite and the executor call this module
 * and there is one path.
 *
 * The mechanical adaptation is the §212 one, unchanged: a §215 declaration carries the twelve
 * semantic fields and no `observationSourceId`, and the adapter supplies `OBS-<caseId>` and nothing
 * else. Every semantic string is copied.
 */

import { createHash } from 'crypto';

import { buildVerifierV3UserPrompt } from './expert-verifier-instruction-v3';
import { isolateClarifications } from './section-210b-verifier-payload';
import { project210jDeclarations } from './expert-210j-declaration-projection';
import {
  type VerifierRequest212, buildVerifier212Request, appendVerifier212Block,
} from './expert-212-verifier-payload';
import { VERIFIER_212_RESPONSE_SCHEMA } from './expert-212-verifier-protocol';
import { EXPERT_VERIFIER_214_SYSTEM_PROMPT } from './expert-214-verifier-semantic-remediation';
import { VERIFIER_TOOL_NAME, VERIFIER_TOOL_DESCRIPTION } from './expert-208b-verifier-recovery';
import {
  type ConfirmationCase215, type SuppliedDeclaration215,
  CONFIRMATION_CASES_215, EXECUTION_ORDER,
} from './expert-215-confirmation-instrument';

export const ASSEMBLY_215_VERSION = 'hazlenz.expert.215.assembly.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** The single mechanical field the adapter supplies. Nothing else is added. */
export const ADAPTER_SUPPLIES: readonly string[] = ['observationSourceId'];

export const SEMANTIC_FIELDS_215: readonly (keyof SuppliedDeclaration215)[] = [
  'declarationId', 'missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
  'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'decisionWhileUnresolved', 'whyNecessaryNow',
];

export interface Assembled215 {
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

export interface AssemblyResult {
  readonly built: readonly Assembled215[];
  readonly failures: readonly { ordinal: number; caseId: string; reason: string }[];
}

/**
 * Assemble every frozen call, in the frozen order. Total and pure: it copies, refuses and composes
 * nothing, and a case whose span is not verbatim in its own observation is REFUSED rather than
 * repaired.
 */
export function assemble215(): AssemblyResult {
  const built: Assembled215[] = [];
  const failures: { ordinal: number; caseId: string; reason: string }[] = [];

  // Project each case once; the two H5 calls share one projection.
  const projections = new Map<string, ReturnType<typeof project210jDeclarations>>();
  for (const c of CONFIRMATION_CASES_215) {
    const adapted = c.declarations.map(dec => ({ ...dec, observationSourceId: `OBS-${c.caseId}` }));
    projections.set(c.caseId, project210jDeclarations({
      declarations: adapted as unknown as readonly unknown[],
      sources: [{ sourceId: `OBS-${c.caseId}`, text: c.observation }],
      suppliedGovernedSourceIds: [],
      stage: 'FIRST_PASS_MODEL',
    }));
  }

  EXECUTION_ORDER.forEach((step, i) => {
    const ordinal = i + 1;
    const c = CONFIRMATION_CASES_215.find(x => x.caseId === step.caseId) as ConfirmationCase215;
    const idx = c.declarations.findIndex(dec => dec.declarationId === step.declarationId);
    if (idx === -1) {
      failures.push({ ordinal, caseId: step.caseId, reason: 'DECLARATION_NOT_IN_CASE' });
      return;
    }
    const dec = c.declarations[idx];
    if (!c.observation.includes(dec.observationSpan)) {
      failures.push({ ordinal, caseId: step.caseId, reason: 'SPAN_NOT_VERBATIM' });
      return;
    }
    const proj = projections.get(c.caseId)!;
    const per = proj.projection.perDeclaration[idx];
    if (!per.admitted || per.owedFact === null) {
      failures.push({
        ordinal, caseId: step.caseId,
        reason: `PROJECTION_REFUSED:${per.codes.join(',')}`,
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
      declaration: { ...dec, observationSourceId: `OBS-${c.caseId}` } as Record<string, unknown>,
      unresolvedActionByFactKey: proj.unresolvedActionByFactKey,
      boundClarification: bound === undefined ? null : bound.question,
    });
    if (!request.built || request.payload === null) {
      failures.push({
        ordinal, caseId: step.caseId,
        reason: `REQUEST_REFUSED:${request.refusedBecause.join(',')}`,
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
        // §215 froze a targeted declaration set, not a full first-pass output. Candidates,
        // uncertainty and summary are ABSENT and render as the builder's own absent-case text.
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
        decisionDivergence: {
          ifA: request.payload.decisionIfA, ifB: request.payload.decisionIfB,
        },
        evidenceSpan: per.owedFact.evidenceSpan,
      }],
    });
    const userPrompt = appendVerifier212Block(base, request.payload);
    const toolBlock: Record<string, unknown> = {
      name: VERIFIER_TOOL_NAME,
      description: VERIFIER_TOOL_DESCRIPTION,
      input_schema: VERIFIER_212_RESPONSE_SCHEMA,
    };

    built.push({
      ordinal,
      caseId: c.caseId,
      declarationId: dec.declarationId,
      factKey: request.payload.targetFactKey,
      systemPrompt: EXPERT_VERIFIER_214_SYSTEM_PROMPT,
      userPrompt,
      toolBlock,
      request,
      retainedClarificationIds: retained.map(x => x.id),
      excludedClarificationIds: decisions.filter(x => !x.retained).map(x => x.id),
      identities: {
        instruction: sha(EXPERT_VERIFIER_214_SYSTEM_PROMPT),
        userPrompt: sha(userPrompt),
        schema: sha(JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA)),
      },
    });
  });

  return { built, failures };
}

/** Every semantic field survives adaptation byte-identical. The claim, checkable. */
export function semanticFieldsSurvive215(): boolean {
  return CONFIRMATION_CASES_215.every(c => c.declarations.every(dec => {
    const adapted = { ...dec, observationSourceId: `OBS-${c.caseId}` };
    return SEMANTIC_FIELDS_215.every(k => adapted[k] === dec[k]);
  }));
}

export { sha as sha256Of };
