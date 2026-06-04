export class StandardsReasoningService {
  evaluate(input: {
    classification: string;
    standards?: any[];
    operationalReasoning?: any;
    expandedContext?: any;
    risk?: any;
    domainIntelligence?: any;
    crossDomainInteraction?: any;
  }) {
    const ranked = (input.standards || []).map((standard: any) => {
      let defensibilityScore = 0.5;

      if (standard.source?.includes?.('curated')) defensibilityScore += 0.15;
      if (standard.source?.includes?.('cfr_database')) defensibilityScore += 0.15;

      if (input.operationalReasoning?.exposurePathways?.length) {
        defensibilityScore += 0.08;
      }

      if (input.risk?.requiresShutdown) {
        defensibilityScore += 0.05;
      }

      if (input.expandedContext?.environment) {
        defensibilityScore += 0.04;
      }

      const domainBoost = this.calculateDomainBoost(
        standard,
        input.domainIntelligence,
        input.crossDomainInteraction,
      );

      defensibilityScore += domainBoost;
      defensibilityScore = Math.min(0.99, Number(defensibilityScore.toFixed(2)));

      return {
        ...standard,
        defensibilityScore,
        domainBoost,
        applicabilityConfidence:
          defensibilityScore >= 0.85
            ? "high"
            : defensibilityScore >= 0.7
              ? "medium"
              : "low",
        reasoning:
          domainBoost > 0
            ? `Standard matched using operational context plus specialized domain intelligence.`
            : `Standard matched using hazard classification, operational context, exposure pathways, and contextual risk indicators.`,
      };
    });

    const topDefensible = [...ranked]
      .sort((a, b) => b.defensibilityScore - a.defensibilityScore)
      .slice(0, 5);

    return {
      topDefensible,
      summary:
        topDefensible.length
          ? "Standards ranked using operational defensibility analysis."
          : "No defensible standards identified.",
    };
  }

  private calculateDomainBoost(
    standard: any,
    domainIntelligence?: any,
    crossDomainInteraction?: any,
  ) {
    const citation = String(standard?.citation || '').toLowerCase();
    let boost = 0;

    if (domainIntelligence?.confinedSpace && citation.includes('1910.146')) boost += 0.08;
    if (domainIntelligence?.loto && citation.includes('1910.147')) boost += 0.08;
    if (domainIntelligence?.mobileEquipment && (citation.includes('56.9100') || citation.includes('1926.601') || citation.includes('1910.178'))) boost += 0.08;
    if (domainIntelligence?.trenching && (citation.includes('1926.651') || citation.includes('1926.652') || citation.includes('subpart p'))) boost += 0.08;
    if (domainIntelligence?.electrical && (citation.includes('1910.333') || citation.includes('1926.416') || citation.includes('12016'))) boost += 0.08;
    if (domainIntelligence?.liftingRigging && (citation.includes('1910.184') || citation.includes('1926.251') || citation.includes('16009'))) boost += 0.08;
    if (domainIntelligence?.hazcomGhs && (citation.includes('1910.1200') || citation.includes('part 47') || citation.includes('1926.59'))) boost += 0.08;

    if (crossDomainInteraction?.interactions?.length) boost += 0.03;

    return Math.min(0.12, boost);
  }
}
