/**
 * §202 EXPERT HAZLENZ -- THE GOVERNED-BINDING STAGE PIPELINE.
 *
 * BOUNDED DEVELOPMENT INTEGRATION. NOT REACHABLE FROM PRODUCTION. NOT ENABLED.
 * ZERO PROVIDER CALLS FROM THIS MODULE: the nomination is a CALLER-SUPPLIED FUNCTION, the §202
 * suite never supplies one that reaches a network, and `runGovernedStagePipeline` cannot construct
 * a provider client because it imports none.
 *
 * ==================== THE PLACEMENT, AND WHY IT IS THIS ONE ====================
 *
 *   RAW OBSERVATION
 *     -> ORDINARY FIRST PASS            capability-ABSENT. Prompt, schema and user prompt UNCHANGED.
 *     -> STRUCTURED DECLARATIONS        the model's own words, no identity yet
 *     -> DETERMINISTIC VALIDATION       §196's projection: verbatim span, diverging branches, …
 *        AND IDENTITY                   …and the COMPUTED factKey
 *     -> IDENTITY SEAL                  §202. Sealed here, before anything is transmitted.
 *     -> GOVERNED-BINDING STAGE         <<-- only when governed evidence exists
 *     -> BINDING BOUNDARY               deterministic; nothing repaired
 *     -> ENRICHMENT                     attaches only a criterion HazLenz already held
 *     -> VERIFIER                       unchanged; not called by this module
 *
 * The stage sits AFTER deterministic validation and identity, and BEFORE enrichment. Four candidate
 * placements were considered and this one preserves the LEAST PROVIDER AUTHORITY. The argument is
 * from repository evidence, not from §201's precedent, and it is recorded in `PLACEMENT_RATIONALE`
 * so a later reader can check it rather than take it.
 *
 * ==================== WHAT MAKES THIS PIPELINE, RATHER THAN THE CONTRACT, LOAD-BEARING ====================
 *
 * The contract module can be called by anyone in any order. This module fixes the order and proves
 * it structurally: the nomination function is handed a `Governed202Request` and IS NOT HANDED THE
 * FACTS. It cannot see a factKey, cannot see the fact list, and is invoked strictly after
 * `sealFactIdentities` has run. So for anything routed through here, "identity was computed before
 * the provider was asked anything" is a property of the call graph rather than of a comment.
 */

import type { ExpertAnalysisInput } from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import type { AcceptableEvidence, OwedFact } from
  '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  type ExpertVNextGovernedBinding, governedBindingCapability,
} from './expert-first-pass-instruction-vnext';
import {
  projectDeclaredOwedFacts, type ProjectionInput, type ProjectionResult,
} from './expert-first-pass-owed-fact-projection';
import {
  type BindingCandidateFact202, type EnrichmentOutcome202, type FactIdentitySeal,
  type Governed202Record, type Governed202StageInput, type Governed202StageResult,
  type GovernedIdTransportMode202, type GovernedTextExposureMode,
  GOVERNED_BINDING_202_REQUEST_CONTRACT_ID,
  applyGoverned202Bindings, assertExposureAuthorised, buildGoverned202UserPrompt,
  buildGoverned202WireSchema, buildStage202SystemPrompt, checkGoverned202Bindings, exposureOf,
  sealFactIdentities, stageInvocation202,
} from './expert-202-governed-binding-contract';

export const GOVERNED_STAGE_PIPELINE_202_VERSION =
  'hazlenz.expert.governed-stage-pipeline.202.development.v1' as const;

// ================================================================ THE ORDER, AS DATA

export const GOVERNED_STAGE_PIPELINE_ORDER = [
  { step: 1, name: 'FIRST_PASS', actor: 'PROVIDER', changedByThisWork: false },
  { step: 2, name: 'STRUCTURED_DECLARATIONS', actor: 'PROVIDER', changedByThisWork: false },
  { step: 3, name: 'DETERMINISTIC_VALIDATION_AND_IDENTITY', actor: 'HAZLENZ', changedByThisWork: false },
  { step: 4, name: 'IDENTITY_SEAL', actor: 'HAZLENZ', changedByThisWork: true },
  { step: 5, name: 'GOVERNED_BINDING_STAGE_GATE', actor: 'HAZLENZ', changedByThisWork: true },
  { step: 6, name: 'GOVERNED_BINDING_NOMINATION', actor: 'PROVIDER', changedByThisWork: true },
  { step: 7, name: 'GOVERNED_BINDING_BOUNDARY', actor: 'HAZLENZ', changedByThisWork: true },
  { step: 8, name: 'ENRICHMENT', actor: 'HAZLENZ', changedByThisWork: true },
  { step: 9, name: 'VERIFIER', actor: 'PROVIDER', changedByThisWork: false },
] as const;

