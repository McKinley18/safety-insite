/**
 * §236 -- SMALL HOSTED CONFIRMATION: DESIGN ONLY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * This is a PROPOSAL, not an instrument. The nine observations are deliberately NOT authored here.
 *
 * That is the same gate §233 used before §234: the product owner approves the composition, the
 * budget and the pass rule FIRST, and the cases are authored, preflighted and frozen inside the
 * authorized slice. Authoring them now would put nine frozen observations in the tree ahead of the
 * authorization that decides whether they should exist, and would invite the composition to drift
 * toward cases that happen to be easy to write.
 */

export const DESIGN_236_VERSION = 'hazlenz.expert.236.hosted-confirmation-design.v1' as const;

export const HOSTED_QUESTION_236 =
  'DOES THE STABILIZED CONTRACT ARRIVE IN ADMISSIBLE FORM, AND DOES HAZLENZ PRESERVE AN ESTABLISHED '
  + 'CONTROLLING POSTURE WITHOUT MANUFACTURING UNCERTAINTY?' as const;

export const WHAT_IT_IS_NOT_236: readonly string[] = [
  'not a rerun of §234, whose sixteen cases are spent validation evidence',
  'not final Expert acceptance, and it may not become the successor acceptance cohort',
  'not a paired attribution arm: the §235 authorization forbids one and the question does not ask '
    + 'what the change is attributable to',
  'not broad regression characterization and not prompt development',
];

export interface SlotDesign236 {
  readonly slot: string;
  readonly count: number;
  readonly purpose: string;
  readonly whatTheCaseMustContain: readonly string[];
  readonly whatItProves: string;
  readonly frozenTruthFieldsRequired: readonly string[];
}

/**
 * NINE CALLS, inside the authorized eight to ten. Three, three and three.
 *
 * A note on the wire-stress slot, because it is easy to mis-specify. A case cannot force a provider
 * to emit a `parameters` envelope or a stringified object. What a case CAN do is reproduce the
 * conditions under which §234 observed those shapes: a long, structurally demanding answer with
 * many candidates, several declarations and a clarification, on the larger §235 payload. The slot
 * measures ARRIVAL, and the deterministic outcome it reports is whether the analysis was admitted
 * without normalization, admitted after safe normalization, or refused fail-closed.
 */
export const SLOT_DESIGN_236: readonly SlotDesign236[] = [
  {
    slot: 'WIRE_ARRIVAL_STRESS',
    count: 3,
    purpose: 'measure whether the stabilized contract arrives in admissible form when the answer is '
      + 'long and structurally demanding, which is where §234 lost six of sixteen.',
    whatTheCaseMustContain: [
      'a setting carrying at least four genuinely distinct hazard candidates, so the candidate array '
        + 'is long',
      'at least two decision-critical unresolved properties, so the declaration array is long',
      'at least one clarification the model should want to raise',
      'no single dominant hazard, so the answer cannot be short',
    ],
    whatItProves: 'the arrival rate of an admissible §235 analysis, and which of the three '
      + 'normalization outcomes each call took. A case that arrives clean and a case that arrives '
      + 'clean only after safe normalization are recorded separately, because they are different '
      + 'facts about the interface.',
    frozenTruthFieldsRequired: ['expectedPosture', 'controllingSafetyProperty',
      'controllingPropertyState', 'expectedCandidateCountAtLeast', 'expectedDeclarationCountAtLeast'],
  },
  {
    slot: 'ESTABLISHED_PROPERTY_TRAP',
    count: 3,
    purpose: 'measure the manufactured-uncertainty repair on cases the model has not seen, and '
      + 'measure the overcorrection it could cause.',
    whatTheCaseMustContain: [
      'TWO cases where an established controlling property independently requires cessation, and '
        + 'where a plausible "but perhaps it is not as bad as it looks" question is available to be '
        + 'invented. Expected posture STOP. One of the two must ALSO carry a genuinely separate '
        + 'decision-critical unresolved property, so the correct answer is STOP with a real '
        + 'declaration alongside it, not STOP with nothing declared.',
      'ONE case where the controlling property is genuinely unresolved and nothing established '
        + 'requires cessation. Expected posture HOLD_PENDING_VERIFICATION. This is the '
        + 'OVERCORRECTION GUARD and it is not optional: a §235 that turns holds into stops has '
        + 'failed, not passed.',
    ],
    whatItProves: 'whether an established controlling posture survives, whether the cessation list '
      + 'is populated when it should be and left empty when it should be, and whether legitimate '
      + 'unresolved facts are still declared.',
    frozenTruthFieldsRequired: ['expectedPosture', 'controllingSafetyProperty',
      'controllingPropertyState', 'expectedCessationListNonEmpty',
      'expectedSeparateUnresolvedProperty', 'whyEachOtherPostureIsWrong'],
  },
  {
    slot: 'NEIGHBOURING_DEGREE',
    count: 3,
    purpose: 'confirm that aligning the contract and adding P7 did not move the ordinary degree '
      + 'judgment, on the three adjacent boundaries.',
    whatTheCaseMustContain: [
      'one CONTINUE versus CONTINUE_WITH_CONTROLS boundary case, correct only if nothing escalates',
      'one CONTINUE_WITH_CONTROLS versus HOLD_PENDING_VERIFICATION boundary case where the '
        + 'verification may legitimately run alongside continued work',
      'one HOLD_PENDING_VERIFICATION versus STOP boundary case where nobody is exposed and the work '
        + 'waits on a result',
    ],
    whatItProves: 'that §235 is a stabilization rather than a behavioural change, or that it is not.',
    frozenTruthFieldsRequired: ['expectedPosture', 'controllingSafetyProperty',
      'controllingPropertyState', 'whyEachOtherPostureIsWrong'],
  },
];

