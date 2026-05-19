"use client";

import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";
import SafeScopeActionEffectivenessSection from "@/components/inspection/SafeScopeActionEffectivenessSection";
import SafeScopeBarrierSection from "@/components/inspection/SafeScopeBarrierSection";
import SafeScopeControlIntelligenceSection from "@/components/inspection/SafeScopeControlIntelligenceSection";
import SafeScopeCriticalAlerts from "@/components/inspection/SafeScopeCriticalAlerts";
import SafeScopeCrossDomainSection from "@/components/inspection/SafeScopeCrossDomainSection";
import SafeScopeDecisionExplainabilitySection from "@/components/inspection/SafeScopeDecisionExplainabilitySection";
import SafeScopeEnergyTransferSection from "@/components/inspection/SafeScopeEnergyTransferSection";
import SafeScopeReliabilitySection from "@/components/inspection/SafeScopeReliabilitySection";

type SafeScopeAdvancedReasoningProps = {
  safeScopeResult: any;
};

export default function SafeScopeAdvancedReasoning({
  safeScopeResult,
}: SafeScopeAdvancedReasoningProps) {
  return (
    <>
      {!!safeScopeResult.confidenceIntelligence?.reasonCodes?.length && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Confidence reason codes
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {safeScopeResult.confidenceIntelligence.reasonCodes
              .slice(0, 6)
              .map((code: string) => (
                <span
                  key={code}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                >
                  {code.replaceAll("_", " ")}
                </span>
              ))}
          </div>
        </div>
      )}

      {safeScopeResult.trendIntelligence && (
        <SafeScopeDrawer
          title="Trend Intelligence"
          summary={`Recurrence risk: ${safeScopeResult.trendIntelligence.recurrenceRisk || "low"}`}
          badge={
            safeScopeResult.trendIntelligence.escalationRecommended
              ? "Escalate"
              : undefined
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Trend
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {safeScopeResult.trendIntelligence.trendDirection ||
                  "not established"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Hotspot
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {safeScopeResult.trendIntelligence.hotspotArea ||
                  "None detected"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Related
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {safeScopeResult.trendIntelligence.relatedFindingCount || 0}{" "}
                finding(s)
              </p>
            </div>
          </div>

          {!!safeScopeResult.trendIntelligence.controlFailureIndicators
            ?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.trendIntelligence.controlFailureIndicators
                .slice(0, 3)
                .map((indicator: string) => (
                  <li key={indicator}>{indicator}</li>
                ))}
            </ul>
          )}

          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.trendIntelligence.recommendation}
          </p>
        </SafeScopeDrawer>
      )}

      {safeScopeResult.evidenceQuality && (
        <SafeScopeDrawer
          title="Evidence Quality"
          summary={`Defensibility score: ${safeScopeResult.evidenceQuality.evidenceQualityScore}/100`}
        >
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.evidenceQuality.defensibilityStatement}
          </p>

          {!!safeScopeResult.evidenceQuality.gaps?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.evidenceQuality.gaps
                .slice(0, 4)
                .map((gap: string) => (
                  <li key={gap}>{gap}</li>
                ))}
            </ul>
          )}
        </SafeScopeDrawer>
      )}

      {safeScopeResult.standardsReasoning?.topDefensible?.length && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Adaptive Standards Reasoning
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.standardsReasoning.summary}
          </p>

          <div className="mt-3 space-y-2">
            {safeScopeResult.standardsReasoning.topDefensible
              .slice(0, 3)
              .map((standard: any) => (
                <div
                  key={standard.citation}
                  className="rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-black text-slate-900">
                      {standard.citation}
                    </p>
                    <span className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                      {Math.round((standard.defensibilityScore || 0) * 100)}%
                      defensible
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                    {standard.reasoning}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {safeScopeResult.eventSequence && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Event Sequence Intelligence
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Sequence confidence:{" "}
            {safeScopeResult.eventSequence.sequenceConfidence || "low"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.eventSequence.sequenceSummary}
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
            {(safeScopeResult.eventSequence.likelySequence || []).map(
              (item: string) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ol>
        </div>
      )}

      {safeScopeResult.operationalState && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Operational State
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            {safeScopeResult.operationalState.primaryState?.replaceAll(
              "_",
              " ",
            ) || "unknown"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.operationalState.stateAwarenessSummary}
          </p>
          {!!safeScopeResult.operationalState.stateRisks?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.operationalState.stateRisks
                .slice(0, 3)
                .map((risk: string) => (
                  <li key={risk}>{risk}</li>
                ))}
            </ul>
          )}
        </div>
      )}

      {safeScopeResult.humanFactors?.humanFactorsPresent && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Human Factors Intelligence
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.humanFactors.humanFactorsSummary}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
            {[
              ...(safeScopeResult.humanFactors.behaviorRiskSignals || []),
              ...(safeScopeResult.humanFactors.visibilitySignals || []),
              ...(safeScopeResult.humanFactors.lineOfFireSignals || []),
              ...(safeScopeResult.humanFactors.humanFactorSignals || []),
            ]
              .slice(0, 4)
              .map((signal: string) => (
                <li key={signal}>{signal}</li>
              ))}
          </ul>
        </div>
      )}

      {safeScopeResult.contradictionIntelligence?.contradictionsDetected && (
        <div className="mt-4 border-l-4 border-red-300 bg-red-50 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Contradiction Detection
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-red-900">
            {safeScopeResult.contradictionIntelligence.reviewImpact}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-red-900">
            {safeScopeResult.contradictionIntelligence.contradictions
              .slice(0, 3)
              .map((item: string) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </div>
      )}

      {safeScopeResult.exposurePathIntelligence && (
        <SafeScopeDrawer
          title="Exposure Path Intelligence"
          summary={`Exposure complexity: ${safeScopeResult.exposurePathIntelligence.exposureComplexity || "low"}`}
        >
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.exposurePathIntelligence.exposureSummary}
          </p>

          {!!safeScopeResult.exposurePathIntelligence.exposurePathways
            ?.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {safeScopeResult.exposurePathIntelligence.exposurePathways.map(
                (pathway: string) => (
                  <span
                    key={pathway}
                    className="rounded-full bg-[#E8F4FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]"
                  >
                    {pathway}
                  </span>
                ),
              )}
            </div>
          )}

          {!!safeScopeResult.exposurePathIntelligence.exposureAmplifiers
            ?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.exposurePathIntelligence.exposureAmplifiers
                .slice(0, 3)
                .map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )}
        </SafeScopeDrawer>
      )}

      {safeScopeResult.hazardGraph && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Hazard Relationship Graph
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Graph complexity:{" "}
            {safeScopeResult.hazardGraph.graphComplexity || "low"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.hazardGraph.graphSummary}
          </p>

          {!!safeScopeResult.hazardGraph.nodes?.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {safeScopeResult.hazardGraph.nodes
                .slice(0, 8)
                .map((node: string) => (
                  <span
                    key={node}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                  >
                    {node.replaceAll("_", " ")}
                  </span>
                ))}
            </div>
          )}

          {!!safeScopeResult.hazardGraph.cascadeRisks?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.hazardGraph.cascadeRisks
                .slice(0, 3)
                .map((risk: string) => (
                  <li key={risk}>{risk}</li>
                ))}
            </ul>
          )}
        </div>
      )}

      {safeScopeResult.correlationIntelligence && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
                Correlation Intelligence
              </p>
              <h4 className="mt-1 text-sm font-black text-slate-900">
                Cascade potential:{" "}
                {safeScopeResult.correlationIntelligence.cascadePotential ||
                  "low"}
              </h4>
            </div>
            {safeScopeResult.correlationIntelligence.escalationRecommended && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                Escalate
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.correlationIntelligence.recommendation}
          </p>
        </div>
      )}

      {safeScopeResult.counterfactualIntelligence && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Counterfactual Reasoning
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.counterfactualIntelligence.counterfactualSummary}
          </p>
          {!!safeScopeResult.counterfactualIntelligence.counterfactuals
            ?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.counterfactualIntelligence.counterfactuals
                .slice(0, 3)
                .map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )}
        </div>
      )}

      {safeScopeResult.siteMemory && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Site Memory Intelligence
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Degradation risk:{" "}
            {safeScopeResult.siteMemory.degradationRisk || "low"}
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.siteMemory.siteMemorySummary}
          </p>
          {!!safeScopeResult.siteMemory.operationalPatterns?.length && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
              {safeScopeResult.siteMemory.operationalPatterns
                .slice(0, 4)
                .map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )}
        </div>
      )}

      {safeScopeResult.domainIntelligence && (
        <SafeScopeDrawer
          title="Domain Intelligence"
          summary="Specialized operational domain analysis"
        >
          <p className="text-sm font-semibold leading-6 text-slate-600">
            SafeScope checked specialized safety domains for deeper operational
            context.
          </p>

          <div className="mt-3 space-y-3">
            {Object.entries(safeScopeResult.domainIntelligence)
              .filter(([, value]: any) => Boolean(value))
              .map(([domain, value]: any) => (
                <div key={domain} className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {domain.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}
                  </p>

                  <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                    {value.reasoningSummary || "Domain indicators detected."}
                  </p>

                  {!!value.detectedIndicators?.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {value.detectedIndicators
                        .slice(0, 6)
                        .map((indicator: string) => (
                          <span
                            key={indicator}
                            className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600"
                          >
                            {indicator}
                          </span>
                        ))}
                    </div>
                  )}

                  {!!value.requiredControls?.length && (
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                      Key controls:{" "}
                      {value.requiredControls.slice(0, 4).join(" • ")}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </SafeScopeDrawer>
      )}

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
