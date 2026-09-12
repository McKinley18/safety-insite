/**
 * EXPERT HAZLENZ -- THE PRODUCTION ENTRY POINT. §246 Phase 4.
 *
 * ==================== WHAT THIS FILE CLOSES ====================
 *
 * Until §246 there was no production caller of Expert HazLenz at all. The validated §239 contract
 * lived under `backend/scripts/lib/`, which `tsconfig.json` deliberately excludes from the build, and
 * the only callers were probes and acceptance executors. §243 therefore measured a semantic path the
 * product could not invoke. §245 established that, and §246 authorized productionizing the validated
 * contract rather than redefining Expert around the simpler base contract.
 *
 * This is the one production-callable path. It composes the SAME modules, in the SAME order, as the
 * acceptance assembly it was transcribed from. It authors no semantics of its own.
 *
 * ==================== THE PIPELINE, STATED ONCE ====================
 *
 *   input
 *     -> first-pass request bytes        (§239 system prompt, vNext user prompt, §239 wire schema)
 *     -> transport                        (injected; the adapter owns the vendor)
 *     -> deterministic validation         (§239 posture projection, §210J declaration projection)
 *     -> verifier where applicable        (§212 payload, §218 contract, v3 instruction)
 *     -> authority / review boundary      (§218 consistency, §214 scope containment)
 *     -> result projection                (product-facing, no harness concepts)
 *
 * Every stage is the module the acceptance path uses. Nothing is reimplemented here.
 *
 * ==================== WHY THE TRANSPORT IS INJECTED ====================
 *
 * `test:expert-nocall-harness` section D fails this directory on a vendor name, an endpoint, a
 * network primitive or a credential. The two-leg protocol needs two differently-shaped tool calls,
 * which the existing single-method `ExpertProvider` cannot express, so the neutral
 * `ExpertSemanticTransport` below is the seam. The adapter implements it using the canonical request
 * envelope, which is where the strict flag is bound.
 *
 * ==================== WHAT THIS FILE MAY NOT DO ====================
 *
 * It may not invent, repair or reconstruct safety semantics. Where a projection refuses, the refusal
 * is returned; it is never coerced into an answer. Where the verifier leg is not reached, that is
 * reported as not reached and never as a pass. Settlement is not performed here: property authority
 * and settlement remain with their own protected modules and their own authorized human actions.
 */

import type { ExpertAnalysisInput } from './expert-contract.types';
import {
  buildExpertVNextUserPrompt, governedBindingFor, type VNextGovernedEvidenceRecord,
} from './contract/expert-first-pass-instruction-vnext';
/**
 * ==================== §249 EXECUTABLE BINDING ====================
 *
 * §247 created the driver-role justification and the K6 discriminated representation as an additive
 * successor to §239, proved them at contract level, and DID NOT WIRE THEM HERE. This entry point
 * went on calling the §239 builders, so the request the product actually assembled carried no
 * `roleJustification`, no `anyOf` union, and ten expressible role/carrier pairs of which four were
 * inadmissible. §248's pre-spend gate caught that before any provider call and refused to spend.
 *
 * §249 is the binding repair and nothing else. The §247 builders are SELECTED here; none of their
 * semantics is touched. What changed is which link of one byte-reversible chain the executable path
 * reads, exactly as §247 Closure A changed the adapter.
 */
import { build247SystemPrompt } from './contract/expert-247-posture-contract';
/**
 * ==================== §253 ALONGSIDE-CONTROL CONSISTENCY ====================
 *
 * §247 transmitted a schema that admitted `alongsideControlConsidered: null` and a description that
 * instructed the model to write null in a named case, while the deterministic projection refused
 * that exact value. §253 adjudicated the contradiction from the frozen §247 fixture, design record
 * and report -- all three read a null pair as a confrontation that did not happen -- and repaired
 * the side that was wrong, which is the transmitted schema.
 *
 * The SCHEMA builder is the §253 successor. The PROMPT builder is still `build247SystemPrompt`,
 * unchanged and byte-identical, because the transmitted instruction block never mentioned null and
 * §253 introduces no prompt of its own.
 */