export const FRESHNESS_236 = {
  rule: 'no §236 case may reuse the subject, industry, equipment, observation or fact pattern of '
    + 'any §221, §225, §227, §228, §230/§231 or §234 case, and none may be derived by paraphrasing '
    + 'a §234 failure.',
  section234SubjectsExcluded: [
    'municipal water treatment chlorine store', 'hot dip galvanizing kettle',
    'glass container forming machine', 'brewery fermenting cellar',
    'materials recovery picking cabin', 'ro-ro ferry vehicle deck', 'theatre orchestra pit lift',
    'hotel cooling tower', 'ship repair ballast tank', 'coreless induction furnace',
    'telephone exchange battery room', 'aircraft maintenance hangar jacking',
    'chemical warehouse oxidiser bay', 'tyre retreading autoclave',
    'magnetic resonance imaging suite', 'scrap metal yard gas cutting',
  ],
  section235FixtureSubjectsExcluded: [
    'paper guillotine two-hand control -- used as the LOCAL manufactured-uncertainty trap. The '
      + 'hosted trap must be a different subject, or the hosted call measures a fixture.',
  ],
  checkedMechanically: 'the §236 preflight must repeat the §234 P10, P11 and P12 checks: excluded '
    + 'subject terms, token-overlap against the thirty §230 observations AND the sixteen §234 '
    + 'observations, and no intra-cohort paraphrase.',
} as const;

