/**
 * §212 -- R-A: VERIFIER PAYLOAD REMEDIATION. WIRING, NOT A SECOND REPRESENTATION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO PRODUCTION.
 *
 * ==================== THE INSTRUCTION THIS MODULE FOLLOWS ====================
 *
 * "Prefer wiring existing tested assembly over creating another parallel representation."
 *
 * So `buildVerifier210jView` is CALLED, not reimplemented. §211 found it already assembles seven of
 * the eleven required slots and is imported by no request builder; ten of the eleven come straight
 * out of it. Exactly ONE field is genuinely new here -- `declarationId` -- and it is copied from the
 * declaration, never derived. `PAYLOAD_FIELD_PROVENANCE` names the single source of every field as
 * data, so "nothing is reconstructed" is a table a suite can iterate rather than a claim.
 *
 * ==================== FAIL CLOSED ON THE ONE FIELD THAT CANNOT BE RECOVERED ====================
 *
 * If the model authored no property, there is no property. Deterministic code may not compose one
 * from the branches, from `notEstablishedBecause`, or from `affectedDecision` -- that is the
 * semantic reconstruction the authorization forbids and §201 already refused. So
 * `buildVerifier212Request` REFUSES to construct the request. A verifier asked to judge a property
 * that is not there would be judging prose it invented, and a refusal is visible where an empty
 * field is not.
 *
 * ==================== ANCILLARY CONTEXT IS OFF BY DEFAULT ====================
 *
 * §210A measured that sibling properties reach the verifier through the clarification list, the
 * candidate block and the row summary, and §210B-1 built explicit-link isolation for the first two.
 * §212's instruction is narrower than §210B-1's default: DO NOT RESTORE BROAD ROW-LEVEL CONTEXT BY
 * DEFAULT. So the default here is EXCLUDED, and a caller that opts in gets §210B-1's rules
 * unchanged -- including its deliberate timidity, which RETAINS an unbound object rather than
 * guessing. The two are consistent: §210B-1 decides what to do with context that is present, §212
 * decides whether it is present at all.
 */

import type { OwedFact } from '../owed-facts/owed-fact.types';
import {
  type CandidateLike, type ClarificationLike, type IsolationDecision,
  isolateCandidates, isolateClarifications,
} from './section-210b-verifier-payload';
import {
  type Verifier210JView, buildVerifier210jView,
} from './expert-210j-declaration-projection';
import { UNRESOLVED_ACTION_FIELD } from './expert-210j-first-pass-contract';

export const VERIFIER_PAYLOAD_212_VERSION = 'hazlenz.expert.212.verifier-payload.v1' as const;

/** The eleven the §212 authorization requires, in its own order. */
export const REQUIRED_PAYLOAD_FIELDS_212 = [
  'declarationId',
  'owedProperty',
  'branchA',
  'branchB',
  'decisionIfA',
  'decisionIfB',
  'decisionWhileUnresolved',
  'notEstablishedBecause',
  'acceptableEvidence',
  'boundClarification',
  'targetFactKey',
] as const;
export type RequiredPayloadField212 = (typeof REQUIRED_PAYLOAD_FIELDS_212)[number];

/** The single source of each field. `NEW_IN_212` appears exactly once, and the suite asserts it. */
export const PAYLOAD_FIELD_PROVENANCE: Readonly<Record<RequiredPayloadField212, string>> = {
  declarationId: 'NEW_IN_212 — declaration.declarationId, copied verbatim',
  owedProperty: '§210J view.owedProperty — declaration.missingFact via the §210B-1 sidecar, '
    + 'byte-exact',
  branchA: '§210J view.truthBranchA — the pinned projectOwedFact, unchanged',
  branchB: '§210J view.truthBranchB — the pinned projectOwedFact, unchanged',
  decisionIfA: '§210J view.decisionIfA — the pinned decisionDivergence.ifA, unchanged',
  decisionIfB: '§210J view.decisionIfB — the pinned decisionDivergence.ifB, unchanged',
  decisionWhileUnresolved: `§210J view.decisionWhileUnresolved — declaration.${UNRESOLVED_ACTION_FIELD} `
    + 'via the §210J sidecar, byte-exact',
  notEstablishedBecause: '§210J view.verificationGap — the pinned whyUnresolved, unchanged',
  acceptableEvidence: '§210J view.evidenceNeededToSettle.acceptableEvidence — the pinned '
    + 'projection, unchanged',
  boundClarification: '§210J view.evidenceNeededToSettle.clarification — supplied by the caller '
    + 'from the model-authored back-reference',
  targetFactKey: '§210J view.factKey — the computed fact identity',
};