/**
 * Why this placement and not one of the other three, argued from repository evidence.
 *
 * Each entry names the alternative, the concrete authority it would have handed the provider, and
 * the artifact in this repository that establishes the point.
 */
export const PLACEMENT_RATIONALE = [
  {
    alternative: 'INSIDE the first pass (the §198/§199 capability-PRESENT monolith)',
    rejected: true,
    authorityItWouldHaveGivenTheProvider:
      'the binding would be addressed by `declarationId`, which the model chooses. Both halves of '
      + 'the relation would then be model-named in the same response, and the identity the binding '
      + 'attaches to would not exist yet.',
    repositoryEvidence:
      '`expert-first-pass-owed-fact-projection.ts` states IDENTITY IS COMPUTED, NEVER ACCEPTED, and '
      + '`FACT_IDENTITY_CLAIMS.NOT_CHOOSABLE_BY_THE_PROVIDER = true`. §199 additionally had this '
      + 'exact request refused before inference on both governed rows, so the monolith is also not '
      + 'available as a transport.',
  },
  {
    alternative: 'a separate stage placed BEFORE the projection, keyed on declarationId',
    rejected: true,
    authorityItWouldHaveGivenTheProvider:
      'the addressing model would be end-to-end provider-authored — a second call keyed by a handle '
      + 'the first call chose. It would also spend a call binding declarations the projection is '
      + 'about to refuse, and leave an orphan binding behind when it did.',
    repositoryEvidence:
      '`PROJECTION_REFUSAL_CODES` lists 17 reasons a declaration never becomes a fact — '
      + 'EVIDENCE_SPAN_NOT_VERBATIM, BRANCHES_IDENTICAL, DECISIONS_DO_NOT_DIVERGE among them. The '
      + 'projection is also what makes the request DETERMINISTIC: pre-projection the fact count is '
      + 'whatever the model emitted; post-projection it is a function of the boundary\'s output.',
  },
  {
    alternative: 'folded into the VERIFIER, reusing regulatoryBasis.sourceIds',
    rejected: true,
    authorityItWouldHaveGivenTheProvider:
      'two different relations would become indistinguishable in one field — "this verdict relied '
      + 'on record R" and "fact F is bound to record R". Worse, v3.x refuses a verdict WHOLE, so a '
      + 'verdict refused for an unrelated code would destroy a well-formed binding with it.',
    repositoryEvidence:
      '`expert-verifier-contract-v3-3.ts` refuses whole ("Refuses the verdict WHOLE on any '
      + 'violation, as v1, v2, v3, v3.1 and v3.2 do"), and its `regulatoryBasis` is a reliance '
      + 'declaration about a verdict, not a binding of a fact. It would also grow the second-largest '
      + 'schema in the programme, which is the opposite of what the §199 refusal requires.',
  },
  {
    alternative: 'no stage at all — bind deterministically by text matching',
    rejected: true,
    authorityItWouldHaveGivenTheProvider:
      'none, which is why it is tempting. But it would require deterministic code to decide whether '
      + 'a governed record BEARS ON an unresolved property, which is a semantic judgement, and the '
      + 'only deterministic way to fake one is term overlap.',
    repositoryEvidence:
      'the semantic matcher retired at §160, and the standing rule that a fail-closed claim a weak '
      + 'matcher cannot honour must be escalated as a representation question rather than shipped.',
  },
  {
    alternative: 'AFTER deterministic validation and identity, BEFORE enrichment  <<-- CHOSEN',
    rejected: false,
    authorityItWouldHaveGivenTheProvider:
      'selection between two closed sets HazLenz owns and nothing else. The fact side is a '
      + 'HazLenz-MINTED, request-scoped reference (F1, F2, …) that resolves through a table this '
      + 'process owns and never leaves the request; the evidence side is the exact supplied '
      + 'sourceId set. The provider names nothing, mints nothing and identifies nothing.',
    repositoryEvidence:
      'both closed sets exist only at this point in the pipeline: the computed factKey is produced '
      + 'by step 3 and the supplied sourceId set is HazLenz input. Placing the stage here is what '
      + 'makes "the model selects rather than names" true, which is the least-authority position '
      + 'available for a stage that must make a bearing judgement at all.',
  },
] as const;

