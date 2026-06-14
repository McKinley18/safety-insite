"use client";

import { hazardCategoryOptions } from "@/lib/inspection/inspectionConstants";

import { Skeleton } from "@/components/ui/Skeleton";
import SafeScopeControlsSection from "@/components/inspection/SafeScopeControlsSection";
import SafeScopeReasoningPanel from "@/components/inspection/SafeScopeReasoningPanel";
import SafeScopeResultHeaderSection from "@/components/inspection/SafeScopeResultHeaderSection";
import SafeScopePrimaryDecisionSection from "@/components/inspection/SafeScopePrimaryDecisionSection";
import SafeScopeStandardsSection from "@/components/inspection/SafeScopeStandardsSection";
import SafeScopeSupportingIntelligenceSection from "@/components/inspection/SafeScopeSupportingIntelligenceSection";
import SafeScopeKnowledgeBrainSection from "@/components/inspection/SafeScopeKnowledgeBrainSection";
import SafeScopeEquipmentReasoningSection from "@/components/inspection/SafeScopeEquipmentReasoningSection";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type SafeScopeInspectionStepProps = {
  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: ToggleSetter;
  agencyMode: string;
  riskProfileId: "standard_5x5" | "simple_4x4" | "advanced_6x6";
  handleRunSafeScope: (forceOffline?: boolean) => void;
  safeScopeStatus: string;
  safeScopeResult: any;
  setIsOfflineMode?: (value: boolean) => void;
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
  setIsOfflineMode,
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

      {safeScopeStatus && !safeScopeResult && safeScopeStatus.includes("Running") && (
        <div className="mb-4 border-y border-slate-200 dark:border-slate-800 py-4 space-y-4">
           <Skeleton className="h-8 w-1/3" />
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-32 w-full" />
        </div>
      )}

      {safeScopeStatus && !safeScopeResult && !safeScopeStatus.includes("Running") && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wide text-red-800 dark:text-red-400">
                SafeScope Match Failed
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-red-700 dark:text-red-300">
                {safeScopeStatus}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (setIsOfflineMode) {
                      setIsOfflineMode(true);
                    }
                    handleRunSafeScope(true);
                  }}
                  className="rounded-xl bg-slate-900 text-white dark:bg-white dark:bg-slate-900 dark:text-slate-900 dark:text-slate-100 px-3 py-1.5 text-xs font-black shadow transition active:scale-95 cursor-pointer"
                >
                  Run in Offline Fallback Mode
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRunSafeScope(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-black shadow transition active:scale-95 cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {safeScopeResult && (
        <div className="mb-4 border-y border-slate-200 dark:border-slate-800 py-4">
          <SafeScopeResultHeaderSection
            safeScopeResult={safeScopeResult}
            submitSafeScopeValidation={submitSafeScopeValidation}
          />

          <SafeScopePrimaryDecisionSection safeScopeResult={safeScopeResult} />

          <SafeScopeEquipmentReasoningSection safeScopeResult={safeScopeResult} />

          <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Hazard Category
                </p>
                <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
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
              <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Change category
              </summary>

              <select
                value={hazardCategory}
                onChange={(event) => setHazardCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8]"
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
                className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8] focus:bg-white dark:focus:bg-slate-900"
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
