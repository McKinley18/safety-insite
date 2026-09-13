"use client";

import HazLenzObservationUnderstandingSection from "@/components/inspection/HazLenzObservationUnderstandingSection";
import HazLenzActionEffectivenessSection from "@/components/inspection/HazLenzActionEffectivenessSection";
import HazLenzConfidenceReasonCodes from "@/components/inspection/HazLenzConfidenceReasonCodes";
import HazLenzBarrierSection from "@/components/inspection/HazLenzBarrierSection";
import HazLenzControlIntelligenceSection from "@/components/inspection/HazLenzControlIntelligenceSection";
import HazLenzCorrelationCounterfactual from "@/components/inspection/HazLenzCorrelationCounterfactual";
import HazLenzCriticalAlerts from "@/components/inspection/HazLenzCriticalAlerts";
import HazLenzCrossDomainSection from "@/components/inspection/HazLenzCrossDomainSection";
import HazLenzDecisionExplainabilitySection from "@/components/inspection/HazLenzDecisionExplainabilitySection";
import HazLenzEnergyTransferSection from "@/components/inspection/HazLenzEnergyTransferSection";
import HazLenzEvidenceQuality from "@/components/inspection/HazLenzEvidenceQuality";
import HazLenzEventOperationalState from "@/components/inspection/HazLenzEventOperationalState";
import HazLenzExposureAndHazardGraph from "@/components/inspection/HazLenzExposureAndHazardGraph";
import HazLenzHumanAndContradiction from "@/components/inspection/HazLenzHumanAndContradiction";
import HazLenzMemoryAndDomain from "@/components/inspection/HazLenzMemoryAndDomain";
import HazLenzOperationalReasoning from "@/components/inspection/HazLenzOperationalReasoning";
import HazLenzReliabilitySection from "@/components/inspection/HazLenzReliabilitySection";
import HazLenzReasoningBasisSection from "@/components/inspection/HazLenzReasoningBasisSection";
import HazLenzStandardsReasoning from "@/components/inspection/HazLenzStandardsReasoning";
import HazLenzStandardsTraceabilitySection from "@/components/inspection/HazLenzStandardsTraceabilitySection";
import HazLenzTrendIntelligence from "@/components/inspection/HazLenzTrendIntelligence";

type HazLenzAdvancedReasoningProps = {
  safeScopeResult: any;
};

export default function HazLenzAdvancedReasoning({
  safeScopeResult,
}: HazLenzAdvancedReasoningProps) {
  return (
    <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
      <HazLenzObservationUnderstandingSection safeScopeResult={safeScopeResult} />

      <HazLenzReasoningBasisSection safeScopeResult={safeScopeResult} />

      <HazLenzConfidenceReasonCodes safeScopeResult={safeScopeResult} />

      <HazLenzTrendIntelligence safeScopeResult={safeScopeResult} />

      <HazLenzEvidenceQuality safeScopeResult={safeScopeResult} />

      <HazLenzStandardsReasoning safeScopeResult={safeScopeResult} />

      <HazLenzStandardsTraceabilitySection safeScopeResult={safeScopeResult} />

      <HazLenzEventOperationalState safeScopeResult={safeScopeResult} />

      <HazLenzHumanAndContradiction safeScopeResult={safeScopeResult} />

      <HazLenzExposureAndHazardGraph safeScopeResult={safeScopeResult} />

      <HazLenzCorrelationCounterfactual safeScopeResult={safeScopeResult} />

      <HazLenzMemoryAndDomain safeScopeResult={safeScopeResult} />

      <HazLenzCrossDomainSection safeScopeResult={safeScopeResult} />

      <HazLenzReliabilitySection safeScopeResult={safeScopeResult} />

      <HazLenzDecisionExplainabilitySection
        safeScopeResult={safeScopeResult}
      />

      <HazLenzEnergyTransferSection safeScopeResult={safeScopeResult} />

      <HazLenzBarrierSection safeScopeResult={safeScopeResult} />

      <HazLenzActionEffectivenessSection safeScopeResult={safeScopeResult} />

      <HazLenzControlIntelligenceSection safeScopeResult={safeScopeResult} />

      <HazLenzOperationalReasoning safeScopeResult={safeScopeResult} />

      <HazLenzCriticalAlerts safeScopeResult={safeScopeResult} />
    </div>
  );
}
