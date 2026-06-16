"use client";

import EvidenceCaptureSection from "@/components/inspection/EvidenceCaptureSection";
import FindingReviewEditor from "@/components/inspection/FindingReviewEditor";
import SafeScopeInspectionStep from "@/components/inspection/SafeScopeInspectionStep";
import InspectionStepOne from "./steps/InspectionStepOne";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

function NavyStepHeader({
  step,
  title,
  description,
  stats,
}: {
  step: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="sentinel-hero-card p-4 sm:p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
        {step}
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>

      <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
        {description}
      </p>

      <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-2 text-center">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex min-h-[72px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm ring-1 ring-white/10"
          >
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHeroCard({
  step,
  title,
  description,
  stats,
}: {
  step: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="sentinel-hero-card p-4 sm:p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
        {step}
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>

      <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
        {description}
      </p>

      {!!stats?.length && (
        <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-2 text-center">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[76px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm ring-1 ring-white/10"
            >
              <p className="text-center text-[9px] font-black uppercase tracking-wide text-blue-100">
                {item.label}
              </p>
              <p className="mt-1 text-center text-lg font-black text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  handleRunSafeScope: (forceOffline?: boolean) => void;
  safeScopeStatus: string;
  safeScopeResult: any;
  setIsOfflineMode?: (value: boolean) => void;
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
  manualActionClosureEvidence: string;
  setManualActionClosureEvidence: (value: string) => void;
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
  riskProfileId,
  handleRunSafeScope,
  safeScopeStatus,
  safeScopeResult,
  setIsOfflineMode,
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
  manualActionClosureEvidence,
  setManualActionClosureEvidence,
  manualActions,
  addManualAction,
  removeManualAction,
}: InspectionStepRendererProps) {
  return (
    <div className="px-1 py-1 sm:px-2">
      {currentStep === 1 && (
        <InspectionStepOne
          photos={photos}
          setPhotos={setPhotos}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
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
        <div className="space-y-3">
          <SafeScopeInspectionStep
          hazardCategory={hazardCategory}
          setHazardCategory={setHazardCategory}
          safeScopeHelpOpen={safeScopeHelpOpen}
          setSafeScopeHelpOpen={setSafeScopeHelpOpen}
          agencyMode={agencyMode}
          riskProfileId={riskProfileId}
          handleRunSafeScope={handleRunSafeScope}
          safeScopeStatus={safeScopeStatus}
          safeScopeResult={safeScopeResult}
          setIsOfflineMode={setIsOfflineMode}
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
        </div>
      )}
      {currentStep === 3 && (
        <div className="space-y-3">
          <StepHeroCard
            step="Step 3"
            title="Standards & Actions"
            description="Confirm selected standards, validate risk, and prepare corrective actions for the finding."
            stats={[
              { label: "Standards", value: selectedStandards.length },
              {
                label: "Actions",
                value: selectedGeneratedActions.length + manualActions.length,
              },
              { label: "Risk", value: severity && likelihood ? "Set" : "Open" },
            ]}
          />

          <FindingReviewEditor
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          evidenceNotes={evidenceNotes}
          setEvidenceNotes={setEvidenceNotes}
          hazardCategory={hazardCategory}
          setHazardCategory={setHazardCategory}
          photos={photos}
          safeScopeResult={safeScopeResult}
          selectedStandards={selectedStandards}
          getStandardKey={getStandardKey}
          toggleSelectedStandard={toggleSelectedStandard}
          activeRiskScale={activeRiskScale}
          severity={severity}
          setSeverity={setSeverity}
          likelihood={likelihood}
          setLikelihood={setLikelihood}
          selectedGeneratedActions={selectedGeneratedActions}
          toggleGeneratedAction={toggleGeneratedAction}
          manualActionTitle={manualActionTitle}
          setManualActionTitle={setManualActionTitle}
          manualActionPriority={manualActionPriority}
          setManualActionPriority={setManualActionPriority}
          manualActionDue={manualActionDue}
          setManualActionDue={setManualActionDue}
          manualActionClosureEvidence={manualActionClosureEvidence}
          setManualActionClosureEvidence={setManualActionClosureEvidence}
          manualActions={manualActions}
          addManualAction={addManualAction}
          removeManualAction={removeManualAction}
        />
        </div>
      )}

    </div>
  );
}
