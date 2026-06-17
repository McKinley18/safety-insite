"use client";

import SafeScopeObservationUnderstandingSection from "@/components/inspection/SafeScopeObservationUnderstandingSection";
import SafeScopeActionEffectivenessSection from "@/components/inspection/SafeScopeActionEffectivenessSection";
import SafeScopeConfidenceReasonCodes from "@/components/inspection/SafeScopeConfidenceReasonCodes";
import SafeScopeBarrierSection from "@/components/inspection/SafeScopeBarrierSection";
import SafeScopeControlIntelligenceSection from "@/components/inspection/SafeScopeControlIntelligenceSection";
import SafeScopeCorrelationCounterfactual from "@/components/inspection/SafeScopeCorrelationCounterfactual";
import SafeScopeCriticalAlerts from "@/components/inspection/SafeScopeCriticalAlerts";
import SafeScopeCrossDomainSection from "@/components/inspection/SafeScopeCrossDomainSection";
import SafeScopeDecisionExplainabilitySection from "@/components/inspection/SafeScopeDecisionExplainabilitySection";
import SafeScopeEnergyTransferSection from "@/components/inspection/SafeScopeEnergyTransferSection";
import SafeScopeEvidenceQuality from "@/components/inspection/SafeScopeEvidenceQuality";
import SafeScopeEventOperationalState from "@/components/inspection/SafeScopeEventOperationalState";
import SafeScopeExposureAndHazardGraph from "@/components/inspection/SafeScopeExposureAndHazardGraph";
import SafeScopeHumanAndContradiction from "@/components/inspection/SafeScopeHumanAndContradiction";
import SafeScopeMemoryAndDomain from "@/components/inspection/SafeScopeMemoryAndDomain";
import SafeScopeOperationalReasoning from "@/components/inspection/SafeScopeOperationalReasoning";
import SafeScopeReliabilitySection from "@/components/inspection/SafeScopeReliabilitySection";
import SafeScopeReasoningBasisSection from "@/components/inspection/SafeScopeReasoningBasisSection";
import SafeScopeStandardsReasoning from "@/components/inspection/SafeScopeStandardsReasoning";
import SafeScopeStandardsTraceabilitySection from "@/components/inspection/SafeScopeStandardsTraceabilitySection";
import SafeScopeTrendIntelligence from "@/components/inspection/SafeScopeTrendIntelligence";

type SafeScopeAdvancedReasoningProps = {
  safeScopeResult: any;
};

export default function SafeScopeAdvancedReasoning({
  safeScopeResult,
}: SafeScopeAdvancedReasoningProps) {
  return (
    <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
      <SafeScopeObservationUnderstandingSection safeScopeResult={safeScopeResult} />

      <SafeScopeReasoningBasisSection safeScopeResult={safeScopeResult} />

      <SafeScopeConfidenceReasonCodes safeScopeResult={safeScopeResult} />

      <SafeScopeTrendIntelligence safeScopeResult={safeScopeResult} />

      <SafeScopeEvidenceQuality safeScopeResult={safeScopeResult} />

      <SafeScopeStandardsReasoning safeScopeResult={safeScopeResult} />

      <SafeScopeStandardsTraceabilitySection safeScopeResult={safeScopeResult} />

      <SafeScopeEventOperationalState safeScopeResult={safeScopeResult} />

      <SafeScopeHumanAndContradiction safeScopeResult={safeScopeResult} />

      <SafeScopeExposureAndHazardGraph safeScopeResult={safeScopeResult} />

      <SafeScopeCorrelationCounterfactual safeScopeResult={safeScopeResult} />

      <SafeScopeMemoryAndDomain safeScopeResult={safeScopeResult} />

      <SafeScopeCrossDomainSection safeScopeResult={safeScopeResult} />

      <SafeScopeReliabilitySection safeScopeResult={safeScopeResult} />

      <SafeScopeDecisionExplainabilitySection
        safeScopeResult={safeScopeResult}
      />

      <SafeScopeEnergyTransferSection safeScopeResult={safeScopeResult} />

      <SafeScopeBarrierSection safeScopeResult={safeScopeResult} />

      <SafeScopeActionEffectivenessSection safeScopeResult={safeScopeResult} />

      <SafeScopeControlIntelligenceSection safeScopeResult={safeScopeResult} />

      <SafeScopeOperationalReasoning safeScopeResult={safeScopeResult} />

      <SafeScopeCriticalAlerts safeScopeResult={safeScopeResult} />
    </div>
  );
}
