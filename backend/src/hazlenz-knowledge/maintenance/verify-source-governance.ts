import {
  getSourceGovernance,
  type SourceGovernanceInput,
} from "../sources/source-governance-helper";

const samples: Array<SourceGovernanceInput & { title: string }> = [
  {
    title: "Tier 1 Regulation",
    sourceType: "regulation",
    sourceRole: "regulatory_citation",
    authorityTier: 1,
  },
  {
    title: "OSHA Standard Interpretation",
    sourceType: "standard_interpretation",
    sourceRole: "official_interpretation",
    authorityTier: 2,
  },
  {
    title: "MSHA Fatality Alert",
    sourceType: "fatality_alert",
    sourceRole: "supporting_reference",
    authorityTier: 3,
  },
  {
    title: "MSHA Safety Alert",
    sourceType: "best_practice_guidance",
    sourceRole: "safety_alert_or_best_practice",
    authorityTier: 4,
  },
  {
    title: "Internal Site Memory",
    sourceType: "internal_site_memory",
    sourceRole: "supporting_reference",
    authorityTier: 5,
  },
  {
    title: "Hypothetical Consensus Standard",
    sourceType: "consensus_standard",
    sourceRole: "supporting_reference",
    authorityTier: 2,
  },
  {
    title: "NIOSH Mining Publication",
    sourceType: "niosh_mining_publication",
    sourceRole: "supporting_reference",
    authorityTier: 3,
  },
];

for (const sample of samples) {
  const governance = getSourceGovernance(sample);

  console.log("\n---");
  console.log(`Source: ${sample.title}`);
  console.log(`SourceType: ${sample.sourceType}`);
  console.log(`SourceRole: ${sample.sourceRole}`);
  console.log(`AuthorityRole: ${governance.authorityRole}`);
  console.log(`ReasoningUse: ${governance.reasoningUse}`);
  console.log(
    `TrustLimits: cite=${governance.trustLimits.canCiteAsStandard}, corrective=${governance.trustLimits.canSupportCorrectiveAction}, health=${governance.trustLimits.canSupportHealthRiskReasoning}, review=${governance.trustLimits.requiresHumanReview}, noOverride=${governance.trustLimits.shouldNotOverrideRegulation}, license=${governance.trustLimits.requiresLicenseCheck}, refresh=${governance.trustLimits.refreshRecommended}`,
  );
  console.log(`GovernanceNote: ${governance.governanceNote}`);
}
