import { writeFileSync } from 'fs';
import {
  EPISTEMIC_REPRESENTATION_VERSION, PROVIDER_CALLS, DATABASE_OPERATIONS, CARRIER_AUDIT,
  conceptsWithNoFirstClassCarrier, RECOMMENDED_CHANGES, VERIFICATION_STATE_ENUM_REJECTED,
  NO_DIVERGENCE_RULE_AGAINST_DECISION_IF_B, NO_SEMANTIC_MATCHER_ADDED, TWO_BRANCH_MODEL_PRESERVED,
  CONCEPT_A_DEFERRED_TO_201, GATE_12_DISPOSITION, truthByVerificationMatrix,
  settledBranchDiscrimination, EPISTEMIC_FIXTURES, checkFixture, WHAT_THIS_DOES_NOT_ESTABLISH,
  STATUS_ENUM_UNCHANGED,
} from './lib/expert-210i-epistemic-representation';

const out = {
  version: EPISTEMIC_REPRESENTATION_VERSION,
  section: '210I',
  terminal: 'EXPERT_HAZLENZ_EPISTEMIC_REPRESENTATION_GAP_CONFIRMED — BOUNDED_SCHEMA_REMEDIATION_REQUIRED',
  terminalCaveat: 'the representation is expressively SUFFICIENT (§210H G2 and G3 prove the correct '
    + 'entry is writable with the existing fields) and structurally INCOMPLETE (two core concepts '
    + 'have no first-class carrier). Neither offered terminal states both halves; the gap and the '
    + 'G1 defect are related but not identical.',
  providerCalls: PROVIDER_CALLS,
  databaseOperations: DATABASE_OPERATIONS,
  conceptsWithNoFirstClassCarrier: conceptsWithNoFirstClassCarrier(),
  carrierAudit: CARRIER_AUDIT,
  recommendedChanges: RECOMMENDED_CHANGES,
  refused: {
    firstPassVerificationStateEnum: VERIFICATION_STATE_ENUM_REJECTED,
    divergenceRuleAgainstDecisionIfB: NO_DIVERGENCE_RULE_AGAINST_DECISION_IF_B,
    semanticMatcher: NO_SEMANTIC_MATCHER_ADDED,
  },
  twoBranchModel: TWO_BRANCH_MODEL_PRESERVED,
  conceptADeferred: CONCEPT_A_DEFERRED_TO_201,
  gate12: GATE_12_DISPOSITION,
  truthByVerificationMatrix: truthByVerificationMatrix(),
  settledBranchDiscrimination: settledBranchDiscrimination(),
  fixtures: EPISTEMIC_FIXTURES.map(f => {
    const checks = checkFixture(f);
    return {
      id: f.id, title: f.title, mustExpress: f.mustExpress,
      declarations: f.declarations.length, checks: checks.length,
      allHeld: checks.every(c => c.held), mustNotAssert: f.mustNotAssert,
    };
  }),
  whatThisDoesNotEstablish: WHAT_THIS_DOES_NOT_ESTABLISH,
  statusEnumUnchanged: STATUS_ENUM_UNCHANGED,
};

writeFileSync(
  '../verification/expert-hazlenz-210i-epistemic-representation-review-2026-09-09/'
  + 'EPISTEMIC-REPRESENTATION-REVIEW-210I.json',
  JSON.stringify(out, null, 2) + '\n');
console.log('json written; every fixture held:', out.fixtures.every(f => f.allHeld));
