"use client";

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
  setAgencyMode: (value: string) => void;
  riskProfileId: "standard_5x5" | "simple_4x4" | "advanced_6x6";
  handleRunSafeScope: () => void;
  safeScopeStatus: string;
  safeScopeResult: any;
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
  setAgencyMode,
  riskProfileId,
  handleRunSafeScope,
  safeScopeStatus,
  safeScopeResult,
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
        setAgencyMode={setAgencyMode}
        riskProfileId={riskProfileId}
        handleRunSafeScope={handleRunSafeScope}
        safeScopeStatus={safeScopeStatus}
      />

      {safeScopeResult && (
        <div className="mb-4 border-y border-slate-200 py-4">
          <SafeScopeResultHeaderSection
            safeScopeResult={safeScopeResult}
            submitSafeScopeValidation={submitSafeScopeValidation}
          />

          <SafeScopePrimaryDecisionSection safeScopeResult={safeScopeResult} />

          <SafeScopeReasoningPanel
            safeScopeResult={safeScopeResult}
            safeScopeCompactDetailsOpen={safeScopeCompactDetailsOpen}
            setSafeScopeCompactDetailsOpen={setSafeScopeCompactDetailsOpen}
            safeScopeAdvancedOpen={safeScopeAdvancedOpen}
            setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
          />

          <SafeScopeKnowledgeBrainSection safeScopeResult={safeScopeResult} />
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