/**
 * Under this integration a governed row's FIRST PASS is built capability-ABSENT — the schema shape
 * that completed hosted inference on ten of ten rows in §199 — and the governed relation moves
 * entirely to the separate stage.
 *
 * This helper exists so the integration cannot drift back: it returns the EMPTY binding and asserts
 * that the binding it returns really is capability-ABSENT. A caller that wants the PRESENT variant
 * has to go around this function, which is a visible act.
 */
export function firstPassBindingUnderSeparateStage(): ExpertVNextGovernedBinding {
  const binding: ExpertVNextGovernedBinding = { governedEvidenceSourceIds: [] };
  if (governedBindingCapability(binding) !== 'ABSENT') {
    throw new Error('GOVERNED_STAGE_202_ABORT: the first-pass binding for a governed row is not '
      + 'capability-ABSENT. The separate-stage architecture requires every first-pass request to '
      + 'carry the shape that §199 had accepted.');
  }
  return binding;
}

/** The governed-evidence records a first pass is shown under this integration: none by id. */
export const FIRST_PASS_GOVERNED_ID_BLOCK_UNDER_SEPARATE_STAGE: readonly never[] = [];

export const FIRST_PASS_PRESERVATION_CLAIMS = {
  FIRST_PASS_SYSTEM_PROMPT_IS_MODIFIED: false,
  FIRST_PASS_WIRE_SCHEMA_BUILDER_IS_MODIFIED: false,
  FIRST_PASS_USER_PROMPT_BUILDER_IS_MODIFIED: false,
  GOVERNED_ROWS_NOW_SEND_THE_CAPABILITY_ABSENT_FIRST_PASS: true,
  V15_GOVERNED_STANDARDS_RENDERING_UNDER_OPAQUE_HANDLES_IS_RETAINED: true,
} as const;

// ================================================================ THE REQUEST

/**
 * Everything the nomination function is given, and — as importantly — everything it is not.
 *
 * There is no `facts` field, no `factKey`, no `identitySeal` and no criterion map on this object.
 * A nominator cannot read a fact identity because it is never handed one.
 */
export interface Governed202Request {
  readonly requestContractId: typeof GOVERNED_BINDING_202_REQUEST_CONTRACT_ID;
  readonly analysisId: string;
  readonly exposure: GovernedTextExposureMode;
  readonly systemPrompt: string;
  readonly userPrompt: string;
  /** The canonical schema, before transport treatment. */
  readonly schema: Record<string, unknown>;
  /** The schema AS SENT: strict-tool-schema wrapper, then the §108 Anthropic keyword strip. */
  readonly schemaAsSent: unknown;
}

export function buildGoverned202Request(input: Governed202StageInput): Governed202Request {
  assertExposureAuthorised(input);
  const schema = buildGoverned202WireSchema(input);
  return {
    requestContractId: GOVERNED_BINDING_202_REQUEST_CONTRACT_ID,
    analysisId: input.analysisId,
    exposure: exposureOf(input),
    systemPrompt: buildStage202SystemPrompt(exposureOf(input)),
    userPrompt: buildGoverned202UserPrompt(input),
    schema,
    schemaAsSent: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema)),
  };
}

/**
 * The nomination. A caller-supplied function, and the ONLY place a provider could ever be reached.
 *
 * It is typed to receive a `Governed202Request` and nothing else. §202 supplies no implementation,
 * the suite supplies only offline stubs, and no module under `backend/src/` imports this file.
 */
export type Governed202Nominator =
  (request: Governed202Request) => Promise<unknown> | unknown;

// ================================================================ THE PIPELINE