/** Reconstruction routes that are refused rather than merely unused. */
export const NEVER_RECONSTRUCTED_FROM: readonly string[] = [
  'branchA or branchB',
  'notEstablishedBecause',
  'affectedDecision',
  'the observation span',
  'the rationale or any other prose',
];

// ---------------------------------------------------------------- the payload

export interface AcceptableEvidencePayload {
  readonly requirement: string;
  readonly examples: readonly string[];
  readonly insufficientExamples: readonly string[];
}

/** What the verifier is given about the ONE fact under review. */
export interface VerifierFactPayload212 {
  readonly declarationId: string;
  readonly owedProperty: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionIfA: string;
  readonly decisionIfB: string;
  readonly decisionWhileUnresolved: string | null;
  readonly notEstablishedBecause: string | null;
  readonly acceptableEvidence: AcceptableEvidencePayload | null;
  readonly boundClarification: string | null;
  readonly targetFactKey: string;
}

export const ANCILLARY_CONTEXT_DEFAULT = 'EXCLUDED' as const;

export interface AncillaryContext212 {
  readonly included: boolean;
  readonly clarifications: readonly IsolationDecision<ClarificationLike>[];
  readonly candidates: readonly IsolationDecision<CandidateLike>[];
  readonly rule: string;
}

export const REQUEST_REFUSAL_CODES_212 = [
  'OWED_PROPERTY_ABSENT',
  'TARGET_FACT_KEY_ABSENT',
  'DECLARATION_ID_ABSENT',
  'DECLARATION_DOES_NOT_MATCH_THE_TARGET_FACT',
] as const;
export type RequestRefusalCode212 = (typeof REQUEST_REFUSAL_CODES_212)[number];

export interface VerifierRequest212 {
  readonly built: boolean;
  readonly refusedBecause: readonly RequestRefusalCode212[];
  readonly payload: VerifierFactPayload212 | null;
  readonly ancillary: AncillaryContext212;
  /** The §210J view this was assembled from, carried whole so nothing is lost by projecting it. */
  readonly view: Verifier210JView | null;
}

const nonBlank = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/**
 * Build one verifier request for one fact. Total and pure: it copies, refuses, and composes nothing.
 */
export function buildVerifier212Request(args: {
  fact: OwedFact;
  /** The raw first-pass declaration, as it arrived. */
  declaration: Record<string, unknown>;
  unresolvedActionByFactKey: Readonly<Record<string, string>>;
  boundClarification: string | null;
  /** OFF by default. When on, §210B-1's explicit-link rules decide what survives. */
  ancillary?: {
    readonly clarifications: readonly ClarificationLike[];
    readonly candidates: readonly CandidateLike[];
    readonly rowDeclarationIds: readonly string[];
  };
}): VerifierRequest212 {
  const refused: RequestRefusalCode212[] = [];
  const declarationId = args.declaration.declarationId;

  if (!nonBlank(declarationId)) refused.push('DECLARATION_ID_ABSENT');
  if (!nonBlank(args.fact.factKey)) refused.push('TARGET_FACT_KEY_ABSENT');

  const view = buildVerifier210jView({
    fact: args.fact,
    declaration: args.declaration,
    unresolvedActionByFactKey: args.unresolvedActionByFactKey,
    boundClarification: args.boundClarification,
  });

  // The one field with no legitimate fallback. Refuse rather than invent.
  //
  // NOTE ON THE TRIM. §210B-1's `explicitOwedProperty` returns null only for a non-string or a
  // ZERO-LENGTH string, so a whitespace-only property survives it. §201's `attachOwedProperty`
  // trims and refuses. The two disagree, and a property of "   " is not a property. §212 applies
  // the stricter test AT ITS OWN BOUNDARY rather than editing a module whose suite is passing:
  // wiring existing assembly does not mean inheriting the loosest check in the chain.
  if (!nonBlank(view.owedProperty)) refused.push('OWED_PROPERTY_ABSENT');

  const targetId = nonBlank(declarationId) ? declarationId : null;
  const ancillary: AncillaryContext212 = args.ancillary === undefined
    ? {
      included: false, clarifications: [], candidates: [],
      rule: 'ANCILLARY_CONTEXT_DEFAULT = EXCLUDED. §212 does not restore broad row-level context '
        + 'by default; the target property and its own semantic fields are primary.',
    }
    : {
      included: true,
      clarifications: targetId === null ? [] : isolateClarifications(
        args.ancillary.clarifications, targetId, args.ancillary.rowDeclarationIds),
      candidates: targetId === null ? [] : isolateCandidates(
        args.ancillary.candidates, args.ancillary.clarifications, targetId),
      rule: '§210B-1 explicit-link isolation, unchanged: EXCLUDE only an object explicitly bound to '
        + 'a DIFFERENT declaration on this row; RETAIN where the binding is absent or off-row.',
    };

  if (refused.length > 0) {
    return { built: false, refusedBecause: refused, payload: null, ancillary, view: null };
  }

  return {
    built: true,
    refusedBecause: [],
    payload: {
      declarationId: declarationId as string,
      owedProperty: view.owedProperty as string,
      branchA: view.truthBranchA,
      branchB: view.truthBranchB,
      decisionIfA: view.decisionIfA,
      decisionIfB: view.decisionIfB,
      decisionWhileUnresolved: view.decisionWhileUnresolved,
      notEstablishedBecause: view.verificationGap,
      acceptableEvidence: view.evidenceNeededToSettle.acceptableEvidence,
      boundClarification: view.evidenceNeededToSettle.clarification,
      targetFactKey: view.factKey,
    },
    ancillary,
    view,
  };
}

