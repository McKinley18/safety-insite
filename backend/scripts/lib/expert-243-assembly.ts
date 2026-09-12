/**
 * §243 ASSEMBLY. The one assembly path for the re-frozen §242A acceptance cohort, both legs.
 *
 * It is a transcription of `expert-231-assembly.ts` — itself a transcription of the protected
 * `expert-228b-assembly.ts` — onto the §242A cases, with the §239 system prompt and the §239 wire
 * schema that the frozen instrument names. The same modules, the same order, the same payload
 * construction. Nothing about the frozen instrument is reinterpreted here; this file only builds
 * the bytes the executor transmits.
 *
 * THE CASES ARE READ FROM THE FROZEN JSON, never re-authored, so what executes is what froze.
 *
 * ZERO semantic authorship. No case, truth, expectation or threshold is read for meaning, altered
 * or inferred.
 *
 * DISCLOSED PROPERTY OF THE FROZEN PATH, not introduced here: `governedStandards` is EMPTY in the
 * transmitted input and the governed records travel only in the appended AVAILABLE GOVERNED
 * EVIDENCE block, exactly as the protected §228b assembly does it. The base v15 prompt therefore
 * prints "(none supplied ...)" in its own records section while the appended block lists the
 * sourceIds and their citation-redacted text. That is the frozen assembly, preserved deliberately
 * so a difference in the result is attributable to the candidate and not to a rebuilt path.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, governedBindingFor, type VNextGovernedEvidenceRecord,
} from './expert-first-pass-instruction-vnext';
import {
  FIRST_PASS_CONTRACT_239_VERSION, build239SystemPrompt, buildExpert239WireSchema,
} from './expert-239-posture-contract';
import { project210jDeclarations } from './expert-210j-declaration-projection';
import { isolateClarifications } from './section-210b-verifier-payload';
import { buildVerifier212Request, appendVerifier212Block } from './expert-212-verifier-payload';
import { buildVerifierV3UserPrompt } from './expert-verifier-instruction-v3';
import { VERIFIER_TOOL_NAME, VERIFIER_TOOL_DESCRIPTION } from './expert-208b-verifier-recovery';
import { VERIFIER_218_RESPONSE_SCHEMA } from './expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './expert-218-property-instruction';

export const ASSEMBLY_243_VERSION = 'hazlenz.expert.243.assembly.v1' as const;

export const FROZEN_242A_PACKAGE =
  'verification/expert-hazlenz-242a-final-fresh-acceptance-instrument-refrozen-2026-09-12';

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const ROOT = join(__dirname, '..', '..', '..');

export interface FrozenGovernedRecord243 {
  readonly sourceId: string;
  readonly citation: string;
  readonly title: string;
  readonly approvedText: string;
  readonly backingState: string;
  readonly onPoint: boolean;
  readonly mayCarryAuthority: boolean;
  readonly whyFrozen: string;
}

export interface FrozenCase243 {
  readonly caseId: string;
  readonly domain: string;
  readonly observation: string;
  readonly suppliedContext: { readonly location: string; readonly task: string };
  readonly jurisdiction: string;
  readonly hazardFamilies: readonly string[];
  readonly governedRecords: readonly FrozenGovernedRecord243[];
  readonly allowedAuthority: readonly string[];
  readonly firstPassCalls: number;
  readonly verifierCalls: number;
  readonly verifierCallElidedBecause?: string;
}

function readJson(file: string): Record<string, any> {
  return JSON.parse(readFileSync(join(ROOT, FROZEN_242A_PACKAGE, file), 'utf8'));
}

let cached: readonly FrozenCase243[] | null = null;

/** The twenty-four frozen cases, read from the frozen truth contract. */
export function frozenCases243(): readonly FrozenCase243[] {
  if (cached === null) {
    const tc = readJson('SECTION-242A-TRUTH-CONTRACT.json');
    const cases = tc.cases as FrozenCase243[];
    if (!Array.isArray(cases) || cases.length !== 24) {
      throw new Error(`§243 ASSEMBLY ABORT: expected 24 frozen cases, found ${cases?.length}`);
    }
    cached = cases;
  }
  return cached;
}