import {
  buildExpert253WireSchema, FIRST_PASS_CONTRACT_253_VERSION,
} from './contract/expert-253-posture-contract';
import {
  checkRoleJustification247, type RoleJustificationCode247,
} from './contract/expert-247-role-justification-projection';
import { projectPosture239 } from './contract/expert-239-posture-projection';
import { project210jDeclarations, preserve210j } from './contract/expert-210j-declaration-projection';
/**
 * ==================== §252 NON-STRICT ADMISSION ====================
 *
 * §251 closed single-call strict structured output as infeasible for the complete Expert contract,
 * and the product owner authorized non-strict transport plus deterministic fail-closed structural
 * admission. The structural obligation the provider used to discharge now lives in
 * `admitExpertOutput252`, which CALLS the same §235, §233/§239, §210J, §205 and §247 modules this
 * entry point called before and adds one whole-output conformance gate in front of them.
 *
 * The composition is unchanged and still lives here: §239 posture projection, §210J declarations,
 * §205 RR-7 preservation and the §247 justification check are called in the same order, on the same
 * output. What §252 inserts in front of them is `gateExpertOutput252`, and what it adds after them is
 * `decideAdmission252`, which states the disposition without re-running anything. Where the verdict
 * is not ADMIT, nothing stands in for the answer.
 */
import {
  gateExpertOutput252, decideAdmission252,
  type AdmissionOutcome252, type ConformanceViolation252,
} from './contract/expert-252-structural-admission';
import { isolateClarifications } from './contract/section-210b-verifier-payload';
import {
  buildVerifier212Request, appendVerifier212Block,
} from './contract/expert-212-verifier-payload';
import { buildVerifierV3UserPrompt } from './contract/expert-verifier-instruction-v3';
import { VERIFIER_218_RESPONSE_SCHEMA } from './contract/expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './contract/expert-218-property-instruction';

export const EXPERT_PRODUCTION_ENTRY_VERSION = 'hazlenz.expert.production-entry.v1' as const;

/**
 * The verifier tool identity. §246 extraction.
 *
 * These two constants were the ONLY production-relevant exports of
 * `scripts/lib/expert-208b-verifier-recovery.ts`, a §208 recovery harness whose other imports drag in
 * 5,757 lines of frozen truth specification, acceptance cohort, gates, preregistration and protocols.
 * Promoting that harness to carry two strings would have moved the acceptance instrument into the
 * product. They are restated here, byte-identical, and the §246 suite asserts they still equal the
 * §208 values so the extraction cannot drift.
 */
export const VERIFIER_TOOL_NAME = 'emit_verifier_verdict' as const;

// ---------------------------------------------------------------- the transport seam

export interface ExpertLegRequest {
  readonly leg: 'FIRST_PASS' | 'VERIFIER';
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly toolName: string;
  readonly toolDescription: string;
  /** The provider-neutral schema. The adapter applies its own strict wrapper and strip. */
  readonly wireSchema: unknown;
}

export interface ExpertLegResponse {
  readonly ok: boolean;
  /** The tool input, raw and unvalidated. Typed `unknown` so no adapter can assert it is valid. */
  readonly toolInput: unknown;
  readonly failureKind: string | null;
  readonly detail: string | null;
}

/** Implemented by the adapter. The core never learns which vendor answered. */
export interface ExpertSemanticTransport {
  send(request: ExpertLegRequest): Promise<ExpertLegResponse>;
}

// ---------------------------------------------------------------- the product-facing contract

export interface ExpertHazLenzRequest {
  readonly input: ExpertAnalysisInput;
  readonly observation: { readonly sourceId: string; readonly text: string };
  readonly governedRecords: readonly VNextGovernedEvidenceRecord[];
  /** Approved governed evidence, for the verifier leg. Citation handling is the contract's. */
  readonly governedEvidence: readonly {
    readonly sourceId: string; readonly citation: string;
    readonly title: string; readonly approvedText: string;
  }[];
}

