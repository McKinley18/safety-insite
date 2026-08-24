/**
 * The output of deterministic validation.
 *
 * DELIBERATELY NOT a customer entity. It carries no governed citation text, no review badge, no
 * release provenance -- those are resolved downstream by the KG subsystem, which is what proves a
 * provider cannot bypass deterministic authority (L3-INV-03, L3-INV-08, L3-INV-09).
 *
 * At L3-1 nothing maps this onto the existing HazLenz customer result. That mapping is L3-3+.
 */
import type {
  ClarificationDecision, EvidenceReference, HazardCandidate, JurisdictionProposal,
  L3AnalysisOutcome, L3ConditionState,
} from './reasoning-contract.types';

export interface ValidatedHazard {
  candidateKey: string;
  hazardFamily: string;
  conditionState: L3ConditionState;
  evidence: EvidenceReference[];
  conditionRationale: string;
  independentHazardRationale: string;
  uncertainties: string[];
  clarification: HazardCandidate['clarification'];
  correctiveActionIntent: HazardCandidate['correctiveActionIntent'];
  riskFactors: HazardCandidate['riskFactors'];
  /** Ids only, already proven to belong to the supplied eligible set. */
  regulatoryCandidateRefs: string[];
}

export interface ValidatedReasoning {
  analysisId: string;
  outcome: L3AnalysisOutcome;
  observationInterpretation: string;
  hazards: ValidatedHazard[];
  jurisdictionProposal: JurisdictionProposal | null;
  /**
   * L3-2i. Decision-critical clarifications the analysis owes that belong to NO hazard candidate --
   * the zero-candidate `INSUFFICIENT_EVIDENCE` case (blueprint section 39.5.1). Always an array,
   * empty when none, so a consumer never has to distinguish "absent" from "none owed".
   * Carries no evidence and no hazard, and confers no authority.
   */
  unresolvedDecisions: ClarificationDecision[];
  validator: {
    inputContractVersion: string;
    proposalContractVersion: string;
    validatorVersion: string;
    validatedAt: string;
  };
}

/** v2 (L3-2i): the validator now also accepts/refuses proposal-level `unresolvedDecisions`. */
export const L3_VALIDATOR_VERSION = 'hazlenz.l3.validator.v2' as const;
