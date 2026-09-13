/**
 * §216 -- STRUCTURAL ENFORCEMENT REVIEW FOR R-V4. ZERO PROVIDER CALLS.
 *
 * ==================== THE QUESTION, AND THE ANSWER ====================
 *
 * §216 asked whether the existing structured contract can safely enforce any part of disposition
 * consistency WITHOUT semantic inference, and named the example: a structured property-identity
 * ground ought to be incompatible with routing the same target through a clarification replacement.
 *
 * IT ALREADY IS, AND NO NEW RULE IS NEEDED. Run against the real admission code, every route by
 * which an output could declare CHALLENGE_FACT_VALIDITY on the target and also propose a
 * clarification for that target is refused today:
 *
 *   no source mode                          SOURCE_MODE_MISSING_ON_A_CLARIFICATION        (v3)
 *   SUPPLIED_FACT without a binding key      BINDING_KEY_MISSING_FOR_SUPPLIED_MODE         (v3)
 *   SUPPLIED_FACT bound to the challenged key  BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY (v3)
 *   NOMINATED_FACT plus a nomination         NOMINATION_OUTSIDE_TARGET_SCOPE               (§214)
 *
 * `CLOSURE_MATRIX` is computed by CALLING those checkers, not by describing them, so the claim is a
 * measurement rather than a comment and a later contract change that opened the hole would fail the
 * suite.
 *
 * ==================== WHAT THIS MEANS FOR R-V4 ====================
 *
 * The §215 defect is therefore NOT that the contract permits an inconsistent disposition. It is that
 * the verifier never declared the mismatch: H1 and H2 emitted BOUND_BY_CLARIFICATION with
 * `challengeGround: null`, which is structurally indistinguishable from a legitimate clarification
 * replacement and which no deterministic rule may separate, because separating them means deciding
 * whether the property is wrong.
 *
 * So R-V4 is instruction-led, and the structural layer's contribution is that once the model DOES
 * declare the ground, the wrong route is already closed to it. That closure is now pinned.
 *
 * ==================== ONE RULE CONSIDERED AND REFUSED ====================
 *
 * See `REFUSED_RULES`. Forbidding VERIFIED_AS_IS alongside a property-identity challenge was
 * considered and NOT added: a challenge addresses the fact and the verdict addresses the
 * clarification layer, so the combination is arguably correct, and a rule that refused it would
 * refuse a right answer. This programme has undone enough overcorrections to know what that costs.
 */

import { checkVerifierV3Output } from './expert-verifier-contract-v3';
import { checkScopeContainment } from './expert-214-scope-containment';

export const DISPOSITION_CLOSURE_216_VERSION =
  'hazlenz.expert.216.disposition-closure.v1' as const;

/** The R-V4 invariant, as data. The model authors the classification; this only records it. */
export const DISPOSITION_INVARIANT = [
  { finding: 'PROPERTY_INVALID', disposition: 'CHALLENGE_FACT_VALIDITY',
    andNot: 'a clarification proposed for that fact, which would preserve it as though only the '
      + 'question were deficient' },
  { finding: 'PROPERTY_VALID_CLARIFICATION_INADEQUATE',
    disposition: 'ADD_OR_REPLACE_CLARIFICATION', andNot: 'a challenge to a property you accept' },
  { finding: 'PROPERTY_VALID_CLARIFICATION_ADEQUATE', disposition: 'VERIFIED_AS_IS', andNot: null },
] as const;

const TARGET = 'FP:target';
const OBSERVATION = 'the observation text used by the closure probe';
const V3_INPUT = {
  analysisId: 'AN', observation: OBSERVATION, suppliedOwedFactKeys: [TARGET],
};
const PROPOSAL = {
  question: 'q', whyItMatters: 'w', affectedDecision: 'REQUIRED_CONTROL', evidenceGap: 'g',
};
const CHALLENGE_DECL = [{
  factKey: TARGET, declaration: 'CHALLENGE_FACT_VALIDITY',
  challengeReason: 'the named property is the evidence for the condition, not the condition',
}];
const NOMINATION = {
  factKey: 'FP:new', missingFact: 'm', observationSpan: OBSERVATION, notEstablishedBecause: 'n',
  affectedDecision: 'REQUIRED_CONTROL', branchA: 'a', decisionIfA: 'x', branchB: 'b',
  decisionIfB: 'y', whyNecessaryNow: 'w',
};

const baseOutput = (over: Record<string, unknown>): Record<string, unknown> => ({
  verifierContractVersion: 'hazlenz.expert.verifier.v3',
  analysisId: 'AN',
  rationale: 'the closure probe',
  clarificationSourceMode: null,
  proposedClarification: null,
  bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: CHALLENGE_DECL,
  ...over,
});

export interface ClosureRow {
  readonly route: string;
  readonly refused: boolean;
  readonly refusedBy: 'V3_ADMISSION' | 'SECTION_214_SCOPE_RULE' | 'NOT_REFUSED';
  readonly codes: readonly string[];
}

/**
 * Every route by which an output could challenge the target's property identity AND still propose a
 * clarification for it. Computed by running the real checkers.
 */