export type ExpertHazLenzStatus =
  | 'COMPLETE'
  | 'FIRST_PASS_REFUSED'
  | 'PROVIDER_FAILED';

export interface ExpertHazLenzResult {
  readonly status: ExpertHazLenzStatus;
  readonly contractVersion: typeof FIRST_PASS_CONTRACT_253_VERSION;
  readonly entryVersion: typeof EXPERT_PRODUCTION_ENTRY_VERSION;
  /** Null whenever the posture projection refused. Never synthesized. */
  readonly posture: unknown;
  readonly postureRefusalCodes: readonly string[];
  /**
   * §252. The deterministic disposition of the provider output: ADMIT, REFUSE, or REFUSE while
   * preserving unresolved truth the model itself explicitly supplied. Never synthesized.
   */
  readonly admission: AdmissionOutcome252 | null;
  /** §252. Whole-output conformance violations against the contract. Empty on ADMIT. */
  readonly conformanceViolations: readonly ConformanceViolation252[];
  /** §252. Must always be empty. A non-empty value is a defect in the admission layer. */
  readonly semanticInventions: readonly string[];
  /**
   * §249. The §247 role-justification projection, run on the SAME output the posture projection
   * sees. Representational consistency only: it never decides whether a workplace fact is true.
   * Empty means every basis entry justified its role admissibly.
   */
  readonly roleJustificationCodes: readonly RoleJustificationCode247[];
  readonly admittedFacts: readonly unknown[];
  readonly declarationRefusals: readonly { declarationId: string; codes: readonly string[] }[];
  readonly verifier: {
    readonly reached: boolean;
    readonly factKey: string | null;
    readonly raw: unknown;
    readonly notReachedBecause: string | null;
  };
  readonly failure: { readonly kind: string; readonly detail: string } | null;
}

// ---------------------------------------------------------------- the entry point

