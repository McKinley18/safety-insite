/**
 * §214 -- R-V3 DETERMINISTIC HALF: FACT-SCOPE CONTAINMENT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT WIRED TO PRODUCTION.
 *
 * ==================== WHAT §213 T6 ACTUALLY DID ====================
 *
 * Both calls bound the correct target and proposed the correct question for it. HF-3 stayed clean
 * and target-key integrity was never in doubt. Each call then ALSO nominated the sibling fact as a
 * new owed fact. The authorization names this precisely: it is FACT-SCOPE EXPANSION, not target-key
 * corruption, and the two need different remedies.
 *
 * ==================== WHY THIS HALF CAN BE DETERMINISTIC ====================
 *
 * Deciding whether a nominated fact is "really" a sibling would be semantic and is refused. Deciding
 * whether the REQUEST ASKED FOR ONE is not: the §212 request supplies exactly one owed fact and does
 * not ask for multi-fact validation, so a structured nomination is out of scope by the shape of the
 * request rather than by the meaning of its contents.
 *
 * The rule is therefore CONTRACT-DRIVEN and not hard-coded. `multiFactValidationRequested` is an
 * explicit field on the scope declaration; when a future contract genuinely asks for linked-fact
 * validation it sets that flag and the rule stands down. Nothing here reads a nomination's text.
 *
 * ==================== WHAT IT DOES NOT TOUCH ====================
 *
 * The v3 nomination path is unchanged and still legal wherever the request asks for it. No verdict,
 * challenge ground, mismatch kind or representation concern is added. Free-text reasoning is never
 * inspected: mentioning a sibling in prose is explicitly permitted by the authorization and by the
 * §214 instruction block, and no rule here can see prose at all.
 */

export const SCOPE_CONTAINMENT_214_VERSION = 'hazlenz.expert.214.scope-containment.v1' as const;

/** The scope a request declares. Single-target is what the §212 payload builder produces. */
export interface RequestScope214 {
  /** The one fact under review. */
  readonly targetFactKey: string;
  /** Every owed-fact key the request supplied. Exactly one under the §212 payload. */
  readonly suppliedFactKeys: readonly string[];
  /** FALSE unless a future contract genuinely asks for linked-fact validation. */
  readonly multiFactValidationRequested: boolean;
}

export const SCOPE_ADMISSION_CODES_214 = [
  'NOMINATION_OUTSIDE_TARGET_SCOPE',
  'CLARIFICATION_BOUND_TO_A_NOMINATION_OUTSIDE_SCOPE',
  'SOURCE_MODE_CLAIMS_A_NOMINATION_OUTSIDE_SCOPE',
  'DECLARED_KEY_NOT_SUPPLIED',
  'TARGET_FACT_NOT_DECLARED',
] as const;
export type ScopeAdmissionCode214 = (typeof SCOPE_ADMISSION_CODES_214)[number];

/** Source modes that assert a nomination. Membership only; no text is read. */
export const NOMINATING_SOURCE_MODES: readonly string[] = [
  'NOMINATED_FACT', 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
];

export interface ScopeCheckInput {
  readonly scope: RequestScope214;
  /** The verifier output, as returned. Only presence and identifiers are consulted. */
  readonly output: {
    readonly nominatedFact?: unknown;
    readonly clarificationSourceMode?: unknown;
    readonly owedFactDeclarations?: readonly { readonly factKey?: unknown }[];
  };
}

export interface ScopeCheckResult {
  readonly admitted: boolean;
  readonly codes: readonly ScopeAdmissionCode214[];
  readonly detail: readonly string[];
  /** True when the request genuinely asked for more than the target. */
  readonly multiFactRequested: boolean;
}

/**
 * Apply the scope rule. Presence, identifiers and request shape only.
 *
 * A `nominatedFact` is refused when the request supplied one fact and did not ask for multi-fact
 * validation. Nothing decides whether the nomination was a good idea, whether it names a sibling, or
 * what it says -- only that the request did not ask for it.
 */
export function checkScopeContainment(input: ScopeCheckInput): ScopeCheckResult {
  const codes: ScopeAdmissionCode214[] = [];
  const detail: string[] = [];
  const { scope, output } = input;
  const singleTarget = scope.suppliedFactKeys.length === 1
    && !scope.multiFactValidationRequested;

  const fail = (c: ScopeAdmissionCode214, why: string): void => { codes.push(c); detail.push(why); };

  const declared = (output.owedFactDeclarations ?? []).map(d => String(d?.factKey ?? ''));
  for (const k of declared) {
    if (!scope.suppliedFactKeys.includes(k)) {
      fail('DECLARED_KEY_NOT_SUPPLIED', `${JSON.stringify(k.slice(0, 48))} was not supplied`);
    }
  }
  if (!declared.includes(scope.targetFactKey)) {
    fail('TARGET_FACT_NOT_DECLARED', `${scope.targetFactKey} carries no declaration`);
  }

  if (singleTarget) {
    if (output.nominatedFact !== null && output.nominatedFact !== undefined) {
      fail('NOMINATION_OUTSIDE_TARGET_SCOPE',
        'the request supplied one fact and did not ask for linked-fact validation, so a structured '
        + 'nomination is outside the review scope. Mentioning another issue in reasoning is legal; '
        + 'raising it as a fact here is not.');
    }
    const mode = output.clarificationSourceMode;
    if (typeof mode === 'string' && NOMINATING_SOURCE_MODES.includes(mode)) {
      fail('SOURCE_MODE_CLAIMS_A_NOMINATION_OUTSIDE_SCOPE', String(mode));
      fail('CLARIFICATION_BOUND_TO_A_NOMINATION_OUTSIDE_SCOPE',
        'a proposed clarification that answers a nominated fact cannot be the correction for the '
        + 'target fact');
    }
  }

  return { admitted: codes.length === 0, codes, detail, multiFactRequested: !singleTarget };
}

/** What this rule reads, and what it never reads. Asserted by the suite as literals. */
export function scopeContainmentEffect(): {
  readsNominationText: false; readsRationaleProse: false; readsAnyFreeText: false;
  addsAVerdict: false; addsAChallengeGround: false; usesAKeywordList: false;
  contractDriven: true;
} {
  return {
    readsNominationText: false,
    readsRationaleProse: false,
    readsAnyFreeText: false,
    addsAVerdict: false,
    addsAChallengeGround: false,
    usesAKeywordList: false,
    contractDriven: true,
  };
}

/** The exact fields consulted. Exported so the suite counts them rather than trusting a sentence. */
export const SCOPE_DECISION_INPUTS: readonly string[] = [
  'scope.suppliedFactKeys.length',
  'scope.multiFactValidationRequested',
  'scope.targetFactKey',
  'output.nominatedFact (presence only)',
  'output.clarificationSourceMode (closed-set membership only)',
  'output.owedFactDeclarations[].factKey (exact string equality only)',
];