export interface GovernedStagePipelineInput {
  readonly analysisId: string;
  /** Step 1–2 output: the first pass's structured declarations, exactly as returned. */
  readonly declarations: readonly unknown[];
  /** The authoritative sources the spans are matched against, verbatim. */
  readonly sources: ProjectionInput['sources'];
  readonly stage: ProjectionInput['stage'];
  /** The governed records HazLenz holds for this row. Empty means the stage is never invoked. */
  readonly governedRecords: readonly Governed202Record[];
  readonly inspectionContext: { readonly location: string; readonly task: string };
  /**
   * `declaration.missingFact` per admitted declarationId, where the harness kept it. Nullable
   * throughout: `OwedFact` has no field for the owed property and §202 does not create one.
   */
  readonly owedPropertyByDeclarationId?: Readonly<Record<string, string>>;
  /** Criteria HazLenz already holds, by governed sourceId. Never authored by the stage. */
  readonly criteriaBySourceId?: Readonly<Record<string, AcceptableEvidence>>;
  readonly governedIdTransport?: GovernedIdTransportMode202;
  readonly governedTextExposure?: GovernedTextExposureMode;
  readonly verbatimExposureRuling?: string | null;
}

/**
 * Why an admitted fact was kept out of the binding candidate set.
 *
 * Both reasons are recorded rather than silently dropped. `WHY_UNRESOLVED_STATUS_INVARIANT` makes
 * the second unreachable through the projection, and it is still recorded: an invariant that holds
 * is not a reason to make its violation invisible if it ever stops holding.
 */
export const BINDING_EXCLUSION_REASONS = [
  'FACT_IS_NOT_UNRESOLVED',
  'WHY_UNRESOLVED_ABSENT_ON_AN_OPEN_FACT',
] as const;
export type BindingExclusionReason = (typeof BINDING_EXCLUSION_REASONS)[number];

export interface GovernedStagePipelineResult {
  readonly version: typeof GOVERNED_STAGE_PIPELINE_202_VERSION;
  readonly projection: ProjectionResult;
  /** Admitted facts kept out of the candidate set, with the reason. Never silently dropped. */
  readonly excludedFromBinding: readonly {
    readonly factKey: string; readonly reason: BindingExclusionReason;
  }[];
  readonly identitySeal: FactIdentitySeal;
  readonly invocation: { readonly shouldCall: boolean; readonly reason: string };
  /** Null when the gate answered without a call. */
  readonly request: Governed202Request | null;
  /** Null when the stage was not invoked. */
  readonly binding: Governed202StageResult | null;
  readonly facts: readonly OwedFact[];
  readonly enrichment: readonly EnrichmentOutcome202[];
  /** Counted, so a run that spent nothing can prove it spent nothing. */
  readonly nominationsIssued: number;
}

/**
 * Run the pipeline from structured declarations to enriched facts.
 *
 * ORDER IS ENFORCED BY THE CALL GRAPH, not by documentation:
 *   projection -> seal -> gate -> build request -> nominate(request) -> boundary -> enrichment
 *
 * `nominate` is called with the request alone, strictly after the seal exists, and its return value
 * is validated against the sealed fact set. A nominator that returned a factKey, a decision, a
 * branch, a status or a priority is refused with a countable code rather than ignored.
 */