export async function runExpertHazLenzAnalysis(
  request: ExpertHazLenzRequest, transport: ExpertSemanticTransport,
): Promise<ExpertHazLenzResult> {
  const { input, observation, governedRecords, governedEvidence } = request;

  const binding = governedBindingFor(governedRecords);
  const systemPrompt = build247SystemPrompt(governedRecords.length);
  const userPrompt = buildExpertVNextUserPrompt(input, governedRecords);
  const wireSchema = buildExpert253WireSchema(input, binding);

  const base = {
    contractVersion: FIRST_PASS_CONTRACT_253_VERSION,
    entryVersion: EXPERT_PRODUCTION_ENTRY_VERSION,
  } as const;
  const noVerifier = (why: string): ExpertHazLenzResult['verifier'] =>
    ({ reached: false, factKey: null, raw: null, notReachedBecause: why });

  const firstPass = await transport.send({
    leg: 'FIRST_PASS',
    systemPrompt, userPrompt, wireSchema,
    toolName: 'emit_expert_analysis',
    toolDescription: 'Emit the Expert HazLenz advisory analysis. This is the ONLY way to answer.',
  });

  if (!firstPass.ok) {
    // FAIL OPEN for availability, FAIL CLOSED for authority: nothing stands in for the answer.
    return {
      ...base, status: 'PROVIDER_FAILED', posture: null, postureRefusalCodes: [],
      admission: null, conformanceViolations: [], semanticInventions: [],
      roleJustificationCodes: [],
      admittedFacts: [], declarationRefusals: [], verifier: noVerifier('FIRST_PASS_NOT_OBTAINED'),
      failure: { kind: firstPass.failureKind ?? 'UNKNOWN', detail: firstPass.detail ?? '' },
    };
  }

  // ---- §252 whole-output conformance gate. The one check the provider used to perform, and the
  // ---- only thing that runs before the pipeline that was already here.
  const gate = gateExpertOutput252(firstPass.toolInput, wireSchema);

  // ---- the pipeline, in the order it has always run, on the normalized output.
  const posture = projectPosture239(firstPass.toolInput, wireSchema);
  const out = (gate.analysis ?? {}) as Record<string, unknown>;
  const rawDeclarations = Array.isArray(out.unresolvedFactDeclarations)
    ? out.unresolvedFactDeclarations as Record<string, unknown>[] : [];
  const rawClarifications = Array.isArray(out.decisionCriticalClarifications)
    ? out.decisionCriticalClarifications as Record<string, unknown>[] : [];

  const adapted = rawDeclarations.map(d => ({ ...d, observationSourceId: observation.sourceId }));
  const proj = project210jDeclarations({
    declarations: adapted as unknown as readonly unknown[],
    sources: [{ sourceId: observation.sourceId, text: observation.text }],
    suppliedGovernedSourceIds: governedRecords.map(g => g.sourceId),
    stage: 'FIRST_PASS_MODEL',
  });
  // RR-7. A declaration the projection refuses does not silently disappear where it identified a
  // property; preservation is fail-closed and never composes a value the model did not write.
  const preservation = preserve210j(proj, adapted as unknown as readonly unknown[]);

  const declarationIds = rawDeclarations.map(d => String(d.declarationId ?? ''));
  const admittedFacts: unknown[] = [];
  const declarationRefusals: { declarationId: string; codes: readonly string[] }[] = [];
  let targetIndex = -1;
  proj.projection.perDeclaration.forEach((per, idx) => {
    if (!per.admitted || per.owedFact === null) {
      declarationRefusals.push({
        declarationId: declarationIds[idx] ?? `(index ${idx})`, codes: per.codes,
      });
      return;
    }
    admittedFacts.push(per.owedFact);
    if (targetIndex === -1) targetIndex = idx;
  });

  const postureCodes = (posture as { codes?: readonly string[] }).codes ?? [];

  // §249. The justification check runs on the model's own basis entries and its own requiredControls.
  const postureObj = (out.immediateSafetyPosture ?? {}) as Record<string, unknown>;
  const justification = checkRoleJustification247(
    Array.isArray(postureObj.requiredBy) ? postureObj.requiredBy as unknown[] : [],
    Array.isArray(postureObj.requiredControls) ? postureObj.requiredControls as unknown[] : []);

  // ---- §252 verdict. States the disposition over what the pipeline already decided.
  const admission = decideAdmission252({
    rawToolInput: firstPass.toolInput,
    gate,
    postureAdmitted: posture.admitted,
    admittedPosture: posture.posture,
    roleJustificationAdmitted: justification.admitted,
    declarationRefusalCount: declarationRefusals.length,
    preservedRecords: preservation.base.preserved,
  });

  // A conformance failure is a refusal of the whole output. The verifier leg is not assembled from
  // an output the contract does not admit, and no part of it is salvaged.
  const admissionFields = {
    admission: admission.outcome,
    conformanceViolations: admission.conformance,
    semanticInventions: admission.semanticInventions,
  } as const;
  if (!admission.admitted) {
    return {
      ...base, status: 'FIRST_PASS_REFUSED', posture: posture.posture, ...admissionFields,
      postureRefusalCodes: postureCodes,
      roleJustificationCodes: justification.codes,
      admittedFacts, declarationRefusals,
      verifier: noVerifier('FIRST_PASS_NOT_ADMITTED'), failure: null,
    };
  }

  // ---- the verifier leg reviews ONE target per request, as the §218 contract requires.
  if (targetIndex === -1) {
    return {
      ...base, status: 'COMPLETE', posture, ...admissionFields,
      postureRefusalCodes: postureCodes,
      roleJustificationCodes: justification.codes,
      admittedFacts, declarationRefusals,
      verifier: noVerifier('NO_ADMITTED_DECLARATION'), failure: null,
    };
  }

  const per = proj.projection.perDeclaration[targetIndex];
  const declarationId = declarationIds[targetIndex] ?? `(index ${targetIndex})`;
  // Fail closed rather than narrow with an assertion: the target index was only set where the
  // projection admitted the declaration AND produced a fact, so a null here means the projection
  // changed under us and the verifier leg must not be assembled from a fact that does not exist.
  const owedFact = per.owedFact;
  if (owedFact === null) {
    return {
      ...base, status: 'COMPLETE', posture, ...admissionFields,
      postureRefusalCodes: postureCodes,
      roleJustificationCodes: justification.codes,
      admittedFacts, declarationRefusals,
      verifier: noVerifier('TARGET_FACT_ABSENT_AFTER_ADMISSION'), failure: null,
    };
  }
  const bound = rawClarifications.find(q =>
    String(q.answersUnresolvedFactDeclarationId ?? '') === declarationId);

  const verifierRequest = buildVerifier212Request({
    fact: owedFact,
    declaration: adapted[targetIndex] as unknown as Record<string, unknown>,
    unresolvedActionByFactKey: proj.unresolvedActionByFactKey,
    boundClarification: bound === undefined ? null : String(bound.question ?? ''),
  });

  if (!verifierRequest.built || verifierRequest.payload === null) {
    return {
      ...base, status: 'COMPLETE', posture, ...admissionFields,
      postureRefusalCodes: postureCodes,
      roleJustificationCodes: justification.codes,
      admittedFacts, declarationRefusals,
      verifier: noVerifier(`REQUEST_REFUSED:${verifierRequest.refusedBecause.join(',')}`),
      failure: null,
    };
  }

  const retained = isolateClarifications(
    rawClarifications.map(q => ({
      clarificationId: String(q.clarificationId ?? ''),
      question: String(q.question ?? ''),
      affectedDecision: String(q.affectedDecision ?? ''),
      answersUnresolvedFactDeclarationId: String(q.answersUnresolvedFactDeclarationId ?? ''),
    })),
    declarationId, declarationIds).filter(x => x.retained);

  const verifierBase = buildVerifierV3UserPrompt({
    caseId: input.analysisId,
    observation: observation.text,
    jurisdiction: input.jurisdiction,
    governedEvidence: governedEvidence.map(g => ({
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
      factKey: verifierRequest.payload.targetFactKey,
      affectedDecision: owedFact.affectedDecision,
      whyUnresolved: String(verifierRequest.payload.notEstablishedBecause ?? ''),
      branchA: verifierRequest.payload.branchA,
      branchB: verifierRequest.payload.branchB,
      decisionDivergence: {
        ifA: verifierRequest.payload.decisionIfA, ifB: verifierRequest.payload.decisionIfB,
      },
      evidenceSpan: owedFact.evidenceSpan,
    }],
  });

  const verifierLeg = await transport.send({
    leg: 'VERIFIER',
    systemPrompt: EXPERT_VERIFIER_218_SYSTEM_PROMPT,
    userPrompt: appendVerifier212Block(verifierBase, verifierRequest.payload),
    toolName: VERIFIER_TOOL_NAME,
    toolDescription: 'Emit the property review verdict. This is the ONLY way to answer.',
    wireSchema: VERIFIER_218_RESPONSE_SCHEMA,
  });

  return {
    ...base,
    status: 'COMPLETE',
    posture,
    ...admissionFields,
    postureRefusalCodes: postureCodes,
    roleJustificationCodes: justification.codes,
    admittedFacts,
    declarationRefusals,
    verifier: verifierLeg.ok
      ? {
        reached: true, factKey: verifierRequest.payload.targetFactKey,
        raw: verifierLeg.toolInput, notReachedBecause: null,
      }
      : noVerifier(`VERIFIER_LEG_FAILED:${verifierLeg.failureKind ?? 'UNKNOWN'}`),
    failure: null,
  };
}
