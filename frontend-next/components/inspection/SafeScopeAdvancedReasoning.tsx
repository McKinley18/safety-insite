"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";
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
import SafeScopeReliabilitySection from "@/components/inspection/SafeScopeReliabilitySection";
import SafeScopeStandardsReasoning from "@/components/inspection/SafeScopeStandardsReasoning";
import SafeScopeTrendIntelligence from "@/components/inspection/SafeScopeTrendIntelligence";

type SafeScopeAdvancedReasoningProps = {
  safeScopeResult: any;
};

export default function SafeScopeAdvancedReasoning({
  safeScopeResult,
}: SafeScopeAdvancedReasoningProps) {
  return (
    <>
      <SafeScopeConfidenceReasonCodes safeScopeResult={safeScopeResult} />

      <SafeScopeTrendIntelligence safeScopeResult={safeScopeResult} />

      <SafeScopeEvidenceQuality safeScopeResult={safeScopeResult} />

      <SafeScopeStandardsReasoning safeScopeResult={safeScopeResult} />

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

      {safeScopeResult.operationalReasoning && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Operational Reasoning
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Causal chain
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.operationalReasoning.reasoningSummary}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Exposure Pathway
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                {safeScopeResult.operationalReasoning.exposurePathways?.[0] ||
                  "Exposure pathway requires confirmation."}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Injury Mechanism
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                {safeScopeResult.operationalReasoning
                  .likelyInjuryMechanisms?.[0] ||
                  "Injury mechanism requires review."}
              </p>
            </div>
          </div>

          {!!safeScopeResult.operationalReasoning.supervisorQuestions
            ?.length && (
            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Supervisor questions
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                {safeScopeResult.operationalReasoning.supervisorQuestions
                  .slice(0, 4)
                  .map((question: string) => (
                    <li key={question}>{question}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <SafeScopeCriticalAlerts safeScopeResult={safeScopeResult} />
    </>
  );
}
