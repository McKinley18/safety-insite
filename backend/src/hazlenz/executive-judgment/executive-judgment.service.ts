export class ExecutiveJudgmentService {
  evaluate(input: any) {
    const riskBand =
      input.risk?.riskBand ||
      input.risk?.operationalRisk?.matrixBand ||
      'Review';

    const normalizedRisk = String(riskBand).toLowerCase();
    const uncontrolledEnergy = !!input.energyTransferIntelligence?.uncontrolledEnergyLikely;
    const contradictions = !!input.contradictionIntelligence?.contradictionsDetected;

    const poorBarriers = ['missing', 'failed', 'inadequate', 'weak'].some((term) =>
      String(input.barrierIntelligence?.barrierAdequacy || '').toLowerCase().includes(term),
    );

    const supervisorReviewRecommended =
      !!input.confidenceIntelligence?.supervisorReviewRecommended ||
      contradictions ||
      uncontrolledEnergy ||
      normalizedRisk.includes('critical') ||
      normalizedRisk.includes('high');

    const stopWorkRecommended =
      uncontrolledEnergy ||
      contradictions ||
      normalizedRisk.includes('critical') ||
      (normalizedRisk.includes('high') && poorBarriers);

    const topStandard = input.standardsReasoning?.topDefensible?.[0] || null;
    const primaryAction =
      input.generatedActions?.[0] ||
      input.controlIntelligence?.recommendedActions?.[0] ||
      null;

    const strongestCausalFactor =
      input.energyTransferIntelligence?.dominantEnergySource
        ? `Dominant energy source: ${input.energyTransferIntelligence.dominantEnergySource}.`
        : input.barrierIntelligence?.barrierReasoning ||
          'Primary causal factor requires qualified review.';

    const topUncertainty =
      input.confidenceIntelligence?.missingCriticalInformation?.[0] ||
      input.evidenceQuality?.gaps?.[0] ||
      'No major uncertainty identified from available evidence.';

    const decisionSummary = stopWorkRecommended
      ? `${input.classification} may require immediate controls or stop-work review.`
      : supervisorReviewRecommended
        ? `${input.classification} should be reviewed by a qualified supervisor.`
        : `${input.classification} is suitable for normal corrective action review.`;

    return {
      classification: input.classification,
      riskBand,
      supervisorReviewRecommended,
      stopWorkRecommended,
      immediateActionRecommended: stopWorkRecommended || supervisorReviewRecommended,
      strongestCausalFactor,
      topUncertainty,
      topStandard: topStandard
        ? {
            citation: topStandard.citation,
            heading: topStandard.heading,
            defensibilityScore: topStandard.defensibilityScore,
            reasoning: topStandard.reasoning,
          }
        : null,
      primaryAction: primaryAction
        ? {
            title: primaryAction.title || primaryAction.action || primaryAction.description,
            priority: primaryAction.priority || primaryAction.priorityCode,
            verification: primaryAction.verification || primaryAction.verificationMethod,
          }
        : null,
      decisionSummary,
      auditReadySummary: [
        decisionSummary,
        strongestCausalFactor,
        `Top uncertainty: ${topUncertainty}`,
        topStandard?.citation ? `Most defensible standard: ${topStandard.citation}` : 'No top standard selected.',
      ].join(' '),
    };
  }
}
