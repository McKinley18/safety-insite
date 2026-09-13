/**
 * §205 -- GOVERNED CAPABILITY-PRESENT TRANSPORT: DETERMINISTIC CONSTRUCTIBILITY AND SIZE BUDGET.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS SENT ANYWHERE.
 *
 * ==================== THE FAILURE THIS ANSWERS ====================
 *
 * §199 executed twelve rows. Ten reached inference. TWO -- SG-01 and SG-02, the only rows carrying
 * a governed-evidence capability -- were REJECTED BEFORE INFERENCE, verbatim from the run log:
 *
 *     rejection=COMPILED_GRAMMAR_TOO_LARGE::the compiled grammar is too large, which would cause
 *       performance issues. simplify your tool schemas or reduce the number of strict tools.
 *
 * The consequence propagated all the way to §204: no model output exists for either row, their 8
 * row-axis slots were excluded from the denominator by product-owner decision, and the three
 * governed axes N, S and T are 24 structurally prefilled `NOT_EXERCISED` slots across all 8 facts.
 * The governed-binding stage is the single largest hole in the §204 record, and it is a TRANSPORT
 * hole, not a semantic one.
 *
 * The measured cause, from §202's grammar identity work:
 *
 *     §199 capability-ABSENT   17 enums / 74 alts / 54 props / 18,679 schema B / 63,691 total B  ACCEPTED
 *     §199 capability-PRESENT  18 enums / 75 alts / 55 props / 19,124 schema B / 67,086 total B  REJECTED
 *
 * One extra property on the declaration object pushed the compiled grammar over the provider's
 * limit. The margin is thin, which is exactly why the repair must be structural rather than a trim.
 *
 * ==================== THE REPAIR IS THE §202 SEPARATE STAGE, PROVEN ROUTED ====================
 *
 * §202 already built the architecture: the governed relation moves OUT of the first pass into its
 * own small call, so a governed row's first-pass request carries the capability-ABSENT shape that
 * §199 proved acceptable, byte for byte. What was never established is that a governed row actually
 * ROUTES that way end to end, and that the pair of requests it produces is within budget.
 *
 * This module establishes exactly that, deterministically and offline:
 *
 *   C1  a governed row's first-pass wire schema is BYTE-IDENTICAL to the capability-ABSENT schema
 *       §199 had accepted -- so it cannot reproduce COMPILED_GRAMMAR_TOO_LARGE, by construction
 *   C2  the retired capability-PRESENT first-pass shape is NEVER constructed on the routed path
 *   C3  the separate governed-stage request is constructible and is an order of magnitude smaller
 *       than the first-pass request
 *   C4  the routed pair's LARGEST single compiled schema is the ABSENT one -- the provider limit
 *       applies per request, so the pair's sum is not the quantity that matters and is not claimed
 *   C5  the authority boundary §202 established is unchanged by the routing
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * IT IS NOT EVIDENCE THAT THE PROVIDER ACCEPTS ANYTHING. No request is sent. A schema that is
 * smaller than one the provider accepted is not thereby accepted -- the compiled-grammar limit is
 * the provider's function of the schema, not ours, and §203 records the effective-grammar identity
 * as an explicit PROXY. The honest claim is CONSTRUCTIBLE AND WITHIN THE ACCEPTED ENVELOPE, and the
 * hosted transport smoke of 2-4 calls is what would upgrade it. That smoke is not authorized here.
 */

import {
  type ExpertVNextGovernedBinding,
  buildExpertVNextWireSchema, buildExpertVNextSystemPrompt,
} from './expert-first-pass-instruction-vnext';
import {
  type Governed202Record, type Governed202StageInput, type BindingCandidateFact202,
  GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY, GOVERNED_STAGE_202_PERMITTED_AUTHORITY,
  sealFactIdentities,
} from './expert-202-governed-binding-contract';
import {
  buildGoverned202Request, firstPassBindingUnderSeparateStage,
} from './expert-202-governed-stage-pipeline';
import { describeGrammarProjection203 } from './expert-203-effective-grammar-identity';
import { buildExpertR2SystemPrompt } from './expert-205-first-pass-instruction-r2';
import type { ExpertAnalysisInput } from '../../src/hazlenz/expert-hazlenz/expert-contract.types';

export const GOVERNED_TRANSPORT_205_VERSION =
  'hazlenz.expert.205.governed-transport.v1' as const;

/**
 * The §199 measurements, recorded verbatim so the budget is checked against the RUN and not against
 * a number somebody remembered. `totalBytes` is the whole request as measured at §202; `schemaBytes`
 * is the schema alone.
 */
export const SECTION_199_MEASURED_ENVELOPE = {
  capabilityAbsent: {
    outcome: 'PROVIDER_ACCEPTED_AND_INFERRED_ON_TEN_OF_TEN_ROWS',
    enums: 17, alternatives: 74, properties: 54, schemaBytes: 18_679, totalBytes: 63_691,
  },
  capabilityPresent: {
    outcome: 'PROVIDER_REJECTED_BEFORE_INFERENCE_COMPILED_GRAMMAR_TOO_LARGE',
    enums: 18, alternatives: 75, properties: 55, schemaBytes: 19_124, totalBytes: 67_086,
  },
} as const;