export function closureMatrix(): readonly ClosureRow[] {
  const rows: ClosureRow[] = [];
  const v3 = (route: string, out: Record<string, unknown>): void => {
    const r = checkVerifierV3Output(out, V3_INPUT);
    rows.push({
      route,
      refused: !r.admitted,
      refusedBy: r.admitted ? 'NOT_REFUSED' : 'V3_ADMISSION',
      codes: [...r.codes],
    });
  };

  v3('a proposal with no clarificationSourceMode',
    baseOutput({ verdict: 'ADD_OR_REPLACE_CLARIFICATION', proposedClarification: PROPOSAL }));

  v3('SUPPLIED_FACT mode with no bindingFactKey',
    baseOutput({
      verdict: 'ADD_OR_REPLACE_CLARIFICATION', proposedClarification: PROPOSAL,
      clarificationSourceMode: 'SUPPLIED_FACT',
    }));

  v3('SUPPLIED_FACT mode bound to the CHALLENGED target',
    baseOutput({
      verdict: 'ADD_OR_REPLACE_CLARIFICATION', proposedClarification: PROPOSAL,
      clarificationSourceMode: 'SUPPLIED_FACT', bindingFactKey: TARGET,
    }));

  // The one route v3 admits: route the proposal through a NOMINATION. §214's scope rule closes it.
  const nominated = baseOutput({
    verdict: 'ADD_OR_REPLACE_CLARIFICATION', proposedClarification: PROPOSAL,
    clarificationSourceMode: 'NOMINATED_FACT', nominatedFact: NOMINATION,
  });
  const v3Result = checkVerifierV3Output(nominated, V3_INPUT);
  const scope = checkScopeContainment({
    scope: {
      targetFactKey: TARGET, suppliedFactKeys: [TARGET], multiFactValidationRequested: false,
    },
    output: {
      nominatedFact: NOMINATION, clarificationSourceMode: 'NOMINATED_FACT',
      owedFactDeclarations: CHALLENGE_DECL,
    },
  });
  rows.push({
    route: 'NOMINATED_FACT mode with a nomination',
    refused: !v3Result.admitted || !scope.admitted,
    refusedBy: !v3Result.admitted ? 'V3_ADMISSION'
      : !scope.admitted ? 'SECTION_214_SCOPE_RULE' : 'NOT_REFUSED',
    codes: !v3Result.admitted ? [...v3Result.codes] : [...scope.codes],
  });

  return rows;
}

/** The closure claim, checkable. Every route refused, and by a named existing rule. */
export function dispositionRoutingIsClosed(): boolean {
  const m = closureMatrix();
  return m.length === 4 && m.every(r => r.refused && r.refusedBy !== 'NOT_REFUSED');
}

/** The residual the closure does NOT cover, stated so nobody reads it as more than it is. */
export const CLOSURE_RESIDUAL = {
  whatIsClosed: 'once the model DECLARES CHALLENGE_FACT_VALIDITY on the target, no route remains by '
    + 'which the same output can also propose a clarification for that target',
  whatIsNotClosed: 'a model that simply does not declare the mismatch. §215 H1 and H2 emitted '
    + 'BOUND_BY_CLARIFICATION with challengeGround null, which is structurally identical to a '
    + 'legitimate clarification replacement.',
  whyDeterministicCodeCannotClose_it: 'separating the two means deciding whether the named property '
    + 'is the decision-critical one, which is a semantic judgement this architecture reserves to '
    + 'the model',
  soRV4IsLedBy: 'INSTRUCTION',
} as const;

/** Considered and refused, with the reason. */
export const REFUSED_RULES: readonly { rule: string; refusedBecause: string }[] = [
  {
    rule: 'forbid VERIFIED_AS_IS alongside a property-identity challenge',
    refusedBecause: 'a challenge addresses the FACT and the verdict addresses the CLARIFICATION '
      + 'layer, so the combination may be correct. A rule refusing it would refuse a right answer, '
      + 'and the instruction resolves the ambiguity instead by naming the verdict to use.',
  },
  {
    rule: 'forbid NO_CLARIFICATION_REQUIRED alongside a property-identity challenge',
    refusedBecause: 'whether the unresolved fact changes what is done today is a semantic judgement '
      + 'about the case, not a structural property of the output',
  },
  {
    rule: 'require a representation concern whenever a branch contains an absence phrase',
    refusedBecause: 'that is the keyword classifier the architecture has refused since §160, and '
      + '§214 recorded the same refusal. The absence-is-the-adverse-state exception makes it wrong '
      + 'as well as forbidden.',
  },
];

/**
 * Which verdict accompanies a property-identity challenge. Resolved from the EXISTING vocabulary,
 * so no verdict is added and no schema changes.
 *
 * VERIFIED_AS_IS asserts the first pass asked the right question, which is false when the fact it
 * attaches to is under challenge. NO_CLARIFICATION_REQUIRED asserts the unknown does not change
 * what is done today, which is a different claim. ABSTAIN is documented as asserting nothing, and a
 * verifier that thinks the fact is about the wrong thing genuinely cannot say which clarification
 * is right until that is arbitrated.
 */
export const VERDICT_FOR_A_PROPERTY_CHALLENGE = {
  chosen: 'ABSTAIN',
  because: 'it is the only member that asserts nothing about the clarification layer, which is '
    + 'exactly the position a verifier is in when it says the fact is about the wrong thing',
  rejected: [
    { verdict: 'VERIFIED_AS_IS', because: 'asserts the first pass asked the right question' },
    {
      verdict: 'NO_CLARIFICATION_REQUIRED',
      because: 'asserts the unknown does not change what is done now, which is a different claim',
    },
    {
      verdict: 'ADD_OR_REPLACE_CLARIFICATION',
      because: 'is the routing defect itself, and is structurally closed for a declared challenge',
    },
  ],
  verdictsAdded: [] as readonly string[],
  schemaChanged: false,
} as const;

export function closureEffect216(): {
  providerCalls: 0; databaseOperations: 0;
  addsANewDeterministicRule: false; decidesWhetherAPropertyIsWrong: false;
  weakensTheSection214ScopeRule: false; addsAVerdict: false; changesTheSchema: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    addsANewDeterministicRule: false,
    decidesWhetherAPropertyIsWrong: false,
    weakensTheSection214ScopeRule: false,
    addsAVerdict: false,
    changesTheSchema: false,
  };
}
