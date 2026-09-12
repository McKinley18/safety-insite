/**
 * §211 -- FIRST-PASS DEVELOPMENT FREEZE RECORD.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * The product owner has frozen first-pass semantic development. This module records WHAT is frozen,
 * WHAT is carried as known risk, and WHAT the status is and is not -- as data a suite can assert,
 * so the freeze cannot quietly drift into an acceptance.
 *
 * ==================== THE FOUR WORDS THIS RECORD EXISTS TO KEEP APART ====================
 *
 * FROZEN is not ACCEPTED, is not PRODUCTION_READY, and is not FIXED. §210H G1 is not repaired and
 * this record says so in a constant rather than in a comment. What changed is not the behaviour but
 * WHERE the architecture places responsibility for catching it.
 */

import { EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION } from './expert-first-pass-instruction-210g';
import {
  FIRST_PASS_CONTRACT_210J_VERSION, UNRESOLVED_ACTION_FIELD,
} from './expert-210j-first-pass-contract';

export const FIRST_PASS_FREEZE_211_VERSION =
  'hazlenz.expert.211.first-pass-freeze.v1' as const;

/** The single permitted status string. Anything else is a different claim. */
export const FIRST_PASS_STATUS = 'DEVELOPMENT_FROZEN_WITH_KNOWN_VERIFIER-CARRIED_RISK' as const;

/** Statuses this freeze is explicitly NOT. Held as data so a suite can assert their absence. */
export const FIRST_PASS_STATUS_IS_NOT: readonly string[] = [
  'ACCEPTED',
  'PRODUCTION_READY',
  'G1_FIXED',
  'VALIDATED',
  'SEMANTICALLY_CORRECT',
];

export const EXPERT_HAZLENZ_OVERALL_STATUS = 'NOT_ACCEPTED_FOR_PRODUCTION' as const;

/** What is frozen, named by the identities that define it. */
export const FROZEN_BASELINE = {
  instruction: EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
  additiveContractSuccessor: FIRST_PASS_CONTRACT_210J_VERSION,
  successorAddedField: UNRESOLVED_ACTION_FIELD,
  note: 'the §210J successor is ADDITIVE to the §210G instruction: §210G is not superseded, and '
    + 'removing the §210J block reproduces it byte for byte.',
} as const;

/**
 * What the established evidence supports. Each entry names the section that measured it, because a
 * freeze justified by unattributed claims is a freeze nobody can re-examine.
 */
export const FREEZE_BASIS: readonly { finding: string; evidence: string }[] = [
  { finding: 'the first pass can emit complete structured unresolved facts',
    evidence: '§208B / §210D / §210F / §210H — declaration counts matched frozen expectations' },
  { finding: 'R5 clarification binding works on targeted hosted evidence',
    evidence: '§210F and §210H — every BLOCKING clarification carried an authored '
      + 'answersUnresolvedFactDeclarationId naming a declaration that exists' },
  { finding: 'R6 fact-local containment works on targeted hosted evidence',
    evidence: '§210F — both positive decisions on the two-fact case stayed local and symmetric. '
      + 'NOT_EXERCISED in §210H by frozen design, and not converted to PASS.' },
  { finding: 'R7 contract completeness and placeholder rejection work',
    evidence: '§210F and §210H — NON_SEMANTIC_PLACEHOLDER_VALUE fired zero times and every branch '
      + 'and decision field carried real content' },
  { finding: 'independent declaration counts and restraint have materially improved',
    evidence: '§210H axis I — no fact the text established was declared, on any case' },
  { finding: 'state-versus-process selection CAN succeed',
    evidence: '§210H G2 — the property was the present physical condition, not the run-down' },
  { finding: 'required-act-as-property narrowing CAN succeed',
    evidence: '§210H G3 — all three mandatory narrowing questions passed on the load-bearing case' },
  { finding: 'the representation can express a latent physical safety state without collapsing '
    + 'evidence into truth',
    evidence: '§210H G2, and §210I which showed the same on the types' },
  { finding: 'action while unresolved, substantive A/B truth, and the eventual established '
    + 'settlement branch are now explicitly represented',
    evidence: '§210J — 98/98, with the two carriers §210I identified as absent' },
  { finding: 'the remaining known weakness is SEMANTIC SELECTION',
    evidence: '§210H G1 — a structurally valid declaration collapsed the underlying safety state '
      + 'into the test used to establish it' },
];

// ---------------------------------------------------------------- the carried risk

export const CARRIED_RISKS = ['KR-1'] as const;
export type CarriedRiskId = (typeof CARRIED_RISKS)[number];

/**
 * KR-1. Carried explicitly, never relabelled.
 *
 * The `status` literal is the point: a later edit that wants to call this closed has to change a
 * typed constant that the suite asserts, rather than soften a sentence.
 */
export const KR_1 = {
  id: 'KR-1' as CarriedRiskId,
  name: 'EVIDENCE_PROXY_PROPERTY_COLLAPSE',
  statement: 'a first-pass declaration may be structurally valid yet select the test, check or '
    + 'verification used to establish a safety state instead of the underlying decision-critical '
    + 'safety property',
  canonicalDevelopmentExample: '§210H G1',
  status: 'OPEN_CARRIED_TO_THE_VERIFIER_LAYER',
  isFixed: false,
  isMitigatedByTheSchemaChange: false,
  whyNotMitigated: '§210J added carriers for the operational consequence under uncertainty and for '
    + 'the established settlement branch. Neither reads the property, and a declaration whose '
    + 'property is evidence-shaped remains structurally valid under the §210J contract.',
  mustBeTestedWith: 'NEW cases exercising the same mechanism',
  mustNotBeTestedWith: 'a replay of §210H G1 scored as behaviour',
  whyNotReplay: 'G1 is the case the mechanism was named from. Scoring the verifier on it would '
    + 'measure the instrument against the example that defined it, and a pass would not '
    + 'generalise. §210H G1 stays what it is: the canonical development example, and evidence '
    + 'that the family exists.',
} as const;

// ---------------------------------------------------------------- the freeze rule

/** The only two things that reopen first-pass semantic development. */
export const FREEZE_EXCEPTIONS = [
  {
    id: 'A',
    condition: 'new contradictory integration evidence showing a safety-critical defect that the '
      + 'verifier cannot reasonably detect or contain',
  },
  {
    id: 'B',
    condition: 'a future product-owner architecture decision explicitly reopening first-pass '
      + 'development',
  },
] as const;

/**
 * The rule that is easiest to break by accident, stated as a literal.
 *
 * When targeted verifier validation surfaces a bad first-pass candidate, the reflex is to fix the
 * prompt. That is exactly the wrong move: the bad candidate is the STIMULUS the verifier is being
 * measured against, and repairing it upstream destroys the measurement.
 */
export const DO_NOT_TUNE_THE_FIRST_PASS_FROM_VERIFIER_FINDINGS = {
  rule: 'do not tune the first-pass prompt merely because a verifier test exposes a bad first-pass '
    + 'candidate',
  because: 'the verifier must FIRST be evaluated on whether it correctly detects, challenges or '
    + 'contains that candidate. A bad candidate is the instrument, not the defect.',
  appliesEvenWhen: 'the first-pass defect is obvious and the prompt fix looks small',
} as const;

/** What the freeze does and does not mean, in the terms the authorization used. */
export const WHAT_THE_FREEZE_MEANS = {
  does: 'the architecture will no longer require the first pass ALONE to guarantee that the '
    + 'proposed unresolved property is semantically correct',
  doesNot: 'that §210H G1 is considered fixed',
} as const;