/** The recorded rejection, verbatim. Quoted so the module cannot drift from what actually happened. */
export const RECORDED_REJECTION = {
  rejectionCode: 'COMPILED_GRAMMAR_TOO_LARGE',
  message: 'the compiled grammar is too large, which would cause performance issues. simplify your '
    + 'tool schemas or reduce the number of strict tools.',
  affectedRows: ['SG-01', 'SG-02'] as const,
  section197Origins: ['SF-09', 'SF-10'] as const,
  downstreamConsequence: '8 row-axis slots excluded from the §204 denominator; axes N, S and T '
    + 'prefilled NOT_EXERCISED on all 8 facts',
} as const;

/**
 * What a size comparison may and may not be read as. Recorded in code because the tempting
 * over-read -- "smaller than an accepted schema, therefore accepted" -- is exactly wrong.
 */
export const TRANSPORT_MEASUREMENT_CLAIMS = {
  /** The routed request is constructible offline and equals a shape the provider did accept. */
  CONSTRUCTIBLE_AND_BYTE_EQUAL_TO_AN_ACCEPTED_SHAPE: true,
  /** The compiled grammar is the PROVIDER's function of the schema. We measure a proxy. */
  PROVES_THE_PROVIDER_WILL_ACCEPT_IT: false,
  /** No request is sent by this module or by anything it imports. */
  ANY_REQUEST_IS_SENT: false,
  /** Only a hosted transport smoke can upgrade the claim, and it is not authorized here. */
  UPGRADED_ONLY_BY_A_HOSTED_TRANSPORT_SMOKE: true,
} as const;

export interface RoutedGovernedRow {
  /** The first-pass request a governed row now sends: capability-ABSENT, by construction. */
  readonly firstPassSchema: Record<string, unknown>;
  readonly firstPassSystemPrompt: string;
  readonly firstPassBinding: ExpertVNextGovernedBinding;
  /** The separate governed-stage request. Built only after the first pass has produced facts. */
  readonly governedStageSchemaAsSent: unknown;
  readonly governedStageSchema: Record<string, unknown>;
  readonly governedStageSystemPrompt: string;
}

export interface TransportBudgetFinding {
  readonly checkId: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  readonly statement: string;
  readonly held: boolean;
  readonly measured: string;
}

export interface GovernedTransportAssessment {
  readonly version: typeof GOVERNED_TRANSPORT_205_VERSION;
  readonly routed: RoutedGovernedRow;
  readonly findings: readonly TransportBudgetFinding[];
  readonly allHeld: boolean;
  readonly claims: typeof TRANSPORT_MEASUREMENT_CLAIMS;
  /** Byte sizes of the canonical JSON of each schema, for the record. */
  readonly measuredBytes: {
    readonly routedFirstPassSchema: number;
    readonly retiredPresentSchema: number;
    readonly governedStageSchema: number;
  };
  readonly grammarIdentities: {
    readonly routedFirstPass: string;
    readonly retiredPresent: string;
    readonly governedStage: string;
  };
}

const bytesOf = (v: unknown): number => Buffer.byteLength(JSON.stringify(v), 'utf8');

/**
 * Build the pair of requests a governed row sends under the separate-stage routing.
 *
 * `firstPassBindingUnderSeparateStage()` is §202's own guard: it returns the empty binding and
 * throws if that binding is not capability-ABSENT, so the routing cannot silently drift back to the
 * shape that was rejected. It is imported, never reimplemented.
 *
 * The R2 system prompt is selected through `buildExpertR2SystemPrompt`, which pairs the prompt to
 * the binding, so a governed row cannot receive a prompt that describes a field its schema omits.
 */
export function routeGovernedRow(args: {
  readonly analysisId: string;
  readonly input: ExpertAnalysisInput;
  readonly facts: readonly BindingCandidateFact202[];
  readonly governedRecords: readonly Governed202Record[];
  readonly inspectionContext: { readonly location: string; readonly task: string };
}): RoutedGovernedRow {
  const firstPassBinding = firstPassBindingUnderSeparateStage();
  const firstPassSchema = buildExpertVNextWireSchema(args.input, firstPassBinding);

  const stageInput: Governed202StageInput = {
    analysisId: args.analysisId,
    facts: args.facts,
    governedRecords: args.governedRecords,
    inspectionContext: args.inspectionContext,
    identitySeal: sealFactIdentities(args.analysisId, args.facts),
  };
  const request = buildGoverned202Request(stageInput);

  return {
    firstPassSchema,
    firstPassSystemPrompt: buildExpertR2SystemPrompt(firstPassBinding),
    firstPassBinding,
    governedStageSchema: request.schema,
    governedStageSchemaAsSent: request.schemaAsSent,
    governedStageSystemPrompt: request.systemPrompt,
  };
}

