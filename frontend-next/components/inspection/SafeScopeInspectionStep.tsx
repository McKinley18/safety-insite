"use client";

import { hazardCategoryOptions } from "@/lib/inspection/inspectionConstants";

import SafeScopeControlsSection from "@/components/inspection/SafeScopeControlsSection";
import SafeScopeReasoningPanel from "@/components/inspection/SafeScopeReasoningPanel";
import SafeScopeResultHeaderSection from "@/components/inspection/SafeScopeResultHeaderSection";
import SafeScopePrimaryDecisionSection from "@/components/inspection/SafeScopePrimaryDecisionSection";
import SafeScopeStandardsSection from "@/components/inspection/SafeScopeStandardsSection";
import SafeScopeSupportingIntelligenceSection from "@/components/inspection/SafeScopeSupportingIntelligenceSection";
import SafeScopeKnowledgeBrainSection from "@/components/inspection/SafeScopeKnowledgeBrainSection";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type SafeScopeInspectionStepProps = {
  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: ToggleSetter;
  agencyMode: string;
  riskProfileId: "standard_5x5" | "simple_4x4" | "advanced_6x6";
  handleRunSafeScope: () => void;
  safeScopeStatus: string;
  safeScopeResult: any;
  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  submitSafeScopeValidation: (
    decision:
      | "accepted"
      | "modified"
      | "rejected"
      | "escalated"
      | "insufficient_evidence",
  ) => Promise<void>;
  safeScopeCompactDetailsOpen: boolean;
  setSafeScopeCompactDetailsOpen: ToggleSetter;
  safeScopeAdvancedOpen: boolean;
  setSafeScopeAdvancedOpen: ToggleSetter;
  feedbackNotes: string;
  setFeedbackNotes: any;
  selectedStandards: string[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  handleFeedback: (
    standard: any,
    action: "accepted" | "rejected" | "flagged",
  ) => Promise<void>;
  safeScopeDetailsOpen: boolean;
  setSafeScopeDetailsOpen: ToggleSetter;
  safeScopeStandardsOpen: boolean;
  setSafeScopeStandardsOpen: ToggleSetter;
};

export default function SafeScopeInspectionStep({
  safeScopeHelpOpen,
  setSafeScopeHelpOpen,
  agencyMode,
  riskProfileId,
  handleRunSafeScope,
  safeScopeStatus,
  safeScopeResult,
  hazardCategory,
  setHazardCategory,
  submitSafeScopeValidation,
  safeScopeCompactDetailsOpen,
  setSafeScopeCompactDetailsOpen,
  safeScopeAdvancedOpen,
  setSafeScopeAdvancedOpen,
  feedbackNotes,
  setFeedbackNotes,
  selectedStandards,
  getStandardKey,
  toggleSelectedStandard,
  handleFeedback,
  safeScopeDetailsOpen,
  setSafeScopeDetailsOpen,
  safeScopeStandardsOpen,
  setSafeScopeStandardsOpen,
}: SafeScopeInspectionStepProps) {
  return (
    <>

      <SafeScopeControlsSection
        safeScopeHelpOpen={safeScopeHelpOpen}
        setSafeScopeHelpOpen={setSafeScopeHelpOpen}
        agencyMode={agencyMode}
        riskProfileId={riskProfileId}
        handleRunSafeScope={handleRunSafeScope}
        safeScopeStatus={safeScopeStatus}
        safeScopeResult={safeScopeResult}
      />

      {safeScopeResult && (
        <div className="mb-4 border-y border-slate-200 py-4">
          <SafeScopeResultHeaderSection
            safeScopeResult={safeScopeResult}
            submitSafeScopeValidation={submitSafeScopeValidation}
          />

          <SafeScopePrimaryDecisionSection safeScopeResult={safeScopeResult} />

          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Hazard Category
                </p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {hazardCategory || safeScopeResult?.classification || "Let SafeScope suggest"}
                </p>
              </div>

              {safeScopeResult?.classification && !hazardCategory && (
                <button
                  type="button"
                  onClick={() => setHazardCategory(safeScopeResult.classification || "")}
                  className="shrink-0 rounded-xl bg-[#E8F4FF] px-3 py-2 text-[11px] font-black text-[#1D72B8]"
                >
                  Use Suggestion
                </button>
              )}
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-500">
                Change category
              </summary>

              <select
                value={hazardCategory}
                onChange={(event) => setHazardCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
              >
                <option value="">Use SafeScope suggestion</option>
                {hazardCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                value={hazardCategory}
                onChange={(event) => setHazardCategory(event.target.value)}
                placeholder="Or enter custom category"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
              />
            </details>
          </div>

          <SafeScopeReasoningPanel
            safeScopeResult={safeScopeResult}
            safeScopeCompactDetailsOpen={safeScopeCompactDetailsOpen}
            setSafeScopeCompactDetailsOpen={setSafeScopeCompactDetailsOpen}
            safeScopeAdvancedOpen={safeScopeAdvancedOpen}
            setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
          />

        </div>
      )}

      <SafeScopeStandardsSection
        safeScopeResult={safeScopeResult}
        feedbackNotes={feedbackNotes}
        setFeedbackNotes={setFeedbackNotes}
        selectedStandards={selectedStandards}
        getStandardKey={getStandardKey}
        toggleSelectedStandard={toggleSelectedStandard}
        handleFeedback={handleFeedback}
        safeScopeStandardsOpen={safeScopeStandardsOpen}
        setSafeScopeStandardsOpen={setSafeScopeStandardsOpen}
      />

      <SafeScopeSupportingIntelligenceSection
        safeScopeResult={safeScopeResult}
        safeScopeDetailsOpen={safeScopeDetailsOpen}
        setSafeScopeDetailsOpen={setSafeScopeDetailsOpen}
      />
    </>
  );
}