export async function runGovernedStagePipeline(
  input: GovernedStagePipelineInput,
  nominate: Governed202Nominator | null,
): Promise<GovernedStagePipelineResult> {
  // ---- steps 3: deterministic validation and identity.
  //
  // `suppliedGovernedSourceIds` is EMPTY on purpose. Under the separate-stage architecture the
  // first pass is capability-ABSENT and never emits a governed id, so the projection has none to
  // validate. The governed relation is established later, or not at all.
  const projection = projectDeclaredOwedFacts({
    declarations: input.declarations,
    sources: input.sources,
    suppliedGovernedSourceIds: [],
    stage: input.stage,
  });

  const owedProperty = input.owedPropertyByDeclarationId ?? {};
  const candidates: BindingCandidateFact202[] = [];
  const excludedFromBinding: { factKey: string; reason: BindingExclusionReason }[] = [];

  for (const p of projection.perDeclaration) {
    if (!p.admitted || p.owedFact === null) continue;
    const f: OwedFact = p.owedFact;
    // Only an UNRESOLVED fact is bindable, and `WHY_UNRESOLVED_STATUS_INVARIANT` guarantees such a
    // fact carries a non-blank sentence. A fact failing either test is EXCLUDED AND RECORDED — never
    // carried with a fabricated sentence, and never dropped silently, because silence and a finding
    // must not be the same observable outcome.
    if (f.status !== 'UNRESOLVED') {
      excludedFromBinding.push({ factKey: f.factKey, reason: 'FACT_IS_NOT_UNRESOLVED' });
      continue;
    }
    if (typeof f.whyUnresolved !== 'string' || f.whyUnresolved.trim().length === 0) {
      excludedFromBinding.push({ factKey: f.factKey, reason: 'WHY_UNRESOLVED_ABSENT_ON_AN_OPEN_FACT' });
      continue;
    }
    candidates.push({
      factKey: f.factKey,
      owedProperty: owedProperty[p.declarationId] ?? null,
      affectedDecision: f.affectedDecision,
      evidenceSpan: f.evidenceSpan,
      whyUnresolved: f.whyUnresolved,
      branchA: f.branchA,
      branchB: f.branchB,
    });
  }

  // ---- step 4: seal. Before anything is built, and before anything is transmitted.
  const identitySeal = sealFactIdentities(input.analysisId, candidates);

  // ---- step 5: the gate. Both empty cases are answered without a call, and neither is a failure.
  const invocation = stageInvocation202({
    facts: candidates, governedRecords: input.governedRecords,
  });

  const criteria = input.criteriaBySourceId ?? {};

  if (!invocation.shouldCall || nominate === null) {
    return {
      version: GOVERNED_STAGE_PIPELINE_202_VERSION,
      projection,
      excludedFromBinding,
      identitySeal,
      invocation,
      request: null,
      binding: null,
      facts: projection.facts,
      enrichment: [],
      nominationsIssued: 0,
    };
  }

  const stageInput: Governed202StageInput = {
    analysisId: input.analysisId,
    facts: candidates,
    governedRecords: input.governedRecords,
    inspectionContext: input.inspectionContext,
    governedIdTransport: input.governedIdTransport,
    governedTextExposure: input.governedTextExposure,
    verbatimExposureRuling: input.verbatimExposureRuling ?? null,
    identitySeal,
  };

  // ---- step 6: the nomination. The nominator receives the REQUEST and never the facts.
  const request = buildGoverned202Request(stageInput);
  const raw = await nominate(request);

  // ---- step 7: the boundary. Nothing is repaired; refusal is per entry.
  const binding = checkGoverned202Bindings(raw, stageInput);

  // ---- step 8: enrichment. Only a criterion HazLenz already held.
  const enriched = applyGoverned202Bindings(projection.facts, binding, criteria);

  return {
    version: GOVERNED_STAGE_PIPELINE_202_VERSION,
    projection,
    excludedFromBinding,
    identitySeal,
    invocation,
    request,
    binding,
    facts: enriched.facts,
    enrichment: enriched.outcomes,
    nominationsIssued: 1,
  };
}

/**
 * Build the ordinary first-pass request for a row under this integration, for MEASUREMENT ONLY.
 *
 * It exists so the §202 grammar table measures the same objects §199 actually sent rather than a
 * reconstruction of them, and it is deliberately a thin pass-through: it builds nothing, it only
 * chooses the binding, and the choice is always ABSENT.
 */
export function firstPassCapabilityUnderSeparateStage(
  _input: ExpertAnalysisInput,
): { binding: ExpertVNextGovernedBinding; capability: 'ABSENT' } {
  return { binding: firstPassBindingUnderSeparateStage(), capability: 'ABSENT' };
}

/** What a §202 run may and may not do. Asserted by the suite. */
export const PIPELINE_202_ACTIVATION_CLAIMS = {
  ISSUES_A_PROVIDER_CALL_WITHOUT_A_CALLER_SUPPLIED_NOMINATOR: false,
  IMPORTS_A_PROVIDER_CLIENT: false,
  TOUCHES_A_DATABASE: false,
  IS_REACHABLE_FROM_THE_CUSTOMER_PATH: false,
  MODIFIES_THE_FIRST_PASS_PROTOCOL: false,
  HANDS_THE_NOMINATOR_A_FACT_IDENTITY: false,
} as const;