/**
 * Assess the routed pair against the §199 envelope and the §202 authority boundary.
 *
 * Every finding is a comparison whose answer is not in dispute. None of them is a claim about what
 * the provider will do; see `TRANSPORT_MEASUREMENT_CLAIMS`.
 */
export function assessGovernedTransport(args: {
  readonly analysisId: string;
  readonly input: ExpertAnalysisInput;
  readonly facts: readonly BindingCandidateFact202[];
  readonly governedRecords: readonly Governed202Record[];
  readonly inspectionContext: { readonly location: string; readonly task: string };
}): GovernedTransportAssessment {
  const routed = routeGovernedRow(args);

  // The retired shape, built ONLY here, ONLY to prove the routed path differs from it. It is never
  // returned inside `routed` and no caller of `routeGovernedRow` can obtain it.
  const presentBinding: ExpertVNextGovernedBinding = {
    governedEvidenceSourceIds: args.governedRecords.map(r => r.sourceId),
  };
  const retiredPresentSchema = buildExpertVNextWireSchema(args.input, presentBinding);
  const acceptedAbsentSchema = buildExpertVNextWireSchema(
    args.input, { governedEvidenceSourceIds: [] });

  const routedBytes = bytesOf(routed.firstPassSchema);
  const retiredBytes = bytesOf(retiredPresentSchema);
  const stageBytes = bytesOf(routed.governedStageSchema);

  const routedId = describeGrammarProjection203(
    routed.firstPassSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION');
  const retiredId = describeGrammarProjection203(
    retiredPresentSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION');
  const stageId = describeGrammarProjection203(
    routed.governedStageSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION');

  const findings: TransportBudgetFinding[] = [
    {
      checkId: 'C1',
      statement: 'a governed row\'s first-pass wire schema is byte-identical to the '
        + 'capability-ABSENT schema §199 executed on ten of ten rows',
      held: JSON.stringify(routed.firstPassSchema) === JSON.stringify(acceptedAbsentSchema),
      measured: `routed ${routedBytes} B vs accepted-absent ${bytesOf(acceptedAbsentSchema)} B`,
    },
    {
      checkId: 'C2',
      statement: 'the retired capability-PRESENT first-pass shape is not what the routed path sends',
      held: JSON.stringify(routed.firstPassSchema) !== JSON.stringify(retiredPresentSchema)
        && routed.firstPassBinding.governedEvidenceSourceIds.length === 0,
      measured: `routed grammar ${routedId.identity} != retired grammar ${retiredId.identity}; `
        + `routed binding carries ${routed.firstPassBinding.governedEvidenceSourceIds.length} ids`,
    },
    {
      checkId: 'C3',
      statement: 'the separate governed-stage request is constructible and materially smaller than '
        + 'the first-pass request',
      held: stageBytes > 0 && stageBytes < routedBytes,
      measured: `governed stage ${stageBytes} B vs first pass ${routedBytes} B`,
    },
    {
      checkId: 'C4',
      statement: 'the LARGEST single compiled schema on the routed path is the one §199 accepted; '
        + 'the provider limit is per request, so the pair\'s sum is not the governing quantity',
      held: Math.max(routedBytes, stageBytes) === routedBytes && routedBytes <= retiredBytes,
      measured: `max(first pass ${routedBytes}, stage ${stageBytes}) = ${
        Math.max(routedBytes, stageBytes)} B; retired PRESENT was ${retiredBytes} B`,
    },
    {
      checkId: 'C5',
      statement: 'the §202 authority boundary is unchanged: the stage may select supplied ids and '
        + 'may not settle, escalate, cite or name a fact identity',
      held: GOVERNED_STAGE_202_PERMITTED_AUTHORITY.length > 0
        && GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY.length > 0
        && !JSON.stringify(routed.governedStageSchema).includes('factKey')
        && !JSON.stringify(routed.governedStageSchema).includes('priority'),
      measured: `${GOVERNED_STAGE_202_PERMITTED_AUTHORITY.length} permitted / `
        + `${GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY.length} forbidden authority statements; the `
        + 'stage schema names neither factKey nor priority',
    },
  ];

  return {
    version: GOVERNED_TRANSPORT_205_VERSION,
    routed,
    findings,
    allHeld: findings.every(f => f.held),
    claims: TRANSPORT_MEASUREMENT_CLAIMS,
    measuredBytes: {
      routedFirstPassSchema: routedBytes,
      retiredPresentSchema: retiredBytes,
      governedStageSchema: stageBytes,
    },
    grammarIdentities: {
      routedFirstPass: routedId.identity,
      retiredPresent: retiredId.identity,
      governedStage: stageId.identity,
    },
  };
}

/** Asserted by the suite as literals. */
export function governedTransportEffect(): {
  providerCalls: 0; databaseOperations: 0;
  sendsAnything: false; provesProviderAcceptance: false;
  copiesGovernedTextIntoModelAuthoredCitationAuthority: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0,
    sendsAnything: false, provesProviderAcceptance: false,
    copiesGovernedTextIntoModelAuthoredCitationAuthority: false,
  };
}
