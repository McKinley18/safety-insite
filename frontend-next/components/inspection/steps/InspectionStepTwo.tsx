import HazLenzInspectionStep from "../HazLenzInspectionStep";
import type {
  HazLenzClarificationAnswerInput,
  StructuredObservationInput,
} from "@/lib/hazlenzClient";

interface InspectionStepTwoProps {
  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  hazLenzHelpOpen: boolean;
  setHazLenzHelpOpen: (updater: (open: boolean) => boolean) => void;
  agencyMode: string;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  handleRunHazLenz: (
    forceOffline?: boolean,
    structuredObservation?: StructuredObservationInput,
    clarificationAnswers?: HazLenzClarificationAnswerInput[],
  ) => void;
  hazLenzStatus: string;
  safeScopeResult: any;
  hazLenzClarificationAnswers: HazLenzClarificationAnswerInput[];
  setHazLenzClarificationAnswers: (answers: HazLenzClarificationAnswerInput[]) => void;
  onUseHazardFragment: (hazard: any) => void;
  setIsOfflineMode?: (value: boolean) => void;
  submitHazLenzValidation: (decision: "accepted" | "modified" | "rejected" | "escalated" | "insufficient_evidence") => Promise<void>;
  hazLenzCompactDetailsOpen: boolean;
  setHazLenzCompactDetailsOpen: (updater: (open: boolean) => boolean) => void;
  hazLenzAdvancedOpen: boolean;
  setHazLenzAdvancedOpen: (updater: (open: boolean) => boolean) => void;
  feedbackNotes: string;
  setFeedbackNotes: (value: string) => void;
  selectedStandards: any[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  handleFeedback: (standard: any, action: "accepted" | "rejected" | "flagged") => Promise<void>;
  hazLenzDetailsOpen: boolean;
  setHazLenzDetailsOpen: (updater: (open: boolean) => boolean) => void;
  hazLenzStandardsOpen: boolean;
  setHazLenzStandardsOpen: (updater: (open: boolean) => boolean) => void;
}

export default function InspectionStepTwo(props: InspectionStepTwoProps) {
  return (
    <div className="space-y-2">
      <HazLenzInspectionStep {...props} />
    </div>
  );
}
