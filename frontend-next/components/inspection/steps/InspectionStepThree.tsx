import { StepHeroCard } from "../StepHeroCard";
import FindingReviewEditor from "../FindingReviewEditor";

interface InspectionStepThreeProps {
  selectedStandards: any[];
  selectedGeneratedActions: any[];
  manualActions: any[];
  severity: number | null;
  likelihood: number | null;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  evidenceNotes: string;
  setEvidenceNotes: (value: string) => void;
  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  photos: any[];
  safeScopeResult: any;
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  activeRiskScale: any;
  setSeverity: (value: number | null) => void;
  setLikelihood: (value: number | null) => void;
  toggleGeneratedAction: (action: any) => void;
  manualActionTitle: string;
  setManualActionTitle: (value: string) => void;
  manualActionPriority: string;
  setManualActionPriority: (value: string) => void;
  manualActionDue: string;
  setManualActionDue: (value: string) => void;
  manualActionClosureEvidence: string;
  setManualActionClosureEvidence: (value: string) => void;
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
}

export default function InspectionStepThree(props: InspectionStepThreeProps) {
  return (
    <div className="space-y-3">
      <StepHeroCard
        step="Step 3"
        title="Standards & Actions"
        description="Confirm selected standards, validate risk, and prepare corrective actions for the finding."
        stats={[
          { label: "Standards", value: props.selectedStandards.length },
          {
            label: "Actions",
            value: props.selectedGeneratedActions.length + props.manualActions.length,
          },
          { label: "Risk", value: props.severity && props.likelihood ? "Set" : "Open" },
        ]}
      />

      <FindingReviewEditor {...props} />
    </div>
  );
}
