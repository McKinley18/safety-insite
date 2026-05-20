"use client";

import CorrectiveActionsSection from "@/components/inspection/CorrectiveActionsSection";
import EvidenceCaptureSection from "@/components/inspection/EvidenceCaptureSection";
import QuickCaptureSection from "@/components/inspection/QuickCaptureSection";
import RiskReviewSection from "@/components/inspection/RiskReviewSection";
import SafeScopeInspectionStep from "@/components/inspection/SafeScopeInspectionStep";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type InspectionStepRendererProps = {
  currentStep: number;
  isAdvancedMode: boolean;
  inspectionContext: any;
  inspectionMode: "quick" | "advanced";
  setInspectionMode: (value: "quick" | "advanced") => void;
  quickCapture: boolean;

  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;

  photos: any[];
  setPhotos: any;
  evidenceNotes: string;
  setEvidenceNotes: (value: string) => void;
  annotatingPhotoIndex: number | null;
  setAnnotatingPhotoIndex: (value: number | null) => void;
  annotationExpanded: boolean;
  setAnnotationExpanded: (value: boolean) => void;
  handlePhotoUpload: (event: any) => void;
  removePhoto: (id: string) => void;

  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: ToggleSetter;
  agencyMode: string;
  setAgencyMode: (value: string) => void;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
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
  setFeedbackNotes: (value: string) => void;
  selectedStandards: any[];
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

  activeRiskScale: any;
  severity: number | null;
  setSeverity: (value: number | null) => void;
  likelihood: number | null;
  setLikelihood: (value: number | null) => void;

  selectedGeneratedActions: any[];
  toggleGeneratedAction: (action: any) => void;
  manualActionTitle: string;
  setManualActionTitle: (value: string) => void;
  manualActionPriority: string;
  setManualActionPriority: (value: string) => void;
  manualActionDue: string;
  setManualActionDue: (value: string) => void;
  manualActions: any[];
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
};

export default function InspectionStepRenderer({
  currentStep,
  isAdvancedMode,
  inspectionContext,
  inspectionMode,
  setInspectionMode,
  quickCapture,
  hazardCategory,
  setHazardCategory,
  location,
  setLocation,
  description,
  setDescription,
  photos,
  setPhotos,
  evidenceNotes,
  setEvidenceNotes,
  annotatingPhotoIndex,
  setAnnotatingPhotoIndex,
  annotationExpanded,
  setAnnotationExpanded,
  handlePhotoUpload,
  removePhoto,
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
  activeRiskScale,
  severity,
  setSeverity,
  likelihood,
  setLikelihood,
  selectedGeneratedActions,
  toggleGeneratedAction,
  manualActionTitle,
  setManualActionTitle,
  manualActionPriority,
  setManualActionPriority,
  manualActionDue,
  setManualActionDue,
  manualActions,
  addManualAction,
  removeManualAction,
}: InspectionStepRendererProps) {
  return (
    <div className="px-1 py-2 sm:px-2">
      {currentStep === 1 && (
        <EvidenceCaptureSection
          photos={photos}
          setPhotos={setPhotos}
          evidenceNotes={evidenceNotes}
          setEvidenceNotes={setEvidenceNotes}
          annotatingPhotoIndex={annotatingPhotoIndex}
          setAnnotatingPhotoIndex={setAnnotatingPhotoIndex}
          annotationExpanded={annotationExpanded}
          setAnnotationExpanded={setAnnotationExpanded}
          handlePhotoUpload={handlePhotoUpload}
          removePhoto={removePhoto}
        />
      )}

      {currentStep === 2 && (
        <QuickCaptureSection
          inspectionContext={inspectionContext}
          inspectionMode={inspectionMode}
          setInspectionMode={setInspectionMode}
          quickCapture={quickCapture}
          hazardCategory={hazardCategory}
          setHazardCategory={setHazardCategory}
          location={location}
          setLocation={setLocation}
          description={description}
          setDescription={setDescription}
          photos={photos}
          manualActionTitle={manualActionTitle}
          setManualActionTitle={setManualActionTitle}
          manualActionPriority={manualActionPriority}
          setManualActionPriority={setManualActionPriority}
          manualActionDue={manualActionDue}
          setManualActionDue={setManualActionDue}
          manualActions={manualActions}
          addManualAction={addManualAction}
          removeManualAction={removeManualAction}
        />
      )}

      {currentStep === 3 && (
        <SafeScopeInspectionStep
          safeScopeHelpOpen={safeScopeHelpOpen}
          setSafeScopeHelpOpen={setSafeScopeHelpOpen}
          agencyMode={agencyMode}
          setAgencyMode={setAgencyMode}
          riskProfileId={riskProfileId}
          handleRunSafeScope={handleRunSafeScope}
          safeScopeStatus={safeScopeStatus}
          safeScopeResult={safeScopeResult}
          submitSafeScopeValidation={submitSafeScopeValidation}
          safeScopeCompactDetailsOpen={safeScopeCompactDetailsOpen}
          setSafeScopeCompactDetailsOpen={setSafeScopeCompactDetailsOpen}
          safeScopeAdvancedOpen={safeScopeAdvancedOpen}
          setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
          feedbackNotes={feedbackNotes}
          setFeedbackNotes={setFeedbackNotes}
          selectedStandards={selectedStandards}
          getStandardKey={getStandardKey}
          toggleSelectedStandard={toggleSelectedStandard}
          handleFeedback={handleFeedback}
          safeScopeDetailsOpen={safeScopeDetailsOpen}
          setSafeScopeDetailsOpen={setSafeScopeDetailsOpen}
          safeScopeStandardsOpen={safeScopeStandardsOpen}
          setSafeScopeStandardsOpen={setSafeScopeStandardsOpen}
        />
      )}

      {currentStep === 4 && isAdvancedMode && (
        <RiskReviewSection
          activeRiskScale={activeRiskScale}
          safeScopeResult={safeScopeResult}
          severity={severity}
          setSeverity={setSeverity}
          likelihood={likelihood}
          setLikelihood={setLikelihood}
        />
      )}

      {currentStep === 5 && (
        <CorrectiveActionsSection
          safeScopeResult={safeScopeResult}
          selectedGeneratedActions={selectedGeneratedActions}
          toggleGeneratedAction={toggleGeneratedAction}
          manualActionTitle={manualActionTitle}
          setManualActionTitle={setManualActionTitle}
          manualActionPriority={manualActionPriority}
          setManualActionPriority={setManualActionPriority}
          manualActionDue={manualActionDue}
          setManualActionDue={setManualActionDue}
          manualActions={manualActions}
          addManualAction={addManualAction}
          removeManualAction={removeManualAction}
        />
      )}
    </div>
  );
}
