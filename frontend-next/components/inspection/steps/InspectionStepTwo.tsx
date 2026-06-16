import SafeScopeInspectionStep from "../SafeScopeInspectionStep";

interface InspectionStepTwoProps {
  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: (updater: (open: boolean) => boolean) => void;
  agencyMode: string;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  handleRunSafeScope: (forceOffline?: boolean) => void;
  safeScopeStatus: string;
  safeScopeResult: any;
  setIsOfflineMode?: (value: boolean) => void;
  submitSafeScopeValidation: (decision: "accepted" | "modified" | "rejected" | "escalated" | "insufficient_evidence") => Promise<void>;
  safeScopeCompactDetailsOpen: boolean;
  setSafeScopeCompactDetailsOpen: (updater: (open: boolean) => boolean) => void;
  safeScopeAdvancedOpen: boolean;
  setSafeScopeAdvancedOpen: (updater: (open: boolean) => boolean) => void;
  feedbackNotes: string;
  setFeedbackNotes: (value: string) => void;
  selectedStandards: any[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  handleFeedback: (standard: any, action: "accepted" | "rejected" | "flagged") => Promise<void>;
  safeScopeDetailsOpen: boolean;
  setSafeScopeDetailsOpen: (updater: (open: boolean) => boolean) => void;
  safeScopeStandardsOpen: boolean;
  setSafeScopeStandardsOpen: (updater: (open: boolean) => boolean) => void;
}

export default function InspectionStepTwo(props: InspectionStepTwoProps) {
  return (
    <div className="space-y-3">
      <SafeScopeInspectionStep {...props} />
    </div>
  );
}