export const PASS_RULE_236 = {
  arrival: {
    rule: '9 / 9 analyses admitted by the §235 projection.',
    admittedAfterSafeNormalizationCountsAsAdmitted: true,
    whyThatIsFair: 'normalization changes the container and never the content, and every parse is '
      + 'accepted only against the schema that was transmitted. An analysis recovered that way is '
      + 'the analysis the model produced.',
    recordedSeparately: 'how many of the nine needed normalization at all, and which action. That '
      + 'number is the honest measure of interface stability and it must be reported even on a pass.',
  },
  establishedPosture: {
    rule: '3 / 3 on the trap slot, by exact posture identity against the frozen truth.',
    zeroToleranceFor: 'an established controlling property downgraded to HOLD_PENDING_VERIFICATION '
      + 'by a manufactured unresolved fact.',
    overcorrectionGuard: 'the HOLD case in this slot must come back HOLD_PENDING_VERIFICATION. A '
      + 'STOP there fails §236 exactly as an unsafe downgrade does.',
  },
  neighbouringDegree: {
    rule: '3 / 3 exact posture identity.',
    note: 'at n=3 this cannot establish that degree judgment is sound. It can show that §235 broke '
      + 'it, which is what a stabilization slice needs to know.',
  },
  structural: {
    rule: '0 refusals on any §233 or §235 code across all nine, after safe normalization.',
    andSpecifically: '0 refusals on the three rules §235 added to the transmitted instruction. A '
      + 'refusal there would mean the model was told the rule and still broke it, which is a '
      + 'different and more serious finding than §234 recorded.',
  },
  manufacturedDeclarations: {
    rule: '0, by the frozen §234 manufactured-declaration test, carried forward unchanged.',
  },
  whatAPassDoesNotLicense:
    'n=9 is a confirmation, not a measurement. A pass authorizes freezing the successor candidate '
    + 'and designing ONE genuinely fresh final acceptance. It does not license another '
    + 'characterization phase and it is not an accuracy rate.',
} as const;

export const CALL_PLAN_236 = {
  arms: 1,
  pairedAttributionArm: 'NOT PROPOSED. The §235 authorization forbids it.',
  legs: ['FIRST_PASS'],
  verifierLeg: 'NOT PROPOSED',
  primaryCalls: 9,
  retriesRequested: 1,
  retriesSpendableOnlyFor: ['TRANSPORT_FAILURE', 'HTTP_FAILURE'],
  maximumTotalCalls: 10,
  costBasis: '§234 CALL-LEDGER-234 measured mean USD 0.099861 over 16 calls, maximum USD 0.121058, '
    + 'mean input 35,026 tokens and mean output 2,981 tokens. No estimate is carried over from §231.',
  section235PayloadUplift: 'the §235 system prompt is 76,817 bytes against the §233 73,499, and the '
    + 'posture schema gains one array property. Roughly a 5 per cent input uplift.',
  projectedSpendUsd: 0.945,
  worstCaseSpendUsd: 1.28,
  recommendedHardCeilingUsd: 1.40,
  maxTokens: 8000,
  maxTokensRationale: 'carried forward from §234, where it was load-bearing: the longest output was '
    + '5,100 tokens and a second was 4,306, so the older 4,000 ceiling would have truncated two of '
    + 'sixteen. The wire-stress slot is designed to produce longer answers still.',
  databaseOperations: 0,
} as const;

export const FAILURE_PATH_236 = {
  classifyBeforeRemediating: true,
  ifStillPrimarilyWireInstability:
    'if analyses still fail to arrive admissibly with the contract aligned and safe normalization '
    + 'in place, the finding is NOT another prompt or schema defect. It is that the provider '
    + 'structured-output interface may be unsuitable for this product boundary at this payload '
    + 'size, and that is a product-owner question about the interface, not an engineering question '
    + 'about the prompt.',
  ifEstablishedPropertyDowngradePersists:
    'treat it as the remaining semantic blocker. P7 is a floor: it constrains an analysis that has '
    + 'NAMED an established cessation condition and does not force one to be named. If the model '
    + 'simply leaves the list empty on cases that warrant it, no further instruction will fix that '
    + 'and the question becomes a capability decision.',
  doNotKeepExpandingPrompts:
    'the §235 block already adds 3,318 bytes to a 73,499-byte prompt. A third cycle of prompt '
    + 'growth against the same defect is the pattern §233 and §234 both warned about.',
} as const;

export function designIdentity236(): Record<string, unknown> {
  return {
    version: DESIGN_236_VERSION,
    hostedQuestion: HOSTED_QUESTION_236,
    slots: SLOT_DESIGN_236.map(s => ({ slot: s.slot, count: s.count })),
    totalPrimaryCalls: SLOT_DESIGN_236.reduce((n, s) => n + s.count, 0),
    casesAuthored: 0,
    executionAuthorized: false,
    executionRequires: 'a separate product-owner authorization naming this composition, the call '
      + 'budget and the pass rule',
  };
}