// ---------------------------------------------------------------- rendering

/** The block delimiters. Named once so the reconstruction can find them exactly. */
export const PAYLOAD_BLOCK_OPEN = '================ THE FACT UNDER REVIEW ================' as const;
export const PAYLOAD_BLOCK_CLOSE = '================ END OF THE FACT UNDER REVIEW ================' as const;

const line = (label: string, v: string | null): string =>
  `${label}: ${v === null || v.trim().length === 0 ? '(not supplied)' : v}`;

/**
 * Render the §212 block. Every value is COPIED. Nothing is summarised, re-cased, truncated or
 * regenerated, and an absent optional field renders as an explicit "(not supplied)" rather than as
 * silence a reader could mistake for a value.
 */
export function renderVerifier212Block(p: VerifierFactPayload212): string {
  const out: string[] = [PAYLOAD_BLOCK_OPEN, ''];
  out.push(line('declaration id', p.declarationId));
  out.push(line('fact key', p.targetFactKey));
  out.push('');
  out.push(line('THE PROPERTY THE FIRST PASS NAMED', p.owedProperty));
  out.push('');
  out.push(line('branch A', p.branchA));
  out.push(line('what is done if A is true', p.decisionIfA));
  out.push(line('branch B', p.branchB));
  out.push(line('what is done if B is true', p.decisionIfB));
  out.push(line('what is done while neither is established', p.decisionWhileUnresolved));
  out.push('');
  out.push(line('why the first pass says it is not established', p.notEstablishedBecause));
  out.push(line('the question bound to this fact', p.boundClarification));
  if (p.acceptableEvidence === null) {
    out.push('what would settle it, held by HazLenz: (none held)');
  } else {
    out.push(`what would settle it, held by HazLenz: ${p.acceptableEvidence.requirement}`);
    for (const e of p.acceptableEvidence.examples) out.push(`  would settle: ${e}`);
    for (const e of p.acceptableEvidence.insufficientExamples) {
      out.push(`  would NOT settle: ${e}`);
    }
  }
  out.push('', PAYLOAD_BLOCK_CLOSE, '');
  return out.join('\n');
}

/**
 * Append the block to a base user prompt. ADDITIVE BY CONSTRUCTION: removing the block reproduces
 * the base byte for byte, which is what makes "§212 is v3.2 plus one block" checkable.
 */
export function appendVerifier212Block(basePrompt: string, p: VerifierFactPayload212): string {
  return `${basePrompt}\n${renderVerifier212Block(p)}`;
}

export function stripVerifier212Block(prompt: string): string {
  const start = prompt.indexOf(PAYLOAD_BLOCK_OPEN);
  if (start === -1) throw new Error('VERIFIER_212: payload block not found; cannot reconstruct');
  const end = prompt.indexOf(PAYLOAD_BLOCK_CLOSE, start);
  if (end === -1) throw new Error('VERIFIER_212: payload block is unterminated');
  return prompt.slice(0, start - 1) + prompt.slice(end + PAYLOAD_BLOCK_CLOSE.length + 1);
}

/** Recorded as literals, asserted by the suite. */
export function payloadEffect212(): {
  providerCalls: 0; databaseOperations: 0;
  reconstructsAMissingProperty: false; composesAnyField: false;
  restoresBroadRowContextByDefault: false; addsAKeywordClassifier: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    reconstructsAMissingProperty: false,
    composesAnyField: false,
    restoresBroadRowContextByDefault: false,
    addsAKeywordClassifier: false,
  };
}