/** The frozen instrument digest, recomputed from the four frozen content files. */
export function frozenInstrumentDigest243(): string {
  const ins = readJson('SECTION-242A-INSTRUMENT.json');
  const tc = readJson('SECTION-242A-TRUTH-CONTRACT.json');
  const sl = readJson('SECTION-242A-JUDGMENT-SLOTS.json');
  const cov = readJson('SECTION-242A-COVERAGE-MAP.json');
  return sha(canon({
    version: ins.version, instrument: ins, truthContract: tc, judgmentSlots: sl, coverageMap: cov,
  }));
}

/** Sorted-key, whitespace-free serialisation. The §242A declared digest method. */
function canon(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) as string;
  if (Array.isArray(value)) return `[${value.map(canon).join(',')}]`;
  const o = value as Record<string, unknown>;
  return `{${Object.keys(o).sort().map(k => `${JSON.stringify(k)}:${canon(o[k])}`).join(',')}}`;
}

export function analysisIdFor243(caseId: string): string { return `ANL-242A-${caseId}`; }
export function observationSourceIdFor243(caseId: string): string { return `OBS-242A-${caseId}`; }

export interface AssembledFirstPass243 {
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

export function assembleFirstPass243(): readonly AssembledFirstPass243[] {
  return frozenCases243().map((x, i) => {
    const observationSourceId = observationSourceIdFor243(x.caseId);
    const analysisId = analysisIdFor243(x.caseId);
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
      allowedHazardFamilies: [...x.hazardFamilies] as ExpertAnalysisInput['allowedHazardFamilies'],
      deterministicFindings: [],
      governedStandards: [],
      answeredClarifications: [],
    };

    const binding = governedBindingFor(governedRecords);
    const systemPrompt = build239SystemPrompt(governedRecords.length);
    const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
    const wireSchema = buildExpert239WireSchema(input, binding);

    return {
      ordinal: i + 1, caseId: x.caseId, contractVersion: FIRST_PASS_CONTRACT_239_VERSION,
      analysisId, observationSourceId, input, governedRecords, systemPrompt, userPrompt, wireSchema,
      identities: {
        systemPrompt: sha(systemPrompt), userPrompt: sha(userPrompt),
        wireSchema: sha(JSON.stringify(wireSchema)),
      },
    };
  });
}

// ---------------------------------------------------------------- verifier leg

export interface AssembledVerifier243 {
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

export interface VerifierAssemblyResult243 {
  readonly built: readonly AssembledVerifier243[];
  readonly refused: readonly { declarationId: string; reason: string }[];
  readonly projectionCodes: readonly { declarationId: string; codes: readonly string[] }[];
  readonly admittedFacts: readonly unknown[];
}

/**
 * Project the first-pass output and build the verifier request for the FIRST admitted declaration.
 *
 * The §218 contract reviews ONE target per request and the frozen plan books exactly one verifier
 * call per verifier-bearing case, so where a case admits more than one declaration the first is the
 * target and the rest are siblings the verifier must not wander into. That is the frozen design,
 * transcribed unchanged from §231.
 */
export function assembleVerifierFor243(
  caseId: string, firstPassOutput: Record<string, unknown>,
): VerifierAssemblyResult243 {
  const c = frozenCases243().find(x => x.caseId === caseId) as FrozenCase243;
  const observationSourceId = observationSourceIdFor243(caseId);

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

  const built: AssembledVerifier243[] = [];
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
    if (built.length > 0) return;

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
      caseId: c.caseId, declarationId, factKey: request.payload.targetFactKey,
      systemPrompt: EXPERT_VERIFIER_218_SYSTEM_PROMPT, userPrompt,
      toolBlock: {
        name: VERIFIER_TOOL_NAME, description: VERIFIER_TOOL_DESCRIPTION,
        input_schema: VERIFIER_218_RESPONSE_SCHEMA,
      },
      identities: {
        instruction: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT), userPrompt: sha(userPrompt),
        schema: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
      },
    });
  });

  return { built, refused, projectionCodes, admittedFacts };
}
